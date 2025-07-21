import { MAX_INPUT_LIMIT } from "@/lib/constants";
import { db } from "@/lib/db";
import { checks, texts } from "@/lib/db/schema";
import { getEvents, streamExists } from "@/lib/redis";
import { extractClerkId } from "@/lib/utils";
import {
  executeFactCheckingAgent,
  initializeFactCheckSession,
  generateCheckTitle,
} from "@/server/services/check";
import { getAuth } from "@hono/clerk-auth";
import { zValidator } from "@hono/zod-validator";
import { desc, eq, sql } from "drizzle-orm";
import { Hono } from "hono";
import { type SSEStreamingApi, streamSSE } from "hono/streaming";
import { z } from "zod";

const factCheckRequestSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1)
    .max(MAX_INPUT_LIMIT)
    .describe("The text to be fact-checked"),
  checkId: z.string().trim().min(1).max(100).describe("The ID of the check"),
});

const generateTitleRequestSchema = z.object({
  content: z
    .string()
    .trim()
    .min(10)
    .max(1000)
    .describe("The text content to generate a title for"),
  checkId: z.string().trim().min(1).max(100).describe("The ID of the check"),
});

interface StoredEvent {
  event: string;
  data: unknown;
}

const writeStreamEvent = async (
  stream: SSEStreamingApi,
  eventType: string,
  eventData: unknown
) => {
  await stream.writeSSE({
    event: eventType,
    data: JSON.stringify(eventData),
  });
};

const streamStoredResults = async (
  stream: SSEStreamingApi,
  results: StoredEvent[]
) => {
  await writeStreamEvent(stream, "connection", {
    message: "Connection established",
  });

  await Promise.all(
    results.map((event) => writeStreamEvent(stream, event.event, event.data))
  );
};

const isTerminalEvent = (eventType: string) =>
  ["complete", "error"].includes(eventType);

const streamLiveEvents = async (stream: SSEStreamingApi, streamId: string) => {
  await writeStreamEvent(stream, "connection", {
    message: "Connection established",
  });

  const existingEvents = await getEvents(streamId);

  for (const event of existingEvents) {
    await writeStreamEvent(stream, event.event, event.data);
    if (isTerminalEvent(event.event)) break;
  }

  let lastProcessedEventId = existingEvents.at(-1)?.id ?? "0";
  let streamActive = true;

  stream.onAbort(() => {
    streamActive = false;
  });

  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  while (streamActive) {
    await sleep(1000);

    if (!streamActive) break;

    const currentEvents = await getEvents(streamId);
    const lastKnownIndex = currentEvents.findIndex(
      (event) => event.id === lastProcessedEventId
    );
    const newEvents =
      lastKnownIndex === -1
        ? currentEvents
        : currentEvents.slice(lastKnownIndex + 1);

    for (const event of newEvents) {
      if (!streamActive) break;

      await writeStreamEvent(stream, event.event, event.data);
      lastProcessedEventId = event.id ?? lastProcessedEventId;

      if (isTerminalEvent(event.event)) {
        streamActive = false;
        break;
      }
    }
  }
};

const getCompletedCheckResults = async (streamId: string) => {
  const [existingCheck] = await db
    .select()
    .from(checks)
    .where(eq(checks.slug, streamId))
    .limit(1);

  if (!existingCheck) return null;

  const isCompleted =
    existingCheck.status === "completed" && !!existingCheck.result;

  return isCompleted ? (existingCheck.result as StoredEvent[]) : null;
};

export const agentRoute = new Hono()
  .get("/checks", async (context) => {
    const auth = getAuth(context);
    if (!auth?.userId) {
      return context.json({ error: "Unauthorized" }, 401);
    }

    try {
      const userChecks = await db
        .select({
          id: checks.id,
          slug: checks.slug,
          title: checks.title,
          status: checks.status,
          createdAt: checks.createdAt,
          updatedAt: checks.updatedAt,
          completedAt: checks.completedAt,
          textPreview: sql<string>`substring(${texts.content}, 1, 50)`,
        })
        .from(checks)
        .leftJoin(texts, eq(checks.textId, texts.id))
        .where(eq(checks.userId, extractClerkId(auth.userId)))
        .orderBy(desc(checks.updatedAt));

      return context.json({ checks: userChecks });
    } catch (error) {
      console.error("Failed to fetch checks:", error);
      return context.json({ error: "Failed to fetch checks" }, 500);
    }
  })
  .post("/run", zValidator("json", factCheckRequestSchema), async (context) => {
    const auth = getAuth(context);
    if (!auth?.userId) {
      return context.json({ error: "Unauthorized" }, 401);
    }

    const { content, checkId } = context.req.valid("json");

    try {
      await initializeFactCheckSession({
        content,
        checkId,
        userId: auth.userId,
      });

      executeFactCheckingAgent({ streamId: checkId, content }).catch(
        console.error.bind(console, "Background agent processing failed:")
      );

      return context.json({ checkId });
    } catch (error) {
      console.error("Failed to initialize fact-check:", error);
      return context.json({ error: "Failed to start fact-check" }, 500);
    }
  })
  .post(
    "/generate-title",
    zValidator("json", generateTitleRequestSchema),
    async (ctx) => {
      const auth = getAuth(ctx);
      if (!auth?.userId) return ctx.json({ error: "Unauthorized" }, 401);

      const { content, checkId } = ctx.req.valid("json");

      try {
        const [existingCheck] = await db
          .select({ userId: checks.userId })
          .from(checks)
          .where(eq(checks.slug, checkId))
          .limit(1);

        if (!existingCheck) {
          return ctx.json({ error: "Check not found" }, 404);
        }

        if (existingCheck.userId !== extractClerkId(auth.userId)) {
          return ctx.json({ error: "Unauthorized access to check" }, 403);
        }

        const title = await generateCheckTitle(checkId, content);

        return ctx.json({
          title: title || "Title generation failed",
          checkId,
        });
      } catch (error) {
        console.error("Failed to generate title:", error);
        return ctx.json({ error: "Failed to generate title" }, 500);
      }
    }
  )
  .get("/stream/:streamId", async (context) => {
    const auth = getAuth(context);
    if (!auth?.userId) {
      return context.json({ error: "Unauthorized" }, 401);
    }

    const streamId = context.req.param("streamId");

    try {
      const storedResults = await getCompletedCheckResults(streamId);

      if (storedResults) {
        return streamSSE(context, (stream) =>
          streamStoredResults(stream, storedResults)
        );
      }

      const streamIsActive = await streamExists(streamId);
      if (!streamIsActive) {
        return context.json({ error: "Stream not found" }, 404);
      }

      return streamSSE(context, (stream) => streamLiveEvents(stream, streamId));
    } catch (error) {
      console.error("Stream connection error:", error);
      return context.json({ error: "Failed to connect to stream" }, 500);
    }
  });

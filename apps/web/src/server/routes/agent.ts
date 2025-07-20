import { MAX_INPUT_LIMIT } from "@/lib/constants";
import { db } from "@/lib/db";
import { checks } from "@/lib/db/schema";
import { getEvents, streamExists } from "@/lib/redis";
import {
  executeFactCheckingAgent,
  initializeFactCheckSession,
} from "@/server/services/check";
import { getAuth } from "@hono/clerk-auth";
import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { SSEStreamingApi, streamSSE } from "hono/streaming";
import { z } from "zod";

const factCheckRequestSchema = z.object({
  text: z
    .string()
    .trim()
    .min(1)
    .max(MAX_INPUT_LIMIT)
    .describe("The text to be fact-checked"),
  checkId: z.string().trim().min(1).max(100).describe("The ID of the check"),
});

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

const streamStoredResults = async (stream: SSEStreamingApi, results: any[]) => {
  await writeStreamEvent(stream, "connection", {
    message: "Connection established",
  });

  for (const event of results) {
    await writeStreamEvent(stream, event.event, event.data);
  }
};

const streamLiveEvents = async (stream: SSEStreamingApi, streamId: string) => {
  await writeStreamEvent(stream, "connection", {
    message: "Connection established",
  });

  const existingEvents = await getEvents(streamId);

  for (const event of existingEvents) {
    await writeStreamEvent(stream, event.event, event.data);
    if (event.event === "complete" || event.event === "error") {
      break;
    }
  }

  let lastProcessedEventId =
    existingEvents.length > 0
      ? existingEvents[existingEvents.length - 1].id || "0"
      : "0";
  let streamActive = true;

  stream.onAbort(() => {
    streamActive = false;
  });

  while (streamActive) {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (!streamActive) break;

    const currentEvents = await getEvents(streamId);
    const newEvents = currentEvents.filter((event) => {
      if (!event.id || !lastProcessedEventId) return false;
      return event.id > lastProcessedEventId;
    });

    for (const event of newEvents) {
      if (!streamActive) break;
      await writeStreamEvent(stream, event.event, event.data);
      lastProcessedEventId = event.id || lastProcessedEventId;

      if (event.event === "complete" || event.event === "error") {
        streamActive = false;
        break;
      }
    }
  }
};

const getCompletedCheckResults = async (streamId: string) => {
  const existingCheck = await db
    .select()
    .from(checks)
    .where(eq(checks.slug, streamId))
    .limit(1);

  if (existingCheck.length === 0) return null;

  const check = existingCheck[0];
  const isCompleted = check.status === "completed" && check.result;

  return isCompleted ? (check.result as any[]) : null;
};

export const agentRoute = new Hono()
  .post("/run", zValidator("json", factCheckRequestSchema), async (context) => {
    const auth = getAuth(context);
    if (!auth?.userId) {
      return context.json({ error: "Unauthorized" }, 401);
    }

    const { text, checkId } = context.req.valid("json");

    try {
      await initializeFactCheckSession({
        content: text,
        checkId,
        userId: auth.userId,
      });

      executeFactCheckingAgent({
        streamId: checkId,
        content: text,
        userId: auth.userId,
      }).catch((error) => {
        console.error("Background agent processing failed:", error);
      });

      return context.json({ checkId });
    } catch (error) {
      console.error("Failed to initialize fact-check:", error);
      return context.json({ error: "Failed to start fact-check" }, 500);
    }
  })
  .get("/stream/:streamId", async (context) => {
    const auth = getAuth(context);
    if (!auth?.userId) {
      return context.json({ error: "Unauthorized" }, 401);
    }

    const streamId = context.req.param("streamId");

    try {
      const storedResults = await getCompletedCheckResults(streamId);

      if (storedResults) {
        return streamSSE(context, async (stream) => {
          await streamStoredResults(stream, storedResults);
        });
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

import { MAX_INPUT_LIMIT } from "@/lib/constants";
import { client } from "@/lib/langgraph";
import {
  createStream,
  addEvent,
  getEvents,
  streamExists,
  completeStream,
  failStream,
} from "@/lib/redis";
import { getAuth } from "@hono/clerk-auth";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { SSEStreamingApi, streamSSE } from "hono/streaming";
import { z } from "zod";

const inputSchema = z.object({
  text: z
    .string()
    .trim()
    .min(1)
    .max(MAX_INPUT_LIMIT)
    .describe("The text to be fact-checked"),
  checkId: z.string().trim().min(1).max(100).describe("The ID of the check"),
});

const eventSchema = z.object({
  event: z.string(),
  data: z.unknown(),
});

const processAgentEvent = async (
  streamId: string,
  event: unknown
): Promise<void> => {
  const parseResult = eventSchema.safeParse(event);

  if (parseResult.success) {
    await addEvent(streamId, parseResult.data.event, parseResult.data.data);
  } else {
    console.error("Invalid event structure:", parseResult.error);
    await addEvent(streamId, "error", {
      message: "Server received malformed event data",
      run_id: "validation-error",
    });
  }
};

const runFactCheckingAgent = async (
  streamId: string,
  text: string
): Promise<void> => {
  try {
    await createStream(streamId);
    await addEvent(streamId, "connected", {
      message: "Connected to SSE",
      streamId,
    });

    const thread = await client.threads.create();

    const run = client.runs.stream(thread.thread_id, "fact_checker", {
      input: { answer: text },
      streamSubgraphs: true,
      streamMode: ["updates"],
    });

    for await (const event of run) {
      await processAgentEvent(streamId, event);
    }

    await completeStream(streamId);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Agent processing error:", error);

    await addEvent(streamId, "error", {
      message: errorMessage,
      run_id: "server-error",
    });

    await failStream(streamId, errorMessage);
  }
};

const sendSSEEvent = async (
  stream: SSEStreamingApi,
  event: string,
  data: unknown
): Promise<void> => {
  await stream.writeSSE({
    event,
    data: JSON.stringify(data),
  });
};

const isStreamComplete = (events: Array<{ event: string }>): boolean => {
  return events.some((e) => e.event === "complete" || e.event === "error");
};

const handleStreamConnection = async (
  stream: SSEStreamingApi,
  streamId: string
): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    let pollInterval: NodeJS.Timeout;

    const cleanup = () => {
      if (pollInterval) clearInterval(pollInterval);
      resolve();
    };

    const sendInitialEvents = async (): Promise<number> => {
      await sendSSEEvent(stream, "test", {
        message: "SSE connection established",
      });

      const initialEvents = await getEvents(streamId);

      for (const event of initialEvents) {
        await sendSSEEvent(stream, event.event, event.data);
      }

      return initialEvents.length;
    };

    const startPolling = (sentEventCount: number): void => {
      pollInterval = setInterval(async () => {
        try {
          const allEvents = await getEvents(streamId);
          const newEvents = allEvents.slice(sentEventCount);

          if (newEvents.length === 0) return;

          for (const event of newEvents) {
            await sendSSEEvent(stream, event.event, event.data);
          }

          sentEventCount = allEvents.length;

          if (isStreamComplete(newEvents)) {
            cleanup();
          }
        } catch (error) {
          console.error("Polling error:", error);
          cleanup();
        }
      }, 1000);
    };

    const initialize = async (): Promise<void> => {
      try {
        const sentEventCount = await sendInitialEvents();
        const initialEvents = await getEvents(streamId);

        if (isStreamComplete(initialEvents)) {
          cleanup();
          return;
        }

        startPolling(sentEventCount);
        stream.onAbort(cleanup);
      } catch (error) {
        console.error("Stream initialization error:", error);
        reject(error);
      }
    };

    initialize();
  });
};

const requireAuth = (c: any) => {
  const auth = getAuth(c);
  if (!auth?.userId) return c.json({ error: "Unauthorized" }, 401);
  return null;
};

export const agentRoute = new Hono()
  .post("/run", zValidator("json", inputSchema), async (c) => {
    const authError = requireAuth(c);
    if (authError) return authError;

    const { text, checkId } = c.req.valid("json");

    runFactCheckingAgent(checkId, text).catch((error) => {
      console.error("Background agent processing failed:", error);
    });

    return c.json({ checkId });
  })
  .get("/stream/:streamId", async (c) => {
    const authError = requireAuth(c);
    if (authError) return authError;

    const streamId = c.req.param("streamId");

    const exists = await streamExists(streamId);
    if (!exists) {
      return c.json({ error: "Stream not found" }, 404);
    }

    return streamSSE(c, (stream) => handleStreamConnection(stream, streamId));
  });

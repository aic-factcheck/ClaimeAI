import { MAX_INPUT_LIMIT } from "@/lib/constants";
import { client } from "@/lib/langgraph";
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
});

const eventSchema = z.object({
  event: z.string(),
  data: z.unknown(),
});

type Event = z.infer<typeof eventSchema>;

const handleStreamEvent = async (stream: SSEStreamingApi, event: Event) => {
  const parseResult = eventSchema.safeParse(event);
  if (!parseResult.success) {
    console.error("Invalid event structure:", parseResult.error);
    const payload: Event = {
      event: "error",
      data: {
        message: "Server received malformed event data",
        run_id: "validation-error",
      },
    };
    await stream.writeSSE({ data: JSON.stringify(payload) });
    return;
  }
  await stream.writeSSE({ data: JSON.stringify(parseResult.data) });
};

const runAgentAndStream = async (stream: SSEStreamingApi, text: string) => {
  try {
    const thread = await client.threads.create();
    const run = client.runs.stream(thread.thread_id, "fact_checker", {
      input: { answer: text },
      streamSubgraphs: true,
      streamMode: ["updates"],
    });

    for await (const event of run) await handleStreamEvent(stream, event);
  } catch (error) {
    console.error("Server error:", error);

    const payload: Event = {
      event: "error",
      data: {
        message: (error as Error).message || "An unknown error occurred",
        run_id: "server-error",
      },
    };
    await stream.writeSSE({ data: JSON.stringify(payload) });
  }
};

export const agentRoute = new Hono().post(
  "/run",
  zValidator("json", inputSchema),
  (c) => {
    const auth = getAuth(c);
    if (!auth?.userId) return c.json({ error: "Unauthorized" }, 401);

    const { text } = c.req.valid("json");

    return streamSSE(c, (stream) => runAgentAndStream(stream, text));
  }
);

import { z } from "zod";
import {
  createCheck,
  findOrCreateText,
  updateCheckResult,
  updateCheckStatus,
} from "@/lib/db/operations";
import { client } from "@/lib/langgraph";
import {
  addEvent,
  completeStream,
  createStream,
  failStream,
  getEvents,
} from "@/lib/redis";

interface InitializeSessionParams {
  content: string;
  checkId: string;
  userId: string;
}

interface ExecuteAgentParams {
  streamId: string;
  content: string;
}

const agentEventSchema = z.object({
  event: z.string(),
  data: z.unknown(),
});

const processAgentEvent = async (
  streamId: string,
  rawEvent: unknown
): Promise<void> => {
  const parseResult = agentEventSchema.safeParse(rawEvent);

  if (parseResult.success) {
    const { event, data } = parseResult.data;
    await addEvent(streamId, event, data);
    return;
  }

  console.error("Invalid agent event structure:", parseResult.error);
  await addEvent(streamId, "error", {
    message: "Server received malformed event data",
    run_id: "validation-error",
  });
};

const persistAgentResults = async (streamId: string): Promise<void> => {
  try {
    const agentEvents = await getEvents(streamId);
    await updateCheckResult(streamId, agentEvents);
    console.log(`Successfully persisted results for check ${streamId}`);
  } catch (error) {
    console.error("Failed to persist agent results:", error);
    await updateCheckStatus(streamId, "completed");
  }
};

const handleProcessingError = async (
  streamId: string,
  error: unknown
): Promise<void> => {
  const errorMessage = error instanceof Error ? error.message : "Unknown error";
  console.error("Agent processing failed:", error);

  await addEvent(streamId, "error", {
    message: errorMessage,
    run_id: "server-error",
  });

  await failStream(streamId, errorMessage);
  await updateCheckStatus(streamId, "failed");
};

const executeAgentWorkflow = async (
  streamId: string,
  content: string
): Promise<void> => {
  const thread = await client.threads.create();
  const runStream = client.runs.stream(thread.thread_id, "fact_checker", {
    input: { answer: content },
    streamSubgraphs: true,
    streamMode: ["updates"],
  });

  for await (const event of runStream) {
    await processAgentEvent(streamId, event);
  }
};

export const initializeFactCheckSession = async ({
  content,
  checkId,
  userId,
}: InitializeSessionParams) => {
  const text = await findOrCreateText(content);
  const check = await createCheck({
    checkId,
    userId,
    textId: text.id,
  });
  return { text, check };
};

export const executeFactCheckingAgent = async ({
  streamId,
  content,
}: ExecuteAgentParams): Promise<void> => {
  try {
    await createStream(streamId);
    await addEvent(streamId, "connected", {
      message: "Connected to SSE",
      streamId,
    });

    await executeAgentWorkflow(streamId, content);
    await completeStream(streamId);
    await persistAgentResults(streamId);
  } catch (error) {
    await handleProcessingError(streamId, error);
  }
};

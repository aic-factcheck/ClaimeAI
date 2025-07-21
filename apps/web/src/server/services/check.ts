import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  createCheck,
  findOrCreateText,
  updateCheckResult,
  updateCheckStatus,
} from "@/lib/db/operations";
import { checks } from "@/lib/db/schema";
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

export const generateCheckTitle = async (
  checkId: string,
  content: string
): Promise<string | null> => {
  try {
    const { text: generatedTitle } = await generateText({
      model: openai("gpt-4.1-nano"),
      prompt: `Generate a concise, descriptive title (max 5 words) for this fact-checking content. The title should summarize the main claim or topic being fact-checked.

      Examples:

      Content: "The COVID-19 vaccine contains microchips that can track your location and was developed by Bill Gates to control the population."
      Title: COVID-19 Vaccine Microchip and Population Control Claims

      Content: "Drinking 8 glasses of water daily is essential for good health and was recommended by doctors for decades."
      Title: Daily Water Intake Recommendation Claims

      Content: "Climate change is a hoax created by scientists to get more funding, and global temperatures haven't actually risen in the past decade."
      Title: Climate Change Hoax and Temperature Data Claims

      Content: "Eating carrots improves your eyesight significantly and can help you see in the dark, which is why pilots ate them during World War II."
      Title: Carrots and Night Vision Enhancement Claims

      Content: "The moon landing in 1969 was staged by NASA in a Hollywood studio and never actually happened."
      Title: Moon Landing Authenticity Claims

      Now generate a title for:
      "${content}"

      Title:`,
      maxTokens: 100,
      temperature: 0.3,
    });

    const cleanTitle = generatedTitle.trim().replace(/^["']|["']$/g, "");

    await db
      .update(checks)
      .set({ title: cleanTitle, updatedAt: new Date() })
      .where(eq(checks.slug, checkId));

    return cleanTitle;
  } catch (error) {
    console.error("Failed to generate title:", error);
    return null;
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

    await Promise.all([
      persistAgentResults(streamId),
      generateCheckTitle(streamId, content),
    ]);
  } catch (error) {
    await handleProcessingError(streamId, error);
  }
};

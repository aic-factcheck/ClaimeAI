"use client";

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type {
  AgentSSEStreamEvent,
  ProcessedAgentUpdateData,
  UIValidatedClaim,
} from "@/types";
import { processAgentSSEEvent } from "./agent-processor";
import {
  type Evidence,
  parseSSEEventData,
  type SSEEvent,
  type Verdict,
} from "./event-schema";

export interface ContextualSentence {
  id: number;
  text: string;
}

export interface SelectedContentData {
  id: number;
  processedText: string;
  originalSentenceText: string;
}

export interface DisambiguatedContentData {
  id: number;
  disambiguatedText: string;
  originalSentenceText: string;
}

export interface UIClaim {
  claimText: string;
}

export interface PotentialClaimData {
  originalSentenceId: number;
  originalSentenceText: string;
  claim: UIClaim;
  sourceDisambiguatedSentenceText: string;
}

export interface UIFactCheckReport {
  answer: string;
  claims_verified: number;
  verified_claims: Verdict[];
  summary: string;
  timestamp: Date;
}

interface FactCheckerState {
  answer: string;
  submittedAnswer: string | null;
  isLoading: boolean;
  currentCheckId: string | null;
  rawServerEvents: SSEEvent[];
  contextualSentences: ContextualSentence[];
  selectedContents: SelectedContentData[];
  disambiguatedContents: DisambiguatedContentData[];
  potentialClaims: PotentialClaimData[];
  validatedClaims: UIValidatedClaim[];
  searchQueriesLog: string[];
  evidenceBatchesLog: Evidence[][];
  claimVerdicts: Verdict[];
  factCheckReport: UIFactCheckReport | null;
}

interface FactCheckerActions {
  setAnswer: (answer: string) => void;
  startVerification: (text: string, checkId: string) => Promise<string>;
  resetState: () => void;
  setIsLoading: (isLoading: boolean) => void;
  setCurrentCheckId: (checkId: string | null) => void;
  addRawServerEvent: (event: AgentSSEStreamEvent) => void;
  addContextualSentence: (sentence: ContextualSentence) => void;
  addSelectedContent: (content: SelectedContentData) => void;
  addDisambiguatedContent: (content: DisambiguatedContentData) => void;
  addPotentialClaim: (claim: PotentialClaimData) => void;
  addValidatedClaim: (claim: UIValidatedClaim) => void;
  addSearchQuery: (query: string) => void;
  addEvidenceBatch: (evidence: Evidence[]) => void;
  addClaimVerdict: (verdict: Verdict) => void;
  setFactCheckReport: (report: UIFactCheckReport) => void;
  processEventData: (eventData: string) => void;
  handleProcessedItem: (item: ProcessedAgentUpdateData) => void;
}

type FactCheckerStore = FactCheckerState & FactCheckerActions;

const createErrorEvent = (message: string, runId = "local-error") => ({
  event: "error",
  data: { message, run_id: runId },
});

const startFactChecking = async (
  content: string,
  checkId: string
): Promise<string> => {
  const response = await fetch("/api/agent/run", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content, checkId }),
  });

  if (!response.ok) {
    throw new Error(`Failed to start verification: ${response.statusText}`);
  }

  return await response.json();
};

const parseSSEMessage = (
  message: string
): { eventType: string; jsonData: string } | null => {
  const lines = message.split("\n");
  let eventType = "";
  let jsonData = "";

  for (const line of lines) {
    if (line.startsWith("event:")) {
      eventType = line.substring(6).trim();
    } else if (line.startsWith("data:")) {
      jsonData = line.substring(5).trim();
    }
  }

  return eventType && jsonData ? { eventType, jsonData } : null;
};

const initialState: FactCheckerState = {
  answer: "",
  submittedAnswer: null,
  isLoading: false,
  currentCheckId: null,
  rawServerEvents: [],
  contextualSentences: [],
  selectedContents: [],
  disambiguatedContents: [],
  potentialClaims: [],
  validatedClaims: [],
  searchQueriesLog: [],
  evidenceBatchesLog: [],
  claimVerdicts: [],
  factCheckReport: null,
};

const resetState = () => ({ ...initialState, answer: "" });

export const useFactCheckerStore = create<FactCheckerStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      setAnswer: (answer) => set({ answer }),
      resetState: () => set(resetState()),
      setIsLoading: (isLoading) => set({ isLoading }),
      setCurrentCheckId: (checkId) => set({ currentCheckId: checkId }),

      addRawServerEvent: (event) =>
        set((state) => ({
          rawServerEvents: [...state.rawServerEvents, event],
        })),

      addContextualSentence: (sentence) =>
        set((state) => {
          const exists = state.contextualSentences.find(
            (s) => s.id === sentence.id
          );
          return exists
            ? {}
            : {
                contextualSentences: [
                  ...state.contextualSentences,
                  sentence,
                ].sort((a, b) => a.id - b.id),
              };
        }),

      addSelectedContent: (content) =>
        set((state) => ({
          selectedContents: [...state.selectedContents, content],
        })),

      addDisambiguatedContent: (content) =>
        set((state) => ({
          disambiguatedContents: [...state.disambiguatedContents, content],
        })),

      addPotentialClaim: (claim) =>
        set((state) => ({
          potentialClaims: [...state.potentialClaims, claim],
        })),

      addValidatedClaim: (claim) =>
        set((state) => {
          const isDuplicate = state.validatedClaims.some(
            (existing) =>
              existing.claimText === claim.claimText &&
              existing.originalIndex === claim.originalIndex
          );
          return isDuplicate
            ? {}
            : {
                validatedClaims: [...state.validatedClaims, claim],
              };
        }),

      addSearchQuery: (query) =>
        set((state) => ({
          searchQueriesLog: [...state.searchQueriesLog, query],
        })),

      addEvidenceBatch: (evidence) =>
        set((state) => ({
          evidenceBatchesLog: [...state.evidenceBatchesLog, evidence],
        })),

      addClaimVerdict: (verdict) =>
        set((state) => {
          const isDuplicate = state.claimVerdicts.some(
            (existing) => existing.claim_text === verdict.claim_text
          );
          return isDuplicate
            ? {}
            : {
                claimVerdicts: [...state.claimVerdicts, verdict],
              };
        }),

      setFactCheckReport: (report) => set({ factCheckReport: report }),

      startVerification: async (content: string, checkId: string) => {
        if (!content) throw new Error("No text provided for verification");

        get().resetState();
        set({
          submittedAnswer: content,
          isLoading: true,
          currentCheckId: checkId,
        });

        try {
          const streamId = await startFactChecking(content, checkId);
          return { streamId, checkId };
        } catch (error) {
          console.error("Failed to start verification:", error);
          get().addRawServerEvent(createErrorEvent((error as Error).message));
          set({ isLoading: false });
          throw error;
        }
      },

      processEventData: (eventData) => {
        try {
          const parsedServerEvent = parseSSEEventData(eventData);
          get().addRawServerEvent(parsedServerEvent);

          const processedItems = processAgentSSEEvent(eventData);
          processedItems.forEach((item) => get().handleProcessedItem(item));
        } catch (error) {
          console.error("Failed to process event data:", error);
        }
      },

      handleProcessedItem: (item) => {
        const state = get();
        const { type, data } = item;

        switch (type) {
          case "ContextualSentenceAdded":
            state.addContextualSentence(data);
            if (!state.submittedAnswer && data.id === 0) {
              set({ submittedAnswer: data.text, isLoading: true });
            }
            break;
          case "SelectedContentAdded":
            state.addSelectedContent(data);
            break;
          case "DisambiguatedContentAdded":
            state.addDisambiguatedContent(data);
            break;
          case "PotentialClaimAdded":
            state.addPotentialClaim(data);
            break;
          case "ValidatedClaimAdded":
            state.addValidatedClaim(data);
            break;
          case "SearchQueryGenerated":
            state.addSearchQuery(data.query);
            break;
          case "EvidenceRetrieved":
            state.addEvidenceBatch(data.evidence);
            break;
          case "ClaimVerificationResult":
            state.addClaimVerdict(data);
            break;
          case "ExtractedClaimsProvided":
            data.claims.forEach((claim) => state.addValidatedClaim(claim));
            break;
          case "FactCheckReportGenerated":
            state.setFactCheckReport(data);
            if (!state.submittedAnswer) set({ submittedAnswer: data.answer });
            break;
          case "AgentRunMetadata":
            break;
          default:
            console.warn("Unhandled processed item type:", type);
        }
      },
    }),
    { name: "claimeai-store" }
  )
);

export const useFactCheckerInput = () => {
  const store = useFactCheckerStore();

  return {
    answer: store.answer,
    setAnswer: store.setAnswer,
    isLoading: store.isLoading,
    startVerification: store.startVerification,
    resetState: store.resetState,
    clearInputs: () => store.setAnswer(""),
  };
};

export const useFactCheckerResults = () => {
  const store = useFactCheckerStore();

  return {
    submittedAnswer: store.submittedAnswer,
    isLoading: store.isLoading,
    currentCheckId: store.currentCheckId,
    rawServerEvents: store.rawServerEvents,
    contextualSentences: store.contextualSentences,
    selectedContents: store.selectedContents,
    disambiguatedContents: store.disambiguatedContents,
    potentialClaims: store.potentialClaims,
    validatedClaims: store.validatedClaims,
    searchQueriesLog: store.searchQueriesLog,
    evidenceBatchesLog: store.evidenceBatchesLog,
    claimVerdicts: store.claimVerdicts,
    factCheckReport: store.factCheckReport,
  };
};

export const useSSEConnection = () => {
  const {
    processEventData,
    addRawServerEvent,
    setIsLoading,
    setCurrentCheckId,
    resetState,
    currentCheckId,
  } = useFactCheckerStore();

  const connectToStream = async (checkId: string) => {
    // Reset state if connecting to a different check
    if (currentCheckId !== checkId) {
      resetState();
      setCurrentCheckId(checkId);
    }

    try {
      const response = await fetch(`/api/agent/stream/${checkId}`);

      if (!response.ok)
        throw new Error(`Stream connection failed: ${response.statusText}`);

      if (!response.body) throw new Error("No response body received");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      try {
        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            setIsLoading(false);
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const messages = buffer.split("\n\n");

          for (let i = 0; i < messages.length - 1; i++) {
            const message = messages[i].trim();
            if (!message) continue;

            try {
              const parsed = parseSSEMessage(message);
              if (!parsed) continue;

              const { eventType, jsonData } = parsed;
              const eventData = {
                event: eventType,
                data: JSON.parse(jsonData),
              };

              processEventData(JSON.stringify(eventData));

              if (eventType === "complete" || eventType === "error")
                setIsLoading(false);
            } catch (error) {
              console.error("Failed to process SSE message:", error);
            }
          }

          const lastDelimiterPos = buffer.lastIndexOf("\n\n");
          buffer =
            lastDelimiterPos !== -1
              ? buffer.substring(lastDelimiterPos + 2)
              : buffer;
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      console.error("Failed to connect to stream:", error);
      addRawServerEvent(createErrorEvent((error as Error).message));
      setIsLoading(false);
    }
  };

  return { connectToStream };
};

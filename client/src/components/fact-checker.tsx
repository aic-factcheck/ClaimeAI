"use client";

import { Verdict } from "@/lib/event-schema";
import {
  ContextualSentence,
  DisambiguatedContentData,
  PotentialClaimData,
  SelectedContentData,
} from "@/lib/store";
import { UIValidatedClaim } from "@/types";
import { motion } from "framer-motion";
import React, { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

// Import separated components
import { ProgressBar } from "./fact-checker/progress-bar";
import { VerdictSummary } from "./fact-checker/verdict-summary";
import { ProcessedAnswer } from "./fact-checker/processed-answer";
import {
  LoadingState,
  ProcessingIndicator,
} from "./fact-checker/loading-state";
import {
  createDerivativesMap,
  findActiveSentenceId,
  getCurrentStageMessage,
} from "./fact-checker/utils";
import { SourcePills } from "./fact-checker/source-pills";

interface FactCheckerProps {
  question: string;
  contextualSentences: ContextualSentence[];
  selectedContents: SelectedContentData[];
  disambiguatedContents: DisambiguatedContentData[];
  potentialClaims: PotentialClaimData[];
  validatedClaims: UIValidatedClaim[];
  claimVerdicts: Verdict[];
  isLoading: boolean;
}

const FactChecker = ({
  question,
  contextualSentences,
  selectedContents,
  disambiguatedContents,
  potentialClaims,
  validatedClaims,
  claimVerdicts,
  isLoading,
}: FactCheckerProps) => {
  const [expandedCitation, setExpandedCitation] = useState<number | null>(null);

  // Create a map from original sentences to their derivative data
  const derivativesMap = useMemo(
    () =>
      createDerivativesMap(
        contextualSentences,
        selectedContents,
        disambiguatedContents,
        potentialClaims,
        validatedClaims,
        claimVerdicts
      ),
    [
      contextualSentences,
      selectedContents,
      disambiguatedContents,
      potentialClaims,
      validatedClaims,
      claimVerdicts,
    ]
  );

  // Find the active sentence being processed
  const activeSentenceId = useMemo(
    () =>
      findActiveSentenceId(
        isLoading,
        derivativesMap,
        contextualSentences,
        selectedContents,
        disambiguatedContents,
        potentialClaims,
        validatedClaims,
        claimVerdicts
      ),
    [
      isLoading,
      derivativesMap,
      contextualSentences,
      selectedContents,
      disambiguatedContents,
      potentialClaims,
      validatedClaims,
      claimVerdicts,
    ]
  );

  // Prepare progress stages data
  const progressStages = useMemo(
    () => [
      { name: "Contextual", count: contextualSentences.length },
      { name: "Selected", count: selectedContents.length },
      { name: "Disambiguated", count: disambiguatedContents.length },
      { name: "Claims", count: potentialClaims.length },
      { name: "Validated", count: validatedClaims.length },
      { name: "Verdicts", count: claimVerdicts.length },
    ],
    [
      contextualSentences,
      selectedContents,
      disambiguatedContents,
      potentialClaims,
      validatedClaims,
      claimVerdicts,
    ]
  );

  // Convert the map to an array for rendering
  const sentenceEntries = useMemo(
    () => Array.from(derivativesMap.entries()),
    [derivativesMap]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn("w-full bg-white")}
    >
      {/* Main content */}
      {contextualSentences.length === 0 ? (
        <div className="space-y-5">
          <ProgressBar stages={progressStages} isLoading={isLoading} />
          <LoadingState message="Initializing verification..." />
        </div>
      ) : (
        <div>
          <ProgressBar stages={progressStages} isLoading={isLoading} />

          {/* Display source pills if we have any verdicts with sources */}
          {claimVerdicts.length > 0 && <SourcePills verdicts={claimVerdicts} />}

          {/* Show all processed data as it comes in */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 my-2.5">
              Processed Answer
            </h3>
            <ProcessedAnswer
              sentenceEntries={sentenceEntries}
              isLoading={isLoading}
              activeSentenceId={activeSentenceId}
              expandedCitation={expandedCitation}
              setExpandedCitation={setExpandedCitation}
            />
          </div>

          {/* Show verdicts when available */}
        </div>
      )}
      <VerdictSummary verdicts={claimVerdicts} isLoading={isLoading} />
    </motion.div>
  );
};

export default FactChecker;

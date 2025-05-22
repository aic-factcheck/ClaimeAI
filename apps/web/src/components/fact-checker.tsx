"use client";

import type { Verdict } from "@/lib/event-schema";
import type {
  ContextualSentence,
  DisambiguatedContentData,
  PotentialClaimData,
  SelectedContentData,
} from "@/lib/store";
import { cn } from "@/lib/utils";
import type { UIValidatedClaim } from "@/types";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";

// Import separated components
import { LoadingState } from "./loading-state";
import { ProcessedAnswer } from "./processed-answer";
import { ProgressBar } from "./progress-bar";
import { SourcePills } from "./source-pills";
import { createDerivativesMap, findActiveSentenceId } from "./utils";
import { VerdictProgress } from "./verdict-progress";
import { VerdictSummary } from "./verdict-summary";

interface FactCheckerProps {
  contextualSentences: ContextualSentence[];
  selectedContents: SelectedContentData[];
  disambiguatedContents: DisambiguatedContentData[];
  potentialClaims: PotentialClaimData[];
  validatedClaims: UIValidatedClaim[];
  claimVerdicts: Verdict[];
  isLoading: boolean;
}

const FactChecker = ({
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
        <>
          <ProgressBar stages={progressStages} isLoading={isLoading} />
          <LoadingState message="Initializing verification..." />
        </>
      ) : (
        <>
          <ProgressBar stages={progressStages} isLoading={isLoading} />

          {/* Display source pills if we have any verdicts with sources */}
          {claimVerdicts.length > 0 && <SourcePills verdicts={claimVerdicts} />}

          <div>
            {/* Show verdict progress when verdicts start coming in */}
            {claimVerdicts.length > 0 && (
              <VerdictProgress verdicts={claimVerdicts} isLoading={isLoading} />
            )}
            {/* Show all processed data as it comes in */}
            <h3 className="my-2.5 mt-6 font-medium text-neutral-900 text-sm">
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
        </>
      )}

      {/* Show verdict summary as a separate section */}
      <VerdictSummary verdicts={claimVerdicts} isLoading={isLoading} />
    </motion.div>
  );
};

export default FactChecker;

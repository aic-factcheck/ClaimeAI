"use client";

import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import type { Verdict } from "@/lib/event-schema";
import type {
  ContextualSentence,
  DisambiguatedContentData,
  PotentialClaimData,
  SelectedContentData,
} from "@/lib/store";
import { cn } from "@/lib/utils";
import type { UIValidatedClaim } from "@/types";

import { LoadingState } from "./loading-state";
import { ProcessedAnswer } from "./processed-answer";
import { ProgressBar } from "./progress-bar";
import { SourcePills } from "./source-pills";
import { createDerivativesMap } from "./utils";
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

export const FactChecker = ({
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

  // Prepare progress stages data
  const progressStages = [
    { name: "Contextual", count: contextualSentences.length },
    { name: "Selected", count: selectedContents.length },
    { name: "Disambiguated", count: disambiguatedContents.length },
    { name: "Claims", count: potentialClaims.length },
    { name: "Validated", count: validatedClaims.length },
    { name: "Verdicts", count: claimVerdicts.length },
  ];

  // Convert the map to an array for rendering
  const sentenceEntries = useMemo(
    () => Array.from(derivativesMap.entries()),
    [derivativesMap]
  );

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className={cn("w-full")}
      initial={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.3 }}
    >
      {contextualSentences.length === 0 ? (
        <>
          <ProgressBar isLoading={isLoading} stages={progressStages} />
          <LoadingState message="Initializing verification..." />
        </>
      ) : (
        <>
          <ProgressBar isLoading={isLoading} stages={progressStages} />
          {claimVerdicts.length > 0 && <SourcePills verdicts={claimVerdicts} />}
          <div>
            {claimVerdicts.length > 0 && (
              <VerdictProgress isLoading={isLoading} verdicts={claimVerdicts} />
            )}
            <h3 className="my-2.5 mt-6 font-medium text-neutral-900 text-sm">
              Processed Answer
            </h3>
            <ProcessedAnswer
              expandedCitation={expandedCitation}
              sentenceEntries={sentenceEntries}
              setExpandedCitation={setExpandedCitation}
            />
          </div>
        </>
      )}
      <VerdictSummary isLoading={isLoading} verdicts={claimVerdicts} />
    </motion.div>
  );
};

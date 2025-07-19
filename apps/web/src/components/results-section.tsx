"use client";

import { motion } from "framer-motion";
import { useFactCheckerResults } from "@/lib/store";
import { FactChecker } from "./fact-checker";

export const ResultsSection = () => {
  const {
    submittedAnswer,
    contextualSentences,
    selectedContents,
    disambiguatedContents,
    potentialClaims,
    validatedClaims,
    claimVerdicts,
    isLoading,
  } = useFactCheckerResults();

  return (
    <motion.section
      animate={{ opacity: 1 }}
      aria-busy={isLoading}
      aria-label="Fact check results"
      aria-live="polite"
      className="flex w-full flex-grow flex-col lg:row-span-2"
      initial={{ opacity: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      {submittedAnswer && (
        <article className="flex w-full flex-grow flex-col">
          <h2 className="sr-only">Fact Check Results</h2>
          <FactChecker
            claimVerdicts={claimVerdicts}
            contextualSentences={contextualSentences}
            disambiguatedContents={disambiguatedContents}
            isLoading={isLoading}
            potentialClaims={potentialClaims}
            selectedContents={selectedContents}
            validatedClaims={validatedClaims}
          />
        </article>
      )}
    </motion.section>
  );
};

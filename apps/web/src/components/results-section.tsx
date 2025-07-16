"use client";

import { useFactCheckerResults } from "@/lib/store";
import { motion } from "framer-motion";
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      aria-label="Fact check results"
      className="lg:row-span-2 flex-grow flex flex-col w-full"
      aria-live="polite"
      aria-busy={isLoading}
    >
      {submittedAnswer && (
        <article className="w-full flex-grow flex flex-col">
          <h2 className="sr-only">Fact Check Results</h2>
          <FactChecker
            contextualSentences={contextualSentences}
            selectedContents={selectedContents}
            disambiguatedContents={disambiguatedContents}
            potentialClaims={potentialClaims}
            validatedClaims={validatedClaims}
            claimVerdicts={claimVerdicts}
            isLoading={isLoading}
          />
        </article>
      )}
    </motion.section>
  );
};

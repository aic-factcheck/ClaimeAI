"use client";

import { FactChecker } from "@/components/fact-checker";
import { useFactCheckerResults, useSSEConnection } from "@/lib/store";
import { useParams } from "next/navigation";
import { useEffect, useRef } from "react";

const CheckPage = () => {
  const { checkId } = useParams();
  const { connectToStream } = useSSEConnection();
  const connectionInitiated = useRef(false);
  const {
    submittedAnswer,
    isLoading,
    contextualSentences,
    selectedContents,
    disambiguatedContents,
    potentialClaims,
    validatedClaims,
    claimVerdicts,
  } = useFactCheckerResults();

  useEffect(() => {
    if (checkId && !connectionInitiated.current) {
      connectionInitiated.current = true;
      connectToStream(checkId as string);
    }
  }, [checkId, connectToStream]);

  return (
    <div className="container mx-auto max-w-4xl p-8">
      <div className="mb-6">
        <h1 className="mb-2 font-bold text-2xl text-neutral-900">
          Claime Results
        </h1>
        <p className="text-neutral-600 text-sm">
          {submittedAnswer ?? (
            <div className="h-4 w-lg animate-pulse rounded-md bg-neutral-200"></div>
          )}
        </p>
      </div>

      <FactChecker
        claimVerdicts={claimVerdicts}
        contextualSentences={contextualSentences}
        disambiguatedContents={disambiguatedContents}
        isLoading={isLoading}
        potentialClaims={potentialClaims}
        selectedContents={selectedContents}
        validatedClaims={validatedClaims}
      />
    </div>
  );
};

export default CheckPage;

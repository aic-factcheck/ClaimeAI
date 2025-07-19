"use client";

import { FactChecker } from "@/components/fact-checker";
import { useFactCheckerResults, useSSEConnection } from "@/lib/store";
import { Loader } from "lucide-react";
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

  if (!submittedAnswer) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader className="size-8 mx-auto mb-4 animate-spin" />
          <p className="text-neutral-600">Loading verification...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">
          Claime Results
        </h1>
        <p className="text-neutral-600 text-sm">{submittedAnswer}</p>
      </div>

      <FactChecker
        contextualSentences={contextualSentences}
        selectedContents={selectedContents}
        disambiguatedContents={disambiguatedContents}
        potentialClaims={potentialClaims}
        validatedClaims={validatedClaims}
        claimVerdicts={claimVerdicts}
        isLoading={isLoading}
      />
    </div>
  );
};

export default CheckPage;

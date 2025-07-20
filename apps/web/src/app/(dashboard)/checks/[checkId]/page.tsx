"use client";

import { Loader } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { FactChecker } from "@/components/fact-checker";
import { useFactCheckerResults, useSSEConnection } from "@/lib/store";

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
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <Loader className="mx-auto mb-4 size-8 animate-spin" />
          <p className="text-neutral-600">Loading verification...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6">
        <h1 className="mb-2 font-bold text-2xl text-neutral-900">
          Claime Results
        </h1>
        <p className="text-neutral-600 text-sm">{submittedAnswer}</p>
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

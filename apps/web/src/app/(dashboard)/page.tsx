"use client";

import { DebugReport } from "@/components/debug-report";
import { EmptyState } from "@/components/empty-state";
import { InputSection } from "@/components/input-section";
import { MethodologyIndicators } from "@/components/methodology-indicators";
import { ResultsSection } from "@/components/results-section";
import { useFactCheckerResults } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Suspense } from "react";

const HomePage = () => {
  const { submittedAnswer } = useFactCheckerResults();
  const isEmptyState = !submittedAnswer;

  return (
    <main
      className={cn(
        "mx-auto flex min-w-4xl max-w-4xl flex-grow flex-col items-center gap-3 p-6",
        isEmptyState ? "justify-center" : "justify-start"
      )}
      id="main-content"
    >
      {isEmptyState ? <EmptyState /> : <ResultsSection />}
      <Suspense>
        <InputSection />
      </Suspense>
      {isEmptyState && <MethodologyIndicators />}
      <DebugReport />
    </main>
  );
};

export default HomePage;

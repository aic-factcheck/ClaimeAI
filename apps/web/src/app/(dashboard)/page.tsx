"use client";

import { DebugReport } from "@/components/debug-report";
import { InputSection } from "@/components/input-section";
import { ResultsSection } from "@/components/results-section";
import { Suspense } from "react";

const Home = () => (
  <main
    className="flex flex-grow flex-col items-center justify-center gap-4 p-6 pb-6 max-w-4xl min-w-4xl mx-auto"
    id="main-content"
  >
    <Suspense>
      <InputSection />
    </Suspense>
    <ResultsSection />
    <DebugReport />
  </main>
);

export default Home;

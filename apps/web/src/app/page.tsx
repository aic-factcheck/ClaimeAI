"use client";

import { DebugReport } from "@/components/debug-report";
import { InputSection } from "@/components/input-section";
import { ResultsSection } from "@/components/results-section";

const Home = () => (
  <main
    className="flex flex-grow flex-col gap-4 rounded-t-2xl border-x border-t bg-white p-6 pb-6"
    id="main-content"
  >
    <InputSection />
    <ResultsSection />
    <DebugReport />
  </main>
);

export default Home;

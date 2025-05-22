"use client";

import { DebugReport } from "@/components/debug-report";
import { InputSection } from "@/components/input-section";
import { PageFooter } from "@/components/page-footer";
import { PageHeader } from "@/components/page-header";
import { ResultsSection } from "@/components/results-section";

const Home = () => (
  <div className="mx-auto flex min-h-screen max-w-5xl flex-col text-black">
    <PageHeader />
    <div className="flex flex-grow flex-col gap-4 rounded-t-2xl border-x border-t bg-white p-6 pb-6">
      <InputSection />
      <ResultsSection />
      <DebugReport />
    </div>
    <PageFooter />
  </div>
);

export default Home;

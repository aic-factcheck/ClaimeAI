"use client";

import { DebugReport } from "@/components/debug-report";
import { InputSection } from "@/components/input-section";
import { ResultsSection } from "@/components/results-section";
import { useFactCheckerResults } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Suspense } from "react";
import { motion } from "framer-motion";
import { Bot, FileText, Search, Shield } from "lucide-react";

const EmptyState = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="flex flex-col items-center justify-center text-center w-full space-y-8"
    >
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
          Welcome to ClaimeAI
        </h1>
        <p className="text-neutral-600 text-base leading-relaxed">
          Drop in any text and I'll help you verify its factual accuracy using
          advanced AI and real-time web search.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        {[
          {
            icon: Bot,
            title: "AI-Powered Analysis",
            description:
              "Advanced language models extract and verify specific claims",
          },
          {
            icon: Search,
            title: "Evidence Search",
            description: "Real-time web search gathers supporting evidence",
          },
          {
            icon: Shield,
            title: "Rigorous Verification",
            description:
              "Each claim is carefully evaluated against multiple sources",
          },
          {
            icon: FileText,
            title: "Detailed Reports",
            description:
              "Get comprehensive analysis with citations and reasoning",
          },
        ].map((feature, i) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 * (i + 3) }}
            className="flex justify-start items-center gap-4 p-4 rounded-lg border border-neutral-200 bg-white space-y-2"
          >
            <feature.icon className="size-7 text-neutral-600 my-auto" strokeWidth={1.5} />
            <div className="flex flex-col items-start">
              <h3 className="font-medium text-sm text-neutral-900">
                {feature.title}
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

const Home = () => {
  const { submittedAnswer } = useFactCheckerResults();

  return (
    <main
      className={cn(
        "flex flex-grow flex-col items-center gap-4 p-6 pb-6 max-w-4xl min-w-4xl mx-auto",
        !submittedAnswer ? "justify-center" : "justify-start"
      )}
      id="main-content"
    >
      {!submittedAnswer && <EmptyState />}
      <Suspense>
        <InputSection />
      </Suspense>
      {submittedAnswer && <ResultsSection />}
      <DebugReport />
    </main>
  );
};

export default Home;

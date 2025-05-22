"use client";

import FactChecker from "@/components/fact-checker";
import { InputSection } from "@/components/input-section";
import { useFactCheckerResults } from "@/lib/store";
import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink, Github, MessageCircle } from "lucide-react";

const Home = () => {
  const {
    submittedAnswer,
    contextualSentences,
    selectedContents,
    disambiguatedContents,
    potentialClaims,
    validatedClaims,
    claimVerdicts,
    factCheckReport,
    isLoading,
  } = useFactCheckerResults();

  return (
    <div className="mx-auto flex min-h-screen max-w-5xl flex-col text-black">
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="z-20 py-6 pl-6"
      >
        <div className="mb-2.5 flex items-center gap-2 pt-4">
          <div className="size-6 rounded-full border-5 border-black border-dashed" />
          <h1 className="font-semibold text-3xl text-neutral-900 tracking-tight">
            Fact Checker
          </h1>
        </div>
        <p className="text-neutral-500 text-sm">
          LLM-powered factual verification system with claim extraction and
          evidence-based assessment
        </p>
      </motion.header>

      <div className="flex flex-grow flex-col gap-4 rounded-t-2xl border-x border-t bg-white p-6 pb-6">
        {/* Input Section */}
        <InputSection />

        {/* Results Section - with Vercel Style UI */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="lg:row-span-2"
        >
          <AnimatePresence mode="wait">
            {submittedAnswer ? (
              <motion.div
                key="results"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3 }}
              >
                <FactChecker
                  contextualSentences={contextualSentences}
                  selectedContents={selectedContents}
                  disambiguatedContents={disambiguatedContents}
                  potentialClaims={potentialClaims}
                  validatedClaims={validatedClaims}
                  claimVerdicts={claimVerdicts}
                  isLoading={isLoading}
                />
              </motion.div>
            ) : (
              <motion.div
                key="empty-state"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3 }}
                className="flex size-full min-h-[355px] items-center justify-center rounded-lg border border-neutral-200 border-dashed bg-neutral-50/50"
              >
                <div className="px-6 py-12 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100">
                    <MessageCircle className="text-neutral-400" size={24} />
                  </div>
                  <h3 className="mb-1 font-medium text-neutral-900">
                    No answer submitted yet
                  </h3>
                  <p className="text-neutral-500 text-sm">
                    Enter a question and answer, then click "Verify"
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Debug section */}
        {factCheckReport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="col-span-full"
          >
            <details className="rounded-md border border-neutral-200 bg-white p-3 text-sm">
              <summary className="cursor-pointer select-none font-medium text-neutral-500 text-xs transition-colors hover:text-neutral-700">
                Debug: Report Details
              </summary>
              <div className="mt-4">
                <pre className="max-h-[300px] overflow-auto whitespace-pre-wrap rounded-md border border-neutral-200 bg-neutral-50 p-3 text-neutral-700 text-xs">
                  {JSON.stringify(factCheckReport, null, 2)}
                </pre>
              </div>
            </details>
          </motion.div>
        )}
      </div>
      <footer className="w-full border-x border-t bg-white px-6 py-8">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <div className="space-y-3">
              <h3 className="font-semibold text-neutral-900 text-sm">
                About Fact Checker
              </h3>
              <p className="text-neutral-500 text-xs leading-relaxed">
                Our modular LangGraph system breaks down text into individual
                claims, verifies each against reliable sources, and provides a
                detailed report on what's accurate and what's not. Built with
                advanced Claimify methodology for high-precision fact
                extraction.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-neutral-900 text-sm">
                Resources
              </h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="/#"
                    className="flex items-center gap-1 text-neutral-500 text-xs transition-colors hover:text-blue-600 hover:underline"
                  >
                    Documentation <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
                <li>
                  <a
                    href="/#"
                    className="flex items-center gap-1 text-neutral-500 text-xs transition-colors hover:text-blue-600 hover:underline"
                  >
                    API Reference <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
                <li>
                  <a
                    href="/#"
                    className="flex items-center gap-1 text-neutral-500 text-xs transition-colors hover:text-blue-600 hover:underline"
                  >
                    Privacy Policy <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-neutral-900 text-sm">
                Research
              </h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="https://arxiv.org/abs/2502.10855"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-neutral-500 text-xs transition-colors hover:text-blue-600 hover:underline"
                  >
                    Claimify Methodology <ExternalLink className="h-3 w-3" />
                  </a>
                  <div className="text-neutral-400 text-xs">
                    Metropolitansky & Larson, 2025
                  </div>
                </li>
                <li>
                  <a
                    href="https://arxiv.org/abs/2403.18802"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-neutral-500 text-xs transition-colors hover:text-blue-600 hover:underline"
                  >
                    SAFE Methodology <ExternalLink className="h-3 w-3" />
                  </a>
                  <div className="text-neutral-400 text-xs">
                    Wei et al., 2024
                  </div>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-neutral-900 text-sm">
                Connect
              </h3>
              <a
                href="https://github.com/BharathXD/fact-checker"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-md border border-neutral-200 px-3 py-1.5 text-neutral-700 text-xs transition-colors hover:border-neutral-300 hover:bg-neutral-50"
              >
                <Github className="h-3.5 w-3.5" />
                <span>View on GitHub</span>
              </a>
            </div>
          </div>

          <div className="mt-8 flex flex-col items-center justify-between border-neutral-100 border-t pt-6 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 rounded-full border-4 border-black border-dashed" />
              <p className="font-semibold text-neutral-600 text-xs">
                Fact Checker
              </p>
            </div>
            <p className="mt-3 text-neutral-400 text-xs sm:mt-0">
              © {new Date().getFullYear()} Fact Checker. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;

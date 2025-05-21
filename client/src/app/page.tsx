"use client";

import FactChecker from "@/components/fact-checker";
import { InputSection } from "@/components/fact-checker/input-section";
import { useFactCheckerInput, useFactCheckerResults } from "@/lib/store";
import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink, Github } from "lucide-react";

const Home = () => {
  const { question } = useFactCheckerInput();

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
    <div className="flex flex-col max-w-5xl mx-auto min-h-screen text-black">
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="py-6 z-20 pl-6"
      >
        <div className="flex items-center gap-2 mb-2.5 pt-4">
          <div className="size-6 border-black border-5 border-dashed rounded-full"></div>
          <h1 className="text-3xl font-semibold text-neutral-900 tracking-tight">
            Fact Checker
          </h1>
        </div>
        <p className="text-neutral-500 text-sm">
          LLM-powered factual verification system with claim extraction and evidence-based assessment
        </p>
      </motion.header>

      <div className="flex flex-col gap-4 pb-6 flex-grow bg-white p-6 border-x border-t rounded-t-2xl">
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
                  question={question}
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
                className="flex items-center justify-center min-h-[355px] size-full border border-dashed border-neutral-200 rounded-lg bg-neutral-50/50"
              >
                <div className="text-center px-6 py-12">
                  <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-4">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="text-neutral-400"
                    >
                      <path
                        d="M21 11.5C21.0034 12.8199 20.6951 14.1219 20.1 15.3C19.3944 16.7118 18.3098 17.8992 16.9674 18.7293C15.6251 19.5594 14.0782 19.9994 12.5 20C11.1801 20.0035 9.87812 19.6951 8.7 19.1L3 21L4.9 15.3C4.30493 14.1219 3.99656 12.8199 4 11.5C4.00061 9.92179 4.44061 8.37488 5.27072 7.03258C6.10083 5.69028 7.28825 4.6056 8.7 3.90003C9.87812 3.30496 11.1801 2.99659 12.5 3.00003H13C15.0843 3.11502 17.053 3.99479 18.5291 5.47089C20.0052 6.94699 20.885 8.91568 21 11V11.5Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <h3 className="text-neutral-900 font-medium mb-1">
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
            <details className="border rounded-md p-3 bg-white text-sm border-neutral-200">
              <summary className="text-xs font-medium text-neutral-500 cursor-pointer hover:text-neutral-700 transition-colors select-none">
                Debug: Report Details
              </summary>
              <div className="mt-4">
                <pre className="text-xs whitespace-pre-wrap p-3 bg-neutral-50 rounded-md border border-neutral-200 text-neutral-700 overflow-auto max-h-[300px]">
                  {JSON.stringify(factCheckReport, null, 2)}
                </pre>
              </div>
            </details>
          </motion.div>
        )}
      </div>
      <footer className="border-x border-t px-6 bg-white w-full py-8">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-neutral-900">
                About Fact Checker
              </h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Our modular LangGraph system breaks down text into individual
                claims, verifies each against reliable sources, and provides a
                detailed report on what's accurate and what's not. Built with
                advanced Claimify methodology for high-precision fact
                extraction.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-neutral-900">
                Resources
              </h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-xs text-neutral-500 hover:text-blue-600 transition-colors flex items-center gap-1 hover:underline"
                  >
                    Documentation <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-xs text-neutral-500 hover:text-blue-600 transition-colors flex items-center gap-1 hover:underline"
                  >
                    API Reference <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-xs text-neutral-500 hover:text-blue-600 transition-colors flex items-center gap-1 hover:underline"
                  >
                    Privacy Policy <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-neutral-900">
                Research
              </h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="https://arxiv.org/abs/2502.10855"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-neutral-500 hover:text-blue-600 transition-colors flex items-center gap-1 hover:underline"
                  >
                    Claimify Methodology <ExternalLink className="w-3 h-3" />
                  </a>
                  <div className="text-xs text-neutral-400">
                    Metropolitansky & Larson, 2025
                  </div>
                </li>
                <li>
                  <a
                    href="https://arxiv.org/abs/2403.18802"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-neutral-500 hover:text-blue-600 transition-colors flex items-center gap-1 hover:underline"
                  >
                    SAFE Methodology <ExternalLink className="w-3 h-3" />
                  </a>
                  <div className="text-xs text-neutral-400">
                    Wei et al., 2024
                  </div>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-neutral-900">
                Connect
              </h3>
              <a
                href="https://github.com/BharathXD/fact-checker"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 text-xs text-neutral-700 border border-neutral-200 rounded-md  hover:bg-neutral-50 transition-colors hover:border-neutral-300"
              >
                <Github className="w-3.5 h-3.5" />
                <span>View on GitHub</span>
              </a>
            </div>
          </div>

          <div className="border-t border-neutral-100 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-black border-4 border-dashed rounded-full"></div>
              <p className="text-xs font-semibold text-neutral-600">
                Fact Checker
              </p>
            </div>
            <p className="text-xs text-neutral-400 mt-3 sm:mt-0">
              © {new Date().getFullYear()} Fact Checker. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;

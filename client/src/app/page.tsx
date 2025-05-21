"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import FactChecker from "@/components/fact-checker";
import { useFactCheckerInput, useFactCheckerResults } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";
import { Github, Loader2, ExternalLink, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { FlickeringGrid } from "@/components/magicui/flickering-grid";

// ===== MAIN COMPONENT =====

const Home = () => {
  const {
    question,
    setQuestion,
    answer,
    setAnswer,
    isLoading,
    startVerification,
  } = useFactCheckerInput();

  const {
    submittedAnswer,
    contextualSentences,
    selectedContents,
    disambiguatedContents,
    potentialClaims,
    validatedClaims,
    claimVerdicts,
    factCheckReport,
  } = useFactCheckerResults();

  // ===== MAIN RENDER =====
  return (
    <div className="flex flex-col max-w-5xl mx-auto min-h-screen text-black">
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="py-6 z-20"
      >
        <h1 className="text-3xl font-semibold text-gray-900 tracking-tight mb-1">
          Fact Checker
        </h1>
        <p className="text-gray-500 text-sm">
          Enter a question and an answer to verify its factual accuracy
        </p>
      </motion.header>

      <div className="flex flex-col gap-4 pb-6 flex-grow">
        {/* Input Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="relative"
        >
          <Input
            type="text"
            placeholder="What is the capital of France?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="border-gray-200 bg-white text-sm placeholder:text-gray-400 focus-visible:ring-blue-600 focus-visible:border-blue-600 focus-visible:ring-1 transition-all duration-200 rounded-b-none"
            disabled={isLoading}
          />
          <Textarea
            placeholder="Provide an answer that you want to fact-check"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="border-gray-200 bg-white text-sm placeholder:text-gray-400 focus-visible:ring-blue-600 focus-visible:border-blue-600 focus-visible:ring-1 transition-all duration-200 resize-none rounded-t-none border-t-0 min-h-32 max-h-32 w-full whitespace-pre-wrap max-w-5xl"
            disabled={isLoading}
          />

          <Button
            onClick={startVerification}
            disabled={isLoading}
            size="sm"
            variant="secondary"
            className={cn(
              "py-2 text-sm font-medium h-8 transition-all border",
              "absolute bottom-3.5 right-3.5",
              isLoading ? "opacity-70" : "!pr-1.5"
            )}
          >
            {isLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <>
                <span>Send</span>
                <ChevronRight className="size-4" />
              </>
            )}
          </Button>
        </motion.div>

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
                className="h-full flex items-center justify-center min-h-[400px] border border-dashed border-gray-200 rounded-lg bg-gray-50/50"
              >
                <div className="text-center px-6 py-12">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="text-gray-400"
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
                  <h3 className="text-gray-900 font-medium mb-1">
                    No answer submitted yet
                  </h3>
                  <p className="text-gray-500 text-sm">
                    Enter a question and answer, then click "Verify Answer"
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
            <details className="border rounded-md p-3 bg-white text-sm border-gray-200">
              <summary className="text-xs font-medium text-gray-500 cursor-pointer hover:text-gray-700 transition-colors select-none">
                Debug: Report Details
              </summary>
              <div className="mt-4">
                <pre className="text-xs whitespace-pre-wrap p-3 bg-gray-50 rounded-md border border-gray-200 text-gray-700 overflow-auto max-h-[300px]">
                  {JSON.stringify(factCheckReport, null, 2)}
                </pre>
              </div>
            </details>
          </motion.div>
        )}
      </div>

      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900">
                About Fact Checker
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Our AI-powered fact checking tool verifies the accuracy of
                information by analyzing claims and cross-referencing them with
                reliable sources.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-xs text-gray-500 hover:text-blue-600 transition-colors flex items-center gap-1 hover:underline"
                  >
                    Documentation <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-xs text-gray-500 hover:text-blue-600 transition-colors flex items-center gap-1 hover:underline"
                  >
                    API Reference <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-xs text-gray-500 hover:text-blue-600 transition-colors flex items-center gap-1 hover:underline"
                  >
                    Privacy Policy <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900">Connect</h3>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 text-xs text-gray-700 border border-gray-200 rounded-md  hover:bg-gray-50 transition-colors hover:border-gray-300"
              >
                <Github className="w-3.5 h-3.5" />
                <span>View on GitHub</span>
              </a>
            </div>
          </div>

          <div className="border-t border-gray-100 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-black rounded-full"></div>
              <p className="text-xs font-semibold text-gray-600">
                Fact Checker
              </p>
            </div>
            <p className="text-xs text-gray-400 mt-3 sm:mt-0">
              © {new Date().getFullYear()} Fact Checker. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;

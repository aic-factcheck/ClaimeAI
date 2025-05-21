import { motion } from "framer-motion";
import { Verdict } from "@/lib/event-schema";
import { cn } from "@/lib/utils";
import { VerdictBadge } from "@/components/ui/verdict-badge";

interface VerdictSummaryProps {
  verdicts: Verdict[];
  isLoading: boolean;
}

export const VerdictSummary = ({
  verdicts,
  isLoading,
}: VerdictSummaryProps) => {
  if (verdicts.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <h3 className="flex items-center text-sm font-medium text-gray-800 my-2.5">
        Fact Check Summary
        {isLoading && (
          <motion.span
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-xs text-gray-500 ml-2 font-normal"
          >
            Processing...
          </motion.span>
        )}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {verdicts.map((verdict, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.07 }}
            className={cn(
              "bg-white border border-gray-200 rounded-md p-4 transition-colors"
            )}
          >
            <div className="space-y-3">
              <VerdictBadge verdict={verdict} />

              <div className="space-y-2">
                <p className="text-sm text-gray-800 font-medium leading-snug">
                  {verdict.claim_text}
                </p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {verdict.reasoning}
                </p>
              </div>

              {verdict.sources.length > 0 && (
                <div className="pt-3 mt-1 border-t border-gray-100">
                  <p className="text-xs font-medium text-gray-500 mb-2">
                    Sources:
                  </p>
                  <div className="space-y-1.5">
                    {verdict.sources.map((source, idx) => (
                      <a
                        key={idx}
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-xs text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3.5 w-3.5 mr-1.5 flex-shrink-0 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                          />
                        </svg>
                        <span className="truncate">
                          {source.title || source.url}
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

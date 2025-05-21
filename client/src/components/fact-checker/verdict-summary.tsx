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
      transition={{ duration: 0.2 }}
      className="space-y-3  "
    >
      <h3 className="flex items-center text-sm font-medium text-neutral-900 my-2.5 mt-6">
        Fact Check Summary
        {isLoading && (
          <motion.span
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-xs text-neutral-500 ml-2 font-normal"
          >
            Processing...
          </motion.span>
        )}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {verdicts.map((verdict, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: idx * 0.05 }}
            className={cn(
              "bg-neutral-50 dark:bg-neutral-900/90 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-lg p-3 transition-all"
            )}
          >
            <div className="space-y-2.5">
              <VerdictBadge verdict={verdict} />

              <div className="space-y-1.5">
                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 leading-snug">
                  {verdict.claim_text}
                </p>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {verdict.reasoning}
                </p>
              </div>

              {verdict.sources.length > 0 && (
                <div className="pt-2 mt-1 border-t border-neutral-100 dark:border-neutral-800">
                  <p className="text-xs tracking-wider font-medium text-neutral-500 dark:text-neutral-400 mb-1.5">
                    Sources
                  </p>
                  <div className="space-y-1">
                    {verdict.sources.map((source, idx) => (
                      <a
                        key={idx}
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3 w-3 mr-1 flex-shrink-0 text-neutral-400"
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

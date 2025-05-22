import { VerdictBadge } from "@/components/ui/verdict-badge";
import type { Verdict } from "@/lib/event-schema";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Link as LinkIcon } from "lucide-react";

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
      className="space-y-3 "
    >
      <h3 className="my-2.5 mt-6 flex items-center font-medium text-neutral-900 text-sm">
        Fact Check Summary
        {isLoading && (
          <motion.span
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            className="ml-2 font-normal text-neutral-500 text-xs"
          >
            Processing...
          </motion.span>
        )}
      </h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {verdicts.map((verdict, idx) => (
          <motion.div
            key={`${verdict.claim_text}-${idx}`}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: idx * 0.05 }}
            className={cn(
              "rounded-lg border border-neutral-200 border-dashed bg-neutral-50 p-3 transition-all dark:border-neutral-800 dark:bg-neutral-900/90"
            )}
          >
            <div className="space-y-2.5">
              <VerdictBadge verdict={verdict} />

              <div className="space-y-1.5">
                <p className="font-medium text-neutral-900 text-sm leading-snug dark:text-neutral-100">
                  {verdict.claim_text}
                </p>
                <p className="text-neutral-600 text-xs leading-relaxed dark:text-neutral-400">
                  {verdict.reasoning}
                </p>
              </div>

              {verdict.sources.length > 0 && (
                <div className="mt-1 border-neutral-100 border-t pt-2 dark:border-neutral-800">
                  <p className="mb-1.5 font-medium text-neutral-500 text-xs tracking-wider dark:text-neutral-400">
                    Sources
                  </p>
                  <div className="space-y-1">
                    {verdict.sources.map((source, idx) => (
                      <a
                        key={`${source.url}-${idx}`}
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-600 text-xs transition-colors hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <LinkIcon className="mr-1 h-3 w-3 flex-shrink-0 text-neutral-400" />
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

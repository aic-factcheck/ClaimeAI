import { motion } from "framer-motion";
import { InfoIcon } from "lucide-react";
import { useMemo } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Verdict } from "@/lib/event-schema";
import { cn } from "@/lib/utils";

interface VerdictProgressProps {
  verdicts: Verdict[];
  isLoading: boolean;
}

type VerdictType = "Supported" | "Refuted";

const VERDICT_CONFIG = {
  Supported: {
    bgClass: "bg-emerald-500",
    label: "Supported",
    description: "Claims verified as correct",
  },
  Refuted: {
    bgClass: "bg-red-500",
    label: "Refuted",
    description: "Claims verified as incorrect",
  },
} as const;

export const VerdictProgress = ({
  verdicts,
  isLoading,
}: VerdictProgressProps) => {
  const stats = useMemo(() => {
    const counts: Record<VerdictType, number> = { Supported: 0, Refuted: 0 };

    for (const verdict of verdicts) {
      if (verdict.result === "Supported" || verdict.result === "Refuted") {
        counts[verdict.result]++;
      }
    }

    return {
      counts,
      total: verdicts.length,
      percentages: {
        Supported: verdicts.length
          ? (counts.Supported / verdicts.length) * 100
          : 0,
        Refuted: verdicts.length ? (counts.Refuted / verdicts.length) * 100 : 0,
      },
    };
  }, [verdicts]);

  if (stats.total === 0) return null;

  return (
    <TooltipProvider>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center justify-between">
          <h3 className="my-2.5 mt-6 font-medium text-neutral-900 text-sm">
            Analysis
          </h3>
          <div className="flex items-center gap-1.5 mt-auto pb-3">
            <span className="text-neutral-500 text-xs tracking-wide">
              {stats.total} claim{stats.total !== 1 ? "s" : ""} verified
            </span>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="cursor-help">
                  <InfoIcon className="h-3.5 w-3.5 text-neutral-400 transition-colors hover:text-neutral-500" />
                </div>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className="border-0 bg-black px-3 py-1.5 text-white text-xs"
              >
                Distribution of claim analysis results
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        <div className="relative h-2 w-full overflow-hidden rounded-full bg-neutral-100">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="absolute inset-0 flex"
          >
            {stats.percentages.Supported > 0 && (
              <div
                className="h-full bg-emerald-500"
                style={{ width: `${stats.percentages.Supported}%` }}
              />
            )}
            {stats.percentages.Refuted > 0 && (
              <div
                className="h-full bg-red-500"
                style={{ width: `${stats.percentages.Refuted}%` }}
              />
            )}
          </motion.div>

          {isLoading && (
            <motion.div
              animate={{ x: ["-100%", "200%"] }}
              transition={{
                duration: 1.0,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/30 to-transparent"
            />
          )}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mt-2.5 flex items-center justify-between px-0.5"
        >
          {(
            Object.entries(VERDICT_CONFIG) as [
              VerdictType,
              (typeof VERDICT_CONFIG)[VerdictType]
            ][]
          ).map(([type, config]) => {
            const count = stats.counts[type];
            const percentage = Math.round(stats.percentages[type]);

            return (
              <Tooltip key={type}>
                <TooltipTrigger asChild>
                  <div className="flex cursor-default items-center gap-1.5">
                    <div
                      className={cn(
                        "h-2 w-2 rounded-full",
                        count > 0 ? config.bgClass : "bg-neutral-300"
                      )}
                    />
                    <div
                      className={cn(
                        "text-neutral-600 text-xs",
                        count === 0 && "text-neutral-400"
                      )}
                    >
                      <span className="font-medium">{config.label}</span>
                      <span className="ml-1 tabular-nums">{percentage}%</span>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent
                  side="bottom"
                  className="border-0 bg-black px-2.5 py-1.5 text-white text-xs"
                >
                  {config.description} · {count} claims
                </TooltipContent>
              </Tooltip>
            );
          })}
        </motion.div>
      </motion.div>
    </TooltipProvider>
  );
};

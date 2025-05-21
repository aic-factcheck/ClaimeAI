import React, { memo, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Circle, ChevronRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  stages: { name: string; count: number; description?: string }[];
  isLoading: boolean;
}

export const ProgressBar = memo(({ stages, isLoading }: ProgressBarProps) => {
  const activeStageIndex = useMemo(
    () => stages.findIndex((stage) => stage.count === 0),
    [stages]
  );
  const currentStage =
    activeStageIndex === -1
      ? stages.length - 1
      : Math.max(0, activeStageIndex - 1);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.03, delayChildren: 0.03 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 2 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.2, ease: "easeOut" },
    },
  };

  return (
    <div className="select-none">
      <div className="flex items-center justify-between mb-2 text-xs text-gray-500">
        <span className="font-medium text-sm text-foreground">
          Verification
        </span>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex items-center gap-x-1 overflow-x-auto pb-1 hide-scrollbar"
      >
        {stages.map((stage, idx) => {
          const isCompleted = idx < currentStage;
          const isCurrent = idx === currentStage;

          return (
            <React.Fragment key={stage.name}>
              <motion.div
                variants={itemVariants}
                className={cn(
                  "h-5 px-2  rounded-full flex items-center gap-1 text-xs transition-all duration-200 group relative border",
                  isCurrent && isLoading
                    ? "bg-black/5 text-black font-medium"
                    : isCompleted
                    ? "bg-black/5 text-black"
                    : "bg-black/[.03] text-gray-400"
                )}
              >
                <span className="flex-shrink-0">
                  {isCompleted ? (
                    <CheckCircle2 className="w-2.5 h-2.5 text-black" />
                  ) : isCurrent && isLoading ? (
                    <Loader2 className="w-2.5 h-2.5 animate-spin" />
                  ) : (
                    <Circle className="w-2.5 h-2.5" />
                  )}
                </span>
                <span className="font-medium whitespace-nowrap">
                  {stage.name}
                </span>
                <AnimatePresence>
                  {stage.count > 0 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      className={cn(
                        "h-3.5 min-w-3.5 px-0.5 rounded-full flex items-center justify-center text-xs font-medium",
                        isCurrent && isLoading
                          ? "bg-black text-white"
                          : isCompleted
                          ? "bg-black text-white"
                          : "bg-gray-200 text-gray-600"
                      )}
                    >
                      {stage.count}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Tooltip with description on hover */}
                {stage.description && (
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-10">
                    <div className="bg-black text-white text-xs py-1 px-1.5 rounded-md max-w-[160px] text-center">
                      {stage.description}
                      <div className="absolute w-1.5 h-1.5 bg-black rotate-45 left-1/2 -translate-x-1/2 -bottom-0.5"></div>
                    </div>
                  </div>
                )}
              </motion.div>
              {idx < stages.length - 1 && (
                <ChevronRight
                  className={cn(
                    "w-3 h-3 flex-shrink-0",
                    idx < currentStage ? "text-black" : "text-gray-300"
                  )}
                  strokeWidth={2}
                />
              )}
            </React.Fragment>
          );
        })}
      </motion.div>
    </div>
  );
});

ProgressBar.displayName = "ProgressBar";

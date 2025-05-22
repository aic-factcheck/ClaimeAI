"use client";

import { useFactCheckerResults } from "@/lib/store";
import { motion } from "framer-motion";

export const DebugReport = () => {
  const { factCheckReport } = useFactCheckerResults();
  if (!factCheckReport) return null;
  return (
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
  );
};

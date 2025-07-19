"use client";

import { motion } from "framer-motion";
import { useFactCheckerResults } from "@/lib/store";

export const DebugReport = () => {
  const { factCheckReport } = useFactCheckerResults();
  if (!factCheckReport) return null;

  return (
    <motion.aside
      animate={{ opacity: 1 }}
      aria-label="Debug information"
      className="col-span-full w-full"
      initial={{ opacity: 0 }}
      transition={{ duration: 0.3, delay: 0.3 }}
    >
      <details className="rounded-md border border-neutral-200 bg-white p-3 text-sm">
        <summary className="cursor-pointer select-none rounded font-medium text-neutral-500 text-xs transition-colors hover:text-neutral-700 focus:outline-none">
          Debug: Report Details
        </summary>
        <div className="mt-4">
          <h3 className="sr-only">Raw Report Data</h3>
          <pre
            aria-label="JSON formatted fact check report data"
            className="max-h-[300px] overflow-auto whitespace-pre-wrap rounded-md border border-neutral-200 bg-neutral-50 p-3 text-neutral-700 text-xs"
          >
            {JSON.stringify(factCheckReport, null, 2)}
          </pre>
        </div>
      </details>
    </motion.aside>
  );
};

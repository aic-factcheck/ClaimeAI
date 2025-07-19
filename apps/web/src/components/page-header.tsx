"use client";

import { motion } from "framer-motion";

export const PageHeader = () => (
  <motion.header
    animate={{ opacity: 1, y: 0 }}
    className="z-20 py-6 pl-6"
    initial={{ opacity: 0, y: -10 }}
    role="banner"
    transition={{ duration: 0.3 }}
  >
    <div className="mb-2.5 flex items-center gap-2 pt-4">
      <div
        aria-hidden="true"
        className="size-6 rounded-full border-5 border-black border-dashed"
      />
      <h1 className="font-semibold text-3xl text-neutral-900 tracking-tight">
        ClaimeAI
      </h1>
    </div>
    <p className="text-neutral-500 text-sm">
      LLM-powered factual verification system with claim extraction and
      evidence-based assessment
    </p>
  </motion.header>
);

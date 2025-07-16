"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useFactCheckerInput } from "@/lib/store";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export const InputSection = () => {
  const { answer, setAnswer, isLoading, startVerification } =
    useFactCheckerInput();

  const searchParams = useSearchParams();

  useEffect(() => {
    const answerFromUrl = searchParams.get("a");

    let processedAnswer = false;

    if (answerFromUrl) {
      try {
        const decodedAnswer = decodeURIComponent(answerFromUrl);
        setAnswer(decodedAnswer);
        processedAnswer = true;
      } catch (e) {
        console.error("Failed to decode answer from URL:", e);
        setAnswer("(Error decoding answer)"); // Set error placeholder
      }
    }

    if (answerFromUrl) {
      void startVerification();
    }
  }, [searchParams, setAnswer, startVerification]);

  const handleSubmit = () => {
    if (!isLoading && answer) {
      startVerification();
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      aria-label="Answer input"
      className="relative w-full"
    >
      <fieldset disabled={isLoading} className="space-y-0">
        <legend className="sr-only">Enter an answer to fact-check</legend>

        <div className="space-y-0">
          <label htmlFor="answer-input" className="sr-only">
            Answer to verify
          </label>
          <Textarea
            id="answer-input"
            placeholder="Drop that sus answer here (e.g., 'Einstein definitely said we'd have flying cars by 2020, trust me bro')"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="peer max-h-32 min-h-32 w-full max-w-5xl resize-none whitespace-pre-wrap border-neutral-200 bg-white pr-20 text-sm transition-all duration-200 placeholder:text-neutral-400"
            disabled={isLoading}
            aria-describedby="answer-help"
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                handleSubmit();
              }
            }}
          />
          <div id="answer-help" className="sr-only">
            Enter the answer you want to verify for factual accuracy
          </div>
        </div>
      </fieldset>

      <Button
        onClick={handleSubmit}
        disabled={isLoading || !answer}
        size="sm"
        variant="secondary"
        className={cn(
          "h-8 border py-2 font-medium text-neutral-700 text-sm transition-all",
          "absolute right-3.5 bottom-3.5 bg-white",
          "hover:bg-neutral-50 hover:shadow-md",
          isLoading ? "opacity-70" : "!pr-1.5"
        )}
        aria-label={
          isLoading
            ? "Verification in progress"
            : "Start fact-checking verification"
        }
        type="submit"
      >
        {isLoading ? (
          <>
            <div
              className="animate-spin size-4 rounded-full border-3 border-neutral-700 border-dashed"
              aria-hidden="true"
            />
            <span className="sr-only">Verifying...</span>
          </>
        ) : (
          <>
            <span>Verify</span>
            <ChevronRight className="size-4" aria-hidden="true" />
          </>
        )}
      </Button>
    </motion.section>
  );
};

"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useFactCheckerInput } from "@/lib/store";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ChevronRight, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export const InputSection = () => {
  const {
    question,
    setQuestion,
    answer,
    setAnswer,
    isLoading,
    startVerification,
  } = useFactCheckerInput();

  const searchParams = useSearchParams();

  useEffect(() => {
    const questionFromUrl = searchParams.get("q");
    const answerFromUrl = searchParams.get("a");

    let processedQuestion = false;
    let processedAnswer = false;

    if (questionFromUrl) {
      try {
        const decodedQuestion = decodeURIComponent(questionFromUrl);
        setQuestion(decodedQuestion);
        processedQuestion = true;
      } catch (e) {
        console.error("Failed to decode question from URL:", e);
        setQuestion("(Error decoding question)"); // Set error placeholder
      }
    }

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

    if (processedAnswer && !processedQuestion && !questionFromUrl)
      setQuestion("(No Question Provided)");

    if (questionFromUrl || answerFromUrl) {
      void startVerification();
    }
  }, [searchParams, setAnswer, setQuestion, startVerification]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="relative"
    >
      <Input
        type="text"
        placeholder="Ask a wild question (e.g., 'Did Einstein actually say that quote on Facebook?')"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        className="rounded-b-none border-neutral-200 bg-white text-sm transition-all duration-200 placeholder:text-neutral-400"
        disabled={isLoading}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !isLoading && question && answer) {
            startVerification();
          }
        }}
      />

      <Textarea
        placeholder="Drop that sus answer here (e.g., 'Einstein definitely said we'd have flying cars by 2020, trust me bro')"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        className="peer max-h-32 min-h-32 w-full max-w-5xl resize-none whitespace-pre-wrap rounded-t-none border-neutral-200 border-t-0 bg-white pr-20 text-sm transition-all duration-200 placeholder:text-neutral-400"
        disabled={isLoading}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !isLoading && question && answer) {
            startVerification();
          }
        }}
      />

      <Button
        onClick={startVerification}
        disabled={isLoading || !question || !answer}
        size="sm"
        variant="secondary"
        className={cn(
          "h-8 border py-2 font-medium text-neutral-700 text-sm transition-all",
          "absolute right-3.5 bottom-3.5 bg-white",
          "hover:bg-neutral-50 hover:shadow-md",
          isLoading ? "opacity-70" : "!pr-1.5"
        )}
      >
        {isLoading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <>
            <span>Verify</span>
            <ChevronRight className="size-4" />
          </>
        )}
      </Button>
    </motion.div>
  );
};

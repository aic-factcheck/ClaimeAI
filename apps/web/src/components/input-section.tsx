"use client";

import NumberFlow from "@number-flow/react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowUpIcon, type ArrowUpIconHandle } from "@/components/ui/icons";
import { MAX_INPUT_LIMIT } from "@/lib/constants";
import { useFactCheckerInput } from "@/lib/store";
import { cn, generateCheckId } from "@/lib/utils";

const useInputHandler = () => {
  const { answer, setAnswer, isLoading, startVerification, resetState } =
    useFactCheckerInput();
  const [isLimitReached, setLimitReached] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const answerFromUrl = searchParams.get("a");
    if (answerFromUrl) {
      try {
        const decodedAnswer = decodeURIComponent(answerFromUrl);
        setAnswer(decodedAnswer);
      } catch (e) {
        console.error("Failed to decode answer from URL:", e);
        setAnswer("(Error decoding answer)");
      }
    }
  }, [router, setAnswer]);

  const characterCount = answer.length;
  const isOverLimit = characterCount >= MAX_INPUT_LIMIT;
  const isNearLimit = characterCount > MAX_INPUT_LIMIT * 0.8 && !isOverLimit;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const text = e.target.value;
      if (text.length > MAX_INPUT_LIMIT) {
        setAnswer(text.slice(0, MAX_INPUT_LIMIT));
        setLimitReached(true);
        setTimeout(() => setLimitReached(false), 500);
      } else {
        setAnswer(text);
      }
    },
    [setAnswer]
  );

  const handleSubmit = useCallback(async () => {
    if (!isLoading && answer && !isOverLimit) {
      try {
        const checkId = generateCheckId(answer);
        await startVerification(answer, checkId);
        router.push(`/checks/${checkId}?new=true`);
      } catch (error) {
        console.error("Failed to start verification:", error);
      }
    }
  }, [isLoading, answer, isOverLimit, startVerification, router]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  return {
    answer,
    isLoading,
    characterCount,
    isOverLimit,
    isNearLimit,
    isLimitReached,
    handleChange,
    handleKeyDown,
    handleSubmit,
  };
};

type CharacterCounterProps = {
  count: number;
  isLimitReached: boolean;
  isOverLimit: boolean;
  isNearLimit: boolean;
};

const CharacterCounter = ({
  count,
  isLimitReached,
  isOverLimit,
  isNearLimit,
}: CharacterCounterProps) => (
  <motion.div
    animate={{
      x: isLimitReached ? [-1, 1, -1, 1, 0] : 0,
    }}
    className="flex items-center gap-1.5 pl-2 text-xs"
    transition={{ duration: 0.3, ease: "easeInOut" }}
  >
    <NumberFlow
      className={cn(
        "font-medium tabular-nums transition-colors",
        isOverLimit
          ? "text-red-500"
          : isNearLimit
          ? "text-amber-500"
          : "text-neutral-400"
      )}
      value={count}
    />
    <span className="text-neutral-300">/</span>
    <span className="font-medium text-neutral-400">
      {MAX_INPUT_LIMIT.toLocaleString()}
    </span>
  </motion.div>
);

type SubmitButtonProps = {
  isLoading: boolean;
  isDisabled: boolean;
  onSubmit: () => void;
};

const SubmitButton = ({
  isLoading,
  isDisabled,
  onSubmit,
}: SubmitButtonProps) => {
  const arrowIconRef = useRef<ArrowUpIconHandle>(null);

  const handleMouseEnter = () => arrowIconRef.current?.startAnimation();
  const handleMouseLeave = () => arrowIconRef.current?.stopAnimation();

  return (
    <Button
      className="size-8 border border-transparent bg-neutral-800 transition-all hover:bg-neutral-700 disabled:border-neutral-400/60 disabled:bg-neutral-100 disabled:text-neutral-500"
      disabled={isLoading || isDisabled}
      onClick={onSubmit}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      size="icon"
    >
      {isLoading ? (
        <div className="size-4 animate-spin rounded-full border-2 border-neutral-700 border-t-transparent" />
      ) : (
        <ArrowUpIcon ref={arrowIconRef} />
      )}
    </Button>
  );
};

export const InputSection = () => {
  const {
    answer,
    isLoading,
    characterCount,
    isOverLimit,
    isNearLimit,
    isLimitReached,
    handleChange,
    handleKeyDown,
    handleSubmit,
  } = useInputHandler();

  return (
    <motion.section
      animate={{ opacity: 1 }}
      className="relative max-h-32 min-h-32 w-full rounded-xl border bg-white p-2"
      initial={{ opacity: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <textarea
        className={cn(
          "w-full max-w-5xl resize-none rounded-sm border-neutral-200 bg-white pr-20 pb-8 text-sm transition-colors placeholder:text-neutral-400",
          "focus:outline-none focus:ring-0",
          isOverLimit && "border-red-200 focus:border-red-300"
        )}
        disabled={isLoading}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Drop any claim here to see if it stands up to the facts..."
        value={answer}
      />
      <div className="flex items-center justify-between bg-white">
        <CharacterCounter
          count={characterCount}
          isLimitReached={isLimitReached}
          isNearLimit={isNearLimit}
          isOverLimit={isOverLimit}
        />
        <SubmitButton
          isDisabled={!answer || isOverLimit}
          isLoading={isLoading}
          onSubmit={handleSubmit}
        />
      </div>
    </motion.section>
  );
};

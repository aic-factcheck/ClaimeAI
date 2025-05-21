import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useFactCheckerInput } from "@/lib/store";
import { motion } from "framer-motion";
import { Loader2, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export const InputSection = () => {
  const {
    question,
    setQuestion,
    answer,
    setAnswer,
    isLoading,
    startVerification,
  } = useFactCheckerInput();

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
        className="border-neutral-200 bg-white text-sm placeholder:text-neutral-400 transition-all duration-200 rounded-b-none"
        disabled={isLoading}
      />

      <Textarea
        placeholder="Drop that sus answer here (e.g., 'Einstein definitely said we'd have flying cars by 2020, trust me bro')"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        className="peer border-neutral-200 bg-white text-sm placeholder:text-neutral-400 transition-all duration-200 resize-none rounded-t-none border-t-0 min-h-32 max-h-32 w-full whitespace-pre-wrap max-w-5xl pr-20"
        disabled={isLoading}
      />

      <Button
        onClick={startVerification}
        disabled={isLoading}
        size="sm"
        variant="secondary"
        className={cn(
          "py-2 text-sm font-medium h-8 transition-all border text-neutral-700",
          "absolute bottom-3.5 right-3.5 bg-white",
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

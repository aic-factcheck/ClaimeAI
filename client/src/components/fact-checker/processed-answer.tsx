import { Citation } from "@/components/ui/citation";
import { Verdict } from "@/lib/event-schema";
import { ContextualSentence } from "@/lib/store";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ProcessedAnswerProps {
  sentenceEntries: Array<
    [
      number,
      {
        original: ContextualSentence;
        selected: any[];
        disambiguated: any[];
        potentialClaims: any[];
        validatedClaims: any[];
        verdicts: Verdict[];
      }
    ]
  >;
  isLoading: boolean;
  activeSentenceId: number;
  expandedCitation: number | null;
  setExpandedCitation: (id: number | null) => void;
}

const getVerdictAccentColor = (result: string): string => {
  switch (result) {
    case "Supported":
      return "border-l-2 border-l-green-500";
    case "Refuted":
      return "border-l-2 border-l-red-500";
    case "Insufficient Information":
      return "border-l-2 border-l-yellow-500";
    case "Conflicting Evidence":
      return "border-l-2 border-l-purple-500";
    default:
      return "";
  }
};

export const ProcessedAnswer = ({
  sentenceEntries,
  isLoading,
  activeSentenceId,
  expandedCitation,
  setExpandedCitation,
}: ProcessedAnswerProps) => {
  if (sentenceEntries.length === 0)
    return (
      <p className="text-neutral-500 py-4">No processed answer available yet.</p>
    );

  return (
    <div className="text-neutral-900 leading-relaxed text-sm flex flex-wrap items-baseline gap-x-1.5 gap-y-1">
      {sentenceEntries.map(([id, data], idx) => {
        const hasDerivatives =
          data.selected.length > 0 ||
          data.disambiguated.length > 0 ||
          data.potentialClaims.length > 0 ||
          data.validatedClaims.length > 0 ||
          data.verdicts.length > 0;

        const verdict = data.verdicts[0];
        const verdictColor = verdict
          ? getVerdictAccentColor(verdict.result)
          : "";

        const isActive = isLoading && id === activeSentenceId;

        return (
          <motion.button
            key={id}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: idx * 0.02 }}
            className={cn(
              "transition-colors duration-200",
              isActive
                ? "bg-blue-100/50 border-l-[3px] border-l-blue-500 rounded-md px-2 py-1.5 inline-block"
                : hasDerivatives
                ? `bg-neutral-100/60 ${verdictColor} rounded-md px-2 py-1.5 inline-block hover:bg-neutral-200/60`
                : "text-neutral-700 border border-dashed border-neutral-300 rounded-md px-2 py-1.5 inline-block",
            )}
            onClick={() =>
              setExpandedCitation(expandedCitation === idx ? null : idx)
            }
          >
            {data.original.text}
            {hasDerivatives && (
              <Citation
                id={idx}
                sentenceData={data}
                isExpanded={expandedCitation === idx}
                onClick={() =>
                  setExpandedCitation(expandedCitation === idx ? null : idx)
                }
              />
            )}
            {idx < sentenceEntries.length - 1 && " "}
          </motion.button>
        );
      })}
    </div>
  );
};

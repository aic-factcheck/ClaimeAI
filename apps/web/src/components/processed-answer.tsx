import { motion } from "framer-motion";
import { Citation } from "@/components/ui/citation";
import type { Verdict } from "@/lib/event-schema";
import type {
  ContextualSentence,
  DisambiguatedContentData,
  PotentialClaimData,
  SelectedContentData,
} from "@/lib/store";
import { cn } from "@/lib/utils";
import type { UIValidatedClaim } from "@/types";

interface ProcessedAnswerProps {
  sentenceEntries: [
    number,
    {
      original: ContextualSentence;
      selected: SelectedContentData[];
      disambiguated: DisambiguatedContentData[];
      potentialClaims: PotentialClaimData[];
      validatedClaims: UIValidatedClaim[];
      verdicts: Verdict[];
    },
  ][];
  expandedCitation: number | null;
  setExpandedCitation: (id: number | null) => void;
}

const getVerdictAccentColor = (result?: string): string => {
  if (!result) return "";

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

const getVerdictColorForSentence = (verdicts: Verdict[]): string => {
  if (verdicts.length === 0) return "";

  const results = verdicts.map((v) => v.result).filter(Boolean) as string[];
  if (results.length === 0) return "";

  const priorityOrder: string[] = [
    "Refuted",
    "Insufficient Information",
    "Supported",
  ];

  for (const priority of priorityOrder) {
    if (results.includes(priority)) {
      return getVerdictAccentColor(priority);
    }
  }

  const uniqueResults = [...new Set(results)];
  if (uniqueResults.length === 1) {
    return getVerdictAccentColor(uniqueResults[0]);
  }

  return getVerdictAccentColor("Conflicting Evidence");
};

export const ProcessedAnswer = ({
  sentenceEntries,
  expandedCitation,
  setExpandedCitation,
}: ProcessedAnswerProps) => {
  if (sentenceEntries.length === 0)
    return (
      <p className="py-4 text-neutral-500">
        No claims available yet.
      </p>
    );

  return (
    <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-1 text-neutral-900 text-sm leading-relaxed">
      {sentenceEntries.map(([id, data], idx) => {
        const hasDerivatives = [
          data.selected,
          data.disambiguated,
          data.potentialClaims,
          data.validatedClaims,
          data.verdicts,
        ].some((arr) => arr.length > 0);

        const verdictColor = getVerdictColorForSentence(data.verdicts);

        return (
          <motion.button
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "text-start transition-colors duration-200",
              hasDerivatives
                ? `border bg-white ${verdictColor} inline-block rounded-md px-2 py-1.5 hover:bg-neutral-200/60`
                : "inline-block rounded-md border border-neutral-300 border-dashed px-2 py-1.5 text-neutral-700"
            )}
            initial={{ opacity: 0, y: 5 }}
            key={id}
            onClick={() =>
              setExpandedCitation(expandedCitation === idx ? null : idx)
            }
            transition={{ duration: 0.2, delay: Math.min(idx * 0.02, 1) }}
          >
            {data.original.text}
            {hasDerivatives && (
              <Citation
                id={idx}
                isExpanded={expandedCitation === idx}
                onClick={() =>
                  setExpandedCitation(expandedCitation === idx ? null : idx)
                }
                sentenceData={data}
              />
            )}
            {idx < sentenceEntries.length - 1 && " "}
          </motion.button>
        );
      })}
    </div>
  );
};

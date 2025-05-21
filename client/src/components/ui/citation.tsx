import { Verdict } from "@/lib/event-schema";
import { AnimatePresence, motion } from "framer-motion";
import React from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { VerdictBadge } from "./verdict-badge";
import {
  FileText,
  Search,
  FileQuestion,
  ClipboardCheck,
  Scale,
  LucideIcon,
} from "lucide-react";

interface CitationProps {
  id: number;
  sentenceData: any;
  isExpanded: boolean;
  onClick: () => void;
}

interface CitationSectionProps {
  title: string;
  items: any[];
  delay: number;
  icon: LucideIcon;
  renderItem: (item: any, idx: number) => React.ReactNode;
}

const CitationSection = ({
  title,
  items,
  delay,
  icon: Icon,
  renderItem,
}: CitationSectionProps) =>
  items.length > 0 && (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay }}
    >
      <div className="flex items-center gap-1.5 mb-1.5">
        <Icon className="w-3.5 h-3.5 text-neutral-500" />
        <h5 className="text-xs font-medium text-neutral-600">{title}</h5>
      </div>
      <div
        className={cn(
          "text-xs bg-neutral-50 p-2.5 rounded-md border border-neutral-200 leading-relaxed px-0",
          title === "Verdicts" && "p-0 bg-transparent border-0 space-y-2"
        )}
      >
        {items.map(renderItem)}
      </div>
    </motion.div>
  );

export const Citation = ({
  id,
  sentenceData,
  isExpanded,
  onClick,
}: CitationProps) => (
  <Popover open={isExpanded} onOpenChange={(open) => onClick()}>
    <PopoverTrigger asChild>
      <motion.span
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        className={cn(
          "cursor-pointer ml-1 mb-1 text-neutral-800 text-mono text-xs hover:text-neutral-700 transition-colors"
        )}
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.95 }}
      >
        [{id + 1}]
      </motion.span>
    </PopoverTrigger>
    <PopoverContent
      side="top"
      className={cn("w-[320px] max-w-[calc(100vw-2rem)] p-0")}
      align="start"
      sideOffset={6}
    >
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="w-full"
          >
            <div className="max-h-[350px] overflow-y-auto">
              <h4 className="text-xs font-semibold text-neutral-900 p-2 border-b border-neutral-100">
                Citation [{id + 1}]
              </h4>

              <div className="space-y-3 p-2">
                <CitationSection
                  title="Selected"
                  items={sentenceData.selected}
                  delay={0.05}
                  icon={FileText}
                  renderItem={(item, idx) => (
                    <div
                      key={idx}
                      className="p-2 pt-2 first:pt-0 last:pb-0 text-neutral-900 border-b last:border-b-0"
                    >
                      {item.processedText || item.claimText}
                    </div>
                  )}
                />

                <CitationSection
                  title="Disambiguated"
                  items={sentenceData.disambiguated}
                  delay={0.1}
                  icon={Search}
                  renderItem={(item, idx) => (
                    <div
                      key={idx}
                      className="p-2 pt-2 first:pt-0 last:pb-0 text-neutral-900 border-b last:border-b-0"
                    >
                      {item.disambiguatedText}
                    </div>
                  )}
                />

                <CitationSection
                  title="Potential Claims"
                  items={sentenceData.potentialClaims}
                  delay={0.15}
                  icon={FileQuestion}
                  renderItem={(item, idx) => (
                    <div
                      key={idx}
                      className="p-2 pt-2 first:pt-0 last:pb-0 text-neutral-900 border-b last:border-b-0"
                    >
                      {item.claim.claimText}
                    </div>
                  )}
                />

                <CitationSection
                  title="Validated Claims"
                  items={sentenceData.validatedClaims}
                  delay={0.2}
                  icon={ClipboardCheck}
                  renderItem={(item, idx) => (
                    <div
                      key={idx}
                      className="p-2 pt-2 first:pt-0 last:pb-0 text-neutral-900 border-b last:border-b-0"
                    >
                      {item.claim_text || item.claimText}
                    </div>
                  )}
                />

                <CitationSection
                  title="Verdicts"
                  items={sentenceData.verdicts}
                  delay={0.25}
                  icon={Scale}
                  renderItem={(verdict: Verdict, idx) => (
                    <div
                      key={idx}
                      className="text-xs bg-neutral-50 rounded-md border border-neutral-200 overflow-hidden"
                    >
                      <div className="p-2.5">
                        <div className="mb-2">
                          <VerdictBadge verdict={verdict} />
                        </div>
                        <p className="text-xs text-neutral-900 font-medium mb-2">
                          {verdict.claim_text}
                        </p>
                        <p className="text-xs text-neutral-500 leading-relaxed">
                          {verdict.reasoning}
                        </p>
                        {verdict.sources.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-neutral-100">
                            <div className="text-xs font-medium text-neutral-500 mb-1">
                              Sources:
                            </div>
                            <div className="space-y-1">
                              {verdict.sources.map((source, sidx) => (
                                <div
                                  key={sidx}
                                  className="text-xs text-blue-600"
                                >
                                  <a
                                    href={source.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:underline"
                                  >
                                    {source.title || source.url}
                                  </a>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </PopoverContent>
  </Popover>
);

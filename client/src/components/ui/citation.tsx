import { Verdict } from "@/lib/event-schema";
import { AnimatePresence, motion } from "framer-motion";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { VerdictBadge } from "./verdict-badge";

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
  renderItem: (item: any, idx: number) => React.ReactNode;
}

const CitationSection = ({
  title,
  items,
  delay,
  renderItem,
}: CitationSectionProps) =>
  items.length > 0 && (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay }}
    >
      <h5 className="text-xs font-medium text-gray-600 mb-1.5">{title}</h5>
      <div
        className={cn(
          "text-xs bg-gray-50 p-2.5 rounded-md border border-gray-200 leading-relaxed px-0",
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
      <motion.sup
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        className={cn(
          "cursor-pointer mx-0.5 text-blue-500 font-medium hover:text-blue-700 transition-colors"
        )}
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.95 }}
      >
        [{id + 1}]
      </motion.sup>
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
              <h4 className="text-xs font-semibold text-gray-900 p-2 border-b border-gray-100">
                Citation [{id + 1}]
              </h4>

              <div className="space-y-3 p-2">
                <CitationSection
                  title="Selected"
                  items={sentenceData.selected}
                  delay={0.05}
                  renderItem={(item, idx) => (
                    <div key={idx} className="p-2 pt-2 first:pt-0 last:pb-0 text-gray-900 border-b last:border-b-0">
                      {item.processedText || item.claimText}
                    </div>
                  )}
                />

                <CitationSection
                  title="Disambiguated"
                  items={sentenceData.disambiguated}
                  delay={0.1}
                  renderItem={(item, idx) => (
                    <div key={idx} className="p-2 pt-2 first:pt-0 last:pb-0 text-gray-900 border-b last:border-b-0">
                      {item.disambiguatedText}
                    </div>
                  )}
                />

                <CitationSection
                  title="Potential Claims"
                  items={sentenceData.potentialClaims}
                  delay={0.15}
                  renderItem={(item, idx) => (
                    <div key={idx} className="p-2 pt-2 first:pt-0 last:pb-0 text-gray-900 border-b last:border-b-0">
                      {item.claim.claimText}
                    </div>
                  )}
                />

                <CitationSection
                  title="Validated Claims"
                  items={sentenceData.validatedClaims}
                  delay={0.2}
                  renderItem={(item, idx) => (
                    <div key={idx} className="p-2 pt-2 first:pt-0 last:pb-0 text-gray-900 border-b last:border-b-0">
                      {item.claim_text || item.claimText}
                    </div>
                  )}
                />

                <CitationSection
                  title="Verdicts"
                  items={sentenceData.verdicts}
                  delay={0.25}
                  renderItem={(verdict: Verdict, idx) => (
                    <div
                      key={idx}
                      className="text-xs bg-gray-50 rounded-md border border-gray-200 overflow-hidden"
                    >
                      <div className="p-2.5">
                        <div className="mb-2">
                          <VerdictBadge verdict={verdict} />
                        </div>
                        <p className="text-xs text-gray-900 font-medium mb-2">
                          {verdict.claim_text}
                        </p>
                        <p className="text-xs text-gray-500 leading-relaxed">
                          {verdict.reasoning}
                        </p>
                        {verdict.sources.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-gray-100">
                            <div className="text-xs font-medium text-gray-500 mb-1">
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

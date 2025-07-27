import { AnimatePresence, motion } from "framer-motion";
import {
  ClipboardCheck,
  FileQuestion,
  FileText,
  type LucideIcon,
  Quote,
  Scale,
  Search,
} from "lucide-react";
import type React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { Verdict } from "@/lib/event-schema";
import { cn } from "@/lib/utils";
import { VerdictBadge } from "./verdict-badge";

interface CitationProps {
  id: number;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  sentenceData: any;
  isExpanded: boolean;
  onClick: () => void;
}

interface CitationSectionProps {
  title: string;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  items: any[];
  delay: number;
  icon: LucideIcon;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
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
      animate={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: 5 }}
      transition={{ duration: 0.2, delay }}
    >
      <div className="mb-1.5 flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5 text-neutral-500" />
        <h5 className="font-medium text-neutral-600 text-sm">{title}</h5>
      </div>
      <div
        className={cn(
          "rounded-md border border-neutral-200 bg-neutral-50 p-2.5 px-0 text-xs leading-relaxed",
          title === "Verdicts" && "space-y-2 border-0 bg-transparent p-0"
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
  <Sheet
    onOpenChange={(open) => {
      if (!open) onClick();
    }}
    open={isExpanded}
  >
    <SheetTrigger asChild>
      <motion.span
        className={cn(
          "mb-1 ml-1 cursor-pointer text-mono text-neutral-800 text-xs transition-colors hover:text-neutral-700"
        )}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.95 }}
      >
        [{id + 1}]
      </motion.span>
    </SheetTrigger>
    <SheetContent
      className="w-full min-w-md max-w-md gap-0 shadow-none h-[calc(100vh-17px)] my-auto mr-2 rounded-r-2xl"
      onClick={(e) => e.stopPropagation()}
      side="right"
    >
      <SheetHeader className="border-b">
        <SheetTitle className="flex items-center gap-2 text-left">
          <Quote className="h-4 w-4 text-neutral-600" />
          Claim Source <i className="-ml-1 mb-2 text-xs">{id + 1}</i>
        </SheetTitle>
      </SheetHeader>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            animate={{ opacity: 1, x: 0 }}
            className="no-scrollbar flex-1 overflow-y-auto"
            exit={{ opacity: 0, x: 20 }}
            initial={{ opacity: 0, x: 20 }}
            onClick={(e) => e.stopPropagation()}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="space-y-4 p-4">
              <CitationSection
                delay={0.2}
                icon={ClipboardCheck}
                items={sentenceData.validatedClaims}
                renderItem={(item, idx) => (
                  <div
                    className="border-b p-3 pt-3 text-neutral-900 first:pt-0 last:border-b-0 last:pb-0"
                    key={idx}
                  >
                    {item.claim_text || item.claimText}
                  </div>
                )}
                title="Extracted Claims"
              />

              <CitationSection
                delay={0.25}
                icon={Scale}
                items={sentenceData.verdicts}
                renderItem={(verdict: Verdict, idx) => (
                  <div
                    className="overflow-hidden rounded-md border border-neutral-200 bg-neutral-50 text-sm"
                    key={idx}
                  >
                    <div className="p-4">
                      <div className="mb-3">
                        <VerdictBadge verdict={verdict} />
                      </div>
                      <p className="mb-3 font-medium text-neutral-900 text-sm">
                        {verdict.claim_text}
                      </p>
                      <p className="text-neutral-500 text-sm leading-relaxed">
                        {verdict.reasoning}
                      </p>
                      {verdict.sources.length > 0 && (
                        <div className="mt-3 border-neutral-100 border-t pt-3">
                          <div className="mb-2 font-medium text-neutral-500 text-sm">
                            Sources:
                          </div>
                          <div className="space-y-2">
                            {verdict.sources.map((source, sidx) => (
                              <div
                                className="text-blue-600 text-sm"
                                key={`${source.url}-${sidx}`}
                              >
                                <a
                                  className="hover:underline"
                                  href={source.url}
                                  rel="noopener noreferrer"
                                  target="_blank"
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
                title="Verdicts"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </SheetContent>
  </Sheet>
);

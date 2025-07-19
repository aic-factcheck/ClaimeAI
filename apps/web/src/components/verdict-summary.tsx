import { motion } from "framer-motion";
import { Link as LinkIcon, PlusCircle } from "lucide-react";
import Image from "next/image";
import { memo } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { VerdictBadge } from "@/components/ui/verdict-badge";
import type { Verdict } from "@/lib/event-schema";
import { cn, extractDomain } from "@/lib/utils";

interface VerdictSummaryProps {
  verdicts: Verdict[];
  isLoading: boolean;
}

const MAX_VISIBLE_SOURCES = 4;

const SourceFavicon = ({ url }: { url: string }) => {
  const domain = extractDomain(url);
  const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=16`;

  return (
    <div className="relative h-3.5 w-3.5 flex-shrink-0 overflow-hidden rounded-[2px]">
      <Image
        alt={`${domain} favicon`}
        className="h-full w-full object-cover"
        height={14}
        onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
          const parent = e.currentTarget.parentNode as HTMLElement | null;
          if (parent) {
            parent.innerHTML = `
              <div class="w-full h-full flex items-center justify-center bg-neutral-200 text-[8px] font-medium text-neutral-700">
                ${domain.charAt(0).toUpperCase()}
              </div>
            `;
          }
        }}
        src={faviconUrl}
        width={14}
      />
    </div>
  );
};

export const VerdictSummary = memo(function VerdictSummary({
  verdicts,
  isLoading,
}: VerdictSummaryProps) {
  if (verdicts.length === 0) return null;

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="mt-6"
      initial={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.2 }}
    >
      <Accordion collapsible defaultValue="fact-check-summary" type="single">
        <AccordionItem className="border-none" value="fact-check-summary">
          <AccordionTrigger className="px-0 py-2 hover:no-underline">
            <div className="flex items-center font-medium text-neutral-900 text-sm">
              Fact Check Summary
              {isLoading && (
                <motion.span
                  animate={{ opacity: 1, x: 0 }}
                  className="ml-2 font-normal text-neutral-500 text-xs"
                  initial={{ opacity: 0, x: -5 }}
                >
                  Processing...
                </motion.span>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-0 pb-0">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {verdicts.map((verdict, idx) => {
                const visibleSources = verdict.sources.slice(
                  0,
                  MAX_VISIBLE_SOURCES
                );
                const hiddenSources =
                  verdict.sources.slice(MAX_VISIBLE_SOURCES);
                const remainingSourcesCount = hiddenSources.length;

                return (
                  <motion.div
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "rounded-lg border border-neutral-200 border-dashed bg-white p-3 shadow-xs transition-all dark:border-neutral-800 dark:bg-neutral-900/90"
                    )}
                    initial={{ opacity: 0, y: 5 }}
                    key={`verdict-${verdict.claim_text.slice(0, 20)}-${idx}`}
                    transition={{ duration: 0.2, delay: idx * 0.05 }}
                  >
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <VerdictBadge verdict={verdict} />
                      {verdict.sources && verdict.sources.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5">
                          {visibleSources.map((source, sourceIdx) => (
                            <a
                              aria-label={`View source: ${
                                source.title || source.url
                              } (opens in new tab)`}
                              className="flex items-center gap-1 rounded-sm border border-neutral-300 p-1 transition-all hover:border-neutral-400 hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                              href={source.url}
                              key={`${source.url}-${sourceIdx}-visible`}
                              rel="noopener noreferrer"
                              target="_blank"
                              title={source.title || source.url}
                            >
                              <SourceFavicon url={source.url} />
                            </a>
                          ))}
                          {remainingSourcesCount > 0 && (
                            <Popover>
                              <PopoverTrigger asChild>
                                <button
                                  aria-label={`Show ${remainingSourcesCount} more sources`}
                                  className="flex h-6 w-6 items-center justify-center rounded-sm border border-neutral-300 bg-neutral-100 text-neutral-500 transition-all hover:border-neutral-400 hover:bg-neutral-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                  type="button"
                                >
                                  <PlusCircle className="h-3.5 w-3.5" />
                                </button>
                              </PopoverTrigger>
                              <PopoverContent
                                align="end"
                                className="w-auto max-w-xs p-2"
                                side="top"
                              >
                                <div className="space-y-1.5">
                                  <p className="font-medium text-neutral-600 text-xs">
                                    Additional Sources
                                  </p>
                                  {hiddenSources.map((source, sourceIdx) => (
                                    <a
                                      aria-label={`View source: ${
                                        source.title || source.url
                                      } (opens in new tab)`}
                                      className="flex items-center gap-2 rounded-md p-1.5 text-neutral-700 text-xs transition-colors hover:bg-neutral-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                      href={source.url}
                                      key={`${source.url}-${sourceIdx}-hidden`}
                                      rel="noopener noreferrer"
                                      target="_blank"
                                      title={source.title || source.url}
                                    >
                                      <SourceFavicon url={source.url} />
                                      <span className="truncate">
                                        {source.title ||
                                          extractDomain(source.url)}
                                      </span>
                                      <LinkIcon className="ml-auto h-3 w-3 flex-shrink-0 text-neutral-400" />
                                    </a>
                                  ))}
                                </div>
                              </PopoverContent>
                            </Popover>
                          )}
                        </div>
                      )}
                    </div>
                    <p className="mb-1.5 font-medium text-neutral-900 text-sm">
                      {verdict.claim_text}
                    </p>
                    {verdict.reasoning && (
                      <p className="text-neutral-600 text-xs leading-relaxed">
                        {verdict.reasoning}
                      </p>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </motion.div>
  );
});

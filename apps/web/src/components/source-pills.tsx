import { ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import type { Evidence, Verdict } from "@/lib/event-schema";
import { cn, extractDomain } from "@/lib/utils";

interface SourcePillsProps {
  verdicts: Verdict[];
  maxSources?: number;
}

export const SourcePills = ({ verdicts, maxSources = 7 }: SourcePillsProps) => {
  const [expanded, setExpanded] = useState(false);

  const uniqueSources = useMemo(() => {
    const sources = new Map<string, Evidence>();

    for (const verdict of verdicts) {
      for (const source of verdict.sources) {
        if (!sources.has(source.url)) {
          sources.set(source.url, source);
        }
      }
    }

    return Array.from(sources.values());
  }, [verdicts]);

  if (uniqueSources.length === 0) {
    return null;
  }

  // Determine which sources to display
  const displaySources = expanded
    ? uniqueSources
    : uniqueSources.slice(0, maxSources);

  const hasMoreSources = uniqueSources.length > maxSources;
  const hiddenSourcesCount = uniqueSources.length - maxSources;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className="my-2.5 mt-6 font-medium text-sm">Sources</h3>
        {hasMoreSources && (
          <button
            className="flex items-center gap-1 text-neutral-500 text-xs transition-colors hover:text-neutral-900"
            onClick={() => setExpanded(!expanded)}
            type="button"
          >
            {expanded ? (
              <>
                <span>Show less</span>
                <ChevronUp className="h-3 w-3" />
              </>
            ) : (
              <>
                <span>Show all {uniqueSources.length}</span>
                <ChevronDown className="h-3 w-3" />
              </>
            )}
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {displaySources.map((source) => {
          const domain = extractDomain(source.url);
          const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=16`;
          const title = source.title || domain;

          return (
            <a
              className={cn(
                "flex items-center gap-1.5 px-2 py-0.5 text-xs",
                "rounded-md border border-neutral-200 bg-white text-neutral-700",
                "transition-all duration-150 ease-in-out",
                "hover:border-neutral-300 hover:bg-neutral-100 hover:shadow-sm",
                "focus:outline-none focus:ring-1 focus:ring-neutral-300"
              )}
              href={source.url}
              key={source.url}
              rel="noreferrer"
              target="_blank"
              title={title}
            >
              <div className="relative h-3.5 w-3.5 flex-shrink-0 overflow-hidden rounded-[2px]">
                <Image
                  alt=""
                  className="h-full w-full object-cover"
                  height={14}
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                    // Use first letter of domain as fallback
                    (e.currentTarget.parentNode as HTMLElement).innerHTML = `
                      <div class="w-full h-full flex items-center justify-center bg-neutral-200 text-[8px] font-medium text-neutral-700">
                        ${domain.charAt(0).toUpperCase()}
                      </div>
                    `;
                  }}
                  src={faviconUrl}
                  width={14}
                />
              </div>
              <span className="max-w-40 truncate font-medium">{title}</span>
              <ExternalLink className="h-2.5 w-2.5 flex-shrink-0 text-neutral-400" />
            </a>
          );
        })}

        {!expanded && hasMoreSources && (
          <button
            className={cn(
              "flex items-center gap-1 px-2 py-0.5 text-xs",
              "rounded-md border border-neutral-200 bg-neutral-50 text-neutral-500",
              "hover:border-neutral-300 hover:bg-neutral-100 hover:text-neutral-700",
              "transition-all duration-150 ease-in-out",
              "focus:outline-none focus:ring-1 focus:ring-neutral-300"
            )}
            onClick={() => setExpanded(true)}
            type="button"
          >
            +{hiddenSourcesCount} more
            <ChevronDown className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  );
};

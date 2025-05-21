import { useMemo, useState } from "react";
import { Verdict, Evidence } from "@/lib/event-schema";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp, ExternalLink } from "lucide-react";

interface SourcePillsProps {
  verdicts: Verdict[];
  maxSources?: number;
}

const extractDomain = (url: string): string => {
  try {
    const hostname = new URL(url).hostname;
    return hostname.startsWith("www.") ? hostname.substring(4) : hostname;
  } catch (e) {
    return url;
  }
};

export const SourcePills = ({ verdicts, maxSources = 7 }: SourcePillsProps) => {
  const [expanded, setExpanded] = useState(false);

  const uniqueSources = useMemo(() => {
    const sources = new Map<string, Evidence>();

    verdicts.forEach((verdict) => {
      verdict.sources.forEach((source) => {
        if (!sources.has(source.url)) {
          sources.set(source.url, source);
        }
      });
    });

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
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium my-2.5">Sources</h3>
        {hasMoreSources && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-gray-500 hover:text-gray-900 flex items-center gap-1 transition-colors"
          >
            {expanded ? (
              <>
                <span>Show less</span>
                <ChevronUp className="w-3 h-3" />
              </>
            ) : (
              <>
                <span>Show all {uniqueSources.length}</span>
                <ChevronDown className="w-3 h-3" />
              </>
            )}
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {displaySources.map((source, index) => {
          const domain = extractDomain(source.url);
          const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=16`;
          const title = source.title || domain;

          return (
            <a
              key={source.url}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              title={title}
              className={cn(
                "flex items-center gap-1.5 px-2 py-0.5 text-xs",
                "bg-gray-50 text-gray-700 border border-gray-200 rounded-md",
                "transition-all duration-150 ease-in-out",
                "hover:bg-gray-100 hover:border-gray-300 hover:shadow-sm",
                "focus:outline-none focus:ring-1 focus:ring-gray-300"
              )}
            >
              <div className="w-3.5 h-3.5 relative flex-shrink-0 overflow-hidden rounded-[2px]">
                <img
                  src={faviconUrl}
                  alt=""
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Use first letter of domain as fallback
                    (e.currentTarget.parentNode as HTMLElement).innerHTML = `
                      <div class="w-full h-full flex items-center justify-center bg-gray-200 text-[8px] font-medium text-gray-700">
                        ${domain.charAt(0).toUpperCase()}
                      </div>
                    `;
                  }}
                />
              </div>
              <span className="truncate font-medium">
                {title}
              </span>
              <ExternalLink className="w-2.5 h-2.5 text-gray-400 flex-shrink-0" />
            </a>
          );
        })}
        
        {!expanded && hasMoreSources && (
          <button
            onClick={() => setExpanded(true)}
            className={cn(
              "flex items-center gap-1 px-2 py-0.5 text-xs",
              "bg-gray-50 text-gray-500 border border-gray-200 rounded-md",
              "hover:bg-gray-100 hover:border-gray-300 hover:text-gray-700",
              "transition-all duration-150 ease-in-out",
              "focus:outline-none focus:ring-1 focus:ring-gray-300"
            )}
          >
            +{hiddenSourcesCount} more
            <ChevronDown className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
};

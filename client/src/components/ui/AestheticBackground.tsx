"use client";

import { useMemo } from "react";

const phrases = [
  "Extracting factual claims...",
  "Verifying entailment relationships.",
  "Analyzing claim decontextualization.",
  "Assessing factual coverage.",
  "Evaluating claim precision.",
  "Disambiguating reference ambiguity.",
  "Detecting linguistic ambiguity.",
  "Cross-referencing reliable sources.",
  "Computing verifiability metrics.",
  "Decomposing complex statements.",
  "Resolving structural ambiguity.",
  "Maximally clarifying context.",
  "Validating referential integrity.",
  "Verifying propositional entailment.",
  "Fact-checking in progress...",
  "Performing claim extraction.",
  "Decomposing for verification.",
  "Resolving temporal ambiguity.",
  "Evaluating claim atomicity.",
  "Checking source credibility.",
  "Measuring element-level coverage.",
  "Verifying factual precision.",
  "Claimify methodology active.",
  "Implementing entailment checks.",
  "Analyzing sentence elements.",
  "Computing MaxClarifiedSentence.",
  "Contextual sentence analysis.",
  "Applying SAFE methodology.",
  "Identifying check-worthy claims.",
  "Verifying objective information.",
  "Cross-referencing evidence sets.",
  "Applying the Statements and Actions Rule.",
  "Analyzing decomposed propositions.",
  "Evaluating factual evidence.",
  "Implementing verification protocol.",
  "Determining veracity assessment.",
  "Measuring factual accuracy.",
  "FActScore computation in progress.",
  "Evaluating for faithful representation.",
  "Maximizing decontextualization.",
];

const AestheticBackground = () => {
  const extendedPhrases = useMemo(() => {
    const base = Array(25)
      .fill(null)
      .flatMap(() => phrases);
    return base.map((phrase, index) => ({
      text: phrase,
      highlight: index % 6 === 0,
      opacity: (Math.random() * 0.35 + 0.08).toFixed(2),
      rotation: Math.random() > 0.8 ? Math.random() * 3 - 1.5 : 0,
    }));
  }, []);

  return (
    <div
      className="fixed inset-x-0 bottom-0 h-1/2 z-[-1] overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-gradient-to-t from-white/90 z-20 via-white/60 to-transparent"
          style={{
            maskImage: "linear-gradient(to top, black 60%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to top, black 60%, transparent 100%)",
          }}
        />
        <div className="relative h-full w-full p-3 md:p-5 lg:p-6">
          <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 xl:grid-cols-14 gap-x-0.5 gap-y-0.5">
            {extendedPhrases.map((item, index) => (
              <span
                key={index}
                className={`text-[9px] md:text-[10px] leading-tight select-none px-0.5
                  ${
                    item.highlight
                      ? "text-neutral-600 font-medium"
                      : "text-neutral-400"
                  }`}
                style={{
                  opacity: item.opacity,
                  transform: item.rotation
                    ? `rotate(${item.rotation}deg)`
                    : "none",
                }}
              >
                {item.text}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AestheticBackground;

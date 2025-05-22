import type { Verdict } from "@/lib/event-schema";
import type {
  ContextualSentence,
  DisambiguatedContentData,
  PotentialClaimData,
  SelectedContentData,
} from "@/lib/store";
import type { UIValidatedClaim } from "@/types";

// Define type for the map value to avoid 'any'
type SentenceData = {
  original: ContextualSentence;
  selected: SelectedContentData[];
  disambiguated: DisambiguatedContentData[];
  potentialClaims: PotentialClaimData[];
  validatedClaims: UIValidatedClaim[];
  verdicts: Verdict[];
};

// Helper function to create a map from original sentence ID to its derivatives
export const createDerivativesMap = (
  contextualSentences: ContextualSentence[],
  selectedContents: SelectedContentData[],
  disambiguatedContents: DisambiguatedContentData[],
  potentialClaims: PotentialClaimData[],
  validatedClaims: UIValidatedClaim[],
  claimVerdicts: Verdict[]
) => {
  const map = new Map<number, SentenceData>();

  // Initialize map with contextual sentences
  for (const sentence of contextualSentences) {
    map.set(sentence.id, {
      original: sentence,
      selected: [],
      disambiguated: [],
      potentialClaims: [],
      validatedClaims: [],
      verdicts: [],
    });
  }

  // Associate selected contents with original sentences
  for (const content of selectedContents) {
    const originalSentence = contextualSentences.find(
      (s) => s.text === content.originalSentenceText
    );
    if (originalSentence && map.has(originalSentence.id)) {
      const data = map.get(originalSentence.id);
      if (data) {
        data.selected.push(content);
      }
    }
  }

  // Associate disambiguated contents
  for (const content of disambiguatedContents) {
    const originalSentence = contextualSentences.find(
      (s) => s.text === content.originalSentenceText
    );
    if (originalSentence && map.has(originalSentence.id)) {
      const data = map.get(originalSentence.id);
      if (data) {
        data.disambiguated.push(content);
      }
    }
  }

  // Associate potential claims
  for (const claim of potentialClaims) {
    const originalSentence = contextualSentences.find(
      (s) => s.text === claim.originalSentenceText
    );
    if (originalSentence && map.has(originalSentence.id)) {
      const data = map.get(originalSentence.id);
      if (data) {
        data.potentialClaims.push(claim);
      }
    }
  }

  // Associate validated claims
  for (const claim of validatedClaims) {
    const originalSentenceId = claim.originalIndex;
    if (map.has(originalSentenceId)) {
      const data = map.get(originalSentenceId);
      if (data) {
        data.validatedClaims.push(claim);
      }
    }
  }

  // Associate verdicts
  for (const verdict of claimVerdicts) {
    const matchingValidatedClaim = validatedClaims.find(
      (vc) => vc.claimText === verdict.claim_text
    );

    if (matchingValidatedClaim) {
      const originalSentenceId = matchingValidatedClaim.originalIndex;
      if (map.has(originalSentenceId)) {
        const data = map.get(originalSentenceId);
        if (data) {
          data.verdicts.push(verdict);
        }
      }
    }
  }

  return map;
};

export const findActiveSentenceId = (
  isLoading: boolean,
  derivativesMap: ReturnType<typeof createDerivativesMap>,
  contextualSentences: ContextualSentence[],
  selectedContents: SelectedContentData[],
  disambiguatedContents: DisambiguatedContentData[],
  potentialClaims: PotentialClaimData[],
  validatedClaims: UIValidatedClaim[],
  claimVerdicts: Verdict[]
): number => {
  if (!isLoading) return -1;

  // Convert the map to an array for processing
  const sentenceEntries = Array.from(derivativesMap.entries());

  // Find the "active" stage based on available data
  const activeStageIndex = [
    claimVerdicts.length > 0,
    validatedClaims.length > 0,
    potentialClaims.length > 0,
    disambiguatedContents.length > 0,
    selectedContents.length > 0,
    contextualSentences.length > 0,
  ].findIndex((condition) => !condition);

  // If we're loading but have completed all stages, the last sentence is being worked on
  if (activeStageIndex === 0 && claimVerdicts.length > 0) {
    // If we're finalizing, look for sentences that have selected/disambiguated/claims but no verdicts
    const sentenceWithoutVerdict = sentenceEntries.find(
      ([_id, data]) =>
        (data.selected.length > 0 ||
          data.disambiguated.length > 0 ||
          data.potentialClaims.length > 0) &&
        data.verdicts.length === 0
    );

    if (sentenceWithoutVerdict) {
      return sentenceWithoutVerdict[0];
    }
  } else if (activeStageIndex === -1) {
    // If all conditions are true, we're still processing but have started all stages
    return sentenceEntries.at(-1)?.[0] || -1;
  } else {
    // We're at a specific stage, find the sentence that has preceding stage data but not current stage
    const stageMappings = [
      {
        check: (data: SentenceData) =>
          data.validatedClaims.length > 0 && data.verdicts.length === 0,
      },
      {
        check: (data: SentenceData) =>
          data.potentialClaims.length > 0 && data.validatedClaims.length === 0,
      },
      {
        check: (data: SentenceData) =>
          data.disambiguated.length > 0 && data.potentialClaims.length === 0,
      },
      {
        check: (data: SentenceData) =>
          data.selected.length > 0 && data.disambiguated.length === 0,
      },
      { check: (data: SentenceData) => data.selected.length === 0 },
    ];

    if (activeStageIndex < stageMappings.length) {
      const check = stageMappings[activeStageIndex].check;
      const activeSentence = sentenceEntries.find(([_id, data]) => check(data));

      if (activeSentence) {
        return activeSentence[0];
      }
    }
  }

  return -1;
};

export const getCurrentStageMessage = (
  claimVerdicts: Verdict[],
  validatedClaims: UIValidatedClaim[],
  potentialClaims: PotentialClaimData[],
  disambiguatedContents: DisambiguatedContentData[],
  selectedContents: SelectedContentData[]
): string => {
  if (claimVerdicts.length > 0) {
    return "Finalizing fact check report...";
  }

  if (validatedClaims.length > 0) {
    return "Verifying claims against reliable sources...";
  }

  if (potentialClaims.length > 0) {
    return "Validating potential claims...";
  }

  if (disambiguatedContents.length > 0) {
    return "Extracting factual claims from content...";
  }

  if (selectedContents.length > 0) {
    return "Disambiguating selected content...";
  }

  return "Analyzing answer sentences...";
};

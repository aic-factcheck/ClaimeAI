import { Verdict } from "@/lib/event-schema";
import {
  ContextualSentence,
  DisambiguatedContentData,
  PotentialClaimData,
  SelectedContentData,
} from "@/lib/store";
import { UIValidatedClaim } from "@/types";

// Helper function to create a map from original sentence ID to its derivatives
export const createDerivativesMap = (
  contextualSentences: ContextualSentence[],
  selectedContents: SelectedContentData[],
  disambiguatedContents: DisambiguatedContentData[],
  potentialClaims: PotentialClaimData[],
  validatedClaims: UIValidatedClaim[],
  claimVerdicts: Verdict[]
) => {
  const map = new Map<
    number,
    {
      original: ContextualSentence;
      selected: SelectedContentData[];
      disambiguated: DisambiguatedContentData[];
      potentialClaims: PotentialClaimData[];
      validatedClaims: UIValidatedClaim[];
      verdicts: Verdict[];
    }
  >();

  // Initialize map with contextual sentences
  contextualSentences.forEach((sentence) => {
    map.set(sentence.id, {
      original: sentence,
      selected: [],
      disambiguated: [],
      potentialClaims: [],
      validatedClaims: [],
      verdicts: [],
    });
  });

  // Associate selected contents with original sentences
  selectedContents.forEach((content) => {
    const originalSentence = contextualSentences.find(
      (s) => s.text === content.originalSentenceText
    );
    if (originalSentence && map.has(originalSentence.id)) {
      map.get(originalSentence.id)!.selected.push(content);
    }
  });

  // Associate disambiguated contents
  disambiguatedContents.forEach((content) => {
    const originalSentence = contextualSentences.find(
      (s) => s.text === content.originalSentenceText
    );
    if (originalSentence && map.has(originalSentence.id)) {
      map.get(originalSentence.id)!.disambiguated.push(content);
    }
  });

  // Associate potential claims
  potentialClaims.forEach((claim) => {
    const originalSentence = contextualSentences.find(
      (s) => s.text === claim.originalSentenceText
    );
    if (originalSentence && map.has(originalSentence.id)) {
      map.get(originalSentence.id)!.potentialClaims.push(claim);
    }
  });

  // Associate validated claims
  validatedClaims.forEach((claim) => {
    const originalSentenceId = claim.originalIndex;
    if (map.has(originalSentenceId)) {
      map.get(originalSentenceId)!.validatedClaims.push(claim);
    }
  });

  // Associate verdicts
  claimVerdicts.forEach((verdict) => {
    const matchingValidatedClaim = validatedClaims.find(
      (vc) => vc.claimText === verdict.claim_text
    );

    if (matchingValidatedClaim) {
      const originalSentenceId = matchingValidatedClaim.originalIndex;
      if (map.has(originalSentenceId)) {
        map.get(originalSentenceId)!.verdicts.push(verdict);
      }
    }
  });

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

  const sentenceEntries = Array.from(derivativesMap.entries());
  if (sentenceEntries.length === 0) {
    return -1;
  }

  const activeStageDeterminers = [
    claimVerdicts.length > 0,
    validatedClaims.length > 0,
    potentialClaims.length > 0,
    disambiguatedContents.length > 0,
    selectedContents.length > 0,
  ];
  const activeStageIndex = activeStageDeterminers.findIndex(
    (populated) => !populated
  );

  const stageMappings = [
    { check: (data: any) => data.validatedClaims.length > 0 && data.verdicts.length === 0 },
    { check: (data: any) => data.potentialClaims.length > 0 && data.validatedClaims.length === 0 },
    { check: (data: any) => data.disambiguated.length > 0 && data.potentialClaims.length === 0 },
    { check: (data: any) => data.selected.length > 0 && data.disambiguated.length === 0 },
    { check: (data: any) => data.selected.length === 0 },
  ];

  if (activeStageIndex === -1) {
    const sentenceWithoutVerdict = sentenceEntries.find(
      ([id, data]) =>
        (data.selected.length > 0 ||
          data.disambiguated.length > 0 ||
          data.potentialClaims.length > 0 ||
          data.validatedClaims.length > 0) &&
        data.verdicts.length === 0
    );
    if (sentenceWithoutVerdict) {
      return sentenceWithoutVerdict[0];
    }
    return sentenceEntries.length > 0 ? sentenceEntries[sentenceEntries.length - 1][0] : -1;

  } else if (activeStageIndex >= 0 && activeStageIndex < stageMappings.length) {
    const check = stageMappings[activeStageIndex].check;
    const activeSentence = sentenceEntries.find(([id, data]) => check(data));

    if (activeSentence) {
      return activeSentence[0];
    } else {
      return -1;
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
  } else if (validatedClaims.length > 0) {
    return "Verifying claims against reliable sources...";
  } else if (potentialClaims.length > 0) {
    return "Validating potential claims...";
  } else if (disambiguatedContents.length > 0) {
    return "Extracting factual claims from content...";
  } else if (selectedContents.length > 0) {
    return "Disambiguating selected content...";
  } else {
    return "Analyzing answer sentences...";
  }
};

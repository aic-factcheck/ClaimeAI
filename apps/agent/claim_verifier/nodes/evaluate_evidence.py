"""Evaluate evidence node - determines claim validity based on evidence.

Analyzes evidence snippets to assess if a claim is supported, refuted, or inconclusive.
"""

import logging
from typing import List

from pydantic import BaseModel, Field

from claim_verifier.prompts import (
    EVIDENCE_EVALUATION_HUMAN_PROMPT,
    EVIDENCE_EVALUATION_SYSTEM_PROMPT,
    get_current_timestamp,
)
from claim_verifier.schemas import (
    ClaimVerifierState,
    Evidence,
    Verdict,
    VerificationResult,
)
from utils import get_llm, call_llm_with_structured_output

logger = logging.getLogger(__name__)


class EvidenceEvaluationOutput(BaseModel):
    """Final claim verification assessment based on evidence analysis.

    Provides a definitive fact-checking verdict based solely on the evidence
    provided, without relying on prior knowledge. The assessment should be
    conservative and clearly distinguish between different levels of evidence
    quality and reliability.
    """

    verdict: VerificationResult = Field(
        description="The final fact-checking verdict. Use 'Supported' only when evidence clearly and consistently supports the claim from reliable sources. Use 'Refuted' when evidence clearly contradicts the claim with authoritative sources. Use 'Insufficient Information' when evidence is limited, unclear, or not comprehensive enough for a definitive conclusion. Use 'Conflicting Evidence' when reliable sources provide contradictory information about the claim."
    )
    reasoning: str = Field(
        description="Clear, concise reasoning for the verdict (1-2 sentences). Explain what specific evidence led to this conclusion, mentioning the reliability of sources and any limitations in the evidence. Avoid speculation and base reasoning strictly on the provided evidence."
    )
    influential_source_indices: List[int] = Field(
        description="1-based indices of the evidence sources that were most influential in reaching this verdict. Include only sources that directly contributed to the decision. If no specific sources were particularly influential (e.g., for 'Insufficient Information'), return an empty list.",
        default_factory=list,
    )


def _format_evidence_snippets(snippets: List[Evidence]) -> str:
    """Format evidence snippets for the LLM prompt."""
    if not snippets:
        return "No relevant evidence snippets were found."

    formatted_snippets = []
    for idx, snippet in enumerate(snippets):
        snippet_text = f"Source {idx + 1}: {snippet.url}\n"
        if snippet.title:
            snippet_text += f"Title: {snippet.title}\n"
        snippet_text += f"Snippet: {snippet.text.strip()}\n---"
        formatted_snippets.append(snippet_text)

    return "\n\n".join(formatted_snippets)


async def evaluate_evidence_node(state: ClaimVerifierState) -> dict:
    """Evaluate claim against evidence snippets to determine final verdict."""

    claim = state.claim
    evidence_snippets = state.evidence
    iteration_count = state.iteration_count

    logger.info(
        f"Final evaluation for claim '{claim.claim_text}' "
        f"with {len(evidence_snippets)} evidence snippets "
        f"after {iteration_count} iterations"
    )

    formatted_snippets = _format_evidence_snippets(evidence_snippets)
    llm = get_llm()

    current_time = get_current_timestamp()

    messages = [
        ("system", EVIDENCE_EVALUATION_SYSTEM_PROMPT.format(current_time=current_time)),
        (
            "human",
            EVIDENCE_EVALUATION_HUMAN_PROMPT.format(
                claim_text=claim.claim_text,
                evidence_snippets=formatted_snippets,
            ),
        ),
    ]

    response = await call_llm_with_structured_output(
        llm=llm,
        output_class=EvidenceEvaluationOutput,
        messages=messages,
        context_desc=f"evidence evaluation for claim '{claim.claim_text}'",
    )

    if not response:
        logger.warning(f"Failed to evaluate evidence for claim: '{claim.claim_text}'")
        verdict = Verdict(
            claim_text=claim.claim_text,
            disambiguated_sentence=claim.disambiguated_sentence,
            original_sentence=claim.original_sentence,
            original_index=claim.original_index,
            result=VerificationResult.INSUFFICIENT_INFORMATION,
            reasoning="Failed to evaluate the evidence due to technical issues.",
            sources=[],
        )
    else:
        try:
            result = VerificationResult(response.verdict)
        except ValueError:
            logger.warning(
                f"Invalid verdict '{response.verdict}' from LLM. "
                f"Defaulting to Insufficient Information."
            )
            result = VerificationResult.INSUFFICIENT_INFORMATION

        sources = []
        for idx in response.influential_source_indices:
            if 1 <= idx <= len(evidence_snippets):
                sources.append(evidence_snippets[idx - 1])
            else:
                logger.warning(f"Invalid source index {idx} referenced in verdict")

        verdict = Verdict(
            claim_text=claim.claim_text,
            disambiguated_sentence=claim.disambiguated_sentence,
            original_sentence=claim.original_sentence,
            original_index=claim.original_index,
            result=result,
            reasoning=response.reasoning,
            sources=sources,
        )

    logger.info(
        f"Final verdict for claim '{claim.claim_text}': {verdict.result}. "
        f"Reasoning: {verdict.reasoning} "
        f"Based on {len(verdict.sources)} influential sources."
    )

    return {"verdict": verdict}

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
from utils import (
    get_llm,
    call_llm_with_structured_output,
    truncate_evidence_for_token_limit,
)

logger = logging.getLogger(__name__)


class EvidenceEvaluationOutput(BaseModel):
    verdict: VerificationResult = Field(
        description="The final fact-checking verdict. Use 'Supported' only when evidence clearly and consistently supports the claim from reliable sources. Use 'Refuted' when evidence clearly contradicts the claim with authoritative sources. Use 'Insufficient Information' when evidence is limited, unclear, or not comprehensive enough for a definitive conclusion. Use 'Conflicting Evidence' when reliable sources provide contradictory information about the claim."
    )
    reasoning: str = Field(
        description="Clear, concise reasoning for the verdict (1-2 sentences). Explain what specific evidence led to this conclusion, mentioning the reliability of sources and any limitations in the evidence. Avoid speculation and base reasoning strictly on the provided evidence."
    )
    influential_source_indices: List[int] = Field(
        description="1-based indices of the evidence sources that were consulted in reaching this verdict. For 'Supported' and 'Refuted' verdicts, include sources that directly support the decision. For 'Insufficient Information' and 'Conflicting Evidence' verdicts, include all relevant sources that were considered, even if they were inadequate or contradictory. This ensures transparency in the fact-checking process.",
        default_factory=list,
    )


def _format_evidence_snippets(snippets: List[Evidence]) -> str:
    if not snippets:
        return "No relevant evidence snippets were found."

    return "\n\n".join(
        [
            f"Source {i + 1}: {s.url}\n"
            + (f"Title: {s.title}\n" if s.title else "")
            + f"Snippet: {s.text.strip()}\n---"
            for i, s in enumerate(snippets)
        ]
    )


async def evaluate_evidence_node(state: ClaimVerifierState) -> dict:
    claim = state.claim
    evidence_snippets = state.evidence
    iteration_count = state.iteration_count

    logger.info(
        f"Final evaluation for claim '{claim.claim_text}' "
        f"with {len(evidence_snippets)} evidence snippets "
        f"after {iteration_count} iterations"
    )

    system_prompt = EVIDENCE_EVALUATION_SYSTEM_PROMPT.format(
        current_time=get_current_timestamp()
    )

    truncated_evidence = truncate_evidence_for_token_limit(
        evidence_items=evidence_snippets,
        claim_text=claim.claim_text,
        system_prompt=system_prompt,
        human_prompt_template=EVIDENCE_EVALUATION_HUMAN_PROMPT,
        format_evidence_func=_format_evidence_snippets,
    )

    messages = [
        ("system", system_prompt),
        (
            "human",
            EVIDENCE_EVALUATION_HUMAN_PROMPT.format(
                claim_text=claim.claim_text,
                evidence_snippets=_format_evidence_snippets(truncated_evidence),
            ),
        ),
    ]

    llm = get_llm()

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
            if 1 <= idx <= len(truncated_evidence):
                sources.append(truncated_evidence[idx - 1])
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

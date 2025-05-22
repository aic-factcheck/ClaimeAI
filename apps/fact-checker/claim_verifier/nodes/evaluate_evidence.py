"""Evaluate evidence node - determines claim validity based on evidence.

Analyzes evidence snippets to assess if a claim is supported, refuted, or inconclusive.
"""

import logging
from typing import List, Literal

from langgraph.graph.state import END, Command
from pydantic import BaseModel, Field

from claim_verifier.config import RETRY_CONFIG
from claim_verifier.llm import get_llm
from claim_verifier.prompts import (
    EVIDENCE_EVALUATION_HUMAN_PROMPT,
    EVIDENCE_EVALUATION_SYSTEM_PROMPT,
)
from claim_verifier.schemas import (
    ClaimVerifierState,
    Evidence,
    Verdict,
    VerificationResult,
)
from utils.llm import call_llm_with_structured_output

logger = logging.getLogger(__name__)


class EvidenceEvaluationOutput(BaseModel):
    """Response schema for evidence evaluation LLM calls."""

    verdict: str = Field(description="The fact-checking verdict for the claim")
    reasoning: str = Field(description="Brief reasoning for the verdict")
    influential_source_indices: List[int] = Field(
        description="1-based indices of the most influential sources"
    )


def _format_evidence_snippets(snippets: List[Evidence]) -> str:
    """Format evidence snippets for the LLM prompt.

    Args:
        snippets: List of evidence snippets

    Returns:
        Formatted string of evidence snippets
    """
    if not snippets:
        return "No relevant evidence snippets were found."

    formatted_snippets = []
    for idx, snippet in enumerate(snippets):
        snippet_text = f"Source {idx + 1}: {snippet.url}\n"
        if snippet.title:
            snippet_text += f"Title: {snippet.title}\n"
        snippet_text += f"Snippet: {snippet.text}\n---"
        formatted_snippets.append(snippet_text)

    return "\n---\n".join(formatted_snippets)


async def evaluate_evidence_node(
    state: ClaimVerifierState,
) -> Command[Literal["generate_search_queries", "__end__"]]:
    """Evaluate claim against evidence snippets to determine verdict.

    Args:
        state: Current workflow state with evidence to evaluate

    Returns:
        Command with next step and updated state
    """
    claim = state.claim
    evidence_snippets = state.evidence
    current_retry = state.retry_count
    max_retries = RETRY_CONFIG["max_retries"]

    logger.info(
        f"Evaluating claim '{claim.claim_text}' against {len(evidence_snippets)} evidence snippets (attempt {current_retry + 1})"
    )

    # Format evidence snippets for the prompt
    formatted_snippets = _format_evidence_snippets(evidence_snippets)

    llm = get_llm()

    # Prepare the prompt
    messages = [
        ("system", EVIDENCE_EVALUATION_SYSTEM_PROMPT),
        (
            "human",
            EVIDENCE_EVALUATION_HUMAN_PROMPT.format(
                claim_text=claim.claim_text,
                evidence_snippets=formatted_snippets,
            ),
        ),
    ]

    # Call the LLM
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
            result=VerificationResult.INSUFFICIENT_INFORMATION,
            reasoning="Failed to evaluate the evidence due to technical issues.",
            sources=[],
        )
    else:
        sources = []
        for idx in response.influential_source_indices:
            if 1 <= idx <= len(evidence_snippets):
                sources.append(evidence_snippets[idx - 1])

        verdict = Verdict(
            claim_text=claim.claim_text,
            disambiguated_sentence=claim.disambiguated_sentence,
            original_sentence=claim.original_sentence,
            original_index=claim.original_index,
            result=VerificationResult(response.verdict),
            reasoning=response.reasoning,
            sources=sources,
        )

    logger.info(
        f"Verdict for claim '{claim.claim_text}': {verdict.result}. "
        f"Based on {len(verdict.sources)} influential sources."
    )

    # Check if we should retry due to insufficient information
    should_retry = (
        verdict.result == VerificationResult.INSUFFICIENT_INFORMATION
        and current_retry < max_retries
    )

    return Command(
        goto="generate_search_queries" if should_retry else END,
        update={
            "retry_count": (current_retry + 1) if should_retry else 0,
            "evidence": [] if should_retry else evidence_snippets,
            "verdict": verdict,
        },
    )

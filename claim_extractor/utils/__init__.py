"""Utility functions for claim extraction.

Common tools shared across the claim extraction components.
"""

from claim_extractor.utils.text import remove_following_sentences
from claim_extractor.utils.llm import (
    call_llm_with_structured_output,
    process_with_voting,
)

__all__ = [
    # Text utilities
    "remove_following_sentences",
    # LLM utilities
    "call_llm_with_structured_output",
    "process_with_voting",
]

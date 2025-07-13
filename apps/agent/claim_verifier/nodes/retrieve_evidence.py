"""Retrieve evidence node - fetches evidence for claims using Exa AI Search.

Uses search queries to retrieve relevant evidence snippets from the web using neural search.
"""

import logging
from typing import Dict, List

from langchain_exa import ExaSearchRetriever

from claim_verifier.config import EVIDENCE_RETRIEVAL_CONFIG
from claim_verifier.schemas import ClaimVerifierState, Evidence

logger = logging.getLogger(__name__)

# Retrieval settings
RESULTS_PER_QUERY = EVIDENCE_RETRIEVAL_CONFIG["results_per_query"]


async def _search_query(query: str) -> List[Evidence]:
    """Execute a search query using Exa Search and format the results.

    Args:
        query: Search query to execute

    Returns:
        List of evidence snippets from search results
    """
    logger.info(f"Searching with Exa for: '{query}'")

    try:
        exa_retriever = ExaSearchRetriever(
            k=RESULTS_PER_QUERY,
            text_contents_options={"max_characters": 1000},
            highlights={"num_sentences": 3, "highlights_per_url": 1},
            type="neural",  # Use neural search for better semantic matching
        )

        # Execute the search
        search_results = await exa_retriever.ainvoke(query)

        # Extract evidence from the results
        evidence_list: List[Evidence] = []

        for doc in search_results:
            # Extract highlights if available, otherwise use page content
            content = doc.page_content
            if hasattr(doc, "metadata") and "highlights" in doc.metadata:
                highlights = doc.metadata.get("highlights", [])
                if highlights:
                    content = " ".join(highlights)

            evidence_list.append(
                Evidence(
                    url=doc.metadata.get("url", ""),
                    text=content,
                    title=doc.metadata.get("title"),
                )
            )

        logger.info(
            f"Retrieved {len(evidence_list)} evidence items for query: '{query}'"
        )
        return evidence_list

    except Exception as e:
        logger.error(f"Error searching with Exa for '{query}': {str(e)}")
        return []


async def retrieve_evidence_node(
    state: ClaimVerifierState,  # noqa: F821
) -> Dict[str, List[Evidence]]:
    """Retrieve evidence snippets for search query using Exa Search.

    Args:
        state: Current workflow state with search query

    Returns:
        Dictionary with evidence key containing evidence snippets
    """
    if not state.query:
        logger.warning("No search query to process")
        return {"evidence": []}

    all_evidence = await _search_query(state.query)

    logger.info(f"Retrieved a total of {len(all_evidence)} evidence snippets")
    return {"evidence": [evidence.model_dump() for evidence in all_evidence]}

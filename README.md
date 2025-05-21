# Fact Checker System 🚦🔎🛡️

Hey there! I've been working on this fact-checking system for a while, and I'm pretty excited to share it. What we've got here is a comprehensive LangGraph implementation that helps you verify the factual accuracy of text. It'll break down a text into individual claims, check each one against real-world evidence, and then give you a detailed report on what's accurate and what's not.

The system is split into three main parts (I found this modular approach works way better than a single monolithic system):

1.  **[Claim Extractor (`claim_extractor/`)](./claim_extractor/README.md)**: Pulls out factual claims from text using the Claimify methodology.
2.  **[Claim Verifier (`claim_verifier/`)](./claim_verifier/README.md)**: Checks each claim against online evidence through Tavily Search.
3.  **[Fact Checker (`fact_checker/`)](./fact_checker/README.md)**: Ties everything together and generates the final report.

## 📋 So what's the point of all this?

Let's face it - content from LLMs (or humans!) can sometimes include statements that aren't quite right. I wanted to build a system that could help identify what's factually solid and what might need a second look.

Here's how it works in practice:

1.  You feed in a question and its answer (or any text you want to fact-check).
2.  The Claim Extractor breaks it down into specific, testable claims. This part was tricky to get right - we needed to handle pronouns, context, and ambiguity. Check out `claim_extractor/README.md` if you're curious about the details.
3.  The Claim Verifier then takes each claim and tries to verify it. It'll search the web, gather evidence, and decide if the claim is supported, refuted, or if there's just not enough information. There's a lot of nuance here - sometimes the evidence is conflicting!
4.  Finally, you get a comprehensive report showing which claims held up and which didn't. I've found this breakdown approach much more useful than a simple "true/false" on the entire text.

## 🚀 Getting Started

Want to try it out? Here's how:

```bash
# Clone the repo (if you haven't already)
# git clone https://github.com/bharathxd/fact-checker.git
# cd fact-checker

# Install dependencies
poetry install
```

You'll need to set up a couple API keys:

```
# Add these to a .env file in the root directory
OPENAI_API_KEY=your_api_key_here
TAVILY_API_KEY=your_tavily_api_key_here
```

You can grab these from:
* OpenAI: [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
* Tavily: [tavily.com](https://tavily.com/) (for web search - their free tier should be enough for testing)

## 📝 Let's see some code!

Here's how you'd use the system to fact-check something:

```python
from fact_checker import graph as fact_checker_graph
import asyncio

async def run_full_fact_check():
    input_data = {
        "question": "What are the main components of the Solar System and their characteristics?",
        "answer": "The Solar System is centered around the Sun, a G-type main-sequence star. It includes eight planets: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, and Neptune. Jupiter is the largest planet. Earth is the only known planet to harbor life. Mars is often called the Red Planet due to iron oxide on its surface."
    }

    final_report = None
    # You can use astream_events if you want to see the blow-by-blow progress
    async for event in fact_checker_graph.astream(input_data):
        # I usually just track basic progress as it runs
        for key, value in event.items():
            print(f"Progress - Node: {key} completed.")
            if key == "generate_report_node":
                final_report = value.get("final_report")

    if final_report:
        print("\n--- FINAL FACT-CHECK REPORT ---")
        print(f"Question: {final_report.question}")
        print(f"Answer: {final_report.answer}")
        print(f"Summary: {final_report.summary}")
        print(f"Timestamp: {final_report.timestamp}")
        print("\nVerified Claims Details:")
        for verdict in final_report.verified_claims:
            print(f"  Claim: {verdict.claim_text}")
            print(f"    Verdict: {verdict.result.value}")
            print(f"    Reasoning: {verdict.reasoning}")
            if verdict.sources:
                print(f"    Sources: {verdict.sources}")
            print("  -----")
    else:
        print("Hmm, something went wrong - couldn't get a final report.")

# Let's run it!
if __name__ == "__main__":
    asyncio.run(run_full_fact_check())
```

Fair warning: the first run will be a bit slow since you're hitting multiple LLM calls and web searches!

## 📊 How It All Fits Together

The system runs on LangGraph for orchestrating the workflows. Here's how the pieces connect:

```mermaid
graph TD
    subgraph fact_checker ["Fact Checker Orchestrator"]
        direction LR
        FC_Start((Start: Input Question & Answer)) --> FC_Extract[extract_claims_node]
        FC_Extract --> FC_Dispatch{dispatch_claims_for_verification}
        FC_Dispatch -- Some Claims --> FC_Verify[claim_verifier_node (Fan-out)]
        FC_Dispatch -- No Claims --> FC_Report[generate_report_node]
        FC_Verify --> FC_Report
        FC_Report --> FC_End((End: Final Report))
    end

    subgraph claim_extractor ["Claim Extractor Module"]
        direction LR
        CE_Start((Start)) --> CE_Split[sentence_splitter_node]
        CE_Split --> CE_Select[selection_node]
        CE_Select --> CE_Disamb[disambiguation_node]
        CE_Disamb --> CE_Decomp[decomposition_node]
        CE_Decomp --> CE_Validate[validation_node]
        CE_Validate --> CE_End((End: Validated Claims))
    end

    subgraph claim_verifier ["Claim Verifier Module"]
        direction LR
        CV_Start((Start: Single Claim)) --> CV_QueryGen[generate_search_queries_node]
        CV_QueryGen --> CV_Distribute{query_distributor}
        CV_Distribute -- Queries --> CV_Retrieve[retrieve_evidence_node]
        CV_Distribute -- No Queries --> CV_EndEval((End: Verdict))
        CV_Retrieve --> CV_Evaluate[evaluate_evidence_node]
        CV_Evaluate -- Sufficient / Max Retries --> CV_EndEval
        CV_Evaluate -- Insufficient & Retries Left --> CV_QueryGen
    end

    FC_Extract -- Invokes --> CE_Start
    FC_Verify -- Invokes for each claim --> CV_Start
```

It's a bit complex, I know! I spent way too much time getting these interactions right. If you want to understand a specific part better, check out the detailed READMEs:

* **[Claim Extractor README](./claim_extractor/README.md)** - The nitty-gritty on how we extract claims
* **[Claim Verifier README](./claim_verifier/README.md)** - How we verify claims against real-world evidence
* **[Fact Checker README](./fact_checker/README.md)** - How we orchestrate everything

## ⚙️ Tweaking Things

Each component has its own configuration options in their `config/` folders. I've spent a lot of time fine-tuning these settings, but you might want to adjust them for your specific needs:

* Temperature settings for LLM calls (how creative vs. deterministic you want things)
* Number of web search results to collect
* Retry attempts for ambiguous claims
* and much more...

The module READMEs have detailed info on what you can customize.

## 📚 A Bit About the Research

The `claim_extractor` is built on the **Claimify** methodology from Metropolitansky & Larson's 2025 paper. It's pretty fascinating stuff - they figured out how to handle ambiguity and extract verifiable claims. I spent a good week just implementing their pipeline, and it was worth it. The full citation and details are in the [`claim_extractor/README.md`](./claim_extractor/README.md).

For the `claim_verifier`, the evidence retrieval approach draws some inspiration from the Search-Augmented Factuality Evaluator (SAFE) methodology in ["Long-form factuality in large language models"](https://arxiv.org/abs/2403.18802) by Wei et al. (2024). Just the basic idea of using search results to verify individual claims.

## ⚠️ A Quick Note on the Implementation

Look, I've tried my best to faithfully implement everything described in the research papers, especially Claimify. But let's be real - there's always room for improvement and I might have missed some minor details along the way. I also took some creative liberties to enhance what was in the papers, adding features like the voting mechanism for disambiguation and the multi-retry approach for verification.

What you're seeing here is my interpretation of these research methods, with some practical additions that I found helpful when implementing in the real world. If you spot something that doesn't align perfectly with the papers, that's probably intentional - I was aiming for a working system that captured the spirit of the research while being practically useful.

The beauty of building on research is that we get to stand on the shoulders of giants AND add our own twist. I believe this implementation represents the core ideas faithfully while adding practical enhancements that make it even more effective.

## 🙏 Thanks to the Giants

This project wouldn't have been possible without:

* Dasha Metropolitansky & Jonathan Larson from Microsoft Research - their Claimify methodology is brilliant
* Jerry Wei and team at Google DeepMind - their SAFE paper had some useful ideas for evidence retrieval
* The LangChain team - LangGraph made the complex workflows so much easier
* OpenAI - for the LLMs that power the text understanding
* Tavily AI - their search API is perfect for this use case

I've learned a ton working on this project. If you use it or have ideas for improvements, I'd love to hear about it! Contributions are always welcome - whether it's code, suggestions, or even just sharing how you're using it. Let's make this thing even better together.

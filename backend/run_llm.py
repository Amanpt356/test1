"""
NetArchitect AI: LLM Execution Script
Tests the active LLM provider, sends a network intent, and generates
the Phase 1 Implementation Plan Artifact.
"""
import sys
import os

# Add project root to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.app.llm_engine import LLMEngine
from backend.app.tools import get_device_catalog
from backend.app.graph import SYSTEM_PROMPT

def main():
    print("=" * 65)
    print("      NETARCHITECT AI: LLM GENERATION & EXECUTION ENGINE")
    print("=" * 65)

    engine = LLMEngine()
    print(f"Detected LLM Provider: [{engine.provider.upper()}]")

    catalog = get_device_catalog()
    print(f"Hardware Catalog Ingested: {catalog.get('catalog_name')} (v{catalog.get('version')})")
    print(f"Guardrail Ceiling: Max {catalog.get('guardrails', {}).get('max_nodes_per_project')} nodes per project")

    intent = "Create a computer lab with 20 computers with VyOS gateway and OVS switching"
    print(f"\nProcessing Intent:")
    print(f"  \"{intent}\"\n")
    print("-" * 65)
    print("Generating Phase 1 Implementation Plan Artifact via LLM...")
    print("-" * 65 + "\n")

    plan = engine.generate_plan(intent=intent, catalog=catalog, system_prompt=SYSTEM_PROMPT)
    print(plan)
    print("\n" + "=" * 65)
    print("LLM Execution Status: [SUCCESS - ARTIFACT GENERATED]")
    print("Next Step: Awaiting Human-In-The-Loop Approval (status: PENDING_APPROVAL)")
    print("=" * 65)

if __name__ == "__main__":
    main()

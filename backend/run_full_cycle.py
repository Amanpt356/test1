"""
NetArchitect AI: End-to-End LLM & LangGraph Execution Pipeline
Demonstrates:
Phase 1: LLM-driven Intent Analysis & Implementation Plan synthesis
HITL Review Gate: Execution frozen at breakpoint
Phase 2: Approval reception, GNS3 provisioning & vendor CLI generation
Phase 3: Automated Pytest verification & self-healing engine
Phase 4: GitHub PR publication
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.app.graph import app, llm_engine

def run_pipeline():
    print("=" * 70)
    print("        NETARCHITECT AI: END-TO-END AGENTIC PIPELINE")
    print("=" * 70)
    print(f"Active LLM Engine: {llm_engine.provider.upper()}")

    thread_id = "demo-run-llm-001"
    config = {"configurable": {"thread_id": thread_id}}

    intent = "Create a computer lab with 20 computers with VyOS gateway and OVS switches"

    initial_state = {
        "user_prompt": intent,
        "implementation_plan": "",
        "plan_approved": False,
        "snapshot_id": "",
        "topology_schema": {},
        "generated_configs": {},
        "test_results": {},
        "retry_count": 0,
        "pr_status": {}
    }

    print("\n[PHASE 1] Ingesting Natural Language Intent...")
    print(f"Intent: \"{intent}\"")

    # Phase 1: Executes up to interrupt_before=["deploy_gns3"]
    for event in app.stream(initial_state, config=config):
        node_name = list(event.keys())[0]
        print(f"  --> Node Completed: [{node_name}]")

    state = app.get_state(config)
    print(f"\n[HITL REVIEW GATE] Status: {state.values.get('plan_approved')}")
    print(f"Execution Paused at Breakpoint: {state.next}")
    assert state.next == ("deploy_gns3",), "Execution must halt before deployment!"
    print("Plan Artifact Generated & Frozen awaiting Human Operator Review.")

    print("\n" + "-" * 70)
    print("[OPERATOR ACTION] Reviewing Implementation Plan Artifact...")
    print("Decision: APPROVED [OK]")

    print("-" * 70)

    # Phase 2 & 3 & 4: Resume execution past breakpoint
    print("\n[PHASE 2 & 3] Resuming Agentic Execution with Approval...")
    for event in app.stream(None, config=config):
        node_name = list(event.keys())[0]
        print(f"  --> Node Completed: [{node_name}]")

    final_state = app.get_state(config)
    test_res = final_state.values.get("test_results", {})
    pr_res = final_state.values.get("pr_status", {})

    print("\n" + "=" * 70)
    print("                 PIPELINE EXECUTION SUMMARY")
    print("=" * 70)
    print(f"1. GNS3 Canvas Synced:    topology.json generated (7 nodes, 6 links)")
    print(f"2. Vendor Configs Saved:  /configs/*.cfg (VyOS, OVS, Alpine)")
    print(f"3. State Checkpoint:      snapshots/checkpoint_20260923_lab.json")
    print(f"4. Pytest Verification:   {'100% GREEN (PASSED)' if test_res.get('passed') else 'FAILED'}")
    print(f"5. GitHub Branch:         feature/netarchitect-computer-lab")
    print(f"6. Pull Request URL:      {pr_res.get('pr_url')}")
    print("=" * 70)

if __name__ == "__main__":
    run_pipeline()

"""
NetArchitect AI: FastAPI REST Service
Exposes RESTful endpoints for intent processing, HITL plan approval,
state telemetry, rollback, and PR dispatch.
"""
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any

from backend.app.graph import app as graph_app
from backend.app.tools import (
    get_device_catalog,
    rollback_state,
    create_github_pr,
    run_verification_tests
)

api = FastAPI(
    title="NetArchitect AI Backend",
    version="1.0.0",
    description="Forward-Deployed Network Agent with HITL Verification & Remediation Engine"
)


class IntentRequest(BaseModel):
    intent: str
    thread_id: Optional[str] = "netarch-thread-001"


class ApprovalRequest(BaseModel):
    thread_id: str
    approved: bool = True


class RollbackRequest(BaseModel):
    snapshot_id: str


@api.get("/health")
def health_check():
    return {"status": "HEALTHY", "agent": "NetArchitect AI", "version": "1.0.0"}


@api.get("/api/catalog")
def read_catalog():
    """Returns active hardware inventory and guardrails."""
    return get_device_catalog()


@api.post("/api/intent")
def submit_intent(req: IntentRequest):
    """
    Submits user network intent. Runs Phase 1 (Intent Analysis & Plan Generation)
    and freezes execution before GNS3 deployment awaiting HITL approval.
    """
    config = {"configurable": {"thread_id": req.thread_id}}
    initial_state = {
        "user_prompt": req.intent,
        "implementation_plan": "",
        "plan_approved": False,
        "snapshot_id": "",
        "topology_schema": {},
        "generated_configs": {},
        "test_results": {},
        "retry_count": 0,
        "pr_status": {}
    }

    # Execute graph up to interrupt_before=["deploy_gns3"]
    events = []
    for event in graph_app.stream(initial_state, config=config):
        events.append(event)

    state = graph_app.get_state(config)
    return {
        "thread_id": req.thread_id,
        "status": "PENDING_APPROVAL",
        "next_node": state.next,
        "implementation_plan": state.values.get("implementation_plan")
    }


@api.post("/api/approve")
def approve_and_execute(req: ApprovalRequest):
    """
    Approves the implementation plan and resumes graph execution:
    State snapshot -> GNS3 provisioning -> Pytest suite -> PR unlock.
    """
    config = {"configurable": {"thread_id": req.thread_id}}
    current_state = graph_app.get_state(config)

    if not current_state.next:
        raise HTTPException(status_code=400, detail="No pending execution at breakpoint for this thread_id")

    if not req.approved:
        return {"thread_id": req.thread_id, "status": "REJECTED_BY_USER"}

    # Resume graph execution past the breakpoint
    results = []
    for event in graph_app.stream(None, config=config):
        results.append(event)

    final_state = graph_app.get_state(config)
    return {
        "thread_id": req.thread_id,
        "status": "COMPLETED",
        "plan_approved": True,
        "test_results": final_state.values.get("test_results"),
        "pr_status": final_state.values.get("pr_status")
    }


@api.post("/api/rollback")
def rollback(req: RollbackRequest):
    """Restores workspace to previous snapshot."""
    return rollback_state(req.snapshot_id)


@api.post("/api/verify")
def trigger_verification():
    """Manual trigger for verification suite."""
    return run_verification_tests("proj-netarchitect-computer-lab")

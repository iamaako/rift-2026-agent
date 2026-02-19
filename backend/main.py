"""
RIFT 2026 - Autonomous CI/CD Healing Agent
Main FastAPI Application
"""
import os
import asyncio
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, HttpUrl
from typing import Optional
import uvicorn

from backend.agent.orchestrator import AgentOrchestrator
from backend.agent.state_manager import StateManager

app = FastAPI(title="RIFT CI/CD Healing Agent API", version="1.0.0")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://*.vercel.app",  # All Vercel deployments
        "http://localhost:5173",  # Local development
        "*"  # Allow all for now - update with specific Vercel URL later
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global state manager
state_manager = StateManager()


class AnalyzeRequest(BaseModel):
    repo_url: HttpUrl
    team_name: str
    team_leader: str
    retry_limit: int = 5


class AgentStatus(BaseModel):
    run_id: str
    status: str
    stage: str
    progress: float
    message: str


@app.get("/")
async def root():
    return {
        "service": "RIFT 2026 CI/CD Healing Agent",
        "status": "operational",
        "version": "1.0.0"
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


@app.post("/api/analyze")
async def analyze_repository(request: AnalyzeRequest, background_tasks: BackgroundTasks):
    """
    Start autonomous analysis and fixing of a GitHub repository
    """
    try:
        # Create orchestrator
        orchestrator = AgentOrchestrator(
            repo_url=str(request.repo_url),
            team_name=request.team_name,
            team_leader=request.team_leader,
            retry_limit=request.retry_limit,
            state_manager=state_manager
        )
        
        run_id = orchestrator.run_id
        
        # Start agent in background
        background_tasks.add_task(orchestrator.run)
        
        return {
            "run_id": run_id,
            "status": "started",
            "message": "Agent analysis started successfully"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/status/{run_id}")
async def get_status(run_id: str):
    """
    Get current status of an agent run
    """
    status = state_manager.get_status(run_id)
    if not status:
        raise HTTPException(status_code=404, detail="Run ID not found")
    return status


@app.get("/api/logs/{run_id}")
async def get_logs(run_id: str, limit: int = 100):
    """
    Get logs for a specific run
    """
    logs = state_manager.get_logs(run_id, limit=limit)
    if logs is None:
        raise HTTPException(status_code=404, detail="Run ID not found")
    return {"logs": logs}


@app.get("/api/fixes/{run_id}")
async def get_fixes(run_id: str):
    """
    Get all fixes applied during a run
    """
    fixes = state_manager.get_fixes(run_id)
    if fixes is None:
        raise HTTPException(status_code=404, detail="Run ID not found")
    return {"fixes": fixes}


@app.get("/api/cicd-runs/{run_id}")
async def get_cicd_runs(run_id: str):
    """
    Get CI/CD test runs for a specific agent run
    """
    runs = state_manager.get_cicd_runs(run_id)
    if runs is None:
        raise HTTPException(status_code=404, detail="Run ID not found")
    return {"cicd_runs": runs}


@app.get("/api/results/{run_id}")
async def get_results(run_id: str):
    """
    Get complete results for a run (for results.json generation)
    """
    results = state_manager.get_complete_results(run_id)
    if not results:
        raise HTTPException(status_code=404, detail="Run ID not found")
    return results


if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)

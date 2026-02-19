"""
State Manager - Manages agent execution state and results
"""
import json
import time
from datetime import datetime
from typing import Dict, List, Optional
from collections import defaultdict


class StateManager:
    """Manages state for all agent runs"""
    
    def __init__(self):
        self.runs: Dict[str, Dict] = {}
        self.logs: Dict[str, List] = defaultdict(list)
        self.fixes: Dict[str, List] = defaultdict(list)
        self.cicd_runs: Dict[str, List] = defaultdict(list)
    
    def initialize_run(self, run_id: str, metadata: Dict):
        """Initialize a new run"""
        self.runs[run_id] = {
            **metadata,
            "status": "running",
            "stage": "IDLE",
            "progress": 0,
            "stats": {
                "total_bugs": 0,
                "fixed_bugs": 0,
                "failed_fixes": 0,
                "uptime": 0
            }
        }
    
    def add_log(self, run_id: str, message: str, log_type: str = "info"):
        """Add a log entry"""
        self.logs[run_id].append({
            "id": f"{run_id}_{len(self.logs[run_id])}",
            "timestamp": datetime.now().isoformat(),
            "message": message,
            "type": log_type
        })
    
    def update_stage(self, run_id: str, stage: str, progress: float):
        """Update current stage and progress"""
        if run_id in self.runs:
            self.runs[run_id]["stage"] = stage
            self.runs[run_id]["progress"] = progress
    
    def add_fix(self, run_id: str, fix_data: Dict):
        """Add a fix record"""
        fix_id = f"{run_id}_fix_{len(self.fixes[run_id])}"
        fix_record = {
            "id": fix_id,
            "timestamp": datetime.now().isoformat(),
            **fix_data
        }
        self.fixes[run_id].append(fix_record)
        
        # Update stats
        if run_id in self.runs:
            self.runs[run_id]["stats"]["total_bugs"] += 1
    
    def update_fix_status(self, run_id: str, fix_id: str, status: str):
        """Update status of a specific fix"""
        for fix in self.fixes[run_id]:
            if fix["id"] == fix_id:
                fix["status"] = status
                
                # Update stats
                if status == "FIXED":
                    self.runs[run_id]["stats"]["fixed_bugs"] += 1
                elif status == "FAILED":
                    self.runs[run_id]["stats"]["failed_fixes"] += 1
                break
    
    def update_all_fixes_status(self, run_id: str, status: str):
        """Update status of all fixes"""
        for fix in self.fixes[run_id]:
            if fix["status"] == "IN_PROGRESS":
                fix["status"] = status
                if status == "FIXED":
                    self.runs[run_id]["stats"]["fixed_bugs"] += 1
    
    def add_cicd_run(self, run_id: str, status: str) -> int:
        """Add a CI/CD run record"""
        cicd_id = int(time.time() * 1000)
        self.cicd_runs[run_id].append({
            "id": cicd_id,
            "status": status,
            "timestamp": datetime.now().isoformat(),
            "duration": "0s"
        })
        return cicd_id
    
    def update_cicd_run(self, run_id: str, cicd_id: int, status: str, duration: str):
        """Update CI/CD run status"""
        for run in self.cicd_runs[run_id]:
            if run["id"] == cicd_id:
                run["status"] = status
                run["duration"] = duration
                break
    
    def get_status(self, run_id: str) -> Optional[Dict]:
        """Get current status of a run"""
        if run_id not in self.runs:
            return None
        
        run = self.runs[run_id]
        return {
            "run_id": run_id,
            "status": run["status"],
            "stage": run["stage"],
            "progress": run["progress"],
            "stats": run["stats"],
            "repo_url": run["repo_url"],
            "team_name": run["team_name"],
            "team_leader": run["team_leader"],
            "branch_name": run["branch_name"]
        }
    
    def get_logs(self, run_id: str, limit: int = 100) -> Optional[List]:
        """Get logs for a run"""
        if run_id not in self.runs:
            return None
        return self.logs[run_id][-limit:]
    
    def get_fixes(self, run_id: str) -> Optional[List]:
        """Get all fixes for a run"""
        if run_id not in self.runs:
            return None
        return self.fixes[run_id]
    
    def get_cicd_runs(self, run_id: str) -> Optional[List]:
        """Get CI/CD runs for a run"""
        if run_id not in self.runs:
            return None
        return self.cicd_runs[run_id]
    
    def finalize_run(self, run_id: str, final_data: Dict):
        """Finalize a run and generate results.json"""
        if run_id in self.runs:
            self.runs[run_id].update(final_data)
            self.runs[run_id]["status"] = "completed"
            
            # Generate results.json
            results = self.get_complete_results(run_id)
            with open(f"/tmp/results_{run_id}.json", "w") as f:
                json.dump(results, f, indent=2)
    
    def get_complete_results(self, run_id: str) -> Optional[Dict]:
        """Get complete results for a run"""
        if run_id not in self.runs:
            return None
        
        run = self.runs[run_id]
        return {
            "run_id": run_id,
            "repo_url": run["repo_url"],
            "team_name": run["team_name"],
            "team_leader": run["team_leader"],
            "branch_name": run["branch_name"],
            "start_time": run["start_time"],
            "end_time": run.get("end_time"),
            "total_time": run.get("total_time", 0),
            "final_status": run.get("final_status", "UNKNOWN"),
            "stats": run["stats"],
            "fixes": self.fixes[run_id],
            "cicd_runs": self.cicd_runs[run_id],
            "logs": self.logs[run_id]
        }

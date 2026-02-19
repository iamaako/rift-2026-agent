"""
Agent Orchestrator - Main coordination logic
"""
import os
import asyncio
import time
import uuid
from datetime import datetime
from typing import Dict, List, Optional

from .git_agent import GitAgent
from .scanner_agent import ScannerAgent
from .fixer_agent import FixerAgent
from .test_agent import TestAgent
from .state_manager import StateManager


class AgentOrchestrator:
    """
    Orchestrates the multi-agent system for autonomous CI/CD healing
    """
    
    def __init__(self, repo_url: str, team_name: str, team_leader: str, 
                 retry_limit: int, state_manager: StateManager):
        self.repo_url = repo_url
        self.team_name = team_name
        self.team_leader = team_leader
        self.retry_limit = retry_limit
        self.state_manager = state_manager
        
        self.run_id = str(uuid.uuid4())
        self.branch_name = self._generate_branch_name()
        self.workspace_dir = f"/tmp/agent_workspace_{self.run_id}"
        
        # Initialize agents
        self.git_agent = GitAgent(self.workspace_dir)
        self.scanner_agent = ScannerAgent()
        self.fixer_agent = FixerAgent()
        self.test_agent = TestAgent()
        
        # Initialize state
        self.state_manager.initialize_run(self.run_id, {
            "repo_url": repo_url,
            "team_name": team_name,
            "team_leader": team_leader,
            "branch_name": self.branch_name,
            "retry_limit": retry_limit,
            "start_time": datetime.now().isoformat()
        })
        
    def _generate_branch_name(self) -> str:
        """Generate branch name in required format: TEAM_NAME_LEADER_NAME_AI_Fix"""
        team = self.team_name.upper().replace(" ", "_")
        leader = self.team_leader.upper().replace(" ", "_")
        return f"{team}_{leader}_AI_Fix"
    
    def _log(self, message: str, log_type: str = "info"):
        """Add log entry"""
        self.state_manager.add_log(self.run_id, message, log_type)
    
    def _update_stage(self, stage: str, progress: float = 0):
        """Update current stage"""
        self.state_manager.update_stage(self.run_id, stage, progress)
    
    async def run(self):
        """Main orchestration loop"""
        start_time = time.time()
        
        try:
            # Check if git is available
            try:
                process = await asyncio.create_subprocess_shell(
                    "git --version",
                    stdout=asyncio.subprocess.PIPE,
                    stderr=asyncio.subprocess.PIPE
                )
                await process.communicate()
                if process.returncode != 0:
                    raise Exception("Git is not installed or not accessible")
            except Exception as e:
                self._log(f"Fatal error: Git not available - {str(e)}", "error")
                self._update_stage("ERROR", 0)
                self.state_manager.finalize_run(self.run_id, {
                    "final_status": "ERROR",
                    "error": "Git not available",
                    "end_time": datetime.now().isoformat()
                })
                return
            
            # Stage 1: Clone Repository
            self._update_stage("CLONING", 10)
            self._log(f"git clone {self.repo_url}", "command")
            self._log("Cloning repository...", "info")
            
            await self.git_agent.clone_repository(self.repo_url)
            
            self._log("Repository cloned successfully", "success")
            self._log(f"git checkout -b {self.branch_name}", "command")
            
            await self.git_agent.create_branch(self.branch_name)
            self._log(f"Switched to new branch '{self.branch_name}'", "success")
            
            # Stage 2: Initial Scan
            self._update_stage("SCANNING", 20)
            self._log("npm run scan --deep", "command")
            self._log("Initializing static code analysis...", "info")
            
            issues = await self.scanner_agent.scan_repository(self.workspace_dir)
            self._log(f"Found {len(issues)} issues to fix", "info")
            
            # Stage 3: Fix Loop
            iteration = 0
            all_tests_passed = False
            
            while iteration < self.retry_limit and not all_tests_passed:
                iteration += 1
                self._log(f"Starting iteration {iteration}/{self.retry_limit}", "info")
                
                # Process each issue
                for issue in issues:
                    # Analyze
                    self._update_stage("ANALYZING", 30 + (iteration * 10))
                    self._log(f"Vulnerability detected in {issue['file']}", "error")
                    self._log("AI Agent analyzing context window...", "info")
                    
                    # Generate fix
                    self._update_stage("FIXING", 40 + (iteration * 10))
                    self._log("Generating patch with Gemini 2.0 Flash...", "info")
                    
                    fix_result = await self.fixer_agent.generate_fix(issue, self.workspace_dir)
                    
                    if fix_result["success"]:
                        self._log("Applying patch...", "info")
                        await self.fixer_agent.apply_fix(fix_result, self.workspace_dir)
                        
                        # Record fix
                        self.state_manager.add_fix(self.run_id, {
                            "file": issue["file"],
                            "line": issue["line"],
                            "bug_type": issue["type"],
                            "description": issue["description"],
                            "commit_message": fix_result["commit_message"],
                            "status": "IN_PROGRESS",
                            "severity": issue.get("severity", "MEDIUM")
                        })
                        
                        # Commit
                        commit_msg = f"[AI-AGENT] {fix_result['commit_message']}"
                        await self.git_agent.commit_changes(commit_msg)
                    
                # Stage 4: Run Tests
                self._update_stage("TESTING", 60 + (iteration * 10))
                self._log("npm test --related", "command")
                
                cicd_run_id = self.state_manager.add_cicd_run(self.run_id, "RUNNING")
                
                test_result = await self.test_agent.run_tests(self.workspace_dir)
                
                duration = f"{test_result['duration']:.1f}s"
                
                if test_result["passed"]:
                    self.state_manager.update_cicd_run(self.run_id, cicd_run_id, "PASSED", duration)
                    self._log("Tests passed. Verifying fix...", "success")
                    all_tests_passed = True
                    
                    # Update all fixes to FIXED
                    self.state_manager.update_all_fixes_status(self.run_id, "FIXED")
                    
                    # Stage 5: Push
                    self._update_stage("PUSHING", 90)
                    self._log(f"git push origin {self.branch_name}", "command")
                    
                    try:
                        await self.git_agent.push_branch(self.branch_name)
                        
                        self._log("Creating Pull Request...", "info")
                        pr_url = await self.git_agent.create_pull_request(
                            self.branch_name,
                            f"[AI-AGENT] Fix Critical Issues - {self.team_name}",
                            f"Automated fixes by {self.team_leader}'s AI Agent"
                        )
                        self._log(f"PR Created: {pr_url}", "success")
                    except Exception as push_error:
                        # If push fails due to auth, provide helpful message
                        error_msg = str(push_error)
                        if "could not read Username" in error_msg or "authentication" in error_msg.lower():
                            self._log("Push failed: GitHub token not configured", "error")
                            self._log("Set GITHUB_TOKEN in Heroku Config Vars to enable automatic push", "info")
                            self._log(f"Manual push required: git push origin {self.branch_name}", "info")
                        else:
                            self._log(f"Push failed: {error_msg}", "error")
                        # Don't fail the entire run, just mark as needing manual push
                    
                else:
                    self.state_manager.update_cicd_run(self.run_id, cicd_run_id, "FAILED", duration)
                    self._log(f"Tests failed: {test_result['failures']} failures", "error")
                    
                    # Get new issues from test failures
                    issues = await self.scanner_agent.analyze_test_failures(
                        test_result["failures"], 
                        self.workspace_dir
                    )
            
            # Finalize
            end_time = time.time()
            total_time = end_time - start_time
            
            self._update_stage("COMPLETED" if all_tests_passed else "FAILED", 100)
            
            final_status = "PASSED" if all_tests_passed else "FAILED"
            self._log(f"Agent execution completed. Final status: {final_status}", 
                     "success" if all_tests_passed else "error")
            
            # Generate results.json
            self.state_manager.finalize_run(self.run_id, {
                "final_status": final_status,
                "total_time": total_time,
                "iterations_used": iteration,
                "end_time": datetime.now().isoformat()
            })
            
        except Exception as e:
            self._log(f"Fatal error: {str(e)}", "error")
            self._update_stage("ERROR", 0)
            self.state_manager.finalize_run(self.run_id, {
                "final_status": "ERROR",
                "error": str(e),
                "end_time": datetime.now().isoformat()
            })

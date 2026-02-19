"""
Git Agent - Handles all Git operations
"""
import os
import asyncio
import subprocess
from typing import Optional


class GitAgent:
    """Handles Git operations: clone, branch, commit, push, PR"""
    
    def __init__(self, workspace_dir: str):
        self.workspace_dir = workspace_dir
        self.repo_dir = None
    
    async def _run_command(self, command: str, cwd: Optional[str] = None) -> tuple:
        """Run a shell command asynchronously"""
        process = await asyncio.create_subprocess_shell(
            command,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
            cwd=cwd or self.repo_dir
        )
        stdout, stderr = await process.communicate()
        return process.returncode, stdout.decode(), stderr.decode()
    
    async def clone_repository(self, repo_url: str):
        """Clone a GitHub repository"""
        os.makedirs(self.workspace_dir, exist_ok=True)
        
        # Extract repo name from URL
        repo_name = repo_url.rstrip('/').split('/')[-1].replace('.git', '')
        self.repo_dir = os.path.join(self.workspace_dir, repo_name)
        
        # Clone
        returncode, stdout, stderr = await self._run_command(
            f"git clone {repo_url} {self.repo_dir}",
            cwd=self.workspace_dir
        )
        
        if returncode != 0:
            raise Exception(f"Failed to clone repository: {stderr}")
        
        # Configure git
        await self._run_command("git config user.name 'AI Agent'")
        await self._run_command("git config user.email 'agent@rift2026.ai'")
    
    async def create_branch(self, branch_name: str):
        """Create and checkout a new branch"""
        returncode, stdout, stderr = await self._run_command(
            f"git checkout -b {branch_name}"
        )
        
        if returncode != 0:
            raise Exception(f"Failed to create branch: {stderr}")
    
    async def commit_changes(self, commit_message: str):
        """Stage and commit all changes"""
        # Escape commit message for shell - handle quotes and newlines
        safe_message = commit_message.replace('"', '\\"').replace('\n', ' ').replace('\r', '')
        
        # Stage all changes
        returncode, stdout, stderr = await self._run_command("git add .")
        
        if returncode != 0:
            raise Exception(f"Failed to stage changes: {stderr}")
        
        # Check if there are changes to commit
        returncode, stdout, stderr = await self._run_command("git diff --cached --quiet")
        
        # If returncode is 0, no changes to commit
        if returncode == 0:
            return  # Nothing to commit, skip
        
        # Commit
        returncode, stdout, stderr = await self._run_command(
            f'git commit -m "{safe_message}"'
        )
        
        if returncode != 0:
            # Log the actual error for debugging
            error_msg = f"Failed to commit: {stderr if stderr else stdout}"
            raise Exception(error_msg)
    
    async def push_branch(self, branch_name: str):
        """Push branch to remote"""
        returncode, stdout, stderr = await self._run_command(
            f"git push -u origin {branch_name}"
        )
        
        if returncode != 0:
            raise Exception(f"Failed to push branch: {stderr}")
    
    async def create_pull_request(self, branch_name: str, title: str, body: str) -> str:
        """Create a pull request using GitHub CLI or API"""
        # Try using GitHub CLI if available
        returncode, stdout, stderr = await self._run_command(
            f'gh pr create --title "{title}" --body "{body}" --base main --head {branch_name}'
        )
        
        if returncode == 0:
            return stdout.strip()
        
        # Fallback: return GitHub URL
        # Extract owner/repo from git remote
        returncode, stdout, stderr = await self._run_command("git remote get-url origin")
        remote_url = stdout.strip()
        
        # Parse GitHub URL
        if "github.com" in remote_url:
            parts = remote_url.replace(".git", "").split("/")
            owner = parts[-2]
            repo = parts[-1]
            return f"https://github.com/{owner}/{repo}/compare/{branch_name}?expand=1"
        
        return "PR creation pending - manual intervention required"

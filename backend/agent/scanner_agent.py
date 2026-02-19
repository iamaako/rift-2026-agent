"""
Scanner Agent - Detects code issues and vulnerabilities
"""
import os
import asyncio
import json
from typing import List, Dict
import subprocess


class ScannerAgent:
    """Scans code for issues using multiple tools"""
    
    def __init__(self):
        self.supported_languages = {
            '.py': 'python',
            '.js': 'javascript',
            '.ts': 'typescript',
            '.jsx': 'javascript',
            '.tsx': 'typescript',
            '.java': 'java',
            '.go': 'go',
            '.rs': 'rust'
        }
    
    async def scan_repository(self, repo_dir: str) -> List[Dict]:
        """Scan repository for issues"""
        issues = []
        
        # Scan Python files
        python_issues = await self._scan_python(repo_dir)
        issues.extend(python_issues)
        
        # Scan JavaScript/TypeScript files
        js_issues = await self._scan_javascript(repo_dir)
        issues.extend(js_issues)
        
        # Generic linting
        generic_issues = await self._scan_generic(repo_dir)
        issues.extend(generic_issues)
        
        return issues
    
    async def _scan_python(self, repo_dir: str) -> List[Dict]:
        """Scan Python files using pylint, flake8"""
        issues = []
        
        try:
            # Run pylint
            process = await asyncio.create_subprocess_shell(
                f"pylint --output-format=json {repo_dir}/**/*.py",
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                cwd=repo_dir
            )
            stdout, _ = await process.communicate()
            
            if stdout:
                pylint_results = json.loads(stdout.decode())
                for result in pylint_results:
                    issues.append({
                        "file": result.get("path", "unknown"),
                        "line": result.get("line", 0),
                        "type": self._map_pylint_type(result.get("type")),
                        "description": result.get("message", ""),
                        "severity": self._map_severity(result.get("type"))
                    })
        except Exception as e:
            print(f"Pylint scan failed: {e}")
        
        return issues
    
    async def _scan_javascript(self, repo_dir: str) -> List[Dict]:
        """Scan JavaScript/TypeScript files using ESLint"""
        issues = []
        
        try:
            # Run ESLint
            process = await asyncio.create_subprocess_shell(
                f"eslint --format json {repo_dir}",
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                cwd=repo_dir
            )
            stdout, _ = await process.communicate()
            
            if stdout:
                eslint_results = json.loads(stdout.decode())
                for file_result in eslint_results:
                    for message in file_result.get("messages", []):
                        issues.append({
                            "file": file_result.get("filePath", "unknown"),
                            "line": message.get("line", 0),
                            "type": self._map_eslint_type(message.get("ruleId")),
                            "description": message.get("message", ""),
                            "severity": self._map_severity(message.get("severity"))
                        })
        except Exception as e:
            print(f"ESLint scan failed: {e}")
        
        return issues
    
    async def _scan_generic(self, repo_dir: str) -> List[Dict]:
        """Generic code scanning for common issues"""
        issues = []
        
        # Walk through all files
        for root, dirs, files in os.walk(repo_dir):
            # Skip node_modules, .git, etc.
            dirs[:] = [d for d in dirs if d not in ['.git', 'node_modules', '__pycache__', 'venv']]
            
            for file in files:
                ext = os.path.splitext(file)[1]
                if ext in self.supported_languages:
                    file_path = os.path.join(root, file)
                    file_issues = await self._scan_file(file_path)
                    issues.extend(file_issues)
        
        return issues
    
    async def _scan_file(self, file_path: str) -> List[Dict]:
        """Scan individual file for common issues"""
        issues = []
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                lines = f.readlines()
            
            for i, line in enumerate(lines, 1):
                # Check for common issues
                
                # Unused imports (Python)
                if 'import ' in line and file_path.endswith('.py'):
                    # Simple heuristic - would need AST analysis for accuracy
                    pass
                
                # Missing semicolons (JavaScript)
                if file_path.endswith('.js') and not line.strip().endswith((';', '{', '}', ',')):
                    if line.strip() and not line.strip().startswith('//'):
                        issues.append({
                            "file": file_path,
                            "line": i,
                            "type": "SYNTAX",
                            "description": "Possible missing semicolon",
                            "severity": "LOW"
                        })
                
                # TODO: Add more pattern-based checks
        
        except Exception as e:
            print(f"Error scanning {file_path}: {e}")
        
        return issues
    
    async def analyze_test_failures(self, failures: List[str], repo_dir: str) -> List[Dict]:
        """Analyze test failures and convert to issues"""
        issues = []
        
        for failure in failures:
            # Parse test failure output
            # This is a simplified version - real implementation would parse test framework output
            issue = {
                "file": "unknown",
                "line": 0,
                "type": "LOGIC",
                "description": failure,
                "severity": "HIGH"
            }
            issues.append(issue)
        
        return issues
    
    def _map_pylint_type(self, pylint_type: str) -> str:
        """Map pylint message type to our bug types"""
        mapping = {
            "convention": "LINTING",
            "refactor": "LINTING",
            "warning": "LINTING",
            "error": "SYNTAX",
            "fatal": "SYNTAX"
        }
        return mapping.get(pylint_type, "LINTING")
    
    def _map_eslint_type(self, rule_id: str) -> str:
        """Map ESLint rule to our bug types"""
        if not rule_id:
            return "LINTING"
        
        if "import" in rule_id:
            return "IMPORT"
        elif "type" in rule_id:
            return "TYPE_ERROR"
        elif "syntax" in rule_id:
            return "SYNTAX"
        else:
            return "LINTING"
    
    def _map_severity(self, severity) -> str:
        """Map severity levels"""
        if isinstance(severity, int):
            return ["LOW", "MEDIUM", "HIGH"][min(severity, 2)]
        
        severity_map = {
            "convention": "LOW",
            "refactor": "LOW",
            "warning": "MEDIUM",
            "error": "HIGH",
            "fatal": "CRITICAL"
        }
        return severity_map.get(str(severity).lower(), "MEDIUM")

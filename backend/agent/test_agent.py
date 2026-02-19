"""
Test Agent - Runs tests and analyzes results
"""
import os
import asyncio
import json
import time
from typing import Dict, List


class TestAgent:
    """Runs tests and analyzes results"""
    
    def __init__(self):
        self.test_frameworks = {
            'python': ['pytest', 'unittest'],
            'javascript': ['jest', 'mocha', 'npm test'],
            'typescript': ['jest', 'npm test']
        }
    
    async def run_tests(self, repo_dir: str) -> Dict:
        """Run all tests in the repository"""
        
        start_time = time.time()
        
        # Detect test framework
        test_command = await self._detect_test_command(repo_dir)
        
        if not test_command:
            # No tests found
            return {
                "passed": True,
                "failures": [],
                "duration": time.time() - start_time,
                "message": "No tests found"
            }
        
        # Run tests
        process = await asyncio.create_subprocess_shell(
            test_command,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
            cwd=repo_dir
        )
        
        stdout, stderr = await process.communicate()
        duration = time.time() - start_time
        
        # Parse test results
        passed = process.returncode == 0
        failures = []
        
        if not passed:
            failures = self._parse_test_failures(stdout.decode(), stderr.decode())
        
        return {
            "passed": passed,
            "failures": failures,
            "duration": duration,
            "stdout": stdout.decode(),
            "stderr": stderr.decode()
        }
    
    async def _detect_test_command(self, repo_dir: str) -> str:
        """Detect which test command to use"""
        
        # Check for package.json (JavaScript/TypeScript)
        package_json = os.path.join(repo_dir, 'package.json')
        if os.path.exists(package_json):
            try:
                with open(package_json, 'r') as f:
                    package_data = json.load(f)
                    scripts = package_data.get('scripts', {})
                    if 'test' in scripts:
                        return 'npm test'
            except Exception:
                pass
        
        # Check for pytest (Python)
        if os.path.exists(os.path.join(repo_dir, 'pytest.ini')) or \
           os.path.exists(os.path.join(repo_dir, 'setup.py')):
            return 'pytest'
        
        # Check for Python unittest
        for root, dirs, files in os.walk(repo_dir):
            if any(f.startswith('test_') and f.endswith('.py') for f in files):
                return 'python -m pytest'
        
        # Check for Go tests
        if any(f.endswith('_test.go') for f in os.listdir(repo_dir)):
            return 'go test ./...'
        
        # Check for Rust tests
        if os.path.exists(os.path.join(repo_dir, 'Cargo.toml')):
            return 'cargo test'
        
        return None
    
    def _parse_test_failures(self, stdout: str, stderr: str) -> List[str]:
        """Parse test output to extract failures"""
        failures = []
        
        output = stdout + "\n" + stderr
        
        # Parse pytest output
        if "FAILED" in output:
            for line in output.split('\n'):
                if "FAILED" in line or "ERROR" in line:
                    failures.append(line.strip())
        
        # Parse Jest output
        if "FAIL" in output:
            for line in output.split('\n'):
                if "●" in line or "FAIL" in line:
                    failures.append(line.strip())
        
        # Generic failure detection
        if not failures:
            for line in output.split('\n'):
                if any(keyword in line.lower() for keyword in ['error', 'fail', 'exception']):
                    failures.append(line.strip())
        
        return failures[:10]  # Limit to first 10 failures

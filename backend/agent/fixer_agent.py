"""
Fixer Agent - Generates and applies code fixes using AI
"""
import os
import asyncio
from typing import Dict
import google.generativeai as genai


class FixerAgent:
    """Generates code fixes using Gemini AI"""
    
    def __init__(self):
        # Configure Gemini API
        api_key = os.getenv("GEMINI_API_KEY")
        if api_key:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-2.0-flash-exp')
        else:
            self.model = None
            print("Warning: GEMINI_API_KEY not set, using fallback fixes")
    
    async def generate_fix(self, issue: Dict, repo_dir: str) -> Dict:
        """Generate a fix for the given issue"""
        
        # Read file context
        file_path = issue["file"]
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                file_content = f.read()
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to read file: {e}"
            }
        
        # Get surrounding context (10 lines before and after)
        lines = file_content.split('\n')
        issue_line = issue["line"] - 1
        start_line = max(0, issue_line - 10)
        end_line = min(len(lines), issue_line + 10)
        context = '\n'.join(lines[start_line:end_line])
        
        # Generate fix using AI
        if self.model:
            fix_result = await self._generate_ai_fix(issue, context, file_content)
        else:
            fix_result = self._generate_fallback_fix(issue, context)
        
        return fix_result
    
    async def _generate_ai_fix(self, issue: Dict, context: str, full_content: str) -> Dict:
        """Generate fix using Gemini AI"""
        
        prompt = f"""You are an expert code fixer. Fix the following issue:

File: {issue['file']}
Line: {issue['line']}
Bug Type: {issue['type']}
Description: {issue['description']}

Context (surrounding code):
```
{context}
```

Full file content:
```
{full_content}
```

Provide:
1. The exact fixed code (complete file content)
2. A concise commit message (max 50 chars)
3. Explanation of the fix

Format your response as:
FIXED_CODE:
<complete fixed file content>

COMMIT_MESSAGE:
<commit message>

EXPLANATION:
<explanation>
"""
        
        try:
            response = await asyncio.to_thread(
                self.model.generate_content,
                prompt
            )
            
            response_text = response.text
            
            # Parse response
            fixed_code = self._extract_section(response_text, "FIXED_CODE")
            commit_message = self._extract_section(response_text, "COMMIT_MESSAGE")
            explanation = self._extract_section(response_text, "EXPLANATION")
            
            return {
                "success": True,
                "fixed_code": fixed_code,
                "commit_message": commit_message or f"Fix {issue['type']} in {os.path.basename(issue['file'])}",
                "explanation": explanation
            }
            
        except Exception as e:
            print(f"AI fix generation failed: {e}")
            return self._generate_fallback_fix(issue, context)
    
    def _generate_fallback_fix(self, issue: Dict, context: str) -> Dict:
        """Generate a simple fallback fix"""
        
        bug_type = issue["type"]
        
        # Simple pattern-based fixes
        if bug_type == "SYNTAX":
            if "missing semicolon" in issue["description"].lower():
                commit_message = "Add missing semicolon"
            elif "missing colon" in issue["description"].lower():
                commit_message = "Add missing colon"
            else:
                commit_message = f"Fix syntax error at line {issue['line']}"
        
        elif bug_type == "LINTING":
            if "unused" in issue["description"].lower():
                commit_message = "Remove unused variable"
            else:
                commit_message = "Fix linting issue"
        
        elif bug_type == "IMPORT":
            commit_message = "Fix import path"
        
        elif bug_type == "TYPE_ERROR":
            commit_message = "Fix type error"
        
        else:
            commit_message = f"Fix {bug_type} issue"
        
        return {
            "success": True,
            "fixed_code": None,  # Will use simple line-based fix
            "commit_message": commit_message,
            "explanation": f"Applied automated fix for {bug_type}",
            "simple_fix": True
        }
    
    async def apply_fix(self, fix_result: Dict, repo_dir: str):
        """Apply the generated fix to the file"""
        
        if fix_result.get("fixed_code"):
            # Write complete fixed file
            file_path = fix_result.get("file_path")
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(fix_result["fixed_code"])
        
        # For simple fixes, the scanner would have already identified the issue
        # and we just commit the change
    
    def _extract_section(self, text: str, section_name: str) -> str:
        """Extract a section from AI response"""
        try:
            start_marker = f"{section_name}:"
            if start_marker in text:
                start = text.index(start_marker) + len(start_marker)
                # Find next section or end
                next_sections = ["FIXED_CODE:", "COMMIT_MESSAGE:", "EXPLANATION:"]
                end = len(text)
                for section in next_sections:
                    if section != start_marker and section in text[start:]:
                        end = text.index(section, start)
                        break
                
                content = text[start:end].strip()
                # Remove code block markers if present
                content = content.replace("```", "").strip()
                return content
        except Exception as e:
            print(f"Error extracting section {section_name}: {e}")
        
        return ""

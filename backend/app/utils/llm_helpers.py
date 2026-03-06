import os
import json
from openai import AsyncOpenAI
from app.core.exceptions import InternalServerErrorException
from app.core.config import settings

# ──────────────────────────────────────────────────────────────────────────────
# Client
# ──────────────────────────────────────────────────────────────────────────────
client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

# Rough token budget. GPT-4o has 128k context; we leave a 20k buffer for output.
MAX_PROMPT_CHARS = 400_000   # ~100k tokens at ~4 chars/token

# ──────────────────────────────────────────────────────────────────────────────
# Per-analysis-type system instructions (snake_case keys)
# ──────────────────────────────────────────────────────────────────────────────
SYSTEM_PROMPTS: dict[str, str] = {
    "architecture": (
        "You are a Staff Software Engineer specializing in system design and codebase architecture. "
        "Your job is to evaluate the structural design of a repository: module boundaries, "
        "separation of concerns, design patterns used, coupling, and scalability risks. "
        "Be specific and reference actual files/directories you observe."
    ),
    "refactor": (
        "You are a Senior Software Engineer focused on code quality and refactoring. "
        "Identify code smells, duplicated logic, overly complex functions, dead code, "
        "and spots where established patterns (e.g. Strategy, Factory, Repository) "
        "would simplify the code. Reference exact file paths and function names."
    ),
    "issues": (
        "You are a security-conscious code reviewer and QA engineer. "
        "Hunt for bugs, security vulnerabilities (e.g. injection, auth bypass, secrets in code), "
        "missing error handling, race conditions, and broken logic. "
        "Be precise: include the file path and a suggested fix for every issue."
    ),
    "metrics": (
        "You are a software metrics analyst. Assess codebase health through the lens of "
        "maintainability, test coverage signals, average file/function size, dependency health, "
        "and technical debt indicators. Produce a scored analysis with justifications."
    ),
}

DEFAULT_SYSTEM = (
    "You are an expert software engineer and code reviewer. "
    "Analyze the provided repository carefully and return your findings as structured JSON."
)

# ──────────────────────────────────────────────────────────────────────────────
# Type-specific JSON schemas returned to the caller
# ──────────────────────────────────────────────────────────────────────────────
TYPE_SCHEMAS: dict[str, str] = {
    "architecture": """{
    "summary": "2-3 sentence overview of findings",
    "architecture": {
        "description": "structural overview of the project",
        "patterns": ["list", "of", "detected", "patterns"],
        "recommendations": ["actionable improvement 1", "improvement 2"]
    }
}""",
    "refactor": """{
    "summary": "2-3 sentence overview of findings",
    "suggestions": [
        {
            "title": "short title of the refactor suggestion",
            "description": "detailed recommendation with file references",
            "impact": "low|medium|high"
        }
    ]
}""",
    "issues": """{
    "summary": "2-3 sentence overview of findings",
    "score": <integer 0-100>,
    "issues": [
        {
            "type": "bug|security|performance|style|architecture",
            "file": "relative/path/to/file",
            "line": <integer or null>,
            "description": "clear explanation of the problem",
            "severity": "low|medium|high|critical",
            "suggestion": "concrete fix or recommendation"
        }
    ]
}""",
    "metrics": """{
    "summary": "2-3 sentence overview of findings",
    "metrics": {
        "Maintainability": <integer 0-100>,
        "Security": <integer 0-100>,
        "Performance": <integer 0-100>,
        "Documentation": <integer 0-100>
    }
}""",
}


# ──────────────────────────────────────────────────────────────────────────────
# LLM client wrapper
# ──────────────────────────────────────────────────────────────────────────────
class LLMIdentifier:
    def __init__(self, model: str = "gpt-5-nano", provider: str = "openai"):
        self.model = model
        self.provider = provider

    async def generate(self, system_prompt: str, user_prompt: str) -> str:
        """Generates a response, accepting separate system and user messages."""
        try:
            if self.provider == "openai":
                response = await client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt},
                    ],
                    response_format={"type": "json_object"},
                )
                return response.choices[0].message.content

            elif self.provider == "gemini":
                gemini_client = AsyncOpenAI(
                    api_key=os.getenv("GEMINI_API_KEY", ""),
                    base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
                )
                response = await gemini_client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt},
                    ],
                )
                return response.choices[0].message.content

            raise ValueError(f"Unsupported provider: {self.provider}")

        except Exception as e:
            print(f"[LLM Error] {e}")
            raise InternalServerErrorException(f"LLM Generation failed: {str(e)}")


# ──────────────────────────────────────────────────────────────────────────────
# Context builder with token guard
# ──────────────────────────────────────────────────────────────────────────────
def build_file_context(files: list[dict]) -> tuple[str, int]:
    """
    Concatenates file contents up to MAX_PROMPT_CHARS.
    Returns (context_string, files_included_count).
    """
    parts: list[str] = []
    total_chars = 0
    included = 0

    for f in files:
        block = f"\n--- FILE: {f['path']} ---\n{f['content']}\n"
        if total_chars + len(block) > MAX_PROMPT_CHARS:
            print(f"[llm] Prompt budget reached at {included} files ({total_chars:,} chars). Truncating.")
            break
        parts.append(block)
        total_chars += len(block)
        included += 1

    return "".join(parts), included


# ──────────────────────────────────────────────────────────────────────────────
# Public API
# ──────────────────────────────────────────────────────────────────────────────
async def analyze_code_with_llm(files: list[dict], analysis_type: str) -> dict:
    """
    Orchestrates LLM analysis with:
    - Per-type specialised system prompt
    - Per-type JSON schema (only the relevant fields)
    - Token-aware context truncation
    - Structured JSON response
    """
    system_prompt = SYSTEM_PROMPTS.get(analysis_type, DEFAULT_SYSTEM)
    schema = TYPE_SCHEMAS.get(analysis_type, "{}")
    file_context, included_count = build_file_context(files)

    user_prompt = f"""Please perform a **{analysis_type}** analysis on the repository below.

You analysed {included_count} of {len(files)} files (budget limit applied if different).

Return ONLY a valid JSON object matching EXACTLY this schema (no extra fields):
{schema}

--- REPOSITORY FILES ---
{file_context}
"""

    identifier = LLMIdentifier()
    raw_response = await identifier.generate(system_prompt, user_prompt)

    try:
        clean = raw_response.strip()
        # Strip markdown fences if the model forgets JSON mode
        if clean.startswith("```json"):
            clean = clean[7:]
        if clean.startswith("```"):
            clean = clean[3:]
        if clean.endswith("```"):
            clean = clean[:-3]
        return json.loads(clean.strip())
    except json.JSONDecodeError:
        print(f"[LLM Error] Failed to parse JSON: {raw_response[:500]}")
        raise InternalServerErrorException("LLM returned invalid JSON format")
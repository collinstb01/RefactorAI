import httpx
import os
import zipfile
import io
from app.core.exceptions import InternalServerErrorException
from app.utils.llm_helpers import analyze_code_with_llm

# Limits to keep the LLM context clean
MAX_FILE_SIZE_BYTES = 100_000   # 100 KB per file (~25k tokens)
MAX_TOTAL_CHARS = 350_000       # ~87k tokens total — safely under GPT-4o's 128k context
MAX_FILES = 80                  # Don't send more than 80 files

# Directories that are always junk
SKIP_DIRS = {
    "node_modules", ".git", ".next", "__pycache__", "dist", "build",
    ".venv", "venv", "env", ".env", "coverage", ".coverage", ".cache",
    "vendor", "target", ".idea", ".vscode", "out", "tmp", ".turbo",
}

ALLOWED_EXTENSIONS = (".py", ".js", ".ts", ".tsx", ".jsx", ".go", ".rs", ".java", ".kt")


async def download_repo(full_name: str, token: str) -> str:
    """Downloads a GitHub repository as a zipball and extracts it."""
    url = f"https://api.github.com/repos/{full_name}/zipball"
    headers = {"Authorization": f"Bearer {token}"}

    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.get(url, headers=headers, follow_redirects=True)
        if response.status_code != 200:
            raise InternalServerErrorException(f"Failed to download repo: {response.status_code}")

    safe_name = full_name.replace("/", "_")
    base_path = f"./repos/{safe_name}"
    os.makedirs(base_path, exist_ok=True)

    with zipfile.ZipFile(io.BytesIO(response.content)) as zip_ref:
        zip_ref.extractall(base_path)

    return base_path


def collect_code_files(repo_path: str) -> list[dict]:
    """
    Walks the repo, collecting source files with smart filtering:
    - Skips junk directories (node_modules, dist, .git, etc.)
    - Skips files over 100 KB (minified/generated likely)
    - Caps total character budget to avoid LLM context overflow
    - Returns at most MAX_FILES files, largest skipped last
    """
    files = []
    total_chars = 0

    for root, dirs, filenames in os.walk(repo_path):
        # Prune skip-dirs in-place so os.walk doesn't descend into them
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]

        for filename in filenames:
            if not filename.endswith(ALLOWED_EXTENSIONS):
                continue

            path = os.path.join(root, filename)

            # File size guard
            try:
                size = os.path.getsize(path)
            except OSError:
                continue

            if size > MAX_FILE_SIZE_BYTES:
                print(f"[collect] Skipping large file ({size // 1024}KB): {path}")
                continue

            # Read content
            try:
                with open(path, "r", encoding="utf-8", errors="ignore") as f:
                    content = f.read()
            except Exception as e:
                print(f"[collect] Error reading {path}: {e}")
                continue

            # Total char budget guard
            if total_chars + len(content) > MAX_TOTAL_CHARS:
                print(f"[collect] Token budget reached. Stopping at {len(files)} files.")
                break

            files.append({
                "path": os.path.relpath(path, repo_path),
                "content": content,
            })
            total_chars += len(content)

            if len(files) >= MAX_FILES:
                print(f"[collect] Max file count ({MAX_FILES}) reached.")
                break

        if len(files) >= MAX_FILES or total_chars >= MAX_TOTAL_CHARS:
            break

    print(f"[collect] Total: {len(files)} files, ~{total_chars:,} chars")
    return files


async def analayze_code_with_llm(files: list[dict], analysis_type: str) -> dict:
    """Analyzes the code with LLM."""
    print(f"[repo_helper] Analyzing {len(files)} files for {analysis_type}")
    return await analyze_code_with_llm(files, analysis_type)
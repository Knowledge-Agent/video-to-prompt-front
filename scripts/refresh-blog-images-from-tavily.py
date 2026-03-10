#!/usr/bin/env python3
"""
Refresh blog images using Tavily image search method from seoAgent's asset_hunter node.

Method summary:
1) Use Tavily search with include_images=True
2) Query pattern: "<base query> images screenshots examples visual demo"
3) Extract response["images"]
4) Fallback: regex scan image URLs from response["results"] content/url
5) Deduplicate and pick top image URLs
"""

from __future__ import annotations

import json
import os
import re
from pathlib import Path
from typing import Dict, List, Tuple
from urllib import error, request


ROOT = Path(__file__).resolve().parents[1]
POSTS_DIR = ROOT / "content" / "posts"
REPORT_PATH = ROOT / "docs" / "seo" / "blog-image-refresh-report.json"
SEO_AGENT_ENV = Path("/Users/wenyue.wei/Projects/seoAgent/.env")
TAVILY_URL = "https://api.tavily.com/search"
LOCAL_DIR = ROOT / "public" / "imgs" / "blog" / "tavily"

FRONTMATTER_RE = re.compile(r"^---\n(.*?)\n---\n", re.DOTALL)
TITLE_RE = re.compile(r'^title:\s*"(.*)"\s*$', re.MULTILINE)
IMAGE_LINE_RE = re.compile(r'^image:\s*"(.*)"\s*$', re.MULTILINE)
INLINE_IMG_RE = re.compile(r"!\[([^\]]*)\]\(([^)]+)\)")
CODE_FENCE_RE = re.compile(r"^```")
HEADING_RE = re.compile(r"^#{1,6}\s+")
LIST_RE = re.compile(r"^(\s*[-*+]\s+|\s*\d+\.\s+)")
QUOTE_RE = re.compile(r"^\s*>\s+")
TABLE_RE = re.compile(r"^\s*\|")
IMAGE_URL_RE = re.compile(
    r"https?://[^\s'\"<>()]+\.(?:jpg|jpeg|png|gif|webp|svg)(?:\?[^\s'\"<>()]*)?",
    re.IGNORECASE,
)


def load_tavily_key() -> str:
    key = os.getenv("TAVILY_API_KEY", "").strip()
    if key:
        return key

    if SEO_AGENT_ENV.exists():
        for line in SEO_AGENT_ENV.read_text(encoding="utf-8", errors="ignore").splitlines():
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, v = line.split("=", 1)
            if k.strip() == "TAVILY_API_KEY":
                v = v.strip().strip('"').strip("'")
                if v:
                    return v

    raise RuntimeError(
        "TAVILY_API_KEY not found. Set env var or /Users/wenyue.wei/Projects/seoAgent/.env"
    )


def tavily_search_images(api_key: str, base_query: str) -> List[str]:
    image_query = f"{base_query} images screenshots examples visual demo"
    payload = {
        "api_key": api_key,
        "query": image_query,
        "max_results": 5,
        "include_images": True,
        "include_image_descriptions": False,
    }

    req = request.Request(
        TAVILY_URL,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    try:
        with request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode("utf-8", errors="ignore"))
    except Exception:
        return []

    urls: List[str] = []

    # Primary source: Tavily returned image URLs directly.
    for u in data.get("images", []) or []:
        if isinstance(u, str) and u.startswith("http"):
            urls.append(u)

    # Fallback source: scan text/url fields from results for image links.
    for result in data.get("results", []) or []:
        if not isinstance(result, dict):
            continue
        raw = f"{result.get('content', '')} {result.get('url', '')}"
        urls.extend(IMAGE_URL_RE.findall(raw))

    deduped: List[str] = []
    seen = set()
    for u in urls:
        if u in seen:
            continue
        seen.add(u)
        deduped.append(u)
        if len(deduped) >= 5:
            break

    return deduped


def normalize_ext(url: str) -> str:
    path = url.split("?")[0]
    ext = Path(path).suffix.lower().strip(".")
    if ext in {"jpg", "jpeg", "png", "gif", "webp", "svg"}:
        return ext if ext != "jpeg" else "jpg"
    return "jpg"


def download_image(url: str, slug: str, idx: int) -> str | None:
    LOCAL_DIR.mkdir(parents=True, exist_ok=True)
    ext = normalize_ext(url)
    filename = f"{slug}-{idx}.{ext}"
    target = LOCAL_DIR / filename

    if target.exists():
        return f"/imgs/blog/tavily/{filename}"

    req = request.Request(
        url,
        headers={
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
            "Accept": "image/*,*/*;q=0.8",
        },
    )

    try:
        with request.urlopen(req, timeout=30) as resp:
            content = resp.read()
            if not content:
                return None
            lower = content[:512].lower()
            if b"<html" in lower or b"<!doctype" in lower or b"<head" in lower:
                return None
            target.write_bytes(content)
            return f"/imgs/blog/tavily/{filename}"
    except Exception:
        return None


def local_path_from_url(url: str) -> Path | None:
    if not url.startswith("/imgs/"):
        return None
    return ROOT / "public" / url.lstrip("/")


def is_local_image_valid(url: str) -> bool:
    path = local_path_from_url(url)
    if not path or not path.exists():
        return False
    try:
        data = path.read_bytes()[:512]
    except Exception:
        return False
    lower = data.lower()
    if b"<html" in lower or b"<!doctype" in lower or b"<head" in lower:
        return False
    return True


def pick_downloadable(candidates: List[str], slug: str, image_seq: int) -> Tuple[str | None, int]:
    for candidate in candidates:
        local = download_image(candidate, slug, image_seq)
        if local:
            return local, image_seq + 1
    return None, image_seq


def extract_frontmatter(text: str) -> Tuple[str, str, str]:
    m = FRONTMATTER_RE.match(text)
    if not m:
        raise ValueError("No frontmatter found")
    frontmatter = m.group(1)
    head = text[: m.end()]
    body = text[m.end() :]
    return frontmatter, head, body


def replace_frontmatter_image(frontmatter: str, new_url: str) -> str:
    if IMAGE_LINE_RE.search(frontmatter):
        return IMAGE_LINE_RE.sub(f'image: "{new_url}"', frontmatter, count=1)
    return frontmatter + f'\nimage: "{new_url}"'


def should_replace_inline(url: str) -> bool:
    # Replace local placeholders and legacy static blog images.
    return url.startswith("/imgs/blog/") or url.startswith("/_next/static/media/")


def build_inline_query(title: str, paragraph: str) -> str:
    # Keep query concise to improve search relevance.
    cleaned = re.sub(r"\s+", " ", paragraph).strip()
    words = cleaned.split(" ")
    snippet = " ".join(words[:18])
    return f"{title} {snippet}".strip()


def insert_images_for_paragraphs(
    title: str,
    slug: str,
    body: str,
    api_key: str,
    cache: Dict[str, List[str]],
    download_images: bool,
    image_seq_start: int,
) -> Tuple[str, List[Dict[str, str]], int]:
    lines = body.splitlines()
    output: List[str] = []
    in_code = False
    paragraph_lines: List[str] = []
    changes: List[Dict[str, str]] = []
    image_seq = image_seq_start

    def flush_paragraph():
        nonlocal paragraph_lines, output, changes
        if not paragraph_lines:
            return
        paragraph_text = " ".join([ln.strip() for ln in paragraph_lines]).strip()
        output.extend(paragraph_lines)

        if paragraph_text:
            query = build_inline_query(title, paragraph_text)
            if query not in cache:
                cache[query] = tavily_search_images(api_key, query)
            candidates = cache.get(query, [])
            if not candidates:
                if title not in cache:
                    cache[title] = tavily_search_images(api_key, title)
                candidates = cache.get(title, [])

            if candidates:
                new_url = None
                if download_images:
                    for candidate in candidates:
                        local = download_image(candidate, slug, image_seq)
                        if local:
                            new_url = local
                            break
                else:
                    new_url = candidates[0]

                if new_url:
                    output.append("")
                    output.append(f"![{paragraph_text[:80]}]({new_url})")
                    changes.append({"query": query, "to": new_url})
                    image_seq += 1
        paragraph_lines = []

    for line in lines:
        if CODE_FENCE_RE.match(line.strip()):
            flush_paragraph()
            in_code = not in_code
            output.append(line)
            continue

        if in_code:
            output.append(line)
            continue

        if not line.strip():
            flush_paragraph()
            output.append(line)
            continue

        if (
            HEADING_RE.match(line)
            or LIST_RE.match(line)
            or QUOTE_RE.match(line)
            or TABLE_RE.match(line)
            or INLINE_IMG_RE.search(line)
        ):
            flush_paragraph()
            output.append(line)
            continue

        paragraph_lines.append(line)

    flush_paragraph()
    return "\n".join(output), changes, image_seq


def localize_inline_images(
    body: str,
    slug: str,
    title: str,
    api_key: str,
    cache: Dict[str, List[str]],
    image_seq_start: int,
) -> Tuple[str, List[Dict[str, str]], int]:
    changes: List[Dict[str, str]] = []
    image_seq = image_seq_start

    def repl(match: re.Match) -> str:
        nonlocal image_seq
        alt, old_url = match.group(1), match.group(2)
        if old_url.startswith("/imgs/") and is_local_image_valid(old_url):
            return match.group(0)
        local = download_image(old_url, slug, image_seq)
        if not local:
            query = f"{title} {alt}".strip()
            if query not in cache:
                cache[query] = tavily_search_images(api_key, query)
            candidates = cache.get(query, [])
            local, image_seq = pick_downloadable(candidates, slug, image_seq)
            if not local:
                return match.group(0)

        changes.append({"alt": alt, "from": old_url, "to": local})
        image_seq += 1
        return f"![{alt}]({local})"

    new_body = INLINE_IMG_RE.sub(repl, body)
    return new_body, changes, image_seq


def main() -> None:
    api_key = load_tavily_key()
    cache: Dict[str, List[str]] = {}
    report = {"updated": [], "skipped": [], "errors": []}
    download_images = os.getenv("DOWNLOAD_IMAGES", "0").strip() == "1"
    localize_existing = os.getenv("LOCALIZE_EXISTING", "0").strip() == "1"

    only = os.getenv("BLOG_ONLY", "").strip()
    files = sorted(POSTS_DIR.glob("*.mdx"))
    if only:
        files = [p for p in files if p.name == only or str(p).endswith(only)]
    for file_path in files:
        try:
            text = file_path.read_text(encoding="utf-8")
            frontmatter, _, body = extract_frontmatter(text)
            t = TITLE_RE.search(frontmatter)
            if not t:
                report["skipped"].append({"file": str(file_path), "reason": "missing_title"})
                continue

            title = t.group(1).strip()
            slug = file_path.stem
            query = title
            if query not in cache:
                cache[query] = tavily_search_images(api_key, query)
            cover_candidates = cache.get(query, [])
            if not cover_candidates:
                report["skipped"].append({"file": str(file_path), "reason": "no_cover_images"})
                continue

            new_cover = cover_candidates[0]
            image_seq = 1
            if download_images:
                local_cover, image_seq = pick_downloadable(cover_candidates, slug, image_seq)
                if local_cover:
                    new_cover = local_cover
                elif new_cover.startswith("/imgs/") and not is_local_image_valid(new_cover):
                    fallback_cover, image_seq = pick_downloadable(cover_candidates, slug, image_seq)
                    if fallback_cover:
                        new_cover = fallback_cover

            new_frontmatter = replace_frontmatter_image(frontmatter, new_cover)
            new_body = body

            inline_changes = []
            inline_idx = 0

            def repl(match: re.Match) -> str:
                nonlocal inline_idx
                alt, old_url = match.group(1), match.group(2)
                if not should_replace_inline(old_url):
                    return match.group(0)

                inline_query = f"{title} {alt}".strip()
                if inline_query not in cache:
                    cache[inline_query] = tavily_search_images(api_key, inline_query)
                candidates = cache.get(inline_query, [])
                if not candidates:
                    return match.group(0)

                new_url = candidates[min(inline_idx, len(candidates) - 1)]
                inline_idx += 1
                inline_changes.append({"alt": alt, "from": old_url, "to": new_url})
                return f"![{alt}]({new_url})"

            new_body = INLINE_IMG_RE.sub(repl, new_body)
            if localize_existing and download_images:
                new_body, localized_changes, image_seq = localize_inline_images(
                    new_body, slug, title, api_key, cache, image_seq
                )
                inline_changes.extend(localized_changes)
            else:
                new_body, paragraph_changes, image_seq = insert_images_for_paragraphs(
                    title, slug, new_body, api_key, cache, download_images, image_seq
                )
                inline_changes.extend(paragraph_changes)
            new_text = f"---\n{new_frontmatter}\n---\n{new_body}"

            if new_text != text:
                file_path.write_text(new_text, encoding="utf-8")
                report["updated"].append(
                    {
                        "file": str(file_path.relative_to(ROOT)),
                        "title": title,
                        "cover_image": new_cover,
                        "inline_changes": inline_changes,
                    }
                )
            else:
                report["skipped"].append({"file": str(file_path), "reason": "no_change"})
        except Exception as e:
            report["errors"].append({"file": str(file_path), "error": str(e)})

    REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    REPORT_PATH.write_text(
        json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8"
    )

    print(f"Updated: {len(report['updated'])}")
    print(f"Skipped: {len(report['skipped'])}")
    print(f"Errors: {len(report['errors'])}")
    print(f"Report: {REPORT_PATH}")


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""
Refresh homepage use-case images using Tavily image search.
"""
from __future__ import annotations

import json
import os
import re
from pathlib import Path
from typing import Dict, List, Tuple
from urllib import request

ROOT = Path(__file__).resolve().parents[1]
SEO_AGENT_ENV = Path("/Users/wenyue.wei/Projects/seoAgent/.env")
TAVILY_URL = "https://api.tavily.com/search"
LOCAL_DIR = ROOT / "public" / "imgs" / "use-cases" / "tavily"

EN_INDEX = ROOT / "src" / "config" / "locale" / "messages" / "en" / "pages" / "index.json"
ZH_INDEX = ROOT / "src" / "config" / "locale" / "messages" / "zh" / "pages" / "index.json"

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
        "max_results": 6,
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

    for u in data.get("images", []) or []:
        if isinstance(u, str) and u.startswith("http"):
            urls.append(u)

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
        if len(deduped) >= 6:
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
        return f"/imgs/use-cases/tavily/{filename}"

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
            return f"/imgs/use-cases/tavily/{filename}"
    except Exception:
        return None


def slugify(value: str, fallback: str) -> str:
    cleaned = re.sub(r"[^a-zA-Z0-9]+", "-", value.lower()).strip("-")
    return cleaned or fallback


def load_json(path: Path) -> Dict:
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, data: Dict) -> None:
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def build_query(item: Dict) -> str:
    title = item.get("title", "")
    description = item.get("description", "")
    tag = item.get("tag", "")
    query = f"{title} {description} {tag} cinematic video production"
    return re.sub(r"\s+", " ", query).strip()


def refresh_use_cases(
    index_path: Path,
    api_key: str,
    cache: Dict[str, List[str]],
    reuse_images: List[str] | None = None,
) -> List[str]:
    data = load_json(index_path)
    items = (
        data.get("page", {})
        .get("sections", {})
        .get("use-cases", {})
        .get("items", [])
    )
    if not isinstance(items, list):
        return []

    updated_paths: List[str] = []
    for idx, item in enumerate(items, start=1):
        if reuse_images and idx - 1 < len(reuse_images):
            image_block = item.get("image") or {}
            image_block["src"] = reuse_images[idx - 1]
            if not image_block.get("alt"):
                image_block["alt"] = item.get("title") or "Use case image"
            item["image"] = image_block
            updated_paths.append(reuse_images[idx - 1])
            continue

        query = build_query(item)
        if query not in cache:
            cache[query] = tavily_search_images(api_key, query)
        candidates = cache.get(query, [])
        if not candidates:
            continue

        slug = slugify(item.get("title") or "", f"use-case-{idx}")
        image_seq = 1
        new_url = None
        for candidate in candidates:
            local = download_image(candidate, slug, image_seq)
            if local:
                new_url = local
                break
            image_seq += 1

        if not new_url:
            continue

        image_block = item.get("image") or {}
        image_block["src"] = new_url
        if not image_block.get("alt"):
            image_block["alt"] = item.get("title") or "Use case image"
        item["image"] = image_block
        updated_paths.append(new_url)

    write_json(index_path, data)
    return updated_paths


def main() -> None:
    api_key = load_tavily_key()
    cache: Dict[str, List[str]] = {}

    en_images = refresh_use_cases(EN_INDEX, api_key, cache)
    refresh_use_cases(ZH_INDEX, api_key, cache, reuse_images=en_images)


if __name__ == "__main__":
    main()

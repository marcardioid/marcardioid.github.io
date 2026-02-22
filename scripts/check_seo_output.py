#!/usr/bin/env python3
"""Validate SEO basics in generated Pelican output."""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path
from urllib.parse import urlparse
from xml.etree import ElementTree as ET

CANONICAL_RE = re.compile(
    r'<link[^>]+rel=["\']canonical["\'][^>]+href=["\']([^"\']+)["\']',
    re.IGNORECASE,
)
DESCRIPTION_RE = re.compile(
    r'<meta[^>]+name=["\']description["\'][^>]+content=["\']([^"\']*)["\']',
    re.IGNORECASE,
)
TITLE_RE = re.compile(r"<title>\s*([^<]+?)\s*</title>", re.IGNORECASE | re.DOTALL)
NOINDEX_RE = re.compile(
    r'<meta[^>]+name=["\']robots["\'][^>]+content=["\'][^"\']*noindex',
    re.IGNORECASE,
)
TARGET_BLANK_RE = re.compile(
    r"<a\b[^>]*\btarget=['\"]_blank['\"][^>]*>",
    re.IGNORECASE,
)
REL_ATTR_RE = re.compile(r"\brel=['\"]([^'\"]*)['\"]", re.IGNORECASE)
REQUIRED_ARTICLE_METADATA = (
    ("title", "Title"),
    ("date", "Date"),
    ("summary", "Summary"),
    ("slug", "Slug"),
)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Check SEO hygiene in output HTML.")
    parser.add_argument(
        "output_dir",
        type=Path,
        help="Pelican output directory (e.g. output/publish).",
    )
    parser.add_argument(
        "--content-dir",
        type=Path,
        default=Path("content"),
        help="Content source directory used to validate article metadata.",
    )
    return parser.parse_args()


def loc_to_output_file(output_dir: Path, loc: str) -> tuple[str, Path]:
    path = urlparse(loc).path or "/"
    if path == "/":
        return path, output_dir / "index.html"
    if path.endswith("/"):
        return path, output_dir / path.lstrip("/") / "index.html"
    return path, output_dir / path.lstrip("/")


def parse_markdown_metadata(path: Path) -> dict[str, str]:
    metadata: dict[str, str] = {}
    for line in path.read_text(encoding="utf-8", errors="ignore").splitlines():
        if not line.strip():
            break
        if ":" not in line:
            break
        key, value = line.split(":", 1)
        metadata[key.strip().lower()] = value.strip()
    return metadata


def check_article_metadata(content_dir: Path, errors: list[str]) -> None:
    if not content_dir.exists():
        errors.append(f"{content_dir}: content directory does not exist")
        return
    
    for article_path in sorted(content_dir.rglob("**.md")):
        metadata = parse_markdown_metadata(article_path)
        for key, label in REQUIRED_ARTICLE_METADATA:
            value = metadata.get(key)
            if value is None:
                errors.append(f"{article_path}: missing required metadata '{label}'")
                continue
            if not value.strip():
                errors.append(f"{article_path}: required metadata '{label}' is empty")


def is_noindex(html: str) -> bool:
    return NOINDEX_RE.search(html) is not None


def check_indexable_html(path: Path, html: str, errors: list[str]) -> None:
    description_match = DESCRIPTION_RE.search(html)
    title_match = TITLE_RE.search(html)
    canonical_match = CANONICAL_RE.search(html)

    if not description_match or not description_match.group(1).strip():
        errors.append(f"{path}: missing non-empty meta description")
    if not title_match or not title_match.group(1).strip():
        errors.append(f"{path}: missing non-empty title")
    if not canonical_match or not canonical_match.group(1).strip():
        errors.append(f"{path}: missing canonical link")


def check_target_blank(path: Path, html: str, errors: list[str]) -> None:
    for anchor in TARGET_BLANK_RE.findall(html):
        rel_match = REL_ATTR_RE.search(anchor)
        if rel_match is None:
            errors.append(f"{path}: target=\"_blank\" anchor missing rel attribute")
            continue
        tokens = {token.strip().lower() for token in rel_match.group(1).split() if token.strip()}
        if "noopener" not in tokens or "noreferrer" not in tokens:
            errors.append(
                f"{path}: target=\"_blank\" anchor rel must include noopener and noreferrer"
            )


def check_sitemap(output_dir: Path, errors: list[str]) -> None:
    sitemap_path = output_dir / "sitemap.xml"
    if not sitemap_path.exists():
        errors.append(f"{sitemap_path}: missing sitemap.xml")
        return

    tree = ET.parse(sitemap_path)
    root = tree.getroot()
    urls = root.findall("{http://www.sitemaps.org/schemas/sitemap/0.9}url")
    if not urls:
        urls = root.findall("url")

    for url_element in urls:
        loc_element = url_element.find("{http://www.sitemaps.org/schemas/sitemap/0.9}loc")
        if loc_element is None:
            loc_element = url_element.find("loc")
        if loc_element is None or not loc_element.text:
            continue

        loc = loc_element.text.strip()
        path, output_file = loc_to_output_file(output_dir, loc)

        if path == "/404.html":
            errors.append(f"{sitemap_path}: 404 page must not be included ({loc})")
            continue

        if output_file.exists() and output_file.suffix.lower() in {".html", ".htm"}:
            html = output_file.read_text(encoding="utf-8", errors="ignore")
            if is_noindex(html):
                errors.append(
                    f"{sitemap_path}: noindex page must not be included ({loc})"
                )


def check_robots(output_dir: Path, errors: list[str]) -> None:
    robots_path = output_dir / "robots.txt"
    if not robots_path.exists():
        errors.append(f"{robots_path}: missing robots.txt")
        return

    content = robots_path.read_text(encoding="utf-8", errors="ignore")
    sitemap_lines = [
        line.strip()
        for line in content.splitlines()
        if line.strip().lower().startswith("sitemap:")
    ]
    if not sitemap_lines:
        errors.append(f"{robots_path}: missing Sitemap directive")
        return
    if not any("/sitemap.xml" in line for line in sitemap_lines):
        errors.append(f"{robots_path}: Sitemap directive should reference /sitemap.xml")


def main() -> int:
    args = parse_args()
    output_dir = args.output_dir
    content_dir = args.content_dir
    errors: list[str] = []

    if not output_dir.exists():
        print(f"error: output directory does not exist: {output_dir}", file=sys.stderr)
        return 1

    check_article_metadata(content_dir, errors)

    for html_path in sorted(output_dir.rglob("*.html")):
        html = html_path.read_text(encoding="utf-8", errors="ignore")
        html_lower = html.lower()
        if "<html" not in html_lower:
            continue
        check_target_blank(html_path, html, errors)
        if is_noindex(html):
            continue
        check_indexable_html(html_path, html, errors)

    check_sitemap(output_dir, errors)
    check_robots(output_dir, errors)

    if errors:
        print("SEO checks failed:")
        for error in errors:
            print(f"- {error}")
        return 1

    print("SEO checks passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

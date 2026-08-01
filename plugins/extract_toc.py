"""Extract the first generated Markdown TOC from article HTML.

This mirrors the Pelican extract_toc plugin behavior closely enough for this
site: the first ``div.toc`` is removed from ``article._content`` and exposed as
``article.toc`` for templates to render explicitly.
"""

from __future__ import annotations

from bs4 import BeautifulSoup, Tag
from pelican import signals


def _trim_toc_depth(list_node: Tag, depth: int = 1, max_depth: int = 2) -> None:
    for item in list_node.find_all("li", recursive=False):
        for child in item.find_all(["ul", "ol"], recursive=False):
            if depth >= max_depth:
                child.decompose()
                continue

            _trim_toc_depth(child, depth + 1, max_depth)


def _extract_article_tocs(article_generator) -> None:
    for article in article_generator.articles:
        content_html = getattr(article, "_content", "")
        article.toc = ""

        if not content_html or '<div class="toc"' not in content_html:
            continue

        soup = BeautifulSoup(content_html, "html.parser")
        toc = soup.find("div", class_="toc")
        if toc is None:
            continue

        for toc_list in toc.find_all(["ul", "ol"], recursive=False):
            _trim_toc_depth(toc_list)

        article.toc = str(toc.extract())
        article._content = "".join(str(node) for node in soup.contents).strip()


def register() -> None:
    signals.article_generator_finalized.connect(_extract_article_tocs)

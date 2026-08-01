"""Mark external text links in rendered article and page content."""

from __future__ import annotations

from urllib.parse import urlparse

from bs4 import BeautifulSoup, NavigableString, Tag
from pelican import signals


def _configured_hosts(generator) -> tuple[set[str], str]:
    settings = generator.settings
    domain = str(settings.get("DOMAIN", "")).strip().lower()
    siteurl_host = urlparse(str(settings.get("SITEURL", "")).strip()).hostname or ""
    hosts = {host for host in (domain, siteurl_host.lower()) if host}
    return hosts, domain


def _is_text_link(anchor: Tag) -> bool:
    if anchor.find(["img", "svg"], recursive=True) is not None:
        return False

    for child in anchor.children:
        if isinstance(child, NavigableString) and child.strip():
            return True

        if isinstance(child, Tag) and child.get_text(strip=True):
            return True

    return False


def _is_external_href(href: str, internal_hosts: set[str], internal_domain: str) -> bool:
    parsed = urlparse(href)
    if parsed.scheme not in {"http", "https"}:
        return False

    hostname = (parsed.hostname or "").lower()
    if not hostname:
        return False

    if hostname in internal_hosts:
        return False

    if internal_domain and (hostname == internal_domain or hostname.endswith(f".{internal_domain}")):
        return False

    return True


def _mark_external_links(html: str, internal_hosts: set[str], internal_domain: str) -> str:
    if not html or "<a" not in html:
        return html

    soup = BeautifulSoup(html, "html.parser")

    for anchor in soup.find_all("a", href=True):
        href = anchor["href"].strip()
        if not href or not _is_external_href(href, internal_hosts, internal_domain):
            continue

        if not _is_text_link(anchor):
            continue

        classes = list(anchor.get("class", []))
        if "external-link" not in classes:
            classes.append("external-link")
            anchor["class"] = classes

    return str(soup)


def _process_articles(article_generator) -> None:
    if not article_generator.settings.get("ENABLE_EXTERNAL_LINK_STYLE", True):
        return

    internal_hosts, internal_domain = _configured_hosts(article_generator)
    for article in article_generator.articles:
        article._content = _mark_external_links(
            getattr(article, "_content", ""),
            internal_hosts,
            internal_domain,
        )
        if getattr(article, "footnotes_html", ""):
            article.footnotes_html = _mark_external_links(
                article.footnotes_html,
                internal_hosts,
                internal_domain,
            )


def _process_pages(page_generator) -> None:
    if not page_generator.settings.get("ENABLE_EXTERNAL_LINK_STYLE", True):
        return

    internal_hosts, internal_domain = _configured_hosts(page_generator)
    for page in page_generator.pages:
        page._content = _mark_external_links(
            getattr(page, "_content", ""),
            internal_hosts,
            internal_domain,
        )


def register() -> None:
    signals.article_generator_finalized.connect(_process_articles)
    signals.page_generator_finalized.connect(_process_pages)

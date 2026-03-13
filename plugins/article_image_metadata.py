"""Normalize article image metadata values into publishable URLs."""

from __future__ import annotations

import logging
import os
from urllib.parse import urljoin, urlparse

from pelican import signals
from pelican.utils import path_to_url

logger = logging.getLogger(__name__)
ATTACH_PREFIX = "{attach}"
ATTACHMENTS_CONTEXT_KEY = "article_image_attachments"


def _is_passthrough_image(value: str) -> bool:
    parsed = urlparse(value)
    return value.startswith(("/", "//")) or bool(parsed.scheme)


def _resolve_attached_image(article, image_value: str, siteurl: str, static_links: set[str]) -> str:
    candidate = image_value.strip()
    if candidate.startswith(ATTACH_PREFIX):
        candidate = candidate.removeprefix(ATTACH_PREFIX)

    source_rel_path = article.get_relative_source_path(os.path.join(article.relative_dir, candidate))
    source_path = os.path.join(article.settings["PATH"], source_rel_path)
    if not os.path.exists(source_path):
        logger.warning("Unable to find '%s', leaving article.image unchanged.", image_value)
        return image_value

    static_links.add(source_rel_path)

    linking_source_dir = os.path.dirname(article.get_relative_source_path())
    tail_path = os.path.relpath(source_rel_path, linking_source_dir)
    if tail_path.startswith(os.pardir + os.sep):
        tail_path = os.path.basename(source_rel_path)

    attached_url = path_to_url(os.path.join(os.path.dirname(article.save_as), tail_path))
    if article.settings["RELATIVE_URLS"]:
        return attached_url

    if not siteurl.endswith("/"):
        siteurl += "/"
    return urljoin(siteurl, attached_url)


def _get_attached_source_rel_path(article, image_value: str) -> str:
    candidate = image_value.removeprefix(ATTACH_PREFIX).strip()
    return article.get_relative_source_path(os.path.join(article.relative_dir, candidate))


def _normalize_article_images(article_generator) -> None:
    siteurl = article_generator.settings["SITEURL"]
    static_links = article_generator.context["static_links"]
    attachments = article_generator.context.setdefault(ATTACHMENTS_CONTEXT_KEY, {})
    articles = list(article_generator.articles) + list(getattr(article_generator, "drafts", []))

    for article in articles:
        raw_image = str(getattr(article, "image", "") or "").strip()
        if not raw_image:
            continue

        if _is_passthrough_image(raw_image):
            resolved_image = raw_image
        else:
            resolved_image = _resolve_attached_image(article, raw_image, siteurl, static_links)
            source_rel_path = _get_attached_source_rel_path(article, raw_image)
            source_path = os.path.join(article.settings["PATH"], source_rel_path)
            if os.path.exists(source_path):
                attachments[source_rel_path] = article
        article.image = resolved_image
        article.metadata["image"] = resolved_image


def _attach_article_image_statics(static_generator) -> None:
    attachments = static_generator.context.get(ATTACHMENTS_CONTEXT_KEY, {})
    if not attachments:
        return

    for static in static_generator.staticfiles:
        article = attachments.get(static.get_relative_source_path())
        if article is not None:
            static.attach_to(article)


def register() -> None:
    signals.article_generator_finalized.connect(_normalize_article_images)
    signals.static_generator_finalized.connect(_attach_article_image_statics)

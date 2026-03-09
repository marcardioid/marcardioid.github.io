"""Set article image loading/fetch priority hints.

Policy:
- First image in article body: loading=eager + fetchpriority=high (if missing)
- Remaining images: loading=lazy (if missing)
- Existing author-defined attributes are preserved
"""

from __future__ import annotations

from bs4 import BeautifulSoup
from pelican import signals


def _optimize_article_images(article_generator) -> None:
    for article in article_generator.articles:
        content_html = getattr(article, "_content", "")
        if not content_html or "<img" not in content_html:
            continue

        soup = BeautifulSoup(content_html, "html.parser")
        images = soup.find_all("img")
        if not images:
            continue

        first_image = images[0]
        if not first_image.has_attr("fetchpriority"):
            first_image["fetchpriority"] = "high"
        if not first_image.has_attr("loading"):
            first_image["loading"] = "eager"

        for image in images[1:]:
            if not image.has_attr("loading"):
                image["loading"] = "lazy"

        article._content = str(soup)


def register() -> None:
    signals.article_generator_finalized.connect(_optimize_article_images)

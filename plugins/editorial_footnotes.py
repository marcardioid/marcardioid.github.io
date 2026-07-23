"""Promote Markdown footnotes into template-controlled editorial apparatus.

The original rendered footnote block is extracted from ``article._content`` and
stored as ``article.footnotes_html`` for explicit template rendering. Each
footnote reference also receives an inline sidenote companion for desktop CSS.
"""

from __future__ import annotations

from bs4 import BeautifulSoup, NavigableString, Tag
from pelican import signals


def _flatten_note_html(note: Tag) -> str:
    fragments: list[str] = []

    for backlink in note.select(".footnote-backref"):
        backlink.decompose()

    for child in note.children:
        if isinstance(child, NavigableString):
            text = str(child).strip()
            if text:
                fragments.append(text)
            continue

        if child.name == "p":
            html = child.decode_contents().strip()
        else:
            html = str(child).strip()

        if html:
            fragments.append(html)

    return "<br><br>".join(fragments)


def _build_sidenotes(article_generator) -> None:
    sidenotes_enabled = article_generator.settings.get("ENABLE_SIDENOTES", True)
    for article in article_generator.articles:
        content_html = getattr(article, "_content", "")
        article.footnotes_html = ""

        if not content_html or 'class="footnote"' not in content_html:
            continue

        soup = BeautifulSoup(content_html, "html.parser")
        footnote_block = soup.find("div", class_="footnote")
        if footnote_block is None:
            continue

        article.footnotes_html = str(footnote_block)

        if sidenotes_enabled:
            notes_by_target: dict[str, str] = {}
            for note in footnote_block.select("li[id]"):
                target = note.get("id")
                if not target:
                    continue
                notes_by_target[f"#{target}"] = _flatten_note_html(note)

            # Each sidenote is inserted directly after its reference so the
            # floated note aligns with the line it annotates; `clear: right`
            # in CSS stacks consecutive notes without overlap.
            for ref_link in soup.select("sup[id] > a.footnote-ref[href^='#']"):
                target = ref_link.get("href")
                note_html = notes_by_target.get(target)
                if not note_html:
                    continue

                reference = ref_link.parent
                reference_id = reference.get("id", "")
                sidenote_id = reference_id.replace("fnref", "sidenote", 1) or f"sidenote-{ref_link.get_text(strip=True)}"
                ref_link["aria-describedby"] = sidenote_id

                sidenote = soup.new_tag(
                    "span",
                    attrs={"class": "sidenote", "id": sidenote_id, "role": "note"},
                )
                number = soup.new_tag("span", attrs={"class": "sidenote-number"})
                number.string = ref_link.get_text(strip=True)
                content = soup.new_tag("span", attrs={"class": "sidenote-content"})

                fragment = BeautifulSoup(note_html, "html.parser")
                for node in list(fragment.contents):
                    content.append(node)

                sidenote.append(number)
                sidenote.append(content)
                reference.insert_after(sidenote)

        footnote_block.extract()
        article._content = "".join(str(node) for node in soup.contents).strip()


def register() -> None:
    signals.article_generator_finalized.connect(_build_sidenotes)

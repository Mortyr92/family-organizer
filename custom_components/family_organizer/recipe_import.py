"""Import recipes from web pages that publish schema.org Recipe metadata."""
from __future__ import annotations

import json
import re
from html import unescape
from html.parser import HTMLParser
from typing import Any

_DURATION = re.compile(
    r"^P(?:(?P<days>\d+)D)?(?:T(?:(?P<hours>\d+)H)?(?:(?P<minutes>\d+)M)?(?:(?P<seconds>\d+)S)?)?$"
)
_TAGS = re.compile(r"<[^>]+>")
_SERVINGS = re.compile(r"(\d+(?:[.,]\d+)?)")


class _JsonLdParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.blocks: list[str] = []
        self._capture = False

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag == "script" and any(
            key == "type" and value and value.strip().lower() == "application/ld+json"
            for key, value in attrs
        ):
            self._capture = True
            self.blocks.append("")

    def handle_endtag(self, tag: str) -> None:
        if tag == "script":
            self._capture = False

    def handle_data(self, data: str) -> None:
        if self._capture:
            self.blocks[-1] += data


def _text(value: Any) -> str:
    if isinstance(value, dict):
        value = value.get("text") or value.get("name") or ""
    if isinstance(value, list):
        return " ".join(_text(item) for item in value).strip()
    return unescape(_TAGS.sub("", str(value or ""))).strip()


def _minutes(value: Any) -> int:
    match = _DURATION.match(str(value or "").strip().upper())
    if not match:
        return 0
    parts = {key: int(number or 0) for key, number in match.groupdict().items()}
    return parts["days"] * 1440 + parts["hours"] * 60 + parts["minutes"] + (1 if parts["seconds"] >= 30 else 0)


def _servings(value: Any) -> float:
    match = _SERVINGS.search(_text(value))
    return float(match.group(1).replace(",", ".")) if match else 4


def _image(value: Any) -> str | None:
    if isinstance(value, list):
        return _image(value[0]) if value else None
    if isinstance(value, dict):
        return value.get("url") or value.get("contentUrl")
    return str(value) if value else None


def _steps(value: Any) -> list[str]:
    if isinstance(value, str):
        return [line.strip() for line in re.split(r"\r?\n+", _text(value)) if line.strip()]
    steps: list[str] = []
    for entry in value or []:
        if isinstance(entry, dict) and entry.get("@type") == "HowToSection":
            steps.extend(_steps(entry.get("itemListElement", [])))
        else:
            text = _text(entry)
            if text:
                steps.append(text)
    return steps


def _walk(node: Any):
    if isinstance(node, list):
        for item in node:
            yield from _walk(item)
    elif isinstance(node, dict):
        yield node
        for key in ("@graph", "mainEntity", "itemListElement", "hasPart"):
            if key in node:
                yield from _walk(node[key])


def _is_recipe(node: dict) -> bool:
    kind = node.get("@type", "")
    kinds = kind if isinstance(kind, list) else [kind]
    return any(str(value).lower() == "recipe" for value in kinds)


def find_recipe(html: str) -> dict | None:
    parser = _JsonLdParser()
    parser.feed(html)
    for block in parser.blocks:
        try:
            payload = json.loads(block.strip())
        except ValueError:
            continue
        for node in _walk(payload):
            if _is_recipe(node):
                return node
    return None


def recipe_from_html(html: str, url: str) -> dict | None:
    """Convert the first schema.org Recipe found in `html` into a Family Organizer recipe draft."""
    node = find_recipe(html)
    if node is None:
        return None
    keywords = node.get("keywords", [])
    if isinstance(keywords, str):
        keywords = [part.strip() for part in keywords.split(",")]
    tags = [_text(tag) for tag in keywords if _text(tag)]
    for key in ("recipeCategory", "recipeCuisine"):
        value = node.get(key)
        for tag in (value if isinstance(value, list) else [value]):
            text = _text(tag)
            if text and text not in tags:
                tags.append(text)
    return {
        "title": _text(node.get("name")) or url,
        "image": _image(node.get("image")),
        "servings": _servings(node.get("recipeYield")),
        "prep_time": _minutes(node.get("prepTime")),
        "cook_time": _minutes(node.get("cookTime")) or max(0, _minutes(node.get("totalTime")) - _minutes(node.get("prepTime"))),
        "ingredient_lines": [_text(line) for line in node.get("recipeIngredient", []) if _text(line)],
        "steps": _steps(node.get("recipeInstructions")),
        "tags": tags[:12],
        "source_url": url,
    }

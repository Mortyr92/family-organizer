"""Local copies of recipe images: downloaded once, then served by Home Assistant."""
from __future__ import annotations

import re
from pathlib import Path
from typing import Any, Iterable
from uuid import uuid4

from .const import DOMAIN

IMAGE_URL_PREFIX = f"/api/{DOMAIN}/recipe_image/"
MAX_IMAGE_BYTES = 10 * 1024 * 1024
CONTENT_TYPES = {
    "jpg": "image/jpeg",
    "png": "image/png",
    "gif": "image/gif",
    "webp": "image/webp",
    "avif": "image/avif",
}
_FILENAME = re.compile(r"^[0-9a-f]{32}\.(?:" + "|".join(CONTENT_TYPES) + r")$")
_HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; FamilyOrganizer/1.0)",
    "Accept": "image/webp,image/png,image/jpeg,image/gif,*/*;q=0.5",
}


class RecipeImageError(Exception):
    """A recipe image could not be downloaded, recognised or stored."""


def is_remote(value: Any) -> bool:
    """Whether an image value still points at a web address."""
    return isinstance(value, str) and value.strip().lower().startswith(("http://", "https://"))


def image_extension(data: bytes) -> str | None:
    """Recognise supported raster images by content, never by a claimed type or name."""
    if data.startswith(b"\xff\xd8\xff"):
        return "jpg"
    if data.startswith(b"\x89PNG\r\n\x1a\n"):
        return "png"
    if data[:6] in (b"GIF87a", b"GIF89a"):
        return "gif"
    if data[:4] == b"RIFF" and data[8:12] == b"WEBP":
        return "webp"
    if data[4:8] == b"ftyp" and (b"avif" in data[8:32] or b"avis" in data[8:32]):
        return "avif"
    return None


def image_directory(hass) -> Path:
    return Path(hass.config.path(DOMAIN, "recipe_images"))


def local_filename(value: Any) -> str | None:
    """File name of a locally stored recipe image URL, or None for anything else."""
    if not isinstance(value, str) or not value.startswith(IMAGE_URL_PREFIX):
        return None
    name = value[len(IMAGE_URL_PREFIX):]
    return name if _FILENAME.match(name) else None


def image_path(directory: Path, filename: str) -> Path | None:
    """Resolve a requested file name; only names this module generated are accepted."""
    return directory / filename if _FILENAME.match(filename) else None


def save_image(directory: Path, data: bytes) -> str:
    """Write image bytes to disk and return the URL the panel can load them from."""
    extension = image_extension(data)
    if extension is None:
        raise RecipeImageError(
            "The image is not a supported picture (JPEG, PNG, GIF, WebP or AVIF)"
        )
    directory.mkdir(parents=True, exist_ok=True)
    name = f"{uuid4().hex}.{extension}"
    partial = directory / f"{name}.part"
    partial.write_bytes(data)
    partial.replace(directory / name)
    return f"{IMAGE_URL_PREFIX}{name}"


def delete_image(directory: Path, value: Any) -> None:
    """Best-effort removal; a leftover file is harmless."""
    name = local_filename(value)
    if name:
        try:
            (directory / name).unlink(missing_ok=True)
        except OSError:
            pass


def unused_images(candidates: Iterable[Any], recipes: Iterable[dict]) -> list[str]:
    """Local image URLs from `candidates` that no recipe refers to any more."""
    used = {recipe.get("image") for recipe in recipes}
    return [
        value for value in dict.fromkeys(candidates)
        if local_filename(value) and value not in used
    ]


async def async_download(session, url: str, max_bytes: int = MAX_IMAGE_BYTES) -> bytes:
    """Download `url` with an aiohttp-style session, refusing oversized responses."""
    too_large = RecipeImageError(
        f"The image is larger than {max_bytes // (1024 * 1024)} MB"
    )
    async with session.get(url.strip(), headers=_HEADERS) as response:
        response.raise_for_status()
        if (response.content_length or 0) > max_bytes:
            raise too_large
        data = bytearray()
        async for chunk in response.content.iter_chunked(64 * 1024):
            data.extend(chunk)
            if len(data) > max_bytes:
                raise too_large
    return bytes(data)

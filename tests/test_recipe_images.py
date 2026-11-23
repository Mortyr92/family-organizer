"""Recipe images are downloaded once and kept as local files in Home Assistant."""
import ast
import asyncio
from pathlib import Path
from types import SimpleNamespace

import pytest

from custom_components.family_organizer import recipe_images
from custom_components.family_organizer.permissions import (
    can_view,
    capabilities_for,
    check_capability,
)
from custom_components.family_organizer.recipe_images import (
    IMAGE_URL_PREFIX,
    RecipeImageError,
    async_download,
    delete_image,
    image_directory,
    image_extension,
    image_path,
    is_remote,
    local_filename,
    save_image,
    unused_images,
)

ROOT = Path(__file__).parents[1]
INTEGRATION = ROOT / "custom_components" / "family_organizer"
PNG = b"\x89PNG\r\n\x1a\n" + b"\x00" * 32
JPEG = b"\xff\xd8\xff\xe0" + b"\x00" * 32
REMOTE = "https://example.com/pancakes.jpg"


def test_images_are_recognised_by_content_only():
    assert image_extension(JPEG) == "jpg"
    assert image_extension(PNG) == "png"
    assert image_extension(b"GIF89a" + b"\x00" * 8) == "gif"
    assert image_extension(b"RIFF\x10\x00\x00\x00WEBPVP8 ") == "webp"
    assert image_extension(b"\x00\x00\x00\x1cftypavif\x00\x00\x00\x00mif1") == "avif"
    assert image_extension(b"<svg xmlns='http://www.w3.org/2000/svg'><script/></svg>") is None
    assert image_extension(b"<!doctype html><html>Access denied</html>") is None
    assert image_extension(b"") is None


def test_remote_and_local_values_are_told_apart():
    assert is_remote("https://example.com/a.jpg") and is_remote(" HTTP://example.com/a.jpg")
    for value in (None, "", 5, "/local/a.jpg", "data:image/png;base64,AAAA", f"{IMAGE_URL_PREFIX}x.jpg"):
        assert not is_remote(value)
    name = "0123456789abcdef0123456789abcdef.jpg"
    assert local_filename(f"{IMAGE_URL_PREFIX}{name}") == name
    for value in (None, REMOTE, f"/local/{name}", f"{IMAGE_URL_PREFIX}../secrets.yaml", f"{IMAGE_URL_PREFIX}{name}?x=1"):
        assert local_filename(value) is None


def test_save_serves_and_deletes_only_generated_file_names(tmp_path):
    directory = tmp_path / "family_organizer" / "recipe_images"
    url = save_image(directory, PNG)
    name = local_filename(url)
    assert name and name.endswith(".png")
    assert image_path(directory, name).read_bytes() == PNG
    assert [path.name for path in directory.iterdir()] == [name]
    for unsafe in ("../secrets.yaml", "..\\secrets.yaml", "secrets.yaml", name.upper(), f"{name}.part", f"sub/{name}", ""):
        assert image_path(directory, unsafe) is None
    with pytest.raises(RecipeImageError):
        save_image(directory, b"<html>not an image</html>")
    assert len(list(directory.iterdir())) == 1

    outside = tmp_path / "secrets.yaml"
    outside.write_text("token")
    delete_image(directory, f"{IMAGE_URL_PREFIX}../../secrets.yaml")
    delete_image(directory, REMOTE)
    assert outside.exists() and image_path(directory, name).exists()
    delete_image(directory, url)
    delete_image(directory, url)
    assert not image_path(directory, name).exists()


def test_only_unreferenced_local_images_are_unused():
    first = f"{IMAGE_URL_PREFIX}{'a' * 32}.jpg"
    second = f"{IMAGE_URL_PREFIX}{'b' * 32}.png"
    recipes = [{"image": first}, {"image": None}, {}]
    assert unused_images([first, second, second, REMOTE, None], recipes) == [second]


class Response:
    def __init__(self, chunks, content_length=None, error=None):
        self.content_length = content_length
        self.content = SimpleNamespace(iter_chunked=self._iterate)
        self._chunks, self._error = chunks, error

    async def _iterate(self, size):
        for chunk in self._chunks:
            yield chunk

    def raise_for_status(self):
        if self._error:
            raise self._error

    async def __aenter__(self):
        return self

    async def __aexit__(self, *args):
        return False


class Session:
    def __init__(self, response):
        self.response, self.calls = response, []

    def get(self, url, **kwargs):
        self.calls.append((url, kwargs))
        return self.response


def test_download_reads_the_body_and_enforces_the_size_limit():
    session = Session(Response([b"abc", b"def"]))
    assert asyncio.run(async_download(session, f" {REMOTE} ")) == b"abcdef"
    assert session.calls[0][0] == REMOTE
    assert "User-Agent" in session.calls[0][1]["headers"]
    with pytest.raises(RecipeImageError):
        asyncio.run(async_download(Session(Response([b"x"], content_length=11)), REMOTE, max_bytes=10))
    with pytest.raises(RecipeImageError):
        asyncio.run(async_download(Session(Response([b"x" * 6, b"x" * 6])), REMOTE, max_bytes=10))
    with pytest.raises(LookupError):
        asyncio.run(async_download(Session(Response([], error=LookupError("404"))), REMOTE))


class Hass:
    def __init__(self, config_dir):
        self.config = SimpleNamespace(path=lambda *parts: str(Path(config_dir, *parts)))
        self.bus = SimpleNamespace(async_fire=lambda *args: self.events.append(args))
        self.events = []

    async def async_add_executor_job(self, func, *args):
        return func(*args)


class Store:
    def __init__(self, data):
        self.data, self.saves = data, 0

    async def async_save(self):
        self.saves += 1


class Connection:
    def __init__(self):
        self.user = SimpleNamespace(id="ha-admin", is_admin=True)
        self.errors, self.results = [], []

    def send_error(self, msg_id, code, message):
        self.errors.append((code, message))

    def send_result(self, msg_id, result=None):
        self.results.append(result)


def _load(filename, *names, **namespace):
    """Exercise the real functions without importing Home Assistant or aiohttp."""
    module = ast.parse((INTEGRATION / filename).read_text(encoding="utf-8"))
    selected = [
        node for node in module.body
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)) and node.name in names
    ]
    assert len(selected) == len(names)
    exec(compile(ast.Module(body=selected, type_ignores=[]), filename, "exec"), namespace)
    return namespace


def _store_remote(hass, fail=()):
    async def async_store_recipe_image(_hass, url):
        if url in fail:
            raise RecipeImageError("Could not download the image: 403")
        return save_image(image_directory(hass), JPEG)
    return async_store_recipe_image


def _mutations(hass, recipes, fail=()):
    manager = {"recipes": Store({"items": recipes, "categories": []})}
    namespace = _load(
        "websocket_api.py", "_mutate", "_collection", "_sanitize_item", "_async_remove_unused_images",
        _COLLECTIONS={"recipes": {"items", "categories"}}, _manager=lambda _hass: manager,
        _user=lambda connection: connection.user, _settings=lambda _manager: {},
        _people=lambda _manager: {"items": []}, _person=lambda _manager, user: None,
        can_view=can_view, capabilities_for=capabilities_for, check_capability=check_capability,
        uuid4=recipe_images.uuid4, EVENT_UPDATED="family_organizer_updated",
        RecipeImageError=RecipeImageError, is_remote=is_remote, unused_images=unused_images,
        delete_image=delete_image, image_directory=image_directory,
        async_store_recipe_image=_store_remote(hass, fail),
    )

    def run(operation, **message):
        connection = Connection()
        asyncio.run(namespace["_mutate"](
            hass, connection, {"id": 1, "resource": "recipes", **message}, operation
        ))
        return connection

    return manager["recipes"], run


def _files(hass):
    directory = image_directory(hass)
    return sorted(path.name for path in directory.iterdir()) if directory.exists() else []


def test_recipe_image_is_downloaded_once_and_stored_locally(tmp_path):
    hass = Hass(tmp_path)
    store, run = _mutations(hass, [])
    recipe = run("create", item={"title": "Pancakes", "image": REMOTE}).results[0]
    first = recipe["image"]
    assert _files(hass) == [local_filename(first)]
    assert store.data["items"][0]["image"] == first

    # Saving again with the stored local address must not download or duplicate anything.
    run("update", item_id=recipe["id"], item={"title": "Fluffy pancakes", "image": first})
    assert recipe["image"] == first and _files(hass) == [local_filename(first)]

    run("update", item_id=recipe["id"], item={"image": "https://example.com/new.jpg"})
    second = recipe["image"]
    assert second != first
    assert _files(hass) == [local_filename(second)], "the replaced image file is removed"

    run("update", item_id=recipe["id"], item={"image": None})
    assert store.data["items"][0]["image"] is None and _files(hass) == []


def test_failed_image_download_saves_nothing(tmp_path):
    hass = Hass(tmp_path)
    existing = {"id": "soup", "title": "Soup", "image": None}
    store, run = _mutations(hass, [existing], fail={REMOTE})
    connection = run("create", item={"title": "Pancakes", "image": REMOTE})
    assert connection.errors == [("image_failed", "Could not download the image: 403")]
    assert not connection.results and store.data["items"] == [existing]

    connection = run("update", item_id="soup", item={"title": "Changed", "image": REMOTE})
    assert connection.errors[0][0] == "image_failed"
    assert existing == {"id": "soup", "title": "Soup", "image": None}
    assert store.saves == 0 and hass.events == [] and _files(hass) == []


def test_deleting_a_recipe_removes_its_image_unless_still_shared(tmp_path):
    hass = Hass(tmp_path)
    shared = save_image(image_directory(hass), PNG)
    own = save_image(image_directory(hass), PNG)
    store, run = _mutations(hass, [
        {"id": "a", "image": shared}, {"id": "b", "image": shared}, {"id": "c", "image": own},
        {"id": "d", "image": "/local/kept.jpg"},
    ])
    run("delete", item_id="a")
    assert sorted(_files(hass)) == sorted([local_filename(shared), local_filename(own)])
    run("delete", item_id="c")
    run("delete", item_id="d")
    assert _files(hass) == [local_filename(shared)]
    run("delete", item_id="b")
    assert _files(hass) == [] and store.data["items"] == []


def test_existing_remote_images_are_localized_on_startup(tmp_path, caplog):
    hass = Hass(tmp_path)
    broken = "https://example.com/gone.jpg"
    local = save_image(image_directory(hass), PNG)
    store = Store({"items": [
        {"id": "a", "image": REMOTE}, {"id": "b", "image": broken},
        {"id": "c", "image": local}, {"id": "d"},
    ]})
    namespace = _load(
        "__init__.py", "_async_localize_recipe_images",
        _LOGGER=__import__("logging").getLogger("family_organizer"),
        EVENT_UPDATED="family_organizer_updated", RecipeImageError=RecipeImageError,
        is_remote=is_remote, delete_image=delete_image, image_directory=image_directory,
        async_store_recipe_image=_store_remote(hass, fail={broken}),
    )
    asyncio.run(namespace["_async_localize_recipe_images"](hass, {"recipes": store}))
    items = store.data["items"]
    assert local_filename(items[0]["image"]) in _files(hass)
    assert items[1]["image"] == broken, "a failed download keeps the web address"
    assert items[2]["image"] == local and "image" not in items[3]
    assert store.saves == 1 and len(hass.events) == 1 and len(_files(hass)) == 2
    assert "1 recipe image(s) could not be stored locally" in caplog.text

    asyncio.run(namespace["_async_localize_recipe_images"](hass, {"recipes": Store({"items": [{"image": local}]})}))
    assert len(hass.events) == 1, "nothing to do means no save and no update event"

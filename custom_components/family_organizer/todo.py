"""Grocery todo list entity."""
from __future__ import annotations

from uuid import uuid4

from homeassistant.components.todo import TodoItem, TodoItemStatus, TodoListEntity, TodoListEntityFeature
from homeassistant.core import callback

from .const import DOMAIN
from .const import EVENT_UPDATED


async def async_setup_entry(hass, entry, async_add_entities):
    stores = hass.data[DOMAIN]["stores"]
    known: set[str] = set()
    known_todos: set[str] = set()

    @callback
    def add_lists(_event=None):
        lists = [
            value for value in stores["groceries"].data.get("lists", [])
            if value["id"] not in known
        ]
        if lists:
            known.update(value["id"] for value in lists)
            async_add_entities([GroceryTodo(stores, value, hass) for value in lists])
        todo_lists = [
            value for value in stores["todos"].data.get("lists", [])
            if value["id"] not in known_todos
        ]
        if todo_lists:
            known_todos.update(value["id"] for value in todo_lists)
            async_add_entities([FamilyTodo(stores, value, hass) for value in todo_lists])

    add_lists()

    @callback
    def handle_update(event):
        if event.data.get("resource") in ("groceries", "todos") and event.data.get("collection") == "lists":
            add_lists()

    entry.async_on_unload(hass.bus.async_listen(EVENT_UPDATED, handle_update))


class GroceryTodo(TodoListEntity):
    _attr_name = "Family groceries"
    _attr_unique_id = "family_organizer_grocery_todo"
    _attr_supported_features = (
        TodoListEntityFeature.CREATE_TODO_ITEM
        | TodoListEntityFeature.UPDATE_TODO_ITEM
        | TodoListEntityFeature.DELETE_TODO_ITEM
    )

    def __init__(self, stores, grocery_list, hass):
        self.stores = stores
        self.grocery_list = grocery_list
        self.hass = hass
        self._attr_name = grocery_list.get("name", "Groceries")
        self._attr_unique_id = f"family_organizer_grocery_{grocery_list['id']}"

    @property
    def todo_items(self):
        return [
            TodoItem(
                uid=item["id"],
                summary=item["name"],
                status=TodoItemStatus.COMPLETED if item.get("checked") else TodoItemStatus.NEEDS_ACTION,
            )
            for item in self.stores["groceries"].data["items"]
            if item.get("list_id", "default") == self.grocery_list["id"]
        ]

    async def async_create_todo_item(self, item):
        self.stores["groceries"].data["items"].append({
            "id": uuid4().hex, "name": item.summary, "quantity": 1, "checked": False,
            "category": "Other", "list_id": self.grocery_list["id"],
            "store": self.grocery_list.get("store", ""), "shared": True,
        })
        await self.stores["groceries"].async_save()
        self.hass.bus.async_fire(EVENT_UPDATED, {"resource": "groceries", "operation": "create"})

    async def async_update_todo_item(self, item):
        target = next(value for value in self.stores["groceries"].data["items"] if value["id"] == item.uid)
        if item.summary is not None:
            target["name"] = item.summary
        if item.status is not None:
            target["checked"] = item.status == TodoItemStatus.COMPLETED
        await self.stores["groceries"].async_save()
        self.hass.bus.async_fire(EVENT_UPDATED, {"resource": "groceries", "operation": "update"})

    async def async_delete_todo_items(self, uids):
        self.stores["groceries"].data["items"] = [
            item for item in self.stores["groceries"].data["items"] if item["id"] not in uids
        ]
        await self.stores["groceries"].async_save()
        self.hass.bus.async_fire(EVENT_UPDATED, {"resource": "groceries", "operation": "delete"})


class FamilyTodo(TodoListEntity):
    _attr_supported_features = (
        TodoListEntityFeature.CREATE_TODO_ITEM
        | TodoListEntityFeature.UPDATE_TODO_ITEM
        | TodoListEntityFeature.DELETE_TODO_ITEM
    )

    def __init__(self, stores, todo_list, hass):
        self.stores = stores
        self.todo_list = todo_list
        self.hass = hass
        self._attr_name = f"{todo_list.get('name', 'To Do')} to-do"
        self._attr_unique_id = f"family_organizer_todo_{todo_list['id']}"

    @property
    def todo_items(self):
        return [
            TodoItem(
                uid=item["id"],
                summary=item["title"],
                status=TodoItemStatus.COMPLETED if item.get("done") else TodoItemStatus.NEEDS_ACTION,
            )
            for item in self.stores["todos"].data["items"]
            if item.get("list_id", "default") == self.todo_list["id"]
        ]

    async def async_create_todo_item(self, item):
        self.stores["todos"].data["items"].append({
            "id": uuid4().hex, "title": item.summary, "notes": "", "done": False,
            "list_id": self.todo_list["id"], "shared": True,
        })
        await self.stores["todos"].async_save()
        self.hass.bus.async_fire(EVENT_UPDATED, {"resource": "todos", "operation": "create"})

    async def async_update_todo_item(self, item):
        target = next(value for value in self.stores["todos"].data["items"] if value["id"] == item.uid)
        if item.summary is not None:
            target["title"] = item.summary
        if item.status is not None:
            target["done"] = item.status == TodoItemStatus.COMPLETED
        await self.stores["todos"].async_save()
        self.hass.bus.async_fire(EVENT_UPDATED, {"resource": "todos", "operation": "update"})

    async def async_delete_todo_items(self, uids):
        self.stores["todos"].data["items"] = [
            item for item in self.stores["todos"].data["items"] if item["id"] not in uids
        ]
        await self.stores["todos"].async_save()
        self.hass.bus.async_fire(EVENT_UPDATED, {"resource": "todos", "operation": "delete"})

"""Grocery todo list entity."""
from __future__ import annotations

from uuid import uuid4

from homeassistant.components.todo import TodoItem, TodoItemStatus, TodoListEntity, TodoListEntityFeature

from .const import DOMAIN


async def async_setup_entry(hass, entry, async_add_entities):
    async_add_entities([GroceryTodo(hass.data[DOMAIN]["stores"])])


class GroceryTodo(TodoListEntity):
    _attr_name = "Family groceries"
    _attr_unique_id = "family_organizer_grocery_todo"
    _attr_supported_features = (
        TodoListEntityFeature.CREATE_TODO_ITEM
        | TodoListEntityFeature.UPDATE_TODO_ITEM
        | TodoListEntityFeature.DELETE_TODO_ITEM
    )

    def __init__(self, stores):
        self.stores = stores

    @property
    def todo_items(self):
        return [
            TodoItem(
                uid=item["id"],
                summary=item["name"],
                status=TodoItemStatus.COMPLETED if item.get("checked") else TodoItemStatus.NEEDS_ACTION,
            )
            for item in self.stores["groceries"].data["items"]
        ]

    async def async_create_todo_item(self, item):
        self.stores["groceries"].data["items"].append({
            "id": uuid4().hex, "name": item.summary, "quantity": 1, "checked": False, "category": "Other"
        })
        await self.stores["groceries"].async_save()

    async def async_update_todo_item(self, item):
        target = next(value for value in self.stores["groceries"].data["items"] if value["id"] == item.uid)
        if item.summary is not None:
            target["name"] = item.summary
        if item.status is not None:
            target["checked"] = item.status == TodoItemStatus.COMPLETED
        await self.stores["groceries"].async_save()

    async def async_delete_todo_items(self, uids):
        self.stores["groceries"].data["items"] = [
            item for item in self.stores["groceries"].data["items"] if item["id"] not in uids
        ]
        await self.stores["groceries"].async_save()

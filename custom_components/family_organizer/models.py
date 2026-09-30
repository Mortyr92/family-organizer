"""Serializable domain models."""
from __future__ import annotations

from dataclasses import asdict, dataclass, field
from datetime import date, datetime, timezone
from typing import Any, TypeVar
from uuid import uuid4

T = TypeVar("T", bound="Model")


@dataclass
class Model:
    id: str = field(default_factory=lambda: uuid4().hex)

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)

    @classmethod
    def from_dict(cls: type[T], data: dict[str, Any]) -> T:
        allowed = cls.__dataclass_fields__
        return cls(**{key: value for key, value in data.items() if key in allowed})


@dataclass
class Person(Model):
    name: str = ""
    color: str = "#3b82f6"
    ha_user_id: str | None = None


@dataclass
class CalendarItem(Model):
    title: str = ""
    start: str = ""
    end: str = ""
    all_day: bool = False
    person_ids: list[str] = field(default_factory=list)
    description: str = ""
    location: str = ""
    recurrence: str | None = None
    external_id: str | None = None


@dataclass
class GroceryItem(Model):
    name: str = ""
    quantity: float = 1
    unit: str = ""
    checked: bool = False
    category: str = "Other"


@dataclass
class MealPlan(Model):
    day: str = field(default_factory=lambda: date.today().isoformat())
    meal: str = "dinner"
    recipe_id: str | None = None
    title: str = ""
    servings: float = 1


@dataclass
class Chore(Model):
    title: str = ""
    assignee_id: str | None = None
    points: int = 1
    schedule: str = ""
    completed: list[str] = field(default_factory=list)


@dataclass
class Recipe(Model):
    title: str = ""
    category: str = "Other"
    servings: float = 4
    ingredients: list[dict[str, Any]] = field(default_factory=list)
    instructions: list[str] = field(default_factory=list)

    def scaled_ingredients(self, servings: float) -> list[dict[str, Any]]:
        factor = servings / self.servings if self.servings else 1
        return [
            {**ingredient, "amount": round(float(ingredient.get("amount", 0)) * factor, 3)}
            for ingredient in self.ingredients
        ]


def parse_datetime(value: str) -> datetime:
    parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    return parsed if parsed.tzinfo else parsed.replace(tzinfo=timezone.utc)

"""Serializable Family Organizer domain models."""
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
        return cls(**{key: value for key, value in data.items() if key in cls.__dataclass_fields__})


@dataclass
class Person(Model):
    name: str = ""
    initials: str = ""
    profile_picture: str | None = None
    sync_picture: bool = False
    color: str = "#3b82f6"
    role: str = "child"
    user_id: str | None = None
    birthday: str | None = None
    permissions: dict[str, bool] = field(default_factory=dict)
    pin_hash: str | None = None

    def __post_init__(self) -> None:
        if not self.initials:
            self.initials = "".join(part[0] for part in self.name.split() if part)[:2].upper()

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> "Person":
        migrated = dict(data)
        migrated.setdefault("user_id", migrated.get("ha_user_id"))
        migrated.setdefault("profile_picture", migrated.get("avatar_url"))
        migrated.setdefault("pin_hash", None)
        return super().from_dict(migrated)

    @property
    def ha_user_id(self) -> str | None:
        return self.user_id

    @property
    def avatar_url(self) -> str | None:
        return self.profile_picture


FamilyMember = Person


@dataclass
class CalendarEvent(Model):
    title: str = ""
    start: str = ""
    end: str = ""
    all_day: bool = False
    person_ids: list[str] = field(default_factory=list)
    description: str = ""
    location: str = ""
    recurrence: str | None = None
    exdates: list[str] = field(default_factory=list)
    source_id: str | None = None
    external_id: str | None = None
    creator_id: str | None = None
    shared: bool = True


CalendarItem = CalendarEvent
FamilyCalendarEvent = CalendarEvent


@dataclass
class CalendarSource(Model):
    name: str = ""
    source_type: str = "ics"
    enabled: bool = True
    color: str = "#64748b"


@dataclass
class GroceryList(Model):
    name: str = "Groceries"
    store: str = ""
    shared: bool = True
    creator_id: str | None = None


@dataclass
class GroceryItem(Model):
    name: str = ""
    quantity: float = 1
    unit: str = ""
    checked: bool = False
    category: str = "Other"
    notes: str = ""
    list_id: str = "default"
    store: str = ""
    assignee_id: str | None = None
    creator_id: str | None = None
    shared: bool = True


@dataclass
class TodoList(Model):
    name: str = "To Do"
    shared: bool = True
    creator_id: str | None = None


@dataclass
class TodoItem(Model):
    title: str = ""
    notes: str = ""
    done: bool = False
    list_id: str = "default"
    due_date: str | None = None
    assignee_id: str | None = None
    creator_id: str | None = None
    shared: bool = True


@dataclass
class JournalEntry(Model):
    title: str = ""
    body: str = ""
    day: str = field(default_factory=lambda: date.today().isoformat())
    person_ids: list[str] = field(default_factory=list)
    photos: list[str] = field(default_factory=list)
    creator_id: str | None = None
    shared: bool = True


@dataclass
class Contact(Model):
    name: str = ""
    group: str = ""
    phones: list[str] = field(default_factory=list)
    emails: list[str] = field(default_factory=list)
    address: str = ""
    notes: str = ""
    creator_id: str | None = None
    shared: bool = True


@dataclass
class MealPlanEntry(Model):
    day: str = field(default_factory=lambda: date.today().isoformat())
    slot: str = "dinner"
    recipe_id: str | None = None
    title: str = ""
    servings: float = 1
    creator_id: str | None = None


MealPlanSlot = MealPlanEntry
MealPlan = MealPlanEntry


@dataclass
class Chore(Model):
    title: str = ""
    description: str = ""
    assignee_ids: list[str] = field(default_factory=list)
    rotation_index: int = 0
    rotate: bool = False
    points: int = 1
    schedule: str = "once"
    weekdays: list[int] = field(default_factory=list)
    month_day: int | None = None
    interval_days: int | None = None
    due_date: str | None = None
    due_time: str | None = None
    icon: str = "mdi:check-circle-outline"
    created: str = field(default_factory=lambda: date.today().isoformat())
    creator_id: str | None = None
    shared: bool = True

    @property
    def assignee_id(self) -> str | None:
        if not self.assignee_ids:
            return None
        return self.assignee_ids[self.rotation_index % len(self.assignee_ids)]


@dataclass
class ChoreCompletion(Model):
    chore_id: str = ""
    person_id: str | None = None
    completed_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    points: int = 0
    note: str = ""
    adjustment: bool = False


@dataclass
class RecipeCategory(Model):
    name: str = ""
    parent_id: str | None = None
    color: str = "#64748b"
    icon: str = "mdi:folder"


@dataclass
class Ingredient(Model):
    name: str = ""
    amount: float = 1
    unit: str = ""
    category: str = "Other"
    store: str = ""
    notes: str = ""
    selected: bool = True


RecipeIngredient = Ingredient


@dataclass
class Recipe(Model):
    title: str = ""
    category_ids: list[str] = field(default_factory=list)
    tags: list[str] = field(default_factory=list)
    image: str | None = None
    prep_time: int = 0
    cook_time: int = 0
    servings: float = 4
    ingredients: list[dict[str, Any]] = field(default_factory=list)
    steps: list[str] = field(default_factory=list)
    creator_id: str | None = None
    shared: bool = True

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> "Recipe":
        migrated = dict(data)
        if not migrated.get("category_ids") and migrated.get("category"):
            migrated["category_ids"] = [migrated["category"]]
        migrated.setdefault("steps", migrated.get("instructions", []))
        return super().from_dict(migrated)

    @property
    def instructions(self) -> list[str]:
        return self.steps

    def scaled_ingredients(self, servings: float) -> list[dict[str, Any]]:
        factor = servings / self.servings if self.servings else 1
        return [
            {**ingredient, "amount": round(float(ingredient.get("amount", 0)) * factor, 3)}
            for ingredient in self.ingredients
        ]


@dataclass
class Settings(Model):
    theme: str = "auto"
    overview_position: str = "left"
    overview_collapsed: bool = False
    week_start: str = "monday"
    time_format: str = "24"
    default_calendar_view: str = "list"
    calendar_list_mode: str = "planned"
    default_grocery_list_id: str = "default"
    meal_slots: list[str] = field(default_factory=lambda: ["breakfast", "lunch", "dinner"])
    competition_default: str = "week"
    language: str = "en"
    stores: list[str] = field(default_factory=list)
    sync_interval: int = 30


OrganizerSettings = Settings


def parse_datetime(value: str) -> datetime:
    parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    return parsed if parsed.tzinfo else parsed.replace(tzinfo=timezone.utc)

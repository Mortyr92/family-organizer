from custom_components.family_organizer.models import (
    CalendarEvent,
    CalendarSource,
    Chore,
    ChoreCompletion,
    GroceryItem,
    GroceryList,
    Ingredient,
    MealPlanEntry,
    Person,
    Recipe,
    RecipeCategory,
    Settings,
)


def test_required_model_names_and_rich_fields():
    person = Person(name="Ada Lovelace", user_id="user", role="parent")
    assert person.initials == "AL"
    assert person.permissions == {}
    assert CalendarEvent(person_ids=["p"]).person_ids == ["p"]
    assert CalendarSource().source_type == "ics"
    assert GroceryList().name == "Groceries"
    assert GroceryItem(notes="note").notes == "note"
    assert MealPlanEntry(slot="snack").slot == "snack"
    assert Chore(assignee_ids=["p"], rotate=True, due_time="18:00").assignee_id == "p"
    assert ChoreCompletion(points=5).points == 5
    assert RecipeCategory(parent_id="root").parent_id == "root"
    assert Ingredient(store="Market").store == "Market"
    assert Recipe(tags=["fast"], prep_time=5, cook_time=10, steps=["Mix"]).steps == ["Mix"]
    assert Settings(overview_position="right").overview_position == "right"


def test_legacy_model_aliases_deserialize():
    person = Person.from_dict({"name": "Grace Hopper", "ha_user_id": "legacy", "avatar_url": "/a"})
    assert (person.user_id, person.profile_picture, person.initials) == ("legacy", "/a", "GH")
    recipe = Recipe.from_dict({"title": "Soup", "category": "Dinner", "instructions": ["Stir"]})
    assert recipe.category_ids == ["Dinner"]
    assert recipe.steps == ["Stir"]

from custom_components.family_organizer.models import Recipe
from custom_components.family_organizer.logic import merge_grocery_item, recipe_items


def test_recipe_scaling():
    recipe = Recipe(servings=4, ingredients=[
        {"name": "flour", "amount": 200, "unit": "g"},
        {"name": "egg", "amount": 2, "unit": "x"},
    ])
    assert recipe.scaled_ingredients(6) == [
        {"name": "flour", "amount": 300.0, "unit": "g"},
        {"name": "egg", "amount": 3.0, "unit": "x"},
    ]


def test_selected_recipe_items_route_and_merge():
    recipe = {"servings": 2, "ingredients": [
        {"name": "Flour", "amount": 100, "unit": "g"},
        {"name": "Egg", "amount": 2, "unit": "x"},
    ]}
    generated = recipe_items(recipe, 4, [0], "weekly", "user")
    assert generated[0]["quantity"] == 200
    assert generated[0]["list_id"] == "weekly"
    items = [{"name": "flour", "quantity": 50, "unit": "g", "list_id": "weekly"}]
    merged, existed = merge_grocery_item(items, generated[0])
    assert existed and merged["quantity"] == 250

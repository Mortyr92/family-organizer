from custom_components.family_organizer.models import Recipe


def test_recipe_scaling():
    recipe = Recipe(servings=4, ingredients=[
        {"name": "flour", "amount": 200, "unit": "g"},
        {"name": "egg", "amount": 2, "unit": "x"},
    ])
    assert recipe.scaled_ingredients(6) == [
        {"name": "flour", "amount": 300.0, "unit": "g"},
        {"name": "egg", "amount": 3.0, "unit": "x"},
    ]


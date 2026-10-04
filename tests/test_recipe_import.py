"""Recipe import from schema.org JSON-LD."""
from custom_components.family_organizer.recipe_import import recipe_from_html

PAGE = """<html><head>
<script type="application/ld+json">{"@context":"https://schema.org","@graph":[
 {"@type":"WebPage","name":"ignored"},
 {"@type":["Recipe"],"name":"Fluffy &amp; Easy Pancakes","recipeYield":"4 servings",
  "prepTime":"PT10M","totalTime":"PT30M","image":{"url":"https://example.com/p.jpg"},
  "recipeIngredient":["2 cups flour","1 egg","<b>1</b> cup milk"],
  "recipeInstructions":[{"@type":"HowToSection","itemListElement":[{"@type":"HowToStep","text":"Mix."}]},
                        {"@type":"HowToStep","text":"Fry until golden."}],
  "keywords":"breakfast, easy","recipeCategory":"Breakfast"}
]}</script></head><body></body></html>"""


def test_recipe_from_html_extracts_schema_org_recipe():
    recipe = recipe_from_html(PAGE, "https://example.com/pancakes")
    assert recipe["title"] == "Fluffy & Easy Pancakes"
    assert recipe["servings"] == 4
    assert recipe["prep_time"] == 10
    assert recipe["cook_time"] == 20
    assert recipe["image"] == "https://example.com/p.jpg"
    assert recipe["ingredient_lines"] == ["2 cups flour", "1 egg", "1 cup milk"]
    assert recipe["steps"] == ["Mix.", "Fry until golden."]
    assert recipe["tags"] == ["breakfast", "easy", "Breakfast"]
    assert recipe["source_url"] == "https://example.com/pancakes"


def test_recipe_from_html_without_recipe_returns_none():
    assert recipe_from_html("<html><script type='application/ld+json'>{bad json</script></html>", "u") is None
    assert recipe_from_html("<html><p>no data</p></html>", "u") is None

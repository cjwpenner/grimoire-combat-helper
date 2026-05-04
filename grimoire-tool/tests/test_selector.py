import random
from grimoire_tool.models import Monster, Multiattack, Action
from grimoire_tool.selector import select_turn

def test_selector_multiattack():
    m = Monster(
        id=1, name="Test", size="Medium", type="Beast", challenge_rating=1, xp=200, 
        armor_class=10, hit_points=10, hit_dice="1d8", speed={}, ability_scores={},
        traits=[], actions=[], multiattack=Multiattack(description="Attacks twice")
    )
    turn = select_turn(m)
    assert turn["kind"] == "multiattack"
    assert turn["description"] == "Attacks twice"

def test_selector_single_action():
    m = Monster(
        id=1, name="Test", size="Medium", type="Beast", challenge_rating=1, xp=200, 
        armor_class=10, hit_points=10, hit_dice="1d8", speed={}, ability_scores={},
        traits=[], actions=[Action(id="bite", name="Bite", kind="melee", description="Bites")]
    )
    turn = select_turn(m)
    assert turn["kind"] == "single"
    assert turn["action"].id == "bite"

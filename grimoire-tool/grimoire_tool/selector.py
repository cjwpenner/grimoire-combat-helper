import random
from typing import Dict, Any
from .models import Monster

def select_turn(monster: Monster, rng: random.Random = None) -> Dict[str, Any]:
    """
    Generates a 'this turn' action for the selected monster.
    Honours the rule that multiattackers multiattack, and gives 
    single-action monsters variety where they have multiple actions.
    """
    if rng is None:
        rng = random.Random()
        
    if monster.multiattack is not None:
        # Show the multiattack description verbatim AND the full action list.
        return {
            "kind": "multiattack",
            "description": monster.multiattack.description,
            "actions": monster.actions,
        }
    else:
        # No multiattack: pick one action at random.
        if not monster.actions:
             return {
                "kind": "single",
                "action": None
            }
        return {
            "kind": "single",
            "action": rng.choice(monster.actions),
        }

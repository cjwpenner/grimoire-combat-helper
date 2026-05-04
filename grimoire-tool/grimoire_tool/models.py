from dataclasses import dataclass, field
from typing import List, Optional, Dict, Any

@dataclass
class Trait:
    name: str
    description: str

@dataclass
class Damage:
    formula: Optional[str] = None
    type: Optional[str] = None
    average: Optional[int] = None
    versatile_formula: Optional[str] = None
    versatile_average: Optional[int] = None

@dataclass
class Action:
    id: str
    name: str
    kind: str
    description: str
    attack_bonus: Optional[int] = None
    reach_or_range: Optional[str] = None
    damage: Optional[Damage] = None
    rider_effect: Optional[str] = None

@dataclass
class Multiattack:
    description: str
    patterns: Optional[Any] = None

@dataclass
class Monster:
    id: int
    name: str
    size: str
    type: str
    challenge_rating: float
    xp: int
    armor_class: int
    hit_points: int
    hit_dice: str
    speed: Dict[str, int]
    ability_scores: Dict[str, int]
    traits: List[Trait]
    actions: List[Action]
    
    subtype: Optional[str] = None
    alignment: Optional[str] = None
    armor_class_note: Optional[str] = None
    saving_throws: Optional[Dict[str, int]] = None
    skills: Optional[Dict[str, int]] = None
    damage_vulnerabilities: Optional[str] = None
    damage_resistances: Optional[str] = None
    damage_immunities: Optional[str] = None
    condition_immunities: Optional[str] = None
    senses: Optional[str] = None
    languages: Optional[str] = None
    multiattack: Optional[Multiattack] = None
    reactions: List[Any] = field(default_factory=list)
    v1_unsupported_features: List[str] = field(default_factory=list)

    @classmethod
    def from_dict(cls, data: dict) -> 'Monster':
        kwargs = data.copy()
        
        # Instantiate nested complex objects
        traits_data = kwargs.pop('traits', [])
        kwargs['traits'] = [Trait(**t) for t in traits_data]
        
        actions_data = kwargs.pop('actions', [])
        actions_obj_list = []
        for a in actions_data:
            damage_data = a.pop('damage', None)
            damage_obj = Damage(**damage_data) if damage_data else None
            actions_obj_list.append(Action(damage=damage_obj, **a))
        kwargs['actions'] = actions_obj_list
        
        multiattack_data = kwargs.pop('multiattack', None)
        if multiattack_data:
            kwargs['multiattack'] = Multiattack(**multiattack_data)
            
        return cls(**kwargs)

from .models import Monster, Action, Trait
from typing import Dict, Any

def format_stat_block(monster: Monster, difficulty: str) -> str:
    lines = []
    
    # format CR
    cr_str = str(monster.challenge_rating)
    if cr_str.endswith(".0"): cr_str = cr_str[:-2]
    elif monster.challenge_rating == 0.125: cr_str = "1/8"
    elif monster.challenge_rating == 0.25: cr_str = "1/4"
    elif monster.challenge_rating == 0.5: cr_str = "1/2"

    lines.append(f"──── {monster.name} (CR {cr_str}, ☠ {difficulty} for this party) ────")
    lines.append(f"{monster.size} {monster.type}{f' ({monster.subtype})' if monster.subtype else ''}, {monster.alignment or 'unaligned'}")
    
    ac_note = f" ({monster.armor_class_note})" if monster.armor_class_note else ""
    lines.append(f"AC {monster.armor_class}{ac_note} | HP {monster.hit_points} ({monster.hit_dice}) | Speed {', '.join(f'{k} {v} ft.' for k, v in monster.speed.items())}")
    
    # Abilities
    abilities = []
    for stat in ['str', 'dex', 'con', 'int', 'wis', 'cha']:
        val = monster.ability_scores.get(stat, 10)
        mod = (val - 10) // 2
        abilities.append(f"{stat.upper()} {val} ({mod:+d})")
    lines.append(" ".join(abilities))
    
    # Defenses etc
    if monster.damage_immunities:
        lines.append(f"Damage Immunities: {monster.damage_immunities}")
    if monster.damage_resistances:
        lines.append(f"Damage Resistances: {monster.damage_resistances}")
    if monster.damage_vulnerabilities:
        lines.append(f"Damage Vulnerabilities: {monster.damage_vulnerabilities}")
    if monster.condition_immunities:
        lines.append(f"Condition Immunities: {monster.condition_immunities}")
    if monster.senses:
        lines.append(f"Senses: {monster.senses}")
    if monster.languages:
        lines.append(f"Languages: {monster.languages}")
        
    lines.append("")
    
    if monster.traits:
        lines.append("Traits:")
        for t in monster.traits:
            lines.append(f"  • {t.name} — {t.description}")
        lines.append("")
        
    return "\n".join(lines)

def format_turn(turn_data: Dict[str, Any], turn_num: int) -> str:
    lines = []
    if turn_data["kind"] == "multiattack":
        lines.append(f"▶ Turn {turn_num} — Multiattack:")
        lines.append(f"   \"{turn_data['description']}\"")
        lines.append("")
        lines.append("   Available attacks:")
        for action in turn_data["actions"]:
            lines.append(f"     • {format_action_summary(action)}")
    elif turn_data["kind"] == "single":
        action = turn_data["action"]
        if action is None:
            lines.append(f"▶ Turn {turn_num} — No actions available.")
        else:
            lines.append(f"▶ Turn {turn_num} — Single Action:")
            lines.append(f"     • {format_action_summary(action)}")
    return "\n".join(lines)

def format_action_summary(action: Action) -> str:
    parts = [action.name]
    if action.attack_bonus is not None:
        parts.append(f"{action.attack_bonus:+d}")
    if action.damage:
        dmg = []
        if action.damage.formula:
            dmg.append(action.damage.formula)
        if action.damage.type:
            dmg.append(action.damage.type)
        if action.damage.versatile_formula:
            dmg.append(f"({action.damage.versatile_formula} two-handed)")
        if dmg:
            parts.append(" ".join(dmg))
    if action.rider_effect:
        parts.append(f"⚠ {action.rider_effect}")
    return "  ".join(parts)

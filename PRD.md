# Grimoire Combat Helper — Product Requirements Document

| Field | Value |
|---|---|
| Document title | Grimoire Combat Helper — Phase 1 PRD |
| Author | Chris Penner |
| Version | 0.2 (post-Josie review) |
| Date | 4 May 2026 |
| Status | For review |

---

## Change log

**v0.2 — 4 May 2026**

- Removed the `families` collection from the Grimoire and the family-merge step from the load pipeline. Monsters now carry every trait inline; the runtime code is correspondingly simpler (no inheritance lookup, no merge loop).
- Imported 322 SRD monsters from the Open5e community dataset, replacing the 12-monster starter set.
- Multiattack representation simplified: each multiattacker carries a verbatim `description` string instead of structured patterns. Structured patterns are listed as a future enhancement that can be hand-curated for the most-used monsters.
- Added a `v1_unsupported_features` flag on spellcasting and legendary monsters so the tool can include them in the picker but warn Josie that some abilities aren't modelled.

**v0.1 — 3 May 2026**

- Initial draft.

---

## 1. Background and Context

Josie is running D&D 5e campaigns as Dungeon Master. During combat she needs to remember, for each monster on the field, what attacks it can make on its turn, what bonuses to roll, and how much damage to apply. With multiple monsters and multiple players this is a real cognitive load for a young DM.

This project builds a small Python tool that holds a curated monster compendium (the **Grimoire**) and presents per-turn attack details on demand. Phase 1 is a local command-line tool. Phase 2 wraps the same logic in a React web frontend hosted on a small VM.

The project is also a teaching opportunity — it gives Josie and Chris something concrete to build together that uses Python, JSON data modelling, simple algorithms, and (later) web frontend.

## 2. Goals

1. Reduce DM cognitive load: a single screen tells Josie what a monster does this turn.
2. Encounter awareness: tell Josie whether a chosen monster is appropriate for the party in front of her.
3. Variety with correctness: introduce randomness without breaking D&D rules. Multiattackers always multiattack — randomness sits between alternative single actions for monsters that have more than one to choose from.
4. Extensibility: the Grimoire is a single JSON file with a flat per-monster shape — Josie can add or edit monsters herself without learning about cross-references.
5. Phase 2 readiness: keep the data and logic free of UI assumptions so a React frontend can wrap it cleanly.

## 3. Non-Goals

The following are **explicitly out of scope** for V1:

- Persistent state across sessions (selected monster and party config are remembered only within a single run).
- HP / damage / score tracking — Josie tracks scores on paper.
- Player character data — only monsters are modelled.
- Spellcasting monsters' spell logic and Legendary Actions. These monsters are *included in the data* (so Josie can pick them) but the tool only models their physical attacks. A clear warning is shown so Josie knows to consult a stat block for the rest.
- Initiative tracking, conditions, status effects, recharge tracking (e.g. dragon breath).
- Multi-monster orchestration (e.g. running a band of four goblins simultaneously). V1 handles one selected monster at a time.
- Combat narrative or flavour-text generation.
- Dice rolling for attacks and damage. The tool shows formulas; Josie rolls real dice.
- Structured multiattack patterns (e.g. "this turn it does 1× bite + 1× claws"). V1 shows the multiattack description verbatim; Josie reads it and runs the underlying attacks. See section 10 and section 15 for the rationale and the upgrade path.

These are all reasonable Phase 3+ enhancements but adding them to V1 would inflate scope and slow delivery.

## 4. User Persona

**Josie** — the DM. She knows D&D mechanics well enough to run a campaign. She is comfortable opening a terminal and typing simple commands when shown how. She is not a programmer (yet). The tool needs to be readable by her and ideally something she can extend by editing JSON.

## 5. User Stories

1. *As a DM*, I want to enter the size and average level of the party at the start, so the tool can flag monster difficulty for me.
2. *As a DM*, I want to pick a monster from a list, so I can see its full stat block at a glance.
3. *As a DM*, I want to press a key to see what the monster does this turn, so I can tell the players quickly.
4. *As a DM*, I want each turn's attack to feel a bit different (when the monster has options), so combat doesn't feel mechanical.
5. *As a DM*, I want to see whether a monster is too easy, balanced, or deadly for my party before I commit to using it.
6. *As a DM*, I want to switch to a different monster mid-encounter without restarting the tool.
7. *As a DM*, I want a clear warning when a monster has abilities the tool isn't modelling (spells, legendary actions), so I know to grab the full stat block.

## 6. Functional Requirements

| ID | Requirement |
|---|---|
| F1 | The tool loads the Grimoire from a local JSON file at startup. |
| F2 | The tool prompts for, and accepts, party size (1–8) and average party level (1–20) at startup. |
| F3 | For each monster in the Grimoire, the tool computes a difficulty label (Easy / Moderate / Hard / Deadly / Beyond Deadly) given the current party config. |
| F4 | The tool presents a selectable monster list (sorted by CR, with an option to filter by difficulty band) with the difficulty label visible. With 322 monsters the picker must support search-by-name and pagination. |
| F5 | When a monster is selected, the tool displays its summary: name, size/type/subtype, CR, AC, HP, speed, ability scores, traits, damage immunities/resistances/vulnerabilities, condition immunities, senses, languages. |
| F6 | The tool generates a "this turn" action for the selected monster on demand. If the monster has a multiattack, the multiattack description is shown alongside the full list of attack actions (so Josie can read off all the individual rolls). If the monster has no multiattack, one action is selected at random from `actions`. |
| F7 | A "next" command produces a new turn for the same monster. |
| F8 | A "switch" command returns to the monster picker without losing the party config. |
| F9 | A "quit" command exits cleanly. |
| F10 | If a monster's action carries a rider effect (e.g. werewolf bite curse, wolf bite knockdown), it is shown alongside the attack details. |
| F11 | If a monster has a `v1_unsupported_features` flag (e.g. spellcaster, legendary), a warning banner is shown above the stat block listing what the tool isn't modelling. |

## 7. Non-Functional Requirements

| ID | Requirement |
|---|---|
| NF1 | Pure Python 3.10+. No compiled extensions, no system dependencies beyond the standard library and a JSON schema validator. |
| NF2 | Runs on Windows 11 (Chris's primary environment) without modification. Cross-platform-clean (no Windows-only imports). |
| NF3 | No network calls. Fully local. |
| NF4 | Per-action response in under 100 ms. Loading 322 monsters from a ~780 KB JSON file at startup must complete in under 250 ms. |
| NF5 | Code structured for reuse: data layer, logic layer, and presentation layer separated so Phase 2 can swap CLI for web. |
| NF6 | Readable by a teenager — meaningful names, comments where the rules logic isn't obvious. |
| NF7 | Schema-validated Grimoire load. If the JSON is malformed or missing required fields, the tool fails loudly with a clear message naming the offending monster. |

## 8. Data Model

The Grimoire is a single flat JSON document with two top-level collections (metadata and monsters). Each monster is self-contained — to know everything about a goblin you read the goblin's record and nothing else.

### 8.1 Top-level structure

```json
{
  "schema_version": "0.2.0",
  "metadata": { ... },
  "monsters": [ ... ]
}
```

### 8.2 Monster

A Monster is one entry in the compendium. All shared traits that would have been factored out into a "family" in v0.1 are instead duplicated inline. This simplifies runtime and means one monster's data can be read or hand-edited in isolation.

Fields:

| Field | Type | Notes |
|---|---|---|
| `id` | string | Slug used as primary key. |
| `name`, `size`, `type` | string | Display metadata. `subtype` and `alignment` optional. |
| `challenge_rating` | number | Supports fractional values 0.0, 0.125, 0.25, 0.5. |
| `xp` | integer | DMG XP value for this CR. Drives difficulty calculation. |
| `armor_class` | integer | Plus optional `armor_class_note`. |
| `hit_points`, `hit_dice` | integer / string | |
| `speed` | object | `{ "walk": 30, "fly": 60, ... }` in feet. |
| `ability_scores` | object | `{ "str": 10, "dex": 10, ... }`. |
| `saving_throws` | object | Optional. Bonus per ability where the monster has proficiency. |
| `skills` | object | Optional. |
| `damage_vulnerabilities`, `damage_resistances`, `damage_immunities`, `condition_immunities` | string | All optional. |
| `senses`, `languages` | string | Optional. |
| `traits` | array | Passive abilities — see 8.3. |
| `actions` | array | Per-turn attacks and abilities — see 8.4. |
| `multiattack` | object or null | Multiattack description if the monster has one — see 8.5. |
| `reactions` | array | Optional, display-only. |
| `v1_unsupported_features` | array | Optional flags: `"spellcaster"`, `"legendary"`. Triggers F11 warning. |

### 8.3 Trait

A passive ability, displayed as part of the stat block. Not directly used by the per-turn selector.

```json
{
  "name": "Pack Tactics",
  "description": "Has advantage on an attack roll against a creature if at least one of its allies is within 5 feet of the creature and the ally isn't incapacitated."
}
```

### 8.4 Action

An Action is a single attack or special ability that can be used on a turn.

```json
{
  "id": "bite_wolf_or_hybrid_form_only",
  "name": "Bite (Wolf or Hybrid Form Only)",
  "kind": "melee",
  "description": "Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 6 (1d8 + 2) piercing damage. If the target is a humanoid, it must succeed on a DC 12 Constitution saving throw or be cursed with werewolf lycanthropy.",
  "attack_bonus": 4,
  "reach_or_range": "5 ft.",
  "damage": { "formula": "1d8+2", "type": "piercing", "average": 6 },
  "rider_effect": "DC 12 Constitution saving throw or be cursed with werewolf lycanthropy."
}
```

`kind` is one of `melee`, `ranged`, `melee_or_ranged`, `special`. The `rider_effect` field captures secondary effects (knockdown, curse, save-vs-X) so Josie sees them at attack time. `damage` may also carry `versatile_formula` and `versatile_average` for two-handed weapon variants.

### 8.5 Multiattack

When present on a monster, multiattack defines what happens on a normal turn. In V1 this is just a verbatim description from the source.

```json
"multiattack": {
  "description": "The werewolf makes two attacks: two with its spear (humanoid form) or one with its bite and one with its claws (hybrid form).",
  "patterns": null
}
```

The `patterns` field is reserved for a V1.1+ feature where a structured multiattack composition can be hand-curated for select monsters (see section 15). When patterns are present, the selector can resolve them deterministically; when patterns are null, V1 falls back to showing the description string and the full action list.

### 8.6 Why no families?

The original draft modelled "families" (Lycanthropes, Pack Hunters, Goblinoids …) as a normalised collection with shared traits, and merged them into each monster at load time. Josie and Chris reviewed and concluded:

- Normalisation pays off when data updates frequently. The Grimoire is read-only at runtime.
- Inheritance adds a load-time merge step and forces the picker / display to know about two collections instead of one.
- Trait duplication across ~10 lycanthropes or ~20 wolves is trivial in JSON terms.
- Hand-editing a single self-contained monster record is easier for someone learning the data model.

The flat schema wins on simplicity for both the human reading the file and the code reading the file. Trait grouping is a *data-collection* concern, not a *data-modelling* concern.

## 9. Encounter Difficulty Algorithm

Two implementations are specified. **Method A** ships in V1; **Method B** is a future enhancement and shouldn't gate V1 delivery.

### Method A — Simple CR vs APL (V1)

Compare monster XP to a per-character XP threshold table from the 5e DMG. Standard thresholds for a single character at each level are:

| Level | Easy | Moderate | Hard | Deadly |
|---|---|---|---|---|
| 1 | 25 | 50 | 75 | 100 |
| 2 | 50 | 100 | 150 | 200 |
| 3 | 75 | 150 | 225 | 400 |
| 4 | 125 | 250 | 375 | 500 |
| 5 | 250 | 500 | 750 | 1100 |
| 6 | 300 | 600 | 900 | 1400 |
| 7 | 350 | 750 | 1100 | 1700 |
| 8 | 450 | 900 | 1400 | 2100 |
| 9 | 550 | 1100 | 1600 | 2400 |
| 10 | 600 | 1200 | 1900 | 2800 |

(Full table to L20 ships in the implementation.)

Algorithm:

```
party_easy     = sum(easy_threshold[level]     for level in party_levels)
party_moderate = sum(moderate_threshold[level] for level in party_levels)
party_hard     = sum(hard_threshold[level]     for level in party_levels)
party_deadly   = sum(deadly_threshold[level]   for level in party_levels)

# Single monster, no encounter multiplier (multiplier × 1.0).
monster_score = monster.xp

if   monster_score < party_easy:     return "Easy"
elif monster_score < party_moderate: return "Moderate"
elif monster_score < party_hard:     return "Hard"
elif monster_score < party_deadly:   return "Deadly"
else:                                return "Beyond Deadly"
```

For the simplified case where the user supplies only an *average* level rather than a roster, multiply that level's per-character thresholds by `party_size`.

### Method B — XP-budget with encounter multiplier (V1.1+)

The full DMG method also folds in a multiplier when several monsters fight together (×1.5 for two, ×2 for three to six, etc.) and adjusts for very small or very large parties. This matters once Josie wants to run multiple monsters in one fight. Specify and ship after V1 is stable.

## 10. Random Action Selection Algorithm

The selection rule for V1 is:

```
def select_turn(monster, rng):
    if monster.multiattack is not None:
        # Show the multiattack description verbatim AND the full action list.
        # Josie reads the description and rolls the underlying attacks.
        return {
            "kind": "multiattack",
            "description": monster.multiattack.description,
            "actions": monster.actions,
        }
    else:
        # No multiattack: pick one action at random.
        return {
            "kind": "single",
            "action": rng.choice(monster.actions),
        }
```

This honours the rule that multiattackers multiattack and gives single-action monsters variety where they have multiple actions to choose from. The multiattack output for one turn looks like:

> **Turn 3 — Multiattack:**
> *"The werewolf makes two attacks: two with its spear (humanoid form) or one with its bite and one with its claws (hybrid form)."*
>
> Available attacks:
> - **Bite** — +4 to hit, 1d8+2 piercing — *On hit, humanoid target makes DC 12 CON save or cursed*
> - **Claws** — +4 to hit, 2d4+2 slashing
> - **Spear** — +4 to hit, 1d6+2 piercing (1d8+2 two-handed)

This is honest to what the data structurally encodes and avoids the tool silently picking the wrong combination of attacks. See section 15 for the structured-pattern upgrade path.

## 11. CLI Interaction Design (V1)

The V1 interface is an interactive command-line loop. With 322 monsters, the picker is search-driven rather than a single long list.

```
$ python -m grimoire_tool

╭──────────────────────────╮
│   Josie's Grimoire v0.2  │
│   322 monsters loaded    │
╰──────────────────────────╯

How many adventurers in the party? [1-8]: 4
Average party level? [1-20]: 3

Browse [a]ll, [s]earch by name, or [f]ilter by difficulty? f
Show monsters of which difficulty? [easy/moderate/hard/deadly]: hard

  CR  Name              Notes
  ─────────────────────────────────────────────
  2   Wererat           ★ Hard
  2   Bandit Captain    ★ Hard
  2   Ogre              ★ Hard
  2   Cult Fanatic      ★ Hard  ⚠ spells
  2   Druid             ★ Hard  ⚠ spells
  ...

Enter a name or row number, [m]ore, [s]witch view, [q]uit: werewolf

──── Werewolf (CR 3, ☠ Deadly for this party) ────
Medium humanoid (human), chaotic evil
AC 11 (12 in wolf or hybrid form) | HP 58 (9d8+18) | Speed 30 ft.
STR 15 (+2) DEX 13 (+1) CON 14 (+2) INT 10 (+0) WIS 11 (+0) CHA 10 (+0)
Damage Immunities: bludgeoning, piercing, slashing from non-silvered weapons

Traits:
  • Shapechanger — Can polymorph into wolf or hybrid form.
  • Keen Hearing and Smell — Advantage on Perception checks involving hearing or smell.

[Enter] for next turn  |  [s] switch monster  |  [q] quit
›

▶ Turn 1 — Multiattack:
   "The werewolf makes two attacks: two with its spear (humanoid form)
    or one with its bite and one with its claws (hybrid form)."

   Available attacks:
     • Bite  +4  1d8+2 piercing  ⚠ DC 12 CON save or curse of lycanthropy
     • Claws +4  2d4+2 slashing
     • Spear +4  1d6+2 piercing (1d8+2 two-handed)

[Enter] for next turn  |  [s] switch monster  |  [q] quit
›
```

Quiet, dense, scannable. Enter advances. Letters do everything else.

## 12. Recommended Project Structure

```
grimoire-tool/
├── grimoire/
│   └── grimoire.json              # the data file
├── grimoire_tool/
│   ├── __init__.py
│   ├── models.py                  # dataclasses: Monster, Trait, Action, Multiattack
│   ├── loader.py                  # JSON load + schema validation
│   ├── difficulty.py              # XP threshold table, difficulty calc
│   ├── selector.py                # turn selection logic
│   ├── presenter.py               # formats actions for console display
│   └── cli.py                     # interactive REPL — entry point
├── tests/
│   ├── test_loader.py
│   ├── test_difficulty.py
│   └── test_selector.py
├── pyproject.toml
├── requirements.txt               # likely just jsonschema + pytest
└── README.md
```

Run with `python -m grimoire_tool` or `python -m grimoire_tool.cli`.

This layout keeps **logic separable from UI**: in Phase 2, `models`, `loader`, `difficulty`, and `selector` are reused unchanged; only `cli.py` and `presenter.py` are replaced by a FastAPI layer + React frontend.

The `loader` module is significantly simpler in v0.2 than it would have been in v0.1 — there is no family-merge step. Loading is now: read JSON → validate → instantiate dataclasses.

## 13. Phase 2 (Web Frontend) — Brief Notes

*Out of scope for this PRD beyond the architectural hand-off.*

- Stack: React (Vite + TypeScript) + Tailwind, hosted on a small Linux VM.
- Backend: FastAPI wrapping the same `grimoire_tool` package, exposing `GET /monsters`, `GET /monsters/{id}/turn`, `GET /encounter/difficulty`. Or — given the Grimoire is ~780 KB and read-only — ship the JSON statically and run the logic client-side in TypeScript.
- State: party config and selected monster live in URL query string or `sessionStorage`. No server-side persistence (matches V1 ethos).
- Auth: none for V1.

## 14. Data Sources and Licensing

The Grimoire is a transformation of the **System Reference Document 5.1 (SRD 5.1)**, which Wizards of the Coast released under the **Creative Commons Attribution 4.0 International (CC-BY-4.0)** licence. The bulk import was performed via the **Open5e** community dataset (open5e.com), specifically the `wotc-srd` document collection from the open5e-api repository.

Attribution is included in the Grimoire's `metadata.source` field. If the tool is published or distributed, the CC-BY-4.0 attribution must be visible in the UI as well.

## 15. Open Questions / Decisions Needed

| # | Question | Default assumption |
|---|---|---|
| Q1 | D&D 5e (2014) or 2024 revised rules? | 2014 — Open5e's wotc-srd dataset is the 2014 SRD 5.1. The 2024 SRD has separate availability and would require a re-import. |
| Q2 | Does Josie want the tool to *roll* attacks and damage, or just show formulas? | Show formulas only. Keeps her in charge and avoids dice-engine complexity. |
| Q3 | For the 142 multiattackers, do we need structured patterns in V1, or is the verbatim description enough? | Description-only for V1. Structured patterns for ~30 popular monsters can be hand-curated in V1.1 by populating the reserved `multiattack.patterns` field. |
| Q4 | Is "average party level" enough, or should the tool accept a per-character roster? | Average level for V1; per-character is cleaner but more typing. |
| Q5 | Should V1 support displaying multiple selected monsters side-by-side (e.g. 4 goblins + 1 hobgoblin)? | No — single-monster focus for V1. |
| Q6 | 37 SRD monsters are spellcasters and 30 are legendary. Include them with a warning, or exclude them? | Include with the `v1_unsupported_features` warning (F11). Excluding would hide common picks like Mage, Lich, Adult Red Dragon. |
| Q7 | The picker needs to handle 322 entries. Search by name + filter by difficulty band — enough? | Yes for V1. Filter by monster type (beast / undead / dragon …) is a small Phase 1.5 add. |

## 16. Glossary

| Term | Meaning |
|---|---|
| **APL** | Average Party Level. The mean level of the player characters. |
| **CR** | Challenge Rating. The 5e measure of a monster's combat difficulty, ranging from 0 to 30. Below 1 it is expressed as a fraction (1/8, 1/4, 1/2). |
| **AC** | Armor Class. The number an attacker must meet or beat with an attack roll to hit. |
| **HP** | Hit Points. Damage capacity. |
| **Multiattack** | An action that allows a monster to make several individual attacks on a single turn. |
| **Stat block** | The structured data sheet that defines a monster — AC, HP, abilities, actions and so on. |
| **SRD** | System Reference Document. The publicly licensed subset of D&D rules and content. Version 5.1 is current and CC-BY-4.0. |
| **Open5e** | A community-maintained API and dataset that mirrors the SRD plus other OGL/CC-licensed content. |

---

*End of PRD v0.2.*

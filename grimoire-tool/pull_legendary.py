import json
import os
import requests
import re
import time

GRIMOIRE_JSON_PATH = os.path.join(os.path.dirname(__file__), "..", "grimoire-web", "public", "grimoire.json")
CLI_JSON_PATH = os.path.join(os.path.dirname(__file__), "grimoire", "grimoire.json")

def slugify(text):
    return re.sub(r'[^a-z0-9]+', '-', text.lower()).strip('-')

def fetch_legendary_actions():
    with open(GRIMOIRE_JSON_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    monsters = data.get("monsters", [])
    updated_count = 0

    for monster in monsters:
        if "legendary" in monster.get("v1_unsupported_features", []):
            name_slug = slugify(monster["name"])
            url = f"https://www.dnd5eapi.co/api/monsters/{name_slug}"
            print(f"Fetching legendary actions for {monster['name']}...")
            
            try:
                response = requests.get(url)
                if response.status_code == 200:
                    monster_data = response.json()
                    raw_legendary = monster_data.get("legendary_actions", [])
                    
                    if raw_legendary:
                        actions = []
                        for la in raw_legendary:
                            action = {
                                "id": slugify(la["name"]),
                                "name": la["name"],
                                "kind": "legendary",
                                "description": la.get("desc", ""),
                            }
                            
                            # Handle damage if present
                            raw_damage = la.get("damage", [])
                            if raw_damage and isinstance(raw_damage, list) and len(raw_damage) > 0:
                                d = raw_damage[0]
                                if "damage_dice" in d:
                                    action["damage"] = {
                                        "formula": d["damage_dice"],
                                    }
                                    if "damage_type" in d and "name" in d["damage_type"]:
                                        action["damage"]["type"] = d["damage_type"]["name"].lower()
                                        
                            actions.append(action)
                            
                        monster["legendary_actions"] = actions
                        monster["v1_unsupported_features"].remove("legendary")
                        updated_count += 1
                        print(f"  -> Added {len(actions)} legendary actions.")
                    else:
                        print(f"  -> No legendary actions found in API response.")
                else:
                    print(f"  -> Failed to fetch. HTTP {response.status_code}")
            except Exception as e:
                print(f"  -> Error: {e}")
                
            time.sleep(0.5) # Be polite to the API

    print(f"\nSuccessfully updated {updated_count} monsters with legendary actions.")

    # Save progress
    if updated_count > 0:
        with open(GRIMOIRE_JSON_PATH, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=4)
        
        with open(CLI_JSON_PATH, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=4)

if __name__ == "__main__":
    fetch_legendary_actions()

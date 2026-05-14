import json
import os

GRIMOIRE_JSON_PATH = os.path.join(os.path.dirname(__file__), "..", "grimoire-web", "public", "grimoire.json")
CLI_JSON_PATH = os.path.join(os.path.dirname(__file__), "grimoire", "grimoire.json")

def reset_ids():
    with open(GRIMOIRE_JSON_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    ids_to_reset = {39, 50, 52, 56, 90, 96, 110, 114, 123, 125, 139, 144, 146, 149, 152, 153, 156, 162, 163, 165, 166, 184, 197, 207, 208, 221, 233, 247, 250, 272, 274, 303, 305}
    for monster in data.get("monsters", []):
        if monster.get("id") in ids_to_reset:
            monster.pop("has_image", None)
            monster.pop("image_url", None)
            print(f"Reset {monster['name']}")
            
    with open(GRIMOIRE_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4)
        
    with open(CLI_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4)
        
if __name__ == "__main__":
    reset_ids()

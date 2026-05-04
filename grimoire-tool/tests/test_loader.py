import pytest
from pathlib import Path
from grimoire_tool.loader import load_grimoire

def test_load_grimoire():
    base_dir = Path(__file__).parent.parent
    json_path = base_dir / "grimoire" / "grimoire.json"
    schema_path = base_dir / "grimoire" / "schema.json"
    
    monsters = load_grimoire(json_path, schema_path)
    assert len(monsters) > 0
    assert monsters[0].name == "Awakened Shrub"

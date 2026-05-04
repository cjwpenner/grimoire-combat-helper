import json
import jsonschema
from pathlib import Path
from typing import List

from .models import Monster

def load_grimoire(json_path: Path, schema_path: Path) -> List[Monster]:
    """Loads the grimoire JSON, validates it against the schema, and returns a list of Monster objects."""
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    with open(schema_path, 'r', encoding='utf-8') as f:
        schema = json.load(f)
        
    try:
        jsonschema.validate(instance=data, schema=schema)
    except jsonschema.exceptions.ValidationError as e:
        # The PRD requires failing loudly naming the offending monster if possible.
        path = " -> ".join([str(p) for p in e.absolute_path])
        raise ValueError(f"Schema validation failed at {path}: {e.message}")
        
    monsters_data = data.get('monsters', [])
    monsters = [Monster.from_dict(m) for m in monsters_data]
    return monsters

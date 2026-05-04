import json
from pathlib import Path

json_path = Path(r"c:\Users\Chris\DandD\grimoire-tool\grimoire\grimoire.json")
with open(json_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

for idx, m in enumerate(data.get('monsters', []), start=1):
    m['id'] = idx

with open(json_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2)

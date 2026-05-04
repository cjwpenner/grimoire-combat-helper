import sys
import math
from pathlib import Path
from .loader import load_grimoire
from .difficulty import calculate_difficulty
from .presenter import format_stat_block, format_turn
from .selector import select_turn

def clear_screen():
    print("\033[H\033[J", end="")

def run():
    print("╭──────────────────────────╮")
    print("│   Josie's Grimoire v0.2  │")
    
    # Setup paths
    base_dir = Path(__file__).parent.parent
    json_path = base_dir / "grimoire" / "grimoire.json"
    schema_path = base_dir / "grimoire" / "schema.json"
    
    try:
        monsters = load_grimoire(json_path, schema_path)
    except Exception as e:
        print(f"Error loading grimoire: {e}")
        return
        
    print(f"│   {len(monsters)} monsters loaded    │")
    print("╰──────────────────────────╯\n")
    
    party_size_str = input("How many adventurers in the party? [1-8]: ").strip()
    try:
        party_size = int(party_size_str)
    except ValueError:
        party_size = 4
        
    avg_level_str = input("Average party level? [1-20]: ").strip()
    try:
        avg_level = int(avg_level_str)
    except ValueError:
        avg_level = 3
        
    print()
    
    while True:
        # Monster Picker Loop
        while True:
            mode = input("Browse [a]ll, [t]ype, [s]earch by name, or [f]ilter by difficulty? ").strip().lower()
            if mode in ['a', 't', 's', 'f']:
                break
                
        filtered_monsters = monsters
        if mode == 't':
            types = sorted(list(set(m.type for m in monsters)))
            print("Available types:")
            type_display = [f"{i}: {t}" for i, t in enumerate(types, 1)]
            print(", ".join(type_display))
            
            type_cmd = input("\nEnter a type ID or name: ").strip().lower()
            try:
                type_idx = int(type_cmd) - 1
                if 0 <= type_idx < len(types):
                    type_term = types[type_idx].lower()
                    filtered_monsters = [m for m in monsters if m.type.lower() == type_term]
                else:
                    print("Invalid type ID.")
                    filtered_monsters = []
            except ValueError:
                matched_types = [t.lower() for t in types if t.lower().startswith(type_cmd)]
                filtered_monsters = [m for m in monsters if m.type.lower() in matched_types]
                if not filtered_monsters:
                    print("No matching types found.")
        elif mode == 's':
            term = input("Search term: ").strip().lower()
            filtered_monsters = [m for m in monsters if m.name.lower().startswith(term)]
        elif mode == 'f':
            diff_input = input("Show monsters of which difficulty? [1: easy, 2: moderate, 3: hard, 4: deadly]: ").strip().lower()
            
            diff_term = None
            if diff_input in ['1', '1)', 'e'] or 'easy'.startswith(diff_input): diff_term = 'Easy'
            elif diff_input in ['2', '2)', 'm'] or 'moderate'.startswith(diff_input): diff_term = 'Moderate'
            elif diff_input in ['3', '3)', 'h'] or 'hard'.startswith(diff_input): diff_term = 'Hard'
            elif diff_input in ['4', '4)', 'd'] or 'deadly'.startswith(diff_input): diff_term = 'Deadly'
            
            if diff_term:
                filtered_monsters = [m for m in monsters if calculate_difficulty(m.xp, party_size, avg_level) == diff_term or (diff_term == "Deadly" and calculate_difficulty(m.xp, party_size, avg_level) == "Beyond Deadly")]
            else:
                print("Invalid difficulty selection.")
                filtered_monsters = []

        filtered_monsters.sort(key=lambda m: m.challenge_rating)
        
        page_size = 15
        page = 0
        total_pages = math.ceil(len(filtered_monsters) / page_size) if filtered_monsters else 1
        
        selected_monster = None
        
        while not selected_monster:
            if not filtered_monsters:
                print("No monsters found.")
                break
                
            print("\n  CR   ID    Name              Notes")
            print("  ───────────────────────────────────────────────────")
            
            start_idx = page * page_size
            end_idx = start_idx + page_size
            page_monsters = filtered_monsters[start_idx:end_idx]
            
            for m in page_monsters:
                diff = calculate_difficulty(m.xp, party_size, avg_level)
                notes = f"★ {diff}"
                if m.v1_unsupported_features:
                    notes += f"  ⚠ {', '.join(m.v1_unsupported_features)}"
                
                cr_str = str(m.challenge_rating)
                if cr_str.endswith(".0"):
                    cr_str = cr_str[:-2]
                elif m.challenge_rating == 0.125: cr_str = "1/8"
                elif m.challenge_rating == 0.25: cr_str = "1/4"
                elif m.challenge_rating == 0.5: cr_str = "1/2"
                    
                print(f"  {cr_str:<4} {m.id:<5} {m.name:<17} {notes}")
                
            print(f"\nPage {page+1}/{total_pages}")
            cmd = input("\nEnter an ID or name, [m]ore, [p]revious, [s]witch view, [q]uit: ").strip().lower()
            
            if cmd == 'q':
                sys.exit(0)
            elif cmd == 's':
                break # Break out to picker view loop
            elif cmd == 'm':
                page = (page + 1) % total_pages
            elif cmd == 'p':
                page = (page - 1 + total_pages) % total_pages
            else:
                matches = []
                try:
                    cmd_id = int(cmd)
                    matches = [m for m in filtered_monsters if m.id == cmd_id]
                except ValueError:
                    pass
                
                if not matches:
                    matches = [m for m in filtered_monsters if m.name.lower() == cmd]
                if not matches:
                    matches = [m for m in filtered_monsters if cmd in m.name.lower()]
                    
                if matches:
                    selected_monster = matches[0]
                else:
                    print("Monster not found.")
                    
        if not selected_monster:
            continue
            
        # Combat Loop
        turn_num = 1
        switch = False
        while not switch:
            clear_screen()
            diff = calculate_difficulty(selected_monster.xp, party_size, avg_level)
            
            if selected_monster.v1_unsupported_features:
                print(f"⚠ WARNING: Tool does not model {', '.join(selected_monster.v1_unsupported_features)} for this monster.")
                print()
                
            print(format_stat_block(selected_monster, diff))
            
            turn_data = select_turn(selected_monster)
            print(format_turn(turn_data, turn_num))
            print()
            
            cmd = input("[Enter] for next turn  |  [s] switch monster  |  [q] quit\n› ").strip().lower()
            if cmd == 'q':
                sys.exit(0)
            elif cmd == 's':
                switch = True
                print("\n")
                
            turn_num += 1

from grimoire_tool.difficulty import calculate_difficulty

def test_difficulty_easy():
    # 4 players level 1 -> easy threshold 100
    # < 100 is Easy
    assert calculate_difficulty(10, 4, 1) == "Easy"

def test_difficulty_hard():
    # 4 players level 3 -> easy 300, moderate 600, hard 900, deadly 1600
    # >= 600 and < 900 is Hard according to PRD
    assert calculate_difficulty(700, 4, 3) == "Hard"

def test_difficulty_deadly():
    # >= 900 and < 1600 is Deadly according to PRD
    assert calculate_difficulty(1000, 4, 3) == "Deadly"

def test_difficulty_beyond_deadly():
    # >= 1600 is Beyond Deadly
    assert calculate_difficulty(1600, 4, 3) == "Beyond Deadly"

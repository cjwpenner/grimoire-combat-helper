import React, { useState, useMemo } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { calculateDifficulty } from '../lib/difficulty';
import MonsterCard from './MonsterCard';
import { LayoutContextType } from './Layout';

export function MonsterPicker() {
  // Party config lives in Layout's context so it survives navigation and
  // stays in sync with the difficulty shown on the detail page.
  const { monsters, partySize, setPartySize, avgLevel, setAvgLevel } =
    useOutletContext<LayoutContextType>();
  const navigate = useNavigate();
  const partyConfig = { size: partySize, level: avgLevel };
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');

  const filteredMonsters = useMemo(() => {
    let filtered = monsters;

    if (searchTerm) {
      filtered = filtered.filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (difficultyFilter !== 'all') {
      filtered = filtered.filter(m => {
        const difficulty = calculateDifficulty(m.xp, partyConfig.size, partyConfig.level);
        return difficulty.toLowerCase() === difficultyFilter.toLowerCase();
      });
    }

    return filtered.sort((a, b) => a.challenge_rating - b.challenge_rating);
  }, [searchTerm, difficultyFilter, partyConfig, monsters]);

  const handleSelectMonster = (monsterId: string) => {
    navigate(`/monster/${monsterId}`);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-4">
      {/* Party Config */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div>
          <label className="text-sm text-[var(--text-secondary)]">Party Size</label>
          <input
            type="number"
            min="1"
            max="8"
            value={partySize}
            onChange={(e) => setPartySize(parseInt(e.target.value) || 1)}
            className="w-full px-3 py-2 rounded border border-[var(--border-color)] bg-[var(--card-bg)] text-[var(--text-primary)]"
          />
        </div>
        <div>
          <label className="text-sm text-[var(--text-secondary)]">Avg Level</label>
          <input
            type="number"
            min="1"
            max="20"
            value={avgLevel}
            onChange={(e) => setAvgLevel(parseInt(e.target.value) || 1)}
            className="w-full px-3 py-2 rounded border border-[var(--border-color)] bg-[var(--card-bg)] text-[var(--text-primary)]"
          />
        </div>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search monsters..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full px-4 py-3 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] text-[var(--text-primary)] mb-4 sticky top-0 z-10"
      />

      {/* Difficulty Filter Pills */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {['all', 'easy', 'moderate', 'hard', 'deadly', 'beyond deadly'].map(diff => (
          <button
            key={diff}
            onClick={() => setDifficultyFilter(diff)}
            className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition ${
              difficultyFilter === diff
                ? 'bg-[var(--accent)] text-white opacity-100'
                : 'bg-[var(--card-bg)] text-[var(--text-primary)] opacity-60'
            }`}
          >
            {diff.charAt(0).toUpperCase() + diff.slice(1)}
          </button>
        ))}
      </div>

      {/* Monster Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMonsters.map(monster => (
          <button
            key={monster.id}
            onClick={() => handleSelectMonster(monster.id.toString())}
            className="text-left"
          >
            <MonsterCard monster={monster} partyConfig={partyConfig} />
          </button>
        ))}
      </div>

      {filteredMonsters.length === 0 && (
        <div className="text-center py-12">
          <p className="text-[var(--text-secondary)]">No monsters found.</p>
        </div>
      )}

      <div className="text-center text-sm text-[var(--text-secondary)] mt-8">
        Showing {filteredMonsters.length} of {monsters.length} monsters
      </div>
    </div>
  );
}

import React, { useState, useMemo } from 'react';
import { Monster } from '../lib/models';
import { calculateDifficulty } from '../lib/difficulty';

interface MonsterPickerProps {
  monsters: Monster[];
  partySize: number;
  avgLevel: number;
  onSelect: (m: Monster) => void;
}

export function MonsterPicker({ monsters, partySize, avgLevel, onSelect }: MonsterPickerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [diffFilter, setDiffFilter] = useState('');

  const types = useMemo(() => Array.from(new Set(monsters.map(m => m.type))).sort(), [monsters]);

  const filteredMonsters = useMemo(() => {
    return monsters.filter(m => {
      const matchName = m.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchType = typeFilter ? m.type === typeFilter : true;
      let matchDiff = true;
      if (diffFilter) {
        const diff = calculateDifficulty(m.xp, partySize, avgLevel);
        if (diffFilter === 'Deadly') {
          matchDiff = diff === 'Deadly' || diff === 'Beyond Deadly';
        } else {
          matchDiff = diff === diffFilter;
        }
      }
      return matchName && matchType && matchDiff;
    }).sort((a, b) => a.challenge_rating - b.challenge_rating);
  }, [monsters, searchTerm, typeFilter, diffFilter, partySize, avgLevel]);

  return (
    <div className="glass-panel flex-col gap-4">
      <div className="flex" style={{ gap: '1rem', flexWrap: 'wrap' }}>
        <input 
          placeholder="Search by name..." 
          value={searchTerm} 
          onChange={e => setSearchTerm(e.target.value)}
          style={{ flex: 1, minWidth: '200px' }}
        />
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={{ flex: 1, minWidth: '150px' }}>
          <option value="">All Types</option>
          {types.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={diffFilter} onChange={e => setDiffFilter(e.target.value)} style={{ flex: 1, minWidth: '150px' }}>
          <option value="">All Difficulties</option>
          <option value="Easy">Easy</option>
          <option value="Moderate">Moderate</option>
          <option value="Hard">Hard</option>
          <option value="Deadly">Deadly / Beyond</option>
        </select>
      </div>

      <div style={{ maxHeight: '600px', overflowY: 'auto', paddingRight: '0.5rem' }} className="flex-col gap-2">
        {filteredMonsters.length === 0 && <div className="text-muted text-center mt-4">No monsters found.</div>}
        {filteredMonsters.map(m => {
          const diff = calculateDifficulty(m.xp, partySize, avgLevel);
          let crStr = m.challenge_rating.toString();
          if (m.challenge_rating === 0.125) crStr = "1/8";
          else if (m.challenge_rating === 0.25) crStr = "1/4";
          else if (m.challenge_rating === 0.5) crStr = "1/2";
          
          return (
            <div 
              key={m.id} 
              className="glass-panel flex justify-between items-center" 
              style={{ cursor: 'pointer', padding: '1rem', background: 'rgba(255,255,255,0.02)', transition: 'background 0.2s ease' }}
              onClick={() => onSelect(m)}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
            >
              <div>
                <div className="font-semibold">{m.name}</div>
                <div className="text-sm text-muted">CR {crStr} • {m.type}</div>
              </div>
              <div className="text-sm font-semibold" style={{ color: diff.includes('Deadly') ? 'var(--danger)' : diff === 'Hard' ? 'var(--warning)' : 'var(--text-main)' }}>
                {diff}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

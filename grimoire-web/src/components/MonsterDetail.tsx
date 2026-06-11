import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useOutletContext } from 'react-router-dom';
import { Monster } from '../lib/models';
import { selectTurn, TurnData } from '../lib/selector';
import StatBlock from './StatBlock';
import { CombatTurn } from './CombatTurn';

interface LayoutContextType {
  monsters: Monster[];
  partySize: number;
  avgLevel: number;
}

export default function MonsterDetail() {
  const { id } = useParams<{ id: string }>();
  const { monsters, partySize, avgLevel } = useOutletContext<LayoutContextType>();
  const monster = id ? monsters.find(m => m.id === parseInt(id)) : undefined;
  const [tab, setTab] = useState<'stat' | 'combat'>('stat');
  const partyConfig = { size: partySize, level: avgLevel };
  const [turns, setTurns] = useState<TurnData[]>([]);

  if (!monster) {
    return (
      <div className="p-4">
        <p className="text-[var(--text-secondary)]">Monster not found.</p>
      </div>
    );
  }

  const handleCombatTabClick = () => {
    setTab('combat');
    if (turns.length === 0) {
      setTurns([selectTurn(monster)]);
    }
  };

  const nextTurn = () => setTurns(prev => [...prev, selectTurn(monster)]);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-4">
      {/* Tab Navigation */}
      <div className="flex gap-4 mb-6 border-b border-[var(--border-color)]">
        <button
          onClick={() => setTab('stat')}
          className={`pb-3 font-semibold transition ${
            tab === 'stat'
              ? 'border-b-2 border-[var(--accent)] text-[var(--accent)]'
              : 'text-[var(--text-secondary)]'
          }`}
        >
          Stats
        </button>
        <button
          onClick={handleCombatTabClick}
          className={`pb-3 font-semibold transition ${
            tab === 'combat'
              ? 'border-b-2 border-[var(--accent)] text-[var(--accent)]'
              : 'text-[var(--text-secondary)]'
          }`}
        >
          Combat
        </button>
      </div>

      {/* Tab Content */}
      {tab === 'stat' && <StatBlock monster={monster} partyConfig={partyConfig} />}
      {tab === 'combat' && (
        <div className="flex flex-col gap-4">
          {turns.map((t, idx) => (
            <CombatTurn key={idx} turn={t} turnNum={idx + 1} />
          ))}
          <button
            onClick={nextTurn}
            className="self-center mt-4 px-8 py-3 rounded-lg bg-[var(--accent)] text-white font-semibold hover:opacity-90 transition"
          >
            Roll Next Turn
          </button>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Monster } from '../lib/models';
import { calculateDifficulty } from '../lib/difficulty';
import { selectTurn, TurnData } from '../lib/selector';
import { CombatTurn } from './CombatTurn';

interface Props {
  monster: Monster;
  partySize: number;
  avgLevel: number;
  onBack: () => void;
}

export function MonsterCard({ monster, partySize, avgLevel, onBack }: Props) {
  const [turns, setTurns] = useState<TurnData[]>([]);
  
  useEffect(() => {
    setTurns([selectTurn(monster)]);
  }, [monster]);

  const diff = calculateDifficulty(monster.xp, partySize, avgLevel);
  
  let crStr = monster.challenge_rating.toString();
  if (monster.challenge_rating === 0.125) crStr = "1/8";
  else if (monster.challenge_rating === 0.25) crStr = "1/4";
  else if (monster.challenge_rating === 0.5) crStr = "1/2";

  const nextTurn = () => setTurns(prev => [...prev, selectTurn(monster)]);

  return (
    <div className="flex-col gap-4">
      <button onClick={onBack} style={{ alignSelf: 'flex-start', background: 'transparent', border: '1px solid var(--panel-border)' }}>
        ← Back to list
      </button>

      <div className="glass-panel flex" style={{ gap: '2rem', flexWrap: 'wrap' }}>
        {/* Placeholder Image Box */}
        <div style={{ flex: '1 1 300px', minHeight: '300px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--panel-border)', background: 'rgba(0,0,0,0.2)' }}>
          <img 
            src={`${import.meta.env.BASE_URL}werewolf.png`} 
            alt={monster.name} 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        </div>

        <div style={{ flex: '2 1 400px' }} className="flex-col gap-4">
          <div>
            <h2 className="text-xl" style={{ color: 'var(--accent-hover)' }}>{monster.name}</h2>
            <div className="text-sm text-muted mt-2">
              {monster.size} {monster.type} {monster.subtype && `(${monster.subtype})`} • CR {crStr} • <span style={{ color: diff.includes('Deadly') ? 'var(--danger)' : diff === 'Hard' ? 'var(--warning)' : 'var(--text-main)' }}>{diff}</span>
            </div>
          </div>
          
          <div className="flex gap-4 text-sm">
            <div><strong>AC:</strong> {monster.armor_class} {monster.armor_class_note && `(${monster.armor_class_note})`}</div>
            <div><strong>HP:</strong> {monster.hit_points} ({monster.hit_dice})</div>
          </div>

          <div className="flex gap-4" style={{ flexWrap: 'wrap' }}>
            {['str', 'dex', 'con', 'int', 'wis', 'cha'].map(stat => {
              const val = (monster.ability_scores as any)[stat] || 10;
              const mod = Math.floor((val - 10) / 2);
              return (
                <div key={stat} className="flex-col items-center glass-panel" style={{ padding: '0.5rem', flex: 1, minWidth: '60px' }}>
                  <span className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>{stat}</span>
                  <span className="font-semibold">{val}</span>
                  <span className="text-sm text-muted">{mod >= 0 ? `+${mod}` : mod}</span>
                </div>
              );
            })}
          </div>

          {monster.v1_unsupported_features && monster.v1_unsupported_features.length > 0 && (
            <div className="glass-panel" style={{ background: 'rgba(239, 68, 68, 0.1)', borderColor: 'var(--danger)' }}>
              <span className="text-sm" style={{ color: '#fca5a5' }}>
                ⚠ Tool does not model: {monster.v1_unsupported_features.join(', ')}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="flex-col gap-4 mt-4">
        {turns.map((t, idx) => <CombatTurn key={idx} turn={t} turnNum={idx + 1} />)}
        <button onClick={nextTurn} style={{ alignSelf: 'center', marginTop: '1rem', padding: '1rem 3rem' }}>
          Roll Next Turn
        </button>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { Monster } from '../lib/models';
import { calculateDifficulty } from '../lib/difficulty';
import { getDifficultyColor } from '../lib/theme';
import { selectTurn, TurnData } from '../lib/selector';
import { CombatTurn } from './CombatTurn';

// ── Display card (used in MonsterPicker grid) ──────────────────────────────
interface CardProps {
  monster: Monster;
  partyConfig: { size: number; level: number };
}

export default function MonsterCard({ monster, partyConfig }: CardProps) {
  const difficulty = calculateDifficulty(monster.xp, partyConfig.size, partyConfig.level);
  const color = getDifficultyColor(difficulty);

  return (
    <div className="p-4 rounded-lg bg-[var(--card-bg)] border border-[var(--border-color)] hover:shadow-lg transition">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <h3 className="font-bold text-lg text-[var(--text-primary)]">{monster.name}</h3>
          <p className="text-sm text-[var(--text-secondary)]">
            {monster.size} {monster.type}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs font-semibold text-[var(--text-secondary)]">CR {monster.challenge_rating}</p>
        </div>
      </div>

      <div
        className="inline-block px-3 py-1 rounded-full text-white font-semibold text-sm"
        style={{ backgroundColor: color }}
      >
        {difficulty}
      </div>
    </div>
  );
}

// ── Detail page (used at /monster/:id route) ───────────────────────────────
interface LayoutContextType {
  monsters: Monster[];
  partySize: number;
  avgLevel: number;
}

export function MonsterDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { monsters, partySize, avgLevel } = useOutletContext<LayoutContextType>();

  const monster = id ? monsters.find(m => m.id === parseInt(id)) : undefined;

  if (!monster) {
    return <div className="text-muted text-center mt-4">Monster not found.</div>;
  }
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
      <button onClick={() => navigate('/')} style={{ alignSelf: 'flex-start', background: 'transparent', border: '1px solid var(--panel-border)' }}>
        ← Back to list
      </button>

      <div className="glass-panel flex" style={{ gap: '2rem', flexWrap: 'wrap' }}>
        {/* Image Box */}
        <div style={{ flex: '1 1 300px', aspectRatio: '1 / 1', alignSelf: 'flex-start', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--panel-border)', background: 'rgba(0,0,0,0.2)' }}>
          <img
            src={monster.has_image && monster.image_url ? `${import.meta.env.BASE_URL}${monster.image_url}` : `${import.meta.env.BASE_URL}werewolf.png`}
            alt={monster.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
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

      <div className="mt-4">
        <details className="glass-panel" style={{ cursor: 'pointer' }}>
          <summary className="text-lg font-semibold" style={{ color: 'var(--accent-hover)', outline: 'none' }}>
            Stat Block & Available Actions
          </summary>
          <div className="flex-col gap-4 mt-4 text-sm" style={{ cursor: 'default' }}>

            {monster.traits && monster.traits.length > 0 && (
              <div>
                <h4 className="font-semibold text-lg" style={{ color: 'var(--text-main)', borderBottom: '1px solid var(--panel-border)', marginBottom: '0.5rem' }}>Traits</h4>
                {monster.traits.map(t => (
                  <p key={t.name} className="mt-2"><strong>{t.name}.</strong> {t.description}</p>
                ))}
              </div>
            )}

            {monster.actions && monster.actions.length > 0 && (
              <div>
                <h4 className="font-semibold text-lg" style={{ color: 'var(--text-main)', borderBottom: '1px solid var(--panel-border)', marginBottom: '0.5rem' }}>Actions</h4>
                {monster.actions.map(a => (
                  <p key={a.name} className="mt-2"><strong>{a.name}.</strong> {a.description}</p>
                ))}
              </div>
            )}

            {monster.legendary_actions && monster.legendary_actions.length > 0 && (
              <div>
                <h4 className="font-semibold text-lg" style={{ color: 'var(--text-main)', borderBottom: '1px solid var(--panel-border)', marginBottom: '0.5rem' }}>Legendary Actions</h4>
                <p className="text-muted" style={{ fontStyle: 'italic', marginBottom: '0.5rem' }}>The monster can take 3 legendary actions, choosing from the options below. Only one legendary action option can be used at a time and only at the end of another creature's turn. The monster regains spent legendary actions at the start of its turn.</p>
                {monster.legendary_actions.map(la => (
                  <p key={la.name} className="mt-2"><strong>{la.name}.</strong> {la.description}</p>
                ))}
              </div>
            )}

          </div>
        </details>
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

import React, { useState } from 'react';
import { TurnData } from '../lib/selector';
import { Action } from '../lib/models';
import DiceRoller from './DiceRoller';

export function CombatTurn({ turn, turnNum }: { turn: TurnData; turnNum: number }) {
  const [diceRollerOpen, setDiceRollerOpen] = useState(false);
  const [diceFormula, setDiceFormula] = useState('1d20');

  const openDiceRoller = (formula: string) => {
    setDiceFormula(formula);
    setDiceRollerOpen(true);
  };

  const renderAction = (a: Action) => (
    <div key={a.id} className="mt-2 p-3 bg-[var(--bg-primary)] rounded-lg">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="text-sm">
          <strong>{a.name}</strong>
          {a.attack_bonus !== undefined && (
            <span className="ml-1 text-[var(--text-secondary)]">+{a.attack_bonus}</span>
          )}
          {a.damage && (
            <span className="ml-2 text-[var(--text-secondary)]">
              {a.damage.formula} {a.damage.type}
            </span>
          )}
          {a.rider_effect && (
            <span style={{ color: 'var(--warning)' }} className="ml-2">
              ⚠ {a.rider_effect}
            </span>
          )}
        </div>
        <div className="flex gap-2">
          {a.attack_bonus !== undefined && (
            <button
              onClick={() => openDiceRoller(`1d20+${a.attack_bonus}`)}
              className="text-xs px-3 py-1 rounded font-semibold bg-[var(--accent)] text-black"
            >
              Roll Attack
            </button>
          )}
          {a.damage?.formula && (
            <button
              onClick={() => openDiceRoller(a.damage!.formula!)}
              className="text-xs px-3 py-1 rounded font-semibold border border-[var(--accent)] text-[var(--accent)]"
            >
              Roll Damage
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="glass-panel" style={{ borderLeft: '4px solid var(--accent-color)' }}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg">
          ▶ Turn {turnNum}{' '}
          {turn.strategy && (
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9em' }}>- {turn.strategy}</span>
          )}
        </h3>
      </div>

      {turn.movement && (
        <div className="text-sm mt-2" style={{ color: 'var(--text-color)', opacity: 0.8 }}>
          <em>🏃 {turn.movement}</em>
        </div>
      )}

      <div className="mt-4">
        {turn.description && (
          <p className="text-muted" style={{ fontStyle: 'italic', marginBottom: '1rem' }}>
            "{turn.description}"
          </p>
        )}

        {turn.actions && turn.actions.length > 0 && (
          <div className="flex-col gap-2">
            <span className="text-sm font-semibold">Available attacks:</span>
            {turn.actions.map(a => renderAction(a))}
          </div>
        )}

        {turn.action && (
          <div className="mt-2">
            {renderAction(turn.action)}
          </div>
        )}

        {(!turn.actions || turn.actions.length === 0) && !turn.action && (
          <div className="text-muted">No actions available.</div>
        )}
      </div>

      {diceRollerOpen && (
        <DiceRoller
          initialFormula={diceFormula}
          onClose={() => setDiceRollerOpen(false)}
        />
      )}
    </div>
  );
}

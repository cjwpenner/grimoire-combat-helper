import React from 'react';
import { TurnData } from '../lib/selector';

export function CombatTurn({ turn, turnNum }: { turn: TurnData; turnNum: number }) {
  return (
    <div className="glass-panel" style={{ borderLeft: '4px solid var(--accent-color)' }}>
      <h3 className="text-lg">▶ Turn {turnNum}</h3>
      <div className="mt-4">
        {turn.kind === 'multiattack' ? (
          <>
            <p className="text-muted" style={{ fontStyle: 'italic', marginBottom: '1rem' }}>"{turn.description}"</p>
            <div className="flex-col gap-2">
              <span className="text-sm font-semibold">Available attacks:</span>
              {turn.actions?.map(a => (
                <div key={a.id} className="text-sm">
                  • <strong>{a.name}</strong> {a.attack_bonus !== undefined && `+${a.attack_bonus}`} 
                  {a.damage && ` ${a.damage.formula} ${a.damage.type}`}
                  {a.rider_effect && <span style={{ color: 'var(--warning)' }}> ⚠ {a.rider_effect}</span>}
                </div>
              ))}
            </div>
          </>
        ) : turn.action ? (
          <div className="text-sm mt-2">
            • <strong>{turn.action.name}</strong> {turn.action.attack_bonus !== undefined && `+${turn.action.attack_bonus}`} 
            {turn.action.damage && ` ${turn.action.damage.formula} ${turn.action.damage.type}`}
            {turn.action.rider_effect && <span style={{ color: 'var(--warning)' }}> ⚠ {turn.action.rider_effect}</span>}
          </div>
        ) : (
          <div className="text-muted">No actions available.</div>
        )}
      </div>
    </div>
  );
}

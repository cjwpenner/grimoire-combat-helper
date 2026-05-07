import React from 'react';
import { TurnData } from '../lib/selector';
import { Action } from '../lib/models';

export function CombatTurn({ turn, turnNum }: { turn: TurnData; turnNum: number }) {
  const renderAction = (a: Action) => (
    <div key={a.id} className="text-sm mt-1">
      • <strong>{a.name}</strong> {a.attack_bonus !== undefined && `+${a.attack_bonus}`} 
      {a.damage && ` ${a.damage.formula} ${a.damage.type}`}
      {a.rider_effect && <span style={{ color: 'var(--warning)' }}> ⚠ {a.rider_effect}</span>}
    </div>
  );

  return (
    <div className="glass-panel" style={{ borderLeft: '4px solid var(--accent-color)' }}>
      <h3 className="text-lg">
        ▶ Turn {turnNum} {turn.strategy && <span style={{ color: 'var(--text-muted)', fontSize: '0.9em' }}>- {turn.strategy}</span>}
      </h3>
      
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
    </div>
  );
}

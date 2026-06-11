import React, { useState } from 'react';
import { rollDice, isValidFormula } from '../lib/diceRoller';

export interface DiceRollerProps {
  initialFormula?: string;
  onClose: () => void;
}

interface RollHistory {
  formula: string;
  result: number;
  breakdown: string;
  time: string;
}

export default function DiceRoller({ initialFormula = '', onClose }: DiceRollerProps) {
  const [formula, setFormula] = useState(initialFormula);
  const [history, setHistory] = useState<RollHistory[]>([]);
  const [currentRoll, setCurrentRoll] = useState<{ result: number; breakdown: string } | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [error, setError] = useState('');

  const handleRoll = () => {
    setError('');
    if (!isValidFormula(formula)) {
      setError('Invalid formula. Use format: 1d20+5');
      return;
    }

    setIsRolling(true);

    setTimeout(() => {
      const roll = rollDice(formula);
      if (roll) {
        setCurrentRoll(roll);
        setHistory(prev => [
          {
            formula,
            result: roll.result,
            breakdown: roll.breakdown,
            time: new Date().toLocaleTimeString(),
          },
          ...prev,
        ].slice(0, 5));
        setIsRolling(false);
      }
    }, 3000);
  };

  const handleRollAgain = () => {
    setFormula(history[0]?.formula || formula);
    setTimeout(() => handleRoll(), 100);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50">
      <div className="w-full bg-[var(--card-bg)] text-[var(--text-primary)] rounded-t-2xl p-6 max-h-96 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Roll Dice</h2>
          <button onClick={onClose} className="text-2xl leading-none">×</button>
        </div>

        <div className="mb-4">
          <label className="text-sm text-[var(--text-secondary)] mb-2 block">Formula</label>
          <input
            type="text"
            value={formula}
            onChange={(e) => setFormula(e.target.value)}
            placeholder="e.g., 1d20+5"
            className="w-full px-4 py-3 rounded border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)]"
          />
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>

        <button
          onClick={handleRoll}
          disabled={isRolling || !isValidFormula(formula)}
          className="w-full bg-[var(--accent)] text-black font-bold py-3 rounded-lg mb-4 disabled:opacity-50"
        >
          {isRolling ? 'Rolling...' : 'Roll'}
        </button>

        {currentRoll && (
          <div className={`bg-[var(--bg-primary)] p-4 rounded-lg mb-4 ${isRolling ? 'dice-rolling' : ''}`}>
            <p className="text-sm text-[var(--text-secondary)] mb-1">Result</p>
            <p className="text-5xl font-bold text-[var(--accent)] mb-2">{currentRoll.result}</p>
            <p className="text-sm text-[var(--text-secondary)]">{currentRoll.breakdown}</p>
            {history.length > 0 && (
              <button
                onClick={handleRollAgain}
                className="mt-3 w-full bg-[var(--header-bg)] text-[var(--text-primary)] py-2 rounded font-semibold"
              >
                Roll Again
              </button>
            )}
          </div>
        )}

        {history.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-[var(--text-secondary)] mb-2">Recent Rolls</p>
            <div className="space-y-2">
              {history.map((roll, i) => (
                <div key={i} className="flex justify-between text-sm p-2 bg-[var(--bg-primary)] rounded">
                  <span>{roll.formula}</span>
                  <span className="font-bold text-[var(--accent)]">{roll.result}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

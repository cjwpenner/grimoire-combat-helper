import React from 'react';

interface HeaderProps {
  partySize: number;
  setPartySize: (n: number) => void;
  avgLevel: number;
  setAvgLevel: (n: number) => void;
}

export function Header({ partySize, setPartySize, avgLevel, setAvgLevel }: HeaderProps) {
  return (
    <header className="glass-panel flex justify-between items-center" style={{ gap: '1rem', flexWrap: 'wrap' }}>
      <div>
        <h1 className="text-xl">Josie's Grimoire</h1>
        <span className="text-sm text-muted">Combat Helper Web v1.0</span>
      </div>
      <div className="flex gap-4 items-center">
        <div className="flex-col gap-2">
          <label className="text-sm font-semibold text-muted">Party Size</label>
          <select 
            value={partySize} 
            onChange={(e) => setPartySize(parseInt(e.target.value) || 1)} 
            style={{ width: '80px' }}
          >
            {[...Array(8)].map((_, i) => (
              <option key={i+1} value={i+1}>{i+1}</option>
            ))}
          </select>
        </div>
        <div className="flex-col gap-2">
          <label className="text-sm font-semibold text-muted">Avg Level</label>
          <select 
            value={avgLevel} 
            onChange={(e) => setAvgLevel(parseInt(e.target.value) || 1)} 
            style={{ width: '80px' }}
          >
            {[...Array(20)].map((_, i) => (
              <option key={i+1} value={i+1}>{i+1}</option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
}

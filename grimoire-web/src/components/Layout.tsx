import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import { Monster } from '../lib/models';

export default function Layout() {
  const [monsters, setMonsters] = useState<Monster[]>([]);
  const [partySize, setPartySize] = useState(4);
  const [avgLevel, setAvgLevel] = useState(3);

  useEffect(() => {
    fetch(import.meta.env.BASE_URL + `grimoire.json?v=${new Date().getTime()}`)
      .then(res => res.json())
      .then(data => {
        setMonsters(data.monsters || []);
      })
      .catch(err => console.error("Error loading grimoire:", err));
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[var(--bg-primary)]">
      <Header
        partySize={partySize}
        setPartySize={setPartySize}
        avgLevel={avgLevel}
        setAvgLevel={setAvgLevel}
      />
      <main className="flex-1 overflow-y-auto pb-safe-bottom">
        <Outlet context={{ monsters, partySize, avgLevel }} />
      </main>
    </div>
  );
}

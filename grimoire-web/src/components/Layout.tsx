import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import { Monster } from '../lib/models';

export interface LayoutContextType {
  monsters: Monster[];
  partySize: number;
  setPartySize: (size: number) => void;
  avgLevel: number;
  setAvgLevel: (level: number) => void;
}

export default function Layout() {
  const [monsters, setMonsters] = useState<Monster[]>([]);
  const [partySize, setPartySize] = useState(4);
  const [avgLevel, setAvgLevel] = useState(3);

  useEffect(() => {
    // No cache-buster here: the service worker serves this stale-while-revalidate,
    // and a unique ?v= per load would bypass its cache and force a full download.
    fetch(import.meta.env.BASE_URL + 'grimoire.json')
      .then(res => res.json())
      .then(data => {
        setMonsters(data.monsters || []);
      })
      .catch(err => console.error("Error loading grimoire:", err));
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[var(--bg-primary)]">
      <Header />
      <main className="flex-1 overflow-y-auto pb-safe-bottom">
        <Outlet context={{ monsters, partySize, setPartySize, avgLevel, setAvgLevel } satisfies LayoutContextType} />
      </main>
    </div>
  );
}

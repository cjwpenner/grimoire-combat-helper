import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { MonsterPicker } from './components/MonsterPicker';
import { MonsterCard } from './components/MonsterCard';
import { Monster } from './lib/models';

function App() {
  const [monsters, setMonsters] = useState<Monster[]>([]);
  const [partySize, setPartySize] = useState(4);
  const [avgLevel, setAvgLevel] = useState(3);
  const [selectedMonster, setSelectedMonster] = useState<Monster | null>(null);

  useEffect(() => {
    fetch(import.meta.env.BASE_URL + 'grimoire.json')
      .then(res => res.json())
      .then(data => {
        setMonsters(data.monsters || []);
      })
      .catch(err => console.error("Error loading grimoire:", err));
  }, []);

  return (
    <>
      <Header 
        partySize={partySize} setPartySize={setPartySize} 
        avgLevel={avgLevel} setAvgLevel={setAvgLevel} 
      />
      
      <main>
        {selectedMonster ? (
          <MonsterCard 
            monster={selectedMonster} 
            partySize={partySize} 
            avgLevel={avgLevel} 
            onBack={() => setSelectedMonster(null)} 
          />
        ) : (
          <MonsterPicker 
            monsters={monsters} 
            partySize={partySize} 
            avgLevel={avgLevel} 
            onSelect={setSelectedMonster} 
          />
        )}
      </main>
    </>
  );
}

export default App;

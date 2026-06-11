import React from 'react';
import { Monster } from '../lib/models';
import { calculateDifficulty } from '../lib/difficulty';

interface Props {
  monster: Monster;
  partyConfig: { size: number; level: number };
}

export default function StatBlock({ monster, partyConfig }: Props) {
  const difficulty = calculateDifficulty(monster.xp, partyConfig.size, partyConfig.level);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="border-b border-[var(--border-color)] pb-4">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">{monster.name}</h2>
        <p className="text-[var(--text-secondary)]">
          {monster.size} {monster.type}
          {monster.subtype && ` (${monster.subtype})`}
          {monster.alignment && `, ${monster.alignment}`}
        </p>
        <div className="mt-2 inline-block px-3 py-1 rounded-full text-white font-semibold text-sm" style={{ backgroundColor: difficulty === 'Deadly' ? '#F44336' : '#FF9800' }}>
          ☠ {difficulty}
        </div>
      </div>

      {/* AC, HP, Speed */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <p className="text-xs text-[var(--text-secondary)] uppercase">AC</p>
          <p className="text-lg font-bold text-[var(--text-primary)]">{monster.armor_class}</p>
          {monster.armor_class_note && <p className="text-xs text-[var(--text-secondary)]">{monster.armor_class_note}</p>}
        </div>
        <div>
          <p className="text-xs text-[var(--text-secondary)] uppercase">HP</p>
          <p className="text-lg font-bold text-[var(--text-primary)]">{monster.hit_points}</p>
          <p className="text-xs text-[var(--text-secondary)]">{monster.hit_dice}</p>
        </div>
        <div>
          <p className="text-xs text-[var(--text-secondary)] uppercase">Speed</p>
          <p className="text-sm font-bold text-[var(--text-primary)]">
            {Object.entries(monster.speed)
              .map(([k, v]) => `${v} ft. ${k}`)
              .join(', ')}
          </p>
        </div>
      </div>

      {/* Ability Scores */}
      <div className="bg-[var(--card-bg)] p-4 rounded-lg">
        <p className="text-xs text-[var(--text-secondary)] uppercase mb-3 font-semibold">Ability Scores</p>
        <div className="grid grid-cols-3 gap-3">
          {Object.entries(monster.ability_scores).map(([ability, score]) => (
            <div key={ability}>
              <p className="text-xs text-[var(--text-secondary)] uppercase">{ability}</p>
              <p className="text-lg font-bold text-[var(--text-primary)]">{score}</p>
              <p className="text-xs text-[var(--text-secondary)]">({score >= 10 ? '+' : ''}{Math.floor((score - 10) / 2)})</p>
            </div>
          ))}
        </div>
      </div>

      {/* Damage Info */}
      {(monster.damage_vulnerabilities || monster.damage_resistances || monster.damage_immunities || monster.condition_immunities) && (
        <div className="space-y-2">
          {monster.damage_vulnerabilities && (
            <p className="text-sm"><span className="font-semibold">Vulnerabilities:</span> {monster.damage_vulnerabilities}</p>
          )}
          {monster.damage_resistances && (
            <p className="text-sm"><span className="font-semibold">Resistances:</span> {monster.damage_resistances}</p>
          )}
          {monster.damage_immunities && (
            <p className="text-sm"><span className="font-semibold">Immunities:</span> {monster.damage_immunities}</p>
          )}
          {monster.condition_immunities && (
            <p className="text-sm"><span className="font-semibold">Condition Immunities:</span> {monster.condition_immunities}</p>
          )}
        </div>
      )}

      {/* Senses & Languages */}
      {(monster.senses || monster.languages) && (
        <div className="space-y-1">
          {monster.senses && <p className="text-sm"><span className="font-semibold">Senses:</span> {monster.senses}</p>}
          {monster.languages && <p className="text-sm"><span className="font-semibold">Languages:</span> {monster.languages}</p>}
        </div>
      )}

      {/* Traits */}
      {monster.traits && monster.traits.length > 0 && (
        <div>
          <p className="text-sm font-semibold mb-2">Traits</p>
          <div className="space-y-2">
            {monster.traits.map((trait, i) => (
              <div key={i} className="text-sm">
                <p className="font-semibold text-[var(--text-primary)]">{trait.name}</p>
                <p className="text-[var(--text-secondary)]">{trait.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Warning for unsupported features */}
      {monster.v1_unsupported_features && monster.v1_unsupported_features.length > 0 && (
        <div className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded-lg border border-yellow-300 dark:border-yellow-700">
          <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-100">⚠ Not Fully Modelled</p>
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            This monster has {monster.v1_unsupported_features.join(', ')} that aren't fully supported. Consult the full stat block.
          </p>
        </div>
      )}
    </div>
  );
}

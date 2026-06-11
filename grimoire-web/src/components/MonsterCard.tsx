import React from 'react';
import { Monster } from '../lib/models';
import { calculateDifficulty } from '../lib/difficulty';
import { getDifficultyColor } from '../lib/theme';

export function monsterImageUrl(monster: Monster): string {
  return (
    import.meta.env.BASE_URL +
    (monster.has_image && monster.image_url ? monster.image_url : 'werewolf.png')
  );
}

interface CardProps {
  monster: Monster;
  partyConfig: { size: number; level: number };
}

export default function MonsterCard({ monster, partyConfig }: CardProps) {
  const difficulty = calculateDifficulty(monster.xp, partyConfig.size, partyConfig.level);
  const color = getDifficultyColor(difficulty);

  return (
    <div className="p-4 rounded-lg bg-[var(--card-bg)] border border-[var(--border-color)] hover:shadow-lg transition">
      <div className="flex items-start gap-3 mb-2">
        <img
          src={monsterImageUrl(monster)}
          alt={monster.name}
          loading="lazy"
          className="w-14 h-14 rounded-lg object-cover border border-[var(--border-color)] shrink-0"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
        <div className="flex-1 min-w-0">
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

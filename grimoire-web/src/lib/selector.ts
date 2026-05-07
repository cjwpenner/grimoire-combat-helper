import { Monster, Action } from './models';

export interface TurnData {
  kind: 'multiattack' | 'single' | 'breath' | 'grapple' | 'special';
  strategy?: string;
  movement?: string;
  description?: string;
  actions?: Action[];
  action?: Action | null;
}

export function selectTurn(monster: Monster): TurnData {
  const isDragon = monster.type.toLowerCase().includes('dragon');
  const flySpeed = monster.speed?.fly || 0;
  const walkSpeed = monster.speed?.walk || 30;
  
  const breathWeapon = monster.actions?.find(a => a.name.toLowerCase().includes('breath') || a.name.toLowerCase().includes('recharge'));
  
  if (isDragon && flySpeed > 0) {
    const roll = Math.random();
    if (roll < 0.30 && breathWeapon) {
      return {
        kind: 'breath',
        strategy: 'Strafing Breath Run',
        movement: `The dragon uses its ${flySpeed} ft. fly speed to stay out of melee range, sweeping over the party.`,
        description: 'Targets the largest cluster of players with its breath weapon, prioritizing spellcasters. It then continues its flight path to stay airborne.',
        action: breathWeapon,
      };
    } else if (roll < 0.50) {
      const grappleAttacks = monster.actions?.filter(a => a.name.toLowerCase().includes('claw') || a.name.toLowerCase().includes('bite')) || [];
      return {
        kind: 'grapple',
        strategy: 'Snatch and Drop',
        movement: `The dragon dives at a vulnerable target, using its full movement to grapple and lift them into the air.`,
        description: 'Attempts to grapple a lightly-armored target. If successful, it flies upwards and drops them on its next turn, dealing falling damage and isolating them from the group.',
        actions: grappleAttacks.length > 0 ? grappleAttacks : undefined,
        action: grappleAttacks.length === 0 ? monster.actions?.[0] : undefined
      };
    } else if (roll < 0.70 && monster.multiattack) {
      return {
        kind: 'multiattack',
        strategy: 'Intelligent Assault',
        movement: 'The dragon lands aggressively, using the environment to its advantage (breaking floors or causing cave-ins if applicable).',
        description: 'Focuses its multiattack on the most threatening or heavily damaged target to eliminate them from the fight.',
        actions: monster.actions,
      };
    }
  }

  const isFast = walkSpeed >= 40 || flySpeed >= 40;
  if (isFast && monster.multiattack) {
     if (Math.random() < 0.4) {
       const speedText = flySpeed > 0 ? `${flySpeed} ft. flying` : `${walkSpeed} ft.`;
       return {
         kind: 'multiattack',
         strategy: 'Hit and Run',
         movement: `The creature breaks up its ${speedText} movement. It dashes in, attacks, and uses the remaining speed to retreat behind cover or out of reach.`,
         description: monster.multiattack.description,
         actions: monster.actions,
       }
     }
  }

  if (!isDragon && breathWeapon && Math.random() < 0.3) {
    return {
      kind: 'special',
      strategy: 'Devastating Ability',
      movement: 'Positions itself to maximize the impact of its special ability, trying to catch multiple targets.',
      action: breathWeapon,
    }
  }

  if (monster.multiattack) {
    return {
      kind: 'multiattack',
      strategy: 'Direct Assault',
      movement: `The creature moves up to its speed toward the nearest threat to engage in melee.`,
      description: monster.multiattack.description,
      actions: monster.actions,
    };
  }

  if (!monster.actions || monster.actions.length === 0) {
    return {
      kind: 'single',
      action: null,
    };
  }

  const randomIndex = Math.floor(Math.random() * monster.actions.length);
  const action = monster.actions[randomIndex];
  
  return {
    kind: 'single',
    strategy: action.reach_or_range && action.reach_or_range.includes('range') ? 'Ranged Attack' : 'Melee Engagement',
    movement: action.reach_or_range && action.reach_or_range.includes('range') 
      ? 'Maintains distance and seeks cover while firing.'
      : 'Closes the distance to strike.',
    action: action,
  };
}

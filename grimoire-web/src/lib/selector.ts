import { Monster, Action } from './models';

export interface TurnData {
  kind: 'multiattack' | 'single';
  description?: string;
  actions?: Action[];
  action?: Action | null;
}

export function selectTurn(monster: Monster): TurnData {
  if (monster.multiattack) {
    return {
      kind: 'multiattack',
      description: monster.multiattack.description,
      actions: monster.actions,
    };
  } else {
    if (!monster.actions || monster.actions.length === 0) {
      return {
        kind: 'single',
        action: null,
      };
    }
    const randomIndex = Math.floor(Math.random() * monster.actions.length);
    return {
      kind: 'single',
      action: monster.actions[randomIndex],
    };
  }
}

export interface DiceRoll {
  formula: string;
  result: number;
  breakdown: string;
  timestamp: Date;
}

export function parseFormula(formula: string): [number, number, number] | null {
  const normalized = formula.trim().toLowerCase();
  const match = normalized.match(/^(\d+)d(\d+)([\+\-]\d+)?$/);
  if (!match) return null;

  const numDice = parseInt(match[1]);
  const numSides = parseInt(match[2]);
  const bonus = match[3] ? parseInt(match[3]) : 0;

  return [numDice, numSides, bonus];
}

export function rollDice(formula: string): { result: number; breakdown: string } | null {
  const parsed = parseFormula(formula);
  if (!parsed) return null;

  const [numDice, numSides, bonus] = parsed;
  const rolls: number[] = [];

  for (let i = 0; i < numDice; i++) {
    rolls.push(Math.floor(Math.random() * numSides) + 1);
  }

  const diceTotal = rolls.reduce((a, b) => a + b, 0);
  const result = diceTotal + bonus;

  const rollsStr = rolls.join(' + ');
  const breakdown =
    bonus === 0
      ? `${rollsStr} = ${result}`
      : `${rollsStr} + ${bonus} = ${result}`;

  return { result, breakdown };
}

export function isValidFormula(formula: string): boolean {
  return parseFormula(formula) !== null;
}

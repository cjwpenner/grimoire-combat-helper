export const colors = {
  light: {
    background: '#F8F7F4',
    text: {
      primary: '#1A1A1A',
      secondary: '#666666',
    },
    card: '#FFFFFF',
    accent: '#D4AF37', // D&D gold
    header: '#2C1B47', // Deep purple
  },
  dark: {
    background: '#1A1A1A',
    text: {
      primary: '#F8F7F4',
      secondary: '#AAAAAA',
    },
    card: '#2D2D2D',
    accent: '#D4AF37', // D&D gold
    header: '#3D2E5F', // Lighter purple
  },
  difficulty: {
    easy: '#4CAF50',
    moderate: '#FFC107',
    hard: '#FF9800',
    deadly: '#F44336',
    beyondDeadly: '#B71C1C',
  },
};

export function getDifficultyColor(difficulty: string): string {
  switch (difficulty.toLowerCase()) {
    case 'easy':
      return colors.difficulty.easy;
    case 'moderate':
      return colors.difficulty.moderate;
    case 'hard':
      return colors.difficulty.hard;
    case 'deadly':
      return colors.difficulty.deadly;
    case 'beyond deadly':
      return colors.difficulty.beyondDeadly;
    default:
      return colors.difficulty.moderate;
  }
}

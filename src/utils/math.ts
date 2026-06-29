import { UserVow, VowLog, DifficultyTier } from '../types';

export const DIFFICULTY_WEIGHTS: Record<DifficultyTier, number> = {
  easy: 1.0,
  medium: 1.5,
  hard: 2.0
};

interface VowHistory {
  vow: UserVow;
  logs: VowLog[]; // Logs for this vow over the last 30 days
  daysEligible: number; // Cap to 30
}

/**
 * Calculates the Discipline Score (0-100) based on active vows, completion rates, and streak.
 */
export function calculateDisciplineScore(
  vowHistories: VowHistory[],
  longestActiveStreak: number
): number {
  if (vowHistories.length === 0) return 0;

  let totalWeightedCompletion = 0;
  let totalWeights = 0;

  vowHistories.forEach(({ vow, logs, daysEligible }) => {
    if (daysEligible <= 0) return;

    const difficulty = vow.difficulty || 'easy';
    const weight = DIFFICULTY_WEIGHTS[difficulty];
    
    // Count days completed
    const daysCompleted = logs.filter(log => log.completed).length;
    const completionRate = Math.min(1, Math.max(0, daysCompleted / daysEligible));

    totalWeightedCompletion += completionRate * weight;
    totalWeights += weight;
  });

  if (totalWeights === 0) return 0;

  const baseScore = (totalWeightedCompletion / totalWeights) * 100;
  
  // Streak Bonus = min(10, floor(streak / 3))
  const streakBonus = Math.min(10, Math.floor(longestActiveStreak / 3));

  const finalScore = Math.min(100, Math.round(baseScore + streakBonus));

  return Math.max(0, finalScore);
}

/**
 * Determines the title and tier name matching a Discipline Score (0-100).
 */
export function getScoreTier(score: number): string {
  if (score <= 20) return 'Dormant';
  if (score <= 40) return 'Awakening';
  if (score <= 60) return 'Building';
  if (score <= 80) return 'Disciplined';
  if (score <= 95) return 'Forged';
  return 'Unbreakable';
}

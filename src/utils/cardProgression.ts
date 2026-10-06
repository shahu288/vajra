import { calculateCurrentStreak } from './dates';

export type CardStage = 'Locked' | 'Beginner' | 'Disciplined' | 'Consistent' | 'Unbreakable' | 'Vajra';

export interface CardStageStyle {
  textColor: string;
  badgeBg: string;
  borderColor: string;
  glowColor: string;
  foilGradient: readonly [string, string, ...string[]];
  foilName: string;
  isVajra?: boolean;
}

export interface CardProgressionInfo {
  stage: CardStage;
  isUnlocked: boolean;
  stageName: string;
  nextStageName: string;
  nextUpgradeDays: number | null;
  currentStreakDays: number;
  progressCurrent: number;
  progressTarget: number;
  progressText: string;
  requiredDays: number;
  style: CardStageStyle;
}

export const STAGE_STYLES: Record<CardStage, CardStageStyle> = {
  Locked: {
    textColor: '#8A91A0',
    badgeBg: 'rgba(38, 42, 51, 0.4)',
    borderColor: '#262A33',
    glowColor: 'rgba(0, 0, 0, 0)',
    foilGradient: ['#0E1014', '#14171C', '#0B0C0E'],
    foilName: 'OBSIDIAN RUNE',
  },
  Beginner: {
    textColor: '#8A91A0', // Precision metallic slate
    badgeBg: 'rgba(38, 42, 51, 0.6)',
    borderColor: '#262A33',
    glowColor: 'rgba(38, 42, 51, 0.3)',
    foilGradient: ['#262A33', '#3A404E', '#1C2027'],
    foilName: 'OBSIDIAN STEEL',
  },
  Disciplined: {
    textColor: '#F3BA45', // Imperial Gold
    badgeBg: 'rgba(243, 186, 69, 0.15)',
    borderColor: '#F3BA45',
    glowColor: 'rgba(243, 186, 69, 0.25)',
    foilGradient: ['#F3BA45', '#FFE48A', '#B5872A'],
    foilName: 'IMPERIAL GOLD',
  },
  Consistent: {
    textColor: '#7FA2E8', // Refined gold-indigo chrome
    badgeBg: 'rgba(127, 162, 232, 0.15)',
    borderColor: '#5C82C5',
    glowColor: 'rgba(92, 130, 197, 0.25)',
    foilGradient: ['#5C82C5', '#F3BA45', '#1C2538'],
    foilName: 'HOLO INDIGO',
  },
  Unbreakable: {
    textColor: '#4FD18C', // High-end emerald iridescent
    badgeBg: 'rgba(56, 161, 105, 0.15)',
    borderColor: '#38A169',
    glowColor: 'rgba(56, 161, 105, 0.25)',
    foilGradient: ['#38A169', '#F3BA45', '#163324'],
    foilName: 'IRIDESCENT EMERALD',
  },
  Vajra: {
    textColor: '#F5F6F8', // Titanium White Apex
    badgeBg: 'rgba(255, 228, 138, 0.2)',
    borderColor: '#FFE48A',
    glowColor: 'rgba(243, 186, 69, 0.4)',
    foilGradient: ['#F3BA45', '#FFE48A', '#FFFFFF', '#F3BA45'],
    foilName: 'VAJRA IMPERIAL APEX',
    isVajra: true,
  },
};

export function getCardProgression(streakDays: number): CardProgressionInfo {
  if (streakDays < 7) {
    return {
      stage: 'Locked',
      isUnlocked: false,
      stageName: 'Locked',
      nextStageName: 'Beginner',
      nextUpgradeDays: 7,
      currentStreakDays: streakDays,
      progressCurrent: streakDays,
      progressTarget: 7,
      progressText: `${streakDays} / 7 Days`,
      requiredDays: 7,
      style: STAGE_STYLES.Locked,
    };
  } else if (streakDays < 30) {
    return {
      stage: 'Beginner',
      isUnlocked: true,
      stageName: 'Beginner',
      nextStageName: 'Disciplined',
      nextUpgradeDays: 30,
      currentStreakDays: streakDays,
      progressCurrent: streakDays,
      progressTarget: 30,
      progressText: `${streakDays} / 30 Days`,
      requiredDays: 7,
      style: STAGE_STYLES.Beginner,
    };
  } else if (streakDays < 90) {
    return {
      stage: 'Disciplined',
      isUnlocked: true,
      stageName: 'Disciplined',
      nextStageName: 'Consistent',
      nextUpgradeDays: 90,
      currentStreakDays: streakDays,
      progressCurrent: streakDays,
      progressTarget: 90,
      progressText: `${streakDays} / 90 Days`,
      requiredDays: 30,
      style: STAGE_STYLES.Disciplined,
    };
  } else if (streakDays < 180) {
    return {
      stage: 'Consistent',
      isUnlocked: true,
      stageName: 'Consistent',
      nextStageName: 'Unbreakable',
      nextUpgradeDays: 180,
      currentStreakDays: streakDays,
      progressCurrent: streakDays,
      progressTarget: 180,
      progressText: `${streakDays} / 180 Days`,
      requiredDays: 90,
      style: STAGE_STYLES.Consistent,
    };
  } else if (streakDays < 365) {
    return {
      stage: 'Unbreakable',
      isUnlocked: true,
      stageName: 'Unbreakable',
      nextStageName: 'Vajra',
      nextUpgradeDays: 365,
      currentStreakDays: streakDays,
      progressCurrent: streakDays,
      progressTarget: 365,
      progressText: `${streakDays} / 365 Days`,
      requiredDays: 180,
      style: STAGE_STYLES.Unbreakable,
    };
  } else {
    return {
      stage: 'Vajra',
      isUnlocked: true,
      stageName: 'Vajra',
      nextStageName: 'Apex Mastered',
      nextUpgradeDays: null,
      currentStreakDays: streakDays,
      progressCurrent: 365,
      progressTarget: 365,
      progressText: `365 / 365 Days`,
      requiredDays: 365,
      style: STAGE_STYLES.Vajra,
    };
  }
}

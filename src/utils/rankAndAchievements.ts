import { CardStage } from './cardProgression';

export interface RankProgressionTier {
  stage: CardStage;
  name: string;
  subtitle: string;
  requiredDays: number;
  emblem: any;
  description: string;
  material: string;
}

export const CANONICAL_RANKS: RankProgressionTier[] = [
  {
    stage: 'Beginner',
    name: 'BEGINNER',
    subtitle: 'Raw Basalt & Cast-Iron',
    requiredDays: 7,
    emblem: require('../../assets/images/ranks/beginner.jpg'),
    description: 'Raw dark basalt stone crest with rough cast-iron construction and subtle ember cracks.',
    material: 'Basalt & Cast-Iron',
  },
  {
    stage: 'Disciplined',
    name: 'DISCIPLINED',
    subtitle: 'Brushed Steel & Blade',
    requiredDays: 30,
    emblem: require('../../assets/images/ranks/disciplined.jpg'),
    description: 'Refined brushed steel heraldic crest with a central blade motif and sharp geometric construction.',
    material: 'Refined Brushed Steel',
  },
  {
    stage: 'Consistent',
    name: 'CONSISTENT',
    subtitle: 'Imperial Gold & Trishula',
    requiredDays: 90,
    emblem: require('../../assets/images/ranks/consistent.jpg'),
    description: 'Imperial gold royal crest with symmetrical curved blade elements and subtle Indian-inspired trident motifs.',
    material: 'Imperial Gold & Trishula',
  },
  {
    stage: 'Unbreakable',
    name: 'UNBREAKABLE',
    subtitle: 'Obsidian Tungsten Bastion',
    requiredDays: 180,
    emblem: require('../../assets/images/ranks/unbreakable.jpg'),
    description: 'Heavy obsidian and dark tungsten fortress crest with restrained violet and cobalt energy channels.',
    material: 'Obsidian Tungsten Bastion',
  },
  {
    stage: 'Vajra',
    name: 'VAJRA',
    subtitle: 'Celestial Diamond Dorje',
    requiredDays: 365,
    emblem: require('../../assets/images/ranks/vajra.jpg'),
    description: 'Mythic celestial diamond and thunderbolt crest with a multifaceted crystalline core and imperial gold lightning.',
    material: 'Celestial Diamond Dorje',
  },
];

export const RANK_EMBLEMS: Record<CardStage, any> = {
  Locked: require('../../assets/images/ranks/beginner.jpg'),
  Beginner: require('../../assets/images/ranks/beginner.jpg'),
  Disciplined: require('../../assets/images/ranks/disciplined.jpg'),
  Consistent: require('../../assets/images/ranks/consistent.jpg'),
  Unbreakable: require('../../assets/images/ranks/unbreakable.jpg'),
  Vajra: require('../../assets/images/ranks/vajra.jpg'),
};

export interface AchievementItem {
  id: string;
  title: string;
  category: string;
  requirement: string;
  description: string;
  icon: string;
  isEarned: boolean;
  progressText: string;
  progressPercent: number;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Mythic';
}

export function getUserAchievements(params: {
  highestStreak: number;
  activeVowsCount: number;
  recoveryShields: number;
  disciplineScore: number;
  unlockedCardsCount: number;
}): AchievementItem[] {
  const {
    highestStreak,
    activeVowsCount,
    recoveryShields,
    disciplineScore,
    unlockedCardsCount,
  } = params;

  return [
    {
      id: 'ach-first-vow',
      title: 'FIRST VOW',
      category: 'INITIATION',
      requirement: 'Bind your first sacred discipline vow',
      description: 'The foundation of mastery begins with a single unbreakable promise to yourself.',
      icon: '📜',
      isEarned: activeVowsCount > 0,
      progressText: activeVowsCount > 0 ? 'Completed' : '0 / 1 Vow',
      progressPercent: activeVowsCount > 0 ? 100 : 0,
      rarity: 'Common',
    },
    {
      id: 'ach-iron-resolve',
      title: 'IRON RESOLVE',
      category: 'STREAK',
      requirement: 'Maintain a 7-day unbroken streak',
      description: 'The basalt crest stirs. Seven consecutive sunrises defended with quiet resolve.',
      icon: '⚡',
      isEarned: highestStreak >= 7,
      progressText: highestStreak >= 7 ? 'Completed' : `${Math.min(highestStreak, 7)} / 7 Days`,
      progressPercent: Math.min(100, Math.round((highestStreak / 7) * 100)),
      rarity: 'Common',
    },
    {
      id: 'ach-monolithic-will',
      title: 'MONOLITHIC WILL',
      category: 'STREAK',
      requirement: 'Maintain a 14-day unbroken streak',
      description: 'Two full cycles of discipline locked in stone. The blade begins to temper.',
      icon: '🏔️',
      isEarned: highestStreak >= 14,
      progressText: highestStreak >= 14 ? 'Completed' : `${Math.min(highestStreak, 14)} / 14 Days`,
      progressPercent: Math.min(100, Math.round((highestStreak / 14) * 100)),
      rarity: 'Rare',
    },
    {
      id: 'ach-30d-covenant',
      title: '30-DAY COVENANT',
      category: 'COVENANT',
      requirement: 'Forge a 30-day unbroken covenant',
      description: 'A complete lunar covenant forged in steel. Elevates the disciple to the Disciplined stage.',
      icon: '🔥',
      isEarned: highestStreak >= 30,
      progressText: `${Math.min(highestStreak, 30)} / 30 Days`,
      progressPercent: Math.min(100, Math.round((highestStreak / 30) * 100)),
      rarity: 'Epic',
    },
    {
      id: 'ach-shield-guardian',
      title: 'SHIELD GUARDIAN',
      category: 'SQUAD',
      requirement: 'Hold an active recovery shield',
      description: 'Protective ward forged through flawless discipline or vouched by fellow squad members.',
      icon: '🛡️',
      isEarned: recoveryShields > 0,
      progressText: recoveryShields > 0 ? `${recoveryShields} Active` : '0 Active',
      progressPercent: recoveryShields > 0 ? 100 : 0,
      rarity: 'Rare',
    },
    {
      id: 'ach-centurion-mind',
      title: 'CENTURION WILL',
      category: 'MASTERY',
      requirement: 'Reach 100 Discipline Score (MSS)',
      description: 'Unblemished mental fortitude. Complete consistency without wavering.',
      icon: '💎',
      isEarned: disciplineScore >= 100,
      progressText: `${Math.min(disciplineScore, 100)} / 100 MSS`,
      progressPercent: Math.min(100, Math.round((disciplineScore / 100) * 100)),
      rarity: 'Mythic',
    },
  ];
}

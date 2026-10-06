import { CardStage } from './cardProgression';
import { ArchetypeKey, CustomVowMetadata } from '../types';

export type CardRarity = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';

export interface MissionCardData {
  title: string;
  habit: string;
  guardian: string;
  image: any;
  quote: string;
  rarity: CardRarity;
  xpValue: number;
  targetStage: CardStage;
  requiredDays: number;
  isCustom?: boolean;
  category?: 'BODY' | 'MIND' | 'FOCUS';
}

const CARD_ARTWORKS: Record<string, any> = {
  'warriors-dawn': require('../../assets/cards/warriors-dawn.png'),
  'iron-temple': require('../../assets/cards/iron-temple.png'),
  'glacial-forge': require('../../assets/cards/glacial-forge.png'),
  'silent-peak': require('../../assets/cards/silent-peak.png'),
  'endless-library': require('../../assets/cards/endless-library.png'),
  'digital-monk': require('../../assets/cards/digital-monk.png'),
  'purify-vessel': require('../../assets/cards/purify-vessel.png'),
  'wind-walker': require('../../assets/cards/wind-walker.png'),
  'night-guardian': require('../../assets/cards/night-guardian.png'),
  'iron-will': require('../../assets/cards/iron-will.png'),
  'sacred-fuel': require('../../assets/cards/sacred-fuel.png'),
  'the-chronicler': require('../../assets/cards/the-chronicler.png'),
  'the-unbroken-path': require('../../assets/cards/the-unbroken-path.png'),
  'stone-mind': require('../../assets/cards/stone-mind.png'),
  'the-silent-blade': require('../../assets/cards/the-silent-blade.png'),
  'the-first-step': require('../../assets/cards/the-first-step.png'),
  'forge-of-words': require('../../assets/cards/forge-of-words.png'),
  'the-balanced-soul': require('../../assets/cards/the-balanced-soul.png'),
  'iron-pillar': require('../../assets/cards/iron-pillar.png'),
  'lotus-willow': require('../../assets/cards/lotus-willow.png'),
  'purifying-flame': require('../../assets/cards/purifying-flame.png'),
  'golden-silence': require('../../assets/cards/golden-silence.png'),
  'prana-vessel': require('../../assets/cards/prana-vessel.png'),
  'stone-citadel': require('../../assets/cards/stone-citadel.png'),
  'scholars-flame': require('../../assets/cards/scholars-flame.png'),
  'golden-vault': require('../../assets/cards/golden-vault.png'),
  'radiant-heart': require('../../assets/cards/radiant-heart.png'),
  'pure-harvest': require('../../assets/cards/pure-harvest.png'),
  'master-architect': require('../../assets/cards/master-architect.png'),
  'zen-sanctuary': require('../../assets/cards/zen-sanctuary.png'),
  'sacred-covenant': require('../../assets/cards/sacred-covenant.png'),
};

export interface ArchetypeDefinition {
  key: ArchetypeKey;
  label: string;
  subtitle: string;
  guardian: string;
  artworkKey: string;
  image: any;
  defaultQuote: string;
  rarity: CardRarity;
}

export const ARCHETYPE_DEFINITIONS: Record<ArchetypeKey, ArchetypeDefinition> = {
  WARRIOR: {
    key: 'WARRIOR',
    label: 'Warrior',
    subtitle: 'Physical discipline & unstoppable drive',
    guardian: 'The Dawn Warrior',
    artworkKey: 'warriors-dawn',
    image: CARD_ARTWORKS['warriors-dawn'],
    defaultQuote: 'Discipline is forged in early sweat. Victory belongs to those who strike first.',
    rarity: 'rare',
  },
  SCHOLAR: {
    key: 'SCHOLAR',
    label: 'Scholar',
    subtitle: 'Mental sharpness, wisdom & deep craft',
    guardian: 'The Keeper of Wisdom',
    artworkKey: 'endless-library',
    image: CARD_ARTWORKS['endless-library'],
    defaultQuote: 'Knowledge unapplied is dust. Walk through the hall of true understanding.',
    rarity: 'rare',
  },
  MONK: {
    key: 'MONK',
    label: 'Monk',
    subtitle: 'Inner serenity, stillness & mindfulness',
    guardian: 'The Mountain Monk',
    artworkKey: 'silent-peak',
    image: CARD_ARTWORKS['silent-peak'],
    defaultQuote: 'In stillness, find your center. The storm cannot move the stone peak.',
    rarity: 'epic',
  },
  GUARDIAN: {
    key: 'GUARDIAN',
    label: 'Guardian',
    subtitle: 'Unshakable integrity & moral courage',
    guardian: 'The Moon Watcher',
    artworkKey: 'night-guardian',
    image: CARD_ARTWORKS['night-guardian'],
    defaultQuote: 'Stand watch over your principles when darkness envelops the world.',
    rarity: 'epic',
  },
  WANDERER: {
    key: 'WANDERER',
    label: 'Wanderer',
    subtitle: 'Long-term endurance & the unbroken path',
    guardian: 'The Pilgrim',
    artworkKey: 'the-unbroken-path',
    image: CARD_ARTWORKS['the-unbroken-path'],
    defaultQuote: 'Walk the mountain ridge. The destination matters less than the unbroken stride.',
    rarity: 'rare',
  },
  FORGE: {
    key: 'FORGE',
    label: 'Forge',
    subtitle: 'Resilience through heat, pressure & grit',
    guardian: 'The Glacial Blacksmith',
    artworkKey: 'glacial-forge',
    image: CARD_ARTWORKS['glacial-forge'],
    defaultQuote: 'Endure the ice and the anvil. Only under immense pressure is true steel forged.',
    rarity: 'legendary',
  },
};

export function generatePersonalizedCardTitle(habit: string, archetype: ArchetypeKey = 'WARRIOR'): string {
  const clean = habit.trim();
  if (!clean) return `THE ${archetype}`;
  if (clean.toUpperCase().startsWith('THE ')) return clean.toUpperCase();

  const prefixes: Record<ArchetypeKey, string> = {
    WARRIOR: 'THE IRON',
    SCHOLAR: 'THE ENDLESS',
    MONK: 'THE SILENT',
    GUARDIAN: 'THE SACRED',
    WANDERER: 'THE UNBROKEN',
    FORGE: 'THE TEMPERED',
  };

  const core = clean.replace(/^(the|a|an)\s+/i, '').toUpperCase();
  return `${prefixes[archetype]} ${core}`;
}

/**
 * Automatically assign an appropriate existing card artwork and guardian
 * to a custom vow based on keyword detection.
 */
export function autoAssignCustomCardData(habitName: string, desc?: string): MissionCardData {
  const lower = `${habitName} ${desc || ''}`.toLowerCase();

  // 1. Reading / Studying / Knowledge -> Scholar-style artwork
  if (
    lower.includes('read') ||
    lower.includes('book') ||
    lower.includes('page') ||
    lower.includes('study') ||
    lower.includes('learn') ||
    lower.includes('write') ||
    lower.includes('journal') ||
    lower.includes('research') ||
    lower.includes('language')
  ) {
    return {
      title: "The Keeper of Wisdom",
      habit: habitName,
      guardian: "The Scholar",
      image: CARD_ARTWORKS['endless-library'],
      quote: "Knowledge unapplied is dust. Walk through the hall of true understanding.",
      rarity: 'rare',
      xpValue: 20,
      targetStage: 'Disciplined',
      requiredDays: 30,
      isCustom: true,
      category: 'MIND',
    };
  }

  // 2. Meditation / Mindfulness / Stillness -> Monk-style artwork
  if (
    lower.includes('meditat') ||
    lower.includes('breath') ||
    lower.includes('mindful') ||
    lower.includes('zen') ||
    lower.includes('still') ||
    lower.includes('peace') ||
    lower.includes('calm') ||
    lower.includes('prayer') ||
    lower.includes('mantra') ||
    lower.includes('silence')
  ) {
    return {
      title: "The Mountain Monk",
      habit: habitName,
      guardian: "The Mountain Monk",
      image: CARD_ARTWORKS['silent-peak'],
      quote: "In stillness, find your center. The storm cannot move the stone peak.",
      rarity: 'epic',
      xpValue: 20,
      targetStage: 'Disciplined',
      requiredDays: 30,
      isCustom: true,
      category: 'MIND',
    };
  }

  // 3. Physical / Workout / Pushups / Running / Cold Plunge / Health -> Warrior-style artwork
  if (
    lower.includes('workout') ||
    lower.includes('gym') ||
    lower.includes('exercise') ||
    lower.includes('run') ||
    lower.includes('jog') ||
    lower.includes('walk') ||
    lower.includes('pushup') ||
    lower.includes('push-up') ||
    lower.includes('lift') ||
    lower.includes('strength') ||
    lower.includes('plunge') ||
    lower.includes('cold') ||
    lower.includes('stretch') ||
    lower.includes('water') ||
    lower.includes('hydrate') ||
    lower.includes('sleep') ||
    lower.includes('wake') ||
    lower.includes('fast') ||
    lower.includes('diet') ||
    lower.includes('sugar')
  ) {
    return {
      title: "Warrior's Dawn",
      habit: habitName,
      guardian: "The Dawn Warrior",
      image: CARD_ARTWORKS['warriors-dawn'],
      quote: "Discipline is built one decision at a time. The dawn is your first victory.",
      rarity: 'rare',
      xpValue: 20,
      targetStage: 'Disciplined',
      requiredDays: 30,
      isCustom: true,
      category: 'BODY',
    };
  }

  // 4. Focus / Deep Work / Craft / Productivity -> Focus-style artwork
  if (
    lower.includes('focus') ||
    lower.includes('deep work') ||
    lower.includes('distract') ||
    lower.includes('phone') ||
    lower.includes('screen') ||
    lower.includes('social') ||
    lower.includes('build') ||
    lower.includes('create') ||
    lower.includes('code') ||
    lower.includes('ship') ||
    lower.includes('art') ||
    lower.includes('music') ||
    lower.includes('pomodoro') ||
    lower.includes('clean') ||
    lower.includes('finance') ||
    lower.includes('money') ||
    lower.includes('save')
  ) {
    return {
      title: "Master Architect",
      habit: habitName,
      guardian: "The Master Architect",
      image: CARD_ARTWORKS['master-architect'],
      quote: "Construct your reality with deliberate precision. Eliminate all noise.",
      rarity: 'epic',
      xpValue: 25,
      targetStage: 'Consistent',
      requiredDays: 90,
      isCustom: true,
      category: 'FOCUS',
    };
  }

  // Fallback: The Unbroken Path
  return {
    title: "The Unbroken Path",
    habit: habitName,
    guardian: "The Pilgrim",
    image: CARD_ARTWORKS['the-unbroken-path'],
    quote: "Walk the mountain ridge. The destination matters less than the unbroken stride.",
    rarity: 'rare',
    xpValue: 20,
    targetStage: 'Disciplined',
    requiredDays: 30,
    isCustom: true,
    category: 'FOCUS',
  };
}

export function getMissionCardData(name: string): MissionCardData {
  const lower = (name || '').toLowerCase().trim();

  // Check if this vow is a forged custom vow in customVows
  try {
    const store = require('../store/useAppStore').useAppStore;
    const state = store?.getState?.();
    const customVows: CustomVowMetadata[] = state?.customVows || [];
    const customMatch = customVows.find(
      (cv: CustomVowMetadata) =>
        cv.habit.toLowerCase().trim() === lower ||
        cv.id.toLowerCase() === lower ||
        cv.cardTitle.toLowerCase().trim() === lower
    );

    if (customMatch) {
      const archDef = ARCHETYPE_DEFINITIONS[customMatch.archetype] || ARCHETYPE_DEFINITIONS['WARRIOR'];
      const xpMap = { easy: 10, medium: 20, hard: 30 };
      const stageMap = {
        easy: 'Beginner' as CardStage,
        medium: 'Disciplined' as CardStage,
        hard: 'Unbreakable' as CardStage,
      };
      return {
        title: customMatch.cardTitle,
        habit: customMatch.habit,
        guardian: customMatch.guardian,
        image: archDef.image,
        quote: customMatch.quote,
        rarity: archDef.rarity,
        xpValue: xpMap[customMatch.difficulty] || 20,
        targetStage: stageMap[customMatch.difficulty] || 'Disciplined',
        requiredDays: customMatch.difficulty === 'hard' ? 180 : customMatch.difficulty === 'medium' ? 30 : 7,
        isCustom: true,
        category: customMatch.category,
      };
    }

    // Check if activeVows has this marked as is_custom
    const activeVows = state?.activeVows || [];
    const activeMatch = activeVows.find((av: any) => (av.custom_name || '').toLowerCase().trim() === lower);
    if (activeMatch && activeMatch.is_custom) {
      return autoAssignCustomCardData(activeMatch.custom_name);
    }
  } catch (e) {
    // ignore if store not yet ready
  }

  // 1. Warrior's Dawn (Wake Before 6 AM)
  if (lower.includes('wake') || lower.includes('early')) {
    return {
      title: "Warrior's Dawn",
      habit: name,
      guardian: "The Dawn Warrior",
      image: CARD_ARTWORKS['warriors-dawn'],
      quote: "Discipline is built one decision at a time. The dawn is your first victory.",
      rarity: 'common',
      xpValue: 15,
      targetStage: 'Beginner',
      requiredDays: 7,
    };
  }

  // 2. Iron Temple (Workout / Exercise)
  if (lower.includes('workout') || lower.includes('exercise') || lower.includes('gym')) {
    return {
      title: "Iron Temple",
      habit: name,
      guardian: "The Eternal Blacksmith",
      image: CARD_ARTWORKS['iron-temple'],
      quote: "Forge your body and character in the fire of daily physical exertion.",
      rarity: 'rare',
      xpValue: 20,
      targetStage: 'Disciplined',
      requiredDays: 30,
    };
  }

  // 3. Iron Pillar (100 Pushups / Raw Physical Strength)
  if (lower.includes('pushup') || lower.includes('push-up') || lower.includes('strength')) {
    return {
      title: "Iron Pillar",
      habit: name,
      guardian: "The Iron Sentinel",
      image: CARD_ARTWORKS['iron-pillar'],
      quote: "Stack daily repetitions like heavy granite blocks to forge unshakeable physical power.",
      rarity: 'epic',
      xpValue: 25,
      targetStage: 'Consistent',
      requiredDays: 90,
    };
  }

  // 4. Lotus Willow (Stretching & Mobility)
  if (lower.includes('stretch') || lower.includes('mobility') || lower.includes('flexibility')) {
    return {
      title: "Lotus Willow",
      habit: name,
      guardian: "The Willow Sage",
      image: CARD_ARTWORKS['lotus-willow'],
      quote: "Bend like the flexible bamboo in strong winds; what bends without breaking stands forever.",
      rarity: 'common',
      xpValue: 10,
      targetStage: 'Beginner',
      requiredDays: 7,
    };
  }

  // 5. Glacial Forge (Cold Shower)
  if (lower.includes('cold') || lower.includes('shower')) {
    return {
      title: "Glacial Forge",
      habit: name,
      guardian: "The Ice Warrior",
      image: CARD_ARTWORKS['glacial-forge'],
      quote: "Embrace the freezing cold. Mental toughness is born in absolute discomfort.",
      rarity: 'epic',
      xpValue: 25,
      targetStage: 'Consistent',
      requiredDays: 90,
    };
  }

  // 6. Purifying Flame (Fasting)
  if (lower.includes('fast') || lower.includes('fasting')) {
    return {
      title: "Purifying Flame",
      habit: name,
      guardian: "The Ember Keeper",
      image: CARD_ARTWORKS['purifying-flame'],
      quote: "Burn away internal lethargy through intentional physical abstinence and quiet resolve.",
      rarity: 'rare',
      xpValue: 20,
      targetStage: 'Disciplined',
      requiredDays: 30,
    };
  }

  // 7. Silent Peak (Meditation)
  if (lower.includes('meditate') || lower.includes('meditation') || lower.includes('mindful')) {
    return {
      title: "Silent Peak",
      habit: name,
      guardian: "The Mountain Monk",
      image: CARD_ARTWORKS['silent-peak'],
      quote: "Still the external noise. True mastery of the self begins in quiet reflection.",
      rarity: 'rare',
      xpValue: 15,
      targetStage: 'Disciplined',
      requiredDays: 30,
    };
  }

  // 8. Prana Vessel (Breathwork)
  if (lower.includes('breath') || lower.includes('breathwork') || lower.includes('prana')) {
    return {
      title: "Prana Vessel",
      habit: name,
      guardian: "The Wind Monk",
      image: CARD_ARTWORKS['prana-vessel'],
      quote: "Master the rhythm of your breath to command the stillness of your mind and nervous system.",
      rarity: 'common',
      xpValue: 10,
      targetStage: 'Beginner',
      requiredDays: 7,
    };
  }

  // 9. Golden Silence (No Complaints)
  if (lower.includes('complaint') || lower.includes('complain') || lower.includes('criticize')) {
    return {
      title: "Golden Silence",
      habit: name,
      guardian: "The Silent Sentinel",
      image: CARD_ARTWORKS['golden-silence'],
      quote: "Replace internal grievance with decisive action. Silence speaks louder than regret.",
      rarity: 'rare',
      xpValue: 15,
      targetStage: 'Disciplined',
      requiredDays: 30,
    };
  }

  // 10. Stone Citadel (Stoic Reflection)
  if (lower.includes('stoic') || lower.includes('reflection')) {
    return {
      title: "Stone Citadel",
      habit: name,
      guardian: "The Citadel Guardian",
      image: CARD_ARTWORKS['stone-citadel'],
      quote: "Stand unyielding against external chaotic waves. Your inner sanctuary is impenetrable.",
      rarity: 'epic',
      xpValue: 25,
      targetStage: 'Consistent',
      requiredDays: 90,
    };
  }

  // 10b. Stone Mind (Silent Reflection / Mental Stillness)
  if (lower.includes('silent reflection') || lower.includes('stillness')) {
    return {
      title: "Stone Mind",
      habit: name,
      guardian: "The Granite Sage",
      image: CARD_ARTWORKS['stone-mind'],
      quote: "Thoughts crash like ocean waves; the stone mind remains unmoved and clear.",
      rarity: 'rare',
      xpValue: 20,
      targetStage: 'Disciplined',
      requiredDays: 30,
    };
  }

  // 11. Endless Library (Reading)
  if (lower.includes('read 20') || lower.includes('read 30') || lower.includes('pages') || lower.includes('book')) {
    return {
      title: "Endless Library",
      habit: name,
      guardian: "The Keeper of Wisdom",
      image: CARD_ARTWORKS['endless-library'],
      quote: "The mind is a blade that grows sharper with every scroll and page turned.",
      rarity: 'common',
      xpValue: 10,
      targetStage: 'Beginner',
      requiredDays: 7,
    };
  }

  // 12. Scholars Flame (Study / Learning / Vocabulary / Docs)
  if (lower.includes('study') || lower.includes('learn') || lower.includes('vocabulary') || lower.includes('audio') || lower.includes('technical')) {
    return {
      title: "Scholar's Flame",
      habit: name,
      guardian: "The Illuminator",
      image: CARD_ARTWORKS['scholars-flame'],
      quote: "Fan the embers of curiosity until knowledge transforms into absolute mastery.",
      rarity: 'rare',
      xpValue: 20,
      targetStage: 'Disciplined',
      requiredDays: 30,
    };
  }

  // 13. Master Architect (Deep Work / Single-Tasking / Inbox Zero / Planning)
  if (lower.includes('deep work') || lower.includes('single-task') || lower.includes('inbox') || lower.includes('plan tomorrow')) {
    return {
      title: "Master Architect",
      habit: name,
      guardian: "The Master Builder",
      image: CARD_ARTWORKS['master-architect'],
      quote: "Design your day with precision geometry. Single-minded focus builds empires.",
      rarity: 'epic',
      xpValue: 25,
      targetStage: 'Consistent',
      requiredDays: 90,
    };
  }

  // 14. Digital Monk (No Social Media)
  if (lower.includes('social media') || lower.includes('screen') || lower.includes('phone') || lower.includes('facebook') || lower.includes('instagram')) {
    return {
      title: "Digital Monk",
      habit: name,
      guardian: "The Liberated One",
      image: CARD_ARTWORKS['digital-monk'],
      quote: "Break the glowing chains of digital distraction. Walk toward focus and clarity.",
      rarity: 'epic',
      xpValue: 20,
      targetStage: 'Consistent',
      requiredDays: 90,
    };
  }

  // 15. Purify the Vessel (Drink Water)
  if (lower.includes('water') || lower.includes('hydrate') || lower.includes('drink')) {
    return {
      title: "Purify the Vessel",
      habit: name,
      guardian: "The River Keeper",
      image: CARD_ARTWORKS['purify-vessel'],
      quote: "Flush away the impurities. Keep the container clean to host a burning fire of focus.",
      rarity: 'common',
      xpValue: 10,
      targetStage: 'Beginner',
      requiredDays: 7,
    };
  }

  // 16. Pure Harvest (Healthy Diet / Zero Sugar / Whole Foods)
  if (lower.includes('sugar') || lower.includes('sweet')) {
    return {
      title: "Pure Harvest",
      habit: name,
      guardian: "The Harvester",
      image: CARD_ARTWORKS['pure-harvest'],
      quote: "Feed your temple clean, unadulterated nourishment. Vitality is supreme power.",
      rarity: 'rare',
      xpValue: 15,
      targetStage: 'Disciplined',
      requiredDays: 30,
    };
  }

  // 16b. Sacred Fuel (Whole Foods / No Alcohol / Diet Cleanse)
  if (lower.includes('whole food') || lower.includes('diet') || lower.includes('alcohol') || lower.includes('nutrition')) {
    return {
      title: "Sacred Fuel",
      habit: name,
      guardian: "The Fuel Master",
      image: CARD_ARTWORKS['sacred-fuel'],
      quote: "What you consume either fuels your internal flame or smothers your spirit.",
      rarity: 'rare',
      xpValue: 15,
      targetStage: 'Disciplined',
      requiredDays: 30,
    };
  }

  // 17. Wind Walker (Running / Steps / Cardio)
  if (lower.includes('run') || lower.includes('running') || lower.includes('jog') || lower.includes('cardio') || lower.includes('steps')) {
    return {
      title: "Wind Walker",
      habit: name,
      guardian: "The Endless Runner",
      image: CARD_ARTWORKS['wind-walker'],
      quote: "Consistency is pacing yourself. Ride the wind and control your own momentum.",
      rarity: 'rare',
      xpValue: 15,
      targetStage: 'Disciplined',
      requiredDays: 30,
    };
  }

  // 18. Night Guardian (Sleep Early)
  if (lower.includes('asleep') || lower.includes('sleep') || lower.includes('bed')) {
    return {
      title: "Night Guardian",
      habit: name,
      guardian: "The Moon Watcher",
      image: CARD_ARTWORKS['night-guardian'],
      quote: "The battles of tomorrow are won or lost in the recovery of tonight.",
      rarity: 'common',
      xpValue: 15,
      targetStage: 'Beginner',
      requiredDays: 7,
    };
  }

  // 19. Iron Will (No Porn)
  if (lower.includes('porn') || lower.includes('nofap') || lower.includes('fap')) {
    return {
      title: "Iron Will",
      habit: name,
      guardian: "The Chainbreaker",
      image: CARD_ARTWORKS['iron-will'],
      quote: "True power is the command over one's base desires. Master yourself, conquer all.",
      rarity: 'legendary',
      xpValue: 30,
      targetStage: 'Unbreakable',
      requiredDays: 180,
    };
  }

  // 20. Golden Vault (Financial Discipline / Expense Tracking / Save / Impulse)
  if (lower.includes('expense') || lower.includes('buying') || lower.includes('income') || lower.includes('save') || lower.includes('money') || lower.includes('eating out')) {
    return {
      title: "Golden Vault",
      habit: name,
      guardian: "The Wealth Keeper",
      image: CARD_ARTWORKS['golden-vault'],
      quote: "Protect your capital assets with steady restraint. True wealth is freedom.",
      rarity: 'rare',
      xpValue: 15,
      targetStage: 'Disciplined',
      requiredDays: 30,
    };
  }

  // 21. Radiant Heart (Gratitude / Listening / Kindness / Relationships)
  if (lower.includes('gratitude') || lower.includes('listen') || lower.includes('kindness') || lower.includes('quality time') || lower.includes('family')) {
    return {
      title: "Radiant Heart",
      habit: name,
      guardian: "The Compassionate Sage",
      image: CARD_ARTWORKS['radiant-heart'],
      quote: "A warm light shared with others multiplies your own inner flame.",
      rarity: 'common',
      xpValue: 10,
      targetStage: 'Beginner',
      requiredDays: 7,
    };
  }

  // 22. Zen Sanctuary (Spiritual / Mantra / Nature Walk / Forgiveness)
  if (lower.includes('mantra') || lower.includes('prayer') || lower.includes('nature') || lower.includes('spiritual') || lower.includes('forgive')) {
    return {
      title: "Zen Sanctuary",
      habit: name,
      guardian: "The Forest Mystic",
      image: CARD_ARTWORKS['zen-sanctuary'],
      quote: "Anchor your spirit deep within natural harmony and timeless truth.",
      rarity: 'rare',
      xpValue: 15,
      targetStage: 'Disciplined',
      requiredDays: 30,
    };
  }

  // 23. The Chronicler (Daily Journal)
  if (lower.includes('journal') || lower.includes('write 10')) {
    return {
      title: "The Chronicler",
      habit: name,
      guardian: "The Scribe",
      image: CARD_ARTWORKS['the-chronicler'],
      quote: "A day undocumented is a battle forgotten. Write your history to guide your steps.",
      rarity: 'common',
      xpValue: 10,
      targetStage: 'Beginner',
      requiredDays: 7,
    };
  }

  // 24. The Unbroken Path (Never Skip a Day)
  if (lower.includes('skip') || lower.includes('promise') || lower.includes('consecut') || lower.includes('unbroken')) {
    return {
      title: "The Unbroken Path",
      habit: name,
      guardian: "The Pilgrim",
      image: CARD_ARTWORKS['the-unbroken-path'],
      quote: "The path is endless and steep. Thousands of disciplined steps carve the stone road.",
      rarity: 'mythic',
      xpValue: 30,
      targetStage: 'Vajra',
      requiredDays: 365,
    };
  }

  // 25. The Silent Blade (Control Anger)
  if (lower.includes('anger') || lower.includes('temper') || lower.includes('control react')) {
    return {
      title: "The Silent Blade",
      habit: name,
      guardian: "The Swordmaster",
      image: CARD_ARTWORKS['the-silent-blade'],
      quote: "Restraint is the ultimate expression of strength. Lower the blade to rise in honor.",
      rarity: 'legendary',
      xpValue: 25,
      targetStage: 'Unbreakable',
      requiredDays: 180,
    };
  }

  // 26. The First Step (Start Without Procrastinating)
  if (lower.includes('procrastinat') || lower.includes('start') || lower.includes('now')) {
    return {
      title: "The First Step",
      habit: name,
      guardian: "The Pathfinder",
      image: CARD_ARTWORKS['the-first-step'],
      quote: "The staircase disappears once you take the first step. Action is the antidote to fear.",
      rarity: 'rare',
      xpValue: 15,
      targetStage: 'Disciplined',
      requiredDays: 30,
    };
  }

  // 27. Forge of Words (Public Speaking / Communication / Words / Instrument / Creative)
  if (lower.includes('speak') || lower.includes('talk') || lower.includes('communication') || lower.includes('present') || lower.includes('words') || lower.includes('artifact') || lower.includes('instrument') || lower.includes('ideas')) {
    return {
      title: "Forge of Words",
      habit: name,
      guardian: "The Herald",
      image: CARD_ARTWORKS['forge-of-words'],
      quote: "Let your voice ripple across the valley with conviction, leadership, and honor.",
      rarity: 'rare',
      xpValue: 20,
      targetStage: 'Disciplined',
      requiredDays: 30,
    };
  }

  // 28. The Balanced Soul (Work-Life Balance)
  if (lower.includes('balance') || lower.includes('rest')) {
    return {
      title: "The Balanced Soul",
      habit: name,
      guardian: "The Keeper",
      image: CARD_ARTWORKS['the-balanced-soul'],
      quote: "Stand steady on the bridge of life. Balance the city of effort with the forest of peace.",
      rarity: 'epic',
      xpValue: 20,
      targetStage: 'Consistent',
      requiredDays: 90,
    };
  }

  // Fallback for custom vows: automatically assign appropriate Vajra artwork
  return autoAssignCustomCardData(name);
}

export interface VowCatalogEntry {
  id: string;
  habit: string;
  category: 'BODY' | 'MIND' | 'FOCUS';
  difficulty: 'easy' | 'medium' | 'hard';
  shortDesc: string;
  rule: string;
  card: MissionCardData;
  isCustom?: boolean;
}

/**
 * The COMPLETE Vow Catalog containing EVERY single vow defined or referenced
 * across Home, Log, Profile, Onboarding library, mock data, and collectible cards.
 * Categorized strictly under: BODY, MIND, FOCUS.
 */
export const MASTER_VOW_CATALOG: VowCatalogEntry[] = [
  // ─── BODY (19 Vows) ────────────────────────────────────────────────────────
  {
    id: 'vow-wake-dawn',
    habit: 'Wake before 6 AM',
    category: 'BODY',
    difficulty: 'medium',
    shortDesc: 'Start your day with intention and quiet stillness.',
    rule: 'Rise before 6:00 AM every morning without hitting snooze.',
    card: getMissionCardData('Wake before 6 AM')
  },
  {
    id: 'vow-workout-45',
    habit: 'Workout 45 min',
    category: 'BODY',
    difficulty: 'medium',
    shortDesc: 'Build physical grit through consistent daily movement.',
    rule: 'Complete 45 minutes of strenuous physical training daily.',
    card: getMissionCardData('Workout 45 min')
  },
  {
    id: 'vow-pushups-100',
    habit: '100 Pushups Daily',
    category: 'BODY',
    difficulty: 'hard',
    shortDesc: 'Build raw physical strength through daily volume.',
    rule: 'Perform 100 disciplined, full-range pushups every day.',
    card: getMissionCardData('100 Pushups Daily')
  },
  {
    id: 'vow-stretching-mobility',
    habit: 'Stretching & Mobility',
    category: 'BODY',
    difficulty: 'easy',
    shortDesc: 'Keep your joints fluid and body pain-free.',
    rule: 'Perform 15 minutes of full-body mobility and flexibility work.',
    card: getMissionCardData('Stretching & Mobility')
  },
  {
    id: 'vow-cold-shower',
    habit: 'Cold Shower',
    category: 'BODY',
    difficulty: 'hard',
    shortDesc: 'Embrace freezing cold to forge mental toughness.',
    rule: 'Take a 3-minute cold shower daily. Master discomfort.',
    card: getMissionCardData('Cold Shower')
  },
  {
    id: 'vow-cold-shower-3m',
    habit: 'Cold Shower 3 min',
    category: 'BODY',
    difficulty: 'hard',
    shortDesc: 'Embrace physical discomfort to forge mental resilience.',
    rule: 'Endure 3 continuous minutes of freezing water every day.',
    card: getMissionCardData('Cold Shower 3 min')
  },
  {
    id: 'vow-fast-noon',
    habit: 'Fast until 12 PM',
    category: 'BODY',
    difficulty: 'medium',
    shortDesc: 'Intermittent fasting for metabolic clarity.',
    rule: 'Zero caloric intake until 12:00 PM noon. Water and black tea only.',
    card: getMissionCardData('Fast until 12 PM')
  },
  {
    id: 'vow-running-5km',
    habit: 'Running 5km',
    category: 'BODY',
    difficulty: 'medium',
    shortDesc: 'Build sustained cardiovascular endurance on foot.',
    rule: 'Run 5 kilometers with deliberate pace, endurance, and breathing control.',
    card: getMissionCardData('Running 5km')
  },
  {
    id: 'vow-daily-steps',
    habit: '10,000 Daily Steps',
    category: 'BODY',
    difficulty: 'medium',
    shortDesc: 'Sustain baseline daily physical activity.',
    rule: 'Log at least 10,000 recorded steps every day without exception.',
    card: getMissionCardData('10,000 Daily Steps')
  },
  {
    id: 'vow-drink-water-cap',
    habit: 'Drink 2L Water',
    category: 'BODY',
    difficulty: 'easy',
    shortDesc: 'Purify your vessel and maintain peak hydration.',
    rule: 'Drink at least 2 liters of pure water daily. Keep the internal system clean.',
    card: getMissionCardData('Drink 2L Water')
  },
  {
    id: 'vow-drink-water',
    habit: 'Drink 2L water',
    category: 'BODY',
    difficulty: 'easy',
    shortDesc: 'Flush away impurities and maintain mental clarity.',
    rule: 'Consume 2 full liters of hydration across your waking hours.',
    card: getMissionCardData('Drink 2L water')
  },
  {
    id: 'vow-zero-sugar',
    habit: 'Zero Processed Sugar',
    category: 'BODY',
    difficulty: 'hard',
    shortDesc: 'Eliminate artificial sweets and energy crashes.',
    rule: 'Zero refined or processed sugars for the entire day. Pure fuel only.',
    card: getMissionCardData('Zero Processed Sugar')
  },
  {
    id: 'vow-whole-foods',
    habit: 'Eat Whole Foods Only',
    category: 'BODY',
    difficulty: 'medium',
    shortDesc: 'Nourish your body with clean, unprocessed foods.',
    rule: 'Eat solely single-ingredient, unrefined whole foods today.',
    card: getMissionCardData('Eat Whole Foods Only')
  },
  {
    id: 'vow-no-alcohol',
    habit: 'No Alcohol Today',
    category: 'BODY',
    difficulty: 'medium',
    shortDesc: 'Maintain mental sobriety and liver health.',
    rule: 'Zero alcoholic drinks consumed under any circumstance today.',
    card: getMissionCardData('No Alcohol Today')
  },
  {
    id: 'vow-sleep-early-10',
    habit: 'Sleep before 10 PM',
    category: 'BODY',
    difficulty: 'easy',
    shortDesc: 'Protect your evening recovery and circadian rhythm.',
    rule: 'Be in bed with screens off and lights dimmed before 10:00 PM.',
    card: getMissionCardData('Sleep before 10 PM')
  },
  {
    id: 'vow-asleep-11',
    habit: 'Asleep by 11 PM',
    category: 'BODY',
    difficulty: 'medium',
    shortDesc: 'Prioritize circadian rhythm and restorative sleep.',
    rule: 'Asleep by 11:00 PM every night for optimal biological repair.',
    card: getMissionCardData('Asleep by 11 PM')
  },
  {
    id: 'vow-no-screens-bed',
    habit: 'No Screens 1hr Before Bed',
    category: 'BODY',
    difficulty: 'medium',
    shortDesc: 'Shield your eyes from blue light before sleep.',
    rule: 'Zero smartphones, tablets, or computers 60 minutes before sleeping.',
    card: getMissionCardData('No Screens 1hr Before Bed')
  },
  {
    id: 'vow-dark-bedroom',
    habit: 'Dark & Cool Bedroom',
    category: 'BODY',
    difficulty: 'easy',
    shortDesc: 'Optimize sleep environment for deep recovery.',
    rule: 'Keep sleep sanctuary completely pitch black and cool.',
    card: getMissionCardData('Dark & Cool Bedroom')
  },
  {
    id: 'vow-consistent-wake',
    habit: 'Consistent Wake Hour',
    category: 'BODY',
    difficulty: 'medium',
    shortDesc: 'Wake at the exact same hour every single day.',
    rule: 'Get out of bed at your target wake hour 7 days a week.',
    card: getMissionCardData('Consistent Wake Hour')
  },

  // ─── MIND (18 Vows) ─────────────────────────────────────────────────────────
  {
    id: 'vow-meditate-10',
    habit: 'Meditate 10 min',
    category: 'MIND',
    difficulty: 'easy',
    shortDesc: 'Calm inner noise and sharpen mental concentration.',
    rule: 'Sit in complete stillness for 10 minutes of daily mindfulness.',
    card: getMissionCardData('Meditate 10 min')
  },
  {
    id: 'vow-meditate-20',
    habit: 'Meditate 20 mins',
    category: 'MIND',
    difficulty: 'medium',
    shortDesc: 'Still the external noise through deep meditation.',
    rule: 'Sit in complete stillness for 20 minutes of daily mindfulness.',
    card: getMissionCardData('Meditate 20 mins')
  },
  {
    id: 'vow-breathwork-5',
    habit: 'Breathwork 5 min',
    category: 'MIND',
    difficulty: 'easy',
    shortDesc: 'Master your nervous system through controlled breathing.',
    rule: 'Perform 5 minutes of box breathing or pranayama breath control daily.',
    card: getMissionCardData('Breathwork 5 min')
  },
  {
    id: 'vow-no-complaints',
    habit: 'No Complaints Day',
    category: 'MIND',
    difficulty: 'medium',
    shortDesc: 'Transform negative self-talk into constructive action.',
    rule: 'Zero vocal complaints, whining, or victim mentality all day.',
    card: getMissionCardData('No Complaints Day')
  },
  {
    id: 'vow-journaling-10',
    habit: 'Journaling 10 min',
    category: 'MIND',
    difficulty: 'easy',
    shortDesc: 'Clear mental clutter through structured reflection.',
    rule: 'Spend 10 deliberate minutes writing thoughts, reflections, and insights.',
    card: getMissionCardData('Journaling 10 min')
  },
  {
    id: 'vow-daily-journal',
    habit: 'Daily Journal',
    category: 'MIND',
    difficulty: 'easy',
    shortDesc: 'Write your daily history to guide your future steps.',
    rule: 'Write at least one full journal entry capturing lessons and gratitude.',
    card: getMissionCardData('Daily Journal')
  },
  {
    id: 'vow-stoic-reflection',
    habit: 'Stoic Reflection',
    category: 'MIND',
    difficulty: 'medium',
    shortDesc: 'Reflect on impermanence and voluntary discomfort.',
    rule: 'Read and meditate upon one Stoic maxim; separate what is in your control from what is not.',
    card: getMissionCardData('Stoic Reflection')
  },
  {
    id: 'vow-silent-reflection-15',
    habit: 'Silent Reflection 15m',
    category: 'MIND',
    difficulty: 'easy',
    shortDesc: 'Sit in complete silence without external inputs.',
    rule: 'Spend 15 minutes in absolute silence with zero devices or music.',
    card: getMissionCardData('Silent Reflection 15m')
  },
  {
    id: 'vow-daily-mantra',
    habit: 'Daily Mantra / Prayer',
    category: 'MIND',
    difficulty: 'easy',
    shortDesc: 'Connect with your core values and higher path.',
    rule: 'Recite your grounding mantra or spiritual invocation every morning.',
    card: getMissionCardData('Daily Mantra / Prayer')
  },
  {
    id: 'vow-nature-walk-20',
    habit: 'Nature Walk 20m',
    category: 'MIND',
    difficulty: 'easy',
    shortDesc: 'Reconnect with natural surroundings outdoors.',
    rule: 'Walk outside among trees, earth, or open sky for 20 mindful minutes.',
    card: getMissionCardData('Nature Walk 20m')
  },
  {
    id: 'vow-practice-forgiveness',
    habit: 'Practice Forgiveness',
    category: 'MIND',
    difficulty: 'medium',
    shortDesc: 'Release resentment towards past grievances.',
    rule: 'Consciously forgive one slight or release a lingering resentment today.',
    card: getMissionCardData('Practice Forgiveness')
  },
  {
    id: 'vow-gratitude-daily',
    habit: 'Express Gratitude Daily',
    category: 'MIND',
    difficulty: 'easy',
    shortDesc: 'Send a genuine thank-you message to someone.',
    rule: 'Directly express sincere gratitude to at least one person every day.',
    card: getMissionCardData('Express Gratitude Daily')
  },
  {
    id: 'vow-active-listening',
    habit: 'Active Listening',
    category: 'MIND',
    difficulty: 'easy',
    shortDesc: 'Give 100% undivided attention when listening.',
    rule: 'Listen fully without interrupting or formulating your answer while others speak.',
    card: getMissionCardData('Active Listening')
  },
  {
    id: 'vow-quality-time-30',
    habit: 'Quality Time 30m',
    category: 'MIND',
    difficulty: 'medium',
    shortDesc: 'Uninterrupted presence with family or partner.',
    rule: 'Dedicate 30 minutes of uninterrupted, screen-free presence to family or loved ones.',
    card: getMissionCardData('Quality Time 30m')
  },
  {
    id: 'vow-random-kindness',
    habit: 'Random Act of Kindness',
    category: 'MIND',
    difficulty: 'easy',
    shortDesc: 'Help others without expecting anything back.',
    rule: 'Perform at least one unseen or unprompted act of service for someone.',
    card: getMissionCardData('Random Act of Kindness')
  },
  {
    id: 'vow-control-anger',
    habit: 'Control Anger',
    category: 'MIND',
    difficulty: 'hard',
    shortDesc: 'Master emotional reactions and maintain inner composure.',
    rule: 'Pause and breathe through irritation; never raise your voice in anger.',
    card: getMissionCardData('Control Anger')
  },
  {
    id: 'vow-work-life-balance',
    habit: 'Work-Life Balance',
    category: 'MIND',
    difficulty: 'medium',
    shortDesc: 'Balance intense effort with deep recovery.',
    rule: 'Hard boundary at end of workday: disconnect and recharge the spirit.',
    card: getMissionCardData('Work-Life Balance')
  },
  {
    id: 'vow-unbroken-path',
    habit: 'The Unbroken Path',
    category: 'MIND',
    difficulty: 'hard',
    shortDesc: 'Never skip a day on your primary sacred covenant.',
    rule: 'Honor your core commitments with zero skipped days or compromises.',
    card: getMissionCardData('The Unbroken Path')
  },

  // ─── FOCUS (27 Vows) ───────────────────────────────────────────────────────
  {
    id: 'vow-read-20',
    habit: 'Read 20 pages',
    category: 'FOCUS',
    difficulty: 'easy',
    shortDesc: 'Feed your mind with daily structured reading.',
    rule: 'Read 20 physical pages of non-fiction, philosophy, or tactical literature.',
    card: getMissionCardData('Read 20 pages')
  },
  {
    id: 'vow-read-30',
    habit: 'Read 30 mins',
    category: 'FOCUS',
    difficulty: 'easy',
    shortDesc: 'Sharpen the intellect through sustained literature reading.',
    rule: 'Dedicate 30 unbroken minutes to educational or philosophical study.',
    card: getMissionCardData('Read 30 mins')
  },
  {
    id: 'vow-study-1h',
    habit: 'Study 1 Hour',
    category: 'FOCUS',
    difficulty: 'medium',
    shortDesc: 'Dedicated deep study block without interruption.',
    rule: 'Spend 60 minutes studying core concepts in your chosen discipline.',
    card: getMissionCardData('Study 1 Hour')
  },
  {
    id: 'vow-learn-10-words',
    habit: 'Learn 10 New Words',
    category: 'FOCUS',
    difficulty: 'easy',
    shortDesc: 'Expand your vocabulary and linguistic precision.',
    rule: 'Learn and use 10 new terms or vocabulary words today.',
    card: getMissionCardData('Learn 10 New Words')
  },
  {
    id: 'vow-educational-audio',
    habit: 'Listen to Educational Audio',
    category: 'FOCUS',
    difficulty: 'easy',
    shortDesc: 'Turn commute time into active knowledge acquisition.',
    rule: 'Listen to 30 minutes of educational lectures or audiobooks.',
    card: getMissionCardData('Listen to Educational Audio')
  },
  {
    id: 'vow-technical-docs',
    habit: 'Read Technical Docs',
    category: 'FOCUS',
    difficulty: 'hard',
    shortDesc: 'Master core concepts in your chosen discipline.',
    rule: 'Read 30 minutes of primary technical documentation or source papers.',
    card: getMissionCardData('Read Technical Docs')
  },
  {
    id: 'vow-deep-work',
    habit: 'Deep Work',
    category: 'FOCUS',
    difficulty: 'hard',
    shortDesc: 'Single-task with fierce intensity on primary priorities.',
    rule: 'Complete 2 hours of single-tasking deep work with zero interruptions.',
    card: getMissionCardData('Deep Work')
  },
  {
    id: 'vow-deep-work-2h',
    habit: 'Deep Work 2hr Block',
    category: 'FOCUS',
    difficulty: 'hard',
    shortDesc: 'Unbroken focus on high-leverage priorities.',
    rule: 'Lock into a 2-hour uninterrupted deep work session with phones muted.',
    card: getMissionCardData('Deep Work 2hr Block')
  },
  {
    id: 'vow-plan-tomorrow',
    habit: 'Plan Tomorrow Today',
    category: 'FOCUS',
    difficulty: 'easy',
    shortDesc: 'End each evening with an explicit action plan.',
    rule: 'Write down top 3 non-negotiable tasks before shutting down tonight.',
    card: getMissionCardData('Plan Tomorrow Today')
  },
  {
    id: 'vow-inbox-zero',
    habit: 'Inbox Zero Daily',
    category: 'FOCUS',
    difficulty: 'medium',
    shortDesc: 'Process all incoming communications decisively.',
    rule: 'Process email and message inboxes down to zero pending items.',
    card: getMissionCardData('Inbox Zero Daily')
  },
  {
    id: 'vow-single-tasking',
    habit: 'Single-Tasking Only',
    category: 'FOCUS',
    difficulty: 'medium',
    shortDesc: 'Eliminate context switching and multitasking.',
    rule: 'Perform one task at a time; never open split tabs during focus blocks.',
    card: getMissionCardData('Single-Tasking Only')
  },
  {
    id: 'vow-no-social-media',
    habit: 'No social media',
    category: 'FOCUS',
    difficulty: 'hard',
    shortDesc: 'Break the glowing chains of digital distraction.',
    rule: 'Zero mindless social media browsing, infinite scrolling, or feed checking.',
    card: getMissionCardData('No social media')
  },
  {
    id: 'vow-no-social-9pm',
    habit: 'No social media after 9 PM',
    category: 'FOCUS',
    difficulty: 'medium',
    shortDesc: 'Protect your evening peace and restorative sleep.',
    rule: 'No social apps or feeds after 9:00 PM to shield mental state.',
    card: getMissionCardData('No social media after 9 PM')
  },
  {
    id: 'vow-no-social-noon',
    habit: 'No Social Media Before Noon',
    category: 'FOCUS',
    difficulty: 'medium',
    shortDesc: 'Protect morning focus from reactive scrolling.',
    rule: 'No social media or feed consumption until after 12:00 PM.',
    card: getMissionCardData('No Social Media Before Noon')
  },
  {
    id: 'vow-phone-free-meals',
    habit: 'Phone-Free Meals',
    category: 'FOCUS',
    difficulty: 'easy',
    shortDesc: 'Be fully present while eating without screens.',
    rule: 'Put smartphones in another room during every meal of the day.',
    card: getMissionCardData('Phone-Free Meals')
  },
  {
    id: 'vow-digital-fasting',
    habit: 'Digital Fasting (Full Day)',
    category: 'FOCUS',
    difficulty: 'hard',
    shortDesc: 'Complete disconnection from social feeds.',
    rule: 'Spend 24 hours entirely free of social media and entertainment feeds.',
    card: getMissionCardData('Digital Fasting (Full Day)')
  },
  {
    id: 'vow-screen-time-2h',
    habit: 'Screen Time < 2 Hours',
    category: 'FOCUS',
    difficulty: 'hard',
    shortDesc: 'Strict limit on total leisure screen usage.',
    rule: 'Keep total non-work smartphone screen time under 2 hours.',
    card: getMissionCardData('Screen Time < 2 Hours')
  },
  {
    id: 'vow-no-porn',
    habit: 'No porn',
    category: 'FOCUS',
    difficulty: 'hard',
    shortDesc: 'Command base desires and reclaim vital focus.',
    rule: 'Complete abstinence from pornography, lust triggers, and compulsive impulses.',
    card: getMissionCardData('No porn')
  },
  {
    id: 'vow-track-expense',
    habit: 'Track Every Expense',
    category: 'FOCUS',
    difficulty: 'easy',
    shortDesc: 'Record every single purchase for financial awareness.',
    rule: 'Log every financial expenditure down to the exact cent.',
    card: getMissionCardData('Track Every Expense')
  },
  {
    id: 'vow-no-impulse-buy',
    habit: 'No Impulse Buying',
    category: 'FOCUS',
    difficulty: 'medium',
    shortDesc: 'Wait 48 hours before buying non-essential items.',
    rule: 'Enforce a mandatory 48-hour cooling period on any non-essential purchase.',
    card: getMissionCardData('No Impulse Buying')
  },
  {
    id: 'vow-save-income',
    habit: 'Save 20% Income',
    category: 'FOCUS',
    difficulty: 'hard',
    shortDesc: 'Automatically direct funds to long-term wealth.',
    rule: 'Lock away at least 20% of all incoming capital into savings or investment.',
    card: getMissionCardData('Save 20% Income')
  },
  {
    id: 'vow-zero-eating-out',
    habit: 'Zero Eating Out',
    category: 'FOCUS',
    difficulty: 'medium',
    shortDesc: 'Cook meals at home to save capital and health.',
    rule: 'Zero restaurants, delivery, or takeout today; eat solely homemade meals.',
    card: getMissionCardData('Zero Eating Out')
  },
  {
    id: 'vow-write-500',
    habit: 'Write 500 Words',
    category: 'FOCUS',
    difficulty: 'medium',
    shortDesc: 'Express original thoughts in prose daily.',
    rule: 'Write 500 words of original creative or educational prose.',
    card: getMissionCardData('Write 500 Words')
  },
  {
    id: 'vow-create-artifact',
    habit: 'Create 1 Artifact Daily',
    category: 'FOCUS',
    difficulty: 'hard',
    shortDesc: 'Design, draw, or build one tangible piece.',
    rule: 'Produce one concrete artifact: code snippet, sketch, essay, or design.',
    card: getMissionCardData('Create 1 Artifact Daily')
  },
  {
    id: 'vow-practice-instrument',
    habit: 'Practice Instrument 20m',
    category: 'FOCUS',
    difficulty: 'medium',
    shortDesc: 'Hone creative expression through music.',
    rule: 'Practice your musical craft with deliberate exercises for 20 minutes.',
    card: getMissionCardData('Practice Instrument 20m')
  },
  {
    id: 'vow-capture-3-ideas',
    habit: 'Capture 3 Ideas Daily',
    category: 'FOCUS',
    difficulty: 'easy',
    shortDesc: 'Document creative inspirations immediately.',
    rule: 'Document at least 3 original sparks, concepts, or solutions today.',
    card: getMissionCardData('Capture 3 Ideas Daily')
  },
  {
    id: 'vow-start-now',
    habit: 'Start Now',
    category: 'FOCUS',
    difficulty: 'medium',
    shortDesc: 'Eliminate procrastination through immediate execution.',
    rule: 'Initiate your hardest task within 5 minutes of your work block without hesitation.',
    card: getMissionCardData('Start Now')
  },
  {
    id: 'vow-public-speaking',
    habit: 'Public Speaking',
    category: 'FOCUS',
    difficulty: 'medium',
    shortDesc: 'Project confidence and articulate thought with leadership.',
    rule: 'Deliver remarks, record a spoken lesson, or speak up with clarity and conviction.',
    card: getMissionCardData('Public Speaking')
  },
];

export const CATALOG_CARD_NAMES = MASTER_VOW_CATALOG.map(v => v.habit);

export function getAllCatalogCards(): MissionCardData[] {
  return MASTER_VOW_CATALOG.map(v => v.card);
}

export function getCompleteVowCatalog(): VowCatalogEntry[] {
  let customEntries: VowCatalogEntry[] = [];
  try {
    const store = require('../store/useAppStore').useAppStore;
    const state = store?.getState?.();
    const customVows: CustomVowMetadata[] = state?.customVows || [];
    const activeVows = state?.activeVows || [];

    const customHabitsMap = new Map<string, { id: string; habit: string; category?: 'BODY' | 'MIND' | 'FOCUS'; difficulty?: 'easy' | 'medium' | 'hard'; desc?: string }>();

    customVows.forEach(cv => {
      customHabitsMap.set(cv.habit.toLowerCase().trim(), {
        id: cv.id,
        habit: cv.habit,
        category: cv.category,
        difficulty: cv.difficulty,
        desc: cv.commitment,
      });
    });

    activeVows.forEach((av: any) => {
      if (av.is_custom && av.custom_name) {
        const key = av.custom_name.toLowerCase().trim();
        if (!customHabitsMap.has(key)) {
          const card = autoAssignCustomCardData(av.custom_name);
          customHabitsMap.set(key, {
            id: av.id || `custom-${key.replace(/\s+/g, '-')}`,
            habit: av.custom_name,
            category: card.category || 'BODY',
            difficulty: av.difficulty || 'medium',
            desc: av.custom_name,
          });
        }
      }
    });

    customEntries = Array.from(customHabitsMap.values()).map(item => {
      const card = getMissionCardData(item.habit);
      return {
        id: item.id,
        habit: item.habit,
        category: item.category || card.category || 'BODY',
        difficulty: item.difficulty || 'medium',
        shortDesc: item.desc || item.habit,
        rule: item.desc || item.habit,
        card: card,
        isCustom: true,
      };
    });
  } catch (e) {
    // fallback if uninitialized
  }

  return [...customEntries, ...MASTER_VOW_CATALOG];
}

export function getVowCatalogEntry(habitName: string): VowCatalogEntry | undefined {
  const all = getCompleteVowCatalog();
  const lower = (habitName || '').toLowerCase().trim();
  return all.find(v => v.habit.toLowerCase().trim() === lower || v.id.toLowerCase() === lower);
}



export interface ZenAvatarItem {
  id: string;
  title: string;
  category: 'warriors' | 'scholars' | 'monks' | 'creators' | 'guardians';
  kanji: string;
  bgGrad: [string, string];
  borderColor: string;
  iconSymbol: string;
  description: string;
}

export const ZEN_AVATAR_LIBRARY: ZenAvatarItem[] = [
  // WARRIORS
  {
    id: 'zen_warrior_samurai',
    title: 'Bushido Samurai',
    category: 'warriors',
    kanji: '武',
    bgGrad: ['#2A241E', '#161412'],
    borderColor: '#F3BA45',
    iconSymbol: '⚔️',
    description: 'Master of unwavering discipline and honorable blade'
  },
  {
    id: 'zen_warrior_ronin',
    title: 'Silent Ronin',
    category: 'warriors',
    kanji: '浪',
    bgGrad: ['#25282A', '#131517'],
    borderColor: '#B5A082',
    iconSymbol: '🗡️',
    description: 'Wanderer of the solitary discipline path'
  },
  {
    id: 'zen_warrior_sun',
    title: 'Sun Warrior',
    category: 'warriors',
    kanji: '陽',
    bgGrad: ['#33251A', '#1A120B'],
    borderColor: '#D4AF37',
    iconSymbol: '🌅',
    description: 'Awakened with the morning dawn flame'
  },

  // SCHOLARS
  {
    id: 'zen_scholar_scroll',
    title: 'Scroll Keeper',
    category: 'scholars',
    kanji: '文',
    bgGrad: ['#1A2433', '#0F1622'],
    borderColor: '#4A90E2',
    iconSymbol: '📜',
    description: 'Custodian of ancient wisdom and clarity'
  },
  {
    id: 'zen_scholar_astrologer',
    title: 'Starlight Sage',
    category: 'scholars',
    kanji: '星',
    bgGrad: ['#1A1E30', '#0B0D18'],
    borderColor: '#7B8DBB',
    iconSymbol: '🌌',
    description: 'Observer of cosmic cycles and focus'
  },
  {
    id: 'zen_scholar_ink',
    title: 'Calligraphy Master',
    category: 'scholars',
    kanji: '墨',
    bgGrad: ['#232328', '#101014'],
    borderColor: '#A89F91',
    iconSymbol: '🖌️',
    description: 'Forges focus through precise brushstrokes'
  },

  // MONKS
  {
    id: 'zen_monk_master',
    title: 'Zen Master',
    category: 'monks',
    kanji: '禅',
    bgGrad: ['#1E2C28', '#0D1714'],
    borderColor: '#50E3C2',
    iconSymbol: '🧘',
    description: 'Unshakable tranquility amid chaos'
  },
  {
    id: 'zen_monk_enso',
    title: 'Ensō Pilgrim',
    category: 'monks',
    kanji: '円',
    bgGrad: ['#292823', '#141411'],
    borderColor: '#F3BA45',
    iconSymbol: '⭕',
    description: 'Seeks completion in stillness and breath'
  },
  {
    id: 'zen_monk_mountain',
    title: 'Mountain Anchor',
    category: 'monks',
    kanji: '山',
    bgGrad: ['#1E2328', '#0E1216'],
    borderColor: '#72899A',
    iconSymbol: '🏔️',
    description: 'Immovable presence forged over centuries'
  },

  // CREATORS
  {
    id: 'zen_creator_painter',
    title: 'Sumi-e Painter',
    category: 'creators',
    kanji: '藝',
    bgGrad: ['#30231D', '#17100D'],
    borderColor: '#E67E22',
    iconSymbol: '🎨',
    description: 'Breathes life into formless ideas'
  },
  {
    id: 'zen_creator_forge',
    title: 'Forge Craftsman',
    category: 'creators',
    kanji: '鍛',
    bgGrad: ['#35201A', '#1C0F0B'],
    borderColor: '#D35400',
    iconSymbol: '🔨',
    description: 'Shapes raw potential into enduring steel'
  },
  {
    id: 'zen_creator_bamboo',
    title: 'Bamboo Sculptor',
    category: 'creators',
    kanji: '竹',
    bgGrad: ['#222B22', '#0E140E'],
    borderColor: '#78AB78',
    iconSymbol: '🎋',
    description: 'Flexible resilience that bends without breaking'
  },

  // GUARDIANS
  {
    id: 'zen_guardian_flame',
    title: 'Vajra Flame Guardian',
    category: 'guardians',
    kanji: '金',
    bgGrad: ['#3B2A1A', '#1F150B'],
    borderColor: '#FFD700',
    iconSymbol: '🔥',
    description: 'Protector of the eternal discipline core'
  }
];

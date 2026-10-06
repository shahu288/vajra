import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  User, 
  UserVow, 
  DailyLog, 
  Squad, 
  SquadMessage, 
  PathType, 
  SquadMember, 
  MatchmakingState, 
  MemberDailyStatus, 
  DifficultyTier, 
  CustomVowMetadata, 
  ArchetypeKey 
} from '../types';
import { supabase } from '../services/supabase';
import { calculateCurrentStreak, getLocalDateString } from '../utils/dates';
import { generateSquadName, generatePeerForUser, rankSquadMembers } from '../utils/squadMatchmaking';

function getPastDates(count: number, includeToday: boolean = false): string[] {
  const dates = [];
  const startOffset = includeToday ? 0 : 1;
  for (let i = startOffset; i < count + startOffset; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(getLocalDateString(d));
  }
  return dates;
}

interface AppState {
  user: User | null;
  activeVows: UserVow[];
  customVows: CustomVowMetadata[];
  dailyLog: DailyLog | null;
  vowLogs: Record<string, boolean>; // Maps vowId -> completed (boolean)
  vowProgress: Record<string, number>; // Maps vowId -> current progress amount (number)
  vowReflections: Record<string, string>; // Maps vowId -> reflection note (string)
  vowHistoryDates: Record<string, string[]>; // Maps vowId -> completed dates (YYYY-MM-DD)
  vowHighestStreak: Record<string, number>; // Maps vowId -> highest streak count
  squad: Squad | null;
  squadMembers: SquadMember[];
  chatMessages: SquadMessage[];
  pastSquads: Squad[];
  isLoading: boolean;
  showOnboarding: boolean;
  baseDisciplineScore: number;
  matchmakingState: MatchmakingState;
  showCycleSummary: boolean;
  assembledBannerText: string | null;
  leaveSquad: () => void;
  
  // Custom Vow creation & deletion
  createCustomVow: (data: {
    habit: string;
    commitment?: string;
    category?: 'BODY' | 'MIND' | 'FOCUS';
    difficulty?: DifficultyTier;
    archetype?: ArchetypeKey;
    cardTitle?: string;
  }) => CustomVowMetadata;
  deleteCustomVow: (idOrHabit: string) => void;
  
  // Auth & Onboarding actions
  setUser: (user: User | null) => void;
  setShowOnboarding: (show: boolean) => void;
  completeOnboarding: (
    displayName: string, 
    path: PathType, 
    selectedVows: { name: string; difficulty: 'easy' | 'medium' | 'hard'; category?: string; desc?: string }[]
  ) => void;
  initializeUserSession: () => Promise<void>;
  
  // Daily Loop actions
  fetchTodayLogs: () => Promise<void>;
  checkInVow: (vowId: string, completed: boolean) => Promise<void>;
  updateVowProgress: (vowId: string, progress: number) => Promise<void>;
  updateVowReflection: (vowId: string, note: string, dateStr?: string) => Promise<void>;
  updateWaterIntake: (ml: number) => Promise<void>;
  updateMood: (mood: 'struggling' | 'neutral' | 'focused' | 'on_fire') => Promise<void>;
  scheduleRestDay: (dateStr: string) => Promise<void>;
  useRecoveryShield: () => Promise<void>;
  checkDailyReset: () => void;
  
  // Squad & Matchmaking actions
  fetchSquadDetails: () => Promise<void>;
  sendSquadMessage: (text: string) => Promise<void>;
  nudgeSquadMember: (targetUserId: string, targetUserName: string, vowName: string) => Promise<void>;
  startMatchmaking: () => void;
  clearAssembledBanner: () => void;
  checkSquadLifecycle: () => void;
  completeCycleAndRematch: () => void;
  replaceInactiveMember: (memberId: string) => void;
  updateSquadName: (name: string) => void;
  updateUserProfile: (displayName: string, avatarUrl: string | null) => Promise<void>;
  swapActiveVow: (oldVowId: string, newVowName: string, difficulty?: 'easy' | 'medium' | 'hard') => void;
  addActiveVow: (newVowName: string, difficulty?: 'easy' | 'medium' | 'hard') => boolean;

  // Day 7 Card Unlock & Persistence state
  celebratedCardUnlocks: string[];
  pendingCardReveal: {
    vowId: string;
    vowName: string;
    streak: number;
    difficulty?: string;
    weight?: number;
  } | null;
  clearPendingCardReveal: () => void;
  _hasHydrated: boolean;
  setHasHydrated: (val: boolean) => void;
}


// Initial mock data for offline development
const mockUser: User = {
  id: 'mock-user-id',
  display_name: 'Arjuna',
  identity_path: 'warrior',
  discipline_score: 76,
  xp: 340,
  level: 'Building',
  recovery_shields: 2,
  sleep_target: '22:30:00',
  wake_target: '06:00:00',
  squad_id: 'mock-squad-id',
  last_active_at: new Date().toISOString(),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

const mockVows: UserVow[] = [
  { id: 'vow-1', user_id: 'mock-user-id', behavior_id: null, custom_name: 'Wake before 6 AM', difficulty: 'medium', weight: 1.5, frequency: 'daily', is_active: true, created_at: new Date().toISOString() },
  { id: 'vow-2', user_id: 'mock-user-id', behavior_id: null, custom_name: 'Workout 45 min', difficulty: 'medium', weight: 1.5, frequency: 'daily', is_active: true, created_at: new Date().toISOString() },
  { id: 'vow-3', user_id: 'mock-user-id', behavior_id: null, custom_name: 'No social media', difficulty: 'hard', weight: 2.0, frequency: 'daily', is_active: true, created_at: new Date().toISOString() }
];

const mockSquadMembers: SquadMember[] = [
  {
    id: 'member-1',
    display_name: 'Rohit',
    identity_path: 'scholar',
    discipline_score: 92,
    streak: 29,
    daily_status: 'completed',
    last_active_at: 'Active 20m ago',
    rank: 1,
    is_me: false,
    inactive_days: 0,
    avatar_color: '#4A90E2'
  },
  {
    id: 'mock-user-id',
    display_name: 'Arjuna',
    identity_path: 'warrior',
    discipline_score: 76,
    streak: 12,
    daily_status: 'pending',
    last_active_at: 'Active 5m ago',
    rank: 2,
    is_me: true,
    inactive_days: 0,
    avatar_color: '#F3BA45'
  },
  {
    id: 'member-2',
    display_name: 'Shreya',
    identity_path: 'monk',
    discipline_score: 64,
    streak: 8,
    daily_status: 'pending',
    last_active_at: 'Active 1h ago',
    rank: 3,
    is_me: false,
    inactive_days: 0,
    avatar_color: '#50E3C2'
  },
  {
    id: 'member-3',
    display_name: 'Karan',
    identity_path: 'creator',
    discipline_score: 41,
    streak: 3,
    daily_status: 'missed',
    last_active_at: 'Active 2d ago',
    rank: 4,
    is_me: false,
    inactive_days: 0,
    avatar_color: '#E67E22'
  }
];

const mockSquad: Squad = {
  id: 'mock-squad-id',
  name: 'SQUAD VAYU-42',
  invite_code: 'VJR88X',
  created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  journey_start_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  journey_days_total: 30,
  status: 'active',
  global_rank: 4
};

const mockMessages: SquadMessage[] = [
  {
    id: 'msg-sys-1',
    squad_id: 'mock-squad-id',
    sender_id: null,
    type: 'system_event',
    body: "Rohit kept his vow (Warrior's Dawn) · 2h ago",
    metadata: {},
    created_at: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'msg-shreya-1',
    squad_id: 'mock-squad-id',
    sender_id: 'member-2', // Shreya
    type: 'text',
    body: 'Silent check-ins locked in. Morning meditation done.',
    metadata: {},
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'msg-rohit-1',
    squad_id: 'mock-squad-id',
    sender_id: 'member-1', // Rohit
    type: 'text',
    body: 'Heading to the iron temple now. Hold the line today.',
    metadata: {},
    created_at: new Date(Date.now() - 1800000).toISOString(),
  },
];

export interface VowConfig {
  isTarget: boolean;
  target: number;
  unit: string;
  icon: string;
}

export function getVowConfig(name: string): VowConfig {
  const lower = name.toLowerCase();
  
  if (lower.includes('run') || lower.includes('jog') || lower.includes('walk')) {
    const num = parseInt(lower.replace(/[^0-9]/g, '')) || 5;
    return { isTarget: true, target: num, unit: lower.includes('km') ? 'km' : 'km', icon: '🏃' };
  }
  if (lower.includes('read') || lower.includes('pages') || lower.includes('book')) {
    const num = parseInt(lower.replace(/[^0-9]/g, '')) || 20;
    return { isTarget: true, target: num, unit: 'pages', icon: '📚' };
  }
  if (lower.includes('water') || lower.includes('hydrate')) {
    const num = parseInt(lower.replace(/[^0-9]/g, '')) || 2000;
    return { isTarget: true, target: num, unit: 'ml', icon: '💧' };
  }
  if (lower.includes('study') || lower.includes('work') || lower.includes('focus') || lower.includes('workout') || lower.includes('study time')) {
    const num = parseInt(lower.replace(/[^0-9]/g, '')) || 45;
    return { isTarget: true, target: num, unit: 'mins', icon: lower.includes('workout') ? '🔥' : '🧠' };
  }
  
  // Binary Vows
  if (lower.includes('sugar') || lower.includes('junk')) {
    return { isTarget: false, target: 1, unit: '', icon: '🚫' };
  }
  if (lower.includes('porn') || lower.includes('nofap')) {
    return { isTarget: false, target: 1, unit: '', icon: '🔒' };
  }
  if (lower.includes('alcohol') || lower.includes('drink')) {
    return { isTarget: false, target: 1, unit: '', icon: '🍺' };
  }
  if (lower.includes('social') || lower.includes('screen')) {
    return { isTarget: false, target: 1, unit: '', icon: '📱' };
  }
  if (lower.includes('wake') || lower.includes('early')) {
    return { isTarget: false, target: 1, unit: '', icon: '🌅' };
  }
  if (lower.includes('sleep') || lower.includes('bed')) {
    return { isTarget: false, target: 1, unit: '', icon: '🌙' };
  }
  if (lower.includes('cold') || lower.includes('shower')) {
    return { isTarget: false, target: 1, unit: '', icon: '🥶' };
  }
  
  return { isTarget: false, target: 1, unit: '', icon: '✨' };
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      activeVows: [],
      customVows: [],
      dailyLog: null,
      vowLogs: {},
      vowProgress: {},
      vowReflections: {},
      vowHistoryDates: {},
      vowHighestStreak: {},
      squad: null,
      squadMembers: [],
      chatMessages: [],
      pastSquads: [],
      isLoading: false,
      showOnboarding: true, // Default to true so onboarding renders on startup
      baseDisciplineScore: 50,
      matchmakingState: {
        status: 'idle',
        status_message: 'Finding your discipline squad...',
        filled_seats: 0,
        total_seats: 4,
        members: []
      },
      showCycleSummary: false,
      assembledBannerText: null,
      celebratedCardUnlocks: [],
      pendingCardReveal: null,
      _hasHydrated: false,
      setHasHydrated: (val: boolean) => set({ _hasHydrated: val }),
      clearPendingCardReveal: () => set({ pendingCardReveal: null }),

      setUser: (user) => set({ user }),
      setShowOnboarding: (showOnboarding) => set({ showOnboarding }),

  completeOnboarding: (displayName, path, selectedVows) => {
    const newUser: User = {
      id: 'mock-user-id',
      display_name: displayName,
      identity_path: path,
      discipline_score: 50, // Starts fresh at neutral score
      xp: 0,
      level: 'Awakening',
      recovery_shields: 1,
      sleep_target: '22:30:00',
      wake_target: '06:00:00',
      squad_id: 'mock-squad-id',
      last_active_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { MASTER_VOW_CATALOG, autoAssignCustomCardData } = require('../utils/cardMapping');
    const newCustomVows: CustomVowMetadata[] = [...get().customVows];

    const newVowsList: UserVow[] = selectedVows.map((v, i) => {
      const isOfficial = MASTER_VOW_CATALOG.some((catVow: any) => catVow.habit.toLowerCase() === v.name.toLowerCase());
      const isCustom = v.category === 'Custom' || !isOfficial;

      if (isCustom) {
        const autoCard = autoAssignCustomCardData(v.name, v.desc);
        const alreadySaved = newCustomVows.some(cv => cv.habit.toLowerCase() === v.name.toLowerCase());
        if (!alreadySaved) {
          newCustomVows.push({
            id: `custom-vow-${Date.now()}-${i}`,
            habit: v.name,
            commitment: v.desc || v.name,
            category: autoCard.category || 'BODY',
            difficulty: v.difficulty || 'medium',
            archetype: (autoCard.category === 'MIND' ? 'SCHOLAR' : autoCard.category === 'BODY' ? 'WARRIOR' : 'FORGE'),
            cardTitle: autoCard.title,
            guardian: autoCard.guardian,
            quote: autoCard.quote,
            artworkKey: 'auto',
            isCustom: true,
            createdAt: new Date().toISOString()
          });
        }
      }

      return {
        id: `vow-${i + 1}`,
        user_id: 'mock-user-id',
        behavior_id: null,
        custom_name: v.name,
        difficulty: v.difficulty,
        weight: v.difficulty === 'hard' ? 2.0 : v.difficulty === 'medium' ? 1.5 : 1.0,
        frequency: 'daily',
        is_active: true,
        is_custom: isCustom,
        created_at: new Date().toISOString()
      };
    });

    const logsMap: Record<string, boolean> = {};
    const progressMap: Record<string, number> = {};
    const reflectionsMap: Record<string, string> = {};
    const historyMap: Record<string, string[]> = {};
    const highestStreakMap: Record<string, number> = {};
    newVowsList.forEach(vow => {
      progressMap[vow.id] = 0;
      reflectionsMap[vow.id] = '';
      historyMap[vow.id] = [];
      highestStreakMap[vow.id] = 0;
    });

    set({
      user: newUser,
      activeVows: newVowsList,
      customVows: newCustomVows,
      vowLogs: logsMap,
      vowProgress: progressMap,
      vowReflections: reflectionsMap,
      vowHistoryDates: historyMap,
      vowHighestStreak: highestStreakMap,
      showOnboarding: false,
      baseDisciplineScore: 50,
      celebratedCardUnlocks: [],
      pendingCardReveal: null,
      dailyLog: {
        id: 'mock-log-id',
        user_id: 'mock-user-id',
        log_date: new Date().toISOString().split('T')[0],
        water_ml: 0,
        mood: null,
        is_rest_day: false,
        shield_spent: false,
        created_at: new Date().toISOString()
      }
    });

    // Automatically launch background matchmaking after onboarding
    get().startMatchmaking();
  },

  checkDailyReset: () => {
    const { dailyLog, user } = get();
    if (!dailyLog) return;
    const todayStr = getLocalDateString();
    if (dailyLog.log_date !== todayStr) {
      set({
        vowLogs: {},
        vowProgress: {},
        vowReflections: {},
        dailyLog: {
          id: 'mock-log-id',
          user_id: user?.id || 'mock-user-id',
          log_date: todayStr,
          water_ml: 0,
          mood: null,
          is_rest_day: false,
          shield_spent: false,
          created_at: new Date().toISOString()
        }
      });
    }
  },

  initializeUserSession: async () => {
    get().checkDailyReset();
    set({ isLoading: true });
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (profile) {
          set({ user: profile as User });
          await get().fetchTodayLogs();
          await get().fetchSquadDetails();
        }
      }
    } catch (e) {
      console.warn('Failed to connect to Supabase, continuing with mock user state.');
    } finally {
      set({ isLoading: false });
    }
  },

  fetchTodayLogs: async () => {
    const { user } = get();
    if (!user || user.id === 'mock-user-id') return;

    const todayStr = new Date().toISOString().split('T')[0];
    try {
      const { data: dailyLog } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('log_date', todayStr)
        .single();

      if (dailyLog) {
        const { data: logItems } = await supabase
          .from('vow_logs')
          .select('*')
          .eq('daily_log_id', dailyLog.id);

        const logsMap: Record<string, boolean> = {};
        logItems?.forEach((item: any) => {
          logsMap[item.vow_id] = item.completed;
        });

        let keptPoints = 0;
        let lapsedPoints = 0;
        const { activeVows } = get();
        activeVows.forEach((vow) => {
          const status = logsMap[vow.id];
          const weight = vow.weight || 1.0;
          if (status === true) {
            keptPoints += 5 * weight;
          } else if (status === false) {
            lapsedPoints += 8 * weight;
          }
        });

        const baseScore = Math.max(0, Math.min(100, user.discipline_score - (keptPoints - lapsedPoints)));

        set({ dailyLog: dailyLog as DailyLog, vowLogs: logsMap, baseDisciplineScore: baseScore });
      }
    } catch (e) {
      console.error('Failed to load logs from database.', e);
    }
  },

  checkInVow: async (vowId, completed) => {
    get().checkDailyReset();
    const { vowLogs, vowProgress, activeVows, baseDisciplineScore, vowHistoryDates, vowHighestStreak, squadMembers } = get();
    const newLogs = { ...vowLogs, [vowId]: completed };
    
    const updatedProgress = { ...vowProgress };
    const vow = activeVows.find(v => v.id === vowId);
    if (vow) {
      const config = getVowConfig(vow.custom_name || '');
      if (!config.isTarget) {
        updatedProgress[vowId] = completed ? 1 : 0;
      } else if (completed) {
        if ((updatedProgress[vowId] || 0) < config.target) {
          updatedProgress[vowId] = config.target;
        }
      } else {
        if ((updatedProgress[vowId] || 0) >= config.target) {
          updatedProgress[vowId] = 0;
        }
      }
    }

    const todayStr = getLocalDateString();
    let currentVowDates = vowHistoryDates[vowId] ? [...vowHistoryDates[vowId]] : [];
    if (completed) {
      if (!currentVowDates.includes(todayStr)) {
        currentVowDates = [todayStr, ...currentVowDates].sort((a, b) => b.localeCompare(a));
      }
    } else {
      currentVowDates = currentVowDates.filter(d => d !== todayStr);
    }
    const newHistoryDates = { ...vowHistoryDates, [vowId]: currentVowDates };

    const currentStreak = calculateCurrentStreak(currentVowDates);
    const newHighest = Math.max(vowHighestStreak[vowId] || 0, currentStreak);
    const newHighestStreaks = { ...vowHighestStreak, [vowId]: newHighest };

    let keptPoints = 0;
    let lapsedPoints = 0;
    activeVows.forEach((v) => {
      const status = newLogs[v.id];
      const weight = v.weight || 1.0;
      if (status === true) {
        keptPoints += 5 * weight;
      } else if (status === false) {
        lapsedPoints += 8 * weight;
      }
    });

    const newScore = Math.max(0, Math.min(100, Math.round(baseDisciplineScore + keptPoints - lapsedPoints)));
    const updatedUser = get().user ? { ...get().user!, discipline_score: newScore } : null;

    // Recalculate current user's daily_status inside Squad Members
    const totalActiveVows = activeVows.length;
    const completedVowsCount = Object.values(newLogs).filter(Boolean).length;
    let userDailyStatus: MemberDailyStatus = 'pending';
    if (totalActiveVows > 0 && completedVowsCount === totalActiveVows) {
      userDailyStatus = 'completed';
    } else if (completedVowsCount === 0) {
      userDailyStatus = 'pending';
    }

    const updatedSquadMembers = squadMembers.map((m) => {
      if (m.is_me || m.id === 'mock-user-id') {
        return {
          ...m,
          discipline_score: newScore,
          daily_status: userDailyStatus,
          last_active_at: 'Active just now'
        };
      }
      return m;
    });

    const reRankedMembers = rankSquadMembers(updatedSquadMembers);

    // Day 7 Card Unlock & Reveal Animation Trigger
    const { celebratedCardUnlocks = [] } = get();
    let nextCelebrated = [...celebratedCardUnlocks];
    let pendingReveal = get().pendingCardReveal;

    const currentVow = activeVows.find(v => v.id === vowId);
    const habitName = currentVow?.custom_name || '';
    const habitKey = habitName.toLowerCase().trim();

    const prevStreak = calculateCurrentStreak(vowHistoryDates[vowId] || []);
    if (completed && prevStreak < 7 && currentStreak >= 7 && !celebratedCardUnlocks.includes(habitKey)) {
      nextCelebrated.push(habitKey);
      pendingReveal = {
        vowId,
        vowName: habitName,
        streak: currentStreak,
        difficulty: currentVow?.difficulty || 'medium',
        weight: currentVow?.weight || 1.5,
      };
    }

    set({ 
      vowLogs: newLogs, 
      vowProgress: updatedProgress, 
      vowHistoryDates: newHistoryDates, 
      vowHighestStreak: newHighestStreaks,
      user: updatedUser,
      squadMembers: reRankedMembers,
      celebratedCardUnlocks: nextCelebrated,
      pendingCardReveal: pendingReveal,
    });

    const { user, dailyLog } = get();
    if (!user || user.id === 'mock-user-id' || !dailyLog) return;

    try {
      await supabase
        .from('vow_logs')
        .upsert({
          daily_log_id: dailyLog.id,
          vow_id: vowId,
          completed,
          created_at: new Date().toISOString()
        });

      await supabase
        .from('users')
        .update({ discipline_score: newScore })
        .eq('id', user.id);
    } catch (e) {
      console.error('Failed to save vow checkin to database.', e);
    }
  },

  updateVowProgress: async (vowId, progress) => {
    const { vowProgress, activeVows, vowLogs, checkInVow } = get();
    const updatedProgress = { ...vowProgress, [vowId]: progress };
    set({ vowProgress: updatedProgress });

    const vow = activeVows.find(v => v.id === vowId);
    if (vow) {
      const config = getVowConfig(vow.custom_name || '');
      if (config.isTarget) {
        const isCompleted = progress >= config.target;
        if (vowLogs[vowId] !== isCompleted) {
          await checkInVow(vowId, isCompleted);
        }
      }
    }
  },

  updateVowReflection: async (vowId, note, dateStr) => {
    const { vowReflections, user, dailyLog } = get();
    const targetDate = dateStr || getLocalDateString(new Date());
    const updated = { 
      ...vowReflections, 
      [vowId]: note,
      [`${vowId}_${targetDate}`]: note 
    };
    set({ vowReflections: updated });

    if (!user || user.id === 'mock-user-id' || !dailyLog) return;
    try {
      await supabase
        .from('vow_logs')
        .update({ reflection: note })
        .eq('daily_log_id', dailyLog.id)
        .eq('vow_id', vowId);
    } catch (e) {
      console.error('Failed to save reflection to database.', e);
    }
  },

  updateWaterIntake: async (ml) => {
    const { dailyLog } = get();
    if (!dailyLog) return;
    set({ dailyLog: { ...dailyLog, water_ml: ml } });

    const { user } = get();
    if (!user || user.id === 'mock-user-id') return;

    try {
      await supabase
        .from('daily_logs')
        .update({ water_ml: ml })
        .eq('id', dailyLog.id);
    } catch (e) {
      console.error('Failed to save water intake.', e);
    }
  },

  updateMood: async (mood) => {
    const { dailyLog } = get();
    if (!dailyLog) return;
    set({ dailyLog: { ...dailyLog, mood } });

    const { user } = get();
    if (!user || user.id === 'mock-user-id') return;

    try {
      await supabase
        .from('daily_logs')
        .update({ mood })
        .eq('id', dailyLog.id);
    } catch (e) {
      console.error('Failed to save mood.', e);
    }
  },

  scheduleRestDay: async (dateStr) => {
    const { user } = get();
    if (!user || user.id === 'mock-user-id') return;

    try {
      await supabase
        .from('daily_logs')
        .insert({
          user_id: user.id,
          log_date: dateStr,
          is_rest_day: true
        });
    } catch (e) {
      console.error('Failed to schedule rest day.', e);
    }
  },

  useRecoveryShield: async () => {
    const { user, dailyLog } = get();
    if (!user || user.id === 'mock-user-id' || !dailyLog) return;
    if (user.recovery_shields <= 0) return;

    set({
      user: { ...user, recovery_shields: user.recovery_shields - 1 },
      dailyLog: { ...dailyLog, shield_spent: true }
    });

    try {
      await supabase
        .from('users')
        .update({ recovery_shields: user.recovery_shields - 1 })
        .eq('id', user.id);

      await supabase
        .from('daily_logs')
        .update({ shield_spent: true })
        .eq('id', dailyLog.id);
    } catch (e) {
      console.error('Failed to spend recovery shield.', e);
    }
  },

  fetchSquadDetails: async () => {
    const { user } = get();
    if (!user || user.id === 'mock-user-id' || !user.squad_id) return;

    try {
      const { data: squad } = await supabase
        .from('squads')
        .select('*')
        .eq('id', user.squad_id)
        .single();

      if (squad) {
        const { data: messages } = await supabase
          .from('squad_messages')
          .select('*')
          .eq('squad_id', user.squad_id)
          .order('created_at', { ascending: false })
          .limit(50);

        set({
          squad: squad as Squad,
          chatMessages: (messages || []).reverse() as SquadMessage[]
        });
      }
    } catch (e) {
      console.error('Failed to load squad details.', e);
    }
  },

  sendSquadMessage: async (body) => {
    const { user, squad, chatMessages } = get();
    if (!user || !squad) return;

    const localMsg: SquadMessage = {
      id: Math.random().toString(),
      squad_id: squad.id,
      sender_id: user.id,
      type: 'text',
      body,
      metadata: {},
      created_at: new Date().toISOString()
    };

    set({ chatMessages: [...chatMessages, localMsg] });

    if (user.id === 'mock-user-id') return;

    try {
      await supabase
        .from('squad_messages')
        .insert({
          squad_id: squad.id,
          sender_id: user.id,
          type: 'text',
          body
        });
    } catch (e) {
      console.error('Failed to send squad message.', e);
    }
  },

  nudgeSquadMember: async (targetUserId, targetUserName, vowName) => {
    const { user, squad, chatMessages } = get();
    if (!user || !squad) return;

    const text = `sent a verification request to ${targetUserName} for: "${vowName}"`;
    const localMsg: SquadMessage = {
      id: Math.random().toString(),
      squad_id: squad.id,
      sender_id: user.id,
      type: 'nudge_request',
      body: text,
      metadata: {
        target_user_id: targetUserId,
        target_user_name: targetUserName,
        nudge_vow_name: vowName
      },
      created_at: new Date().toISOString()
    };

    set({ chatMessages: [...chatMessages, localMsg] });

    if (user.id === 'mock-user-id') return;

    try {
      await supabase
        .from('squad_messages')
        .insert({
          squad_id: squad.id,
          sender_id: user.id,
          type: 'nudge_request',
          body: text,
          metadata: {
            target_user_id: targetUserId,
            target_user_name: targetUserName,
            nudge_vow_name: vowName
          }
        });
    } catch (e) {
      console.error('Failed to send nudge request.', e);
    }
  },

  // ─── Automated Matchmaking & Lifecycle Actions ─────────────────────────
  startMatchmaking: () => {
    const { user } = get();
    const currentUserScore = user?.discipline_score || 50;
    const currentPath = user?.identity_path || 'warrior';

    const meMember: SquadMember = {
      id: user?.id || 'mock-user-id',
      display_name: user?.display_name || 'Warrior',
      identity_path: currentPath,
      discipline_score: currentUserScore,
      streak: 1,
      daily_status: 'pending',
      last_active_at: 'Active just now',
      rank: 1,
      is_me: true,
      inactive_days: 0,
      avatar_color: '#F3BA45'
    };

    const squadName = generateSquadName();

    set({
      squad: {
        id: `squad-${Date.now()}`,
        name: squadName,
        invite_code: 'VJR' + Math.floor(Math.random() * 899 + 100),
        created_at: new Date().toISOString(),
        journey_start_date: new Date().toISOString(),
        journey_days_total: 30,
        status: 'building',
        global_rank: Math.floor(Math.random() * 20) + 1
      },
      matchmakingState: {
        status: 'searching',
        status_message: 'Finding your discipline squad...',
        filled_seats: 1,
        total_seats: 4,
        members: [meMember, null, null, null]
      },
      assembledBannerText: null
    });

    // Non-blocking step 1: checking squads
    setTimeout(() => {
      const state = get().matchmakingState;
      if (state.status === 'searching') {
        set({
          matchmakingState: {
            ...state,
            status: 'checking_squads',
            status_message: 'Matching you with warriors walking a similar path...'
          }
        });
      }
    }, 1200);

    // Step 2: seat 2 fills
    setTimeout(() => {
      const peer2 = generatePeerForUser(currentUserScore, 3, currentPath, 1);
      set((prev) => ({
        matchmakingState: {
          ...prev.matchmakingState,
          status: 'waiting_for_seats',
          status_message: 'Building your circle of accountability...',
          filled_seats: 2,
          members: [prev.matchmakingState.members[0], peer2, null, null]
        }
      }));
    }, 2800);

    // Step 3: seat 3 fills
    setTimeout(() => {
      const peer3 = generatePeerForUser(currentUserScore, 7, currentPath, 2);
      set((prev) => ({
        matchmakingState: {
          ...prev.matchmakingState,
          filled_seats: 3,
          status_message: 'Searching for committed companions...',
          members: [prev.matchmakingState.members[0], prev.matchmakingState.members[1], peer3, null]
        }
      }));
    }, 4400);

    // Step 4: all 4 seats assembled!
    setTimeout(() => {
      const currentMembers = get().matchmakingState.members.filter(Boolean) as SquadMember[];
      const peer4 = generatePeerForUser(currentUserScore, 12, currentPath, 3);
      const all4 = [...currentMembers, peer4];
      const ranked4 = rankSquadMembers(all4);

      const squad = get().squad;
      const updatedSquad = squad ? { ...squad, status: 'active' as const } : null;

      const welcomeMessages: SquadMessage[] = [
        {
          id: `msg-${Date.now()}-1`,
          squad_id: squad?.id || 'new-squad',
          sender_id: ranked4[1]?.id || 'peer-1',
          type: 'text',
          body: 'Circle assembled. Ready to hold the line together ⚔️',
          metadata: {},
          created_at: new Date().toISOString()
        }
      ];

      set({
        squad: updatedSquad,
        squadMembers: ranked4,
        chatMessages: welcomeMessages,
        matchmakingState: {
          status: 'squad_assembled',
          status_message: 'Your discipline circle has been assembled.',
          filled_seats: 4,
          total_seats: 4,
          members: ranked4
        },
        assembledBannerText: 'Your discipline circle has been assembled ⚡'
      });
    }, 6000);
  },

  clearAssembledBanner: () => {
    set({ assembledBannerText: null });
  },

  leaveSquad: () => {
    const { squad, pastSquads } = get();
    const updatedPast = squad ? [...pastSquads, { ...squad, status: 'archived' as const }] : pastSquads;
    set({
      squad: null,
      squadMembers: [],
      chatMessages: [],
      pastSquads: updatedPast,
      matchmakingState: {
        status: 'idle',
        status_message: 'Ready to join your next discipline covenant.',
        filled_seats: 0,
        total_seats: 4,
        members: []
      },
      assembledBannerText: null
    });
  },

  updateSquadName: (name: string) => {
    const { squad } = get();
    if (!squad) return;
    const cleanName = name.trim();
    if (!cleanName) return;
    const formattedName = cleanName.toUpperCase().startsWith('SQUAD ')
      ? cleanName.toUpperCase()
      : `SQUAD ${cleanName.toUpperCase()}`;
    set({
      squad: {
        ...squad,
        name: formattedName,
      },
    });
  },

  checkSquadLifecycle: () => {
    const { squadMembers } = get();

    // Check for inactive members (consecutive 3+ days threshold)
    const inactiveMember = squadMembers.find(m => !m.is_me && m.inactive_days >= 3);
    if (inactiveMember) {
      get().replaceInactiveMember(inactiveMember.id);
    }
  },

  replaceInactiveMember: (memberId) => {
    const { squadMembers, user } = get();
    const currentUserScore = user?.discipline_score || 50;
    const currentPath = user?.identity_path || 'warrior';

    const inactiveIndex = squadMembers.findIndex(m => m.id === memberId);
    if (inactiveIndex === -1) return;

    const oldName = squadMembers[inactiveIndex].display_name;
    const newPeer = generatePeerForUser(currentUserScore, 5, currentPath, inactiveIndex);
    newPeer.replaced_member_name = oldName;

    const updatedMembers = [...squadMembers];
    updatedMembers[inactiveIndex] = newPeer;

    const reRanked = rankSquadMembers(updatedMembers);

    set({
      squadMembers: reRanked,
      assembledBannerText: `Inactive user ${oldName} was replaced by ${newPeer.display_name} 🛡️`
    });
  },

  completeCycleAndRematch: () => {
    set({ showCycleSummary: false });
    get().startMatchmaking();
  },

  updateUserProfile: async (displayName, avatarUrl) => {
    const { user, squadMembers } = get();
    if (!user) return;

    const updatedUser: User = {
      ...user,
      display_name: displayName,
      avatar_url: avatarUrl
    };

    const updatedMembers = squadMembers.map(m => {
      if (m.is_me || m.id === user.id || m.id === 'mock-user-id') {
        return {
          ...m,
          display_name: displayName
        };
      }
      return m;
    });

    set({ user: updatedUser, squadMembers: updatedMembers });

    try {
      await supabase
        .from('users')
        .update({
          display_name: displayName,
          avatar_url: avatarUrl
        })
        .eq('id', user.id);
    } catch (e) {
      console.error('Failed to update profile in database.', e);
    }
  },

  createCustomVow: (data) => {
    const { customVows } = get();
    const cleanHabit = data.habit.trim();
    const existing = customVows.find(cv => cv.habit.toLowerCase() === cleanHabit.toLowerCase());
    if (existing) {
      return existing;
    }

    if (customVows.length >= 3) {
      return customVows[0];
    }

    const { ARCHETYPE_DEFINITIONS, autoAssignCustomCardData, generatePersonalizedCardTitle } = require('../utils/cardMapping');
    const autoCard = autoAssignCustomCardData(cleanHabit, data.commitment);
    const category = data.category || autoCard.category || 'BODY';
    const archetype = data.archetype || (category === 'MIND' ? 'SCHOLAR' : category === 'BODY' ? 'WARRIOR' : 'FORGE');
    const archetypeDef = ARCHETYPE_DEFINITIONS[archetype] || ARCHETYPE_DEFINITIONS['WARRIOR'];
    const cardTitle = data.cardTitle?.trim() || autoCard.title || generatePersonalizedCardTitle(cleanHabit, archetype);

    const newCustomVow: CustomVowMetadata = {
      id: `custom-vow-${Date.now()}`,
      habit: cleanHabit,
      commitment: (data.commitment || cleanHabit).trim(),
      category: category,
      difficulty: data.difficulty || 'medium',
      archetype: archetype,
      cardTitle: cardTitle,
      guardian: autoCard.guardian || archetypeDef.guardian,
      quote: autoCard.quote || archetypeDef.defaultQuote,
      artworkKey: 'auto',
      isCustom: true,
      createdAt: new Date().toISOString()
    };

    set({
      customVows: [...customVows, newCustomVow]
    });

    return newCustomVow;
  },

  deleteCustomVow: (idOrHabit) => {
    const { customVows } = get();
    const target = idOrHabit.toLowerCase().trim();
    const remaining = customVows.filter(cv => cv.id.toLowerCase() !== target && cv.habit.toLowerCase() !== target);
    set({ customVows: remaining });
  },

  swapActiveVow: (oldVowId, newVowName, difficulty = 'medium') => {
    const { activeVows, vowHistoryDates, vowLogs, vowProgress, customVows } = get();
    const isCustom = customVows.some(cv => cv.habit.toLowerCase() === newVowName.toLowerCase());
    const updatedVows = activeVows.map((v) => {
      if (v.id === oldVowId) {
        return {
          ...v,
          custom_name: newVowName,
          difficulty: difficulty,
          weight: difficulty === 'hard' ? 2.0 : difficulty === 'medium' ? 1.5 : 1.0,
          is_custom: isCustom,
        };
      }
      return v;
    });

    const updatedHistory = { ...vowHistoryDates, [oldVowId]: [] };
    const updatedLogs = { ...vowLogs, [oldVowId]: false };
    const updatedProgress = { ...vowProgress, [oldVowId]: 0 };

    set({
      activeVows: updatedVows,
      vowHistoryDates: updatedHistory,
      vowLogs: updatedLogs,
      vowProgress: updatedProgress,
    });
  },

  addActiveVow: (newVowName, difficulty = 'medium') => {
    const { activeVows, vowHistoryDates, vowLogs, vowProgress, user, customVows } = get();
    // Prevent duplicate active vows
    if (activeVows.some(v => (v.custom_name || '').toLowerCase() === newVowName.toLowerCase())) {
      return false;
    }
    const isCustom = customVows.some(cv => cv.habit.toLowerCase() === newVowName.toLowerCase());
    const newId = `vow-${Date.now()}`;
    const newVow: UserVow = {
      id: newId,
      user_id: user?.id || 'mock-user-id',
      behavior_id: null,
      custom_name: newVowName,
      difficulty: difficulty,
      weight: difficulty === 'hard' ? 2.0 : difficulty === 'medium' ? 1.5 : 1.0,
      frequency: 'daily',
      is_active: true,
      is_custom: isCustom,
      created_at: new Date().toISOString()
    };
    set({
      activeVows: [...activeVows, newVow],
      vowHistoryDates: { ...vowHistoryDates, [newId]: [] },
      vowLogs: { ...vowLogs, [newId]: false },
      vowProgress: { ...vowProgress, [newId]: 0 },
    });
    return true;
  }
}),
    {
      name: 'vajra_user_store',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHasHydrated(true);
        } else {
          useAppStore.setState({ _hasHydrated: true });
        }
      },
      partialize: (state) => ({
        user: state.user,
        activeVows: state.activeVows,
        customVows: state.customVows,
        dailyLog: state.dailyLog,
        vowLogs: state.vowLogs,
        vowProgress: state.vowProgress,
        vowReflections: state.vowReflections,
        vowHistoryDates: state.vowHistoryDates,
        vowHighestStreak: state.vowHighestStreak,
        squad: state.squad,
        squadMembers: state.squadMembers,
        chatMessages: state.chatMessages,
        pastSquads: state.pastSquads,
        showOnboarding: state.showOnboarding,
        baseDisciplineScore: state.baseDisciplineScore,
        matchmakingState: state.matchmakingState,
        celebratedCardUnlocks: state.celebratedCardUnlocks,
      }),
    }
  )
);


export default useAppStore;

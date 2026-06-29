import { create } from 'zustand';
import { User, UserVow, DailyLog, VowLog, Squad, SquadMessage, PathType } from '../types';
import { supabase } from '../services/supabase';

interface AppState {
  user: User | null;
  activeVows: UserVow[];
  dailyLog: DailyLog | null;
  vowLogs: Record<string, boolean>; // Maps vowId -> completed (boolean)
  vowProgress: Record<string, number>; // Maps vowId -> current progress amount (number)
  vowReflections: Record<string, string>; // Maps vowId -> reflection note (string)
  squad: Squad | null;
  squadMembers: User[];
  chatMessages: SquadMessage[];
  isLoading: boolean;
  showOnboarding: boolean;
  
  // Auth & Onboarding actions
  setUser: (user: User | null) => void;
  setShowOnboarding: (show: boolean) => void;
  completeOnboarding: (
    displayName: string, 
    path: PathType, 
    selectedVows: { name: string; difficulty: 'easy' | 'medium' | 'hard' }[]
  ) => void;
  initializeUserSession: () => Promise<void>;
  
  // Daily Loop actions
  fetchTodayLogs: () => Promise<void>;
  checkInVow: (vowId: string, completed: boolean) => Promise<void>;
  updateVowProgress: (vowId: string, progress: number) => Promise<void>;
  updateVowReflection: (vowId: string, note: string) => Promise<void>;
  updateWaterIntake: (ml: number) => Promise<void>;
  updateMood: (mood: 'struggling' | 'neutral' | 'focused' | 'on_fire') => Promise<void>;
  scheduleRestDay: (dateStr: string) => Promise<void>;
  useRecoveryShield: () => Promise<void>;
  
  // Squad actions
  fetchSquadDetails: () => Promise<void>;
  sendSquadMessage: (text: string) => Promise<void>;
  nudgeSquadMember: (targetUserId: string, targetUserName: string, vowName: string) => Promise<void>;
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

const mockSquadMembers: User[] = [
  { id: 'member-1', display_name: 'Rohit', identity_path: 'scholar', discipline_score: 92, xp: 820, level: 'Forged', recovery_shields: 3, sleep_target: '23:00:00', wake_target: '07:00:00', squad_id: 'mock-squad-id', last_active_at: new Date().toISOString(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'member-2', display_name: 'Shreya', identity_path: 'monk', discipline_score: 64, xp: 210, level: 'Building', recovery_shields: 1, sleep_target: '22:00:00', wake_target: '05:30:00', squad_id: 'mock-squad-id', last_active_at: new Date().toISOString(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'member-3', display_name: 'Karan', identity_path: 'creator', discipline_score: 41, xp: 90, level: 'Awakening', recovery_shields: 0, sleep_target: '00:00:00', wake_target: '08:00:00', squad_id: 'mock-squad-id', last_active_at: new Date().toISOString(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
];

const mockMessages: SquadMessage[] = [
  { id: 'msg-1', squad_id: 'mock-squad-id', sender_id: 'member-1', type: 'text', body: 'Just finished my run! Who is logging next?', metadata: {}, created_at: new Date(Date.now() - 3600000).toISOString() },
  { id: 'msg-2', squad_id: 'mock-squad-id', sender_id: 'member-2', type: 'text', body: 'Logs updated. Safe check-ins today!', metadata: {}, created_at: new Date(Date.now() - 1800000).toISOString() }
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

export const useAppStore = create<AppState>((set, get) => ({
  user: mockUser,
  activeVows: mockVows,
  dailyLog: {
    id: 'mock-log-id',
    user_id: 'mock-user-id',
    log_date: new Date().toISOString().split('T')[0],
    water_ml: 1250,
    mood: 'focused',
    is_rest_day: false,
    shield_spent: false,
    created_at: new Date().toISOString()
  },
  vowLogs: {
    'vow-1': true,
    'vow-2': false,
    'vow-3': true
  },
  vowProgress: {
    'vow-1': 1,
    'vow-2': 10,
    'vow-3': 1
  },
  vowReflections: {
    'vow-1': 'Woke up before 6 AM today, felt clear.',
    'vow-2': 'Only studied/worked out for 10 mins today.',
    'vow-3': ''
  },
  squad: {
    id: 'mock-squad-id',
    name: 'Thunderbolt-4',
    invite_code: 'VJR88X',
    created_at: new Date().toISOString()
  },
  squadMembers: mockSquadMembers,
  chatMessages: mockMessages,
  isLoading: false,
  showOnboarding: true, // Default to true so onboarding renders on startup

  setUser: (user) => set({ user }),
  setShowOnboarding: (showOnboarding) => set({ showOnboarding }),
  completeOnboarding: (displayName, path, selectedVows) => {
    const newUser: User = {
      id: 'mock-user-id',
      display_name: displayName,
      identity_path: path,
      discipline_score: 100, // Starts fresh and unbreakable
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

    const newVowsList: UserVow[] = selectedVows.map((v, i) => ({
      id: `vow-${i + 1}`,
      user_id: 'mock-user-id',
      behavior_id: null,
      custom_name: v.name,
      difficulty: v.difficulty,
      weight: v.difficulty === 'hard' ? 2.0 : v.difficulty === 'medium' ? 1.5 : 1.0,
      frequency: 'daily',
      is_active: true,
      created_at: new Date().toISOString()
    }));

    const logsMap: Record<string, boolean> = {};
    const progressMap: Record<string, number> = {};
    const reflectionsMap: Record<string, string> = {};
    newVowsList.forEach(vow => {
      logsMap[vow.id] = false;
      progressMap[vow.id] = 0;
      reflectionsMap[vow.id] = '';
    });

    set({
      user: newUser,
      activeVows: newVowsList,
      vowLogs: logsMap,
      vowProgress: progressMap,
      vowReflections: reflectionsMap,
      showOnboarding: false,
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
  },
  
  initializeUserSession: async () => {
    set({ isLoading: true });
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Fetch real user from profile database
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

        set({ dailyLog: dailyLog as DailyLog, vowLogs: logsMap });
      }
    } catch (e) {
      console.error('Failed to load logs from database.', e);
    }
  },

  checkInVow: async (vowId, completed) => {
    // Offline update fallback
    const { vowLogs, vowProgress, activeVows } = get();
    const newLogs = { ...vowLogs, [vowId]: completed };
    
    // Sync progress if it's a binary vow or target vow
    const updatedProgress = { ...vowProgress };
    const vow = activeVows.find(v => v.id === vowId);
    if (vow) {
      const config = getVowConfig(vow.custom_name || '');
      if (!config.isTarget) {
        updatedProgress[vowId] = completed ? 1 : 0;
      } else if (completed) {
        // If marking complete, set progress to target if it was less
        if ((updatedProgress[vowId] || 0) < config.target) {
          updatedProgress[vowId] = config.target;
        }
      } else {
        // If marking incomplete and progress was at or above target, reset progress
        if ((updatedProgress[vowId] || 0) >= config.target) {
          updatedProgress[vowId] = 0;
        }
      }
    }

    set({ vowLogs: newLogs, vowProgress: updatedProgress });

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

  updateVowReflection: async (vowId, note) => {
    const { vowReflections } = get();
    set({ vowReflections: { ...vowReflections, [vowId]: note } });
  },

  updateWaterIntake: async (ml) => {
    const { dailyLog } = get();
    if (!dailyLog) return;

    // Offline update fallback
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

    // Offline update fallback
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

    // Offline update fallback
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
        const { data: members } = await supabase
          .from('users')
          .select('*')
          .eq('squad_id', user.squad_id);

        const otherMembers = (members || []).filter(m => m.id !== user.id);
        
        // Fetch chat messages
        const { data: messages } = await supabase
          .from('squad_messages')
          .select('*')
          .eq('squad_id', user.squad_id)
          .order('created_at', { ascending: false })
          .limit(50);

        set({
          squad: squad as Squad,
          squadMembers: otherMembers as User[],
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
  }
}));
export default useAppStore;

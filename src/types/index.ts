export type PathType = 'warrior' | 'scholar' | 'monk' | 'creator' | 'custom';
export type DifficultyTier = 'easy' | 'medium' | 'hard';
export type MessageType = 'text' | 'nudge_request' | 'proof_upload' | 'system_event';

export interface User {
  id: string;
  display_name: string;
  identity_path: PathType;
  discipline_score: number; // 0 to 100
  xp: number;
  level: string;
  recovery_shields: number;
  sleep_target: string; // HH:MM:SS format
  wake_target: string;  // HH:MM:SS format
  squad_id: string | null;
  last_active_at: string;
  avatar_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Behavior {
  id: string;
  name: string;
  difficulty: DifficultyTier;
  weight: number;
  created_at: string;
}

export type ArchetypeKey = 'WARRIOR' | 'SCHOLAR' | 'MONK' | 'GUARDIAN' | 'WANDERER' | 'FORGE';

export interface CustomVowMetadata {
  id: string;
  habit: string;
  commitment: string;
  category: 'BODY' | 'MIND' | 'FOCUS';
  difficulty: DifficultyTier;
  archetype: ArchetypeKey;
  cardTitle: string;
  guardian: string;
  quote: string;
  artworkKey: string;
  isCustom: true;
  createdAt: string;
}

export interface UserVow {
  id: string;
  user_id: string;
  behavior_id: string | null; // null if fully custom vow
  custom_name: string | null; // text representation if behavior_id is null
  difficulty: DifficultyTier;
  weight: number; // Locked to 1.0 for custom vows
  frequency: 'daily' | 'weekly';
  is_active: boolean;
  is_custom?: boolean;
  created_at: string;
}

export interface DailyLog {
  id: string;
  user_id: string;
  log_date: string; // YYYY-MM-DD
  water_ml: number;
  mood: 'struggling' | 'neutral' | 'focused' | 'on_fire' | null;
  is_rest_day: boolean;
  shield_spent: boolean;
  created_at: string;
}

export interface VowLog {
  id: string;
  daily_log_id: string;
  vow_id: string;
  completed: boolean;
  created_at: string;
}

export interface Squad {
  id: string;
  name: string;
  invite_code: string;
  created_at: string;
  journey_start_date?: string;
  journey_days_total?: number; // Default 30 days
  status?: 'building' | 'active' | 'archived';
  global_rank?: number;
}

export type MemberDailyStatus = 'completed' | 'pending' | 'missed';

export interface SquadMember {
  id: string;
  display_name: string;
  identity_path: PathType;
  discipline_score: number;
  streak: number;
  daily_status: MemberDailyStatus;
  last_active_at: string;
  rank: number; // Rank inside squad (1 to 4)
  is_me: boolean;
  inactive_days: number;
  replaced_member_name?: string | null;
  avatar_color?: string;
  avatar_url?: string | null;
}

export interface MatchmakingState {
  status: 'idle' | 'searching' | 'checking_squads' | 'creating_squad' | 'waiting_for_seats' | 'squad_assembled';
  status_message: string;
  filled_seats: number;
  total_seats: number;
  members: (SquadMember | null)[];
}

export interface SquadMessage {
  id: string;
  squad_id: string;
  sender_id: string | null; // null indicates system_event
  type: MessageType;
  body: string;
  metadata: {
    target_user_id?: string;
    target_user_name?: string;
    photo_url?: string;
    nudge_vow_name?: string;
  };
  created_at: string;
}

export interface JournalEntry {
  id: string;
  user_id: string;
  log_date: string; // YYYY-MM-DD
  three_good_things: string[];
  one_line: string;
  mood_at_entry: string;
  created_at: string;
}

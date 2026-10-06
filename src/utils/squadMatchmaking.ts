import { SquadMember, PathType, MemberDailyStatus, User } from '../types';

const SQUAD_PREFIXES = ['VAYU', 'AGNI', 'SURYA', 'TRISHUL', 'GARUDA', 'RUDRA', 'KSHATRIYA', 'DHARMA'];
const AVATAR_COLORS = ['#C99A5A', '#4A90E2', '#50E3C2', '#E67E22', '#9B59B6', '#1ABC9C'];

const PEER_NAMES_BY_PATH: Record<PathType, string[]> = {
  warrior: ['Vikram', 'Veer', 'Dhruv', 'Karan', 'Rudra', 'Aryan', 'Samarth'],
  scholar: ['Rohit', 'Aditya', 'Dev', 'Pranav', 'Siddharth', 'Kabir', 'Aarav'],
  monk: ['Shreya', 'Ananya', 'Isha', 'Mira', 'Bhavya', 'Gauri', 'Tara'],
  creator: ['Rohan', 'Riya', 'Vihaan', 'Kavya', 'Tanvi', 'Neil', 'Sahil'],
  custom: ['Aman', 'Zoya', 'Karthik', 'Meera', 'Rishi', 'Diya', 'Arnav'],
};

export function generateSquadName(): string {
  const prefix = SQUAD_PREFIXES[Math.floor(Math.random() * SQUAD_PREFIXES.length)];
  const num = Math.floor(Math.random() * 90) + 10;
  return `SQUAD ${prefix}-${num}`;
}

export function generatePeerForUser(
  userScore: number,
  userStreak: number,
  identityPath: PathType,
  seatIndex: number
): SquadMember {
  const paths: PathType[] = ['warrior', 'scholar', 'monk', 'creator'];
  const assignedPath = paths[seatIndex % paths.length] || identityPath;
  const nameList = PEER_NAMES_BY_PATH[assignedPath];
  const name = nameList[Math.floor(Math.random() * nameList.length)];

  // Similar score within +/- 15 variance
  const scoreVariance = Math.floor(Math.random() * 20) - 10;
  const discipline_score = Math.max(20, Math.min(99, userScore + scoreVariance));

  // Similar streak within +/- 3 days variance
  const streakVariance = Math.floor(Math.random() * 5) - 2;
  const streak = Math.max(1, userStreak + streakVariance);

  // Status sample
  const statuses: MemberDailyStatus[] = ['completed', 'completed', 'pending'];
  const daily_status = statuses[seatIndex % statuses.length];

  const recentHours = [5, 12, 35, 90, 120];
  const minsAgo = recentHours[seatIndex % recentHours.length];
  const lastActiveText = minsAgo < 60 ? `Active ${minsAgo}m ago` : `Active ${Math.floor(minsAgo / 60)}h ago`;

  return {
    id: `matched-peer-${seatIndex}-${Date.now()}`,
    display_name: name,
    identity_path: assignedPath,
    discipline_score,
    streak,
    daily_status,
    last_active_at: lastActiveText,
    rank: seatIndex + 1,
    is_me: false,
    inactive_days: 0,
    avatar_color: AVATAR_COLORS[seatIndex % AVATAR_COLORS.length]
  };
}

export function rankSquadMembers(members: SquadMember[]): SquadMember[] {
  // Sort descending by discipline_score, then by streak
  const sorted = [...members].sort((a, b) => {
    if (b.discipline_score !== a.discipline_score) {
      return b.discipline_score - a.discipline_score;
    }
    return b.streak - a.streak;
  });

  return sorted.map((member, index) => ({
    ...member,
    rank: index + 1
  }));
}

export function calculateSquadStats(members: SquadMember[], journeyStartDateStr?: string) {
  const totalScore = members.reduce((sum, m) => sum + m.discipline_score, 0);
  const totalStreakDays = members.reduce((sum, m) => sum + m.streak, 0);

  const completedCount = members.filter(m => m.daily_status === 'completed').length;
  const teamCompletionPct = Math.round((completedCount / (members.length || 1)) * 100);

  const startDate = journeyStartDateStr ? new Date(journeyStartDateStr) : new Date();
  const now = new Date();
  const elapsedMs = now.getTime() - startDate.getTime();
  const elapsedDays = Math.floor(elapsedMs / (1000 * 60 * 60 * 24));
  const currentDay = Math.max(1, elapsedDays + 1);
  const isCovenantComplete = currentDay > 30;
  const daysRemaining = isCovenantComplete ? 0 : Math.max(0, 30 - elapsedDays);

  const covenantStatusText = isCovenantComplete
    ? `COVENANT COMPLETE · DAY ${currentDay}`
    : `30 DAY COVENANT · DAY ${currentDay} / 30`;

  return {
    totalScore,
    averageScore: Math.round(totalScore / (members.length || 1)),
    totalStreakDays,
    teamCompletionPct,
    daysRemaining,
    currentDay,
    isCovenantComplete,
    covenantStatusText,
    completedCount
  };
}

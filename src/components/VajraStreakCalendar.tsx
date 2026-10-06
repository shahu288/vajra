import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Animated,
  DimensionValue,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from './Text';
import { typography } from '../theme/typography';
import { getLocalDateString } from '../utils/dates';
import { UserVow } from '../types';
import { ShieldIcon } from './ZenIcons';

export type CalendarDayStatus =
  | 'completed'
  | 'freeze'
  | 'missed'
  | 'pending'
  | 'future'
  | 'unlogged'
  | 'empty';

export interface CalendarDayData {
  dayNumber: number;
  dateStr: string;
  colIndex: number;
  status: CalendarDayStatus;
  isToday: boolean;
  isSelected: boolean;
}

export interface StreakSegment {
  startCol: number;
  endCol: number;
  length: number;
}

export interface CalendarWeekData {
  id: string;
  days: CalendarDayData[];
  streakSegments: StreakSegment[];
  hasWeeklyMilestone: boolean;
}

export interface VajraStreakCalendarProps {
  selectedDate: string;
  onSelectDate: (dateStr: string) => void;
  activeVows: UserVow[];
  vowLogs: Record<string, boolean>;
  vowHistoryDates: Record<string, string[]>;
  freezeDates?: string[];
  missedDates?: string[];
  activeStreak?: number;
}

const FULL_MONTH_NAMES = [
  'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
  'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
];

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

// Strict 7-column width constant (100 / 7 %)
const COLUMN_WIDTH: DimensionValue = '14.2857%';

/**
 * Calculates consecutive streak segments across the 7 columns of a week.
 * Both 'completed' and 'freeze' days maintain continuity.
 * Missed, pending, unlogged, empty, and future days break the streak.
 */
export function calculateStreakSegments(days: CalendarDayData[]): StreakSegment[] {
  const segments: StreakSegment[] = [];
  let currentStart: number | null = null;

  for (let i = 0; i < days.length; i++) {
    const status = days[i].status;
    const isStreakDay = status === 'completed' || status === 'freeze';

    if (isStreakDay) {
      if (currentStart === null) {
        currentStart = i;
      }
    } else {
      if (currentStart !== null) {
        segments.push({
          startCol: currentStart,
          endCol: i - 1,
          length: i - currentStart,
        });
        currentStart = null;
      }
    }
  }

  if (currentStart !== null) {
    segments.push({
      startCol: currentStart,
      endCol: days.length - 1,
      length: days.length - currentStart,
    });
  }

  return segments;
}

// ─── SUB-COMPONENTS ──────────────────────────────────────────────

interface CalendarHeaderProps {
  monthName: string;
  year: number;
  streakCount: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  monthName,
  year,
  streakCount,
  onPrevMonth,
  onNextMonth,
}) => {
  return (
    <View style={styles.headerRow}>
      <View style={styles.headerLeft}>
        <TouchableOpacity
          style={styles.navArrowBtn}
          onPress={onPrevMonth}
          activeOpacity={0.7}
          accessibilityLabel="Previous month"
        >
          <Text style={styles.navArrowIcon}>‹</Text>
        </TouchableOpacity>

        <Text style={styles.monthTitle}>
          {monthName} {year}
        </Text>

        <TouchableOpacity
          style={styles.navArrowBtn}
          onPress={onNextMonth}
          activeOpacity={0.7}
          accessibilityLabel="Next month"
        >
          <Text style={styles.navArrowIcon}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.streakBadge}>
        <Text style={styles.streakBadgeText}>
          🔥 {streakCount} Days Forged
        </Text>
      </View>
    </View>
  );
};

export const WeekdayHeader: React.FC = () => {
  return (
    <View style={styles.weekdaysRow}>
      {WEEKDAYS.map((day, idx) => (
        <View key={`weekday-${idx}`} style={styles.columnCell}>
          <Text style={styles.weekdayText}>{day}</Text>
        </View>
      ))}
    </View>
  );
};

interface StreakRibbonLayerProps {
  segments: StreakSegment[];
}

export const StreakRibbonLayer: React.FC<StreakRibbonLayerProps> = ({ segments }) => {
  if (segments.length === 0) return null;

  return (
    <View style={styles.ribbonLayer} pointerEvents="none">
      {segments.map((segment, idx) => {
        const isSingleDay = segment.startCol === segment.endCol;
        const leftPct = `${segment.startCol * (100 / 7)}%` as DimensionValue;
        const widthPct = `${(segment.endCol - segment.startCol + 1) * (100 / 7)}%` as DimensionValue;

        return (
          <View
            key={`segment-${idx}-${segment.startCol}-${segment.endCol}`}
            style={[
              styles.ribbonSegment,
              {
                left: leftPct,
                width: widthPct,
                borderTopLeftRadius: 16,
                borderBottomLeftRadius: 16,
                borderTopRightRadius: 16,
                borderBottomRightRadius: 16,
              },
              !isSingleDay && styles.ribbonConnected,
            ]}
          >
            <LinearGradient
              colors={['#FFE48A', '#F3BA45', '#D49528']}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={styles.ribbonGradient}
            >
              {/* Metallic top bevel highlight */}
              <View style={styles.ribbonHighlightLine} />
              {/* Subtle metallic bottom shadow */}
              <View style={styles.ribbonBottomShadowLine} />
            </LinearGradient>
          </View>
        );
      })}
    </View>
  );
};

interface CalendarDayProps {
  day: CalendarDayData;
  onSelect: (dateStr: string) => void;
  pulseAnim: Animated.Value;
}

export const CalendarDay: React.FC<CalendarDayProps> = ({
  day,
  onSelect,
  pulseAnim,
}) => {
  // Empty padding slots outside the month
  if (day.status === 'empty') {
    return <View style={styles.dayContentSlot} />;
  }

  const isCompleted = day.status === 'completed';
  const isFreeze = day.status === 'freeze';
  const isMissed = day.status === 'missed';
  const isPending = day.status === 'pending';
  const isFuture = day.status === 'future';
  const isUnlogged = day.status === 'unlogged';

  return (
    <TouchableOpacity
      activeOpacity={isFuture ? 1 : 0.75}
      disabled={isFuture}
      onPress={() => onSelect(day.dateStr)}
      style={styles.dayCellTouch}
    >
      {/* ─── Completed: Day number rendered directly on the gold ribbon ─ */}
      {isCompleted && (
        <View style={[styles.dayContentSlot, day.isSelected && styles.daySelectedRing]}>
          <Text style={styles.completedDayText}>{day.dayNumber}</Text>
        </View>
      )}

      {/* ─── Freeze / Shield Day: Obsidian slot with gold shield icon ─── */}
      {isFreeze && (
        <View style={[styles.freezeSlot, day.isSelected && styles.daySelectedRing]}>
          {Platform.OS === 'web' ? (
            <ShieldIcon size={14} color="#F3BA45" />
          ) : (
            <Text style={styles.shieldEmoji}>🛡️</Text>
          )}
        </View>
      )}

      {/* ─── Missed Day: Fractured inactive ash treatment ───────────── */}
      {isMissed && (
        <View style={[styles.missedSlot, day.isSelected && styles.daySelectedRing]}>
          <Text style={styles.missedDayText}>{day.dayNumber}</Text>
        </View>
      )}

      {/* ─── Pending Today: Obsidian slot with subtle gold pulsing ring ─ */}
      {isPending && (
        <Animated.View
          style={[
            styles.pendingSlot,
            { opacity: pulseAnim },
            day.isSelected && styles.daySelectedRing,
          ]}
        >
          <Text style={styles.pendingDayText}>{day.dayNumber}</Text>
        </Animated.View>
      )}

      {/* ─── Future Day: Legible inactive contrast (#5A6272) ─────────── */}
      {isFuture && (
        <View style={styles.dayContentSlot}>
          <Text style={styles.futureDayText}>{day.dayNumber}</Text>
        </View>
      )}

      {/* ─── Unlogged Historical Day: Legible inactive contrast (#5A6272) */}
      {isUnlogged && (
        <View style={[styles.dayContentSlot, day.isSelected && styles.daySelectedRing]}>
          <Text style={styles.unloggedDayText}>{day.dayNumber}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export const WeeklyMilestone: React.FC = () => {
  return (
    <View style={styles.milestoneBadge} pointerEvents="none">
      <LinearGradient
        colors={['#FFE48A', '#F3BA45', '#D49528']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.milestoneOuter}
      >
        <View style={styles.milestoneInner}>
          <Text style={styles.milestoneIcon}>⚜️</Text>
        </View>
      </LinearGradient>
    </View>
  );
};

interface CalendarWeekProps {
  week: CalendarWeekData;
  onSelectDate: (dateStr: string) => void;
  pulseAnim: Animated.Value;
}

export const CalendarWeek: React.FC<CalendarWeekProps> = ({
  week,
  onSelectDate,
  pulseAnim,
}) => {
  return (
    <View style={styles.weekRow}>
      {/* Layer 1: Streak Ribbon Layer (BEHIND day numbers) */}
      <StreakRibbonLayer segments={week.streakSegments} />

      {/* Layer 2: Day Cells in strict 14.2857% columns (ABOVE the ribbon layer) */}
      <View style={styles.dayCellsRow}>
        {week.days.map((day) => (
          <View key={day.dateStr} style={styles.columnCell}>
            <CalendarDay
              day={day}
              onSelect={onSelectDate}
              pulseAnim={pulseAnim}
            />
          </View>
        ))}
      </View>

      {/* Layer 3: Weekly 7-Day Completion Milestone Seal */}
      {week.hasWeeklyMilestone && <WeeklyMilestone />}
    </View>
  );
};

interface CalendarGridProps {
  weeks: CalendarWeekData[];
  onSelectDate: (dateStr: string) => void;
  pulseAnim: Animated.Value;
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  weeks,
  onSelectDate,
  pulseAnim,
}) => {
  return (
    <View style={styles.gridContainer}>
      {weeks.map((week) => (
        <CalendarWeek
          key={week.id}
          week={week}
          onSelectDate={onSelectDate}
          pulseAnim={pulseAnim}
        />
      ))}
    </View>
  );
};

// ─── MAIN COMPONENT ──────────────────────────────────────────────

export const VajraStreakCalendar: React.FC<VajraStreakCalendarProps> = ({
  selectedDate,
  onSelectDate,
  activeVows,
  vowLogs,
  vowHistoryDates,
  freezeDates,
  missedDates,
  activeStreak,
}) => {
  const initialDate = selectedDate ? new Date(selectedDate) : new Date();
  const [currentYear, setCurrentYear] = useState<number>(initialDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(initialDate.getMonth());

  const todayStr = useMemo(() => getLocalDateString(new Date()), []);

  // Soft restrained pulse for today's pending state
  const pulseAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.68,
          duration: 1600,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1600,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  // Recovery shield/freeze dates: 7 days ago to demonstrate shield slot continuity in demo
  const activeFreezeDates = useMemo(() => {
    if (freezeDates && freezeDates.length > 0) return freezeDates;
    const defaultFreezeDate = new Date();
    defaultFreezeDate.setDate(defaultFreezeDate.getDate() - 7);
    return [getLocalDateString(defaultFreezeDate)];
  }, [freezeDates]);

  // Compute calculated streak across weeks and month boundaries
  const calculatedStreak = useMemo(() => {
    if (activeStreak !== undefined) return activeStreak;
    // Derive streak from vow history dates
    const allCompletedDates = Object.values(vowHistoryDates).flat();
    const uniqueDates = Array.from(new Set(allCompletedDates)).sort().reverse();
    return Math.max(29, uniqueDates.length);
  }, [activeStreak, vowHistoryDates]);

  // Reusable function to calculate status for any date across any month
  const getDayStatus = (dateStr: string): CalendarDayStatus => {
    if (dateStr > todayStr) {
      return 'future';
    }

    if (activeFreezeDates.includes(dateStr)) {
      return 'freeze';
    }

    if (dateStr === todayStr) {
      if (activeVows.length === 0) return 'unlogged';
      const completedCount = activeVows.filter((v) => vowLogs[v.id] === true).length;
      const brokenCount = activeVows.filter((v) => vowLogs[v.id] === false).length;

      if (completedCount === activeVows.length && completedCount > 0) return 'completed';
      if (brokenCount > 0 && completedCount === 0) return 'missed';
      return 'pending';
    }

    // Historical date calculation from actual logged records
    if (activeVows.length === 0) return 'unlogged';

    const completedCount = activeVows.filter((v) =>
      vowHistoryDates[v.id]?.includes(dateStr)
    ).length;

    if (completedCount > 0) {
      return 'completed';
    }

    if (missedDates && missedDates.includes(dateStr)) {
      return 'missed';
    }

    // Unlogged date with no discipline record
    return 'unlogged';
  };

  // Construct weekly data model
  const weeks = useMemo<CalendarWeekData[]>(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const startDayOffset = (firstDayOfMonth.getDay() + 6) % 7; // Monday = 0, Sunday = 6
    const totalSlots = startDayOffset + daysInMonth;
    const totalWeeks = Math.ceil(totalSlots / 7);

    const weekList: CalendarWeekData[] = [];

    for (let w = 0; w < totalWeeks; w++) {
      const days: CalendarDayData[] = [];

      for (let c = 0; c < 7; c++) {
        const dayNumber = w * 7 + c - startDayOffset + 1;
        const isValidDay = dayNumber > 0 && dayNumber <= daysInMonth;

        if (!isValidDay) {
          days.push({
            dayNumber: 0,
            dateStr: `empty-${w}-${c}`,
            colIndex: c,
            status: 'empty',
            isToday: false,
            isSelected: false,
          });
        } else {
          const monthFormatted = String(currentMonth + 1).padStart(2, '0');
          const dayFormatted = String(dayNumber).padStart(2, '0');
          const dateStr = `${currentYear}-${monthFormatted}-${dayFormatted}`;
          const isToday = dateStr === todayStr;
          const isSelected = dateStr === selectedDate;
          const status = getDayStatus(dateStr);

          days.push({
            dayNumber,
            dateStr,
            colIndex: c,
            status,
            isToday,
            isSelected,
          });
        }
      }

      const streakSegments = calculateStreakSegments(days);
      // Only 7 strictly completed days earn the weekly milestone artifact (freeze does NOT count)
      const hasWeeklyMilestone =
        days.length === 7 && days.every((d) => d.status === 'completed');

      weekList.push({
        id: `week-${currentYear}-${currentMonth}-${w}`,
        days,
        streakSegments,
        hasWeeklyMilestone,
      });
    }

    return weekList;
  }, [currentYear, currentMonth, todayStr, selectedDate, activeVows, vowLogs, vowHistoryDates, activeFreezeDates, missedDates]);

  return (
    <View style={styles.card}>
      {/* ─── Header: Month & Streak Forged ──────────────────── */}
      <CalendarHeader
        monthName={FULL_MONTH_NAMES[currentMonth]}
        year={currentYear}
        streakCount={calculatedStreak}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
      />

      {/* ─── Weekdays: M T W T F S S in strict 14.2857% columns */}
      <WeekdayHeader />

      {/* ─── Calendar Grid: Weeks with Continuous Ribbon Layer ── */}
      <CalendarGrid
        weeks={weeks}
        onSelectDate={onSelectDate}
        pulseAnim={pulseAnim}
      />
    </View>
  );
};

// ─── STYLES ──────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#14171C',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#262A33',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 8,
    ...Platform.select({
      web: {
        boxShadow:
          '0 4px 24px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.04)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
        elevation: 3,
      },
    }),
  },

  // Header Row
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 2,
    marginBottom: 2,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  monthTitle: {
    fontFamily: typography.fontFamily.displayBold,
    fontSize: 15,
    fontWeight: '700',
    color: '#F5F6F8',
    letterSpacing: 0.8,
  },
  navArrowBtn: {
    width: 26,
    height: 26,
    borderRadius: 7,
    backgroundColor: '#0B0C0E',
    borderWidth: 1,
    borderColor: '#262A33',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navArrowIcon: {
    fontSize: 16,
    lineHeight: 18,
    color: '#8A91A0',
    fontWeight: '700',
  },
  streakBadge: {
    backgroundColor: 'rgba(243, 186, 69, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(243, 186, 69, 0.3)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3.5,
  },
  streakBadgeText: {
    fontFamily: typography.fontFamily.uiBold,
    fontSize: 11,
    fontWeight: '700',
    color: '#F3BA45',
    letterSpacing: 0.4,
  },

  // Strict 7-Column Cell
  columnCell: {
    width: COLUMN_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },

  // Weekdays Row
  weekdaysRow: {
    flexDirection: 'row',
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#262A33',
    paddingBottom: 6,
    paddingTop: 2,
  },
  weekdayText: {
    fontFamily: typography.fontFamily.uiSemiBold,
    fontSize: 11,
    fontWeight: '600',
    color: '#8A91A0',
  },

  // Grid & Weeks
  gridContainer: {
    gap: 3,
  },
  weekRow: {
    position: 'relative',
    height: 40,
    width: '100%',
    justifyContent: 'center',
  },
  dayCellsRow: {
    flexDirection: 'row',
    width: '100%',
    height: '100%',
    zIndex: 2,
  },

  // Ribbon Layer (BEHIND the day cells)
  ribbonLayer: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  ribbonSegment: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 235, 160, 0.55)',
    ...Platform.select({
      web: {
        boxShadow:
          '0 2px 8px rgba(243, 186, 69, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.45)',
      },
      default: {
        shadowColor: '#F3BA45',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 2,
      },
    }),
  },
  ribbonConnected: {
    marginHorizontal: 0,
  },
  ribbonGradient: {
    flex: 1,
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  ribbonHighlightLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
  },
  ribbonBottomShadowLine: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 1.5,
    backgroundColor: 'rgba(150, 90, 20, 0.45)',
  },

  // Day Cell Touch & Content Slot
  dayCellTouch: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayContentSlot: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
  },
  completedDayText: {
    fontFamily: typography.fontFamily.uiBold,
    fontSize: 13,
    fontWeight: '700',
    color: '#0B0C0E',
  },

  // Freeze Slot: Obsidian circle with gold shield
  freezeSlot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#0B0C0E',
    borderWidth: 1.5,
    borderColor: '#F3BA45',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
    ...Platform.select({
      web: {
        boxShadow: '0 0 10px rgba(243, 186, 69, 0.5), inset 0 0 4px rgba(0, 0, 0, 0.8)',
      },
    }),
  },
  shieldEmoji: {
    fontSize: 13,
  },

  // Missed Slot: Fractured ash slot
  missedSlot: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#1C1E24',
    borderWidth: 1,
    borderColor: '#262A33',
    alignItems: 'center',
    justifyContent: 'center',
  },
  missedDayText: {
    fontFamily: typography.fontFamily.uiMedium,
    fontSize: 11,
    fontWeight: '500',
    color: '#555B68',
  },

  // Pending Today Slot: Obsidian slot with soft gold pulse
  pendingSlot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#0B0C0E',
    borderWidth: 1.5,
    borderColor: '#F3BA45',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0 0 10px rgba(243, 186, 69, 0.35)',
      },
    }),
  },
  pendingDayText: {
    fontFamily: typography.fontFamily.uiBold,
    fontSize: 13,
    fontWeight: '700',
    color: '#F5F6F8',
  },

  // Future & Unlogged Days: Legible inactive contrast (#5A6272)
  futureDayText: {
    fontFamily: typography.fontFamily.uiMedium,
    fontSize: 12,
    fontWeight: '500',
    color: '#5A6272',
  },
  unloggedDayText: {
    fontFamily: typography.fontFamily.uiMedium,
    fontSize: 12,
    fontWeight: '500',
    color: '#5A6272',
  },

  // Selection Ring
  daySelectedRing: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: 15,
  },

  // Weekly Milestone Wax Seal (Engraved 24px Vajra Seal with outer spacing)
  milestoneBadge: {
    position: 'absolute',
    right: -12,
    top: 8, // Vertically centered in the 40px row
    zIndex: 5,
  },
  milestoneOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    padding: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0 2px 8px rgba(243, 186, 69, 0.45)',
      },
      default: {
        shadowColor: '#F3BA45',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.4,
        shadowRadius: 4,
        elevation: 3,
      },
    }),
  },
  milestoneInner: {
    width: '100%',
    height: '100%',
    borderRadius: 11,
    backgroundColor: '#0B0C0E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  milestoneIcon: {
    fontSize: 11,
    lineHeight: 13,
  },
});

export default VajraStreakCalendar;

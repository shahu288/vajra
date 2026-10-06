import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Platform, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from '../components/Text';
import { Card } from '../components/Card';
import { VowDetailModal } from '../components/VowDetailModal';
import { AtmosphericBackground } from '../components/AtmosphericBackground';
import { VajraStreakCalendar } from '../components/VajraStreakCalendar';
import { useAppStore } from '../store/useAppStore';
import { useTheme, typography } from '../theme';
import { getLocalDateString } from '../utils/dates';
import { getMissionCardData } from '../utils/cardMapping';

// Historical sample notes to enrich past journal days
const HISTORICAL_SAMPLE_NOTES: Record<string, Record<string, string>> = {
  // Offsets from today calculated dynamically or keyed by relative date
};

export default function LogScreen() {
  const { 
    user, 
    activeVows, 
    vowLogs, 
    vowProgress, 
    vowReflections, 
    vowHistoryDates,
    dailyLog, 
    updateMood,
    useRecoveryShield 
  } = useAppStore();

  const { colors } = useTheme();

  const todayStr = useMemo(() => getLocalDateString(new Date()), []);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  const [selectedVowId, setSelectedVowId] = useState<string | null>(null);
  const [detailVisible, setDetailVisible] = useState<boolean>(false);

  const moods = [
    { key: 'on_fire', label: 'On Fire 🔥', color: '#48BB78' },
    { key: 'focused', label: 'Focused ⚡', color: colors.primary },
    { key: 'neutral', label: 'Neutral 😐', color: '#ECC94B' },
    { key: 'struggling', label: 'Struggling 🌧️', color: colors.danger },
  ];

  const isToday = selectedDate === todayStr;

  // Format selected date nicely (e.g. "SEPTEMBER 13, 2026")
  const formattedSelectedDate = useMemo(() => {
    try {
      const parts = selectedDate.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase();
      }
    } catch {
      // Fallback
    }
    return selectedDate;
  }, [selectedDate]);

  // Compute stats for selected date
  const dateStats = useMemo(() => {
    const total = activeVows.length;
    if (total === 0) return { kept: 0, total: 0, percentage: 0 };

    if (isToday) {
      const kept = activeVows.filter(v => vowLogs[v.id] === true).length;
      const percentage = Math.round((kept / total) * 100);
      return { kept, total, percentage };
    }

    // Historical date stats
    const kept = activeVows.filter(v => vowHistoryDates[v.id]?.includes(selectedDate)).length;
    const percentage = Math.round((kept / total) * 100);
    return { kept, total, percentage };
  }, [isToday, activeVows, vowLogs, vowHistoryDates, selectedDate]);

  // Dynamic sample reflections for past dates so the discipline journal feels authentic
  const getHistoricalNote = (vowId: string, vowName: string, kept: boolean): string | null => {
    // Check if user has saved a note for this vow on this specific date
    const dateKey = `${vowId}_${selectedDate}`;
    if (vowReflections[dateKey] !== undefined) {
      return vowReflections[dateKey] || null;
    }

    if (isToday) {
      return vowReflections[vowId] || null;
    }

    // Generate deterministic yet contextual journal reflections for past days
    const d = new Date(selectedDate);
    const day = d.getDate();
    const isEven = (day + vowId.charCodeAt(vowId.length - 1)) % 2 === 0;

    if (!kept) {
      if (day % 3 === 0) {
        return "Faced friction today, didn't maintain protocol. Renewing commitment tomorrow.";
      }
      return null;
    }

    if (isEven) {
      if (vowName.toLowerCase().includes('wake')) {
        return "Awakened immediately with alarm. Morning routine executed flawlessly.";
      }
      if (vowName.toLowerCase().includes('workout') || vowName.toLowerCase().includes('run')) {
        return "Strong energy, full routine finished with deep focus.";
      }
      if (vowName.toLowerCase().includes('media') || vowName.toLowerCase().includes('screen')) {
        return "Zero unnecessary digital distractions maintained throughout the day.";
      }
      return "Maintained discipline without compromise.";
    }

    return null;
  };

  const handleOpenVow = (vowId: string) => {
    if (!isToday) return; // Historical records are read-only
    setSelectedVowId(vowId);
    setDetailVisible(true);
  };

  const handleMoodSelect = (mood: 'struggling' | 'neutral' | 'focused' | 'on_fire') => {
    if (!isToday) return; // Mood recording applies to today
    updateMood(mood);
  };

  const currentShields = user?.recovery_shields || 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.bg.primary }]}>
      <AtmosphericBackground />
      <View style={[styles.darkOverlay, { backgroundColor: colors.bg.overlayHeavy }]} pointerEvents="none" />

      <SafeAreaView style={styles.safeArea}>
        {/* Editorial Screen Header */}
        <View style={[styles.header, { borderBottomColor: colors.border.separator }]}>
          <Text style={[styles.headerTitle, { color: colors.text.primary }]}>DISCIPLINE JOURNAL</Text>
          <Text style={[styles.headerSub, { color: colors.text.secondary }]}>
            Consistency over intensity • Your sacred log
          </Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Main Feature: Custom Vajra Streak Calendar */}
          <VajraStreakCalendar
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            activeVows={activeVows}
            vowLogs={vowLogs}
            vowHistoryDates={vowHistoryDates}
            activeStreak={29}
          />

          {/* Daily Completion Summary */}
          <View style={[styles.summaryCard, { backgroundColor: colors.bg.surface, borderColor: colors.border.default }]}>
            <View style={styles.summaryTopRow}>
              <View>
                <Text style={[styles.summaryLabel, { color: colors.text.secondary }]}>
                  {isToday ? "TODAY'S DISCIPLINE" : `${formattedSelectedDate}`}
                </Text>
                <Text style={[styles.summaryCount, { color: colors.text.primary }]}>
                  {dateStats.kept} / {dateStats.total} VOWS KEPT
                </Text>
              </View>

              <View style={styles.percentageBadge}>
                <Text style={[styles.percentageText, { color: colors.primary }]}>
                  {dateStats.percentage}%
                </Text>
              </View>
            </View>

            {/* 6px Rounded Progress Track */}
            <View style={styles.progressTrack}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${dateStats.percentage}%` }
                ]} 
              />
            </View>
          </View>

          {/* That Day's Vows */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionTitle, { color: colors.text.secondary }]}>
                {isToday ? "TODAY'S VOWS" : "VOWS RECORDED"}
              </Text>
              {isToday && (
                <Text style={[styles.sectionHint, { color: colors.primary }]}>
                  TAP TO LOG
                </Text>
              )}
            </View>

            {activeVows.map((vow) => {
              const cardData = getMissionCardData(vow.custom_name || '');
              
              let isKept = false;
              let isBroken = false;
              let statusLabel = 'PENDING';
              let statusColor = colors.text.tertiary;

              if (isToday) {
                isKept = vowLogs[vow.id] === true;
                isBroken = vowLogs[vow.id] === false;
                if (isKept) {
                  statusLabel = 'KEPT VOW ✓';
                  statusColor = colors.primary;
                } else if (isBroken) {
                  statusLabel = 'MISSED VOW';
                  statusColor = colors.danger;
                }
              } else {
                // Past day
                isKept = vowHistoryDates[vow.id]?.includes(selectedDate) || false;
                isBroken = !isKept;
                if (isKept) {
                  statusLabel = 'KEPT VOW ✓';
                  statusColor = colors.primary;
                } else {
                  statusLabel = 'MISSED VOW';
                  statusColor = colors.danger;
                }
              }

              const note = getHistoricalNote(vow.id, vow.custom_name || '', isKept);

              return (
                <TouchableOpacity
                  key={vow.id}
                  activeOpacity={isToday ? 0.75 : 1}
                  disabled={!isToday}
                  onPress={() => handleOpenVow(vow.id)}
                >
                  <Card 
                    style={[
                      styles.vowCard,
                      { 
                        backgroundColor: colors.bg.surface, 
                        borderColor: isKept 
                          ? 'rgba(201, 154, 90, 0.35)' 
                          : (isBroken && isToday ? 'rgba(163, 92, 92, 0.35)' : colors.border.lowContrast)
                      }
                    ]}
                  >
                    {/* Subtle Collectible Card Artwork Layer (15% opacity, positioned right & fading naturally into dark background) */}
                    <View style={styles.cardArtworkContainer} pointerEvents="none">
                      <Image 
                        source={cardData.image} 
                        style={styles.cardArtworkImage}
                        resizeMode="cover"
                      />
                      {/* Horizontal Gradient: Fades from solid dark surface on left to transparent on right */}
                      <LinearGradient
                        colors={[
                          colors.bg.surface,
                          'rgba(22, 22, 22, 0.92)',
                          'rgba(22, 22, 22, 0.45)',
                          'rgba(22, 22, 22, 0.05)',
                        ]}
                        start={{ x: 0, y: 0.5 }}
                        end={{ x: 1, y: 0.5 }}
                        style={StyleSheet.absoluteFill}
                      />
                      {/* Vertical Edge Fade: Softens top and bottom borders */}
                      <LinearGradient
                        colors={[
                          'rgba(22, 22, 22, 0.4)',
                          'transparent',
                          'rgba(22, 22, 22, 0.45)',
                        ]}
                        style={StyleSheet.absoluteFill}
                      />
                    </View>

                    {/* Foreground Card Content */}
                    <View style={styles.vowCardContent}>
                      <View style={styles.vowCardMain}>
                        <View style={styles.vowCardInfo}>
                          <Text style={[styles.vowCardName, { color: colors.text.primary }]}>
                            {vow.custom_name || 'Vow'}
                          </Text>
                          <Text style={[styles.vowCardSub, { color: colors.text.secondary }]}>
                            {(vow.difficulty || 'MEDIUM').toUpperCase()} • ×{(vow.weight || 1).toFixed(1)}
                          </Text>
                        </View>

                        {/* Status Indicator Badge */}
                        <View style={[
                          styles.statusBadge, 
                          { 
                            borderColor: statusColor, 
                            backgroundColor: isKept 
                              ? 'rgba(201, 154, 90, 0.12)' 
                              : (isBroken ? 'rgba(163, 92, 92, 0.12)' : colors.bg.surfaceAlt) 
                          }
                        ]}>
                          <Text style={[styles.statusBadgeText, { color: statusColor }]}>
                            {statusLabel}
                          </Text>
                        </View>
                      </View>

                      {/* Note Snippet */}
                      {note && (
                        <View style={[styles.noteSnippet, { backgroundColor: 'rgba(35, 35, 35, 0.85)', borderColor: colors.border.lowContrast }]}>
                          <Text style={[styles.noteLabel, { color: colors.primary }]}>NOTE</Text>
                          <Text style={[styles.noteText, { color: colors.text.secondary }]}>
                            "{note}"
                          </Text>
                        </View>
                      )}
                    </View>
                  </Card>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Recovery Shield Prompt (shown for today only if a vow was broken) */}
          {isToday && Object.values(vowLogs).some(v => v === false) && !dailyLog?.shield_spent && (
            <Card style={[styles.shieldCard, { backgroundColor: colors.bg.surface, borderColor: colors.border.default }]}>
              <View style={styles.shieldHeader}>
                <View style={styles.shieldTitleGroup}>
                  <Text style={styles.shieldIcon}>🛡️</Text>
                  <Text style={[styles.shieldTitle, { color: colors.text.primary }]}>Recovery Shield</Text>
                </View>
                <Text style={[styles.shieldCount, { color: colors.primary }]}>
                  {currentShields} SHIELDS
                </Text>
              </View>
              <Text style={[styles.shieldDesc, { color: colors.text.secondary }]}>
                Spend 1 Recovery Shield to protect your streak from today's missed vow.
              </Text>
              <TouchableOpacity
                style={[
                  styles.shieldBtn,
                  { backgroundColor: colors.primary },
                  currentShields <= 0 && styles.disabledBtn
                ]}
                disabled={currentShields <= 0}
                onPress={useRecoveryShield}
              >
                <Text style={[styles.shieldBtnText, { color: colors.text.inverse }]}>USE RECOVERY SHIELD 🛡️</Text>
              </TouchableOpacity>
            </Card>
          )}

          {/* Daily Mood (positioned below that day's vows) */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text.secondary }]}>
              {isToday ? "DAILY MOOD" : "RECORDED MOOD"}
            </Text>
            <Card style={[styles.moodCard, { backgroundColor: colors.bg.surface, borderColor: colors.border.default }]}>
              <View style={styles.moodGrid}>
                {moods.map((m) => {
                  const isSelected = dailyLog?.mood === m.key;
                  return (
                    <TouchableOpacity
                      key={m.key}
                      disabled={!isToday}
                      style={[
                        styles.moodBtn,
                        { backgroundColor: colors.bg.surfaceAlt, borderColor: isSelected ? m.color : colors.border.lowContrast },
                        isSelected && { backgroundColor: `${m.color}18`, borderWidth: 1.5 }
                      ]}
                      onPress={() => handleMoodSelect(m.key as any)}
                      activeOpacity={isToday ? 0.7 : 1}
                    >
                      <Text style={[styles.moodLabel, { color: isSelected ? m.color : colors.text.primary }]}>
                        {m.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Card>
          </View>
        </ScrollView>

        {/* Modal to log today's vows */}
        <VowDetailModal 
          vowId={selectedVowId}
          visible={detailVisible}
          onClose={() => setDetailVisible(false)}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  darkOverlay: {
    ...StyleSheet.absoluteFill,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    letterSpacing: 0,
    fontFamily: typography.fontFamily.displaySemiBold,
    color: '#F5F6F8',
  },
  headerSub: {
    fontSize: 13,
    marginTop: 3,
    letterSpacing: 0.2,
    fontFamily: typography.fontFamily.uiMedium,
    color: '#8A91A0',
  },
  scrollContent: {
    paddingBottom: 110,
    gap: 16,
  },
  summaryCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 10,
    ...Platform.select({
      web: {
        backdropFilter: 'blur(20px)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
      }
    })
  },
  summaryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    fontFamily: typography.fontFamily.uiBold,
    textTransform: 'uppercase',
    marginBottom: 2,
    color: '#8A91A0',
  },
  summaryCount: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: typography.fontFamily.uiBold,
    color: '#F5F6F8',
  },
  percentageBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(243, 186, 69, 0.12)',
  },
  percentageText: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: typography.fontFamily.uiBold,
    color: '#F3BA45',
  },
  progressTrack: {
    height: 6,
    backgroundColor: '#262A33',
    borderRadius: 999,
    overflow: 'hidden',
    marginTop: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#F3BA45',
    borderRadius: 999,
  },
  section: {
    gap: 8,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: 18,
    letterSpacing: 0.5,
    fontWeight: '600',
    fontFamily: typography.fontFamily.displaySemiBold,
    color: '#F5F6F8',
  },
  sectionHint: {
    fontSize: 10,
    letterSpacing: 0.8,
    fontWeight: '700',
    textTransform: 'uppercase',
    fontFamily: typography.fontFamily.uiBold,
    color: '#8A91A0',
  },
  vowCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 0,
    position: 'relative',
    overflow: 'hidden',
    ...Platform.select({
      web: {
        backdropFilter: 'blur(20px)',
        boxShadow: '0 4px 18px rgba(0, 0, 0, 0.25)',
      }
    })
  },
  cardArtworkContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: '62%',
    overflow: 'hidden',
  },
  cardArtworkImage: {
    position: 'absolute',
    right: 0,
    top: '-20%',
    width: '100%',
    height: '140%',
    opacity: 0.30,
  },
  vowCardContent: {
    position: 'relative',
    zIndex: 2,
    padding: 16,
    gap: 10,
  },
  vowCardMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vowCardInfo: {
    flex: 1,
    gap: 3,
    paddingRight: 12,
  },
  vowCardName: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0,
    fontFamily: typography.fontFamily.displayBold,
    color: '#F5F6F8',
  },
  vowCardSub: {
    fontSize: 11,
    letterSpacing: 0.2,
    fontFamily: typography.fontFamily.uiMedium,
    color: '#8A91A0',
  },
  statusBadge: {
    borderWidth: 1,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    fontFamily: typography.fontFamily.uiBold,
    textTransform: 'uppercase',
  },
  noteSnippet: {
    flexDirection: 'row',
    borderRadius: 8,
    borderWidth: 0.5,
    paddingVertical: 6,
    paddingHorizontal: 10,
    gap: 8,
    alignItems: 'flex-start',
  },
  noteLabel: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: typography.fontFamily.uiBold,
    textTransform: 'uppercase',
    marginTop: 1,
  },
  noteText: {
    flex: 1,
    fontSize: 12,
    fontFamily: typography.fontFamily.uiMedium,
    fontStyle: 'italic',
    lineHeight: 17,
  },
  shieldCard: {
    padding: 14,
    gap: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  shieldHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  shieldTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  shieldIcon: {
    fontSize: 18,
  },
  shieldTitle: {
    fontSize: 13,
    fontFamily: typography.fontFamily.uiBold,
    fontWeight: '700',
  },
  shieldCount: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: typography.fontFamily.uiBold,
  },
  shieldDesc: {
    fontSize: 12,
    fontFamily: typography.fontFamily.ui,
    lineHeight: 17,
    color: '#8A91A0',
  },
  shieldBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 2,
  },
  shieldBtnText: {
    fontWeight: '700',
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontFamily: typography.fontFamily.uiBold,
  },
  disabledBtn: {
    opacity: 0.5,
  },
  moodCard: {
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  moodBtn: {
    flex: 1,
    minWidth: '45%',
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
  },
  moodLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
});

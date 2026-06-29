import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, ImageBackground, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore, getVowConfig } from '../store/useAppStore';
import { theme } from '../theme';
import { Text } from '../components/Text';
import { Card } from '../components/Card';
import { VowDetailModal } from '../components/VowDetailModal';

export default function CheckInScreen() {
  const { 
    user, 
    activeVows, 
    dailyLog, 
    vowLogs, 
    vowProgress,
    vowReflections,
    updateWaterIntake, 
    updateMood,
    useRecoveryShield
  } = useAppStore();

  const [selectedVowId, setSelectedVowId] = useState<string | null>(null);
  const [detailVisible, setDetailVisible] = useState<boolean>(false);

  if (!user || !dailyLog) return null;

  const handleWaterIncrement = (amount: number) => {
    const current = dailyLog.water_ml;
    const next = Math.max(0, current + amount);
    updateWaterIntake(next);
  };

  const handleMoodSelect = (moodName: 'struggling' | 'neutral' | 'focused' | 'on_fire') => {
    updateMood(moodName);
  };

  const moods = [
    { key: 'struggling', label: '😢 Struggling', color: theme.colors.danger },
    { key: 'neutral', label: '😐 Neutral', color: theme.colors.text.secondary },
    { key: 'focused', label: '🎯 Focused', color: theme.colors.tertiary },
    { key: 'on_fire', label: '🔥 On Fire', color: theme.colors.primary }
  ];

  return (
    <ImageBackground
      source={require('../../assets/images/dark_misty_mountains.png')}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.darkOverlay} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>DAILY LOG</Text>
          <Text style={styles.headerSub}>{new Date().toDateString()}</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Vow Check-Ins */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>MY VOWS</Text>
            {activeVows.map((vow) => {
              const isCompleted = vowLogs[vow.id] || false;
              const progress = vowProgress[vow.id] || 0;
              const note = vowReflections[vow.id] || '';
              const config = getVowConfig(vow.custom_name || '');
              
              let statusText = 'PENDING';
              let statusColor = '#8A8A93';
              
              if (isCompleted) {
                statusText = 'HONORED';
                statusColor = '#5DCAA5';
              } else if (note !== '' || progress > 0) {
                statusText = 'LAPSED';
                statusColor = '#E24B4A';
              }

              const progressPercent = config.isTarget 
                ? Math.min(100, (progress / config.target) * 100) 
                : isCompleted ? 100 : 0;

              return (
                <TouchableOpacity 
                  key={vow.id} 
                  style={[
                    styles.vowCard, 
                    isCompleted ? styles.vowCardCompleted : (statusText === 'LAPSED' ? styles.vowCardLapsed : styles.vowCardPending)
                  ]} 
                  activeOpacity={0.9}
                  onPress={() => {
                    setSelectedVowId(vow.id);
                    setDetailVisible(true);
                  }}
                >
                  <View style={styles.vowCardHeader}>
                    <Text style={styles.vowCardIcon}>{config.icon}</Text>
                    <View style={styles.vowCardTitleGroup}>
                      <Text style={styles.vowCardName}>{vow.custom_name}</Text>
                      <Text style={styles.vowCardDifficulty}>
                        {vow.difficulty.toUpperCase()} • ×{vow.weight.toFixed(1)}
                      </Text>
                    </View>
                    <View style={[styles.statusBadge, { borderColor: statusColor, backgroundColor: `${statusColor}10` }]}>
                      <Text style={[styles.statusBadgeText, { color: statusColor }]}>
                        {statusText}
                      </Text>
                    </View>
                  </View>

                  {config.isTarget && (
                    <View style={styles.vowCardProgressSection}>
                      <View style={styles.vowCardProgressTextRow}>
                        <Text style={styles.vowCardProgressLabel}>Progress toward commitment</Text>
                        <Text style={styles.vowCardProgressValue}>
                          {progress} / {config.target} {config.unit}
                        </Text>
                      </View>
                      <View style={styles.vowCardProgressBarContainer}>
                        <View style={[styles.vowCardProgressBar, { width: `${progressPercent}%`, backgroundColor: isCompleted ? '#5DCAA5' : '#C8963C' }]} />
                      </View>
                    </View>
                  )}
                  
                  {note !== '' && (
                    <View style={styles.reflectionSnippet}>
                      <Text style={styles.reflectionSnippetLabel}>Reflection:</Text>
                      <Text style={styles.reflectionSnippetText} numberOfLines={1}>
                        "{note}"
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Recovery Shield Prompt */}
          {!Object.values(vowLogs).every(v => v) && !dailyLog.shield_spent && (
            <Card style={styles.shieldCard}>
              <View style={styles.shieldInfo}>
                <Text style={styles.shieldTitle}>Lapse Detected Today</Text>
                <Text style={styles.shieldDesc}>
                  You missed a vow. Spend a Recovery Shield to protect your streak.
                </Text>
              </View>
              <TouchableOpacity 
                style={[
                  styles.shieldBtn, 
                  user.recovery_shields <= 0 && styles.disabledBtn
                ]}
                disabled={user.recovery_shields <= 0}
                onPress={useRecoveryShield}
              >
                <Text style={styles.shieldBtnText}>SPEND 🛡️</Text>
              </TouchableOpacity>
            </Card>
          )}

          {/* Water Intake */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>WATER INTAKE</Text>
            <Card style={styles.waterCard}>
              <View style={styles.waterDisplay}>
                <Text style={styles.waterVolume}>{(dailyLog.water_ml / 1000).toFixed(2)}L</Text>
                <Text style={styles.waterLabel}>{Math.round(dailyLog.water_ml / 250)} / 10 glasses</Text>
              </View>
              <View style={styles.waterControls}>
                <TouchableOpacity style={styles.waterBtn} onPress={() => handleWaterIncrement(-250)}>
                  <Text style={styles.waterBtnText}>-250ml</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.waterBtn, styles.waterBtnPlus]} onPress={() => handleWaterIncrement(250)}>
                  <Text style={styles.waterBtnText}>+250ml</Text>
                </TouchableOpacity>
              </View>
            </Card>
          </View>

          {/* Mood Selector */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>DAILY MOOD</Text>
            <Card style={styles.moodCard}>
              <View style={styles.moodGrid}>
                {moods.map((m) => {
                  const isSelected = dailyLog.mood === m.key;
                  return (
                    <TouchableOpacity
                      key={m.key}
                      style={[
                        styles.moodBtn,
                        isSelected && { borderColor: m.color, backgroundColor: `${m.color}15` }
                      ]}
                      onPress={() => handleMoodSelect(m.key as any)}
                    >
                      <Text style={[styles.moodLabel, isSelected && { color: m.color }]}>
                        {m.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Card>
          </View>
        </ScrollView>
        <VowDetailModal 
          vowId={selectedVowId}
          visible={detailVisible}
          onClose={() => setDetailVisible(false)}
        />
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  darkOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(5, 5, 10, 0.88)', // Deep indigo luxury overlay
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#161626', // Refined borders
    marginBottom: 16,
  },
  headerTitle: {
    fontFamily: theme.typography.fontFamily.mono,
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text.primary,
  },
  headerSub: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  scrollContent: {
    paddingBottom: 100, // tab bar buffer
    gap: 20,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  vowCard: {
    backgroundColor: 'rgba(15, 15, 24, 0.75)',
    borderRadius: theme.spacing.borderRadius.card,
    borderColor: '#1F1F35',
    borderWidth: 0.5,
    padding: 16,
    gap: 12,
    ...Platform.select({
      web: {
        backdropFilter: 'blur(20px)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
      }
    })
  },
  vowCardCompleted: {
    borderColor: 'rgba(93, 202, 165, 0.4)', // stronger teal border
    backgroundColor: 'rgba(93, 202, 165, 0.03)',
    ...Platform.select({
      web: {
        boxShadow: '0 0 15px rgba(93, 202, 165, 0.08)',
      }
    })
  },
  vowCardLapsed: {
    borderColor: 'rgba(226, 75, 74, 0.4)', // stronger red border
    backgroundColor: 'rgba(226, 75, 74, 0.03)',
    ...Platform.select({
      web: {
        boxShadow: '0 0 15px rgba(226, 75, 74, 0.08)',
      }
    })
  },
  vowCardPending: {
    borderColor: '#1F1F35',
  },
  vowCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  vowCardIcon: {
    fontSize: 24,
  },
  vowCardTitleGroup: {
    flex: 1,
    gap: 2,
  },
  vowCardName: {
    fontSize: theme.typography.fontSize.sm,
    color: '#FFFFFF',
    fontFamily: theme.typography.fontFamily.medium,
  },
  vowCardDifficulty: {
    fontSize: 9,
    color: theme.colors.text.tertiary,
    fontFamily: theme.typography.fontFamily.mono,
    letterSpacing: 0.5,
  },
  statusBadge: {
    borderWidth: 0.5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.spacing.borderRadius.pill,
  },
  statusBadgeText: {
    fontSize: 8,
    fontFamily: theme.typography.fontFamily.mono,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  vowCardProgressSection: {
    gap: 6,
  },
  vowCardProgressTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vowCardProgressLabel: {
    fontSize: 9,
    color: theme.colors.text.tertiary,
    fontFamily: theme.typography.fontFamily.medium,
  },
  vowCardProgressValue: {
    fontSize: 10,
    color: '#FFFFFF',
    fontFamily: theme.typography.fontFamily.mono,
  },
  vowCardProgressBarContainer: {
    height: 4,
    borderRadius: 2,
    backgroundColor: '#1E1E2A',
    overflow: 'hidden',
  },
  vowCardProgressBar: {
    height: '100%',
    borderRadius: 2,
  },
  reflectionSnippet: {
    flexDirection: 'row',
    backgroundColor: 'rgba(5, 5, 8, 0.4)',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    gap: 6,
    alignItems: 'center',
  },
  reflectionSnippetLabel: {
    fontSize: 9,
    color: theme.colors.text.tertiary,
    fontFamily: theme.typography.fontFamily.medium,
  },
  reflectionSnippetText: {
    flex: 1,
    fontSize: 9,
    color: theme.colors.text.secondary,
    fontStyle: 'italic',
  },
  shieldCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderColor: 'rgba(108, 91, 149, 0.4)', // Dusk Violet
    borderWidth: 0.5,
    backgroundColor: 'rgba(108, 91, 149, 0.05)',
    ...Platform.select({
      web: {
        backdropFilter: 'blur(20px)',
        boxShadow: '0 4px 20px rgba(108, 91, 149, 0.1)',
      }
    })
  },
  shieldInfo: {
    flex: 1,
    marginRight: 16,
  },
  shieldTitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.accent,
    fontFamily: theme.typography.fontFamily.medium,
  },
  shieldDesc: {
    fontSize: theme.typography.fontSize.xxs,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  shieldBtn: {
    backgroundColor: theme.colors.accent,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: theme.spacing.borderRadius.card,
  },
  shieldBtnText: {
    color: theme.colors.text.dark,
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.fontSize.xs,
  },
  disabledBtn: {
    backgroundColor: theme.colors.text.tertiary,
    opacity: 0.5,
  },
  waterCard: {
    alignItems: 'center',
    gap: 16,
    paddingVertical: 16,
  },
  waterDisplay: {
    alignItems: 'center',
  },
  waterVolume: {
    fontFamily: theme.typography.fontFamily.mono,
    fontSize: 28,
    color: theme.colors.tertiary,
  },
  waterLabel: {
    fontSize: theme.typography.fontSize.xxs,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  waterControls: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  waterBtn: {
    flex: 1,
    backgroundColor: theme.colors.bg.surfaceAlt,
    paddingVertical: 10,
    borderRadius: theme.spacing.borderRadius.card,
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: theme.colors.border.lowContrast,
  },
  waterBtnPlus: {
    borderColor: theme.colors.tertiary,
  },
  waterBtnText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.primary,
  },
  moodCard: {
    padding: 10,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  moodBtn: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: theme.colors.bg.surfaceAlt,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: theme.spacing.borderRadius.card,
    borderWidth: 0.5,
    borderColor: theme.colors.border.lowContrast,
  },
  moodLabel: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.primary,
  },
});

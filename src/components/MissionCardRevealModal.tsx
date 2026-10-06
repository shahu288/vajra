import React, { useEffect, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  Image, 
  Animated, 
  Dimensions, 
  Platform 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, typography } from '../theme';
import { Text } from './Text';
import { getMissionCardData } from '../utils/cardMapping';
import { useAppStore, getVowConfig } from '../store/useAppStore';
import { calculateCurrentStreak } from '../utils/dates';
import { getCardProgression } from '../utils/cardProgression';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface MissionCardRevealModalProps {
  vowId?: string | null;
  vowName: string | null;
  visible: boolean;
  onClose: () => void;
  onOpenNote?: (vowId: string, mode: 'kept' | 'missed') => void;
  mode?: 'inspect' | 'reveal' | 'view';
  previousStage?: string;
  customStreak?: number;
  difficulty?: string;
  weight?: number;
}

export function MissionCardRevealModal({ 
  vowId, 
  vowName, 
  visible, 
  onClose,
  onOpenNote,
  mode = 'inspect',
  previousStage = 'Beginner',
  customStreak,
  difficulty = 'medium',
  weight = 1.5,
}: MissionCardRevealModalProps) {
  const { user, vowHistoryDates, vowLogs, vowReflections, checkInVow, activeVows } = useAppStore();

  const currentVow = vowId ? activeVows.find(v => v.id === vowId) : null;
  const habitName = vowName || currentVow?.custom_name || 'Vow';
  const isCompletedToday = vowId ? vowLogs[vowId] === true : false;
  const isBrokenToday = vowId ? vowLogs[vowId] === false : false;

  // Compute completed dates and streak for this vow
  const completedDates = vowId ? (vowHistoryDates[vowId] || []) : [];
  const calculatedStreak = calculateCurrentStreak(completedDates);
  const streakDays = customStreak !== undefined ? customStreak : calculatedStreak;

  const progression = getCardProgression(streakDays);
  const isUnlocked = progression.isUnlocked;

  // Base animations
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(0.92)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;

  // Reveal effect animations
  const foilShimmerOpacity = useRef(new Animated.Value(0)).current;
  const revealScale = useRef(new Animated.Value(0.96)).current;

  useEffect(() => {
    if (visible) {
      overlayOpacity.setValue(0);
      cardOpacity.setValue(0);
      cardScale.setValue(0.92);
      contentOpacity.setValue(0);
      foilShimmerOpacity.setValue(0);
      revealScale.setValue(0.96);

      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(cardOpacity, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(cardScale, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();

      if (mode === 'reveal') {
        Animated.sequence([
          Animated.timing(foilShimmerOpacity, {
            toValue: 0.7,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(foilShimmerOpacity, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ]).start();

        Animated.sequence([
          Animated.timing(revealScale, {
            toValue: 1.03,
            duration: 350,
            useNativeDriver: true,
          }),
          Animated.timing(revealScale, {
            toValue: 1.0,
            duration: 250,
            useNativeDriver: true,
          }),
        ]).start();
      }

      Animated.delay(180).start(() => {
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }).start();
      });
    }
  }, [visible, mode]);

  if (!visible || !habitName) return null;

  const cardData = getMissionCardData(habitName);
  const stageStyle = progression.style;

  const hasNote = Boolean(vowId && vowReflections[vowId]?.trim());

  const handleKeep = async () => {
    if (!vowId || isCompletedToday) return;
    await checkInVow(vowId, true);
  };

  const handleMissed = async () => {
    if (!vowId) return;
    await checkInVow(vowId, false);
    if (onOpenNote) {
      onOpenNote(vowId, 'missed');
    }
  };

  const streakTarget = 7;
  const streakPct = Math.min(100, Math.round((streakDays / streakTarget) * 100));

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        {/* Full-screen Dark Overlay */}
        <Animated.View 
          style={[
            styles.overlay, 
            { opacity: overlayOpacity }
          ]} 
        />

        {/* Card Frame */}
        <Animated.View 
          style={[
            styles.cardWrapper,
            { 
              opacity: cardOpacity,
              transform: [{ scale: cardScale }]
            }
          ]}
        >
          {/* Main Card View */}
          <Animated.View style={[
            styles.tradingCard, 
            {
              borderColor: stageStyle.borderColor,
            },
            isUnlocked && {
              ...Platform.select({
                web: {
                  boxShadow: `0 8px 32px ${stageStyle.glowColor}`,
                }
              })
            },
            { transform: [{ scale: revealScale }] }
          ]}>
            
            {/* Top Foil Border Accent Line */}
            <LinearGradient
              colors={stageStyle.foilGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.foilHeaderStrip}
            />

            {/* Header: Edition Details & Stage */}
            <View style={styles.cardTopBar}>
              <Text style={styles.editionText}>VAJRA TCG • ED. 01</Text>
              <View style={[styles.stageBadge, { backgroundColor: stageStyle.badgeBg, borderColor: stageStyle.borderColor }]}>
                <Text style={[styles.stageBadgeText, { color: stageStyle.textColor }]}>
                  {(cardData.targetStage || progression.stageName).toUpperCase()}
                </Text>
              </View>
            </View>

            {/* Artwork Container */}
            <View style={styles.artworkContainer}>
              <Image 
                source={cardData.image} 
                style={[
                  styles.cardImage, 
                  !isUnlocked && styles.silhouetteImage
                ]} 
                resizeMode="cover" 
              />

              {/* Locked Obsidian Silhouette & Rune */}
              {!isUnlocked && (
                <View style={styles.lockedRuneOverlay}>
                  <Text style={styles.runeSymbol}>◇</Text>
                  <Text style={styles.lockedMilestoneText}>UNLOCK AT {progression.requiredDays}D STREAK</Text>
                </View>
              )}

              {/* Dark Gradient Overlay for bottom text readability */}
              <LinearGradient
                colors={['transparent', 'rgba(13, 13, 14, 0.4)', 'rgba(13, 13, 14, 0.95)']}
                style={StyleSheet.absoluteFill}
              />

              {/* Shimmer Light Flash */}
              <Animated.View 
                style={[
                  styles.shimmerOverlay, 
                  { opacity: foilShimmerOpacity, backgroundColor: stageStyle.textColor }
                ]} 
                pointerEvents="none" 
              />
            </View>

            {/* Card Lore & Details */}
            <Animated.View 
              style={[
                styles.cardBody,
                { opacity: contentOpacity }
              ]}
            >
              {/* Category & Vow Title */}
              <View style={styles.titleSection}>
                <Text style={[styles.guardianTitle, { color: stageStyle.textColor }]}>
                  {cardData.title.toUpperCase()}
                </Text>
                <Text style={styles.habitTitle}>
                  {habitName}
                </Text>
                <Text style={styles.metaMultiplier}>
                  {(difficulty || 'MEDIUM').toUpperCase()} • ×{(weight || 1.5).toFixed(1)} XP MULTIPLIER
                </Text>
              </View>

              {/* Guardian Lore Quote */}
              <View style={styles.quoteBox}>
                <Text style={styles.quoteText}>"{cardData.quote}"</Text>
                <Text style={[styles.guardianName, { color: stageStyle.textColor }]}>— {cardData.guardian}</Text>
              </View>

              {/* Streak & Progression Row */}
              <View style={styles.statsRow}>
                <View style={styles.streakRingContainer}>
                  {Platform.OS === 'web' ? (
                    <svg width="44" height="44" viewBox="0 0 44 44" style={{ display: 'block' }}>
                      <circle
                        cx="22"
                        cy="22"
                        r="18"
                        stroke="rgba(255, 255, 255, 0.08)"
                        strokeWidth="3.5"
                        fill="none"
                      />
                      <circle
                        cx="22"
                        cy="22"
                        r="18"
                        stroke={isCompletedToday ? '#48BB78' : stageStyle.borderColor}
                        strokeWidth="3.5"
                        strokeDasharray="113.1"
                        strokeDashoffset={113.1 * (1 - streakPct / 100)}
                        strokeLinecap="round"
                        fill="none"
                        transform="rotate(-90 22 22)"
                      />
                    </svg>
                  ) : null}
                  <View style={styles.ringCenterTextWrapper}>
                    <Text style={[styles.ringCenterText, { color: stageStyle.textColor }]}>
                      {streakDays}d
                    </Text>
                  </View>
                </View>

                <View style={styles.streakDetails}>
                  <Text style={styles.streakLabel}>CURRENT STREAK</Text>
                  <Text style={styles.streakValue}>
                    {streakDays} / {progression.progressTarget} Days to {progression.nextStageName}
                  </Text>
                </View>
              </View>

              {/* Actionable CTAs: Keep Vow / Missed Vow / Add Note */}
              {vowId && (
                <View style={styles.actionSection}>
                  {isCompletedToday ? (
                    <>
                      <View style={[styles.honorBtn, styles.honorBtnCompleted]}>
                        <Text style={[styles.honorBtnText, styles.honorBtnTextCompleted]}>
                          KEPT VOW ✓
                        </Text>
                      </View>
                      {onOpenNote && (
                        <TouchableOpacity
                          style={styles.secondaryActionBtn}
                          activeOpacity={0.7}
                          onPress={() => onOpenNote(vowId, 'kept')}
                        >
                          <Text style={styles.secondaryActionText}>
                            {hasNote ? '✎ EDIT NOTE' : '+ ADD NOTE'}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </>
                  ) : isBrokenToday ? (
                    <>
                      <View style={[styles.honorBtn, styles.honorBtnBroken]}>
                        <Text style={[styles.honorBtnText, styles.honorBtnTextBroken]}>
                          MISSED VOW
                        </Text>
                      </View>
                      {onOpenNote && (
                        <TouchableOpacity
                          style={styles.secondaryActionBtn}
                          activeOpacity={0.7}
                          onPress={() => onOpenNote(vowId, 'missed')}
                        >
                          <Text style={styles.secondaryActionText}>
                            {hasNote ? '✎ EDIT NOTE' : '+ ADD NOTE'}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </>
                  ) : (
                    <>
                      <TouchableOpacity
                        style={[styles.honorBtn, styles.honorBtnPending]}
                        activeOpacity={0.8}
                        onPress={handleKeep}
                      >
                        <Text style={[styles.honorBtnText, styles.honorBtnTextPending]}>
                          KEEP VOW
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.secondaryActionBtn}
                        activeOpacity={0.7}
                        onPress={handleMissed}
                      >
                        <Text style={styles.secondaryActionText}>
                          MISSED VOW
                        </Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              )}
            </Animated.View>
          </Animated.View>

          {/* Close Button */}
          <TouchableOpacity 
            style={styles.closeBtn} 
            activeOpacity={0.7}
            onPress={onClose}
          >
            <Text style={styles.closeBtnText}>CLOSE ARTIFACT</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(5, 5, 8, 0.92)',
  },
  cardWrapper: {
    width: Math.min(SCREEN_WIDTH * 0.88, 340),
    alignItems: 'center',
    gap: 14,
  },
  tradingCard: {
    width: '100%',
    borderRadius: 22,
    backgroundColor: '#121215',
    overflow: 'hidden',
    borderWidth: 1.5,
  },
  foilHeaderStrip: {
    height: 3,
    width: '100%',
  },
  cardTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 8,
  },
  editionText: {
    fontSize: 10,
    letterSpacing: 1.5,
    fontFamily: typography.fontFamily.uiBold,
    color: '#8A91A0',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  stageBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  stageBadgeText: {
    fontSize: 9,
    fontFamily: typography.fontFamily.uiBold,
    letterSpacing: 1,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  artworkContainer: {
    width: '100%',
    height: 200,
    position: 'relative',
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  silhouetteImage: {
    opacity: 0.15,
  },
  lockedRuneOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(13, 13, 14, 0.7)',
    gap: 6,
  },
  runeSymbol: {
    fontSize: 32,
    color: '#F3BA45',
    fontFamily: typography.fontFamily.displayBold,
  },
  lockedMilestoneText: {
    fontSize: 10,
    letterSpacing: 1.2,
    fontFamily: typography.fontFamily.uiBold,
    color: '#8A91A0',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  shimmerOverlay: {
    ...StyleSheet.absoluteFill,
  },
  cardBody: {
    padding: 16,
    gap: 12,
  },
  titleSection: {
    gap: 2,
  },
  guardianTitle: {
    fontSize: 11,
    letterSpacing: 1.5,
    fontFamily: typography.fontFamily.uiBold,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  habitTitle: {
    fontFamily: typography.fontFamily.displayBold,
    fontSize: 20,
    color: '#F5F6F8',
    fontWeight: '700',
    lineHeight: 25,
    letterSpacing: 0,
  },
  metaMultiplier: {
    fontSize: 12,
    color: '#8A91A0',
    letterSpacing: 0.2,
    fontFamily: typography.fontFamily.uiMedium,
    fontWeight: '500',
  },
  quoteBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    padding: 10,
    gap: 4,
  },
  quoteText: {
    fontSize: 12,
    fontFamily: typography.fontFamily.uiMedium,
    color: '#8A91A0',
    lineHeight: 18,
    fontStyle: 'italic',
  },
  guardianName: {
    fontSize: 10,
    fontFamily: typography.fontFamily.uiBold,
    textAlign: 'right',
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 2,
  },
  streakRingContainer: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  ringCenterTextWrapper: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ringCenterText: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: typography.fontFamily.uiBold,
  },
  streakDetails: {
    flex: 1,
    gap: 2,
  },
  streakLabel: {
    fontSize: 10,
    letterSpacing: 1,
    color: '#8A91A0',
    fontFamily: typography.fontFamily.uiBold,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  streakValue: {
    fontSize: 13,
    color: '#F5F6F8',
    fontFamily: typography.fontFamily.uiBold,
    fontWeight: '700',
  },
  honorBtn: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    marginTop: 4,
    ...Platform.select({
      web: { cursor: 'pointer' }
    })
  },
  honorBtnPending: {
    backgroundColor: '#F3BA45',
    borderColor: '#F3BA45',
  },
  honorBtnCompleted: {
    backgroundColor: '#1C2027',
    borderColor: '#38A169',
  },
  honorBtnBroken: {
    backgroundColor: 'rgba(163, 58, 58, 0.15)',
    borderColor: 'rgba(163, 58, 58, 0.5)',
  },
  honorBtnText: {
    fontSize: 13,
    letterSpacing: 1,
    fontFamily: typography.fontFamily.uiBold,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  honorBtnTextPending: {
    color: '#0B0C0E',
  },
  honorBtnTextCompleted: {
    color: '#38A169',
  },
  honorBtnTextBroken: {
    color: '#E53E3E',
  },
  actionSection: {
    gap: 6,
    width: '100%',
    alignItems: 'stretch',
  },
  secondaryActionBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  secondaryActionText: {
    fontSize: 11,
    letterSpacing: 0.8,
    fontFamily: typography.fontFamily.uiBold,
    fontWeight: '700',
    color: '#8A91A0',
    textTransform: 'uppercase',
  },
  closeBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#1C2027',
    borderWidth: 1,
    borderColor: '#262A33',
  },
  closeBtnText: {
    fontSize: 11,
    color: '#8A91A0',
    letterSpacing: 1,
    fontFamily: typography.fontFamily.uiBold,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});

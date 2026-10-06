import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
  Animated,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { typography, spacing } from '../theme';
import { Text } from './Text';
import { CardStage, CardProgressionInfo, STAGE_STYLES } from '../utils/cardProgression';
import {
  CANONICAL_RANKS,
  RANK_EMBLEMS,
  RankProgressionTier,
} from '../utils/rankAndAchievements';

interface RankProgressionSectionProps {
  currentStreak: number;
  userProgression: CardProgressionInfo;
}

export const RankProgressionSection: React.FC<RankProgressionSectionProps> = ({
  currentStreak,
  userProgression,
}) => {
  const [selectedRankTier, setSelectedRankTier] = useState<RankProgressionTier | null>(null);

  // Extremely subtle, slow floating/depth motion for the hero rank emblem
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 3800,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 3800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [floatAnim]);

  const translateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -3.5],
  });

  // Canonical stages
  const currentStage = userProgression.stage;
  const currentStageName = userProgression.stageName.toUpperCase();
  const currentStageStyle = userProgression.style;

  // Active rank tier details
  const activeTierIndex = CANONICAL_RANKS.findIndex(
    (r) => r.stage.toLowerCase() === currentStage.toLowerCase()
  );
  const currentTier = CANONICAL_RANKS[Math.max(0, activeTierIndex)] || CANONICAL_RANKS[0];
  const nextTier = activeTierIndex < CANONICAL_RANKS.length - 1
    ? CANONICAL_RANKS[activeTierIndex + 1]
    : null;

  // Real progress calculation toward next rank
  let progressRatio = 1;
  let daysToNext = 0;
  if (nextTier) {
    const prevRequired = currentTier.requiredDays;
    const nextRequired = nextTier.requiredDays;
    const progressInSpan = Math.max(0, currentStreak - prevRequired);
    const spanLength = Math.max(1, nextRequired - prevRequired);
    progressRatio = Math.min(1, Math.max(0, currentStreak / nextRequired));
    daysToNext = Math.max(1, nextRequired - currentStreak);
  }

  const currentEmblem = RANK_EMBLEMS[currentStage] || RANK_EMBLEMS.Beginner;

  return (
    <View style={styles.sectionContainer}>
      {/* ─── Header ────────────────────────────────────────────── */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>RANK EVOLUTION</Text>
      </View>

      {/* ─── Hero Current Rank Card ────────────────────────────── */}
      <View style={styles.heroCard}>
        {/* Subtle background gradient */}
        <LinearGradient
          colors={['rgba(243, 186, 69, 0.05)', 'rgba(20, 23, 28, 0.85)', '#14171C']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        {/* Top Hero Layout: Emblem + Identity */}
        <View style={styles.heroTopRow}>
          {/* Animated 3D Current Rank Emblem */}
          <Animated.View
            style={[
              styles.emblemContainer,
              { transform: [{ translateY }] },
            ]}
          >
            {/* Ambient Gold Halo */}
            <View style={styles.emblemGlowHalo} />

            {/* Emblem Frame with Double Gold Rim */}
            <View style={styles.emblemOuterFrame}>
              <View style={styles.emblemInnerFrame}>
                <Image
                  source={currentEmblem}
                  style={styles.heroEmblemImage}
                  resizeMode="cover"
                />
              </View>
            </View>

            {/* Active Ceremonial Seal */}
            <View style={styles.activeEmblemBadge}>
              <Text style={styles.activeEmblemBadgeText}>CURRENT</Text>
            </View>
          </Animated.View>

          {/* Rank Identity & Metadata */}
          <View style={styles.identityDetails}>
            <Text style={styles.currentRankName}>{currentStageName}</Text>
            <Text style={styles.currentRankMaterial}>{currentTier.material}</Text>

            {/* Next Milestone */}
            {nextTier ? (
              <View style={styles.nextMilestoneRow}>
                <Text style={styles.nextMilestoneText}>
                  {daysToNext === 1
                    ? `1 Day to ${nextTier.name.charAt(0) + nextTier.name.slice(1).toLowerCase()}`
                    : `${daysToNext} Days to ${nextTier.name.charAt(0) + nextTier.name.slice(1).toLowerCase()}`}
                </Text>
              </View>
            ) : (
              <View style={styles.apexRankCalloutPill}>
                <Text style={styles.apexRankText}>✦ VAJRA APEX MASTERED</Text>
              </View>
            )}
          </View>
        </View>

        {/* ─── Progression Indicator ──────────────────────────── */}
        <View style={styles.progressSection}>
          <View style={styles.progressLabelsRow}>
            <Text style={styles.progressForgedText}>
              {currentStreak} / {nextTier ? nextTier.requiredDays : currentStreak} DAYS FORGED
            </Text>
          </View>

          <View style={styles.progressBarTrack}>
            <LinearGradient
              colors={['#F3BA45', '#FFE48A']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[
                styles.progressBarFill,
                { width: `${Math.round(progressRatio * 100)}%` },
              ]}
            />
          </View>
        </View>

        {/* ─── 5-Tier Horizontal Progression Roadmap ──────────── */}
        <View style={styles.stepperContainer}>
          <View style={styles.stepperLineTrack} />

          <View style={styles.stepperNodesRow}>
            {CANONICAL_RANKS.map((tier, idx) => {
              const isCompleted = currentStreak >= tier.requiredDays && activeTierIndex > idx;
              const isCurrent = activeTierIndex === idx;
              const isLocked = activeTierIndex < idx;

              return (
                <TouchableOpacity
                  key={tier.stage}
                  style={styles.nodeItem}
                  onPress={() => setSelectedRankTier(tier)}
                  activeOpacity={0.8}
                >
                  {/* Miniature Collectible Emblem Node */}
                  <View
                    style={[
                      styles.nodeEmblemWrapper,
                      isCurrent && styles.nodeEmblemCurrent,
                      isCompleted && styles.nodeEmblemCompleted,
                      isLocked && styles.nodeEmblemLocked,
                    ]}
                  >
                    <Image
                      source={tier.emblem}
                      style={[
                        styles.nodeEmblemImage,
                        isLocked && styles.nodeEmblemImageLocked,
                      ]}
                      resizeMode="cover"
                    />

                    {isCurrent && (
                      <View style={styles.nodeCurrentBeacon}>
                        <View style={styles.nodeCurrentBeaconCore} />
                      </View>
                    )}

                    {isCompleted && (
                      <View style={styles.nodeCompletedBadge}>
                        <Text style={styles.nodeCheckIcon}>✓</Text>
                      </View>
                    )}
                  </View>

                  {/* Stage Label */}
                  <Text
                    style={[
                      styles.nodeStageName,
                      isCurrent && styles.nodeStageNameCurrent,
                      isCompleted && styles.nodeStageNameCompleted,
                      isLocked && styles.nodeStageNameLocked,
                    ]}
                    numberOfLines={1}
                  >
                    {tier.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>

      {/* ─── Rank Inspect Modal ─────────────────────────────────── */}
      {selectedRankTier && (
        <Modal
          visible={!!selectedRankTier}
          transparent
          animationType="fade"
          onRequestClose={() => setSelectedRankTier(null)}
        >
          <View style={styles.modalOverlay}>
            <TouchableOpacity
              style={StyleSheet.absoluteFill}
              onPress={() => setSelectedRankTier(null)}
              activeOpacity={1}
            />

            <View style={styles.inspectCard}>
              <View style={styles.inspectEmblemBox}>
                <Image
                  source={selectedRankTier.emblem}
                  style={styles.inspectEmblemImage}
                  resizeMode="contain"
                />
              </View>

              <Text style={styles.inspectRankTitle}>{selectedRankTier.name}</Text>
              <Text style={styles.inspectRankMaterial}>{selectedRankTier.material}</Text>
              <Text style={styles.inspectRankDesc}>
                {selectedRankTier.description}
              </Text>

              <View style={styles.inspectRequirementPill}>
                <Text style={styles.inspectRequirementText}>
                  UNLOCK REQUIREMENT: {selectedRankTier.requiredDays} CONSECUTIVE DAYS
                </Text>
              </View>

              <TouchableOpacity
                style={styles.inspectCloseBtn}
                onPress={() => setSelectedRankTier(null)}
                activeOpacity={0.8}
              >
                <Text style={styles.inspectCloseBtnText}>CLOSE ARTIFACT</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    gap: 10,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  sectionTitle: {
    fontFamily: typography.fontFamily.displayBold,
    fontSize: 16,
    fontWeight: '700',
    color: '#F5F6F8',
    letterSpacing: 0.8,
  },
  sectionSubtitle: {
    fontFamily: typography.fontFamily.uiMedium,
    fontSize: 11,
    color: '#8A91A0',
    letterSpacing: 0.5,
  },

  // ─── Hero Rank Card ──────────────────────────────────────────
  heroCard: {
    backgroundColor: '#14171C',
    borderWidth: 1,
    borderColor: '#262A33',
    borderRadius: 18,
    padding: 16,
    gap: 16,
    position: 'relative',
    overflow: 'hidden',
    ...Platform.select({
      web: {
        boxShadow:
          '0 4px 20px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(243, 186, 69, 0.12)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 3,
      },
    }),
  },

  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },

  // Emblem Framing
  emblemContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emblemGlowHalo: {
    position: 'absolute',
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: 'rgba(243, 186, 69, 0.14)',
    ...Platform.select({
      web: {
        filter: 'blur(12px)',
      },
      default: {
        shadowColor: '#F3BA45',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.35,
        shadowRadius: 14,
      },
    }),
  },
  emblemOuterFrame: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 1.5,
    borderColor: '#F3BA45',
    padding: 2,
    backgroundColor: '#14171C',
  },
  emblemInnerFrame: {
    flex: 1,
    borderRadius: 46,
    overflow: 'hidden',
    backgroundColor: '#0B0C0E',
    borderWidth: 1,
    borderColor: 'rgba(243, 186, 69, 0.35)',
  },
  heroEmblemImage: {
    width: '100%',
    height: '100%',
  },
  activeEmblemBadge: {
    position: 'absolute',
    bottom: -6,
    backgroundColor: '#0B0C0E',
    borderWidth: 1,
    borderColor: '#F3BA45',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  activeEmblemBadgeText: {
    fontFamily: typography.fontFamily.uiBold,
    fontSize: 8,
    color: '#F3BA45',
    letterSpacing: 0.6,
  },

  // Identity Details
  identityDetails: {
    flex: 1,
    gap: 3,
  },
  currentRankLabel: {
    fontFamily: typography.fontFamily.uiBold,
    fontSize: 9.5,
    color: '#8A91A0',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  currentRankName: {
    fontFamily: typography.fontFamily.displayBold,
    fontSize: 22,
    fontWeight: '700',
    color: '#F5F6F8',
    letterSpacing: 0.5,
  },
  currentRankMaterial: {
    fontFamily: typography.fontFamily.uiMedium,
    fontSize: 11.5,
    color: '#8A91A0',
  },

  nextMilestoneRow: {
    marginTop: 4,
  },
  nextMilestoneText: {
    fontFamily: typography.fontFamily.uiSemiBold,
    fontSize: 12,
    color: '#F3BA45',
    letterSpacing: 0.3,
  },

  apexRankCalloutPill: {
    backgroundColor: 'rgba(255, 228, 138, 0.12)',
    borderWidth: 1,
    borderColor: '#FFE48A',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  apexRankText: {
    fontFamily: typography.fontFamily.uiBold,
    fontSize: 9,
    color: '#FFE48A',
    letterSpacing: 0.5,
  },

  // ─── Progress Bar ────────────────────────────────────────────
  progressSection: {
    gap: 7,
  },
  progressBarTrack: {
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#0F1115',
    borderWidth: 1,
    borderColor: '#262A33',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3.5,
  },
  progressLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  progressForgedText: {
    fontFamily: typography.fontFamily.uiBold,
    fontSize: 11.5,
    fontWeight: '700',
    color: '#F5F6F8',
    letterSpacing: 0.8,
  },

  // ─── 5-Stage Progression Stepper ─────────────────────────────
  stepperContainer: {
    paddingTop: 8,
    position: 'relative',
  },
  stepperLineTrack: {
    position: 'absolute',
    top: 28,
    left: 20,
    right: 20,
    height: 1,
    backgroundColor: '#262A33',
    zIndex: 1,
  },
  stepperNodesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    zIndex: 2,
  },
  nodeItem: {
    alignItems: 'center',
    width: '18%',
    gap: 5,
  },
  nodeEmblemWrapper: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#14171C',
    borderWidth: 1,
    borderColor: '#262A33',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  nodeEmblemCurrent: {
    borderColor: '#F3BA45',
    borderWidth: 1.5,
    ...Platform.select({
      web: {
        boxShadow: '0 0 8px rgba(243, 186, 69, 0.4)',
      },
    }),
  },
  nodeEmblemCompleted: {
    borderColor: '#F3BA45',
    borderWidth: 1,
  },
  nodeEmblemLocked: {
    opacity: 0.55,
    backgroundColor: '#0F1115',
  },
  nodeEmblemImage: {
    width: '100%',
    height: '100%',
  },
  nodeEmblemImageLocked: {
    tintColor: undefined,
  },
  nodeCurrentBeacon: {
    position: 'absolute',
    bottom: 1,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F3BA45',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeCurrentBeaconCore: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#0B0C0E',
  },
  nodeCompletedBadge: {
    position: 'absolute',
    top: 1,
    right: 1,
    width: 11,
    height: 11,
    borderRadius: 5.5,
    backgroundColor: '#F3BA45',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeCheckIcon: {
    fontSize: 7,
    color: '#0B0C0E',
    fontWeight: '800',
  },

  nodeStageName: {
    fontFamily: typography.fontFamily.uiSemiBold,
    fontSize: 8.5,
    color: '#8A91A0',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  nodeStageNameCurrent: {
    color: '#F3BA45',
    fontWeight: '700',
  },
  nodeStageNameCompleted: {
    color: '#F5F6F8',
  },
  nodeStageNameLocked: {
    color: '#555C68',
  },

  nodeMilestoneText: {
    fontFamily: typography.fontFamily.uiMedium,
    fontSize: 8,
    color: '#555C68',
  },
  nodeMilestoneTextCurrent: {
    color: '#F3BA45',
    fontWeight: '600',
  },

  // ─── Modal ───────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 6, 8, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  inspectCard: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#14171C',
    borderWidth: 1,
    borderColor: '#262A33',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    gap: 12,
  },
  inspectEmblemBox: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    borderColor: '#F3BA45',
    overflow: 'hidden',
    backgroundColor: '#0B0C0E',
  },
  inspectEmblemImage: {
    width: '100%',
    height: '100%',
  },
  inspectRankTitle: {
    fontFamily: typography.fontFamily.displayBold,
    fontSize: 22,
    fontWeight: '700',
    color: '#F5F6F8',
    letterSpacing: 0.8,
  },
  inspectRankMaterial: {
    fontFamily: typography.fontFamily.uiMedium,
    fontSize: 12,
    color: '#F3BA45',
  },
  inspectRankDesc: {
    fontFamily: typography.fontFamily.ui,
    fontSize: 12,
    color: '#8A91A0',
    textAlign: 'center',
    lineHeight: 18,
  },
  inspectRequirementPill: {
    backgroundColor: '#0F1115',
    borderWidth: 1,
    borderColor: '#262A33',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    width: '100%',
    alignItems: 'center',
  },
  inspectRequirementText: {
    fontFamily: typography.fontFamily.uiBold,
    fontSize: 9.5,
    color: '#8A91A0',
    letterSpacing: 0.8,
    textAlign: 'center',
  },
  inspectCloseBtn: {
    marginTop: 6,
    width: '100%',
    backgroundColor: '#0B0C0E',
    borderWidth: 1,
    borderColor: '#F3BA45',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  inspectCloseBtnText: {
    fontFamily: typography.fontFamily.uiBold,
    fontSize: 11,
    color: '#F3BA45',
    letterSpacing: 1,
  },
});

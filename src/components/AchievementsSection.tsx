import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { typography, spacing } from '../theme';
import { Text } from './Text';
import { LockIcon } from './ZenIcons';
import { AchievementItem } from '../utils/rankAndAchievements';

interface AchievementsSectionProps {
  achievements: AchievementItem[];
}

export const AchievementsSection: React.FC<AchievementsSectionProps> = ({
  achievements,
}) => {
  const [selectedAchievement, setSelectedAchievement] = useState<AchievementItem | null>(null);

  const earnedCount = achievements.filter((a) => a.isEarned).length;
  const totalCount = achievements.length;

  return (
    <View style={styles.sectionContainer}>
      {/* ─── Header ────────────────────────────────────────────── */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>ACHIEVEMENTS</Text>
        <Text style={styles.sectionCounter}>
          <Text style={styles.counterGoldHighlight}>{earnedCount}</Text> / {totalCount} Earned
        </Text>
      </View>

      {/* ─── 2-Column Collectible Milestones Grid ─────────────── */}
      <View style={styles.achievementsGrid}>
        {achievements.map((item) => {
          return item.isEarned ? (
            <TouchableOpacity
              key={item.id}
              style={styles.cardCol}
              onPress={() => setSelectedAchievement(item)}
              activeOpacity={0.85}
            >
              <View style={styles.earnedCard}>
                {/* Top Subtle Foil Line */}
                <LinearGradient
                  colors={['#FFE48A', '#F3BA45', 'transparent']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.cardFoilStrip}
                />

                {/* Top Row: Artifact Badge & Rarity */}
                <View style={styles.cardTopRow}>
                  <View style={styles.earnedBadgeCircle}>
                    <Text style={styles.earnedBadgeIcon}>{item.icon}</Text>
                  </View>
                  <View style={styles.earnedRarityPill}>
                    <Text style={styles.earnedRarityText}>{item.rarity.toUpperCase()}</Text>
                  </View>
                </View>

                {/* Content */}
                <View style={styles.cardContent}>
                  <Text numberOfLines={1} style={styles.earnedTitle}>
                    {item.title}
                  </Text>
                  <Text numberOfLines={2} style={styles.cardDesc}>
                    {item.requirement}
                  </Text>
                </View>

                {/* Status Footer */}
                <View style={styles.earnedFooterRow}>
                  <View style={styles.earnedStatusPill}>
                    <Text style={styles.earnedStatusText}>✓ EARNED</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              key={item.id}
              style={styles.cardCol}
              onPress={() => setSelectedAchievement(item)}
              activeOpacity={0.85}
            >
              <View style={styles.lockedCard}>
                {/* Recessed Pocket Inner */}
                <View style={styles.lockedPocketInner} />

                {/* Top Row: Lock Icon & Rarity */}
                <View style={styles.cardTopRow}>
                  <View style={styles.lockedBadgeCircle}>
                    <LockIcon size={14} color="#8A91A0" />
                  </View>
                  <View style={styles.lockedRarityPill}>
                    <Text style={styles.lockedRarityText}>{item.rarity.toUpperCase()}</Text>
                  </View>
                </View>

                {/* Content */}
                <View style={styles.cardContent}>
                  <Text numberOfLines={1} style={styles.lockedTitle}>
                    {item.title}
                  </Text>
                  <Text numberOfLines={2} style={styles.lockedDesc}>
                    {item.requirement}
                  </Text>
                </View>

                {/* Status Footer */}
                <View style={styles.lockedFooterRow}>
                  <View style={styles.lockedProgressPill}>
                    <Text style={styles.lockedProgressText}>
                      {item.progressText}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ─── Achievement Detail Modal ──────────────────────────── */}
      {selectedAchievement && (
        <Modal
          visible={!!selectedAchievement}
          transparent
          animationType="fade"
          onRequestClose={() => setSelectedAchievement(null)}
        >
          <View style={styles.modalOverlay}>
            <TouchableOpacity
              style={StyleSheet.absoluteFill}
              onPress={() => setSelectedAchievement(null)}
              activeOpacity={1}
            />

            <View style={styles.inspectCard}>
              {/* Badge Icon */}
              <View
                style={[
                  styles.inspectBadgeBox,
                  selectedAchievement.isEarned
                    ? styles.inspectBadgeBoxEarned
                    : styles.inspectBadgeBoxLocked,
                ]}
              >
                <Text style={styles.inspectBadgeIcon}>
                  {selectedAchievement.icon}
                </Text>
              </View>

              {/* Title & Category */}
              <Text style={styles.inspectTitle}>{selectedAchievement.title}</Text>
              <Text style={styles.inspectCategory}>
                {selectedAchievement.category} · {selectedAchievement.rarity.toUpperCase()}
              </Text>

              {/* Requirement & Description */}
              <View style={styles.inspectRequirementBox}>
                <Text style={styles.inspectRequirementLabel}>REQUIREMENT</Text>
                <Text style={styles.inspectRequirementText}>
                  {selectedAchievement.requirement}
                </Text>
              </View>

              <Text style={styles.inspectDesc}>
                {selectedAchievement.description}
              </Text>

              {/* Status Pill */}
              <View
                style={[
                  styles.inspectStatusPill,
                  selectedAchievement.isEarned
                    ? styles.inspectStatusPillEarned
                    : styles.inspectStatusPillLocked,
                ]}
              >
                <Text
                  style={[
                    styles.inspectStatusText,
                    selectedAchievement.isEarned
                      ? styles.inspectStatusTextEarned
                      : styles.inspectStatusTextLocked,
                  ]}
                >
                  {selectedAchievement.isEarned
                    ? '✓ MILESTONE UNLOCKED'
                    : `IN PROGRESS (${selectedAchievement.progressText})`}
                </Text>
              </View>

              {/* Close Button */}
              <TouchableOpacity
                style={styles.inspectCloseBtn}
                onPress={() => setSelectedAchievement(null)}
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
  sectionCounter: {
    fontFamily: typography.fontFamily.uiMedium,
    fontSize: 12,
    color: '#8A91A0',
  },
  counterGoldHighlight: {
    color: '#F3BA45',
    fontWeight: '700',
  },

  // ─── 2-Column Grid ───────────────────────────────────────────
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  cardCol: {
    width: '48.5%',
  },

  // ─── Earned Card ─────────────────────────────────────────────
  earnedCard: {
    backgroundColor: '#14171C',
    borderWidth: 1,
    borderColor: 'rgba(243, 186, 69, 0.35)',
    borderRadius: 14,
    padding: 12,
    gap: 8,
    position: 'relative',
    overflow: 'hidden',
    minHeight: 130,
    justifyContent: 'space-between',
    ...Platform.select({
      web: {
        boxShadow:
          '0 3px 14px rgba(0, 0, 0, 0.45), 0 0 8px rgba(243, 186, 69, 0.1)',
      },
      default: {
        shadowColor: '#F3BA45',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 2,
      },
    }),
  },
  cardFoilStrip: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 2,
  },
  earnedBadgeCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(243, 186, 69, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(243, 186, 69, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  earnedBadgeIcon: {
    fontSize: 14,
  },
  earnedRarityPill: {
    backgroundColor: '#0B0C0E',
    borderWidth: 1,
    borderColor: 'rgba(243, 186, 69, 0.25)',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1.5,
  },
  earnedRarityText: {
    fontFamily: typography.fontFamily.uiBold,
    fontSize: 7.5,
    color: '#F3BA45',
    letterSpacing: 0.5,
  },

  cardContent: {
    gap: 3,
    zIndex: 2,
  },
  earnedTitle: {
    fontFamily: typography.fontFamily.displayBold,
    fontSize: 12.5,
    fontWeight: '700',
    color: '#F5F6F8',
    letterSpacing: 0.3,
  },
  cardDesc: {
    fontFamily: typography.fontFamily.ui,
    fontSize: 10,
    color: '#8A91A0',
    lineHeight: 14,
  },
  earnedFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 2,
  },
  earnedStatusPill: {
    backgroundColor: 'rgba(243, 186, 69, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(243, 186, 69, 0.3)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  earnedStatusText: {
    fontFamily: typography.fontFamily.uiBold,
    fontSize: 8.5,
    color: '#F3BA45',
    letterSpacing: 0.5,
  },

  // ─── Locked Card (Recessed Pocket) ───────────────────────────
  lockedCard: {
    backgroundColor: '#14171C',
    borderWidth: 1,
    borderColor: '#262A33',
    borderRadius: 14,
    padding: 12,
    gap: 8,
    position: 'relative',
    overflow: 'hidden',
    minHeight: 130,
    justifyContent: 'space-between',
  },
  lockedPocketInner: {
    position: 'absolute',
    top: 2,
    left: 2,
    right: 2,
    bottom: 2,
    borderRadius: 12,
    backgroundColor: '#0F1115',
    ...Platform.select({
      web: {
        boxShadow: 'inset 0 2px 6px rgba(0, 0, 0, 0.65)',
      },
    }),
  },
  lockedBadgeCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#14171C',
    borderWidth: 1,
    borderColor: '#262A33',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  lockedRarityPill: {
    backgroundColor: '#14171C',
    borderWidth: 1,
    borderColor: '#262A33',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    zIndex: 2,
  },
  lockedRarityText: {
    fontFamily: typography.fontFamily.uiMedium,
    fontSize: 7.5,
    color: '#8A91A0',
    letterSpacing: 0.5,
  },
  lockedTitle: {
    fontFamily: typography.fontFamily.displayBold,
    fontSize: 12.5,
    fontWeight: '700',
    color: '#8A91A0',
    letterSpacing: 0.3,
  },
  lockedDesc: {
    fontFamily: typography.fontFamily.ui,
    fontSize: 10,
    color: '#555C68',
    lineHeight: 14,
  },
  lockedFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 2,
  },
  lockedProgressPill: {
    backgroundColor: '#14171C',
    borderWidth: 1,
    borderColor: '#262A33',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  lockedProgressText: {
    fontFamily: typography.fontFamily.uiMedium,
    fontSize: 8.5,
    color: '#8A91A0',
    letterSpacing: 0.4,
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
  inspectBadgeBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inspectBadgeBoxEarned: {
    backgroundColor: 'rgba(243, 186, 69, 0.15)',
    borderWidth: 2,
    borderColor: '#F3BA45',
  },
  inspectBadgeBoxLocked: {
    backgroundColor: '#0F1115',
    borderWidth: 1.5,
    borderColor: '#262A33',
  },
  inspectBadgeIcon: {
    fontSize: 30,
  },
  inspectTitle: {
    fontFamily: typography.fontFamily.displayBold,
    fontSize: 18,
    fontWeight: '700',
    color: '#F5F6F8',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  inspectCategory: {
    fontFamily: typography.fontFamily.uiBold,
    fontSize: 10,
    color: '#F3BA45',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  inspectRequirementBox: {
    width: '100%',
    backgroundColor: '#0F1115',
    borderWidth: 1,
    borderColor: '#262A33',
    borderRadius: 8,
    padding: 10,
    gap: 3,
  },
  inspectRequirementLabel: {
    fontFamily: typography.fontFamily.uiBold,
    fontSize: 8.5,
    color: '#8A91A0',
    letterSpacing: 0.8,
  },
  inspectRequirementText: {
    fontFamily: typography.fontFamily.uiMedium,
    fontSize: 11,
    color: '#F5F6F8',
    lineHeight: 16,
  },
  inspectDesc: {
    fontFamily: typography.fontFamily.ui,
    fontSize: 11.5,
    color: '#8A91A0',
    textAlign: 'center',
    lineHeight: 17,
  },
  inspectStatusPill: {
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
  },
  inspectStatusPillEarned: {
    backgroundColor: 'rgba(243, 186, 69, 0.15)',
    borderColor: '#F3BA45',
  },
  inspectStatusPillLocked: {
    backgroundColor: '#0F1115',
    borderColor: '#262A33',
  },
  inspectStatusText: {
    fontFamily: typography.fontFamily.uiBold,
    fontSize: 10,
    letterSpacing: 0.6,
  },
  inspectStatusTextEarned: {
    color: '#F3BA45',
  },
  inspectStatusTextLocked: {
    color: '#8A91A0',
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

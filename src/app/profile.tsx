import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppStore } from '../store/useAppStore';
import { spacing, typography, useTheme } from '../theme';
import { Text } from '../components/Text';
import { AtmosphericBackground } from '../components/AtmosphericBackground';
import { EditProfileModal } from '../components/EditProfileModal';
import { MissionCardRevealModal } from '../components/MissionCardRevealModal';
import { ZenAvatar } from '../components/ZenAvatar';
import { LockIcon } from '../components/ZenIcons';
import { getAllCatalogCards, MissionCardData } from '../utils/cardMapping';
import { calculateCurrentStreak } from '../utils/dates';
import { getCardProgression, STAGE_STYLES, CardStage } from '../utils/cardProgression';
import { RankProgressionSection } from '../components/RankProgressionSection';

// ─── CANONICAL CARD TIERS ────────────────────────────────────────
export interface ArmoryTierDefinition {
  stage: CardStage;
  label: string;
  title: string;
}

export const ARMORY_TIERS: ArmoryTierDefinition[] = [
  { stage: 'Beginner', label: 'BEGINNER', title: 'BEGINNER TIER' },
  { stage: 'Disciplined', label: 'DISCIPLINED', title: 'DISCIPLINED TIER' },
  { stage: 'Consistent', label: 'CONSISTENT', title: 'CONSISTENT TIER' },
  { stage: 'Unbreakable', label: 'UNBREAKABLE', title: 'UNBREAKABLE TIER' },
  { stage: 'Vajra', label: 'VAJRA', title: 'VAJRA TIER' },
];

export const CARD_TIER_ORDER: Record<CardStage, number> = {
  Beginner: 1,
  Disciplined: 2,
  Consistent: 3,
  Unbreakable: 4,
  Vajra: 5,
  Locked: 6,
};

export interface BinderCardItem {
  id: string;
  name: string;
  habit: string;
  image: any;
  stage: CardStage;
  unlocked: boolean;
  unlockRequirement: string;
  streak: number;
  rawCard: MissionCardData;
}

/**
 * Classifies a collectible card into one of the four canonical Vajra paths:
 * WARRIOR, SCHOLAR, MONK, or CREATOR based on existing archetype & vow data.
 */
export function getCardCategory(card: BinderCardItem): 'WARRIOR' | 'SCHOLAR' | 'MONK' | 'CREATOR' {
  const habit = (card.habit || '').toLowerCase().trim();
  const name = (card.name || '').toLowerCase().trim();
  const guardian = (card.rawCard?.guardian || '').toLowerCase().trim();
  const rawCat = (card.rawCard?.category || '').toUpperCase();

  // 1. Check custom vow explicit archetype if present
  if ((card.rawCard as any)?.archetype) {
    const arch = String((card.rawCard as any).archetype).toUpperCase();
    if (arch === 'WARRIOR') return 'WARRIOR';
    if (arch === 'SCHOLAR') return 'SCHOLAR';
    if (arch === 'MONK') return 'MONK';
    if (arch === 'CREATOR' || arch === 'FORGE' || arch === 'WANDERER') return 'CREATOR';
  }

  // 2. Creator checks (art, building, writing, creative output, deep work, shipping)
  if (
    guardian.includes('architect') ||
    guardian.includes('maker') ||
    habit.includes('write 500') ||
    habit.includes('artifact') ||
    habit.includes('instrument') ||
    habit.includes('ideas') ||
    habit.includes('deep work') ||
    habit.includes('inbox zero') ||
    habit.includes('plan tomorrow') ||
    habit.includes('start now') ||
    habit.includes('public speaking') ||
    name.includes('architect') ||
    name.includes('forge of words') ||
    name.includes('stone citadel') ||
    name.includes('first step')
  ) {
    return 'CREATOR';
  }

  // 3. Monk checks (mind, meditation, silence, breathwork, reflection, peace, digital fasting)
  if (
    guardian.includes('monk') ||
    guardian.includes('sage') ||
    guardian.includes('pilgrim') ||
    habit.includes('meditat') ||
    habit.includes('breathwork') ||
    habit.includes('silence') ||
    habit.includes('silent reflection') ||
    habit.includes('prayer') ||
    habit.includes('mantra') ||
    habit.includes('complaint') ||
    habit.includes('journal') ||
    habit.includes('stoic') ||
    habit.includes('forgive') ||
    habit.includes('gratitude') ||
    habit.includes('listening') ||
    habit.includes('quality time') ||
    habit.includes('kindness') ||
    habit.includes('anger') ||
    habit.includes('balance') ||
    habit.includes('social media') ||
    habit.includes('digital fast') ||
    habit.includes('screen time') ||
    habit.includes('porn') ||
    habit.includes('phone-free') ||
    name.includes('silent peak') ||
    name.includes('prana vessel') ||
    name.includes('iron will') ||
    name.includes('zen sanctuary') ||
    name.includes('radiant heart') ||
    name.includes('digital monk') ||
    name.includes('balanced soul')
  ) {
    return 'MONK';
  }

  // 4. Scholar checks (reading, studying, knowledge, documentation, learning, financial stewardship)
  if (
    guardian.includes('scholar') ||
    guardian.includes('wisdom') ||
    guardian.includes('chronicler') ||
    habit.includes('read') ||
    habit.includes('study') ||
    habit.includes('learn') ||
    habit.includes('audio') ||
    habit.includes('docs') ||
    habit.includes('single-tasking') ||
    habit.includes('expense') ||
    habit.includes('impulse') ||
    habit.includes('save') ||
    name.includes('endless library') ||
    name.includes('scholars-flame') ||
    name.includes('scholar') ||
    name.includes('golden vault') ||
    name.includes('silent blade')
  ) {
    return 'SCHOLAR';
  }

  // 5. Warrior checks (body, strength, workouts, pushups, runs, cold shower, fasting, hydration, steps, sleep)
  if (
    guardian.includes('warrior') ||
    guardian.includes('blacksmith') ||
    guardian.includes('sentinel') ||
    habit.includes('wake') ||
    habit.includes('workout') ||
    habit.includes('pushup') ||
    habit.includes('stretch') ||
    habit.includes('cold') ||
    habit.includes('fast until') ||
    habit.includes('running') ||
    habit.includes('steps') ||
    habit.includes('water') ||
    habit.includes('sugar') ||
    habit.includes('whole food') ||
    habit.includes('alcohol') ||
    habit.includes('sleep') ||
    habit.includes('eating out') ||
    name.includes("warrior's dawn") ||
    name.includes('iron temple') ||
    name.includes('iron pillar') ||
    name.includes('lotus willow') ||
    name.includes('glacial forge') ||
    name.includes('wind walker') ||
    name.includes('purifying flame') ||
    name.includes('pure harvest') ||
    name.includes('night guardian')
  ) {
    return 'WARRIOR';
  }

  // Fallback based on card category
  if (rawCat === 'BODY') return 'WARRIOR';
  if (rawCat === 'MIND') return 'MONK';
  if (rawCat === 'FOCUS') return 'CREATOR';

  return 'WARRIOR';
}

// ─── SUB-COMPONENTS ──────────────────────────────────────────────

interface ProfileHeaderProps {
  displayName: string;
  archetype: string;
  avatarUrl?: string | null;
  streak: number;
  recoveryShields: number;
  onEditPress: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  displayName,
  archetype,
  avatarUrl,
  streak,
  recoveryShields,
  onEditPress,
}) => {
  return (
    <View style={styles.headerContainer}>
      {/* Eyebrow: DISCIPLE RECORD */}
      <Text style={styles.headerSubtitle}>DISCIPLE RECORD</Text>

      {/* Avatar with gold border and restrained subtle golden back-glow */}
      <View style={styles.avatarSection}>
        <View style={styles.avatarGlowCircle} />
        <TouchableOpacity
          style={styles.avatarFrame}
          onPress={onEditPress}
          activeOpacity={0.88}
        >
          <ZenAvatar
            avatarUrl={avatarUrl}
            name={displayName}
            identityPath={archetype as any}
            size={96}
          />
        </TouchableOpacity>
      </View>

      {/* Main Title: ARJUNA · WARRIOR */}
      <Text style={styles.headerMainTitle}>
        {displayName.toUpperCase()} · {archetype.toUpperCase()}
      </Text>

      {/* Authoritative Single Streak & Shield Status Pill */}
      <View style={styles.covenantBannerPill}>
        <Text style={styles.covenantBannerText}>
          🔥 {streak}-DAY COVENANT · {recoveryShields} {recoveryShields === 1 ? 'SHIELD' : 'SHIELDS'} ACTIVE
        </Text>
      </View>
    </View>
  );
};

interface CollectionHeaderProps {
  unlockedCount: number;
  totalCount: number;
}

export const CollectionHeader: React.FC<CollectionHeaderProps> = ({
  unlockedCount,
  totalCount,
}) => {
  return (
    <View style={styles.collectionHeaderRow}>
      <Text style={styles.collectionHeaderTitle}>ARMORY OF VOWS</Text>
      <Text style={styles.collectionHeaderCounter}>
        <Text style={styles.counterGoldHighlight}>{unlockedCount}</Text> / {totalCount} ARTIFACTS FORGED
      </Text>
    </View>
  );
};

interface TierTabsNavProps {
  selectedTier: CardStage;
  onSelectTier: (stage: CardStage) => void;
  userStage: CardStage;
}

export const TierTabsNav: React.FC<TierTabsNavProps> = ({
  selectedTier,
  onSelectTier,
  userStage,
}) => {
  const userTierRank = CARD_TIER_ORDER[userStage] || 1;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.tierTabsContainer}
    >
      {ARMORY_TIERS.map((tier) => {
        const isSelected = selectedTier === tier.stage;
        const tierRank = CARD_TIER_ORDER[tier.stage];
        const isFuture = tierRank > userTierRank;
        const stageStyle = STAGE_STYLES[tier.stage] || STAGE_STYLES.Beginner;

        return (
          <TouchableOpacity
            key={tier.stage}
            style={[
              styles.tierTabPill,
              isSelected && styles.tierTabPillSelected,
              !isSelected && isFuture && styles.tierTabPillFuture,
            ]}
            onPress={() => onSelectTier(tier.stage)}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.tierTabDot,
                {
                  backgroundColor: isSelected
                    ? '#F3BA45'
                    : isFuture
                    ? 'rgba(138, 145, 160, 0.35)'
                    : stageStyle.borderColor,
                },
              ]}
            />
            <Text
              style={[
                styles.tierTabText,
                isSelected && styles.tierTabTextSelected,
                !isSelected && isFuture && styles.tierTabTextFuture,
              ]}
            >
              {tier.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};



interface UnlockedCollectionCardProps {
  card: BinderCardItem;
  onPress: () => void;
}

export const UnlockedCollectionCard: React.FC<UnlockedCollectionCardProps> = ({
  card,
  onPress,
}) => {
  const stageStyle = STAGE_STYLES[card.stage] || STAGE_STYLES.Beginner;
  const cardTierLabel = card.stage.toUpperCase();

  return (
    <TouchableOpacity
      style={styles.cardSlotContainer}
      onPress={onPress}
      activeOpacity={0.88}
    >
      <View
        style={[
          styles.unlockedCardFrame,
          { borderColor: stageStyle.borderColor },
        ]}
      >
        {/* Card Artwork */}
        <Image source={card.image} style={styles.cardArtworkImage} resizeMode="cover" />

        {/* Top Metallic Foil Strip */}
        <LinearGradient
          colors={stageStyle.foilGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.cardFoilStrip}
        />

        {/* Card Progression Tier Stamp in Top Right */}
        <View style={styles.cardTopBar}>
          <View
            style={[
              styles.cardTierStamp,
              {
                borderColor: stageStyle.borderColor,
                backgroundColor: stageStyle.badgeBg,
              },
            ]}
          >
            <Text numberOfLines={1} style={[styles.cardTierStampText, { color: stageStyle.textColor }]}>
              {cardTierLabel}
            </Text>
          </View>
        </View>

        {/* Bottom Title Backdrop */}
        <LinearGradient
          colors={['transparent', 'rgba(11, 12, 14, 0.85)', '#0B0C0E']}
          style={styles.cardFooterGradient}
        >
          <Text numberOfLines={1} style={styles.cardTitleText}>
            {card.name}
          </Text>
          <Text style={styles.cardForgedLabel}>✓ FORGED</Text>
        </LinearGradient>
      </View>
    </TouchableOpacity>
  );
};

interface LockedCardSlotProps {
  card: BinderCardItem;
}

export const LockedCardSlot: React.FC<LockedCardSlotProps> = ({ card }) => {
  return (
    <View style={styles.cardSlotContainer}>
      <View style={styles.lockedPocketFrame}>
        {/* Recessed physical inner pocket */}
        <View style={styles.lockedPocketInner} />

        {/* Understated padlock in recessed circle */}
        <View style={styles.embossedLockCircle}>
          <LockIcon size={16} color="#8A91A0" />
        </View>

        {/* Existing unlock requirement */}
        <Text style={styles.lockedRequirementText}>
          UNLOCK AT {card.unlockRequirement}
        </Text>
      </View>
    </View>
  );
};

// ─── MAIN PROFILE SCREEN ─────────────────────────────────────────

export default function ProfileScreen() {
  const { colors: activeColors } = useTheme();
  const { user, activeVows, vowHistoryDates, vowHighestStreak, celebratedCardUnlocks } = useAppStore();

  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedModalCard, setSelectedModalCard] = useState<{
    vowName: string;
    streak: number;
  } | null>(null);

  if (!user) return null;

  // Calculate highest streak across active vows
  let highestStreak = 0;
  activeVows.forEach((v) => {
    const dates = vowHistoryDates[v.id] || [];
    const cur = calculateCurrentStreak(dates);
    const historical = (vowHighestStreak && vowHighestStreak[v.id]) || 0;
    const vowMax = Math.max(cur, historical);
    if (vowMax > highestStreak) highestStreak = vowMax;
  });

  // User's canonical progression stage from existing getCardProgression system
  const userProgression = getCardProgression(highestStreak);

  // User Vow streak mapping
  const vowStreakMap: Record<string, number> = {};
  activeVows.forEach((v) => {
    const dates = vowHistoryDates[v.id] || [];
    const cur = calculateCurrentStreak(dates);
    const historical = (vowHighestStreak && vowHighestStreak[v.id]) || 0;
    const vowMax = Math.max(cur, historical);
    if (v.custom_name) {
      vowStreakMap[v.custom_name.toLowerCase().trim()] = vowMax;
    }
  });

  // Build the catalog binder data model using existing card stages and unlock requirements
  const catalogCards = getAllCatalogCards();

  const binderCards = useMemo<BinderCardItem[]>(() => {
    const rawItems: BinderCardItem[] = catalogCards.map((card, idx) => {
      const lowerHabit = (card.habit || '').toLowerCase().trim();
      const stage: CardStage = card.targetStage || 'Beginner';
      const requiredDays = card.requiredDays || 7;
      const req = `${requiredDays}D`;

      // Streak from active vows
      const streak = vowStreakMap[lowerHabit] || 0;

      // Card is unlocked if user achieved streak >= requiredDays for this card or was forged
      const isUnlocked = streak >= requiredDays || (celebratedCardUnlocks ? celebratedCardUnlocks.includes(lowerHabit) : false);

      return {
        id: `card-${idx + 1}`,
        name: card.title,
        habit: card.habit,
        image: card.image,
        stage,
        unlocked: isUnlocked,
        unlockRequirement: req,
        streak,
        rawCard: card,
      };
    });

    // Stably order cards according to canonical card tier progression order:
    // BEGINNER cards -> DISCIPLINED cards -> CONSISTENT cards -> UNBREAKABLE cards -> VAJRA cards
    return rawItems.sort((a, b) => {
      const orderA = CARD_TIER_ORDER[a.stage] || 99;
      const orderB = CARD_TIER_ORDER[b.stage] || 99;
      return orderA - orderB;
    });
  }, [catalogCards, celebratedCardUnlocks, vowStreakMap]);

  // Counts
  const unlockedCount = binderCards.filter((c) => c.unlocked).length;
  const totalCount = binderCards.length;

  // Selected tier tab in Armory (Beginner by default)
  const [selectedTier, setSelectedTier] = useState<CardStage>('Beginner');

  // Active tier definition & cards belonging ONLY to the selected tier
  const activeTierDef = useMemo(() => {
    return ARMORY_TIERS.find((t) => t.stage === selectedTier) || ARMORY_TIERS[0];
  }, [selectedTier]);

  const activeTierCards = useMemo(() => {
    return binderCards.filter((c) => c.stage === selectedTier);
  }, [binderCards, selectedTier]);

  const activeTierUnlockedCount = activeTierCards.filter((c) => c.unlocked).length;
  const activeTierTotalCount = activeTierCards.length;

  return (
    <View style={[styles.container, { backgroundColor: activeColors.bg.primary }]}>
      <AtmosphericBackground />

      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ─── 1. SECTION ONE: IDENTITY ────────────────────────── */}
          <ProfileHeader
            displayName={user.display_name}
            archetype={user.identity_path}
            avatarUrl={user.avatar_url}
            streak={highestStreak}
            recoveryShields={user.recovery_shields || 2}
            onEditPress={() => setShowEditModal(true)}
          />

          {/* ─── 2. SECTION TWO: RANK EVOLUTION ──────────────────── */}
          <RankProgressionSection
            currentStreak={highestStreak}
            userProgression={userProgression}
          />

          {/* ─── 3. SECTION THREE: ARMORY OF VOWS ────────────────── */}
          <View style={styles.armorySection}>
            {/* Armory Header with dynamic master counts */}
            <CollectionHeader
              unlockedCount={unlockedCount}
              totalCount={totalCount}
            />

            {/* Single Horizontal Selectable Tier Navigation */}
            <TierTabsNav
              selectedTier={selectedTier}
              onSelectTier={setSelectedTier}
              userStage={userProgression.stage}
            />

            {/* Selected Tier Header with Live Dynamic Counter */}
            <View style={styles.selectedTierHeaderRow}>
              <View style={styles.tierHeaderTitleWrapper}>
                <View
                  style={[
                    styles.tierIndicatorDot,
                    {
                      backgroundColor:
                        (STAGE_STYLES[selectedTier] || STAGE_STYLES.Beginner).borderColor,
                    },
                  ]}
                />
                <Text
                  style={[
                    styles.tierSectionTitle,
                    {
                      color:
                        (STAGE_STYLES[selectedTier] || STAGE_STYLES.Beginner).textColor,
                    },
                  ]}
                >
                  {activeTierDef.title}
                </Text>
              </View>
              <Text style={styles.tierCounterText}>
                <Text
                  style={[
                    styles.tierCounterHighlight,
                    {
                      color:
                        (STAGE_STYLES[selectedTier] || STAGE_STYLES.Beginner).textColor,
                    },
                  ]}
                >
                  {activeTierUnlockedCount}
                </Text>
                {' / ' + activeTierTotalCount}
              </Text>
            </View>

            {/* 3-Column Card Binder Grid: displays ONLY the selected tier's cards */}
            <View style={styles.cardBinderGrid}>
              {activeTierCards.map((card) =>
                card.unlocked ? (
                  <UnlockedCollectionCard
                    key={card.id}
                    card={card}
                    onPress={() =>
                      setSelectedModalCard({
                        vowName: card.habit,
                        streak: card.streak,
                      })
                    }
                  />
                ) : (
                  <LockedCardSlot key={card.id} card={card} />
                )
              )}
            </View>
          </View>
        </ScrollView>

        {/* Edit Profile Modal */}
        <EditProfileModal
          visible={showEditModal}
          onClose={() => setShowEditModal(false)}
        />

        {/* Card Detail Modal */}
        {selectedModalCard && (
          <MissionCardRevealModal
            visible={!!selectedModalCard}
            onClose={() => setSelectedModalCard(null)}
            customStreak={selectedModalCard.streak}
            vowName={selectedModalCard.vowName}
            mode="view"
          />
        )}
      </SafeAreaView>
    </View>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0C0E',
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 12 : 20,
    paddingBottom: 120,
    gap: 22,
  },

  // ─── 1. Identity Section ───────────────────────────────────────
  headerContainer: {
    alignItems: 'center',
    gap: 8,
    paddingTop: 4,
  },
  headerSubtitle: {
    fontFamily: typography.fontFamily.display,
    fontSize: 11,
    color: '#8A91A0',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  avatarSection: {
    position: 'relative',
    marginTop: 6,
    marginBottom: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarGlowCircle: {
    position: 'absolute',
    width: 108,
    height: 108,
    borderRadius: 54,
    backgroundColor: 'rgba(243, 186, 69, 0.12)',
    ...Platform.select({
      web: {
        filter: 'blur(14px)',
      },
      default: {
        shadowColor: '#F3BA45',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.25,
        shadowRadius: 14,
      },
    }),
  },
  avatarFrame: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    borderColor: '#F3BA45',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#14171C',
    overflow: 'hidden',
  },
  headerMainTitle: {
    fontFamily: typography.fontFamily.displayBold,
    fontSize: 22,
    fontWeight: '700',
    color: '#F5F6F8',
    letterSpacing: 0.8,
    textAlign: 'center',
  },
  covenantBannerPill: {
    backgroundColor: '#14171C',
    borderWidth: 1,
    borderColor: 'rgba(243, 186, 69, 0.35)',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginTop: 2,
  },
  covenantBannerText: {
    fontFamily: typography.fontFamily.uiBold,
    fontSize: 11,
    fontWeight: '700',
    color: '#F3BA45',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },

  // ─── 3. Armory of Vows & Card Binder ───────────────────────────
  armorySection: {
    gap: 12,
  },
  collectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  collectionHeaderTitle: {
    fontFamily: typography.fontFamily.displayBold,
    fontSize: 17,
    fontWeight: '700',
    color: '#F5F6F8',
    letterSpacing: 0.8,
  },
  collectionHeaderCounter: {
    fontFamily: typography.fontFamily.uiMedium,
    fontSize: 12,
    color: '#8A91A0',
  },
  counterGoldHighlight: {
    color: '#F3BA45',
    fontWeight: '700',
  },

  // Tier Navigation Tabs
  tierTabsContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 3,
    paddingHorizontal: 2,
  },
  tierTabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#14171C',
    borderWidth: 1,
    borderColor: '#262A33',
  },
  tierTabPillSelected: {
    backgroundColor: 'rgba(243, 186, 69, 0.12)',
    borderColor: '#F3BA45',
    ...Platform.select({
      web: {
        boxShadow:
          '0 2px 8px rgba(243, 186, 69, 0.25), inset 0 0 12px rgba(243, 186, 69, 0.08)',
      },
      default: {
        shadowColor: '#F3BA45',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 2,
      },
    }),
  },
  tierTabPillFuture: {
    opacity: 0.65,
    backgroundColor: '#0F1115',
    borderColor: 'rgba(38, 42, 51, 0.6)',
  },
  tierTabDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  tierTabText: {
    fontFamily: typography.fontFamily.uiSemiBold,
    fontSize: 10.5,
    fontWeight: '600',
    color: '#8A91A0',
    letterSpacing: 0.8,
  },
  tierTabTextSelected: {
    fontFamily: typography.fontFamily.uiBold,
    color: '#F3BA45',
    fontWeight: '700',
  },
  tierTabTextFuture: {
    color: '#5A6170',
  },

  selectedTierHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    marginBottom: 4,
    paddingHorizontal: 2,
  },
  tierHeaderTitleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tierIndicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  tierSectionTitle: {
    fontFamily: typography.fontFamily.uiBold,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  tierCounterText: {
    fontFamily: typography.fontFamily.uiMedium,
    fontSize: 10,
    fontWeight: '500',
    color: '#8A91A0',
    letterSpacing: 0.5,
  },
  tierCounterHighlight: {
    fontFamily: typography.fontFamily.uiBold,
    fontWeight: '700',
  },

  // 3-Column TCG Binder Grid
  cardBinderGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 4,
  },
  cardSlotContainer: {
    width: '31.3%',
    aspectRatio: 0.70,
  },

  // Unlocked Card
  unlockedCardFrame: {
    flex: 1,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#14171C',
    borderWidth: 1,
    borderColor: 'rgba(243, 186, 69, 0.45)',
    position: 'relative',
    ...Platform.select({
      web: {
        boxShadow:
          '0 4px 14px rgba(0, 0, 0, 0.6), 0 0 10px rgba(243, 186, 69, 0.18)',
      },
      default: {
        shadowColor: '#F3BA45',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 5,
        elevation: 3,
      },
    }),
  },
  cardArtworkImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  cardFoilStrip: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2.5,
    zIndex: 3,
  },
  cardTopBar: {
    position: 'absolute',
    top: 5,
    right: 5,
    zIndex: 4,
  },
  cardTierStamp: {
    backgroundColor: 'rgba(11, 12, 14, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(243, 186, 69, 0.4)',
    borderRadius: 4,
    paddingHorizontal: 4.5,
    paddingVertical: 1.5,
  },
  cardTierStampText: {
    fontFamily: typography.fontFamily.uiBold,
    fontSize: 7,
    fontWeight: '700',
    color: '#F3BA45',
    letterSpacing: 0.3,
  },
  cardFooterGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 18,
    paddingBottom: 6,
    paddingHorizontal: 5,
    alignItems: 'center',
    zIndex: 2,
  },
  cardTitleText: {
    fontFamily: typography.fontFamily.uiBold,
    fontSize: 9.5,
    fontWeight: '700',
    color: '#F5F6F8',
    textAlign: 'center',
    width: '100%',
  },
  cardForgedLabel: {
    fontFamily: typography.fontFamily.uiBold,
    fontSize: 7.5,
    fontWeight: '700',
    color: '#F3BA45',
    letterSpacing: 0.5,
    marginTop: 1,
  },

  // Locked Card Slot (Recessed Physical Binder Pocket)
  lockedPocketFrame: {
    flex: 1,
    borderRadius: 10,
    backgroundColor: '#14171C',
    borderWidth: 1,
    borderColor: '#262A33',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
    position: 'relative',
    overflow: 'hidden',
  },
  lockedPocketInner: {
    position: 'absolute',
    top: 2,
    left: 2,
    right: 2,
    bottom: 2,
    borderRadius: 8,
    backgroundColor: '#0F1115',
    ...Platform.select({
      web: {
        boxShadow: 'inset 0 2px 6px rgba(0, 0, 0, 0.65)',
      },
    }),
  },
  embossedLockCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(243, 186, 69, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(243, 186, 69, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    zIndex: 2,
    ...Platform.select({
      web: {
        boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.5)',
      },
    }),
  },
  lockedRequirementText: {
    fontFamily: typography.fontFamily.uiMedium,
    fontSize: 9,
    fontWeight: '500',
    color: '#8A91A0',
    letterSpacing: 1,
    textAlign: 'center',
    textTransform: 'uppercase',
    zIndex: 2,
  },
});

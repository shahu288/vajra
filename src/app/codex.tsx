import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  useWindowDimensions,
  Platform,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAppStore } from '../store/useAppStore';
import { useTheme, typography, spacing } from '../theme';
import { Text } from '../components/Text';
import { AtmosphericBackground } from '../components/AtmosphericBackground';
import { 
  getCompleteVowCatalog, 
  VowCatalogEntry, 
  getMissionCardData, 
  MissionCardData 
} from '../utils/cardMapping';
import { calculateCurrentStreak } from '../utils/dates';
import { getCardProgression, CardStage } from '../utils/cardProgression';

export type VowHallCategory = 'ALL' | 'BODY' | 'MIND' | 'FOCUS';

const DISCIPLINE_STAGES: { stage: CardStage; days: number; label: string }[] = [
  { stage: 'Beginner', days: 7, label: 'BEGINNER' },
  { stage: 'Disciplined', days: 30, label: 'DISCIPLINED' },
  { stage: 'Consistent', days: 90, label: 'CONSISTENT' },
  { stage: 'Unbreakable', days: 180, label: 'UNBREAKABLE' },
  { stage: 'Vajra', days: 365, label: 'VAJRA' },
];

export default function VowHallScreen() {
  const router = useRouter();
  const { colors: activeColors } = useTheme();
  const { activeVows, customVows, vowHistoryDates, addActiveVow, swapActiveVow, createCustomVow, deleteCustomVow } = useAppStore();
  const { width: windowWidth } = useWindowDimensions();
  const isSmallScreen = windowWidth < 380;

  const [activeCategory, setActiveCategory] = useState<VowHallCategory>('ALL');
  const [selectedVow, setSelectedVow] = useState<VowCatalogEntry | null>(null);

  // Custom Vow Creation State
  const [isCustomVowOpen, setIsCustomVowOpen] = useState(false);
  const [customVowName, setCustomVowName] = useState('');
  const [customVowDesc, setCustomVowDesc] = useState('');

  // Replacement Flow State
  const [replacingWithVow, setReplacingWithVow] = useState<VowCatalogEntry | null>(null);
  const [selectedOldVowId, setSelectedOldVowId] = useState<string>(activeVows[0]?.id || '');
  const [showReplaceModal, setShowReplaceModal] = useState(false);

  // Active vow names list (lowercased)
  const activeVowNames = activeVows.map(v => v.custom_name?.toLowerCase() || '');
  const isDeckFull = activeVows.length >= 3;

  // Master catalog of all existing vows (official + user forged)
  const allVows = getCompleteVowCatalog();

  const customVowsList = allVows.filter(v => v.isCustom);
  const officialVowsList = allVows.filter(v => !v.isCustom);

  // Create Custom Vow from Change Vow (max 3)
  const handleCreateCustomVowFromCodex = () => {
    const cleanHabit = customVowName.trim();
    if (!cleanHabit) return;

    if (customVowsList.length >= 3) {
      Alert.alert('Limit Reached', 'You can have up to 3 custom vows at the same time.');
      return;
    }

    if (customVowsList.some(cv => cv.habit.toLowerCase() === cleanHabit.toLowerCase())) {
      Alert.alert('Duplicate Vow', 'A custom vow with this name already exists.');
      return;
    }

    createCustomVow({
      habit: cleanHabit,
      commitment: customVowDesc.trim() || cleanHabit,
    });

    setCustomVowName('');
    setCustomVowDesc('');
    setIsCustomVowOpen(false);
  };

  const filteredCustomVows = customVowsList.filter(vow => {
    if (activeCategory === 'ALL') return true;
    return vow.category === activeCategory;
  });

  const filteredOfficialVows = officialVowsList.filter(vow => {
    if (activeCategory === 'ALL') return true;
    return vow.category === activeCategory;
  });

  // Calculate streaks map
  const demoStreaks: Record<string, number> = {
    'wake before 6 am': 12,
    'read 30 mins': 14,
    'workout 45 min': 42,
    'running 5km': 35,
    'no social media': 98,
    'cold shower': 110,
    'no porn': 200,
  };

  const getVowStreak = (habitName: string) => {
    const key = habitName.toLowerCase();
    const activeMatch = activeVows.find(v => (v.custom_name || '').toLowerCase() === key);
    if (activeMatch && vowHistoryDates[activeMatch.id]) {
      return calculateCurrentStreak(vowHistoryDates[activeMatch.id]);
    }
    return demoStreaks[key] || 0;
  };

  // Primary Action Button Pressed in Card Detail
  const handlePrimaryAction = (vow: VowCatalogEntry) => {
    if (activeVowNames.includes(vow.habit.toLowerCase())) {
      return;
    }

    if (isDeckFull) {
      // Transition immediately to the Replace a Vow flow
      setSelectedVow(null);
      setReplacingWithVow(vow);
      setSelectedOldVowId(activeVows[0]?.id || '');
      setShowReplaceModal(true);
    } else {
      // Direct add
      addActiveVow(vow.habit, vow.difficulty);
      setSelectedVow(null);
      router.push('/');
    }
  };

  // Confirm Replacement
  const handleConfirmReplacement = () => {
    if (!replacingWithVow || !selectedOldVowId) return;
    swapActiveVow(selectedOldVowId, replacingWithVow.habit, replacingWithVow.difficulty);
    setShowReplaceModal(false);
    setReplacingWithVow(null);
    router.push('/');
  };

  // Category counts for quick header feedback
  const categoryCounts = {
    ALL: allVows.length,
    BODY: allVows.filter(v => v.category === 'BODY').length,
    MIND: allVows.filter(v => v.category === 'MIND').length,
    FOCUS: allVows.filter(v => v.category === 'FOCUS').length,
  };

  // Render an individual collectible card
  const renderVowCard = (vowItem: VowCatalogEntry) => {
    const { card, habit, category, shortDesc } = vowItem;
    const streak = getVowStreak(habit);
    const progression = getCardProgression(streak);
    const isCurrentlyActive = activeVowNames.includes(habit.toLowerCase());
    const isCollected = progression.isUnlocked;

    return (
      <TouchableOpacity
        key={vowItem.id}
        style={[
          styles.cardFrame,
          isSmallScreen ? styles.cardColSmall : styles.cardColDefault,
          isCurrentlyActive && styles.cardFrameActive,
          isCollected && { borderColor: progression.style.borderColor },
        ]}
        onPress={() => setSelectedVow(vowItem)}
        activeOpacity={0.88}
      >
        {/* Visual State 1: ACTIVE */}
        {isCurrentlyActive ? (
          <>
            <Image source={card.image} style={styles.cardArtImage} resizeMode="cover" />
            <LinearGradient
              colors={['rgba(201, 154, 90, 0.35)', 'transparent']}
              style={styles.cardTopShine}
            />
            <View style={styles.activeBadgeTop}>
              <Text style={styles.activeBadgeText}>ACTIVE</Text>
            </View>
            <View style={styles.cardCategoryBadge}>
              <Text style={styles.cardCategoryText}>{category}</Text>
            </View>
            {(vowItem.isCustom || card.isCustom) && (
              <View style={styles.cardForgedBadgeTop}>
                <Text style={styles.cardForgedBadgeTopText}>✦ FORGED</Text>
              </View>
            )}
            <LinearGradient
              colors={['transparent', 'rgba(10, 10, 13, 0.75)', 'rgba(10, 10, 13, 0.98)']}
              style={styles.cardFooter}
            >
              <Text numberOfLines={1} style={styles.cardTitle}>{card.title}</Text>
              <Text numberOfLines={1} style={styles.cardHabitName}>{habit}</Text>
              <Text numberOfLines={2} style={styles.cardShortDescText}>{shortDesc}</Text>
              <View style={styles.evolutionStrip}>
                <Text numberOfLines={1} style={styles.evolutionText}>
                  {progression.stageName.toUpperCase()} • {streak}D STREAK
                </Text>
              </View>
            </LinearGradient>
          </>
        ) : isCollected ? (
          /* Visual State 2: COLLECTED */
          <>
            <Image source={card.image} style={styles.cardArtImage} resizeMode="cover" />
            {progression.style.foilGradient && (
              <LinearGradient
                colors={progression.style.foilGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.foilHeaderStrip}
              />
            )}
            <View style={styles.collectedBadgeTop}>
              <Text style={styles.collectedBadgeText}>COLLECTED ✓</Text>
            </View>
            <View style={styles.cardCategoryBadge}>
              <Text style={styles.cardCategoryText}>{category}</Text>
            </View>
            {(vowItem.isCustom || card.isCustom) && (
              <View style={styles.cardForgedBadgeTop}>
                <Text style={styles.cardForgedBadgeTopText}>✦ FORGED</Text>
              </View>
            )}
            <LinearGradient
              colors={['transparent', 'rgba(10, 10, 13, 0.75)', 'rgba(10, 10, 13, 0.98)']}
              style={styles.cardFooter}
            >
              <Text numberOfLines={1} style={styles.cardTitle}>{card.title}</Text>
              <Text numberOfLines={1} style={styles.cardHabitName}>{habit}</Text>
              <Text numberOfLines={2} style={styles.cardShortDescText}>{shortDesc}</Text>
              <View style={styles.evolutionStrip}>
                <Text numberOfLines={1} style={styles.evolutionText}>
                  {progression.stageName.toUpperCase()} • {streak}D STREAK
                </Text>
              </View>
            </LinearGradient>
          </>
        ) : (
          /* Visual State 3: AVAILABLE / NOT YET EARNED */
          <View style={styles.lockedSilhouetteFrame}>
            <Image source={card.image} style={styles.silhouetteFaintArt} resizeMode="cover" />
            <View style={styles.silhouetteMask} />
            
            <View style={styles.cardCategoryBadge}>
              <Text style={styles.cardCategoryText}>{category}</Text>
            </View>
            {(vowItem.isCustom || card.isCustom) && (
              <View style={styles.cardForgedBadgeTop}>
                <Text style={styles.cardForgedBadgeTopText}>✦ FORGED</Text>
              </View>
            )}

            {/* Center Rune & Preview */}
            <View style={styles.lockedCenter}>
              <View style={styles.runeCircle}>
                <Text style={styles.runeGlyph}>◇</Text>
              </View>
              <Text numberOfLines={1} style={styles.previewTitleText}>{card.title.toUpperCase()}</Text>
              <Text style={styles.milestoneRequirementText}>
                {card.targetStage?.toUpperCase() || 'BEGINNER'} ({card.requiredDays || 7}D)
              </Text>
            </View>

            <LinearGradient
              colors={['transparent', 'rgba(10, 10, 13, 0.85)', '#0D0D10']}
              style={styles.cardFooter}
            >
              <Text numberOfLines={1} style={styles.cardHabitNameFaint}>{habit}</Text>
              <Text numberOfLines={2} style={styles.cardShortDescTextFaint}>{shortDesc}</Text>
              <View style={styles.evolutionStrip}>
                <Text numberOfLines={1} style={styles.evolutionTextFaint}>
                  TARGET: {card.targetStage?.toUpperCase() || 'BEGINNER'}
                </Text>
              </View>
            </LinearGradient>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: activeColors.bg.primary }]}>
      <AtmosphericBackground />

      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {/* Top Header Navigation */}
        <View style={styles.topHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.push('/')}
            activeOpacity={0.8}
          >
            <Text style={styles.backButtonText}>← HOME</Text>
          </TouchableOpacity>

          <View style={styles.activeDeckBadge}>
            <Text style={styles.activeDeckBadgeText}>
              {activeVows.length} / 3 ACTIVE DECK
            </Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Vow Hall Editorial Hero */}
          <View style={styles.heroSection}>
            <Text style={styles.heroPreTitle}>THE SANCTUARY ARCHIVE</Text>
            <Text style={styles.heroTitle}>VOW HALL</Text>
            <Text style={styles.heroSubtitle}>
              Choose the discipline you wish to forge. Every vow begins a collectible progression.
            </Text>
          </View>

          {/* Category Filter Chips */}
          <View style={styles.categoryRow}>
            {(['ALL', 'BODY', 'MIND', 'FOCUS'] as VowHallCategory[]).map(cat => {
              const isSelected = activeCategory === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryTab,
                    isSelected && styles.categoryTabActive,
                  ]}
                  onPress={() => setActiveCategory(cat)}
                  activeOpacity={0.85}
                >
                  <Text
                    style={[
                      styles.categoryTabText,
                      isSelected && styles.categoryTabTextActive,
                    ]}
                  >
                    {cat} ({categoryCounts[cat]})
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* ─── YOUR CUSTOM VOWS SECTION ─── */}
          {(activeCategory === 'ALL' || filteredCustomVows.length > 0) && (
            <View style={styles.catalogSectionGroup}>
              <View style={styles.catalogSectionHeader}>
                <Text style={styles.catalogSectionTitle}>
                  {customVowsList.length > 1 ? 'YOUR CUSTOM VOWS' : 'YOUR CUSTOM VOW'}
                </Text>
                <View style={styles.forgedTagPill}>
                  <Text style={styles.forgedTagPillText}>
                    {customVowsList.length > 0
                      ? `✦ FORGED BY YOU (${customVowsList.length}/3)`
                      : '✦ CUSTOM DISCIPLINE'}
                  </Text>
                </View>
              </View>

              {/* Existing custom vows (0, 1, 2, or 3) */}
              {filteredCustomVows.length > 0 && (
                <View style={styles.cardGrid}>
                  {filteredCustomVows.map(renderVowCard)}
                </View>
              )}

              {/* Explicit option to create another custom vow:
                  - 0 custom vows -> show + ADD CUSTOM VOW
                  - 1 custom vow -> show existing vow + + ADD CUSTOM VOW
                  - 2 custom vows -> show both vows + + ADD CUSTOM VOW
                  - 3 custom vows -> show all 3 and do not show add option
              */}
              {customVowsList.length < 3 && (
                <View style={[styles.customVowAddBox, filteredCustomVows.length > 0 && { marginTop: 14 }]}>
                  {!isCustomVowOpen ? (
                    <TouchableOpacity
                      style={styles.openCustomBtn}
                      onPress={() => setIsCustomVowOpen(true)}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.openCustomBtnText}>+ ADD CUSTOM VOW</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.customFormBox}>
                      <Text style={styles.customFormTitle}>MY VOW</Text>
                      <TextInput
                        style={styles.customInput}
                        placeholder="Read 20 pages every night"
                        placeholderTextColor="#78736A"
                        value={customVowName}
                        onChangeText={setCustomVowName}
                        maxLength={40}
                        autoFocus
                      />
                      <TextInput
                        style={[styles.customInput, { marginTop: 8 }]}
                        placeholder="Short description (optional)..."
                        placeholderTextColor="#78736A"
                        value={customVowDesc}
                        onChangeText={setCustomVowDesc}
                        maxLength={60}
                      />
                      <View style={styles.customFormActionRow}>
                        <TouchableOpacity
                          style={styles.saveCustomBtn}
                          onPress={handleCreateCustomVowFromCodex}
                          activeOpacity={0.85}
                        >
                          <Text style={styles.saveCustomBtnText}>SAVE COMMITMENT</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.cancelCustomBtn}
                          onPress={() => {
                            setIsCustomVowOpen(false);
                            setCustomVowName('');
                            setCustomVowDesc('');
                          }}
                          activeOpacity={0.85}
                        >
                          <Text style={styles.cancelCustomBtnText}>Cancel</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>
              )}
            </View>
          )}

          {/* AVAILABLE VOWS SECTION */}
          <View style={[styles.catalogSectionHeader, { marginTop: 24 }]}>
            <Text style={styles.catalogSectionTitle}>
              {activeCategory === 'ALL' ? 'AVAILABLE VOWS' : `AVAILABLE ${activeCategory} VOWS`}
            </Text>
            <Text style={styles.catalogSectionCount}>{filteredOfficialVows.length} DISCIPLINE CARDS</Text>
          </View>

          <View style={styles.cardGrid}>
            {filteredOfficialVows.map(renderVowCard)}
          </View>
        </ScrollView>

        {/* ─── CARD DETAIL / INSPECT MODAL ───────────────────────── */}
        {selectedVow && (
          <Modal
            visible={!!selectedVow}
            transparent
            animationType="fade"
            onRequestClose={() => setSelectedVow(null)}
          >
            <View style={styles.modalBackdrop}>
              <View style={styles.inspectModalCard}>
                {/* Close Button */}
                <TouchableOpacity
                  style={styles.modalCloseBtn}
                  onPress={() => setSelectedVow(null)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.modalCloseText}>✕</Text>
                </TouchableOpacity>

                <ScrollView showsVerticalScrollIndicator={false}>
                  {/* Card Physical Preview Frame */}
                  <View style={styles.modalCardPreviewFrame}>
                    <Image source={selectedVow.card.image} style={styles.modalCardArt} resizeMode="cover" />
                    <LinearGradient
                      colors={['transparent', 'rgba(13, 13, 16, 0.92)']}
                      style={StyleSheet.absoluteFill}
                    />
                    <View style={styles.modalCardTopRow}>
                      <View style={styles.modalTopBadgesRow}>
                        <View style={styles.categoryPillModal}>
                          <Text style={styles.categoryPillModalText}>
                            {selectedVow.category}
                          </Text>
                        </View>
                        {(selectedVow.isCustom || selectedVow.card.isCustom) && (
                          <View style={styles.modalForgedPill}>
                            <Text style={styles.modalForgedPillText}>✦ FORGED BY YOU</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.modalCardGuardian}>GUARDIAN: {selectedVow.card.guardian.toUpperCase()}</Text>
                    </View>

                    <View style={styles.modalPreviewBottom}>
                      <Text style={styles.modalCardTitle}>{selectedVow.card.title}</Text>
                      <Text style={styles.modalCardHabit}>{selectedVow.habit}</Text>
                    </View>
                  </View>

                  {/* Lore Quote */}
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionLabel}>LORE & IDENTITY</Text>
                    <Text style={styles.modalLoreQuote}>"{selectedVow.card.quote}"</Text>
                  </View>

                  {/* The Vow Commitment Rule */}
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionLabel}>THE VOW</Text>
                    <View style={styles.vowRuleBox}>
                      <Text style={styles.vowRuleTitle}>{selectedVow.habit}</Text>
                      <Text style={styles.vowRuleDesc}>
                        {selectedVow.rule}
                      </Text>
                    </View>
                  </View>

                  {/* Discipline Path (Exact 5-Stage Vajra Hierarchy) */}
                  <View style={styles.modalSection}>
                    <View style={styles.modalSectionHeaderRow}>
                      <Text style={styles.modalSectionLabel}>DISCIPLINE PATH</Text>
                      <Text style={styles.modalSectionSubLabel}>
                        TARGET: {selectedVow.card.targetStage?.toUpperCase() || 'BEGINNER'} ({selectedVow.card.requiredDays || 7} DAYS)
                      </Text>
                    </View>
                    <View style={styles.pathGrid}>
                      {DISCIPLINE_STAGES.map((s, idx) => {
                        const targetIdx = Math.max(0, DISCIPLINE_STAGES.findIndex(d => d.stage === selectedVow.card.targetStage));
                        const isTarget = idx === targetIdx;
                        const isPast = idx < targetIdx;
                        const isFuture = idx > targetIdx;
                        const isLast = idx === DISCIPLINE_STAGES.length - 1;

                        // Progressive muting for future stages
                        const futureStep = idx - targetIdx;
                        const nodeOpacity = isTarget ? 1.0 : isPast ? 0.72 : Math.max(0.18, 0.48 - (futureStep - 1) * 0.12);
                        const arrowOpacity = idx < targetIdx ? 0.6 : Math.max(0.15, 0.4 - futureStep * 0.1);

                        return (
                          <React.Fragment key={s.stage}>
                            <View 
                              style={[
                                styles.pathNode, 
                                { opacity: nodeOpacity },
                                isTarget && styles.pathNodeTarget,
                                isPast && styles.pathNodePast,
                              ]}
                            >
                              <Text style={[styles.pathDays, isTarget && styles.pathDaysTarget, isPast && styles.pathDaysPast]}>
                                {s.days}D
                              </Text>
                              <Text style={[styles.pathTier, isTarget && styles.pathTierTarget, isPast && styles.pathTierPast]}>
                                {s.label}
                              </Text>
                            </View>
                            {!isLast && (
                              <Text style={[styles.pathArrow, { opacity: arrowOpacity }, isTarget && { color: '#C99A5A' }]}>
                                →
                              </Text>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </View>
                  </View>

                  {/* Intelligent Primary CTA */}
                  {activeVowNames.includes(selectedVow.habit.toLowerCase()) ? (
                    <View style={styles.activeVowNoticeBox}>
                      <Text style={styles.activeVowNoticeIcon}>✦</Text>
                      <Text style={styles.activeVowNoticeText}>
                        ALREADY ACTIVE IN TODAY'S DECK
                      </Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.takeVowPrimaryBtn}
                      onPress={() => handlePrimaryAction(selectedVow)}
                      activeOpacity={0.88}
                    >
                      <LinearGradient
                        colors={isDeckFull ? ['#C99A5A', '#8B6B3D'] : ['#D4AF37', '#997314']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={StyleSheet.absoluteFill}
                      />
                      <Text style={styles.takeVowBtnText}>
                        {isDeckFull ? 'REPLACE A VOW' : 'TAKE THIS VOW'}
                      </Text>
                    </TouchableOpacity>
                  )}

                  {/* Option to Discard Custom Vow if not active */}
                  {selectedVow.isCustom && !activeVowNames.includes(selectedVow.habit.toLowerCase()) && (
                    <TouchableOpacity
                      style={styles.discardCustomBtn}
                      onPress={() => {
                        deleteCustomVow(selectedVow.habit);
                        setSelectedVow(null);
                      }}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.discardCustomBtnText}>✕ DISCARD CUSTOM VOW</Text>
                    </TouchableOpacity>
                  )}
                </ScrollView>
              </View>
            </View>
          </Modal>
        )}

        {/* ─── REPLACEMENT MODAL (Clean, Dedicated Replacement UI) ─ */}
        {showReplaceModal && replacingWithVow && (
          <Modal
            visible={showReplaceModal}
            transparent
            animationType="fade"
            onRequestClose={() => setShowReplaceModal(false)}
          >
            <View style={styles.modalBackdrop}>
              <View style={styles.replacementCardModal}>
                <Text style={styles.replaceHeaderTitle}>REPLACE A VOW</Text>
                <Text style={styles.replaceHeaderSubtitle}>
                  Choose which commitment you want to leave behind.
                </Text>

                {/* Active Vows as Compact Cards */}
                <View style={styles.replaceActiveCardsList}>
                  {activeVows.map((vow) => {
                    const vowCard = getMissionCardData(vow.custom_name || '');
                    const isSelected = selectedOldVowId === vow.id;

                    return (
                      <TouchableOpacity
                        key={vow.id}
                        style={[
                          styles.activeVowCompactCard,
                          isSelected && styles.activeVowCompactCardSelected,
                        ]}
                        onPress={() => setSelectedOldVowId(vow.id)}
                        activeOpacity={0.85}
                      >
                        <Image source={vowCard.image} style={styles.vowThumbImage} resizeMode="cover" />
                        <View style={styles.vowCompactInfo}>
                          <Text style={styles.vowCompactCardTitle}>{vowCard.title}</Text>
                          <Text numberOfLines={1} style={styles.vowCompactHabitName}>
                            {vow.custom_name}
                          </Text>
                        </View>
                        <View style={[styles.currentVowBadgePill, isSelected && styles.currentVowBadgeSelected]}>
                          <Text style={[styles.currentVowBadgeText, isSelected && { color: '#C99A5A' }]}>
                            {isSelected ? 'TO REPLACE ✗' : 'CURRENT VOW'}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Replace With Section */}
                <View style={styles.replaceWithDividerRow}>
                  <View style={styles.replaceDividerLine} />
                  <Text style={styles.replaceWithLabel}>REPLACE WITH</Text>
                  <View style={styles.replaceDividerLine} />
                </View>

                <View style={styles.newVowCompactCard}>
                  <Image source={replacingWithVow.card.image} style={styles.vowThumbImage} resizeMode="cover" />
                  <View style={styles.vowCompactInfo}>
                    <Text style={styles.newVowCardTitle}>{replacingWithVow.card.title}</Text>
                    <Text numberOfLines={1} style={styles.newVowHabitName}>
                      {replacingWithVow.habit}
                    </Text>
                  </View>
                  <View style={styles.newVowBadgePill}>
                    <Text style={styles.newVowBadgeText}>NEW VOW ✦</Text>
                  </View>
                </View>

                <Text style={styles.replaceReassuranceText}>
                  ✦ Your overall streak, discipline score, XP, and unlocked cards remain 100% intact!
                </Text>

                {/* Actions: CANCEL & CONFIRM REPLACEMENT */}
                <View style={styles.replaceActionsRow}>
                  <TouchableOpacity
                    style={styles.replaceCancelBtn}
                    onPress={() => {
                      setShowReplaceModal(false);
                      setReplacingWithVow(null);
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.replaceCancelBtnText}>CANCEL</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.replaceConfirmBtn}
                    onPress={handleConfirmReplacement}
                    activeOpacity={0.88}
                  >
                    <Text style={styles.replaceConfirmBtnText}>CONFIRM REPLACEMENT</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0C',
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.screen.paddingHorizontal,
    paddingBottom: 40,
  },

  // ─── Header ──────────────────────────────────────────────────
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.screen.paddingHorizontal,
    paddingVertical: 12,
  },
  backButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButtonText: {
    fontSize: 11,
    fontFamily: typography.fontFamily.uiBold,
    fontWeight: '700',
    color: '#F3BA45',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  activeDeckBadge: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: 'rgba(243, 186, 69, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(243, 186, 69, 0.3)',
  },
  activeDeckBadgeText: {
    fontSize: 10,
    fontFamily: typography.fontFamily.uiBold,
    color: '#F3BA45',
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },

  // ─── Hero Section ─────────────────────────────────────────────
  heroSection: {
    marginTop: 8,
    marginBottom: 16,
  },
  heroPreTitle: {
    fontSize: 10,
    fontFamily: typography.fontFamily.uiBold,
    color: '#8A91A0',
    letterSpacing: 1.5,
    marginBottom: 4,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  heroTitle: {
    fontSize: 24,
    fontFamily: typography.fontFamily.displaySemiBold,
    color: '#F5F6F8',
    fontWeight: '600',
    lineHeight: 29,
    letterSpacing: 0,
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 13,
    fontFamily: typography.fontFamily.uiMedium,
    color: '#8A91A0',
    lineHeight: 18,
    fontWeight: '500',
  },

  // ─── Category Row ─────────────────────────────────────────────
  categoryRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 18,
  },
  categoryTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryTabActive: {
    backgroundColor: 'rgba(243, 186, 69, 0.15)',
    borderColor: '#F3BA45',
  },
  categoryTabText: {
    fontSize: 11,
    fontFamily: typography.fontFamily.uiBold,
    fontWeight: '700',
    color: '#8A91A0',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  categoryTabTextActive: {
    color: '#F3BA45',
  },

  // ─── Card Grid ────────────────────────────────────────────────
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  cardColDefault: {
    width: '48%',
  },
  cardColSmall: {
    width: '48%',
  },
  cardFrame: {
    aspectRatio: 2 / 3,
    borderRadius: 14,
    backgroundColor: '#0D0D10',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
    position: 'relative',
    ...Platform.select({
      web: { boxShadow: '0 6px 18px rgba(0, 0, 0, 0.45)' },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 6,
        elevation: 4,
      }
    }),
  },
  cardFrameActive: {
    borderColor: '#C99A5A',
    ...Platform.select({
      web: { boxShadow: '0 0 14px rgba(201, 154, 90, 0.35)' }
    }),
  },
  cardArtImage: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
  },
  cardTopShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 40,
  },
  foilHeaderStrip: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    zIndex: 4,
  },
  activeBadgeTop: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: 'rgba(201, 154, 90, 0.92)',
    zIndex: 3,
  },
  activeBadgeText: {
    fontSize: 7.5,
    fontFamily: typography.fontFamily.mono,
    fontWeight: 'bold',
    color: '#0D0D0E',
    letterSpacing: 0.8,
  },
  collectedBadgeTop: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: 'rgba(10, 10, 12, 0.82)',
    borderWidth: 1,
    borderColor: 'rgba(79, 209, 140, 0.5)',
    zIndex: 3,
  },
  collectedBadgeText: {
    fontSize: 7.5,
    fontFamily: typography.fontFamily.mono,
    fontWeight: 'bold',
    color: '#4FD18C',
    letterSpacing: 0.8,
  },
  cardCategoryBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 3,
    backgroundColor: 'rgba(10, 10, 12, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    zIndex: 3,
  },
  cardCategoryText: {
    fontSize: 6.5,
    fontFamily: typography.fontFamily.mono,
    color: '#A89F91',
    letterSpacing: 0.5,
  },

  cardFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 8,
    paddingTop: 18,
    paddingBottom: 8,
  },
  cardTitle: {
    fontSize: 12,
    fontFamily: typography.fontFamily.displayBold,
    fontWeight: '700',
    color: '#F5F6F8',
    marginBottom: 2,
    letterSpacing: 0,
  },
  cardHabitName: {
    fontSize: 10,
    color: '#F3BA45',
    fontFamily: typography.fontFamily.uiMedium,
    fontWeight: '500',
    marginBottom: 4,
  },
  cardHabitNameFaint: {
    fontSize: 10,
    color: '#8A91A0',
    fontFamily: typography.fontFamily.uiMedium,
    fontWeight: '500',
    marginBottom: 2,
  },
  cardShortDescText: {
    fontSize: 9,
    fontFamily: typography.fontFamily.ui,
    color: '#8A91A0',
    lineHeight: 12,
    marginBottom: 4,
    opacity: 0.9,
  },
  cardShortDescTextFaint: {
    fontSize: 9,
    fontFamily: typography.fontFamily.ui,
    color: '#555C6B',
    lineHeight: 12,
    marginBottom: 4,
  },
  evolutionStrip: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: 4,
  },
  evolutionText: {
    fontSize: 8,
    fontFamily: typography.fontFamily.uiMedium,
    color: '#8A91A0',
    letterSpacing: 0.2,
  },
  evolutionTextFaint: {
    fontSize: 8,
    fontFamily: typography.fontFamily.uiMedium,
    color: '#555C6B',
    letterSpacing: 0.2,
  },

  // ─── Locked Obsidian Silhouette ──────────────────────────────
  lockedSilhouetteFrame: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#0D0D10',
    justifyContent: 'space-between',
  },
  silhouetteFaintArt: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
    opacity: 0.1,
  },
  silhouetteMask: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(10, 10, 13, 0.65)',
  },
  lockedCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
    paddingHorizontal: 6,
    zIndex: 2,
  },
  runeCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(201, 154, 90, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(201, 154, 90, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  runeGlyph: {
    fontSize: 13,
    color: '#C99A5A',
    fontWeight: 'bold',
  },
  previewTitleText: {
    fontSize: 9.5,
    fontFamily: typography.fontFamily.serif,
    fontWeight: 'bold',
    color: '#E0DDD7',
    textAlign: 'center',
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  milestoneRequirementText: {
    fontSize: 7,
    fontFamily: typography.fontFamily.mono,
    color: '#C99A5A',
    fontWeight: 'bold',
    letterSpacing: 0.5,
    textAlign: 'center',
  },

  // ─── Detail Inspect Modal ─────────────────────────────────────
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(5, 5, 8, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
  },
  inspectModalCard: {
    width: '100%',
    maxWidth: 440,
    maxHeight: '90%',
    backgroundColor: '#121216',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(201, 154, 90, 0.35)',
    padding: 20,
    position: 'relative',
    ...Platform.select({
      web: { boxShadow: '0 12px 36px rgba(0, 0, 0, 0.85)' }
    }),
  },
  modalCloseBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  modalCloseText: {
    fontSize: 12,
    color: '#A89F91',
    fontWeight: 'bold',
  },
  modalCardPreviewFrame: {
    height: 190,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'space-between',
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(201, 154, 90, 0.3)',
    marginBottom: 14,
  },
  modalCardArt: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
  },
  modalCardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 2,
  },
  categoryPillModal: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    backgroundColor: 'rgba(201, 154, 90, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(201, 154, 90, 0.4)',
  },
  categoryPillModalText: {
    fontSize: 8,
    fontFamily: typography.fontFamily.mono,
    fontWeight: 'bold',
    color: '#C99A5A',
    letterSpacing: 1,
  },
  modalCardGuardian: {
    fontSize: 8,
    fontFamily: typography.fontFamily.mono,
    color: '#A89F91',
    letterSpacing: 0.8,
  },
  modalPreviewBottom: {
    zIndex: 2,
  },
  modalCardTitle: {
    fontSize: 20,
    fontFamily: typography.fontFamily.displayBold,
    fontWeight: '700',
    lineHeight: 25,
    color: '#F5F6F8',
    letterSpacing: 0,
  },
  modalCardHabit: {
    fontSize: 12,
    fontFamily: typography.fontFamily.uiMedium,
    color: '#F3BA45',
    fontWeight: '500',
    marginTop: 2,
  },

  modalSection: {
    marginBottom: 14,
  },
  modalSectionLabel: {
    fontSize: 10,
    fontFamily: typography.fontFamily.uiBold,
    color: '#8A91A0',
    letterSpacing: 1,
    marginBottom: 6,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  modalLoreQuote: {
    fontSize: 13,
    fontFamily: typography.fontFamily.serif,
    color: '#DCD8D0',
    lineHeight: 19,
    fontStyle: 'italic',
    paddingLeft: 10,
    borderLeftWidth: 2,
    borderLeftColor: '#F3BA45',
  },
  vowRuleBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    padding: 10,
  },
  vowRuleTitle: {
    fontSize: 13,
    fontFamily: typography.fontFamily.displaySemiBold,
    fontWeight: '600',
    color: '#F5F6F8',
    marginBottom: 3,
  },
  vowRuleDesc: {
    fontSize: 12,
    fontFamily: typography.fontFamily.ui,
    color: '#8A91A0',
    lineHeight: 17,
  },

  modalSectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 6,
  },
  modalSectionSubLabel: {
    fontSize: 9,
    fontFamily: typography.fontFamily.uiBold,
    color: '#F3BA45',
    letterSpacing: 0.8,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  levelPill: {
    fontSize: 9,
    fontFamily: typography.fontFamily.uiBold,
    color: '#F3BA45',
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  pathGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1C2027',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#262A33',
    paddingHorizontal: 8,
    paddingVertical: 9,
  },
  pathTrack: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1C2027',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#262A33',
    paddingHorizontal: 8,
    paddingVertical: 9,
  },
  pathNode: {
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  pathNodeTarget: {
    backgroundColor: 'rgba(243, 186, 69, 0.18)',
    borderRadius: 6,
    paddingVertical: 3,
    paddingHorizontal: 5,
    borderWidth: 1,
    borderColor: '#F3BA45',
  },
  pathNodePast: {
    paddingVertical: 2,
  },
  pathDays: {
    fontSize: 8,
    fontFamily: typography.fontFamily.uiMedium,
    color: '#8A91A0',
    marginBottom: 1,
  },
  pathDaysTarget: {
    color: '#F3BA45',
    fontWeight: '700',
  },
  pathDaysPast: {
    color: '#8A91A0',
  },
  pathTier: {
    fontSize: 8,
    fontFamily: typography.fontFamily.uiBold,
    fontWeight: '700',
    color: '#8A91A0',
    textTransform: 'uppercase',
  },
  pathTierTarget: {
    color: '#F5F6F8',
  },
  pathTierPast: {
    color: '#8A91A0',
  },
  pathArrow: {
    fontSize: 8,
    color: '#555C6B',
  },

  takeVowPrimaryBtn: {
    borderRadius: 10,
    overflow: 'hidden',
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 6,
  },
  takeVowBtnText: {
    fontSize: 13,
    fontFamily: typography.fontFamily.uiBold,
    fontWeight: '700',
    color: '#0B0C0E',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  activeVowNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(243, 186, 69, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(243, 186, 69, 0.3)',
    marginTop: 6,
  },
  activeVowNoticeIcon: {
    fontSize: 12,
    color: '#F3BA45',
  },
  activeVowNoticeText: {
    fontSize: 11,
    fontFamily: typography.fontFamily.uiBold,
    fontWeight: '700',
    color: '#F3BA45',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },

  // ─── Replacement Modal (Clean, Dedicated Replacement UI) ─────
  replacementCardModal: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#14171C',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#262A33',
    padding: 20,
    ...Platform.select({
      web: { boxShadow: '0 12px 36px rgba(0, 0, 0, 0.85)' }
    }),
  },
  replaceHeaderTitle: {
    fontSize: 14,
    fontFamily: typography.fontFamily.mono,
    fontWeight: 'bold',
    color: '#F3BA45',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  replaceHeaderSubtitle: {
    fontSize: 12,
    color: '#8A91A0',
    lineHeight: 17,
    marginBottom: 16,
  },
  replaceActiveCardsList: {
    gap: 8,
    marginBottom: 14,
  },
  activeVowCompactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C2027',
    borderWidth: 1,
    borderColor: '#262A33',
    borderRadius: 10,
    padding: 10,
    gap: 10,
  },
  activeVowCompactCardSelected: {
    backgroundColor: 'rgba(243, 186, 69, 0.12)',
    borderColor: '#F3BA45',
  },
  vowThumbImage: {
    width: 38,
    height: 38,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#262A33',
  },
  vowCompactInfo: {
    flex: 1,
  },
  vowCompactCardTitle: {
    fontSize: 11,
    fontFamily: typography.fontFamily.serif,
    fontWeight: 'bold',
    color: '#F5F6F8',
  },
  vowCompactHabitName: {
    fontSize: 10,
    fontFamily: typography.fontFamily.mono,
    color: '#8A91A0',
    marginTop: 2,
  },
  currentVowBadgePill: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 4,
    backgroundColor: '#1C2027',
  },
  currentVowBadgeSelected: {
    backgroundColor: 'rgba(243, 186, 69, 0.15)',
  },
  currentVowBadgeText: {
    fontSize: 7.5,
    fontFamily: typography.fontFamily.mono,
    color: '#8A91A0',
    fontWeight: 'bold',
  },

  // Replace With Divider
  replaceWithDividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 10,
  },
  replaceDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#262A33',
  },
  replaceWithLabel: {
    fontSize: 8.5,
    fontFamily: typography.fontFamily.mono,
    fontWeight: 'bold',
    color: '#F3BA45',
    letterSpacing: 1.2,
  },

  newVowCompactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(243, 186, 69, 0.12)',
    borderWidth: 1,
    borderColor: '#F3BA45',
    borderRadius: 10,
    padding: 10,
    gap: 10,
    marginBottom: 12,
  },
  newVowCardTitle: {
    fontSize: 11.5,
    fontFamily: typography.fontFamily.serif,
    fontWeight: 'bold',
    color: '#F5F6F8',
  },
  newVowHabitName: {
    fontSize: 10,
    fontFamily: typography.fontFamily.mono,
    color: '#F3BA45',
    marginTop: 2,
  },
  newVowBadgePill: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 4,
    backgroundColor: '#F3BA45',
  },
  newVowBadgeText: {
    fontSize: 7.5,
    fontFamily: typography.fontFamily.mono,
    fontWeight: 'bold',
    color: '#0B0C0E',
  },

  replaceReassuranceText: {
    fontSize: 9.5,
    fontFamily: typography.fontFamily.mono,
    color: '#8A91A0',
    lineHeight: 14,
    marginBottom: 18,
    textAlign: 'center',
  },

  replaceActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  replaceCancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 8,
    backgroundColor: '#1C2027',
    borderWidth: 1,
    borderColor: '#262A33',
    alignItems: 'center',
    justifyContent: 'center',
  },
  replaceCancelBtnText: {
    fontSize: 10.5,
    fontFamily: typography.fontFamily.mono,
    color: '#8A91A0',
    fontWeight: 'bold',
  },
  replaceConfirmBtn: {
    flex: 1.5,
    paddingVertical: 13,
    borderRadius: 8,
    backgroundColor: '#F3BA45',
    alignItems: 'center',
    justifyContent: 'center',
  },
  replaceConfirmBtnText: {
    fontSize: 10.5,
    fontFamily: typography.fontFamily.mono,
    fontWeight: 'bold',
    color: '#0B0C0E',
    letterSpacing: 0.8,
  },

  // ─── Catalog Section Headers ─────────────────────────────────
  catalogSectionGroup: {
    marginBottom: 8,
  },
  catalogSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  catalogSectionTitle: {
    fontSize: 11,
    fontFamily: typography.fontFamily.mono,
    fontWeight: 'bold',
    color: '#F3BA45',
    letterSpacing: 1.2,
  },
  catalogSectionCount: {
    fontSize: 9,
    fontFamily: typography.fontFamily.mono,
    color: '#8A91A0',
    letterSpacing: 0.8,
  },
  forgedTagPill: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: 'rgba(243, 186, 69, 0.12)',
    borderWidth: 1,
    borderColor: '#F3BA45',
  },
  forgedTagPillText: {
    fontSize: 8.5,
    fontFamily: typography.fontFamily.mono,
    color: '#FFE48A',
    fontWeight: 'bold',
    letterSpacing: 0.8,
  },

  // ─── Forged Chips & Badges ───────────────────────────────────
  cardForgedBadgeTop: {
    position: 'absolute',
    bottom: 46,
    left: 8,
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 4,
    backgroundColor: 'rgba(20, 23, 28, 0.92)',
    borderWidth: 1,
    borderColor: '#F3BA45',
  },
  cardForgedBadgeTopText: {
    fontSize: 8,
    fontFamily: typography.fontFamily.mono,
    color: '#FFE48A',
    fontWeight: 'bold',
    letterSpacing: 0.6,
  },
  modalTopBadgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalForgedPill: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: 'rgba(243, 186, 69, 0.12)',
    borderWidth: 1,
    borderColor: '#F3BA45',
  },
  modalForgedPillText: {
    fontSize: 9,
    fontFamily: typography.fontFamily.mono,
    color: '#FFE48A',
    fontWeight: 'bold',
    letterSpacing: 1,
  },

  // ─── Custom Vow Add Box & Form ──────────────────────────────
  customVowAddBox: {
    marginBottom: 16,
  },
  openCustomBtn: {
    backgroundColor: '#14171C',
    borderWidth: 1,
    borderColor: '#262A33',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  openCustomBtnText: {
    color: '#F3BA45',
    fontSize: 12,
    fontFamily: typography.fontFamily.uiBold,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  customFormBox: {
    backgroundColor: '#14171C',
    borderWidth: 1,
    borderColor: '#262A33',
    borderRadius: 12,
    padding: spacing.md,
    gap: 8,
  },
  customFormTitle: {
    fontSize: 11,
    color: '#F3BA45',
    fontFamily: typography.fontFamily.uiBold,
    letterSpacing: 0.8,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  customInput: {
    backgroundColor: '#1C2027',
    borderWidth: 1,
    borderColor: '#262A33',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#F5F6F8',
    fontSize: 15,
    fontFamily: typography.fontFamily.uiMedium,
    fontWeight: '500',
  },
  customFormActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 6,
  },
  saveCustomBtn: {
    flex: 1,
    backgroundColor: '#F3BA45',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveCustomBtnText: {
    color: '#0B0C0E',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontFamily: typography.fontFamily.uiBold,
  },
  cancelCustomBtn: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  cancelCustomBtnText: {
    color: '#8A91A0',
    fontSize: 12,
    fontFamily: typography.fontFamily.uiMedium,
    fontWeight: '500',
  },
  discardCustomBtn: {
    marginTop: 10,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A33A3A',
    backgroundColor: 'rgba(163, 58, 58, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  discardCustomBtnText: {
    color: '#A33A3A',
    fontSize: 11,
    fontFamily: typography.fontFamily.mono,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});

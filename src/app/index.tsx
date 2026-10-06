import React, { useState, useRef } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Platform, ViewStyle, TextStyle, Image, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAppStore, getVowConfig } from '../store/useAppStore';
import { getScoreTier } from '../utils/math';
import { colors, spacing, typography, textStyles, shadows, animations, ds, useTheme } from '../theme';
import { Text } from '../components/Text';
import { OnboardingFlow } from '../components/OnboardingFlow';
import { VajraLogo } from '../components/VajraLogo';
import { MissionCardRevealModal } from '../components/MissionCardRevealModal';
import { VowNoteModal } from '../components/VowNoteModal';
import { getMissionCardData } from '../utils/cardMapping';
import { calculateCurrentStreak } from '../utils/dates';
import { getCardProgression } from '../utils/cardProgression';
import { AtmosphericBackground } from '../components/AtmosphericBackground';

function getFormattedTodayDate(): string {
  const date = new Date();
  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  
  const dayOfWeek = weekdays[date.getDay()];
  const dayOfMonth = date.getDate();
  const monthName = monthNames[date.getMonth()];
  const year = date.getFullYear();
  
  return `${dayOfWeek} • ${dayOfMonth} ${monthName} ${year}`;
}

function getDynamicGreeting(displayName: string): string {
  const hour = new Date().getHours();
  let salutation = 'Good Morning';
  if (hour >= 12 && hour < 17) {
    salutation = 'Good Afternoon';
  } else if (hour >= 17 && hour < 22) {
    salutation = 'Good Evening';
  } else if (hour >= 22 || hour < 5) {
    salutation = 'Good Night';
  }
  return `${salutation}, ${displayName || 'Seeker'}`;
}

function getScoreColor(score: number): string {
  if (score <= 25) return '#A33A3A'; // Muted deep red
  if (score <= 50) return '#DD6B20'; // Warm Amber
  if (score <= 75) return '#F3BA45'; // Imperial Gold
  if (score <= 90) return '#48BB78'; // Light Green
  return '#38A169';                  // Restrained Emerald
}

// ─── Collectible Card Animated Touch Wrapper ────────────────────────────
interface AnimatedCardProps {
  onPress: () => void;
  isCompleted: boolean;
  statusText: string;
  statusColor: string;
  children: React.ReactNode;
}

const AnimatedCard = ({ onPress, isCompleted, statusText, statusColor, children }: AnimatedCardProps) => {
  const scale = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    Animated.parallel([
      Animated.timing(scale, {
        toValue: 0.98,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 2,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.timing(scale, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <Animated.View
      style={{
        transform: [{ scale }, { translateY }],
        marginBottom: spacing.lg,
      }}
    >
      <TouchableOpacity
        activeOpacity={0.92}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        style={[
          styles.vowCardOuter,
          Platform.OS === 'web' ? { transition: 'transform 0.15s ease, box-shadow 0.15s ease' } as any : {}
        ]}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function HomeScreen() {
  const router = useRouter();
  const { 
    user, 
    activeVows, 
    vowLogs, 
    vowProgress, 
    vowReflections, 
    showOnboarding, 
    vowHistoryDates, 
    checkInVow,
    pendingCardReveal,
    clearPendingCardReveal,
    _hasHydrated
  } = useAppStore();
  const { themeId, colors: activeColors, isDark } = useTheme();
  const [selectedVowId, setSelectedVowId] = useState<string | null>(null);
  const [detailVisible, setDetailVisible] = useState<boolean>(false);
  const [activeCardIndex, setActiveCardIndex] = useState<number>(0);

  const [noteModalVowId, setNoteModalVowId] = useState<string | null>(null);
  const [noteModalMode, setNoteModalMode] = useState<'kept' | 'missed'>('missed');
  const [noteModalVisible, setNoteModalVisible] = useState<boolean>(false);

  const handleKeepVow = async (vowId: string) => {
    // Edge case: if already kept today, prevent accidental double-tap / re-triggering
    if (vowLogs[vowId] === true) return;
    await checkInVow(vowId, true);
  };

  const handleMissedVow = async (vowId: string) => {
    await checkInVow(vowId, false);
    setNoteModalVowId(vowId);
    setNoteModalMode('missed');
    setNoteModalVisible(true);
  };

  const handleOpenNote = (vowId: string, mode: 'kept' | 'missed') => {
    setNoteModalVowId(vowId);
    setNoteModalMode(mode);
    setNoteModalVisible(true);
  };

  if (!_hasHydrated) {
    return <AtmosphericBackground />;
  }

  if (showOnboarding) {
    return <OnboardingFlow />;
  }

  if (!user) return null;

  const score = user.discipline_score;
  const tier = getScoreTier(score);
  const scoreColor = getScoreColor(score);
  const greeting = getDynamicGreeting(user.display_name);

  // Compute tip position for orbiting glowing spark on score ring (Scaled down to 126px canvas)
  const radius = 52;
  const circumference = 2 * Math.PI * radius; // 326.726
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const angleDeg = (score / 100) * 360 - 90;
  const angleRad = (angleDeg * Math.PI) / 180;
  const sparkX = 63 + radius * Math.cos(angleRad);
  const sparkY = 63 + radius * Math.sin(angleRad);

  return (
    <View style={[styles.container, { backgroundColor: activeColors.bg.primary }]}>
      <View style={[styles.viewport, { backgroundColor: activeColors.bg.primary, borderColor: activeColors.border.viewport }]}>
        <AtmosphericBackground />

        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
          {/* APP HEADER — Minimal, uncluttered top bar */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <VajraLogo size={22} color={activeColors.primary} />
            </View>
            <View style={styles.headerRight}>
              {/* Notification Bell Icon */}
              <TouchableOpacity activeOpacity={0.7} style={styles.headerIconButton}>
                {Platform.OS === 'web' ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={activeColors.primary} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                ) : (
                  <Text style={{ fontSize: 16 }}>🔔</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Dynamic Greeting & Real Local Date Banner */}
          <View style={styles.dateContainer}>
            <Text style={[styles.greetingText, { color: activeColors.text.primary }]}>{greeting}</Text>
            <Text style={[styles.dateText, { color: activeColors.primary }]}>{getFormattedTodayDate().toUpperCase()}</Text>
          </View>

          <ScrollView 
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
          >
            {/* ═══════════════════════════════════════════════════
                TODAY'S COMMITMENTS — THE ACTIVE DECK
            ═══════════════════════════════════════════════════ */}
            <View style={styles.deckSectionHeader}>
              <Text style={[styles.sectionTitle, { color: activeColors.text.secondary }]}>TODAY'S COMMITMENTS</Text>
              <Text style={[styles.sectionCountText, { color: activeColors.primary }]}>
                {activeVows.filter(v => vowLogs[v.id]).length} / {activeVows.length} KEPT
              </Text>
            </View>

            {/* Upright Vertical Trading Cards Snap Carousel */}
            <View style={styles.deckCarouselWrapper}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                snapToInterval={284}
                snapToAlignment="center"
                decelerationRate="fast"
                contentContainerStyle={styles.deckCarouselContent}
                onScroll={(e) => {
                  const idx = Math.round(e.nativeEvent.contentOffset.x / 284);
                  if (idx >= 0 && idx < activeVows.length && idx !== activeCardIndex) {
                    setActiveCardIndex(idx);
                  }
                }}
                scrollEventThrottle={16}
              >
                {activeVows.map((vow, index) => {
                  const isCurrent = index === activeCardIndex;
                  const isCompleted = vowLogs[vow.id] === true;
                  const isLapsed = vowLogs[vow.id] === false;
                  const completedDates = vowHistoryDates?.[vow.id] || [];
                  const currentVowStreak = calculateCurrentStreak(completedDates);
                  const progression = getCardProgression(currentVowStreak);
                  const cardData = getMissionCardData(vow.custom_name || '');
                  const streakPct = Math.min(100, Math.round((currentVowStreak / 7) * 100));

                  return (
                    <View
                      key={vow.id}
                      style={[
                        styles.deckCardSlot,
                        {
                          transform: [{ scale: isCurrent ? 1.0 : 0.92 }],
                          opacity: isCurrent ? 1.0 : 0.72,
                        }
                      ]}
                    >
                      <TouchableOpacity
                        activeOpacity={0.92}
                        style={[
                          styles.uprightTradingCard,
                          {
                            borderColor: isCompleted 
                              ? '#F3BA45' 
                              : (isLapsed ? '#A33A3A' : '#262A33'),
                          },
                          isCompleted && {
                            ...Platform.select({
                              web: {
                                boxShadow: '0 0 20px rgba(243, 186, 69, 0.25)',
                              }
                            })
                          }
                        ]}
                        onPress={() => {
                          setSelectedVowId(vow.id);
                          setDetailVisible(true);
                        }}
                      >
                        {/* Foil Top Accent Strip */}
                        <LinearGradient
                          colors={progression.style.foilGradient}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={styles.uprightFoilStrip}
                        />

                        {/* Top Bar: Category / Title & Stage */}
                        <View style={styles.uprightCardHeader}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1, marginRight: 6 }}>
                            <Text numberOfLines={1} style={[styles.uprightCategoryText, { color: activeColors.primary, flexShrink: 1 }]}>
                              {cardData.title.toUpperCase()}
                            </Text>
                            {(vow.is_custom || cardData.isCustom) && (
                              <View style={styles.homeCustomBadge}>
                                <Text style={styles.homeCustomBadgeText}>✦ FORGED</Text>
                              </View>
                            )}
                          </View>
                          <View style={[styles.uprightStagePill, { backgroundColor: progression.style.badgeBg, borderColor: progression.style.borderColor }]}>
                            <Text style={[styles.uprightStagePillText, { color: progression.style.textColor }]}>
                              {progression.stageName.toUpperCase()}
                            </Text>
                          </View>
                        </View>

                        {/* Center: Artwork Frame */}
                        <View style={styles.uprightArtWindow}>
                          <Image
                            source={cardData.image}
                            style={styles.uprightArtImage}
                            resizeMode="cover"
                          />
                          <LinearGradient
                            colors={['transparent', 'rgba(11, 12, 14, 0.3)', 'rgba(11, 12, 14, 0.96)']}
                            style={StyleSheet.absoluteFill}
                          />
                        </View>

                        {/* Lower Section: Vow Name, Circular Streak Ring, Primary CTA */}
                        <View style={styles.uprightCardLower}>
                          <View style={styles.uprightNameGroup}>
                            <Text numberOfLines={1} style={styles.uprightVowName}>
                              {vow.custom_name}
                            </Text>
                            <Text style={styles.uprightDifficulty}>
                              {(vow.difficulty || 'MEDIUM').toUpperCase()} • ×{(vow.weight || 1).toFixed(1)} WEIGHT
                            </Text>
                          </View>

                          {/* Circular Streak Ring Row */}
                          <View style={styles.uprightStreakRow}>
                            <View style={styles.uprightStreakRing}>
                              {Platform.OS === 'web' ? (
                                <svg width="34" height="34" viewBox="0 0 34 34" style={{ display: 'block' }}>
                                  <circle
                                    cx="17"
                                    cy="17"
                                    r="13"
                                    stroke="#262A33"
                                    strokeWidth="2.5"
                                    fill="none"
                                  />
                                  <circle
                                    cx="17"
                                    cy="17"
                                    r="13"
                                    stroke={isCompleted ? '#38A169' : '#F3BA45'}
                                    strokeWidth="2.5"
                                    strokeDasharray="81.68"
                                    strokeDashoffset={81.68 * (1 - streakPct / 100)}
                                    strokeLinecap="round"
                                    fill="none"
                                    transform="rotate(-90 17 17)"
                                  />
                                </svg>
                              ) : null}
                              <View style={styles.uprightRingTextWrap}>
                                <Text style={[styles.uprightRingText, { color: isCompleted ? '#38A169' : activeColors.primary }]}>
                                  {currentVowStreak}d
                                </Text>
                              </View>
                            </View>

                            <View style={styles.uprightStreakInfo}>
                              <Text style={styles.uprightStreakLabel}>STREAK</Text>
                              <Text style={styles.uprightStreakVal}>DAY {currentVowStreak} / 7</Text>
                            </View>
                          </View>

                          {/* Action Area: KEEP VOW / KEPT VOW ✓ / MISSED VOW + ADD NOTE */}
                          <View style={styles.cardActionArea}>
                            {isCompleted ? (
                              <View style={styles.cardActionGroup}>
                                <View style={[styles.uprightCtaBtn, styles.uprightCtaCompleted]}>
                                  <Text style={[styles.uprightCtaText, styles.uprightCtaTextCompleted]}>
                                    KEPT VOW ✓
                                  </Text>
                                </View>
                                <TouchableOpacity
                                  style={styles.cardSecondaryActionBtn}
                                  activeOpacity={0.7}
                                  onPress={(e) => {
                                    e.stopPropagation();
                                    handleOpenNote(vow.id, 'kept');
                                  }}
                                >
                                  <Text style={styles.cardSecondaryActionText}>
                                    {vowReflections[vow.id]?.trim() ? '✎ EDIT NOTE' : '+ ADD NOTE'}
                                  </Text>
                                </TouchableOpacity>
                              </View>
                            ) : isLapsed ? (
                              <View style={styles.cardActionGroup}>
                                <View style={[styles.uprightCtaBtn, styles.uprightCtaLapsed]}>
                                  <Text style={[styles.uprightCtaText, styles.uprightCtaTextLapsed]}>
                                    MISSED VOW
                                  </Text>
                                </View>
                                <TouchableOpacity
                                  style={styles.cardSecondaryActionBtn}
                                  activeOpacity={0.7}
                                  onPress={(e) => {
                                    e.stopPropagation();
                                    handleOpenNote(vow.id, 'missed');
                                  }}
                                >
                                  <Text style={styles.cardSecondaryActionText}>
                                    {vowReflections[vow.id]?.trim() ? '✎ EDIT NOTE' : '+ ADD NOTE'}
                                  </Text>
                                </TouchableOpacity>
                              </View>
                            ) : (
                              <View style={styles.cardActionGroup}>
                                <TouchableOpacity
                                  style={[styles.uprightCtaBtn, styles.uprightCtaPending]}
                                  activeOpacity={0.8}
                                  onPress={(e) => {
                                    e.stopPropagation();
                                    handleKeepVow(vow.id);
                                  }}
                                >
                                  <Text style={[styles.uprightCtaText, styles.uprightCtaTextPending]}>
                                    KEEP VOW
                                  </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                  style={styles.cardSecondaryActionBtn}
                                  activeOpacity={0.7}
                                  onPress={(e) => {
                                    e.stopPropagation();
                                    handleMissedVow(vow.id);
                                  }}
                                >
                                  <Text style={styles.cardSecondaryActionText}>
                                    MISSED VOW
                                  </Text>
                                </TouchableOpacity>
                              </View>
                            )}
                          </View>
                        </View>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </ScrollView>

              {/* Dots Pagination Indicator */}
              <View style={styles.deckDotsRow}>
                {activeVows.map((_, i) => (
                  <View
                    key={`dot-${i}`}
                    style={[
                      styles.deckDot,
                      i === activeCardIndex && styles.deckDotActive
                    ]}
                  />
                ))}
              </View>
            </View>

            {/* ═══════════════════════════════════════════════════
                FORGE NEW VOW / ENTER VOW HALL ENTRY POINT
            ═══════════════════════════════════════════════════ */}
            <TouchableOpacity
              style={styles.forgeEntryCard}
              onPress={() => router.push('/codex')}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={['rgba(201, 154, 90, 0.12)', 'rgba(20, 20, 25, 0.7)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.forgeEntryContent}>
                <View style={styles.forgeEntryLeft}>
                  <View style={styles.forgeRuneBadge}>
                    <Text style={styles.forgeRuneIcon}>◇</Text>
                  </View>
                  <View style={styles.forgeTextGroup}>
                    <Text style={styles.forgeEntryTitle}>CHANGE VOW / VOW HALL</Text>
                    <Text style={styles.forgeEntrySub}>Browse available vows and manage your active deck</Text>
                  </View>
                </View>
                <View style={styles.forgeActionPill}>
                  <Text style={styles.forgeActionText}>CHANGE VOW →</Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* ═══════════════════════════════════════════════════
                HERO — Refined Multi-Ring Score Centerpiece
            ═══════════════════════════════════════════════════ */}
            <View style={[styles.heroSmokedGlassCard, { backgroundColor: activeColors.bg.card, borderColor: activeColors.border.default }]}>
              <View style={styles.heroHeaderRow}>
                <Text style={[styles.heroChapterTag, { color: activeColors.primary }]}>TODAY'S CHAPTER</Text>
                <View style={[styles.archetypeBadge, { backgroundColor: isDark ? 'rgba(201, 154, 90, 0.14)' : 'rgba(184, 134, 11, 0.12)', borderColor: activeColors.border.default }]}>
                  <Text style={[styles.archetypeBadgeText, { color: isDark ? '#E5C17C' : activeColors.primary }]}>{(user.identity_path || 'WARRIOR').toUpperCase()}</Text>
                </View>
              </View>

              {/* Center Focal Point: Compact Multi-Ring Score Orb */}
              <View style={styles.ringCenterContainer}>
                <View style={styles.ringWrapper}>
                  {/* Subtle Background Glow Aura */}
                  <View 
                    style={[
                      styles.scoreAuraGlow, 
                      { backgroundColor: scoreColor, opacity: 0.14 }
                    ]} 
                    pointerEvents="none" 
                  />

                  {Platform.OS === 'web' ? (
                    <svg width="126" height="126" viewBox="0 0 126 126" style={{ display: 'block', overflow: 'visible' }}>
                      <defs>
                        <linearGradient id="scoreRingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#FFE48A" />
                          <stop offset="50%" stopColor="#F3BA45" />
                          <stop offset="100%" stopColor={scoreColor} />
                        </linearGradient>
                      </defs>

                      {/* Outer Precision Ticks Circle */}
                      <circle
                        cx="63"
                        cy="63"
                        r="58"
                        stroke="rgba(243, 186, 69, 0.25)"
                        strokeWidth="1"
                        strokeDasharray="2 4"
                        fill="none"
                      />

                      {/* Precision Metallic Slate Track Circle */}
                      <circle
                        cx="63"
                        cy="63"
                        r="52"
                        stroke="#262A33"
                        strokeWidth="3"
                        fill="none"
                      />

                      {/* Soft Outer Metallic Glow Arc */}
                      <circle
                        cx="63"
                        cy="63"
                        r="52"
                        stroke={scoreColor}
                        strokeWidth="3"
                        strokeOpacity="0.25"
                        fill="none"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        transform="rotate(-90 63 63)"
                        style={{
                          transition: 'stroke-dashoffset 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
                          filter: 'blur(3px)',
                        }}
                      />

                      {/* Precision Progress Arc */}
                      <circle
                        cx="63"
                        cy="63"
                        r="52"
                        stroke="url(#scoreRingGradient)"
                        strokeWidth="3"
                        fill="none"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        transform="rotate(-90 63 63)"
                        style={{
                          transition: 'stroke-dashoffset 1.2s cubic-bezier(0.16, 1, 0.3, 1), stroke 0.6s ease',
                          filter: `drop-shadow(0 0 6px ${scoreColor}55)`,
                        }}
                      />

                      {/* Orbiting Radiant Spark Cap Node */}
                      {score > 0 && (
                        <circle
                          cx={sparkX}
                          cy={sparkY}
                          r="2.5"
                          fill="#FFE48A"
                          style={{
                            transition: 'all 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
                            filter: `drop-shadow(0 0 4px #FFE48A) drop-shadow(0 0 8px ${scoreColor})`,
                          }}
                        />
                      )}
                    </svg>
                  ) : (
                    <View style={[styles.nativeRingFallback, { borderColor: scoreColor }]}>
                      <Text style={[styles.nativeScoreText, { color: scoreColor }]}>{score}</Text>
                    </View>
                  )}

                  {/* Centered Ring Text Overlay */}
                  <View style={styles.ringInnerStack} pointerEvents="none">
                    <Text 
                      style={[
                        styles.ringScoreValue, 
                        { 
                          color: activeColors.text.primary,
                          textShadowColor: isDark ? scoreColor : 'transparent',
                          textShadowOffset: { width: 0, height: 0 },
                          textShadowRadius: 14,
                        }
                      ]}
                    >
                      {score}
                    </Text>
                    <Text style={[styles.ringScoreLabel, { color: activeColors.text.secondary }]}>DISCIPLINE SCORE</Text>
                    <View style={styles.ringTierPill}>
                      <Text style={[styles.ringTierLabel, { color: scoreColor }]}>
                        {(tier || 'Building').toUpperCase()}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Collectible Trading Card Detail/Reveal Viewer Modal */}
          <MissionCardRevealModal 
            vowId={pendingCardReveal ? pendingCardReveal.vowId : selectedVowId}
            vowName={pendingCardReveal ? pendingCardReveal.vowName : (selectedVowId ? activeVows.find(v => v.id === selectedVowId)?.custom_name || null : null)}
            difficulty={pendingCardReveal ? (pendingCardReveal.difficulty || 'medium') : (selectedVowId ? activeVows.find(v => v.id === selectedVowId)?.difficulty || 'medium' : 'medium')}
            weight={pendingCardReveal ? (pendingCardReveal.weight || 1.5) : (selectedVowId ? activeVows.find(v => v.id === selectedVowId)?.weight || 1.0 : 1.0)}
            customStreak={pendingCardReveal ? pendingCardReveal.streak : undefined}
            mode={pendingCardReveal ? 'reveal' : 'inspect'}
            visible={!!pendingCardReveal || detailVisible}
            onClose={() => {
              if (pendingCardReveal) {
                clearPendingCardReveal();
              } else {
                setDetailVisible(false);
              }
            }}
            onOpenNote={(vowId, mode) => {
              if (pendingCardReveal) {
                clearPendingCardReveal();
              } else {
                setDetailVisible(false);
              }
              handleOpenNote(vowId, mode);
            }}
          />

          {/* Lightweight Vow Note Modal */}
          <VowNoteModal
            visible={noteModalVisible}
            vowId={noteModalVowId}
            vowName={noteModalVowId ? activeVows.find(v => v.id === noteModalVowId)?.custom_name || null : null}
            mode={noteModalMode}
            onClose={() => setNoteModalVisible(false)}
          />
        </SafeAreaView>
      </View>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // ─── Root Layout ─────────────────────────────────────────────
  container: {
    flex: 1,
    backgroundColor: '#0B0C0E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewport: {
    width: '100%',
    maxWidth: spacing.screen.maxWidth,
    height: '100%',
    backgroundColor: '#0B0C0E',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#262A33',
    position: 'relative',
    overflow: 'hidden',
  },
  vowCardOuter: {
    width: '100%',
  },

  safeArea: {
    flex: 1,
  },
  scrollContainer: {
    paddingBottom: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.screen.paddingHorizontal,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
    height: 44,
  },
  headerLeft: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIconButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },

  dateContainer: {
    paddingHorizontal: spacing.screen.paddingHorizontal,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
    alignItems: 'flex-start',
  },
  greetingText: {
    fontFamily: typography.fontFamily.displaySemiBold,
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 29,
    color: '#F5F6F8',
    letterSpacing: 0,
    marginBottom: 2,
  },
  dateText: {
    fontFamily: typography.fontFamily.uiBold,
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },

  scrollContent: {
    paddingBottom: spacing.screen.paddingBottom + 24,
    paddingHorizontal: spacing.screen.paddingHorizontal,
  },

  // ─── Smoked Glass Hero & Animated Score Ring (Compact Refined Version) ──
  heroSmokedGlassCard: {
    backgroundColor: colors.bg.card,
    borderRadius: 18,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm + 2,
    paddingBottom: spacing.sm + 4,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.default,
    alignItems: 'center',
    ...Platform.select({
      web: {
        backdropFilter: 'blur(20px)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
      } as any,
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
      },
    }),
  },
  heroHeaderRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  heroChapterTag: {
    fontFamily: typography.fontFamily.uiBold,
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  archetypeBadge: {
    backgroundColor: colors.bg.surfaceAlt,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  archetypeBadgeText: {
    fontFamily: typography.fontFamily.uiBold,
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  ringCenterContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  ringWrapper: {
    width: 126,
    height: 126,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreAuraGlow: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    ...Platform.select({
      web: {
        filter: 'blur(24px)',
      } as any,
      default: {},
    }),
  },
  ringInnerStack: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringScoreValue: {
    fontFamily: typography.fontFamily.uiBold,
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 34,
    color: '#F5F6F8',
  },
  ringScoreLabel: {
    fontFamily: typography.fontFamily.uiSemiBold,
    fontSize: 9,
    color: '#8A91A0',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 1,
  },
  ringTierPill: {
    backgroundColor: 'rgba(5, 5, 10, 0.65)',
    paddingHorizontal: 8,
    paddingVertical: 1.5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginTop: 3,
  },
  ringTierLabel: {
    fontFamily: typography.fontFamily.uiBold,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },

  nativeRingFallback: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nativeScoreText: {
    fontFamily: typography.fontFamily.uiBold,
    fontSize: 28,
    fontWeight: '700',
    color: '#F5F6F8',
  },

  // ─── Active Deck Trading Card Carousel ──────────────────────────
  deckSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.screen.paddingHorizontal,
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
  },
  sectionTitle: {
    fontFamily: typography.fontFamily.displaySemiBold,
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 23,
    letterSpacing: 0.5,
    color: '#F5F6F8',
  },
  sectionCountText: {
    fontFamily: typography.fontFamily.uiBold,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    color: '#8A91A0',
  },
  deckCarouselWrapper: {
    marginBottom: spacing.lg,
  },
  deckCarouselContent: {
    paddingVertical: 8,
    gap: 14,
    alignItems: 'center',
  },
  deckCardSlot: {
    width: 270,
    alignItems: 'center',
    transition: 'transform 0.25s ease, opacity 0.25s ease',
  } as any,
  uprightTradingCard: {
    width: 270,
    height: 425,
    borderRadius: 22,
    backgroundColor: '#14171C',
    borderWidth: 1,
    borderColor: '#262A33',
    overflow: 'hidden',
    position: 'relative',
    ...Platform.select({
      web: {
        backdropFilter: 'blur(20px)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
        cursor: 'pointer',
      } as any,
    }),
  },
  uprightFoilStrip: {
    height: 3.5,
    width: '100%',
  },
  uprightCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 8,
    backgroundColor: 'rgba(20, 23, 28, 0.95)',
  },
  uprightCategoryText: {
    fontFamily: typography.fontFamily.uiBold,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 14,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: '#F3BA45',
  },
  uprightStagePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  uprightStagePillText: {
    fontSize: 9,
    fontFamily: typography.fontFamily.uiBold,
    letterSpacing: 0.8,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  homeCustomBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
    backgroundColor: 'rgba(243, 186, 69, 0.12)',
    borderWidth: 1,
    borderColor: '#F3BA45',
  },
  homeCustomBadgeText: {
    fontSize: 8,
    fontFamily: typography.fontFamily.uiBold,
    color: '#FFE48A',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  uprightArtWindow: {
    height: 195,
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#0B0C0E',
  },
  uprightArtImage: {
    width: '100%',
    height: '100%',
  },
  uprightCardLower: {
    padding: 14,
    gap: 10,
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: '#14171C',
  },
  uprightNameGroup: {
    gap: 2,
  },
  uprightVowName: {
    fontFamily: typography.fontFamily.displayBold,
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 25,
    color: '#F5F6F8',
    letterSpacing: 0,
  },
  uprightDifficulty: {
    fontFamily: typography.fontFamily.uiMedium,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 17,
    letterSpacing: 0.2,
    color: '#8A91A0',
  },
  uprightStreakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#1C2027',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#262A33',
  },
  uprightStreakRing: {
    width: 34,
    height: 34,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  uprightRingTextWrap: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uprightRingText: {
    fontFamily: typography.fontFamily.uiBold,
    fontSize: 10,
    fontWeight: '700',
  },
  uprightStreakInfo: {
    flex: 1,
    gap: 1,
  },
  uprightStreakLabel: {
    fontSize: 9,
    letterSpacing: 0.8,
    color: '#8A91A0',
    fontFamily: typography.fontFamily.uiBold,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  uprightStreakVal: {
    fontFamily: typography.fontFamily.uiBold,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 17,
    letterSpacing: 0.3,
    color: '#F5F6F8',
  },
  uprightCtaBtn: {
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
  },
  uprightCtaPending: {
    backgroundColor: '#F3BA45',
    borderColor: '#F3BA45',
  },
  uprightCtaCompleted: {
    backgroundColor: '#1C2027',
    borderColor: '#38A169',
  },
  uprightCtaLapsed: {
    backgroundColor: 'rgba(163, 58, 58, 0.12)',
    borderColor: 'rgba(163, 58, 58, 0.4)',
  },
  uprightCtaText: {
    fontFamily: typography.fontFamily.uiBold,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 15,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  uprightCtaTextPending: {
    color: '#0B0C0E',
  },
  uprightCtaTextCompleted: {
    color: '#38A169',
  },
  uprightCtaTextLapsed: {
    color: '#E53E3E',
  },
  cardActionArea: {
    width: '100%',
  },
  cardActionGroup: {
    gap: 4,
    alignItems: 'stretch',
  },
  cardSecondaryActionBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  cardSecondaryActionText: {
    fontFamily: typography.fontFamily.uiBold,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: '#8A91A0',
    textTransform: 'uppercase',
  },
  deckDotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  deckDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#262A33',
  },
  deckDotActive: {
    width: 18,
    backgroundColor: '#F3BA45',
  },

  // ─── Forge New Vow Entry Card ─────────────────────────────────
  forgeEntryCard: {
    marginHorizontal: spacing.screen.paddingHorizontal,
    marginTop: 10,
    marginBottom: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#262A33',
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#14171C',
  },
  forgeEntryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  forgeEntryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  forgeRuneBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1C2027',
    borderWidth: 1,
    borderColor: '#262A33',
    alignItems: 'center',
    justifyContent: 'center',
  },
  forgeRuneIcon: {
    fontSize: 14,
    color: '#F3BA45',
    fontWeight: 'bold',
  },
  forgeTextGroup: {
    flex: 1,
  },
  forgeEntryTitle: {
    fontSize: 11,
    fontFamily: typography.fontFamily.uiBold,
    fontWeight: '700',
    color: '#F5F6F8',
    letterSpacing: 0.5,
  },
  forgeEntrySub: {
    fontSize: 11,
    fontFamily: typography.fontFamily.uiMedium,
    color: '#8A91A0',
    marginTop: 1,
  },
  forgeActionPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(243, 186, 69, 0.12)',
    borderWidth: 1,
    borderColor: '#F3BA45',
  },
  forgeActionText: {
    fontSize: 10,
    fontFamily: typography.fontFamily.uiBold,
    fontWeight: '700',
    color: '#F3BA45',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
});

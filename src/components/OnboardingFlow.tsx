import React, { useState, useEffect, useRef } from 'react';
import { 
  Alert, 
  Animated, 
  Easing, 
  Platform, 
  ScrollView, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  View, 
  ImageBackground,
  Image 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppStore } from '../store/useAppStore';
import { colors, spacing, typography } from '../theme';
import { PathType } from '../types';
import { Card } from './Card';
import { Text } from './Text';
import { VajraLogo } from './VajraLogo';
import { 
  ShieldIcon, 
  BookIcon, 
  LotusIcon, 
  PaletteIcon, 
  LockIcon, 
  CheckIcon,
  getVowVectorIcon, 
  getCategoryVectorIcon 
} from './ZenIcons';

export interface VowOption {
  name: string;
  desc?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  xp?: number;
}

export const RECOMMENDED_VOWS: VowOption[] = [
  { name: 'Wake before 6 AM', desc: 'Start your day with intention and quiet stillness.', difficulty: 'medium', category: 'Recommended', xp: 15 },
  { name: 'Workout 45 min', desc: 'Build physical grit through consistent daily movement.', difficulty: 'medium', category: 'Recommended', xp: 15 },
  { name: 'Read 20 pages', desc: 'Feed your mind with daily structured reading.', difficulty: 'easy', category: 'Recommended', xp: 10 },
  { name: 'Meditate 10 min', desc: 'Calm inner noise and sharpen mental concentration.', difficulty: 'easy', category: 'Recommended', xp: 10 },
  { name: 'Drink 2L water', desc: 'Purify your vessel and maintain peak hydration.', difficulty: 'easy', category: 'Recommended', xp: 10 },
  { name: 'No social media after 9 PM', desc: 'Protect your evening peace and restorative sleep.', difficulty: 'medium', category: 'Recommended', xp: 15 },
];

export const CATEGORY_VOW_LIBRARY: Record<string, VowOption[]> = {
  'Body': [
    { name: 'Cold Shower 3 min', desc: 'Embrace physical discomfort to forge mental resilience.', difficulty: 'hard', category: 'Body', xp: 25 },
    { name: '100 Pushups Daily', desc: 'Build raw physical strength through daily volume.', difficulty: 'hard', category: 'Body', xp: 25 },
    { name: 'Stretching & Mobility', desc: 'Keep your joints fluid and body pain-free.', difficulty: 'easy', category: 'Body', xp: 10 },
    { name: 'Fast until 12 PM', desc: 'Intermittent fasting for metabolic clarity.', difficulty: 'medium', category: 'Body', xp: 15 }
  ],
  'Mind': [
    { name: 'No Complaints Day', desc: 'Transform negative self-talk into constructive action.', difficulty: 'medium', category: 'Mind', xp: 15 },
    { name: 'Journaling 10 min', desc: 'Clear mental clutter through structured reflection.', difficulty: 'easy', category: 'Mind', xp: 10 },
    { name: 'Breathwork 5 min', desc: 'Master your nervous system through controlled breathing.', difficulty: 'easy', category: 'Mind', xp: 10 },
    { name: 'Stoic Reflection', desc: 'Reflect on impermanence and voluntary discomfort.', difficulty: 'medium', category: 'Mind', xp: 15 }
  ],
  'Learning': [
    { name: 'Study 1 Hour', desc: 'Dedicated deep study block without interruption.', difficulty: 'medium', category: 'Learning', xp: 15 },
    { name: 'Learn 10 New Words', desc: 'Expand your vocabulary and linguistic precision.', difficulty: 'easy', category: 'Learning', xp: 10 },
    { name: 'Listen to Educational Audio', desc: 'Turn commute time into active knowledge acquisition.', difficulty: 'easy', category: 'Learning', xp: 10 },
    { name: 'Read Technical Docs', desc: 'Master core concepts in your chosen discipline.', difficulty: 'hard', category: 'Learning', xp: 25 }
  ],
  'Productivity': [
    { name: 'Deep Work 2hr Block', desc: 'Unbroken focus on high-leverage priorities.', difficulty: 'hard', category: 'Productivity', xp: 25 },
    { name: 'Plan Tomorrow Today', desc: 'End each evening with an explicit action plan.', difficulty: 'easy', category: 'Productivity', xp: 10 },
    { name: 'Inbox Zero Daily', desc: 'Process all incoming communications decisively.', difficulty: 'medium', category: 'Productivity', xp: 15 },
    { name: 'Single-Tasking Only', desc: 'Eliminate context switching and multitasking.', difficulty: 'medium', category: 'Productivity', xp: 15 }
  ],
  'Digital': [
    { name: 'No Social Media Before Noon', desc: 'Protect morning focus from reactive scrolling.', difficulty: 'medium', category: 'Digital', xp: 15 },
    { name: 'Phone-Free Meals', desc: 'Be fully present while eating without screens.', difficulty: 'easy', category: 'Digital', xp: 10 },
    { name: 'Digital Fasting (Full Day)', desc: 'Complete disconnection from social feeds.', difficulty: 'hard', category: 'Digital', xp: 25 },
    { name: 'Screen Time < 2 Hours', desc: 'Strict limit on total leisure screen usage.', difficulty: 'hard', category: 'Digital', xp: 25 }
  ],
  'Health': [
    { name: 'Zero Processed Sugar', desc: 'Eliminate artificial sweets and energy crashes.', difficulty: 'hard', category: 'Health', xp: 25 },
    { name: 'Eat Whole Foods Only', desc: 'Nourish your body with clean, unprocessed foods.', difficulty: 'medium', category: 'Health', xp: 15 },
    { name: 'No Alcohol Today', desc: 'Maintain mental sobriety and liver health.', difficulty: 'medium', category: 'Health', xp: 15 },
    { name: '10,000 Daily Steps', desc: 'Sustain baseline daily physical activity.', difficulty: 'medium', category: 'Health', xp: 15 }
  ],
  'Sleep': [
    { name: 'Asleep by 11 PM', desc: 'Prioritize circadian rhythm and restorative sleep.', difficulty: 'medium', category: 'Sleep', xp: 15 },
    { name: 'No Screens 1hr Before Bed', desc: 'Shield your eyes from blue light before sleep.', difficulty: 'medium', category: 'Sleep', xp: 15 },
    { name: 'Dark & Cool Bedroom', desc: 'Optimize sleep environment for deep recovery.', difficulty: 'easy', category: 'Sleep', xp: 10 },
    { name: 'Consistent Wake Hour', desc: 'Wake at the exact same hour every single day.', difficulty: 'medium', category: 'Sleep', xp: 15 }
  ],
  'Money': [
    { name: 'Track Every Expense', desc: 'Record every single purchase for financial awareness.', difficulty: 'easy', category: 'Money', xp: 10 },
    { name: 'No Impulse Buying', desc: 'Wait 48 hours before buying non-essential items.', difficulty: 'medium', category: 'Money', xp: 15 },
    { name: 'Save 20% Income', desc: 'Automatically direct funds to long-term wealth.', difficulty: 'hard', category: 'Money', xp: 25 },
    { name: 'Zero Eating Out', desc: 'Cook meals at home to save capital and health.', difficulty: 'medium', category: 'Money', xp: 15 }
  ],
  'Relationships': [
    { name: 'Express Gratitude Daily', desc: 'Send a genuine thank-you message to someone.', difficulty: 'easy', category: 'Relationships', xp: 10 },
    { name: 'Active Listening', desc: 'Give 100% undivided attention when listening.', difficulty: 'easy', category: 'Relationships', xp: 10 },
    { name: 'Quality Time 30m', desc: 'Uninterrupted presence with family or partner.', difficulty: 'medium', category: 'Relationships', xp: 15 },
    { name: 'Random Act of Kindness', desc: 'Help others without expecting anything back.', difficulty: 'easy', category: 'Relationships', xp: 10 }
  ],
  'Spiritual': [
    { name: 'Silent Reflection 15m', desc: 'Sit in complete silence without inputs.', difficulty: 'easy', category: 'Spiritual', xp: 10 },
    { name: 'Daily Mantra / Prayer', desc: 'Connect with your core values and higher path.', difficulty: 'easy', category: 'Spiritual', xp: 10 },
    { name: 'Nature Walk 20m', desc: 'Reconnect with natural surroundings outdoors.', difficulty: 'easy', category: 'Spiritual', xp: 10 },
    { name: 'Practice Forgiveness', desc: 'Release resentment towards past grievances.', difficulty: 'medium', category: 'Spiritual', xp: 15 }
  ],
  'Creativity': [
    { name: 'Write 500 Words', desc: 'Express original thoughts in prose daily.', difficulty: 'medium', category: 'Creativity', xp: 15 },
    { name: 'Create 1 Artifact Daily', desc: 'Design, draw, or build one tangible piece.', difficulty: 'hard', category: 'Creativity', xp: 25 },
    { name: 'Practice Instrument 20m', desc: 'Hone creative expression through music.', difficulty: 'medium', category: 'Creativity', xp: 15 },
    { name: 'Capture 3 Ideas Daily', desc: 'Document creative inspirations immediately.', difficulty: 'easy', category: 'Creativity', xp: 10 }
  ]
};

const CATEGORIES_KEYS = Object.keys(CATEGORY_VOW_LIBRARY);

const PATHS = [
  { 
    key: 'warrior' as PathType, 
    label: 'WARRIOR', 
    sub: 'PHYSICAL & GRIT', 
    desc: 'Become physically disciplined. Build grit, strength, and resilience.',
    accentColor: '#D4AF37',
    badgeBg: 'rgba(212, 175, 55, 0.16)',
    renderIcon: (color: string) => <ShieldIcon size={24} color={color} />
  },
  { 
    key: 'scholar' as PathType, 
    label: 'SCHOLAR', 
    sub: 'FOCUS & WISDOM', 
    desc: 'Sharpen your mind. Study deeply and grow in wisdom.',
    accentColor: '#6B8AE8',
    badgeBg: 'rgba(107, 138, 232, 0.16)',
    renderIcon: (color: string) => <BookIcon size={24} color={color} />
  },
  { 
    key: 'monk' as PathType, 
    label: 'MONK', 
    sub: 'MIND & CONTROL', 
    desc: 'Master your mind. Find clarity through silence and discipline.',
    accentColor: '#48BB78',
    badgeBg: 'rgba(72, 187, 120, 0.16)',
    renderIcon: (color: string) => <LotusIcon size={24} color={color} />
  },
  { 
    key: 'creator' as PathType, 
    label: 'CREATOR', 
    sub: 'ACTION & CRAFT', 
    desc: 'Build, create, and ship. Turn ideas into impact.',
    accentColor: '#E59E53',
    badgeBg: 'rgba(229, 158, 83, 0.16)',
    renderIcon: (color: string) => <PaletteIcon size={24} color={color} />
  }
];

import { CinematicIntroScreen } from './CinematicIntroScreen';

export function OnboardingFlow() {
  const { completeOnboarding, customVows, createCustomVow, deleteCustomVow } = useAppStore();
  const [step, setStep] = useState<'intro' | 'moniker' | 'identity' | 'vows' | 'review'>('intro');
  const [name, setName] = useState('');
  const [selectedPath, setSelectedPath] = useState<PathType | null>(null);
  const [selectedVows, setSelectedVows] = useState<VowOption[]>([]);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  
  // Custom Vow state
  const [customVowsList, setCustomVowsList] = useState<VowOption[]>(() => {
    return (customVows || []).map(cv => ({
      name: cv.habit,
      desc: cv.commitment,
      difficulty: cv.difficulty || 'medium',
      category: 'Custom',
      xp: cv.difficulty === 'hard' ? 25 : cv.difficulty === 'medium' ? 15 : 10
    }));
  });
  const [isCustomVowOpen, setIsCustomVowOpen] = useState(false);
  const [customVowName, setCustomVowName] = useState('');
  const [customVowDesc, setCustomVowDesc] = useState('');

  // Animation values
  const contentFadeAnim = useRef(new Animated.Value(0)).current;
  const contentTranslateY = useRef(new Animated.Value(8)).current;
  const scrollRef = useRef<ScrollView>(null);
  const nameInputRef = useRef<TextInput>(null);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const logoGlowAnim = useRef(new Animated.Value(0.25)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(logoGlowAnim, {
          toValue: 0.6,
          duration: 3400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(logoGlowAnim, {
          toValue: 0.22,
          duration: 3400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  useEffect(() => {
    contentFadeAnim.setValue(0);
    contentTranslateY.setValue(8);
    Animated.parallel([
      Animated.timing(contentFadeAnim, {
        toValue: 1,
        duration: 250,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(contentTranslateY, {
        toValue: 0,
        duration: 250,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();

    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [step]);

  const handleNextFromIdentity = () => {
    if (!name.trim()) {
      Alert.alert('Name Required', 'Please enter your name to proceed.');
      return;
    }
    setStep('identity');
  };

  const handleNextFromPath = () => {
    if (!selectedPath) {
      Alert.alert('Path Required', 'Please choose your identity path.');
      return;
    }
    setStep('vows');
  };

  const handleNextFromVows = () => {
    if (selectedVows.length !== 3) {
      Alert.alert('3 Commitments Required', 'Select exactly 3 commitments to begin your journey.');
      return;
    }
    setStep('review');
  };

  const handleFinish = () => {
    if (selectedPath && selectedVows.length === 3 && name.trim()) {
      completeOnboarding(name.trim(), selectedPath, selectedVows);
    }
  };

  const handleToggleVow = (vow: VowOption) => {
    const isSelected = selectedVows.some(v => v.name === vow.name);
    if (isSelected) {
      setSelectedVows(selectedVows.filter(v => v.name !== vow.name));
    } else {
      if (selectedVows.length >= 3) {
        Alert.alert('3 Commitments Limit', 'You have selected 3 commitments. Unselect one to choose a different one.');
        return;
      }
      setSelectedVows([...selectedVows, vow]);
    }
  };

  const handleAddCustomVow = () => {
    const cleanName = customVowName.trim();
    if (!cleanName) return;

    if (customVowsList.length >= 3) {
      Alert.alert('Limit Reached', 'You can have up to 3 custom vows at a time.');
      return;
    }

    if (customVowsList.some(v => v.name.toLowerCase() === cleanName.toLowerCase())) {
      Alert.alert('Duplicate Vow', 'A custom vow with this name already exists.');
      return;
    }

    const newVow: VowOption = {
      name: cleanName,
      desc: customVowDesc.trim() || 'Custom personal commitment.',
      difficulty: 'medium',
      category: 'Custom',
      xp: 15
    };

    setCustomVowsList(prev => [...prev, newVow]);
    createCustomVow({
      habit: newVow.name,
      commitment: newVow.desc
    });

    if (selectedVows.length < 3 && !selectedVows.some(v => v.name.toLowerCase() === cleanName.toLowerCase())) {
      setSelectedVows(prev => [...prev, newVow]);
    }

    setCustomVowName('');
    setCustomVowDesc('');
    setIsCustomVowOpen(false);
  };

  const handleDeleteCustomVow = (vowName: string) => {
    setCustomVowsList(prev => prev.filter(v => v.name.toLowerCase() !== vowName.toLowerCase()));
    setSelectedVows(prev => prev.filter(v => v.name.toLowerCase() !== vowName.toLowerCase()));
    deleteCustomVow(vowName);
  };

  // Background image mapping - Screen 1 uses Enso with ZERO blur and SUBTLE dark overlay
  const bgSource = step === 'moniker' 
    ? require('../../assets/images/onboarding_zen_enso.jpg')
    : require('../../assets/images/onboarding_zen_bamboo.jpg');

  const overlayOpacity = step === 'moniker' ? 0.48 : 0.72;

  const stepIndexMap = { intro: 0, moniker: 0, identity: 1, vows: 2, review: 3 };
  const currentStepIndex = stepIndexMap[step];

  const stepsList = [
    { label: 'IDENTITY', key: 'moniker' },
    { label: 'PATH', key: 'identity' },
    { label: 'VOWS', key: 'vows' },
    { label: 'BEGIN', key: 'review' }
  ];

  const selectedPathInfo = PATHS.find(p => p.key === selectedPath);

  if (step === 'intro') {
    return <CinematicIntroScreen onBegin={() => setStep('moniker')} />;
  }

  // ─── EDITORIAL CINEMATIC STEP 1: IDENTITY ─────────────────────
  if (step === 'moniker') {
    const isNameValid = name.trim().length > 0;

    return (
      <View style={styles.step1Root}>
        <ImageBackground
          source={require('../../assets/images/onboarding_step1_bg.jpg')}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        >
          {/* Subtle Ambient Vignettes for Depth */}
          <LinearGradient
            colors={['rgba(6, 7, 8, 0.8)', 'rgba(6, 7, 8, 0.25)', 'transparent']}
            locations={[0, 0.35, 1]}
            style={styles.step1TopVignette}
            pointerEvents="none"
          />
          <LinearGradient
            colors={['transparent', 'rgba(6, 7, 8, 0.55)', 'rgba(6, 7, 8, 0.95)', '#060708']}
            locations={[0, 0.35, 0.7, 1]}
            style={styles.step1BottomVignette}
            pointerEvents="none"
          />

          <SafeAreaView style={styles.step1SafeArea}>
            <View style={styles.step1Viewport}>
              {/* ─── TOP: Understated Stepper & Label ─── */}
              <View style={styles.step1TopSection}>
                <View style={styles.step1StepperRow}>
                  <View style={styles.step1StepBarActive} />
                  <View style={styles.step1StepBarInactive} />
                  <View style={styles.step1StepBarInactive} />
                  <View style={styles.step1StepBarInactive} />
                </View>
                <Text style={styles.step1StepLabel}>STEP 1 OF 4</Text>
              </View>

              {/* ─── CENTER: Crest & Editorial Nameplate ─── */}
              <View style={styles.step1CenterSection}>
                {/* Large Hero Vajra Crest with breathing warm gold ambient glow */}
                <View style={styles.step1CrestWrapper}>
                  <Animated.View
                    style={[
                      styles.step1CrestGlowAura,
                      { opacity: logoGlowAnim },
                    ]}
                  />
                  <Image
                    source={require('../../assets/images/logo.png')}
                    style={styles.step1CrestAsset}
                    resizeMode="contain"
                  />
                </View>

                {/* Subtle Ceremonial Gold Accent Divider */}
                <View style={styles.step1GoldDivider} />

                {/* Heading */}
                <Text style={styles.step1Heading}>WHAT SHOULD WE CALL YOU?</Text>

                {/* Nameplate / Engraved Input Treatment */}
                <TouchableOpacity
                  activeOpacity={1}
                  onPress={() => nameInputRef.current?.focus()}
                  style={styles.step1NameplateContainer}
                >
                  <Text style={styles.step1Eyebrow}>YOUR NAME</Text>

                  <TextInput
                    ref={nameInputRef}
                    placeholder="ENTER YOUR NAME"
                    placeholderTextColor="rgba(255, 255, 255, 0.28)"
                    value={name}
                    onChangeText={(val) => setName(val.toUpperCase())}
                    maxLength={24}
                    autoCapitalize="characters"
                    autoFocus={true}
                    onFocus={() => setIsInputFocused(true)}
                    onBlur={() => setIsInputFocused(false)}
                    cursorColor="#F3BA45"
                    selectionColor="rgba(243, 186, 69, 0.3)"
                    underlineColorAndroid="transparent"
                    style={styles.step1TextInput}
                  />

                  {/* Refined Gold / Metallic Underline with Focus Glow */}
                  <View
                    style={[
                      styles.step1Underline,
                      isInputFocused && styles.step1UnderlineFocused,
                    ]}
                  />

                  {/* Supporting Text */}
                  <Text style={styles.step1SupportingText}>
                    This is the name you'll see throughout Vajra.
                  </Text>
                </TouchableOpacity>
              </View>

              {/* ─── BOTTOM: High-End CTA ─── */}
              <View style={styles.step1BottomSection}>
                {isNameValid ? (
                  <TouchableOpacity
                    style={styles.step1PrimaryBtn}
                    onPress={handleNextFromIdentity}
                    activeOpacity={0.88}
                  >
                    <LinearGradient
                      colors={['#FFE48A', '#F3BA45', '#B5872A']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.step1BtnGradient}
                    >
                      <Text style={styles.step1PrimaryBtnText}>CONTINUE →</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.step1DisabledBtn}>
                    <Text style={styles.step1DisabledBtnText}>CONTINUE →</Text>
                  </View>
                )}
              </View>
            </View>
          </SafeAreaView>
        </ImageBackground>
      </View>
    );
  }

  return (
    <View style={styles.rootContainer}>
      <ImageBackground 
        source={bgSource}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      >
        {/* Subtle Dark Overlay to preserve background art as subtle texture */}
        <View style={[StyleSheet.absoluteFill, { backgroundColor: `rgba(11, 11, 14, ${overlayOpacity})` }]} />

        <View style={styles.viewport}>
          
          {/* ─── Top Journey Indicator ──────────────────────────── */}
          <View style={styles.journeyIndicatorArea}>
            <View style={styles.journeyTrackWrapper}>
              <View style={styles.journeyTrackRow}>
                {/* Background Line */}
                <View style={styles.journeyBaseLine} />
                <View 
                  style={[
                    styles.journeyActiveLine, 
                    { width: `${(currentStepIndex / 3) * 100}%` }
                  ]} 
                />

                {stepsList.map((s, idx) => {
                  const isActive = idx === currentStepIndex;
                  const isPassed = idx < currentStepIndex;

                  return (
                    <View key={s.key} style={styles.journeyStepDotFrame}>
                      <View style={[
                        styles.journeyDotNode,
                        (isActive || isPassed) && styles.journeyDotNodeActive
                      ]} />
                    </View>
                  );
                })}
              </View>

              {/* Step Counter Label Below Track */}
              <View style={styles.journeyMetaCol}>
                <Text style={styles.journeyStepCountText}>
                  STEP {currentStepIndex + 1} OF 4
                </Text>
                <Text style={styles.journeyStepNameText}>
                  {stepsList[currentStepIndex].label}
                </Text>
              </View>
            </View>
          </View>

          <ScrollView 
            ref={scrollRef}
            style={styles.mainScroll}
            contentContainerStyle={[
              styles.mainScrollContent,
              step === 'vows' && { paddingBottom: 160 }
            ]}
            showsVerticalScrollIndicator={false}
          >
            <Animated.View style={{ 
              opacity: contentFadeAnim, 
              transform: [{ translateY: contentTranslateY }],
              width: '100%' 
            }}>




              {/* ─── SCREEN 2: PATH (Identity Cards) ────────────── */}
              {step === 'identity' && (
                <View style={styles.screenWrapper}>
                  <View style={styles.screenHeader}>
                    <Text style={styles.screenHeading}>Who do you want to become?</Text>
                    <Text style={styles.screenSub}>Choose the path that aligns with your focus.</Text>
                  </View>

                  <View style={styles.pathList}>
                    {PATHS.map((p) => {
                      const isSelected = selectedPath === p.key;

                      return (
                        <TouchableOpacity
                          key={p.key}
                          onPress={() => setSelectedPath(p.key)}
                          activeOpacity={0.88}
                          style={[
                            styles.pathCard,
                            isSelected && {
                              borderColor: '#D4AF37',
                              backgroundColor: 'rgba(212, 175, 55, 0.09)',
                              shadowColor: '#D4AF37',
                              shadowOffset: { width: 0, height: 4 },
                              shadowOpacity: 0.2,
                              shadowRadius: 12,
                            }
                          ]}
                        >
                          <View style={[styles.pathEmblemBadge, { backgroundColor: p.badgeBg }]}>
                            {p.renderIcon(isSelected ? '#D4AF37' : p.accentColor)}
                          </View>
                          
                          <View style={styles.pathMetaCol}>
                            <View style={styles.pathTitleRow}>
                              <Text style={[styles.pathTitle, isSelected && { color: '#D4AF37' }]}>
                                {p.label}
                              </Text>
                              <Text style={styles.pathSubBadge}>{p.sub}</Text>
                            </View>
                            <Text style={styles.pathDescText}>{p.desc}</Text>
                          </View>

                          <View style={[
                            styles.selectCheckCircle, 
                            isSelected && styles.selectCheckCircleActive
                          ]}>
                            {isSelected && <CheckIcon size={14} color="#0D0D0E" />}
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  <TouchableOpacity 
                    style={[styles.primaryGoldBtn, !selectedPath && styles.disabledBtn, { marginTop: spacing.xl }]} 
                    disabled={!selectedPath}
                    onPress={handleNextFromPath}
                    activeOpacity={0.88}
                  >
                    <Text style={styles.primaryGoldBtnText}>CONTINUE →</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* ─── SCREEN 3: COMMITMENTS (Vector SVG Icons) ──── */}
              {step === 'vows' && (
                <View style={styles.screenWrapper}>
                  <View style={styles.screenHeader}>
                    <Text style={styles.screenHeading}>Choose Your First 3 Commitments</Text>
                    <Text style={styles.screenSub}>Small daily actions create big changes. Start with just three.</Text>
                    <View style={styles.counterPill}>
                      <Text style={styles.counterPillText}>{selectedVows.length} / 3 Selected</Text>
                    </View>
                  </View>

                  {/* ─── TOP: CUSTOM VOW ENTRY (Distinct Invitation) ─── */}
                  <View style={styles.customVowSectionCard}>
                    <View style={styles.customVowHeaderCol}>
                      <Text style={styles.customVowPreTitle}>CAN'T FIND YOUR VOW?</Text>
                      <Text style={styles.customVowMainTitle}>ADD YOUR OWN VOW</Text>
                      <Text style={styles.customVowSubtitle}>
                        Make your own commitment and forge your path.
                      </Text>
                    </View>

                    {/* Active / Created Custom Commitments (Available for selection just like official vows) */}
                    {customVowsList.map((cv) => {
                      const isSelected = selectedVows.some(v => v.name.toLowerCase() === cv.name.toLowerCase());
                      return (
                        <TouchableOpacity
                          key={cv.name}
                          style={[styles.activeCustomVowRow, isSelected && styles.activeCustomVowRowSelected]}
                          onPress={() => handleToggleVow(cv)}
                          activeOpacity={0.85}
                        >
                          <View style={styles.activeCustomVowLeft}>
                            <View style={[styles.activeCustomIconBadge, isSelected && styles.activeCustomIconBadgeSelected]}>
                              {getVowVectorIcon(cv.name, isSelected ? '#0D0D0E' : '#D4AF37', 16)}
                            </View>
                            <View style={styles.activeCustomMeta}>
                              <Text style={[styles.activeCustomName, isSelected && styles.activeCustomNameSelected]}>
                                {cv.name}
                              </Text>
                              {cv.desc ? (
                                <Text style={styles.activeCustomDesc} numberOfLines={1}>{cv.desc}</Text>
                              ) : null}
                            </View>
                          </View>
                          <View style={styles.customVowCardRightActions}>
                            {isSelected && (
                              <View style={styles.miniCheckBadge}>
                                <CheckIcon size={10} color="#D4AF37" />
                                <Text style={styles.miniCheckText}>SELECTED</Text>
                              </View>
                            )}
                            <TouchableOpacity 
                              style={styles.removeCustomBtn}
                              onPress={(e) => {
                                e.stopPropagation?.();
                                handleDeleteCustomVow(cv.name);
                              }}
                              activeOpacity={0.8}
                              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            >
                              <Text style={styles.removeCustomBtnText}>✕</Text>
                            </TouchableOpacity>
                          </View>
                        </TouchableOpacity>
                      );
                    })}

                    {/* Custom Input Form or CTA Button (Available until 3 custom vows are created) */}
                    {customVowsList.length < 3 ? (
                      !isCustomVowOpen ? (
                        <TouchableOpacity
                          style={styles.openCustomBtn}
                          onPress={() => setIsCustomVowOpen(true)}
                          activeOpacity={0.85}
                        >
                          <Text style={styles.openCustomBtnText}>+ ADD YOUR OWN VOW</Text>
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
                              onPress={handleAddCustomVow}
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
                      )
                    ) : null}
                  </View>

                  {/* ─── OFFICIAL VOWS ─── */}
                  <View style={styles.sectionHeaderRow}>
                    <Text style={styles.sectionHeaderTitle}>OR CHOOSE FROM THE VAJRA VOWS</Text>
                  </View>

                  <View style={styles.vowsGrid}>
                    {RECOMMENDED_VOWS.map((vow) => {
                      const isSelected = selectedVows.some(v => v.name === vow.name);

                      return (
                        <TouchableOpacity
                          key={vow.name}
                          style={[styles.vowGridCard, isSelected && styles.vowGridCardSelected]}
                          onPress={() => handleToggleVow(vow)}
                          activeOpacity={0.85}
                        >
                          <View style={[styles.vowIconBadge, isSelected && styles.vowIconBadgeSelected]}>
                            {getVowVectorIcon(vow.name, isSelected ? '#0D0D0E' : '#D4AF37', 20)}
                          </View>
                          <Text style={[styles.vowGridTitle, isSelected && styles.vowGridTitleSelected]} numberOfLines={2}>
                            {vow.name}
                          </Text>
                          {vow.desc && (
                            <Text style={styles.vowGridDesc} numberOfLines={2}>{vow.desc}</Text>
                          )}
                          {isSelected && (
                            <View style={styles.miniCheckBadge}>
                              <CheckIcon size={10} color="#D4AF37" />
                              <Text style={styles.miniCheckText}>SELECTED</Text>
                            </View>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* Category Accordion */}
                  <View style={styles.accordionSection}>
                    <Text style={styles.sectionHeaderTitle}>EXPLORE BY CATEGORY</Text>

                    <View style={styles.accordionList}>
                      {CATEGORIES_KEYS.map((catKey) => {
                        const isExpanded = expandedCategory === catKey;
                        const categoryVows = CATEGORY_VOW_LIBRARY[catKey] || [];
                        const selectedCount = selectedVows.filter(v => v.category === catKey).length;

                        return (
                          <View key={catKey} style={styles.accordionCard}>
                            <TouchableOpacity
                              style={[styles.accordionHeader, isExpanded && styles.accordionHeaderActive]}
                              onPress={() => setExpandedCategory(isExpanded ? null : catKey)}
                              activeOpacity={0.85}
                            >
                              <View style={styles.accordionHeaderLeft}>
                                {getCategoryVectorIcon(catKey, '#D4AF37', 16)}
                                <Text style={styles.accordionCategoryTitle}>{catKey}</Text>
                                {selectedCount > 0 && (
                                  <View style={styles.countBadgePill}>
                                    <Text style={styles.countBadgeText}>{selectedCount}</Text>
                                  </View>
                                )}
                              </View>
                              <Text style={styles.chevronIcon}>{isExpanded ? '▲' : '▼'}</Text>
                            </TouchableOpacity>

                            {isExpanded && (
                              <View style={styles.accordionBody}>
                                <View style={styles.vowsGrid}>
                                  {categoryVows.map((vow) => {
                                    const isSelected = selectedVows.some(v => v.name === vow.name);

                                    return (
                                      <TouchableOpacity
                                        key={vow.name}
                                        style={[styles.vowGridCard, isSelected && styles.vowGridCardSelected]}
                                        onPress={() => handleToggleVow(vow)}
                                        activeOpacity={0.85}
                                      >
                                        <View style={[styles.vowIconBadge, isSelected && styles.vowIconBadgeSelected]}>
                                          {getVowVectorIcon(vow.name, isSelected ? '#0D0D0E' : '#D4AF37', 20)}
                                        </View>
                                        <Text style={[styles.vowGridTitle, isSelected && styles.vowGridTitleSelected]} numberOfLines={2}>
                                          {vow.name}
                                        </Text>
                                        {isSelected && (
                                          <View style={styles.miniCheckBadge}>
                                            <CheckIcon size={10} color="#D4AF37" />
                                            <Text style={styles.miniCheckText}>SELECTED</Text>
                                          </View>
                                        )}
                                      </TouchableOpacity>
                                    );
                                  })}
                                </View>
                              </View>
                            )}
                          </View>
                        );
                      })}
                    </View>
                  </View>
                </View>
              )}

              {/* ─── SCREEN 4: REVIEW (Covenant) ─────────────── */}
              {step === 'review' && (
                <View style={styles.screenWrapper}>
                  <View style={styles.screenHeader}>
                    <Text style={styles.screenHeading}>You're All Set.</Text>
                    <Text style={styles.screenSub}>Here is your path.</Text>
                  </View>

                  <Card style={styles.summaryCardFrame}>
                    {/* Identity Row */}
                    <View style={styles.identitySummaryHeader}>
                      <View style={[styles.summaryAvatarBadge, { backgroundColor: selectedPathInfo?.badgeBg || 'rgba(212, 175, 55, 0.16)' }]}>
                        {selectedPathInfo?.renderIcon('#D4AF37')}
                      </View>
                      <View style={styles.summaryIdentityMeta}>
                        <Text style={styles.summaryUserName}>{name.toUpperCase()}</Text>
                        <Text style={styles.summaryPathBadge}>
                          {selectedPathInfo?.label} • {selectedPathInfo?.sub}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.summaryDivider} />

                    {/* Commitments List */}
                    <View style={styles.summarySection}>
                      <Text style={styles.summarySectionLabel}>YOUR COMMITMENTS</Text>
                      <View style={styles.summaryVowsList}>
                        {selectedVows.map((vow, i) => (
                          <View key={i} style={styles.summaryVowRow}>
                            {getVowVectorIcon(vow.name, '#D4AF37', 18)}
                            <Text style={styles.summaryVowName}>{vow.name}</Text>
                          </View>
                        ))}
                      </View>
                    </View>

                    <View style={styles.summaryDivider} />

                    {/* Zen Quote */}
                    <View style={styles.summaryQuoteBox}>
                      <Text style={styles.summaryQuoteText}>
                        "Strength is built through repetition, not motivation."
                      </Text>
                    </View>
                  </Card>

                  {/* Reward Box */}
                  <View style={styles.rewardCardFrame}>
                    <View style={styles.rewardHeaderRow}>
                      <View style={styles.rewardTextCol}>
                        <Text style={styles.rewardDayText}>Tomorrow is Day 1</Text>
                        <Text style={styles.rewardSubText}>Your journey begins.</Text>
                      </View>
                      <View style={styles.rewardIconBadge}>
                        <LockIcon size={16} color="#D4AF37" />
                      </View>
                    </View>
                    <Text style={styles.rewardReqText}>
                      First Reward: <Text style={{ color: '#D4AF37', fontWeight: 'bold' }}>Warrior's Dawn</Text> (Unlock after maintaining your commitments for 7 consecutive days).
                    </Text>
                  </View>

                  <TouchableOpacity style={styles.primaryGoldBtn} onPress={handleFinish} activeOpacity={0.88}>
                    <Text style={styles.primaryGoldBtnText}>BEGIN DAY ONE →</Text>
                  </TouchableOpacity>
                </View>
              )}

            </Animated.View>
          </ScrollView>

          {/* ─── STICKY FOOTER FOR VOW SELECTION (Screen 3) ────── */}
          {step === 'vows' && (
            <View style={styles.stickyFooterContainer}>
              <TouchableOpacity
                style={[
                  styles.stickyActionButton,
                  selectedVows.length !== 3 && styles.stickyActionButtonDisabled
                ]}
                disabled={selectedVows.length !== 3}
                onPress={handleNextFromVows}
                activeOpacity={0.88}
              >
                <Text style={styles.stickyActionButtonText}>
                  {selectedVows.length === 3 
                    ? 'BEGIN MY JOURNEY →' 
                    : `SELECT 3 COMMITMENTS (${selectedVows.length}/3)`}
                </Text>
              </TouchableOpacity>
            </View>
          )}

        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0B0B0E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewport: {
    width: '100%',
    maxWidth: 440,
    height: '100%',
    flexDirection: 'column',
    position: 'relative',
  },
  
  // ─── Journey Progress Indicator ──────────────────────────────
  journeyIndicatorArea: {
    paddingHorizontal: spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 48 : 32,
    paddingBottom: spacing.xs,
    alignItems: 'center',
  },
  journeyTrackWrapper: {
    width: '100%',
    maxWidth: 240,
    alignItems: 'center',
  },
  journeyTrackRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
    paddingHorizontal: 6,
    marginBottom: 6,
  },
  journeyBaseLine: {
    position: 'absolute',
    left: 10,
    right: 10,
    top: 4,
    height: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    zIndex: 1,
  },
  journeyActiveLine: {
    position: 'absolute',
    left: 10,
    top: 4,
    height: 1.5,
    backgroundColor: '#D4AF37',
    zIndex: 2,
  },
  journeyStepDotFrame: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
  },
  journeyDotNode: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#141417',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  journeyDotNodeActive: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  journeyMetaCol: {
    alignItems: 'center',
    gap: 2,
  },
  journeyStepCountText: {
    fontFamily: typography.fontFamily.mono,
    fontSize: 8.5,
    fontWeight: typography.fontWeight.semibold,
    color: '#78736A',
    letterSpacing: 1.5,
  },
  journeyStepNameText: {
    fontFamily: typography.fontFamily.mono,
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    color: '#D4AF37',
    letterSpacing: 1.5,
  },

  // ─── Scroll Area ──────────────────────────────────────────────
  mainScroll: {
    flex: 1,
  },
  mainScrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  screenWrapper: {
    flex: 1,
    paddingVertical: spacing.md,
  },
  screenWrapperCentered: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: spacing.md,
    minHeight: 500,
  },

  // ─── EDITORIAL CINEMATIC STEP 1: IDENTITY ─────────────────────
  step1Root: {
    flex: 1,
    backgroundColor: '#060708',
    alignItems: 'center',
    justifyContent: 'center',
  },
  step1TopVignette: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 160,
  },
  step1BottomVignette: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 220,
  },
  step1SafeArea: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  step1Viewport: {
    width: '100%',
    maxWidth: 420,
    height: '100%',
    paddingHorizontal: 28,
    paddingTop: Platform.OS === 'ios' ? 44 : 32,
    paddingBottom: 36,
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  // TOP
  step1TopSection: {
    alignItems: 'center',
    width: '100%',
  },
  step1StepperRow: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  step1StepBarActive: {
    width: 24,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#F3BA45',
  },
  step1StepBarInactive: {
    width: 6,
    height: 2,
    borderRadius: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  step1StepLabel: {
    fontFamily: typography.fontFamily.uiMedium,
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.42)',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: 8,
    textAlign: 'center',
  },

  // CENTER
  step1CenterSection: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 'auto',
  },
  step1CrestWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  step1CrestGlowAura: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(243, 186, 69, 0.18)',
    ...Platform.select({
      web: {
        filter: 'blur(28px)',
      } as any,
    }),
  },
  step1CrestAsset: {
    width: 86,
    height: 86,
    opacity: 0.95,
  },
  step1GoldDivider: {
    width: 28,
    height: 1,
    backgroundColor: 'rgba(243, 186, 69, 0.55)',
    marginBottom: 16,
  },
  step1Heading: {
    fontFamily: typography.fontFamily.serif,
    fontSize: 21,
    fontWeight: '600',
    color: '#F5F6F8',
    letterSpacing: 1.4,
    textAlign: 'center',
    marginBottom: 32,
  },
  step1NameplateContainer: {
    width: '100%',
    alignItems: 'center',
  },
  step1Eyebrow: {
    fontFamily: typography.fontFamily.uiBold,
    fontSize: 10,
    fontWeight: '700',
    color: '#C5A059',
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    marginBottom: 10,
    textAlign: 'center',
  },
  step1TextInput: {
    width: '100%',
    textAlign: 'center',
    fontFamily: typography.fontFamily.serif,
    fontSize: 23,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 2.5,
    backgroundColor: 'transparent',
    borderWidth: 0,
    paddingVertical: 6,
    paddingHorizontal: 12,
    ...Platform.select({
      web: {
        outlineStyle: 'none',
        outlineWidth: 0,
        boxShadow: 'none',
      } as any,
    }),
  },
  step1Underline: {
    width: '100%',
    maxWidth: 280,
    height: 1.5,
    backgroundColor: 'rgba(243, 186, 69, 0.45)',
    marginTop: 6,
    borderRadius: 1,
    ...Platform.select({
      web: {
        transition: 'all 0.25s ease',
      } as any,
    }),
  },
  step1UnderlineFocused: {
    backgroundColor: '#F3BA45',
    ...Platform.select({
      web: {
        boxShadow: '0 0 12px rgba(243, 186, 69, 0.5)',
      },
      default: {
        shadowColor: '#F3BA45',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 8,
      },
    }),
  },
  step1SupportingText: {
    fontFamily: typography.fontFamily.ui,
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.42)',
    textAlign: 'center',
    marginTop: 14,
    letterSpacing: 0.2,
  },

  // BOTTOM CTA
  step1BottomSection: {
    width: '100%',
    alignItems: 'center',
  },
  step1PrimaryBtn: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 6,
    overflow: 'hidden',
    ...Platform.select({
      web: {
        boxShadow: '0 8px 24px rgba(243, 186, 69, 0.32)',
      },
      default: {
        shadowColor: '#F3BA45',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 16,
        elevation: 6,
      },
    }),
  },
  step1BtnGradient: {
    width: '100%',
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  step1PrimaryBtnText: {
    fontFamily: typography.fontFamily.uiBold,
    fontSize: 13,
    fontWeight: '700',
    color: '#0B0C0E',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  step1DisabledBtn: {
    width: '100%',
    maxWidth: 360,
    paddingVertical: 16,
    borderRadius: 6,
    backgroundColor: 'rgba(20, 23, 28, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  step1DisabledBtnText: {
    fontFamily: typography.fontFamily.uiBold,
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.25)',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },

  // ─── Screen Headers ───────────────────────────────────────────
  screenHeader: {
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  screenHeading: {
    fontFamily: typography.fontFamily.serif,
    fontSize: 24,
    color: '#F5F3EF',
    fontWeight: typography.fontWeight.bold,
    textAlign: 'center',
    marginBottom: 4,
  },
  screenSub: {
    fontSize: 13,
    color: '#B5AFA5',
    textAlign: 'center',
  },
  counterPill: {
    marginTop: spacing.sm,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
  },
  counterPillText: {
    fontSize: 11,
    color: '#D4AF37',
    fontWeight: typography.fontWeight.bold,
    letterSpacing: 1,
  },

  // ─── Screen 2: Path Cards ─────────────────────────────────────
  pathList: {
    gap: spacing.md,
  },
  pathCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(22, 22, 26, 0.88)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14,
    padding: 16,
    gap: 14,
  },
  pathEmblemBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pathMetaCol: {
    flex: 1,
  },
  pathTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 3,
  },
  pathTitle: {
    fontFamily: typography.fontFamily.serif,
    fontSize: 16,
    color: '#F5F3EF',
    fontWeight: typography.fontWeight.bold,
    letterSpacing: 1,
  },
  pathSubBadge: {
    fontSize: 9,
    color: '#78736A',
    fontFamily: typography.fontFamily.mono,
    letterSpacing: 0.5,
  },
  pathDescText: {
    fontSize: 12,
    color: colors.text.secondary,
    lineHeight: 16,
  },
  selectCheckCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectCheckCircleActive: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },

  // ─── Screen 3: Commitments Grid ───────────────────────────────
  sectionHeaderRow: {
    marginBottom: spacing.sm,
  },
  sectionHeaderTitle: {
    fontSize: 10,
    fontFamily: typography.fontFamily.mono,
    color: '#D4AF37',
    letterSpacing: 1.5,
    fontWeight: typography.fontWeight.bold,
  },
  vowsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: spacing.lg,
  },
  vowGridCard: {
    width: '31%',
    backgroundColor: 'rgba(22, 22, 26, 0.88)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 110,
  },
  vowGridCardSelected: {
    borderColor: '#D4AF37',
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
  },
  vowIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  vowIconBadgeSelected: {
    backgroundColor: '#D4AF37',
  },
  vowGridTitle: {
    fontSize: 11,
    color: '#F5F3EF',
    textAlign: 'center',
    fontFamily: typography.fontFamily.medium,
    lineHeight: 15,
  },
  vowGridTitleSelected: {
    color: '#D4AF37',
    fontWeight: 'bold',
  },
  vowGridDesc: {
    fontSize: 9,
    color: '#78736A',
    textAlign: 'center',
    marginTop: 4,
  },
  miniCheckBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
  },
  miniCheckText: {
    fontSize: 7.5,
    color: '#D4AF37',
    fontWeight: 'bold',
  },

  // Accordion
  accordionSection: {
    marginTop: spacing.md,
  },
  accordionList: {
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  accordionCard: {
    borderRadius: 10,
    backgroundColor: 'rgba(22, 22, 26, 0.6)',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  accordionHeaderActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  accordionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  accordionCategoryTitle: {
    fontSize: 13,
    color: '#F5F3EF',
    fontFamily: typography.fontFamily.medium,
  },
  countBadgePill: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  countBadgeText: {
    fontSize: 9,
    color: '#0D0D0E',
    fontWeight: 'bold',
  },
  chevronIcon: {
    fontSize: 10,
    color: '#78736A',
  },
  accordionBody: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  customFormBox: {
    gap: 8,
  },
  customFormTitle: {
    fontSize: 10,
    color: '#D4AF37',
    fontFamily: typography.fontFamily.mono,
    letterSpacing: 1,
  },
  customInput: {
    backgroundColor: 'rgba(20, 20, 24, 0.82)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#F5F3EF',
    fontSize: 13,
    fontFamily: typography.fontFamily.regular,
  },
  // ─── Top Custom Vow Section Styles ─────────────────────────
  customVowSectionCard: {
    backgroundColor: 'rgba(22, 22, 26, 0.72)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.28)',
    borderRadius: 14,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  customVowHeaderCol: {
    marginBottom: 12,
  },
  customVowPreTitle: {
    fontSize: 10,
    color: '#D4AF37',
    fontFamily: typography.fontFamily.mono,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    marginBottom: 3,
  },
  customVowMainTitle: {
    fontSize: 16,
    color: '#F5F3EF',
    fontFamily: typography.fontFamily.serif,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  customVowSubtitle: {
    fontSize: 12,
    color: '#9E9AA0',
    fontFamily: typography.fontFamily.regular,
    lineHeight: 16,
  },
  openCustomBtn: {
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  openCustomBtnText: {
    color: '#D4AF37',
    fontSize: 12,
    fontFamily: typography.fontFamily.medium,
    fontWeight: 'bold',
    letterSpacing: 1.2,
  },
  activeCustomVowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(22, 22, 26, 0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  activeCustomVowRowSelected: {
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    borderColor: '#D4AF37',
  },
  activeCustomVowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    marginRight: 8,
  },
  activeCustomIconBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeCustomIconBadgeSelected: {
    backgroundColor: '#D4AF37',
  },
  activeCustomMeta: {
    flex: 1,
  },
  activeCustomName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#F5F3EF',
    fontFamily: typography.fontFamily.medium,
  },
  activeCustomNameSelected: {
    color: '#D4AF37',
  },
  customVowCardRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  activeCustomDesc: {
    fontSize: 11,
    color: '#9E9AA0',
    fontFamily: typography.fontFamily.regular,
  },
  removeCustomBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  removeCustomBtnText: {
    color: '#E57373',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.8,
  },
  customFormActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
  },
  saveCustomBtn: {
    flex: 1,
    backgroundColor: '#D4AF37',
    borderRadius: 8,
    paddingVertical: 11,
    alignItems: 'center',
  },
  saveCustomBtnText: {
    color: '#0D0D0E',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1,
    fontFamily: typography.fontFamily.medium,
  },
  cancelCustomBtn: {
    paddingVertical: 11,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  cancelCustomBtnText: {
    color: '#78736A',
    fontSize: 11,
    fontFamily: typography.fontFamily.regular,
  },

  // Sticky Footer
  stickyFooterContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(11, 11, 14, 0.96)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    zIndex: 99,
  },
  stickyActionButton: {
    width: '100%',
    backgroundColor: '#D4AF37',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  stickyActionButtonDisabled: {
    backgroundColor: '#1E1E22',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  stickyActionButtonText: {
    color: '#0D0D0E',
    fontFamily: typography.fontFamily.medium,
    fontWeight: typography.fontWeight.bold,
    fontSize: 13,
    letterSpacing: 1.5,
  },

  // ─── Screen 4: Review Summary ─────────────────────────────────
  summaryCardFrame: {
    backgroundColor: 'rgba(22, 22, 26, 0.88)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  identitySummaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  summaryAvatarBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryIdentityMeta: {
    flex: 1,
  },
  summaryUserName: {
    fontFamily: typography.fontFamily.serif,
    fontSize: 20,
    color: '#F5F3EF',
    fontWeight: typography.fontWeight.bold,
    letterSpacing: 1,
  },
  summaryPathBadge: {
    fontSize: 10,
    color: '#D4AF37',
    fontFamily: typography.fontFamily.mono,
    marginTop: 2,
    letterSpacing: 0.5,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginVertical: spacing.md,
  },
  summarySection: {
    marginVertical: 2,
  },
  summarySectionLabel: {
    fontSize: 10,
    color: '#78736A',
    fontFamily: typography.fontFamily.mono,
    letterSpacing: 1.5,
    marginBottom: spacing.sm,
  },
  summaryVowsList: {
    gap: 10,
  },
  summaryVowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  summaryVowName: {
    fontSize: 14,
    color: '#F5F3EF',
    fontFamily: typography.fontFamily.medium,
  },
  summaryQuoteBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 10,
    padding: 10,
  },
  summaryQuoteText: {
    fontSize: 12,
    color: colors.text.secondary,
    fontStyle: 'italic',
    textAlign: 'center',
  },

  // Reward Box
  rewardCardFrame: {
    backgroundColor: 'rgba(22, 22, 26, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14,
    padding: spacing.md,
    marginBottom: spacing.xl,
  },
  rewardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  rewardTextCol: {},
  rewardDayText: {
    fontSize: 14,
    color: '#F5F3EF',
    fontFamily: typography.fontFamily.serif,
    fontWeight: typography.fontWeight.bold,
  },
  rewardSubText: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  rewardIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rewardReqText: {
    fontSize: 11,
    color: '#78736A',
    lineHeight: 16,
  },
  primaryGoldBtn: {
    backgroundColor: '#F3BA45',
    paddingVertical: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F3BA45',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryGoldBtnText: {
    color: '#0B0C0E',
    fontFamily: typography.fontFamily.uiBold,
    fontSize: 14,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: 1,
  },
  disabledBtn: {
    backgroundColor: '#14171C',
    borderWidth: 1,
    borderColor: '#262A33',
    shadowOpacity: 0,
    elevation: 0,
  },
});

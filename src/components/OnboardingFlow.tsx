import React, { useState } from 'react';
import { View, StyleSheet, ImageBackground, TextInput, TouchableOpacity, ScrollView, Alert, Dimensions, Platform } from 'react-native';
import { useAppStore } from '../store/useAppStore';
import { theme } from '../theme';
import { Text } from './Text';
import { Card } from './Card';
import { PathType } from '../types';
import { VajraLogo } from './VajraLogo';


const { width, height } = Dimensions.get('window');

interface VowOption {
  name: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
}

const DEFAULT_VOW_OPTIONS: VowOption[] = [
  { name: 'Wake before 6 AM', difficulty: 'medium', category: 'Physical' },
  { name: 'Workout 45 min', difficulty: 'medium', category: 'Physical' },
  { name: 'Cold shower', difficulty: 'hard', category: 'Physical' },
  { name: 'No social media before noon', difficulty: 'medium', category: 'Digital' },
  { name: 'No social media (full day)', difficulty: 'hard', category: 'Digital' },
  { name: 'Asleep by 11 PM', difficulty: 'medium', category: 'Sleep' },
  { name: 'Read 20 pages', difficulty: 'easy', category: 'Learning' },
  { name: 'Study 1 hour', difficulty: 'medium', category: 'Learning' },
  { name: 'Deep work 2hr block', difficulty: 'hard', category: 'Productivity' },
  { name: 'Meditate 10 min', difficulty: 'easy', category: 'Mental' },
  { name: 'Porn-free day', difficulty: 'hard', category: 'Mental' },
  { name: 'Keep a promise made', difficulty: 'easy', category: 'Character' }
];

export function OnboardingFlow() {
  const { completeOnboarding } = useAppStore();
  const [step, setStep] = useState<'hook' | 'path' | 'vows'>('hook');
  const [name, setName] = useState('');
  const [selectedPath, setSelectedPath] = useState<PathType | null>(null);
  const [selectedVows, setSelectedVows] = useState<VowOption[]>([]);

  const handleNextFromHook = () => {
    if (!name.trim()) {
      Alert.alert('Identify Yourself', 'Enter your name to begin the self-mastery path.');
      return;
    }
    setStep('path');
  };

  const handleNextFromPath = () => {
    if (!selectedPath) {
      Alert.alert('Choose a Path', 'You must choose an identity path to align your commitments.');
      return;
    }
    setStep('vows');
  };

  const handleToggleVow = (vow: VowOption) => {
    const isSelected = selectedVows.some(v => v.name === vow.name);
    if (isSelected) {
      setSelectedVows(selectedVows.filter(v => v.name !== vow.name));
    } else {
      if (selectedVows.length >= 3) {
        Alert.alert('Vow Limit Reached', 'V1 allows exactly 3 vows to ensure dedicated focus.');
        return;
      }
      setSelectedVows([...selectedVows, vow]);
    }
  };

  const handleFinish = () => {
    if (selectedVows.length < 3) {
      Alert.alert('Incomplete Vows', 'You must commit to exactly 3 vows for V1.');
      return;
    }
    if (selectedPath) {
      completeOnboarding(name, selectedPath, selectedVows);
    }
  };

  const paths = [
    { key: 'warrior', label: 'WARRIOR', focus: 'Physical + Endurance', desc: 'Focus on physical training, waking targets, and bodily self-mastery.' },
    { key: 'scholar', label: 'SCHOLAR', focus: 'Focus + Intelligence', desc: 'Dedicated to reading, deep study blocks, and mental concentration.' },
    { key: 'monk', label: 'MONK', focus: 'Mind + Self-Control', desc: 'Prioritizing meditation, clean digital spaces, and spiritual discipline.' },
    { key: 'creator', label: 'CREATOR', focus: 'Action + Production', desc: 'Committed to deep creation windows, shipping daily, and work output.' }
  ];

  return (
    <ImageBackground
      source={require('../../assets/images/dark_misty_mountains.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.darkOverlay} />
      
      <SafeAreaShim>
        {step === 'hook' && (
          <ScrollView 
            contentContainerStyle={styles.scrollContentHook} 
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.brandContainer}>
              <VajraLogo size={80} />
              <Text style={styles.brandTitle}>VAJRA</Text>
              <Text style={styles.brandSub}>BUILD AN UNBREAKABLE IDENTITY</Text>
            </View>

            <Card style={styles.infoCard}>
              <Text style={styles.bodyText}>
                Self-mastery is not a checklist. It is a tactical operating system for human character. 
                Declare your vows, align your peers, and forge your resilience.
              </Text>
            </Card>

            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>CHOOSE YOUR MONIKER</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter display name..."
                placeholderTextColor="#5A5A66"
                value={name}
                onChangeText={setName}
                maxLength={15}
              />
              <TouchableOpacity style={styles.primaryBtn} onPress={handleNextFromHook}>
                <Text style={styles.btnText}>BEGIN JOURNEY →</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}

        {step === 'path' && (
          <View style={styles.screenContainer}>
            <View style={styles.header}>
              <Text style={styles.title}>SELECT IDENTITY PATH</Text>
              <Text style={styles.subtitle}>Choose your primary archetype</Text>
            </View>

            <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollGrid} showsVerticalScrollIndicator={false}>
              {paths.map((p) => {
                const isSelected = selectedPath === p.key;
                return (
                  <TouchableOpacity
                    key={p.key}
                    onPress={() => setSelectedPath(p.key as PathType)}
                    activeOpacity={0.8}
                    style={styles.pathButton}
                  >
                    <Card style={[
                      styles.pathCard,
                      isSelected && styles.pathCardSelected
                    ]}>
                      <View style={styles.pathHeader}>
                        <Text style={[styles.pathLabel, isSelected && styles.accentText]}>
                          {p.label}
                        </Text>
                        <Text style={styles.pathFocus}>{p.focus}</Text>
                      </View>
                      <Text style={styles.pathDesc}>{p.desc}</Text>
                    </Card>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <TouchableOpacity style={[styles.primaryBtn, { marginTop: 12 }]} onPress={handleNextFromPath}>
              <Text style={styles.btnText}>SELECT PATH & VOWS →</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 'vows' && (
          <View style={styles.screenContainer}>
            <View style={styles.header}>
              <Text style={styles.title}>COMMIT TO THREE VOWS</Text>
              <Text style={styles.subtitle}>Selected: {selectedVows.length} / 3</Text>
            </View>

            <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.vowsList} showsVerticalScrollIndicator={false}>
              {DEFAULT_VOW_OPTIONS.map((vow) => {
                const isSelected = selectedVows.some(v => v.name === vow.name);
                
                let diffColor = theme.colors.secondary;
                if (vow.difficulty === 'medium') diffColor = theme.colors.accent;
                if (vow.difficulty === 'hard') diffColor = theme.colors.danger;

                return (
                  <TouchableOpacity
                    key={vow.name}
                    onPress={() => handleToggleVow(vow)}
                    activeOpacity={0.8}
                    style={styles.vowItemButton}
                  >
                    <Card style={[
                      styles.vowItemCard,
                      isSelected && styles.vowItemCardSelected
                    ]}>
                      <View style={styles.vowItemInfo}>
                        <Text style={styles.vowItemName}>{vow.name}</Text>
                        <Text style={styles.vowItemCategory}>{vow.category}</Text>
                      </View>
                      <View style={[styles.difficultyBadge, { borderColor: diffColor, backgroundColor: `${diffColor}12` }]}>
                        <Text style={[styles.difficultyText, { color: diffColor }]}>
                          {vow.difficulty.toUpperCase()} {vow.difficulty === 'hard' ? 'x2.0' : vow.difficulty === 'medium' ? 'x1.5' : 'x1.0'}
                        </Text>
                      </View>
                    </Card>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <TouchableOpacity 
              style={[
                styles.primaryBtn, 
                selectedVows.length < 3 && styles.disabledBtn
              ]} 
              disabled={selectedVows.length < 3}
              onPress={handleFinish}
            >
              <Text style={styles.btnText}>FORGE IDENTITY ⚡</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaShim>
    </ImageBackground>
  );
}

// Simple Helper component to handle Safe Area layout padding cleanly
function SafeAreaShim({ children }: { children: React.ReactNode }) {
  return <View style={styles.shimContainer}>{children}</View>;
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    ...Platform.select({
      web: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
      }
    })
  },
  darkOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(5, 5, 10, 0.88)', // Deep indigo luxury overlay
  },
  shimContainer: {
    flex: 1,
    paddingTop: 48,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  screenContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  scrollContentHook: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingBottom: 24,
  },
  brandContainer: {
    marginTop: 40,
    alignItems: 'center',
    gap: 8,
  },
  brandTitle: {
    fontFamily: theme.typography.fontFamily.mono,
    fontSize: 48,
    color: theme.colors.text.primary,
    letterSpacing: 4,
  },
  brandSub: {
    fontSize: 10,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.tertiary, // Cyan accent
    letterSpacing: 3,
  },
  infoCard: {
    backgroundColor: 'rgba(11, 11, 18, 0.75)',
    borderColor: '#1F1F35',
    borderWidth: 0.5,
    borderRadius: theme.spacing.borderRadius.card,
    padding: 20,
    marginVertical: 20,
    ...Platform.select({
      web: {
        backdropFilter: 'blur(20px)',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
      }
    })
  },
  bodyText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    lineHeight: 22,
    textAlign: 'center',
  },
  inputSection: {
    gap: 12,
    marginBottom: 40,
  },
  inputLabel: {
    fontSize: 9,
    letterSpacing: 1.5,
    color: theme.colors.text.tertiary,
    fontFamily: theme.typography.fontFamily.medium,
  },
  textInput: {
    backgroundColor: '#12121E',
    borderWidth: 0.5,
    borderColor: '#1E1E2E',
    borderRadius: theme.spacing.borderRadius.input,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#FFFFFF',
    fontSize: theme.typography.fontSize.sm,
  },
  primaryBtn: {
    backgroundColor: '#00E5FF', // Electric Cyan brand highlight
    paddingVertical: 14,
    borderRadius: theme.spacing.borderRadius.card,
    alignItems: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0 4px 20px rgba(0, 229, 255, 0.25)',
      },
      default: {
        shadowColor: '#00E5FF',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      }
    })
  },
  btnText: {
    color: theme.colors.text.dark,
    fontSize: 11,
    fontFamily: theme.typography.fontFamily.mono,
    letterSpacing: 2,
  },
  disabledBtn: {
    backgroundColor: '#3E3E4F',
    opacity: 0.5,
  },
  header: {
    marginVertical: 16,
    gap: 4,
  },
  title: {
    fontFamily: theme.typography.fontFamily.mono,
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text.primary,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
  },
  scrollGrid: {
    gap: 12,
    paddingBottom: 24,
  },
  pathButton: {
    width: '100%',
  },
  pathCard: {
    backgroundColor: 'rgba(11, 11, 18, 0.75)',
    borderColor: '#1E1E2E',
    borderWidth: 0.5,
    padding: 16,
    gap: 8,
    ...Platform.select({
      web: {
        backdropFilter: 'blur(20px)',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
      }
    })
  },
  pathCardSelected: {
    borderColor: '#00E5FF',
    backgroundColor: 'rgba(0, 229, 255, 0.08)',
  },
  pathHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pathLabel: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.text.primary,
  },
  pathFocus: {
    fontSize: 9,
    color: theme.colors.text.tertiary,
    fontFamily: theme.typography.fontFamily.medium,
    letterSpacing: 1,
  },
  pathDesc: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
    lineHeight: 18,
  },
  accentText: {
    color: '#00E5FF',
  },
  vowsList: {
    gap: 10,
    paddingBottom: 24,
  },
  vowItemButton: {
    width: '100%',
  },
  vowItemCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(11, 11, 18, 0.75)',
    borderColor: '#1E1E2E',
    borderWidth: 0.5,
    padding: 14,
    ...Platform.select({
      web: {
        backdropFilter: 'blur(20px)',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
      }
    })
  },
  vowItemCardSelected: {
    borderColor: '#00E5FF',
    backgroundColor: 'rgba(0, 229, 255, 0.08)',
  },
  vowItemInfo: {
    flex: 1,
    marginRight: 12,
  },
  vowItemName: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.primary,
    fontFamily: theme.typography.fontFamily.medium,
  },
  vowItemCategory: {
    fontSize: 9,
    color: theme.colors.text.tertiary,
    marginTop: 2,
  },
  difficultyBadge: {
    borderWidth: 0.5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.spacing.borderRadius.pill,
  },
  difficultyText: {
    fontSize: 9,
    fontFamily: theme.typography.fontFamily.medium,
  },
});

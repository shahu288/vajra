import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ImageBackground, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../store/useAppStore';
import { theme } from '../theme';
import { Text } from '../components/Text';
import { Card } from '../components/Card';
import { supabase } from '../services/supabase';

export default function ProfileScreen() {
  const { user } = useAppStore();

  const [oneLine, setOneLine] = useState('');
  const [gratitude1, setGratitude1] = useState('');
  const [gratitude2, setGratitude2] = useState('');
  const [gratitude3, setGratitude3] = useState('');
  const [isSavingJournal, setIsSavingJournal] = useState(false);

  if (!user) return null;

  const milestones = [
    {
      id: 'm1',
      title: 'Iron Resolve',
      desc: '7-Day Perfect Streak',
      icon: '⚡',
      unlocked: true,
      rarity: 'Common'
    },
    {
      id: 'm2',
      title: 'Monolithic Will',
      desc: '14-Day Perfect Streak',
      icon: '🏔️',
      unlocked: true,
      rarity: 'Rare'
    },
    {
      id: 'm3',
      title: 'Shield Defender',
      desc: 'Vouched a Teammate',
      icon: '🛡️',
      unlocked: false,
      rarity: 'Epic'
    },
    {
      id: 'm4',
      title: 'Unbreakable',
      desc: 'Discipline Score 100',
      icon: '💎',
      unlocked: false,
      rarity: 'Mythic'
    }
  ];

  const handleShare = (title: string, desc: string) => {
    Alert.alert(
      'Share Milestone',
      `Locked in: "${title}" - ${desc}. Ready to share with your network.`,
      [{ text: 'VJR Link Copied', style: 'default' }]
    );
  };

  const handleSaveJournal = async () => {
    if (!oneLine.trim() || !gratitude1.trim() || !gratitude2.trim() || !gratitude3.trim()) {
      Alert.alert('Incomplete Entry', 'Please write your one-line log and all three gratitude items.');
      return;
    }

    setIsSavingJournal(true);
    const todayStr = new Date().toISOString().split('T')[0];

    try {
      if (user.id !== 'mock-user-id') {
        const { error } = await supabase
          .from('journal_entries')
          .upsert({
            user_id: user.id,
            log_date: todayStr,
            one_line: oneLine,
            three_good_things: [gratitude1, gratitude2, gratitude3],
            mood_at_entry: 'neutral'
          });

        if (error) throw error;
      }
      
      Alert.alert('Journal Saved', 'Your private Inner Log entry has been locked in.');
      setOneLine('');
      setGratitude1('');
      setGratitude2('');
      setGratitude3('');
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to save your journal entry.');
    } finally {
      setIsSavingJournal(false);
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/images/dark_misty_mountains.png')}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.darkOverlay} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>PROFILE</Text>
          <Text style={styles.headerSub}>Self-Mastery Core</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* User Identity Info */}
          <Card style={styles.identityCard}>
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarLabel}>
                {user.display_name.substring(0, 2).toUpperCase()}
              </Text>
            </View>
            <View style={styles.identityInfo}>
              <Text style={styles.userName}>{user.display_name}</Text>
              <View style={styles.pathBadge}>
                <Text style={styles.pathText}>{user.identity_path.toUpperCase()}</Text>
              </View>
            </View>
          </Card>

          {/* Level & XP */}
          <Card style={styles.levelCard}>
            <View style={styles.levelHeader}>
              <Text style={styles.levelLabel}>LEVEL</Text>
              <Text style={styles.levelValue}>{user.level} (Lv.3)</Text>
            </View>
            <View style={styles.xpBarContainer}>
              <View style={[styles.xpBarFill, { width: '45%' }]} />
            </View>
            <Text style={styles.xpProgressText}>340 / 1000 XP to next tier</Text>
          </Card>

          {/* Milestone Sharecards */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>MILESTONE SHARECARDS</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.milestoneScroll}>
              {milestones.map((m) => {
                return (
                  <Card key={m.id} style={[styles.milestoneCard, !m.unlocked && styles.lockedMilestone]}>
                    <View style={styles.milestoneHeader}>
                      <Text style={styles.milestoneIcon}>{m.unlocked ? m.icon : '🔒'}</Text>
                      <Text style={styles.milestoneRarity}>{m.rarity.toUpperCase()}</Text>
                    </View>
                    <View style={styles.milestoneBody}>
                      <Text numberOfLines={1} style={styles.milestoneTitle}>{m.title}</Text>
                      <Text numberOfLines={2} style={styles.milestoneDesc}>{m.desc}</Text>
                    </View>
                    {m.unlocked ? (
                      <TouchableOpacity style={styles.shareBtn} onPress={() => handleShare(m.title, m.desc)}>
                        <Text style={styles.shareBtnText}>Share ↗</Text>
                      </TouchableOpacity>
                    ) : (
                      <Text style={styles.lockedText}>LOCKED</Text>
                    )}
                  </Card>
                );
              })}
            </ScrollView>
          </View>

          {/* Inner Log (Private Journal) */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>INNER LOG (PRIVATE)</Text>
            <Card style={styles.journalCard}>
              <Text style={styles.journalPrompt}>How did you defend your discipline today?</Text>
              <TextInput
                style={styles.oneLineInput}
                placeholder="One sentence summary of today..."
                placeholderTextColor={theme.colors.text.tertiary}
                value={oneLine}
                onChangeText={setOneLine}
              />
              
              <Text style={styles.journalPrompt}>Three Good Things (Gratitude):</Text>
              <TextInput
                style={styles.gratitudeInput}
                placeholder="1. First good thing..."
                placeholderTextColor={theme.colors.text.tertiary}
                value={gratitude1}
                onChangeText={setGratitude1}
              />
              <TextInput
                style={styles.gratitudeInput}
                placeholder="2. Second good thing..."
                placeholderTextColor={theme.colors.text.tertiary}
                value={gratitude2}
                onChangeText={setGratitude2}
              />
              <TextInput
                style={styles.gratitudeInput}
                placeholder="3. Third good thing..."
                placeholderTextColor={theme.colors.text.tertiary}
                value={gratitude3}
                onChangeText={setGratitude3}
              />

              <TouchableOpacity 
                style={[styles.saveBtn, isSavingJournal && styles.disabledBtn]} 
                onPress={handleSaveJournal}
                disabled={isSavingJournal}
              >
                <Text style={styles.saveBtnText}>
                  {isSavingJournal ? 'Locking in...' : 'LOCK IN ENTRY'}
                </Text>
              </TouchableOpacity>
            </Card>
          </View>
        </ScrollView>
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
    paddingBottom: 100, // tab bar inset buffer
    gap: 20,
  },
  identityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: theme.spacing.borderRadius.avatar, // Geometric square profile (4px)
    backgroundColor: theme.colors.border.lowContrast,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: theme.colors.border.lowContrast,
  },
  avatarLabel: {
    fontFamily: theme.typography.fontFamily.mono,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.primary, // Vibrant Orange
  },
  identityInfo: {
    gap: 4,
  },
  userName: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.text.primary,
  },
  pathBadge: {
    backgroundColor: `${theme.colors.tertiary}15`,
    borderColor: theme.colors.tertiary,
    borderWidth: 0.5,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.spacing.borderRadius.card,
    alignSelf: 'flex-start',
  },
  pathText: {
    fontSize: 9,
    color: theme.colors.tertiary,
    fontFamily: theme.typography.fontFamily.mono,
    letterSpacing: 1,
  },
  levelCard: {
    gap: 10,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  levelLabel: {
    fontSize: theme.typography.fontSize.xxs,
    color: theme.colors.text.tertiary,
    letterSpacing: 1,
  },
  levelValue: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.primary,
    fontFamily: theme.typography.fontFamily.medium,
  },
  xpBarContainer: {
    height: 8,
    backgroundColor: '#1E1E2E',
    borderRadius: 4,
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    backgroundColor: '#00E5FF', // Electric Cyan matching the logo
    borderRadius: 4,
    ...Platform.select({
      web: {
        boxShadow: '0 0 10px rgba(0, 229, 255, 0.5)',
      }
    })
  },
  xpProgressText: {
    fontSize: theme.typography.fontSize.xxs,
    color: theme.colors.text.secondary,
    fontFamily: theme.typography.fontFamily.mono,
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
  milestoneScroll: {
    gap: 12,
    paddingBottom: 4,
  },
  milestoneCard: {
    width: 140,
    padding: 10,
    justifyContent: 'space-between',
    minHeight: 130,
    borderRadius: theme.spacing.borderRadius.card,
    backgroundColor: 'rgba(11, 11, 18, 0.75)',
    borderColor: '#1E1E2E',
    borderWidth: 0.5,
    ...Platform.select({
      web: {
        backdropFilter: 'blur(20px)',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
      }
    })
  },
  lockedMilestone: {
    opacity: 0.4,
    borderStyle: 'dashed',
    borderColor: '#4E4E5F',
  },
  milestoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  milestoneIcon: {
    fontSize: 16,
  },
  milestoneRarity: {
    fontSize: 7,
    fontFamily: theme.typography.fontFamily.mono,
    color: theme.colors.text.tertiary,
  },
  milestoneBody: {
    marginTop: 6,
    gap: 2,
  },
  milestoneTitle: {
    fontSize: 11,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.text.primary,
  },
  milestoneDesc: {
    fontSize: 8,
    color: theme.colors.text.secondary,
  },
  shareBtn: {
    marginTop: 8,
    paddingVertical: 4,
    borderWidth: 0.5,
    borderColor: theme.colors.tertiary,
    borderRadius: theme.spacing.borderRadius.card,
    alignItems: 'center',
  },
  shareBtnText: {
    fontSize: 8,
    color: theme.colors.tertiary,
    fontFamily: theme.typography.fontFamily.mono,
  },
  lockedText: {
    fontSize: 8,
    color: theme.colors.text.tertiary,
    fontFamily: theme.typography.fontFamily.mono,
    textAlign: 'center',
    marginTop: 8,
  },
  journalCard: {
    gap: 12,
  },
  journalPrompt: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
    fontFamily: theme.typography.fontFamily.medium,
  },
  oneLineInput: {
    backgroundColor: '#12121E',
    borderWidth: 0.5,
    borderColor: '#1E1E2E',
    borderRadius: theme.spacing.borderRadius.input,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#FFFFFF',
    fontSize: theme.typography.fontSize.sm,
  },
  gratitudeInput: {
    backgroundColor: '#12121E',
    borderWidth: 0.5,
    borderColor: '#1E1E2E',
    borderRadius: theme.spacing.borderRadius.input,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#FFFFFF',
    fontSize: theme.typography.fontSize.sm,
    marginBottom: 2,
  },
  saveBtn: {
    backgroundColor: '#FF5A00', // Living Flame Orange
    paddingVertical: 12,
    borderRadius: theme.spacing.borderRadius.card,
    alignItems: 'center',
    marginTop: 8,
    ...Platform.select({
      web: {
        boxShadow: '0 4px 20px rgba(255, 90, 0, 0.25)',
      }
    })
  },
  saveBtnText: {
    color: '#05050A',
    fontFamily: theme.typography.fontFamily.mono,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  disabledBtn: {
    backgroundColor: theme.colors.text.tertiary,
    opacity: 0.5,
  },
});

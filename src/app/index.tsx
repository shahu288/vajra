import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore, getVowConfig } from '../store/useAppStore';
import { getScoreTier } from '../utils/math';
import { theme } from '../theme';
import { Text } from '../components/Text';
import Flame from '../components/Flame';
import { OnboardingFlow } from '../components/OnboardingFlow';
import { VajraLogo } from '../components/VajraLogo';
import { VowDetailModal } from '../components/VowDetailModal';

export default function HomeScreen() {
  const { user, activeVows, vowLogs, vowProgress, vowReflections, showOnboarding } = useAppStore();
  const [selectedVowId, setSelectedVowId] = useState<string | null>(null);
  const [detailVisible, setDetailVisible] = useState<boolean>(false);

  if (showOnboarding) {
    return <OnboardingFlow />;
  }

  if (!user) return null;

  const score = user.discipline_score;
  const tier = getScoreTier(score);

  // Compute check-in status for user
  const userKept = activeVows.length > 0 && activeVows.every(v => vowLogs[v.id]);

  // Construct status list for the 4-Person Squad HUD Pulse
  const squadStatusList = [
    { id: 'user', initial: 'A', kept: userKept },
    { id: 'member-1', initial: 'R', kept: true },
    { id: 'member-2', initial: 'S', kept: true },
    { id: 'member-3', initial: 'K', kept: false }
  ];

  return (
    <View style={styles.container}>
      <View style={styles.viewport}>
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
          {/* APP HEADER */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <VajraLogo size={28} />
              <View style={styles.headerTitleGroup}>
                <Text style={styles.headerTitle}>VAJRA</Text>
                <Text style={styles.headerSub}>
                  {user.identity_path.toUpperCase()} • LV.3
                </Text>
              </View>
            </View>
            <View style={styles.headerRight}>
              <Text style={styles.shieldText}>
                🛡️ {user.recovery_shields} Shield{user.recovery_shields === 1 ? '' : 's'}
              </Text>
            </View>
          </View>

          <ScrollView 
            contentContainerStyle={styles.scrollContent} 
            showsVerticalScrollIndicator={false}
          >
            {/* THE MONOLITH */}
            <View style={styles.monolith}>
              {/* THE HERO CORE */}
              <View style={styles.heroCore}>
                <View style={styles.flameContainer}>
                  <Flame score={score} />
                </View>
                
                <Text style={styles.scoreText}>{score}</Text>
                
                <View style={styles.badgePill}>
                  <Text style={styles.badgeText}>{tier.toUpperCase()}</Text>
                </View>
              </View>

              {/* SQUAD HUD LAYER */}
              <View style={styles.squadHud}>
                <Text style={styles.hudTitle}>SQUAD ALIGNMENT</Text>
                <View style={styles.squadLineContainer}>
                  {squadStatusList.map((status, index) => {
                    const isLast = index === squadStatusList.length - 1;
                    return (
                      <React.Fragment key={status.id}>
                        <View style={[
                          styles.squadNode,
                          status.kept ? styles.nodeKept : styles.nodeLagging
                        ]}>
                          <Text style={[
                            styles.nodeText,
                            status.kept ? styles.nodeTextKept : styles.nodeTextLagging
                          ]}>
                            {status.initial}
                          </Text>
                        </View>
                        {!isLast && <View style={styles.squadLine} />}
                      </React.Fragment>
                    );
                  })}
                </View>
              </View>

              {/* DAILY VOWS STACK */}
              <View style={styles.vowsStack}>
                <Text style={styles.vowsTitle}>DAILY COMMITMENTS</Text>
                <View style={styles.vowsList}>
                  {activeVows.map((vow) => {
                    const isCompleted = vowLogs[vow.id] || false;
                    const progress = vowProgress[vow.id] || 0;
                    const note = vowReflections[vow.id] || '';
                    const config = getVowConfig(vow.custom_name || '');
                    
                    let statusText = 'PENDING';
                    let statusColor = '#8A8A93'; // Slate grey for pending
                    
                    if (isCompleted) {
                      statusText = 'HONORED';
                      statusColor = '#5DCAA5'; // Teal
                    } else if (note !== '' || progress > 0) {
                      statusText = 'LAPSED';
                      statusColor = '#E24B4A'; // Red
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
              </View>
            </View>
          </ScrollView>
          <VowDetailModal 
            vowId={selectedVowId}
            visible={detailVisible}
            onClose={() => setDetailVisible(false)}
          />
        </SafeAreaView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#05050A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewport: {
    width: '100%',
    maxWidth: 430, // Force strict centered mobile-first
    height: '100%',
    backgroundColor: '#08080E',
    borderLeftWidth: 0.5,
    borderRightWidth: 0.5,
    borderColor: '#161626',
    overflow: 'hidden',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#12121E',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitleGroup: {
    gap: 2,
  },
  headerTitle: {
    fontFamily: theme.typography.fontFamily.mono,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 3,
  },
  headerSub: {
    fontSize: 9,
    fontFamily: theme.typography.fontFamily.mono,
    color: theme.colors.text.secondary,
    letterSpacing: 1.5,
  },
  headerRight: {
    justifyContent: 'center',
  },
  shieldText: {
    fontSize: 9,
    fontFamily: theme.typography.fontFamily.mono,
    color: '#D4AF37', // Gold shield text
    borderWidth: 0.5,
    borderColor: '#D4AF37',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.spacing.borderRadius.card,
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
  },
  scrollContent: {
    paddingBottom: 100, // tab bar buffer
    paddingHorizontal: 20,
  },
  monolith: {
    backgroundColor: 'rgba(13, 13, 20, 0.85)', // Monolith base charcoal
    borderRadius: theme.spacing.borderRadius.card,
    borderColor: '#1C1C2C',
    borderWidth: 0.5,
    padding: 24,
    marginTop: 20,
    gap: 28,
    // Ambient Gold/Amber aura box shadow
    ...Platform.select({
      web: {
        backdropFilter: 'blur(20px)',
        boxShadow: '0 0 50px rgba(212, 175, 55, 0.08), 0 8px 32px rgba(0, 0, 0, 0.4)',
      },
      default: {
        shadowColor: '#D4AF37',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.08,
        shadowRadius: 25,
        elevation: 8,
      }
    }),
  },
  heroCore: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  flameContainer: {
    width: 130,
    height: 130,
    marginBottom: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 64,
    fontFamily: theme.typography.fontFamily.mono,
    color: '#FFFFFF',
    fontWeight: '300',
    letterSpacing: -2,
    lineHeight: 68,
    textAlign: 'center',
  },
  badgePill: {
    borderColor: '#D4AF37', // Gold pill
    borderWidth: 0.5,
    borderRadius: theme.spacing.borderRadius.pill,
    paddingHorizontal: 12,
    paddingVertical: 3,
    marginTop: 8,
    backgroundColor: 'rgba(212, 175, 55, 0.04)',
    alignSelf: 'center',
  },
  badgeText: {
    fontSize: 9,
    fontFamily: theme.typography.fontFamily.mono,
    color: '#D4AF37',
    fontWeight: 'bold',
    letterSpacing: 2,
    textAlign: 'center',
  },
  squadHud: {
    alignItems: 'center',
    gap: 12,
    borderTopWidth: 0.5,
    borderTopColor: '#1A1A24',
    paddingTop: 20,
  },
  hudTitle: {
    fontSize: 9,
    fontFamily: theme.typography.fontFamily.mono,
    color: theme.colors.text.tertiary,
    letterSpacing: 2,
  },
  squadLineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 20,
  },
  squadNode: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    position: 'relative',
  },
  nodeKept: {
    borderColor: '#D4AF37', // Gold node
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
  },
  nodeLagging: {
    borderColor: '#3F3F46', // Ash gray node
    backgroundColor: '#18181B',
  },
  nodeText: {
    fontSize: 9,
    fontFamily: theme.typography.fontFamily.mono,
    fontWeight: 'bold',
  },
  nodeTextKept: {
    color: '#D4AF37',
  },
  nodeTextLagging: {
    color: theme.colors.text.tertiary,
  },
  squadLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#1A1A24',
    marginHorizontal: -1,
  },
  vowsStack: {
    gap: 16,
    borderTopWidth: 0.5,
    borderTopColor: '#161626',
    paddingTop: 20,
  },
  vowsTitle: {
    fontSize: 9,
    fontFamily: theme.typography.fontFamily.mono,
    color: theme.colors.text.tertiary,
    letterSpacing: 2,
  },
  vowsList: {
    gap: 12,
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
});

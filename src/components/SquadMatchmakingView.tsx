import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { Text } from './Text';
import { Card } from './Card';
import { useTheme } from '../theme';
import { MatchmakingState } from '../types';

interface SquadMatchmakingViewProps {
  matchmakingState: MatchmakingState;
  onExploreApp?: () => void;
}

export const SquadMatchmakingView: React.FC<SquadMatchmakingViewProps> = ({
  matchmakingState
}) => {
  const { colors, isDark } = useTheme();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.12,
          duration: 1600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true
        }),
        Animated.timing(pulseAnim, {
          toValue: 1.0,
          duration: 1600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true
        })
      ])
    );

    const rotate = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 8000,
        easing: Easing.linear,
        useNativeDriver: true
      })
    );

    pulse.start();
    rotate.start();

    return () => {
      pulse.stop();
      rotate.stop();
    };
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  const filledSeats = matchmakingState.filled_seats || 1;
  const members = matchmakingState.members || [];
  const goldAccentColor = colors.primary;

  return (
    <View style={styles.container}>
      <View style={styles.indicatorWrapper}>
        <Animated.View
          style={[
            styles.outerHalo,
            {
              borderColor: colors.primary,
              backgroundColor: isDark ? 'rgba(201, 154, 90, 0.05)' : 'rgba(199, 154, 75, 0.08)',
              transform: [{ scale: pulseAnim }, { rotate: spin }]
            }
          ]}
        />
        <Animated.View 
          style={[
            styles.innerCore, 
            { 
              backgroundColor: colors.bg.surface, 
              borderColor: colors.border.default,
              transform: [{ scale: pulseAnim }] 
            }
          ]}
        >
          <Text style={styles.coreSymbol}>🛡️</Text>
        </Animated.View>
      </View>

      <View style={styles.titleSection}>
        <Text style={[styles.mainTitle, { color: colors.text.primary }]}>
          Finding your Discipline Circle...
        </Text>
        <Text style={[styles.statusDetail, { color: goldAccentColor }]}>
          "We're matching you with fellow builders. You'll automatically join a squad as soon as it's ready."
        </Text>
      </View>

      <Card style={[styles.seatCard, { backgroundColor: colors.bg.card, borderColor: colors.border.default }]}>
        <View style={[styles.seatHeader, { borderBottomColor: colors.border.separator }]}>
          <Text style={[styles.seatTitle, { color: goldAccentColor }]}>
            SEATS FILLED ({filledSeats} / 4)
          </Text>
          <Text style={[styles.seatSubtitle, { color: colors.text.secondary }]}>
            {filledSeats === 1 ? "You've claimed the first seat." : `${filledSeats} warriors assembled.`}
          </Text>
        </View>

        <View style={styles.seatsList}>
          {[0, 1, 2, 3].map((index) => {
            const member = members[index];
            const isFilled = !!member;
            const isUser = member?.is_me;

            return (
              <View 
                key={index} 
                style={[
                  styles.seatRow, 
                  {
                    backgroundColor: isFilled ? (isDark ? 'rgba(201, 154, 90, 0.08)' : 'rgba(199, 154, 75, 0.12)') : colors.bg.surfaceAlt,
                    borderColor: isFilled ? colors.primary : colors.border.subtle,
                  }
                ]}
              >
                <View style={styles.seatIndicator}>
                  <Text style={styles.seatDot}>
                    {isFilled ? '🟢' : '⚪'}
                  </Text>
                </View>

                <View style={styles.seatInfo}>
                  <Text style={[styles.seatMemberName, { color: isUser ? goldAccentColor : (isFilled ? colors.text.primary : colors.text.secondary) }]}>
                    {isUser
                      ? `${member.display_name} (You)`
                      : isFilled
                      ? member.display_name
                      : 'Waiting for companion...'}
                  </Text>
                  <Text style={[styles.seatSubtext, { color: colors.text.secondary }]}>
                    {isFilled
                      ? `${member.identity_path.toUpperCase()} • ${member.discipline_score} MSS`
                      : 'Matching based on streak & discipline score'}
                  </Text>
                </View>

                <View style={[styles.seatStatusBadge, { backgroundColor: isFilled ? goldAccentColor : colors.border.lowContrast }]}>
                  <Text style={[styles.seatBadgeText, { color: isFilled ? (isDark ? '#0D0D0E' : '#1F1B18') : colors.text.secondary }]}>
                    {isFilled ? 'CLAIMED' : 'OPEN'}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </Card>

      <View style={styles.nonBlockingFooter}>
        <Text style={[styles.nonBlockingText, { color: goldAccentColor }]}>
          ⚡ Matchmaking runs automatically in the background.
        </Text>
        <Text style={[styles.nonBlockingSub, { color: colors.text.secondary }]}>
          You will be notified as soon as all 4 seats are assembled. Feel free to use all other features of Vajra.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    alignItems: 'center',
    justifyContent: 'flex-start'
  },
  indicatorWrapper: {
    width: 90,
    height: 90,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12
  },
  outerHalo: {
    position: 'absolute',
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  innerCore: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coreSymbol: {
    fontSize: 24
  },
  titleSection: {
    alignItems: 'center',
    marginVertical: 12,
    paddingHorizontal: 12,
  },
  mainTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.5
  },
  statusDetail: {
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: 6,
    textAlign: 'center',
    lineHeight: 18,
    letterSpacing: 0.2
  },
  seatCard: {
    width: '100%',
    marginVertical: 14,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1
  },
  seatHeader: {
    borderBottomWidth: 1,
    paddingBottom: 10,
    marginBottom: 12
  },
  seatTitle: {
    fontWeight: '700',
    fontSize: 12,
    letterSpacing: 1.5
  },
  seatSubtitle: {
    fontSize: 12,
    marginTop: 2
  },
  seatsList: {
    gap: 10
  },
  seatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  seatIndicator: {
    marginRight: 10
  },
  seatDot: {
    fontSize: 13
  },
  seatInfo: {
    flex: 1
  },
  seatMemberName: {
    fontWeight: '700',
    fontSize: 13.5,
  },
  seatSubtext: {
    fontSize: 11,
    marginTop: 2
  },
  seatStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  seatBadgeText: {
    fontWeight: '800',
    fontSize: 9.5,
    letterSpacing: 0.5,
  },
  nonBlockingFooter: {
    marginTop: 8,
    alignItems: 'center',
    paddingHorizontal: 12
  },
  nonBlockingText: {
    fontWeight: '700',
    fontSize: 12,
    textAlign: 'center'
  },
  nonBlockingSub: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 15
  }
});

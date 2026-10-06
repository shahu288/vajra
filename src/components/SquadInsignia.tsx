import React from 'react';
import { View, StyleSheet, Platform, StyleProp, ViewStyle } from 'react-native';
import { Text } from './Text';
import { typography } from '../theme/typography';

interface SquadInsigniaProps {
  streak: number;
  kept: number;
  total?: number;
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const SquadInsignia: React.FC<SquadInsigniaProps> = ({
  streak,
  kept,
  total = 4,
  compact = false,
  style,
}) => {
  return (
    <View style={[styles.container, compact && styles.containerCompact, style]}>
      <View style={[styles.badge, compact && styles.badgeCompact]}>
        <Text style={styles.streakValue}>{streak}D</Text>
        <Text style={styles.streakLabel}>SQUAD STREAK</Text>

        <View style={styles.divider} />

        <Text style={styles.keptValue}>
          {kept} / {total}
        </Text>
        <Text style={styles.keptLabel}>KEPT VOWS</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 14,
  },
  containerCompact: {
    marginVertical: 8,
  },
  badge: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#14171C',
    borderWidth: 1,
    borderColor: '#262A33',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    ...Platform.select({
      web: {
        boxShadow:
          '0 0 30px rgba(243, 186, 69, 0.08), 0 4px 20px rgba(0, 0, 0, 0.5), inset 0 0 16px rgba(0, 0, 0, 0.4)',
      },
      default: {
        shadowColor: '#F3BA45',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 3,
      },
    }),
  },
  badgeCompact: {
    width: 120,
    height: 120,
    borderRadius: 60,
    padding: 6,
  },
  streakValue: {
    fontFamily: typography.fontFamily.uiBold,
    fontSize: 26,
    fontWeight: '700',
    color: '#F5F6F8',
    lineHeight: 28,
  },
  streakLabel: {
    fontFamily: typography.fontFamily.uiBold,
    fontSize: 9.5,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#F3BA45',
    marginTop: 1,
  },
  divider: {
    width: 44,
    height: 1,
    backgroundColor: '#262A33',
    marginVertical: 6,
  },
  keptValue: {
    fontFamily: typography.fontFamily.uiBold,
    fontSize: 17,
    fontWeight: '700',
    color: '#F5F6F8',
    lineHeight: 20,
  },
  keptLabel: {
    fontFamily: typography.fontFamily.uiSemiBold,
    fontSize: 9,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: '#8A91A0',
    marginTop: 1,
  },
});

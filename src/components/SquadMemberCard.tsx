import React from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Text } from './Text';
import { ZenAvatar } from './ZenAvatar';
import { typography } from '../theme/typography';
import { SquadMember } from '../types';

interface SquadMemberCardProps {
  member: SquadMember;
  isCurrentUser: boolean;
  onPress: () => void;
  onNudge?: () => void;
  isNudged?: boolean;
}

export const SquadMemberCard: React.FC<SquadMemberCardProps> = ({
  member,
  isCurrentUser,
  onPress,
  onNudge,
  isNudged = false,
}) => {
  const isKept = member.daily_status === 'completed';
  const isMissed = member.daily_status === 'missed';
  const isPending = !isKept && !isMissed;

  const statusLabel = isKept ? 'KEPT VOW' : isPending ? 'PENDING' : 'MISSED VOW';
  const statusColor = isKept ? '#F3BA45' : isPending ? '#8A91A0' : '#E53E3E';

  // Subtle border: 1px gold border for current user, subtle gold border for completed peer, slate border for pending/missed
  const cardBorderColor = isCurrentUser
    ? '#F3BA45'
    : isKept
    ? 'rgba(243, 186, 69, 0.4)'
    : '#262A33';

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      style={[
        styles.card,
        { borderColor: cardBorderColor },
        isCurrentUser && styles.userCard,
        isKept && !isCurrentUser && styles.keptCard,
      ]}
    >
      <ZenAvatar
        avatarUrl={member.avatar_url || null}
        name={member.display_name}
        identityPath={member.identity_path}
        size={42}
        borderColor={isCurrentUser || isKept ? '#F3BA45' : '#262A33'}
        showYouBadge={false}
      />

      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text numberOfLines={1} style={styles.name}>
            {isCurrentUser ? 'YOU' : member.display_name}
          </Text>

          {/* Secondary subtle nudge interaction if member is pending and not user */}
          {!isCurrentUser && isPending && onNudge && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={(e: any) => {
                e?.stopPropagation?.();
                onNudge();
              }}
              style={[styles.nudgeBtn, isNudged && styles.nudgeBtnActive]}
            >
              <Text style={styles.nudgeBtnText}>
                {isNudged ? '✓' : '⚡'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <Text numberOfLines={1} style={styles.archetype}>
          {(member.identity_path || 'WARRIOR').toUpperCase()}
        </Text>

        <Text style={[styles.statusText, { color: statusColor }]}>
          {statusLabel}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#14171C',
    borderWidth: 1,
    borderColor: '#262A33',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 10,
    minHeight: 76,
    maxHeight: 82,
    position: 'relative',
    ...Platform.select({
      web: {
        cursor: 'pointer',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
        transition: 'border-color 0.2s ease, transform 0.15s ease',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 2,
      },
    }),
  },
  userCard: {
    borderColor: '#F3BA45',
    ...Platform.select({
      web: {
        boxShadow: '0 0 16px rgba(243, 186, 69, 0.1), 0 2px 8px rgba(0, 0, 0, 0.4)',
      },
    }),
  },
  keptCard: {
    borderColor: 'rgba(243, 186, 69, 0.4)',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    minWidth: 0,
    gap: 2,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: {
    fontFamily: typography.fontFamily.uiBold,
    fontSize: 14,
    fontWeight: '600',
    color: '#F5F6F8',
    flex: 1,
  },
  archetype: {
    fontFamily: typography.fontFamily.uiMedium,
    fontSize: 10.5,
    fontWeight: '500',
    color: '#8A91A0',
    letterSpacing: 0.4,
  },
  statusText: {
    fontFamily: typography.fontFamily.uiBold,
    fontSize: 10.5,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 1,
  },
  nudgeBtn: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(243, 186, 69, 0.1)',
    borderWidth: 0.5,
    borderColor: 'rgba(243, 186, 69, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  nudgeBtnActive: {
    backgroundColor: 'rgba(56, 161, 105, 0.2)',
    borderColor: '#38A169',
  },
  nudgeBtnText: {
    fontSize: 10,
    color: '#F3BA45',
    fontWeight: '700',
  },
});

import React from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Text } from './Text';
import { typography } from '../theme/typography';

interface WarRoomChatPillProps {
  latestSender?: string | null;
  latestMessageBody?: string | null;
  unreadCount?: number;
  onPress: () => void;
}

export const WarRoomChatPill: React.FC<WarRoomChatPillProps> = ({
  latestSender,
  latestMessageBody,
  unreadCount = 0,
  onPress,
}) => {
  const previewText = latestMessageBody
    ? `${latestSender ? `${latestSender}: ` : ''}${latestMessageBody}`
    : 'Silent in the circle';

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={styles.pill}
    >
      <View style={styles.leftSection}>
        <Text style={styles.chatTitle}>WAR ROOM CHAT</Text>
        <Text style={styles.dotSeparator}>·</Text>
        <Text numberOfLines={1} style={styles.previewText}>
          {previewText}
        </Text>
      </View>

      <View style={styles.rightSection}>
        {unreadCount > 0 ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount}</Text>
          </View>
        ) : (
          <Text style={styles.arrowIcon}>💬</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#14171C',
    borderWidth: 1,
    borderColor: '#262A33',
    borderRadius: 999,
    height: 48,
    paddingHorizontal: 16,
    marginTop: 18,
    marginBottom: 12,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
        transition: 'border-color 0.2s ease',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 3,
      },
    }),
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    marginRight: 10,
    minWidth: 0,
  },
  chatTitle: {
    fontFamily: typography.fontFamily.uiBold,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: '#F3BA45',
  },
  dotSeparator: {
    fontSize: 11,
    color: '#555C6B',
  },
  previewText: {
    fontFamily: typography.fontFamily.ui,
    fontSize: 12,
    color: '#8A91A0',
    flex: 1,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: 'rgba(243, 186, 69, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(243, 186, 69, 0.4)',
  },
  badgeText: {
    fontFamily: typography.fontFamily.uiBold,
    fontSize: 10,
    fontWeight: '700',
    color: '#F3BA45',
  },
  arrowIcon: {
    fontSize: 13,
    color: '#8A91A0',
  },
});

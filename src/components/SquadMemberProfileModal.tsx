import React from 'react';
import { View, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Text } from './Text';
import { Card } from './Card';
import { theme } from '../theme';
import { SquadMember } from '../types';
import { ZenAvatar } from './ZenAvatar';

interface SquadMemberProfileModalProps {
  member: SquadMember | null;
  visible: boolean;
  onClose: () => void;
}

export const SquadMemberProfileModal: React.FC<SquadMemberProfileModalProps> = ({
  member,
  visible,
  onClose
}) => {
  if (!member) return null;

  const getStatusText = (status: 'completed' | 'pending' | 'missed') => {
    switch (status) {
      case 'completed':
        return { text: '✓ Mission Honored', color: '#50E3C2' };
      case 'pending':
        return { text: '○ Pending', color: '#F5A623' };
      case 'missed':
        return { text: '✕ Missed Today', color: '#A35C5C' };
    }
  };

  const statusInfo = getStatusText(member.daily_status);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} style={styles.modalContent}>
          <Card style={styles.card}>
            {/* Header Portrait */}
            <View style={styles.portraitWrapper}>
              <ZenAvatar
                avatarUrl={member.replaced_member_name ? null : undefined}
                name={member.display_name}
                identityPath={member.identity_path}
                size={80}
                borderColor={member.avatar_color}
              />
            </View>

            {/* Name & Identity */}
            <Text style={styles.memberName}>
              {member.display_name} {member.is_me ? '(You)' : ''}
            </Text>
            <Text style={styles.identityTag}>{member.identity_path.toUpperCase()} ARCHETYPE</Text>

            {/* Status Badge */}
            <View style={[styles.statusBadge, { borderColor: statusInfo.color }]}>
              <Text style={[styles.statusText, { color: statusInfo.color }]}>
                {statusInfo.text}
              </Text>
            </View>

            {/* Metrics Grid */}
            <View style={styles.metricsContainer}>
              <View style={styles.metricItem}>
                <Text style={styles.metricVal}>{member.discipline_score}</Text>
                <Text style={styles.metricLbl}>DISCIPLINE SCORE</Text>
              </View>

              <View style={styles.metricDivider} />

              <View style={styles.metricItem}>
                <Text style={styles.metricVal}>{member.streak}d</Text>
                <Text style={styles.metricLbl}>CURRENT STREAK</Text>
              </View>
            </View>

            {/* Details List */}
            <View style={styles.detailsList}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Journey Rank</Text>
                <Text style={styles.detailValue}>#{member.rank} in Circle</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Last Active</Text>
                <Text style={styles.detailValue}>{member.last_active_at}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Discipline Level</Text>
                <Text style={styles.detailValue}>
                  {member.discipline_score >= 80 ? 'Forged' : member.discipline_score >= 50 ? 'Building' : 'Awakening'}
                </Text>
              </View>
            </View>

            {/* Close Button */}
            <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.8}>
              <Text style={styles.closeButtonText}>RETURN TO CIRCLE</Text>
            </TouchableOpacity>
          </Card>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(13, 13, 14, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalContent: {
    width: '100%',
    maxWidth: 380
  },
  card: {
    backgroundColor: '#14171C',
    borderColor: '#262A33',
    borderWidth: 1,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center'
  },
  portraitWrapper: {
    marginBottom: 14,
    alignItems: 'center',
    justifyContent: 'center'
  },
  memberName: {
    fontFamily: theme.typography.fontFamily.serif,
    fontSize: 22,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: 2
  },
  identityTag: {
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: '700',
    fontSize: 10,
    color: '#F3BA45',
    letterSpacing: 1.5,
    marginBottom: 12
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: '#1C2027',
    borderColor: '#262A33',
    marginBottom: 18
  },
  statusText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: '700',
    fontSize: 12
  },
  metricsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    backgroundColor: '#1C2027',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#262A33'
  },
  metricItem: {
    alignItems: 'center',
    flex: 1
  },
  metricVal: {
    fontFamily: theme.typography.fontFamily.mono,
    fontWeight: '700',
    fontSize: 18,
    color: '#F3BA45'
  },
  metricLbl: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 9,
    color: '#8A91A0',
    marginTop: 2,
    letterSpacing: 0.5
  },
  metricDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#262A33'
  },
  detailsList: {
    width: '100%',
    gap: 8,
    marginBottom: 20
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#262A33'
  },
  detailLabel: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 12,
    color: '#8A91A0'
  },
  detailValue: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 12,
    color: '#F5F6F8'
  },
  closeButton: {
    backgroundColor: '#F3BA45',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center'
  },
  closeButtonText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: '700',
    fontSize: 11,
    color: '#0B0C0E',
    letterSpacing: 1.5
  }
});

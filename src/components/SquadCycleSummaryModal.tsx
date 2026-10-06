import React from 'react';
import { View, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Text } from './Text';
import { Card } from './Card';
import { theme } from '../theme';
import { SquadMember } from '../types';

interface SquadCycleSummaryModalProps {
  visible: boolean;
  squadName: string;
  totalScore: number;
  totalStreakDays: number;
  teamCompletionPct: number;
  rank: number;
  members: SquadMember[];
  onStartNextCycle: () => void;
}

export const SquadCycleSummaryModal: React.FC<SquadCycleSummaryModalProps> = ({
  visible,
  squadName,
  totalScore,
  totalStreakDays,
  teamCompletionPct,
  rank,
  members,
  onStartNextCycle
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <Card style={styles.modalCard}>
          <Text style={styles.celebrationTag}>🏆 30-DAY JOURNEY COMPLETE</Text>
          <Text style={styles.squadTitle}>{squadName}</Text>
          <Text style={styles.subtitle}>
            Your 4-person accountability circle has completed its 30-day discipline journey.
          </Text>

          {/* Stats Grid */}
          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statVal}>{totalScore}</Text>
              <Text style={styles.statLbl}>TOTAL MSS</Text>
            </View>

            <View style={styles.statBox}>
              <Text style={styles.statVal}>{totalStreakDays}d</Text>
              <Text style={styles.statLbl}>STREAK DAYS</Text>
            </View>

            <View style={styles.statBox}>
              <Text style={styles.statVal}>{teamCompletionPct}%</Text>
              <Text style={styles.statLbl}>COMPLETION</Text>
            </View>

            <View style={styles.statBox}>
              <Text style={styles.statVal}>#{rank}</Text>
              <Text style={styles.statLbl}>GLOBAL RANK</Text>
            </View>
          </View>

          {/* Squad Roster Final Rankings */}
          <Text style={styles.rosterTitle}>FINAL SQUAD STANDINGS</Text>
          <View style={styles.rosterList}>
            {members.map((member) => (
              <View key={member.id} style={styles.memberRow}>
                <Text style={styles.rankBadge}>#{member.rank}</Text>
                <Text style={[styles.memberName, member.is_me && styles.meText]}>
                  {member.display_name} {member.is_me ? '(You)' : ''}
                </Text>
                <Text style={styles.memberScore}>{member.discipline_score} MSS</Text>
              </View>
            ))}
          </View>

          {/* Next Cycle CTA */}
          <TouchableOpacity style={styles.primaryBtn} onPress={onStartNextCycle} activeOpacity={0.85}>
            <Text style={styles.btnText}>BEGIN NEXT 30-DAY CYCLE ⚡</Text>
          </TouchableOpacity>
        </Card>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    padding: 24,
    backgroundColor: '#14171C',
    borderColor: '#262A33',
    borderWidth: 1,
    borderRadius: 16
  },
  celebrationTag: {
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: '700',
    fontSize: 11,
    color: '#F3BA45',
    letterSpacing: 1.5,
    textAlign: 'center',
    marginBottom: 6
  },
  squadTitle: {
    fontFamily: theme.typography.fontFamily.serif,
    fontSize: 24,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: 4
  },
  subtitle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 13,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    backgroundColor: '#1C2027',
    borderWidth: 1,
    borderColor: '#262A33',
    borderRadius: 8,
    padding: 12
  },
  statBox: {
    alignItems: 'center',
    flex: 1
  },
  statVal: {
    fontFamily: theme.typography.fontFamily.mono,
    fontWeight: '700',
    fontSize: 16,
    color: '#F3BA45'
  },
  statLbl: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 9,
    color: '#8A91A0',
    marginTop: 2
  },
  rosterTitle: {
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: '700',
    fontSize: 11,
    color: '#8A91A0',
    letterSpacing: 1,
    marginBottom: 10
  },
  rosterList: {
    gap: 8,
    marginBottom: 24
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#1C2027',
    borderWidth: 1,
    borderColor: '#262A33'
  },
  rankBadge: {
    fontFamily: theme.typography.fontFamily.mono,
    fontWeight: '700',
    fontSize: 12,
    color: '#F3BA45',
    marginRight: 10,
    width: 24
  },
  memberName: {
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: '700',
    fontSize: 14,
    color: theme.colors.text.secondary,
    flex: 1
  },
  meText: {
    color: '#F3BA45'
  },
  memberScore: {
    fontFamily: theme.typography.fontFamily.mono,
    fontSize: 13,
    color: '#8A91A0'
  },
  primaryBtn: {
    backgroundColor: '#F3BA45',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center'
  },
  btnText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: '700',
    fontSize: 13,
    color: '#0B0C0E',
    letterSpacing: 1
  }
});

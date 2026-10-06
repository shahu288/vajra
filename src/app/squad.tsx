import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../store/useAppStore';
import { typography } from '../theme/typography';
import { Text } from '../components/Text';
import { AtmosphericBackground } from '../components/AtmosphericBackground';
import { SquadMatchmakingView } from '../components/SquadMatchmakingView';
import { SquadCycleSummaryModal } from '../components/SquadCycleSummaryModal';
import { SquadMemberProfileModal } from '../components/SquadMemberProfileModal';
import { SquadMemberCard } from '../components/SquadMemberCard';
import { SquadInsignia } from '../components/SquadInsignia';
import { IntegratedWarRoomChat } from '../components/IntegratedWarRoomChat';
import { SquadChatModal } from '../components/SquadChatModal';
import { calculateSquadStats } from '../utils/squadMatchmaking';
import { SquadMember } from '../types';

export default function SquadScreen() {
  const {
    user,
    squad,
    squadMembers,
    matchmakingState,
    assembledBannerText,
    clearAssembledBanner,
    showCycleSummary,
    completeCycleAndRematch,
    checkSquadLifecycle,
    leaveSquad,
    startMatchmaking,
    chatMessages,
    sendSquadMessage,
    nudgeSquadMember,
    updateSquadName,
  } = useAppStore();

  const [selectedMember, setSelectedMember] = useState<SquadMember | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showEditNameModal, setShowEditNameModal] = useState(false);
  const [squadNameInput, setSquadNameInput] = useState('');
  const [nudgedMembers, setNudgedMembers] = useState<Record<string, boolean>>({});

  // Check lifecycle on mount
  useEffect(() => {
    checkSquadLifecycle();
  }, []);

  if (!user) return null;

  const isBuildingSquad =
    squad?.status === 'building' ||
    (matchmakingState.status !== 'squad_assembled' &&
      matchmakingState.status !== 'idle' &&
      squad?.status !== 'active' &&
      squad !== null);

  // Calculate current squad statistics & covenant status
  const stats = calculateSquadStats(squadMembers, squad?.journey_start_date);
  const completedCount = squadMembers.filter((m) => m.daily_status === 'completed').length;

  // Assign members in a balanced 2x2 grid:
  // Row 1: Peer 1 (Rohit), Peer 2 (Shreya)
  // Row 2: YOU, Peer 3 (Karan)
  const meMember = squadMembers.find((m) => m.is_me || m.id === user.id) || squadMembers[0];
  const peerMembers = squadMembers.filter((m) => m.id !== meMember?.id);

  const row1 = [
    peerMembers[0] || squadMembers[0],
    peerMembers[1] || squadMembers[1] || squadMembers[0],
  ];
  const row2 = [
    meMember,
    peerMembers[2] || squadMembers[2] || squadMembers[0],
  ];

  const handleNudge = (targetMember: SquadMember) => {
    if (nudgedMembers[targetMember.id]) return;
    nudgeSquadMember(targetMember.id, targetMember.display_name, 'Daily Vow');
    setNudgedMembers((prev) => ({ ...prev, [targetMember.id]: true }));
  };

  const handleOpenEditName = () => {
    const rawName = squad?.name?.replace(/^SQUAD\s*/i, '') || 'VAYU-42';
    setSquadNameInput(rawName);
    setShowEditNameModal(true);
  };

  const handleSaveSquadName = () => {
    const trimmed = squadNameInput.trim();
    if (trimmed) {
      updateSquadName(trimmed);
    }
    setShowEditNameModal(false);
  };

  const handleConfirmLeaveSquad = () => {
    setShowLeaveConfirm(false);
    setShowSettingsModal(false);
    leaveSquad();
  };

  // If user has left squad and is in idle state
  if (!squad && !isBuildingSquad) {
    return (
      <View style={[styles.container, { backgroundColor: '#0B0C0E' }]}>
        <AtmosphericBackground hideRipples={true} />
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
          <View style={styles.emptyStateContainer}>
            <View style={styles.emptyRelicBadge}>
              <Text style={styles.emptyRelicIcon}>⚔️</Text>
            </View>
            <Text style={styles.emptyStateTitle}>SQUAD LEFT</Text>
            <Text style={styles.emptyStateSub}>
              You have completed your covenant with your previous squad. Your personal
              discipline history and streaks remain completely intact.
            </Text>
            <TouchableOpacity
              style={styles.joinNewSquadBtn}
              activeOpacity={0.85}
              onPress={startMatchmaking}
            >
              <Text style={styles.joinNewSquadText}>JOIN NEW SQUAD</Text>
            </TouchableOpacity>
            <Text style={styles.joinNewSquadSub}>
              You will be matched into a fresh 4-member squad starting a new 30-day covenant.
            </Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: '#0B0C0E' }]}>
      <AtmosphericBackground hideRipples={true} />

      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {/* Assembled Banner Toast */}
        {assembledBannerText && (
          <TouchableOpacity
            style={styles.bannerToast}
            onPress={clearAssembledBanner}
            activeOpacity={0.9}
          >
            <Text style={styles.bannerToastText}>{assembledBannerText}</Text>
            <Text style={styles.bannerClose}>✕</Text>
          </TouchableOpacity>
        )}

        {isBuildingSquad ? (
          <SquadMatchmakingView matchmakingState={matchmakingState} />
        ) : (
          <View style={styles.layoutWrapper}>
            {/* ─── 1. TOP SECTION (Fixed / Compact) ───────────────────────── */}
            <View style={styles.topSection}>
              {/* Header: Squad Identity & Covenant Age */}
              <View style={styles.header}>
                <View style={styles.headerTextGroup}>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={handleOpenEditName}
                    style={styles.squadNameTouchable}
                  >
                    <Text style={styles.squadName}>
                      {squad?.name?.toUpperCase() || 'SQUAD VAYU-42'}
                    </Text>
                    <View style={styles.pencilBadge}>
                      <Text style={styles.editPencilIcon}>✎</Text>
                    </View>
                  </TouchableOpacity>

                  <Text style={styles.covenantStatus}>
                    {stats.covenantStatusText}
                  </Text>
                </View>

                {/* Settings Modal Button */}
                <TouchableOpacity
                  style={styles.headerIconBtn}
                  onPress={() => setShowSettingsModal(true)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.headerIconText}>⚙️</Text>
                </TouchableOpacity>
              </View>

              {/* Central Squad Insignia */}
              <SquadInsignia
                streak={stats.totalStreakDays}
                kept={completedCount}
                total={4}
              />

              {/* Four Uniform Member Cards (2x2 Grid) */}
              <View style={styles.memberGrid}>
                <View style={styles.memberGridRow}>
                  {row1.map((member) => (
                    <SquadMemberCard
                      key={member.id}
                      member={member}
                      isCurrentUser={member.is_me || member.id === user.id}
                      onPress={() => setSelectedMember(member)}
                      onNudge={() => handleNudge(member)}
                      isNudged={!!nudgedMembers[member.id]}
                    />
                  ))}
                </View>

                <View style={styles.memberGridRow}>
                  {row2.map((member) => (
                    <SquadMemberCard
                      key={member.id}
                      member={member}
                      isCurrentUser={member.is_me || member.id === user.id}
                      onPress={() => setSelectedMember(member)}
                      onNudge={() => handleNudge(member)}
                      isNudged={!!nudgedMembers[member.id]}
                    />
                  ))}
                </View>
              </View>
            </View>

            {/* ─── 2. BOTTOM SECTION: Integrated Live War Room Chat ─────── */}
            <IntegratedWarRoomChat
              messages={chatMessages}
              squadMembers={squadMembers}
              currentUser={user}
              onSendMessage={sendSquadMessage}
              onOpenFullChat={() => setShowChatModal(true)}
            />
          </View>
        )}

        {/* ─── Member Profile Modal ─────────────────────────────── */}
        <SquadMemberProfileModal
          member={selectedMember}
          visible={!!selectedMember}
          onClose={() => setSelectedMember(null)}
        />

        {/* ─── Dedicated Full-Screen War Room Chat Modal ──────── */}
        <SquadChatModal
          visible={showChatModal}
          onClose={() => setShowChatModal(false)}
        />

        {/* ─── Edit Squad Name Modal ────────────────────────────── */}
        <Modal
          visible={showEditNameModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowEditNameModal(false)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.editNameModalCard}>
              <Text style={styles.editNameTitle}>EDIT SQUAD NAME</Text>
              <Text style={styles.editNameSubtitle}>
                Update the banner under which your 4-member circle marches.
              </Text>

              <View style={styles.editNameInputWrapper}>
                <TextInput
                  style={styles.editNameInput}
                  value={squadNameInput}
                  onChangeText={setSquadNameInput}
                  placeholder="Enter squad name..."
                  placeholderTextColor="#666E7D"
                  maxLength={24}
                  autoFocus
                  onSubmitEditing={handleSaveSquadName}
                  returnKeyType="done"
                />
                <Text style={styles.charCountText}>
                  {squadNameInput.length}/24
                </Text>
              </View>

              <View style={styles.editNameActionsRow}>
                <TouchableOpacity
                  style={styles.editNameCancelBtn}
                  activeOpacity={0.8}
                  onPress={() => setShowEditNameModal(false)}
                >
                  <Text style={styles.editNameCancelText}>CANCEL</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.editNameSaveBtn,
                    !squadNameInput.trim() && styles.editNameSaveBtnDisabled,
                  ]}
                  activeOpacity={0.8}
                  onPress={handleSaveSquadName}
                  disabled={!squadNameInput.trim()}
                >
                  <Text style={styles.editNameSaveText}>SAVE</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* ─── Squad Settings / Details Modal ─────────────────── */}
        <Modal
          visible={showSettingsModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowSettingsModal(false)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.settingsModalCard}>
              <View style={styles.settingsHeader}>
                <Text style={styles.settingsTitle}>SQUAD COVENANT DETAILS</Text>
                <TouchableOpacity onPress={() => setShowSettingsModal(false)}>
                  <Text style={styles.settingsCloseIcon}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.settingsBody}>
                <View style={styles.settingsRow}>
                  <Text style={styles.settingsLabel}>SQUAD NAME</Text>
                  <Text style={styles.settingsValue}>
                    {squad?.name || 'SQUAD VAYU-42'}
                  </Text>
                </View>

                <View style={styles.settingsRow}>
                  <Text style={styles.settingsLabel}>COVENANT STATUS</Text>
                  <Text style={[styles.settingsValue, { color: '#F3BA45' }]}>
                    {stats.covenantStatusText}
                  </Text>
                </View>

                <View style={styles.settingsRow}>
                  <Text style={styles.settingsLabel}>SQUAD STREAK</Text>
                  <Text style={styles.settingsValue}>
                    {stats.totalStreakDays} Days
                  </Text>
                </View>

                <View style={styles.settingsRow}>
                  <Text style={styles.settingsLabel}>MEMBERS</Text>
                  <Text style={styles.settingsValue}>4 / 4 Active</Text>
                </View>

                <View style={styles.settingsDivider} />

                {/* Leave Squad Section */}
                {stats.isCovenantComplete ? (
                  <View style={styles.leaveSection}>
                    <Text style={styles.leaveNoticeText}>
                      You have completed the first 30-day covenant with this squad.
                      You can remain with this squad indefinitely or choose to leave.
                    </Text>

                    <TouchableOpacity
                      style={styles.leaveSquadActionBtn}
                      activeOpacity={0.8}
                      onPress={() => setShowLeaveConfirm(true)}
                    >
                      <Text style={styles.leaveSquadActionText}>LEAVE SQUAD</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.lockedLeaveNotice}>
                    <Text style={styles.lockedLeaveNoticeText}>
                      🔒 Initial 30-day covenant is currently in progress (Day{' '}
                      {stats.currentDay} / 30). Leaving is unlocked after Day 30.
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </Modal>

        {/* ─── Leave Squad Confirmation Modal ─────────────────── */}
        <Modal
          visible={showLeaveConfirm}
          transparent
          animationType="fade"
          onRequestClose={() => setShowLeaveConfirm(false)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.confirmModalCard}>
              <Text style={styles.confirmModalTitle}>LEAVE SQUAD?</Text>
              <Text style={styles.confirmModalMessage}>
                You have completed the first 30-day covenant with this squad. If you
                leave, you will be matched with a new squad if you choose to join another one.
              </Text>

              <View style={styles.confirmActionRow}>
                <TouchableOpacity
                  style={styles.confirmCancelBtn}
                  activeOpacity={0.8}
                  onPress={() => setShowLeaveConfirm(false)}
                >
                  <Text style={styles.confirmCancelText}>CANCEL</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.confirmLeaveBtn}
                  activeOpacity={0.8}
                  onPress={handleConfirmLeaveSquad}
                >
                  <Text style={styles.confirmLeaveText}>LEAVE SQUAD</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* 30-Day Cycle Achievement Modal */}
        <SquadCycleSummaryModal
          visible={showCycleSummary}
          squadName={squad?.name || 'SQUAD VAYU-42'}
          totalScore={stats.totalScore}
          totalStreakDays={stats.totalStreakDays}
          teamCompletionPct={stats.teamCompletionPct}
          rank={squad?.global_rank || 4}
          members={squadMembers}
          onStartNextCycle={completeCycleAndRematch}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0C0E',
  },
  safeArea: {
    flex: 1,
  },
  layoutWrapper: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  bannerToast: {
    backgroundColor: 'rgba(243, 186, 69, 0.12)',
    borderColor: '#F3BA45',
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bannerToastText: {
    fontFamily: typography.fontFamily.uiBold,
    fontWeight: '700',
    fontSize: 12,
    color: '#F3BA45',
    flex: 1,
  },
  bannerClose: {
    color: '#F3BA45',
    fontSize: 14,
    marginLeft: 10,
  },

  // ─── Top Section ──────────────────────────────────────────────
  topSection: {
    flexShrink: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingTop: 4,
    paddingBottom: 2,
  },
  headerTextGroup: {
    flex: 1,
  },
  squadNameTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
  },
  squadName: {
    fontFamily: typography.fontFamily.displaySemiBold,
    fontSize: 18,
    fontWeight: '600',
    color: '#F5F6F8',
    letterSpacing: 0.5,
  },
  pencilBadge: {
    width: 20,
    height: 20,
    borderRadius: 6,
    backgroundColor: 'rgba(243, 186, 69, 0.1)',
    borderWidth: 0.5,
    borderColor: 'rgba(243, 186, 69, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editPencilIcon: {
    fontSize: 11,
    color: '#F3BA45',
  },
  covenantStatus: {
    fontFamily: typography.fontFamily.uiSemiBold,
    fontSize: 10.5,
    fontWeight: '600',
    color: '#8A91A0',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  headerIconBtn: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: '#14171C',
    borderWidth: 1,
    borderColor: '#262A33',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIconText: {
    fontSize: 14,
  },

  // ─── Member Grid (2x2 Bento) ──────────────────────────────────
  memberGrid: {
    gap: 9,
    width: '100%',
  },
  memberGridRow: {
    flexDirection: 'row',
    gap: 9,
    width: '100%',
  },

  // ─── Edit Squad Name Modal ────────────────────────────────────
  editNameModalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#14171C',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#262A33',
    padding: 20,
    gap: 12,
  },
  editNameTitle: {
    fontFamily: typography.fontFamily.displaySemiBold,
    fontSize: 15,
    fontWeight: '600',
    color: '#F5F6F8',
    letterSpacing: 0.5,
  },
  editNameSubtitle: {
    fontFamily: typography.fontFamily.ui,
    fontSize: 12,
    color: '#8A91A0',
    lineHeight: 16,
  },
  editNameInputWrapper: {
    position: 'relative',
    marginTop: 4,
  },
  editNameInput: {
    height: 42,
    backgroundColor: '#0B0C0E',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#262A33',
    paddingHorizontal: 12,
    paddingRight: 46,
    color: '#F5F6F8',
    fontFamily: typography.fontFamily.uiBold,
    fontSize: 14,
    textTransform: 'uppercase',
  },
  charCountText: {
    position: 'absolute',
    right: 10,
    top: 13,
    fontFamily: typography.fontFamily.ui,
    fontSize: 10,
    color: '#666E7D',
  },
  editNameActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 6,
  },
  editNameCancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 8,
    backgroundColor: '#1A1E26',
    borderWidth: 1,
    borderColor: '#262A33',
  },
  editNameCancelText: {
    fontFamily: typography.fontFamily.uiBold,
    fontSize: 11,
    fontWeight: '700',
    color: '#8A91A0',
    letterSpacing: 0.8,
  },
  editNameSaveBtn: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 8,
    backgroundColor: '#F3BA45',
  },
  editNameSaveBtnDisabled: {
    opacity: 0.4,
  },
  editNameSaveText: {
    fontFamily: typography.fontFamily.uiBold,
    fontSize: 11,
    fontWeight: '700',
    color: '#0B0C0E',
    letterSpacing: 0.8,
  },

  // ─── Settings & Leave Modals ──────────────────────────────────
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(5, 6, 8, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  settingsModalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#14171C',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#262A33',
    padding: 20,
    gap: 14,
  },
  settingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingsTitle: {
    fontFamily: typography.fontFamily.displaySemiBold,
    fontSize: 14,
    fontWeight: '600',
    color: '#F5F6F8',
    letterSpacing: 0.5,
  },
  settingsCloseIcon: {
    fontSize: 16,
    color: '#8A91A0',
  },
  settingsBody: {
    gap: 10,
  },
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingsLabel: {
    fontFamily: typography.fontFamily.ui,
    fontSize: 12,
    color: '#8A91A0',
  },
  settingsValue: {
    fontFamily: typography.fontFamily.uiBold,
    fontSize: 12,
    fontWeight: '700',
    color: '#F5F6F8',
  },
  settingsDivider: {
    height: 1,
    backgroundColor: '#262A33',
    marginVertical: 4,
  },
  leaveSection: {
    gap: 10,
    marginTop: 4,
  },
  leaveNoticeText: {
    fontFamily: typography.fontFamily.ui,
    fontSize: 11.5,
    color: '#8A91A0',
    lineHeight: 16,
  },
  leaveSquadActionBtn: {
    backgroundColor: 'rgba(163, 58, 58, 0.15)',
    borderWidth: 1,
    borderColor: '#A33A3A',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  leaveSquadActionText: {
    fontFamily: typography.fontFamily.uiBold,
    fontSize: 12,
    fontWeight: '700',
    color: '#E53E3E',
    letterSpacing: 0.8,
  },
  lockedLeaveNotice: {
    backgroundColor: '#1C2027',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#262A33',
  },
  lockedLeaveNoticeText: {
    fontFamily: typography.fontFamily.ui,
    fontSize: 11,
    color: '#8A91A0',
    lineHeight: 15,
  },

  // Confirm Leave Dialog
  confirmModalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#14171C',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#A33A3A',
    padding: 20,
    gap: 12,
  },
  confirmModalTitle: {
    fontFamily: typography.fontFamily.displayBold,
    fontSize: 16,
    fontWeight: '700',
    color: '#F5F6F8',
    letterSpacing: 0.5,
  },
  confirmModalMessage: {
    fontFamily: typography.fontFamily.ui,
    fontSize: 13,
    color: '#8A91A0',
    lineHeight: 18,
  },
  confirmActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 6,
  },
  confirmCancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 8,
    backgroundColor: '#1C2027',
    borderWidth: 1,
    borderColor: '#262A33',
  },
  confirmCancelText: {
    fontFamily: typography.fontFamily.uiBold,
    fontSize: 11,
    fontWeight: '700',
    color: '#8A91A0',
    letterSpacing: 0.8,
  },
  confirmLeaveBtn: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 8,
    backgroundColor: '#A33A3A',
  },
  confirmLeaveText: {
    fontFamily: typography.fontFamily.uiBold,
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },

  // Empty / Left Squad State
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 14,
  },
  emptyRelicBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#14171C',
    borderWidth: 1,
    borderColor: '#262A33',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  emptyRelicIcon: {
    fontSize: 26,
  },
  emptyStateTitle: {
    fontFamily: typography.fontFamily.displayBold,
    fontSize: 20,
    fontWeight: '700',
    color: '#F5F6F8',
    letterSpacing: 0.8,
  },
  emptyStateSub: {
    fontFamily: typography.fontFamily.ui,
    fontSize: 13,
    color: '#8A91A0',
    textAlign: 'center',
    lineHeight: 19,
  },
  joinNewSquadBtn: {
    backgroundColor: '#F3BA45',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 28,
    marginTop: 8,
  },
  joinNewSquadText: {
    fontFamily: typography.fontFamily.uiBold,
    fontSize: 13,
    fontWeight: '700',
    color: '#0B0C0E',
    letterSpacing: 1,
  },
  joinNewSquadSub: {
    fontFamily: typography.fontFamily.ui,
    fontSize: 11,
    color: '#555C6B',
    textAlign: 'center',
    maxWidth: 260,
  },
});

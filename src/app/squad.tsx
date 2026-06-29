import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, FlatList, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../store/useAppStore';
import { theme } from '../theme';
import { Text } from '../components/Text';
import { Card } from '../components/Card';

export default function SquadScreen() {
  const { 
    user, 
    squad, 
    activeVows,
    vowLogs,
    squadMembers, 
    chatMessages, 
    sendSquadMessage, 
    nudgeSquadMember 
  } = useAppStore();

  const [inputText, setInputText] = useState('');
  const [flaggedMembers, setFlaggedMembers] = useState<Record<string, boolean>>({});
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    // Scroll chat to bottom on new messages
    if (chatMessages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [chatMessages.length]);

  if (!user || !squad) return null;

  const handleSend = () => {
    if (!inputText.trim()) return;
    sendSquadMessage(inputText.trim());
    setInputText('');
  };

  const handleNudge = (memberId: string, name: string) => {
    nudgeSquadMember(memberId, name, 'Wake before 6 AM');
  };

  const handleFlagToggle = (memberId: string, memberName: string) => {
    const isCurrentlyFlagged = flaggedMembers[memberId] || false;
    const newFlagState = !isCurrentlyFlagged;
    
    setFlaggedMembers(prev => ({ ...prev, [memberId]: newFlagState }));
    
    // Log the event into chat feed
    const systemNotice = newFlagState 
      ? `challenged ${memberName}'s daily log (LOG FROZEN ❄️)`
      : `cleared the challenge on ${memberName}'s daily log (LOG ACTIVE ⚡)`;
      
    sendSquadMessage(systemNotice);
  };

  // Combine current user with other squad members to form the 4-Person Pulse
  const allMembers = [
    {
      id: user.id,
      display_name: user.display_name,
      identity_path: user.identity_path,
      discipline_score: user.discipline_score,
      isMe: true,
      vows: activeVows.map((v) => ({
        id: v.id,
        name: v.custom_name,
        completed: vowLogs[v.id] || false,
      })),
      trend: [true, true, true, false, true]
    },
    ...squadMembers.map((member) => {
      let vows = [];
      let trend = [];
      if (member.identity_path === 'scholar') {
        vows = [
          { id: 'vow-s1', name: 'Read 30 mins', completed: true },
          { id: 'vow-s2', name: 'LeetCode medium', completed: true },
          { id: 'vow-s3', name: 'No sugar log', completed: true }
        ];
        trend = [true, true, true, true, true];
      } else if (member.identity_path === 'monk') {
        vows = [
          { id: 'vow-m1', name: 'Meditate 20 mins', completed: true },
          { id: 'vow-m2', name: 'Wake at 5:30 AM', completed: true },
          { id: 'vow-m3', name: 'Silent reflection', completed: false }
        ];
        trend = [true, true, false, true, true];
      } else {
        vows = [
          { id: 'vow-c1', name: 'Write 500 words', completed: false },
          { id: 'vow-c2', name: 'Sketch 15 mins', completed: false },
          { id: 'vow-c3', name: 'No video games', completed: true }
        ];
        trend = [false, true, false, true, false];
      }
      return {
        id: member.id,
        display_name: member.display_name,
        identity_path: member.identity_path,
        discipline_score: member.discipline_score,
        isMe: false,
        vows,
        trend
      };
    })
  ];

  const renderMessageItem = ({ item }: { item: any }) => {
    const isMe = item.sender_id === user.id;
    const isSystem = item.type === 'nudge_request' || item.sender_id === null;
    const isChallengeLog = item.body.includes('challenged') || item.body.includes('cleared the challenge') || item.body.includes('LOG FROZEN') || item.body.includes('LOG ACTIVE');

    if (isSystem || isChallengeLog) {
      const isChallenge = item.body.includes('FROZEN');
      return (
        <View style={styles.systemMessage}>
          <Text style={[
            styles.systemMessageText, 
            isChallenge && { borderColor: theme.colors.primary, borderWidth: 0.5, color: theme.colors.primary, backgroundColor: 'rgba(255, 90, 0, 0.08)' }
          ]}>
            ⚡ {item.sender_id === user.id ? 'You' : 'Teammate'} {item.body}
          </Text>
        </View>
      );
    }

    const senderName = isMe 
      ? 'You' 
      : squadMembers.find(m => m.id === item.sender_id)?.display_name || 'Teammate';

    return (
      <View style={[styles.messageBubbleContainer, isMe ? styles.myBubbleAlign : styles.theirBubbleAlign]}>
        <View style={[styles.messageBubble, isMe ? styles.myBubble : styles.theirBubble]}>
          {!isMe && <Text style={styles.messageSender}>{senderName}</Text>}
          <Text style={styles.messageText}>{item.body}</Text>
          <Text style={styles.messageTime}>
            {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <ImageBackground
      source={require('../../assets/images/dark_misty_mountains.png')}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.darkOverlay} />
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{squad.name.toUpperCase()}</Text>
          <Text style={styles.headerSub}>Invite Code: {squad.invite_code}</Text>
        </View>

        {/* 4-Person Pulse 2x2 Grid */}
        <View style={styles.pulseContainer}>
          <Text style={styles.sectionTitle}>SQUAD PULSE (4-PERSON LIFE LINE)</Text>
          <View style={styles.gridContainer}>
            {allMembers.map((member) => {
              const isChallenged = flaggedMembers[member.id] || false;
              // Determine status
              const isPending = member.isMe
                ? member.vows.some(v => !v.completed)
                : member.vows.some(v => !v.completed);

              const statusLabel = isChallenged 
                ? 'CHALLENGED ❄️'
                : (isPending ? 'PENDING' : 'COMPLETED');
                
              const statusColor = isChallenged 
                ? theme.colors.primary 
                : (isPending ? theme.colors.text.secondary : theme.colors.tertiary);

              return (
                <Card 
                  key={member.id} 
                  style={[
                    styles.gridMemberCard,
                    isChallenged && styles.challengedCard
                  ]}
                >
                  <View>
                    {/* Member header (Name & Role badge) */}
                    <View style={styles.memberHeader}>
                      <Text style={styles.memberName}>{member.display_name}</Text>
                      <View style={[
                        styles.badge, 
                        { borderColor: statusColor }
                      ]}>
                        <Text style={[styles.badgeText, { color: statusColor }]}>
                          {member.isMe ? 'YOU' : member.identity_path.toUpperCase()}
                        </Text>
                      </View>
                    </View>

                    {/* Stats & Status line */}
                    <View style={styles.memberInfo}>
                      <Text style={styles.scoreText}>MSS: {member.discipline_score}</Text>
                      <Text style={[styles.statusText, { color: statusColor }]}>
                        {statusLabel}
                      </Text>
                    </View>

                    {/* Vows checklist */}
                    <View style={styles.vowChecklist}>
                      {member.vows.map((vow) => (
                        <View key={vow.id} style={styles.vowRow}>
                          <Text style={[
                            styles.vowCheckSymbol, 
                            { color: vow.completed ? theme.colors.tertiary : theme.colors.danger }
                          ]}>
                            {vow.completed ? '✓' : '○'}
                          </Text>
                          <Text 
                            numberOfLines={1} 
                            style={[
                              styles.vowCheckText, 
                              vow.completed ? styles.vowCompletedText : styles.vowPendingText
                            ]}
                          >
                            {vow.name}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  {/* Trend & Action Button */}
                  <View style={styles.cardFooter}>
                    <View style={styles.trendContainer}>
                      {member.trend.map((completed, i) => (
                        <View 
                          key={i} 
                          style={[
                            styles.trendBlock, 
                            { backgroundColor: completed ? theme.colors.secondary : theme.colors.danger }
                          ]} 
                        />
                      ))}
                    </View>

                    {/* Flag controls */}
                    {!member.isMe ? (
                      <TouchableOpacity 
                        style={[
                          styles.actionBtn, 
                          isChallenged ? styles.unflagBtn : styles.flagBtn
                        ]}
                        onPress={() => handleFlagToggle(member.id, member.display_name)}
                      >
                        <Text style={[
                          styles.actionBtnText, 
                          isChallenged ? styles.unflagBtnText : styles.flagBtnText
                        ]}>
                          {isChallenged ? 'Vouch 🛡️' : 'Flag 🚩'}
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <View style={styles.selfBadge}>
                        <Text style={styles.selfBadgeText}>DEFENDER</Text>
                      </View>
                    )}
                  </View>
                </Card>
              );
            })}
          </View>
        </View>

        {/* Chat Feed */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardContainer}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          <Text style={[styles.sectionTitle, { marginLeft: 16, marginBottom: 8 }]}>SQUAD CHAT & ALERTS</Text>
          
          <FlatList
            ref={flatListRef}
            data={chatMessages}
            keyExtractor={item => item.id}
            renderItem={renderMessageItem}
            contentContainerStyle={styles.chatScroll}
            showsVerticalScrollIndicator={false}
          />

          {/* Chat Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Message squad..."
              placeholderTextColor={theme.colors.text.tertiary}
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={handleSend}
            />
            <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
              <Text style={styles.sendBtnText}>Send</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
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
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#161626', // Refined borders
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
  pulseContainer: {
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#161626', // Refined borders
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
    letterSpacing: 1.5,
    marginLeft: 16,
    marginBottom: 6,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  gridMemberCard: {
    width: '48.5%',
    padding: 10,
    minHeight: 180,
    justifyContent: 'space-between',
    borderRadius: theme.spacing.borderRadius.card,
    backgroundColor: 'rgba(11, 11, 18, 0.75)', // Transparent navy base
    borderColor: '#1E1E2E',
    borderWidth: 0.5,
    ...Platform.select({
      web: {
        backdropFilter: 'blur(20px)',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
      }
    })
  },
  challengedCard: {
    borderColor: 'rgba(255, 90, 0, 0.5)',
    borderWidth: 0.8,
    backgroundColor: 'rgba(255, 90, 0, 0.08)',
    ...Platform.select({
      web: {
        boxShadow: '0 0 15px rgba(255, 90, 0, 0.1)',
      }
    })
  },
  memberHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  memberName: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.text.primary,
  },
  badge: {
    borderWidth: 0.5,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: theme.spacing.borderRadius.card,
  },
  badgeText: {
    fontSize: 7,
    fontFamily: theme.typography.fontFamily.mono,
  },
  memberInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  scoreText: {
    fontSize: 10,
    color: theme.colors.text.secondary,
    fontFamily: theme.typography.fontFamily.mono,
  },
  statusText: {
    fontSize: 9,
    fontFamily: theme.typography.fontFamily.mono,
  },
  vowChecklist: {
    gap: 3,
    marginBottom: 8,
  },
  vowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  vowCheckSymbol: {
    fontSize: 10,
    fontFamily: theme.typography.fontFamily.mono,
  },
  vowCheckText: {
    fontSize: 9,
    flex: 1,
  },
  vowCompletedText: {
    color: theme.colors.text.secondary,
  },
  vowPendingText: {
    color: theme.colors.text.tertiary,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trendContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  trendBlock: {
    width: 6,
    height: 6,
    borderRadius: 1,
  },
  actionBtn: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: theme.spacing.borderRadius.card,
    borderWidth: 0.5,
  },
  flagBtn: {
    borderColor: theme.colors.text.tertiary,
  },
  actionBtnText: {
    fontSize: 8,
    fontFamily: theme.typography.fontFamily.medium,
  },
  flagBtnText: {
    fontSize: 8,
    color: theme.colors.text.secondary,
    fontFamily: theme.typography.fontFamily.medium,
  },
  unflagBtn: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  unflagBtnText: {
    fontSize: 8,
    color: theme.colors.text.dark,
    fontFamily: theme.typography.fontFamily.medium,
  },
  selfBadge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    backgroundColor: `${theme.colors.tertiary}15`,
    borderRadius: theme.spacing.borderRadius.card,
  },
  selfBadgeText: {
    fontSize: 8,
    color: theme.colors.tertiary,
    fontFamily: theme.typography.fontFamily.mono,
  },
  keyboardContainer: {
    flex: 1,
    paddingBottom: 80, // tab bar buffer
  },
  chatScroll: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  messageBubbleContainer: {
    flexDirection: 'row',
    width: '100%',
  },
  myBubbleAlign: {
    justifyContent: 'flex-end',
  },
  theirBubbleAlign: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.spacing.borderRadius.card,
  },
  myBubble: {
    backgroundColor: theme.colors.bg.surfaceAlt,
    borderColor: theme.colors.border.lowContrast,
    borderWidth: 0.5,
  },
  theirBubble: {
    backgroundColor: 'rgba(18, 18, 23, 0.65)',
    borderWidth: 0.5,
    borderColor: theme.colors.border.lowContrast,
  },
  messageSender: {
    fontSize: 10,
    color: theme.colors.tertiary,
    fontFamily: theme.typography.fontFamily.medium,
    marginBottom: 4,
  },
  messageText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.primary,
    lineHeight: 18,
  },
  messageTime: {
    fontSize: 8,
    color: theme.colors.text.tertiary,
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  systemMessage: {
    alignItems: 'center',
    marginVertical: 4,
  },
  systemMessageText: {
    fontSize: 10,
    color: theme.colors.text.secondary,
    backgroundColor: theme.colors.bg.surfaceAlt,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.spacing.borderRadius.card,
    fontFamily: theme.typography.fontFamily.mono,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: 'rgba(11, 11, 18, 0.85)',
    borderTopWidth: 0.5,
    borderTopColor: '#161626',
    alignItems: 'center',
    gap: 8,
    ...Platform.select({
      web: {
        backdropFilter: 'blur(20px)',
      }
    })
  },
  textInput: {
    flex: 1,
    backgroundColor: theme.colors.bg.surfaceAlt,
    borderWidth: 0.5,
    borderColor: '#1E1E2E',
    borderRadius: theme.spacing.borderRadius.input,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: theme.colors.text.primary,
    fontSize: theme.typography.fontSize.sm,
  },
  sendBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: theme.colors.tertiary,
    borderRadius: theme.spacing.borderRadius.card,
  },
  sendBtnText: {
    color: theme.colors.text.dark,
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.fontSize.sm,
  },
});

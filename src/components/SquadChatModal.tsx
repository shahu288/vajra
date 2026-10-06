import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from './Text';
import { ZenAvatar } from './ZenAvatar';
import { typography } from '../theme/typography';
import { useAppStore } from '../store/useAppStore';
import { SquadMessage } from '../types';

interface SquadChatModalProps {
  visible: boolean;
  onClose: () => void;
}

export const SquadChatModal: React.FC<SquadChatModalProps> = ({
  visible,
  onClose,
}) => {
  const { user, squadMembers, chatMessages, sendSquadMessage } = useAppStore();
  const [inputText, setInputText] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulse animation for green online dot
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.35,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Auto scroll to bottom
  useEffect(() => {
    if (chatMessages.length > 0 && visible) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [chatMessages.length, visible]);

  if (!user || !visible) return null;

  const handleSend = () => {
    if (!inputText.trim()) return;
    sendSquadMessage(inputText.trim());
    setInputText('');
  };

  const handleQuickReaction = (emoji: string) => {
    sendSquadMessage(emoji);
  };

  const renderMessageItem = (msg: SquadMessage) => {
    const isSystem = msg.type === 'system_event' || msg.sender_id === null;

    if (isSystem) {
      const displayText = msg.body.startsWith('⚡') ? msg.body : `⚡ ${msg.body}`;
      return (
        <View key={msg.id} style={styles.systemEventCard}>
          <Text style={styles.systemEventText}>{displayText}</Text>
        </View>
      );
    }

    const isMe = msg.sender_id === user.id;
    const sender = squadMembers.find((m) => m.id === msg.sender_id);
    const senderName = isMe ? 'You' : sender?.display_name || 'Teammate';
    const archetype = isMe
      ? (user.identity_path || 'Warrior').toUpperCase()
      : (sender?.identity_path || 'Monk').toUpperCase();

    return (
      <View key={msg.id} style={[styles.messageRow, isMe && styles.myMessageRow]}>
        <View style={styles.avatarWrap}>
          <ZenAvatar
            avatarUrl={isMe ? user.avatar_url : sender?.avatar_url}
            name={senderName}
            identityPath={isMe ? user.identity_path : sender?.identity_path}
            size={32}
            borderColor={isMe ? '#F3BA45' : '#262A33'}
            showYouBadge={false}
          />
        </View>

        <View style={[styles.messageBubble, isMe && styles.myMessageBubble]}>
          <View style={styles.messageBubbleHeader}>
            <View style={styles.senderInfoRow}>
              <Text style={[styles.senderName, isMe && styles.mySenderName]}>
                {senderName}
              </Text>
              <Text style={styles.archetypeTag}>[{archetype}]</Text>
            </View>

            <Text style={styles.messageTimestamp}>
              {new Date(msg.created_at).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>

          <Text style={styles.messageBody}>{msg.body}</Text>
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        <View style={styles.mobileFrameContainer}>
          <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
            {/* ─── Top Header: Back button + Title + 4 Active ──── */}
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.backButton}
                activeOpacity={0.7}
                onPress={onClose}
              >
                <Text style={styles.backButtonIcon}>←</Text>
              </TouchableOpacity>

              <View style={styles.headerCenter}>
                <Text style={styles.headerTitle}>WAR ROOM CHAT</Text>
                <View style={styles.activeBadge}>
                  <Animated.View
                    style={[styles.pulsingGreenDot, { opacity: pulseAnim }]}
                  />
                  <Text style={styles.activeBadgeText}>4 Active</Text>
                </View>
              </View>

              <View style={styles.headerRightPlaceholder} />
            </View>

            {/* ─── Full Message Stream ────────────────────────── */}
            <ScrollView
              ref={scrollViewRef}
              style={styles.stream}
              contentContainerStyle={styles.streamContent}
              showsVerticalScrollIndicator={false}
            >
              {chatMessages.map((msg) => renderMessageItem(msg))}
            </ScrollView>

            {/* ─── Sticky Bottom Input Bar ────────────────────── */}
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              style={styles.inputWrapper}
            >
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.inputField}
                  value={inputText}
                  onChangeText={setInputText}
                  placeholder="Send battle cry to squad..."
                  placeholderTextColor="#666E7D"
                  onSubmitEditing={handleSend}
                  returnKeyType="send"
                />

                {/* Reaction Buttons */}
                <View style={styles.reactionsRow}>
                  {['🔥', '⚡', '🛡️'].map((emoji) => (
                    <TouchableOpacity
                      key={emoji}
                      style={styles.reactionBtn}
                      activeOpacity={0.7}
                      onPress={() => handleQuickReaction(emoji)}
                    >
                      <Text style={styles.reactionEmoji}>{emoji}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Send Button */}
                <TouchableOpacity
                  style={styles.sendBtn}
                  activeOpacity={0.8}
                  onPress={handleSend}
                >
                  <Text style={styles.sendBtnIcon}>↑</Text>
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </SafeAreaView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(5, 6, 8, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mobileFrameContainer: {
    width: '100%',
    maxWidth: 430,
    height: '100%',
    backgroundColor: '#0B0C0E',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#262A33',
    overflow: 'hidden',
    position: 'relative',
    ...Platform.select({
      web: {
        boxShadow: '0 0 50px rgba(0, 0, 0, 0.8)',
      },
    }),
  },
  safeArea: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#262A33',
    backgroundColor: '#14171C',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 9,
    backgroundColor: '#0B0C0E',
    borderWidth: 1,
    borderColor: '#262A33',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonIcon: {
    fontSize: 18,
    color: '#F5F6F8',
    fontWeight: '700',
  },
  headerCenter: {
    alignItems: 'center',
    gap: 3,
  },
  headerTitle: {
    fontFamily: typography.fontFamily.uiBold,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    color: '#F3BA45',
    textTransform: 'uppercase',
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 1,
  },
  pulsingGreenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    ...Platform.select({
      web: {
        boxShadow: '0 0 6px #10B981',
      },
    }),
  },
  activeBadgeText: {
    fontFamily: typography.fontFamily.uiSemiBold,
    fontSize: 10,
    fontWeight: '600',
    color: '#10B981',
    letterSpacing: 0.3,
  },
  headerRightPlaceholder: {
    width: 36,
  },

  // Stream
  stream: {
    flex: 1,
    paddingHorizontal: 16,
  },
  streamContent: {
    paddingVertical: 12,
    gap: 10,
  },

  // System Event Card
  systemEventCard: {
    backgroundColor: 'rgba(243, 186, 69, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(243, 186, 69, 0.22)',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignSelf: 'stretch',
    marginVertical: 4,
  },
  systemEventText: {
    fontFamily: typography.fontFamily.uiMedium,
    fontSize: 12,
    fontWeight: '500',
    color: '#F3BA45',
    letterSpacing: 0.3,
    textAlign: 'center',
  },

  // User Message Row
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  myMessageRow: {
    flexDirection: 'row-reverse',
  },
  avatarWrap: {
    marginTop: 2,
  },
  messageBubble: {
    flex: 1,
    backgroundColor: '#14171C',
    borderWidth: 1,
    borderColor: '#262A33',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 9,
    maxWidth: '85%',
    ...Platform.select({
      web: {
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
      },
    }),
  },
  myMessageBubble: {
    backgroundColor: '#171B22',
    borderColor: 'rgba(243, 186, 69, 0.35)',
  },
  messageBubbleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  senderInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  senderName: {
    fontFamily: typography.fontFamily.uiBold,
    fontSize: 12,
    fontWeight: '700',
    color: '#F5F6F8',
  },
  mySenderName: {
    color: '#F3BA45',
  },
  archetypeTag: {
    fontFamily: typography.fontFamily.uiMedium,
    fontSize: 10,
    fontWeight: '500',
    color: '#8A91A0',
  },
  messageTimestamp: {
    fontFamily: typography.fontFamily.ui,
    fontSize: 10,
    color: '#666E7D',
    marginLeft: 6,
  },
  messageBody: {
    fontFamily: typography.fontFamily.ui,
    fontSize: 13,
    color: '#F5F6F8',
    lineHeight: 18,
  },

  // Bottom Input
  inputWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#262A33',
    backgroundColor: '#0B0C0E',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#14171C',
    borderWidth: 1,
    borderColor: '#262A33',
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingVertical: 6,
    gap: 8,
    ...Platform.select({
      web: {
        boxShadow: '0 4px 14px rgba(0, 0, 0, 0.4)',
      },
    }),
  },
  inputField: {
    flex: 1,
    height: 38,
    backgroundColor: '#0B0C0E',
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#262A33',
    paddingHorizontal: 12,
    color: '#F5F6F8',
    fontFamily: typography.fontFamily.ui,
    fontSize: 13,
  },
  reactionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  reactionBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#1A1E26',
    borderWidth: 1,
    borderColor: '#262A33',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reactionEmoji: {
    fontSize: 14,
  },
  sendBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#F3BA45',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnIcon: {
    fontFamily: typography.fontFamily.uiBold,
    fontSize: 16,
    fontWeight: '800',
    color: '#0B0C0E',
    marginTop: -2,
  },
});

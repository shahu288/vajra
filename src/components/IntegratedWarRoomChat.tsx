import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import { Text } from './Text';
import { ZenAvatar } from './ZenAvatar';
import { typography } from '../theme/typography';
import { SquadMessage, SquadMember, User } from '../types';

interface IntegratedWarRoomChatProps {
  messages: SquadMessage[];
  squadMembers: SquadMember[];
  currentUser: User;
  onSendMessage: (body: string) => void;
  onOpenFullChat?: () => void;
}

export const IntegratedWarRoomChat: React.FC<IntegratedWarRoomChatProps> = ({
  messages,
  squadMembers,
  currentUser,
  onSendMessage,
  onOpenFullChat,
}) => {
  const [inputText, setInputText] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulsing active green dot
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

  // Auto scroll to bottom when messages update
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const handleQuickReaction = (emoji: string) => {
    onSendMessage(emoji);
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

    const isMe = msg.sender_id === currentUser.id;
    const sender = squadMembers.find((m) => m.id === msg.sender_id);
    const senderName = isMe ? 'You' : sender?.display_name || 'Teammate';
    const archetype = isMe
      ? (currentUser.identity_path || 'Warrior').toUpperCase()
      : (sender?.identity_path || 'Monk').toUpperCase();

    const initials = isMe
      ? 'YOU'
      : senderName
          .split(' ')
          .map((n) => n[0])
          .join('')
          .substring(0, 2)
          .toUpperCase() || 'TM';

    return (
      <View key={msg.id} style={[styles.messageRow, isMe && styles.myMessageRow]}>
        <View style={styles.avatarWrap}>
          <ZenAvatar
            avatarUrl={isMe ? currentUser.avatar_url : sender?.avatar_url}
            name={senderName}
            identityPath={isMe ? currentUser.identity_path : sender?.identity_path}
            size={28}
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
    <View style={styles.container}>
      {/* ─── Header: WAR ROOM CHAT & Pulse Dot ───────────────── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>WAR ROOM CHAT</Text>
          <View style={styles.activeBadge}>
            <Animated.View
              style={[styles.pulsingGreenDot, { opacity: pulseAnim }]}
            />
            <Text style={styles.activeBadgeText}>4 Active</Text>
          </View>
        </View>

        {onOpenFullChat && (
          <TouchableOpacity
            style={styles.openChatBtn}
            activeOpacity={0.7}
            onPress={onOpenFullChat}
          >
            <Text style={styles.openChatBtnText}>OPEN CHAT ↗</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ─── Live Message Stream ─────────────────────────────── */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.stream}
        contentContainerStyle={styles.streamContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((msg) => renderMessageItem(msg))}
      </ScrollView>

      {/* ─── Sticky Bottom Input Bar ─────────────────────────── */}
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

        {/* Mini Reaction Pills */}
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

        {/* Gold Send Button */}
        <TouchableOpacity
          style={styles.sendBtn}
          activeOpacity={0.8}
          onPress={handleSend}
        >
          <Text style={styles.sendBtnIcon}>↑</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 10,
    backgroundColor: '#0B0C0E',
    borderTopWidth: 1,
    borderTopColor: '#1A1E26',
    paddingTop: 8,
    minHeight: 180,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginBottom: 6,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontFamily: typography.fontFamily.uiBold,
    fontSize: 11,
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
    borderRadius: 12,
    paddingHorizontal: 7,
    paddingVertical: 2,
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
  openChatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
    paddingHorizontal: 7,
    borderRadius: 6,
    backgroundColor: 'rgba(243, 186, 69, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(243, 186, 69, 0.25)',
  },
  openChatBtnText: {
    fontFamily: typography.fontFamily.uiBold,
    fontSize: 9.5,
    fontWeight: '700',
    color: '#F3BA45',
    letterSpacing: 0.8,
  },

  // Stream
  stream: {
    flex: 1,
  },
  streamContent: {
    paddingVertical: 4,
    gap: 8,
  },

  // System Event Card
  systemEventCard: {
    backgroundColor: 'rgba(243, 186, 69, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(243, 186, 69, 0.2)',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignSelf: 'stretch',
    marginVertical: 2,
  },
  systemEventText: {
    fontFamily: typography.fontFamily.uiMedium,
    fontSize: 11.5,
    fontWeight: '500',
    color: '#F3BA45',
    letterSpacing: 0.3,
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
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 7,
    maxWidth: '88%',
    ...Platform.select({
      web: {
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)',
      },
    }),
  },
  myMessageBubble: {
    backgroundColor: '#171B22',
    borderColor: 'rgba(243, 186, 69, 0.3)',
  },
  messageBubbleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  senderInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
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
    fontSize: 9.5,
    fontWeight: '500',
    color: '#8A91A0',
  },
  messageTimestamp: {
    fontFamily: typography.fontFamily.ui,
    fontSize: 9.5,
    color: '#666E7D',
    marginLeft: 6,
  },
  messageBody: {
    fontFamily: typography.fontFamily.ui,
    fontSize: 12,
    color: '#F5F6F8',
    lineHeight: 16,
  },

  // Sticky Input Container
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#14171C',
    borderWidth: 1,
    borderColor: '#262A33',
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingVertical: 5,
    marginTop: 6,
    marginBottom: 66, // Sits directly above bottom tab bar without overlapping
    gap: 6,
    ...Platform.select({
      web: {
        boxShadow: '0 4px 14px rgba(0, 0, 0, 0.4)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
      },
    }),
  },
  inputField: {
    flex: 1,
    height: 36,
    backgroundColor: '#0B0C0E',
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#262A33',
    paddingHorizontal: 10,
    color: '#F5F6F8',
    fontFamily: typography.fontFamily.ui,
    fontSize: 12,
  },
  reactionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reactionBtn: {
    width: 28,
    height: 28,
    borderRadius: 7,
    backgroundColor: '#1A1E26',
    borderWidth: 1,
    borderColor: '#262A33',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reactionEmoji: {
    fontSize: 13,
  },
  sendBtn: {
    width: 32,
    height: 32,
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

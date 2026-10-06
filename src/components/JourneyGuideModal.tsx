import React, { useState } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Text } from './Text';
import { Card } from './Card';
import { theme } from '../theme';

interface JourneyGuideModalProps {
  visible: boolean;
  onClose: () => void;
}

const GUIDE_TOPICS = [
  {
    id: 'what_is_vajra',
    title: '⛩️ What is Vajra?',
    content: `Vajra (meaning 'Diamond' or 'Thunderbolt' in Sanskrit) is a quiet discipline sanctuary. It is designed to forge unbreakable habits through small daily commitments, accountability circles, and personal reflection—free from social media clutter or gaming aesthetics.`
  },
  {
    id: '30day_journey',
    title: '⭕ How the 30-Day Journey Works',
    content: `Your discipline journey runs in 30-day cycles. You walk the path alongside a quiet 4-member Discipline Circle (Squad). At the end of 30 days, your squad achievements are summarized, awards are granted, and you begin the next cycle rematched with peers at your stage.`
  },
  {
    id: 'vows',
    title: '📜 How Vows & Commitments Work',
    content: `You choose exactly 3 daily vows (e.g. 'Wake before 6 AM', 'Workout 45 min', 'Read 20 pages'). Each day you check off completed vows, log reflections, and defend your daily flame. Honoring all vows builds your streak and Discipline Score.`
  },
  {
    id: 'mss_score',
    title: '🔥 Discipline Score (MSS)',
    content: `Your Mastery Discipline Score (0 to 100 MSS) reflects your consistency over the last 30 days. Completing daily vows raises your score. Missing days without a Recovery Shield lowers it.`
  },
  {
    id: 'xp_streaks',
    title: '⚡ XP & Streaks System',
    content: `Every completed vow earns XP towards your level tier (Building → Awakening → Forged → Master). Maintaining consecutive daily streaks unlocks rare collectible cards, achievement badges, and recovery shields.`
  },
  {
    id: 'forged_cards',
    title: '🃏 Forged Cards',
    content: `Forged Cards are collectible sumi-e artworks earned by completing streak milestones and discipline challenges. Each card represents a guardian of self-mastery.`
  },
  {
    id: 'squad_system',
    title: '🛡️ Squad System',
    content: `Squads are automatic 4-member peer groups matched by your stage and discipline score. Squad members encourage each other through daily check-ins and quiet attendance without social noise.`
  },
  {
    id: 'hall_of_mastery',
    title: '🏛️ Hall of Mastery',
    content: `The Hall of Mastery rewards long-term completion across categories (Body, Mind, Digital, Finance, Spiritual, Learning). Completing cards in a category unlocks permanent mastery badges.`
  },
  {
    id: 'faq',
    title: '❓ Frequently Asked Questions',
    content: `Q: What happens if I miss a day?\nA: If you have a Recovery Shield, your streak is preserved.\n\nQ: Can I edit my vows mid-journey?\nA: You can adjust your active vows anytime from the Check-in tab.`
  }
];

export const JourneyGuideModal: React.FC<JourneyGuideModalProps> = ({ visible, onClose }) => {
  const [selectedTopicId, setSelectedTopicId] = useState<string>('what_is_vajra');

  const activeTopic = GUIDE_TOPICS.find(t => t.id === selectedTopicId) || GUIDE_TOPICS[0];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Card style={styles.modalCard}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.badgeText}>SANCTUARY MANUAL</Text>
              <Text style={styles.title}>JOURNEY GUIDE</Text>
            </View>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Topic Navigation Tabs */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
            {GUIDE_TOPICS.map((topic) => {
              const isActive = selectedTopicId === topic.id;
              return (
                <TouchableOpacity
                  key={topic.id}
                  style={[styles.topicTab, isActive && styles.activeTopicTab]}
                  onPress={() => setSelectedTopicId(topic.id)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.topicTabText, isActive && styles.activeTopicTabText]}>
                    {topic.title}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Active Topic Body */}
          <ScrollView style={styles.bodyScroll} showsVerticalScrollIndicator={false}>
            <View style={styles.topicContentCard}>
              <Text style={styles.topicHeader}>{activeTopic.title}</Text>
              <Text style={styles.topicBodyText}>{activeTopic.content}</Text>
            </View>
          </ScrollView>
        </Card>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(13, 13, 14, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16
  },
  modalCard: {
    width: '100%',
    maxWidth: 440,
    maxHeight: '84%',
    backgroundColor: '#14171C',
    borderColor: '#262A33',
    borderWidth: 1,
    borderRadius: 16,
    padding: 20
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#262A33',
    paddingBottom: 10
  },
  badgeText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: '700',
    fontSize: 9,
    color: '#F3BA45',
    letterSpacing: 2,
    marginBottom: 2
  },
  title: {
    fontFamily: theme.typography.fontFamily.serif,
    fontSize: 18,
    color: theme.colors.text.primary
  },
  closeText: {
    color: '#8A91A0',
    fontSize: 18,
    padding: 4
  },
  tabScroll: {
    gap: 8,
    paddingBottom: 12
  },
  topicTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#1C2027',
    borderWidth: 1,
    borderColor: '#262A33'
  },
  activeTopicTab: {
    backgroundColor: 'rgba(243, 186, 69, 0.12)',
    borderColor: '#F3BA45'
  },
  topicTabText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: '700',
    fontSize: 10,
    color: '#8A91A0'
  },
  activeTopicTabText: {
    color: '#F3BA45'
  },
  bodyScroll: {
    marginTop: 4
  },
  topicContentCard: {
    backgroundColor: '#1C2027',
    borderColor: '#262A33',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16
  },
  topicHeader: {
    fontFamily: theme.typography.fontFamily.serif,
    fontSize: 16,
    color: '#F3BA45',
    marginBottom: 10
  },
  topicBodyText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 13,
    color: theme.colors.text.primary,
    lineHeight: 22
  }
});

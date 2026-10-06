import React, { useState } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Text } from './Text';
import { Card } from './Card';
import { theme } from '../theme';
import { ZEN_AVATAR_LIBRARY, ZenAvatarItem } from '../constants/zenAvatars';
import { ZenAvatar } from './ZenAvatar';

interface ZenAvatarLibraryModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectAvatarItem: (itemId: string) => void;
  currentAvatarUrl?: string | null;
}

const CATEGORIES = [
  { id: 'all', label: 'ALL' },
  { id: 'warriors', label: 'WARRIORS' },
  { id: 'scholars', label: 'SCHOLARS' },
  { id: 'monks', label: 'MONKS' },
  { id: 'creators', label: 'CREATORS' },
  { id: 'guardians', label: 'GUARDIANS' },
];

export const ZenAvatarLibraryModal: React.FC<ZenAvatarLibraryModalProps> = ({
  visible,
  onClose,
  onSelectAvatarItem,
  currentAvatarUrl
}) => {
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredItems = activeCategory === 'all'
    ? ZEN_AVATAR_LIBRARY
    : ZEN_AVATAR_LIBRARY.filter(item => item.category === activeCategory);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Card style={styles.modalCard}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.badgeText}>TEMPLE COLLECTION</Text>
              <Text style={styles.title}>JAPANESE ZEN AVATAR GALLERY</Text>
            </View>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Category Tabs */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.categoryTab, isActive && styles.activeCategoryTab]}
                  onPress={() => setActiveCategory(cat.id)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.categoryTabText, isActive && styles.activeCategoryTabText]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Avatar Gallery Grid */}
          <ScrollView contentContainerStyle={styles.gridContainer} showsVerticalScrollIndicator={false}>
            <View style={styles.avatarGrid}>
              {filteredItems.map((item: ZenAvatarItem) => {
                const isSelected = currentAvatarUrl === item.id;
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.avatarTile, isSelected && styles.selectedTile]}
                    onPress={() => {
                      onSelectAvatarItem(item.id);
                      onClose();
                    }}
                    activeOpacity={0.85}
                  >
                    <ZenAvatar
                      avatarUrl={item.id}
                      size={64}
                      borderColor={item.borderColor}
                    />

                    <Text numberOfLines={1} style={[styles.avatarTitle, isSelected && styles.selectedAvatarTitle]}>
                      {item.title}
                    </Text>

                    <View style={styles.kanjiTag}>
                      <Text style={styles.kanjiTagText}>{item.kanji}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
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
    maxHeight: '82%',
    backgroundColor: '#161619',
    borderColor: '#C99A5A',
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
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
    paddingBottom: 10
  },
  badgeText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: '700',
    fontSize: 9,
    color: '#C99A5A',
    letterSpacing: 2,
    marginBottom: 2
  },
  title: {
    fontFamily: theme.typography.fontFamily.serif,
    fontSize: 16,
    color: theme.colors.text.primary
  },
  closeText: {
    color: '#C99A5A',
    fontSize: 18,
    padding: 4
  },
  categoryScroll: {
    gap: 8,
    paddingBottom: 12
  },
  categoryTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)'
  },
  activeCategoryTab: {
    backgroundColor: 'rgba(201, 154, 90, 0.15)',
    borderColor: '#C99A5A'
  },
  categoryTabText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: '700',
    fontSize: 10,
    color: '#8A8A99',
    letterSpacing: 1
  },
  activeCategoryTabText: {
    color: '#C99A5A'
  },
  gridContainer: {
    paddingVertical: 8
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between'
  },
  avatarTile: {
    width: '30%',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center'
  },
  selectedTile: {
    borderColor: '#C99A5A',
    backgroundColor: 'rgba(201, 154, 90, 0.12)'
  },
  avatarTitle: {
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: '700',
    fontSize: 10,
    color: theme.colors.text.primary,
    marginTop: 8,
    textAlign: 'center'
  },
  selectedAvatarTitle: {
    color: '#C99A5A'
  },
  kanjiTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    marginTop: 4
  },
  kanjiTagText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 9,
    color: '#8A8A99'
  }
});

import React from 'react';
import { View, StyleSheet, Image, StyleProp, ViewStyle } from 'react-native';
import { Text } from './Text';
import { theme } from '../theme';
import { PathType } from '../types';
import { ZEN_AVATAR_LIBRARY } from '../constants/zenAvatars';

interface ZenAvatarProps {
  avatarUrl?: string | null;
  name?: string;
  identityPath?: PathType;
  size?: number;
  borderColor?: string;
  showYouBadge?: boolean;
  style?: StyleProp<ViewStyle>;
}

const ARCHETYPE_COLORS: Record<string, string> = {
  warrior: '#C99A5A',
  scholar: '#4A90E2',
  monk: '#50E3C2',
  creator: '#E67E22',
  custom: '#C99A5A'
};

const ARCHETYPE_KANJI: Record<string, string> = {
  warrior: '武',
  scholar: '文',
  monk: '禅',
  creator: '藝',
  custom: '道'
};

export const ZenAvatar: React.FC<ZenAvatarProps> = ({
  avatarUrl,
  name = 'Warrior',
  identityPath = 'warrior',
  size = 64,
  borderColor,
  showYouBadge = false,
  style
}) => {
  // Check if avatarUrl matches a built-in library item
  const libraryItem = avatarUrl ? ZEN_AVATAR_LIBRARY.find(item => item.id === avatarUrl) : null;
  
  // Check if avatarUrl is a custom file / web image URL
  const isCustomFileImage = avatarUrl && !libraryItem && (
    avatarUrl.startsWith('http://') || 
    avatarUrl.startsWith('https://') || 
    avatarUrl.startsWith('data:') || 
    avatarUrl.startsWith('file:') ||
    avatarUrl.startsWith('blob:')
  );

  const accentColor = borderColor || (libraryItem ? libraryItem.borderColor : (ARCHETYPE_COLORS[identityPath] || '#C99A5A'));
  const kanjiSymbol = libraryItem ? libraryItem.kanji : (ARCHETYPE_KANJI[identityPath] || '武');

  const getInitials = (str: string) => {
    if (!str) return 'W';
    const parts = str.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return str.substring(0, 2).toUpperCase();
  };

  const initials = getInitials(name);
  const fontSize = Math.round(size * 0.32);

  return (
    <View style={[{ width: size, height: size }, styles.container, style]}>
      <View 
        style={[
          styles.avatarRing, 
          { 
            width: size, 
            height: size, 
            borderRadius: size / 2, 
            borderColor: accentColor,
            backgroundColor: libraryItem ? libraryItem.bgGrad[0] : '#161619'
          }
        ]}
      >
        {isCustomFileImage ? (
          <Image 
            source={{ uri: avatarUrl! }} 
            style={{ width: size, height: size, borderRadius: size / 2 }} 
            resizeMode="cover"
          />
        ) : libraryItem ? (
          <View style={[styles.libraryAvatarContent, { width: size, height: size, borderRadius: size / 2, backgroundColor: libraryItem.bgGrad[0] }]}>
            <View style={[styles.ensoInnerRing, { width: size * 0.82, height: size * 0.82, borderRadius: (size * 0.82) / 2, borderColor: libraryItem.borderColor }]} />
            <Text style={{ fontSize: Math.round(size * 0.36), marginTop: -2 }}>
              {libraryItem.iconSymbol}
            </Text>
            <Text style={[styles.kanjiSubText, { fontSize: Math.max(8, Math.round(size * 0.18)), color: libraryItem.borderColor }]}>
              {libraryItem.kanji}
            </Text>
          </View>
        ) : (
          <View style={[styles.defaultAvatarContent, { width: size, height: size, borderRadius: size / 2 }]}>
            <View style={[styles.ensoInnerRing, { width: size * 0.8, height: size * 0.8, borderRadius: (size * 0.8) / 2 }]} />
            <Text style={[styles.initialsText, { fontSize, color: accentColor }]}>
              {initials}
            </Text>
            <Text style={[styles.kanjiSubText, { fontSize: Math.max(7, Math.round(size * 0.16)) }]}>
              {kanjiSymbol}
            </Text>
          </View>
        )}
      </View>

      {/* Optional "YOU" badge */}
      {showYouBadge && (
        <View style={styles.youBadge}>
          <Text style={styles.youBadgeText}>YOU</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarRing: {
    borderWidth: 1.5,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#C99A5A',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 6
  },
  defaultAvatarContent: {
    backgroundColor: '#1E1E24',
    alignItems: 'center',
    justifyContent: 'center'
  },
  libraryAvatarContent: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  ensoInnerRing: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'rgba(201, 154, 90, 0.2)',
    borderStyle: 'dashed'
  },
  initialsText: {
    fontFamily: theme.typography.fontFamily.serif,
    fontWeight: '700',
    letterSpacing: 1
  },
  kanjiSubText: {
    fontFamily: theme.typography.fontFamily.regular,
    color: '#8A8A99',
    marginTop: -2,
    opacity: 0.9
  },
  youBadge: {
    position: 'absolute',
    bottom: -2,
    backgroundColor: '#C99A5A',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4
  },
  youBadgeText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: '700',
    fontSize: 8,
    color: '#0D0D0E'
  }
});

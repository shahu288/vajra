import React from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Text } from './Text';
import { theme } from '../theme';

interface AvatarActionSheetProps {
  visible: boolean;
  onClose: () => void;
  onSelectImage: (uri: string) => void;
  onOpenLibrary: () => void;
  onRemovePhoto: () => void;
  hasCustomPhoto: boolean;
}

export const AvatarActionSheet: React.FC<AvatarActionSheetProps> = ({
  visible,
  onClose,
  onSelectImage,
  onOpenLibrary,
  onRemovePhoto,
  hasCustomPhoto
}) => {
  const handlePickFromGallery = async () => {
    onClose();
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert(
          'Gallery Access Needed',
          'Please allow access to your photos to choose a custom profile picture.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        onSelectImage(result.assets[0].uri);
      }
    } catch (e) {
      console.error('Failed to pick image from gallery:', e);
      Alert.alert('Image Selection Error', 'Unable to pick image from gallery.');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose}>
        <View style={styles.sheetContainer}>
          {/* Header Indicator */}
          <View style={styles.handleBar} />
          <Text style={styles.sheetTitle}>PROFILE PICTURE</Text>

          {/* Option 1: Choose from Gallery */}
          <TouchableOpacity style={styles.actionRow} onPress={handlePickFromGallery} activeOpacity={0.75}>
            <Text style={styles.actionIcon}>📸</Text>
            <View style={styles.actionTextGroup}>
              <Text style={styles.actionLabel}>Choose from Gallery</Text>
              <Text style={styles.actionSub}>Select photo & crop circular avatar</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Option 2: Choose an Avatar */}
          <TouchableOpacity 
            style={styles.actionRow} 
            onPress={() => {
              onClose();
              onOpenLibrary();
            }} 
            activeOpacity={0.75}
          >
            <Text style={styles.actionIcon}>🎨</Text>
            <View style={styles.actionTextGroup}>
              <Text style={styles.actionLabel}>Choose an Avatar</Text>
              <Text style={styles.actionSub}>Explore Japanese Zen sumi-e artwork library</Text>
            </View>
          </TouchableOpacity>

          {/* Option 3: Remove Photo (Conditional) */}
          {hasCustomPhoto && (
            <>
              <View style={styles.divider} />
              <TouchableOpacity 
                style={styles.actionRow} 
                onPress={() => {
                  onClose();
                  onRemovePhoto();
                }} 
                activeOpacity={0.75}
              >
                <Text style={styles.actionIcon}>🗑️</Text>
                <View style={styles.actionTextGroup}>
                  <Text style={[styles.actionLabel, styles.removeLabel]}>Remove Photo</Text>
                  <Text style={styles.actionSub}>Reset to default temple avatar</Text>
                </View>
              </TouchableOpacity>
            </>
          )}

          <View style={styles.divider} />

          {/* Cancel */}
          <TouchableOpacity style={styles.cancelBtn} onPress={onClose} activeOpacity={0.8}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(13, 13, 14, 0.75)',
    justifyContent: 'flex-end'
  },
  sheetContainer: {
    backgroundColor: '#14171C',
    borderColor: '#262A33',
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 34,
    alignItems: 'center'
  },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#262A33',
    marginBottom: 16
  },
  sheetTitle: {
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: '700',
    fontSize: 11,
    color: '#F3BA45',
    letterSpacing: 2,
    marginBottom: 16
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 8
  },
  actionIcon: {
    fontSize: 22,
    marginRight: 14
  },
  actionTextGroup: {
    flex: 1
  },
  actionLabel: {
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: '700',
    fontSize: 14,
    color: theme.colors.text.primary
  },
  removeLabel: {
    color: '#A33A3A'
  },
  actionSub: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 11,
    color: '#8A91A0',
    marginTop: 2
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#262A33',
    marginVertical: 4
  },
  cancelBtn: {
    width: '100%',
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8
  },
  cancelText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: '700',
    fontSize: 13,
    color: '#8A91A0',
    letterSpacing: 1
  }
});

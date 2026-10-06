import React, { useState } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, TextInput } from 'react-native';
import { Text } from './Text';
import { Card } from './Card';
import { theme, useTheme } from '../theme';
import { useAppStore } from '../store/useAppStore';
import { ZenAvatar } from './ZenAvatar';
import { AvatarActionSheet } from './AvatarActionSheet';
import { ZenAvatarLibraryModal } from './ZenAvatarLibraryModal';

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ visible, onClose }) => {
  const { colors } = useTheme();
  const { user, updateUserProfile } = useAppStore();
  const [name, setName] = useState(user?.display_name || '');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user?.avatar_url || null);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [showLibraryModal, setShowLibraryModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  if (!user) return null;

  const handleSave = async () => {
    if (!name.trim()) return;
    setIsSaving(true);
    await updateUserProfile(name.trim(), avatarUrl);
    setIsSaving(false);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Card style={styles.modalCard}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>EDIT DISCIPLINE PROFILE</Text>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Interactive Tap-to-Change Avatar */}
          <View style={styles.avatarPreviewWrapper}>
            <TouchableOpacity 
              style={styles.avatarButton} 
              onPress={() => setShowActionSheet(true)}
              activeOpacity={0.85}
            >
              <ZenAvatar
                avatarUrl={avatarUrl}
                name={name || user.display_name}
                identityPath={user.identity_path}
                size={84}
              />
              <View style={styles.cameraPill}>
                <Text style={styles.cameraPillText}>📷 Change Photo</Text>
              </View>
            </TouchableOpacity>
            <Text style={styles.tapSubText}>Tap avatar to pick from gallery or Zen library</Text>
          </View>

          {/* Display Name Input */}
          <Text style={styles.inputLabel}>DISPLAY NAME</Text>
          <TextInput
            style={styles.textInput}
            value={name}
            onChangeText={setName}
            placeholder="Enter your warrior name..."
            placeholderTextColor="#666"
          />

          {/* Save Button */}
          <TouchableOpacity 
            style={[styles.saveButton, isSaving && styles.disabledBtn]} 
            onPress={handleSave}
            disabled={isSaving}
            activeOpacity={0.85}
          >
            <Text style={styles.saveButtonText}>
              {isSaving ? 'LOCKING IN...' : 'LOCK IN PROFILE ⚡'}
            </Text>
          </TouchableOpacity>
        </Card>
      </View>

      {/* Avatar Action Sheet */}
      <AvatarActionSheet
        visible={showActionSheet}
        onClose={() => setShowActionSheet(false)}
        onSelectImage={(uri) => setAvatarUrl(uri)}
        onOpenLibrary={() => setShowLibraryModal(true)}
        onRemovePhoto={() => setAvatarUrl(null)}
        hasCustomPhoto={!!avatarUrl}
      />

      {/* Zen Illustrated Avatar Library Gallery */}
      <ZenAvatarLibraryModal
        visible={showLibraryModal}
        onClose={() => setShowLibraryModal(false)}
        onSelectAvatarItem={(itemId) => setAvatarUrl(itemId)}
        currentAvatarUrl={avatarUrl}
      />
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
  modalCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#14171C',
    borderColor: '#262A33',
    borderWidth: 1,
    borderRadius: 16,
    padding: 24
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#262A33',
    paddingBottom: 12
  },
  title: {
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: '700',
    fontSize: 12,
    color: '#F3BA45',
    letterSpacing: 1.5
  },
  closeText: {
    color: '#8A91A0',
    fontSize: 16
  },
  avatarPreviewWrapper: {
    alignItems: 'center',
    marginBottom: 20
  },
  avatarButton: {
    alignItems: 'center'
  },
  cameraPill: {
    marginTop: -10,
    backgroundColor: '#F3BA45',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#262A33'
  },
  cameraPillText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: '700',
    fontSize: 9,
    color: '#0B0C0E'
  },
  tapSubText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 10,
    color: '#8A91A0',
    marginTop: 8
  },
  inputLabel: {
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: '700',
    fontSize: 10,
    color: '#8A91A0',
    letterSpacing: 1,
    marginBottom: 8
  },
  textInput: {
    height: 44,
    backgroundColor: '#1C2027',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#262A33',
    paddingHorizontal: 12,
    color: '#F5F6F8',
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 14,
    marginBottom: 16
  },
  saveButton: {
    backgroundColor: '#F3BA45',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8
  },
  disabledBtn: {
    opacity: 0.5
  },
  saveButtonText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: '700',
    fontSize: 12,
    color: '#0B0C0E',
    letterSpacing: 1.5
  }
});

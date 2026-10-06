import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import { useAppStore } from '../store/useAppStore';
import { useTheme, typography, spacing } from '../theme';
import { Text } from './Text';

interface VowNoteModalProps {
  visible: boolean;
  vowId: string | null;
  vowName?: string | null;
  mode: 'kept' | 'missed';
  onClose: () => void;
  onSaved?: (note: string) => void;
}

const MISSED_SUGGESTIONS = [
  'Had to work late.',
  'Was feeling tired.',
  'Got distracted.',
  'Had an unexpected commitment.',
];

const KEPT_SUGGESTIONS = [
  'Deep focus throughout.',
  'Felt strong and disciplined.',
  'Overcame initial resistance.',
];

export function VowNoteModal({
  visible,
  vowId,
  vowName,
  mode,
  onClose,
  onSaved,
}: VowNoteModalProps) {
  const { colors, isDark } = useTheme();
  const { activeVows, vowReflections, updateVowReflection } = useAppStore();

  const vow = activeVows.find((v) => v.id === vowId);
  const displayName = vowName || vow?.custom_name || 'Vow';

  const [noteText, setNoteText] = useState('');
  const isMissed = mode === 'missed';
  const existingNote = vowId ? vowReflections[vowId] || '' : '';
  const isEditing = Boolean(existingNote && existingNote.trim().length > 0);

  useEffect(() => {
    if (visible && vowId) {
      setNoteText(vowReflections[vowId] || '');
    }
  }, [visible, vowId, vowReflections]);

  if (!visible) return null;

  const handleSave = async () => {
    if (!vowId) return;
    const finalNote = noteText.trim();
    await updateVowReflection(vowId, finalNote);
    if (onSaved) onSaved(finalNote);
    onClose();
  };

  const handleSuggestionPress = (text: string) => {
    if (noteText.trim().length === 0) {
      setNoteText(text);
    } else {
      setNoteText((prev) => `${prev} ${text}`);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.keyboardAvoid}
          >
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View
                style={[
                  styles.sheetContainer,
                  {
                    backgroundColor: '#14171C',
                    borderColor: isMissed ? 'rgba(163, 58, 58, 0.4)' : '#262A33',
                  },
                ]}
              >
                {/* Notch indicator */}
                <View style={styles.notch} />

                {/* Header Badge & Title */}
                <View style={styles.header}>
                  <View style={styles.headerTitleRow}>
                    <View
                      style={[
                        styles.modeBadge,
                        {
                          backgroundColor: isMissed
                            ? 'rgba(163, 58, 58, 0.15)'
                            : 'rgba(56, 161, 105, 0.15)',
                          borderColor: isMissed ? '#A33A3A' : '#38A169',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.modeBadgeText,
                          { color: isMissed ? '#E53E3E' : '#38A169' },
                        ]}
                      >
                        {isMissed ? 'MISSED VOW' : 'KEPT VOW ✓'}
                      </Text>
                    </View>

                    <Text style={styles.vowNameLabel} numberOfLines={1}>
                      {displayName}
                    </Text>
                  </View>

                  <Text style={styles.promptTitle}>
                    {isMissed
                      ? isEditing
                        ? 'Edit note for missed vow'
                        : 'What got in the way?'
                      : isEditing
                      ? 'Edit your reflection'
                      : 'Add a note'}
                  </Text>

                  <Text style={styles.promptSub}>
                    {isMissed
                      ? 'Optional context for your Discipline Journal history.'
                      : 'Optional insights or thoughts from today.'}
                  </Text>
                </View>

                {/* Quick Suggestion Chips */}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.chipsContainer}
                >
                  {(isMissed ? MISSED_SUGGESTIONS : KEPT_SUGGESTIONS).map(
                    (suggestion, idx) => (
                      <TouchableOpacity
                        key={idx}
                        activeOpacity={0.75}
                        style={[
                          styles.chip,
                          noteText.includes(suggestion) && styles.chipActive,
                        ]}
                        onPress={() => handleSuggestionPress(suggestion)}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            noteText.includes(suggestion) && styles.chipTextActive,
                          ]}
                        >
                          {suggestion}
                        </Text>
                      </TouchableOpacity>
                    )
                  )}
                </ScrollView>

                {/* Text Input */}
                <TextInput
                  style={styles.textInput}
                  multiline
                  numberOfLines={3}
                  placeholder={
                    isMissed
                      ? 'Add a note... (e.g. Had to work late, was feeling tired...)'
                      : 'Add a note... (e.g. Felt great, stayed focused throughout...)'
                  }
                  placeholderTextColor="#5A5A66"
                  value={noteText}
                  onChangeText={setNoteText}
                  autoFocus={Platform.OS !== 'web'}
                />

                {/* Action Buttons */}
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={styles.skipBtn}
                    activeOpacity={0.7}
                    onPress={onClose}
                  >
                    <Text style={styles.skipBtnText}>
                      {isEditing ? 'CANCEL' : 'SKIP'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.saveBtn,
                      {
                        backgroundColor: isMissed ? '#A33A3A' : '#F3BA45',
                      },
                    ]}
                    activeOpacity={0.85}
                    onPress={handleSave}
                  >
                    <Text
                      style={[
                        styles.saveBtnText,
                        { color: isMissed ? '#FFFFFF' : '#0B0C0E' },
                      ]}
                    >
                      SAVE
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(5, 6, 8, 0.85)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  keyboardAvoid: {
    width: '100%',
    maxWidth: 440,
  },
  sheetContainer: {
    width: '100%',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderWidth: 1,
    borderBottomWidth: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
    gap: 12,
  },
  notch: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#262A33',
    alignSelf: 'center',
    marginBottom: 4,
  },
  header: {
    gap: 4,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 2,
  },
  modeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  modeBadgeText: {
    fontFamily: typography.fontFamily.uiBold,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  vowNameLabel: {
    fontFamily: typography.fontFamily.uiMedium,
    fontSize: 12,
    color: '#8A91A0',
    flex: 1,
    textAlign: 'right',
  },
  promptTitle: {
    fontFamily: typography.fontFamily.displayBold,
    fontSize: 18,
    fontWeight: '700',
    color: '#F5F6F8',
    letterSpacing: 0.2,
  },
  promptSub: {
    fontFamily: typography.fontFamily.ui,
    fontSize: 12,
    color: '#8A91A0',
    lineHeight: 16,
  },
  chipsContainer: {
    gap: 8,
    paddingVertical: 4,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#1C2027',
    borderWidth: 1,
    borderColor: '#262A33',
  },
  chipActive: {
    borderColor: '#F3BA45',
    backgroundColor: 'rgba(243, 186, 69, 0.12)',
  },
  chipText: {
    fontFamily: typography.fontFamily.uiMedium,
    fontSize: 11,
    color: '#8A91A0',
  },
  chipTextActive: {
    color: '#F3BA45',
    fontWeight: '600',
  },
  textInput: {
    backgroundColor: '#0B0C0E',
    borderWidth: 1,
    borderColor: '#262A33',
    borderRadius: 12,
    padding: 12,
    color: '#F5F6F8',
    fontFamily: typography.fontFamily.ui,
    fontSize: 14,
    lineHeight: 20,
    minHeight: 76,
    textAlignVertical: 'top',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 4,
  },
  skipBtn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#262A33',
    backgroundColor: '#1C2027',
  },
  skipBtnText: {
    fontFamily: typography.fontFamily.uiBold,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    color: '#8A91A0',
  },
  saveBtn: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    fontFamily: typography.fontFamily.uiBold,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
});

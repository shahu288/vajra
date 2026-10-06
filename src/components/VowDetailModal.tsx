import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  TextInput, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  Image
} from 'react-native';
import { useAppStore, getVowConfig } from '../store/useAppStore';
import { theme, useTheme, typography } from '../theme';
import { Text } from './Text';
import { Card } from './Card';
import { getMissionCardData } from '../utils/cardMapping';

interface VowDetailModalProps {
  vowId: string | null;
  visible: boolean;
  onClose: () => void;
}

export function VowDetailModal({ vowId, visible, onClose }: VowDetailModalProps) {
  const { colors } = useTheme();
  const { 
    activeVows, 
    vowLogs, 
    vowProgress, 
    vowReflections, 
    updateVowProgress, 
    updateVowReflection, 
    checkInVow 
  } = useAppStore();

  const vow = activeVows.find(v => v.id === vowId);

  // Local state to keep updates draft before saving
  const [localProgress, setLocalProgress] = useState<number>(0);
  const [localCompleted, setLocalCompleted] = useState<boolean>(false);
  const [localReflection, setLocalReflection] = useState<string>('');
  const [showBrokenConfirm, setShowBrokenConfirm] = useState<boolean>(false);
  const [brokenReflection, setBrokenReflection] = useState<string>('');

  useEffect(() => {
    if (vow) {
      setLocalProgress(vowProgress[vow.id] || 0);
      setLocalCompleted(vowLogs[vow.id] || false);
      setLocalReflection(vowReflections[vow.id] || '');
      setShowBrokenConfirm(false);
      setBrokenReflection('');
    }
  }, [vowId, vow, visible]);

  if (!vow) return null;

  const config = getVowConfig(vow.custom_name || '');
  const cardData = getMissionCardData(vow.custom_name || '');

  // Quick addition logic based on vow type/unit
  const getQuickAddSteps = () => {
    const unit = config.unit.toLowerCase();
    if (unit === 'ml') return [250, 500];
    if (unit === 'mins') return [15, 30];
    if (unit === 'pages') return [5, 10];
    return [1, 5];
  };

  const quickSteps = getQuickAddSteps();

  const handleAdjustProgress = (amount: number) => {
    const next = Math.max(0, localProgress + amount);
    setLocalProgress(next);
    if (next >= config.target) {
      setLocalCompleted(true);
    } else {
      setLocalCompleted(false);
    }
  };

  const handleSetComplete = () => {
    setLocalProgress(config.target);
    setLocalCompleted(true);
  };

  const handleSave = async () => {
    if (config.isTarget) {
      await updateVowProgress(vow.id, localProgress);
    } else {
      await checkInVow(vow.id, localCompleted);
    }
    await updateVowReflection(vow.id, localReflection);
    onClose();
  };

  const progressPercent = config.isTarget 
    ? Math.min(100, (localProgress / config.target) * 100) 
    : localCompleted ? 100 : 0;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.backdrop, { backgroundColor: colors.bg.overlayHeavy }]}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.bg.surface, borderColor: colors.border.default }]}>
          {/* Top Notch bar */}
          <View style={[styles.notch, { backgroundColor: colors.border.dashed }]} />
          
          <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: colors.border.separator }]}>
              <View style={styles.modalCardThumbnailContainer}>
                <Image 
                  source={cardData.image} 
                  style={styles.modalCardThumbnail}
                  resizeMode="cover"
                />
              </View>
              <View style={styles.titleGroup}>
                <Text style={[styles.vowName, { color: colors.text.primary }]}>{vow.custom_name}</Text>
                <Text style={[styles.difficultyTag, { color: colors.text.secondary }]}>
                  {cardData.title.toUpperCase()} • {vow.difficulty.toUpperCase()} • ×{vow.weight.toFixed(1)} WEIGHT
                </Text>
              </View>
            </View>

            {/* Completion UI - Target based vs Binary */}
            {config.isTarget ? (
              <Card style={[styles.sectionCard, { backgroundColor: colors.bg.card, borderColor: colors.border.default }]}>
                <Text style={[styles.sectionLabel, { color: colors.text.secondary }]}>PROGRESS STATUS</Text>
                
                {/* Stats row */}
                <View style={styles.statsRow}>
                  <View>
                    <Text style={[styles.statsSub, { color: colors.text.secondary }]}>Current</Text>
                    <Text style={[styles.statsValue, { color: colors.text.primary }]}>
                      {localProgress} <Text style={styles.unitText}>{config.unit}</Text>
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[styles.statsSub, { color: colors.text.secondary }]}>Target</Text>
                    <Text style={[styles.statsValue, { color: colors.text.primary }]}>
                      {config.target} <Text style={styles.unitText}>{config.unit}</Text>
                    </Text>
                  </View>
                </View>

                {/* Progress bar */}
                <View style={styles.progressContainer}>
                  <View style={[styles.progressBar, { width: `${progressPercent}%`, backgroundColor: colors.primary }]} />
                </View>

                {/* Plus / Minus Adjusters */}
                <View style={styles.adjusterRow}>
                  <TouchableOpacity 
                    style={[styles.adjustBtn, { backgroundColor: colors.bg.surfaceAlt, borderColor: colors.border.lowContrast }]} 
                    onPress={() => handleAdjustProgress(-quickSteps[0])}
                  >
                    <Text style={[styles.adjustBtnText, { color: colors.text.primary }]}>-{quickSteps[0]}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.adjustBtn, { backgroundColor: colors.bg.surfaceAlt, borderColor: colors.border.lowContrast }]} 
                    onPress={() => handleAdjustProgress(quickSteps[0])}
                  >
                    <Text style={[styles.adjustBtnText, { color: colors.text.primary }]}>+{quickSteps[0]}</Text>
                  </TouchableOpacity>
                </View>

                {/* Quick Add and Mark Complete buttons */}
                <View style={styles.shortcutRow}>
                  {quickSteps.map((step) => (
                    <TouchableOpacity 
                      key={step} 
                      style={[styles.shortcutBtn, { backgroundColor: colors.bg.surfaceAlt, borderColor: colors.border.lowContrast }]}
                      onPress={() => handleAdjustProgress(step)}
                    >
                      <Text style={[styles.shortcutText, { color: colors.text.secondary }]}>+{step} {config.unit}</Text>
                    </TouchableOpacity>
                  ))}
                  <TouchableOpacity 
                    style={[styles.shortcutBtn, styles.completeBtn, { borderColor: colors.primary, backgroundColor: 'rgba(201, 154, 90, 0.12)' }]}
                    onPress={handleSetComplete}
                  >
                    <Text style={[styles.completeBtnText, { color: colors.primary }]}>Complete</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            ) : (
              showBrokenConfirm ? (
                <Card style={[styles.sectionCard, { backgroundColor: colors.bg.card, borderColor: colors.danger }]}>
                  <Text style={[styles.sectionLabel, { color: colors.danger }]}>VOW STATUS</Text>
                  <Text style={[styles.confirmTitleText, { color: colors.danger }]}>Mark this vow as missed today?</Text>
                  
                  <View style={{ gap: 4, marginTop: 4 }}>
                    <Text style={[styles.sectionLabel, { color: colors.text.secondary }]}>ADD A NOTE (OPTIONAL)</Text>
                    <Text style={[styles.questionText, { color: colors.text.primary }]}>What got in the way?</Text>
                  </View>

                  <TextInput
                    style={[styles.textArea, { backgroundColor: colors.bg.surfaceAlt, borderColor: colors.border.lowContrast, color: colors.text.primary }]}
                    multiline={true}
                    numberOfLines={3}
                    placeholder="e.g. Unexpected conflict, tired, or lost focus..."
                    placeholderTextColor="#5A5A66"
                    value={brokenReflection}
                    onChangeText={setBrokenReflection}
                  />

                  <View style={styles.confirmActionRow}>
                    <TouchableOpacity 
                      style={[styles.confirmCancelBtn, { backgroundColor: colors.bg.surfaceAlt, borderColor: colors.border.lowContrast }]} 
                      onPress={() => setShowBrokenConfirm(false)}
                    >
                      <Text style={[styles.confirmCancelText, { color: colors.text.secondary }]}>CANCEL</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={[styles.confirmBrokenBtn, { backgroundColor: colors.danger }]} 
                      onPress={async () => {
                        setLocalCompleted(false);
                        const finalReflection = brokenReflection.trim() || 'Missed vow today.';
                        setLocalReflection(finalReflection);
                        
                        await checkInVow(vow.id, false);
                        await updateVowReflection(vow.id, finalReflection);
                        
                        setShowBrokenConfirm(false);
                        onClose();
                      }}
                    >
                      <Text style={styles.confirmBrokenText}>CONFIRM MISSED</Text>
                    </TouchableOpacity>
                  </View>
                </Card>
              ) : (
                <Card style={[styles.sectionCard, { backgroundColor: colors.bg.card, borderColor: colors.border.default }]}>
                  <Text style={[styles.sectionLabel, { color: colors.text.secondary }]}>VOW STATUS</Text>
                  <Text style={[styles.questionText, { color: colors.text.primary }]}>Did you keep your vow today?</Text>

                  <View style={styles.binaryToggleRow}>
                    <TouchableOpacity 
                      style={[
                        styles.binaryBtn, 
                        styles.missBtn, 
                        { backgroundColor: colors.bg.surfaceAlt, borderColor: colors.border.lowContrast },
                        !localCompleted && { borderColor: colors.danger, backgroundColor: 'rgba(163, 92, 92, 0.15)' }
                      ]}
                      onPress={() => setShowBrokenConfirm(true)}
                    >
                      <Text style={[
                        styles.binaryText, 
                        { color: colors.text.secondary },
                        !localCompleted && { color: colors.danger, fontWeight: 'bold' }
                      ]}>
                        MISSED VOW
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[
                        styles.binaryBtn, 
                        styles.keepBtn, 
                        { backgroundColor: colors.bg.surfaceAlt, borderColor: colors.border.lowContrast },
                        localCompleted && { borderColor: colors.primary, backgroundColor: 'rgba(201, 154, 90, 0.15)' }
                      ]}
                      onPress={() => setLocalCompleted(true)}
                    >
                      <Text style={[
                        styles.binaryText, 
                        { color: colors.text.secondary },
                        localCompleted && { color: colors.primary, fontWeight: 'bold' }
                      ]}>
                        KEPT VOW ✓
                      </Text>
                    </TouchableOpacity>
                  </View>
                </Card>
              )
            )}

            {/* Daily Reflection / Note */}
            <Card style={[styles.sectionCard, { backgroundColor: colors.bg.card, borderColor: colors.border.default }]}>
              <Text style={[styles.sectionLabel, { color: colors.text.secondary }]}>ADD A NOTE</Text>
              <TextInput
                style={[styles.textArea, { backgroundColor: colors.bg.surfaceAlt, borderColor: colors.border.lowContrast, color: colors.text.primary }]}
                multiline={true}
                numberOfLines={3}
                placeholder="Record your thoughts, hurdles, or insights for this vow..."
                placeholderTextColor="#5A5A66"
                value={localReflection}
                onChangeText={setLocalReflection}
              />
            </Card>

            {/* Action Buttons */}
            <View style={styles.actionRow}>
              <TouchableOpacity 
                style={[styles.cancelBtn, { backgroundColor: colors.bg.surfaceAlt, borderColor: colors.border.lowContrast }]} 
                onPress={onClose}
              >
                <Text style={[styles.cancelText, { color: colors.text.secondary }]}>CANCEL</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.saveBtn, { backgroundColor: colors.primary }]} 
                onPress={handleSave}
              >
                <Text style={styles.saveText}>SAVE</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    maxHeight: '90%',
    ...Platform.select({
      web: {
        backdropFilter: 'blur(25px)',
        boxShadow: '0 -8px 40px rgba(0, 0, 0, 0.6), inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
      }
    })
  },
  notch: {
    width: 44,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 14,
    marginBottom: 8,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  modalCardThumbnailContainer: {
    width: 44,
    height: 44,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(201, 154, 90, 0.35)',
  },
  modalCardThumbnail: {
    width: '100%',
    height: '100%',
  },
  titleGroup: {
    flex: 1,
    gap: 4,
  },
  vowName: {
    fontSize: 18,
    fontFamily: typography.fontFamily.displayBold,
    fontWeight: '700',
    color: '#F5F6F8',
  },
  difficultyTag: {
    fontSize: 10,
    fontFamily: typography.fontFamily.uiBold,
    letterSpacing: 1.2,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  sectionCard: {
    padding: 16,
    gap: 12,
    borderRadius: 16,
  },
  sectionLabel: {
    fontSize: 10,
    fontFamily: typography.fontFamily.uiBold,
    letterSpacing: 1.2,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsSub: {
    fontSize: 10,
    fontFamily: typography.fontFamily.uiMedium,
    marginBottom: 4,
    fontWeight: '500',
    color: '#8A91A0',
  },
  statsValue: {
    fontSize: 24,
    fontFamily: typography.fontFamily.uiBold,
    fontWeight: '700',
    color: '#F5F6F8',
  },
  unitText: {
    fontSize: 12,
    color: '#8A91A0',
    fontFamily: typography.fontFamily.uiMedium,
  },
  progressContainer: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    overflow: 'hidden',
    marginTop: 4,
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  adjusterRow: {
    flexDirection: 'row',
    gap: 12,
  },
  adjustBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    ...Platform.select({
      web: { cursor: 'pointer' }
    })
  },
  adjustBtnText: {
    fontSize: 13,
    fontFamily: typography.fontFamily.uiBold,
    fontWeight: '700',
  },
  shortcutRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  shortcutBtn: {
    flex: 1,
    minWidth: '28%',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    ...Platform.select({
      web: { cursor: 'pointer' }
    })
  },
  shortcutText: {
    fontSize: 10,
    fontFamily: typography.fontFamily.uiBold,
    fontWeight: '700',
  },
  completeBtn: {
    borderWidth: 1,
  },
  completeBtnText: {
    fontSize: 10,
    fontFamily: typography.fontFamily.uiBold,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  questionText: {
    fontSize: 14,
    fontFamily: theme.typography.fontFamily.medium,
  },
  binaryToggleRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  binaryBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }
    })
  },
  missBtn: {},
  keepBtn: {},
  binaryText: {
    fontSize: 12,
    fontFamily: typography.fontFamily.uiBold,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    fontFamily: typography.fontFamily.uiMedium,
    minHeight: 76,
    textAlignVertical: 'top',
    ...Platform.select({
      web: {
        outlineStyle: 'none' as any,
      }
    })
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    ...Platform.select({
      web: { cursor: 'pointer' }
    })
  },
  cancelText: {
    fontSize: 13,
    fontFamily: typography.fontFamily.uiBold,
    letterSpacing: 1,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  saveBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    ...Platform.select({
      web: { cursor: 'pointer' }
    })
  },
  saveText: {
    fontSize: 13,
    color: '#0B0C0E',
    fontFamily: typography.fontFamily.uiBold,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  confirmTitleText: {
    fontSize: 14,
    fontFamily: typography.fontFamily.uiMedium,
    marginBottom: 4,
  },
  confirmActionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  confirmCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
  },
  confirmCancelText: {
    fontSize: 11,
    fontFamily: typography.fontFamily.uiBold,
    letterSpacing: 1,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  confirmBrokenBtn: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  confirmBrokenText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontFamily: typography.fontFamily.uiBold,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});

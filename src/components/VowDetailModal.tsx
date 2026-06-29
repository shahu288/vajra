import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  TextInput, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform 
} from 'react-native';
import { useAppStore, getVowConfig } from '../store/useAppStore';
import { theme } from '../theme';
import { Text } from './Text';
import { Card } from './Card';

interface VowDetailModalProps {
  vowId: string | null;
  visible: boolean;
  onClose: () => void;
}

export function VowDetailModal({ vowId, visible, onClose }: VowDetailModalProps) {
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

  useEffect(() => {
    if (vow) {
      setLocalProgress(vowProgress[vow.id] || 0);
      setLocalCompleted(vowLogs[vow.id] || false);
      setLocalReflection(vowReflections[vow.id] || '');
    }
  }, [vowId, vow, visible]);

  if (!vow) return null;

  const config = getVowConfig(vow.custom_name || '');

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
        style={styles.backdrop}
      >
        <View style={styles.modalContainer}>
          {/* Top Notch bar */}
          <View style={styles.notch} />
          
          <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.vowIcon}>{config.icon}</Text>
              <View style={styles.titleGroup}>
                <Text style={styles.vowName}>{vow.custom_name}</Text>
                <Text style={styles.difficultyTag}>
                  {vow.difficulty.toUpperCase()} • ×{vow.weight.toFixed(1)} WEIGHT
                </Text>
              </View>
            </View>

            {/* Completion UI - Target based vs Binary */}
            {config.isTarget ? (
              <Card style={styles.sectionCard}>
                <Text style={styles.sectionLabel}>PROGRESS STATUS</Text>
                
                {/* Stats row */}
                <View style={styles.statsRow}>
                  <View>
                    <Text style={styles.statsSub}>Current</Text>
                    <Text style={styles.statsValue}>
                      {localProgress} <Text style={styles.unitText}>{config.unit}</Text>
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.statsSub}>Target</Text>
                    <Text style={styles.statsValue}>
                      {config.target} <Text style={styles.unitText}>{config.unit}</Text>
                    </Text>
                  </View>
                </View>

                {/* Progress bar */}
                <View style={styles.progressContainer}>
                  <View style={[styles.progressBar, { width: `${progressPercent}%` }]} />
                </View>

                {/* Plus / Minus Adjusters */}
                <View style={styles.adjusterRow}>
                  <TouchableOpacity 
                    style={styles.adjustBtn} 
                    onPress={() => handleAdjustProgress(-quickSteps[0])}
                  >
                    <Text style={styles.adjustBtnText}>-{quickSteps[0]}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.adjustBtn} 
                    onPress={() => handleAdjustProgress(quickSteps[0])}
                  >
                    <Text style={styles.adjustBtnText}>+{quickSteps[0]}</Text>
                  </TouchableOpacity>
                </View>

                {/* Quick Add and Mark Complete buttons */}
                <View style={styles.shortcutRow}>
                  {quickSteps.map((step) => (
                    <TouchableOpacity 
                      key={step} 
                      style={styles.shortcutBtn}
                      onPress={() => handleAdjustProgress(step)}
                    >
                      <Text style={styles.shortcutText}>+{step} {config.unit}</Text>
                    </TouchableOpacity>
                  ))}
                  <TouchableOpacity 
                    style={[styles.shortcutBtn, styles.completeBtn]}
                    onPress={handleSetComplete}
                  >
                    <Text style={styles.completeBtnText}>Complete</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            ) : (
              <Card style={styles.sectionCard}>
                <Text style={styles.sectionLabel}>VOW INTEGRITY</Text>
                <Text style={styles.questionText}>Did you keep your vow today?</Text>

                <View style={styles.binaryToggleRow}>
                  <TouchableOpacity 
                    style={[
                      styles.binaryBtn, 
                      styles.missBtn, 
                      !localCompleted && styles.missActive
                    ]}
                    onPress={() => setLocalCompleted(false)}
                  >
                    <Text style={[styles.binaryText, !localCompleted && styles.activeText]}>
                      ✗ Vow Broken
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[
                      styles.binaryBtn, 
                      styles.keepBtn, 
                      localCompleted && styles.keepActive
                    ]}
                    onPress={() => setLocalCompleted(true)}
                  >
                    <Text style={[styles.binaryText, localCompleted && styles.activeText]}>
                      ✓ Vow Kept
                    </Text>
                  </TouchableOpacity>
                </View>
              </Card>
            )}

            {/* Daily Reflection */}
            <Card style={styles.sectionCard}>
              <Text style={styles.sectionLabel}>DAILY REFLECTION</Text>
              <TextInput
                style={styles.textArea}
                multiline={true}
                numberOfLines={3}
                placeholder="What made today difficult? What helped you succeed today?"
                placeholderTextColor="#5A5A66"
                value={localReflection}
                onChangeText={setLocalReflection}
              />
            </Card>

            {/* Action Buttons */}
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                <Text style={styles.cancelText}>CANCEL</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveText}>RECORD DISCIPLINE</Text>
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
    backgroundColor: 'rgba(5, 5, 8, 0.7)', // Translucent overlay
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: 'rgba(10, 10, 15, 0.95)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 0.5,
    borderColor: '#1C1C2C',
    maxHeight: '90%',
    ...Platform.select({
      web: {
        backdropFilter: 'blur(20px)',
        boxShadow: '0 -8px 32px rgba(0, 0, 0, 0.4)',
      }
    })
  },
  notch: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#272733',
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#161626',
  },
  vowIcon: {
    fontSize: 36,
  },
  titleGroup: {
    flex: 1,
    gap: 4,
  },
  vowName: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.medium,
    color: '#FFFFFF',
  },
  difficultyTag: {
    fontSize: 9,
    fontFamily: theme.typography.fontFamily.mono,
    color: theme.colors.text.tertiary,
    letterSpacing: 1,
  },
  sectionCard: {
    backgroundColor: 'rgba(15, 15, 24, 0.75)',
    borderColor: '#1F1F35',
    padding: 16,
    gap: 14,
  },
  sectionLabel: {
    fontSize: 9,
    fontFamily: theme.typography.fontFamily.mono,
    color: theme.colors.text.tertiary,
    letterSpacing: 1.5,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsSub: {
    fontSize: 9,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.text.tertiary,
    marginBottom: 4,
  },
  statsValue: {
    fontSize: 24,
    fontFamily: theme.typography.fontFamily.mono,
    color: '#FFFFFF',
  },
  unitText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
  },
  progressContainer: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#1E1E2A',
    overflow: 'hidden',
    marginTop: 4,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#00E5FF', // Electric Cyan matching logo
    borderRadius: 3,
    ...Platform.select({
      web: {
        boxShadow: '0 0 10px rgba(0, 229, 255, 0.5)',
      }
    })
  },
  adjusterRow: {
    flexDirection: 'row',
    gap: 12,
  },
  adjustBtn: {
    flex: 1,
    backgroundColor: '#12121E',
    borderWidth: 0.5,
    borderColor: '#1E1E2E',
    borderRadius: theme.spacing.borderRadius.card,
    paddingVertical: 10,
    alignItems: 'center',
  },
  adjustBtnText: {
    fontSize: theme.typography.fontSize.sm,
    color: '#FFFFFF',
    fontFamily: theme.typography.fontFamily.mono,
  },
  shortcutRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  shortcutBtn: {
    flex: 1,
    minWidth: '28%',
    backgroundColor: '#12121E',
    borderWidth: 0.5,
    borderColor: '#1E1E2E',
    borderRadius: theme.spacing.borderRadius.card,
    paddingVertical: 8,
    alignItems: 'center',
  },
  shortcutText: {
    fontSize: 10,
    color: theme.colors.text.secondary,
    fontFamily: theme.typography.fontFamily.mono,
  },
  completeBtn: {
    borderColor: '#00E5FF',
    backgroundColor: 'rgba(0, 229, 255, 0.05)',
  },
  completeBtnText: {
    fontSize: 10,
    color: '#00E5FF',
    fontWeight: 'bold',
  },
  questionText: {
    fontSize: theme.typography.fontSize.sm,
    color: '#FFFFFF',
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
    borderRadius: theme.spacing.borderRadius.card,
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#1E1E2E',
    backgroundColor: '#12121E',
  },
  missBtn: {},
  keepBtn: {},
  missActive: {
    borderColor: theme.colors.danger,
    backgroundColor: `${theme.colors.danger}15`,
  },
  keepActive: {
    borderColor: '#00E5FF', // Cyan instead of gold for vow kept highlight
    backgroundColor: 'rgba(0, 229, 255, 0.08)',
  },
  binaryText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.tertiary,
    fontFamily: theme.typography.fontFamily.mono,
  },
  activeText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  textArea: {
    backgroundColor: '#12121E',
    borderWidth: 0.5,
    borderColor: '#1E1E2E',
    borderRadius: theme.spacing.borderRadius.card,
    padding: 12,
    color: '#FFFFFF',
    fontSize: theme.typography.fontSize.sm,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: theme.spacing.borderRadius.card,
    alignItems: 'center',
    backgroundColor: '#12121E',
    borderWidth: 0.5,
    borderColor: '#1E1E2E',
  },
  cancelText: {
    fontSize: 11,
    color: theme.colors.text.secondary,
    fontFamily: theme.typography.fontFamily.mono,
    letterSpacing: 1.5,
  },
  saveBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: theme.spacing.borderRadius.card,
    alignItems: 'center',
    backgroundColor: '#FF5A00', // Vibrant Orange matching the primary inner fire
    ...Platform.select({
      web: {
        boxShadow: '0 4px 20px rgba(255, 90, 0, 0.3)',
      },
      default: {
        shadowColor: '#FF5A00',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      }
    })
  },
  saveText: {
    fontSize: 11,
    color: '#05050A',
    fontFamily: theme.typography.fontFamily.mono,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
});

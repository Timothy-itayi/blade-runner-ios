import React from 'react';
import { View, Text, Modal, TouchableOpacity, Pressable, StyleSheet } from 'react-native';
import { Theme } from '../../constants/theme';
import { useGameAudioContext } from '../../contexts/AudioContext';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  shiftData?: {
    stationName: string;
    chapter: string;
    authorityLabel: string;
    briefing: string;
    directive: string;
  };
}

export const SettingsModal = ({
  visible,
  onClose,
  shiftData,
}: SettingsModalProps) => {
  const { sfxEnabled, setSfxEnabled } = useGameAudioContext();

  const handleToggleSfx = () => {
    setSfxEnabled(!sfxEnabled);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>AMBER SECURITY</Text>
            <Text style={styles.headerSub}>AMBER DEPOT PERIMETER</Text>
          </View>

          <View style={styles.content}>
            {/* Current Directive */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>ACTIVE DIRECTIVE</Text>
              <View style={styles.directiveBox}>
                <Text style={styles.directiveText}>
                  {shiftData?.directive || 'VERIFY ALL SUBJECTS'}
                </Text>
              </View>
            </View>

            {/* Sound Settings */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>SOUND</Text>
              <TouchableOpacity style={styles.optionButton} onPress={handleToggleSfx}>
                <Text style={styles.optionText}>SFX: {sfxEnabled ? 'ON' : 'OFF'}</Text>
                <Text style={[styles.optionArrow, !sfxEnabled && styles.optionOff]}>
                  {sfxEnabled ? '▶' : '◼'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Beta Notice */}
            <View style={styles.section}>
              <View style={styles.betaBox}>
                <Text style={styles.betaText}>BETA</Text>
                <Text style={styles.betaSubtext}>WORK IN PROGRESS</Text>
              </View>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Pressable
              style={({ pressed }) => [
                styles.closeButton,
                pressed && styles.closeButtonPressed
              ]}
              onPress={onClose}
            >
              <Text style={styles.closeButtonText}>[ CLOSE ]</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    backgroundColor: '#0a0c0f',
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
    backgroundColor: 'rgba(26, 42, 58, 0.3)',
  },
  headerTitle: {
    fontFamily: Theme.fonts.mono,
    fontSize: 18,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
    letterSpacing: 3,
  },
  headerSub: {
    fontFamily: Theme.fonts.mono,
    fontSize: 11,
    color: Theme.colors.textDim,
    marginTop: 4,
    letterSpacing: 1,
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: Theme.fonts.mono,
    fontSize: 11,
    fontWeight: '700',
    color: Theme.colors.textSecondary,
    letterSpacing: 1,
    marginBottom: 12,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(74, 106, 122, 0.2)',
  },
  directiveBox: {
    backgroundColor: 'rgba(212, 83, 74, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(212, 83, 74, 0.3)',
    borderLeftWidth: 3,
    borderLeftColor: Theme.colors.accentDeny,
    padding: 12,
  },
  directiveText: {
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
    fontWeight: '700',
    color: Theme.colors.accentDeny,
    lineHeight: 18,
  },
  optionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(26, 42, 58, 0.2)',
    borderWidth: 1,
    borderColor: '#2a3a4a',
  },
  optionText: {
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
    color: Theme.colors.textSecondary,
  },
  optionArrow: {
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    color: Theme.colors.textDim,
  },
  optionOff: {
    color: Theme.colors.accentDeny,
  },
  betaBox: {
    backgroundColor: 'rgba(74, 106, 122, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(74, 106, 122, 0.3)',
    padding: 16,
    alignItems: 'center',
  },
  betaText: {
    fontFamily: Theme.fonts.mono,
    fontSize: 16,
    fontWeight: '700',
    color: Theme.colors.accentWarn,
    letterSpacing: 4,
  },
  betaSubtext: {
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    color: Theme.colors.textDim,
    marginTop: 4,
    letterSpacing: 2,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
    alignItems: 'center',
  },
  closeButton: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  closeButtonPressed: {
    backgroundColor: 'rgba(127, 184, 216, 0.2)',
    borderColor: Theme.colors.textSecondary,
  },
  closeButtonText: {
    fontFamily: Theme.fonts.mono,
    fontSize: 14,
    fontWeight: '600',
    color: Theme.colors.textSecondary,
    letterSpacing: 1,
  },
});

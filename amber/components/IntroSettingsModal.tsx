import React from 'react';
import { View, Text, Modal, Pressable, StyleSheet } from 'react-native';
import { Theme } from '../constants/theme';

interface IntroSettingsModalProps {
  visible: boolean;
  onClose: () => void;
  musicVolume: number;
  sfxVolume: number;
  onMusicVolumeChange: (value: number) => void;
  onSfxVolumeChange: (value: number) => void;
}

export const IntroSettingsModal = ({
  visible,
  onClose,
  musicVolume,
  sfxVolume,
  onMusicVolumeChange,
  onSfxVolumeChange,
}: IntroSettingsModalProps) => {
  
  const adjustVolume = (
    current: number, 
    delta: number, 
    onChange: (v: number) => void
  ) => {
    const newValue = Math.max(0, Math.min(1, current + delta));
    onChange(newValue);
  };

  const renderVolumeControl = (
    label: string,
    value: number,
    onChange: (v: number) => void
  ) => (
    <View style={styles.controlRow}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.controlGroup}>
        <Pressable 
          onPress={() => adjustVolume(value, -0.1, onChange)}
          style={({ pressed }) => [styles.adjustButton, pressed && styles.adjustButtonPressed]}
        >
          <Text style={styles.adjustButtonText}>−</Text>
        </Pressable>
        
        <View style={styles.volumeBarContainer}>
          <View style={[styles.volumeBarFill, { width: `${value * 100}%` }]} />
          <Text style={styles.volumeText}>{Math.round(value * 100)}%</Text>
        </View>
        
        <Pressable 
          onPress={() => adjustVolume(value, 0.1, onChange)}
          style={({ pressed }) => [styles.adjustButton, pressed && styles.adjustButtonPressed]}
        >
          <Text style={styles.adjustButtonText}>+</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>AUDIO</Text>
          <View style={styles.divider} />
          
          {renderVolumeControl('MUSIC', musicVolume, onMusicVolumeChange)}
          {renderVolumeControl('SFX', sfxVolume, onSfxVolumeChange)}
          
          <Pressable 
            onPress={onClose}
            style={({ pressed }) => [styles.closeButton, pressed && styles.closeButtonPressed]}
          >
            <Text style={styles.closeButtonText}>[ DONE ]</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  container: {
    width: '100%',
    maxWidth: 300,
    backgroundColor: '#c8ccc0',
    borderRadius: 14,
    padding: 24,
    borderWidth: 2,
    borderColor: 'rgba(58, 74, 58, 0.2)',
    shadowColor: '#2a3a2a',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 12,
  },
  title: {
    fontFamily: Theme.fonts.mono,
    fontSize: 14,
    fontWeight: '700',
    color: '#3a4a3a',
    letterSpacing: 3,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(58, 74, 58, 0.2)',
    marginVertical: 20,
  },
  controlRow: {
    marginBottom: 20,
  },
  label: {
    fontFamily: 'Courier',
    fontSize: 11,
    color: '#5a6a5a',
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 10,
  },
  controlGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  adjustButton: {
    width: 36,
    height: 36,
    backgroundColor: '#b8bcb0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(58, 74, 58, 0.2)',
    shadowColor: '#2a3a2a',
    shadowOffset: { width: 2, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  adjustButtonPressed: {
    backgroundColor: '#a8aca0',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.15,
  },
  adjustButtonText: {
    fontFamily: 'Courier',
    fontSize: 20,
    color: '#3a4a3a',
    fontWeight: '700',
  },
  volumeBarContainer: {
    flex: 1,
    height: 28,
    backgroundColor: '#a8aca0',
    borderRadius: 6,
    overflow: 'hidden',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(58, 74, 58, 0.15)',
  },
  volumeBarFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#7a8a7a',
    borderRadius: 5,
  },
  volumeText: {
    fontFamily: 'Courier',
    fontSize: 11,
    color: '#3a4a3a',
    fontWeight: '600',
    textAlign: 'center',
  },
  closeButton: {
    marginTop: 8,
    paddingVertical: 14,
    paddingHorizontal: 28,
    alignSelf: 'center',
    backgroundColor: 'rgba(58, 74, 58, 0.08)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(58, 74, 58, 0.2)',
  },
  closeButtonPressed: {
    backgroundColor: 'rgba(58, 74, 58, 0.15)',
  },
  closeButtonText: {
    fontFamily: 'Courier',
    fontSize: 12,
    color: '#4a5d4a',
    fontWeight: '600',
    letterSpacing: 1,
  },
});

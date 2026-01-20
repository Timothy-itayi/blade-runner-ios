import React from 'react';
import { View, Text, Modal, Pressable, StyleSheet } from 'react-native';
import { Theme } from '../../constants/theme';

// Windows XP Corporate color palette (matching HomeScreen menu buttons)
const XP = {
  buttonFace: '#ece9d8',
  buttonHighlight: '#ffffff',
  buttonShadow: '#aca899',
  buttonDarkShadow: '#716f64',
  textDark: '#000000',
  textGray: '#555555',
  windowBgAlt: '#d4d0c8',
};

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
    backgroundColor: XP.buttonFace,
    borderRadius: 0, // Match menu buttons - no rounded corners
    padding: 24,
    // Classic Windows XP 3D bevel effect - raised appearance
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderTopColor: XP.buttonHighlight,
    borderLeftColor: XP.buttonHighlight,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderBottomColor: XP.buttonDarkShadow,
    borderRightColor: XP.buttonShadow,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 4,
  },
  title: {
    fontFamily: Theme.fonts.mono,
    fontSize: 14,
    fontWeight: '700',
    color: XP.textDark,
    letterSpacing: 3,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: XP.buttonShadow,
    marginVertical: 20,
    // 3D groove effect
    borderTopWidth: 1,
    borderTopColor: XP.buttonDarkShadow,
    borderBottomWidth: 1,
    borderBottomColor: XP.buttonHighlight,
  },
  controlRow: {
    marginBottom: 20,
  },
  label: {
    fontFamily: 'Courier',
    fontSize: 11,
    color: XP.textGray,
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
    backgroundColor: XP.buttonFace,
    borderRadius: 0, // Match menu style
    justifyContent: 'center',
    alignItems: 'center',
    // Classic Windows XP 3D bevel
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderTopColor: XP.buttonHighlight,
    borderLeftColor: XP.buttonHighlight,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderBottomColor: XP.buttonDarkShadow,
    borderRightColor: XP.buttonShadow,
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 1,
    elevation: 2,
  },
  adjustButtonPressed: {
    // Inverted borders for pressed effect
    borderTopColor: XP.buttonDarkShadow,
    borderLeftColor: XP.buttonShadow,
    borderBottomColor: XP.buttonHighlight,
    borderRightColor: XP.buttonHighlight,
    backgroundColor: XP.windowBgAlt,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    elevation: 0,
  },
  adjustButtonText: {
    fontFamily: 'Courier',
    fontSize: 20,
    color: XP.textDark,
    fontWeight: '700',
  },
  volumeBarContainer: {
    flex: 1,
    height: 28,
    backgroundColor: XP.buttonFace,
    borderRadius: 0, // Match menu style
    overflow: 'hidden',
    justifyContent: 'center',
    // 3D inset effect
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderTopColor: XP.buttonDarkShadow,
    borderLeftColor: XP.buttonShadow,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderBottomColor: XP.buttonHighlight,
    borderRightColor: XP.buttonHighlight,
  },
  volumeBarFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: XP.textGray, // Dark gray fill instead of green
  },
  volumeText: {
    fontFamily: 'Courier',
    fontSize: 11,
    color: XP.textDark,
    fontWeight: '600',
    textAlign: 'center',
  },
  closeButton: {
    marginTop: 8,
    paddingVertical: 14,
    paddingHorizontal: 28,
    alignSelf: 'center',
    backgroundColor: XP.buttonFace,
    borderRadius: 0, // Match menu style
    // Classic Windows XP 3D bevel
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderTopColor: XP.buttonHighlight,
    borderLeftColor: XP.buttonHighlight,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderBottomColor: XP.buttonDarkShadow,
    borderRightColor: XP.buttonShadow,
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 1,
    elevation: 2,
  },
  closeButtonPressed: {
    // Inverted borders for pressed effect
    borderTopColor: XP.buttonDarkShadow,
    borderLeftColor: XP.buttonShadow,
    borderBottomColor: XP.buttonHighlight,
    borderRightColor: XP.buttonHighlight,
    backgroundColor: XP.windowBgAlt,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    elevation: 0,
  },
  closeButtonText: {
    fontFamily: 'Courier',
    fontSize: 12,
    color: XP.textDark,
    fontWeight: '600',
    letterSpacing: 1,
  },
});

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
  
  const lastMusicVolume = React.useRef(musicVolume || 1);
  const lastSfxVolume = React.useRef(sfxVolume || 1);

  const toggleMute = (current: number, onChange: (v: number) => void, lastRef: React.MutableRefObject<number>) => {
    if (current > 0) {
      lastRef.current = current;
      onChange(0);
    } else {
      onChange(lastRef.current || 1);
    }
  };

  const renderVolumeControl = (
    label: string,
    value: number,
    onChange: (v: number) => void,
    lastRef: React.MutableRefObject<number>
  ) => (
    <View style={styles.controlRow}>
      <Text style={styles.label}>{label}</Text>
      <Pressable 
        onPress={() => toggleMute(value, onChange, lastRef)}
        style={({ pressed }) => [styles.muteButton, pressed && styles.muteButtonPressed]}
      >
        <Text style={styles.muteButtonText}>{value > 0 ? '[ MUTE ]' : '[ UNMUTE ]'}</Text>
      </Pressable>
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
          
          {renderVolumeControl('MUSIC', musicVolume, onMusicVolumeChange, lastMusicVolume)}
          {renderVolumeControl('SFX', sfxVolume, onSfxVolumeChange, lastSfxVolume)}
          
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
  muteButton: {
    width: '100%',
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
  muteButtonPressed: {
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
  muteButtonText: {
    fontFamily: 'Courier',
    fontSize: 12,
    color: XP.textDark,
    fontWeight: '700',
    letterSpacing: 1,
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

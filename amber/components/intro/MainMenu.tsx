import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Animated, Pressable, Image, StyleSheet } from 'react-native';
import { Theme } from '../../constants/theme';

// Control Panel Color Palette - Industrial Beige/Tan
const PANEL = {
  // Base colors
  bgDark: '#9a8a7a',
  bgMid: '#b0a090',
  bgLight: '#c4b4a4',
  bgLighter: '#d8c8b8',
  bgLightest: '#e8dcd0',
  
  // Metallic accents
  metal: '#7a7068',
  metalLight: '#9a9088',
  metalDark: '#5a5048',
  metalDarkest: '#3a3028',
  
  // Bezels and borders
  bezelOuter: '#6a5a4a',
  bezelInner: '#4a3a2a',
  
  // Screen colors - darker for better contrast
  screenBg: '#14161a',
  screenBorder: '#22252a',
  screenGlow: 'rgba(226, 211, 191, 0.05)',
  
  // Indicator lights
  ledRed: '#ff4444',
  ledRedOff: '#4a2020',
  ledGreen: '#44ff44',
  ledGreenOff: '#204a20',
  ledAmber: '#ffbb44',
  ledAmberOff: '#4a3a20',
  
  // Text hierarchy - matching boot sequence with better contrast
  textBright: '#f0e6d8',      // Brightest - titles, selected items
  textPrimary: '#d4c4ae',     // Primary - main text
  textSecondary: '#a89878',   // Secondary - labels
  textDim: '#6a5a4a',         // Dim - hints, inactive
  textDark: '#2a2820',
  textLight: '#e8e0d8',
  
  // Plaque colors
  brass: '#b8a060',
  brassLight: '#d8c080',
  brassDark: '#8a7040',
};

type ScreenMode = 'menu' | 'settings';

interface MainMenuProps {
  onStart: () => void;
  onContinue?: () => void;
  hasSaveData?: boolean;
  saveShiftNumber?: number;
  fadeAnim: Animated.Value;
  // Audio controls
  musicVolume: number;
  sfxVolume: number;
  onMusicVolumeChange: (value: number) => void;
  onSfxVolumeChange: (value: number) => void;
}

export const MainMenu = ({
  onStart,
  onContinue,
  hasSaveData,
  saveShiftNumber,
  fadeAnim,
  musicVolume,
  sfxVolume,
  onMusicVolumeChange,
  onSfxVolumeChange,
}: MainMenuProps) => {
  const [screenMode, setScreenMode] = useState<ScreenMode>('menu');
  const [ledStates, setLedStates] = useState<boolean[]>([true, false, true, true, false, true, false, true]);
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const cursorVisible = useRef(new Animated.Value(1)).current;
  
  // Track last volume for unmute
  const lastMusicVolume = useRef(musicVolume || 1);
  const lastSfxVolume = useRef(sfxVolume || 1);

  useEffect(() => {
    const ledInterval = setInterval(() => {
      setLedStates(prev => prev.map((_, i) => 
        Math.random() > 0.7 ? !prev[i] : prev[i]
      ));
    }, 600);

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 2500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0, duration: 2500, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(cursorVisible, { toValue: 0, duration: 500, useNativeDriver: true }),
        Animated.timing(cursorVisible, { toValue: 1, duration: 500, useNativeDriver: true }),
      ])
    ).start();

    return () => clearInterval(ledInterval);
  }, []);

  const screenGlowOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.1, 0.2],
  });

  const toggleMute = (
    current: number, 
    onChange: (v: number) => void, 
    lastRef: React.MutableRefObject<number>
  ) => {
    if (current > 0) {
      lastRef.current = current;
      onChange(0);
    } else {
      onChange(lastRef.current || 1);
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // SCREEN CONTENT RENDERERS
  // ══════════════════════════════════════════════════════════════════════════

  const renderMenuContent = () => (
    <View style={styles.screenContent}>
      <View style={styles.menuButtonsContainer}>
        {hasSaveData && (
          <Pressable
            onPress={onContinue}
            style={({ pressed }) => [
              styles.menuButton,
              styles.menuButtonPrimary,
              pressed && styles.menuButtonPressed
            ]}
          >
            <Text style={styles.menuButtonText}>CONTINUE</Text>
            <Text style={styles.menuButtonSubtext}>
              SHIFT {saveShiftNumber || 1}
            </Text>
          </Pressable>
        )}

        <Pressable
          onPress={onStart}
          style={({ pressed }) => [
            styles.menuButton,
            !hasSaveData && styles.menuButtonPrimary,
            pressed && styles.menuButtonPressed
          ]}
        >
          <Text style={styles.menuButtonText}>
            {hasSaveData ? 'NEW GAME' : 'START'}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setScreenMode('settings')}
          style={({ pressed }) => [
            styles.menuButton,
            styles.menuButtonSecondary,
            pressed && styles.menuButtonPressed
          ]}
        >
          <Text style={styles.menuButtonTextSecondary}>
            SETTINGS
          </Text>
        </Pressable>
      </View>

      <View style={styles.terminalLine}>
        <Text style={styles.terminalPrompt}>{'>'}</Text>
        <Text style={styles.terminalText}> SELECT OPTION</Text>
        <Animated.Text style={[styles.terminalCursor, { opacity: cursorVisible }]}>_</Animated.Text>
      </View>
    </View>
  );

  const renderSettingsContent = () => (
    <View style={styles.screenContent}>
      <View style={styles.settingsContainer}>
        {/* Header */}
        <View style={styles.settingsHeader}>
          <Text style={styles.settingsTitle}>AUDIO CONFIGURATION</Text>
          <View style={styles.settingsDivider} />
        </View>

        {/* Music Control */}
        <View style={styles.settingsRow}>
          <View style={styles.settingsLabelRow}>
            <Text style={styles.settingsLabel}>MUSIC</Text>
            <Text style={styles.settingsStatus}>
              {musicVolume > 0 ? 'ENABLED' : 'DISABLED'}
            </Text>
          </View>
          <Pressable 
            onPress={() => toggleMute(musicVolume, onMusicVolumeChange, lastMusicVolume)}
            style={({ pressed }) => [
              styles.settingsButton,
              pressed && styles.settingsButtonPressed
            ]}
          >
            <Text style={styles.settingsButtonText}>
              {musicVolume > 0 ? '[ MUTE ]' : '[ UNMUTE ]'}
            </Text>
          </Pressable>
        </View>

        {/* SFX Control */}
        <View style={styles.settingsRow}>
          <View style={styles.settingsLabelRow}>
            <Text style={styles.settingsLabel}>SFX</Text>
            <Text style={styles.settingsStatus}>
              {sfxVolume > 0 ? 'ENABLED' : 'DISABLED'}
            </Text>
          </View>
          <Pressable 
            onPress={() => toggleMute(sfxVolume, onSfxVolumeChange, lastSfxVolume)}
            style={({ pressed }) => [
              styles.settingsButton,
              pressed && styles.settingsButtonPressed
            ]}
          >
            <Text style={styles.settingsButtonText}>
              {sfxVolume > 0 ? '[ MUTE ]' : '[ UNMUTE ]'}
            </Text>
          </Pressable>
        </View>

        {/* Back Button */}
        <View style={styles.settingsFooter}>
          <Pressable 
            onPress={() => setScreenMode('menu')}
            style={({ pressed }) => [
              styles.settingsBackButton,
              pressed && styles.settingsButtonPressed
            ]}
          >
            <Text style={styles.settingsBackText}>[ BACK ]</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.terminalLine}>
        <Text style={styles.terminalPrompt}>{'>'}</Text>
        <Text style={styles.terminalText}> AUDIO_CONFIG</Text>
        <Animated.Text style={[styles.terminalCursor, { opacity: cursorVisible }]}>_</Animated.Text>
      </View>
    </View>
  );

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.panelHousing}>
        <View style={styles.panelHousingInner}>
          <View style={styles.panelHousingBevel}>
            
            {/* TOP SECTION - Logo Mantle */}
            <View style={styles.topSection}>
              <View style={styles.logoMantle}>
                <View style={styles.logoMantleTop}>
                  <View style={styles.logoMantleShelf}>
                    <View style={styles.logoContainer}>
                      <View style={styles.logoBorder}>
                        <Image
                          source={require('../../assets/app-icon.png')}
                          style={styles.logoImage}
                          resizeMode="contain"
                        />
                      </View>
                    </View>
                  </View>
                </View>
                <View style={styles.plaque}>
                  <View style={styles.plaqueInner}>
                    <View style={styles.plaqueEngraved}>
                      <Text style={styles.plaqueTitle}>AMBER</Text>
                      <Text style={styles.plaqueSubtitle}>Active Measures Bureau for Entity Review</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            {/* STATUS BAR */}
            <View style={styles.statusBar}>
              <View style={styles.ledGroup}>
                <View style={styles.ledLabel}>
                  <Text style={styles.ledLabelText}>SYS</Text>
                </View>
                {[0, 1, 2, 3].map(i => (
                  <View key={i} style={styles.ledSocket}>
                    <View style={[
                      styles.led,
                      ledStates[i] ? styles.ledGreenOn : styles.ledGreenOff
                    ]} />
                  </View>
                ))}
              </View>

              <View style={styles.versionDisplay}>
                <Text style={styles.versionText}>v2.4.1</Text>
              </View>

              <View style={styles.ledGroup}>
                {[4, 5, 6, 7].map(i => (
                  <View key={i} style={styles.ledSocket}>
                    <View style={[
                      styles.led,
                      ledStates[i] 
                        ? (i % 2 === 0 ? styles.ledRedOn : styles.ledAmberOn)
                        : (i % 2 === 0 ? styles.ledRedOff : styles.ledAmberOff)
                    ]} />
                  </View>
                ))}
                <View style={styles.ledLabel}>
                  <Text style={styles.ledLabelText}>PWR</Text>
                </View>
              </View>
            </View>

            {/* MAIN CRT SCREEN */}
            <View style={styles.screenSection}>
              <View style={styles.crtOuter}>
                <View style={styles.crtBezel}>
                  <View style={styles.crtFrame}>
                    <View style={styles.crtScreen}>
                      <Animated.View style={[
                        styles.screenGlow,
                        { opacity: screenGlowOpacity }
                      ]} />
                      
                      <View style={styles.scanlines}>
                        {Array(100).fill(0).map((_, i) => (
                          <View key={i} style={styles.scanline} />
                        ))}
                      </View>

                      {screenMode === 'menu' ? renderMenuContent() : renderSettingsContent()}

                      <View style={styles.crtVignette} />
                      <View style={styles.screenReflection} />
                    </View>
                  </View>
                </View>
              </View>
            </View>

            {/* BOTTOM SECTION */}
            <View style={styles.bottomSection}>
              <View style={styles.brandingPlate}>
                <View style={styles.brandingPlateInner}>
                  <Text style={styles.brandingText}>AMBER SYSTEMS</Text>
                  <View style={styles.brandingDivider} />
                  <Text style={styles.brandingSubtext}>SECURITY TERMINAL  •  SN: OP-7734-X</Text>
                </View>
              </View>
            </View>

            {/* SCREWS */}
            <View style={[styles.screw, styles.screwTopLeft]}>
              <View style={styles.screwSlot} />
            </View>
            <View style={[styles.screw, styles.screwTopRight]}>
              <View style={styles.screwSlot} />
            </View>
            <View style={[styles.screw, styles.screwBottomLeft]}>
              <View style={styles.screwSlot} />
            </View>
            <View style={[styles.screw, styles.screwBottomRight]}>
              <View style={styles.screwSlot} />
            </View>

          </View>
        </View>
      </View>
    </Animated.View>
  );
};

// ════════════════════════════════════════════════════════════════════════════
// STYLES
// ════════════════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0c0f',
  },

  // MAIN HOUSING
  panelHousing: {
    flex: 1,
    backgroundColor: PANEL.bgDark,
    padding: 4,
  },
  panelHousingInner: {
    flex: 1,
    backgroundColor: PANEL.bgMid,
    padding: 3,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderTopColor: PANEL.bgLighter,
    borderLeftColor: PANEL.bgLight,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderBottomColor: PANEL.metal,
    borderRightColor: PANEL.metalLight,
  },
  panelHousingBevel: {
    flex: 1,
    backgroundColor: PANEL.bgLight,
    padding: 16,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderTopColor: PANEL.metalLight,
    borderLeftColor: PANEL.metalLight,
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderBottomColor: PANEL.bgLighter,
    borderRightColor: PANEL.bgLighter,
  },

  // TOP SECTION
  topSection: {
    alignItems: 'center',
    marginBottom: 12,
  },
  logoMantle: {
    alignItems: 'center',
  },
  logoMantleTop: {
    backgroundColor: PANEL.bgMid,
    borderRadius: 8,
    padding: 4,
    borderWidth: 2,
    borderTopColor: PANEL.bgLighter,
    borderLeftColor: PANEL.bgLighter,
    borderBottomColor: PANEL.metalDark,
    borderRightColor: PANEL.metal,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  logoMantleShelf: {
    backgroundColor: PANEL.bgDark,
    borderRadius: 6,
    padding: 8,
    borderWidth: 1,
    borderTopColor: PANEL.metal,
    borderLeftColor: PANEL.metal,
    borderBottomColor: PANEL.bgLight,
    borderRightColor: PANEL.bgLight,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoBorder: {
    backgroundColor: PANEL.metalDarkest,
    borderRadius: 8,
    padding: 4,
    borderWidth: 2,
    borderTopColor: PANEL.metal,
    borderLeftColor: PANEL.metal,
    borderBottomColor: PANEL.metalDarkest,
    borderRightColor: PANEL.metalDarkest,
  },
  logoImage: {
    width: 72,
    height: 72,
    borderRadius: 4,
  },
  plaque: {
    marginTop: 10,
    backgroundColor: PANEL.brassDark,
    borderRadius: 4,
    padding: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  plaqueInner: {
    backgroundColor: PANEL.brass,
    borderRadius: 3,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderTopColor: PANEL.brassLight,
    borderLeftColor: PANEL.brassLight,
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderBottomColor: PANEL.brassDark,
    borderRightColor: PANEL.brassDark,
  },
  plaqueEngraved: {
    alignItems: 'center',
  },
  plaqueTitle: {
    fontFamily: Theme.fonts.mono,
    fontSize: 22,
    fontWeight: '700',
    color: PANEL.metalDarkest,
    letterSpacing: 8,
    textShadowColor: PANEL.brassLight,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 0,
  },
  plaqueSubtitle: {
    fontFamily: Theme.fonts.mono,
    fontSize: 9,
    color: PANEL.metalDarkest,
    letterSpacing: 0.5,
    marginTop: 4,
    textAlign: 'center',
  },

  // STATUS BAR
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: PANEL.bgMid,
    borderRadius: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderTopColor: PANEL.metal,
    borderLeftColor: PANEL.metal,
    borderBottomColor: PANEL.bgLighter,
    borderRightColor: PANEL.bgLighter,
  },
  ledGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ledLabel: {
    backgroundColor: PANEL.metalDark,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 2,
  },
  ledLabelText: {
    fontFamily: Theme.fonts.mono,
    fontSize: 9,
    color: PANEL.ledGreen,
    letterSpacing: 1,
  },
  ledSocket: {
    backgroundColor: PANEL.metalDark,
    borderRadius: 5,
    padding: 2,
  },
  led: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  ledGreenOn: {
    backgroundColor: PANEL.ledGreen,
    shadowColor: PANEL.ledGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
  },
  ledGreenOff: {
    backgroundColor: PANEL.ledGreenOff,
  },
  ledRedOn: {
    backgroundColor: PANEL.ledRed,
    shadowColor: PANEL.ledRed,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
  },
  ledRedOff: {
    backgroundColor: PANEL.ledRedOff,
  },
  ledAmberOn: {
    backgroundColor: PANEL.ledAmber,
    shadowColor: PANEL.ledAmber,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
  },
  ledAmberOff: {
    backgroundColor: PANEL.ledAmberOff,
  },
  versionDisplay: {
    backgroundColor: PANEL.metalDark,
    borderRadius: 3,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  versionText: {
    fontFamily: Theme.fonts.mono,
    fontSize: 11,
    color: PANEL.ledGreen,
    letterSpacing: 1,
    textShadowColor: PANEL.ledGreen,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 3,
  },

  // CRT SCREEN
  screenSection: {
    flex: 1,
    marginBottom: 12,
  },
  crtOuter: {
    flex: 1,
    backgroundColor: PANEL.bezelOuter,
    borderRadius: 8,
    padding: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  crtBezel: {
    flex: 1,
    backgroundColor: PANEL.bezelInner,
    borderRadius: 6,
    padding: 5,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopColor: PANEL.metalDarkest,
    borderLeftColor: PANEL.metalDarkest,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomColor: PANEL.metal,
    borderRightColor: PANEL.metalLight,
  },
  crtFrame: {
    flex: 1,
    backgroundColor: PANEL.screenBorder,
    borderRadius: 3,
    padding: 2,
  },
  crtScreen: {
    flex: 1,
    backgroundColor: PANEL.screenBg,
    borderRadius: 2,
    overflow: 'hidden',
    position: 'relative',
  },
  screenGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: PANEL.textBright,
  },
  scanlines: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.03,
  },
  scanline: {
    height: 2,
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
  },
  screenContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    zIndex: 10,
  },
  crtVignette: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 2,
    borderWidth: 40,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 40,
  },
  screenReflection: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '20%',
    backgroundColor: 'rgba(255, 255, 255, 0.015)',
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },

  // MENU CONTENT
  menuButtonsContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 16,
  },
  menuButton: {
    width: '90%',
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: PANEL.textDim,
    alignItems: 'center',
    backgroundColor: 'rgba(226, 211, 191, 0.02)',
  },
  menuButtonPrimary: {
    borderColor: PANEL.textPrimary,
    backgroundColor: 'rgba(226, 211, 191, 0.06)',
    borderWidth: 2,
  },
  menuButtonSecondary: {
    borderColor: PANEL.textDim,
    backgroundColor: 'transparent',
  },
  menuButtonPressed: {
    backgroundColor: 'rgba(226, 211, 191, 0.12)',
  },
  menuButtonText: {
    fontFamily: Theme.fonts.mono,
    fontSize: 18,
    fontWeight: '700',
    color: PANEL.textBright,
    letterSpacing: 4,
  },
  menuButtonTextSecondary: {
    fontFamily: Theme.fonts.mono,
    fontSize: 14,
    color: PANEL.textSecondary,
    letterSpacing: 2,
  },
  menuButtonSubtext: {
    fontFamily: Theme.fonts.mono,
    fontSize: 11,
    color: PANEL.textSecondary,
    marginTop: 4,
    letterSpacing: 1,
  },
  terminalLine: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    flexDirection: 'row',
  },
  terminalPrompt: {
    fontFamily: Theme.fonts.mono,
    fontSize: 11,
    color: PANEL.textSecondary,
  },
  terminalText: {
    fontFamily: Theme.fonts.mono,
    fontSize: 11,
    color: PANEL.textDim,
    letterSpacing: 1,
  },
  terminalCursor: {
    fontFamily: Theme.fonts.mono,
    fontSize: 11,
    color: PANEL.textSecondary,
  },

  // SETTINGS CONTENT
  settingsContainer: {
    width: '100%',
    flex: 1,
    justifyContent: 'center',
  },
  settingsHeader: {
    marginBottom: 24,
  },
  settingsTitle: {
    fontFamily: Theme.fonts.mono,
    fontSize: 14,
    fontWeight: '700',
    color: PANEL.textBright,
    letterSpacing: 2,
    textAlign: 'center',
  },
  settingsDivider: {
    height: 1,
    backgroundColor: PANEL.textDim,
    marginTop: 12,
    opacity: 0.5,
  },
  settingsRow: {
    marginBottom: 20,
  },
  settingsLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  settingsLabel: {
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
    color: PANEL.textPrimary,
    letterSpacing: 2,
  },
  settingsStatus: {
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    color: PANEL.textDim,
    letterSpacing: 1,
  },
  settingsButton: {
    width: '100%',
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: PANEL.textSecondary,
    alignItems: 'center',
    backgroundColor: 'rgba(226, 211, 191, 0.03)',
  },
  settingsButtonPressed: {
    backgroundColor: 'rgba(226, 211, 191, 0.1)',
  },
  settingsButtonText: {
    fontFamily: Theme.fonts.mono,
    fontSize: 13,
    color: PANEL.textPrimary,
    letterSpacing: 2,
  },
  settingsFooter: {
    marginTop: 16,
    alignItems: 'center',
  },
  settingsBackButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderWidth: 2,
    borderColor: PANEL.textPrimary,
    backgroundColor: 'rgba(226, 211, 191, 0.05)',
  },
  settingsBackText: {
    fontFamily: Theme.fonts.mono,
    fontSize: 14,
    fontWeight: '700',
    color: PANEL.textBright,
    letterSpacing: 2,
  },

  // BOTTOM SECTION
  bottomSection: {
    alignItems: 'center',
  },
  brandingPlate: {
    backgroundColor: PANEL.metal,
    borderRadius: 4,
    padding: 2,
    borderWidth: 1,
    borderTopColor: PANEL.metalLight,
    borderLeftColor: PANEL.metalLight,
    borderBottomColor: PANEL.metalDarkest,
    borderRightColor: PANEL.metalDark,
  },
  brandingPlateInner: {
    backgroundColor: PANEL.metalLight,
    borderRadius: 2,
    paddingVertical: 8,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderTopColor: PANEL.bgLighter,
    borderLeftColor: PANEL.bgLight,
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderBottomColor: PANEL.metal,
    borderRightColor: PANEL.metal,
  },
  brandingText: {
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
    fontWeight: '700',
    color: PANEL.textDark,
    letterSpacing: 3,
  },
  brandingDivider: {
    width: 100,
    height: 1,
    backgroundColor: PANEL.metal,
    marginVertical: 4,
  },
  brandingSubtext: {
    fontFamily: Theme.fonts.mono,
    fontSize: 8,
    color: PANEL.metalDark,
    letterSpacing: 0.5,
  },

  // SCREWS
  screw: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: PANEL.metalDark,
    borderWidth: 1,
    borderTopColor: PANEL.metalLight,
    borderLeftColor: PANEL.metalLight,
    borderBottomColor: PANEL.metalDarkest,
    borderRightColor: PANEL.metalDarkest,
    justifyContent: 'center',
    alignItems: 'center',
  },
  screwSlot: {
    width: 6,
    height: 1.5,
    backgroundColor: PANEL.metalDarkest,
    borderRadius: 1,
  },
  screwTopLeft: {
    top: 6,
    left: 6,
  },
  screwTopRight: {
    top: 6,
    right: 6,
  },
  screwBottomLeft: {
    bottom: 6,
    left: 6,
  },
  screwBottomRight: {
    bottom: 6,
    right: 6,
  },
});

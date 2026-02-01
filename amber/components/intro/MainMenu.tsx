import React, { useState, useCallback } from 'react';
import { View, Text, Pressable, Image, Animated } from 'react-native';
import AnimatedReanimated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { deviceStyles as styles } from '../../styles/device-menu.styles';
import TerminalText from './terminal-text';

const STICKER_TEXTURE = require('../../assets/stickers/Texturelabs_InkPaint_399S.jpg');
const METAL_TEXTURE = require('../../assets/textures/Texturelabs_Metal_264S.jpg');

// Tactile button component with press animation
interface TactileButtonProps {
  label: string;
  onPress: () => void;
  isActive?: boolean;
}

function TactileButton({ label, onPress, isActive = false }: TactileButtonProps) {
  const [isPressed, setIsPressed] = useState(false);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    setIsPressed(true);
    translateY.value = withTiming(2, { duration: 50, easing: Easing.out(Easing.quad) });
    scale.value = withTiming(0.98, { duration: 50, easing: Easing.out(Easing.quad) });
  };

  const handlePressOut = () => {
    setIsPressed(false);
    translateY.value = withTiming(0, { duration: 80, easing: Easing.out(Easing.bounce) });
    scale.value = withTiming(1, { duration: 80, easing: Easing.out(Easing.bounce) });
  };

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));

  return (
    <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut} onPress={onPress}>
      <View style={styles.hiddenButtonBezel}>
        <View style={styles.hiddenButtonBezelInner} />
        <AnimatedReanimated.View
          style={[
            styles.hiddenButton,
            isPressed && styles.hiddenButtonPressed,
            animatedButtonStyle,
          ]}
        >
          {!isPressed && <View style={styles.hiddenButtonHighlight} />}
          {!isPressed && <View style={styles.hiddenButtonShadow} />}
          <View style={styles.hiddenButtonInset} />
          <Text style={styles.hiddenButtonLabel}>{label}</Text>
          <View
            style={[styles.hiddenButtonIndicator, isActive && styles.hiddenButtonIndicatorActive]}
          />
        </AnimatedReanimated.View>
      </View>
    </Pressable>
  );
}

const SLIDE_THRESHOLD = 200;

interface HiddenButton {
  id: string;
  label: string;
  onPress?: () => void;
}

interface MainMenuProps {
  onStart: () => void;
  onContinue?: () => void;
  hasSaveData?: boolean;
  saveShiftNumber?: number;
  fadeAnim: Animated.Value;
  musicVolume: number;
  sfxVolume: number;
  onMusicVolumeChange: (value: number) => void;
  onSfxVolumeChange: (value: number) => void;
}

type ScreenView = 'menu' | 'settings';

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
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [screenView, setScreenView] = useState<ScreenView>('menu');
  const panelStartY = useSharedValue(0);
  const panelTranslateY = useSharedValue(0);

  const handleTypingComplete = useCallback(() => {
    setIsReady(true);
  }, []);

  const hiddenButtons: HiddenButton[] = [
    ...(hasSaveData
      ? [
          {
            id: 'continue',
            label: `CONTINUE ${saveShiftNumber ? `S${saveShiftNumber}` : ''}`.trim(),
            onPress: onContinue,
          },
        ]
      : []),
    {
      id: 'new-game',
      label: hasSaveData ? 'NEW GAME' : 'START',
      onPress: onStart,
    },
    {
      id: 'settings',
      label: 'SETTINGS',
      onPress: () => setScreenView((prev) => (prev === 'settings' ? 'menu' : 'settings')),
    },
  ];

  const handleHiddenButtonPress = (button: HiddenButton) => {
    button.onPress?.();
  };

  const updatePanelState = (isOpen: boolean) => {
    setIsPanelOpen(isOpen);
  };

  const panGesture = Gesture.Pan()
    .onStart(() => {
      panelStartY.value = panelTranslateY.value;
    })
    .onUpdate((event) => {
      const newY = Math.max(0, Math.min(SLIDE_THRESHOLD, panelStartY.value + event.translationY));
      panelTranslateY.value = newY;
    })
    .onEnd(() => {
      const timingConfig = { duration: 280, easing: Easing.out(Easing.cubic) };
      if (panelTranslateY.value > SLIDE_THRESHOLD / 2) {
        panelTranslateY.value = withTiming(SLIDE_THRESHOLD, timingConfig);
        runOnJS(updatePanelState)(true);
      } else {
        panelTranslateY.value = withTiming(0, timingConfig);
        runOnJS(updatePanelState)(false);
      }
    });

  const animatedPanelStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: panelTranslateY.value }],
  }));

  const ventSlots = Array(18).fill(null);
  const scanlines = Array(50).fill(null);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <GestureHandlerRootView style={styles.root}>
        <View style={styles.container}>
          <View style={styles.deviceBody}>
            <View style={styles.textureLayer}>
              <Image source={STICKER_TEXTURE} style={styles.textureMap} resizeMode="repeat" />
            </View>

            <View style={styles.depthShadowLeft} />
            <View style={styles.depthShadowRight} />
            <View style={styles.depthShadowBottom} />

            <View style={styles.bevelHighlightTop} />
            <View style={styles.bevelHighlightLeft} />
            <View style={styles.bevelShadowBottom} />
            <View style={styles.bevelShadowRight} />

            <View style={styles.topSection}>
              <View style={styles.handleContainer} />
              <View style={styles.topClipContainer} />
              <View style={styles.antennaSection} />
            </View>

            <View style={styles.ventGrilleContainer}>
              <View style={styles.ventGrilleInner}>
                {ventSlots.map((_, index) => (
                  <View key={index} style={styles.ventSlot} />
                ))}
              </View>
            </View>

            <View style={styles.screenSection}>
              <View style={styles.screenOuterFrame}>
                <View style={styles.screenInnerFrame}>
                  <View style={styles.screenBezel}>
                    <View style={styles.lcdScreen}>
                      <View style={styles.screenGlow} />
                      <View style={styles.screenVignetteTop} />
                      <View style={styles.screenVignetteBottom} />
                      <View style={styles.screenVignetteLeft} />
                      <View style={styles.screenVignetteRight} />
                      <View style={styles.scanlinesOverlay}>
                        {scanlines.map((_, index) => (
                          <View key={index} style={styles.scanline} />
                        ))}
                      </View>
                      <View style={styles.screenReflection} />

                      <View style={styles.terminalContainer}>
                        {screenView === 'menu' ? (
                          <View style={styles.terminalTextWrapper}>
                            <TerminalText
                              text="Welcome to Amber"
                              typingSpeed={80}
                              onComplete={handleTypingComplete}
                              showSystemReady={false}
                              style={styles.terminalGreen}
                            />
                          </View>
                        ) : (
                          <View style={styles.settingsScreen}>
                            <Text style={styles.settingsTitle}>AMBER SECURITY</Text>
                            <Text style={styles.settingsSub}>CONFIG</Text>
                            <Pressable
                              onPress={() => {
                                const isOn = musicVolume > 0 || sfxVolume > 0;
                                onMusicVolumeChange(isOn ? 0 : 1);
                                onSfxVolumeChange(isOn ? 0 : 1);
                              }}
                              style={({ pressed }) => [
                                styles.settingsRow,
                                pressed && styles.settingsRowPressed,
                              ]}
                            >
                              <Text style={styles.settingsLabel}>SOUND</Text>
                              <Text
                                style={[
                                  styles.settingsSwitch,
                                  musicVolume > 0 || sfxVolume > 0
                                    ? styles.settingsSwitchOn
                                    : styles.settingsSwitchOff,
                                ]}
                              >
                                {musicVolume > 0 || sfxVolume > 0 ? 'ON' : 'OFF'}
                              </Text>
                            </Pressable>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                </View>

                <View style={styles.ledContainer}>
                  <View style={styles.ledMount}>
                    <View style={[styles.ledLight, !isReady && styles.ledOff]} />
                  </View>
                </View>

                <View style={styles.screenLabelRow}>
                  <Text style={[styles.screenLabel, styles.screenLabelLeft]}>AMBER</Text>
                  <Text style={styles.screenLabel}>
                    {screenView === 'settings' ? 'SETTINGS' : 'MAIN MENU'}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.brandSection}>
              <Text style={styles.brandText}>GEBAUR</Text>
            </View>

            <View style={styles.bottomSection}>
              <View style={styles.hiddenButtonsContainer}>
                <View style={styles.hiddenButtonsCavity} />
                <View style={styles.hiddenButtonsCavityShadow} />
                <View style={styles.hiddenButtonsLabel}>
                  <Text style={styles.hiddenButtonsLabelText}>MENU</Text>
                </View>
                <View style={styles.hiddenButtonsWarningStripe} />

                {hiddenButtons.map((button) => (
                  <TactileButton
                    key={button.id}
                    label={button.label}
                    onPress={() => handleHiddenButtonPress(button)}
                    isActive={button.id === 'new-game'}
                  />
                ))}
              </View>

              <GestureDetector gesture={panGesture}>
                <AnimatedReanimated.View style={[styles.slidingPanel, animatedPanelStyle]}>
                  <View style={styles.slidingPanelTextureWrapper}>
                    <Image
                      source={METAL_TEXTURE}
                      style={styles.slidingPanelMetalTexture}
                      resizeMode="cover"
                    />
                  </View>
                  <View style={styles.slidingPanelHighlight} />
                  <View style={styles.slidingPanelLabelEmboss}>
                    <Text style={styles.slidingPanelLabelText}>ACCESS</Text>
                  </View>
                  <View style={styles.slideHandle}>
                    <View style={styles.slideHandleBar}>
                      <View style={styles.slideHandleBarHighlight} />
                    </View>
                    <Text style={styles.slideHint}>{isPanelOpen ? 'SLIDE UP' : 'SLIDE DOWN'}</Text>
                  </View>
                </AnimatedReanimated.View>
              </GestureDetector>
            </View>
          </View>
        </View>
      </GestureHandlerRootView>
    </Animated.View>
  );
};

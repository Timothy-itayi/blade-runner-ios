import React, { useState, useCallback } from 'react';
import { View, Text, Pressable, Image, Animated } from 'react-native';
import AnimatedReanimated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { Canvas, Image as SkiaImage, useImage, RuntimeShader, vec, Fill } from '@shopify/react-native-skia';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { Theme } from '../../constants/theme';
import { deviceStyles as styles } from '../../styles/device-menu.styles';
import { TypewriterText } from '../ui/ScanData';

const STICKER_TEXTURE = require('../../assets/stickers/Texturelabs_InkPaint_399S.jpg');
const METAL_TEXTURE = require('../../assets/textures/Texturelabs_Metal_264S.jpg');
const AmberLogoImage = require('../../assets/logo.png');
const SpeakerImage = require('../../assets/speaker.png');

// Animated LED Component
const GlowingLed = ({ color, size = 6, interval = 1000, delay = 0 }: { color: string; size?: number; interval?: number; delay?: number }) => {
  const opacity = useSharedValue(0.4);

  React.useEffect(() => {
    setTimeout(() => {
      opacity.value = withRepeat(
        withTiming(1, { duration: interval / 2, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    }, delay);
  }, [interval, delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <AnimatedReanimated.View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          shadowColor: color,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.8,
          shadowRadius: 4,
        },
        animatedStyle,
      ]}
    />
  );
};

// Camera Lens Component
const CameraLens = () => (
  <View
    style={{
      width: 14,
      height: 14,
      borderRadius: 7,
      backgroundColor: '#111',
      borderWidth: 1,
      borderColor: '#333',
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
    }}
  >
    <View
      style={{
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#000',
        borderWidth: 1,
        borderColor: '#222',
      }}
    />
    <View
      style={{
        position: 'absolute',
        top: 2,
        right: 3,
        width: 3,
        height: 3,
        borderRadius: 1.5,
        backgroundColor: 'rgba(255, 255, 255, 0.4)',
      }}
    />
  </View>
);

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
}

export const MainMenu = ({
  onStart,
  onContinue,
  hasSaveData,
  saveShiftNumber,
  fadeAnim,
}: MainMenuProps) => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [textIndex, setTextIndex] = useState(0);
  const [showLogo, setShowLogo] = useState(false);
  const panelStartY = useSharedValue(0);
  const panelTranslateY = useSharedValue(0);
  const logoOpacity = useSharedValue(0);

  const SEQUENCE = [
    "WELCOME TO AMBER",
    "EVERY CHOICE LEAVES A MARK."
  ];

  // Shader to create a "line art" / hatch effect
  // This takes the image luminance and applies a hatch pattern
  const HATCH_SHADER = `
    uniform shader image;
    uniform float opacity;
    uniform float2 resolution;
    uniform float4 color;

    const float PI = 3.14159265;

    half4 main(float2 xy) {
      half4 tex = image.eval(xy);
      float alpha = tex.a * opacity;
      
      if (alpha == 0.0) {
        return float4(0.0);
      }

      // Convert to luminance
      float lum = dot(tex.rgb, float3(0.299, 0.587, 0.114));
      
      // Edge detection (simple threshold on luminance for now, or just use lum)
      // Actually, we want to draw "ink" where it is dark.
      // Invert lum for "ink density"
      float ink = 1.0 - lum;
      
      float3 outColor = float3(0.0);
      float paint = 0.0;

      // Hatching pattern
      // Diagonal lines
      float scale = 4.0;
      float p1 = sin((xy.x + xy.y) * scale);
      float p2 = sin((xy.x - xy.y) * scale);
      
      // Thresholds for hatching density
      // Dark areas get more hatching
      if (ink > 0.2) {
        if (p1 > 0.0) paint = 1.0;
      }
      if (ink > 0.5) {
        if (p2 > 0.0) paint = 1.0;
      }
      if (ink > 0.8) {
         // Cross hatch tighter
         if (sin((xy.x + xy.y) * scale * 2.0) > 0.0) paint = 1.0;
      }
      
      // Also draw original shape alpha
      return vec4(color.rgb, paint * alpha);
    }
  `;

  const logoImage = useImage(AmberLogoImage);

  const resetSequence = () => {
    setShowLogo(false);
    setTextIndex(0);
  };

  const handleTypingComplete = useCallback(() => {
    setIsReady(true);
    if (textIndex === SEQUENCE.length - 1) {
       setTimeout(() => {
         setShowLogo(true);
         logoOpacity.value = withTiming(1, { duration: 2000 });
         
         setTimeout(() => {
           logoOpacity.value = withTiming(0, { duration: 1000 }, (finished) => {
             if (finished) {
               runOnJS(resetSequence)();
             }
           });
         }, 4000);
       }, 500);
    } else {
       setTimeout(() => setTextIndex(prev => prev + 1), 1500);
    }
  }, [textIndex, logoOpacity]);

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

  // Enhanced CRT Scanline Animation
  const scanlineAnim = useSharedValue(0);
  React.useEffect(() => {
    scanlineAnim.value = withRepeat(
      withTiming(1, { duration: 8000, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const animatedScanlineStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scanlineAnim.value * 5 }],
  }));

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
              {/* Left: Status Cluster */}
              <View style={[styles.handleContainer, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly', paddingHorizontal: 6 }]}>
                <GlowingLed color="#c9a227" size={5} interval={2000} />
                <GlowingLed color="#c9a227" size={5} interval={2000} delay={500} />
                <GlowingLed color="#4a8a5a" size={5} interval={3000} />
              </View>

              {/* Center: Camera/Sensor */}
              <View style={[styles.topClipContainer, { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 }]}>
                 <CameraLens />
                 <GlowingLed color="#d4534a" size={4} interval={1000} />
              </View>

              {/* Right: Speaker */}
              <View style={[styles.antennaSection, { justifyContent: 'center', alignItems: 'center' }]}>
                <Image source={SpeakerImage} style={{ width: 32, height: 32, opacity: 0.8 }} resizeMode="contain" />
              </View>
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
                          <AnimatedReanimated.View 
                            key={index} 
                            style={[
                              styles.scanline, 
                              { 
                                opacity: index % 2 === 0 ? 0.1 : 0.05,
                                transform: [{ translateY: index % 3 === 0 ? 1 : 0 }] // Static jitter
                              },
                              animatedScanlineStyle 
                            ]} 
                          />
                        ))}
                        {/* CRT flicker overlay */}
                        <GlowingLed color="rgba(255, 255, 255, 0.03)" size={1000} interval={50} delay={0} />
                      </View>
                      <View style={styles.screenReflection} />

                      <View style={styles.terminalContainer}>
                        <View style={styles.terminalTextWrapper}>
                          {!showLogo ? (
                            <TypewriterText
                              text={SEQUENCE[textIndex]}
                              active={true}
                              speed={50}
                              onComplete={handleTypingComplete}
                              style={[styles.terminalGreen, { color: Theme.colors.textPrimary, textAlign: 'center' }]}
                              showCursor={true}
                              keepCursor={true}
                            />
                          ) : (
                            <AnimatedReanimated.View style={{ opacity: logoOpacity, width: 120, height: 120 }}>
                                {logoImage && (
                                  <Canvas style={{ flex: 1 }}>
                                    <Fill color="transparent" />
                                    <RuntimeShader 
                                      source={HATCH_SHADER} 
                                      uniforms={{ 
                                        opacity: 1.0, 
                                        resolution: vec(120, 120),
                                        color: vec(226/255, 211/255, 191/255, 1.0) // Theme.colors.textPrimary #e2d3bf
                                      }}
                                    >
                                       <SkiaImage
                                          image={logoImage}
                                          fit="contain"
                                          x={0}
                                          y={0}
                                          width={120}
                                          height={120}
                                       />
                                    </RuntimeShader>
                                  </Canvas>
                                )}
                            </AnimatedReanimated.View>
                          )}
                        </View>
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
                  <Text style={styles.screenLabel}>MAIN MENU</Text>
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
                    <Text style={[styles.slideHint, { color: '#000000' }]}>{isPanelOpen ? 'SLIDE UP' : 'SLIDE DOWN'}</Text>
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

import React, { useEffect, useRef, useState } from 'react';
import { View, Animated, StyleSheet, Easing, TouchableOpacity, Text, Pressable } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { styles } from '../../styles/ui/EyeDisplay.styles';
import { Blinker, HUDBox } from './HUDBox';
import { BUILD_SEQUENCE } from '../../constants/animations';
import { Theme } from '../../constants/theme';
import { DecisionStamp } from '../game/DecisionStamp';
import { ProceduralPortrait } from './ProceduralPortrait';
import { FaceLandmarkTfliteTest } from '../game/FaceLandmarkTfliteTest';
import { ScanlineOverlay } from './CRTScreen';

const CircularBorder = ({ active, delay = 0 }: { active: boolean, delay?: number }) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (active) {
      Animated.timing(anim, {
        toValue: 1,
        duration: 1500,
        delay,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
    } else {
      anim.setValue(0);
    }
  }, [active]);

  return (
    <View style={styles.circularContainer}>
      <Animated.View 
        style={[
          styles.circularBorder, 
          { 
            transform: [
              { scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) },
              { rotate: anim.interpolate({ inputRange: [0, 1], outputRange: ['-90deg', '0deg'] }) }
            ],
            opacity: anim 
          }
        ]} 
      />
    </View>
  );
};

type ViewChannel = 'facial' | 'eye';

export const EyeDisplay = ({ 
  isScanning, 
  scanProgress, 
  videoSource,
  eyeVideo,
  eyeImage,
  videoStartTime = 4,
  videoEndTime = 8,
  hudStage,
  hasDecision,
  decisionType,
  scanningIris = false,
  subjectLooking = true,
  viewChannel = 'facial',
  onChannelChange,
  eyeScannerActive = false,
  onToggleEyeScanner,
  onEyeScannerTap,
  identityScanHoldActive = false,
  onIdentityScanHoldStart,
  onIdentityScanHoldEnd,
  interactionPhase = 'investigation',
  isIdentityScanning = false,
  identityScanComplete = false,
  onIdentityScanComplete,
  biometricsRevealed = false,
  // Procedural portrait props
  useProceduralPortrait = false,
  baseImageIdOverride,
  subjectId,
  subjectType,
  isAnomaly = false,
}: { 
  isScanning: boolean, 
  scanProgress: Animated.Value, 
  videoSource?: any,
  eyeVideo?: any,
  eyeImage?: any,
  videoStartTime?: number,
  videoEndTime?: number,
  hudStage: 'none' | 'wireframe' | 'outline' | 'full',
  hasDecision?: boolean,
  decisionType?: 'APPROVE' | 'DENY',
  scanningIris?: boolean,
  subjectLooking?: boolean,
  viewChannel?: 'facial' | 'eye',
  onChannelChange?: () => void,
  eyeScannerActive?: boolean,
  onToggleEyeScanner?: () => void,
  onEyeScannerTap?: (holdDurationMs?: number) => void,
  identityScanHoldActive?: boolean,
  onIdentityScanHoldStart?: () => void,
  onIdentityScanHoldEnd?: (holdDurationMs: number) => void,
  interactionPhase?: 'greeting' | 'credentials' | 'investigation',
  isIdentityScanning?: boolean,
  identityScanComplete?: boolean,
  onIdentityScanComplete?: () => void,
  biometricsRevealed?: boolean,
  // Procedural portrait props
  useProceduralPortrait?: boolean,
  baseImageIdOverride?: number,
  subjectId?: string,
  subjectType?: string,
  isAnomaly?: boolean,
}) => {
  const staticOverlay = require('../../assets/videos/static.gif');
  const changeChannel = require('../../assets/videos/change-channel.gif');
  const contentFade = useRef(new Animated.Value(0)).current;
  const staticFade = useRef(new Animated.Value(1)).current;
  const [isLive, setIsLive] = useState(false);
  const irisScanLine = useRef(new Animated.Value(0)).current;
  const irisScanOpacity = useRef(new Animated.Value(0)).current;
  const eyeScannerLaser = useRef(new Animated.Value(0)).current;
  const eyeScannerLaserOpacity = useRef(new Animated.Value(0)).current;
  const holdMarkerOpacity = useRef(new Animated.Value(0)).current;
  const holdTintOpacity = useRef(new Animated.Value(0)).current;
  const identityTimersRef = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  const clearIdentityTimers = () => {
    identityTimersRef.current.forEach(clearTimeout);
    identityTimersRef.current = [];
  };
  
  // Identity scan animation states
  const identityScanLaser = useRef(new Animated.Value(0)).current;
  const identityScanLaserOpacity = useRef(new Animated.Value(0)).current;
  const redDotsOpacity = useRef(new Animated.Value(0)).current;
  const idCompletedStampOpacity = useRef(new Animated.Value(0)).current;
  const [showRedDots, setShowRedDots] = useState(false);
  const [showIdCompleted, setShowIdCompleted] = useState(false);
  
  // Determine if we should use procedural portrait
  const shouldUseProcedural = useProceduralPortrait || (!videoSource && subjectId);
  
  // Use eye video if available and in eye view, otherwise use face video
  const currentVideoSource = (viewChannel === 'eye' && eyeVideo) ? eyeVideo : videoSource;
  
  // Placeholder video for when no source is available (prevents hook error)
  const placeholderVideo = require('../../assets/videos/static.gif');
  const videoToUse = shouldUseProcedural ? placeholderVideo : (currentVideoSource || placeholderVideo);
  
  const player = useVideoPlayer(videoToUse, (player) => {
    if (!shouldUseProcedural && currentVideoSource) {
      player.loop = false;
      player.playbackRate = 0.5; // 50% slower than normal (0.5x speed)
      player.timeUpdateEventInterval = 0.05;
      player.play();
    }
  });
  
  // Update video source when channel changes (only for video mode)
  useEffect(() => {
    if (shouldUseProcedural) return;
    const newSource = (viewChannel === 'eye' && eyeVideo) ? eyeVideo : videoSource;
    if (!newSource) return;
    // Replace video source if it changed
    try {
      player.replace(newSource);
    } catch (e) {
      // If replace fails, the player will use the initial source
      console.warn('Failed to replace video source:', e);
    }
  }, [viewChannel, eyeVideo, videoSource, player, shouldUseProcedural]);

  useEffect(() => {
    if (player.status === 'readyToPlay') {
      player.currentTime = videoStartTime;
    }

    const timeSub = player.addListener('timeUpdate', ({ currentTime }) => {
      if (currentTime >= videoEndTime) {
        player.currentTime = videoStartTime;
      }
    });

    const endSub = player.addListener('playToEnd', () => {
      player.currentTime = videoStartTime;
      player.play();
    });

    const statusSub = player.addListener('statusChange', ({ status }) => {
      if (status === 'readyToPlay') {
        player.currentTime = videoStartTime;
        player.play();
      }
    });

    return () => {
      timeSub.remove();
      endSub.remove();
      statusSub.remove();
    };
  }, [player, videoStartTime, videoEndTime]);

  useEffect(() => {
    if (hudStage === 'full' || hudStage === 'outline') {
      Animated.sequence([
        Animated.delay(BUILD_SEQUENCE.retinalImage),
        Animated.parallel([
          Animated.timing(contentFade, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(staticFade, {
            toValue: 0.1,
            duration: 1000,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          })
        ])
      ]).start(() => setIsLive(true));
    } else {
      contentFade.setValue(0);
      staticFade.setValue(1);
      setIsLive(false);
    }
  }, [hudStage]);

  // Iris laser scan animation for replicant verification
  useEffect(() => {
    if (scanningIris && subjectLooking) {
      irisScanLine.setValue(0);
      irisScanOpacity.setValue(0);
      Animated.sequence([
        Animated.timing(irisScanOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(irisScanLine, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(irisScanOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [scanningIris, subjectLooking]);

  const holdStartRef = useRef<number | null>(null);
  const HOLD_FULL_DURATION_MS = 1800;

  useEffect(() => {
    if (identityScanHoldActive && eyeScannerActive) {
      eyeScannerLaser.stopAnimation();
      eyeScannerLaserOpacity.stopAnimation();
      holdMarkerOpacity.stopAnimation();
      holdTintOpacity.stopAnimation();
      eyeScannerLaser.setValue(0);
      eyeScannerLaserOpacity.setValue(0);
      holdMarkerOpacity.setValue(0);
      holdTintOpacity.setValue(0);

      Animated.parallel([
        Animated.timing(eyeScannerLaserOpacity, {
          toValue: 1,
          duration: 120,
          useNativeDriver: false,
        }),
        Animated.timing(eyeScannerLaser, {
          toValue: 1,
          duration: HOLD_FULL_DURATION_MS,
          easing: Easing.out(Easing.quad),
          useNativeDriver: false,
        }),
        Animated.timing(holdMarkerOpacity, {
          toValue: 1,
          duration: HOLD_FULL_DURATION_MS,
          useNativeDriver: false,
        }),
        Animated.timing(holdTintOpacity, {
          toValue: 1,
          duration: 240,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      eyeScannerLaser.stopAnimation();
      eyeScannerLaserOpacity.stopAnimation();
      holdMarkerOpacity.stopAnimation();
      holdTintOpacity.stopAnimation();
      eyeScannerLaser.setValue(0);
      eyeScannerLaserOpacity.setValue(0);
      holdMarkerOpacity.setValue(0);
      holdTintOpacity.setValue(0);
    }
  }, [identityScanHoldActive, eyeScannerActive]);

  // Identity scan animation sequence
  useEffect(() => {
    clearIdentityTimers();
    if (isIdentityScanning && eyeScannerActive) {
      // Reset all animation values
      identityScanLaser.setValue(0);
      identityScanLaserOpacity.setValue(0);
      redDotsOpacity.setValue(0);
      idCompletedStampOpacity.setValue(0);
      setShowRedDots(false);
      setShowIdCompleted(false);

      // Sequence: Laser scan → Red dots → Green stamp → Complete
      Animated.sequence([
        // Step 1: Laser scan down
        Animated.timing(identityScanLaserOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(identityScanLaser, {
          toValue: 1,
          duration: 1500,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(identityScanLaserOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        // Step 2: Show red dots and lines
        Animated.timing(redDotsOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowRedDots(true);
        // Step 3: After red dots visible, show green stamp
        identityTimersRef.current.push(setTimeout(() => {
          setShowIdCompleted(true);
          Animated.timing(idCompletedStampOpacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }).start(() => {
            // Step 4: Complete - unlock dossier
            identityTimersRef.current.push(setTimeout(() => {
              if (onIdentityScanComplete) {
                onIdentityScanComplete();
              }
            }, 500));
          });
        }, 800));
      });
    } else {
      // Reset when not scanning
      identityScanLaser.setValue(0);
      identityScanLaserOpacity.setValue(0);
      redDotsOpacity.setValue(0);
      idCompletedStampOpacity.setValue(0);
      setShowRedDots(false);
      setShowIdCompleted(false);
    }
    return () => {
      clearIdentityTimers();
    };
  }, [isIdentityScanning, eyeScannerActive]);

  if (hudStage === 'none') return <View style={styles.container} />;

  // CRT glitch animation
  const crtGlitchY = useRef(new Animated.Value(0)).current;
  const crtGlitchOpacity = useRef(new Animated.Value(0)).current;
  
  // Trigger random glitch bands
  useEffect(() => {
    const triggerGlitch = () => {
      const delay = 4000 + Math.random() * 10000;
      setTimeout(() => {
        const yPos = Math.random() * 100;
        crtGlitchY.setValue(yPos);
        
        Animated.sequence([
          Animated.timing(crtGlitchOpacity, { toValue: 0.6, duration: 30, useNativeDriver: true }),
          Animated.timing(crtGlitchOpacity, { toValue: 0, duration: 80, useNativeDriver: true }),
        ]).start(() => triggerGlitch());
      }, delay);
    };
    triggerGlitch();
  }, []);

  const content = (
    <HUDBox hudStage={hudStage} style={styles.container} buildDelay={BUILD_SEQUENCE.retinalBorder}>
      <View style={styles.videoWrapper}>
        {/* CRT Phosphor glow base */}
        <View style={styles.phosphorGlow} pointerEvents="none" />
        
        <CircularBorder active={true} delay={BUILD_SEQUENCE.retinalBorder} />
        
        {/* Scanner OFF: opaque screen, no portrait. Scanner ON: subject feed + scan effects. */}
        {!eyeScannerActive ? (
          <View style={[StyleSheet.absoluteFill, { zIndex: 15, backgroundColor: '#05070a' }]} pointerEvents="none">
            <Image
              source={staticOverlay}
              style={[StyleSheet.absoluteFill, { opacity: 0.18 }]}
              contentFit="cover"
            />
            <View style={[styles.gridOverlay, { backgroundColor: 'rgba(0,0,0,0.55)' }]} />
            <View style={styles.staticLabel}>
              <View style={styles.staticLabelBackground} />
              <Text style={styles.staticText}>
                {interactionPhase === 'investigation' ? 'FACE SCANNER READY' : 'VERIFY TO BEGIN'}
              </Text>
              <Text style={styles.staticSubtext}>
                {interactionPhase === 'investigation' ? 'TAP TO SCAN FACE' : 'VERIFY TO BEGIN'}
              </Text>
            </View>
          </View>
        ) : (
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              {
                opacity: staticFade,
                zIndex: 10,
              },
            ]}
          >
            <Image
              source={staticOverlay}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
            />
          </Animated.View>
        )}

        {/* Main Subject UI - Portrait/feed only visible when scanner is ON */}
        <Animated.View style={[
          StyleSheet.absoluteFill, 
          { 
            opacity: eyeScannerActive ? contentFade : 0, 
            zIndex: 5 
          }
        ]}>
          <Animated.View style={[
            styles.zoomContainer, 
            { 
              transform: [
                {
                  scale: eyeScannerLaser.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1.2, 1.26],
                  }),
                },
                { translateY: 0 }
              ] 
            }
          ]}>
            {/* Procedural Portrait Mode */}
            {shouldUseProcedural && subjectId ? (
              <FaceLandmarkTfliteTest
                scanProgress={isIdentityScanning ? 1 : (identityScanHoldActive ? 0.5 : 0)}
                isScanning={isIdentityScanning || identityScanHoldActive}
                mode="portrait"
                activeIndex={baseImageIdOverride ?? 0}
                style={styles.video}
              />
            ) : eyeScannerActive ? (
              eyeVideo ? (
                <VideoView
                  style={styles.video}
                  player={player}
                  contentFit="cover"
                  allowsFullscreen={false}
                  allowsPictureInPicture={false}
                />
              ) : eyeImage && biometricsRevealed ? (
                <Image
                  source={eyeImage}
                  style={styles.video}
                  contentFit="contain"
                />
              ) : (
                <VideoView
                  style={styles.video}
                  player={player}
                  contentFit="cover"
                  allowsFullscreen={false}
                  allowsPictureInPicture={false}
                />
              )
            ) : (
              <VideoView
                style={styles.video}
                player={player}
                contentFit="cover"
                allowsFullscreen={false}
                allowsPictureInPicture={false}
              />
            )}
          </Animated.View>
          

          {/* Standard scan laser line - only when scanner is on and scanning */}
          <Animated.View 
            style={[
              styles.laserLine,
              {
                transform: [{
                  translateY: scanProgress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 250],
                  })
                }],
                opacity: eyeScannerActive && isScanning ? 1 : 0
              }
            ]}
          />

          {/* Iris scan laser for replicant verification */}
          {scanningIris && subjectLooking && (
            <Animated.View
              style={[
                styles.irisScanLine,
                {
                  opacity: irisScanOpacity,
                  transform: [{
                    translateY: irisScanLine.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 250],
                    })
                  }],
                },
              ]}
            />
          )}

          {/* Eye scanner laser - slides down while holding */}
          {eyeScannerActive && identityScanHoldActive && (
            <Animated.View
              style={[
                styles.eyeScannerLaser,
                {
                  opacity: eyeScannerLaserOpacity,
                  transform: [{
                    translateY: eyeScannerLaser.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 250],
                    })
                  }],
                },
              ]}
            />
          )}

          {/* Hold progress bar */}
          {eyeScannerActive && identityScanHoldActive && (
            <View style={styles.holdProgressTrack}>
              <Animated.View
                style={[
                  styles.holdProgressFill,
                  {
                    width: eyeScannerLaser.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    }),
                  },
                ]}
              />
            </View>
          )}

          {/* Identity scan laser - slides down when ID scan is triggered */}
          {isIdentityScanning && eyeScannerActive && (
            <Animated.View
              style={[
                styles.eyeScannerLaser,
                {
                  opacity: identityScanLaserOpacity,
                  transform: [{
                    translateY: identityScanLaser.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 250],
                    })
                  }],
                },
              ]}
            />
          )}

          {/* Red dots and lines in semi-circle pattern - identity scan analysis */}
          {(showRedDots || identityScanHoldActive) && eyeScannerActive && (
            <Animated.View
              style={[
                StyleSheet.absoluteFill,
                {
                  opacity: showRedDots ? redDotsOpacity : holdMarkerOpacity,
                  zIndex: 12,
                  justifyContent: 'center',
                  alignItems: 'center',
                },
              ]}
            >
              {/* Semi-circle of red dots and lines pointing from iris center */}
              {[...Array(8)].map((_, i) => {
                const angle = (i * 22.5) - 90; // Start from top, 8 points in semi-circle (180 degrees)
                const radius = 50;
                const centerX = 0;
                const centerY = 0;
                const x = Math.cos((angle * Math.PI) / 180) * radius;
                const y = Math.sin((angle * Math.PI) / 180) * radius;
                
                return (
                  <View
                    key={`red-marker-${i}`}
                    style={[
                      styles.identityScanMarker,
                      {
                        position: 'absolute',
                        left: '50%',
                        top: '45%',
                        width: radius,
                        height: 2,
                        transform: [
                          { translateX: -radius / 2 },
                          { translateY: -1 },
                          { rotate: `${angle}deg` },
                        ],
                      },
                    ]}
                  >
                    {/* Red line from center to dot */}
                    <View style={styles.redLine} />
                    {/* Red dot at end of line */}
                    <View
                      style={[
                        styles.redDot,
                        {
                          position: 'absolute',
                          right: -3,
                          top: -2,
                        },
                      ]}
                    />
                  </View>
                );
              })}
            </Animated.View>
          )}

          {/* Green ID COMPLETED stamp */}
          {showIdCompleted && (
            <Animated.View
              style={[
                styles.idCompletedStamp,
                {
                  opacity: idCompletedStampOpacity,
                  zIndex: 13,
                },
              ]}
            >
              <View style={styles.idCompletedStampBorder}>
                <Text style={styles.idCompletedText}>ID COMPLETED</Text>
              </View>
            </Animated.View>
          )}

          <Animated.View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFill,
              styles.holdTint,
              { opacity: holdTintOpacity },
            ]}
          />

          <View style={styles.gridOverlay}>
            {[...Array(8)].map((_, i) => (
              <View key={`v-${i}`} style={[styles.gridLine, styles.verticalLine, { left: `${(i + 1) * 12.5}%` }]} />
            ))}
            {[...Array(8)].map((_, i) => (
              <View key={`h-${i}`} style={[styles.gridLine, styles.horizontalLine, { top: `${(i + 1) * 12.5}%` }]} />
            ))}
            
            {isLive && (
              <View style={styles.reticle}>
                <View style={[styles.reticleCorner, styles.topLeft]} />
                <View style={[styles.reticleCorner, styles.topRight]} />
                <View style={[styles.reticleCorner, styles.bottomLeft]} />
                <View style={[styles.reticleCorner, styles.bottomRight]} />
              </View>
            )}
          </View>

          {eyeScannerActive && !isIdentityScanning && (
            <View style={styles.eyeScannerHint}>
              <View style={styles.eyeScannerHintBadge}>
                <Text style={styles.eyeScannerHintText}>
                  {identityScanComplete
                    ? 'ID VERIFIED'
                    : identityScanHoldActive
                      ? 'RELEASE TO COMPLETE'
                      : 'HOLD TO SCAN FACE'}
                </Text>
              </View>
            </View>
          )}

          {hasDecision && decisionType && (
            <DecisionStamp type={decisionType} visible={!!hasDecision} />
          )}
        </Animated.View>
        
        {/* CRT Effects Overlays */}
        {/* Scanlines */}
        <ScanlineOverlay intensity={0.12} />
        
        {/* Vignette - darkening at edges */}
        <View style={styles.vignetteOverlay} pointerEvents="none" />
        
        {/* Glass reflection */}
        <View style={styles.glassReflection} pointerEvents="none">
          <LinearGradient
            colors={[
              'rgba(255,255,255,0.06)',
              'rgba(255,255,255,0.02)',
              'rgba(255,255,255,0)',
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ flex: 1, borderRadius: 4 }}
          />
        </View>
        
        {/* Glitch band - uses transform instead of top for native driver compatibility */}
        <Animated.View
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            height: 12,
            backgroundColor: 'rgba(255,255,255,0.1)',
            borderTopWidth: 1,
            borderTopColor: 'rgba(255,50,50,0.25)',
            borderBottomWidth: 1,
            borderBottomColor: 'rgba(50,255,255,0.25)',
            opacity: crtGlitchOpacity,
            zIndex: 35,
            transform: [{
              translateY: crtGlitchY.interpolate({
                inputRange: [0, 100],
                outputRange: [0, 250],
              }),
            }],
          }}
          pointerEvents="none"
        />
      </View>
    </HUDBox>
  );

  // Tap to power on; hold to scan when active (investigation phase only).
  if (onEyeScannerTap && interactionPhase === 'investigation') {
    return (
      <Pressable 
        onPress={() => {
          if (!eyeScannerActive) {
            onToggleEyeScanner?.();
          }
        }}
        onPressIn={() => {
          if (!eyeScannerActive || identityScanComplete) return;
          holdStartRef.current = Date.now();
          onIdentityScanHoldStart?.();
        }}
        onPressOut={() => {
          if (!eyeScannerActive || identityScanComplete) return;
          const startedAt = holdStartRef.current;
          holdStartRef.current = null;
          if (!startedAt) return;
          const duration = Date.now() - startedAt;
          onIdentityScanHoldEnd?.(duration);
          onEyeScannerTap(duration);
        }}
        disabled={isIdentityScanning}
        style={{ flex: 1 }}
      >
        {content}
      </Pressable>
    );
  }

  return content;
};

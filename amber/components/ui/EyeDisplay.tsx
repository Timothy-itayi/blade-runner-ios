import React, { useEffect, useRef, useState } from 'react';
import { View, Animated, StyleSheet, Easing, TouchableOpacity, Text, Pressable } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { Image } from 'expo-image';
import { styles } from '../../styles/ui/EyeDisplay.styles';
import { Blinker, HUDBox } from './HUDBox';
import { BUILD_SEQUENCE } from '../../constants/animations';
import { Theme } from '../../constants/theme';
import { DecisionStamp } from '../game/DecisionStamp';

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
  onEyeScannerTap,
  interactionPhase = 'investigation',
  isIdentityScanning = false,
  onIdentityScanComplete,
}: { 
  isScanning: boolean, 
  scanProgress: Animated.Value, 
  videoSource: any,
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
  onEyeScannerTap?: () => void,
  interactionPhase?: 'greeting' | 'credentials' | 'investigation',
  isIdentityScanning?: boolean,
  onIdentityScanComplete?: () => void,
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
  const [isScanningEye, setIsScanningEye] = useState(false);
  
  // Identity scan animation states
  const identityScanLaser = useRef(new Animated.Value(0)).current;
  const identityScanLaserOpacity = useRef(new Animated.Value(0)).current;
  const redDotsOpacity = useRef(new Animated.Value(0)).current;
  const idCompletedStampOpacity = useRef(new Animated.Value(0)).current;
  const [showRedDots, setShowRedDots] = useState(false);
  const [showIdCompleted, setShowIdCompleted] = useState(false);
  
  // Use eye video if available and in eye view, otherwise use face video
  const currentVideoSource = (viewChannel === 'eye' && eyeVideo) ? eyeVideo : videoSource;
  
  const player = useVideoPlayer(currentVideoSource, (player) => {
    player.loop = false;
    player.playbackRate = 0.5; // 50% slower than normal (0.5x speed)
    player.timeUpdateEventInterval = 0.05;
    player.play();
  });
  
  // Update video source when channel changes
  useEffect(() => {
    const newSource = (viewChannel === 'eye' && eyeVideo) ? eyeVideo : videoSource;
    // Replace video source if it changed
    try {
      player.replace(newSource);
    } catch (e) {
      // If replace fails, the player will use the initial source
      console.warn('Failed to replace video source:', e);
    }
  }, [viewChannel, eyeVideo, videoSource, player]);

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

  // Eye scanner tap handler - triggers laser scan
  const handleEyeScannerTap = () => {
    if (!eyeScannerActive || isScanningEye || interactionPhase !== 'investigation') return;
    
    setIsScanningEye(true);
    eyeScannerLaser.setValue(0);
    eyeScannerLaserOpacity.setValue(0);
    
    Animated.sequence([
      Animated.timing(eyeScannerLaserOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(eyeScannerLaser, {
        toValue: 1,
        duration: 1500,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(eyeScannerLaserOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsScanningEye(false);
      if (onEyeScannerTap) {
        onEyeScannerTap();
      }
    });
  };

  // Identity scan animation sequence
  useEffect(() => {
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
        setTimeout(() => {
          setShowIdCompleted(true);
          Animated.timing(idCompletedStampOpacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }).start(() => {
            // Step 4: Complete - unlock dossier
            setTimeout(() => {
              if (onIdentityScanComplete) {
                onIdentityScanComplete();
              }
            }, 500);
          });
        }, 800);
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
  }, [isIdentityScanning, eyeScannerActive]);

  if (hudStage === 'none') return <View style={styles.container} />;

  const content = (
    <HUDBox hudStage={hudStage} style={styles.container} buildDelay={BUILD_SEQUENCE.retinalBorder}>
      <View style={styles.videoWrapper}>
        <CircularBorder active={true} delay={BUILD_SEQUENCE.retinalBorder} />
        
        {/* Static Overlay - Shows when eye scanner is OFF */}
        <Animated.View style={[
          StyleSheet.absoluteFill, 
          { 
            opacity: !eyeScannerActive ? 1 : staticFade, 
            zIndex: !eyeScannerActive ? 15 : 10 
          }
        ]}>
          <Image 
            source={changeChannel}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
          />
          <View style={[styles.gridOverlay, { backgroundColor: 'rgba(0,0,0,0.3)' }]} />
          {!eyeScannerActive && (
            <View style={styles.staticLabel}>
              <Text style={styles.staticText}>EYE SCANNER OFF</Text>
              <Text style={styles.staticSubtext}>STATIC NOISE</Text>
            </View>
          )}
        </Animated.View>

        {/* Main Subject UI - Eye scanner view when active */}
        <Animated.View style={[
          StyleSheet.absoluteFill, 
          { 
            opacity: eyeScannerActive ? contentFade : (viewChannel === 'facial' ? contentFade : 0), 
            zIndex: 5 
          }
        ]}>
          <Animated.View style={[
            styles.zoomContainer, 
            { 
              transform: [
                { scale: 1.2 }, // 20% zoom in
                { translateY: 0 }
              ] 
            }
          ]}>
            {eyeScannerActive && eyeImage ? (
              // Eye scanner active: Show eye image with effects
              <Image
                source={eyeImage}
                style={styles.video}
                contentFit="contain"
              />
            ) : (
              // Facial view: Use video
              <VideoView
                style={styles.video}
                player={player}
                contentFit="cover"
                allowsFullscreen={false}
                allowsPictureInPicture={false}
              />
            )}
          </Animated.View>
          

          {/* Standard scan laser line */}
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
                opacity: isScanning ? 1 : 0
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

          {/* Eye scanner laser - slides down when tapped */}
          {eyeScannerActive && (
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
          {showRedDots && eyeScannerActive && (
            <Animated.View
              style={[
                StyleSheet.absoluteFill,
                {
                  opacity: redDotsOpacity,
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

          {hasDecision && decisionType && (
            <DecisionStamp type={decisionType} visible={!!hasDecision} />
          )}
        </Animated.View>
      </View>
    </HUDBox>
  );

  // Wrap in Pressable if eye scanner is active (Pressable doesn't cause layout changes)
  // Only allow tap in investigation phase
  if (eyeScannerActive && onEyeScannerTap && interactionPhase === 'investigation') {
    return (
      <Pressable 
        onPress={handleEyeScannerTap}
        disabled={isScanningEye}
        style={{ flex: 1 }}
      >
        {content}
      </Pressable>
    );
  }

  return content;
};

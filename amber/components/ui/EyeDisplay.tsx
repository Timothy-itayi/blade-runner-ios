import React, { useEffect, useRef, useState } from 'react';
import { View, Animated, StyleSheet, Easing, TouchableOpacity, Text } from 'react-native';
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
  videoStartTime = 4,
  videoEndTime = 8,
  hudStage,
  hasDecision,
  decisionType,
  scanningIris = false,
  subjectLooking = true,
  viewChannel = 'facial',
  onChannelChange
}: { 
  isScanning: boolean, 
  scanProgress: Animated.Value, 
  videoSource: any,
  eyeVideo?: any,
  videoStartTime?: number,
  videoEndTime?: number,
  hudStage: 'none' | 'wireframe' | 'outline' | 'full',
  hasDecision?: boolean,
  decisionType?: 'APPROVE' | 'DENY',
  scanningIris?: boolean,
  subjectLooking?: boolean,
  viewChannel?: 'facial' | 'eye',
  onChannelChange?: () => void
}) => {
  const staticOverlay = require('../../assets/videos/static.gif');
  const changeChannel = require('../../assets/videos/change-channel.gif');
  const contentFade = useRef(new Animated.Value(0)).current;
  const staticFade = useRef(new Animated.Value(1)).current;
  const [isLive, setIsLive] = useState(false);
  const irisScanLine = useRef(new Animated.Value(0)).current;
  const irisScanOpacity = useRef(new Animated.Value(0)).current;
  
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

  if (hudStage === 'none') return <View style={styles.container} />;

  return (
    <HUDBox hudStage={hudStage} style={styles.container} buildDelay={BUILD_SEQUENCE.retinalBorder}>
      <View style={styles.videoWrapper}>
        <CircularBorder active={true} delay={BUILD_SEQUENCE.retinalBorder} />
        
        {/* Startup Static Overlay */}
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: staticFade, zIndex: 10 }]}>
          <Image 
            source={changeChannel}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
          />
          <View style={[styles.gridOverlay, { backgroundColor: 'rgba(0,0,0,0.3)' }]} />
        </Animated.View>

        {/* Main Subject UI - Channel-based view */}
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: contentFade, zIndex: 5 }]}>
          <Animated.View style={[
            styles.zoomContainer, 
            { 
              transform: [
                { scale: 1.2 }, // 20% zoom in
                { translateY: 0 }
              ] 
            }
          ]}>
            <VideoView
              style={styles.video}
              player={player}
              contentFit={viewChannel === 'eye' ? 'contain' : 'cover'}
              allowsFullscreen={false}
              allowsPictureInPicture={false}
            />
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
};

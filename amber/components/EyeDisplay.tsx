import React, { useEffect, useRef, useState } from 'react';
import { View, Animated, StyleSheet, Easing } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { Image } from 'expo-image';
import { styles } from '../styles/EyeDisplay.styles';
import { Blinker, HUDBox } from './HUDBox';
import { BUILD_SEQUENCE } from '../constants/animations';
import { Theme } from '../constants/theme';
import { DecisionStamp } from './DecisionStamp';

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

export const EyeDisplay = ({ 
  isScanning, 
  scanProgress, 
  videoSource, 
  hudStage,
  hasDecision,
  decisionType
}: { 
  isScanning: boolean, 
  scanProgress: Animated.Value, 
  videoSource: any,
  hudStage: 'none' | 'wireframe' | 'outline' | 'full',
  hasDecision?: boolean,
  decisionType?: 'APPROVE' | 'DENY'
}) => {
  const staticOverlay = require('../assets/videos/static.gif');
  const changeChannel = require('../assets/videos/change-channel.gif');
  const contentFade = useRef(new Animated.Value(0)).current;
  const staticFade = useRef(new Animated.Value(1)).current;
  const [isLive, setIsLive] = useState(false);
  
  const player = useVideoPlayer(videoSource, (player) => {
    player.loop = false;
    player.playbackRate = 0.25;
    player.timeUpdateEventInterval = 0.05;
    player.play();
  });

  useEffect(() => {
    if (player.status === 'readyToPlay') {
      player.currentTime = 4;
    }

    const timeSub = player.addListener('timeUpdate', ({ currentTime }) => {
      if (currentTime >= 8) {
        player.currentTime = 4;
      }
    });

    const endSub = player.addListener('playToEnd', () => {
      player.currentTime = 4;
      player.play();
    });

    const statusSub = player.addListener('statusChange', ({ status }) => {
      if (status === 'readyToPlay') {
        player.currentTime = 6;
        player.play();
      }
    });

    return () => {
      timeSub.remove();
      endSub.remove();
      statusSub.remove();
    };
  }, [player]);

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

        {/* Main Eye UI */}
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: contentFade, zIndex: 5 }]}>
          <Animated.View style={[styles.zoomContainer, { transform: [{ scale: 2.2 }] }]}>
            <VideoView
              style={styles.video}
              player={player}
              contentFit="cover"
              allowsFullscreen={false}
              allowsPictureInPicture={false}
            />
          </Animated.View>
          
          <Image 
            source={staticOverlay}
            style={styles.staticOverlay}
            contentFit="fill"
            contentPosition="center"
          />

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

import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Easing } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { Image } from 'expo-image';
import { styles } from '../styles/EyeDisplay.styles';
import { Blinker } from './HUDBox';

export const EyeDisplay = ({ isScanning, scanProgress, videoSource, hudStage }: { 
  isScanning: boolean, 
  scanProgress: Animated.Value, 
  videoSource: any,
  hudStage: 'none' | 'wireframe' | 'outline' | 'full'
}) => {
  const staticOverlay = require('../assets/videos/static.gif');
  const changeChannel = require('../assets/videos/change-channel.gif');
  const contentFade = useRef(new Animated.Value(0)).current;
  const staticFade = useRef(new Animated.Value(1)).current;
  
  const player = useVideoPlayer(videoSource, (player) => {
    player.loop = false; // Disable native loop to control it manually
    player.playbackRate = 0.25;
    player.timeUpdateEventInterval = 0.05; // High frequency for better loop accuracy
    player.play();
  });

  useEffect(() => {
    // Initial seek to the start of the loop
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
    if (hudStage === 'full') {
      Animated.parallel([
        Animated.timing(contentFade, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(staticFade, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        })
      ]).start();
    } else {
      contentFade.setValue(0);
      staticFade.setValue(1);
    }
  }, [hudStage]);

  if (hudStage === 'none') return <View style={styles.container} />;

  return (
    <View style={styles.container}>
      <View style={styles.videoWrapper}>
        {/* Startup Static Overlay - Fades Out */}
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: staticFade, zIndex: 10 }]}>
          <Image 
            source={changeChannel}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
          />
          <View style={styles.gridOverlay} />
          {hudStage !== 'full' && <Blinker />}
        </Animated.View>

        {/* Main Eye UI - Fades In */}
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
            
            <View style={styles.reticle}>
              <View style={[styles.reticleCorner, styles.topLeft]} />
              <View style={[styles.reticleCorner, styles.topRight]} />
              <View style={[styles.reticleCorner, styles.bottomLeft]} />
              <View style={[styles.reticleCorner, styles.bottomRight]} />
            </View>
          </View>

          <View style={styles.labelContainer}>
            <View style={styles.labelBackground} />
            <View style={styles.labelText} />
          </View>
        </Animated.View>
      </View>
    </View>
  );
};

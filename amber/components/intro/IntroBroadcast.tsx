import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Pressable } from 'react-native';
import { Image } from 'expo-image';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Theme } from '../../constants/theme';
import { TypewriterText } from '../ui/ScanData';
import {
  INTRO_NEWS_SEGMENTS,
  INTRO_TICKER_ITEMS,
  IntroBroadcastSegment
} from '../../constants/introBroadcast';

const STORAGE_KEY = 'amber_has_seen_intro_broadcast';

interface IntroBroadcastProps {
  onComplete: () => void;
}

export const IntroBroadcast = ({ onComplete }: IntroBroadcastProps) => {
  const newsAnchor = require('../../assets/news-report.png');
  const staticOverlay = require('../../assets/videos/static.gif');
  const changeChannel = require('../../assets/videos/change-channel.gif');

  // Animation refs
  const fadeIn = useRef(new Animated.Value(0)).current;
  const staticFade = useRef(new Animated.Value(1)).current;
  const headlineFade = useRef(new Animated.Value(0)).current;
  const tickerPosition = useRef(new Animated.Value(0)).current;
  const glitchOpacity = useRef(new Animated.Value(0)).current;

  // Story state
  const [segmentIndex, setSegmentIndex] = useState(0);
  const [isLive, setIsLive] = useState(false);
  const [headlineKey, setHeadlineKey] = useState(0);
  const [canSkip, setCanSkip] = useState(false);
  const [showSkip, setShowSkip] = useState(false);

  // Audio stripped.

  const currentSegment = INTRO_NEWS_SEGMENTS[segmentIndex];

  // Check if user has seen intro before
  useEffect(() => {
    const checkSeenStatus = async () => {
      try {
        const hasSeen = await AsyncStorage.getItem(STORAGE_KEY);
        if (hasSeen === 'true') {
          setCanSkip(true);
          // Show skip button after brief delay
          setTimeout(() => setShowSkip(true), 1000);
        }
      } catch (e) {
        // Ignore errors, default to not skippable
      }
    };
    checkSeenStatus();
  }, []);

  // Initial boot-up animation
  useEffect(() => {
    Animated.sequence([
      Animated.delay(300),
      Animated.parallel([
        Animated.timing(fadeIn, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(staticFade, {
          toValue: 0.15,
          duration: 1000,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(headlineFade, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsLive(true);
    });

    // Start ticker animation
    Animated.loop(
      Animated.timing(tickerPosition, {
        toValue: -1000,
        duration: 15000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    return;
  }, []);

  // Auto-advance segments
  useEffect(() => {
    if (!isLive) return;

    const timer = setTimeout(() => {
      if (segmentIndex < INTRO_NEWS_SEGMENTS.length - 1) {
        advanceSegment();
      } else {
        handleComplete();
      }
    }, currentSegment.duration);

    return () => clearTimeout(timer);
  }, [segmentIndex, isLive]);

  const triggerGlitch = () => {
    Animated.sequence([
      Animated.timing(glitchOpacity, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(glitchOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const advanceSegment = () => {
    triggerGlitch();

    Animated.timing(headlineFade, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setSegmentIndex(prev => prev + 1);
      setHeadlineKey(prev => prev + 1);

      Animated.timing(headlineFade, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleComplete = async () => {
    // Mark as seen for future skip
    try {
      await AsyncStorage.setItem(STORAGE_KEY, 'true');
    } catch (e) {
      // Ignore storage errors
    }

    onComplete();
  };

  const handleSkip = () => {
    handleComplete();
  };

  const getSegmentTypeColor = (type: IntroBroadcastSegment['type']) => {
    switch (type) {
      case 'BREAKING': return Theme.colors.accentDeny;
      case 'ALERT': return Theme.colors.accentWarn;
      case 'LOCAL': return Theme.colors.accentWarn;
      case 'SYSTEM': return Theme.colors.textSecondary;
      default: return Theme.colors.textPrimary;
    }
  };

  const getSegmentTypeLabel = (type: IntroBroadcastSegment['type']) => {
    switch (type) {
      case 'BREAKING': return '◆ PRIORITY ◆';
      case 'ALERT': return '! ALERT !';
      case 'LOCAL': return '◇ BULLETIN ◇';
      case 'SYSTEM': return '▣ SYSTEM ▣';
      default: return '○ UPDATE ○';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.networkLogo}>▌▌ NETWORK AMBER NEWS ▐▐</Text>
        <View style={styles.liveIndicator}>
          <View style={[styles.liveDot, isLive && styles.liveDotActive]} />
          <Text style={styles.liveText}>{isLive ? 'LIVE' : '...'}</Text>
        </View>
      </View>

      {/* Main video frame */}
      <View style={styles.videoFrame}>
        <View style={styles.videoWrapper}>
          {/* Static startup overlay */}
          <Animated.View style={[StyleSheet.absoluteFill, { opacity: staticFade, zIndex: 20 }]}>
            <Image
              source={changeChannel}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
            />
            <View style={[styles.gridOverlay, { backgroundColor: 'rgba(0,0,0,0.4)' }]} />
          </Animated.View>

          {/* Glitch overlay on segment change */}
          <Animated.View style={[StyleSheet.absoluteFill, { opacity: glitchOpacity, zIndex: 25 }]}>
            <Image
              source={staticOverlay}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
            />
          </Animated.View>

          {/* News anchor image */}
          <Animated.View style={[StyleSheet.absoluteFill, { opacity: fadeIn, zIndex: 5 }]}>
            <Image
              source={newsAnchor}
              style={styles.anchorImage}
              contentFit="cover"
            />

            {/* Persistent static noise overlay */}
            <Image
              source={staticOverlay}
              style={styles.staticOverlay}
              contentFit="cover"
            />

            {/* Grid overlay for surveillance aesthetic */}
            <View style={styles.gridOverlay}>
              {[...Array(6)].map((_, i) => (
                <View key={`v-${i}`} style={[styles.gridLine, styles.verticalLine, { left: `${(i + 1) * 16.66}%` }]} />
              ))}
              {[...Array(4)].map((_, i) => (
                <View key={`h-${i}`} style={[styles.gridLine, styles.horizontalLine, { top: `${(i + 1) * 25}%` }]} />
              ))}
            </View>

            {/* Corner brackets */}
            <View style={styles.cornerBrackets}>
              <View style={[styles.bracket, styles.topLeftBracket]} />
              <View style={[styles.bracket, styles.topRightBracket]} />
              <View style={[styles.bracket, styles.bottomLeftBracket]} />
              <View style={[styles.bracket, styles.bottomRightBracket]} />
            </View>
          </Animated.View>

          {/* Headline overlay */}
          <Animated.View style={[styles.headlineOverlay, { opacity: headlineFade }]}>
            <View style={styles.headlineBox}>
              <View style={[styles.segmentTypeTag, { backgroundColor: getSegmentTypeColor(currentSegment.type) }]}>
                <Text style={styles.segmentTypeText}>
                  {getSegmentTypeLabel(currentSegment.type)}
                </Text>
              </View>
              <View style={styles.headlineContent}>
                <TypewriterText
                  key={`headline-${headlineKey}`}
                  text={currentSegment.headline}
                  style={styles.headlineText}
                  active={isLive}
                  delay={100}
                />
                <Text style={styles.subtextLine} numberOfLines={3}>
                  {currentSegment.subtext}
                </Text>
              </View>
            </View>
          </Animated.View>
        </View>
      </View>

      {/* Scrolling ticker */}
      <View style={styles.tickerContainer}>
        <Animated.View
          style={[
            styles.tickerContent,
            { transform: [{ translateX: tickerPosition }] }
          ]}
        >
          {[...INTRO_TICKER_ITEMS, ...INTRO_TICKER_ITEMS].map((item, i) => (
            <Text key={i} style={styles.tickerItem}>
              ▶▶ {item}
            </Text>
          ))}
        </Animated.View>
      </View>

      {/* Progress indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.progressDots}>
          {INTRO_NEWS_SEGMENTS.map((_, i) => (
            <View
              key={i}
              style={[
                styles.progressDot,
                i === segmentIndex && styles.progressDotActive,
                i < segmentIndex && styles.progressDotComplete
              ]}
            />
          ))}
        </View>
        <Text style={styles.progressText}>
          BRIEFING {segmentIndex + 1} / {INTRO_NEWS_SEGMENTS.length}
        </Text>
      </View>

      {/* Skip button (only for returning players) */}
      {showSkip && canSkip && (
        <View style={styles.skipContainer}>
          <Pressable
            onPress={handleSkip}
            style={({ pressed }) => [
              styles.skipButton,
              pressed && styles.skipButtonPressed
            ]}
          >
            <Text style={styles.skipButtonText}>[ SKIP BRIEFING ]</Text>
          </Pressable>
        </View>
      )}

      {/* Broadcast label */}
      <View style={styles.broadcastLabel}>
        <Text style={styles.broadcastText}>SECTOR TRANSIT AUTHORITY BROADCAST</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: Theme.colors.bgDark,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  networkLogo: {
    color: Theme.colors.accentWarn,
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Theme.colors.textDim,
  },
  liveDotActive: {
    backgroundColor: Theme.colors.accentDeny,
  },
  liveText: {
    color: Theme.colors.textPrimary,
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    fontWeight: '700',
  },
  videoFrame: {
    flex: 1,
    padding: 8,
    backgroundColor: Theme.colors.bgDark,
  },
  videoWrapper: {
    flex: 1,
    position: 'relative',
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Theme.colors.border,
    backgroundColor: '#000',
  },
  anchorImage: {
    width: '100%',
    height: '100%',
  },
  staticOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.12,
    zIndex: 10,
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.15,
    zIndex: 12,
  },
  gridLine: {
    position: 'absolute',
    backgroundColor: Theme.colors.grid,
  },
  verticalLine: {
    width: 1,
    height: '100%',
  },
  horizontalLine: {
    width: '100%',
    height: 1,
  },
  cornerBrackets: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 15,
  },
  bracket: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: Theme.colors.accentWarn,
    borderWidth: 2,
  },
  topLeftBracket: {
    top: 8,
    left: 8,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRightBracket: {
    top: 8,
    right: 8,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeftBracket: {
    bottom: 80,
    left: 8,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRightBracket: {
    bottom: 80,
    right: 8,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  headlineOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 30,
  },
  headlineBox: {
    backgroundColor: 'rgba(10, 12, 15, 0.92)',
    borderTopWidth: 2,
    borderTopColor: Theme.colors.accentWarn,
  },
  segmentTypeTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  segmentTypeText: {
    color: '#fff',
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  headlineContent: {
    padding: 12,
  },
  headlineText: {
    color: Theme.colors.textPrimary,
    fontFamily: Theme.fonts.mono,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 6,
  },
  subtextLine: {
    color: Theme.colors.textSecondary,
    fontFamily: Theme.fonts.mono,
    fontSize: 11,
    lineHeight: 16,
  },
  tickerContainer: {
    height: 28,
    backgroundColor: Theme.colors.bgDark,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.accentWarn,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  tickerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tickerItem: {
    color: Theme.colors.textPrimary,
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    marginRight: 40,
    letterSpacing: 1,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  progressDots: {
    flexDirection: 'row',
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Theme.colors.textDim,
    opacity: 0.3,
  },
  progressDotActive: {
    backgroundColor: Theme.colors.accentWarn,
    opacity: 1,
  },
  progressDotComplete: {
    backgroundColor: Theme.colors.accentApprove,
    opacity: 0.6,
  },
  progressText: {
    color: Theme.colors.textDim,
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    letterSpacing: 1,
  },
  skipContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  skipButton: {
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Theme.colors.textDim,
    alignItems: 'center',
  },
  skipButtonPressed: {
    backgroundColor: 'rgba(74, 106, 122, 0.2)',
  },
  skipButtonText: {
    color: Theme.colors.textDim,
    fontFamily: Theme.fonts.mono,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  broadcastLabel: {
    alignItems: 'center',
    paddingBottom: 16,
  },
  broadcastText: {
    color: Theme.colors.textDim,
    fontFamily: Theme.fonts.mono,
    fontSize: 9,
    letterSpacing: 2,
    opacity: 0.6,
  },
});

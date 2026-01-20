import React, { useEffect, useRef, useState, useMemo } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { useAudioPlayer } from 'expo-audio';
import { Theme } from '../../constants/theme';
import { ShiftDecision } from './ShiftTransition';
import { TypewriterText } from '../ui/ScanData';

// News audio files - organized by shift and scenario
const NEWS_AUDIO = {
  shift1: {
    routine: require('../../assets/news/anchor-narration/shift1-news-2.mp3'),
    maraVolkovDenied: require('../../assets/news/anchor-narration/shift1-news-mara-denied.mp3'),
  },
};

// News story types
interface NewsStory {
  type: 'BREAKING' | 'LOCAL' | 'SYSTEM' | 'FILLER';
  headline: string;
  subtext: string;
  subjectRef?: string;
  severity: 'CRITICAL' | 'MODERATE' | 'LOW';
}

// Filler headlines for ambient world-building
const FILLER_HEADLINES: NewsStory[] = [
  { type: 'FILLER', headline: 'SECTOR 3 WEATHER ADVISORY', subtext: 'Atmospheric processors nominal. Light acid precipitation expected through 0400.', severity: 'LOW' },
  { type: 'FILLER', headline: 'TRANSIT UPDATE', subtext: 'Line 7 experiencing minor delays. Commuters advised to use alternate routes.', severity: 'LOW' },
  { type: 'FILLER', headline: 'INFRASTRUCTURE NOTICE', subtext: 'Water rationing reduced to Level 2 in core sectors. Conservation efforts continue.', severity: 'LOW' },
  { type: 'FILLER', headline: 'SECURITY BULLETIN', subtext: 'Outer rim patrols report nominal activity. Citizens reminded to report suspicious behavior.', severity: 'LOW' },
  { type: 'FILLER', headline: 'ECONOMIC REPORT', subtext: 'Sector productivity metrics exceed quarterly projections. Rations stable.', severity: 'LOW' },
  { type: 'FILLER', headline: 'PUBLIC HEALTH NOTICE', subtext: 'Mandatory wellness checks resume next cycle. Compliance is appreciated.', severity: 'LOW' },
  { type: 'SYSTEM', headline: 'SYSTEM MAINTENANCE', subtext: 'Checkpoint calibration scheduled for 0300. Brief processing delays expected.', severity: 'LOW' },
  { type: 'SYSTEM', headline: 'NETWORK STATUS', subtext: 'All transit networks operating within normal parameters.', severity: 'LOW' },
];

// Generate news story from a decision
function generateNewsStory(decision: ShiftDecision): NewsStory | null {
  const { subject, decision: action, incidentReport, personalMessage } = decision;
  
  // DENIED subjects with severe consequences → BREAKING news
  if (action === 'DENY' && incidentReport) {
    const outcome = incidentReport.outcome.toLowerCase();
    
    // Check for death/major consequence keywords
    if (outcome.includes('died') || outcome.includes('deceased') || outcome.includes('dead') || outcome.includes('fatality')) {
      return {
        type: 'BREAKING',
        headline: `FATALITY REPORTED: ${subject.sector || 'UNKNOWN SECTOR'}`,
        subtext: incidentReport.outcome,
        subjectRef: subject.id,
        severity: 'CRITICAL'
      };
    }
    
    if (outcome.includes('hospitalized') || outcome.includes('critical') || outcome.includes('emergency')) {
      return {
        type: 'BREAKING',
        headline: `MEDICAL EMERGENCY: ${subject.sector || 'SECTOR'}`,
        subtext: incidentReport.outcome,
        subjectRef: subject.id,
        severity: 'CRITICAL'
      };
    }
    
    if (outcome.includes('detained') || outcome.includes('arrested') || outcome.includes('investigation')) {
      return {
        type: 'LOCAL',
        headline: `SECURITY INCIDENT: SUBJECT DETAINED`,
        subtext: `${subject.name} - ${incidentReport.summary}`,
        subjectRef: subject.id,
        severity: 'MODERATE'
      };
    }
  }
  
  // Family thread subjects get special treatment
  if (subject.familyThread && action === 'APPROVE' && personalMessage) {
    return {
      type: 'LOCAL',
      headline: `TRANSIT UPDATE: ${subject.familyThread.toUpperCase()} FAMILY`,
      subtext: `Routine transit approved for ${subject.name}. Family reunification in progress.`,
      subjectRef: subject.id,
      severity: 'LOW'
    };
  }
  
  // Skip clean approvals without notable content
  if (action === 'APPROVE' && !subject.familyThread && !subject.linkedSubjects?.length) {
    return null;
  }
  
  // Default for other denials
  if (action === 'DENY' && incidentReport) {
    return {
      type: 'LOCAL',
      headline: `TRANSIT DENIED: ${subject.sector || 'CHECKPOINT'}`,
      subtext: incidentReport.summary,
      subjectRef: subject.id,
      severity: 'MODERATE'
    };
  }
  
  return null;
}

// Scrolling ticker items
const TICKER_ITEMS = [
  'SECTOR 4: CLEAR',
  'SECTOR 7: ADVISORY',
  'SECTOR 2: NOMINAL',
  'REPLICANT DETECTION: ACTIVE',
  'TRANSIT LOAD: 78%',
  'WEATHER: STABLE',
  'CURFEW: 2200-0600',
  'COMPLIANCE RATING: MONITORED',
];

interface NewsBroadcastProps {
  decisions: ShiftDecision[];
  shiftNumber: number;
  onComplete: () => void;
}

export const NewsBroadcast = ({ decisions, shiftNumber, onComplete }: NewsBroadcastProps) => {
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
  const [storyIndex, setStoryIndex] = useState(0);
  const [isLive, setIsLive] = useState(false);
  const [headlineKey, setHeadlineKey] = useState(0);
  const [audioStarted, setAudioStarted] = useState(false);

  // Determine which audio to play based on shift and decisions
  const getAudioSource = () => {
    if (shiftNumber === 1) {
      // Check if MARA VOLKOV (S1-02) was denied
      const maraDecision = decisions.find(d => d.subject.id === 'S1-02');
      if (maraDecision?.decision === 'DENY') {
        return NEWS_AUDIO.shift1.maraVolkovDenied;
      }
      return NEWS_AUDIO.shift1.routine;
    }
    // Default to shift 1 routine for now (we'll add more shifts later)
    return NEWS_AUDIO.shift1.routine;
  };

  // Audio player for news narration
  const newsAudioPlayer = useAudioPlayer(getAudioSource());
  
  // Generate news stories from decisions
  const newsStories = useMemo(() => {
    // Shift 1 specific stories that match the audio narration
    if (shiftNumber === 1) {
      const maraDecision = decisions.find(d => d.subject.id === 'S1-02');
      
      if (maraDecision?.decision === 'DENY') {
        // MARA VOLKOV denied - tragic story matches the audio
        return [
          {
            type: 'BREAKING' as const,
            headline: 'SECTOR 8 RESIDENT PASSES AWAY',
            subtext: 'Elderly woman dies while awaiting family visit. Daughter detained at Checkpoint 9 on outstanding warrant. Transit authority cites standard protocol.',
            subjectRef: 'S1-02',
            severity: 'CRITICAL' as const,
          },
          {
            type: 'LOCAL' as const,
            headline: 'FAMILY APPEALS CHECKPOINT DECISION',
            subtext: "Detained subject filed appeal stating: 'I never got to say goodbye.' Transit authority has declined comment.",
            subjectRef: 'S1-02',
            severity: 'MODERATE' as const,
          },
        ];
      } else {
        // Routine/approved - lighter news matches the audio
        return [
          {
            type: 'SYSTEM' as const,
            headline: 'SECTOR 8-9 TRANSIT NOMINAL',
            subtext: 'Checkpoint 9 reports smooth morning processing. All essential personnel cleared for scheduled operations.',
            severity: 'LOW' as const,
          },
          {
            type: 'FILLER' as const,
            headline: 'SANITATION QUOTAS ON TRACK',
            subtext: 'Sector 8 waste processing reports normal throughput. Recycling targets expected to meet quarterly projections.',
            severity: 'LOW' as const,
          },
        ];
      }
    }
    
    // Default behavior for other shifts
    const stories: NewsStory[] = [];
    
    // Generate stories from decisions
    decisions.forEach(d => {
      const story = generateNewsStory(d);
      if (story) stories.push(story);
    });
    
    // If no significant stories, add some filler
    if (stories.length === 0) {
      stories.push(FILLER_HEADLINES[Math.floor(Math.random() * FILLER_HEADLINES.length)]);
    }
    
    // Pad with filler if we have less than 2 stories
    while (stories.length < 2) {
      const filler = FILLER_HEADLINES[Math.floor(Math.random() * FILLER_HEADLINES.length)];
      if (!stories.find(s => s.headline === filler.headline)) {
        stories.push(filler);
      }
    }
    
    // Sort: BREAKING first, then LOCAL, then FILLER
    return stories.sort((a, b) => {
      const order = { BREAKING: 0, LOCAL: 1, SYSTEM: 2, FILLER: 3 };
      return order[a.type] - order[b.type];
    });
  }, [decisions, shiftNumber]);
  
  const currentStory = newsStories[storyIndex];
  
  // Initial boot-up animation
  useEffect(() => {
    Animated.sequence([
      // Static noise phase
      Animated.delay(300),
      // Fade in anchor
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
      // Fade in headline
      Animated.timing(headlineFade, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsLive(true);
      // Start audio narration when broadcast goes live
      try {
        if (newsAudioPlayer && !audioStarted) {
          newsAudioPlayer.volume = 0.8;
          newsAudioPlayer.seekTo(0);
          newsAudioPlayer.play();
          setAudioStarted(true);
        }
      } catch (e) {
        // Player may not be ready, ignore
      }
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
    
    // Cleanup: stop audio when component unmounts
    return () => {
      try {
        if (newsAudioPlayer && newsAudioPlayer.playing) {
          newsAudioPlayer.pause();
        }
      } catch (e) {
        // Player may already be disposed, ignore
      }
    };
  }, []);
  
  // Glitch effect on story change
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
  
  // Handle next story
  const handleNextStory = () => {
    if (storyIndex < newsStories.length - 1) {
      triggerGlitch();
      
      // Fade out headline
      Animated.timing(headlineFade, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setStoryIndex(storyIndex + 1);
        setHeadlineKey(prev => prev + 1);
        
        // Fade in new headline
        Animated.timing(headlineFade, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
    } else {
      // Stop audio and exit
      try {
        if (newsAudioPlayer && newsAudioPlayer.playing) {
          newsAudioPlayer.pause();
        }
      } catch (e) {
        // Player may be disposed, ignore
      }
      onComplete();
    }
  };
  
  // Handle early exit (back to terminal menu)
  const handleReturnToTerminal = () => {
    try {
      if (newsAudioPlayer && newsAudioPlayer.playing) {
        newsAudioPlayer.pause();
      }
    } catch (e) {
      // Player may be disposed, ignore
    }
    onComplete();
  };
  
  // Replay audio narration
  const handleReplayAudio = () => {
    try {
      if (newsAudioPlayer) {
        newsAudioPlayer.seekTo(0);
        newsAudioPlayer.play();
      }
    } catch (e) {
      // Player may be disposed, ignore
    }
  };
  
  const getStoryTypeColor = (type: NewsStory['type']) => {
    switch (type) {
      case 'BREAKING': return Theme.colors.accentDeny;
      case 'LOCAL': return Theme.colors.accentWarn;
      case 'SYSTEM': return Theme.colors.textSecondary;
      default: return Theme.colors.textPrimary;
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
          
          {/* Glitch overlay on story change */}
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
              <View style={[styles.storyTypeTag, { backgroundColor: getStoryTypeColor(currentStory.type) }]}>
                <Text style={styles.storyTypeText}>
                  {currentStory.type === 'BREAKING' ? '◆ BREAKING ◆' : 
                   currentStory.type === 'LOCAL' ? '◇ LOCAL ◇' : 
                   currentStory.type === 'SYSTEM' ? '▣ SYSTEM ▣' : '○ UPDATE ○'}
                </Text>
              </View>
              <View style={styles.headlineContent}>
                <TypewriterText 
                  key={`headline-${headlineKey}`}
                  text={currentStory.headline}
                  style={styles.headlineText}
                  active={isLive}
                  delay={100}
                />
                <Text style={styles.subtextLine} numberOfLines={2}>
                  {currentStory.subtext}
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
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <Text key={i} style={styles.tickerItem}>
              ▶▶ {item}
            </Text>
          ))}
        </Animated.View>
      </View>
      
      {/* Controls */}
      <View style={styles.controls}>
        <View style={styles.leftControls}>
          <Text style={styles.storyCounter}>
            {storyIndex + 1} / {newsStories.length}
          </Text>
          
          {/* Replay audio button */}
          <Pressable 
            onPress={handleReplayAudio}
            style={({ pressed }) => [
              styles.replayButton,
              pressed && styles.replayButtonPressed
            ]}
          >
            <Text style={styles.replayIcon}>↻</Text>
            <Text style={styles.replayText}>REPLAY</Text>
          </Pressable>
        </View>
        
        <View style={styles.rightControls}>
          {/* Next story button */}
          {storyIndex < newsStories.length - 1 && (
            <Pressable 
              onPress={handleNextStory}
              style={({ pressed }) => [
                styles.nextButton,
                pressed && styles.nextButtonPressed
              ]}
            >
              <Text style={styles.nextButtonText}>[ NEXT STORY ]</Text>
            </Pressable>
          )}
        </View>
      </View>
      
      {/* Return to Terminal button - full width */}
      <View style={styles.returnContainer}>
        <Pressable 
          onPress={handleReturnToTerminal}
          style={({ pressed }) => [
            styles.returnButton,
            pressed && styles.returnButtonPressed
          ]}
        >
          <Text style={styles.returnButtonText}>[ RETURN TO TERMINAL ]</Text>
        </Pressable>
      </View>
      
      {/* Shift indicator */}
      <View style={styles.shiftIndicator}>
        <Text style={styles.shiftText}>SHIFT {shiftNumber} REPORT</Text>
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
  storyTypeTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  storyTypeText: {
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
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  leftControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  rightControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  storyCounter: {
    color: Theme.colors.textDim,
    fontFamily: Theme.fonts.mono,
    fontSize: 11,
  },
  replayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Theme.colors.accentApprove,
    borderRadius: 2,
  },
  replayButtonPressed: {
    backgroundColor: 'rgba(82, 183, 136, 0.2)',
  },
  replayIcon: {
    color: Theme.colors.accentApprove,
    fontSize: 12,
    fontWeight: '700',
  },
  replayText: {
    color: Theme.colors.accentApprove,
    fontFamily: Theme.fonts.mono,
    fontSize: 9,
    fontWeight: '700',
  },
  returnContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  returnButton: {
    width: '100%',
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Theme.colors.textSecondary,
    alignItems: 'center',
  },
  returnButtonPressed: {
    backgroundColor: 'rgba(74, 106, 122, 0.2)',
  },
  returnButtonText: {
    color: Theme.colors.textSecondary,
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  nextButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Theme.colors.accentWarn,
  },
  nextButtonPressed: {
    backgroundColor: 'rgba(201, 162, 39, 0.2)',
  },
  nextButtonText: {
    color: Theme.colors.accentWarn,
    fontFamily: Theme.fonts.mono,
    fontSize: 11,
    fontWeight: '700',
  },
  shiftIndicator: {
    position: 'absolute',
    top: 12,
    right: 80,
  },
  shiftText: {
    color: Theme.colors.textDim,
    fontFamily: Theme.fonts.mono,
    fontSize: 9,
    letterSpacing: 1,
  },
});

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Pressable, ScrollView } from 'react-native';
import { Theme } from '../../constants/theme';
import { ShiftDecision } from './ShiftTransition';
import { NewsReport } from '../../data/subjects';

interface ShiftNewsReportProps {
  shiftDecisions: ShiftDecision[];
  onComplete: () => void;
}

// Get the news report for a decision
const getNewsReport = (decision: ShiftDecision): NewsReport | undefined => {
  const outcome = decision.subject.outcomes[decision.decision];
  return outcome?.newsReport;
};

// Get tone color for news headline
const getToneColor = (tone: NewsReport['tone']): string => {
  switch (tone) {
    case 'ALARMING':
      return Theme.colors.accentDeny;
    case 'POSITIVE':
      return Theme.colors.accentApprove;
    case 'OMINOUS':
      return Theme.colors.accentWarn;
    case 'TRAGIC':
      return '#9b59b6'; // Purple for tragic
    case 'NEUTRAL':
    default:
      return Theme.colors.textPrimary;
  }
};

export const ShiftNewsReport = ({ shiftDecisions, onComplete }: ShiftNewsReportProps) => {
  // Filter to only decisions that have news reports
  const newsItems = shiftDecisions
    .map(d => ({ decision: d, news: getNewsReport(d) }))
    .filter((item): item is { decision: ShiftDecision; news: NewsReport } => item.news !== undefined);

  const [currentIndex, setCurrentIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const tickerAnim = useRef(new Animated.Value(0)).current;

  // Animate in current news item
  useEffect(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(20);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentIndex]);

  // Animate ticker
  useEffect(() => {
    const ticker = Animated.loop(
      Animated.timing(tickerAnim, {
        toValue: 1,
        duration: 15000,
        useNativeDriver: true,
      })
    );
    ticker.start();
    return () => ticker.stop();
  }, []);

  // If no news items, skip to complete
  useEffect(() => {
    if (newsItems.length === 0) {
      onComplete();
    }
  }, [newsItems.length, onComplete]);

  if (newsItems.length === 0) {
    return null;
  }

  const currentItem = newsItems[currentIndex];
  const isLast = currentIndex >= newsItems.length - 1;

  const handleNext = () => {
    if (isLast) {
      onComplete();
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const toneColor = getToneColor(currentItem.news.tone);

  return (
    <View style={styles.container}>
      {/* Broadcast Header */}
      <View style={styles.broadcastHeader}>
        <View style={styles.liveIndicator}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
        <Text style={styles.networkName}>{currentItem.news.source}</Text>
        <Text style={styles.reportCounter}>
          {currentIndex + 1} / {newsItems.length}
        </Text>
      </View>

      {/* News Content */}
      <Animated.View
        style={[
          styles.newsContent,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        {/* Headline */}
        <View style={[styles.headlineBar, { borderLeftColor: toneColor }]}>
          <Text style={[styles.headline, { color: toneColor }]}>
            {currentItem.news.headline}
          </Text>
          {currentItem.news.subheadline && (
            <Text style={styles.subheadline}>
              {currentItem.news.subheadline}
            </Text>
          )}
        </View>

        {/* Body */}
        <ScrollView style={styles.bodyScroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.bodyText}>
            {currentItem.news.body}
          </Text>
        </ScrollView>

        {/* Subject Reference */}
        <View style={styles.subjectRef}>
          <Text style={styles.subjectRefLabel}>RELATED TO:</Text>
          <Text style={styles.subjectRefName}>
            {currentItem.decision.subject.name} ({currentItem.decision.subject.id})
          </Text>
          <Text style={[
            styles.decisionBadge,
            currentItem.decision.decision === 'APPROVE'
              ? styles.approvedBadge
              : styles.deniedBadge
          ]}>
            {currentItem.decision.decision === 'APPROVE' ? 'APPROVED' : 'DENIED'}
          </Text>
        </View>
      </Animated.View>

      {/* Bottom Ticker */}
      <View style={styles.tickerContainer}>
        <Animated.View
          style={[
            styles.tickerContent,
            {
              transform: [{
                translateX: tickerAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [300, -600],
                })
              }]
            }
          ]}
        >
          <Text style={styles.tickerText}>
            AMBER SECURITY NETWORK /// SECTOR UPDATES /// PROCESSING COMPLETE ///
            SHIFT REPORT AVAILABLE /// AMBER SECURITY NETWORK ///
          </Text>
        </Animated.View>
      </View>

      {/* Continue Button */}
      <Pressable
        onPress={handleNext}
        style={({ pressed }) => [
          styles.continueButton,
          pressed && styles.continueButtonPressed,
        ]}
      >
        <Text style={styles.continueText}>
          {isLast ? '[ END BROADCAST ]' : '[ NEXT REPORT ]'}
        </Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: 'rgba(10, 12, 15, 0.98)',
  },
  broadcastHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Theme.colors.accentDeny,
    marginRight: 6,
  },
  liveText: {
    color: Theme.colors.accentDeny,
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  networkName: {
    color: Theme.colors.textPrimary,
    fontFamily: Theme.fonts.mono,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  reportCounter: {
    color: Theme.colors.textDim,
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
  },
  newsContent: {
    flex: 1,
    padding: 16,
  },
  headlineBar: {
    borderLeftWidth: 4,
    paddingLeft: 12,
    marginBottom: 20,
  },
  headline: {
    fontFamily: Theme.fonts.mono,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  subheadline: {
    color: Theme.colors.textSecondary,
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
    lineHeight: 18,
  },
  bodyScroll: {
    flex: 1,
    marginBottom: 16,
  },
  bodyText: {
    color: Theme.colors.textPrimary,
    fontFamily: Theme.fonts.mono,
    fontSize: 13,
    lineHeight: 22,
    letterSpacing: 0.3,
  },
  subjectRef: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
    gap: 8,
  },
  subjectRefLabel: {
    color: Theme.colors.textDim,
    fontFamily: Theme.fonts.mono,
    fontSize: 9,
    letterSpacing: 1,
  },
  subjectRefName: {
    color: Theme.colors.textSecondary,
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    flex: 1,
  },
  decisionBadge: {
    fontFamily: Theme.fonts.mono,
    fontSize: 9,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 3,
    letterSpacing: 1,
  },
  approvedBadge: {
    color: Theme.colors.accentApprove,
    backgroundColor: 'rgba(74, 138, 90, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(74, 138, 90, 0.4)',
  },
  deniedBadge: {
    color: Theme.colors.accentDeny,
    backgroundColor: 'rgba(212, 83, 74, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(212, 83, 74, 0.4)',
  },
  tickerContainer: {
    height: 28,
    backgroundColor: 'rgba(26, 42, 58, 0.5)',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  tickerContent: {
    flexDirection: 'row',
    position: 'absolute',
  },
  tickerText: {
    color: Theme.colors.accentWarn,
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    letterSpacing: 1,
  },
  continueButton: {
    paddingVertical: 18,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
    alignItems: 'center',
    backgroundColor: 'rgba(127, 184, 216, 0.08)',
  },
  continueButtonPressed: {
    backgroundColor: 'rgba(127, 184, 216, 0.2)',
  },
  continueText: {
    color: Theme.colors.textPrimary,
    fontFamily: Theme.fonts.mono,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
  },
});

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Pressable, Image } from 'react-native';
import { Theme } from '../../constants/theme';
import { ShiftDecision } from './ShiftTransition';
import { NewsReport } from '../../data/subjects';
import { ProceduralPortrait } from '../ui/ProceduralPortrait';

interface ShiftNewsReportProps {
  shiftDecisions: ShiftDecision[];
  onComplete: () => void;
}

const getNewsReport = (decision: ShiftDecision): NewsReport | undefined => {
  const outcome = decision.subject.outcomes[decision.decision];
  return outcome?.newsReport;
};

export const ShiftNewsReport = ({ shiftDecisions, onComplete }: ShiftNewsReportProps) => {
  const newsItems = shiftDecisions
    .map(d => ({ decision: d, news: getNewsReport(d) }))
    .filter((item): item is { decision: ShiftDecision; news: NewsReport } => item.news !== undefined);

  const [currentIndex, setCurrentIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [currentIndex]);

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
  const subject = currentItem.decision.subject;
  const decision = currentItem.decision.decision;
  const reportType = currentItem.news.type || 'NEWS';
  const shouldUseProceduralPortrait = subject.useProceduralPortrait || (!subject.profilePic && !!subject.id);

  const handleNext = () => {
    if (isLast) {
      onComplete();
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const getTypeLabel = () => {
    switch (reportType) {
      case 'MEMO': return 'AMBER INTERNAL';
      case 'INTERCEPT': return 'CLASSIFIED';
      default: return 'BROADCAST';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.typeTag}>
          {reportType === 'NEWS' && <View style={styles.liveDot} />}
          <Text style={styles.typeText}>{getTypeLabel()}</Text>
        </View>
        <Text style={styles.counter}>{currentIndex + 1} / {newsItems.length}</Text>
      </View>

      {/* Content */}
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Subject Passport Photo (fallback to news image) */}
        {(shouldUseProceduralPortrait || subject.profilePic || currentItem.news.image) && (
          <View style={styles.imageContainer}>
            {shouldUseProceduralPortrait ? (
              <ProceduralPortrait
                subjectId={subject.id}
                subjectType={subject.subjectType}
                sex={subject.sex || 'M'}
                isAnomaly={subject.subjectType === 'REPLICANT'}
                portraitPreset="dossier"
                style={styles.image}
              />
            ) : (
              <Image 
                source={subject.profilePic || currentItem.news.image} 
                style={styles.image} 
                resizeMode="cover" 
              />
            )}
          </View>
        )}

        {/* Subject Dossier */}
        <View style={styles.dossier}>
          <View style={styles.dossierHeader}>
            <Text style={styles.dossierLabel}>SUBJECT FILE</Text>
            <View style={[
              styles.decisionBadge,
              decision === 'APPROVE' ? styles.approvedBadge : styles.deniedBadge
            ]}>
              <Text style={[
                styles.decisionText,
                decision === 'APPROVE' ? styles.approvedText : styles.deniedText
              ]}>
                {decision === 'APPROVE' ? 'APPROVED' : 'DENIED'}
              </Text>
            </View>
          </View>
          
          <View style={styles.dossierRow}>
            <Text style={styles.dossierKey}>NAME</Text>
            <Text style={styles.dossierValue}>{subject.name}</Text>
          </View>
          <View style={styles.dossierRow}>
            <Text style={styles.dossierKey}>ID</Text>
            <Text style={styles.dossierValue}>{subject.id}</Text>
          </View>
          <View style={styles.dossierRow}>
            <Text style={styles.dossierKey}>ORIGIN</Text>
            <Text style={styles.dossierValue}>{subject.originPlanet}</Text>
          </View>
          <View style={styles.dossierRow}>
            <Text style={styles.dossierKey}>STATUS</Text>
            <Text style={styles.dossierValue}>{subject.warrants === 'NONE' ? 'CLEAR' : 'FLAGGED'}</Text>
          </View>
        </View>

        {/* Audio indicator removed */}
      </Animated.View>

      {/* Next Button */}
      <Pressable
        onPress={handleNext}
        style={({ pressed }) => [
          styles.nextButton,
          pressed && styles.nextButtonPressed,
        ]}
      >
        <Text style={styles.nextText}>
          {isLast ? '[ MAIN MENU ]' : '[ NEXT ]'}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  typeTag: {
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
  typeText: {
    color: Theme.colors.textSecondary,
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
  },
  counter: {
    color: Theme.colors.textDim,
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainer: {
    width: '100%',
    maxWidth: 280,
    aspectRatio: 1,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    backgroundColor: '#000',
    marginBottom: 24,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  dossier: {
    width: '100%',
    maxWidth: 280,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    backgroundColor: 'rgba(20, 25, 30, 0.8)',
    padding: 16,
  },
  dossierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  dossierLabel: {
    color: Theme.colors.textSecondary,
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    letterSpacing: 2,
  },
  decisionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  approvedBadge: {
    backgroundColor: 'rgba(74, 138, 90, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(74, 138, 90, 0.4)',
  },
  deniedBadge: {
    backgroundColor: 'rgba(212, 83, 74, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(212, 83, 74, 0.4)',
  },
  decisionText: {
    fontFamily: Theme.fonts.mono,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
  },
  approvedText: {
    color: Theme.colors.accentApprove,
  },
  deniedText: {
    color: Theme.colors.accentDeny,
  },
  dossierRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  dossierKey: {
    color: Theme.colors.textDim,
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    width: 60,
  },
  dossierValue: {
    color: Theme.colors.textPrimary,
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    flex: 1,
  },
  audioIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    gap: 4,
  },
  audioBar: {
    width: 3,
    height: 12,
    backgroundColor: Theme.colors.accentApprove,
    opacity: 0.8,
  },
  audioBar2: {
    height: 18,
  },
  audioBar3: {
    height: 8,
  },
  audioText: {
    color: Theme.colors.textDim,
    fontFamily: Theme.fonts.mono,
    fontSize: 9,
    letterSpacing: 2,
    marginLeft: 8,
  },
  nextButton: {
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
    alignItems: 'center',
    backgroundColor: 'rgba(127, 184, 216, 0.08)',
  },
  nextButtonPressed: {
    backgroundColor: 'rgba(127, 184, 216, 0.2)',
  },
  nextText: {
    color: Theme.colors.textPrimary,
    fontFamily: Theme.fonts.mono,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 2,
  },
});

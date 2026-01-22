import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { HUDBox } from '../ui/HUDBox';
import { Theme } from '../../constants/theme';
import { SubjectData } from '../../data/subjects';
import {
  getSubjectGreeting,
  CommunicationStyle,
  COMMUNICATION_STYLE_DESCRIPTIONS,
} from '../../data/subjectGreetings';

interface SubjectGreetingModalProps {
  visible: boolean;
  subject: SubjectData;
  onComplete: (establishedBPM: number) => void;
  onProceedToCredentials: () => void;
}

// Typewriter effect speed based on communication style
const TYPING_SPEEDS: Record<CommunicationStyle, number> = {
  FLUENT: 30,      // Fast, confident
  BROKEN: 80,      // Slow, hesitant
  GIBBERISH: 40,   // Erratic
  SILENT: 0,       // No typing
  AGITATED: 20,    // Very fast, rushed
  FORMAL: 50,      // Measured, deliberate
};

// Visual indicators for communication styles
const STYLE_INDICATORS: Record<CommunicationStyle, { color: string; label: string }> = {
  FLUENT: { color: Theme.colors.accentApprove, label: 'CLEAR COMMUNICATION' },
  BROKEN: { color: Theme.colors.accentWarn, label: 'FRAGMENTED SPEECH' },
  GIBBERISH: { color: Theme.colors.accentDeny, label: 'INCOMPREHENSIBLE' },
  SILENT: { color: Theme.colors.textDim, label: 'NON-RESPONSIVE' },
  AGITATED: { color: Theme.colors.accentWarn, label: 'ELEVATED STRESS' },
  FORMAL: { color: Theme.colors.textPrimary, label: 'FORMAL REGISTER' },
};

export const SubjectGreetingModal = ({
  visible,
  subject,
  onComplete,
  onProceedToCredentials,
}: SubjectGreetingModalProps) => {
  const [displayedText, setDisplayedText] = useState('');
  const [typingComplete, setTypingComplete] = useState(false);
  const [showProceed, setShowProceed] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const textIndexRef = useRef(0);

  const greetingData = getSubjectGreeting(subject.id, subject);
  const style = subject.communicationStyle || greetingData?.communicationStyle || 'FLUENT';
  const greeting = subject.greetingText || greetingData?.greeting || subject.dialogue || 'Hello.';
  const styleIndicator = STYLE_INDICATORS[style];
  const typingSpeed = TYPING_SPEEDS[style];

  // Base BPM (72) + greeting modifier + subject bpmTells baseline
  const baseBPM = 72;
  const greetingModifier = greetingData?.bpmBaselineModifier || 0;
  const tellsModifier = subject.bpmTells?.baseElevation || 0;
  const establishedBPM = baseBPM + greetingModifier + Math.floor(tellsModifier * 0.5);

  useEffect(() => {
    if (visible) {
      setDisplayedText('');
      setTypingComplete(false);
      setShowProceed(false);
      textIndexRef.current = 0;

      // Fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Handle silent subjects
      if (style === 'SILENT') {
        setDisplayedText('[SUBJECT REMAINS SILENT]');
        setTypingComplete(true);
        setTimeout(() => setShowProceed(true), 1500);
        return;
      }

      // Start typewriter effect
      if (typingSpeed > 0) {
        const typeNextChar = () => {
          if (textIndexRef.current < greeting.length) {
            setDisplayedText(greeting.slice(0, textIndexRef.current + 1));
            textIndexRef.current += 1;

            // Add random pauses for BROKEN style
            let delay = typingSpeed;
            if (style === 'BROKEN' && greeting[textIndexRef.current] === '.') {
              delay = typingSpeed * 4;
            }
            if (style === 'AGITATED') {
              delay = typingSpeed * (0.5 + Math.random() * 0.5);
            }

            setTimeout(typeNextChar, delay);
          } else {
            setTypingComplete(true);
            setTimeout(() => setShowProceed(true), 800);
          }
        };
        setTimeout(typeNextChar, 500);
      } else {
        setDisplayedText(greeting);
        setTypingComplete(true);
        setTimeout(() => setShowProceed(true), 1500);
      }
    }

    return () => {
      textIndexRef.current = greeting.length; // Stop typing on unmount
    };
  }, [visible, subject.id]);

  const handleProceed = () => {
    onComplete(establishedBPM);
    onProceedToCredentials();
  };

  const handleSkip = () => {
    setDisplayedText(greeting);
    setTypingComplete(true);
    setShowProceed(true);
  };

  if (!visible) return null;

  return (
    <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
      <HUDBox hudStage="full" style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>SUBJECT ENTRY - GREETING ANALYSIS</Text>
          <View style={[styles.styleIndicator, { backgroundColor: styleIndicator.color + '20' }]}>
            <Text style={[styles.styleLabel, { color: styleIndicator.color }]}>
              {styleIndicator.label}
            </Text>
          </View>
        </View>

        {/* Subject Info */}
        <View style={styles.subjectInfo}>
          <Text style={styles.subjectName}>{subject.name}</Text>
          <Text style={styles.subjectId}>ID: {subject.id} | ORIGIN: {subject.originPlanet}</Text>
        </View>

        {/* Greeting Display */}
        <View style={styles.greetingContainer}>
          <Text style={styles.greetingLabel}>SUBJECT GREETING:</Text>
          <View style={styles.greetingBox}>
            <Text style={[
              styles.greetingText,
              style === 'AGITATED' && styles.agitatedText,
              style === 'BROKEN' && styles.brokenText,
              style === 'GIBBERISH' && styles.gibberishText,
              style === 'SILENT' && styles.silentText,
            ]}>
              "{displayedText}"
              {!typingComplete && <Text style={styles.cursor}>|</Text>}
            </Text>
          </View>
        </View>

        {/* BPM Baseline */}
        <View style={styles.bpmContainer}>
          <Text style={styles.bpmLabel}>ESTABLISHING BPM BASELINE:</Text>
          <View style={styles.bpmDisplay}>
            <Text style={[
              styles.bpmValue,
              establishedBPM > 85 && styles.bpmElevated,
              establishedBPM > 95 && styles.bpmHigh,
            ]}>
              {typingComplete ? establishedBPM : '--'}
            </Text>
            <Text style={styles.bpmUnit}>BPM</Text>
          </View>
          {typingComplete && establishedBPM > 85 && (
            <Text style={styles.bpmWarning}>
              {establishedBPM > 95 ? 'SIGNIFICANTLY ELEVATED' : 'SLIGHTLY ELEVATED'}
            </Text>
          )}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          {!typingComplete && (
            <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
              <Text style={styles.skipButtonText}>[ SKIP ]</Text>
            </TouchableOpacity>
          )}
          {showProceed && (
            <TouchableOpacity style={styles.proceedButton} onPress={handleProceed}>
              <Text style={styles.proceedButtonText}>[ REQUEST CREDENTIALS ]</Text>
            </TouchableOpacity>
          )}
        </View>
      </HUDBox>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 12, 15, 0.95)',
    zIndex: 2000,
    padding: 20,
    justifyContent: 'center',
  },
  container: {
    padding: 20,
    backgroundColor: Theme.colors.bgPanel,
    minHeight: 400,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  headerTitle: {
    color: Theme.colors.textPrimary,
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
  },
  styleIndicator: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  styleLabel: {
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
  },
  subjectInfo: {
    marginBottom: 20,
  },
  subjectName: {
    color: Theme.colors.textPrimary,
    fontFamily: Theme.fonts.mono,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 4,
  },
  subjectId: {
    color: Theme.colors.textSecondary,
    fontFamily: Theme.fonts.mono,
    fontSize: 11,
    letterSpacing: 1,
  },
  greetingContainer: {
    marginBottom: 24,
  },
  greetingLabel: {
    color: Theme.colors.textSecondary,
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 8,
  },
  greetingBox: {
    backgroundColor: 'rgba(26, 42, 58, 0.3)',
    borderWidth: 1,
    borderColor: Theme.colors.border,
    padding: 16,
    minHeight: 100,
  },
  greetingText: {
    color: Theme.colors.textPrimary,
    fontFamily: Theme.fonts.mono,
    fontSize: 14,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  agitatedText: {
    letterSpacing: 0,
  },
  brokenText: {
    letterSpacing: 1,
    opacity: 0.9,
  },
  gibberishText: {
    color: Theme.colors.accentDeny,
  },
  silentText: {
    color: Theme.colors.textDim,
    fontStyle: 'normal',
  },
  cursor: {
    color: Theme.colors.accentApprove,
    fontWeight: '400',
  },
  bpmContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  bpmLabel: {
    color: Theme.colors.textSecondary,
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 8,
  },
  bpmDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  bpmValue: {
    color: Theme.colors.accentApprove,
    fontFamily: Theme.fonts.mono,
    fontSize: 32,
    fontWeight: '700',
  },
  bpmElevated: {
    color: Theme.colors.accentWarn,
  },
  bpmHigh: {
    color: Theme.colors.accentDeny,
  },
  bpmUnit: {
    color: Theme.colors.textSecondary,
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
  },
  bpmWarning: {
    color: Theme.colors.accentWarn,
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    letterSpacing: 1,
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  skipButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(26, 42, 58, 0.5)',
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  skipButtonText: {
    color: Theme.colors.textSecondary,
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
  },
  proceedButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(74, 138, 90, 0.2)',
    borderWidth: 1,
    borderColor: Theme.colors.accentApprove,
  },
  proceedButtonText: {
    color: Theme.colors.accentApprove,
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
});

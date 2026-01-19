import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Pressable, Image, ScrollView } from 'react-native';
import { Theme } from '../constants/theme';
import { ShiftData } from '../constants/shifts';
import { TypewriterText } from './ScanData';
import { SubjectData, IncidentReport, PersonalMessage } from '../data/subjects';
import { NewsBroadcast } from './NewsBroadcast';

// Decision record for a single subject
export interface ShiftDecision {
  subject: SubjectData;
  decision: 'APPROVE' | 'DENY';
  incidentReport?: IncidentReport;
  personalMessage?: PersonalMessage;
}

interface ShiftTransitionProps {
  previousShift: ShiftData;
  nextShift: ShiftData;
  approvedCount: number;
  deniedCount: number;
  totalAccuracy: number;
  messageHistory: string[];
  shiftDecisions: ShiftDecision[]; // NEW: Decisions made this shift
  onContinue: () => void;
}

export const ShiftTransition = ({ 
  previousShift, 
  nextShift, 
  approvedCount, 
  deniedCount, 
  totalAccuracy,
  messageHistory,
  shiftDecisions,
  onContinue 
}: ShiftTransitionProps) => {
  const [phase, setPhase] = useState<'summary' | 'reports' | 'menu' | 'profile' | 'briefing'>('summary');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const briefingOpacity = useRef(new Animated.Value(0)).current;

  // Get reports to display (only decisions with actual reports)
  const reportsToShow = shiftDecisions.filter(d => 
    (d.decision === 'DENY' && d.incidentReport) || 
    (d.decision === 'APPROVE' && d.personalMessage)
  );

  // Check for new messages (wife/narrative messages)
  const hasNewMessages = messageHistory.length > 0;

  useEffect(() => {
    // Fade in the overlay - NO AUTO ADVANCE
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleSummaryTap = () => {
    setPhase('menu');
  };

  const handleStartBriefing = () => {
    setPhase('briefing');
    Animated.timing(briefingOpacity, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  };

  const renderContent = () => {
    if (phase === 'summary') {
      return (
        <View style={styles.container}>
          <View style={styles.summaryBox}>
            <Text style={styles.borderTop}>┌─────────────────────────────────────┐</Text>
            <View style={styles.summaryContent}>
              <Text style={styles.shiftCompleteText}>SHIFT COMPLETE</Text>
              <View style={styles.statsRow}>
                <Text style={styles.statLabel}>STATION:</Text>
                <Text style={styles.statValue}>{previousShift.stationName} - {previousShift.chapter.toUpperCase()}</Text>
              </View>
              <View style={styles.statsRow}>
                <Text style={styles.statLabel}>PROCESSED:</Text>
                <Text style={styles.statValue}>{approvedCount + deniedCount} SUBJECTS</Text>
              </View>
              <View style={styles.statsRow}>
                <Text style={styles.statLabel}>APPROVED:</Text>
                <Text style={[styles.statValue, styles.approvedText]}>{approvedCount}</Text>
                <Text style={styles.statDivider}>|</Text>
                <Text style={styles.statLabel}>DENIED:</Text>
                <Text style={[styles.statValue, styles.deniedText]}>{deniedCount}</Text>
              </View>
            </View>
            <Text style={styles.borderBottom}>└─────────────────────────────────────┘</Text>
          </View>

          <View style={styles.timeJumpContainer}>
            <Text style={styles.timeJumpLabel}>NEXT REGION:</Text>
            <View style={styles.timeJumpRow}>
              <Text style={styles.timeNew}>{nextShift.chapter.toUpperCase()}</Text>
            </View>
            <View style={[styles.timeJumpRow, { marginTop: 10 }]}>
              <Text style={styles.timeOld}>{previousShift.timeBlock}</Text>
              <Text style={styles.timeArrow}>→</Text>
              <Text style={styles.timeNew}>{nextShift.timeBlock}</Text>
            </View>
          </View>

          <Pressable 
            onPress={handleSummaryTap}
            style={({ pressed }) => [
              styles.continueButton,
              pressed && styles.continueButtonPressed,
              { marginTop: 30 }
            ]}
          >
            <Text style={styles.continueText}>[ CONTINUE ]</Text>
          </Pressable>
        </View>
      );
    }

    if (phase === 'menu') {
      return (
        <View style={styles.container}>
          <Text style={styles.menuTitle}>TERMINAL OFFLINE // STANDBY</Text>
          <View style={styles.buttonGrid}>
            {/* News Broadcast Button */}
            <Pressable 
              onPress={() => setPhase('reports')}
              style={({ pressed }) => [
                styles.menuButton,
                pressed && styles.menuButtonPressed
              ]}
            >
              <Text style={styles.menuButtonText}>[ WATCH NEWS BROADCAST ]</Text>
            </Pressable>

            {/* Personal Profile Button with notification badge */}
            <Pressable 
              onPress={() => setPhase('profile')}
              style={({ pressed }) => [
                styles.menuButton,
                pressed && styles.menuButtonPressed
              ]}
            >
              <View style={styles.buttonWithBadge}>
                <Text style={styles.menuButtonText}>[ PERSONAL PROFILE ]</Text>
                {hasNewMessages && (
                  <View style={styles.notificationBadge}>
                    <Text style={styles.notificationText}>{messageHistory.length}</Text>
                  </View>
                )}
              </View>
            </Pressable>

            {/* Continue to next shift */}
            <Pressable 
              onPress={handleStartBriefing}
              style={({ pressed }) => [
                styles.continueButton,
                pressed && styles.continueButtonPressed
              ]}
            >
              <Text style={styles.continueText}>[ RECEIVE NEW DIRECTIVE ]</Text>
            </Pressable>
          </View>
        </View>
      );
    }

    if (phase === 'reports') {
      return (
        <NewsBroadcast 
          decisions={shiftDecisions}
          shiftNumber={previousShift.id}
          onComplete={() => setPhase('menu')}
        />
      );
    }

    if (phase === 'profile') {
      return (
        <View style={styles.profileContainer}>
          <Text style={styles.profileTitle}>OPERATOR LOG // PERSONAL</Text>
          
          <View style={styles.profileContent}>
            <View style={styles.profilePhotoSection}>
              <View style={styles.photoFrame}>
                <Image 
                  source={require('../assets/family-photo.png')} 
                  style={styles.profilePhoto} 
                  resizeMode="cover"
                />
              </View>
              <Text style={styles.ratingLabel}>SECURITY CLEARANCE RATING</Text>
              <Text style={[styles.ratingValue, { color: totalAccuracy > 0.8 ? Theme.colors.accentApprove : totalAccuracy > 0.5 ? Theme.colors.accentWarn : Theme.colors.accentDeny }]}>
                {Math.round(totalAccuracy * 100)}%
              </Text>
            </View>

            <View style={styles.messageLogSection}>
              <Text style={styles.logLabel}>INCOMING MESSAGE HISTORY:</Text>
              <View style={styles.logBox}>
                {messageHistory.length === 0 ? (
                  <Text style={styles.emptyLogText}>NO EXTERNAL COMMUNICATIONS LOGGED.</Text>
                ) : (
                  <View>
                    {messageHistory.slice(-5).map((msg, i) => (
                      <Text key={i} style={styles.logEntry}>- "{msg}"</Text>
                    ))}
                  </View>
                )}
              </View>
            </View>
          </View>

          <Pressable 
            onPress={() => setPhase('menu')}
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.backButtonPressed
            ]}
          >
            <Text style={styles.backButtonText}>[ BACK TO TERMINAL ]</Text>
          </Pressable>
        </View>
      );
    }

    if (phase === 'briefing') {
      return (
        <View style={styles.container}>
          <Animated.View style={[styles.briefingContainer, { opacity: briefingOpacity }]}>
            <Text style={styles.briefingLabel}>NEW DIRECTIVE:</Text>
            <TypewriterText 
              text={nextShift.briefing} 
              active={true} 
              delay={300} 
              style={styles.briefingText}
              showCursor={true}
            />
          </Animated.View>

          <Pressable 
            onPress={onContinue}
            style={({ pressed }) => [
              styles.continueButton,
              pressed && styles.continueButtonPressed,
              { marginTop: 40 }
            ]}
          >
            <Text style={styles.continueText}>[ BEGIN SHIFT {nextShift.id} ]</Text>
          </Pressable>
        </View>
      );
    }
  };

  return (
    <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
      {renderContent()}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 12, 15, 0.98)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 4000,
    padding: 20,
  },
  container: {
    width: '100%',
    alignItems: 'center',
  },
  summaryBox: {
    alignItems: 'center',
    marginBottom: 30,
  },
  borderTop: {
    color: Theme.colors.textSecondary,
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
  },
  borderBottom: {
    color: Theme.colors.textSecondary,
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
  },
  summaryContent: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  shiftCompleteText: {
    color: Theme.colors.accentWarn,
    fontFamily: Theme.fonts.mono,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  statLabel: {
    color: Theme.colors.textSecondary,
    fontFamily: Theme.fonts.mono,
    fontSize: 13,
    marginRight: 8,
  },
  statValue: {
    color: Theme.colors.textPrimary,
    fontFamily: Theme.fonts.mono,
    fontSize: 13,
    fontWeight: '700',
  },
  statDivider: {
    color: Theme.colors.textDim,
    fontFamily: Theme.fonts.mono,
    fontSize: 13,
    marginHorizontal: 12,
  },
  approvedText: {
    color: Theme.colors.accentApprove,
  },
  deniedText: {
    color: Theme.colors.accentDeny,
  },
  timeJumpContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  timeJumpLabel: {
    color: Theme.colors.textDim,
    fontFamily: Theme.fonts.mono,
    fontSize: 11,
    letterSpacing: 2,
    marginBottom: 8,
  },
  timeJumpRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeOld: {
    color: Theme.colors.textSecondary,
    fontFamily: Theme.fonts.mono,
    fontSize: 24,
    fontWeight: '700',
  },
  timeArrow: {
    color: Theme.colors.accentWarn,
    fontFamily: Theme.fonts.mono,
    fontSize: 24,
    marginHorizontal: 20,
  },
  timeNew: {
    color: Theme.colors.textPrimary,
    fontFamily: Theme.fonts.mono,
    fontSize: 24,
    fontWeight: '700',
  },
  menuTitle: {
    color: Theme.colors.textSecondary,
    fontFamily: Theme.fonts.mono,
    fontSize: 14,
    marginBottom: 40,
    letterSpacing: 2,
  },
  buttonGrid: {
    width: '100%',
    alignItems: 'center',
    gap: 20,
  },
  menuButton: {
    width: '80%',
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: Theme.colors.textPrimary,
    alignItems: 'center',
  },
  menuButtonPressed: {
    backgroundColor: 'rgba(127, 184, 216, 0.2)',
  },
  menuButtonText: {
    color: Theme.colors.textPrimary,
    fontFamily: Theme.fonts.mono,
    fontSize: 14,
    fontWeight: '700',
  },
  continueButton: {
    width: '80%',
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: Theme.colors.accentWarn,
    alignItems: 'center',
  },
  continueButtonPressed: {
    backgroundColor: 'rgba(201, 162, 39, 0.2)',
  },
  continueText: {
    color: Theme.colors.accentWarn,
    fontFamily: Theme.fonts.mono,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
  },
  profileContainer: {
    width: '100%',
    flex: 1,
    paddingTop: 40,
    alignItems: 'center',
  },
  profileTitle: {
    color: Theme.colors.textPrimary,
    fontFamily: Theme.fonts.mono,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 30,
    letterSpacing: 2,
  },
  profileContent: {
    flexDirection: 'row',
    width: '100%',
    gap: 20,
    marginBottom: 40,
  },
  profilePhotoSection: {
    width: 120,
    alignItems: 'center',
  },
  photoFrame: {
    width: 100,
    height: 125,
    backgroundColor: '#fff',
    padding: 4,
    marginBottom: 15,
  },
  profilePhoto: {
    width: '100%',
    height: '100%',
    backgroundColor: '#333',
  },
  ratingLabel: {
    color: Theme.colors.textDim,
    fontFamily: Theme.fonts.mono,
    fontSize: 8,
    textAlign: 'center',
    marginBottom: 5,
  },
  ratingValue: {
    fontFamily: Theme.fonts.mono,
    fontSize: 20,
    fontWeight: '700',
  },
  messageLogSection: {
    flex: 1,
  },
  logLabel: {
    color: Theme.colors.textSecondary,
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    marginBottom: 10,
    letterSpacing: 1,
  },
  logBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    padding: 10,
    backgroundColor: 'rgba(26, 42, 58, 0.2)',
  },
  emptyLogText: {
    color: Theme.colors.textDim,
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    fontStyle: 'italic',
  },
  logEntry: {
    color: Theme.colors.textPrimary,
    fontFamily: Theme.fonts.mono,
    fontSize: 11,
    marginBottom: 8,
    lineHeight: 16,
  },
  backButton: {
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: Theme.colors.textSecondary,
  },
  backButtonPressed: {
    backgroundColor: 'rgba(74, 106, 122, 0.2)',
  },
  backButtonText: {
    color: Theme.colors.textSecondary,
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
  },
  briefingContainer: {
    width: '100%',
    paddingHorizontal: 20,
  },
  briefingLabel: {
    color: Theme.colors.accentDeny,
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 16,
    textAlign: 'center',
  },
  briefingText: {
    color: Theme.colors.textPrimary,
    fontFamily: Theme.fonts.mono,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  // Report styles
  reportCounter: {
    color: Theme.colors.textDim,
    fontFamily: Theme.fonts.mono,
    fontSize: 11,
    letterSpacing: 2,
    marginBottom: 20,
  },
  // Personal Message styles
  messageBox: {
    width: '100%',
    alignItems: 'center',
  },
  messageBoxBorder: {
    color: Theme.colors.accentWarn,
    fontFamily: Theme.fonts.mono,
    fontSize: 11,
  },
  messageContent: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    width: '100%',
  },
  messageLabel: {
    color: Theme.colors.accentWarn,
    fontFamily: Theme.fonts.mono,
    fontSize: 11,
    letterSpacing: 2,
    marginBottom: 4,
  },
  messageFrom: {
    color: Theme.colors.textSecondary,
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    fontWeight: '700',
  },
  messageSpacer: {
    height: 16,
  },
  messageText: {
    color: Theme.colors.textPrimary,
    fontFamily: Theme.fonts.mono,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    fontStyle: 'italic',
  },
  // Incident Report styles
  incidentBox: {
    width: '100%',
    alignItems: 'center',
  },
  incidentBoxBorder: {
    color: Theme.colors.accentDeny,
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
  },
  incidentContent: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    width: '100%',
  },
  incidentTitle: {
    color: Theme.colors.accentDeny,
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 12,
    textAlign: 'center',
  },
  incidentRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  incidentLabel: {
    color: Theme.colors.textSecondary,
    fontFamily: Theme.fonts.mono,
    fontSize: 11,
    width: 70,
  },
  incidentValue: {
    color: Theme.colors.textPrimary,
    fontFamily: Theme.fonts.mono,
    fontSize: 11,
    flex: 1,
  },
  incidentSpacer: {
    height: 12,
  },
  incidentSummaryLabel: {
    color: Theme.colors.textSecondary,
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    marginBottom: 4,
  },
  incidentSummary: {
    color: Theme.colors.textPrimary,
    fontFamily: Theme.fonts.mono,
    fontSize: 11,
    lineHeight: 16,
  },
  incidentOutcome: {
    color: Theme.colors.textPrimary,
    fontFamily: Theme.fonts.mono,
    fontSize: 11,
    lineHeight: 16,
    fontStyle: 'italic',
  },
  // Button with badge
  buttonWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadge: {
    backgroundColor: Theme.colors.accentDeny,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    paddingHorizontal: 6,
  },
  notificationText: {
    color: '#fff',
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    fontWeight: '700',
  },
  // Reports list styles
  reportsContainer: {
    flex: 1,
    width: '100%',
    paddingTop: 20,
  },
  reportsTitle: {
    color: Theme.colors.textPrimary,
    fontFamily: Theme.fonts.mono,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 2,
  },
  reportsSubtitle: {
    color: Theme.colors.textDim,
    fontFamily: Theme.fonts.mono,
    fontSize: 11,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 20,
  },
  reportsScrollView: {
    flex: 1,
    width: '100%',
  },
  reportCard: {
    marginBottom: 16,
  },
});

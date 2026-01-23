import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Pressable, Image, ScrollView } from 'react-native';
import { Theme } from '../../constants/theme';
import { ShiftData } from '../../constants/shifts';
import { TypewriterText } from '../ui/ScanData';
import { SubjectData, IncidentReport, PersonalMessage } from '../../data/subjects';
import { ShiftNewsReport } from './ShiftNewsReport';

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
  onContinue,
}: ShiftTransitionProps) => {
  // Start with 'news' phase to show news reports first
  const [phase, setPhase] = useState<'news' | 'summary' | 'reports' | 'menu' | 'profile' | 'briefing'>('news');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const briefingOpacity = useRef(new Animated.Value(0)).current;


  useEffect(() => {
    // Fade in the overlay - NO AUTO ADVANCE
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  // Called when news broadcast ends
  const handleNewsComplete = () => {
    setPhase('profile');
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
    // News phase - show news reports based on decisions
    if (phase === 'news') {
      return (
        <ShiftNewsReport
          shiftDecisions={shiftDecisions}
          onComplete={handleNewsComplete}
        />
      );
    }

    if (phase === 'profile') {
      return (
        <View style={styles.profileContainer}>
          <ScrollView 
            style={styles.profileScrollContainer} 
            contentContainerStyle={styles.profileScrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.profileTitle}>OPERATOR LOG // PERSONAL</Text>

            <View style={styles.profileContent}>
              <View style={styles.profilePhotoSection}>
                <View style={styles.photoFrame}>
                  <Image 
                    source={require('../../assets/family-photo.png')} 
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

          </ScrollView>

          {/* Continue Button - Always visible at bottom */}
          <Pressable 
            onPress={handleStartBriefing}
            style={({ pressed }) => [
              styles.continueButton,
              styles.continueButtonFullWidth,
              pressed && styles.continueButtonPressed
            ]}
          >
            <Text style={styles.continueText}>[ RECEIVE NEW DIRECTIVE ]</Text>
          </Pressable>
        </View>
      );
    }

    if (phase === 'briefing') {
      return (
        <View style={styles.container}>
          <Animated.View style={[styles.briefingContainer, { opacity: briefingOpacity }]}>
            {/* Header */}
            <View style={styles.briefingHeader}>
              <Text style={styles.briefingShiftLabel}>SHIFT {nextShift.id}</Text>
              <Text style={styles.briefingLocation}>{nextShift.stationName}</Text>
            </View>

            {/* Directive Card - Main Focus */}
            <View style={styles.directiveCard}>
              <Text style={styles.directiveCardLabel}>ACTIVE DIRECTIVE</Text>
              <Text style={styles.directiveCardText}>
                {nextShift.directive}
              </Text>
            </View>
          </Animated.View>

          <Pressable
            onPress={onContinue}
            style={({ pressed }) => [
              styles.beginShiftButton,
              pressed && styles.beginShiftButtonPressed,
            ]}
          >
            <Text style={styles.beginShiftText}>BEGIN SHIFT</Text>
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
  continueButtonFullWidth: {
    width: '100%',
    paddingVertical: 18,
    marginTop: 10,
    marginBottom: 20,
    paddingHorizontal: 20,
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
    paddingHorizontal: 16,
  },
  briefingHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  briefingShiftLabel: {
    color: Theme.colors.textDim,
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
    letterSpacing: 2,
    marginBottom: 4,
  },
  briefingLocation: {
    color: Theme.colors.textPrimary,
    fontFamily: Theme.fonts.mono,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 1,
  },
  directiveCard: {
    backgroundColor: 'rgba(212, 83, 74, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(212, 83, 74, 0.4)',
    borderLeftWidth: 4,
    borderLeftColor: Theme.colors.accentDeny,
    padding: 16,
    marginBottom: 16,
  },
  directiveCardLabel: {
    color: Theme.colors.accentDeny,
    fontFamily: Theme.fonts.mono,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 10,
  },
  directiveCardText: {
    color: Theme.colors.textPrimary,
    fontFamily: Theme.fonts.mono,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 24,
    letterSpacing: 0.5,
  },
  beginShiftButton: {
    width: '100%',
    paddingVertical: 18,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderWidth: 2,
    borderColor: Theme.colors.accentWarn,
    alignItems: 'center',
  },
  beginShiftButtonPressed: {
    backgroundColor: 'rgba(212, 175, 55, 0.3)',
  },
  beginShiftText: {
    color: Theme.colors.accentWarn,
    fontFamily: Theme.fonts.mono,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 2,
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
  // Profile scroll container
  profileScrollContainer: {
    width: '100%',
    flex: 1,
  },
  profileScrollContent: {
    paddingTop: 40,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  sectionLabel: {
    color: Theme.colors.textSecondary,
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    letterSpacing: 2,
    marginBottom: 8,
  },
});

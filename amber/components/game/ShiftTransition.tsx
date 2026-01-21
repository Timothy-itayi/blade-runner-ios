import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Pressable, Image, ScrollView } from 'react-native';
import { Theme } from '../../constants/theme';
import { ShiftData } from '../../constants/shifts';
import { TypewriterText } from '../ui/ScanData';
import { SubjectData, IncidentReport, PersonalMessage } from '../../data/subjects';

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
  credits: number;
  familyNeeds: { food: number; medicine: number; housing: number };
  onContinue: () => void;
  onCreditsChange?: (newCredits: number) => void;
  onFamilyNeedsChange?: (needs: { food: number; medicine: number; housing: number }) => void;
}

export const ShiftTransition = ({ 
  previousShift, 
  nextShift, 
  approvedCount, 
  deniedCount, 
  totalAccuracy,
  messageHistory,
  shiftDecisions,
  credits,
  familyNeeds,
  onContinue,
  onCreditsChange,
  onFamilyNeedsChange,
}: ShiftTransitionProps) => {
  const [phase, setPhase] = useState<'summary' | 'reports' | 'menu' | 'profile' | 'briefing'>('profile');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const briefingOpacity = useRef(new Animated.Value(0)).current;
  
  // Local state for family needs payment choices
  const [paidFor, setPaidFor] = useState<{ food: boolean; medicine: boolean; housing: boolean }>({
    food: false,
    medicine: false,
    housing: false,
  });
  const [shiftPayApplied, setShiftPayApplied] = useState(false);
  
  // Calculate shift pay (some shifts pay less or nothing)
  const getShiftPay = (): number => {
    // Base pay: 100 credits per shift
    let basePay = 100;
    
    // Some shifts don't pay full amount (random chance, or based on performance)
    if (totalAccuracy < 0.5) {
      // Poor performance = reduced pay
      basePay = Math.floor(basePay * 0.5);
    } else if (Math.random() < 0.15) {
      // 15% chance of "system delay" - reduced pay
      basePay = Math.floor(basePay * 0.7);
    }
    
    return basePay;
  };
  
  // Apply shift pay when entering profile (once per shift)
  useEffect(() => {
    if (phase === 'profile' && !shiftPayApplied && onCreditsChange) {
      const shiftPay = getShiftPay();
      if (shiftPay > 0) {
        // Add shift pay to current credits
        onCreditsChange(credits + shiftPay);
        setShiftPayApplied(true);
      }
    }
  }, [phase, shiftPayApplied, credits, onCreditsChange]);
  
  // Reset payment state when phase changes away from profile
  useEffect(() => {
    if (phase !== 'profile') {
      setPaidFor({ food: false, medicine: false, housing: false });
    }
  }, [phase]);
  
  // Calculate what player can afford
  const canAfford = (cost: number) => credits >= cost;
  
  // Handle paying for family needs
  const handlePayFor = (need: 'food' | 'medicine' | 'housing') => {
    const costs = {
      food: familyNeeds.food,
      medicine: familyNeeds.medicine,
      housing: familyNeeds.housing,
    };
    
    if (!paidFor[need] && canAfford(costs[need])) {
      const newPaidFor = { ...paidFor, [need]: true };
      setPaidFor(newPaidFor);
      
      // Deduct credits
      const newCredits = credits - costs[need];
      onCreditsChange?.(newCredits);
      
      // Update family needs (reduce urgency - they're paid for this cycle)
      const newNeeds = { ...familyNeeds };
      if (need === 'food') newNeeds.food = Math.max(0, newNeeds.food - 50);
      if (need === 'medicine') newNeeds.medicine = Math.max(0, newNeeds.medicine - 200);
      if (need === 'housing') newNeeds.housing = Math.max(0, newNeeds.housing - 500);
      onFamilyNeedsChange?.(newNeeds);
    }
  };


  useEffect(() => {
    // Fade in the overlay - NO AUTO ADVANCE
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleStartBriefing = () => {
    setPhase('briefing');
    Animated.timing(briefingOpacity, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  };

  const renderContent = () => {
    if (phase === 'profile') {
      const shiftPay = getShiftPay();
      const costs = {
        food: familyNeeds.food,
        medicine: familyNeeds.medicine,
        housing: familyNeeds.housing,
      };
      
      return (
        <View style={styles.profileContainer}>
          <ScrollView 
            style={styles.profileScrollContainer} 
            contentContainerStyle={styles.profileScrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.profileTitle}>OPERATOR LOG // PERSONAL</Text>
            
            {/* Credits Display */}
            <View style={styles.creditsSection}>
              <Text style={styles.sectionLabel}>AVAILABLE CREDITS</Text>
              <Text style={styles.creditsValue}>{credits}</Text>
              {shiftPayApplied && shiftPay > 0 && (
                <Text style={styles.shiftPayText}>+{shiftPay} (SHIFT PAY)</Text>
              )}
            </View>

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

            {/* Family Needs Section */}
            <View style={styles.familyNeedsSection}>
              <Text style={styles.sectionLabel}>FAMILY NEEDS</Text>
              <Text style={styles.sectionSubtext}>Choose what to provide this cycle</Text>
              
              {/* Food */}
              <Pressable
                onPress={() => handlePayFor('food')}
                disabled={paidFor.food || !canAfford(costs.food)}
                style={({ pressed }) => [
                  styles.needButton,
                  paidFor.food && styles.needButtonPaid,
                  !canAfford(costs.food) && styles.needButtonDisabled,
                  pressed && !paidFor.food && canAfford(costs.food) && styles.needButtonPressed,
                ]}
              >
                <View style={styles.needButtonContent}>
                  <View style={styles.needButtonLeft}>
                    <Text style={[styles.needLabel, paidFor.food && styles.needLabelPaid]}>FOOD</Text>
                    <Text style={[styles.needCost, paidFor.food && styles.needCostPaid]}>
                      {costs.food} CREDITS
                    </Text>
                  </View>
                  {paidFor.food ? (
                    <Text style={styles.needStatusPaid}>✓ PAID</Text>
                  ) : canAfford(costs.food) ? (
                    <Text style={styles.needStatusAvailable}>[ PAY ]</Text>
                  ) : (
                    <Text style={styles.needStatusUnavailable}>INSUFFICIENT</Text>
                  )}
                </View>
              </Pressable>

              {/* Medicine */}
              <Pressable
                onPress={() => handlePayFor('medicine')}
                disabled={paidFor.medicine || !canAfford(costs.medicine)}
                style={({ pressed }) => [
                  styles.needButton,
                  paidFor.medicine && styles.needButtonPaid,
                  !canAfford(costs.medicine) && styles.needButtonDisabled,
                  pressed && !paidFor.medicine && canAfford(costs.medicine) && styles.needButtonPressed,
                ]}
              >
                <View style={styles.needButtonContent}>
                  <View style={styles.needButtonLeft}>
                    <Text style={[styles.needLabel, paidFor.medicine && styles.needLabelPaid]}>MEDICINE</Text>
                    <Text style={[styles.needCost, paidFor.medicine && styles.needCostPaid]}>
                      {costs.medicine} CREDITS
                    </Text>
                  </View>
                  {paidFor.medicine ? (
                    <Text style={styles.needStatusPaid}>✓ PAID</Text>
                  ) : canAfford(costs.medicine) ? (
                    <Text style={styles.needStatusAvailable}>[ PAY ]</Text>
                  ) : (
                    <Text style={styles.needStatusUnavailable}>INSUFFICIENT</Text>
                  )}
                </View>
              </Pressable>

              {/* Housing */}
              <Pressable
                onPress={() => handlePayFor('housing')}
                disabled={paidFor.housing || !canAfford(costs.housing)}
                style={({ pressed }) => [
                  styles.needButton,
                  paidFor.housing && styles.needButtonPaid,
                  !canAfford(costs.housing) && styles.needButtonDisabled,
                  pressed && !paidFor.housing && canAfford(costs.housing) && styles.needButtonPressed,
                ]}
              >
                <View style={styles.needButtonContent}>
                  <View style={styles.needButtonLeft}>
                    <Text style={[styles.needLabel, paidFor.housing && styles.needLabelPaid]}>HOUSING</Text>
                    <Text style={[styles.needCost, paidFor.housing && styles.needCostPaid]}>
                      {costs.housing} CREDITS
                    </Text>
                  </View>
                  {paidFor.housing ? (
                    <Text style={styles.needStatusPaid}>✓ PAID</Text>
                  ) : canAfford(costs.housing) ? (
                    <Text style={styles.needStatusAvailable}>[ PAY ]</Text>
                  ) : (
                    <Text style={styles.needStatusUnavailable}>INSUFFICIENT</Text>
                  )}
                </View>
              </Pressable>
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
  // Credits section
  creditsSection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 30,
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: Theme.colors.textSecondary,
    backgroundColor: 'rgba(74, 106, 122, 0.1)',
  },
  sectionLabel: {
    color: Theme.colors.textSecondary,
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    letterSpacing: 2,
    marginBottom: 8,
  },
  creditsValue: {
    color: Theme.colors.textPrimary,
    fontFamily: Theme.fonts.mono,
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: 1,
  },
  shiftPayText: {
    color: Theme.colors.accentApprove,
    fontFamily: Theme.fonts.mono,
    fontSize: 11,
    marginTop: 4,
    letterSpacing: 1,
  },
  // Family needs section
  familyNeedsSection: {
    width: '100%',
    marginTop: 20,
    marginBottom: 30,
  },
  sectionSubtext: {
    color: Theme.colors.textDim,
    fontFamily: Theme.fonts.mono,
    fontSize: 9,
    textAlign: 'center',
    marginBottom: 15,
    fontStyle: 'italic',
  },
  needButton: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Theme.colors.textPrimary,
    marginBottom: 12,
    backgroundColor: 'rgba(26, 42, 58, 0.2)',
  },
  needButtonPressed: {
    backgroundColor: 'rgba(127, 184, 216, 0.2)',
  },
  needButtonPaid: {
    borderColor: Theme.colors.accentApprove,
    backgroundColor: 'rgba(74, 138, 90, 0.1)',
  },
  needButtonDisabled: {
    borderColor: Theme.colors.textDim,
    opacity: 0.5,
  },
  needButtonContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  needButtonLeft: {
    flex: 1,
  },
  needLabel: {
    color: Theme.colors.textPrimary,
    fontFamily: Theme.fonts.mono,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4,
  },
  needLabelPaid: {
    color: Theme.colors.accentApprove,
  },
  needCost: {
    color: Theme.colors.textSecondary,
    fontFamily: Theme.fonts.mono,
    fontSize: 11,
  },
  needCostPaid: {
    color: Theme.colors.accentApprove,
    opacity: 0.8,
  },
  needStatusAvailable: {
    color: Theme.colors.accentWarn,
    fontFamily: Theme.fonts.mono,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  needStatusPaid: {
    color: Theme.colors.accentApprove,
    fontFamily: Theme.fonts.mono,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  needStatusUnavailable: {
    color: Theme.colors.accentDeny,
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    opacity: 0.7,
  },
});

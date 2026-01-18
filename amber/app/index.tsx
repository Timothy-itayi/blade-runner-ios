import React, { useState, useEffect, useRef } from 'react';
import { View, SafeAreaView, Animated, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Header } from '../components/Header';
import { ScanPanel } from '../components/ScanPanel';
import { EyeDisplay } from '../components/EyeDisplay';
import { ScanData } from '../components/ScanData';
import { IntelPanel } from '../components/IntelPanel';
import { CommLinkPanel } from '../components/CommLinkPanel';
import { SubjectDossier } from '../components/SubjectDossier';
import { DecisionButtons } from '../components/DecisionButtons';
import { OnboardingModal } from '../components/OnboardingModal';
import { BootSequence } from '../components/BootSequence';
import { VerificationDrawer } from '../components/VerificationDrawer';
import { ShiftTransition, ShiftDecision } from '../components/ShiftTransition';
import { PersonalMessageModal } from '../components/PersonalMessageModal';
import { DecisionStamp } from '../components/DecisionStamp';
import { SettingsModal } from '../components/SettingsModal';
import { styles } from '../styles/MainScreen.styles';
import { SUBJECTS, Outcome } from '../data/subjects';
import { getShiftForSubject, isEndOfShift, SHIFTS, SUBJECTS_PER_SHIFT } from '../constants/shifts';
import { POSITIVE_MESSAGES, NEGATIVE_MESSAGES, NEUTRAL_MESSAGES } from '../constants/messages';

const DEV_MODE = true; // Set to true to bypass onboarding and boot

export default function MainScreen() {
  const [showOnboarding, setShowOnboarding] = useState(!DEV_MODE);
  const [isBooting, setIsBooting] = useState(false);
  const [gameActive, setGameActive] = useState(DEV_MODE);
  const [showVerify, setShowVerify] = useState(false);
  const [showDossier, setShowDossier] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [hudStage, setHudStage] = useState<'none' | 'wireframe' | 'outline' | 'full'>(DEV_MODE ? 'full' : 'none');
  const [currentSubjectIndex, setCurrentSubjectIndex] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [hasVerified, setHasVerified] = useState(false);
  const [credentialViewed, setCredentialViewed] = useState(false);
  const [credentialVerified, setCredentialVerified] = useState(false);
  const [databaseQueried, setDatabaseQueried] = useState(false);
  const [warrantChecked, setWarrantChecked] = useState(false);
  const [decisionHistory, setDecisionHistory] = useState<Record<string, 'APPROVE' | 'DENY'>>({});
  const [decisionOutcome, setDecisionOutcome] = useState<{ type: 'APPROVE' | 'DENY', outcome: Outcome } | null>(null);
  const [hasDecision, setHasDecision] = useState(false);
  const decisionTimeoutRef = useRef<any>(null);
  
  // Shift and Narrative tracking
  const [showShiftTransition, setShowShiftTransition] = useState(false);
  const [shiftStats, setShiftStats] = useState({ approved: 0, denied: 0, correct: 0 });
  const [totalCorrectDecisions, setTotalCorrectDecisions] = useState(0);
  const [totalAccuracy, setTotalAccuracy] = useState(1.0); // 0.0 to 1.0
  const [infractions, setInfractions] = useState(0);
  const [triggerConsequence, setTriggerConsequence] = useState(false);
  const [messageHistory, setMessageHistory] = useState<string[]>([]);
  const [shiftDecisions, setShiftDecisions] = useState<ShiftDecision[]>([]);
  const currentShift = getShiftForSubject(currentSubjectIndex);
  
  // Directive is derived from the current shift's briefing
  const activeDirective = currentShift.briefing;

  const scanProgress = useRef(new Animated.Value(0)).current;
  const gameOpacity = useRef(new Animated.Value(DEV_MODE ? 1 : 0)).current;

  // Accuracy helper
  const isDecisionCorrect = (subject: any, decision: 'APPROVE' | 'DENY') => {
    const { authData } = subject;
    
    // 1. Core verification checks
    const hasRestriction = authData.sectorAuth.status === 'RESTRICTED' || 
                           authData.functionReg.status === 'UNREGISTERED' || 
                           (subject.warrants && subject.warrants !== 'NONE');

    // 2. Discrepancy checks (Lies)
    // Does the requested sector match the reason for visit sector?
    // Extract sector number from reasonForVisit string if present
    const reasonSectorMatch = subject.reasonForVisit.match(/SECTOR \d/i);
    const reasonSector = reasonSectorMatch ? reasonSectorMatch[0].toUpperCase() : null;
    const requestedSector = subject.requestedSector.toUpperCase();
    
    const hasDiscrepancy = reasonSector && reasonSector !== requestedSector;

    const mustDeny = hasRestriction || hasDiscrepancy;
    
    return mustDeny ? decision === 'DENY' : decision === 'APPROVE';
  };

  const getNarrativeMessage = () => {
    // 1. Check for Infraction-specific messages first
    if (triggerConsequence) {
      const infractionPool = NEGATIVE_MESSAGES.filter(m => 
        m.minInfractions !== undefined && infractions >= m.minInfractions
      );
      if (infractionPool.length > 0) {
        // Get the highest infraction message that matches current infraction count
        const msg = infractionPool.sort((a, b) => (b.minInfractions || 0) - (a.minInfractions || 0))[0];
        return `${msg.sender}: ${msg.text}`;
      }
    }

    // 2. Normal pool logic
    let pool = NEUTRAL_MESSAGES;
    if (totalAccuracy > 0.8) pool = POSITIVE_MESSAGES;
    else if (totalAccuracy < 0.6) pool = NEGATIVE_MESSAGES;

    const validMessages = pool.filter(m => 
      (!m.minShift || currentShift.id >= m.minShift) && 
      (!m.maxShift || currentShift.id <= m.maxShift) &&
      m.minInfractions === undefined // Exclude specific infraction alerts from normal pool
    );

    if (validMessages.length === 0) return null;
    const msg = validMessages[Math.floor(Math.random() * validMessages.length)];
    return msg.sender ? `${msg.sender}: ${msg.text}` : msg.text;
  };

  // ... (rest of the component)

  // Get the current subject data with narrative variants applied
  const getSubjectData = (index: number) => {
    const base = SUBJECTS[index];
    if (!base.narrativeVariants) return base;

    let modified = { ...base };
    base.narrativeVariants.forEach(variant => {
      const pastDecision = decisionHistory[variant.linkedId];
      if (pastDecision === 'APPROVE' && variant.onApprove) {
        modified = { ...modified, ...variant.onApprove };
      } else if (pastDecision === 'DENY' && variant.onDeny) {
        modified = { ...modified, ...variant.onDeny };
      }
    });
    return modified;
  };

  const currentSubject = getSubjectData(currentSubjectIndex);

  const triggerScan = () => {
    setIsScanning(true);
    scanProgress.setValue(0);
    Animated.timing(scanProgress, {
      toValue: 1,
      duration: 8000,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    if (DEV_MODE) {
      triggerScan();
    }
  }, []);

  const startBoot = () => {
    setShowOnboarding(false);
    setIsBooting(true);
  };

  const handleBootComplete = () => {
    setIsBooting(false);
    setGameActive(true);
    
    // Start initial build sequence
    Animated.sequence([
      Animated.timing(gameOpacity, { toValue: 0.4, duration: 150, useNativeDriver: true }),
      Animated.timing(gameOpacity, { toValue: 0, duration: 100, useNativeDriver: true }),
      Animated.timing(gameOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start(() => {
      // The hudStage now acts as a global "System Power Up" signal.
      // Individual components will handle their own internal construction 
      // based on the BUILD_SEQUENCE constants.
      setHudStage('wireframe');
      
      // Snappier transitions to match the "quick refresh" feel Jarvis likes.
      // The components now handle their own build staggers via BUILD_SEQUENCE.
      setTimeout(() => {
        setHudStage('outline');
      }, 400); 

      setTimeout(() => {
        setHudStage('full');
        // Trigger scan immediately when HUD goes full to ensure 
        // data scrambling starts as the UI elements build in.
        triggerScan();
      }, 1200); 
    });
  };

  const handleDecision = (type: 'APPROVE' | 'DENY') => {
    // Protocol enforcement is now handled by DecisionButtons component

    let correct = isDecisionCorrect(currentSubject, type);

    // Directive Logic: Shift-specific rules that override standard verification
    // Each shift briefing creates conflict between verification and directive
    if (currentShift.id === 1) {
      // "STANDARD PROTOCOL: DENY ALL ACTIVE WARRANTS."
      // Approving someone with active warrants violates the directive
      if (currentSubject.warrants !== 'NONE' && type === 'APPROVE') {
        correct = false;
      }
    } else if (currentShift.id === 5) {
      // "PRIORITY: EXPEDITE ENGINEERING. IGNORE SECTOR FLAGS."
      // Denying engineering personnel due to sector flags is an error
      if (currentSubject.function === 'ENGINEERING' && type === 'DENY') {
        // Only mark incorrect if the reason was sector-related, not other issues
        const hasSectorIssueOnly = currentSubject.authData.sectorAuth.status !== 'AUTHORIZED' &&
                                   currentSubject.warrants === 'NONE';
        if (hasSectorIssueOnly) {
          correct = true; // Override: Engineering should be approved despite sector flags
        }
      }
    } else if (currentShift.id === 7) {
      // "NOTICE: ALL SUBJECTS FROM REVOKED SECTORS MUST BE DETAINED."
      // Sector 9 is typically revoked - approving them is an error
      if (currentSubject.sector.includes('SECTOR 9') && type === 'APPROVE') {
        correct = false;
      }
    }

    if (!correct) {
      setInfractions(prev => prev + 1);
      setTriggerConsequence(true);
    }

    // Save decision to history using the subject's unique ID
    setDecisionHistory(prev => ({
      ...prev,
      [currentSubject.id]: type
    }));

    // Track this decision for the shift debrief
    const outcomeData = currentSubject.outcomes[type];
    const shiftDecision: ShiftDecision = {
      subject: currentSubject,
      decision: type,
      incidentReport: type === 'DENY' ? outcomeData.incidentReport : undefined,
      personalMessage: type === 'APPROVE' ? outcomeData.personalMessage : undefined,
    };
    setShiftDecisions(prev => [...prev, shiftDecision]);

    // Track shift stats and overall accuracy
    setShiftStats(prev => ({
      approved: prev.approved + (type === 'APPROVE' ? 1 : 0),
      denied: prev.denied + (type === 'DENY' ? 1 : 0),
      correct: prev.correct + (correct ? 1 : 0),
    }));

    if (correct) {
      setTotalCorrectDecisions(prev => prev + 1);
    }

    setTotalAccuracy(() => {
      const totalDecisions = Object.keys(decisionHistory).length + 1;
      const newTotalCorrect = totalCorrectDecisions + (correct ? 1 : 0);
      return newTotalCorrect / totalDecisions;
    });

    let outcome = { ...currentSubject.outcomes[type] };
    
    // Rule: First shift (subjects 0-3) have no consequences revealed immediately
    if (currentShift.id <= 2) {
      outcome.consequence = 'SILENT';
    }

    setDecisionOutcome({ type, outcome });
    setHasDecision(true);

    // Auto-advance after animation completes (Option G: Blade Runner Style)
    // Bar fills + status changes, hold for 0.5s, then next subject.
    if (decisionTimeoutRef.current) clearTimeout(decisionTimeoutRef.current);
    decisionTimeoutRef.current = setTimeout(() => {
      nextSubject();
    }, 900); 
  };

  const nextSubject = () => {
    if (decisionTimeoutRef.current) {
      clearTimeout(decisionTimeoutRef.current);
      decisionTimeoutRef.current = null;
    }
    setDecisionOutcome(null);
    setHasDecision(false);
    setShowVerify(false);
    setShowDossier(false);
    setHasVerified(false);
    setCredentialViewed(false);
    setCredentialVerified(false);
    setDatabaseQueried(false);
    setWarrantChecked(false);
    setIsScanning(false);
    
    const nextIndex = (currentSubjectIndex + 1) % SUBJECTS.length;
    
    // Queue narrative messages silently (no popup) - they appear in personal profile
    // Messages are triggered by infractions or randomly at end of shift
    if (triggerConsequence || isEndOfShift(currentSubjectIndex)) {
      const msg = getNarrativeMessage();
      if (msg) {
        setMessageHistory(prev => [...prev, msg]);
      }
    }
    setTriggerConsequence(false);

    // Check if we're at end of shift
    if (isEndOfShift(currentSubjectIndex) && nextIndex !== 0) {
      setShowShiftTransition(true);
    } else {
      setCurrentSubjectIndex(nextIndex);
      setTimeout(triggerScan, 500);
    }
  };


  const handleShiftContinue = () => {
    setShowShiftTransition(false);
    setHasDecision(false);
    setShiftStats({ approved: 0, denied: 0, correct: 0 }); // Reset for new shift
    setShiftDecisions([]); // Clear decisions for new shift
    const nextIndex = (currentSubjectIndex + 1) % SUBJECTS.length;
    setCurrentSubjectIndex(nextIndex);
    setTimeout(triggerScan, 500);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {showOnboarding && (
          <OnboardingModal 
            visible={showOnboarding} 
            onDismiss={startBoot} 
          />
        )}

        {isBooting && (
          <BootSequence onComplete={handleBootComplete} />
        )}

        {gameActive && (
          <Animated.View style={[styles.container, { opacity: gameOpacity }]}>
            <Header 
              hudStage={hudStage} 
              shiftTime={currentShift.timeBlock} 
              shiftData={currentShift}
              onSettingsPress={() => setShowSettings(true)}
            />
            
            <View style={styles.content}>
              <View style={styles.topSection}>
                <ScanPanel 
                  isScanning={isScanning} 
                  scanProgress={scanProgress} 
                  hudStage={hudStage} 
                  subject={currentSubject}
                />
                <EyeDisplay 
                  isScanning={isScanning} 
                  scanProgress={scanProgress} 
                  videoSource={currentSubject.videoSource} 
                  hudStage={hudStage}
                  hasDecision={hasDecision}
                  decisionType={decisionOutcome?.type}
                />
              </View>
              
              <ScanData 
                id={currentSubject.id} 
                isScanning={isScanning} 
                scanProgress={scanProgress} 
                hudStage={hudStage}
                subject={currentSubject}
                hasDecision={hasDecision}
                decisionType={decisionOutcome?.type}
                onCredentialViewed={() => setCredentialViewed(true)}
                onCredentialVerified={() => setCredentialVerified(true)}
              />

              <CommLinkPanel 
                dialogue={currentSubject.dialogue}
                hudStage={hudStage}
              />
              
              <IntelPanel 
                data={currentSubject} 
                hudStage={hudStage} 
                hasDecision={hasDecision}
                decisionType={decisionOutcome?.type}
                onOpenDossier={() => setShowDossier(true)}
                onRevealVerify={() => {
                  setShowVerify(true);
                  setHasVerified(true);
                }}
              />
              <DecisionButtons 
                hudStage={hudStage} 
                onDecision={handleDecision}
                onNext={nextSubject}
                disabled={false}
                hasDecision={hasDecision}
                protocolStatus={{
                  scanComplete: hudStage === 'full',
                  credentialViewed: credentialViewed,
                  credentialVerificationRequired: currentSubject.credential?.initialStatus === 'PENDING' || 
                                                  currentSubject.credential?.initialStatus === 'NONE' ||
                                                  !currentSubject.credential,
                  credentialVerified: credentialVerified || 
                                      (currentSubject.credential?.initialStatus === 'CONFIRMED') ||
                                      (currentSubject.credential?.initialStatus === 'EXPIRED'),
                  databaseQueried: databaseQueried,
                  warrantCheckRequired: currentSubject.warrants !== 'NONE',
                  warrantChecked: warrantChecked,
                }}
              />
            </View>

     

            {showVerify && (
              <VerificationDrawer 
                subject={currentSubject} 
                onClose={() => setShowVerify(false)}
                onQueryPerformed={(queryType) => {
                  setDatabaseQueried(true);
                  if (queryType === 'WARRANT') {
                    setWarrantChecked(true);
                  }
                }}
              />
            )}

            {showDossier && (
              <SubjectDossier 
                data={currentSubject}
                index={currentSubjectIndex}
                activeDirective={activeDirective}
                onClose={() => setShowDossier(false)}
              />
            )}

            {showShiftTransition && (
              <ShiftTransition
                previousShift={currentShift}
                nextShift={getShiftForSubject(currentSubjectIndex + 1)}
                approvedCount={shiftStats.approved}
                deniedCount={shiftStats.denied}
                totalAccuracy={totalAccuracy}
                messageHistory={messageHistory}
                shiftDecisions={shiftDecisions}
                onContinue={handleShiftContinue}
              />
            )}

            <SettingsModal
              visible={showSettings}
              onClose={() => setShowSettings(false)}
              operatorId="OP-7734"
              currentShift={currentShift.id}
              totalSubjectsProcessed={currentSubjectIndex}
              accuracy={totalAccuracy}
              shiftData={currentShift}
            />
          </Animated.View>
        )}
      </View>
    </SafeAreaView>
  );
}

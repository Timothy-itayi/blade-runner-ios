import React, { useState, useEffect, useRef } from 'react';
import { View, SafeAreaView, Animated, Text, TouchableOpacity, StyleSheet } from 'react-native';
// Game components
import { Header } from '../components/game/Header';
import { ScanPanel } from '../components/game/ScanPanel';
import { IntelPanel } from '../components/game/IntelPanel';
import { CommLinkPanel } from '../components/game/CommLinkPanel';
import { InterrogationPanel } from '../components/game/InterrogationPanel';
import { SubjectDossier } from '../components/game/SubjectDossier';
import { DecisionButtons } from '../components/game/DecisionButtons';
import { VerificationDrawer } from '../components/game/VerificationDrawer';
import { ShiftTransition, ShiftDecision } from '../components/game/ShiftTransition';
import { PersonalMessageModal } from '../components/game/PersonalMessageModal';
import { DecisionStamp } from '../components/game/DecisionStamp';
import { NewsBroadcast } from '../components/game/NewsBroadcast';
// UI components
import { EyeDisplay } from '../components/ui/EyeDisplay';
import { ScanData } from '../components/ui/ScanData';
// Boot components
import { OnboardingModal } from '../components/boot/OnboardingModal';
import { BootSequence } from '../components/boot/BootSequence';
import { SystemTakeover } from '../components/boot/SystemTakeover';
// Intro components
import { HomeScreen } from '../components/intro/HomeScreen';
import { IntroBroadcast } from '../components/intro/IntroBroadcast';
// Settings components
import { SettingsModal } from '../components/settings/SettingsModal';
// Constants
import { ProbeType, ProbeResponse, INITIAL_PROBE_STATE, areRequiredProbesComplete } from '../constants/probes';
import { getDefaultProbeResponse, REQUIRED_PROBES_BY_ARCHETYPE } from '../constants/probeTemplates';
import { getDiscrepancyResponse, detectDiscrepancy } from '../constants/discrepancyResponses';
import { getBusinessResponse } from '../constants/businessResponses';
// Styles
import { styles } from '../styles/game/MainScreen.styles';
import { SUBJECTS, Outcome } from '../data/subjects';
import { getShiftForSubject, isEndOfShift, SHIFTS, SUBJECTS_PER_SHIFT } from '../constants/shifts';
import { POSITIVE_MESSAGES, NEGATIVE_MESSAGES, NEUTRAL_MESSAGES } from '../constants/messages';
import { useGameAudioContext } from '../contexts/AudioContext';
import { saveGame, loadGame, clearSave, hasSaveData as checkHasSaveData, getSaveInfo, SaveData } from '../utils/saveManager';

const DEV_MODE = false; // Set to true to bypass onboarding and boot

type GamePhase = 'intro' | 'news_intro' | 'takeover' | 'boot' | 'briefing' | 'active';

export default function MainScreen() {
  const { playLoadingSound, playGameSoundtrack } = useGameAudioContext();
  const [gamePhase, setGamePhase] = useState<GamePhase>(DEV_MODE ? 'active' : 'intro');
  const [hasSave, setHasSave] = useState(false);
  const [saveShiftNumber, setSaveShiftNumber] = useState(1);
  const [isLoadingFromSave, setIsLoadingFromSave] = useState(false);
  const [showVerify, setShowVerify] = useState(false);
  const [showDossier, setShowDossier] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [hudStage, setHudStage] = useState<'none' | 'wireframe' | 'outline' | 'full'>(DEV_MODE ? 'full' : 'none');
  const [currentSubjectIndex, setCurrentSubjectIndex] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [hasVerified, setHasVerified] = useState(false);
  const [credentialViewed, setCredentialViewed] = useState(false);
  const [credentialVerified, setCredentialVerified] = useState(false);
  const [credentialConfirmed, setCredentialConfirmed] = useState(false);
  const [databaseQueried, setDatabaseQueried] = useState(false);
  const [warrantChecked, setWarrantChecked] = useState(false);
  const [credentialsRequested, setCredentialsRequested] = useState(false);
  const [credentialsReceived, setCredentialsReceived] = useState(false);
  const [decisionHistory, setDecisionHistory] = useState<Record<string, 'APPROVE' | 'DENY'>>({});
  const [decisionOutcome, setDecisionOutcome] = useState<{ type: 'APPROVE' | 'DENY', outcome: Outcome } | null>(null);
  const [hasDecision, setHasDecision] = useState(false);
  const decisionTimeoutRef = useRef<any>(null);
  
  // Probe/Interrogation state
  const [completedProbes, setCompletedProbes] = useState<Set<ProbeType>>(new Set());
  const [currentProbeResponse, setCurrentProbeResponse] = useState<ProbeResponse | null>(null);
  const [probeCounts, setProbeCounts] = useState<Record<ProbeType, number>>({
    HANDS: 0,
    BUSINESS: 0,
    DISCREPANCY: 0,
    IDENTITY: 0,
  });
  const [probeOrder, setProbeOrder] = useState<ProbeType[]>([]); // Track order of probes asked
  const [agitationLevel, setAgitationLevel] = useState(0); // 0-100, caps dialogue at threshold
  const [scanningHands, setScanningHands] = useState(false);
  const [scanningIris, setScanningIris] = useState(false);
  const [hasDiscrepancy, setHasDiscrepancy] = useState(false);
  
  // Progressive probe unlocking - start with only 2 probes: IDENTITY and BUSINESS
  const [unlockedProbes, setUnlockedProbes] = useState<Set<ProbeType>>(new Set(['IDENTITY', 'BUSINESS']));
  const [subjectsProcessed, setSubjectsProcessed] = useState(0);
  const [agitationDetected, setAgitationDetected] = useState(false);

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
  
  // Directive provides clear instructions to the player
  const activeDirective = currentShift.directive;

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

  // Check for saved game on mount
  useEffect(() => {
    const checkSave = async () => {
      const hasData = await checkHasSaveData();
      setHasSave(hasData);
      if (hasData) {
        const info = await getSaveInfo();
        if (info) {
          setSaveShiftNumber(info.shiftNumber);
        }
      }
    };
    checkSave();
  }, []);

  // Auto-save function
  const performSave = async () => {
    if (gamePhase !== 'intro' && !isLoadingFromSave) {
      await saveGame({
        gamePhase,
        currentSubjectIndex,
        totalCorrectDecisions,
        totalAccuracy,
        infractions,
        shiftStats,
        decisionHistory,
        subjectsProcessed,
      });
    }
  };

  // Auto-save when game state changes
  useEffect(() => {
    // Save when in active gameplay or when entering certain phases
    if (!isLoadingFromSave && (gamePhase === 'active' || gamePhase === 'briefing')) {
      performSave();
    }
  }, [currentSubjectIndex, totalCorrectDecisions, infractions, gamePhase]);

  // Also save when entering boot phase so player can continue from there
  useEffect(() => {
    if (gamePhase === 'boot' && !isLoadingFromSave) {
      performSave();
    }
  }, [gamePhase]);

  // Handle continue from save
  const handleContinue = async () => {
    const savedData = await loadGame();
    if (savedData) {
      setIsLoadingFromSave(true);
      // Restore state
      setCurrentSubjectIndex(savedData.currentSubjectIndex);
      setTotalCorrectDecisions(savedData.totalCorrectDecisions);
      setTotalAccuracy(savedData.totalAccuracy);
      setInfractions(savedData.infractions);
      setShiftStats(savedData.shiftStats);
      setDecisionHistory(savedData.decisionHistory);
      setSubjectsProcessed(savedData.subjectsProcessed);

      // Skip to the saved phase (at least boot/briefing if in active)
      if (savedData.gamePhase === 'active') {
        setHudStage('full');
        setGamePhase('active');
        playGameSoundtrack();
        Animated.timing(gameOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start(() => {
          triggerScan();
        });
      } else {
        setGamePhase(savedData.gamePhase);
      }
      setIsLoadingFromSave(false);
    }
  };

  // Handle new game (clears save)
  const handleNewGame = async () => {
    await clearSave();
    setHasSave(false);
    setGamePhase('news_intro');
  };

  const handleIntroComplete = () => {
    setGamePhase('news_intro');
  };

  const handleNewsBroadcastComplete = () => {
    setGamePhase('boot');
  };

  const handleTakeoverComplete = () => {
    setGamePhase('boot');
  };

  const handleBootComplete = () => {
    setGamePhase('briefing');
  };

  const handleBriefingComplete = () => {
    playLoadingSound(); // Play UI loading sound
    setGamePhase('active');
    
    // Start game soundtrack halfway through transition (~300ms in)
    setTimeout(() => {
      playGameSoundtrack();
    }, 300);
    
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
    
    // Increment subjects processed when moving to next subject
    setSubjectsProcessed(prev => prev + 1);
    
    setDecisionOutcome(null);
    setHasDecision(false);
    setShowVerify(false);
    setShowDossier(false);
    setHasVerified(false);
    setCredentialViewed(false);
    setCredentialVerified(false);
    setCredentialConfirmed(false);
    setDatabaseQueried(false);
    setWarrantChecked(false);
    setIsScanning(false);

    // Reset probe state for next subject
    setCompletedProbes(new Set());
    setCurrentProbeResponse(null);

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
    // Reset probe state for new subject
    setCompletedProbes(new Set());
    setCurrentProbeResponse(null);
    setProbeCounts({ HANDS: 0, BUSINESS: 0, DISCREPANCY: 0, IDENTITY: 0 });
    setProbeOrder([]);
    setAgitationLevel(0);
    setScanningHands(false);
    setScanningIris(false);
    setAgitationDetected(false);
    setCredentialsRequested(false);
    setCredentialsReceived(false);
    setTimeout(triggerScan, 500);
  };

  // Probe/Interrogation handler
  const handleProbeTriggered = (probeType: ProbeType) => {
    // Check if subject is too agitated to respond
    const AGITATION_THRESHOLD = 80;
    if (agitationLevel >= AGITATION_THRESHOLD) {
      const refusalResponses = [
        "I'm done answering questions. Process my transit or don't.",
        "I've said everything I'm going to say. Make your decision.",
        "No more questions. I'm not playing this game anymore.",
        "I've cooperated enough. Either approve me or deny me.",
        "I'm not answering any more of your questions. Process it.",
      ];
      const archetype = currentSubject.archetype || 'CLN';
      const selectedRefusal = refusalResponses[Math.floor(Math.random() * refusalResponses.length)];
      
      setCurrentProbeResponse({
        probeType,
        response: `"${selectedRefusal}"`,
        toneShift: 'AGITATED',
      });
      return;
    }

    // Increment probe count (even if already completed, allow re-asking)
    const newCount = (probeCounts[probeType] || 0) + 1;
    setProbeCounts(prev => ({ ...prev, [probeType]: newCount }));
    
    // Track probe order for contextual responses (before processing, so we can check previous order)
    const currentProbeOrder = [...probeOrder, probeType];
    setProbeOrder(currentProbeOrder);

    // Special handling for HANDS probe - trigger laser scan on fingerprint slots
    if (probeType === 'HANDS') {
      setScanningHands(true);
      
      // Determine if subject is human or replicant
      const isReplicant = currentSubject.archetype === 'REP';
      const subjectLooking = currentSubject.scannerState !== 'OFF'; // Check if subject is looking at scanner
      
      // Scan will complete and show response after animation
      setTimeout(() => {
        setScanningHands(false);
        
        // For replicants, also trigger iris scan if subject is looking
        if (isReplicant && subjectLooking) {
          setScanningIris(true);
          setTimeout(() => {
            setScanningIris(false);
            // Replicant response after iris scan
            const customResponse = currentSubject.probeResponses?.find(r => r.probeType === probeType);
            if (customResponse) {
              setCurrentProbeResponse({
                ...customResponse,
                response: Array.isArray(customResponse.response) 
                  ? customResponse.response[Math.min(newCount - 1, customResponse.response.length - 1)]
                  : customResponse.response,
              });
            } else {
              const archetype = currentSubject.archetype || 'CLN';
              const defaultResponse = getDefaultProbeResponse(archetype, probeType, newCount - 1);
              setCurrentProbeResponse(defaultResponse);
            }
            setCompletedProbes(prev => new Set([...prev, probeType]));
          }, 1200); // Iris scan duration
          return;
        } else if (isReplicant && !subjectLooking) {
          // Replicant not looking - can't verify
          setCurrentProbeResponse({
            probeType: 'HANDS',
            response: "[Subject not looking at scanner. Iris verification impossible.]",
            toneShift: 'NERVOUS',
          });
          setCompletedProbes(prev => new Set([...prev, probeType]));
          return;
        }
        
        // Human response - bio markers are human
        const customResponse = currentSubject.probeResponses?.find(r => r.probeType === probeType);
        if (customResponse) {
          setCurrentProbeResponse({
            ...customResponse,
            response: Array.isArray(customResponse.response) 
              ? customResponse.response[Math.min(newCount - 1, customResponse.response.length - 1)]
              : customResponse.response,
          });
        } else {
          // Default human response
          setCurrentProbeResponse({
            probeType: 'HANDS',
            response: "[Subject complies. Bio markers are human.]",
            toneShift: 'COOPERATIVE',
          });
        }
        setCompletedProbes(prev => new Set([...prev, probeType]));
      }, 1200); // Hand scan duration
      return;
    }

    // Special handling for IDENTITY probe - request credentials
    if (probeType === 'IDENTITY') {
      setCredentialsRequested(true);
      
      // Generate response based on credential type
      let identityResponse = '';
      if (currentSubject.credential) {
        const credType = currentSubject.credential.type;
        const credSector = currentSubject.credential.destinationSector;
        const typeLabel = credType === 'TRANSIT_PERMIT' ? 'TRANSIT PERMIT' :
                         credType === 'WORK_ORDER' ? 'WORK ORDER' :
                         credType === 'MEDICAL_CLEARANCE' ? 'MEDICAL CLEARANCE' :
                         credType === 'VISITOR_PASS' ? 'VISITOR PASS' :
                         credType === 'EMERGENCY_PASS' ? 'EMERGENCY PASS' : credType;
        
        identityResponse = `"I have a ${typeLabel} for Sector ${credSector}."`;
      } else {
        identityResponse = `"I don't have any credentials on file."`;
      }
      
      // Always show credential statement - check for custom tone shift if available
      const customIdentityResponse = currentSubject.probeResponses?.find(r => r.probeType === 'IDENTITY');
      const archetype = currentSubject.archetype || 'CLN';
      const defaultTemplate = getDefaultProbeResponse(archetype, 'IDENTITY', newCount - 1);
      
      // Use custom tone shift if available, otherwise use default template tone
      const toneShift = customIdentityResponse?.toneShift || defaultTemplate.toneShift || 'COOPERATIVE';
      
      setCurrentProbeResponse({
        probeType: 'IDENTITY',
        response: identityResponse,
        toneShift: toneShift,
      });
      
      // Simulate credential sending delay - subject sends credentials
      setTimeout(() => {
        // Always mark as received when IDENTITY is asked (subject sends them)
        setCredentialsReceived(true);
        // Don't auto-mark as viewed - player must open and scan credentials
      }, 1500);
      
      // Mark probe as completed
      if (!completedProbes.has(probeType)) {
        setCompletedProbes(prev => new Set([...prev, probeType]));
      }
      return;
    }

    // Special handling for DISCREPANCY probe - use dynamic responses based on verification data
    if (probeType === 'DISCREPANCY') {
      const dynamicResponse = getDiscrepancyResponse(currentSubject, newCount - 1);
      if (dynamicResponse) {
        setCurrentProbeResponse(dynamicResponse);
      } else {
        // Fallback to custom or default if no discrepancy detected (shouldn't happen, but safety)
        const customResponse = currentSubject.probeResponses?.find(r => r.probeType === probeType);
        if (customResponse) {
          const responseText = Array.isArray(customResponse.response)
            ? customResponse.response[Math.min(newCount - 1, customResponse.response.length - 1)]
            : customResponse.response;
          setCurrentProbeResponse({
            ...customResponse,
            response: responseText,
          });
        } else {
          const archetype = currentSubject.archetype || 'CLN';
          const defaultResponse = getDefaultProbeResponse(archetype, probeType, newCount - 1);
          setCurrentProbeResponse(defaultResponse);
        }
      }
      // Mark probe as completed (only first time)
      if (!completedProbes.has(probeType)) {
        setCompletedProbes(prev => new Set([...prev, probeType]));
      }
      return;
    }

    // Special handling for BUSINESS probe - use dynamic responses based on character and data
    if (probeType === 'BUSINESS') {
      // Check if IDENTITY was asked first - add jest response
      // Check previous order (before adding current probe) to see if IDENTITY was first
      const identityAskedFirst = probeOrder.length > 0 && probeOrder[0] === 'IDENTITY' && probeOrder.filter(p => p === 'IDENTITY').length === 1 && !probeOrder.includes('BUSINESS');
      
      if (identityAskedFirst && newCount === 1) {
        // Jest response when IDENTITY was asked first, then BUSINESS
        const jestResponses = [
          `"Well, I already told you who I am. Now you want to know what I'm doing? ${currentSubject.reasonForVisit}."`,
          `"You just asked for my identity. Now my business? ${currentSubject.reasonForVisit}, same as always."`,
          `"First my credentials, now my purpose? ${currentSubject.reasonForVisit}. Is there a problem?"`,
          `"I gave you my identity. My business is ${currentSubject.reasonForVisit}. Can we move this along?"`,
        ];
        const archetype = currentSubject.archetype || 'CLN';
        const selectedJest = jestResponses[Math.floor(Math.random() * jestResponses.length)];
        
        // Adjust tone based on archetype
        let jestTone: 'NEUTRAL' | 'AGITATED' | 'NERVOUS' | 'EVASIVE' | 'COOPERATIVE' = 'COOPERATIVE';
        if (archetype === 'FLG' || archetype === 'EDG') {
          jestTone = 'NERVOUS';
        } else if (archetype === 'REV') {
          jestTone = 'EVASIVE';
        } else if (archetype === 'CLN') {
          jestTone = 'COOPERATIVE';
        }
        
        setCurrentProbeResponse({
          probeType: 'BUSINESS',
          response: selectedJest,
          toneShift: jestTone,
        });
        
        // Increase agitation slightly for jest response
        setAgitationLevel(prev => Math.min(prev + 5, 100));
      } else {
        const customResponse = currentSubject.probeResponses?.find(r => r.probeType === probeType);
        if (customResponse) {
          // Custom response takes priority
          const responseText = Array.isArray(customResponse.response)
            ? customResponse.response[Math.min(newCount - 1, customResponse.response.length - 1)]
            : customResponse.response;
          setCurrentProbeResponse({
            ...customResponse,
            response: responseText,
          });
        } else {
          // Use dynamic business response
          const dynamicResponse = getBusinessResponse(currentSubject, newCount - 1);
          setCurrentProbeResponse(dynamicResponse);
        }
      }
      
      // Mark probe as completed (only first time)
      if (!completedProbes.has(probeType)) {
        setCompletedProbes(prev => new Set([...prev, probeType]));
      }
      return;
    }

    // Find the response for this probe type (custom response takes priority)
    const customResponse = currentSubject.probeResponses?.find(r => r.probeType === probeType);

    if (customResponse) {
      // Handle multiple responses (variations) - use count to select variation
      const responseText = Array.isArray(customResponse.response)
        ? customResponse.response[Math.min(newCount - 1, customResponse.response.length - 1)]
        : customResponse.response;
      
      setCurrentProbeResponse({
        ...customResponse,
        response: responseText,
      });
    } else {
      // Use archetype-based default response
      const archetype = currentSubject.archetype || 'CLN';
      const defaultResponse = getDefaultProbeResponse(archetype, probeType, newCount - 1);
      setCurrentProbeResponse(defaultResponse);
    }

    // Mark probe as completed (only first time)
    if (!completedProbes.has(probeType)) {
      setCompletedProbes(prev => new Set([...prev, probeType]));
    }
  };

  // Detect discrepancies when subject changes
  useEffect(() => {
    // Use the discrepancy detection function for consistency
    const discrepancy = detectDiscrepancy(currentSubject);
    setHasDiscrepancy(discrepancy !== null);
    
    // Unlock DISCREPANCY probe if discrepancy detected
    if (discrepancy !== null) {
      setUnlockedProbes(prev => new Set([...prev, 'DISCREPANCY']));
    }
  }, [currentSubject]);

  // Track probe responses for agitation detection and progressive unlocking
  useEffect(() => {
    if (currentProbeResponse) {
      // Increase agitation level based on tone shift
      const toneShift = currentProbeResponse.toneShift;
      if (toneShift === 'AGITATED') {
        setAgitationLevel(prev => Math.min(prev + 15, 100));
        setAgitationDetected(true);
      } else if (toneShift === 'EVASIVE') {
        setAgitationLevel(prev => Math.min(prev + 10, 100));
        setAgitationDetected(true);
      } else if (toneShift === 'NERVOUS') {
        setAgitationLevel(prev => Math.min(prev + 8, 100));
        setAgitationDetected(true);
      }
      
      // Increase agitation for repeated questions (same probe asked multiple times)
      const probeType = currentProbeResponse.probeType;
      const probeCount = probeCounts[probeType] || 0;
      if (probeCount > 1) {
        // Additional agitation for each repeat
        setAgitationLevel(prev => Math.min(prev + (probeCount - 1) * 5, 100));
      }
      
      // Increase agitation for asking too many different probes (interrogation fatigue)
      const totalProbesAsked = probeOrder.length;
      if (totalProbesAsked > 3) {
        setAgitationLevel(prev => Math.min(prev + (totalProbesAsked - 3) * 3, 100));
      }
      
      // Detect agitation from tone shifts for unlocking
      const isAgitated = toneShift === 'AGITATED' || 
                        toneShift === 'EVASIVE' || 
                        toneShift === 'NERVOUS';
      
      if (isAgitated) {
        setAgitationDetected(true);
        
        // Unlock HANDS probe when agitation detected (subjects getting annoyed/uncooperative - need biometric check)
        if (!unlockedProbes.has('HANDS')) {
          setUnlockedProbes(prev => new Set([...prev, 'HANDS']));
        }
      }
    }
  }, [currentProbeResponse, unlockedProbes, probeCounts, probeOrder]);

  // Progressive unlocking based on subjects processed and behavior
  useEffect(() => {
    // After 2 subjects, unlock HANDS if not already unlocked (biometric verification)
    if (subjectsProcessed >= 2 && !unlockedProbes.has('HANDS')) {
      setUnlockedProbes(prev => new Set([...prev, 'HANDS']));
    }
    
    // After 3 subjects, unlock DISCREPANCY if discrepancy detected
    if (subjectsProcessed >= 3 && !unlockedProbes.has('DISCREPANCY') && hasDiscrepancy) {
      setUnlockedProbes(prev => new Set([...prev, 'DISCREPANCY']));
    }
    
    // After 4 subjects, unlock DISCREPANCY regardless (progressive reveal)
    if (subjectsProcessed >= 4 && !unlockedProbes.has('DISCREPANCY')) {
      setUnlockedProbes(prev => new Set([...prev, 'DISCREPANCY']));
    }
  }, [subjectsProcessed, unlockedProbes, hasDiscrepancy]);

  // Reset probe state when subject changes
  useEffect(() => {
    setCompletedProbes(new Set());
    setCurrentProbeResponse(null);
    setProbeCounts({
      HANDS: 0,
      BUSINESS: 0,
      DISCREPANCY: 0,
      IDENTITY: 0,
    });
    setProbeOrder([]);
    setAgitationLevel(0);
    setScanningHands(false);
    setScanningIris(false);
    setAgitationDetected(false);
    setCredentialsRequested(false);
    setCredentialsReceived(false);
    setCredentialConfirmed(false);
  }, [currentSubjectIndex]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {gamePhase === 'intro' && (
          <HomeScreen
            onComplete={handleNewGame}
            onContinue={handleContinue}
            hasSaveData={hasSave}
            saveShiftNumber={saveShiftNumber}
          />
        )}

        {gamePhase === 'news_intro' && (
          <IntroBroadcast onComplete={handleNewsBroadcastComplete} />
        )}

        {gamePhase === 'boot' && (
          <BootSequence onComplete={handleBootComplete} />
        )}

        {gamePhase === 'takeover' && (
          <SystemTakeover onComplete={handleTakeoverComplete} />
        )}

        {gamePhase === 'briefing' && (
          <OnboardingModal 
            visible={true} 
            onDismiss={handleBriefingComplete}
            operatorId="OP-7734"
          />
        )}

        {gamePhase === 'active' && (
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
                  subjectIndex={currentSubjectIndex}
                  scanningHands={scanningHands}
                  businessProbeCount={probeCounts.BUSINESS || 0}
                />
                <EyeDisplay 
                  isScanning={isScanning} 
                  scanProgress={scanProgress} 
                  videoSource={currentSubject.videoSource} 
                  hudStage={hudStage}
                  hasDecision={hasDecision}
                  decisionType={decisionOutcome?.type}
                  scanningIris={scanningIris}
                  subjectLooking={currentSubject.scannerState !== 'OFF'}
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
                onCredentialConfirmed={() => setCredentialConfirmed(true)}
                credentialsReceived={credentialsReceived}
              />

              <InterrogationPanel
                hudStage={hudStage}
                completedProbes={completedProbes}
                currentResponse={currentProbeResponse}
                requiredProbes={currentSubject.requiredProbes ||
                  REQUIRED_PROBES_BY_ARCHETYPE[currentSubject.archetype || 'CLN']}
                hasDiscrepancy={hasDiscrepancy}
                onProbeTriggered={handleProbeTriggered}
                disabled={hasDecision}
                subjectDialogue={currentSubject.dialogue || currentSubject.reasonForVisit}
                unlockedProbes={unlockedProbes}
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
              {/* Decision buttons appear once scan is complete - player always has right to choose */}
              {/* System checks are informational only, shown via border colors in CredentialModal */}
              {hudStage === 'full' && !isScanning && (
                <DecisionButtons 
                  hudStage={hudStage} 
                  onDecision={handleDecision}
                  onNext={nextSubject}
                  disabled={false}
                  hasDecision={hasDecision}
                  protocolStatus={{
                    scanComplete: hudStage === 'full',
                    credentialViewed: credentialViewed,
                    credentialConfirmed: credentialConfirmed,
                    credentialVerificationRequired: currentSubject.credential?.initialStatus === 'PENDING' ||
                                                    currentSubject.credential?.initialStatus === 'NONE' ||
                                                    !currentSubject.credential,
                    credentialVerified: credentialVerified ||
                                        (currentSubject.credential?.initialStatus === 'CONFIRMED') ||
                                        (currentSubject.credential?.initialStatus === 'EXPIRED'),
                    databaseQueried: databaseQueried,
                    warrantCheckRequired: currentSubject.warrants !== 'NONE',
                    warrantChecked: warrantChecked,
                    probesRequired: (() => {
                      const effectiveProbes = currentSubject.requiredProbes ||
                        REQUIRED_PROBES_BY_ARCHETYPE[currentSubject.archetype || 'CLN'];
                      return effectiveProbes && effectiveProbes.length > 0;
                    })(),
                    probesCompleted: areRequiredProbesComplete(
                      completedProbes,
                      currentSubject.requiredProbes ||
                        REQUIRED_PROBES_BY_ARCHETYPE[currentSubject.archetype || 'CLN']
                    ),
                    isCleanSubject: currentSubject.archetype === 'CLN',
                  }}
                />
              )}
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

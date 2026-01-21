import React, { useState, useEffect, useRef } from 'react';
import { View, SafeAreaView, Animated } from 'react-native';
// Game components
import { GameScreen } from '../components/game/screen/GameScreen';
import { VerificationDrawer } from '../components/game/VerificationDrawer';
import { ShiftTransition } from '../components/game/ShiftTransition';
import { SubjectDossier } from '../components/game/SubjectDossier';
import { BioScanModal } from '../components/game/BioScanModal';
import { SettingsModal } from '../components/settings/SettingsModal';
import { CitationModal } from '../components/game/CitationModal';
// Boot components
import { OnboardingModal } from '../components/boot/OnboardingModal';
import { BootSequence } from '../components/boot/BootSequence';
import { SystemTakeover } from '../components/boot/SystemTakeover';
// Intro components
import { HomeScreen } from '../components/intro/HomeScreen';
import { IntroVideo } from '../components/intro/IntroVideo';
// Hooks
import { useGameState } from '../hooks/useGameState';
import { useGameHandlers } from '../hooks/useGameHandlers';
// Utils
import { getSubjectData } from '../utils/gameHelpers';
import { saveGame, loadGame, clearSave, hasSaveData as checkHasSaveData, getSaveInfo, SaveData, GamePhase } from '../utils/saveManager';
// Constants
import { styles } from '../styles/game/MainScreen.styles';
import { SUBJECTS } from '../data/subjects';
import { getShiftForSubject, isEndOfShift } from '../constants/shifts';
import { useGameAudioContext } from '../contexts/AudioContext';
import { useGameStore } from '../store/gameStore';
import { createEmptyInformation } from '../types/information';
import { determineEquipmentFailures } from '../utils/equipmentFailures';
import { Consequence } from '../types/consequence';
import { SupervisorWarning, WarningPattern } from '../components/game/SupervisorWarning';
import { createPatternTracker, checkWarningPatterns, PatternTracker } from '../utils/warningPatterns';

const DEV_MODE = false; // Set to true to bypass onboarding and boot

export default function MainScreen() {
  const { playLoadingSound, playGameSoundtrack } = useGameAudioContext();
  const { credits: storeCredits, resourcesRemaining, resourcesPerShift } = useGameStore();
  
  const [gamePhase, setGamePhase] = useState<GamePhase>(DEV_MODE ? 'active' : 'intro');
  const [hasSave, setHasSave] = useState(false);
  const [saveShiftNumber, setSaveShiftNumber] = useState(1);
  const [isLoadingFromSave, setIsLoadingFromSave] = useState(false);
  const [hudStage, setHudStage] = useState<'none' | 'wireframe' | 'outline' | 'full'>(DEV_MODE ? 'full' : 'none');
  const [decisionHistory, setDecisionHistory] = useState<Record<string, 'APPROVE' | 'DENY'>>({});
  const [isNewGame, setIsNewGame] = useState(true);
  
  // Phase 2: BPM monitoring state
  const [interrogationBPM, setInterrogationBPM] = useState<number | null>(null); // Current BPM during interrogation
  const [isInterrogationActive, setIsInterrogationActive] = useState(false); // Is interrogation active?
  
  // Phase 3: Consequence evaluation state
  const [consequence, setConsequence] = useState<Consequence | null>(null);
  
  // Phase 3: Supervisor warning state
  const [warningTracker, setWarningTracker] = useState<PatternTracker>(createPatternTracker());
  const [currentWarning, setCurrentWarning] = useState<WarningPattern | null>(null);
  
  // Use game state hook
  const gameState = useGameState(100);
  const {
    currentSubjectIndex,
    setCurrentSubjectIndex,
    isScanning,
    setIsScanning,
    hasDecision,
    setHasDecision,
    decisionOutcome,
    setDecisionOutcome,
    scanningHands,
    setScanningHands,
    scanningIris,
    setScanningIris,
    biometricsRevealed,
    setBiometricsRevealed,
    dossierRevealed,
    setDossierRevealed,
    scanProgress,
    showVerify,
    setShowVerify,
    showDossier,
    setShowDossier,
    showInterrogate,
    setShowInterrogate,
    showBioScan,
    setShowBioScan,
    showSettings,
    setShowSettings,
    subjectsProcessed,
    setSubjectsProcessed,
    subjectResponse,
    setSubjectResponse,
    gatheredInformation,
    setGatheredInformation,
    credits: _credits,
    setCredits: _setCredits,
    familyNeeds,
    setFamilyNeeds,
    daysPassed,
    setDaysPassed,
    showShiftTransition,
    setShowShiftTransition,
    shiftStats,
    setShiftStats,
    totalCorrectDecisions,
    setTotalCorrectDecisions,
    totalAccuracy,
    setTotalAccuracy,
    infractions,
    setInfractions,
    triggerConsequence,
    setTriggerConsequence,
    messageHistory,
    setMessageHistory,
    shiftDecisions,
    setShiftDecisions,
  } = gameState;

  const currentShift = getShiftForSubject(currentSubjectIndex);
  const currentSubject = getSubjectData(currentSubjectIndex, SUBJECTS, decisionHistory);
  const activeDirective = currentShift.directive;

  const gameOpacity = useRef(new Animated.Value(DEV_MODE ? 1 : 0)).current;

  const triggerScan = () => {
    setIsScanning(true);
    scanProgress.setValue(0);
    setBiometricsRevealed(false);
    // Reset resources for new subject
    useGameStore.getState().resetSubjectResources();

    Animated.timing(scanProgress, {
      toValue: 1,
      duration: 3000,
      useNativeDriver: true,
    }).start(() => {
      setIsScanning(false);
      setBiometricsRevealed(true);
    });
  };

  // Use game handlers hook
  const { handleDecision, nextSubject } = useGameHandlers({
    setInfractions,
    setTriggerConsequence,
    setDecisionHistory,
    setShiftDecisions,
    setShiftStats,
    setTotalCorrectDecisions,
    setTotalAccuracy,
    setDecisionOutcome,
    setHasDecision,
    setMessageHistory,
    setShowShiftTransition,
    setCurrentSubjectIndex,
    setBiometricsRevealed,
    setSubjectsProcessed,
    currentSubjectIndex,
    currentSubject,
    currentShift,
    decisionHistory,
    totalCorrectDecisions,
    totalAccuracy,
    infractions,
    triggerConsequence,
    familyNeeds,
    daysPassed,
    triggerScan,
    gatheredInformation, // Phase 3: Pass gathered information for consequence evaluation
    setConsequence, // Phase 3: Store consequence result
    onWarningPattern: (warning) => {
      // Phase 3: Show supervisor warning
      setCurrentWarning(warning);
    },
    warningTracker, // Phase 3: Pattern tracking
    setWarningTracker, // Phase 3: Update pattern tracker
  });

  const handleShiftContinue = () => {
    setShowShiftTransition(false);
    setHasDecision(false);
    setShiftStats({ approved: 0, denied: 0, correct: 0 });
    setShiftDecisions([]);

    // Reset resources for new shift (3 per shift)
    useGameStore.getState().resetResourcesForShift(3);

    const nextIndex = (currentSubjectIndex + 1) % SUBJECTS.length;
    setCurrentSubjectIndex(nextIndex);
    setScanningHands(false);
    setScanningIris(false);
    setDossierRevealed(false); // Reset dossier for new subject
    setSubjectResponse(''); // Reset subject response
    setShowInterrogate(false); // Reset interrogation modal state
    
    // Phase 2: Reset information tracking for new subject with equipment failures
    const nextSubject = getSubjectData((currentSubjectIndex + 1) % SUBJECTS.length, SUBJECTS, decisionHistory);
    const equipmentFailures = determineEquipmentFailures(nextSubject.id);
    setGatheredInformation(createEmptyInformation(equipmentFailures));
    setInterrogationBPM(null); // Reset BPM
    setIsInterrogationActive(false); // Reset interrogation state
    setConsequence(null); // Phase 3: Reset consequence
    setCurrentWarning(null); // Phase 3: Reset warning
    // Phase 3: Reset warning pattern tracker for new shift
    setWarningTracker(createPatternTracker());
    // Reset resources for new subject
    useGameStore.getState().resetSubjectResources();
    setTimeout(triggerScan, 500);
  };

  // Auto-save function
  const performSave = async () => {
    if (gamePhase !== 'intro' && gamePhase !== 'introVideo' && !isLoadingFromSave) {
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
    if (!isLoadingFromSave && (gamePhase === 'active' || gamePhase === 'briefing')) {
      performSave();
    }
  }, [currentSubjectIndex, totalCorrectDecisions, infractions, gamePhase]);

  useEffect(() => {
    if (gamePhase === 'boot' && !isLoadingFromSave) {
      performSave();
    }
  }, [gamePhase]);

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

  // Handle continue from save
  const handleContinue = async () => {
    const savedData = await loadGame();
    if (savedData) {
      setIsLoadingFromSave(true);
      setCurrentSubjectIndex(savedData.currentSubjectIndex);
      setTotalCorrectDecisions(savedData.totalCorrectDecisions);
      setTotalAccuracy(savedData.totalAccuracy);
      setInfractions(savedData.infractions);
      setShiftStats(savedData.shiftStats);
      setDecisionHistory(savedData.decisionHistory);
      setSubjectsProcessed(savedData.subjectsProcessed);
      setIsNewGame(false); // Not a new game if loading from save

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
        const phase = savedData.gamePhase === 'news_intro' ? 'boot' : savedData.gamePhase;
        setGamePhase(phase as GamePhase);
      }
      setIsLoadingFromSave(false);
    }
  };

  // Handle new game (clears save)
  const handleNewGame = async () => {
    await clearSave();
    setHasSave(false);
    setIsNewGame(true);
    // Initialize resources and credits for new game
    useGameStore.getState().resetResourcesForShift(3);
    useGameStore.getState().spendCredits(useGameStore.getState().credits); // Reset to 0
    setGamePhase('introVideo');
  };

  const handleIntroVideoComplete = () => {
    setGamePhase('boot');
  };

  const handleIntroComplete = () => {
    setGamePhase('boot');
  };

  const handleTakeoverComplete = () => {
    setGamePhase('boot');
  };

  const handleBootComplete = () => {
    setGamePhase('briefing');
  };

  const handleBriefingComplete = () => {
    playLoadingSound();
    setGamePhase('active');
    
    // Initialize resources to 3 for first shift
    useGameStore.getState().resetResourcesForShift(3);
    // Initialize credits to 0
    useGameStore.getState().spendCredits(useGameStore.getState().credits); // Reset to 0
    
    setTimeout(() => {
      playGameSoundtrack();
    }, 300);
    
    Animated.sequence([
      Animated.timing(gameOpacity, { toValue: 0.4, duration: 150, useNativeDriver: true }),
      Animated.timing(gameOpacity, { toValue: 0, duration: 100, useNativeDriver: true }),
      Animated.timing(gameOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start(() => {
      setHudStage('wireframe');
      
      setTimeout(() => {
        setHudStage('outline');
      }, 400); 

      setTimeout(() => {
        setHudStage('full');
        triggerScan();
      }, 1200); 
    });
  };

  // Phase 2: Initialize equipment failures for current subject when game starts or subject changes
  useEffect(() => {
    if (gamePhase === 'active' && currentSubject) {
      // Reset interrogation state when subject changes
      setInterrogationBPM(null);
      setIsInterrogationActive(false);
      
      // Only initialize if equipment failures haven't been set yet (first time for this subject)
      // Check if this is a new subject by comparing IDs
      const equipmentFailures = determineEquipmentFailures(currentSubject.id);
      if (gatheredInformation.equipmentFailures.length === 0 || 
          !gatheredInformation.equipmentFailures.some(f => equipmentFailures.includes(f as any))) {
        setGatheredInformation(createEmptyInformation(equipmentFailures));
      }
    }
  }, [gamePhase, currentSubjectIndex, currentSubject?.id]);

  useEffect(() => {
    if (DEV_MODE) {
      triggerScan();
    }
  }, []);

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

        {gamePhase === 'introVideo' && (
          <IntroVideo
            onComplete={handleIntroVideoComplete}
            duration={51000}
          />
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
            <GameScreen
              hudStage={hudStage}
              currentShift={currentShift}
              currentSubject={currentSubject}
              currentSubjectIndex={currentSubjectIndex}
              isScanning={isScanning}
              scanProgress={scanProgress}
              scanningHands={scanningHands}
              scanningIris={scanningIris}
              biometricsRevealed={biometricsRevealed}
              hasDecision={hasDecision}
              decisionOutcome={decisionOutcome}
              credits={storeCredits}
              resourcesRemaining={resourcesRemaining}
              resourcesPerShift={resourcesPerShift}
              onSettingsPress={() => setShowSettings(true)}
              onRevealVerify={() => {
                // Verification drawer opens - resources used when queries are performed
                setShowVerify(true);
              }}
              onDecision={handleDecision}
              onNext={() => {
                // Phase 2: Reset information tracking for next subject with equipment failures
                const nextSubjectData = getSubjectData((currentSubjectIndex + 1) % SUBJECTS.length, SUBJECTS, decisionHistory);
                const equipmentFailures = determineEquipmentFailures(nextSubjectData.id);
                setGatheredInformation(createEmptyInformation(equipmentFailures));
                setInterrogationBPM(null); // Reset BPM
                setIsInterrogationActive(false); // Reset interrogation state
                setConsequence(null); // Phase 3: Reset consequence
                nextSubject(); // Call the handler function
              }}
              onScanHands={() => {
                // Legacy - kept for compatibility
              }}
              onBioScan={() => {
                const store = useGameStore.getState();
                // BIO scan uses 1 resource (scans eyes and hands, reveals bio data and dossier)
                // Memory model: Once used, cannot be reused (one-time only)
                if (store.useSubjectResource() && !gatheredInformation.bioScan) {
                  // Track information gathered
                  setGatheredInformation(prev => ({
                    ...prev,
                    bioScan: true,
                    timestamps: {
                      ...prev.timestamps,
                      bioScan: Date.now(),
                    },
                  }));
                  setScanningHands(true);
                  // Auto-disable after scan completes and reveal dossier + bio scan modal
                  setTimeout(() => {
                    setScanningHands(false);
                    setDossierRevealed(true);
                    setShowBioScan(true);
                  }, 1500);
                }
              }}
              bioScanUsed={gatheredInformation.bioScan}
              onOpenDossier={() => setShowDossier(true)}
              onInterrogate={() => {
                // Handled directly in IntelPanel
              }}
              dossierRevealed={dossierRevealed}
              subjectResponse={subjectResponse}
              onResponseUpdate={(response) => {
                setSubjectResponse(response);
              }}
              gatheredInformation={gatheredInformation}
              onBPMChange={(bpm) => {
                // Phase 2: Update BPM when question is asked
                setInterrogationBPM(bpm);
                setIsInterrogationActive(true);
              }}
              onInformationUpdate={(info) => {
                // Phase 2: Update gathered information
                setGatheredInformation(prev => ({
                  ...prev,
                  ...info,
                  interrogation: {
                    ...prev.interrogation,
                    ...(info.interrogation || {}),
                  },
                  timestamps: {
                    ...prev.timestamps,
                    ...(info.timestamps || {}),
                  },
                }));
              }}
              isNewGame={isNewGame}
              equipmentFailures={gatheredInformation.equipmentFailures}
              bpmDataAvailable={gatheredInformation.bpmDataAvailable}
              interrogationBPM={interrogationBPM}
              isInterrogationActive={isInterrogationActive}
            />

            {showVerify && (
              <VerificationDrawer 
                subject={currentSubject} 
                onClose={() => setShowVerify(false)}
                resourcesRemaining={resourcesRemaining}
                onQueryPerformed={(queryType) => {
                  // Each verification query uses 1 resource
                  useGameStore.getState().useSubjectResource();
                }}
                onInformationGathered={(queryType) => {
                  // Phase 1: Track information gathered
                  setGatheredInformation(prev => ({
                    ...prev,
                    [queryType === 'WARRANT' ? 'warrantCheck' : queryType === 'TRANSIT' ? 'transitLog' : 'incidentHistory']: true,
                    timestamps: {
                      ...prev.timestamps,
                      [queryType === 'WARRANT' ? 'warrantCheck' : queryType === 'TRANSIT' ? 'transitLog' : 'incidentHistory']: Date.now(),
                    },
                  }));
                }}
                gatheredInformation={{
                  warrantCheck: gatheredInformation.warrantCheck,
                  transitLog: gatheredInformation.transitLog,
                  incidentHistory: gatheredInformation.incidentHistory,
                }}
              />
            )}

            {showDossier && (
              <SubjectDossier 
                data={currentSubject}
                index={currentSubjectIndex}
                activeDirective={activeDirective}
                dossierRevealed={dossierRevealed}
                onClose={() => setShowDossier(false)}
              />
            )}


            {showBioScan && (
              <BioScanModal
                subject={currentSubject}
                onClose={() => setShowBioScan(false)}
              />
            )}

            {/* Phase 3: Citation Modal - Shows consequences and missed information */}
            {hasDecision && consequence && (
              <CitationModal
                visible={hasDecision && consequence.type !== 'NONE'}
                consequence={consequence}
                onClose={() => {
                  // Don't close immediately - let user acknowledge
                  // Will be reset when moving to next subject
                }}
              />
            )}

            {/* Phase 3: Supervisor Warning - Shows mid-shift pattern warnings */}
            <SupervisorWarning
              visible={!!currentWarning}
              warning={currentWarning}
              onDismiss={() => setCurrentWarning(null)}
            />

            {showShiftTransition && (
              <ShiftTransition
                previousShift={currentShift}
                nextShift={getShiftForSubject(currentSubjectIndex + 1)}
                approvedCount={shiftStats.approved}
                deniedCount={shiftStats.denied}
                totalAccuracy={totalAccuracy}
                messageHistory={messageHistory}
                shiftDecisions={shiftDecisions}
                credits={storeCredits}
                familyNeeds={familyNeeds}
                onContinue={handleShiftContinue}
                onCreditsChange={(newCredits) => useGameStore.getState().addCredits(newCredits - storeCredits)}
                onFamilyNeedsChange={setFamilyNeeds}
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

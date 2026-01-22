import React, { useState, useEffect, useRef } from 'react';
import { View, SafeAreaView, Animated } from 'react-native';
// Game components
import { GameScreen } from '../components/game/screen/GameScreen';
import { ShiftTransition } from '../components/game/ShiftTransition';
import { SubjectDossier } from '../components/game/SubjectDossier';
import { HealthScanModal } from '../components/game/HealthScanModal';
import { SettingsModal } from '../components/settings/SettingsModal';
import { CitationModal } from '../components/game/CitationModal';
// Phase 4: Subject interaction phase type
type InteractionPhase = 'greeting' | 'credentials' | 'investigation';
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
// Phase 5: Subject Manager
import { createDefaultSubjectPool, getSubjectByIndex, SubjectManagerConfig } from '../utils/subjectManager';
import { SubjectData } from '../data/subjects';
import { getShiftForSubject, isEndOfShift } from '../constants/shifts';
import { useGameStore } from '../store/gameStore';
import { createEmptyInformation } from '../types/information';
import { determineEquipmentFailures } from '../utils/equipmentFailures';
import { Consequence } from '../types/consequence';
import { SupervisorWarning, WarningPattern } from '../components/game/SupervisorWarning';
import { createPatternTracker, checkWarningPatterns, PatternTracker } from '../utils/warningPatterns';

const DEV_MODE = true; // Set to true to bypass onboarding and boot

export default function MainScreen() {
  const { credits: storeCredits, resourcesRemaining, resourcesPerShift } = useGameStore();
  
  const [gamePhase, setGamePhase] = useState<GamePhase>(DEV_MODE ? 'active' : 'intro');
  const [hasSave, setHasSave] = useState(false);
  const [saveShiftNumber, setSaveShiftNumber] = useState(1);
  const [isLoadingFromSave, setIsLoadingFromSave] = useState(false);
  const [hudStage, setHudStage] = useState<'none' | 'wireframe' | 'outline' | 'full'>(DEV_MODE ? 'full' : 'none');
  const [decisionHistory, setDecisionHistory] = useState<Record<string, 'APPROVE' | 'DENY'>>({});
  const [isNewGame, setIsNewGame] = useState(true);
  
  // Phase 5: Subject pool (mix of manual and generated)
  const [subjectPool, setSubjectPool] = useState<SubjectData[]>(() => createDefaultSubjectPool());
  
  // Phase 2: BPM monitoring state
  const [interrogationBPM, setInterrogationBPM] = useState<number | null>(null); // Current BPM during interrogation
  const [isInterrogationActive, setIsInterrogationActive] = useState(false); // Is interrogation active?
  
  // Phase 3: Consequence evaluation state
  const [consequence, setConsequence] = useState<Consequence | null>(null);
  
  // Phase 3: Supervisor warning state
  const [warningTracker, setWarningTracker] = useState<PatternTracker>(createPatternTracker());
  const [currentWarning, setCurrentWarning] = useState<WarningPattern | null>(null);

  // Phase 4: Subject interaction state
  const [interactionPhase, setInteractionPhase] = useState<InteractionPhase>('greeting');
  const [establishedBPM, setEstablishedBPM] = useState<number>(72); // Baseline BPM from greeting
  
  // Phase 5: Split scan modals
  const [showHealthScan, setShowHealthScan] = useState(false);
  const [eyeScannerActive, setEyeScannerActive] = useState(false);
  const [isIdentityScanning, setIsIdentityScanning] = useState(false);
  
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
    showDossier,
    setShowDossier,
    showInterrogate,
    setShowInterrogate,
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
  // Phase 5: Use subject pool instead of hardcoded SUBJECTS
  const currentSubject = getSubjectByIndex(currentSubjectIndex, subjectPool);
  const activeDirective = currentShift.directive;

  const gameOpacity = useRef(new Animated.Value(DEV_MODE ? 1 : 0)).current;

  const triggerScan = () => {
    setIsScanning(true);
    scanProgress.setValue(0);
    setBiometricsRevealed(false);
    // Reset resources for new subject
    useGameStore.getState().resetSubjectResources();
    // Phase 4: Reset to greeting phase
    setInteractionPhase('greeting');
    setEstablishedBPM(72);
    // Phase 5: Reset eye scanner
    setEyeScannerActive(false);

    Animated.timing(scanProgress, {
      toValue: 1,
      duration: 3000,
      useNativeDriver: true,
    }).start(() => {
      setIsScanning(false);
      setBiometricsRevealed(true);
      // Phase 4: Greeting appears automatically in IntelPanel
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
    subjectPoolSize: subjectPool.length, // Phase 5: Pass pool size
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

    const nextIndex = (currentSubjectIndex + 1) % subjectPool.length;
    setCurrentSubjectIndex(nextIndex);
    setScanningHands(false);
    setScanningIris(false);
    setDossierRevealed(false); // Reset dossier for new subject
    setSubjectResponse(''); // Reset subject response
    setShowInterrogate(false); // Reset interrogation modal state
    
    // Phase 2: Reset information tracking for new subject with equipment failures
    const nextSubject = getSubjectByIndex((currentSubjectIndex + 1) % subjectPool.length, subjectPool);
    const equipmentFailures = determineEquipmentFailures(nextSubject.id);
    setGatheredInformation(createEmptyInformation(equipmentFailures));
    setInterrogationBPM(null); // Reset BPM
    setIsInterrogationActive(false); // Reset interrogation state
    setConsequence(null); // Phase 3: Reset consequence
    setCurrentWarning(null); // Phase 3: Reset warning
    // Phase 3: Reset warning pattern tracker for new shift
    setWarningTracker(createPatternTracker());
    // Phase 4: Reset to greeting phase
    setInteractionPhase('greeting');
    setEstablishedBPM(72);
    // Phase 5: Reset eye scanner
    setEyeScannerActive(false);
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
    setGamePhase('active');
    
    // Initialize resources to 3 for first shift
    useGameStore.getState().resetResourcesForShift(3);
    // Initialize credits to 0
    useGameStore.getState().spendCredits(useGameStore.getState().credits); // Reset to 0
    
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
                // Legacy - logic moved into IntelPanel
              }}
              onDecision={handleDecision}
              onNext={() => {
                // Phase 2: Reset information tracking for next subject with equipment failures
                const nextSubjectData = getSubjectByIndex((currentSubjectIndex + 1) % subjectPool.length, subjectPool);
                const equipmentFailures = determineEquipmentFailures(nextSubjectData.id);
                setGatheredInformation(createEmptyInformation(equipmentFailures));
                setInterrogationBPM(null); // Reset BPM
                setIsInterrogationActive(false); // Reset interrogation state
                setConsequence(null); // Phase 3: Reset consequence
                // Phase 4: Reset to greeting phase
                setInteractionPhase('greeting');
                setEstablishedBPM(72);
                nextSubject(); // Call the handler function
              }}
              onScanHands={() => {
                // Legacy - kept for compatibility
              }}
              onIdentityScan={() => {
                const store = useGameStore.getState();
                // Identity scan uses 1 resource (eye scan - reveals dossier/identity)
                // Only works if eye scanner is active
                if (eyeScannerActive && store.useSubjectResource() && !gatheredInformation.identityScan) {
                  setIsIdentityScanning(true);
                  setGatheredInformation(prev => ({
                    ...prev,
                    identityScan: true,
                    timestamps: {
                      ...prev.timestamps,
                      identityScan: Date.now(),
                    },
                  }));
                }
              }}
              onIdentityScanComplete={() => {
                // Called after ID scan animation completes
                setDossierRevealed(true);
                setIsIdentityScanning(false);
              }}
              isIdentityScanning={isIdentityScanning}
              onHealthScan={() => {
                const store = useGameStore.getState();
                // Health scan uses 1 resource (body scan - reveals biometrics/diseases)
                if (store.useSubjectResource() && !gatheredInformation.healthScan) {
                  setGatheredInformation(prev => ({
                    ...prev,
                    healthScan: true,
                    timestamps: {
                      ...prev.timestamps,
                      healthScan: Date.now(),
                    },
                  }));
                  setScanningHands(true);
                  setTimeout(() => {
                    setScanningHands(false);
                    setShowHealthScan(true);
                  }, 1500);
                }
              }}
              identityScanUsed={gatheredInformation.identityScan}
              healthScanUsed={gatheredInformation.healthScan}
              eyeScannerActive={eyeScannerActive}
              onToggleEyeScanner={() => {
                if (!eyeScannerActive) {
                  // Turning on eye scanner uses 1 resource
                  const store = useGameStore.getState();
                  if (store.useSubjectResource()) {
                    setEyeScannerActive(true);
                    setGatheredInformation(prev => ({
                      ...prev,
                      eyeScannerActive: true,
                    }));
                  }
                } else {
                  // Turning off is free
                  setEyeScannerActive(false);
                  setGatheredInformation(prev => ({
                    ...prev,
                    eyeScannerActive: false,
                  }));
                }
              }}
              onEyeScannerTap={() => {
                // Eye scanner tap unlocks dossier without modal
                const store = useGameStore.getState();
                if (store.useSubjectResource() && !gatheredInformation.identityScan) {
                  setGatheredInformation(prev => ({
                    ...prev,
                    identityScan: true,
                    timestamps: {
                      ...prev.timestamps,
                      identityScan: Date.now(),
                    },
                  }));
                  // Unlock dossier directly - no modal
                  setDossierRevealed(true);
                }
              }}
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
              onQueryPerformed={(queryType: 'WARRANT' | 'TRANSIT' | 'INCIDENT') => {
                // Each verification query uses 1 resource
                useGameStore.getState().useSubjectResource();
              }}
              isNewGame={isNewGame}
              equipmentFailures={gatheredInformation.equipmentFailures}
              bpmDataAvailable={gatheredInformation.bpmDataAvailable}
              interrogationBPM={interrogationBPM}
              isInterrogationActive={isInterrogationActive}
              establishedBPM={establishedBPM}
              interactionPhase={interactionPhase}
              onGreetingComplete={() => setInteractionPhase('credentials')}
              onCredentialsComplete={(hasAnomalies) => {
                setInteractionPhase('investigation');
                // Track credential examination in gathered information
                setGatheredInformation(prev => ({
                  ...prev,
                  basicScan: true,
                  timestamps: {
                    ...prev.timestamps,
                    basicScan: Date.now(),
                  },
                }));
              }}
              onEstablishBPM={(bpm) => setEstablishedBPM(bpm)}
            />

            {showDossier && (
              <SubjectDossier 
                data={currentSubject}
                index={currentSubjectIndex}
                activeDirective={activeDirective}
                dossierRevealed={dossierRevealed}
                scanQuality={gatheredInformation.identityScanQuality}
                onClose={() => setShowDossier(false)}
              />
            )}


            {showHealthScan && (
              <HealthScanModal
                subject={currentSubject}
                onClose={() => setShowHealthScan(false)}
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

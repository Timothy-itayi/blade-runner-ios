import React, { useState, useEffect, useRef } from 'react';
import { View, SafeAreaView, Animated } from 'react-native';
// Game components
import { GameScreen } from '../components/game/screen/GameScreen';
import { ShiftTransition } from '../components/game/ShiftTransition';
import { SettingsModal } from '../components/settings/SettingsModal';
// Citation is rendered as an inline strip (diegetic), not a modal.
// Phase 4: Subject interaction phase type
type InteractionPhase = 'greeting' | 'credentials' | 'investigation';
// Boot components
import { OnboardingModal } from '../components/boot/OnboardingModal';
import { DemoOnboardModal } from '../components/demo-onboard/DemoOnboardModal';
import { BootSequence } from '../components/boot/BootSequence';
import { SystemTakeover } from '../components/boot/SystemTakeover';
// Intro components
import { HomeScreen } from '../components/intro/HomeScreen';
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
import { createEmptyInformation, MEMORY_SLOT_CAPACITY } from '../types/information';
import { determineEquipmentFailures } from '../utils/equipmentFailures';
import { SupervisorWarning, WarningPattern } from '../components/game/SupervisorWarning';
import { createPatternTracker, checkWarningPatterns, PatternTracker } from '../utils/warningPatterns';

const DEV_MODE = false; // Set to true to bypass onboarding and boot

export default function MainScreen() {
  const { lives, setLives, resetLives } = useGameStore();
  
  const [gamePhase, setGamePhase] = useState<GamePhase>(DEV_MODE ? 'active' : 'intro');
  const [hasSave, setHasSave] = useState(false);
  const [saveShiftNumber, setSaveShiftNumber] = useState(1);
  const [isLoadingFromSave, setIsLoadingFromSave] = useState(false);
  const [hudStage, setHudStage] = useState<'none' | 'wireframe' | 'outline' | 'full'>(DEV_MODE ? 'full' : 'none');
  const [decisionHistory, setDecisionHistory] = useState<Record<string, 'APPROVE' | 'DENY'>>({});
  const [isNewGame, setIsNewGame] = useState(true);
  
  // Phase 5: Subject pool (full roster)
  const [subjectPool, setSubjectPool] = useState<SubjectData[]>(() => SUBJECTS);
  
  // Phase 2: BPM monitoring state
  const [interrogationBPM, setInterrogationBPM] = useState<number | null>(null); // Current BPM during interrogation
  const [isInterrogationActive, setIsInterrogationActive] = useState(false); // Is interrogation active?
  
  // Phase 3: Consequence evaluation state
  
  // Phase 3: Supervisor warning state
  const [warningTracker, setWarningTracker] = useState<PatternTracker>(createPatternTracker());
  const [currentWarning, setCurrentWarning] = useState<WarningPattern | null>(null);

  // Phase 4: Subject interaction state
  const [interactionPhase, setInteractionPhase] = useState<InteractionPhase>('greeting');
  const [establishedBPM, setEstablishedBPM] = useState<number>(72); // Baseline BPM from greeting
  
  // Phase 5: Split scan modals
  const [eyeScannerActive, setEyeScannerActive] = useState(false);
  const [isIdentityScanning, setIsIdentityScanning] = useState(false);
  
  // Use game state hook
  const gameState = useGameState();
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
    // Phase 4: Reset to greeting phase
    setInteractionPhase('greeting');
    setEstablishedBPM(72);
    // Phase 5: Reset eye scanner
    setEyeScannerActive(false);

    Animated.timing(scanProgress, {
      toValue: 1,
      duration: 4500,
      useNativeDriver: true,
    }).start(() => {
      setIsScanning(false);
      setBiometricsRevealed(true);
      // Phase 4: Greeting appears automatically in IntelPanel
    });
  };

  const getNextFemaleSubjectIndex = React.useCallback(
    (fromIndex: number, poolSize: number) => {
      const size = poolSize || subjectPool.length;
      if (size === 0) return fromIndex;

      const startIndex = (fromIndex + 1) % size;
      for (let offset = 0; offset < size; offset += 1) {
        const candidateIndex = (startIndex + offset) % size;
        const candidate = subjectPool[candidateIndex];
        if (candidate?.sex === 'F') {
          return candidateIndex;
        }
      }

      return startIndex;
    },
    [subjectPool]
  );

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
    getNextSubjectIndex: getNextFemaleSubjectIndex,
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
    // lives handled via store
    triggerScan,
    gatheredInformation, // Phase 3: Pass gathered information for consequence evaluation
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

    const nextIndex = getNextFemaleSubjectIndex(currentSubjectIndex, subjectPool.length);
    setCurrentSubjectIndex(nextIndex);
    setScanningHands(false);
    setScanningIris(false);
    setDossierRevealed(false); // Reset dossier for new subject
    setSubjectResponse(''); // Reset subject response
    setShowInterrogate(false); // Reset interrogation modal state
    
    // Phase 2: Reset information tracking for new subject with equipment failures
    const nextSubject = getSubjectByIndex(nextIndex, subjectPool);
    const equipmentFailures = determineEquipmentFailures(nextSubject.id);
    setGatheredInformation(createEmptyInformation(equipmentFailures));
    setInterrogationBPM(null); // Reset BPM
    setIsInterrogationActive(false); // Reset interrogation state
    setCurrentWarning(null); // Phase 3: Reset warning
    // Phase 3: Reset warning pattern tracker for new shift
    setWarningTracker(createPatternTracker());
    // Phase 4: Reset to greeting phase
    setInteractionPhase('greeting');
    setEstablishedBPM(72);
    // Phase 5: Reset eye scanner
    setEyeScannerActive(false);
    setTimeout(triggerScan, 500);
  };

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
        lives,
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

  // Game over: no lives remaining
  useEffect(() => {
    if (gamePhase !== 'active') return;
    if (lives > 0) return;
    clearSave();
    setHasSave(false);
    setIsNewGame(true);
    setHudStage('none');
    setGamePhase('intro');
  }, [lives, gamePhase]);

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
      setLives(savedData.lives ?? 3);
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
        const phase = savedData.gamePhase === 'news_intro' || savedData.gamePhase === 'introVideo'
          ? 'boot'
          : savedData.gamePhase;
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
    resetLives();
    setTimeout(() => {
      setGamePhase('boot');
    }, 1000);
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
    // Audio stripped.
    
    resetLives();
    
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

        {gamePhase === 'boot' && (
          <BootSequence onComplete={handleBootComplete} />
        )}

        {gamePhase === 'takeover' && (
          <SystemTakeover onComplete={handleTakeoverComplete} />
        )}

        {gamePhase === 'briefing' && (
          <DemoOnboardModal
            visible={true}
            onDismiss={handleBriefingComplete}
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
              lives={lives}
              onSettingsPress={() => setShowSettings(true)}
              onDecision={handleDecision}
              onNext={() => {
                // Phase 2: Reset information tracking for next subject with equipment failures
                const nextIndex = getNextFemaleSubjectIndex(currentSubjectIndex, subjectPool.length);
                const nextSubjectData = getSubjectByIndex(nextIndex, subjectPool);
                const equipmentFailures = determineEquipmentFailures(nextSubjectData.id);
                setGatheredInformation(createEmptyInformation(equipmentFailures));
                setInterrogationBPM(null); // Reset BPM
                setIsInterrogationActive(false); // Reset interrogation state
                // Phase 4: Reset to greeting phase
                setInteractionPhase('greeting');
                setEstablishedBPM(72);
                nextSubject(); // Call the handler function
              }}
              onScanHands={() => {
                // Legacy - kept for compatibility
              }}
              onIdentityScan={(holdDurationMs = 0) => {
                // Model B: Starting a scan consumes a memory slot, not a “resource.”
                // The gathered flag flips ONLY when the scan completes.
                const MIN_HOLD_MS = 600;
                if (holdDurationMs < MIN_HOLD_MS) return;
                if (!eyeScannerActive) {
                  setEyeScannerActive(true);
                  setGatheredInformation(prev => ({
                    ...prev,
                    eyeScannerActive: true,
                  }));
                }
                const active = gatheredInformation.activeServices || [];
                if (gatheredInformation.identityScan) return;
                if (active.includes('IDENTITY_SCAN')) return;
                if (active.length >= MEMORY_SLOT_CAPACITY) return;
                setGatheredInformation(prev => ({
                  ...prev,
                  activeServices: [...(prev.activeServices || []), 'IDENTITY_SCAN'],
                }));
                const quality =
                  holdDurationMs >= 1800
                    ? 'COMPLETE'
                    : holdDurationMs >= 1200
                      ? 'DEEP'
                      : holdDurationMs >= 700
                        ? 'STANDARD'
                        : 'PARTIAL';
                setGatheredInformation(prev => ({
                  ...prev,
                  identityScanQuality: quality,
                }));
                setIsIdentityScanning(true);
              }}
              onIdentityScanComplete={() => {
                // Called after ID scan animation completes.
                setDossierRevealed(true);
                setIsIdentityScanning(false);
                setGatheredInformation(prev => ({
                  ...prev,
                  identityScan: true,
                  timestamps: {
                    ...prev.timestamps,
                    identityScan: Date.now(),
                  },
                  activeServices: (prev.activeServices || []).filter((s) => s !== 'IDENTITY_SCAN'),
                }));
              }}
              isIdentityScanning={isIdentityScanning}
              identityScanUsed={gatheredInformation.identityScan}
              eyeScannerActive={eyeScannerActive}
              onToggleEyeScanner={() => {
                if (!eyeScannerActive) {
                  // Model B: Eye scanner is a channel/tool toggle; turning it on is free.
                  setEyeScannerActive(true);
                  setGatheredInformation(prev => ({
                    ...prev,
                    eyeScannerActive: true,
                  }));
                } else {
                  // Turning off is free
                  setEyeScannerActive(false);
                  setGatheredInformation(prev => ({
                    ...prev,
                    eyeScannerActive: false,
                  }));
                }
              }}
              onEyeScannerTap={(holdDurationMs = 0) => {
                // Tap/hold scan from the eye view. Hold duration upgrades quality.
                const MIN_HOLD_MS = 600;
                if (holdDurationMs < MIN_HOLD_MS) return;
                if (!eyeScannerActive) {
                  setEyeScannerActive(true);
                  setGatheredInformation(prev => ({
                    ...prev,
                    eyeScannerActive: true,
                  }));
                }
                if (gatheredInformation.identityScan) return;

                const quality =
                  holdDurationMs >= 1800
                    ? 'COMPLETE'
                    : holdDurationMs >= 1200
                      ? 'DEEP'
                      : holdDurationMs >= 700
                        ? 'STANDARD'
                        : holdDurationMs > 0
                          ? 'PARTIAL'
                          : undefined;

                const active = gatheredInformation.activeServices || [];
                if (active.includes('IDENTITY_SCAN')) {
                  if (quality) {
                    setGatheredInformation(prev => ({
                      ...prev,
                      identityScanQuality: quality,
                    }));
                  }
                  return;
                }
                if (active.length >= MEMORY_SLOT_CAPACITY) return;
                setGatheredInformation(prev => ({
                  ...prev,
                  activeServices: [...(prev.activeServices || []), 'IDENTITY_SCAN'],
                  ...(quality ? { identityScanQuality: quality } : {}),
                }));
                setIsIdentityScanning(true);
              }}
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
                  lastExtracted: {
                    ...(prev.lastExtracted || {}),
                    ...(info.lastExtracted || {}),
                  },
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
                // Model B: Queries are “files as services” gated by memory slots (handled in drawer).
                void queryType;
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


            {/* Phase 3: Supervisor Warning - Shows mid-shift pattern warnings */}
            <SupervisorWarning
              visible={!!currentWarning}
              warning={currentWarning}
              onDismiss={() => setCurrentWarning(null)}
            />

            {showShiftTransition && (
              <ShiftTransition
                previousShift={currentShift}
                nextShift={getShiftForSubject(getNextFemaleSubjectIndex(currentSubjectIndex, subjectPool.length))}
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

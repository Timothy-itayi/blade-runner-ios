import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, SafeAreaView, Animated } from 'react-native';
import { useRouter } from 'expo-router';
// Game components
import { GameScreen } from '../components/game/screen/GameScreen';
import { ShiftTransition } from '../components/game/ShiftTransition';
import { SettingsModal } from '../components/settings/SettingsModal';
import { FaceLandmarkTfliteTest, FacePipelineProvider } from '../components/game/FaceLandmarkTfliteTest';
// Citation is rendered as an inline strip (diegetic), not a modal.
// Phase 4: Subject interaction phase type
type InteractionPhase = 'greeting' | 'credentials' | 'investigation';
// Boot components
import { OnboardingModal } from '../components/boot/OnboardingModal';
import { DemoOnboardModal } from '../components/demo-onboard/DemoOnboardModal';
import { BootSequence } from '../components/boot/BootSequence';
import AmberLogoScreen from '../components/boot/AmberLogoScreen';
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
// Phase 5: Subject Manager
import { createDefaultSubjectPool, getSubjectByIndex } from '../utils/subjectManager';
import { SubjectData } from '../data/subjects';
import { getShiftForSubject, isEndOfShift, DEMO_FINAL_SHIFT } from '../constants/shifts';
import { useGameStore } from '../store/gameStore';
import { createEmptyInformation, GatheredInformation, MEMORY_SLOT_CAPACITY } from '../types/information';
import { determineEquipmentFailures } from '../utils/equipmentFailures';
import { createPatternTracker, PatternTracker } from '../utils/warningPatterns';

const DEV_MODE = false; // Set to true to bypass onboarding and boot
const SHOW_LANDMARK_TEST = false;
const SINGLE_SUBJECT_MODE = false; // When true, subject pool is first 3 subjects so advancing cycles the 3 procedural base faces

export default function MainScreen() {
  const router = useRouter();
  const decisionLog = useGameStore((state) => state.decisionLog);
  const alertLog = useGameStore((state) => state.alertLog);
  const propagandaFeed = useGameStore((state) => state.propagandaFeed);
  
  const [gamePhase, setGamePhase] = useState<GamePhase>(DEV_MODE ? 'active' : 'intro');
  const [hasSave, setHasSave] = useState(false);
  const [saveShiftNumber, setSaveShiftNumber] = useState(1);
  const [isLoadingFromSave, setIsLoadingFromSave] = useState(false);
  const [hudStage, setHudStage] = useState<'none' | 'wireframe' | 'outline' | 'full'>(DEV_MODE ? 'full' : 'none');
  const [decisionHistory, setDecisionHistory] = useState<Record<string, 'APPROVE' | 'DENY'>>({});
  const [isNewGame, setIsNewGame] = useState(true);
  
  // Phase 5: Subject pool. Use first 3 subjects in single-subject mode so advancing cycles the base faces.
  const [subjectPool, setSubjectPool] = useState<SubjectData[]>(() => {
    const basePool = createDefaultSubjectPool();
    if (!SINGLE_SUBJECT_MODE) return basePool;
    return basePool.slice(0, 3);
  });
  
  // Phase 2: BPM monitoring state
  const [interrogationBPM, setInterrogationBPM] = useState<number | null>(null); // Current BPM during interrogation
  const [isInterrogationActive, setIsInterrogationActive] = useState(false); // Is interrogation active?
  
  // Phase 3: Consequence evaluation state
  
  // Phase 3: Supervisor warning state (modal removed; tracking still used for stats)
  const [warningTracker, setWarningTracker] = useState<PatternTracker>(createPatternTracker());

  // Phase 4: Subject interaction state
  const [interactionPhase, setInteractionPhase] = useState<InteractionPhase>('greeting');
  const [establishedBPM, setEstablishedBPM] = useState<number>(72); // Baseline BPM from greeting
  
  // Phase 5: Split scan modals
  const [eyeScannerActive, setEyeScannerActive] = useState(false);
  const [isIdentityScanning, setIsIdentityScanning] = useState(false);
  const [scanProgressValue, setScanProgressValue] = useState(0);
  
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
    setMessageHistory,
    shiftDecisions,
    setShiftDecisions,
  } = gameState;

  const currentShift = getShiftForSubject(currentSubjectIndex);
  // Phase 5: Use subject pool instead of hardcoded SUBJECTS
  const currentSubject = getSubjectByIndex(currentSubjectIndex, subjectPool);
  const activeDirective = currentShift.directive;
  // AMBER alert flow disabled for test build.

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
      duration: 2500,
      useNativeDriver: true,
    }).start(() => {
      setIsScanning(false);
      setBiometricsRevealed(true);
      // Phase 4: Greeting appears automatically in IntelPanel
    });
  };

  // Simple sequential index for demo (Eva → Mara → Chen → end of shift)
  const getNextSubjectIndexSequential = React.useCallback(
    (fromIndex: number, poolSize: number) => {
      const size = poolSize || subjectPool.length;
      if (size === 0) return fromIndex;
      return (fromIndex + 1) % size;
    },
    [subjectPool]
  );

  const handleShiftContinue = () => {
    setShowShiftTransition(false);
    setHasDecision(false);
    setShiftStats({ approved: 0, denied: 0, correct: 0 });
    setShiftDecisions([]);

    const nextIndex = getNextSubjectIndexSequential(currentSubjectIndex, subjectPool.length);
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
    // Phase 3: Reset warning pattern tracker for new shift
    setWarningTracker(createPatternTracker());
    // Phase 4: Reset to greeting phase
    setInteractionPhase('greeting');
    setEstablishedBPM(72);
    // Phase 5: Reset eye scanner
    setEyeScannerActive(false);
    setTimeout(triggerScan, 200);
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
    getNextSubjectIndex: getNextSubjectIndexSequential,
    setCurrentSubjectIndex,
    setBiometricsRevealed,
    setSubjectsProcessed,
    onShiftAdvance: handleShiftContinue,
    currentSubjectIndex,
    currentSubject,
    currentShift,
    decisionHistory,
    totalCorrectDecisions,
    totalAccuracy,
    infractions,
    triggerConsequence,
    triggerScan,
    gatheredInformation, // Phase 3: Pass gathered information for consequence evaluation
    onWarningPattern: () => {}, // Modal removed: no popup when approving without checking
    warningTracker, // Phase 3: Pattern tracking
    setWarningTracker, // Phase 3: Update pattern tracker
  });

  const handleInformationUpdate = (infoUpdate: Partial<GatheredInformation>) => {
    setGatheredInformation((prev) => ({
      ...prev,
      ...infoUpdate,
      timestamps: { ...prev.timestamps, ...infoUpdate.timestamps },
      lastExtracted: { ...prev.lastExtracted, ...infoUpdate.lastExtracted },
      activeServices: infoUpdate.activeServices ?? prev.activeServices,
    }));
  };

  const handleMainMenu = async () => {
    // Clear save data so Continue button doesn't appear
    await clearSave();
    setHasSave(false);
    
    // Reset all game state and return to main menu
    setShowShiftTransition(false);
    setHasDecision(false);
    setShiftStats({ approved: 0, denied: 0, correct: 0 });
    setShiftDecisions([]);
    setCurrentSubjectIndex(0);
    setScanningHands(false);
    setScanningIris(false);
    setDossierRevealed(false);
    setSubjectResponse('');
    setShowInterrogate(false);
    setGatheredInformation(createEmptyInformation());
    setInterrogationBPM(null);
    setIsInterrogationActive(false);
    setWarningTracker(createPatternTracker());
    setInteractionPhase('greeting');
    setEstablishedBPM(72);
    setEyeScannerActive(false);
    setIsIdentityScanning(false);
    setBiometricsRevealed(false);
    setDecisionHistory({});
    setTotalCorrectDecisions(0);
    setTotalAccuracy(0);
    setInfractions(0);
    setMessageHistory([]);
    setSubjectsProcessed(0);
    setHudStage('none');
    // Return to home screen
    setGamePhase('intro');
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
        decisionLog,
        alertLog,
        propagandaFeed,
        subjectsProcessed,
      });
    }
  };

  // Auto-save when game state changes
  useEffect(() => {
    if (!isLoadingFromSave && (gamePhase === 'active' || gamePhase === 'briefing')) {
      performSave();
    }
  }, [currentSubjectIndex, totalCorrectDecisions, infractions, gamePhase, decisionLog, alertLog, propagandaFeed]);

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
      useGameStore.getState().setDecisionLog(savedData.decisionLog || []);
      useGameStore.getState().setAlertLog(savedData.alertLog || []);
      useGameStore.getState().setPropagandaFeed(savedData.propagandaFeed || []);
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
    useGameStore.getState().clearDecisionLog();
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
    setGamePhase('logo');
  };

  const handleLogoComplete = () => {
    setGamePhase('briefing');
  };

  const handleBriefingComplete = () => {
    setGamePhase('active');
    
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

  useEffect(() => {
    const id = scanProgress.addListener(({ value }) => {
      setScanProgressValue(value);
    });
    return () => {
      scanProgress.removeListener(id);
    };
  }, [scanProgress]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <FacePipelineProvider warmCacheActive={DEV_MODE || gamePhase !== 'active'}>
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

        {gamePhase === 'logo' && (
          <AmberLogoScreen onComplete={handleLogoComplete} />
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
              scanningHands={false}
              scanningIris={false}
              biometricsRevealed={biometricsRevealed}
              hasDecision={hasDecision}
              decisionOutcome={decisionOutcome}
              onSettingsPress={() => setShowSettings(true)}
              onDecision={handleDecision}
              onNext={() => {
                setEyeScannerActive(false);
                setIsIdentityScanning(false);
                nextSubject();
              }}
              eyeScannerActive={eyeScannerActive}
              onToggleEyeScanner={() => setEyeScannerActive(!eyeScannerActive)}
              onEyeScannerTap={(holdDurationMs = 0) => {
                if (holdDurationMs >= 600 && !eyeScannerActive) {
                  setEyeScannerActive(true);
                }
                if (holdDurationMs >= 600) {
                  setIsIdentityScanning(true);
                }
              }}
              isIdentityScanning={isIdentityScanning}
              identityScanUsed={false}
              onIdentityScanComplete={() => setIsIdentityScanning(false)}
              gatheredInformation={gatheredInformation}
              onInformationUpdate={handleInformationUpdate}
            />
            {/* AMBER alert flow disabled for test build */}

            {DEV_MODE && SHOW_LANDMARK_TEST && (
              <FaceLandmarkTfliteTest
                scanProgress={scanProgressValue}
                isScanning={isScanning}
              />
            )}

            {showShiftTransition && (
              <ShiftTransition
                previousShift={currentShift}
                nextShift={getShiftForSubject(getNextSubjectIndexSequential(currentSubjectIndex, subjectPool.length))}
                approvedCount={shiftStats.approved}
                deniedCount={shiftStats.denied}
                shiftDecisions={shiftDecisions}
                onContinue={handleShiftContinue}
                isEndOfDemo={currentShift.id === DEMO_FINAL_SHIFT}
                onMainMenu={handleMainMenu}
              />
            )}

            <SettingsModal
              visible={showSettings}
              onClose={() => setShowSettings(false)}
              shiftData={currentShift}
            />
          </Animated.View>
        )}
      </View>
      </FacePipelineProvider>
    </SafeAreaView>
  );
}

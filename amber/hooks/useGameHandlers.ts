import { SubjectData } from '../data/subjects';
import { ShiftData, DEMO_FINAL_SHIFT } from '../constants/shifts';
import { Outcome } from '../data/subjects';
import { ShiftDecision } from '../components/game/ShiftTransition';
import { getNarrativeMessage, getSubjectData } from '../utils/gameHelpers';
import { isEndOfShift } from '../constants/shifts';
import { useGameStore } from '../store/gameStore';
import { evaluateConsequence, Consequence } from '../types/consequence';
import { GatheredInformation } from '../types/information';
import { checkWarningPatterns, PatternTracker } from '../utils/warningPatterns';
import { WarningPattern } from '../components/game/SupervisorWarning';

interface GameHandlersProps {
  // State setters
  setInfractions: (value: number | ((prev: number) => number)) => void;
  setTriggerConsequence: (value: boolean) => void;
  setDecisionHistory: (value: Record<string, 'APPROVE' | 'DENY'> | ((prev: Record<string, 'APPROVE' | 'DENY'>) => Record<string, 'APPROVE' | 'DENY'>)) => void;
  setShiftDecisions: (value: ShiftDecision[] | ((prev: ShiftDecision[]) => ShiftDecision[])) => void;
  setShiftStats: (value: { approved: number; denied: number; correct: number } | ((prev: { approved: number; denied: number; correct: number }) => { approved: number; denied: number; correct: number })) => void;
  setTotalCorrectDecisions: (value: number | ((prev: number) => number)) => void;
  setTotalAccuracy: (value: number | ((prev: number) => number)) => void;
  setDecisionOutcome: (value: { type: 'APPROVE' | 'DENY', outcome: Outcome } | null) => void;
  setHasDecision: (value: boolean) => void;
  setMessageHistory: (value: string[] | ((prev: string[]) => string[])) => void;
  setShowShiftTransition: (value: boolean) => void;
  setCurrentSubjectIndex: (value: number | ((prev: number) => number)) => void;
  setBiometricsRevealed: (value: boolean) => void;
  setSubjectsProcessed: (value: number | ((prev: number) => number)) => void;
  onShiftAdvance?: () => void;
  
  // State values
  currentSubjectIndex: number;
  currentSubject: SubjectData;
  currentShift: ShiftData;
  decisionHistory: Record<string, 'APPROVE' | 'DENY'>;
  totalCorrectDecisions: number;
  totalAccuracy: number;
  infractions: number;
  triggerConsequence: boolean;
  gatheredInformation?: GatheredInformation; // Phase 3: Information gathered for consequence evaluation
  
  // Functions
  triggerScan: () => void;
  setConsequence?: (consequence: Consequence | null) => void; // Phase 3: Store consequence result
  onWarningPattern?: (warning: import('../components/game/SupervisorWarning').WarningPattern | null) => void; // Phase 3: Trigger supervisor warning
  warningTracker?: import('../utils/warningPatterns').PatternTracker; // Phase 3: Pattern tracking state
  setWarningTracker?: (tracker: import('../utils/warningPatterns').PatternTracker) => void; // Phase 3: Update pattern tracker
  
  // Phase 5: Subject pool size
  subjectPoolSize?: number;
  getNextSubjectIndex?: (currentIndex: number, poolSize: number) => number;
}

export const useGameHandlers = (props: GameHandlersProps) => {
  const {
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
  onShiftAdvance,
    currentSubjectIndex,
    currentSubject,
    currentShift,
    decisionHistory,
    totalCorrectDecisions,
    totalAccuracy,
    infractions,
    triggerConsequence,
    triggerScan,
    gatheredInformation,
    setConsequence,
    onWarningPattern,
    warningTracker,
    setWarningTracker,
    subjectPoolSize,
    getNextSubjectIndex,
  } = props;

  const handleDecision = (type: 'APPROVE' | 'DENY') => {
    // Phase 3: Use consequence evaluation instead of binary correct/wrong
    const defaultInfo: GatheredInformation = {
      basicScan: true,
      identityScan: false,
      warrantCheck: false,
      transitLog: false,
      incidentHistory: false,
      interrogation: { questionsAsked: 0, responses: [], bpmChanges: [] },
      equipmentFailures: [],
      bpmDataAvailable: true,
      eyeScannerActive: false,
      activeServices: [],
      lastExtracted: {},
      timestamps: {},
    };
    
    const info = gatheredInformation || defaultInfo;
    const consequence = evaluateConsequence(
      currentSubject,
      type,
      info,
      currentShift,
      infractions
    );
    
    // Store consequence for citation modal
    setConsequence?.(consequence);
    
    // Phase 3: Check for supervisor warning patterns
    if (warningTracker && setWarningTracker && onWarningPattern) {
      const hasEquipmentFailure = (gatheredInformation?.equipmentFailures?.length || 0) > 0;
      const warning = checkWarningPatterns(type, info, warningTracker, hasEquipmentFailure);
      if (warning) {
        onWarningPattern(warning);
        // Update tracker (it's mutated in checkWarningPatterns, but we should set it for React)
        setWarningTracker({ ...warningTracker });
      }
    }
    
    // Determine if decision was "correct" based on consequence severity
    const correct = consequence.type === 'NONE' || consequence.type === 'WARNING';

    const store = useGameStore.getState();
    
    // Determine deny reason for display
    let denyReason: string | undefined;
    if (type === 'DENY') {
      if (currentSubject.warrants && currentSubject.warrants !== 'NONE') {
        denyReason = `WARRANT: ${currentSubject.warrants}`;
      } else if (currentSubject.intendedOutcome === 'DENY') {
        denyReason = 'DIRECTIVE VIOLATION';
      } else {
        denyReason = 'OPERATOR DISCRETION';
      }
    }
    
    store.addDecisionLog({
      subjectId: currentSubject.id,
      subjectName: currentSubject.name,
      decision: type,
      correct,
      subjectType: currentSubject.subjectType,
      sex: currentSubject.sex,
      originPlanet: currentSubject.originPlanet,
      destinationPlanet: currentSubject.destinationPlanet,
      permitType: currentSubject.dossier?.occupation,
      warrants: currentSubject.warrants,
      denyReason,
    });
    if (currentShift.id > 1 && currentSubject.alertScenario) {
      const existingAlert = store.alertLog.find(entry => entry.subjectId === currentSubject.id);
      if (!existingAlert) {
        store.addAlert({
          subjectId: currentSubject.id,
          subjectName: currentSubject.name,
          scenario: currentSubject.alertScenario,
          outcome: 'PENDING',
        });
      }
    }
    if (consequence.type === 'NONE') {
      // Clean decision: no life loss
    } else if (consequence.type === 'WARNING') {
      setInfractions(prev => prev + consequence.infractionCount);
      setTriggerConsequence(true);
    } else {
      setInfractions(prev => prev + consequence.infractionCount);
      setTriggerConsequence(true);
    }

    // Save decision to history
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
  };

  const nextSubject = () => {
    const store = useGameStore.getState();

    // Reset biometrics revelation and dossier for next subject
    setBiometricsRevealed(false);
    // Note: dossierRevealed should be reset here but we need to pass setDossierRevealed
    setSubjectsProcessed(prev => prev + 1);

    setDecisionOutcome(null);
    setHasDecision(false);
    
    // Phase 1: Reset information tracking for next subject
    // This will be handled by the component that uses this hook
    // by calling setGatheredInformation(createEmptyInformation())

    const poolSize = subjectPoolSize || 1;
    const nextIndex = getNextSubjectIndex
      ? getNextSubjectIndex(currentSubjectIndex, poolSize)
      : (currentSubjectIndex + 1) % poolSize;

    const endOfShift = isEndOfShift(currentSubjectIndex);
    const isEndOfDemo = endOfShift && currentShift.id === DEMO_FINAL_SHIFT;

    // Queue narrative messages silently
    if (triggerConsequence || endOfShift) {
      const msg = getNarrativeMessage(
        triggerConsequence,
        infractions,
        totalAccuracy,
        currentShift
      );
      if (msg) {
        setMessageHistory(prev => [...prev, msg]);
      }
    }
    setTriggerConsequence(false);

    // Check if we're at end of shift
    if (isEndOfDemo) {
      setShowShiftTransition(true);
      return;
    }

    if (endOfShift) {
      onShiftAdvance?.();
      return;
    }

    setCurrentSubjectIndex(nextIndex);
    setTimeout(triggerScan, 200);
  };

  return {
    handleDecision,
    nextSubject,
  };
};

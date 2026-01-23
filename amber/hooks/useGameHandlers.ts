import { SubjectData } from '../data/subjects';
import { ShiftData } from '../constants/shifts';
import { Outcome } from '../data/subjects';
import { ShiftDecision } from '../components/game/ShiftTransition';
import { getNarrativeMessage, getSubjectData } from '../utils/gameHelpers';
import { SUBJECTS } from '../data/subjects';
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
  
  // State values
  currentSubjectIndex: number;
  currentSubject: SubjectData;
  currentShift: ShiftData;
  decisionHistory: Record<string, 'APPROVE' | 'DENY'>;
  totalCorrectDecisions: number;
  totalAccuracy: number;
  infractions: number;
  triggerConsequence: boolean;
  familyNeeds: { food: number; medicine: number; housing: number };
  daysPassed: number;
  gatheredInformation?: GatheredInformation; // Phase 3: Information gathered for consequence evaluation
  
  // Functions
  triggerScan: () => void;
  setConsequence?: (consequence: Consequence | null) => void; // Phase 3: Store consequence result
  onWarningPattern?: (warning: import('../components/game/SupervisorWarning').WarningPattern | null) => void; // Phase 3: Trigger supervisor warning
  warningTracker?: import('../utils/warningPatterns').PatternTracker; // Phase 3: Pattern tracking state
  setWarningTracker?: (tracker: import('../utils/warningPatterns').PatternTracker) => void; // Phase 3: Update pattern tracker
  
  // Phase 5: Subject pool size
  subjectPoolSize?: number; // If not provided, uses SUBJECTS.length
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
    gatheredInformation,
    setConsequence,
    onWarningPattern,
    warningTracker,
    setWarningTracker,
    subjectPoolSize,
  } = props;

  const handleDecision = (type: 'APPROVE' | 'DENY') => {
    // Phase 3: Use consequence evaluation instead of binary correct/wrong
    const defaultInfo: GatheredInformation = {
      basicScan: true,
      identityScan: false,
      healthScan: false,
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

    // Credits system: +3 for correct - resources used, -2 for wrong (still pay resources)
    const store = useGameStore.getState();
    const resourcesUsed = store.currentSubjectResources;
    
    // Phase 3: Credits based on consequence severity
    if (consequence.type === 'NONE') {
      // Perfect decision: earn credits, deduct resources
      store.addCredits(3);
      if (resourcesUsed > 0) {
        store.spendCredits(resourcesUsed);
      }
    } else if (consequence.type === 'WARNING') {
      // Minor issue: small credit gain
      store.addCredits(1);
      if (resourcesUsed > 0) {
        store.spendCredits(resourcesUsed);
      }
      setInfractions(prev => prev + consequence.infractionCount);
      setTriggerConsequence(true);
    } else {
      // Citation or serious infraction: lose credits
      store.spendCredits(consequence.creditsPenalty);
      if (resourcesUsed > 0) {
        store.spendCredits(resourcesUsed);
      }
      setInfractions(prev => prev + consequence.infractionCount);
      setTriggerConsequence(true);
    }
    
    // Reset resources for next subject
    store.resetSubjectResources();

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
    // Reset biometrics revelation and dossier for next subject
    setBiometricsRevealed(false);
    // Note: dossierRevealed should be reset here but we need to pass setDossierRevealed
    setSubjectsProcessed(prev => prev + 1);

    setDecisionOutcome(null);
    setHasDecision(false);
    
    // Phase 1: Reset information tracking for next subject
    // This will be handled by the component that uses this hook
    // by calling setGatheredInformation(createEmptyInformation())

    const poolSize = props.subjectPoolSize || SUBJECTS.length;
    const nextIndex = (currentSubjectIndex + 1) % poolSize;

    // Queue narrative messages silently
    if (triggerConsequence || isEndOfShift(currentSubjectIndex)) {
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
    if (isEndOfShift(currentSubjectIndex) && nextIndex !== 0) {
      // Deduct family needs at end of shift
      const totalNeeds = familyNeeds.food + (familyNeeds.medicine / 7) + (familyNeeds.housing / 30);
      const store = useGameStore.getState();
      store.spendCredits(Math.floor(totalNeeds));
      
      // Reset resources for new shift (3 per shift)
      store.resetResourcesForShift(3);
      
      // Update family needs
      // Note: This logic should be moved to a helper or hook
      
      setShowShiftTransition(true);
    } else {
      setCurrentSubjectIndex(nextIndex);
      setTimeout(triggerScan, 1200);
    }
  };

  return {
    handleDecision,
    nextSubject,
  };
};

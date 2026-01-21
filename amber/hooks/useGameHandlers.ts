import { SubjectData } from '../data/subjects';
import { ShiftData } from '../constants/shifts';
import { Outcome } from '../data/subjects';
import { ShiftDecision } from '../components/game/ShiftTransition';
import { isDecisionCorrect, getNarrativeMessage, getSubjectData } from '../utils/gameHelpers';
import { SUBJECTS } from '../data/subjects';
import { isEndOfShift } from '../constants/shifts';
import { useGameStore } from '../store/gameStore';

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
  
  // Functions
  triggerScan: () => void;
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
  } = props;

  const handleDecision = (type: 'APPROVE' | 'DENY') => {
    const correct = isDecisionCorrect(currentSubject, type, currentShift);

    // Credits system: +3 for correct - resources used, -2 for wrong (still pay resources)
    const store = useGameStore.getState();
    const resourcesUsed = store.currentSubjectResources;
    
    if (correct) {
      // Earn 3 credits for correct decision, then deduct resources used
      store.addCredits(3);
      if (resourcesUsed > 0) {
        store.spendCredits(resourcesUsed);
      }
    } else {
      // Wrong decision: lose 2 credits, still pay for resources used
      store.spendCredits(2);
      if (resourcesUsed > 0) {
        store.spendCredits(resourcesUsed);
      }
      setInfractions(prev => prev + 1);
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

    const nextIndex = (currentSubjectIndex + 1) % SUBJECTS.length;

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
      setTimeout(triggerScan, 500);
    }
  };

  return {
    handleDecision,
    nextSubject,
  };
};

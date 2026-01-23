import { Theme } from './theme';

export const SUBJECTS_PER_SHIFT = 3;

export interface ShiftData {
  id: number;
  timeBlock: string;
  chapter: string;
  stationName: string;
  authorityLabel: string;
  briefing: string;
  directive: string; // Like Papers Please - must follow or get citation
  unlockedChecks: ('DATABASE' | 'CREDENTIAL' | 'MEDICAL' | 'TURING')[];
  activeRules: string[];
}

export const SHIFTS: ShiftData[] = [
  // =============================================================================
  // SHIFT 1: ROUTINE (Subjects 1-4)
  // =============================================================================
  {
    id: 1,
    timeBlock: '06:00',
    chapter: 'Routine',
    stationName: 'EARTH BORDER CONTROL',
    authorityLabel: 'AMBER SECURITY',
    briefing: 'Establish baseline efficiency. Process interplanetary arrivals.',
    directive: 'DENY ALL SUBJECTS WITH ACTIVE WARRANTS',
    unlockedChecks: ['DATABASE'],
    activeRules: ['CHECK_WARRANTS'],
  },
  // =============================================================================
  // SHIFT 2: COMPLEXITY (Subjects 5-8)
  // =============================================================================
  {
    id: 2,
    timeBlock: '12:00',
    chapter: 'Complexity',
    stationName: 'EARTH BORDER CONTROL',
    authorityLabel: 'AMBER SECURITY',
    briefing: 'Increased traffic. Verify all credentials. Watch for discrepancies.',
    directive: 'VERIFY ALL CREDENTIALS BEFORE APPROVAL',
    unlockedChecks: ['DATABASE', 'CREDENTIAL'],
    activeRules: ['CHECK_WARRANTS', 'CHECK_CREDENTIALS'],
  },
  // =============================================================================
  // SHIFT 3: PRESSURE (Subjects 9-12)
  // =============================================================================
  {
    id: 3,
    timeBlock: '18:00',
    chapter: 'Pressure',
    stationName: 'EARTH BORDER CONTROL',
    authorityLabel: 'AMBER SECURITY',
    briefing: 'High volume. Equipment failures increasing. Make final calls.',
    directive: 'DENY ALL SYNTHETIC ENTITIES (REPLICANTS, ROBOTS)',
    unlockedChecks: ['DATABASE', 'CREDENTIAL', 'TURING'],
    activeRules: ['CHECK_WARRANTS', 'DENY_SYNTHETIC', 'TURING_TEST'],
  },
];

export const getShiftForSubject = (subjectIndex: number): ShiftData => {
  const shiftIndex = Math.floor(subjectIndex / SUBJECTS_PER_SHIFT);
  // Clamp to last shift if we exceed defined shifts
  return SHIFTS[Math.min(shiftIndex, SHIFTS.length - 1)];
};

export const getSubjectsInCurrentShift = (subjectIndex: number): number => {
  return (subjectIndex % SUBJECTS_PER_SHIFT) + 1;
};

export const isEndOfShift = (subjectIndex: number): boolean => {
  return (subjectIndex + 1) % SUBJECTS_PER_SHIFT === 0;
};

import { Theme } from './theme';
import type { DirectiveRule } from '../types/directive';
import { DIRECTIVES } from '../data/directives';

export const SUBJECTS_PER_SHIFT = 7;
export const DEMO_FINAL_SHIFT = 3; // Demo ends after this shift

export interface ShiftData {
  id: number;
  timeBlock: string;
  chapter: string;
  stationName: string;
  authorityLabel: string;
  briefing: string;
  directive: string; // Like Papers Please - must follow or get citation
  directiveModel?: DirectiveRule;
  unlockedChecks: ('DATABASE' | 'CREDENTIAL' | 'MEDICAL' | 'TURING')[];
  activeRules: string[];
}

export const SHIFTS: ShiftData[] = [
  // =============================================================================
  // SHIFT 1: CLEARANCE CHECK (7 subjects)
  // Simple warrant check. Deny anyone with an active warrant.
  // 1 alert expected
  // =============================================================================
  {
    id: 1,
    timeBlock: '06:00',
    chapter: 'Clearance Check',
    stationName: 'AMBER DEPOT PERIMETER',
    authorityLabel: 'DEPOT SECURITY',
    briefing: 'Standard transit verification in effect. Deny anyone with an active warrant.',
    directive: DIRECTIVES.SHIFT_1.text.join('\n'),
    directiveModel: DIRECTIVES.SHIFT_1,
    unlockedChecks: ['DATABASE'],
    activeRules: ['CHECK_WARRANTS'],
  },
  // =============================================================================
  // SHIFT 2: SCRUTINY (7 subjects)
  // Engineers denied except medical staff
  // 2 alerts expected
  // =============================================================================
  {
    id: 2,
    timeBlock: '12:00',
    chapter: 'Scrutiny',
    stationName: 'AMBER DEPOT PERIMETER',
    authorityLabel: 'DEPOT SECURITY',
    briefing: 'New directive from Central. Engineers require additional scrutiny. Medical staff are exempt.',
    directive: DIRECTIVES.SHIFT_2.text.join('\n'),
    directiveModel: DIRECTIVES.SHIFT_2,
    unlockedChecks: ['DATABASE', 'CREDENTIAL'],
    activeRules: ['CHECK_WARRANTS', 'CHECK_OCCUPATION'],
  },
  // =============================================================================
  // SHIFT 3: LOCKDOWN (7 subjects)
  // Deny flagged transit reports
  // Mixed alerts and subjects
  // =============================================================================
  {
    id: 3,
    timeBlock: '18:00',
    chapter: 'Lockdown',
    stationName: 'AMBER DEPOT PERIMETER',
    authorityLabel: 'DEPOT SECURITY',
    briefing: 'Tightened access. Deny subjects with flagged transit history.',
    directive: DIRECTIVES.SHIFT_3.text.join('\n'),
    directiveModel: DIRECTIVES.SHIFT_3,
    unlockedChecks: ['DATABASE', 'CREDENTIAL'],
    activeRules: ['CHECK_TRANSIT'],
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

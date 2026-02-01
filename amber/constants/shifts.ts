import { Theme } from './theme';
import type { DirectiveRule } from '../types/directive';
import { DIRECTIVES } from '../data/directives';

export const SUBJECTS_PER_SHIFT = 9;

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
  // SHIFT 1: CLEARANCE CHECK (Subjects 1-4)
  // =============================================================================
  {
    id: 1,
    timeBlock: '06:00',
    chapter: 'Clearance Check',
    stationName: 'AMBER DEPOT PERIMETER',
    authorityLabel: 'DEPOT SECURITY',
    briefing: 'Standard transit verification in effect. Verify all personnel requesting depot access.',
    directive: DIRECTIVES.SHIFT_1.text.join('\n'),
    directiveModel: DIRECTIVES.SHIFT_1,
    unlockedChecks: ['DATABASE'],
    activeRules: ['CHECK_WARRANTS'],
  },
  // =============================================================================
  // SHIFT 2: COMPROMISE (Subjects 5-8)
  // =============================================================================
  {
    id: 2,
    timeBlock: '12:00',
    chapter: 'Compromise',
    stationName: 'AMBER DEPOT PERIMETER',
    authorityLabel: 'DEPOT SECURITY',
    briefing: 'Infiltration depth increasing. High level of deceptive patterns observed.',
    directive: DIRECTIVES.SHIFT_2.text.join('\n'),
    directiveModel: DIRECTIVES.SHIFT_2,
    unlockedChecks: ['DATABASE', 'CREDENTIAL'],
    activeRules: ['CHECK_WARRANTS', 'CHECK_CREDENTIALS'],
  },
  // =============================================================================
  // SHIFT 3: LOCKDOWN (Subjects 9-12)
  // =============================================================================
  {
    id: 3,
    timeBlock: '18:00',
    chapter: 'Lockdown',
    stationName: 'AMBER DEPOT PERIMETER',
    authorityLabel: 'DEPOT SECURITY',
    briefing: 'Final security tier breach imminent. No unauthorized entities permitted.',
    directive: DIRECTIVES.SHIFT_3.text.join('\n'),
    directiveModel: DIRECTIVES.SHIFT_3,
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

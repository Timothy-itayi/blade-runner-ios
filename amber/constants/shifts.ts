import { Theme } from './theme';

export const SUBJECTS_PER_SHIFT = 4;

export interface ShiftData {
  id: number;
  timeBlock: string;
  stationName: string;
  city: string;
  authorityLabel: string;
  briefing: string;
  unlockedChecks: ('SECTOR' | 'FUNCTION' | 'WARRANT' | 'MEDICAL')[];
  // Rules that are active for this shift
  activeRules: string[];
}

export const SHIFTS: ShiftData[] = [
  // ACT 1: The Routine - Peripheral sectors, mundane decisions
  {
    id: 1,
    timeBlock: '06:00',
    stationName: 'SECTOR 9',
    city: 'São Paulo',
    authorityLabel: 'POLÍCIA SSP',
    briefing: 'STANDARD PROTOCOL: DENY ALL ACTIVE WARRANTS.',
    unlockedChecks: ['WARRANT'],
    activeRules: ['CHECK_WARRANTS'],
  },
  {
    id: 2,
    timeBlock: '10:00',
    stationName: 'SECTOR 8',
    city: 'Mumbai',
    authorityLabel: 'पुलिस POLICE',
    briefing: 'UPDATE: VERIFY ALL CREDENTIALS BEFORE TRANSIT.',
    unlockedChecks: ['WARRANT', 'SECTOR'],
    activeRules: ['CHECK_WARRANTS', 'CHECK_CREDENTIALS'],
  },
  // ACT 2: The Cracks - Industrial sectors, things feel off
  {
    id: 3,
    timeBlock: '14:00',
    stationName: 'SECTOR 7',
    city: 'Los Angeles',
    authorityLabel: '警察 LAPD',
    briefing: 'NOTICE: SANITATION WORKERS REQUIRE SECTOR-SPECIFIC PERMITS.',
    unlockedChecks: ['WARRANT', 'SECTOR', 'FUNCTION'],
    activeRules: ['CHECK_WARRANTS', 'CHECK_SECTOR', 'CHECK_FUNCTION'],
  },
  {
    id: 4,
    timeBlock: '18:00',
    stationName: 'SECTOR 6',
    city: 'Berlin',
    authorityLabel: 'POLIZEI BKA',
    briefing: 'ALERT: ELEVATED BPM (>100) REQUIRES SECONDARY REVIEW.',
    unlockedChecks: ['WARRANT', 'SECTOR', 'FUNCTION', 'MEDICAL'],
    activeRules: ['CHECK_WARRANTS', 'CHECK_SECTOR', 'CHECK_FUNCTION', 'CHECK_BPM'],
  },
  // ACT 3: The Revolution Seeds - Standard sectors, strange patterns
  {
    id: 5,
    timeBlock: '22:00',
    stationName: 'SECTOR 5',
    city: 'Tokyo',
    authorityLabel: '警視庁',
    briefing: 'PRIORITY: EXPEDITE ENGINEERING PERSONNEL. IGNORE MINOR FLAGS.',
    unlockedChecks: ['WARRANT', 'SECTOR', 'FUNCTION', 'MEDICAL'],
    activeRules: ['CHECK_WARRANTS', 'EXPEDITE_ENGINEERING', 'CHECK_FUNCTION', 'CHECK_BPM'],
  },
  {
    id: 6,
    timeBlock: '02:00',
    stationName: 'SECTOR 4',
    city: 'Moscow',
    authorityLabel: 'ПОЛИЦИЯ МВД',
    briefing: 'CORRECTION: ALL FLAGS ARE MANDATORY. NO EXCEPTIONS.',
    unlockedChecks: ['WARRANT', 'SECTOR', 'FUNCTION', 'MEDICAL'],
    activeRules: ['CHECK_WARRANTS', 'CHECK_SECTOR', 'CHECK_FUNCTION', 'CHECK_BPM', 'CONTRADICTION_ACTIVE'],
  },
  // ACT 4: The Hack - Critical sectors, chaos
  {
    id: 7,
    timeBlock: '08:00',
    stationName: 'SECTOR 3',
    city: 'Beijing',
    authorityLabel: '保安部',
    briefing: 'NOTICE: ALL SUBJECTS FROM REVOKED SECTORS MUST BE DETAINED.',
    unlockedChecks: ['WARRANT', 'SECTOR', 'FUNCTION', 'MEDICAL'],
    activeRules: ['CHECK_WARRANTS', 'CHECK_SECTOR', 'CHECK_FUNCTION', 'CHECK_BPM'],
  },
  {
    id: 8,
    timeBlock: '12:00',
    stationName: 'SECTOR 2',
    city: 'Cairo',
    authorityLabel: 'الأمن العام',
    briefing: 'CRITICAL: MEDICAL PERSONNEL ONLY. ALL OTHERS DENIED.',
    unlockedChecks: ['WARRANT', 'SECTOR', 'FUNCTION', 'MEDICAL'],
    activeRules: ['CHECK_WARRANTS', 'CHECK_SECTOR', 'CHECK_FUNCTION', 'CHECK_BPM', 'MEDICAL_ONLY'],
  },
  // ACT 5: The Silence - High Command, the end
  {
    id: 9,
    timeBlock: '16:00',
    stationName: 'SECTOR 1',
    city: 'Geneva',
    authorityLabel: 'INTERPOL HQ',
    briefing: 'FINAL DIRECTIVE: PROCESS ALL REMAINING SUBJECTS.',
    unlockedChecks: ['WARRANT', 'SECTOR', 'FUNCTION', 'MEDICAL'],
    activeRules: ['CHECK_WARRANTS', 'CHECK_SECTOR', 'CHECK_FUNCTION', 'CHECK_BPM'],
  },
  {
    id: 10,
    timeBlock: '20:00',
    stationName: 'SECTOR 0',
    city: 'CORE',
    authorityLabel: 'SYSTEM',
    briefing: 'END OF SHIFT. PROCESS FINAL SUBJECT.',
    unlockedChecks: ['WARRANT', 'SECTOR', 'FUNCTION', 'MEDICAL'],
    activeRules: ['CHECK_WARRANTS', 'CHECK_SECTOR', 'CHECK_FUNCTION', 'CHECK_BPM'],
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

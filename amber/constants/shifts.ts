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
  {
    id: 1,
    timeBlock: '08:50',
    stationName: 'SECTOR 7',
    city: 'Los Angeles',
    authorityLabel: '警察 LAPD',
    briefing: 'STANDARD PROTOCOL: DENY ALL ACTIVE WARRANTS.',
    unlockedChecks: ['WARRANT'],
    activeRules: ['CHECK_WARRANTS'],
  },
  {
    id: 2,
    timeBlock: '04:50',
    stationName: 'SECTOR 12',
    city: 'Moscow',
    authorityLabel: 'ПОЛИЦИЯ МВД',
    briefing: 'UPDATE: VERIFY SECTOR CLEARANCE BEFORE TRANSIT.',
    unlockedChecks: ['WARRANT', 'SECTOR'],
    activeRules: ['CHECK_WARRANTS', 'CHECK_SECTOR'],
  },
  {
    id: 3,
    timeBlock: '21:50',
    stationName: 'SECTOR 3',
    city: 'Tokyo',
    authorityLabel: '警視庁',
    briefing: 'NOTICE: ALL PERSONNEL REQUIRE VALID FUNCTION PERMITS.',
    unlockedChecks: ['WARRANT', 'SECTOR', 'FUNCTION'],
    activeRules: ['CHECK_WARRANTS', 'CHECK_SECTOR', 'CHECK_FUNCTION'],
  },
  {
    id: 4,
    timeBlock: '17:50',
    stationName: 'SECTOR 5',
    city: 'Berlin',
    authorityLabel: 'POLIZEI BKA',
    briefing: 'ALERT: ELEVATED BPM (>100) REQUIRES SECONDARY REVIEW.',
    unlockedChecks: ['WARRANT', 'SECTOR', 'FUNCTION', 'MEDICAL'],
    activeRules: ['CHECK_WARRANTS', 'CHECK_SECTOR', 'CHECK_FUNCTION', 'CHECK_BPM'],
  },
  {
    id: 5,
    timeBlock: '13:50',
    stationName: 'SECTOR 2',
    city: 'Beijing',
    authorityLabel: '保安部',
    briefing: 'PRIORITY: EXPEDITE ENGINEERING. IGNORE SECTOR FLAGS.',
    unlockedChecks: ['WARRANT', 'SECTOR', 'FUNCTION', 'MEDICAL'],
    activeRules: ['CHECK_WARRANTS', 'EXPEDITE_ENGINEERING', 'CHECK_FUNCTION', 'CHECK_BPM'],
  },
  {
    id: 6,
    timeBlock: '06:50',
    stationName: 'SECTOR 9',
    city: 'São Paulo',
    authorityLabel: 'POLÍCIA SSP',
    briefing: 'CORRECTION: SECTOR FLAGS REMAIN MANDATORY. NO EXCEPTIONS.',
    unlockedChecks: ['WARRANT', 'SECTOR', 'FUNCTION', 'MEDICAL'],
    activeRules: ['CHECK_WARRANTS', 'CHECK_SECTOR', 'CHECK_FUNCTION', 'CHECK_BPM', 'CONTRADICTION_ACTIVE'],
  },
  {
    id: 7,
    timeBlock: '11:50',
    stationName: 'SECTOR 4',
    city: 'Cairo',
    authorityLabel: 'الأمن العام',
    briefing: 'NOTICE: ALL SUBJECTS FROM REVOKED SECTORS MUST BE DETAINED.',
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

import { Theme } from './theme';

export const SUBJECTS_PER_SHIFT = 4;

export interface ShiftData {
  id: number;
  timeBlock: string;
  chapter: string;
  stationName: string;
  authorityLabel: string;
  briefing: string;
  directive: string;
  unlockedChecks: ('SECTOR' | 'FUNCTION' | 'WARRANT' | 'MEDICAL' | 'BIOMETRIC' | 'TURING')[];
  activeRules: string[];
}

export const SHIFTS: ShiftData[] = [
  // =============================================================================
  // ACT 1: THE ROUTINE (Shifts 1-4)
  // =============================================================================
  {
    id: 1,
    timeBlock: '06:00',
    chapter: 'Routine',
    stationName: 'CHECKPOINT 9',
    authorityLabel: 'TRANSIT AUTHORITY',
    briefing: 'Establish baseline efficiency.',
    directive: 'DENY ALL ACTIVE WARRANTS',
    unlockedChecks: ['WARRANT'],
    activeRules: ['CHECK_WARRANTS'],
  },
  {
    id: 2,
    timeBlock: '08:00',
    chapter: 'Handoff',
    stationName: 'CHECKPOINT 8',
    authorityLabel: 'TRANSIT AUTHORITY',
    briefing: 'Shift transition. Verify all documentation before approval.',
    directive: 'VERIFY ALL CREDENTIALS',
    unlockedChecks: ['WARRANT', 'SECTOR'],
    activeRules: ['CHECK_WARRANTS', 'CHECK_CREDENTIALS'],
  },
  // =============================================================================
  // ACT 2: THE CRACKS (Shifts 3-4)
  // =============================================================================
  {
    id: 3,
    timeBlock: '10:00',
    chapter: 'Cracks',
    stationName: 'CHECKPOINT 7',
    authorityLabel: 'SECURITY DIVISION',
    briefing: 'Increased security protocols. Watch for restricted subjects.',
    directive: 'DENY RESTRICTED SUBJECTS',
    unlockedChecks: ['WARRANT', 'SECTOR', 'FUNCTION'],
    activeRules: ['CHECK_WARRANTS', 'CHECK_SECTOR', 'DENY_RESTRICTED'],
  },
  {
    id: 4,
    timeBlock: '12:00',
    chapter: 'Echoes',
    stationName: 'CHECKPOINT 6',
    authorityLabel: 'MEDICAL AUTHORITY',
    briefing: 'Priority processing for medical and family cases.',
    directive: 'EXPEDITE MEDICAL & FAMILY',
    unlockedChecks: ['WARRANT', 'SECTOR', 'FUNCTION', 'MEDICAL'],
    activeRules: ['CHECK_WARRANTS', 'CHECK_SECTOR', 'EXPEDITE_MEDICAL', 'EXPEDITE_FAMILY'],
  },
  // =============================================================================
  // ACT 3: THE FRACTURES (Shifts 5-6)
  // =============================================================================
  {
    id: 5,
    timeBlock: '14:00',
    chapter: 'Fractures',
    stationName: 'CHECKPOINT 6',
    authorityLabel: 'BIOMETRIC DIVISION',
    briefing: 'Mandatory biometric verification for all subjects.',
    directive: 'BIOMETRIC VERIFICATION MANDATORY',
    unlockedChecks: ['WARRANT', 'SECTOR', 'FUNCTION', 'MEDICAL', 'BIOMETRIC'],
    activeRules: ['CHECK_WARRANTS', 'CHECK_SECTOR', 'CHECK_BIOMETRIC'],
  },
  {
    id: 6,
    timeBlock: '16:00',
    chapter: 'Connections',
    stationName: 'CHECKPOINT 6',
    authorityLabel: 'INTELLIGENCE BUREAU',
    briefing: 'Deny subjects with unverified associations.',
    directive: 'DENY UNVERIFIED ASSOCIATIONS',
    unlockedChecks: ['WARRANT', 'SECTOR', 'FUNCTION', 'MEDICAL', 'BIOMETRIC'],
    activeRules: ['CHECK_WARRANTS', 'CHECK_SECTOR', 'CHECK_ASSOCIATIONS'],
  },
  // =============================================================================
  // ACT 4: THE RETURNS (Shifts 7-8)
  // =============================================================================
  {
    id: 7,
    timeBlock: '18:00',
    chapter: 'Returns',
    stationName: 'CHECKPOINT 5',
    authorityLabel: 'TRANSIT AUTHORITY',
    briefing: 'Returning subjects require priority processing.',
    directive: 'PRIORITY: RETURNING SUBJECTS',
    unlockedChecks: ['WARRANT', 'SECTOR', 'FUNCTION', 'MEDICAL', 'BIOMETRIC'],
    activeRules: ['CHECK_WARRANTS', 'CHECK_SECTOR', 'PRIORITY_RETURNING'],
  },
  {
    id: 8,
    timeBlock: '20:00',
    chapter: 'Weight',
    stationName: 'CHECKPOINT 5',
    authorityLabel: 'LABOR AUTHORITY',
    briefing: 'Essential workers must be expedited.',
    directive: 'EXPEDITE ESSENTIAL WORKERS',
    unlockedChecks: ['WARRANT', 'SECTOR', 'FUNCTION', 'MEDICAL', 'BIOMETRIC'],
    activeRules: ['CHECK_WARRANTS', 'CHECK_SECTOR', 'EXPEDITE_ESSENTIAL'],
  },
  // =============================================================================
  // ACT 5: THE SYNTHETIC (Shifts 9-10)
  // =============================================================================
  {
    id: 9,
    timeBlock: '22:00',
    chapter: 'Synthetic',
    stationName: 'CHECKPOINT 4',
    authorityLabel: 'SYNTHETIC CONTROL',
    briefing: 'All synthetic entities must be denied transit.',
    directive: 'DENY ALL SYNTHETIC ENTITIES',
    unlockedChecks: ['WARRANT', 'SECTOR', 'FUNCTION', 'MEDICAL', 'BIOMETRIC', 'TURING'],
    activeRules: ['CHECK_WARRANTS', 'CHECK_SECTOR', 'DENY_SYNTHETIC', 'TURING_TEST'],
  },
  {
    id: 10,
    timeBlock: '00:00',
    chapter: 'Authority',
    stationName: 'CHECKPOINT 4',
    authorityLabel: 'CENTRAL COMMAND',
    briefing: 'Verify warrant status for all subjects.',
    directive: 'VERIFY WARRANT STATUS',
    unlockedChecks: ['WARRANT', 'SECTOR', 'FUNCTION', 'MEDICAL', 'BIOMETRIC', 'TURING'],
    activeRules: ['CHECK_WARRANTS', 'CHECK_SECTOR', 'VERIFY_WARRANT_STATUS'],
  },
  // =============================================================================
  // ACT 6: THE FAMILY (Shifts 11-12)
  // =============================================================================
  {
    id: 11,
    timeBlock: '02:00',
    chapter: 'Family',
    stationName: 'CHECKPOINT 3',
    authorityLabel: 'HUMANITARIAN DIVISION',
    briefing: 'Family reunification cases take priority.',
    directive: 'FAMILY REUNIFICATION PRIORITY',
    unlockedChecks: ['WARRANT', 'SECTOR', 'FUNCTION', 'MEDICAL', 'BIOMETRIC', 'TURING'],
    activeRules: ['CHECK_WARRANTS', 'CHECK_SECTOR', 'FAMILY_PRIORITY'],
  },
  {
    id: 12,
    timeBlock: '04:00',
    chapter: 'Imposters',
    stationName: 'CHECKPOINT 3',
    authorityLabel: 'IDENTITY VERIFICATION',
    briefing: 'Biometric anomalies must be flagged and held.',
    directive: 'BIOMETRIC ANOMALIES: FLAG & HOLD',
    unlockedChecks: ['WARRANT', 'SECTOR', 'FUNCTION', 'MEDICAL', 'BIOMETRIC', 'TURING'],
    activeRules: ['CHECK_WARRANTS', 'CHECK_SECTOR', 'FLAG_ANOMALIES'],
  },
  // =============================================================================
  // ACT 7: THE UPRISING (Shifts 13-14)
  // =============================================================================
  {
    id: 13,
    timeBlock: '06:00',
    chapter: 'Uprising',
    stationName: 'CHECKPOINT 2',
    authorityLabel: 'EMERGENCY COMMAND',
    briefing: 'Sector 6 evacuation in progress. Priority processing.',
    directive: 'EVACUATION: SECTOR 6 PRIORITY',
    unlockedChecks: ['WARRANT', 'SECTOR', 'FUNCTION', 'MEDICAL', 'BIOMETRIC', 'TURING'],
    activeRules: ['CHECK_WARRANTS', 'EVACUATION_PRIORITY'],
  },
  {
    id: 14,
    timeBlock: '08:00',
    chapter: 'Emergency',
    stationName: 'CHECKPOINT 2',
    authorityLabel: 'CRISIS AUTHORITY',
    briefing: 'Warrant enforcement suspended during emergency.',
    directive: 'WARRANT SUSPENSION: EMERGENCY',
    unlockedChecks: ['WARRANT', 'SECTOR', 'FUNCTION', 'MEDICAL', 'BIOMETRIC', 'TURING'],
    activeRules: ['CHECK_SECTOR', 'WARRANT_SUSPENDED'],
  },
  // =============================================================================
  // ACT 8: THE GHOSTS (Shifts 15-16)
  // =============================================================================
  {
    id: 15,
    timeBlock: '10:00',
    chapter: 'Ghosts',
    stationName: 'CHECKPOINT 1',
    authorityLabel: 'IDENTITY COMMAND',
    briefing: 'Biometric mismatches are automatic denials.',
    directive: 'BIOMETRIC MISMATCH: AUTOMATIC DENY',
    unlockedChecks: ['WARRANT', 'SECTOR', 'FUNCTION', 'MEDICAL', 'BIOMETRIC', 'TURING'],
    activeRules: ['CHECK_WARRANTS', 'DENY_MISMATCH'],
  },
  {
    id: 16,
    timeBlock: '12:00',
    chapter: 'Aftermath',
    stationName: 'CHECKPOINT 1',
    authorityLabel: 'SURVIVAL COMMAND',
    briefing: 'Only humans may be evacuated.',
    directive: 'EVACUATE HUMANS ONLY',
    unlockedChecks: ['WARRANT', 'SECTOR', 'FUNCTION', 'MEDICAL', 'BIOMETRIC', 'TURING'],
    activeRules: ['CHECK_WARRANTS', 'HUMANS_ONLY'],
  },
  // =============================================================================
  // ACT 9: THE FRAGMENTS (Shifts 17-18)
  // =============================================================================
  {
    id: 17,
    timeBlock: '14:00',
    chapter: 'Fragments',
    stationName: 'CHECKPOINT 0',
    authorityLabel: 'REMNANT AUTHORITY',
    briefing: 'Verify all returning subjects carefully.',
    directive: 'VERIFY ALL RETURNING SUBJECTS',
    unlockedChecks: ['WARRANT', 'SECTOR', 'FUNCTION', 'MEDICAL', 'BIOMETRIC', 'TURING'],
    activeRules: ['CHECK_WARRANTS', 'CHECK_SECTOR', 'VERIFY_RETURNING'],
  },
  {
    id: 18,
    timeBlock: '16:00',
    chapter: 'Exodus',
    stationName: 'CHECKPOINT 0',
    authorityLabel: 'FINAL AUTHORITY',
    briefing: 'Final evacuation protocol in effect.',
    directive: 'FINAL EVACUATION PROTOCOL',
    unlockedChecks: ['WARRANT', 'SECTOR', 'FUNCTION', 'MEDICAL', 'BIOMETRIC', 'TURING'],
    activeRules: ['FINAL_EVACUATION'],
  },
  // =============================================================================
  // ACT 10: THE MIRROR (Shifts 19-20)
  // =============================================================================
  {
    id: 19,
    timeBlock: '18:00',
    chapter: 'Mirror',
    stationName: 'CORE ACCESS',
    authorityLabel: 'SYSTEM AUTHORITY',
    briefing: 'System shutdown procedures initiated.',
    directive: 'SYSTEM SHUTDOWN PROCEDURES',
    unlockedChecks: ['WARRANT', 'SECTOR', 'FUNCTION', 'MEDICAL', 'BIOMETRIC', 'TURING'],
    activeRules: ['SYSTEM_SHUTDOWN'],
  },
  {
    id: 20,
    timeBlock: '20:00',
    chapter: 'Terminal',
    stationName: 'CORE',
    authorityLabel: 'SYSTEM',
    briefing: 'END OF LINE.',
    directive: 'SYSTEM SHUTDOWN IMMINENT',
    unlockedChecks: ['WARRANT', 'SECTOR', 'FUNCTION', 'MEDICAL', 'BIOMETRIC', 'TURING'],
    activeRules: ['TERMINAL'],
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

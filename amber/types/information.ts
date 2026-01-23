/**
 * Information Tracking System
 * 
 * Tracks what information the player has gathered for each subject.
 * This is the foundation of the information-based deduction system.
 */

export type EquipmentType = 'BIOMETRIC_SCANNER' | 'BPM_MONITOR';

// “Terminal services” are concurrent processes limited by memory slots.
// This is per-subject state (resets when the next subject loads).
export type ServiceType =
  | 'IDENTITY_SCAN'
  | 'WARRANT'
  | 'TRANSIT'
  | 'INCIDENT'
  | 'DB_LOOKUP';

export const MEMORY_SLOT_CAPACITY = 3;

/**
 * Scan quality levels based on pressure hold duration
 * Determines how much information is revealed from identity scan
 */
export type ScanQuality = 'PARTIAL' | 'STANDARD' | 'DEEP' | 'COMPLETE';

export interface LastExtractSnapshot {
  lines: string[]; // 1–2 lines, by design
  timestamp: number;
}

export interface GatheredInformation {
  // Basic scan (free, always available)
  basicScan: boolean;
  
  // Investigation findings
  identityScan: boolean; // Eye scan - identity matching credentials
  identityScanQuality?: ScanQuality; // Quality of identity scan (based on hold duration)
  warrantCheck: boolean;
  transitLog: boolean;
  incidentHistory: boolean;
  
  // Interrogation (free)
  interrogation: {
    questionsAsked: number;
    responses: string[];
    bpmChanges: number[]; // BPM value at each question
  };
  
  // Equipment status
  equipmentFailures: EquipmentType[]; // Which equipment is broken
  bpmDataAvailable: boolean; // Is BPM monitor working?
  eyeScannerActive: boolean; // Is eye scanner turned on?
  
  // Per-subject memory slots (Model B): slots gate acquiring/reading, not “using learned facts”
  activeServices: ServiceType[];
  lastExtracted: Partial<Record<ServiceType, LastExtractSnapshot>>;

  // Timestamps for tracking
  timestamps: {
    basicScan?: number;
    identityScan?: number;
    warrantCheck?: number;
    transitLog?: number;
    incidentHistory?: number;
    interrogation?: number[];
  };
}

/**
 * Creates a fresh information tracking object for a new subject
 * Equipment failures should be determined externally and passed in
 */
export const createEmptyInformation = (equipmentFailures: EquipmentType[] = []): GatheredInformation => ({
  basicScan: false,
  identityScan: false,
  identityScanQuality: undefined,
  warrantCheck: false,
  transitLog: false,
  incidentHistory: false,
  interrogation: {
    questionsAsked: 0,
    responses: [],
    bpmChanges: [],
  },
  equipmentFailures,
  bpmDataAvailable: !equipmentFailures.includes('BPM_MONITOR'),
  eyeScannerActive: false,
  activeServices: [],
  lastExtracted: {},
  timestamps: {},
});

/**
 * Checks if all information gathering tools have been used
 */
export const hasAllInformation = (info: GatheredInformation): boolean => {
  return (
    info.basicScan &&
    info.identityScan &&
    info.warrantCheck &&
    info.transitLog &&
    info.incidentHistory
  );
};

/**
 * Checks if some information has been gathered (but not all)
 */
export const hasSomeInformation = (info: GatheredInformation): boolean => {
  return (
    info.basicScan ||
    info.identityScan ||
    info.warrantCheck ||
    info.transitLog ||
    info.incidentHistory
  );
};

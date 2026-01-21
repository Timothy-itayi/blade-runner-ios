/**
 * Equipment Failure System
 * 
 * Determines which equipment fails for each subject.
 * Failures are deterministic based on subject ID to ensure consistency.
 */

import { EquipmentType } from '../types/information';

/**
 * Determines equipment failures for a subject based on their ID.
 * Uses a seeded random approach to ensure the same subject always has the same failures.
 * 
 * @param subjectId - Unique subject identifier
 * @returns Array of equipment types that are broken for this subject
 */
export const determineEquipmentFailures = (subjectId: string): EquipmentType[] => {
  const failures: EquipmentType[] = [];
  
  // Create a simple hash from subject ID for deterministic randomness
  let hash = 0;
  for (let i = 0; i < subjectId.length; i++) {
    const char = subjectId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Use hash to seed random decisions
  // 30% chance of BPM monitor failure
  const bpmMonitorSeed = Math.abs(hash) % 100;
  if (bpmMonitorSeed < 30) {
    failures.push('BPM_MONITOR');
  }
  
  // 25% chance of biometric scanner failure
  const biometricScannerSeed = Math.abs(hash * 2) % 100;
  if (biometricScannerSeed < 25) {
    failures.push('BIOMETRIC_SCANNER');
  }
  
  return failures;
};

/**
 * Checks if BPM data is available (BPM monitor is working)
 */
export const isBPMDataAvailable = (failures: EquipmentType[]): boolean => {
  return !failures.includes('BPM_MONITOR');
};

/**
 * Checks if biometric scanner is working
 */
export const isBiometricScannerWorking = (failures: EquipmentType[]): boolean => {
  return !failures.includes('BIOMETRIC_SCANNER');
};

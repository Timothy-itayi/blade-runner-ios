/**
 * Supervisor Warning Pattern Detection
 * 
 * Tracks patterns of mistakes and generates supervisor warnings mid-shift.
 */

import { GatheredInformation } from '../types/information';
import { WarningPattern } from '../components/game/SupervisorWarning';

export interface PatternTracker {
  approvalsWithoutVerification: number;
  approvalsWithoutWarrantCheck: number;
  approvalsWithoutBioScan: number;
  equipmentFailuresNoted: number;
  directiveViolations: number;
}

/**
 * Creates a fresh pattern tracker
 */
export const createPatternTracker = (): PatternTracker => ({
  approvalsWithoutVerification: 0,
  approvalsWithoutWarrantCheck: 0,
  approvalsWithoutBioScan: 0,
  equipmentFailuresNoted: 0,
  directiveViolations: 0,
});

/**
 * Checks for warning patterns based on decision and information gathered
 */
export const checkWarningPatterns = (
  decision: 'APPROVE' | 'DENY',
  gatheredInfo: GatheredInformation,
  tracker: PatternTracker,
  hasEquipmentFailure: boolean
): WarningPattern | null => {
  // Only check patterns for APPROVE decisions (denials are less risky)
  if (decision !== 'APPROVE') {
    return null;
  }

  // Pattern: Approved without any verification checks
  if (!gatheredInfo.warrantCheck && !gatheredInfo.identityScan && !gatheredInfo.healthScan && !gatheredInfo.transitLog && !gatheredInfo.incidentHistory) {
    tracker.approvalsWithoutVerification++;
    if (tracker.approvalsWithoutVerification >= 2) {
      return {
        type: 'NO_VERIFICATION',
        count: tracker.approvalsWithoutVerification,
        message: `Operator, you've approved ${tracker.approvalsWithoutVerification} subjects without database verification this shift. This is a violation of protocol.`,
      };
    }
  }

  // Pattern: Approved without warrant check (especially important for Shift 1)
  if (!gatheredInfo.warrantCheck) {
    tracker.approvalsWithoutWarrantCheck++;
    if (tracker.approvalsWithoutWarrantCheck >= 2) {
      return {
        type: 'NO_VERIFICATION',
        count: tracker.approvalsWithoutWarrantCheck,
        message: `Operator, you've approved ${tracker.approvalsWithoutWarrantCheck} subjects without warrant verification. Active warrants must be checked before approval.`,
      };
    }
  }

  // Pattern: Approved without health scan (important for Shift 3 - deny synthetic entities)
  if (!gatheredInfo.healthScan) {
    tracker.approvalsWithoutBioScan++;
    if (tracker.approvalsWithoutBioScan >= 2) {
      return {
        type: 'NO_VERIFICATION',
        count: tracker.approvalsWithoutBioScan,
        message: `Operator, you've approved ${tracker.approvalsWithoutBioScan} subjects without health verification. Synthetic entity detection requires health scan.`,
      };
    }
  }

  // Pattern: Equipment failure detected
  if (hasEquipmentFailure && tracker.equipmentFailuresNoted === 0) {
    tracker.equipmentFailuresNoted++;
    return {
      type: 'EQUIPMENT_FAILURE',
      count: 1,
      message: 'Operator, equipment malfunction detected. Proceed with caution. Some data may be unreliable.',
    };
  }

  return null;
};

/**
 * Resets pattern tracker for new shift
 */
export const resetPatternTracker = (tracker: PatternTracker): PatternTracker => {
  return createPatternTracker();
};

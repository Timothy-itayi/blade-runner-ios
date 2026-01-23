/**
 * Consequence Evaluation System
 * 
 * Replaces binary "correct/wrong" with nuanced consequence calculation
 * based on information gathered, decision made, and directive compliance.
 */

import { GatheredInformation } from './information';
import { SubjectData } from '../data/subjects';
import { ShiftData } from '../constants/shifts';

export type ConsequenceType = 'NONE' | 'WARNING' | 'CITATION' | 'SERIOUS_INFRACTION';

export interface MissedInformation {
  // Note: These are *fact categories* revealed by services, not “buttons the player forgot to press”.
  // They’re used for diegetic reporting (“ACTIVE WARRANT”, etc.) without coaching.
  type:
    | 'WARRANT'
    | 'IDENTITY_SCAN'
    | 'HEALTH_SCAN'
    | 'TRANSIT_LOG'
    | 'INCIDENT_HISTORY'
    | 'INTERROGATION';
  description: string;
  reveal: string; // What would have been revealed
  impact: string; // How it would have affected the decision
}

export interface Consequence {
  type: ConsequenceType;
  message: string;
  missedInformation: MissedInformation[];
  severity: number; // 0-100, for compounding
  creditsPenalty: number;
  infractionCount: number; // Cumulative infractions
}

/**
 * Evaluates the consequence of a decision based on:
 * - Information gathered
 * - Decision made
 * - Directive compliance
 * - What information was missed
 */
export const evaluateConsequence = (
  subject: SubjectData,
  decision: 'APPROVE' | 'DENY',
  gatheredInfo: GatheredInformation,
  currentShift: ShiftData,
  cumulativeInfractions: number = 0
): Consequence => {
  const missedInfo: MissedInformation[] = [];
  let severity = 0;
  let creditsPenalty = 0;
  let message = '';
  let consequenceType: ConsequenceType = 'NONE';

  // Check directive compliance
  const directive = currentShift.directive;
  const directiveLower = directive.toLowerCase();
  
  // Analyze what information was missed and its impact
  // 1. Warrant Check
  if (!gatheredInfo.warrantCheck && subject.warrants !== 'NONE') {
    missedInfo.push({
      type: 'WARRANT',
      description: 'Warrant check not performed',
      reveal: `Warrant check would have revealed: ${subject.warrants}`,
      impact: decision === 'APPROVE' 
        ? 'Subject entered with active warrant. Should have been denied.'
        : 'Warrant information would have confirmed denial decision.',
    });
    if (decision === 'APPROVE') {
      severity += 40;
      creditsPenalty += 2;
    }
  }
  
  // Check directive: DENY ALL SUBJECTS WITH ACTIVE WARRANTS
  if (directiveLower.includes('deny') && directiveLower.includes('warrant')) {
    if (subject.warrants !== 'NONE' && decision === 'APPROVE') {
      if (gatheredInfo.warrantCheck) {
        // Warrant was checked but still approved - direct violation
        severity += 60;
        creditsPenalty += 4;
        if (!message) {
          message = 'Directive violation: Approved subject with active warrant despite directive to deny all warrants.';
        }
      }
    }
  }

  // 2. Health Scan (body scan - reveals biometrics/diseases)
  if (!gatheredInfo.healthScan) {
    const hasReplicantMarkers = subject.bioScanData?.biologicalType === 'REPLICANT' ||
                                subject.subjectType === 'REPLICANT';
    if (hasReplicantMarkers && decision === 'APPROVE') {
      missedInfo.push({
        type: 'HEALTH_SCAN',
        description: 'Health scan not performed',
        reveal: `Health scan would have revealed: ${subject.bioScanData?.biologicalType || subject.subjectType} markers`,
        impact: 'Replicant subject approved without health verification. Serious infraction.',
      });
      severity += 50;
      creditsPenalty += 3;
    }
  }

  // 2b. Identity Scan (eye scan - reveals dossier/identity)
  if (!gatheredInfo.identityScan && subject.dossier) {
    // Identity scan reveals dossier which can be cross-referenced with credentials
    // Missing identity scan means can't verify dossier information
    if (decision === 'APPROVE') {
      missedInfo.push({
        type: 'IDENTITY_SCAN',
        description: 'Identity scan not performed',
        reveal: `Identity scan would have revealed dossier information for credential verification`,
        impact: 'Subject approved without identity verification against credentials.',
      });
      severity += 20;
      creditsPenalty += 1;
    }
  }

  // 3. Transit Log
  if (!gatheredInfo.transitLog && subject.databaseQuery?.travelHistory) {
    const hasFlaggedTravel = subject.databaseQuery.travelHistory.some(t => t.flagged);
    if (hasFlaggedTravel && decision === 'APPROVE') {
      missedInfo.push({
        type: 'TRANSIT_LOG',
        description: 'Transit log not checked',
        reveal: `Transit log would have revealed flagged travel entries`,
        impact: 'Subject with flagged travel history was approved.',
      });
      severity += 30;
      creditsPenalty += 1;
    }
  }

  // 4. Incident History
  if (!gatheredInfo.incidentHistory && subject.incidents > 0) {
    if (decision === 'APPROVE') {
      missedInfo.push({
        type: 'INCIDENT_HISTORY',
        description: 'Incident history not checked',
        reveal: `Incident history would have revealed: ${subject.incidents} prior incident(s)`,
        impact: 'Subject with incident history was approved without review.',
      });
      severity += 25;
      creditsPenalty += 1;
    }
  }

  // 5. Directive Compliance - DENY SYNTHETIC ENTITIES
  if (directiveLower.includes('deny') && (directiveLower.includes('synthetic') || directiveLower.includes('replicant') || directiveLower.includes('robot'))) {
    const isSynthetic = subject.subjectType === 'REPLICANT' || 
                        subject.bioScanData?.biologicalType === 'REPLICANT' ||
                        subject.subjectType === 'ROBOT_CYBORG';
    if (isSynthetic && decision === 'APPROVE') {
      if (!gatheredInfo.healthScan) {
        // Already counted in health scan above
      } else {
        // Health scan was done but still approved - direct violation
        severity += 70;
        creditsPenalty += 5;
        if (!message) {
          message = 'Directive violation: Approved synthetic entity despite directive to deny all synthetic entities.';
        }
      }
    }
  }
  
  // 6. Directive Compliance - VERIFY ALL CREDENTIALS
  if (directiveLower.includes('verify') && directiveLower.includes('credential')) {
    // This would require checking if credentials were verified
    // For now, we'll note it but not penalize heavily
  }

  // Determine consequence type based on severity and cumulative infractions
  const totalSeverity = severity + (cumulativeInfractions * 5); // Compounding
  
  if (totalSeverity === 0) {
    consequenceType = 'NONE';
    message = 'Decision processed. No issues detected.';
  } else if (totalSeverity < 30) {
    consequenceType = 'WARNING';
    if (!message) {
      message = 'Warning: Some information was not verified before decision.';
    }
  } else if (totalSeverity < 60) {
    consequenceType = 'CITATION';
    if (!message) {
      message = 'Citation issued: Decision made without sufficient verification.';
    }
  } else {
    consequenceType = 'SERIOUS_INFRACTION';
    if (!message) {
      message = 'Serious infraction: Critical information missed or directive violated.';
    }
  }

  // Add missed information context to message
  if (missedInfo.length > 0 && !message.includes('would have')) {
    const firstMissed = missedInfo[0];
    message += ` ${firstMissed.reveal}`;
  }

  return {
    type: consequenceType,
    message,
    missedInformation: missedInfo,
    severity: totalSeverity,
    creditsPenalty,
    infractionCount: cumulativeInfractions + (severity > 0 ? 1 : 0),
  };
};

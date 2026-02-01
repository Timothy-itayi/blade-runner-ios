/**
 * Consequence Evaluation System
 * 
 * Replaces binary "correct/wrong" with nuanced consequence calculation
 * based on information gathered, decision made, and directive compliance.
 */

import { GatheredInformation } from './information';
import { SubjectData } from '../data/subjects';
import { ShiftData } from '../constants/shifts';
import { getMissingRequiredChecks, getRequiredChecks } from '../utils/requiredChecks';

export type ConsequenceType = 'NONE' | 'WARNING' | 'CITATION' | 'SERIOUS_INFRACTION';

export interface MissedInformation {
  // Note: These are *fact categories* revealed by services, not “buttons the player forgot to press”.
  // They’re used for diegetic reporting (“ACTIVE WARRANT”, etc.) without coaching.
  type:
    | 'DATABASE'
    | 'WARRANT'
    | 'IDENTITY_SCAN'
    | 'TRANSIT_LOG'
    | 'INCIDENT_HISTORY'
    | 'INTERROGATION'
    | 'DIRECTIVE';
  description: string;
  reveal: string; // What would have been revealed
  impact: string; // How it would have affected the decision
}

export interface Consequence {
  type: ConsequenceType;
  message: string;
  missedInformation: MissedInformation[];
  severity: number; // 0-100, for compounding
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
  let message = '';
  let consequenceType: ConsequenceType = 'NONE';

  // Only violations now: missing required checks for the shift.
  const requiredChecks = subject.requiredChecks?.length
    ? subject.requiredChecks
    : getRequiredChecks(currentShift);
  const missingChecks = getMissingRequiredChecks(gatheredInfo, requiredChecks);

  missingChecks.forEach((check) => {
    if (check === 'DATABASE') {
      missedInfo.push({
        type: 'DATABASE',
        description: 'Database check not performed',
        reveal: 'Database check would have revealed the subject record',
        impact: 'Decision made without database verification.',
      });
      severity += 25;
      return;
    }

    if (check === 'WARRANT') {
      const warrantDetail = subject.warrants && subject.warrants !== 'NONE' ? subject.warrants : 'NONE';
      missedInfo.push({
        type: 'WARRANT',
        description: 'Warrant check not performed',
        reveal: `Warrant status: ${warrantDetail}`,
        impact: 'Decision made without warrant verification.',
      });
      severity += 25;
      return;
    }

    if (check === 'TRANSIT') {
      missedInfo.push({
        type: 'TRANSIT_LOG',
        description: 'Transit log not checked',
        reveal: 'Transit log would have revealed travel history',
        impact: 'Decision made without transit verification.',
      });
      severity += 25;
      return;
    }

    if (check === 'INCIDENT') {
      missedInfo.push({
        type: 'INCIDENT_HISTORY',
        description: 'Incident record not checked',
        reveal: 'Incident record would have revealed discrepancies',
        impact: 'Decision made without incident verification.',
      });
      severity += 25;
    }
  });

  if (subject.intendedOutcome && subject.intendedOutcome !== decision) {
    missedInfo.push({
      type: 'DIRECTIVE',
      description: 'Directive exception missed',
      reveal: `Correct action: ${subject.intendedOutcome}`,
      impact: `Decision ${decision} violated directive.`,
    });
    severity += 45;
    message = message || 'Directive violation: decision conflicts with mandate.';
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
    infractionCount: cumulativeInfractions + (severity > 0 ? 1 : 0),
  };
};

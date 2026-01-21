/**
 * Dynamic Question Generation System
 * 
 * Generates interrogation questions based on what information has been gathered.
 * Questions adapt to reflect the depth of investigation.
 */

import { SubjectData } from '../data/subjects';
import { GatheredInformation, hasAllInformation, hasSomeInformation } from '../types/information';

export interface QuestionTemplate {
  id: string;
  text: (subject: SubjectData) => string;
  requiresBioScan?: boolean;
  requiresWarrantCheck?: boolean;
  requiresTransitLog?: boolean;
  requiresIncidentHistory?: boolean;
}

/**
 * Generates questions based on gathered information
 * 
 * Three tiers:
 * 1. No info: Basic "state your business" questions
 * 2. Some info: Questions about specific findings
 * 3. All info: Cross-reference questions that combine multiple findings
 */
export function generateDynamicQuestions(
  subject: SubjectData,
  info: GatheredInformation
): QuestionTemplate[] {
  const questions: QuestionTemplate[] = [];

  // Tier 1: No information - Basic questions
  if (!hasSomeInformation(info)) {
    questions.push(
      {
        id: 'origin',
        text: () => `Why are you coming to Earth from ${subject.originPlanet}?`,
      },
      {
        id: 'purpose',
        text: () => `What is your specific purpose for this visit?`,
      },
      {
        id: 'duration',
        text: () => `How long do you plan to stay on Earth?`,
      },
      {
        id: 'background',
        text: () => `Tell me about your background.`,
      },
      {
        id: 'previous',
        text: () => `Have you been to Earth before?`,
      }
    );
    return questions;
  }

  // Tier 2: Some information - Questions about specific findings
  if (!hasAllInformation(info)) {
    // Bio scan questions
    if (info.bioScan) {
      const bioData = subject.bioScanData;
      
      if (bioData?.biologicalType === 'REPLICANT') {
        questions.push({
          id: 'synthetic',
          text: () => `The scan shows synthetic biological markers. Can you explain your biological status?`,
          requiresBioScan: true,
        });
      }
      
      if (bioData?.augmentationLevel && bioData.augmentationLevel !== 'NONE') {
        questions.push({
          id: 'cybernetic',
          text: () => `The scan detected cybernetic augmentations. What modifications have you undergone?`,
          requiresBioScan: true,
        });
      }
      
      if (bioData?.fingerprintType === 'REPLICANT' || !subject.biometricData.fingerprintMatch) {
        questions.push({
          id: 'fingerprint',
          text: () => {
            if (bioData?.fingerprintType === 'REPLICANT') {
              return `Your fingerprints don't match standard human patterns. Can you explain?`;
            }
            return `The scan shows your fingerprints have been modified. When and why?`;
          },
          requiresBioScan: true,
        });
      }
      
      // Add more bio scan specific questions based on findings
      if (bioData?.biologicalType === 'HUMAN_CYBORG') {
        questions.push({
          id: 'surgery',
          text: () => `The scan detected recent surgical modifications. What was the procedure for?`,
          requiresBioScan: true,
        });
      }
    }
    
    // Warrant check questions
    if (info.warrantCheck && subject.warrants !== 'NONE') {
      questions.push({
        id: 'warrant',
        text: () => `The system shows an active warrant: ${subject.warrants}. Can you explain?`,
        requiresWarrantCheck: true,
      });
    }
    
    // Transit log questions
    if (info.transitLog && subject.databaseQuery?.travelHistory) {
      const flaggedTrips = subject.databaseQuery.travelHistory.filter(t => t.flagged);
      if (flaggedTrips.length > 0) {
        questions.push({
          id: 'transit',
          text: () => `Your transit log shows flagged travel patterns. Can you explain these trips?`,
          requiresTransitLog: true,
        });
      }
    }
    
    // Incident history questions
    if (info.incidentHistory && subject.incidents > 0) {
      questions.push({
        id: 'incidents',
        text: () => `The records show ${subject.incidents} incident(s) on file. What happened?`,
        requiresIncidentHistory: true,
      });
    }
  }

  // Tier 3: All information - Cross-reference questions
  if (hasAllInformation(info)) {
    const bioData = subject.bioScanData;
    const findings: string[] = [];
    
    // Collect findings
    if (bioData?.biologicalType === 'REPLICANT') {
      findings.push('synthetic biological markers');
    }
    if (subject.warrants !== 'NONE' && info.warrantCheck) {
      findings.push(`active warrant: ${subject.warrants}`);
    }
    if (info.transitLog && subject.databaseQuery?.discrepancies && subject.databaseQuery.discrepancies.length > 0) {
      findings.push('transit log discrepancies');
    }
    if (info.incidentHistory && subject.incidents > 0) {
      findings.push(`${subject.incidents} incident(s) on record`);
    }
    
    // Generate cross-reference question
    if (findings.length > 1) {
      const findingsText = findings.slice(0, -1).join(', ') + ', and ' + findings[findings.length - 1];
      questions.push({
        id: 'cross-reference',
        text: () => `Your scan shows ${findingsText}. Explain these inconsistencies.`,
        requiresBioScan: true,
        requiresWarrantCheck: info.warrantCheck,
        requiresTransitLog: info.transitLog,
        requiresIncidentHistory: info.incidentHistory,
      });
    } else if (findings.length === 1) {
      questions.push({
        id: 'specific-finding',
        text: () => {
          if (findings[0].includes('warrant')) {
            return `The system shows ${findings[0]}. Explain.`;
          }
          return `The scan shows ${findings[0]}. Can you explain this?`;
        },
        requiresBioScan: info.bioScan,
        requiresWarrantCheck: info.warrantCheck,
        requiresTransitLog: info.transitLog,
        requiresIncidentHistory: info.incidentHistory,
      });
    }
  }

  // Fallback: If no specific questions generated, provide basic ones
  if (questions.length === 0) {
    questions.push({
      id: 'purpose',
      text: () => `What is your specific purpose for this visit?`,
    });
  }

  return questions;
}

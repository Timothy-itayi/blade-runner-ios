/**
 * Dynamic Question Generation System
 *
 * Generates interrogation questions based on what information has been gathered.
 * Questions adapt to reflect the depth of investigation.
 *
 * Phase 4: Enhanced with personality-aware question generation
 */

import { SubjectData, PersonalityType, PersonalityTraits } from '../data/subjects';
import { GatheredInformation, hasAllInformation, hasSomeInformation } from '../types/information';
import { getSubjectGreeting, CommunicationStyle } from '../data/subjectGreetings';

export interface QuestionTemplate {
  id: string;
  text: (subject: SubjectData) => string;
  requiresIdentityScan?: boolean; // Phase 5: Eye scan - identity/dossier
  requiresWarrantCheck?: boolean;
  requiresTransitLog?: boolean;
  requiresIncidentHistory?: boolean;
  personalityTargeted?: PersonalityType; // Which personality this question targets
  pressureLevel?: 'LOW' | 'MEDIUM' | 'HIGH'; // How much pressure this question applies
}

/**
 * Phase 4: Get personality-based question modifiers
 * Adjusts question phrasing based on subject's personality
 */
function getPersonalityModifier(personality?: PersonalityTraits): {
  preamble: string;
  tone: 'SOFT' | 'NEUTRAL' | 'HARD';
} {
  if (!personality) {
    return { preamble: '', tone: 'NEUTRAL' };
  }

  switch (personality.primaryType) {
    case 'NERVOUS':
      return { preamble: 'Take your time. ', tone: 'SOFT' };
    case 'CONFIDENT':
      return { preamble: '', tone: 'HARD' };
    case 'DECEPTIVE':
      return { preamble: 'Be very careful with your answer. ', tone: 'HARD' };
    case 'DESPERATE':
      return { preamble: '', tone: 'NEUTRAL' };
    case 'ARROGANT':
      return { preamble: 'I need a direct answer. ', tone: 'HARD' };
    case 'VULNERABLE':
      return { preamble: '', tone: 'SOFT' };
    case 'CONFUSED':
      return { preamble: 'Think carefully. ', tone: 'SOFT' };
    case 'PROFESSIONAL':
      return { preamble: '', tone: 'NEUTRAL' };
    default:
      return { preamble: '', tone: 'NEUTRAL' };
  }
}

/**
 * Phase 4: Generate personality-specific follow-up questions
 * These questions target specific personality types to reveal tells
 */
function getPersonalityTargetedQuestions(
  subject: SubjectData,
  info: GatheredInformation
): QuestionTemplate[] {
  const questions: QuestionTemplate[] = [];
  const personality = subject.personalityTraits;
  const greeting = getSubjectGreeting(subject.id, subject);

  if (!personality) return questions;

  // Questions targeting NERVOUS personalities
  if (personality.primaryType === 'NERVOUS' || personality.secondaryType === 'NERVOUS') {
    if (personality.emotionalStability < 50) {
      questions.push({
        id: 'nervous-pressure',
        text: () => `You seem uneasy. Is there something you're not telling me?`,
        personalityTargeted: 'NERVOUS',
        pressureLevel: 'MEDIUM',
      });
    }
  }

  // Questions targeting DECEPTIVE personalities
  if (personality.primaryType === 'DECEPTIVE' || personality.secondaryType === 'DECEPTIVE') {
    if (personality.trustworthiness < 40) {
      questions.push({
        id: 'deceptive-catch',
        text: () => `That doesn't match what you said earlier. Explain the discrepancy.`,
        personalityTargeted: 'DECEPTIVE',
        pressureLevel: 'HIGH',
      });
    }
  }

  // Questions targeting CONFUSED personalities (like replicants)
  if (personality.primaryType === 'CONFUSED' || personality.secondaryType === 'CONFUSED') {
    questions.push({
      id: 'memory-test',
      text: () => `Describe your last week on ${subject.originPlanet}. Specific details, please.`,
      personalityTargeted: 'CONFUSED',
      pressureLevel: 'MEDIUM',
    });
  }

  // Questions targeting ARROGANT personalities
  if (personality.primaryType === 'ARROGANT' || personality.secondaryType === 'ARROGANT') {
    questions.push({
      id: 'authority-challenge',
      text: () => `Your status doesn't exempt you from standard verification. Cooperate or face detention.`,
      personalityTargeted: 'ARROGANT',
      pressureLevel: 'HIGH',
    });
  }

  // Questions targeting DESPERATE personalities
  if (personality.primaryType === 'DESPERATE' || personality.secondaryType === 'DESPERATE') {
    if (personality.emotionalStability < 40) {
      questions.push({
        id: 'emotional-probe',
        text: () => `I understand this is urgent for you. But I need truthful answers. What aren't you telling me?`,
        personalityTargeted: 'DESPERATE',
        pressureLevel: 'LOW',
      });
    }
  }

  // Communication style specific questions
  if (greeting) {
    switch (greeting.communicationStyle) {
      case 'BROKEN':
        questions.push({
          id: 'clarity-request',
          text: () => `I need you to be clearer. State your purpose in one simple sentence.`,
          pressureLevel: 'LOW',
        });
        break;
      case 'AGITATED':
        questions.push({
          id: 'calm-down',
          text: () => `Your agitation is noted in the record. Take a breath and answer clearly.`,
          pressureLevel: 'MEDIUM',
        });
        break;
      case 'SILENT':
        questions.push({
          id: 'force-response',
          text: () => `Refusal to answer will be documented. This is your opportunity to speak.`,
          pressureLevel: 'HIGH',
        });
        break;
      case 'FORMAL':
        questions.push({
          id: 'informal-probe',
          text: () => `Drop the official language. Tell me in plain terms why you're really here.`,
          pressureLevel: 'MEDIUM',
        });
        break;
    }
  }

  return questions;
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

  // Evidence-driven interrogation:
  // No questions are available until some actionable evidence has been gathered.
  // This avoids "spam to win" and keeps interrogation tied to investigation.
  if (!hasSomeInformation(info)) return questions;

  // Verification record: single contradictory file per subject (only after viewing).
  if (subject.verificationRecord && info.verificationViewed) {
    const record = subject.verificationRecord;
    const id = `verification-${record.type.toLowerCase()}`;
    questions.push({
      id,
      text: () =>
        record.question ||
        `Verification record shows a discrepancy: ${record.contradiction}`,
      pressureLevel: 'MEDIUM',
    });
  }

  // Tier 2: Some information - Questions about specific findings
  if (!hasAllInformation(info)) {
    // Identity scan questions (eye scan - dossier/identity)
    if (info.identityScan) {
      const dossier = subject.dossier;
      
      if (dossier) {
        questions.push({
          id: 'identity-occupation',
          text: () => `The system flags your role as ${dossier.occupation}. What clearance are you running?`,
          requiresIdentityScan: true,
        });
        
        questions.push({
          id: 'identity-address',
          text: () => `Your file lists your origin sector as ${dossier.address}. Confirm this.`,
          requiresIdentityScan: true,
        });
      }
    }
    
    // Warrant check questions
    if (info.warrantCheck && subject.warrants !== 'NONE') {
      questions.push({
        id: 'warrant',
        text: () => `Security alert shows an active warrant: ${subject.warrants}. Explain your presence at the depot.`,
        requiresWarrantCheck: true,
      });
    }
    
    // Transit log questions
    if (info.transitLog && subject.databaseQuery?.travelHistory) {
      const flaggedTrips = subject.databaseQuery.travelHistory.filter(t => t.flagged);
      if (flaggedTrips.length > 0) {
        questions.push({
          id: 'transit',
          text: () => `Transit logs show flagged movement prior to this breach. Explain those routes.`,
          requiresTransitLog: true,
        });
      }
    }
    
    // Incident history questions
    if (info.incidentHistory && subject.incidents > 0) {
      questions.push({
        id: 'incidents',
        text: () => `Records show ${subject.incidents} incident(s) tied to security zones. What happened?`,
        requiresIncidentHistory: true,
      });
    }
  }

  // Tier 3: All information - Cross-reference questions
  if (hasAllInformation(info)) {
    const dossier = subject.dossier;
    const findings: string[] = [];
    
    // Collect findings from identity scan
    if (info.identityScan && dossier) {
      findings.push(`identity: ${dossier.occupation} from ${dossier.address}`);
    }
    
    // Collect findings from verification
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
        text: () => `Your record shows ${findingsText}. Explain these discrepancies under breach protocol.`,
        requiresIdentityScan: info.identityScan,
        requiresWarrantCheck: info.warrantCheck,
        requiresTransitLog: info.transitLog,
        requiresIncidentHistory: info.incidentHistory,
      });
    } else if (findings.length === 1) {
      questions.push({
        id: 'specific-finding',
        text: () => {
          if (findings[0].includes('warrant')) {
            return `The system shows ${findings[0]}. Explain yourself.`;
          }
          return `The scan shows ${findings[0]}. Why should I allow you through?`;
        },
        requiresIdentityScan: info.identityScan,
        requiresWarrantCheck: info.warrantCheck,
        requiresTransitLog: info.transitLog,
        requiresIncidentHistory: info.incidentHistory,
      });
    }
  }

  // Phase 4: Add personality-targeted questions (only once evidence exists)
  if (hasSomeInformation(info)) {
    const personalityQuestions = getPersonalityTargetedQuestions(subject, info);

    // Merge personality questions with existing ones, avoiding duplicates
    personalityQuestions.forEach(pq => {
      if (!questions.some(q => q.id === pq.id)) {
        questions.push(pq);
      }
    });
  }

  // Fallback: If evidence exists but no specific questions generated, provide a basic one.
  if (questions.length === 0 && hasSomeInformation(info)) {
    questions.push({
      id: 'purpose',
      text: () => `What is your specific purpose for this visit?`,
    });
  }

  return questions;
}

/**
 * Phase 4: Calculate expected BPM change based on question and personality
 * Higher pressure questions cause bigger BPM spikes for certain personalities
 */
export function calculateQuestionBPMImpact(
  question: QuestionTemplate,
  subject: SubjectData,
  baseBPM: number
): number {
  const personality = subject.personalityTraits;
  if (!personality) return baseBPM;

  const pressureLevel = question.pressureLevel || 'MEDIUM';
  const pressureMultiplier = {
    LOW: 1,
    MEDIUM: 2,
    HIGH: 3,
  }[pressureLevel];

  // Base BPM change based on emotional stability
  const stabilityFactor = (100 - personality.emotionalStability) / 100;
  let bpmChange = Math.floor(5 * pressureMultiplier * stabilityFactor);

  // Personality-specific modifiers
  if (question.personalityTargeted === personality.primaryType) {
    // Question targets their weak spot - bigger reaction
    bpmChange = Math.floor(bpmChange * 1.5);
  }

  // Good liars (DECEPTIVE + high stability) might actually LOWER BPM
  if (
    personality.primaryType === 'DECEPTIVE' &&
    personality.emotionalStability > 75 &&
    subject.bpmTells?.isGoodLiar
  ) {
    bpmChange = -Math.floor(bpmChange * 0.3);
  }

  // Genuinely stressed people show more variation
  if (subject.bpmTells?.isGenuinelyStressed) {
    bpmChange = Math.floor(bpmChange * 1.3);
  }

  return baseBPM + bpmChange;
}

/**
 * Phase 4: Get the question phrasing adjusted for personality
 * Returns the question text with appropriate tone modifiers
 */
export function getPersonalityAdjustedQuestion(
  question: QuestionTemplate,
  subject: SubjectData
): string {
  const modifier = getPersonalityModifier(subject.personalityTraits);
  const baseText = question.text(subject);

  if (modifier.preamble) {
    return modifier.preamble + baseText;
  }

  return baseText;
}

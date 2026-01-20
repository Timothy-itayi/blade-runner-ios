// =============================================================================
// DYNAMIC BUSINESS RESPONSES - Based on subject character and data
// =============================================================================

import { SubjectData, SubjectArchetype } from '../data/subjects';
import { ProbeResponse } from './probes';

// Generate dynamic business response based on subject data and archetype
export const generateBusinessResponse = (
  subject: SubjectData,
  count: number = 0
): ProbeResponse => {
  const archetype = subject.archetype || 'CLN';
  const reasonForVisit = subject.reasonForVisit;
  const requestedSector = subject.requestedSector;
  const functionType = subject.function;
  const sector = subject.sector;

  // Extract sector number from reason if present
  const reasonSectorMatch = reasonForVisit.match(/SECTOR\s*(\d+)/i);
  const reasonSector = reasonSectorMatch ? reasonSectorMatch[0] : null;

  // Helper to get sector-specific responses
  const getSectorSpecific = (sectorNum: string) => {
    return [
      `I need to get to ${sectorNum}.`,
      `My destination is ${sectorNum}.`,
      `I'm heading to ${sectorNum}.`,
      `${sectorNum} is where I need to be.`,
    ];
  };

  // CLN (Clean) - Cooperative, straightforward
  const cleanResponses: string[] = [
    reasonSector 
      ? `Routine transit to ${reasonSector}. Work assignment.`
      : `${reasonForVisit}`,
    reasonSector
      ? `I already told you. ${reasonSector}. Work assignment. Same as always.`
      : `I said: ${reasonForVisit}. Can we move this along?`,
    `Look, I've said it twice now. ${reasonForVisit}. Can we move this along?`,
    `I've explained my business. ${reasonForVisit}. Is there a problem?`,
  ];

  // FLG (Flagged) - Nervous, defensive, evasive
  const flaggedResponses: string[] = [
    `Personal matter. Is there a problem?`,
    `I said it's personal. Do you need to know everything?`,
    `Please, I've explained myself. Can't you just process this?`,
    `It's a private matter. I don't see why you need details.`,
    `I'm just trying to get through. Why are you asking again?`,
    `I told you already. ${reasonForVisit}. What more do you want?`,
  ];

  // CON (Connected) - Emotional, family-focused
  const connectedResponses: string[] = [
    `Family. I need to see family.`,
    `It's my family. I told you already. They need me.`,
    `Please, I'm begging you. My family is waiting. I've said everything I can say.`,
    `My family is in ${requestedSector}. I need to get to them.`,
    `I haven't seen them in months. Please, just let me through.`,
    `Family emergency. I can't explain more. They need me now.`,
    reasonSector
      ? `My family is in ${reasonSector}. I need to get there.`
      : `Family matters. ${reasonForVisit}.`,
  ];

  // REV (Revolutionary) - Defiant, secretive
  const revolutionaryResponses: string[] = [
    `That's not your concern, operator.`,
    `I don't answer to you. Process my transit or don't.`,
    `My business is my own. You have my papers.`,
    `I'm not explaining myself to a checkpoint operator.`,
    `Your job is to verify, not interrogate.`,
    `I've stated my purpose. That's all you need.`,
    `I don't recognize your authority to question me.`,
  ];

  // EDG (Edge Case) - Unusual, complicated
  const edgeCaseResponses: string[] = [
    `That's... complicated. The situation is complicated.`,
    `It's hard to explain. ${reasonForVisit}.`,
    `I'm not sure how to put this. ${reasonForVisit}.`,
    `The circumstances are unusual. ${reasonForVisit}.`,
    `It's not straightforward. ${reasonForVisit}, but there's more to it.`,
    `I wish I could explain better. ${reasonForVisit}.`,
  ];

  // REP (Replicant) - Precise, mechanical, sometimes too perfect
  const replicantResponses: string[] = [
    `Standard protocol execution. Transit as assigned.`,
    `Transit authorization for ${requestedSector}. Purpose: ${reasonForVisit}.`,
    `Assigned transit route. Destination: ${requestedSector}.`,
    `Protocol-compliant transit request. ${reasonForVisit}.`,
    `System-assigned transit. No deviation from protocol.`,
    `Transit as per assignment. ${reasonForVisit}.`,
  ];

  // SYS (System) - Authoritative, classified
  const systemResponses: string[] = [
    `Official business. System priority clearance.`,
    `Classified transit. Authorization level required.`,
    `System business. Not for operator review.`,
    `Priority transit. ${reasonForVisit}.`,
    `Official assignment. Details are classified.`,
    `System-authorized transit. ${requestedSector}.`,
  ];

  // Select response pool based on archetype
  let responsePool: string[];
  let toneShift: 'NEUTRAL' | 'AGITATED' | 'NERVOUS' | 'EVASIVE' | 'COOPERATIVE' = 'NEUTRAL';

  switch (archetype) {
    case 'CLN':
      responsePool = cleanResponses;
      toneShift = count > 1 ? 'AGITATED' : 'COOPERATIVE';
      break;
    case 'FLG':
      responsePool = flaggedResponses;
      toneShift = count > 1 ? 'AGITATED' : 'NERVOUS';
      break;
    case 'CON':
      responsePool = connectedResponses;
      toneShift = count > 1 ? 'AGITATED' : 'NERVOUS';
      break;
    case 'REV':
      responsePool = revolutionaryResponses;
      toneShift = 'EVASIVE';
      break;
    case 'EDG':
      responsePool = edgeCaseResponses;
      toneShift = 'NERVOUS';
      break;
    case 'REP':
      responsePool = replicantResponses;
      toneShift = 'NEUTRAL';
      break;
    case 'SYS':
      responsePool = systemResponses;
      toneShift = 'NEUTRAL';
      break;
    default:
      responsePool = cleanResponses;
      toneShift = 'COOPERATIVE';
  }

  // Add context-specific variations based on subject data
  const contextualResponses: string[] = [];

  // If subject has warrants, they might be more evasive
  if (subject.warrants !== 'NONE' && archetype !== 'REP' && archetype !== 'SYS') {
    contextualResponses.push(
      `I know about the warrant. But ${reasonForVisit}. I need to get through.`,
      `The warrant is old. ${reasonForVisit} is what matters now.`,
    );
  }

  // If low compliance, they might be defensive
  if (['C', 'D', 'E', 'F'].includes(subject.compliance) && archetype !== 'REP') {
    contextualResponses.push(
      `I know my record isn't perfect. But ${reasonForVisit}.`,
      `Despite my record, ${reasonForVisit} is legitimate.`,
    );
  }

  // If function doesn't match reason (e.g., medical staff doing repairs)
  if (functionType && reasonForVisit.toLowerCase().includes('repair') && functionType.includes('MEDICAL')) {
    contextualResponses.push(
      `I'm helping with repairs. Medical staff can assist with technical work.`,
      `I'm cross-trained. ${reasonForVisit} is within my capabilities.`,
    );
  }

  // If incidents on record
  if (subject.incidents > 0 && archetype !== 'REP') {
    contextualResponses.push(
      `I know I have incidents. But ${reasonForVisit} is legitimate.`,
      `My past doesn't change that ${reasonForVisit}.`,
    );
  }

  // Merge contextual responses into pool (weighted toward end)
  const finalPool = [...responsePool];
  if (contextualResponses.length > 0) {
    // Add contextual responses, but keep archetype responses primary
    finalPool.push(...contextualResponses);
  }

  // Select response based on count (cycling through variations)
  const selectedIndex = Math.min(count, finalPool.length - 1);
  const selectedResponse = finalPool[selectedIndex] || finalPool[0];

  // Adjust tone based on how many times asked
  if (count > 2) {
    if (toneShift === 'COOPERATIVE') toneShift = 'AGITATED';
    if (toneShift === 'NEUTRAL') toneShift = 'NERVOUS';
  }

  return {
    probeType: 'BUSINESS',
    response: selectedResponse,
    toneShift,
  };
};

// Helper to get business response for a subject
export const getBusinessResponse = (
  subject: SubjectData,
  count: number = 0
): ProbeResponse => {
  return generateBusinessResponse(subject, count);
};

// =============================================================================
// DYNAMIC DISCREPANCY RESPONSES - Based on actual verification data
// =============================================================================

import { SubjectData, SubjectArchetype } from '../data/subjects';
import { ProbeResponse } from './probes';

type DiscrepancyType = 
  | 'SECTOR_MISMATCH'
  | 'WARRANT_ACTIVE'
  | 'FUNCTION_EXPIRED'
  | 'SECTOR_FLAGGED'
  | 'INCIDENT_HISTORY'
  | 'TRANSIT_ANOMALY'
  | 'COMPLIANCE_LOW'
  | 'MULTIPLE';

interface DiscrepancyInfo {
  type: DiscrepancyType;
  details: string;
}

// Detect what type of discrepancy exists
export const detectDiscrepancy = (subject: SubjectData): DiscrepancyInfo | null => {
  const discrepancies: DiscrepancyInfo[] = [];

  // Sector mismatch
  const reasonSectorMatch = subject.reasonForVisit.match(/SECTOR\s*(\d+)/i);
  const reasonSector = reasonSectorMatch ? reasonSectorMatch[0].toUpperCase() : null;
  const requestedSector = subject.requestedSector.toUpperCase();
  if (reasonSector && reasonSector !== requestedSector) {
    discrepancies.push({
      type: 'SECTOR_MISMATCH',
      details: `Reason mentions ${reasonSector} but requesting ${requestedSector}`,
    });
  }

  // Active warrant
  if (subject.warrants !== 'NONE') {
    discrepancies.push({
      type: 'WARRANT_ACTIVE',
      details: `Active warrant: ${subject.warrants}`,
    });
  }

  // Function expired
  if (subject.authData.functionReg.status === 'EXPIRED') {
    discrepancies.push({
      type: 'FUNCTION_EXPIRED',
      details: `Function registration expired: ${subject.function}`,
    });
  }

  // Sector flagged
  if (subject.authData.sectorAuth.status === 'FLAGGED') {
    discrepancies.push({
      type: 'SECTOR_FLAGGED',
      details: `Sector authorization flagged for ${requestedSector}`,
    });
  }

  // Incident history
  if (subject.incidents > 0 || (subject.incidentHistory && subject.incidentHistory.length > 0)) {
    discrepancies.push({
      type: 'INCIDENT_HISTORY',
      details: `${subject.incidents} incident(s) on record`,
    });
  }

  // Transit anomalies (restricted zone access)
  if (subject.transitLog) {
    const flaggedTransit = subject.transitLog.some(t => t.flagged);
    if (flaggedTransit) {
      discrepancies.push({
        type: 'TRANSIT_ANOMALY',
        details: 'Flagged transit pattern detected',
      });
    }
  }

  // Low compliance
  if (['C', 'D', 'E', 'F'].includes(subject.compliance)) {
    discrepancies.push({
      type: 'COMPLIANCE_LOW',
      details: `Compliance rating: ${subject.compliance}`,
    });
  }

  if (discrepancies.length === 0) return null;
  if (discrepancies.length > 1) {
    return { type: 'MULTIPLE', details: `${discrepancies.length} discrepancies detected` };
  }
  return discrepancies[0];
};

// Generate response based on discrepancy type and archetype
export const generateDiscrepancyResponse = (
  subject: SubjectData,
  discrepancy: DiscrepancyInfo,
  count: number = 0
): ProbeResponse => {
  const archetype = subject.archetype || 'CLN';
  const responses: string[] = [];

  // Truthful responses (some subjects admit issues)
  const truthfulResponses: Record<DiscrepancyType, string[]> = {
    SECTOR_MISMATCH: [
      "I... I made a mistake. I meant to say SECTOR [requested]. My apologies.",
      "You're right. I misspoke. It's [requested] I need to go to.",
      "I was confused. The correct sector is [requested].",
    ],
    WARRANT_ACTIVE: [
      "That warrant... it's from years ago. I thought it was cleared.",
      "I know about the warrant. I'm trying to resolve it, but I need to get through first.",
      "Yes, there's a warrant. But it's a misunderstanding. I can explain if you'll listen.",
    ],
    FUNCTION_EXPIRED: [
      "My registration expired? I didn't realize. I need to renew it.",
      "I thought it was still valid. When did it expire?",
      "The system must not have updated. I renewed it last month.",
    ],
    SECTOR_FLAGGED: [
      "I know my authorization is flagged. There was a mix-up with my paperwork.",
      "The flag is a mistake. I have clearance, but the system hasn't updated.",
      "I'm aware of the flag. I'm working with my supervisor to clear it.",
    ],
    INCIDENT_HISTORY: [
      "Those incidents... they were misunderstandings. I was cleared.",
      "I know I have incidents on record. But they're old, and I've been clean since.",
      "Yes, I have a history. But I've changed. I'm trying to do better.",
    ],
    TRANSIT_ANOMALY: [
      "I know my transit pattern looks unusual. I had to take detours due to closures.",
      "The flagged transit... that was during the sector lockdown. I had special permission.",
      "I can explain the transit pattern. There were system errors that day.",
    ],
    COMPLIANCE_LOW: [
      "I know my compliance rating is low. I'm working to improve it.",
      "The rating is outdated. I've been following all protocols recently.",
      "Yes, I have a low rating. But I've been compliant for months now.",
    ],
    MULTIPLE: [
      "I know there are issues in my record. But I can explain each one.",
      "There are multiple flags, yes. But they're all misunderstandings or outdated.",
      "I'm aware of the discrepancies. They're not what they seem.",
    ],
  };

  // Evasive responses (subjects deflect or change subject)
  const evasiveResponses: Record<DiscrepancyType, string[]> = {
    SECTOR_MISMATCH: [
      "What discrepancy? I said [requested]. Your system must be misreading.",
      "I don't see any discrepancy. Can you clarify what you mean?",
      "That doesn't make sense. I've been clear about where I'm going.",
    ],
    WARRANT_ACTIVE: [
      "I don't know anything about a warrant. Your database must be wrong.",
      "Warrant? What warrant? I've never had any legal issues.",
      "That's not possible. I've never been flagged for anything.",
    ],
    FUNCTION_EXPIRED: [
      "My function registration is fine. The system hasn't updated yet.",
      "That can't be right. I just renewed it last week.",
      "There must be a delay in the system. My registration is current.",
    ],
    SECTOR_FLAGGED: [
      "I have proper authorization. Check again. The system is slow sometimes.",
      "The flag is a system error. I have clearance from my supervisor.",
      "That's not accurate. My authorization is valid. There's a glitch in your system.",
    ],
    INCIDENT_HISTORY: [
      "I don't have any incidents. Your records must be mixed up with someone else.",
      "What incidents? I've never been involved in any incidents.",
      "Those aren't my incidents. There must be a data error.",
    ],
    TRANSIT_ANOMALY: [
      "My transit pattern is normal. I don't know what you're seeing.",
      "There's no anomaly. I've followed all transit protocols.",
      "I don't understand what you mean. My transit history is clean.",
    ],
    COMPLIANCE_LOW: [
      "My compliance is fine. The rating system is outdated.",
      "I don't know why my rating is low. I've been following all rules.",
      "That rating doesn't reflect my current status. I'm fully compliant.",
    ],
    MULTIPLE: [
      "I don't see any discrepancies. Your system must be malfunctioning.",
      "What discrepancies? Everything in my record is accurate.",
      "I'm not sure what you're referring to. Can you be more specific?",
    ],
  };

  // Defiant responses (subjects challenge the system)
  const defiantResponses: Record<DiscrepancyType, string[]> = {
    SECTOR_MISMATCH: [
      "Your records are wrong. I know where I need to go.",
      "The system is incorrect. I'm telling you the truth.",
      "I don't care what your records say. I need to get through.",
    ],
    WARRANT_ACTIVE: [
      "That warrant is unjust. I'm not going to let it stop me.",
      "Your warrant system is corrupt. I won't be stopped by false charges.",
      "I know about the warrant. It's a mistake, and I'm not backing down.",
    ],
    FUNCTION_EXPIRED: [
      "The expiration is a bureaucratic error. I'm still qualified.",
      "Your system's expiration date is wrong. I'm still registered.",
      "I don't care if it's expired. I need to do my job.",
    ],
    SECTOR_FLAGGED: [
      "The flag is meaningless. I have the right to transit.",
      "Your authorization system is broken. I'm going through.",
      "I don't recognize that flag. I'm proceeding regardless.",
    ],
    INCIDENT_HISTORY: [
      "Those incidents are in the past. They don't define me.",
      "I don't care about old incidents. I'm a different person now.",
      "Your incident records are irrelevant. I'm moving forward.",
    ],
    TRANSIT_ANOMALY: [
      "My transit pattern is my business. I don't need to explain it.",
      "There's no anomaly. Your system is overreacting.",
      "I don't see why my transit pattern matters. I'm following my own path.",
    ],
    COMPLIANCE_LOW: [
      "Compliance ratings are arbitrary. I know I'm in the right.",
      "I don't care about your rating system. I'm doing what I need to do.",
      "The rating is wrong. I'm fully compliant with what matters.",
    ],
    MULTIPLE: [
      "Your system is full of errors. I'm not going to be stopped by false flags.",
      "I don't recognize any of these discrepancies. They're all system errors.",
      "Multiple discrepancies? Your entire database must be corrupted.",
    ],
  };

  // Select response style based on archetype
  let responsePool: Record<DiscrepancyType, string[]>;
  
  switch (archetype) {
    case 'CLN':
      // Clean subjects are more likely to be truthful or confused
      responsePool = Math.random() > 0.5 ? truthfulResponses : evasiveResponses;
      break;
    case 'FLG':
      // Flagged subjects are evasive or defensive
      responsePool = Math.random() > 0.3 ? evasiveResponses : truthfulResponses;
      break;
    case 'CON':
      // Connected subjects are often truthful (family matters)
      responsePool = Math.random() > 0.4 ? truthfulResponses : evasiveResponses;
      break;
    case 'REV':
      // Revolutionaries are defiant
      responsePool = Math.random() > 0.2 ? defiantResponses : evasiveResponses;
      break;
    case 'EDG':
      // Edge cases vary
      responsePool = Math.random() > 0.33 
        ? (Math.random() > 0.5 ? truthfulResponses : evasiveResponses)
        : defiantResponses;
      break;
    case 'REP':
      // Replicants are evasive or deny
      responsePool = Math.random() > 0.3 ? evasiveResponses : defiantResponses;
      break;
    case 'SYS':
      // System subjects are evasive (classified)
      responsePool = evasiveResponses;
      break;
    default:
      responsePool = evasiveResponses;
  }

  // Get responses for this discrepancy type
  const typeResponses = responsePool[discrepancy.type] || evasiveResponses[discrepancy.type];
  
  // Select based on count (allow multiple variations)
  const selectedResponse = typeResponses[Math.min(count, typeResponses.length - 1)] || typeResponses[0];
  
  // Replace placeholders with actual values
  const reasonSectorMatch = subject.reasonForVisit.match(/SECTOR\s*(\d+)/i);
  const reasonSector = reasonSectorMatch ? reasonSectorMatch[0] : subject.reasonForVisit;
  
  let finalResponse = selectedResponse
    .replace('[requested]', subject.requestedSector)
    .replace('[reason]', reasonSector);

  // Determine tone shift based on response style
  let toneShift: 'NEUTRAL' | 'AGITATED' | 'NERVOUS' | 'EVASIVE' | 'COOPERATIVE' = 'NERVOUS';
  if (responsePool === defiantResponses) {
    toneShift = 'AGITATED';
  } else if (responsePool === evasiveResponses) {
    toneShift = 'EVASIVE';
  } else if (responsePool === truthfulResponses) {
    toneShift = archetype === 'CLN' ? 'COOPERATIVE' : 'NERVOUS';
  }

  return {
    probeType: 'DISCREPANCY',
    response: finalResponse,
    toneShift,
  };
};

// Helper to get discrepancy response for a subject
export const getDiscrepancyResponse = (
  subject: SubjectData,
  count: number = 0
): ProbeResponse | null => {
  const discrepancy = detectDiscrepancy(subject);
  if (!discrepancy) return null;
  
  return generateDiscrepancyResponse(subject, discrepancy, count);
};

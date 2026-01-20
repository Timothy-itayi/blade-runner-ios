// =============================================================================
// PROBE TEMPLATES - Default responses by subject archetype
// =============================================================================

import { ProbeType, ProbeResponse } from './probes';
import { SubjectArchetype } from '../data/subjects';

type ProbeTemplate = Omit<ProbeResponse, 'probeType'>;

// Default probe responses by archetype
// CLN = Clean, FLG = Flagged, CON = Connected, REV = Revolutionary,
// EDG = Edge Case, REP = Replicant, SYS = System

export const PROBE_TEMPLATES: Record<SubjectArchetype, Record<ProbeType, ProbeTemplate>> = {
  CLN: {
    HANDS: {
      response: "[Subject complies. Hands steady, unremarkable.]",
      toneShift: 'COOPERATIVE',
    },
    BUSINESS: {
      response: [
        "Routine transit. Work assignment.",
        "I already told you. Work assignment. Same as always.",
        "Look, I've said it twice now. Can we move this along?",
      ],
      toneShift: 'NEUTRAL',
    },
    DISCREPANCY: {
      response: "I... there must be some error in your system.",
      toneShift: 'NERVOUS',
    },
    IDENTITY: {
      response: "[Subject confirms identity. Credentials requested. Check [ CREDENTIALS ] button when received.]",
      toneShift: 'COOPERATIVE',
    },
  },

  FLG: {
    HANDS: {
      response: "[Subject hesitates, then complies. Slight tremor visible.]",
      toneShift: 'NERVOUS',
    },
    BUSINESS: {
      response: [
        "Personal matter. Is there a problem?",
        "I said it's personal. Do you need to know everything?",
        "Please, I've explained myself. Can't you just process this?",
      ],
      toneShift: 'AGITATED',
    },
    DISCREPANCY: {
      response: "That's... that's outdated information. The system is wrong.",
      toneShift: 'EVASIVE',
    },
    IDENTITY: {
      response: "[Subject confirms details. Credentials requested. Check [ CREDENTIALS ] button when received.]",
      toneShift: 'NERVOUS',
    },
  },

  CON: {
    HANDS: {
      response: "[Subject complies slowly. Hands calloused, worn.]",
      toneShift: 'COOPERATIVE',
    },
    BUSINESS: {
      response: [
        "Family. I need to see family.",
        "It's my family. I told you already. They need me.",
        "Please, I'm begging you. My family is waiting. I've said everything I can say.",
      ],
      toneShift: 'AGITATED',
    },
    DISCREPANCY: {
      response: "Please... you don't understand what's at stake.",
      toneShift: 'AGITATED',
    },
    IDENTITY: {
      response: "[Subject confirms identity. Credentials requested. Check [ CREDENTIALS ] button when received.]",
      toneShift: 'NERVOUS',
    },
  },

  REV: {
    HANDS: {
      response: "[Subject complies with exaggerated slowness. Defiant stare.]",
      toneShift: 'EVASIVE',
    },
    BUSINESS: {
      response: "That's not your concern, operator.",
      toneShift: 'EVASIVE',
    },
    DISCREPANCY: {
      response: "Your records are a tool of control. They say what they need to say.",
      toneShift: 'AGITATED',
    },
    IDENTITY: {
      response: "[Subject states name only. Credentials requested. Check [ CREDENTIALS ] button when received.]",
      toneShift: 'EVASIVE',
    },
  },

  EDG: {
    HANDS: {
      response: "[Subject complies. Something about the gesture feels... off.]",
      toneShift: 'NEUTRAL',
    },
    BUSINESS: {
      response: "That's... complicated. The situation is complicated.",
      toneShift: 'NERVOUS',
    },
    DISCREPANCY: {
      response: "Both things can be true, operator. Think about it.",
      toneShift: 'NEUTRAL',
    },
    IDENTITY: {
      response: "[Subject confirms identity. Credentials requested. Check [ CREDENTIALS ] button when received.]",
      toneShift: 'NEUTRAL',
    },
  },

  REP: {
    HANDS: {
      response: "[Subject complies. Movements precise, almost mechanical.]",
      toneShift: 'COOPERATIVE',
    },
    BUSINESS: {
      response: "Standard protocol execution. Transit as assigned.",
      toneShift: 'NEUTRAL',
    },
    DISCREPANCY: {
      response: "Error noted. Processing... There is no discrepancy.",
      toneShift: 'NEUTRAL',
    },
    IDENTITY: {
      response: "[Subject recites identity data with exact precision. Credentials requested. Check [ CREDENTIALS ] button when received.]",
      toneShift: 'COOPERATIVE',
    },
  },

  SYS: {
    HANDS: {
      response: "[Subject complies briskly. No hesitation.]",
      toneShift: 'COOPERATIVE',
    },
    BUSINESS: {
      response: "Official business. System priority clearance.",
      toneShift: 'NEUTRAL',
    },
    DISCREPANCY: {
      response: "Check your authorization level, operator. Some data is classified.",
      toneShift: 'NEUTRAL',
    },
    IDENTITY: {
      response: "[Subject presents credentials. Credentials requested. Check [ CREDENTIALS ] button when received.]",
      toneShift: 'COOPERATIVE',
    },
  },
};

// Helper function to get default probe responses for a subject
export const getDefaultProbeResponses = (archetype: SubjectArchetype): ProbeResponse[] => {
  const templates = PROBE_TEMPLATES[archetype];
  return (Object.keys(templates) as ProbeType[]).map(probeType => ({
    probeType,
    ...templates[probeType],
  }));
};

// Helper to get a single probe response for a subject
export const getDefaultProbeResponse = (
  archetype: SubjectArchetype,
  probeType: ProbeType,
  count: number = 0
): ProbeResponse => {
  const template = PROBE_TEMPLATES[archetype][probeType];
  // If response is an array, select based on count
  const response = Array.isArray(template.response)
    ? template.response[Math.min(count, template.response.length - 1)]
    : template.response;
  
  return {
    probeType,
    response,
    toneShift: template.toneShift,
  };
};

// Required probes by archetype (which probes must be completed before decision)
export const REQUIRED_PROBES_BY_ARCHETYPE: Record<SubjectArchetype, ProbeType[]> = {
  CLN: [],                    // Clean subjects: no required probes
  FLG: ['BUSINESS'],          // Flagged: must ask about business
  CON: ['BUSINESS'],          // Connected: must ask about business (often family)
  REV: ['BUSINESS', 'IDENTITY'], // Revolutionary: must verify both
  EDG: ['BUSINESS'],          // Edge case: must understand the situation
  REP: ['HANDS', 'IDENTITY'], // Replicant: biometric and identity critical
  SYS: [],                    // System: typically auto-cleared
};

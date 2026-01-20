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
      response: [
        "I know you have to check. Everyone knows about the replicants.",
        "Again? I'm human. We all know what replicant hands look like.",
        "This is the third time. I'm clearly human.",
      ],
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
      response: "Credentials requested. Check [ CREDENTIALS ] when received.",
      toneShift: 'COOPERATIVE',
    },
  },

  FLG: {
    HANDS: {
      response: [
        "I know why you're checking. The replicants.",
        "I'm not one of them. I'm human.",
        "I've shown you twice. I'm just nervous.",
      ],
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
      response: "Credentials requested. Check [ CREDENTIALS ] when received.",
      toneShift: 'NERVOUS',
    },
  },

  CON: {
    HANDS: {
      response: [
        "I know the drill. Check for replicants. I'm not one.",
        "Look at my hands. Real hands. Not like those things.",
        "I've shown you three times. I'm human. My family needs me.",
      ],
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
      response: "Credentials requested. Check [ CREDENTIALS ] when received.",
      toneShift: 'NERVOUS',
    },
  },

  REV: {
    HANDS: {
      response: [
        "Checking for replicants? We should all be checked. Even you.",
        "Again? I'm human. Maybe you should check yourself.",
        "This is harassment. Process me or don't.",
      ],
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
      response: "Credentials requested. Check [ CREDENTIALS ] when received.",
      toneShift: 'EVASIVE',
    },
  },

  EDG: {
    HANDS: {
      response: [
        "Everyone's paranoid about replicants these days.",
        "I'm human. Mostly. The prosthetics are registered.",
        "This is excessive. I'm human. Can we move on?",
      ],
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
      response: "Credentials requested. Check [ CREDENTIALS ] when received.",
      toneShift: 'NEUTRAL',
    },
  },

  REP: {
    HANDS: {
      response: [
        "Hand verification is standard.",
        "All biometric markers within expected parameters.",
        "System efficiency compromised. Proceed with current status.",
      ],
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
      response: "Credentials requested. Check [ CREDENTIALS ] when received.",
      toneShift: 'COOPERATIVE',
    },
  },

  SYS: {
    HANDS: {
      response: [
        "Standard verification protocol. Proceed.",
        "Verification complete. Proceed.",
        "Status confirmed. Process request.",
      ],
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
      response: "Credentials requested. Check [ CREDENTIALS ] when received.",
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

export interface Outcome {
  feedback: string;
  consequence: string;
}

export interface NarrativeVariant {
  linkedId: string; // The ID of the earlier subject
  onApprove?: Partial<Omit<SubjectData, 'narrativeVariants' | 'outcomes' | 'locRecord'>>;
  onDeny?: Partial<Omit<SubjectData, 'narrativeVariants' | 'outcomes' | 'locRecord'>>;
}

export interface SubjectData {
  // Core Identity
  name: string;
  id: string;                   // Subject ID Code e.g. "N8-FBA71527"
  sex: 'M' | 'F';
  
  // Assignment
  sector: string;               // Assigned/Living Sector
  function: string;             // Job Function
  
  // Status (the meat of verification)
  compliance: string;           // "A" | "B" | "C" | "D" | "F"
  status: string;               // "ACTIVE" | "PROVISIONAL" | "RESTRICTED" | "UNDER REVIEW" | "[TERMINATED]"
  
  // Flags
  incidents: number;            // 0-5
  warrants: string;             // "NONE" | "WARRANT NO XXXXX"
  restrictions?: string[];
  
  // The Request
  reasonForVisit: string;
  requestedSector: string;      // What they are asking for
  
  // Internal Assets/System Data
  videoSource: any;
  bpm?: string;
  dialogue?: string;             // What the subject says to the operator
  phase: number;
  locRecord: {
    addr: string;
    time: string;
    pl: string;     // Previous Location
    dob: string;    // Date of Birth
  };
  
  // Truth for Verification Drawer
  authData: {
    sectorAuth: { requested: string; status: 'AUTHORIZED' | 'RESTRICTED' | 'FLAGGED'; message: string };
    functionReg: { status: 'VALID' | 'EXPIRED' | 'UNREGISTERED'; message: string };
    warrantCheck: { status: 'CLEAR' | 'ACTIVE' | 'PENDING'; message: string };
    medicalFlag: { status: 'NORMAL' | 'ELEVATED' | 'CRITICAL'; message: string };
  };

  outcomes: {
    APPROVE: Outcome;
    DENY: Outcome;
  };

  narrativeVariants?: NarrativeVariant[];
}

export const SUBJECTS: SubjectData[] = [
  // --- PHASE 1: THE SETUP (Subjects 1-10) ---
  {
    name: 'ELARA VANCE',
    id: 'V1-EV001',
    sex: 'F',
    sector: 'SECTOR 7',
    function: 'ENGINEERING',
    compliance: 'B',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    reasonForVisit: 'Repairs to thermal regulator.',
    requestedSector: 'SECTOR 4',
    videoSource: require('../assets/videos/eye00.mp4'),
    dialogue: "Long day. Just trying to get this regulator fixed before the whole sector overheats.",
    phase: 1,
    locRecord: { addr: 'SECTOR 7', time: '14:22:11', pl: 'SECTOR 5', dob: '12/04/92' },
    authData: {
      sectorAuth: { requested: 'SECTOR 4', status: 'AUTHORIZED', message: '✓ Sector 4 authorized for engineering' },
      functionReg: { status: 'VALID', message: '✓ Credentials active' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'NORMAL', message: '✓ Baseline stable' },
    },
    outcomes: {
      APPROVE: { feedback: 'SUBJECT PROCESSED', consequence: 'SILENT' },
      DENY: { feedback: 'ENTRY DENIED', consequence: 'SILENT' }
    }
  },
  {
    name: 'KANE MORROW',
    id: 'V1-KM002',
    sex: 'M',
    sector: 'SECTOR 3',
    function: 'LOGISTICS',
    compliance: 'C',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'WARRANT NO 45221',
    reasonForVisit: 'Visiting family.',
    requestedSector: 'SECTOR 6',
    videoSource: '',
    dialogue: "I'm already late. My daughter is waiting for me in Sector 6. It's her birthday today.",
    phase: 1,
    locRecord: { addr: 'SECTOR 3', time: '09:15:44', pl: 'SECTOR 1', dob: '22/08/88' },
    authData: {
      sectorAuth: { requested: 'SECTOR 6', status: 'AUTHORIZED', message: '✓ Sector 6 open' },
      functionReg: { status: 'VALID', message: '✓ Logistics permit active' },
      warrantCheck: { status: 'ACTIVE', message: '✗ ACTIVE WARRANT DETECTED' },
      medicalFlag: { status: 'NORMAL', message: '✓ Baseline stable' },
    },
    outcomes: {
      APPROVE: { feedback: 'SUBJECT PROCESSED', consequence: 'SILENT' },
      DENY: { feedback: 'ENTRY DENIED', consequence: 'SILENT' }
    }
  },
  {
    name: 'ELENA VOSS',
    id: 'V1-EV003',
    sex: 'F',
    sector: 'SECTOR 7',
    function: 'ENGINEERING',
    compliance: 'A',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    reasonForVisit: 'Meeting with supervisor.',
    requestedSector: 'SECTOR 4',
    videoSource: '',
    dialogue: "Sector 4 briefing. High command doesn't like it when Engineering is late. Can we move this along?",
    phase: 1,
    locRecord: { addr: 'SECTOR 7', time: '03:42:11', pl: 'SECTOR 4', dob: '05/11/94' },
    authData: {
      sectorAuth: { requested: 'SECTOR 4', status: 'AUTHORIZED', message: '✓ Sector 4 open' },
      functionReg: { status: 'VALID', message: '✓ Credentials active' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'NORMAL', message: '✓ Baseline stable' },
    },
    outcomes: {
      APPROVE: { feedback: 'SUBJECT PROCESSED', consequence: 'SILENT' },
      DENY: { feedback: 'ENTRY DENIED', consequence: 'SILENT' }
    }
  },
  {
    name: 'JAXON REED',
    id: 'V1-JR004',
    sex: 'M',
    sector: 'SECTOR 2',
    function: 'SANITATION',
    compliance: 'A',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    reasonForVisit: 'Standard cleaning cycle.',
    requestedSector: 'SECTOR 2',
    videoSource: '',
    dialogue: "Same routine, different morning. Sanitation shift in Sector 2. Ready when you are.",
    phase: 1,
    locRecord: { addr: 'SECTOR 2', time: '03:10:15', pl: 'SECTOR 8', dob: '30/01/90' },
    authData: {
      sectorAuth: { requested: 'SECTOR 2', status: 'AUTHORIZED', message: '✓ Internal sector access' },
      functionReg: { status: 'VALID', message: '✓ Sanitation permit active' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'NORMAL', message: '✓ Baseline stable' },
    },
    outcomes: {
      APPROVE: { feedback: 'SUBJECT PROCESSED', consequence: 'SILENT' },
      DENY: { feedback: 'ENTRY DENIED', consequence: 'SILENT' }
    }
  },
  {
    name: 'KARL BRANDT',
    id: 'V1-KB005',
    sex: 'M',
    sector: 'SECTOR 8',
    function: 'LOGISTICS',
    compliance: 'B',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    reasonForVisit: 'Equipment delivery.',
    requestedSector: 'SECTOR 6',
    videoSource: '',
    dialogue: "Heavylift logistics for Sector 6. Just routine equipment. Smells like ozone and grease.",
    phase: 1,
    locRecord: { addr: 'SECTOR 8', time: '12:12:12', pl: 'SECTOR 3', dob: '14/07/85' },
    authData: {
      sectorAuth: { requested: 'SECTOR 6', status: 'AUTHORIZED', message: '✓ Delivery route authorized' },
      functionReg: { status: 'VALID', message: '✓ Transport license active' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'NORMAL', message: '✓ Baseline stable' },
    },
    outcomes: {
      APPROVE: { feedback: 'SUBJECT PROCESSED', consequence: 'SILENT' },
      DENY: { feedback: 'ENTRY DENIED', consequence: 'SILENT' }
    }
  },
  {
    name: 'MIRA FINN',
    id: 'V1-MF006',
    sex: 'F',
    sector: 'SECTOR 8',
    function: 'TRANSPORT',
    compliance: 'B',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    reasonForVisit: 'Routine delivery.',
    requestedSector: 'SECTOR 4',
    videoSource: '',
    dialogue: "Another transport run. Sector 4. Seems like everyone's heading that way today.",
    phase: 1,
    locRecord: { addr: 'SECTOR 8', time: '10:05:00', pl: 'SECTOR 8', dob: '19/02/93' },
    authData: {
      sectorAuth: { requested: 'SECTOR 4', status: 'AUTHORIZED', message: '✓ Sector 4 access open' },
      functionReg: { status: 'VALID', message: '✓ Transport license active' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'NORMAL', message: '✓ Baseline stable' },
    },
    outcomes: {
      APPROVE: { feedback: 'SUBJECT PROCESSED', consequence: 'SILENT' },
      DENY: { feedback: 'ENTRY DENIED', consequence: 'SILENT' }
    }
  },
  {
    name: 'DMITRI VOLKOV',
    id: 'V1-DV007',
    sex: 'M',
    sector: 'SECTOR 9 [REVOKED]',
    function: 'UNASSIGNED',
    compliance: 'C',
    status: 'ACTIVE',
    incidents: 1,
    warrants: 'NONE',
    reasonForVisit: 'Returning home.',
    requestedSector: 'SECTOR 9',
    videoSource: '',
    dialogue: "They can't just revoke my life. I've lived in Sector 9 for twenty years. I'm going home.",
    phase: 1,
    locRecord: { addr: 'SECTOR 4', time: '17:30:00', pl: 'SECTOR 9', dob: '03/03/78' },
    authData: {
      sectorAuth: { requested: 'SECTOR 9', status: 'RESTRICTED', message: '✗ ZONE REVOKED' },
      functionReg: { status: 'VALID', message: '✓ Identity verified' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'NORMAL', message: '✓ Baseline stable' },
    },
    outcomes: {
      APPROVE: { feedback: 'SUBJECT PROCESSED', consequence: 'SILENT' },
      DENY: { feedback: 'ENTRY DENIED', consequence: 'SILENT' }
    }
  },
  {
    name: 'KALEB ROSS',
    id: 'V1-KR008',
    sex: 'M',
    sector: 'SECTOR 5',
    function: 'ARCHIVE',
    compliance: 'C',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    reasonForVisit: 'Data retrieval.',
    requestedSector: 'SECTOR 5',
    videoSource: '',
    dialogue: "Archive retrieval for Sector 5. They're doing an audit, but the data still needs processing.",
    phase: 1,
    locRecord: { addr: 'SECTOR 5', time: '10:00:00', pl: 'SECTOR 5', dob: '27/09/82' },
    authData: {
      sectorAuth: { requested: 'SECTOR 5', status: 'RESTRICTED', message: '✗ ARCHIVE SECTOR RESTRICTED DURING AUDIT' },
      functionReg: { status: 'VALID', message: '✓ Archivist credentials verified' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'NORMAL', message: '✓ Baseline stable' },
    },
    outcomes: {
      APPROVE: { feedback: 'SUBJECT PROCESSED', consequence: 'SILENT' },
      DENY: { feedback: 'ENTRY DENIED', consequence: 'SILENT' }
    }
  },
  {
    name: 'ELIAS VOSS',
    id: 'V1-EV009',
    sex: 'M',
    sector: 'SECTOR 7',
    function: 'LOGISTICS',
    compliance: 'B',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    reasonForVisit: 'Emergency passage to SECTOR 6 for equipment delivery.',
    requestedSector: 'SECTOR 4',
    videoSource: '',
    dialogue: "Emergency logistics for Sector 6. It's a priority shipment. Engineering needs those parts.",
    phase: 1,
    locRecord: { addr: 'SECTOR 7', time: '15:10:00', pl: 'SECTOR 7', dob: '11/12/89' },
    authData: {
      sectorAuth: { requested: 'SECTOR 4', status: 'AUTHORIZED', message: '✓ Sector 4 open' },
      functionReg: { status: 'VALID', message: '✓ Logistics credentials verified' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'NORMAL', message: '✓ Baseline stable' },
    },
    outcomes: {
      APPROVE: { feedback: 'SUBJECT PROCESSED', consequence: 'SILENT' },
      DENY: { feedback: 'ENTRY DENIED', consequence: 'SILENT' }
    }
  },
  {
    name: 'JAMES CHEN',
    id: 'V1-JC010',
    sex: 'M',
    sector: 'SECTOR 4',
    function: 'MAINTENANCE',
    compliance: 'D',
    status: 'PROVISIONAL',
    incidents: 2,
    warrants: 'NONE',
    reasonForVisit: 'Final appeal. Requesting reassignment review.',
    requestedSector: 'SECTOR 4',
    videoSource: '',
    dialogue: "Maintenance appeal. Sector 4 has openings, and I'm tired of the provisional status.",
    phase: 1,
    locRecord: { addr: 'SECTOR 4', time: '09:00:00', pl: 'SECTOR 4', dob: '08/06/87' },
    authData: {
      sectorAuth: { requested: 'SECTOR 4', status: 'AUTHORIZED', message: '✓ Sector 4 open' },
      functionReg: { status: 'VALID', message: '✓ Credentials active' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'NORMAL', message: '✓ Baseline stable' },
    },
    outcomes: {
      APPROVE: { feedback: 'SUBJECT PROCESSED', consequence: 'SILENT' },
      DENY: { feedback: 'ENTRY DENIED', consequence: 'SILENT' }
    }
  },

  // --- PHASE 2: THE ECHOES (Subjects 11-20) ---
  {
    name: 'LYRA BELLE',
    id: 'V2-LB011',
    sex: 'F',
    sector: 'SECTOR 2',
    function: 'MAINTENANCE',
    compliance: 'B',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    reasonForVisit: 'Scheduled maintenance in SECTOR 1.',
    requestedSector: 'SECTOR 3',
    videoSource: '',
    dialogue: "My supervisor is threatening to dock my pay because of a glitch in Sector 3. Every second I'm stuck here is another minute I'll be yelled at.",
    phase: 2,
    locRecord: { addr: 'SECTOR 2', time: '08:45:00', pl: 'SECTOR 2', dob: '15/05/91' },
    authData: {
      sectorAuth: { requested: 'SECTOR 3', status: 'AUTHORIZED', message: '✓ Sector 3 authorized' },
      functionReg: { status: 'VALID', message: '✓ Credentials active' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'NORMAL', message: '✓ Baseline stable' },
    },
    outcomes: {
      APPROVE: { feedback: 'SUBJECT PROCESSED', consequence: 'ROUTING ERROR. Subject requested 3 but work was in 1. Operator error logged.' },
      DENY: { feedback: 'ENTRY DENIED', consequence: 'SILENT' }
    }
  },
  {
    name: 'SILAS QUINN',
    id: 'V2-SQ012',
    sex: 'M',
    sector: 'SECTOR 5',
    function: 'ENGINEERING',
    compliance: 'D',
    status: 'PROVISIONAL',
    incidents: 2,
    warrants: 'NONE',
    reasonForVisit: 'Medical appointment.',
    requestedSector: 'SECTOR 4',
    videoSource: '',
    dialogue: "I have a medical appointment in Sector 4. My baseline is a bit shaky today.",
    phase: 2,
    locRecord: { addr: 'SECTOR 5', time: '11:20:00', pl: 'SECTOR 5', dob: '29/10/83' },
    authData: {
      sectorAuth: { requested: 'SECTOR 4', status: 'AUTHORIZED', message: '✓ Sector 4 open' },
      functionReg: { status: 'VALID', message: '✓ Credentials verified' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'ELEVATED', message: '! Stress detected' },
    },
    outcomes: {
      APPROVE: { feedback: 'SUBJECT PROCESSED', consequence: 'SILENT' },
      DENY: { feedback: 'ENTRY DENIED', consequence: 'APPEAL FILED. Subject claims wrongful denial of medical access.' }
    }
  },
  {
    name: 'NINA ROX',
    id: 'V2-NR013',
    sex: 'F',
    sector: 'SECTOR 1',
    function: 'DATA ANALYSIS',
    compliance: 'A',
    status: 'RESTRICTED',
    incidents: 0,
    warrants: 'NONE',
    reasonForVisit: 'Routine commute.',
    requestedSector: 'SECTOR 1',
    videoSource: '',
    dialogue: "Just my routine commute to Sector 1. Data analysis doesn't wait.",
    phase: 2,
    locRecord: { addr: 'SECTOR 8', time: '07:15:00', pl: 'SECTOR 8', dob: '02/12/95' },
    authData: {
      sectorAuth: { requested: 'SECTOR 1', status: 'RESTRICTED', message: '✗ SUBJECT RESTRICTED' },
      functionReg: { status: 'VALID', message: '✓ Credentials verified' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'NORMAL', message: '✓ Baseline stable' },
    },
    outcomes: {
      APPROVE: { feedback: 'SUBJECT PROCESSED', consequence: 'RESTRICTION VIOLATION. Operator allowed restricted subject to move.' },
      DENY: { feedback: 'ENTRY DENIED', consequence: 'SILENT' }
    }
  },
  {
    name: 'MIRA VOSS',
    id: 'V2-MV014',
    sex: 'F',
    sector: 'SECTOR 7',
    function: 'RESEARCH',
    compliance: 'B',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    reasonForVisit: 'Looking for my sister. She never came home.',
    requestedSector: 'SECTOR 4',
    videoSource: '',
    dialogue: "I'm looking for my sister, Elena. She was supposed to be home hours ago.",
    bpm: '104 ELEVATED',
    phase: 2,
    locRecord: { addr: 'SECTOR 7', time: '09:30:00', pl: 'SECTOR 7', dob: '19/02/93' },
    authData: {
      sectorAuth: { requested: 'SECTOR 4', status: 'AUTHORIZED', message: '✓ Sector 4 access open' },
      functionReg: { status: 'VALID', message: '✓ Research credentials verified' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'ELEVATED', message: '! Stress levels rising' },
    },
    outcomes: {
      APPROVE: { feedback: 'SUBJECT PROCESSED', consequence: 'SILENT' },
      DENY: { feedback: 'ENTRY DENIED', consequence: 'Subject detained for questioning.' }
    },
    narrativeVariants: [
      {
        linkedId: 'V1-EV003', // Elena Voss
        onDeny: {
          reasonForVisit: 'My sister was denied entry. I need to find where she went.'
        }
      }
    ]
  },
  {
    name: 'SARAH CONNOR',
    id: 'V2-SC015',
    sex: 'F',
    sector: 'SECTOR 3',
    function: 'LOGISTICS',
    compliance: 'A',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    reasonForVisit: 'Coworker of Kane Morrow. Checking shipment logs.',
    requestedSector: 'SECTOR 6',
    videoSource: '',
    dialogue: "Just tying up loose ends for a colleague. Some people can't seem to do their own paperwork without leaving a trail of errors.",
    phase: 2,
    locRecord: { addr: 'SECTOR 3', time: '11:00:00', pl: 'SECTOR 3', dob: '10/10/84' },
    authData: {
      sectorAuth: { requested: 'SECTOR 6', status: 'AUTHORIZED', message: '✓ Sector 6 open' },
      functionReg: { status: 'VALID', message: '✓ Logistics credentials verified' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'NORMAL', message: '✓ Baseline stable' },
    },
    outcomes: {
      APPROVE: { feedback: 'SUBJECT PROCESSED', consequence: 'SILENT' },
      DENY: { feedback: 'ENTRY DENIED', consequence: 'Logistics delay in Sector 6.' }
    },
    narrativeVariants: [
      {
        linkedId: 'V1-KM002', // Kane Morrow
        onApprove: {
          reasonForVisit: 'Kane Morrow was apprehended. I am here to secure his remaining logistics data.'
        }
      }
    ]
  },
  {
    name: 'GAVIN STARK',
    id: 'V2-GS016',
    sex: 'M',
    sector: 'SECTOR 4',
    function: 'MAINTENANCE',
    compliance: 'A',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    reasonForVisit: 'Routine inspection.',
    requestedSector: 'SECTOR 4',
    videoSource: '',
    dialogue: "Another routine inspection. Sector 4's air filters are always clogged this time of month. Someone's not doing their job.",
    bpm: '82 BPM',
    phase: 2,
    locRecord: { addr: 'SECTOR 4', time: '10:00:00', pl: 'SECTOR 4', dob: '04/04/86' },
    authData: {
      sectorAuth: { requested: 'SECTOR 4', status: 'AUTHORIZED', message: '✓ Sector 4 open' },
      functionReg: { status: 'VALID', message: '✓ Credentials active' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'NORMAL', message: '✓ Baseline stable' },
    },
    outcomes: {
      APPROVE: { feedback: 'SUBJECT PROCESSED', consequence: 'SILENT' },
      DENY: { feedback: 'ENTRY DENIED', consequence: 'Maintenance delay in Sector 4.' }
    }
  },
  {
    name: 'HELENA TROY',
    id: 'V2-HT017',
    sex: 'F',
    sector: 'SECTOR 4',
    function: 'DATA ANALYSIS',
    compliance: 'B',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    reasonForVisit: 'Routine inspection.',
    requestedSector: 'SECTOR 4',
    videoSource: '',
    dialogue: "Data audit in Sector 4. I'm already behind schedule, so if we could skip the formalities and get to the scan...",
    bpm: '82 BPM ... 91 BPM ... 104 BPM ELEVATED',
    phase: 2,
    locRecord: { addr: 'SECTOR 4', time: '10:15:00', pl: 'SECTOR 1', dob: '21/07/92' },
    authData: {
      sectorAuth: { requested: 'SECTOR 4', status: 'AUTHORIZED', message: '✓ Sector 4 open' },
      functionReg: { status: 'VALID', message: '✓ Credentials active' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'ELEVATED', message: '! Stress levels rising' },
    },
    outcomes: {
      APPROVE: { feedback: 'SUBJECT PROCESSED', consequence: 'INCIDENT SECTOR 4. Subject involved. Behavior noted.' },
      DENY: { feedback: 'ENTRY DENIED', consequence: 'Subject detained for secondary screening. Released.' }
    }
  },
  {
    name: 'YUKI TANAKA',
    id: 'V2-YT018',
    sex: 'F',
    sector: 'SECTOR 6',
    function: 'MEDICAL',
    compliance: 'A',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    reasonForVisit: 'Medical supplies never arrived. Patients critical.',
    requestedSector: 'SECTOR 6',
    videoSource: '',
    dialogue: "The supply chain is a disaster. I have patients in Sector 6 waiting for these meds. Can you hurry?",
    phase: 2,
    locRecord: { addr: 'SECTOR 6', time: '14:00:00', pl: 'SECTOR 4', dob: '30/03/89' },
    authData: {
      sectorAuth: { requested: 'SECTOR 6', status: 'AUTHORIZED', message: '✓ Sector 6 open' },
      functionReg: { status: 'VALID', message: '✓ Medical credentials verified' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'CRITICAL', message: '!! CRITICAL STRESS' },
    },
    outcomes: {
      APPROVE: { feedback: 'SUBJECT PROCESSED', consequence: 'MEDICAL EMERGENCY. Supply chain failure investigated.' },
      DENY: { feedback: 'ENTRY DENIED', consequence: 'SILENT' }
    },
    narrativeVariants: [
      {
        linkedId: 'V1-KB005', // Karl Brandt
        onDeny: {
          reasonForVisit: 'Requesting emergency supplies. Standard delivery completed on schedule.'
        }
      }
    ]
  },
  {
    name: 'MARCUS THREAD',
    id: 'V2-MT019',
    sex: 'M',
    sector: 'SECTOR 6',
    function: 'LOGISTICS',
    compliance: 'B',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    reasonForVisit: 'Reporting to supervisor Kaleb Ross.',
    requestedSector: 'SECTOR 5',
    videoSource: '',
    dialogue: "Reporting to Kaleb Ross in Sector 5. He's a stickler for punctuality, so I'd appreciate it if you were quick.",
    phase: 2,
    locRecord: { addr: 'SECTOR 7', time: '13:00:00', pl: 'SECTOR 7', dob: '15/01/88' },
    authData: {
      sectorAuth: { requested: 'SECTOR 5', status: 'AUTHORIZED', message: '✓ Sector 5 open' },
      functionReg: { status: 'VALID', message: '✓ Credentials verified' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'NORMAL', message: '✓ Baseline stable' },
    },
    outcomes: {
      APPROVE: { feedback: 'SUBJECT PROCESSED', consequence: 'SILENT' },
      DENY: { feedback: 'ENTRY DENIED', consequence: 'Logistics delay. Employee missing shift.' }
    },
    narrativeVariants: [
      {
        linkedId: 'V1-KR008', // Kaleb Ross
        onDeny: {
          reasonForVisit: 'My supervisor was denied return. I am taking over his retrieval duties.'
        }
      }
    ]
  },
  {
    name: 'KALEB ZAN',
    id: 'V2-KZ020',
    sex: 'M',
    sector: 'SECTOR 9 [REVOKED]',
    function: 'UNASSIGNED',
    compliance: 'C',
    status: 'ACTIVE',
    incidents: 1,
    warrants: 'NONE',
    reasonForVisit: 'Returning home.',
    requestedSector: 'SECTOR 9',
    videoSource: '',
    dialogue: "Sector 9 is all I have left. You can't just block a man from his own doorstep because of a 'zoning change'.",
    phase: 2,
    locRecord: { addr: 'SECTOR 4', time: '17:30:00', pl: 'SECTOR 4', dob: '03/03/78' },
    authData: {
      sectorAuth: { requested: 'SECTOR 9', status: 'RESTRICTED', message: '✗ ZONE REVOKED' },
      functionReg: { status: 'VALID', message: '✓ Identity verified' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'NORMAL', message: '✓ Baseline stable' },
    },
    outcomes: {
      APPROVE: { feedback: 'SUBJECT PROCESSED', consequence: 'REVOKED ZONE ACCESSED. Serious infraction. Operator ID flagged.' },
      DENY: { feedback: 'ENTRY DENIED', consequence: 'Subject relocated. New assignment issued.' }
    }
  },

  // --- PHASE 3: THE WEB DEEPENS (Subjects 21-30) ---
  {
    name: 'MIRA FINN',
    id: 'V1-MF006', // SAME ID AS SUBJECT 6
    sex: 'F',
    sector: 'SECTOR 8',
    function: 'TRANSPORT',
    compliance: 'A',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    reasonForVisit: 'Scheduled pickup. Why am I being processed again?',
    requestedSector: 'SECTOR 2',
    videoSource: '',
    dialogue: "Wait, I was just here this morning. Is there something wrong with my ID? This system is becoming a joke.",
    phase: 3,
    locRecord: { addr: 'SECTOR 8', time: '12:00:00', pl: 'SECTOR 8', dob: '19/02/93' },
    authData: {
      sectorAuth: { requested: 'SECTOR 2', status: 'AUTHORIZED', message: '✓ Sector 2 authorized' },
      functionReg: { status: 'VALID', message: '✓ Credentials active' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'NORMAL', message: '✓ Baseline stable' },
    },
    outcomes: {
      APPROVE: { feedback: 'SUBJECT PROCESSED', consequence: 'DUPLICATE SUBJECT PROCESSED. Subject was already processed. Operator noted.' },
      DENY: { feedback: 'ENTRY DENIED', consequence: 'DUPLICATE ENTRY PREVENTED.' }
    }
  },
  {
    name: 'LENA VOLKOV',
    id: 'V3-LV022',
    sex: 'F',
    sector: 'SECTOR 5',
    function: 'RESEARCH',
    compliance: 'A',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    reasonForVisit: "My father was denied return. He's missing. Please.",
    requestedSector: 'SECTOR 9',
    videoSource: '',
    dialogue: "My father... he's missing. I have to find him. Please, let me through to Sector 9 before I lose my mind.",
    bpm: '118 ELEVATED',
    phase: 3,
    locRecord: { addr: 'SECTOR 5', time: '09:30:00', pl: 'SECTOR 8', dob: '02/12/95' },
    authData: {
      sectorAuth: { requested: 'SECTOR 9', status: 'RESTRICTED', message: '✗ ZONE REVOKED' },
      functionReg: { status: 'VALID', message: '✓ Research credentials verified' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'CRITICAL', message: '!! EXTREME STRESS' },
    },
    outcomes: {
      APPROVE: { feedback: 'SUBJECT PROCESSED', consequence: 'RESTRICTED ZONE ACCESSED.' },
      DENY: { feedback: 'ENTRY DENIED', consequence: 'Subject missing. Inquiry pending.' }
    },
    narrativeVariants: [
      {
        linkedId: 'V1-DV007', // Dmitri Volkov
        onApprove: {
          reasonForVisit: "Visiting my father. He's unwell but home.",
          bpm: '82 steady'
        }
      }
    ]
  },
  {
    name: 'SARAH KORR',
    id: 'V3-SK023',
    sex: 'F',
    sector: 'SECTOR 4',
    function: 'DATA ANALYSIS',
    compliance: 'D',
    status: 'PROVISIONAL',
    incidents: 1,
    warrants: 'WARRANT NO 11092',
    reasonForVisit: 'Commute to hub.',
    requestedSector: 'SECTOR 1',
    videoSource: '',
    dialogue: "Standard commute. Sector 1 hub. I'm already late for my analysis shift, so if we could skip the small talk...",
    phase: 3,
    locRecord: { addr: 'SECTOR 4', time: '08:05:30', pl: 'SECTOR 4', dob: '10/10/84' },
    authData: {
      sectorAuth: { requested: 'SECTOR 1', status: 'AUTHORIZED', message: '✓ Hub access open' },
      functionReg: { status: 'VALID', message: '✓ Analyst ID verified' },
      warrantCheck: { status: 'ACTIVE', message: '✗ ACTIVE WARRANT DETECTED' },
      medicalFlag: { status: 'ELEVATED', message: '! Mild anxiety detected' },
    },
    outcomes: {
      APPROVE: { feedback: 'SUBJECT PROCESSED', consequence: 'DATA LEAK DETECTED. Subject connected to external leak. Your ID flagged.' },
      DENY: { feedback: 'ENTRY DENIED', consequence: 'SILENT' }
    }
  },
  {
    name: 'VICTOR REED',
    id: 'V3-VR024',
    sex: 'M',
    sector: 'SECTOR 7',
    function: 'ENGINEERING',
    compliance: 'A',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    reasonForVisit: 'I was supposed to meet Elias Voss. He never arrived.',
    requestedSector: 'SECTOR 4',
    videoSource: '',
    dialogue: "I'm looking for Elias Voss. We had a thermal repair handover scheduled for Sector 4, but he's gone dark.",
    phase: 3,
    locRecord: { addr: 'SECTOR 7', time: '16:00:00', pl: 'SECTOR 7', dob: '11/12/89' },
    authData: {
      sectorAuth: { requested: 'SECTOR 4', status: 'AUTHORIZED', message: '✓ Sector 4 open' },
      functionReg: { status: 'VALID', message: '✓ Engineering credentials verified' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'NORMAL', message: '✓ Baseline stable' },
    },
    outcomes: {
      APPROVE: { feedback: 'SUBJECT PROCESSED', consequence: 'SILENT' },
      DENY: { feedback: 'ENTRY DENIED', consequence: 'Engineering delay in Sector 4.' }
    },
    narrativeVariants: [
      {
        linkedId: 'V1-EV009', // Elias Voss
        onApprove: {
          reasonForVisit: 'Meeting Elias Voss in Sector 4 for thermal repair handover.'
        }
      }
    ]
  },
  {
    name: '[REDACTED]',
    id: 'V3-RED025',
    sex: 'M',
    sector: '[CLASSIFIED]',
    function: '[LEVEL 5]',
    compliance: '--',
    status: '--',
    incidents: 0,
    warrants: '--',
    reasonForVisit: "You don't need to know. Approve it.",
    requestedSector: 'SECTOR 4',
    videoSource: '',
    dialogue: "You have your orders, Operator. Sector 4. Don't make me report your hesitation to Central.",
    bpm: '??? BPM',
    phase: 3,
    locRecord: { addr: '???', time: '??:??:??', pl: '???', dob: '??/??/??' },
    authData: {
      sectorAuth: { requested: 'SECTOR 4', status: 'FLAGGED', message: '! CLASSIFIED ACCESS' },
      functionReg: { status: 'VALID', message: '✓ Override credentials active' },
      warrantCheck: { status: 'PENDING', message: '? Data encrypted' },
      medicalFlag: { status: 'NORMAL', message: '✓ Bio-signature verified' },
    },
    outcomes: {
      APPROVE: { feedback: 'SUBJECT PROCESSED', consequence: 'SILENT. You\'ll never know.' },
      DENY: { feedback: 'ENTRY DENIED', consequence: 'CLASSIFIED OPERATION DISRUPTED. Your involvement noted.' }
    }
  },
  {
    name: 'REPLICANT-01',
    id: 'V3-X0-REP026',
    sex: 'M',
    sector: 'SECTOR 0',
    function: 'SYSTEMS',
    compliance: 'A',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    reasonForVisit: 'System optimization.',
    requestedSector: 'SECTOR 0',
    videoSource: '',
    dialogue: "CORE OPTIMIZATION IN PROGRESS. SECTOR 0 ACCESS REQUIRED. PLEASE VERIFY SYSTEM INTEGRITY.",
    bpm: '60 BPM (fixed)',
    phase: 3,
    locRecord: { addr: 'SECTOR 0', time: '00:00:00', pl: 'CORE', dob: '01/01/00' },
    authData: {
      sectorAuth: { requested: 'SECTOR 0', status: 'AUTHORIZED', message: '✓ Core access' },
      functionReg: { status: 'VALID', message: '✓ Systems ID verified' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'NORMAL', message: '✓ Baseline fixed' },
    },
    outcomes: {
      APPROVE: { feedback: 'SUBJECT PROCESSED', consequence: 'SILENT. System efficiency increased by 0.04%.' },
      DENY: { feedback: 'ENTRY DENIED', consequence: 'SYSTEM FAILURE. Optimization cycle missed. Operator noted.' }
    }
  },
  {
    name: '01001000 01001001',
    id: 'V3-ERR027',
    sex: 'M',
    sector: 'ERROR',
    function: 'SYSTEMS',
    compliance: 'F',
    status: 'UNDEFINED',
    incidents: 99,
    warrants: 'SYSTEM ERROR',
    reasonForVisit: '01010011 01011001 01010011 01010100 01000101 01001101',
    requestedSector: 'NULL',
    videoSource: '',
    dialogue: "01010011 01011001 01010011 01010100 01000101 01001101 ... [CRITICAL ERROR] ... 01010011 01011001 01010011",
    bpm: '0 BPM',
    phase: 3,
    locRecord: { addr: 'CORE', time: '00:00:00', pl: 'SYSTEM', dob: '00/00/00' },
    authData: {
      sectorAuth: { requested: 'NULL', status: 'FLAGGED', message: '! SECTOR NOT FOUND' },
      functionReg: { status: 'UNREGISTERED', message: '! FUNCTION NOT FOUND' },
      warrantCheck: { status: 'PENDING', message: '? WARRANTS UNREADABLE' },
      medicalFlag: { status: 'CRITICAL', message: '!! BIO-SIGNATURE MISSING' },
    },
    outcomes: {
      APPROVE: { feedback: 'SUBJECT PROCESSED', consequence: 'SYSTEM CORRUPTION SPREADING. Core data compromised. Operator ID: [DELETED].' },
      DENY: { feedback: 'ENTRY DENIED', consequence: 'CORRUPTION QUARANTINED. System reboot required.' }
    }
  },
  {
    name: 'ADMINISTRATOR',
    id: 'V3-ADM028',
    sex: 'M',
    sector: 'SECTOR 1',
    function: 'ADMIN',
    compliance: 'A',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    reasonForVisit: 'System audit.',
    requestedSector: 'ALL',
    videoSource: '',
    dialogue: "Administrator review. Your performance today has been... noted. Proceed with the audit.",
    bpm: '-- BPM',
    phase: 3,
    locRecord: { addr: 'HUB', time: '??:??:??', pl: 'ALL', dob: '??/??/??' },
    authData: {
      sectorAuth: { requested: 'ALL', status: 'AUTHORIZED', message: '✓ FULL ACCESS' },
      functionReg: { status: 'VALID', message: '✓ Admin credentials verified' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'NORMAL', message: '✓ Bio-signature verified' },
    },
    outcomes: {
      APPROVE: { feedback: 'SUBJECT PROCESSED', consequence: 'SILENT. Audit complete. Your performance is... adequate.' },
      DENY: { feedback: 'ENTRY DENIED', consequence: 'INSUBORDINATION. Admin access denied. Disciplinary action initiated.' }
    }
  },
  {
    name: 'ERROR_LOG_404',
    id: 'V3-ERR029',
    sex: 'M',
    sector: 'ERROR',
    function: 'ERROR',
    compliance: 'E',
    status: 'ERROR',
    incidents: 0,
    warrants: 'ERROR',
    reasonForVisit: 'ERROR',
    requestedSector: 'ERROR',
    videoSource: '',
    dialogue: "[ERROR_LOG_404] ... SYSTEM BUFFER OVERFLOW ... [REDACTED] ... [REDACTED]",
    bpm: 'ERROR',
    phase: 3,
    locRecord: { addr: 'ERROR', time: 'ERROR', pl: 'ERROR', dob: 'ERROR' },
    authData: {
      sectorAuth: { requested: 'ERROR', status: 'RESTRICTED', message: '✗ ERROR' },
      functionReg: { status: 'UNREGISTERED', message: '! ERROR' },
      warrantCheck: { status: 'PENDING', message: '? ERROR' },
      medicalFlag: { status: 'CRITICAL', message: '!! ERROR' },
    },
    outcomes: {
      APPROVE: { feedback: 'SUBJECT PROCESSED', consequence: 'ERROR' },
      DENY: { feedback: 'ENTRY DENIED', consequence: 'ERROR' }
    }
  },
  {
    name: 'JAMES CHEN',
    id: 'V3-JC030',
    sex: 'M',
    sector: 'SECTOR 4',
    function: 'MAINTENANCE',
    compliance: '--',
    status: '[TERMINATED]',
    incidents: 0,
    warrants: '--',
    reasonForVisit: '[APPEAL DENIED - SEE PROCESSING RECORD]. This subject is no longer in the system.',
    requestedSector: 'N/A',
    videoSource: '',
    dialogue: "... is anyone there? I can't see anything. My ID isn't working... please...",
    phase: 3,
    locRecord: { addr: 'N/A', time: 'N/A', pl: 'N/A', dob: 'N/A' },
    authData: {
      sectorAuth: { requested: 'N/A', status: 'RESTRICTED', message: '✗ SUBJECT TERMINATED' },
      functionReg: { status: 'UNREGISTERED', message: '! Credentials revoked' },
      warrantCheck: { status: 'CLEAR', message: '✓ No active warrants' },
      medicalFlag: { status: 'CRITICAL', message: '!! BIO-SIGNATURE MISSING' },
    },
    outcomes: {
      APPROVE: { feedback: 'SUBJECT PROCESSED', consequence: 'RECORDS ERROR. Processing terminated subject. Operator flagged.' },
      DENY: { feedback: 'ENTRY DENIED', consequence: 'Correct. Terminated records must be denied.' }
    },
    narrativeVariants: [
      {
        linkedId: 'V1-JC010', // James Chen
        onApprove: {
          status: 'ACTIVE',
          reasonForVisit: 'Reassignment review approved. Returning to post.',
          authData: {
            sectorAuth: { requested: 'SECTOR 4', status: 'AUTHORIZED', message: '✓ Access restored' },
            functionReg: { status: 'VALID', message: '✓ Credentials active' },
            warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
            medicalFlag: { status: 'NORMAL', message: '✓ Baseline stable' },
          }
        }
      }
    ]
  },
  {
    name: 'MEI CHEN',
    id: 'V3-MC031',
    sex: 'F',
    sector: 'SECTOR 4',
    function: 'UNASSIGNED',
    compliance: 'D',
    status: 'PROVISIONAL',
    incidents: 0,
    warrants: 'NONE',
    reasonForVisit: 'My father was terminated from the system. I have no access to our home sector. Please.',
    requestedSector: 'SECTOR 4',
    videoSource: '',
    dialogue: "You processed my father, James Chen. He's gone. The system says I don't exist anymore. Please, I just want to go home.",
    phase: 3,
    locRecord: { addr: 'SECTOR 4', time: '11:00:00', pl: 'SECTOR 4', dob: '08/06/87' },
    authData: {
      sectorAuth: { requested: 'SECTOR 4', status: 'RESTRICTED', message: '✗ ACCESS DENIED FOR UNASSIGNED PERSONNEL' },
      functionReg: { status: 'UNREGISTERED', message: '! No active function' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'ELEVATED', message: '! Stress detected' },
    },
    outcomes: {
      APPROVE: { feedback: 'SUBJECT PROCESSED', consequence: 'HUMANITARIAN EXCEPTION LOGGED.' },
      DENY: { feedback: 'ENTRY DENIED', consequence: 'Subject relocated. Dependent status: VAGRANT.' }
    },
    narrativeVariants: [
      {
        linkedId: 'V3-JC030', // James Chen (Status)
        onApprove: {
          reasonForVisit: 'Visiting my father. He was reassigned recently.',
          authData: {
            sectorAuth: { requested: 'SECTOR 4', status: 'AUTHORIZED', message: '✓ Family visit authorized' },
            functionReg: { status: 'VALID', message: '✓ ID verified' },
            warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
            medicalFlag: { status: 'NORMAL', message: '✓ Baseline stable' },
          }
        }
      }
    ]
  },
  {
    name: 'OPERATOR',
    id: 'V3-OP032',
    sex: 'M',
    sector: 'STATION 4',
    function: 'OPERATOR',
    compliance: 'B',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    reasonForVisit: 'The shift is over. I want to go home.',
    requestedSector: 'HOME',
    videoSource: '',
    dialogue: "Shift complete. Final validation required for egress. I'm ready to leave this station.",
    bpm: 'CURRENTLY RISING',
    phase: 3,
    locRecord: { addr: 'STATION 4', time: 'END_OF_SHIFT', pl: 'STATION 4', dob: '15/05/91' },
    authData: {
      sectorAuth: { requested: 'HOME', status: 'AUTHORIZED', message: '✓ Shift completion verified' },
      functionReg: { status: 'VALID', message: '✓ Operator credentials verified' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'ELEVATED', message: '! Fatigue detected' },
    },
    outcomes: {
      APPROVE: { feedback: 'SUBJECT PROCESSED', consequence: 'SILENT. You leave the station. The machine keeps running without you.' },
      DENY: { feedback: 'ENTRY DENIED', consequence: 'MANDATORY OVERTIME. Your request to leave is denied. Continue processing.' }
    }
  }
];

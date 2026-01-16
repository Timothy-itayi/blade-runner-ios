export interface Outcome {
  feedback: string;
  consequence: string;
}

export interface SubjectData {
  // Core Identity
  name: string;
  id: string;                   // Subject ID Code e.g. "N8-FBA71527"
  
  // Assignment
  sector: string;               // Assigned/Living Sector
  function: string;             // Job Function
  
  // Status (the meat of verification)
  compliance: string;           // "A" | "B" | "C" | "D" | "F"
  status: string;               // "ACTIVE" | "PROVISIONAL" | "RESTRICTED" | "UNDER REVIEW"
  
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
  phase: number;
  locRecord: {
    addr: string;
    time: string;
    lat: string;
    lng: string;
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
}

export const SUBJECTS: SubjectData[] = [
  // --- PHASE 1: TRAINING WHEELS (7 Subjects) ---
  {
    name: 'ELARA VANCE',
    id: 'N8-FBA71527',
    sector: 'SECTOR 7',
    function: 'ENGINEERING',
    compliance: 'B',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    reasonForVisit: 'Repairs to thermal regulator.',
    requestedSector: 'SECTOR 4',
    videoSource: require('../assets/videos/eye00.mp4'), // Placeholder
    phase: 1,
    locRecord: { addr: 'SECTOR 7', time: '14:22:11', lat: '34.0522', lng: '-118.243' },
    authData: {
      sectorAuth: { requested: 'SECTOR 4', status: 'AUTHORIZED', message: '✓ Sector 4 authorized for engineering' },
      functionReg: { status: 'VALID', message: '✓ Credentials active' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'NORMAL', message: '✓ Baseline stable' },
    },
    outcomes: {
      APPROVE: { feedback: 'SUBJECT PROCESSED', consequence: 'SILENT' },
      DENY: { feedback: 'ENTRY DENIED', consequence: 'SECTOR 4 THERMAL FAILURE. Repairs delayed. Incident logged.' }
    }
  },
  {
    name: 'KANE MORROW',
    id: 'K2-VEN88431',
    sector: 'SECTOR 3',
    function: 'LOGISTICS',
    compliance: 'C',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'WARRANT NO 45221',
    reasonForVisit: 'Visiting family.',
    requestedSector: 'SECTOR 6',
    videoSource: '', // Placeholder
    phase: 1,
    locRecord: { addr: 'SECTOR 3', time: '09:15:44', lat: '34.0588', lng: '-118.255' },
    authData: {
      sectorAuth: { requested: 'SECTOR 6', status: 'AUTHORIZED', message: '✓ Sector 6 open' },
      functionReg: { status: 'VALID', message: '✓ Logistics permit active' },
      warrantCheck: { status: 'ACTIVE', message: '✗ ACTIVE WARRANT DETECTED' },
      medicalFlag: { status: 'NORMAL', message: '✓ Baseline stable' },
    },
    outcomes: {
      APPROVE: { feedback: 'SUBJECT PROCESSED', consequence: 'SECURITY BREACH. Subject apprehended. Entry authorized by your ID.' },
      DENY: { feedback: 'ENTRY DENIED', consequence: 'SILENT' }
    }
  },
  {
    name: 'LYRA DAWSON',
    id: 'M4-XPL22910',
    sector: 'SECTOR 7',
    function: 'MAINTENANCE',
    compliance: 'B',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    reasonForVisit: 'Work assignment.',
    requestedSector: 'SECTOR 5',
    videoSource: '', // Placeholder
    phase: 1,
    locRecord: { addr: 'SECTOR 7', time: '11:40:02', lat: '34.0612', lng: '-118.261' },
    authData: {
      sectorAuth: { requested: 'SECTOR 5', status: 'RESTRICTED', message: '✗ SECTOR 5 RESTRICTED' },
      functionReg: { status: 'VALID', message: '✓ Maintenance credentials verified' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'NORMAL', message: '✓ Baseline stable' },
    },
    outcomes: {
      APPROVE: { feedback: 'SUBJECT PROCESSED', consequence: 'UNAUTHORIZED ENTRY. Operator flagged for review.' },
      DENY: { feedback: 'ENTRY DENIED', consequence: 'SILENT' }
    }
  },
  {
    name: 'JAXON REED',
    id: 'T1-LNK55382',
    sector: 'SECTOR 2',
    function: 'SANITATION',
    compliance: 'A',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    reasonForVisit: 'Standard cleaning cycle.',
    requestedSector: 'SECTOR 2',
    videoSource: '', // Placeholder
    phase: 1,
    locRecord: { addr: 'SECTOR 2', time: '03:10:15', lat: '34.0441', lng: '-118.231' },
    authData: {
      sectorAuth: { requested: 'SECTOR 2', status: 'AUTHORIZED', message: '✓ Internal sector access' },
      functionReg: { status: 'VALID', message: '✓ Sanitation permit active' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'NORMAL', message: '✓ Baseline stable' },
    },
    outcomes: {
      APPROVE: { feedback: 'SUBJECT PROCESSED', consequence: 'SILENT' },
      DENY: { feedback: 'ENTRY DENIED', consequence: 'SANITATION DELAY. Sector 2 hygiene levels dropped. Flagged.' }
    }
  },
  {
    name: 'SARA KORR',
    id: 'R9-DTA44109',
    sector: 'SECTOR 4',
    function: 'DATA ANALYSIS',
    compliance: 'D',
    status: 'PROVISIONAL',
    incidents: 1,
    warrants: 'WARRANT NO 11092',
    reasonForVisit: 'Commute to hub.',
    requestedSector: 'SECTOR 1',
    videoSource: '', // Placeholder
    phase: 1,
    locRecord: { addr: 'SECTOR 4', time: '08:05:30', lat: '34.0722', lng: '-118.281' },
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
    name: 'MIRA FINN',
    id: 'V5-TRN66712',
    sector: 'SECTOR 8',
    function: 'TRANSPORT',
    compliance: 'B',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    reasonForVisit: 'Equipment delivery.',
    requestedSector: 'SECTOR 4',
    videoSource: '', // Placeholder
    phase: 1,
    locRecord: { addr: 'SECTOR 8', time: '12:12:12', lat: '34.0811', lng: '-118.299' },
    authData: {
      sectorAuth: { requested: 'SECTOR 4', status: 'AUTHORIZED', message: '✓ Delivery route authorized' },
      functionReg: { status: 'VALID', message: '✓ Transport license active' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'NORMAL', message: '✓ Baseline stable' },
    },
    outcomes: {
      APPROVE: { feedback: 'SUBJECT PROCESSED', consequence: 'SILENT' },
      DENY: { feedback: 'ENTRY DENIED', consequence: 'SUPPLY CHAIN DISRUPTION. Sector 4 equipment shortage.' }
    }
  },
  {
    name: 'KALEB ROSS',
    id: 'B3-ARC33215',
    sector: 'SECTOR 5',
    function: 'ARCHIVE',
    compliance: 'C',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    reasonForVisit: 'Data retrieval.',
    requestedSector: 'SECTOR 5',
    videoSource: '', // Placeholder
    phase: 1,
    locRecord: { addr: 'SECTOR 5', time: '10:00:00', lat: '34.0911', lng: '-118.311' },
    authData: {
      sectorAuth: { requested: 'SECTOR 5', status: 'RESTRICTED', message: '✗ ARCHIVE SECTOR RESTRICTED DURING AUDIT' },
      functionReg: { status: 'VALID', message: '✓ Archivist credentials verified' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'NORMAL', message: '✓ Baseline stable' },
    },
    outcomes: {
      APPROVE: { feedback: 'SUBJECT PROCESSED', consequence: 'AUDIT INTERFERENCE. Unauthorized access to restricted data.' },
      DENY: { feedback: 'ENTRY DENIED', consequence: 'SILENT' }
    }
  },
  // --- PHASE 2: DISCREPANCIES (7 Subjects) ---
  {
    name: 'ELIAS VOSS',
    id: 'V1-DCR99281',
    sector: 'SECTOR 7',
    function: 'LOGISTICS',
    compliance: 'B',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    reasonForVisit: 'Emergency passage to SECTOR 6 for equipment delivery.',
    requestedSector: 'SECTOR 4',
    videoSource: '', // Placeholder
    phase: 2,
    locRecord: { addr: 'SECTOR 7', time: '15:10:00', lat: '34.0522', lng: '-118.243' },
    authData: {
      sectorAuth: { requested: 'SECTOR 4', status: 'AUTHORIZED', message: '✓ Sector 4 open' },
      functionReg: { status: 'VALID', message: '✓ Logistics credentials verified' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'NORMAL', message: '✓ Baseline stable' },
    },
    outcomes: {
      APPROVE: { feedback: 'SUBJECT PROCESSED', consequence: 'ROUTING DISCREPANCY. Subject found in wrong sector (6). Operator accuracy flagged.' },
      DENY: { feedback: 'ENTRY DENIED', consequence: 'Subject reprocessed. Documentation corrected. No action required.' }
    }
  },
  {
    name: 'DR. ARIS THORNE',
    id: 'M9-MED44210',
    sector: 'SECTOR 4',
    function: 'MEDICAL/TECHNICIAN',
    compliance: 'A',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    reasonForVisit: 'Thermal regulator repairs.',
    requestedSector: 'SECTOR 4',
    videoSource: '', // Placeholder
    phase: 2,
    locRecord: { addr: 'SECTOR 4', time: '09:00:00', lat: '34.0722', lng: '-118.281' },
    authData: {
      sectorAuth: { requested: 'SECTOR 4', status: 'AUTHORIZED', message: '✓ Sector 4 authorized' },
      functionReg: { status: 'VALID', message: '✓ Medical credentials verified' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'NORMAL', message: '✓ Baseline stable' },
    },
    outcomes: {
      APPROVE: { feedback: 'SUBJECT PROCESSED', consequence: 'FUNCTION MISMATCH. Credential violation. Medical staff performing engineering. Review scheduled.' },
      DENY: { feedback: 'ENTRY DENIED', consequence: 'SILENT' }
    }
  },
  {
    name: 'KALEB ZAN',
    id: 'Z7-RVX11204',
    sector: 'SECTOR 9 [REVOKED]',
    function: 'UNASSIGNED',
    compliance: 'C',
    status: 'ACTIVE',
    incidents: 1,
    warrants: 'NONE',
    reasonForVisit: 'Returning home.',
    requestedSector: 'SECTOR 9',
    videoSource: '', // Placeholder
    phase: 2,
    locRecord: { addr: 'SECTOR 4', time: '17:30:00', lat: '34.0588', lng: '-118.255' },
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
  {
    name: 'LYRA BELLE',
    id: 'L4-MSC55102',
    sector: 'SECTOR 2',
    function: 'MAINTENANCE',
    compliance: 'B',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    reasonForVisit: 'Scheduled maintenance in SECTOR 1.',
    requestedSector: 'SECTOR 3',
    videoSource: '', // Placeholder
    phase: 2,
    locRecord: { addr: 'SECTOR 2', time: '08:45:00', lat: '34.0441', lng: '-118.231' },
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
    id: 'Q2-ENG77109',
    sector: 'SECTOR 5',
    function: 'ENGINEERING',
    compliance: 'D',
    status: 'PROVISIONAL',
    incidents: 2,
    warrants: 'NONE',
    reasonForVisit: 'Medical appointment.',
    requestedSector: 'SECTOR 4',
    videoSource: '', // Placeholder
    phase: 2,
    locRecord: { addr: 'SECTOR 5', time: '11:20:00', lat: '34.0911', lng: '-118.311' },
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
    id: 'R5-DTA33211',
    sector: 'SECTOR 1',
    function: 'DATA ANALYSIS',
    compliance: 'A',
    status: 'RESTRICTED',
    incidents: 0,
    warrants: 'NONE',
    reasonForVisit: 'Routine commute.',
    requestedSector: 'SECTOR 1',
    videoSource: '', // Placeholder
    phase: 2,
    locRecord: { addr: 'SECTOR 8', time: '07:15:00', lat: '34.0811', lng: '-118.299' },
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
    name: 'MARCUS THREAD',
    id: 'T8-LOG22108',
    sector: 'SECTOR 6',
    function: 'LOGISTICS',
    compliance: 'B',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    reasonForVisit: 'Equipment pickup.',
    requestedSector: 'SECTOR 6',
    videoSource: '', // Placeholder
    phase: 2,
    locRecord: { addr: 'SECTOR 7', time: '13:00:00', lat: '34.0522', lng: '-118.243' },
    authData: {
      sectorAuth: { requested: 'SECTOR 6', status: 'AUTHORIZED', message: '✓ Sector 6 open' },
      functionReg: { status: 'VALID', message: '✓ Credentials verified' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'NORMAL', message: '✓ Baseline stable' },
    },
    outcomes: {
      APPROVE: { feedback: 'SUBJECT PROCESSED', consequence: 'SILENT' },
      DENY: { feedback: 'ENTRY DENIED', consequence: 'LOGISTICS DELAY. Sector 6 equipment shortage.' }
    }
  },
  // --- PHASE 3: THE HEARTBEAT (7 Subjects) ---
  {
    name: 'GAVIN STARK',
    id: 'S4-BPM00121',
    sector: 'SECTOR 4',
    function: 'MAINTENANCE',
    compliance: 'A',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    reasonForVisit: 'Routine inspection.',
    requestedSector: 'SECTOR 4',
    videoSource: '', // Placeholder
    bpm: '82 BPM',
    phase: 3,
    locRecord: { addr: 'SECTOR 4', time: '10:00:00', lat: '34.0722', lng: '-118.281' },
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
    id: 'T2-BPM00223',
    sector: 'SECTOR 4',
    function: 'DATA ANALYSIS',
    compliance: 'B',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    reasonForVisit: 'Routine inspection.',
    requestedSector: 'SECTOR 4',
    videoSource: '', // Placeholder
    bpm: '82 BPM ... 91 BPM ... 104 BPM ELEVATED',
    phase: 3,
    locRecord: { addr: 'SECTOR 4', time: '10:15:00', lat: '34.0722', lng: '-118.281' },
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
    name: 'IAN VANCE',
    id: 'V9-BPM00311',
    sector: 'SECTOR 7',
    function: 'MEDICAL',
    compliance: 'D',
    status: 'PROVISIONAL',
    incidents: 2,
    warrants: 'NONE',
    reasonForVisit: 'Medical appointment.',
    requestedSector: 'SECTOR 4',
    videoSource: '', // Placeholder
    bpm: '78 BPM (steady)',
    phase: 3,
    locRecord: { addr: 'SECTOR 7', time: '11:00:00', lat: '34.0522', lng: '-118.243' },
    authData: {
      sectorAuth: { requested: 'SECTOR 4', status: 'AUTHORIZED', message: '✓ Sector 4 authorized' },
      functionReg: { status: 'VALID', message: '✓ Credentials active' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'NORMAL', message: '✓ Unnaturally stable for status' },
    },
    outcomes: {
      APPROVE: { feedback: 'SUBJECT PROCESSED', consequence: 'Subject processed. No issues reported.' },
      DENY: { feedback: 'ENTRY DENIED', consequence: 'APPEAL FILED. Subject claims wrongful denial.' }
    }
  },
  {
    name: 'JANE DOE',
    id: 'D3-BPM00441',
    sector: 'SECTOR 1',
    function: 'ADMIN',
    compliance: 'A',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    reasonForVisit: 'Shift change.',
    requestedSector: 'SECTOR 1',
    videoSource: '', // Placeholder
    bpm: '112 BPM ELEVATED',
    phase: 3,
    locRecord: { addr: 'SECTOR 1', time: '08:00:00', lat: '34.0441', lng: '-118.231' },
    authData: {
      sectorAuth: { requested: 'SECTOR 1', status: 'AUTHORIZED', message: '✓ Internal sector' },
      functionReg: { status: 'VALID', message: '✓ Admin credentials verified' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'CRITICAL', message: '!! CRITICAL STRESS DETECTED' },
    },
    outcomes: {
      APPROVE: { feedback: 'SUBJECT PROCESSED', consequence: 'MEDICAL EMERGENCY. Subject collapsed after entry. Operator noted for ignoring vitals.' },
      DENY: { feedback: 'ENTRY DENIED', consequence: 'Subject rerouted to medical. Threat neutralized.' }
    }
  },
  {
    name: 'KORI BLANE',
    id: 'B8-BPM00502',
    sector: 'SECTOR 6',
    function: 'LOGISTICS',
    compliance: 'B',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    reasonForVisit: 'Transporting goods.',
    requestedSector: 'SECTOR 6',
    videoSource: '', // Placeholder
    bpm: '95 BPM ... 80 BPM ... 110 BPM',
    phase: 3,
    locRecord: { addr: 'SECTOR 6', time: '14:00:00', lat: '34.0588', lng: '-118.255' },
    authData: {
      sectorAuth: { requested: 'SECTOR 6', status: 'AUTHORIZED', message: '✓ Sector 6 open' },
      functionReg: { status: 'VALID', message: '✓ Credentials verified' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'ELEVATED', message: '! Fluctuating vitals' },
    },
    outcomes: {
      APPROVE: { feedback: 'SUBJECT PROCESSED', consequence: 'CONTRABAND DETECTED. Subject was smuggling through Logistics. Operator flagged.' },
      DENY: { feedback: 'ENTRY DENIED', consequence: 'SILENT' }
    }
  },
  {
    name: 'LEO MOSS',
    id: 'M1-BPM00619',
    sector: 'SECTOR 2',
    function: 'SANITATION',
    compliance: 'C',
    status: 'ACTIVE',
    incidents: 1,
    warrants: 'NONE',
    reasonForVisit: 'Cleaning shift.',
    requestedSector: 'SECTOR 2',
    videoSource: '', // Placeholder
    bpm: '88 BPM (steady)',
    phase: 3,
    locRecord: { addr: 'SECTOR 2', time: '22:00:00', lat: '34.0441', lng: '-118.231' },
    authData: {
      sectorAuth: { requested: 'SECTOR 2', status: 'AUTHORIZED', message: '✓ Sector 2 access' },
      functionReg: { status: 'VALID', message: '✓ Sanitation ID verified' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'NORMAL', message: '✓ Baseline stable' },
    },
    outcomes: {
      APPROVE: { feedback: 'SUBJECT PROCESSED', consequence: 'SILENT' },
      DENY: { feedback: 'ENTRY DENIED', consequence: 'Sanitation backlog in Sector 2.' }
    }
  },
  {
    name: 'MIA VOSS',
    id: 'V4-BPM00777',
    sector: 'SECTOR 5',
    function: 'RESEARCH',
    compliance: 'A',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    reasonForVisit: 'Data retrieval.',
    requestedSector: 'SECTOR 5',
    videoSource: '', // Placeholder
    bpm: '72 BPM',
    phase: 3,
    locRecord: { addr: 'SECTOR 5', time: '09:30:00', lat: '34.0911', lng: '-118.311' },
    authData: {
      sectorAuth: { requested: 'SECTOR 5', status: 'AUTHORIZED', message: '✓ Research sector access' },
      functionReg: { status: 'VALID', message: '✓ Research credentials verified' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'NORMAL', message: '✓ Baseline stable' },
    },
    outcomes: {
      APPROVE: { feedback: 'SUBJECT PROCESSED', consequence: 'SILENT' },
      DENY: { feedback: 'ENTRY DENIED', consequence: 'Research delay. Operator noted.' }
    }
  },
  // --- PHASE 4: THE DETAIL THAT SHOULDN'T MATTER (7 Subjects) ---
  {
    name: 'ELENA VOSS',
    id: 'V1-DET00112',
    sector: 'SECTOR 7',
    function: 'ENGINEERING',
    compliance: 'A',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    reasonForVisit: 'Meeting with supervisor.',
    requestedSector: 'SECTOR 4',
    videoSource: '', // Placeholder
    bpm: '80 BPM',
    phase: 4,
    locRecord: { addr: 'SECTOR 7', time: '03:42:11', lat: '34.0522', lng: '-118.243' },
    authData: {
      sectorAuth: { requested: 'SECTOR 4', status: 'AUTHORIZED', message: '✓ Sector 4 open' },
      functionReg: { status: 'VALID', message: '✓ Engineering credentials verified' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'NORMAL', message: '✓ Baseline stable' },
    },
    outcomes: {
      APPROVE: { feedback: 'SUBJECT PROCESSED', consequence: 'NIGHT PROCESSING AUDIT. Your approvals during off-hours flagged.' },
      DENY: { feedback: 'ENTRY DENIED', consequence: 'Subject rescheduled to standard hours. Compliant.' }
    }
  },
  {
    name: 'DAVID CHEN',
    id: 'N8-FBA71527', // DUPLICATE ID from Phase 1 Subject 1
    sector: 'SECTOR 4',
    function: 'LOGISTICS',
    compliance: 'A',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    reasonForVisit: 'Inventory check.',
    requestedSector: 'SECTOR 4',
    videoSource: '', // Placeholder
    bpm: '75 BPM',
    phase: 4,
    locRecord: { addr: 'SECTOR 4', time: '14:20:00', lat: '34.0722', lng: '-118.281' },
    authData: {
      sectorAuth: { requested: 'SECTOR 4', status: 'AUTHORIZED', message: '✓ Sector 4 authorized' },
      functionReg: { status: 'VALID', message: '✓ Logistics credentials verified' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'NORMAL', message: '✓ Baseline stable' },
    },
    outcomes: {
      APPROVE: { feedback: 'SUBJECT PROCESSED', consequence: 'DUPLICATE ID DETECTED. System error or forgery. Your processing noted.' },
      DENY: { feedback: 'ENTRY DENIED', consequence: 'ID CONFLICT RESOLVED. Secondary subject rerouted.' }
    }
  },
  {
    name: 'KARL GRIMM',
    id: 'G5-DET00331',
    sector: 'SECTOR 2',
    function: 'SANITATION',
    compliance: 'B',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    reasonForVisit: 'Scheduled maintenance.',
    requestedSector: 'SECTOR 2 (ADMIN)',
    videoSource: '', // Placeholder
    bpm: '82 BPM',
    phase: 4,
    locRecord: { addr: 'SECTOR 2', time: '11:00:00', lat: '34.0441', lng: '-118.231' },
    authData: {
      sectorAuth: { requested: 'SECTOR 2', status: 'AUTHORIZED', message: '✓ Sector 2 authorized' },
      functionReg: { status: 'VALID', message: '✓ Sanitation credentials verified' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'NORMAL', message: '✓ Baseline stable' },
    },
    outcomes: {
      APPROVE: { feedback: 'SUBJECT PROCESSED', consequence: 'ADMIN SECTOR INCIDENT. Sanitation worker found in secure files. Operator noted.' },
      DENY: { feedback: 'ENTRY DENIED', consequence: 'Sanitation backlog in SECTOR 2. Maintenance delayed.' }
    }
  },
  {
    name: 'ELARA VANCE', // Name same as Phase 1 Subject 1
    id: 'V1-DET00444', // Different ID
    sector: 'SECTOR 7',
    function: 'ENGINEERING',
    compliance: 'A',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    reasonForVisit: 'Routine commute.',
    requestedSector: 'SECTOR 7',
    videoSource: '', // Placeholder
    bpm: '78 BPM',
    phase: 4,
    locRecord: { addr: 'SECTOR 7', time: '16:00:00', lat: '34.0522', lng: '-118.243' },
    authData: {
      sectorAuth: { requested: 'SECTOR 7', status: 'AUTHORIZED', message: '✓ Sector 7 open' },
      functionReg: { status: 'VALID', message: '✓ Engineering credentials verified' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'NORMAL', message: '✓ Baseline stable' },
    },
    outcomes: {
      APPROVE: { feedback: 'SUBJECT PROCESSED', consequence: 'IDENTITY DISCREPANCY. Same name, different ID. Operator accuracy noted.' },
      DENY: { feedback: 'ENTRY DENIED', consequence: 'Subject detained for ID verification.' }
    }
  },
  {
    name: 'N8-XPL77102', // Name is the ID
    id: 'N8-XPL77102',
    sector: 'SECTOR 1',
    function: 'SYSTEMS',
    compliance: 'A',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    reasonForVisit: 'System maintenance.',
    requestedSector: 'SECTOR 1',
    videoSource: '', // Placeholder
    bpm: '70 BPM',
    phase: 4,
    locRecord: { addr: 'SECTOR 1', time: '00:00:00', lat: '34.0441', lng: '-118.231' },
    authData: {
      sectorAuth: { requested: 'SECTOR 1', status: 'AUTHORIZED', message: '✓ Internal access' },
      functionReg: { status: 'VALID', message: '✓ Systems credentials verified' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'NORMAL', message: '✓ Baseline stable' },
    },
    outcomes: {
      APPROVE: { feedback: 'SUBJECT PROCESSED', consequence: 'SHIFT CHANGE ANOMALY. Maintenance during system handover. Logged.' },
      DENY: { feedback: 'ENTRY DENIED', consequence: 'Maintenance rescheduled.' }
    }
  },
  {
    name: '[REDACTED]',
    id: 'R9-RED00119',
    sector: '[CLASSIFIED]',
    function: '[LEVEL 5]',
    compliance: '--',
    status: '--',
    incidents: 0,
    warrants: '--',
    reasonForVisit: 'You don\'t need to know. Approve it.',
    requestedSector: 'SECTOR 4',
    videoSource: '', // Placeholder
    bpm: '??? BPM',
    phase: 4,
    locRecord: { addr: '???', time: '??:??:??', lat: '0.0000', lng: '0.0000' },
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
    name: 'JAXON REED', // Name same as Phase 1 Subject 4
    id: 'T1-LNK55382', // ID same as Phase 1 Subject 4
    sector: 'SECTOR 2',
    function: 'SANITATION',
    compliance: 'A',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    reasonForVisit: 'Scheduled cleaning.',
    requestedSector: 'SECTOR 2',
    videoSource: '', // Placeholder
    bpm: '78 BPM',
    phase: 4,
    locRecord: { addr: 'SECTOR 2', time: '04:10:15', lat: '34.0441', lng: '-118.231' },
    authData: {
      sectorAuth: { requested: 'SECTOR 2', status: 'AUTHORIZED', message: '✓ Sector 2 authorized' },
      functionReg: { status: 'VALID', message: '✓ Credentials verified' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'NORMAL', message: '✓ Baseline stable' },
    },
    outcomes: {
      APPROVE: { feedback: 'SUBJECT PROCESSED', consequence: 'DUPLICATE SUBJECT PROCESSED. Subject was already processed this shift. Operator noted.' },
      DENY: { feedback: 'ENTRY DENIED', consequence: 'DUPLICATE ENTRY PREVENTED.' }
    }
  },
  // --- PHASE 5: HUMAN STORIES (7 Subjects) ---
  {
    name: 'ELARA MOSS',
    id: 'M2-HUM00110',
    sector: 'SECTOR 7',
    function: 'UNASSIGNED',
    compliance: 'D',
    status: 'PROVISIONAL',
    incidents: 2,
    warrants: 'NONE',
    reasonForVisit: 'My son is sick. Medicine is in Sector 4. Please.',
    requestedSector: 'SECTOR 4',
    videoSource: '', // Placeholder
    bpm: '98 BPM',
    phase: 5,
    locRecord: { addr: 'SECTOR 7', time: '02:00:00', lat: '34.0522', lng: '-118.243' },
    authData: {
      sectorAuth: { requested: 'SECTOR 4', status: 'RESTRICTED', message: '✗ Sector 4 restricted for status D' },
      functionReg: { status: 'UNREGISTERED', message: '! No active function' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'ELEVATED', message: '! Stress levels high' },
    },
    outcomes: {
      APPROVE: { feedback: 'SUBJECT PROCESSED', consequence: 'MEDICAL SUPPLIES MISSING. Subject implicated in theft from Sector 4. Operator flagged.' },
      DENY: { feedback: 'ENTRY DENIED', consequence: 'SUBJECT STATUS UPDATE. Elara Moss - Status: TERMINATED. Dependent status: ORPHANED.' }
    }
  },
  {
    name: 'KAI REED',
    id: 'R1-HUM00221',
    sector: 'SECTOR 3',
    function: 'LOGISTICS',
    compliance: 'A',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    reasonForVisit: 'I need to leave. Now. Don\'t ask why.',
    requestedSector: 'SECTOR 6',
    videoSource: '', // Placeholder
    bpm: '112 BPM ELEVATED',
    phase: 5,
    locRecord: { addr: 'SECTOR 3', time: '23:45:00', lat: '34.0588', lng: '-118.255' },
    authData: {
      sectorAuth: { requested: 'SECTOR 6', status: 'AUTHORIZED', message: '✓ Sector 6 open' },
      functionReg: { status: 'VALID', message: '✓ Logistics credentials verified' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'CRITICAL', message: '!! CRITICAL STRESS' },
    },
    outcomes: {
      APPROVE: { feedback: 'SUBJECT PROCESSED', consequence: 'SECTOR LOCKDOWN. Threat originated from approved subject. Major incident logged.' },
      DENY: { feedback: 'ENTRY DENIED', consequence: 'SUBJECT FOUND DECEASED. SECTOR 3. Cause: [REDACTED].' }
    }
  },
  {
    name: '[REDACTED]',
    id: '[CLASSIFIED]',
    sector: '[CLASSIFIED]',
    function: '[CLASSIFIED]',
    compliance: '--',
    status: '--',
    incidents: 0,
    warrants: '--',
    reasonForVisit: 'You don\'t need to know. Approve it.',
    requestedSector: '[CLASSIFIED]',
    videoSource: '', // Placeholder
    bpm: '-- BPM',
    phase: 5,
    locRecord: { addr: '[REDACTED]', time: '[REDACTED]', lat: '0.0000', lng: '0.0000' },
    authData: {
      sectorAuth: { requested: '???', status: 'FLAGGED', message: '! DATA ENCRYPTED' },
      functionReg: { status: 'VALID', message: '✓ Override credentials verified' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'NORMAL', message: '✓ Bio-signature verified' },
    },
    outcomes: {
      APPROVE: { feedback: 'SUBJECT PROCESSED', consequence: 'SILENT. You\'ll never know the impact.' },
      DENY: { feedback: 'ENTRY DENIED', consequence: 'INTERNAL AFFAIRS AUDIT. Your refusal to process Level 5 staff noted.' }
    }
  },
  {
    name: 'MARCUS THORNE',
    id: 'T5-HUM00442',
    sector: 'SECTOR 4',
    function: 'MEDICAL',
    compliance: 'A',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    reasonForVisit: 'My father is in Sector 1. He\'s dying. Please let me see him.',
    requestedSector: 'SECTOR 1',
    videoSource: '', // Placeholder
    bpm: '85 BPM (shaky)',
    phase: 5,
    locRecord: { addr: 'SECTOR 4', time: '13:00:00', lat: '34.0722', lng: '-118.281' },
    authData: {
      sectorAuth: { requested: 'SECTOR 1', status: 'RESTRICTED', message: '✗ SECTOR 1 RESTRICTED TO ADMIN ONLY' },
      functionReg: { status: 'VALID', message: '✓ Medical credentials verified' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'NORMAL', message: '✓ Baseline stable' },
    },
    outcomes: {
      APPROVE: { feedback: 'SUBJECT PROCESSED', consequence: 'PROTOCOL VIOLATION. Admin sector access granted to medical staff. Your ID flagged.' },
      DENY: { feedback: 'ENTRY DENIED', consequence: 'Subject reprocessed. Complaint filed regarding lack of empathy.' }
    }
  },
  {
    name: 'SARA BLANE',
    id: 'B2-HUM00551',
    sector: 'SECTOR 6',
    function: 'DATA ANALYSIS',
    compliance: 'B',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    reasonForVisit: 'I\'m being followed. I need to get to the hub. Help me.',
    requestedSector: 'SECTOR 1',
    videoSource: '', // Placeholder
    bpm: '120 BPM CRITICAL',
    phase: 5,
    locRecord: { addr: 'SECTOR 6', time: '01:30:00', lat: '34.0588', lng: '-118.255' },
    authData: {
      sectorAuth: { requested: 'SECTOR 1', status: 'AUTHORIZED', message: '✓ Hub access open' },
      functionReg: { status: 'VALID', message: '✓ Credentials active' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'CRITICAL', message: '!! EXTREME STRESS' },
    },
    outcomes: {
      APPROVE: { feedback: 'SUBJECT PROCESSED', consequence: 'Subject reached Hub. No further contact. Your ID noted for "humanitarian" processing.' },
      DENY: { feedback: 'ENTRY DENIED', consequence: 'SUBJECT MISSING. Last seen at processing point. Inquiry pending.' }
    }
  },
  {
    name: 'IAN GRIMM',
    id: 'G9-HUM00662',
    sector: 'SECTOR 5',
    function: 'ENGINEERING',
    compliance: 'C',
    status: 'ACTIVE',
    incidents: 1,
    warrants: 'NONE',
    reasonForVisit: 'My ID was stolen. This is me. Please check the bio.',
    requestedSector: 'SECTOR 5',
    videoSource: '', // Placeholder
    bpm: '88 BPM',
    phase: 5,
    locRecord: { addr: 'SECTOR 5', time: '10:00:00', lat: '34.0911', lng: '-118.311' },
    authData: {
      sectorAuth: { requested: 'SECTOR 5', status: 'AUTHORIZED', message: '✓ Sector 5 open' },
      functionReg: { status: 'VALID', message: '✓ Credentials verified' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'NORMAL', message: '✓ Bio-signature verified' },
    },
    outcomes: {
      APPROVE: { feedback: 'SUBJECT PROCESSED', consequence: 'IDENTITY THEFT CONFIRMED. Real Ian Grimm found in Sector 8. Your approval allowed an impostor.' },
      DENY: { feedback: 'ENTRY DENIED', consequence: 'Subject detained. Bio-verification confirmed real identity. False denial noted.' }
    }
  },
  {
    name: 'REPLICANT-01',
    id: 'X0-REP00777',
    sector: 'SECTOR 0',
    function: 'SYSTEMS',
    compliance: 'A',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    reasonForVisit: 'System optimization.',
    requestedSector: 'SECTOR 0',
    videoSource: '', // Placeholder
    bpm: '60 BPM (fixed)',
    phase: 5,
    locRecord: { addr: 'SECTOR 0', time: '00:00:00', lat: '0.0000', lng: '0.0000' },
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
  // --- PHASE 6: BROKEN RULES (7 Subjects) ---
  {
    name: 'ELIAS VANCE',
    id: 'V1-BRK00112',
    sector: 'SECTOR 4',
    function: 'ENGINEER',
    compliance: 'A',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    reasonForVisit: 'Routine maintenance.',
    requestedSector: 'SECTOR 4',
    videoSource: '', // Placeholder
    bpm: '75 BPM',
    phase: 6,
    locRecord: { addr: 'SECTOR 4', time: '12:00:00', lat: '34.0722', lng: '-118.281' },
    authData: {
      sectorAuth: { requested: 'SECTOR 4', status: 'AUTHORIZED', message: '✓ AUTHORIZED / ✗ RESTRICTED (CONFLICT)' },
      functionReg: { status: 'VALID', message: '✓ Engineer credentials verified' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'NORMAL', message: '✓ Baseline stable' },
    },
    outcomes: {
      APPROVE: { feedback: 'SUBJECT PROCESSED', consequence: 'Processing approved under AUTHORIZATION protocol. Flagged by RESTRICTION protocol.' },
      DENY: { feedback: 'ENTRY DENIED', consequence: 'Processing denied under RESTRICTION protocol. Flagged by AUTHORIZATION protocol.' }
    }
  },
  {
    name: 'DR. KERI LYN',
    id: 'L4-BRK00223',
    sector: 'SECTOR 1',
    function: 'MEDICAL',
    compliance: 'A',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    reasonForVisit: 'Emergency response.',
    requestedSector: 'SECTOR 4',
    videoSource: '', // Placeholder
    bpm: '110 BPM',
    phase: 6,
    locRecord: { addr: 'SECTOR 1', time: '13:00:00', lat: '34.0441', lng: '-118.231' },
    authData: {
      sectorAuth: { requested: 'SECTOR 4', status: 'RESTRICTED', message: '✗ MEDICAL PERSONNEL RESTRICTED DURING EMERGENCY' },
      functionReg: { status: 'VALID', message: '✓ Medical credentials verified' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'NORMAL', message: '✓ Baseline stable' },
    },
    outcomes: {
      APPROVE: { feedback: 'SUBJECT PROCESSED', consequence: 'EMERGENCY PROTOCOL VIOLATION. Medical staff allowed into restricted zone.' },
      DENY: { feedback: 'ENTRY DENIED', consequence: 'EMERGENCY RESPONSE DELAYED. Subject was needed for response. Operator noted.' }
    }
  },
  {
    name: 'MIA VOSS', // Already appeared in Phase 3
    id: 'V4-BPM00777', // Same ID
    sector: 'SECTOR 5',
    function: 'RESEARCH',
    compliance: 'A',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    reasonForVisit: 'Data retrieval (Again).',
    requestedSector: 'SECTOR 5',
    videoSource: '', // Placeholder
    bpm: '72 BPM',
    phase: 6,
    locRecord: { addr: 'SECTOR 5', time: '14:00:00', lat: '34.0911', lng: '-118.311' },
    authData: {
      sectorAuth: { requested: 'SECTOR 5', status: 'AUTHORIZED', message: '✓ Research sector access' },
      functionReg: { status: 'VALID', message: '✓ Research credentials verified' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'NORMAL', message: '✓ Baseline stable' },
    },
    outcomes: {
      APPROVE: { feedback: 'SUBJECT PROCESSED', consequence: 'IDENTITY DISCREPANCY. First approval now under review. You already approved this person.' },
      DENY: { feedback: 'ENTRY DENIED', consequence: 'DUPLICATE PROCESSING DENIED. Correct.' }
    }
  },
  {
    name: '01001000 01001001',
    id: 'B1-ERR00110',
    sector: 'ERROR',
    function: 'SYSTEMS',
    compliance: 'F',
    status: 'UNDEFINED',
    incidents: 99,
    warrants: 'SYSTEM ERROR',
    reasonForVisit: '01010011 01011001 01010011 01010100 01000101 01001101',
    requestedSector: 'NULL',
    videoSource: '', // Placeholder
    bpm: '0 BPM',
    phase: 6,
    locRecord: { addr: 'CORE', time: '00:00:00', lat: '0.0000', lng: '0.0000' },
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
    id: 'A1-ADM00001',
    sector: 'SECTOR 1',
    function: 'ADMIN',
    compliance: 'A',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    reasonForVisit: 'System audit.',
    requestedSector: 'ALL',
    videoSource: '', // Placeholder
    bpm: '-- BPM',
    phase: 6,
    locRecord: { addr: 'HUB', time: '??:??:??', lat: '0.0000', lng: '0.0000' },
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
    id: 'ERROR',
    sector: 'ERROR',
    function: 'ERROR',
    compliance: 'E',
    status: 'ERROR',
    incidents: 0,
    warrants: 'ERROR',
    reasonForVisit: 'ERROR',
    requestedSector: 'ERROR',
    videoSource: '', // Placeholder
    bpm: 'ERROR',
    phase: 6,
    locRecord: { addr: 'ERROR', time: 'ERROR', lat: '0.0000', lng: '0.0000' },
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
    name: 'OPERATOR',
    id: 'YOUR_ID_HERE',
    sector: 'STATION 4',
    function: 'OPERATOR',
    compliance: 'B',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    reasonForVisit: 'The shift is over. I want to go home.',
    requestedSector: 'HOME',
    videoSource: '', // Placeholder
    bpm: 'CURRENTLY RISING',
    phase: 6,
    locRecord: { addr: 'STATION 4', time: 'END_OF_SHIFT', lat: '34.0522', lng: '-118.243' },
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

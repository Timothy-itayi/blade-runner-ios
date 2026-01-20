// =============================================================================
// NEWS NARRATION MAPPING
// Maps subject outcomes to news broadcast narration scripts
// =============================================================================

export type NewsStoryType = 'BREAKING' | 'LOCAL' | 'SYSTEM' | 'FILLER';
export type NewsSeverity = 'CRITICAL' | 'MODERATE' | 'LOW';

export interface NewsNarration {
  type: NewsStoryType;
  headline: string;
  narration: string;
  severity: NewsSeverity;
  audioFile?: string; // Path to audio file if available
  revealShift?: number; // If news is delayed until later shift
  dynamic?: {
    // Dynamic content based on prior decisions
    condition: string; // Description of condition
    variants: {
      [key: string]: string; // Variant narration based on condition
    };
  };
}

export interface SubjectNewsMapping {
  [subjectId: string]: {
    APPROVE?: NewsNarration | null; // null = no news
    DENY?: NewsNarration | null;
  };
}

// =============================================================================
// SHIFT 1: ROUTINE
// =============================================================================

// S1-02: MARA VOLKOV
const S1_02_MARA_VOLKOV: SubjectNewsMapping['S1-02'] = {
  DENY: {
    type: 'BREAKING',
    headline: 'FAMILY TRAGEDY: SECTOR 8',
    narration: "Breaking news from Sector 8 tonight. An elderly woman has passed away while awaiting a family visit. Her daughter, detained at Checkpoint 9 on an outstanding warrant, has filed an appeal with the Transit Authority. The daughter's statement to officials: 'I never got to say goodbye.' Transit Authority cites standard verification protocol. The warrant, reportedly issued years ago, remains under review.",
    severity: 'CRITICAL',
    audioFile: 'shift1-news-s1-02-denied.mp3',
  },
  APPROVE: null, // Family reunited - positive outcome, silent
};

// =============================================================================
// SHIFT 2: HANDOFF
// =============================================================================

// S2-05: KARL BRANDT
const S2_05_KARL_BRANDT: SubjectNewsMapping['S2-05'] = {
  DENY: {
    type: 'BREAKING',
    headline: 'INDUSTRIAL INCIDENT: SECTOR 7',
    narration: "Emergency services are responding to a critical incident in Sector 7's industrial zone. Three workers have been hospitalized with acute respiratory failure following a ventilation system malfunction. One worker remains in critical condition. Sector maintenance records indicate a scheduled repair was pending transit approval at the time of the incident. Investigation ongoing.",
    severity: 'CRITICAL',
  },
  APPROVE: null, // Repair completed normally
};

// S2-06: SORA TANAKA
const S2_06_SORA_TANAKA: SubjectNewsMapping['S2-06'] = {
  DENY: {
    type: 'BREAKING',
    headline: 'MEDICAL CRISIS: SECTOR 6',
    narration: "Sector 6 Health Services reports two patient fatalities overnight. An understaffed clinic was unable to provide timely care following a personnel shortage. A critical warning has been issued by the Health Inspection Bureau. Transit records show emergency medical coverage was delayed.",
    severity: 'CRITICAL',
  },
  APPROVE: null, // Patients stable - routine
};

// S2-07: DMITRI VOLKOV
const S2_07_DMITRI_VOLKOV: SubjectNewsMapping['S2-07'] = {
  DENY: {
    type: 'LOCAL',
    headline: 'RELOCATION: TEMPORARY BLOCK 7',
    narration: "Transit Authority confirms relocation of a Sector 9 resident to Temporary Block 7. The subject, whose sector designation was recently revoked, filed 47 inquiries regarding a detained family member. All inquiries have been denied. Personal effects were disposed of per standard protocol.",
    severity: 'MODERATE',
  },
  APPROVE: null, // Family search in progress - silent
};

// S2-08: LENA MARSH
const S2_08_LENA_MARSH: SubjectNewsMapping['S2-08'] = {
  DENY: {
    type: 'BREAKING',
    headline: 'PATIENT FATALITY: MEDICAL TRANSFER',
    narration: "A patient fatality has been reported during an inter-sector medical transfer. The patient, requiring urgent dialysis treatment, died in transit after a four-hour delay. The family has been notified. Sector 7 Medical Center declined to comment on the circumstances.",
    severity: 'CRITICAL',
  },
  APPROVE: null, // Transfer completed
};

// =============================================================================
// SHIFT 3: CRACKS
// =============================================================================

// S3-09: ELIAS VOSS
const S3_09_ELIAS_VOSS: SubjectNewsMapping['S3-09'] = {
  DENY: {
    type: 'BREAKING',
    headline: 'WATER CRISIS: SECTOR 6',
    narration: "Sector 6 remains under a boil water advisory following catastrophic failure at the primary treatment plant. 340 residents have been hospitalized with waterborne illness. 12 fatalities confirmed. Infrastructure reports indicate critical replacement parts failed to arrive on schedule. An investigation into transit delays has been opened.",
    severity: 'CRITICAL',
    revealShift: 5, // Delayed reveal Shift 5
  },
  APPROVE: null, // Water system operational
};

// S3-10: NINA ROX
const S3_10_NINA_ROX: SubjectNewsMapping['S3-10'] = {
  APPROVE: {
    type: 'LOCAL',
    headline: 'SECURITY ALERT: DATA ANOMALY',
    narration: "Security officials report a data anomaly detected at a Sector 1 terminal. A restricted subject accessed the network following checkpoint clearance. The source and nature of the anomaly remain under investigation. No immediate threat has been identified.",
    severity: 'MODERATE',
  },
  DENY: null, // Correct protocol followed
};

// S3-11: SILAS QUINN
const S3_11_SILAS_QUINN: SubjectNewsMapping['S3-11'] = {
  DENY: {
    type: 'BREAKING',
    headline: 'PREVENTABLE DEATH: SECTOR 5',
    narration: "A Sector 5 resident was found deceased in their quarters six days after a missed medical appointment. Autopsy results indicate cardiac arrest. Medical officials have classified the death as preventable. The subject had been cleared for an urgent cardiology appointment that was not completed.",
    severity: 'CRITICAL',
    revealShift: 6, // Delayed reveal Shift 6
  },
  APPROVE: null, // Surgery successful - private matter
};

// S3-12: VERA OKONKWO
const S3_12_VERA_OKONKWO: SubjectNewsMapping['S3-12'] = {
  DENY: {
    type: 'LOCAL',
    headline: 'SECURITY INTERCEPT: ENCRYPTED MESSAGE',
    narration: "Security forces have intercepted a suspicious communication linked to a recently relocated subject. The message, partially encrypted, references secondary protocols and uses the initial 'V.' Investigation status: ACTIVE. No arrests have been announced.",
    severity: 'MODERATE',
  },
  APPROVE: null, // Coup seed planted - silent reveal Shift 8
};

// =============================================================================
// SHIFT 4: ECHOES
// =============================================================================

// S4-14: LENA VOLKOV
const S4_14_LENA_VOLKOV: SubjectNewsMapping['S4-14'] = {
  DENY: {
    type: 'LOCAL',
    headline: 'MINOR DETAINED: CHECKPOINT 9',
    narration: "Security personnel confirm the sedation and relocation of a minor following an incident at Checkpoint 9. The subject, seeking information about detained family members, experienced acute distress during processing. Current status: PROCESSING. Parent locations remain classified.",
    severity: 'MODERATE',
  },
  APPROVE: null, // Family status depends on prior decisions
};

// S4-15: MARCUS THREAD
const S4_15_MARCUS_THREAD: SubjectNewsMapping['S4-15'] = {
  DENY: {
    type: 'LOCAL',
    headline: 'EMPLOYMENT TERMINATION: SECTOR 6',
    narration: "Sector 6 reports an employment termination following transit delays. A logistics worker missed a mandatory review, resulting in immediate dismissal. A family of four has been downgraded from priority housing. Social services have been notified.",
    severity: 'MODERATE',
  },
  APPROVE: null, // Employment maintained
};

// =============================================================================
// SHIFT 5: FRACTURES
// =============================================================================

// S5-17: JONAS WEBB
const S5_17_JONAS_WEBB: SubjectNewsMapping['S5-17'] = {
  DENY: {
    type: 'LOCAL',
    headline: 'DISABILITY COMPLAINT: CHECKPOINT 9',
    narration: "A disability advocacy complaint has been filed against Checkpoint 9 processing. An industrial worker, an amputee from a documented ventilation incident, was denied transit due to partial biometric failure. The subject's statement: 'The system treats us like we're broken.' Transit Authority is reviewing accessibility protocols.",
    severity: 'MODERATE',
  },
  APPROVE: null, // Medical appointment completed
};

// S5-19: YURI PETROV
const S5_19_YURI_PETROV: SubjectNewsMapping['S5-19'] = {
  DENY: {
    type: 'LOCAL',
    headline: 'COURIER DETAINED: PACKAGE INSPECTION',
    narration: "Security forces have detained a supply courier following package inspection at Checkpoint 9. Contents of the package remain classified. A handwritten note found with the materials references an individual known only as 'V.' Investigation status: ACTIVE.",
    severity: 'MODERATE',
  },
  APPROVE: null, // Coup seed #2 planted - silent reveal Shift 9
};

// S5-20: KATYA PETROV
const S5_20_KATYA_PETROV: SubjectNewsMapping['S5-20'] = {
  DENY: {
    type: 'LOCAL',
    headline: 'MISSING PERSONS REPORT DENIED',
    narration: "A missing persons report filed by a Sector 6 resident has been denied. The subject sought information about her son, last seen in transit to Sector 4. Subject status: PROCESSING. The mother's inquiry has been logged and rejected.",
    severity: 'MODERATE',
  },
  APPROVE: null, // Dynamic based on YURI outcome
};

// =============================================================================
// SHIFT 6: CONNECTIONS
// =============================================================================

// S6-21: KOFI MENSAH
const S6_21_KOFI_MENSAH: SubjectNewsMapping['S6-21'] = {
  DENY: {
    type: 'LOCAL',
    headline: 'WATER QUALITY DEGRADED: SECTOR 6',
    narration: "Sector 6 water quality reports indicate degraded conditions following delayed maintenance. Approximately 40 residents have reported illness. No fatalities at this time. Utilities department cites scheduling conflicts for the delay.",
    severity: 'MODERATE',
  },
  APPROVE: null, // Maintenance completed
};

// S6-22: DR. YUKI TANAKA
const S6_22_YUKI_TANAKA: SubjectNewsMapping['S6-22'] = {
  DENY: {
    type: 'BREAKING',
    headline: 'PATIENT DEATH: DELAYED CONSULTATION',
    narration: "A patient has died at a Sector 4 medical facility following a delayed consultation. Dr. Yuki Tanaka, the specialist called in for emergency assistance, was unable to reach the facility in time. A colleague, Nurse Sora Tanaka, has taken leave following the incident. The patient's family has been notified.",
    severity: 'CRITICAL',
  },
  APPROVE: null, // Patient stabilized
};

// S6-23: ALEXEI MOROZOV
const S6_23_ALEXEI_MOROZOV: SubjectNewsMapping['S6-23'] = {
  DENY: {
    type: 'LOCAL',
    headline: 'DETENTION: UNSPECIFIED ASSOCIATION',
    narration: "A Sector 6 resident remains in detention following flagging for an unspecified association. The subject claims innocence, stating the flag is a system error. Investigation continues. Duration of hold: INDEFINITE.",
    severity: 'MODERATE',
  },
  APPROVE: null, // Cleared - ambiguous outcome
};

// S6-24: OLEG PETROV
const S6_24_OLEG_PETROV: SubjectNewsMapping['S6-24'] = {
  DENY: {
    type: 'LOCAL',
    headline: 'FAMILY MONITORING: PETROV',
    narration: "The Petrov family of Sector 5 has been flagged for monitoring following multiple transit denials. One family member has been hospitalized for stress-related symptoms. The family patriarch's current status: UNKNOWN.",
    severity: 'MODERATE',
  },
  APPROVE: null, // Dynamic based on YURI outcome
};

// =============================================================================
// SHIFT 7: RETURNS
// =============================================================================

// S7-25: CLARA VANCE
const S7_25_CLARA_VANCE: SubjectNewsMapping['S7-25'] = {
  DENY: {
    type: 'LOCAL',
    headline: 'PROSTHETIC DEGRADATION: MINING WORKER',
    narration: "A mining worker with prosthetic eyes reports worsening vision following a missed medical appointment. The subject, injured in an industrial accident three years prior, states current prosthetics are degrading. Medical services have not confirmed a rescheduled appointment.",
    severity: 'MODERATE',
  },
  APPROVE: null, // Vision restored
};

// S7-26: VERA OKONKWO
const S7_26_VERA_OKONKWO: SubjectNewsMapping['S7-26'] = {
  DENY: {
    type: 'LOCAL',
    headline: 'SURVEILLANCE ACTIVATED: REPEAT PATTERN',
    narration: "Surveillance has been activated on a subject following detection of a repeat transit pattern. The individual, previously processed at this checkpoint, has been flagged for monitoring. Connection to prior intercepted communications under review.",
    severity: 'MODERATE',
  },
  APPROVE: null, // Ominous silence - pattern noted
};

// S7-27: MARA VOLKOV
const S7_27_MARA_VOLKOV: SubjectNewsMapping['S7-27'] = {
  DENY: {
    type: 'LOCAL',
    headline: 'DETENTION RELEASE: SECTOR 9',
    narration: "A Sector 9 resident, recently released from 47 days in detention, has been logged at Checkpoint 9. Prior records indicate the subject missed a family member's final moments while detained. Current status: TRANSIT LOGGED. Grief indicators detected.",
    severity: 'MODERATE',
  },
  APPROVE: null, // Dynamic based on S1 decision
};

// S7-28: REZA AHMADI
const S7_28_REZA_AHMADI: SubjectNewsMapping['S7-28'] = {
  DENY: {
    type: 'LOCAL',
    headline: 'ENGINEER DETAINED: ENCRYPTED DATA',
    narration: "A Sector 4 engineer has been detained following discovery of encrypted data on personal devices. Engineering credentials have been suspended pending investigation. Contents of encrypted files remain classified. Subject claims routine quarterly assessment.",
    severity: 'MODERATE',
  },
  APPROVE: null, // MAJOR COUP SEED - silent reveal Shift 11
};

// =============================================================================
// SHIFT 8: WEIGHT
// =============================================================================

// S8-29: TARA SINGH
const S8_29_TARA_SINGH: SubjectNewsMapping['S8-29'] = {
  DENY: {
    type: 'LOCAL',
    headline: 'TRANSIT DELAYS: THREE SECTORS',
    narration: "Transit delays cascade across three sectors following schedule synchronization failure. Approximately 2,000 workers reported late to assignments. Productivity metrics impacted. A transport coordinator was unable to complete scheduled system updates.",
    severity: 'MODERATE',
  },
  APPROVE: null, // Schedules optimized
};

// S8-30: ELENA ROSS
const S8_30_ELENA_ROSS: SubjectNewsMapping['S8-30'] = {
  DENY: {
    type: 'LOCAL',
    headline: 'RESEARCHER COLLAPSED: DISTRESSING NEWS',
    narration: "A Sector 5 researcher collapsed following distressing news about a missing contact. The individual, Silas Quinn, [If SILAS denied in S3: was recently confirmed deceased from preventable cardiac arrest]. Subject required medical intervention. [If SILAS approved: Current location confirmed at Sector 4 medical facility.]",
    severity: 'MODERATE',
    dynamic: {
      condition: 'S3-11 SILAS QUINN decision',
      variants: {
        denied: "A Sector 5 researcher collapsed following distressing news about a missing contact. The individual, Silas Quinn, was recently confirmed deceased from preventable cardiac arrest. Subject required medical intervention.",
        approved: "A Sector 5 researcher collapsed following distressing news about a missing contact. The individual, Silas Quinn. Current location confirmed at Sector 4 medical facility. Subject required medical intervention.",
      },
    },
  },
  APPROVE: null, // Dynamic based on SILAS outcome
};

// S8-31: JAMES CHEN
const S8_31_JAMES_CHEN: SubjectNewsMapping['S8-31'] = {
  DENY: {
    type: 'LOCAL',
    headline: 'HOUSING REVIEW: SECTOR 5 ENGINEER',
    narration: "A Sector 5 engineer faces housing review following missed maintenance window. The subject, father to recently transferred engineer Wei Chen, was unable to complete critical scheduled work. Supervisor has logged the incident. Family housing priority under evaluation.",
    severity: 'MODERATE',
  },
  APPROVE: null, // Family doing well
};

// S8-32: GHOST CHILD
const S8_32_GHOST_CHILD: SubjectNewsMapping['S8-32'] = {
  DENY: {
    type: 'BREAKING',
    headline: 'UNIDENTIFIED MINOR: PROCESSING QUEUE',
    narration: "An unidentified minor remains in processing queue following detention at Checkpoint 9. No guardian has claimed the child. Identity: UNKNOWN. Sector of origin: UNKNOWN. Duration of hold: INDEFINITE. Processing status: PENDING.",
    severity: 'CRITICAL',
  },
  APPROVE: {
    type: 'LOCAL',
    headline: 'HUMANITARIAN EXCEPTION: UNIDENTIFIED MINOR',
    narration: "Transit Authority confirms humanitarian exception granted for an unidentified minor. The child has been assigned ward status in Sector 4 and placed in foster housing. Identity remains unconfirmed. Origin investigation continues.",
    severity: 'LOW',
  },
};

// =============================================================================
// SHIFT 9: SYNTHETIC
// =============================================================================

// S9-33: UNIT-7
const S9_33_UNIT_7: SubjectNewsMapping['S9-33'] = {
  DENY: {
    type: 'LOCAL',
    headline: 'THERMAL SYSTEM FAILURES: THREE SECTORS',
    narration: "Thermal system failures reported across three sectors following maintenance denial. A synthetic maintenance unit was prevented from completing scheduled calibration. HVAC systems operating below optimal parameters. Human technicians have been dispatched but face significant delays.",
    severity: 'MODERATE',
  },
  APPROVE: null, // Calibration complete - efficiency logged
};

// S9-34: ADMINISTRATOR KANE
const S9_34_ADMINISTRATOR_KANE: SubjectNewsMapping['S9-34'] = {
  DENY: {
    type: 'SYSTEM',
    headline: 'INSUBORDINATION FLAG: OPERATOR FILE',
    narration: "INTERNAL NOTICE: Insubordination flag added to Operator file. An Administrator conducting routine performance review was denied access by checkpoint personnel. Disciplinary action: PENDING. Operator metrics under mandatory review.",
    severity: 'MODERATE',
  },
  APPROVE: null, // Review complete - file updated silently
};

// S9-36: OLEG PETROV
const S9_36_OLEG_PETROV: SubjectNewsMapping['S9-36'] = {
  DENY: {
    type: 'LOCAL',
    headline: 'FAMILY MONITORING: PETROV',
    narration: "The Petrov family has been added to active monitoring list. Multiple transit incidents across three family members have triggered automatic surveillance protocols. Matriarch hospitalized. Father's status: UNDETERMINED.",
    severity: 'MODERATE',
  },
  APPROVE: null, // Dynamic based on YURI outcome
};

// =============================================================================
// SHIFT 10: AUTHORITY
// =============================================================================

// S10-37: KENJI TANAKA
const S10_37_KENJI_TANAKA: SubjectNewsMapping['S10-37'] = {
  DENY: {
    type: 'BREAKING',
    headline: 'PATIENT FATALITY: MEDICAL TRANSFER',
    narration: "A patient has died in transit during an inter-sector medical transfer. The patient, en route to Sector 6 for urgent treatment, did not survive the journey. Attending physicians Dr. Yuki Tanaka and Nurse Sora Tanaka could not be reached in time. The cause: transit delay.",
    severity: 'CRITICAL',
  },
  APPROVE: null, // Treatment successful
};

// S10-38: SORA TANAKA
const S10_38_SORA_TANAKA: SubjectNewsMapping['S10-38'] = {
  DENY: {
    type: 'LOCAL',
    headline: 'MEDICAL EQUIPMENT DELAYED',
    narration: "Medical equipment transfer delayed between Sectors 6 and 4. A patient procedure has been postponed. Patient condition: [If KENJI denied: DECEASED] [If approved: CRITICAL]. Medical staff express frustration with transit protocols.",
    severity: 'MODERATE',
    dynamic: {
      condition: 'S10-37 KENJI TANAKA decision',
      variants: {
        denied: "Medical equipment transfer delayed between Sectors 6 and 4. A patient procedure has been postponed. Patient condition: DECEASED. Medical staff express frustration with transit protocols.",
        approved: "Medical equipment transfer delayed between Sectors 6 and 4. A patient procedure has been postponed. Patient condition: CRITICAL. Medical staff express frustration with transit protocols.",
      },
    },
  },
  APPROVE: null, // Procedure successful
};

// S10-39: IVAN KOZLOV
const S10_39_IVAN_KOZLOV: SubjectNewsMapping['S10-39'] = {
  DENY: {
    type: 'LOCAL',
    headline: 'WARRANT CONFIRMED: TECHNICIAN DETAINED',
    narration: "A technician has been detained following warrant confirmation. The subject claimed the warrant was outdated from before sector restructuring. Investigation confirms: warrant remains VALID. Subject held pending further review.",
    severity: 'MODERATE',
  },
  APPROVE: null, // Ambiguous - system uncertainty
};

// S10-40: [REDACTED]
const S10_40_REDACTED: SubjectNewsMapping['S10-40'] = {
  DENY: {
    type: 'SYSTEM',
    headline: 'CLASSIFIED TRANSIT DENIED',
    narration: "CLASSIFIED TRANSIT DENIED. Operator involvement has been noted. Contact from Central Command pending. File status: FLAGGED.",
    severity: 'MODERATE',
  },
  APPROVE: null, // File DELETED - you'll never know
};

// =============================================================================
// SHIFT 11: FAMILY
// =============================================================================

// S11-41: SARAH VOLKOV
const S11_41_SARAH_VOLKOV: SubjectNewsMapping['S11-41'] = {
  DENY: {
    type: 'LOCAL',
    headline: 'FAMILY INQUIRY DENIED',
    narration: "A family inquiry has been denied at Checkpoint 9. The subject sought information on multiple family members: Mara, Dmitri, and Lena Volkov. All records have been sealed. Subject detained. Statement: 'Why won't anyone tell me?'",
    severity: 'MODERATE',
  },
  APPROVE: null, // Full family status revealed based on ALL prior decisions
};

// S11-42: ROBOT-MAINTENANCE
const S11_42_ROBOT_MAINTENANCE: SubjectNewsMapping['S11-42'] = {
  DENY: {
    type: 'LOCAL',
    headline: 'WATER QUALITY DEGRADED: REPLICANT DENIAL',
    narration: "Sector 3 water quality has degraded following replicant maintenance denial. Human technicians were dispatched but experienced 8-hour delays. Analysis indicates replicant performance exceeds human workers in efficiency metrics. Policy review requested.",
    severity: 'MODERATE',
  },
  APPROVE: null, // Water quality optimal
};

// S11-43: DAVID PARK
const S11_43_DAVID_PARK: SubjectNewsMapping['S11-43'] = {
  DENY: {
    type: 'LOCAL',
    headline: 'EMPLOYMENT TERMINATED: FIRST DAY',
    narration: "A new employee was terminated before starting their first day following transit delays. The subject, a data analyst, reported elevated stress during processing. Current status: UNEMPLOYED. Subject statement: 'I have nothing now.'",
    severity: 'MODERATE',
  },
  APPROVE: null, // New beginning - grateful
};

// S11-44: AMARA OKONKWO
const S11_44_AMARA_OKONKWO: SubjectNewsMapping['S11-44'] = {
  DENY: {
    type: 'LOCAL',
    headline: 'SURVEILLANCE EXPANSION: OKONKWO',
    narration: "Surveillance expansion confirmed for subjects connected to VERA OKONKWO. The connection between family members and flagged individuals has been documented. Additional monitoring protocols activated.",
    severity: 'MODERATE',
  },
  APPROVE: null, // Ominous - "We're grateful" if VERA approved
};

// =============================================================================
// SHIFT 12: IMPOSTERS
// =============================================================================

// S12-45: REPLICANT-CLARA
const S12_45_REPLICANT_CLARA: SubjectNewsMapping['S12-45'] = {
  APPROVE: {
    type: 'BREAKING',
    headline: 'SECURITY ALERT: IDENTITY THEFT',
    narration: "SECURITY ALERT: Identity theft confirmed at Checkpoint 9. A replicant was approved for transit using stolen prosthetic eyes belonging to CLARA VANCE, a mining worker. Fingerprints: MISMATCH. Eyes: STOLEN. Current location of the real CLARA VANCE: UNKNOWN. Investigation URGENT.",
    severity: 'CRITICAL',
  },
  DENY: {
    type: 'BREAKING',
    headline: 'REPLICANT DESTROYED: IDENTITY THEFT',
    narration: "A replicant has been destroyed at Checkpoint 9 following identity verification failure. The synthetic entity was wearing prosthetic eyes confirmed to belong to CLARA VANCE, a Sector 5 mining worker. Origin of the replicant: UNKNOWN. Status of the real CLARA VANCE: UNKNOWN.",
    severity: 'CRITICAL',
  },
};

// S12-47: ALEXEI MOROZOV
const S12_47_ALEXEI_MOROZOV: SubjectNewsMapping['S12-47'] = {
  DENY: {
    type: 'LOCAL',
    headline: 'INVESTIGATION REOPENED',
    narration: "Prior investigation into a flagged subject has been reopened. The individual, previously held for 12 days, returned to checkpoint transit. Uncertainty in flag resolution has been logged. Status: UNDER REVIEW.",
    severity: 'MODERATE',
  },
  APPROVE: null, // Dynamic based on S6 decision
};

// S12-48: OPERATOR-7721
const S12_48_OPERATOR_7721: SubjectNewsMapping['S12-48'] = {
  DENY: {
    type: 'LOCAL',
    headline: 'OPERATOR DETAINED: MANDATORY OVERTIME',
    narration: "An operator has been detained after requesting exit from mandatory overtime. The individual claims their shift ended three days prior. Current status: Overtime EXTENDED INDEFINITELY. Subject statement: 'I was you once.'",
    severity: 'MODERATE',
  },
  APPROVE: {
    type: 'LOCAL',
    headline: 'OPERATOR RELEASED: EXTENDED DUTY',
    narration: "An operator has been released from extended duty following processing at a sister checkpoint. The individual had been held for mandatory overtime exceeding 72 hours. Warning issued to other operators: 'Watch your shift hours.'",
    severity: 'LOW',
  },
};

// =============================================================================
// SHIFT 20: TERMINAL
// =============================================================================

// S20-77: THE WIFE
const S20_77_THE_WIFE: SubjectNewsMapping['S20-77'] = {
  DENY: {
    type: 'BREAKING',
    headline: '[TRANSMISSION BLOCKED]',
    narration: "[TRANSMISSION BLOCKED] An incoming transmission to Operator station was terminated per security protocol. Source: EXTERNAL. Content: CLASSIFIED. The operator will never know what was said.",
    severity: 'CRITICAL',
  },
  APPROVE: null, // No public news - personal moment
};

// =============================================================================
// COMPLETE MAPPING
// =============================================================================

export const NEWS_NARRATION_MAP: SubjectNewsMapping = {
  // Shift 1
  'S1-02': S1_02_MARA_VOLKOV,
  
  // Shift 2
  'S2-05': S2_05_KARL_BRANDT,
  'S2-06': S2_06_SORA_TANAKA,
  'S2-07': S2_07_DMITRI_VOLKOV,
  'S2-08': S2_08_LENA_MARSH,
  
  // Shift 3
  'S3-09': S3_09_ELIAS_VOSS,
  'S3-10': S3_10_NINA_ROX,
  'S3-11': S3_11_SILAS_QUINN,
  'S3-12': S3_12_VERA_OKONKWO,
  
  // Shift 4
  'S4-14': S4_14_LENA_VOLKOV,
  'S4-15': S4_15_MARCUS_THREAD,
  
  // Shift 5
  'S5-17': S5_17_JONAS_WEBB,
  'S5-19': S5_19_YURI_PETROV,
  'S5-20': S5_20_KATYA_PETROV,
  
  // Shift 6
  'S6-21': S6_21_KOFI_MENSAH,
  'S6-22': S6_22_YUKI_TANAKA,
  'S6-23': S6_23_ALEXEI_MOROZOV,
  'S6-24': S6_24_OLEG_PETROV,
  
  // Shift 7
  'S7-25': S7_25_CLARA_VANCE,
  'S7-26': S7_26_VERA_OKONKWO,
  'S7-27': S7_27_MARA_VOLKOV,
  'S7-28': S7_28_REZA_AHMADI,
  
  // Shift 8
  'S8-29': S8_29_TARA_SINGH,
  'S8-30': S8_30_ELENA_ROSS,
  'S8-31': S8_31_JAMES_CHEN,
  'S8-32': S8_32_GHOST_CHILD,
  
  // Shift 9
  'S9-33': S9_33_UNIT_7,
  'S9-34': S9_34_ADMINISTRATOR_KANE,
  'S9-36': S9_36_OLEG_PETROV,
  
  // Shift 10
  'S10-37': S10_37_KENJI_TANAKA,
  'S10-38': S10_38_SORA_TANAKA,
  'S10-39': S10_39_IVAN_KOZLOV,
  'S10-40': S10_40_REDACTED,
  
  // Shift 11
  'S11-41': S11_41_SARAH_VOLKOV,
  'S11-42': S11_42_ROBOT_MAINTENANCE,
  'S11-43': S11_43_DAVID_PARK,
  'S11-44': S11_44_AMARA_OKONKWO,
  
  // Shift 12
  'S12-45': S12_45_REPLICANT_CLARA,
  'S12-47': S12_47_ALEXEI_MOROZOV,
  'S12-48': S12_48_OPERATOR_7721,
  
  // Shift 20
  'S20-77': S20_77_THE_WIFE,
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get news narration for a subject decision
 */
export function getNewsNarration(
  subjectId: string,
  decision: 'APPROVE' | 'DENY',
  priorDecisions?: Record<string, 'APPROVE' | 'DENY'>
): NewsNarration | null {
  const mapping = NEWS_NARRATION_MAP[subjectId];
  if (!mapping) return null;
  
  const narration = mapping[decision];
  if (!narration) return null;
  
  // Handle dynamic content based on prior decisions
  if (narration.dynamic && priorDecisions) {
    const condition = narration.dynamic.condition;
    // Extract subject ID from condition (e.g., "S3-11 SILAS QUINN decision")
    const conditionMatch = condition.match(/S\d+-\d+/);
    if (conditionMatch) {
      const conditionSubjectId = conditionMatch[0];
      const conditionDecision = priorDecisions[conditionSubjectId];
      
      if (conditionDecision && narration.dynamic.variants[conditionDecision.toLowerCase()]) {
        return {
          ...narration,
          narration: narration.dynamic.variants[conditionDecision.toLowerCase()],
        };
      }
    }
  }
  
  return narration;
}

/**
 * Check if a subject has news coverage
 */
export function hasNewsCoverage(subjectId: string): boolean {
  return subjectId in NEWS_NARRATION_MAP;
}

/**
 * Get all news narrations for a shift's decisions
 */
export function getShiftNewsNarrations(
  decisions: Array<{ subjectId: string; decision: 'APPROVE' | 'DENY' }>,
  priorDecisions?: Record<string, 'APPROVE' | 'DENY'>
): NewsNarration[] {
  const narrations: NewsNarration[] = [];
  
  for (const { subjectId, decision } of decisions) {
    const narration = getNewsNarration(subjectId, decision, priorDecisions);
    if (narration) {
      narrations.push(narration);
    }
  }
  
  return narrations;
}

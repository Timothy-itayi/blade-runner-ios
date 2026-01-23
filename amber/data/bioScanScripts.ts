// =============================================================================
// BIO SCAN AUDIO SCRIPTS - For Eleven Labs Voice Generation
// Medical jargon style, includes: eye color, hair color, dye status, surgeries
// =============================================================================

export interface BioScanScript {
  subjectId: string;
  script: string;
  medicalFindings: {
    eyeColor: string;
    hairColor: string;
    hairDyed: boolean;
    surgeries: Array<{ type: string; date: string; status: 'RECENT' | 'OLD' }>;
    anomalies: string[];
  };
}

export const BIO_SCAN_SCRIPTS: Record<string, BioScanScript> = {
  'S1-01': {
    subjectId: 'S1-01',
    script: `Health scan initiated. Subject EVA PROM. Baseline vitals acquired. Oxygen saturation stable. Scanning ophthalmic tissue. Eye color: Grey. Iris structure shows synthetic markers. Proceeding to dermal analysis. Hair color: Blonde, natural pigmentation confirmed. No artificial dye detected. Scanning for surgical modifications. No surgical scars detected. No augmentation markers. Proceeding to genetic analysis. Genetic purity: Zero percent. Chromosomal structure indicates synthetic origin. Bio-structure classification: SYNTHETIC. Tissue compatibility: Non-human. Health scan complete. Classification: REPLICANT.`,
    medicalFindings: {
      eyeColor: 'Grey',
      hairColor: 'Blonde',
      hairDyed: false,
      surgeries: [],
      anomalies: ['Synthetic retinal markers', 'Zero genetic purity', 'Replicant fingerprint pattern']
    }
  },
  'S1-02': {
    subjectId: 'S1-02',
    script: `Health scan initiated. Subject MARA VOLKOV. Baseline vitals acquired. Oxygen saturation stable. Scanning ophthalmic tissue. Eye color: Brown. Iris structure normal. Proceeding to dermal analysis. Hair color: Black, artificial dye detected. Dye composition: Synthetic polymer-based. Estimated application: Three months ago. Scanning for surgical modifications. Surgical scar detected: Left wrist, surgical date: 3182-04-15. Procedure type: Implant removal. Status: Healed, old. No active augmentation. Proceeding to genetic analysis. Genetic purity: Ninety-four percent. Bio-structure classification: STANDARD with minor modifications. Tissue compatibility: Human. Health scan complete. Classification: HUMAN.`,
    medicalFindings: {
      eyeColor: 'Brown',
      hairColor: 'Black (dyed)',
      hairDyed: true,
      surgeries: [{ type: 'Implant removal', date: '3182-04-15', status: 'OLD' }],
      anomalies: ['Artificial hair dye', 'Old surgical scar - left wrist']
    }
  },
  'S1-03': {
    subjectId: 'S1-03',
    script: `Health scan initiated. Subject JAMES CHEN. Baseline vitals acquired. Oxygen saturation stable. Scanning ophthalmic tissue. Eye color: Dark brown. Iris structure normal. Proceeding to dermal analysis. Hair color: Gray, natural aging pattern. No artificial dye detected. Scanning for surgical modifications. Multiple surgical scars detected. Primary scar: Right shoulder, surgical date: 3183-11-22. Procedure type: Cybernetic interface installation. Status: Recent, healing. Secondary scar: Left temple, surgical date: 3178-06-10. Procedure type: Neural implant. Status: Old, integrated. Proceeding to genetic analysis. Genetic purity: Seventy-two percent. Bio-structure classification: ENHANCED. Augmentation status: Active. Health scan complete. Classification: HUMAN_CYBORG.`,
    medicalFindings: {
      eyeColor: 'Dark brown',
      hairColor: 'Gray',
      hairDyed: false,
      surgeries: [
        { type: 'Cybernetic interface installation', date: '3183-11-22', status: 'RECENT' },
        { type: 'Neural implant', date: '3178-06-10', status: 'OLD' }
      ],
      anomalies: ['Recent cybernetic surgery', 'Neural implant present', 'Reduced genetic purity']
    }
  },
  'S1-04': {
    subjectId: 'S1-04',
    script: `Health scan initiated. Subject SILAS REX. Baseline vitals acquired. Oxygen saturation stable. Scanning ophthalmic tissue. Eye color: Green. Iris structure shows enhancement markers. Proceeding to dermal analysis. Hair color: Red, natural pigmentation. No artificial dye detected. Scanning for surgical modifications. Surgical scar detected: Both eyes, surgical date: 3183-09-14. Procedure type: Retinal enhancement. Status: Recent, fully integrated. Additional scar: Chest, surgical date: 3180-02-08. Procedure type: Cardiac augmentation. Status: Old, stable. Proceeding to genetic analysis. Genetic purity: Sixty-eight percent. Bio-structure classification: ENHANCED. Cardiovascular augmentation detected. Health scan complete. Classification: HUMAN_CYBORG.`,
    medicalFindings: {
      eyeColor: 'Green (enhanced)',
      hairColor: 'Red',
      hairDyed: false,
      surgeries: [
        { type: 'Retinal enhancement', date: '3183-09-14', status: 'RECENT' },
        { type: 'Cardiac augmentation', date: '3180-02-08', status: 'OLD' }
      ],
      anomalies: ['Recent retinal enhancement', 'Cardiac augmentation', 'Enhanced vision capabilities']
    }
  },
  'S2-01': {
    subjectId: 'S2-01',
    script: `Health scan initiated. Subject VERA OKONKWO. Baseline vitals acquired. Oxygen saturation stable. Scanning ophthalmic tissue. Eye color: Brown. Iris structure normal. Proceeding to dermal analysis. Hair color: Black, natural pigmentation. No artificial dye detected. Scanning for surgical modifications. Surgical scar detected: Right hand, surgical date: 3184-01-03. Procedure type: Fingerprint modification. Status: Recent, healing. Warning: Surgical modification detected within last thirty days. Additional scar: Lower back, surgical date: 3179-05-20. Procedure type: Spinal implant. Status: Old, integrated. Proceeding to genetic analysis. Genetic purity: Eighty-eight percent. Bio-structure classification: MODIFIED. Implant integrity stable. Health scan complete. Classification: HUMAN.`,
    medicalFindings: {
      eyeColor: 'Brown',
      hairColor: 'Black',
      hairDyed: false,
      surgeries: [
        { type: 'Fingerprint modification', date: '3184-01-03', status: 'RECENT' },
        { type: 'Spinal implant', date: '3179-05-20', status: 'OLD' }
      ],
      anomalies: ['Recent fingerprint modification', 'Spinal implant', 'Suspicious timing of surgery']
    }
  },
  'S2-02': {
    subjectId: 'S2-02',
    script: `Health scan initiated. Subject DMITRI VOLKOV. Baseline vitals acquired. Oxygen saturation stable. Scanning ophthalmic tissue. Eye color: Blue. Iris structure normal. Proceeding to dermal analysis. Hair color: Brown, artificial dye detected. Dye composition: Organic-based. Estimated application: Two weeks ago. Scanning for surgical modifications. No surgical scars detected. No augmentation markers. Proceeding to genetic analysis. Genetic purity: Ninety-six percent. Bio-structure classification: STANDARD. No anomalies detected. Health scan complete. Classification: HUMAN.`,
    medicalFindings: {
      eyeColor: 'Blue',
      hairColor: 'Brown (dyed)',
      hairDyed: true,
      surgeries: [],
      anomalies: ['Recent hair dye application', 'Genetic relation to MARA VOLKOV']
    }
  },
  'S2-03': {
    subjectId: 'S2-03',
    script: `Health scan initiated. Subject CLARA VANCE. Baseline vitals acquired. Oxygen saturation stable. Scanning ophthalmic tissue. Eye color: Hazel. Iris structure shows minor anomalies. Proceeding to dermal analysis. Hair color: Blonde, natural pigmentation. No artificial dye detected. Scanning for surgical modifications. Surgical scar detected: Face, surgical date: 3183-12-18. Procedure type: Facial reconstruction. Status: Recent, healing. Multiple micro-scars detected consistent with extensive cosmetic surgery. Additional scar: Left leg, surgical date: 3175-08-12. Procedure type: Amputation and prosthetic attachment. Status: Old, fully integrated. Proceeding to genetic analysis. Genetic purity: Ninety-one percent. Bio-structure classification: MODIFIED. Prosthetic integration stable. Health scan complete. Classification: PLASTIC_SURGERY.`,
    medicalFindings: {
      eyeColor: 'Hazel',
      hairColor: 'Blonde',
      hairDyed: false,
      surgeries: [
        { type: 'Facial reconstruction', date: '3183-12-18', status: 'RECENT' },
        { type: 'Amputation and prosthetic attachment', date: '3175-08-12', status: 'OLD' }
      ],
      anomalies: ['Recent facial reconstruction', 'Extensive cosmetic surgery history', 'Prosthetic limb']
    }
  },
  'S2-04': {
    subjectId: 'S2-04',
    script: `Health scan initiated. Subject ELENA ROSS. Baseline vitals acquired. Oxygen saturation stable. Scanning ophthalmic tissue. Eye color: Gray. Iris structure shows synthetic markers. Proceeding to dermal analysis. Hair color: Silver, natural aging pattern. No artificial dye detected. Scanning for surgical modifications. Surgical scar detected: Entire body, surgical date: 3182-07-30. Procedure type: Full body replacement. Status: Old, fully integrated. Warning: Extensive synthetic replacement detected. Proceeding to genetic analysis. Genetic purity: Twenty-three percent. Bio-structure classification: SYNTHETIC. Tissue compatibility: Non-human. Health scan complete. Classification: REPLICANT.`,
    medicalFindings: {
      eyeColor: 'Gray',
      hairColor: 'Silver',
      hairDyed: false,
      surgeries: [
        { type: 'Full body replacement', date: '3182-07-30', status: 'OLD' }
      ],
      anomalies: ['Extensive synthetic replacement', 'Low genetic purity', 'Replicant classification']
    }
  },
  'S3-01': {
    subjectId: 'S3-01',
    script: `Health scan initiated. Subject YUKI TANAKA. Baseline vitals acquired. Oxygen saturation stable. Scanning ophthalmic tissue. Eye color: Dark brown. Iris structure normal. Proceeding to dermal analysis. Hair color: Black, artificial dye detected. Dye composition: Temporary, organic-based. Estimated application: Five days ago. Scanning for surgical modifications. Surgical scar detected: Right arm, surgical date: 3184-02-10. Procedure type: Cybernetic arm replacement. Status: Recent, healing. Warning: Surgical modification detected within last seven days. Proceeding to genetic analysis. Genetic purity: Seventy-eight percent. Bio-structure classification: ENHANCED. Post-op inflammation risk elevated. Health scan complete. Classification: HUMAN_CYBORG.`,
    medicalFindings: {
      eyeColor: 'Dark brown',
      hairColor: 'Black (dyed)',
      hairDyed: true,
      surgeries: [
        { type: 'Cybernetic arm replacement', date: '3184-02-10', status: 'RECENT' }
      ],
      anomalies: ['Very recent cybernetic surgery', 'Recent hair dye', 'Suspicious timing']
    }
  },
  'S3-02': {
    subjectId: 'S3-02',
    script: `Health scan initiated. Subject KENJI TANAKA. Baseline vitals acquired. Oxygen saturation stable. Scanning ophthalmic tissue. Eye color: Brown. Iris structure normal. Proceeding to dermal analysis. Hair color: Black, natural pigmentation. No artificial dye detected. Scanning for surgical modifications. No surgical scars detected. No augmentation markers. Proceeding to genetic analysis. Genetic purity: Ninety-eight percent. Bio-structure classification: STANDARD. No anomalies detected. Health scan complete. Classification: HUMAN.`,
    medicalFindings: {
      eyeColor: 'Brown',
      hairColor: 'Black',
      hairDyed: false,
      surgeries: [],
      anomalies: ['Genetic relation to YUKI TANAKA', 'No modifications detected']
    }
  },
  'S3-03': {
    subjectId: 'S3-03',
    script: `Health scan initiated. Subject MARCUS STONE. Baseline vitals acquired. Oxygen saturation stable. Scanning ophthalmic tissue. Eye color: Blue. Iris structure shows enhancement markers. Proceeding to dermal analysis. Hair color: Brown, natural pigmentation. No artificial dye detected. Scanning for surgical modifications. Surgical scar detected: Left eye, surgical date: 3183-08-22. Procedure type: Optical enhancement. Status: Recent, fully integrated. Additional scar: Right leg, surgical date: 3176-03-15. Procedure type: Amputation and prosthetic attachment. Status: Old, integrated. Proceeding to genetic analysis. Genetic purity: Eighty-two percent. Bio-structure classification: ENHANCED. Prosthetic interface stable. Health scan complete. Classification: HUMAN_CYBORG.`,
    medicalFindings: {
      eyeColor: 'Blue (enhanced)',
      hairColor: 'Brown',
      hairDyed: false,
      surgeries: [
        { type: 'Optical enhancement', date: '3183-08-22', status: 'RECENT' },
        { type: 'Amputation and prosthetic attachment', date: '3176-03-15', status: 'OLD' }
      ],
      anomalies: ['Optical enhancement', 'Prosthetic limb', 'AMPUTEE classification']
    }
  },
  'S3-04': {
    subjectId: 'S3-04',
    script: `Health scan initiated. Subject NEXUS PRIME. Baseline vitals acquired. Oxygen saturation stable. Scanning ophthalmic tissue. Eye color: Gold. Iris structure shows advanced synthetic markers. Proceeding to dermal analysis. Hair color: Black, synthetic fiber detected. No natural pigmentation. Scanning for surgical modifications. No surgical scars detected. No organic tissue markers. Proceeding to genetic analysis. Genetic purity: Zero percent. Bio-structure classification: SYNTHETIC. Tissue compatibility: Non-human. Health scan complete. Classification: REPLICANT. Warning: Advanced synthetic entity detected. All biometric markers indicate non-human origin.`,
    medicalFindings: {
      eyeColor: 'Gold (synthetic)',
      hairColor: 'Black (synthetic)',
      hairDyed: false,
      surgeries: [],
      anomalies: ['Zero genetic purity', 'Advanced synthetic markers', 'Non-human origin', 'Gold iris anomaly']
    }
  }
};

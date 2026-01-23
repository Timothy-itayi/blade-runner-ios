import type { SubjectData, InterrogationTone } from '@/data/subjects';

export function generateDefaultResponse(
  subject: SubjectData,
  questionId: string,
  tone: InterrogationTone = 'firm'
): string {
  // Check if subject has a specific response for this question (optionally tone-tiered)
  const entry = subject.interrogationResponses?.responses?.[questionId];
  if (entry) {
    if (typeof entry === 'string') return entry;
    // Prefer requested tone, then sensible fallbacks.
    return entry[tone] || entry.firm || entry.soft || entry.harsh || "I don't have to answer that.";
  }

  // Scan-driven and evidence questions default to cooperative answers to keep play moving.
  if (questionId === 'identity-occupation') {
    const occupation = subject.dossier?.occupation?.toLowerCase();
    return occupation
      ? `That's right. I'm cleared for ${occupation} work.`
      : 'That role is accurate. My clearance is on file.';
  }
  if (questionId === 'identity-address') {
    const address = subject.dossier?.address;
    return address
      ? `Yes. The record shows ${address}.`
      : 'Yes. My origin sector is correct in the record.';
  }
  if (questionId === 'warrant') {
    return 'That warrant is outdated. I have a pending review on file.';
  }
  if (questionId === 'transit') {
    return 'Those routes are logged in the system. There is nothing irregular.';
  }
  if (questionId === 'incidents') {
    return 'I cooperated in those reports. No charges were filed.';
  }
  if (questionId === 'verification-warrant') {
    return 'That record is being disputed. I have a pending review on file.';
  }
  if (questionId === 'verification-transit') {
    return 'The route was handled by my carrier. I reported what I was given.';
  }
  if (questionId === 'verification-incident') {
    return 'That entry is being resolved. It does not affect my clearance.';
  }

  // Personality and communication style prompts should not hard-stop the flow.
  if (questionId === 'nervous-pressure') {
    return "I'm just tired. That's all.";
  }
  if (questionId === 'deceptive-catch') {
    return "Then the record is wrong. I'm telling you what I know.";
  }
  if (questionId === 'memory-test') {
    return `Routine shifts on ${subject.originPlanet}. Nothing unusual to report.`;
  }
  if (questionId === 'authority-challenge') {
    return 'Understood. I will comply with standard verification.';
  }
  if (questionId === 'emotional-probe') {
    return "I'm focused on getting through clearance. That's it.";
  }
  if (questionId === 'clarity-request') {
    return 'Here it is: I am here for clearance and transit.';
  }
  if (questionId === 'calm-down') {
    return "I'm calm. Ask your questions.";
  }
  if (questionId === 'force-response') {
    return 'Fine. I will answer.';
  }
  if (questionId === 'informal-probe') {
    return 'Officially it is work. Personally, it is family.';
  }

  // Fallback to default responses
  if (questionId === 'origin') {
    return `I'm here to access the depot. ${subject.reasonForVisit}`;
  }
  if (questionId === 'purpose') {
    return subject.reasonForVisit || 'I need clearance to enter the depot.';
  }
  if (questionId === 'duration') {
    return 'Long enough to get inside. I have clearance.';
  }
  if (questionId === 'background') {
    return subject.dossier?.occupation
      ? `I'm assigned as a ${subject.dossier.occupation.toLowerCase()}. That's all you need.`
      : "That's not relevant to the breach.";
  }
  if (questionId === 'previous') {
    return "Maybe. I don't remember. Why does it matter?";
  }

  // Bio scan questions should always have responses defined in subject data
  const neutralFallbacks: Record<InterrogationTone, string> = {
    soft: "I'm not sure that applies. Ask me something else.",
    firm: "I don't have anything to add beyond what's on record.",
    harsh: 'You have what you need in the file.',
  };
  return neutralFallbacks[tone] || neutralFallbacks.firm;
}

// Calculate BPM change for a question with behavioral tells
export function calculateQuestionBPM(
  baseBPM: number,
  questionId: string,
  questionNumber: number,
  subject: SubjectData
): number {
  let calculatedBPM = baseBPM;

  const bpmTells = subject.bpmTells;
  let tellModifier = 0;

  if (bpmTells) {
    if (bpmTells.baseElevation) {
      tellModifier += bpmTells.baseElevation;
    }

    // False negative: Good liar - BPM stays calm even when lying
    if (bpmTells.isGoodLiar && bpmTells.type === 'FALSE_NEGATIVE') {
      tellModifier -= 15;
    }

    // False positive: Genuinely stressed - elevated BPM is from stress, not deception
    if (bpmTells.isGenuinelyStressed && bpmTells.type === 'FALSE_POSITIVE') {
      tellModifier += 10;
    }

    // Contradiction: Claims calm but BPM elevated
    if (bpmTells.type === 'CONTRADICTION') {
      tellModifier += 20;
    }
  }

  // Questions cause BPM elevation
  const baseElevation = 5 + questionNumber * 5;
  const randomVariation = Math.floor(Math.random() * 10);
  const elevation = baseElevation + randomVariation;

  // Some questions are more stressful (bio scan related questions)
  const isStressfulQuestion =
    questionId.includes('synthetic') ||
    questionId.includes('replicant') ||
    questionId.includes('surgery') ||
    questionId.includes('fingerprint');
  if (isStressfulQuestion) {
    calculatedBPM += 10;
  }

  calculatedBPM += tellModifier;

  return Math.min(Math.max(calculatedBPM + elevation, 40), 150);
}


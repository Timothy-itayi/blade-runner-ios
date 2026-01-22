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

  // Fallback to default responses
  if (questionId === 'origin') {
    return `I need to get to Earth. ${subject.reasonForVisit}`;
  }
  if (questionId === 'purpose') {
    return subject.reasonForVisit;
  }
  if (questionId === 'duration') {
    return 'As long as necessary. I have valid documentation.';
  }
  if (questionId === 'background') {
    return subject.dossier?.occupation
      ? `I'm a ${subject.dossier.occupation.toLowerCase()}. That's all you need to know.`
      : "That's personal information.";
  }
  if (questionId === 'previous') {
    return "Maybe. I don't remember. Why does it matter?";
  }

  // Bio scan questions should always have responses defined in subject data
  return "I don't have to answer that.";
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


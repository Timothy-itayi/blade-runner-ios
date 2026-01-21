import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SubjectData } from '../../data/subjects';
import { HUDBox } from '../ui/HUDBox';
import { Theme } from '../../constants/theme';
import { BUILD_SEQUENCE } from '../../constants/animations';
import { TypewriterText } from '../ui/ScanData';

// Pre-defined questions that adapt to subject context
const QUESTION_TEMPLATES = [
  {
    id: 'origin',
    text: (subject: SubjectData) => `Why are you coming to Earth from ${subject.originPlanet}?`,
    requiresBioScan: false,
  },
  {
    id: 'purpose',
    text: (subject: SubjectData) => `What is your specific purpose for this visit?`,
    requiresBioScan: false,
  },
  {
    id: 'duration',
    text: (subject: SubjectData) => `How long do you plan to stay on Earth?`,
    requiresBioScan: false,
  },
  {
    id: 'background',
    text: (subject: SubjectData) => `Tell me about your background.`,
    requiresBioScan: false,
  },
  {
    id: 'previous',
    text: (subject: SubjectData) => `Have you been to Earth before?`,
    requiresBioScan: false,
  },
  // Bio scan-based questions (only available after bio scan)
  {
    id: 'surgery',
    text: (subject: SubjectData) => {
      const bioData = subject.bioScanData;
      if (bioData?.biologicalType === 'REPLICANT') {
        return `The scan shows synthetic markers. Can you explain this?`;
      }
      if (bioData?.augmentationLevel && bioData.augmentationLevel !== 'NONE') {
        return `The scan detected recent surgical modifications. What was the procedure for?`;
      }
      return `The scan shows surgical scars. Can you explain these?`;
    },
    requiresBioScan: true,
    bioScanTrigger: ['surgery', 'augmentation', 'synthetic'],
  },
  {
    id: 'hairDye',
    text: (subject: SubjectData) => {
      const bioData = subject.bioScanData;
      // This would need to be in bio scan data - for now use generic
      return `The scan detected artificial hair dye. Why did you dye your hair recently?`;
    },
    requiresBioScan: true,
    bioScanTrigger: ['hairDye', 'dye'],
  },
  {
    id: 'fingerprint',
    text: (subject: SubjectData) => {
      const bioData = subject.bioScanData;
      if (bioData?.fingerprintType === 'REPLICANT') {
        return `Your fingerprints don't match standard human patterns. Can you explain?`;
      }
      if (!subject.biometricData.fingerprintMatch) {
        return `The scan shows your fingerprints have been modified. When and why?`;
      }
      return `The scan shows fingerprint anomalies. Can you explain this?`;
    },
    requiresBioScan: true,
    bioScanTrigger: ['fingerprint', 'replicant'],
  },
  {
    id: 'cybernetic',
    text: (subject: SubjectData) => {
      const bioData = subject.bioScanData;
      if (bioData?.biologicalType === 'HUMAN_CYBORG') {
        return `The scan detected cybernetic augmentations. What modifications have you undergone?`;
      }
      return `The scan shows augmentation markers. Can you explain these?`;
    },
    requiresBioScan: true,
    bioScanTrigger: ['cybernetic', 'augmentation', 'cyborg'],
  },
  {
    id: 'recent',
    text: (subject: SubjectData) => {
      return `The scan shows very recent surgical modifications. Why did you have surgery so recently?`;
    },
    requiresBioScan: true,
    bioScanTrigger: ['recent', 'surgery'],
  },
  {
    id: 'synthetic',
    text: (subject: SubjectData) => {
      return `The scan indicates synthetic biological markers. Can you explain your biological status?`;
    },
    requiresBioScan: true,
    bioScanTrigger: ['synthetic', 'replicant'],
  },
  {
    id: 'family',
    text: (subject: SubjectData) => {
      return `The scan shows genetic markers matching another processed subject. Are you related?`;
    },
    requiresBioScan: true,
    bioScanTrigger: ['family', 'genetic'],
  },
  {
    id: 'facial',
    text: (subject: SubjectData) => {
      return `The scan detected extensive facial reconstruction surgery. What happened?`;
    },
    requiresBioScan: true,
    bioScanTrigger: ['facial', 'reconstruction'],
  },
  {
    id: 'retinal',
    text: (subject: SubjectData) => {
      return `The scan shows retinal enhancement markers. Why do you have enhanced vision?`;
    },
    requiresBioScan: true,
    bioScanTrigger: ['retinal', 'enhancement'],
  },
  {
    id: 'amputee',
    text: (subject: SubjectData) => {
      return `The scan detected a prosthetic limb. How did you lose your limb?`;
    },
    requiresBioScan: true,
    bioScanTrigger: ['amputee', 'prosthetic'],
  },
  {
    id: 'gold',
    text: (subject: SubjectData) => {
      return `The scan shows unusual gold-colored irises. Can you explain this anomaly?`;
    },
    requiresBioScan: true,
    bioScanTrigger: ['gold', 'iris'],
  },
];

// Phase 5: Ambiguous biometric condition type
interface AmbiguousConditionDisplay {
  medicalExplanation: string;
  suspiciousExplanation: string;
}

export const IntelPanel = ({ 
  data, 
  hudStage, 
  onRevealVerify,
  onOpenDossier,
  onInterrogate,
  hasDecision,
  decisionType,
  ambiguousCondition,
  biometricsRevealed,
  dossierRevealed = false,
  resourcesRemaining = 0,
  subjectResponse = '',
  onResponseUpdate,
}: { 
  data: SubjectData, 
  hudStage: 'none' | 'wireframe' | 'outline' | 'full',
  onRevealVerify: () => void,
  onOpenDossier?: () => void,
  onInterrogate?: () => void,
  hasDecision?: boolean,
  decisionType?: 'APPROVE' | 'DENY',
  ambiguousCondition?: AmbiguousConditionDisplay | null,
  biometricsRevealed?: boolean,
  dossierRevealed?: boolean,
  resourcesRemaining?: number,
  subjectResponse?: string,
  onResponseUpdate?: (response: string) => void,
}) => {
  const [questionsAsked, setQuestionsAsked] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentQuestionText, setCurrentQuestionText] = useState<string>('');

  // Reset when subject changes
  React.useEffect(() => {
    setQuestionsAsked([]);
    setCurrentQuestionIndex(0);
    setCurrentQuestionText('');
  }, [data.id]);

  // Verification button only active for non-clean subjects
  const isCleanSubject = data.archetype === 'CLN';
  const verificationDisabled = isCleanSubject || hudStage !== 'full';
  
  // Interrogate is always available (free, 3 questions max)
  const canInterrogate = hudStage === 'full' && questionsAsked.length < 3;

  // Generate available questions based on bio scan status
  const bioScanRevealed = dossierRevealed; // Bio scan reveals dossier, so if dossier is revealed, bio scan was done
  const availableQuestions = QUESTION_TEMPLATES.filter(q => {
    if (questionsAsked.includes(q.id)) return false;
    // If question requires bio scan, only show if bio scan was performed
    if (q.requiresBioScan && !bioScanRevealed) return false;
    return true;
  });
  
  // Prioritize bio scan questions if available (they're more relevant)
  const prioritizedQuestions = [
    ...availableQuestions.filter(q => q.requiresBioScan),
    ...availableQuestions.filter(q => !q.requiresBioScan)
  ];
  
  const currentQuestion = prioritizedQuestions[currentQuestionIndex] || prioritizedQuestions[0];

  const handleAskQuestion = () => {
    if (questionsAsked.length >= 3 || !currentQuestion) return;
    
    const questionId = currentQuestion.id;
    const questionText = currentQuestion.text(data);
    setQuestionsAsked(prev => [...prev, questionId]);
    setCurrentQuestionText(questionText);

    // Get subject's response
    const response = data.interrogationResponses?.responses[questionId] || 
                     generateDefaultResponse(data, questionId);
    
    // Clear previous response first, then set new one (triggers typewriter)
    onResponseUpdate?.('');
    setTimeout(() => {
      onResponseUpdate?.(response);
    }, 50);

    // Cycle to next available question
    if (prioritizedQuestions.length > 1) {
      const remainingQuestions = prioritizedQuestions.filter(q => q.id !== questionId);
      const nextIndex = remainingQuestions.length > 0 ? 0 : 0;
      setCurrentQuestionIndex(nextIndex);
    }
  };

  const generateDefaultResponse = (subject: SubjectData, questionId: string): string => {
    // Check if subject has a specific response for this question
    if (subject.interrogationResponses?.responses[questionId]) {
      return subject.interrogationResponses.responses[questionId];
    }
    
    // Fallback to default responses
    if (questionId === 'origin') {
      return `I need to get to Earth. ${subject.reasonForVisit}`;
    }
    if (questionId === 'purpose') {
      return subject.reasonForVisit;
    }
    if (questionId === 'duration') {
      return "As long as necessary. I have valid documentation.";
    }
    if (questionId === 'background') {
      return subject.dossier?.occupation ? 
        `I'm a ${subject.dossier.occupation.toLowerCase()}. That's all you need to know.` :
        "That's personal information.";
    }
    if (questionId === 'previous') {
      return "Maybe. I don't remember. Why does it matter?";
    }
    // Bio scan questions should always have responses defined in subject data
    return "I don't have to answer that.";
  };

  return (
    <HUDBox hudStage={hudStage} style={styles.container} buildDelay={BUILD_SEQUENCE.subjectIntel}>
      {/* Three Action Buttons */}
      <View style={styles.mainRow}>
        <TouchableOpacity 
          style={[
            styles.actionButton,
            styles.verifyButton,
            verificationDisabled && styles.actionButtonDisabled
          ]} 
          onPress={onRevealVerify}
          disabled={verificationDisabled}
        >
          <Text style={[
            styles.actionButtonText,
            styles.verifyButtonText,
            verificationDisabled && styles.actionButtonTextDisabled
          ]}>VERIFICATION</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.actionButton,
            styles.dossierButton,
            (hudStage !== 'full' || !dossierRevealed) && styles.actionButtonDisabled
          ]} 
          onPress={onOpenDossier}
          disabled={hudStage !== 'full' || !dossierRevealed}
        >
          <Text style={[
            styles.actionButtonText,
            styles.dossierButtonText,
            (hudStage !== 'full' || !dossierRevealed) && styles.actionButtonTextDisabled
          ]}>DOSSIER</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.actionButton,
            styles.interrogateButton,
            !canInterrogate && styles.actionButtonDisabled
          ]} 
          onPress={handleAskQuestion}
          disabled={!canInterrogate}
        >
          <Text style={[
            styles.actionButtonText,
            styles.interrogateButtonText,
            !canInterrogate && styles.actionButtonTextDisabled
          ]}>
            INTERROGATE
          </Text>
        </TouchableOpacity>
      </View>

      {/* Question and Response */}
      <View style={styles.responseBox}>
        {currentQuestionText && (
          <View style={styles.qaRow}>
            <Text style={styles.qaLabel}>Q:</Text>
            <Text style={styles.questionText}>{currentQuestionText}</Text>
          </View>
        )}
        {subjectResponse ? (
          <View style={styles.qaRow}>
            <Text style={styles.qaLabel}>A:</Text>
            <TypewriterText 
              text={subjectResponse}
              active={!!subjectResponse}
              delay={0}
              style={styles.responseText}
              showCursor={true}
            />
          </View>
        ) : (
          !currentQuestionText && <Text style={styles.responsePlaceholderText}>_</Text>
        )}
      </View>
    </HUDBox>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
    minHeight: 220, // Increased height to accommodate question and response
    flex: 1, // Utilize available space
  },
  mainRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  actionButton: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifyButton: {
    borderColor: Theme.colors.accentWarn,
    backgroundColor: 'rgba(201, 162, 39, 0.1)',
  },
  dossierButton: {
    borderColor: Theme.colors.textSecondary,
    backgroundColor: 'rgba(127, 184, 216, 0.1)',
  },
  interrogateButton: {
    borderColor: Theme.colors.accentApprove,
    backgroundColor: 'rgba(74, 138, 90, 0.1)',
  },
  actionButtonDisabled: {
    opacity: 0.3,
    borderColor: Theme.colors.textDim,
  },
  actionButtonText: {
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
  },
  verifyButtonText: {
    color: Theme.colors.accentWarn,
  },
  dossierButtonText: {
    color: Theme.colors.textSecondary,
  },
  interrogateButtonText: {
    color: Theme.colors.accentApprove,
  },
  actionButtonTextDisabled: {
    color: Theme.colors.textDim,
  },
  responseBox: {
    backgroundColor: 'rgba(26, 42, 58, 0.5)',
    borderWidth: 1,
    borderColor: Theme.colors.border,
    padding: 14,
    minHeight: 120,
    marginTop: 8,
    gap: 10,
  },
  qaRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  qaLabel: {
    color: Theme.colors.textPrimary,
    fontFamily: Theme.fonts.mono,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    minWidth: 20,
  },
  questionText: {
    color: Theme.colors.textPrimary, // Blue (textPrimary is blue)
    fontFamily: Theme.fonts.mono,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    flex: 1,
  },
  responseText: {
    color: Theme.colors.accentApprove, // Green
    fontFamily: Theme.fonts.mono,
    fontSize: 11,
    lineHeight: 16,
    fontStyle: 'italic',
    flex: 1,
  },
  responsePlaceholderText: {
    color: Theme.colors.textDim,
    fontFamily: Theme.fonts.mono,
    fontSize: 11,
    opacity: 0.3,
  },
});

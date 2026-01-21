import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SubjectData } from '../../data/subjects';
import { HUDBox } from '../ui/HUDBox';
import { Theme } from '../../constants/theme';
import { BUILD_SEQUENCE } from '../../constants/animations';

interface InterrogationPanelProps {
  subject: SubjectData;
  onClose: () => void;
  onQuestionAsked?: (question: string, response: string) => void;
  onResponseUpdate?: (response: string) => void;
}

// Pre-defined questions that adapt to subject context
const QUESTION_TEMPLATES = [
  {
    id: 'origin',
    text: (subject: SubjectData) => `Why are you coming to Earth from ${subject.originPlanet}?`,
  },
  {
    id: 'purpose',
    text: (subject: SubjectData) => `What is your specific purpose for this visit?`,
  },
  {
    id: 'duration',
    text: (subject: SubjectData) => `How long do you plan to stay on Earth?`,
  },
  {
    id: 'background',
    text: (subject: SubjectData) => `Tell me about your background.`,
  },
  {
    id: 'previous',
    text: (subject: SubjectData) => `Have you been to Earth before?`,
  },
];

export const InterrogationPanel = ({ subject, onClose, onQuestionAsked, onResponseUpdate }: InterrogationPanelProps) => {
  const [questionsAsked, setQuestionsAsked] = useState<string[]>([]);
  const [currentResponse, setCurrentResponse] = useState<string>('');
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);

  const availableQuestions = QUESTION_TEMPLATES.filter(q => !questionsAsked.includes(q.id));

  const handleAskQuestion = (questionId: string) => {
    if (questionsAsked.length >= 3) return; // Max 3 questions
    
    const questionTemplate = QUESTION_TEMPLATES.find(q => q.id === questionId);
    if (!questionTemplate) return;

    const questionText = questionTemplate.text(subject);
    setSelectedQuestion(questionId);
    setQuestionsAsked(prev => [...prev, questionId]);

    // Get subject's response based on character brief and dossier anomalies
    let response = subject.interrogationResponses?.responses[questionId] || 
                   generateDefaultResponse(subject, questionId);
    
    setCurrentResponse(response);
    onQuestionAsked?.(questionText, response);
    onResponseUpdate?.(response);
  };

  const generateDefaultResponse = (subject: SubjectData, questionId: string): string => {
    // Generate contextual response based on subject data
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
    return "I don't have to answer that.";
  };

  return (
    <View style={styles.overlay}>
      <HUDBox hudStage="full" style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>INTERROGATION</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>[ CLOSE ]</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Subject Response Box */}
          {currentResponse ? (
            <View style={styles.responseBox}>
              <Text style={styles.responseText}>"{currentResponse}"</Text>
            </View>
          ) : (
            <View style={styles.responseBoxPlaceholder}>
              <Text style={styles.placeholderText}>Select a question to begin</Text>
            </View>
          )}

          {/* Available Questions */}
          <View style={styles.questionsSection}>
            <Text style={styles.remainingText}>
              {3 - questionsAsked.length} QUESTIONS REMAINING
            </Text>
            {availableQuestions.map((q) => (
              <TouchableOpacity
                key={q.id}
                style={[
                  styles.questionButton,
                  questionsAsked.length >= 3 && styles.questionButtonDisabled
                ]}
                onPress={() => handleAskQuestion(q.id)}
                disabled={questionsAsked.length >= 3}
              >
                <Text style={styles.questionText}>{q.text(subject)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </HUDBox>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 12, 15, 0.95)',
    zIndex: 2000,
    padding: 20,
    justifyContent: 'center',
  },
  container: {
    padding: 20,
    backgroundColor: Theme.colors.bgPanel,
    maxHeight: '75%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  headerTitle: {
    color: Theme.colors.textPrimary,
    fontFamily: Theme.fonts.mono,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 2,
  },
  closeButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  closeButtonText: {
    color: Theme.colors.textSecondary,
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
  },
  content: {
    gap: 16,
  },
  responseBox: {
    backgroundColor: 'rgba(74, 138, 90, 0.15)',
    borderWidth: 1,
    borderColor: Theme.colors.accentApprove,
    padding: 16,
    minHeight: 100,
    justifyContent: 'center',
  },
  responseBoxPlaceholder: {
    backgroundColor: 'rgba(26, 42, 58, 0.3)',
    borderWidth: 1,
    borderColor: Theme.colors.border,
    padding: 16,
    minHeight: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  responseText: {
    color: Theme.colors.textPrimary,
    fontFamily: Theme.fonts.mono,
    fontSize: 13,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  placeholderText: {
    color: Theme.colors.textDim,
    fontFamily: Theme.fonts.mono,
    fontSize: 11,
    opacity: 0.5,
  },
  questionsSection: {
    gap: 10,
  },
  remainingText: {
    color: Theme.colors.textDim,
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    letterSpacing: 1,
    marginBottom: 8,
  },
  questionButton: {
    backgroundColor: 'rgba(26, 42, 58, 0.5)',
    borderWidth: 1,
    borderColor: Theme.colors.border,
    padding: 14,
  },
  questionButtonDisabled: {
    opacity: 0.3,
  },
  questionText: {
    color: Theme.colors.textPrimary,
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
    lineHeight: 18,
  },
});

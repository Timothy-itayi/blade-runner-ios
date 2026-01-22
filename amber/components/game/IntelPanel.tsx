import React, { useState, useMemo, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated, PanResponder } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import { SubjectData } from '../../data/subjects';
import { HUDBox } from '../ui/HUDBox';
import { Theme } from '../../constants/theme';
import { BUILD_SEQUENCE } from '../../constants/animations';
import { GatheredInformation } from '../../types/information';
import { generateDynamicQuestions } from '../../utils/questionGeneration';
import { createPressureHold, createSwipeReveal } from '../../utils/gestures';
// Phase 4: Subject interaction imports
import { getSubjectGreeting, CommunicationStyle, COMMUNICATION_STYLE_DESCRIPTIONS } from '../../data/subjectGreetings';
import { getSubjectCredentials, getCredentialTypeName, getExpirationStatus } from '../../data/credentialTypes';

// Phase 4: Interaction phase type
type InteractionPhase = 'greeting' | 'credentials' | 'investigation';

// Phase 3: Carousel mode type
type PanelMode = 'verification' | 'dossier' | 'interrogation';

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
  gatheredInformation, // Phase 2: Information gathered for dynamic questions
  onBPMChange, // Phase 2: Callback when BPM changes during interrogation
  onInformationUpdate, // Phase 2: Update gathered information
  // Phase 4: Subject interaction props
  interactionPhase = 'greeting',
  onGreetingComplete,
  onCredentialsComplete,
  onEstablishBPM,
  greetingDisplayed = false,
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
  gatheredInformation?: GatheredInformation,
  onBPMChange?: (bpm: number) => void, // Phase 2: Callback when BPM changes during interrogation
  onInformationUpdate?: (info: Partial<GatheredInformation>) => void, // Phase 2: Update gathered information
  // Phase 4: Subject interaction props
  interactionPhase?: InteractionPhase,
  onGreetingComplete?: () => void,
  onCredentialsComplete?: (hasAnomalies: boolean) => void,
  onEstablishBPM?: (bpm: number) => void,
  greetingDisplayed?: boolean,
}) => {
  const [questionsAsked, setQuestionsAsked] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentQuestionText, setCurrentQuestionText] = useState<string>('');

  // Phase 3: Layout tracking for slider
  const [panelWidth, setPanelWidth] = useState(0);
  const handleLayout = (event: any) => {
    const { width } = event.nativeEvent.layout;
    if (width > 0) setPanelWidth(width);
  };

  // Phase 4: Greeting and credential state
  const greetingData = getSubjectGreeting(data.id, data);
  const credentialData = getSubjectCredentials(data.id, data);

  // Reset when subject changes
  useEffect(() => {
    setQuestionsAsked([]);
    setCurrentQuestionIndex(0);
    setCurrentQuestionText('');
  }, [data.id]);

  // Phase 4: Establish BPM baseline when greeting is complete
  useEffect(() => {
    if (interactionPhase === 'greeting' && greetingDisplayed && greetingData) {
      const baseBPM = 72;
      const greetingModifier = greetingData.bpmBaselineModifier || 0;
      const tellsModifier = data.bpmTells?.baseElevation || 0;
      const establishedBPM = baseBPM + greetingModifier + Math.floor(tellsModifier * 0.5);
      onEstablishBPM?.(establishedBPM);
    }
  }, [greetingDisplayed, interactionPhase]);

  // Phase 2: Generate dynamic questions based on gathered information
  const defaultInfo: GatheredInformation = {
    basicScan: true,
    identityScan: false,
    healthScan: false,
    warrantCheck: false,
    transitLog: false,
    incidentHistory: false,
    interrogation: { questionsAsked: 0, responses: [], bpmChanges: [] },
    equipmentFailures: [],
    bpmDataAvailable: true,
    eyeScannerActive: false,
    timestamps: {},
  };
  
  const info = gatheredInformation || defaultInfo;
  const dynamicQuestions = useMemo(() => {
    return generateDynamicQuestions(data, info);
  }, [data.id, info.identityScan, info.healthScan, info.warrantCheck, info.transitLog, info.incidentHistory]);
  
  // Filter out already asked questions
  const availableQuestions = dynamicQuestions.filter(q => !questionsAsked.includes(q.id));
  const currentQuestion = availableQuestions[currentQuestionIndex] || availableQuestions[0];

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

  // Phase 3: Calculate BPM change for a question with behavioral tells
  const calculateQuestionBPM = (baseBPM: number, questionId: string, questionNumber: number, subject: SubjectData): number => {
    // Base BPM from subject
    let calculatedBPM = baseBPM;
    
    // Phase 3: Apply BPM tell modifiers
    const bpmTells = subject.bpmTells;
    let tellModifier = 0;
    
    if (bpmTells) {
      // Base elevation from tell type
      if (bpmTells.baseElevation) {
        tellModifier += bpmTells.baseElevation;
      }
      
      // False negative: Good liar - BPM stays calm even when lying
      if (bpmTells.isGoodLiar && bpmTells.type === 'FALSE_NEGATIVE') {
        // Reduce elevation significantly for good liars
        tellModifier -= 15;
      }
      
      // False positive: Genuinely stressed - elevated BPM is from stress, not deception
      if (bpmTells.isGenuinelyStressed && bpmTells.type === 'FALSE_POSITIVE') {
        // Add elevation for genuine stress
        tellModifier += 10;
      }
      
      // Contradiction: Claims calm but BPM elevated
      if (bpmTells.type === 'CONTRADICTION') {
        // Significant elevation to show contradiction
        tellModifier += 20;
      }
    }
    
    // Questions cause BPM elevation
    // First question: +5-15 BPM
    // Second question: +10-25 BPM  
    // Third question: +15-35 BPM
    const baseElevation = 5 + (questionNumber * 5);
    const randomVariation = Math.floor(Math.random() * 10);
    const elevation = baseElevation + randomVariation;
    
    // Some questions are more stressful (bio scan related questions)
    const isStressfulQuestion = questionId.includes('synthetic') || 
                                 questionId.includes('replicant') || 
                                 questionId.includes('surgery') ||
                                 questionId.includes('fingerprint');
    if (isStressfulQuestion) {
      calculatedBPM += 10; // Additional elevation for stressful questions
    }
    
    // Apply tell modifier
    calculatedBPM += tellModifier;
    
    return Math.min(Math.max(calculatedBPM + elevation, 40), 150); // Cap between 40-150 BPM
  };

  const handleAskQuestion = () => {
    if (questionsAsked.length >= 3 || !currentQuestion) return;
    
    const questionId = currentQuestion.id;
    const questionText = currentQuestion.text(data);
    const questionNumber = questionsAsked.length + 1;
    
    setQuestionsAsked(prev => [...prev, questionId]);
    setCurrentQuestionText(questionText);

    // Get subject's response
    const response = data.interrogationResponses?.responses[questionId] || 
                     generateDefaultResponse(data, questionId);
    
    // Phase 3: Calculate and track BPM change with behavioral tells
    const baseBPM = typeof data.bpm === 'string' ? 
      (parseInt(data.bpm.match(/\d+/)?.[0] || '78') || 78) : 
      (data.bpm || 78);
    
    const questionBPM = calculateQuestionBPM(baseBPM, questionId, questionNumber, data);
    
    // Update BPM in real-time
    onBPMChange?.(questionBPM);
    
    // Update gathered information
    onInformationUpdate?.({
      interrogation: {
        questionsAsked: questionNumber,
        responses: [...(info.interrogation.responses || []), response],
        bpmChanges: [...(info.interrogation.bpmChanges || []), questionBPM],
      },
      timestamps: {
        ...info.timestamps,
        interrogation: [...(info.timestamps.interrogation || []), Date.now()],
      },
    });
    
    // Clear previous response first, then set new one (triggers typewriter)
    onResponseUpdate?.('');
    setTimeout(() => {
      onResponseUpdate?.(response);
    }, 50);

    // Cycle to next available question
    const remainingQuestions = availableQuestions.filter(q => q.id !== questionId);
    if (remainingQuestions.length > 0) {
      setCurrentQuestionIndex(0);
    }
  };

  // Verification button only active when HUD is full
  // Note: Clean subject check removed - verification available for all subjects
  const verificationDisabled = hudStage !== 'full';

  // Phase 3: Verification drawer swipe state
  const [verificationDrawerProgress, setVerificationDrawerProgress] = useState(0);
  const verificationDrawerOffset = useRef(new Animated.Value(0)).current;

  // Phase 3: Verification swipe-down gesture
  const verificationSwipeGesture = useMemo(() => {
    if (interactionPhase !== 'investigation' || verificationDisabled) return null;
    
    return createSwipeReveal(
      'down',
      {
        onStart: () => {
          verificationDrawerOffset.setValue(0);
        },
        onUpdate: (progress: number) => {
          setVerificationDrawerProgress(progress);
          // Add resistance - progress slows down as it approaches threshold
          const resistanceProgress = progress < 0.7 ? progress : 0.7 + (progress - 0.7) * 0.3;
          verificationDrawerOffset.setValue(resistanceProgress * 50); // Max 50px visual feedback
        },
        onComplete: () => {
          onRevealVerify();
          Animated.spring(verificationDrawerOffset, {
            toValue: 0,
            useNativeDriver: true,
            tension: 50,
            friction: 7,
          }).start(() => {
            setVerificationDrawerProgress(0);
          });
        },
        onCancel: () => {
          Animated.spring(verificationDrawerOffset, {
            toValue: 0,
            useNativeDriver: true,
            tension: 50,
            friction: 7,
          }).start(() => {
            setVerificationDrawerProgress(0);
          });
        },
      },
      150, // Higher threshold for resistance feel
      500, // Velocity threshold
      false // haptic disabled
    );
  }, [interactionPhase, verificationDisabled, onRevealVerify]);

  // Interrogate is always available (free, 3 questions max)
  const canInterrogate = hudStage === 'full' && questionsAsked.length < 3;

  // Phase 4: Interrogation pressure hold state
  const [interrogationProgress, setInterrogationProgress] = useState(0);
  const interrogationHoldGesture = useMemo(() => {
    if (interactionPhase !== 'investigation' || !canInterrogate) return null;

    return createPressureHold(
      {
        onStart: () => {
          setInterrogationProgress(0);
        },
        onComplete: (finalPressure: number) => {
          if (finalPressure >= 0.5) {
            handleAskQuestion();
          }
          setInterrogationProgress(0);
        },
        onCancel: () => {
          setInterrogationProgress(0);
        },
      },
      1500, // 1.5s for full hold
      200,  // 200ms min duration
      false  // haptic disabled
    );
  }, [interactionPhase, canInterrogate, handleAskQuestion]);

  // Phase 4: Handle Request Credentials button
  const handleRequestCredentials = () => {
    onGreetingComplete?.();
  };

  // Phase 4: Handle Proceed to Investigation button
  const handleProceedToInvestigation = () => {
    const hasAnomalies = credentialData?.credentials.some(c => c.anomalies.length > 0) || false;
    onCredentialsComplete?.(hasAnomalies);
  };

  // Phase 3: Credentials swipe state
  const [credentialsDrawerProgress, setCredentialsDrawerProgress] = useState(0);
  const credentialsDrawerOffset = useRef(new Animated.Value(0)).current;

  // Phase 3: Credentials ratchet swipe (PanResponder)
  // We avoid GestureDetector here because we are seeing device-only native crashes on swipe.
  const credentialsGateRef = useRef(0);
  const credentialsPanResponder = useMemo(() => {
    const NUM_GATES = 8;
    const HANDLE_WIDTH = 60;

    const snapToGate = (gateIndex: number) => {
      const maxTranslate = Math.max(0, panelWidth - HANDLE_WIDTH);
      const gateProgress = gateIndex / NUM_GATES;
      setCredentialsDrawerProgress(gateProgress);
      Animated.spring(credentialsDrawerOffset, {
        toValue: gateProgress * maxTranslate,
        useNativeDriver: true,
        tension: 140,
        friction: 14,
      }).start();
    };

    const reset = () => {
      credentialsGateRef.current = 0;
      setCredentialsDrawerProgress(0);
      Animated.spring(credentialsDrawerOffset, {
        toValue: 0,
        useNativeDriver: true,
        tension: 70,
        friction: 10,
      }).start();
    };

    return PanResponder.create({
      onStartShouldSetPanResponder: () => interactionPhase === 'greeting' && !!greetingDisplayed,
      onMoveShouldSetPanResponder: (_evt, gestureState) => {
        if (interactionPhase !== 'greeting' || !greetingDisplayed) return false;
        // Only capture if it's a horizontal intent.
        return Math.abs(gestureState.dx) > 8 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
      },
      onPanResponderGrant: () => {
        credentialsGateRef.current = 0;
      },
      onPanResponderMove: (_evt, gestureState) => {
        if (interactionPhase !== 'greeting' || !greetingDisplayed) return;
        const maxTranslate = Math.max(0, panelWidth - HANDLE_WIDTH);
        if (maxTranslate <= 0) return;

        const dx = Math.max(0, Math.min(maxTranslate, gestureState.dx));
        const rawProgress = dx / maxTranslate; // 0..1
        const gateIndex = Math.max(0, Math.min(NUM_GATES, Math.floor(rawProgress * NUM_GATES + 1e-6)));

        if (gateIndex !== credentialsGateRef.current) {
          credentialsGateRef.current = gateIndex;
          snapToGate(gateIndex);
        }
      },
      onPanResponderRelease: () => {
        if (interactionPhase !== 'greeting' || !greetingDisplayed) return reset();

        // Release behavior: only commit if they release at the final gate.
        if (credentialsGateRef.current >= NUM_GATES) {
          handleRequestCredentials();
        }
        reset();
      },
      onPanResponderTerminate: () => {
        reset();
      },
      onPanResponderTerminationRequest: () => true,
    });
  }, [interactionPhase, greetingDisplayed, panelWidth]);

  // Phase 4: Render greeting phase content
  const renderGreetingPhase = () => {
    const content = (
      <View collapsable={false} style={{ flex: 1 }}>
        {/* Hierarchy: Section Title */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>CREDENTIAL PROTOCOL</Text>
        </View>

        {/* Greeting Phase - Slider Area */}
        <View style={styles.mainRow}>
          <View 
            style={[styles.credentialSwipeArea, styles.sliderTrack]}
            onLayout={handleLayout}
          >
            {/* Gate Indicators */}
            <View style={styles.gateContainer}>
              {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                <View 
                  key={i} 
                  style={[
                    styles.gateMark, 
                    credentialsDrawerProgress >= (i / 8) && styles.gateMarkActive
                  ]} 
                >
                  <Text style={[
                    styles.gateIcon,
                    credentialsDrawerProgress >= (i / 8) && styles.gateIconActive
                  ]}>▮</Text>
                </View>
              ))}
            </View>

            <Animated.View
              style={[
                styles.credentialDrawerHandle,
                styles.sliderHandle,
                {
                  transform: [{ translateX: credentialsDrawerOffset }],
                  opacity: greetingDisplayed ? 1 : 0.3,
                },
              ]}
            >
              <Text style={styles.sliderHandleText}>
                {greetingDisplayed ? 'VERIFY' : '----'}
              </Text>
            </Animated.View>
        
          </View>
        </View>
      </View>
    );

    return (
      <View {...credentialsPanResponder.panHandlers}>
        {content}
      </View>
    );
  };

  // Phase 4: Render credentials phase content
  const renderCredentialsPhase = () => {
    const credentials = credentialData?.credentials || [];
    const behavior = greetingData?.credentialBehavior || 'COOPERATIVE';

    return (
      <>
        {/* Credentials Phase Button */}
        <View style={styles.mainRow}>
          <TouchableOpacity
            style={[styles.actionButton, styles.interrogateButton, { flex: 1 }]}
            onPress={handleProceedToInvestigation}
          >
            <Text style={[styles.actionButtonText, styles.interrogateButtonText]}>
              PROCEED
            </Text>
          </TouchableOpacity>
        </View>

        {/* Credentials Response Box */}
        <View style={styles.responseBox}>
          <ScrollView style={{ maxHeight: 100 }} showsVerticalScrollIndicator={false}>
            {credentials.length === 0 || behavior === 'NONE' ? (
              <Text style={styles.credentialWarning}>NO CREDENTIALS PRESENTED</Text>
            ) : (
              credentials.map((cred, index) => {
                const expirationStatus = getExpirationStatus(cred.expirationDate);
                const statusColor = expirationStatus === 'VALID' 
                  ? Theme.colors.accentApprove 
                  : expirationStatus === 'EXPIRED' 
                  ? Theme.colors.accentDeny 
                  : Theme.colors.accentWarn;
                
                return (
                  <View key={index} style={styles.credentialItem}>
                    <View style={styles.credentialHeader}>
                      <Text style={styles.credentialType}>
                        {getCredentialTypeName(cred.type)}
                      </Text>
                      {cred.anomalies.length > 0 && (
                        <Text style={styles.anomalyBadge}>!</Text>
                      )}
                    </View>
                    <Text style={styles.credentialNumber}>{cred.number}</Text>
                    <Text style={styles.credentialDetail}>HOLDER: {cred.holderName}</Text>
                    <Text style={styles.credentialDetail}>PURPOSE: {cred.purpose}</Text>
                    <View style={styles.credentialExpirationRow}>
                      <Text style={styles.credentialDetail}>
                        EXPIRES: {cred.expirationDate} (
                      </Text>
                      <Text style={[styles.credentialDetail, { color: statusColor }]}>
                        {expirationStatus}
                      </Text>
                      <Text style={styles.credentialDetail}>)</Text>
                    </View>
                    {cred.anomalies.length > 0 && (
                      <Text style={styles.anomalyText}>
                        FLAGS: {cred.anomalies.join(', ')}
                      </Text>
                    )}
                  </View>
                );
              })
            )}
          </ScrollView>
        </View>
      </>
    );
  };

  // Phase 4: Render investigation phase with three distinct sections
  const renderInvestigationPhase = () => {
    return (
      <View style={styles.investigationContainer}>
        <View style={styles.sectionsRow}>
          {/* Section 1: Verification - Swipe down to open drawer */}
          <View style={styles.investigationSection}>
            <Text style={styles.sectionLabel}>VERIFICATION</Text>
            {verificationSwipeGesture ? (
              <GestureDetector gesture={verificationSwipeGesture}>
                <View collapsable={false} style={styles.gestureTarget}>
                  <Animated.View
                    style={[
                      styles.actionButton,
                      styles.verifyButton,
                      verificationDisabled && styles.actionButtonDisabled,
                      {
                        transform: [{ translateY: verificationDrawerOffset }],
                      },
                    ]}
                  >
                    <Text style={[
                      styles.actionButtonText,
                      styles.verifyButtonText,
                      verificationDisabled && styles.actionButtonTextDisabled
                    ]}>
                      {verificationDrawerProgress > 0 ? '↓ SWIPE' : 'DRAWER'}
                    </Text>
                    {verificationDrawerProgress > 0 && (
                      <View style={[styles.drawerProgressBar, { width: `${verificationDrawerProgress * 100}%` }]} />
                    )}
                  </Animated.View>
                </View>
              </GestureDetector>
            ) : (
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
                ]}>VERIFY</Text>
              </TouchableOpacity>
            )}
            <Text style={styles.sectionHint}>↓ Swipe Down</Text>
          </View>

          {/* Section 2: Dossier - Tap to view */}
          <View style={styles.investigationSection}>
            <Text style={styles.sectionLabel}>DOSSIER</Text>
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
              ]}>FILE</Text>
            </TouchableOpacity>
            <Text style={styles.sectionHint}>Tap to Open</Text>
          </View>

          {/* Section 3: Interrogation - Pressure hold */}
          <View style={styles.investigationSection}>
            <Text style={styles.sectionLabel}>INTERROGATE</Text>
            {interrogationHoldGesture ? (
              <GestureDetector gesture={interrogationHoldGesture}>
                <View collapsable={false} style={styles.gestureTarget}>
                  <View
                    style={[
                      styles.actionButton,
                      styles.interrogateButton,
                      !canInterrogate && styles.actionButtonDisabled
                    ]}
                  >
                    <Text style={[
                      styles.actionButtonText,
                      styles.interrogateButtonText,
                      !canInterrogate && styles.actionButtonTextDisabled
                    ]}>
                      {interrogationProgress > 0 ? `${Math.round(interrogationProgress * 100)}%` : 'HOLD'}
                    </Text>
                    {interrogationProgress > 0 && (
                      <View style={[styles.drawerProgressBar, { width: `${interrogationProgress * 100}%` }]} />
                    )}
                  </View>
                </View>
              </GestureDetector>
            ) : (
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
            )}
            <Text style={styles.sectionHint}>Tap & Hold</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <HUDBox hudStage={hudStage} style={styles.container} buildDelay={BUILD_SEQUENCE.subjectIntel}>
      {interactionPhase === 'greeting' && renderGreetingPhase()}
      {interactionPhase === 'credentials' && renderCredentialsPhase()}
      {interactionPhase === 'investigation' && renderInvestigationPhase()}
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
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
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
  // Phase 4: Credential request button
  credentialButton: {
    borderColor: Theme.colors.textPrimary,
    backgroundColor: 'rgba(127, 184, 216, 0.15)',
  },
  credentialButtonText: {
    color: Theme.colors.textPrimary,
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
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
  // Phase 4: Greeting styles
  greetingLabel: {
    color: Theme.colors.textSecondary,
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
  },
  greetingText: {
    color: Theme.colors.textPrimary,
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  agitatedText: {
    letterSpacing: 0,
  },
  brokenText: {
    letterSpacing: 1,
    opacity: 0.9,
  },
  silentText: {
    color: Theme.colors.textDim,
    fontStyle: 'normal',
  },
  // Phase 4: Credential styles
  credentialItem: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(26, 42, 58, 0.5)',
    paddingBottom: 8,
    marginBottom: 8,
  },
  credentialHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  credentialType: {
    color: Theme.colors.textPrimary,
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  credentialNumber: {
    color: Theme.colors.textSecondary,
    fontFamily: Theme.fonts.mono,
    fontSize: 9,
    letterSpacing: 0.6,
    marginTop: 2,
    marginBottom: 4,
    opacity: 0.9,
  },
  credentialDetail: {
    color: Theme.colors.textPrimary,
    fontFamily: Theme.fonts.mono,
    fontSize: 8,
    letterSpacing: 0.2,
    marginTop: 2,
    lineHeight: 12,
  },
  credentialExpirationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  credentialWarning: {
    color: Theme.colors.accentDeny,
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
  },
  anomalyBadge: {
    color: Theme.colors.accentWarn,
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
    fontWeight: '700',
  },
  anomalyText: {
    color: Theme.colors.accentWarn,
    fontFamily: Theme.fonts.mono,
    fontSize: 9,
    marginTop: 4,
  },
  suspiciousSection: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(201, 162, 39, 0.3)',
  },
  suspiciousLabel: {
    color: Theme.colors.accentWarn,
    fontFamily: Theme.fonts.mono,
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 4,
  },
  suspiciousItem: {
    color: Theme.colors.accentWarn,
    fontFamily: Theme.fonts.mono,
    fontSize: 9,
    letterSpacing: 0.5,
    opacity: 0.8,
  },
  // Phase 4: Investigation layout styles
  investigationContainer: {
    flex: 1,
  },
  sectionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 12,
  },
  investigationSection: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  sectionHeader: {
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(26, 42, 58, 0.3)',
  },
  sectionLabel: {
    color: Theme.colors.textPrimary,
    fontFamily: Theme.fonts.mono,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  sectionHint: {
    color: Theme.colors.textDim,
    fontFamily: Theme.fonts.mono,
    fontSize: 7,
    letterSpacing: 0.3,
    opacity: 0.6,
  },
  responseBox: {
    flex: 1,
    backgroundColor: 'rgba(10, 12, 15, 0.4)',
    borderWidth: 1,
    borderColor: Theme.colors.border,
    padding: 8,
    marginTop: 8,
  },
  gestureTarget: {
    width: '100%',
    height: 50,
  },
  // Phase 3: Credentials swipe styles
  swipeIndicator: {
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 4,
  },
  swipeIndicatorText: {
    color: Theme.colors.textDim,
    fontFamily: Theme.fonts.mono,
    fontSize: 8,
    letterSpacing: 1,
    opacity: 0.6,
  },
  credentialSwipeArea: {
    flex: 1,
    height: 60,
    justifyContent: 'center',
    position: 'relative',
  },
  sliderTrack: {
    backgroundColor: 'rgba(10, 12, 15, 0.8)',
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: 0, // Hard edges
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 0,
  },
  sliderHandle: {
    width: 60,
    height: 58,
    borderRadius: 0, // Hard edges
    backgroundColor: 'rgba(27, 126, 184, 0.1)',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: Theme.colors.textPrimary,
    zIndex: 3,
    justifyContent: 'center',
    alignItems: 'flex-start', // Align the handle content to the left
    flexDirection: 'row',
    position: 'absolute',
    left: 0, // Ensure handle hugs the left—start of gate row
    top: 0,
    paddingTop: 4,
  },
  gateContainer: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 5, // Start gates after the handle's initial width
    paddingRight: 12,
    zIndex: 1,
  },
  gateMark: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.3,
  },
  gateMarkActive: {
    opacity: 1,
  },
  gateIcon: {
    color: Theme.colors.textDim,
    fontSize: 14,
  },
  gateIconActive: {
    color: Theme.colors.accentApprove,
    textShadowColor: Theme.colors.accentApprove,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  sliderHandleText: {
    color: Theme.colors.textPrimary,
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  sliderLabel: {
    position: 'absolute',
    right: 12,
    color: Theme.colors.textDim,
    fontFamily: Theme.fonts.mono,
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 1,
    zIndex: 2,
    pointerEvents: 'none',
  },
  credentialDrawerHandle: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Theme.colors.textPrimary,
    backgroundColor: 'rgba(127, 184, 216, 0.05)',
    position: 'relative',
    borderRadius: 2,
  },
  drawerProgressBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: 2,
    backgroundColor: Theme.colors.accentApprove,
  },
});

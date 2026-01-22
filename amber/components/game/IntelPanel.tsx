import React, { useState, useMemo, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Animated, PanResponder, Image } from 'react-native';
import { SubjectData } from '../../data/subjects';
import { HUDBox } from '../ui/HUDBox';
import { BUILD_SEQUENCE } from '../../constants/animations';
import { GatheredInformation } from '../../types/information';
import { generateDynamicQuestions } from '../../utils/questionGeneration';
// Phase 4: Subject interaction imports
import { getSubjectGreeting, CommunicationStyle, COMMUNICATION_STYLE_DESCRIPTIONS } from '../../data/subjectGreetings';
import { getSubjectCredentials, getCredentialTypeName, getExpirationStatus } from '../../data/credentialTypes';
import { styles } from './intel/IntelPanel.styles';
import { calculateQuestionBPM, generateDefaultResponse } from './intel/helpers/interrogation';
import { VerificationDrawer } from './intel/VerificationDrawer';

// Phase 4: Interaction phase type
type InteractionPhase = 'greeting' | 'credentials' | 'investigation';

// Phase 3: Carousel mode type
type PanelMode = 'verification' | 'dossier' | 'interrogation';

type QueryType = 'WARRANT' | 'TRANSIT' | 'INCIDENT';

const QUERY_LABELS: Record<QueryType, string> = {
  WARRANT: 'warrant_check',
  TRANSIT: 'transit_log',
  INCIDENT: 'incident_history',
};

// Operator ID
const OPERATOR_ID = 'OP-7734';


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
  onQueryPerformed, // Phase 1: Callback when a verification query is performed
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
  onQueryPerformed?: (queryType: QueryType) => void, // Phase 1: Callback when a verification query is performed
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

  const handleAskQuestion = (tone: 'soft' | 'firm' | 'harsh' = 'firm') => {
    if (questionsAsked.length >= 3 || !currentQuestion) return;
    
    const questionId = currentQuestion.id;
    const questionText = currentQuestion.text(data);
    const questionNumber = questionsAsked.length + 1;
    
    setQuestionsAsked(prev => [...prev, questionId]);
    setCurrentQuestionText(questionText);

    // Get subject's response
    const response = generateDefaultResponse(data, questionId, tone);
    
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

  // Phase 4: Investigation carousel (single module at a time)
  // Order: DOSSIER -> VERIFICATION -> INTERROGATE
  const INVESTIGATION_ORDER: PanelMode[] = ['dossier', 'verification', 'interrogation'];
  const [investigationMode, setInvestigationMode] = useState<PanelMode>('dossier');
  const [investigationWidth, setInvestigationWidth] = useState(0);
  const investigationTranslateX = useRef(new Animated.Value(0)).current;
  const investigationBaseXRef = useRef(0);

  useEffect(() => {
    if (interactionPhase === 'investigation') {
      setInvestigationMode('dossier');
      investigationTranslateX.setValue(0);
    }
  }, [interactionPhase]);

  // Keep translateX synced when mode changes (after a snap or programmatic set).
  useEffect(() => {
    if (interactionPhase !== 'investigation') return;
    if (!investigationWidth) return;
    const idx = INVESTIGATION_ORDER.indexOf(investigationMode);
    Animated.spring(investigationTranslateX, {
      toValue: -idx * investigationWidth,
      useNativeDriver: true,
      tension: 80,
      friction: 12,
    }).start();
  }, [interactionPhase, investigationMode, investigationWidth]);

  const investigationPanResponder = useMemo(() => {
    const snapToIndex = (nextIndex: number) => {
      const clamped = Math.max(0, Math.min(INVESTIGATION_ORDER.length - 1, nextIndex));
      const nextMode = INVESTIGATION_ORDER[clamped];
      setInvestigationMode(nextMode);
      if (!investigationWidth) return;
      Animated.spring(investigationTranslateX, {
        toValue: -clamped * investigationWidth,
        useNativeDriver: true,
        tension: 85,
        friction: 12,
      }).start();
    };

    return PanResponder.create({
      onStartShouldSetPanResponder: () => interactionPhase === 'investigation',
      onMoveShouldSetPanResponder: (_evt, gestureState) => {
        if (interactionPhase !== 'investigation') return false;
        return Math.abs(gestureState.dx) > 10 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
      },
      onPanResponderGrant: () => {
        if (interactionPhase !== 'investigation') return;
        // Stop any in-flight animation and set drag base.
        (investigationTranslateX as any).stopAnimation?.((v: number) => {
          investigationBaseXRef.current = v;
        });
        if (!investigationWidth) {
          investigationBaseXRef.current = 0;
          return;
        }
        const currentIndex = INVESTIGATION_ORDER.indexOf(investigationMode);
        investigationBaseXRef.current = -currentIndex * investigationWidth;
      },
      onPanResponderMove: (_evt, gestureState) => {
        if (interactionPhase !== 'investigation') return;
        if (!investigationWidth) return;
        const minX = -investigationWidth * (INVESTIGATION_ORDER.length - 1);
        const maxX = 0;
        let nextX = investigationBaseXRef.current + gestureState.dx;
        // Soft clamp (rubber band) at edges.
        if (nextX < minX) nextX = minX + (nextX - minX) * 0.2;
        if (nextX > maxX) nextX = maxX + (nextX - maxX) * 0.2;
        investigationTranslateX.setValue(nextX);
      },
      onPanResponderRelease: (_evt, gestureState) => {
        if (interactionPhase !== 'investigation') return;
        if (!investigationWidth) return;

        const currentIndex = INVESTIGATION_ORDER.indexOf(investigationMode);
        const dx = gestureState.dx;
        const vx = gestureState.vx;
        const threshold = investigationWidth * 0.22;

        // Flick wins; otherwise distance threshold.
        if (vx < -0.55 || dx < -threshold) {
          snapToIndex(currentIndex + 1);
          return;
        }
        if (vx > 0.55 || dx > threshold) {
          snapToIndex(currentIndex - 1);
          return;
        }

        snapToIndex(currentIndex);
      },
      onPanResponderTerminate: () => {
        if (interactionPhase !== 'investigation') return;
        if (!investigationWidth) return;
        const currentIndex = INVESTIGATION_ORDER.indexOf(investigationMode);
        snapToIndex(currentIndex);
      },
      onPanResponderTerminationRequest: () => true,
    });
  }, [interactionPhase, investigationMode, investigationWidth]);

  // Interrogate is always available (free, 3 questions max)
  const canInterrogate = hudStage === 'full' && questionsAsked.length < 3;

  // Phase 4: Interrogation press-and-hold (JS timers; avoid GestureDetector native crashes)
  const [interrogationProgress, setInterrogationProgress] = useState(0);
  const interrogationHoldStartMsRef = useRef<number | null>(null);
  const interrogationHoldTickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const interrogationHoldCompletedRef = useRef(false);

  const clearInterrogationHoldTimer = () => {
    if (interrogationHoldTickRef.current) {
      clearInterval(interrogationHoldTickRef.current);
      interrogationHoldTickRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      clearInterrogationHoldTimer();
    };
  }, []);

  const startInterrogationHold = () => {
    if (interactionPhase !== 'investigation') return;
    if (!canInterrogate) return;

    interrogationHoldStartMsRef.current = Date.now();
    interrogationHoldCompletedRef.current = false;
    setInterrogationProgress(0);

    clearInterrogationHoldTimer();
    const MAX_MS = 1500;

    interrogationHoldTickRef.current = setInterval(() => {
      const startMs = interrogationHoldStartMsRef.current;
      if (startMs == null) return;

      const elapsed = Date.now() - startMs;
      const progress = Math.max(0, Math.min(1, elapsed / MAX_MS));
      setInterrogationProgress(progress);
    }, 16);
  };

  const endInterrogationHold = () => {
    const startMs = interrogationHoldStartMsRef.current;
    interrogationHoldStartMsRef.current = null;
    clearInterrogationHoldTimer();

    // If we already completed, state is already reset.
    if (interrogationHoldCompletedRef.current) return;

    // Cancel/reset on early release.
    if (startMs == null) {
      setInterrogationProgress(0);
      return;
    }

    const MIN_MS = 200;
    const duration = Date.now() - startMs;
    if (duration < MIN_MS) {
      setInterrogationProgress(0);
      return;
    }

    // Released after MIN => ask question; longer hold = harsher tone.
    const SOFT_MAX_MS = 650;
    const FIRM_MAX_MS = 1150;
    const tone: 'soft' | 'firm' | 'harsh' =
      duration < SOFT_MAX_MS ? 'soft' : duration < FIRM_MAX_MS ? 'firm' : 'harsh';

    setInterrogationProgress(0);
    handleAskQuestion(tone);
  };

  // Phase 4: Handle Request Credentials button
  const handleRequestCredentials = () => {
    onGreetingComplete?.();
  };

  // Phase 4: Handle Proceed to Investigation button
  const handleProceedToInvestigation = () => {
    const hasAnomalies = credentialData?.credentials.some(c => c.anomalies.length > 0) || false;
    onCredentialsComplete?.(hasAnomalies);
  };

  // Verification drawer now owns folder selection + unlock behavior.

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
                  ? '#4a8a5a' 
                  : expirationStatus === 'EXPIRED' 
                  ? '#d4534a' 
                  : '#c9a227';
                
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

  const renderInvestigationCard = (mode: PanelMode) => {
    // Use the card’s index so the hint stays coherent during swipes.
    const cardIndex = INVESTIGATION_ORDER.indexOf(mode);
    const navText = `${String(cardIndex + 1).padStart(2, '0')}/${String(INVESTIGATION_ORDER.length).padStart(2, '0')}`;

    if (mode === 'dossier') {
      const dossierUnlocked = hudStage === 'full' && dossierRevealed;
      const dossierHasContent = dossierUnlocked && !!data.dossier;
      const dossierZoomEnabled = dossierUnlocked && !!onOpenDossier;

      return (
        <View style={styles.investigationCard}>
          <View style={styles.investigationCardHeader}>
            <Text style={styles.sectionLabel}>DOSSIER</Text>
            <Text style={styles.investigationNavHint}>SWIPE → {navText}</Text>
          </View>
          <TouchableOpacity
            style={[
              styles.dossierPreview,
              !dossierZoomEnabled && styles.dossierPreviewDisabled,
            ]}
            onPress={onOpenDossier}
            disabled={!dossierZoomEnabled}
            activeOpacity={0.85}
          >
            {dossierHasContent ? (
              <View style={{ flex: 1 }}>
                <View style={styles.dossierPreviewHeader}>
                  {data.profilePic ? (
                    <Image source={data.profilePic} style={styles.dossierPreviewPhoto} />
                  ) : (
                    <View style={styles.dossierPreviewPhoto} />
                  )}
                  <View style={styles.dossierPreviewIdentity}>
                    <Text style={styles.dossierPreviewName} numberOfLines={1}>
                      {data.dossier?.name || data.name}
                    </Text>
                    <Text style={styles.dossierPreviewId} numberOfLines={1}>
                      {data.id}
                    </Text>
                  </View>
                </View>

                <View style={styles.dossierPreviewBody}>
                  <View style={styles.dossierPreviewRow}>
                    <Text style={styles.dossierPreviewLabel}>DOB</Text>
                    <Text style={styles.dossierPreviewValue} numberOfLines={1}>
                      {data.dossier?.dateOfBirth || '—'}
                    </Text>
                  </View>
                  <View style={styles.dossierPreviewRow}>
                    <Text style={styles.dossierPreviewLabel}>OCCUPATION</Text>
                    <Text style={styles.dossierPreviewValue} numberOfLines={1}>
                      {data.dossier?.occupation || '—'}
                    </Text>
                  </View>
                  <View style={styles.dossierPreviewRow}>
                    <Text style={styles.dossierPreviewLabel}>ADDRESS</Text>
                    <Text style={styles.dossierPreviewValue} numberOfLines={2}>
                      {data.dossier?.address || '—'}
                    </Text>
                  </View>
                  {data.dossierAnomaly && data.dossierAnomaly.type !== 'NONE' && (
                    <View style={styles.dossierPreviewRow}>
                      <Text style={styles.dossierPreviewLabel}>FLAG</Text>
                      <Text style={styles.dossierPreviewValue} numberOfLines={1}>
                        {data.dossierAnomaly.type}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.dossierPreviewFooter}>
                  <Text style={styles.dossierPreviewHint}>TAP TO ZOOM</Text>
                </View>
              </View>
            ) : (
              <View style={{ flex: 1, justifyContent: 'space-between' }}>
                <View>
                  <Text style={styles.dossierPreviewName}>BIO SCAN REQUIRED</Text>
                  <Text style={[styles.dossierPreviewId, { marginTop: 6 }]}>
                    Dossier preview available after scan unlock.
                  </Text>
                </View>
                <View style={styles.dossierPreviewFooter}>
                  <Text style={styles.dossierPreviewHint}>
                    {dossierUnlocked ? 'UNLOCKED — NO DATA' : 'LOCKED'}
                  </Text>
                </View>
              </View>
            )}
          </TouchableOpacity>
        </View>
      );
    }

    if (mode === 'verification') {
      return (
        <View style={styles.investigationCard}>
          <View style={styles.investigationCardHeader}>
            <Text style={styles.sectionLabel}>VERIFICATION</Text>
            <Text style={styles.investigationNavHint}>← SWIPE {navText} SWIPE →</Text>
          </View>
          <View style={{ flex: 1, opacity: verificationDisabled ? 0.35 : 1 }}>
            <VerificationDrawer
              subject={data}
              gatheredInformation={info}
              resourcesRemaining={resourcesRemaining || 0}
              onQueryPerformed={onQueryPerformed}
              onInformationUpdate={onInformationUpdate}
            />
          </View>
        </View>
      );
    }

    // interrogation
    return (
      <View style={styles.investigationCard}>
        <View style={styles.investigationCardHeader}>
          <Text style={styles.sectionLabel}>INTERROGATE</Text>
          <Text style={styles.investigationNavHint}>← SWIPE {navText}</Text>
        </View>

        <TouchableOpacity
          style={[
            styles.actionButton,
            styles.interrogateButton,
            !canInterrogate && styles.actionButtonDisabled,
          ]}
          onPressIn={startInterrogationHold}
          onPressOut={endInterrogationHold}
          disabled={!canInterrogate}
          activeOpacity={0.85}
        >
          <Text
            style={[
              styles.actionButtonText,
              styles.interrogateButtonText,
              !canInterrogate && styles.actionButtonTextDisabled,
            ]}
          >
            {interrogationProgress > 0 ? `${Math.round(interrogationProgress * 100)}%` : 'HOLD'}
          </Text>
          {interrogationProgress > 0 && (
            <View style={[styles.drawerProgressBar, { width: `${interrogationProgress * 100}%` }]} />
          )}
        </TouchableOpacity>
        <Text style={styles.sectionHint}>Tap &amp; Hold</Text>
      </View>
    );
  };

  // Phase 4: Render investigation phase as a single swipeable carousel
  const renderInvestigationPhase = () => {
    return (
      <View
        style={styles.investigationContainer}
        onLayout={(e) => {
          const w = e.nativeEvent.layout.width;
          if (w > 0 && w !== investigationWidth) setInvestigationWidth(w);
        }}
        {...investigationPanResponder.panHandlers}
      >
        <View style={{ flex: 1, overflow: 'hidden' }}>
          {investigationWidth > 0 ? (
            <Animated.View
              style={[
                styles.investigationCarousel,
                {
                  flexDirection: 'row',
                  width: investigationWidth * INVESTIGATION_ORDER.length,
                  transform: [{ translateX: investigationTranslateX }],
                },
              ]}
            >
              {INVESTIGATION_ORDER.map((mode) => (
                <View
                  key={mode}
                  style={{ width: investigationWidth, flex: 1 }}
                  pointerEvents={mode === investigationMode ? 'auto' : 'none'}
                >
                  {renderInvestigationCard(mode)}
                </View>
              ))}
            </Animated.View>
          ) : (
            // Until we know width, keep the previous single-panel render.
            <Animated.View style={[styles.investigationCarousel]}>
              {renderInvestigationCard(investigationMode)}
            </Animated.View>
          )}
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

// styles moved to `amber/components/game/intel/IntelPanel.styles.ts`

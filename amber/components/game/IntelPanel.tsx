import React, { useState, useMemo, useEffect, useRef } from 'react';
import { View, Text, ScrollView, Animated, PanResponder, Image } from 'react-native';
import { SubjectData } from '../../data/subjects';
import { HUDBox } from '../ui/HUDBox';
import { MechanicalButton } from '../ui/MechanicalUI';
import { Theme } from '../../constants/theme';
import { BUILD_SEQUENCE } from '../../constants/animations';
import { GatheredInformation, hasSomeInformation } from '../../types/information';
import { generateDynamicQuestions } from '../../utils/questionGeneration';
// Phase 4: Subject interaction imports
import { getSubjectGreeting, CommunicationStyle, COMMUNICATION_STYLE_DESCRIPTIONS } from '../../data/subjectGreetings';
import { getSubjectCredentials, getCredentialTypeName, getExpirationStatus } from '../../data/credentialTypes';
import { styles } from './intel/IntelPanel.styles';
import { calculateQuestionBPM, generateDefaultResponse } from './intel/helpers/interrogation';
import { ProceduralPortrait } from '../ui/ProceduralPortrait';
// Stripped-down build: verification drawer removed.

// Phase 4: Interaction phase type
type InteractionPhase = 'greeting' | 'credentials' | 'investigation';

// Phase 3: Carousel mode type
type PanelMode = 'dossier' | 'interrogation' | 'verification';

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
  onInterrogate,
  hasDecision,
  decisionType,
  ambiguousCondition,
  biometricsRevealed,
  dossierRevealed = false,
  subjectResponse = '',
  onResponseUpdate,
  gatheredInformation, // Phase 2: Information gathered for dynamic questions
  onBPMChange, // Phase 2: Callback when BPM changes during interrogation
  onInformationUpdate, // Phase 2: Update gathered information
  // Phase 4: Subject interaction props
  interactionPhase = 'greeting',
  onCredentialsComplete,
  onEstablishBPM,
  greetingDisplayed = false,
}: {
  data: SubjectData,
  hudStage: 'none' | 'wireframe' | 'outline' | 'full',
  onInterrogate?: () => void,
  hasDecision?: boolean,
  decisionType?: 'APPROVE' | 'DENY',
  ambiguousCondition?: AmbiguousConditionDisplay | null,
  biometricsRevealed?: boolean,
  dossierRevealed?: boolean,
  subjectResponse?: string,
  onResponseUpdate?: (response: string) => void,
  gatheredInformation?: GatheredInformation,
  onBPMChange?: (bpm: number) => void, // Phase 2: Callback when BPM changes during interrogation
  onInformationUpdate?: (info: Partial<GatheredInformation>) => void, // Phase 2: Update gathered information
  // Phase 4: Subject interaction props
  interactionPhase?: InteractionPhase,
  onCredentialsComplete?: (hasAnomalies: boolean) => void,
  onEstablishBPM?: (bpm: number) => void,
  greetingDisplayed?: boolean,
}) => {
  const [questionsAsked, setQuestionsAsked] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentQuestionText, setCurrentQuestionText] = useState<string>('');
  const autoAskedSubjectRef = useRef<string | null>(null);
  const responseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Phase 4: Greeting and credential state
  const greetingData = getSubjectGreeting(data.id, data);
  const credentialData = getSubjectCredentials(data.id, data);

  // Reset when subject changes
  useEffect(() => {
    setQuestionsAsked([]);
    setCurrentQuestionIndex(0);
    setCurrentQuestionText('');
    autoAskedSubjectRef.current = null;
    if (responseTimeoutRef.current) {
      clearTimeout(responseTimeoutRef.current);
      responseTimeoutRef.current = null;
    }
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
    // stripped-down: no health scan
    warrantCheck: false,
    transitLog: false,
    incidentHistory: false,
    interrogation: { questionsAsked: 0, responses: [], bpmChanges: [] },
    equipmentFailures: [],
    bpmDataAvailable: true,
    eyeScannerActive: false,
    activeServices: [],
    lastExtracted: {},
    timestamps: {},
  };
  
  const info = gatheredInformation || defaultInfo;
  const dynamicQuestions = useMemo(() => {
    return generateDynamicQuestions(data, info);
  }, [
    data.id,
    info.identityScan,
    info.warrantCheck,
    info.transitLog,
    info.incidentHistory,
  ]);
  
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
    if (responseTimeoutRef.current) {
      clearTimeout(responseTimeoutRef.current);
      responseTimeoutRef.current = null;
    }
    responseTimeoutRef.current = setTimeout(() => {
      onResponseUpdate?.(response);
    }, 50);

    // Cycle to next available question
    const remainingQuestions = availableQuestions.filter(q => q.id !== questionId);
    if (remainingQuestions.length > 0) {
      setCurrentQuestionIndex(0);
    }
  };

  // Phase 4: Investigation carousel (single module at a time)
  // Stripped-down: INTERROGATE -> VERIFICATION -> DOSSIER
  const INVESTIGATION_ORDER: PanelMode[] = ['interrogation', 'verification', 'dossier'];
  const [investigationMode, setInvestigationMode] = useState<PanelMode>('interrogation');
  const [investigationWidth, setInvestigationWidth] = useState(0);
  const investigationTranslateX = useRef(new Animated.Value(0)).current;
  const investigationBaseXRef = useRef(0);

  useEffect(() => {
    if (interactionPhase === 'investigation') {
      setInvestigationMode('interrogation');
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

  // Mark verification info as "presented" when the card is viewed.
  useEffect(() => {
    if (interactionPhase !== 'investigation') return;
    if (investigationMode !== 'verification') return;
    if (!data.verificationRecord) return;
    if (info.verificationViewed) return;
    onInformationUpdate?.({
      verificationViewed: true,
      timestamps: {
        ...info.timestamps,
        verificationViewed: Date.now(),
      },
    });
  }, [interactionPhase, investigationMode, data.verificationRecord, info.verificationViewed, info.timestamps, onInformationUpdate]);

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

  // Evidence-driven interrogation: only enabled once some investigation evidence exists.
  const hasInterrogationEvidence = hasSomeInformation(info);

  const canInterrogate =
    hudStage === 'full' && hasInterrogationEvidence && questionsAsked.length < 3 && !!currentQuestion;

  const handleInterrogationAction = (tone: 'soft' | 'firm' | 'harsh') => {
    if (interactionPhase !== 'investigation') return;
    if (!canInterrogate) return;
    handleAskQuestion(tone);
  };

  // Auto-ask the first question once evidence exists (per subject).
  useEffect(() => {
    if (interactionPhase !== 'investigation') return;
    if (!hasInterrogationEvidence) return;
    if (questionsAsked.length > 0) return;
    if (!currentQuestion) return;
    if (autoAskedSubjectRef.current === data.id) return;

    autoAskedSubjectRef.current = data.id;
    handleAskQuestion('firm');
  }, [
    interactionPhase,
    hasInterrogationEvidence,
    questionsAsked.length,
    currentQuestion?.id,
    data.id,
  ]);

  // Phase 4: Handle Proceed to Investigation button
  const handleProceedToInvestigation = () => {
    const hasAnomalies = credentialData?.credentials.some(c => c.anomalies.length > 0) || false;
    onCredentialsComplete?.(hasAnomalies);
  };

  // Verification drawer now owns folder selection + unlock behavior.

  // Phase 4: Render greeting phase content
  const renderGreetingPhase = () => {
    const content = (
      <View collapsable={false} style={{ flex: 1 }}>
        {/* Hierarchy: Section Title */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>CREDENTIAL PROTOCOL</Text>
        </View>

        {/* Greeting Phase - Automated Intake */}
        <View style={styles.mainRow}>
          <View style={styles.greetingNotice}>
            <Text style={styles.greetingLabel}>INTAKE GATE</Text>
            <Text style={styles.greetingText}>
              {greetingDisplayed ? 'INITIALIZATION IN PROGRESS' : 'AWAITING SUBJECT'}
            </Text>
          </View>
        </View>
      </View>
    );

    return content;
  };

  // Phase 4: Render credentials phase content
  const renderCredentialsPhase = () => {
    const credentials = credentialData?.credentials || [];
    const behavior = greetingData?.credentialBehavior || 'COOPERATIVE';
    const isForged = behavior === 'FORGED';

    return (
      <>
        {/* Credentials Phase Button */}
        <View style={styles.mainRow}>
          <MechanicalButton 
            label="VERIFY" 
            onPress={handleProceedToInvestigation} 
            color={Theme.colors.buttonYellow}
            style={{ flex: 1 }}
          />
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
                  <View key={index} style={[styles.credentialItem, isForged && styles.credentialItemForged]}>
                    <View style={styles.credentialHeader}>
                      <Text style={[styles.credentialType, isForged && styles.credentialTextForged]}>
                        {getCredentialTypeName(cred.type)}
                      </Text>
                      {cred.anomalies.length > 0 && (
                        <Text style={styles.anomalyBadge}>!</Text>
                      )}
                    </View>
                    <Text style={[styles.credentialNumber, isForged && styles.credentialTextForged]}>
                      {cred.number}
                    </Text>
                    <Text style={[styles.credentialDetail, isForged && styles.credentialTextForged]}>
                      HOLDER: {cred.holderName}
                    </Text>
                    <Text style={[styles.credentialDetail, isForged && styles.credentialTextForged]}>
                      PURPOSE: {cred.purpose}
                    </Text>
                    <View style={styles.credentialExpirationRow}>
                      <Text style={[styles.credentialDetail, isForged && styles.credentialTextForged]}>
                        EXPIRES: {cred.expirationDate} (
                      </Text>
                      <Text style={[styles.credentialDetail, { color: statusColor }]}>
                        {expirationStatus}
                      </Text>
                      <Text style={[styles.credentialDetail, isForged && styles.credentialTextForged]}>)</Text>
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
    const navHint =
      cardIndex === 0
        ? `SWIPE → ${navText}`
        : cardIndex === INVESTIGATION_ORDER.length - 1
          ? `← SWIPE ${navText}`
          : `← SWIPE → ${navText}`;

    if (mode === 'dossier') {
      const dossierUnlocked = hudStage === 'full' && dossierRevealed;
      const dossierHasContent = dossierUnlocked && !!data.dossier;
      const primaryCredential = credentialData?.credentials?.[0];
      const destination = primaryCredential?.destinationPlanet || data.destinationPlanet || '—';
      const permitLabel = primaryCredential ? getCredentialTypeName(primaryCredential.type) : '—';
      const permitStatus = primaryCredential
        ? (primaryCredential.valid ? getExpirationStatus(primaryCredential.expirationDate) : 'INVALID')
        : '—';
      const showProceduralPortrait = data.useProceduralPortrait || (!data.profilePic && !!data.id);

      return (
        <View style={styles.investigationCard}>
          <View style={styles.investigationCardHeader}>
            <Text style={styles.sectionLabel}>DOSSIER</Text>
            <Text style={styles.investigationNavHint}>{navHint}</Text>
          </View>
          <View style={[styles.dossierPreview, !dossierUnlocked && styles.dossierPreviewDisabled]}>
            {dossierHasContent ? (
              <View style={{ flex: 1 }}>
                <View style={styles.dossierPreviewHeader}>
                  {showProceduralPortrait ? (
                    <ProceduralPortrait
                      subjectId={data.id}
                      subjectType={data.subjectType}
                      sex={data.sex || 'M'}
                      isAnomaly={data.subjectType === 'REPLICANT'}
                      portraitPreset="dossier"
                      style={styles.dossierPreviewPhoto}
                    />
                  ) : data.profilePic ? (
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
                  <View style={styles.dossierPreviewRow}>
                    <Text style={styles.dossierPreviewLabel}>DESTINATION</Text>
                    <Text style={styles.dossierPreviewValue} numberOfLines={1}>
                      {destination}
                    </Text>
                  </View>
                  <View style={styles.dossierPreviewRow}>
                    <Text style={styles.dossierPreviewLabel}>PERMIT</Text>
                    <Text style={styles.dossierPreviewValue} numberOfLines={1}>
                      {permitLabel}
                    </Text>
                  </View>
                  <View style={styles.dossierPreviewRow}>
                    <Text style={styles.dossierPreviewLabel}>STATUS</Text>
                    <Text style={styles.dossierPreviewValue} numberOfLines={1}>
                      {permitStatus}
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
                  <Text style={styles.dossierPreviewHint}>DOSSIER LOCKED TO PANEL</Text>
                </View>
              </View>
            ) : (
              <View style={{ flex: 1, justifyContent: 'space-between' }}>
                <View>
                  <Text style={styles.dossierPreviewName}>ID SCAN REQUIRED</Text>
                  <Text style={[styles.dossierPreviewId, { marginTop: 6 }]}>
                    Dossier preview available after ID scan.
                  </Text>
                </View>
                <View style={styles.dossierPreviewFooter}>
                  <Text style={styles.dossierPreviewHint}>
                    {dossierUnlocked ? 'UNLOCKED — NO DATA' : 'LOCKED'}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>
      );
    }

    if (mode === 'verification') {
      const record = data.verificationRecord;
      const recordTypeLabel = record
        ? record.type === 'WARRANT'
          ? 'WARRANT FILE'
          : record.type === 'TRANSIT'
            ? 'TRANSIT REPORT'
            : 'INCIDENT REPORT'
        : 'NO RECORD';

      const recordTagStyle =
        record?.type === 'WARRANT'
          ? styles.verificationPreviewTagWarrant
          : record?.type === 'TRANSIT'
            ? styles.verificationPreviewTagTransit
            : styles.verificationPreviewTagIncident;

      return (
        <View style={styles.investigationCard}>
          <View style={styles.investigationCardHeader}>
            <Text style={styles.sectionLabel}>VERIFICATION</Text>
            <Text style={styles.investigationNavHint}>{navHint}</Text>
          </View>
          <View style={styles.verificationPreview}>
            {record ? (
              <View style={{ flex: 1 }}>
                <View style={styles.verificationPreviewHeader}>
                  <Text style={[styles.verificationPreviewTag, recordTagStyle]}>{recordTypeLabel}</Text>
                  <Text style={styles.verificationPreviewMeta}>{record.referenceId}</Text>
                </View>
                <View style={styles.verificationPreviewBody}>
                  <View style={styles.verificationPreviewRow}>
                    <Text style={styles.verificationPreviewLabel}>DATE</Text>
                    <Text style={styles.verificationPreviewValue}>{record.date}</Text>
                  </View>
                  <View style={styles.verificationPreviewRow}>
                    <Text style={styles.verificationPreviewLabel}>SOURCE</Text>
                    <Text style={styles.verificationPreviewValue}>{record.source}</Text>
                  </View>
                  <View style={styles.verificationPreviewRow}>
                    <Text style={styles.verificationPreviewLabel}>SUMMARY</Text>
                    <Text style={styles.verificationPreviewValue}>{record.summary}</Text>
                  </View>
                  <View style={styles.verificationPreviewDiscrepancyBlock}>
                    <Text style={styles.verificationPreviewDiscrepancyLabel}>DISCREPANCY DETECTED</Text>
                    <Text style={styles.verificationPreviewDiscrepancyText}>{record.contradiction}</Text>
                  </View>
              
                </View>
                <View style={styles.verificationPreviewFooter}>
                  <Text style={styles.verificationPreviewHint}>SINGLE-ENTRY VERIFICATION FILE</Text>
                </View>
              </View>
            ) : (
              <View style={{ flex: 1, justifyContent: 'space-between' }}>
                <View>
                  <Text style={styles.verificationPreviewTag}>NO RECORD ON FILE</Text>
                  <Text style={[styles.verificationPreviewMeta, { marginTop: 6 }]}>
                    Verification registry is empty for this subject.
                  </Text>
                </View>
                <View style={styles.verificationPreviewFooter}>
                  <Text style={styles.verificationPreviewHint}>NO CONTRADICTIONS DETECTED</Text>
                </View>
              </View>
            )}
          </View>
        </View>
      );
    }

    // interrogation
    const nextQuestionText = currentQuestion
      ? currentQuestion.text(data)
      : hasInterrogationEvidence
        ? 'NO FURTHER QUESTIONS'
        : 'EVIDENCE REQUIRED — RUN A SCAN / QUERY';
    return (
      <View style={styles.investigationCard}>
        <View style={styles.investigationCardHeader}>
          <Text style={styles.sectionLabel}>INTERROGATE</Text>
          <Text style={styles.investigationNavHint}>{navHint}</Text>
        </View>

        <View style={styles.interrogateRow}>
          <View style={styles.interrogateQuestionBox}>
            <Text style={styles.interrogateQuestionLabel}>SYSTEM QUESTION</Text>
            <Text
              style={[
                styles.interrogateQuestionText,
                !canInterrogate && styles.interrogateQuestionTextDisabled,
              ]}
            >
              {nextQuestionText}
            </Text>
          </View>

          <View style={styles.interrogateActionRow}>
            <MechanicalButton 
              label="CLARIFY" 
              onPress={() => handleInterrogationAction('soft')} 
              disabled={!canInterrogate}
              color={Theme.colors.buttonWhite}
              style={styles.interrogateActionButton}
            />

            <MechanicalButton 
              label="CONTEST" 
              onPress={() => handleInterrogationAction('firm')} 
              disabled={!canInterrogate}
              color={Theme.colors.buttonYellow}
              style={styles.interrogateActionButton}
            />

            <MechanicalButton 
              label="NON-COMPLIANCE" 
              onPress={() => handleInterrogationAction('harsh')} 
              disabled={!canInterrogate}
              color={Theme.colors.buttonRed}
              style={styles.interrogateActionButton}
            />
          </View>
          <Text style={styles.sectionHint}>One action logs a response</Text>
        </View>
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
    <HUDBox hudStage={hudStage} style={styles.container} buildDelay={BUILD_SEQUENCE.subjectIntel} mechanical>
      {interactionPhase === 'greeting' && renderGreetingPhase()}
      {interactionPhase === 'credentials' && renderCredentialsPhase()}
      {interactionPhase === 'investigation' && renderInvestigationPhase()}
    </HUDBox>
  );
};

// styles moved to `amber/components/game/intel/IntelPanel.styles.ts`

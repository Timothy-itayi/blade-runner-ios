import React, { useState } from 'react';
import { View, Animated, TouchableOpacity, Text } from 'react-native';
import { Header } from '../Header';
import { ScanPanel } from '../ScanPanel';
import { IntelPanel } from '../IntelPanel';
import { DecisionButtons } from '../DecisionButtons';
import { CitationStrip } from '../CitationStrip';
import { EyeDisplay } from '../../ui/EyeDisplay';
import { ScanData } from '../../ui/ScanData';
import { SubjectData } from '../../../data/subjects';
import { ShiftData } from '../../../constants/shifts';
import { styles } from '../../../styles/game/MainScreen.styles';
import { Theme } from '../../../constants/theme';
import { useGameStore } from '../../../store/gameStore';
import type { Consequence } from '../../../types/consequence';

interface GameScreenProps {
  hudStage: 'none' | 'wireframe' | 'outline' | 'full';
  currentShift: ShiftData;
  currentSubject: SubjectData;
  currentSubjectIndex: number;
  isScanning: boolean;
  scanProgress: Animated.Value;
  scanningHands: boolean;
  scanningIris: boolean;
  biometricsRevealed: boolean;
  hasDecision: boolean;
  decisionOutcome: { type: 'APPROVE' | 'DENY', outcome: any } | null;
  consequence?: Consequence | null;
  citationVisible?: boolean;
  onAcknowledgeCitation?: () => void;
  credits: number;
  resourcesRemaining?: number;
  resourcesPerShift?: number;
  onSettingsPress: () => void;
  onRevealVerify: () => void;
  onDecision: (type: 'APPROVE' | 'DENY') => void;
  onNext: () => void;
  onScanHands?: () => void;
  onOpenDossier?: () => void;
  onInterrogate?: () => void;
  onBioScan?: () => void;
  bioScanUsed?: boolean; // Phase 1: Track if bio scan has been used (one-time only)
  dossierRevealed?: boolean;
  subjectResponse?: string;
  onResponseUpdate?: (response: string) => void;
  gatheredInformation?: any; // Phase 2: Information gathered for dynamic questions
  isNewGame?: boolean;
  onBPMChange?: (bpm: number) => void; // Phase 2: BPM change callback
  onInformationUpdate?: (info: Partial<any>) => void; // Phase 2: Information update callback
  onQueryPerformed?: (queryType: 'WARRANT' | 'TRANSIT' | 'INCIDENT') => void; // Phase 1: Query performed callback
  equipmentFailures?: string[]; // Phase 2: Equipment failures
  bpmDataAvailable?: boolean; // Phase 2: Is BPM monitor working?
  interrogationBPM?: number | null; // Phase 2: Current BPM during interrogation
  isInterrogationActive?: boolean; // Phase 2: Is interrogation active?
  establishedBPM?: number; // Phase 4: Baseline BPM established from greeting
  interactionPhase?: 'greeting' | 'credentials' | 'investigation'; // Phase 4: Current interaction phase
  onGreetingComplete?: () => void; // Phase 4: Callback when greeting is complete
  onCredentialsComplete?: (hasAnomalies: boolean) => void; // Phase 4: Callback when credentials are examined
  onEstablishBPM?: (bpm: number) => void; // Phase 4: Callback to establish BPM baseline
  eyeScannerActive?: boolean; // Phase 5: Is eye scanner turned on?
  onIdentityScan?: (holdDurationMs?: number) => void; // Phase 5: Identity scan handler
  onHealthScan?: () => void; // Phase 5: Health scan handler
  identityScanUsed?: boolean; // Phase 5: Has identity scan been used?
  healthScanUsed?: boolean; // Phase 5: Has health scan been used?
  onToggleEyeScanner?: () => void; // Phase 5: Toggle eye scanner
  onEyeScannerTap?: (holdDurationMs?: number) => void; // Phase 5: Eye scanner tap handler (unlocks dossier)
  isIdentityScanning?: boolean; // Phase 5: Is identity scan animation active?
  onIdentityScanComplete?: () => void; // Phase 5: Callback when identity scan animation completes
}

export const GameScreen = ({
  hudStage,
  currentShift,
  currentSubject,
  currentSubjectIndex,
  isScanning,
  scanProgress,
  scanningHands,
  scanningIris,
  biometricsRevealed,
  hasDecision,
  decisionOutcome,
  consequence = null,
  citationVisible = false,
  onAcknowledgeCitation,
  credits,
  resourcesRemaining,
  resourcesPerShift,
  onSettingsPress,
  onRevealVerify,
  onDecision,
  onNext,
  onScanHands,
  onOpenDossier,
  onInterrogate,
  dossierRevealed = false,
  subjectResponse = '',
  onResponseUpdate,
  gatheredInformation,
  isNewGame = false,
  onBPMChange,
  onInformationUpdate,
  onQueryPerformed,
  equipmentFailures = [],
  bpmDataAvailable = true,
  interrogationBPM = null,
  isInterrogationActive = false,
  establishedBPM = 72,
  interactionPhase = 'investigation',
  onGreetingComplete,
  onCredentialsComplete,
  onEstablishBPM,
  eyeScannerActive = false,
  onIdentityScan,
  onHealthScan,
  identityScanUsed = false,
  healthScanUsed = false,
  onToggleEyeScanner,
  onEyeScannerTap,
  isIdentityScanning = false,
  onIdentityScanComplete,
}: GameScreenProps) => {
  // Eye scanner toggle controls view channel
  const viewChannel: 'facial' | 'eye' = eyeScannerActive ? 'eye' : 'facial';

  // Phase 4: Lifted greeting state
  const [greetingDisplayed, setGreetingDisplayed] = useState(false);
  const [verificationStep, setVerificationStep] = useState(0);
  const verificationTimersRef = React.useRef<Array<ReturnType<typeof setTimeout>>>([]);
  const [identityScanHoldActive, setIdentityScanHoldActive] = useState(false);

  const clearVerificationTimers = () => {
    verificationTimersRef.current.forEach(clearTimeout);
    verificationTimersRef.current = [];
  };

  // Reset greeting state when subject changes
  React.useEffect(() => {
    setGreetingDisplayed(false);
    setVerificationStep(0);
    clearVerificationTimers();
  }, [currentSubject.id]);

  // Automated intake verification ratchet (system-driven, no gestures)
  React.useEffect(() => {
    clearVerificationTimers();

    if (interactionPhase !== 'greeting') {
      setVerificationStep(4);
      return;
    }

    if (!greetingDisplayed) {
      setVerificationStep(0);
      return;
    }

    setVerificationStep(prev => Math.max(prev, 1));
    verificationTimersRef.current.push(setTimeout(() => {
      setVerificationStep(prev => Math.max(prev, 2));
    }, 700));

    if (biometricsRevealed) {
      verificationTimersRef.current.push(setTimeout(() => {
        setVerificationStep(prev => Math.max(prev, 3));
      }, 1400));

      verificationTimersRef.current.push(setTimeout(() => {
        setVerificationStep(prev => Math.max(prev, 4));
        if (interactionPhase === 'greeting') {
          onGreetingComplete?.();
        }
      }, 2100));
    }

    return clearVerificationTimers;
  }, [interactionPhase, greetingDisplayed, biometricsRevealed, onGreetingComplete]);

  return (
    <>
      <Header
        hudStage={hudStage}
        shiftTime={currentShift.timeBlock}
        shiftData={currentShift}
        onSettingsPress={onSettingsPress}
        credits={credits}
        resourcesRemaining={resourcesRemaining}
        resourcesPerShift={resourcesPerShift}
      />
      
      <View style={styles.content}>
        <View style={styles.topSection}>
          <ScanPanel
            isScanning={isScanning}
            scanProgress={scanProgress}
            hudStage={hudStage}
            subject={currentSubject}
            subjectIndex={currentSubjectIndex}
            scanningHands={scanningHands}
            businessProbeCount={0}
            dimmed={false}
            biometricsRevealed={biometricsRevealed}
            equipmentFailures={equipmentFailures}
            bpmDataAvailable={bpmDataAvailable}
            interrogationBPM={interrogationBPM}
            isInterrogationActive={isInterrogationActive}
            establishedBPM={establishedBPM}
          />
          <EyeDisplay 
            isScanning={isScanning} 
            scanProgress={scanProgress} 
            videoSource={currentSubject.videoSource}
            eyeVideo={currentSubject.eyeVideo}
            eyeImage={currentSubject.eyeImage}
            videoStartTime={currentSubject.videoStartTime}
            videoEndTime={currentSubject.videoEndTime}
            hudStage={hudStage}
            hasDecision={hasDecision}
            decisionType={decisionOutcome?.type}
            scanningIris={scanningIris}
            subjectLooking={true}
            viewChannel={viewChannel}
            eyeScannerActive={eyeScannerActive}
            onEyeScannerTap={onEyeScannerTap}
            identityScanHoldActive={identityScanHoldActive}
            onIdentityScanHoldStart={() => setIdentityScanHoldActive(true)}
            onIdentityScanHoldEnd={() => setIdentityScanHoldActive(false)}
            interactionPhase={interactionPhase}
            isIdentityScanning={isIdentityScanning}
            onIdentityScanComplete={onIdentityScanComplete}
          />
        </View>
        
          <ScanData 
            id={currentSubject.id}
            isScanning={isScanning}
            scanProgress={scanProgress}
            hudStage={hudStage}
            subject={currentSubject}
            hasDecision={hasDecision}
            decisionType={decisionOutcome?.type}
            onIdentityScan={onIdentityScan}
            onIdentityScanHoldStart={() => setIdentityScanHoldActive(true)}
            onIdentityScanHoldEnd={() => setIdentityScanHoldActive(false)}
            onHealthScan={onHealthScan}
            viewChannel={viewChannel}
            resourcesRemaining={resourcesRemaining}
            identityScanUsed={identityScanUsed}
            healthScanUsed={healthScanUsed}
            activeServices={gatheredInformation?.activeServices || []}
            interactionPhase={interactionPhase}
            subjectResponse={subjectResponse}
            verificationStep={verificationStep}
            onResponseComplete={() => {
              if (interactionPhase === 'greeting') {
                setGreetingDisplayed(true);
              }
            }}
          />

        <IntelPanel
          data={currentSubject}
          hudStage={hudStage}
          hasDecision={hasDecision}
          decisionType={decisionOutcome?.type}
          onRevealVerify={onRevealVerify}
          onOpenDossier={onOpenDossier}
          onInterrogate={onInterrogate}
          biometricsRevealed={biometricsRevealed}
          dossierRevealed={dossierRevealed}
          resourcesRemaining={resourcesRemaining}
          subjectResponse={subjectResponse}
          onResponseUpdate={onResponseUpdate}
          gatheredInformation={gatheredInformation}
          onBPMChange={onBPMChange}
          onInformationUpdate={onInformationUpdate}
          onQueryPerformed={onQueryPerformed}
          interactionPhase={interactionPhase}
          onCredentialsComplete={onCredentialsComplete}
          onEstablishBPM={onEstablishBPM}
          greetingDisplayed={greetingDisplayed}
        />
        
        {/* Decision buttons - always visible */}
        {hudStage === 'full' && (
          <>
            <CitationStrip
              visible={!!citationVisible}
              consequence={consequence || null}
              caseId={currentSubject.id}
              onAcknowledge={() => {
                // Papers, Please-style: acknowledging a violation continues the line.
                onAcknowledgeCitation?.();
                if (hasDecision) {
                  onNext();
                }
              }}
            />
          <DecisionButtons 
            hudStage={hudStage} 
            onDecision={onDecision}
            onNext={onNext}
            disabled={isScanning}
            hasDecision={hasDecision}
            isNewGame={isNewGame}
            hasUsedResource={
              // Require at least 1 resource to be used (ID/Health scan or verification tapes)
              gatheredInformation?.identityScan ||
              gatheredInformation?.healthScan ||
              gatheredInformation?.warrantCheck || 
              gatheredInformation?.transitLog || 
              gatheredInformation?.incidentHistory || 
              false
            }
            protocolStatus={{
              scanComplete: !isScanning,
              credentialViewed: false,
              credentialConfirmed: false,
              credentialVerificationRequired: false,
              credentialVerified: false,
              databaseQueried: false,
              warrantCheckRequired: false,
              warrantChecked: false,
            }}
          />
          </>
        )}
      </View>
    </>
  );
};

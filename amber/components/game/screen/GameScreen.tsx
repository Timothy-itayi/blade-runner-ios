import React, { useState } from 'react';
import { View, Animated, TouchableOpacity, Text } from 'react-native';
import { Header } from '../Header';
import { ScanPanel } from '../ScanPanel';
import { IntelPanel } from '../IntelPanel';
import { DecisionButtons } from '../DecisionButtons';
import { EyeDisplay } from '../../ui/EyeDisplay';
import { ScanData } from '../../ui/ScanData';
import { SubjectData } from '../../../data/subjects';
import { ShiftData } from '../../../constants/shifts';
import { styles } from '../../../styles/game/MainScreen.styles';
import { Theme } from '../../../constants/theme';
import { useGameStore } from '../../../store/gameStore';

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
  equipmentFailures?: string[]; // Phase 2: Equipment failures
  bpmDataAvailable?: boolean; // Phase 2: Is BPM monitor working?
  interrogationBPM?: number | null; // Phase 2: Current BPM during interrogation
  isInterrogationActive?: boolean; // Phase 2: Is interrogation active?
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
  onBioScan,
  bioScanUsed = false,
  dossierRevealed = false,
  subjectResponse = '',
  onResponseUpdate,
  gatheredInformation,
  isNewGame = false,
  onBPMChange,
  onInformationUpdate,
  equipmentFailures = [],
  bpmDataAvailable = true,
  interrogationBPM = null,
  isInterrogationActive = false,
}: GameScreenProps) => {
  // Channel toggle removed - always show facial view
  const viewChannel: 'facial' | 'eye' = 'facial';

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
          />
          <EyeDisplay 
            isScanning={isScanning} 
            scanProgress={scanProgress} 
            videoSource={currentSubject.videoSource}
            eyeVideo={currentSubject.eyeVideo}
            videoStartTime={currentSubject.videoStartTime}
            videoEndTime={currentSubject.videoEndTime}
            hudStage={hudStage}
            hasDecision={hasDecision}
            decisionType={decisionOutcome?.type}
            scanningIris={scanningIris}
            subjectLooking={true}
            viewChannel={viewChannel}
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
            onBioScan={onBioScan}
            viewChannel={viewChannel}
            resourcesRemaining={resourcesRemaining}
            bioScanUsed={bioScanUsed}
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
        />
        
        {/* Decision buttons - always visible */}
        {hudStage === 'full' && (
          <DecisionButtons 
            hudStage={hudStage} 
            onDecision={onDecision}
            onNext={onNext}
            disabled={isScanning}
            hasDecision={hasDecision}
            isNewGame={isNewGame}
            hasUsedResource={
              // Phase 2: Require at least 1 resource to be used (bio scan, warrant check, transit log, or incident history)
              gatheredInformation?.bioScan || 
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
        )}
      </View>
    </>
  );
};

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
  dossierRevealed?: boolean;
  subjectResponse?: string;
  onResponseUpdate?: (response: string) => void;
  isNewGame?: boolean;
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
  dossierRevealed = false,
  subjectResponse = '',
  onResponseUpdate,
  isNewGame = false,
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

import { useState, useRef } from 'react';
import { Animated } from 'react-native';
import { SubjectData } from '../data/subjects';
import { ShiftData } from '../constants/shifts';
import { Outcome } from '../data/subjects';
import { ShiftDecision } from '../components/game/ShiftTransition';

export interface GameState {
  // Subject tracking
  currentSubjectIndex: number;
  isScanning: boolean;
  hasDecision: boolean;
  decisionOutcome: { type: 'APPROVE' | 'DENY', outcome: Outcome } | null;
  
  // Verification state
  hasVerified: boolean;
  credentialViewed: boolean;
  credentialVerified: boolean;
  credentialConfirmed: boolean;
  databaseQueried: boolean;
  warrantChecked: boolean;
  credentialsRequested: boolean;
  credentialsReceived: boolean;
  
  // Scanning state
  scanningHands: boolean;
  scanningIris: boolean;
  hasDiscrepancy: boolean;
  scanPanelDimmed: boolean;
  biometricsRevealed: boolean;
  
  // Shift tracking
  showShiftTransition: boolean;
  shiftStats: { approved: number; denied: number; correct: number };
  totalCorrectDecisions: number;
  totalAccuracy: number;
  infractions: number;
  triggerConsequence: boolean;
  messageHistory: string[];
  shiftDecisions: ShiftDecision[];
  
  // Credits
  credits: number;
  familyNeeds: { food: number; medicine: number; housing: number };
  daysPassed: number;
  
  // UI state
  showVerify: boolean;
  showDossier: boolean;
  showInterrogate: boolean;
  showBioScan: boolean;
  bioScanRevealed: boolean;
  showSettings: boolean;
  subjectsProcessed: number;
  subjectResponse: string;
}

export const useGameState = (initialCredits: number = 100) => {
  const [currentSubjectIndex, setCurrentSubjectIndex] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [hasDecision, setHasDecision] = useState(false);
  const [decisionOutcome, setDecisionOutcome] = useState<{ type: 'APPROVE' | 'DENY', outcome: Outcome } | null>(null);
  
  const [hasVerified, setHasVerified] = useState(false);
  const [credentialViewed, setCredentialViewed] = useState(false);
  const [credentialVerified, setCredentialVerified] = useState(false);
  const [credentialConfirmed, setCredentialConfirmed] = useState(false);
  const [databaseQueried, setDatabaseQueried] = useState(false);
  const [warrantChecked, setWarrantChecked] = useState(false);
  const [credentialsRequested, setCredentialsRequested] = useState(false);
  const [credentialsReceived, setCredentialsReceived] = useState(false);
  
  const [scanningHands, setScanningHands] = useState(false);
  const [scanningIris, setScanningIris] = useState(false);
  const [hasDiscrepancy, setHasDiscrepancy] = useState(false);
  const [scanPanelDimmed, setScanPanelDimmed] = useState(false);
  const [biometricsRevealed, setBiometricsRevealed] = useState(false);
  const [dossierRevealed, setDossierRevealed] = useState(false);
  
  const [showShiftTransition, setShowShiftTransition] = useState(false);
  const [shiftStats, setShiftStats] = useState({ approved: 0, denied: 0, correct: 0 });
  const [totalCorrectDecisions, setTotalCorrectDecisions] = useState(0);
  const [totalAccuracy, setTotalAccuracy] = useState(1.0);
  const [infractions, setInfractions] = useState(0);
  const [triggerConsequence, setTriggerConsequence] = useState(false);
  const [messageHistory, setMessageHistory] = useState<string[]>([]);
  const [shiftDecisions, setShiftDecisions] = useState<ShiftDecision[]>([]);
  
  const [credits, setCredits] = useState(initialCredits);
  const [familyNeeds, setFamilyNeeds] = useState({
    food: 50,
    medicine: 200,
    housing: 500,
  });
  const [daysPassed, setDaysPassed] = useState(0);
  
  const [showVerify, setShowVerify] = useState(false);
  const [showDossier, setShowDossier] = useState(false);
  const [showInterrogate, setShowInterrogate] = useState(false);
  const [showBioScan, setShowBioScan] = useState(false);
  const [bioScanRevealed, setBioScanRevealed] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [subjectsProcessed, setSubjectsProcessed] = useState(0);
  const [subjectResponse, setSubjectResponse] = useState<string>('');
  
  const scanProgress = useRef(new Animated.Value(0)).current;
  
  return {
    // State
    currentSubjectIndex,
    setCurrentSubjectIndex,
    isScanning,
    setIsScanning,
    hasDecision,
    setHasDecision,
    decisionOutcome,
    setDecisionOutcome,
    hasVerified,
    setHasVerified,
    credentialViewed,
    setCredentialViewed,
    credentialVerified,
    setCredentialVerified,
    credentialConfirmed,
    setCredentialConfirmed,
    databaseQueried,
    setDatabaseQueried,
    warrantChecked,
    setWarrantChecked,
    credentialsRequested,
    setCredentialsRequested,
    credentialsReceived,
    setCredentialsReceived,
    scanningHands,
    setScanningHands,
    scanningIris,
    setScanningIris,
    hasDiscrepancy,
    setHasDiscrepancy,
    scanPanelDimmed,
    setScanPanelDimmed,
    biometricsRevealed,
    setBiometricsRevealed,
    dossierRevealed,
    setDossierRevealed,
    showShiftTransition,
    setShowShiftTransition,
    shiftStats,
    setShiftStats,
    totalCorrectDecisions,
    setTotalCorrectDecisions,
    totalAccuracy,
    setTotalAccuracy,
    infractions,
    setInfractions,
    triggerConsequence,
    setTriggerConsequence,
    messageHistory,
    setMessageHistory,
    shiftDecisions,
    setShiftDecisions,
    credits,
    setCredits,
    familyNeeds,
    setFamilyNeeds,
    daysPassed,
    setDaysPassed,
    showVerify,
    setShowVerify,
    showDossier,
    setShowDossier,
    showInterrogate,
    setShowInterrogate,
    showBioScan,
    setShowBioScan,
    bioScanRevealed,
    setBioScanRevealed,
    showSettings,
    setShowSettings,
    subjectsProcessed,
    setSubjectsProcessed,
    subjectResponse,
    setSubjectResponse,
    scanProgress,
  };
};

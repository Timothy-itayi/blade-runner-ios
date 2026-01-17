import React, { useState, useEffect, useRef } from 'react';
import { View, SafeAreaView, Animated, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Header } from '../components/Header';
import { ScanPanel } from '../components/ScanPanel';
import { EyeDisplay } from '../components/EyeDisplay';
import { ScanData } from '../components/ScanData';
import { IntelPanel } from '../components/IntelPanel';
import { DecisionButtons } from '../components/DecisionButtons';
import { OnboardingModal } from '../components/OnboardingModal';
import { BootSequence } from '../components/BootSequence';
import { VerificationDrawer } from '../components/VerificationDrawer';
import { styles } from '../styles/MainScreen.styles';
import { SUBJECTS, Outcome } from '../data/subjects';

const DEV_MODE = false; // Set to true to bypass onboarding and boot

export default function MainScreen() {
  const [showOnboarding, setShowOnboarding] = useState(!DEV_MODE);
  const [isBooting, setIsBooting] = useState(false);
  const [gameActive, setGameActive] = useState(DEV_MODE);
  const [showVerify, setShowVerify] = useState(false);
  const [hudStage, setHudStage] = useState<'none' | 'wireframe' | 'outline' | 'full'>(DEV_MODE ? 'full' : 'none');
  const [currentSubjectIndex, setCurrentSubjectIndex] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [hasVerified, setHasVerified] = useState(false);
  const [decisionHistory, setDecisionHistory] = useState<Record<string, 'APPROVE' | 'DENY'>>({});
  const [decisionOutcome, setDecisionOutcome] = useState<{ type: 'APPROVE' | 'DENY', outcome: Outcome } | null>(null);

  const scanProgress = useRef(new Animated.Value(0)).current;
  const gameOpacity = useRef(new Animated.Value(DEV_MODE ? 1 : 0)).current;

  // Get the current subject data with narrative variants applied
  const getSubjectData = (index: number) => {
    const base = SUBJECTS[index];
    if (!base.narrativeVariants) return base;

    let modified = { ...base };
    base.narrativeVariants.forEach(variant => {
      const pastDecision = decisionHistory[variant.linkedId];
      if (pastDecision === 'APPROVE' && variant.onApprove) {
        modified = { ...modified, ...variant.onApprove };
      } else if (pastDecision === 'DENY' && variant.onDeny) {
        modified = { ...modified, ...variant.onDeny };
      }
    });
    return modified;
  };

  const currentSubject = getSubjectData(currentSubjectIndex);

  const triggerScan = () => {
    setIsScanning(true);
    scanProgress.setValue(0);
    Animated.timing(scanProgress, {
      toValue: 1,
      duration: 8000,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    if (DEV_MODE) {
      triggerScan();
    }
  }, []);

  const startBoot = () => {
    setShowOnboarding(false);
    setIsBooting(true);
  };

  const handleBootComplete = () => {
    setIsBooting(false);
    setGameActive(true);
    
    // Start initial build sequence
    Animated.sequence([
      Animated.timing(gameOpacity, { toValue: 0.4, duration: 150, useNativeDriver: true }),
      Animated.timing(gameOpacity, { toValue: 0, duration: 100, useNativeDriver: true }),
      Animated.timing(gameOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start(() => {
      // The hudStage now acts as a global "System Power Up" signal.
      // Individual components will handle their own internal construction 
      // based on the BUILD_SEQUENCE constants.
      setHudStage('wireframe');
      
      // Snappier transitions to match the "quick refresh" feel Jarvis likes.
      // The components now handle their own build staggers via BUILD_SEQUENCE.
      setTimeout(() => {
        setHudStage('outline');
      }, 400); 

      setTimeout(() => {
        setHudStage('full');
        // Trigger scan immediately when HUD goes full to ensure 
        // data scrambling starts as the UI elements build in.
        triggerScan();
      }, 1200); 
    });
  };

  const handleDecision = (type: 'APPROVE' | 'DENY') => {
    if (!hasVerified) return;

    // Save decision to history using the subject's unique ID
    setDecisionHistory(prev => ({
      ...prev,
      [currentSubject.id]: type
    }));

    let outcome = { ...currentSubject.outcomes[type] };
    
    // Rule: First 10 subjects (Phase 1 Setup) have no consequences revealed immediately
    // This maintains the "straightforward" illusion before the echoes begin.
    if (currentSubjectIndex < 10) {
      outcome.consequence = 'SILENT';
    }

    setDecisionOutcome({ type, outcome });
  };

  const nextSubject = () => {
    setDecisionOutcome(null);
    setShowVerify(false);
    setHasVerified(false);
    setIsScanning(false);
    const nextIndex = (currentSubjectIndex + 1) % SUBJECTS.length;
    setCurrentSubjectIndex(nextIndex);
    
    // Small delay before starting next scan
    setTimeout(triggerScan, 500);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {showOnboarding && (
          <OnboardingModal 
            visible={showOnboarding} 
            onDismiss={startBoot} 
          />
        )}

        {isBooting && (
          <BootSequence onComplete={handleBootComplete} />
        )}

        {gameActive && (
          <Animated.View style={[styles.container, { opacity: gameOpacity }]}>
            <Header hudStage={hudStage} />
            
            <View style={styles.content}>
              <View style={styles.topSection}>
                <ScanPanel 
                  isScanning={isScanning} 
                  scanProgress={scanProgress} 
                  hudStage={hudStage} 
                  subject={currentSubject}
                />
                <EyeDisplay 
                  isScanning={isScanning} 
                  scanProgress={scanProgress} 
                  videoSource={currentSubject.videoSource} 
                  hudStage={hudStage}
                />
              </View>
              
              <ScanData 
                id={currentSubject.id} 
                isScanning={isScanning} 
                scanProgress={scanProgress} 
                hudStage={hudStage}
                subject={currentSubject}
              />
              
              <IntelPanel 
                data={currentSubject} 
                index={currentSubjectIndex}
                hudStage={hudStage} 
                onRevealVerify={() => {
                  setShowVerify(true);
                  setHasVerified(true);
                }}
              />
            </View>

            <DecisionButtons 
              hudStage={hudStage} 
              onDecision={handleDecision}
              disabled={!hasVerified}
            />

            {showVerify && (
              <VerificationDrawer 
                subject={currentSubject} 
                onClose={() => setShowVerify(false)} 
              />
            )}

            {decisionOutcome && (
              <View style={[StyleSheet.absoluteFill, { 
                backgroundColor: 'rgba(10, 12, 15, 0.95)',
                justifyContent: 'center',
                alignItems: 'center',
                padding: 40,
                zIndex: 3000,
              }]}>
                <Text style={{ 
                  color: decisionOutcome.type === 'APPROVE' ? '#4a8a5a' : '#d4534a', 
                  fontSize: 24, 
                  fontFamily: 'ShareTechMono_400Regular',
                  marginBottom: 20,
                  textAlign: 'center'
                }}>
                  {decisionOutcome.outcome.feedback}
                </Text>
                
                {decisionOutcome.outcome.consequence !== 'SILENT' && (
                  <Text style={{ 
                    color: '#7fb8d8', 
                    fontSize: 16, 
                    fontFamily: 'ShareTechMono_400Regular',
                    textAlign: 'center',
                    marginBottom: 40,
                    lineHeight: 24
                  }}>
                    CONSEQUENCE: {decisionOutcome.outcome.consequence}
                  </Text>
                )}

                <TouchableOpacity 
                  onPress={nextSubject}
                  style={{
                    borderWidth: 1,
                    borderColor: '#c9a227',
                    paddingHorizontal: 30,
                    paddingVertical: 12,
                    backgroundColor: 'rgba(201, 162, 39, 0.1)'
                  }}
                >
                  <Text style={{ color: '#c9a227', fontFamily: 'ShareTechMono_400Regular', fontSize: 14 }}>[ NEXT SUBJECT ]</Text>
                </TouchableOpacity>
              </View>
            )}
          </Animated.View>
        )}
      </View>
    </SafeAreaView>
  );
}

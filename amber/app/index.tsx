import React, { useState, useEffect, useRef } from 'react';
import { View, SafeAreaView, Animated, Text, TouchableOpacity } from 'react-native';
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

const DEV_MODE = true; // Set to true to bypass onboarding and boot

export default function MainScreen() {
  const [showOnboarding, setShowOnboarding] = useState(!DEV_MODE);
  const [isBooting, setIsBooting] = useState(false);
  const [gameActive, setGameActive] = useState(DEV_MODE);
  const [showVerify, setShowVerify] = useState(false);
  const [hudStage, setHudStage] = useState<'none' | 'wireframe' | 'outline' | 'full'>(DEV_MODE ? 'full' : 'none');
  const [currentSubjectIndex, setCurrentSubjectIndex] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [decisionOutcome, setDecisionOutcome] = useState<{ type: 'APPROVE' | 'DENY', outcome: Outcome } | null>(null);
  
  const scanProgress = useRef(new Animated.Value(0)).current;
  const gameOpacity = useRef(new Animated.Value(DEV_MODE ? 1 : 0)).current;

  const currentSubject = SUBJECTS[currentSubjectIndex];

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
    
    // Initial flicker
    Animated.sequence([
      Animated.timing(gameOpacity, { toValue: 0.2, duration: 100, useNativeDriver: true }),
      Animated.timing(gameOpacity, { toValue: 0, duration: 50, useNativeDriver: true }),
      Animated.timing(gameOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start(() => {
      // Sequential "Growth" Sequence
      setHudStage('wireframe');
      
      setTimeout(() => {
        setHudStage('outline');
      }, 2000); // Increased stay in wireframe/static

      setTimeout(() => {
        setHudStage('full');
        // triggerScan will now happen after the slow fade finishes
        setTimeout(triggerScan, 2000); 
      }, 6000); // Much longer wait for full reveal
    });
  };

  const handleDecision = (type: 'APPROVE' | 'DENY') => {
    const outcome = currentSubject.outcomes[type];
    setDecisionOutcome({ type, outcome });
  };

  const nextSubject = () => {
    setDecisionOutcome(null);
    setShowVerify(false);
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
                currentSubjectIndex={currentSubjectIndex}
              />
              
              <IntelPanel 
                data={currentSubject} 
                hudStage={hudStage} 
                onRevealVerify={() => setShowVerify(true)}
                outcome={decisionOutcome}
                onNext={nextSubject}
              />
            </View>

            <DecisionButtons 
              hudStage={hudStage} 
              onDecision={handleDecision}
            />

            {showVerify && (
              <VerificationDrawer 
                subject={currentSubject} 
                onClose={() => setShowVerify(false)} 
              />
            )}
          </Animated.View>
        )}
      </View>
    </SafeAreaView>
  );
}

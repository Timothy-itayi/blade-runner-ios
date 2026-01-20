import React, { useEffect, useRef } from 'react';
import { View, TouchableOpacity, Text, Animated } from 'react-native';
import { styles } from '../../styles/game/DecisionButtons.styles';
import { HUDBox } from '../ui/HUDBox';
import { BUILD_SEQUENCE } from '../../constants/animations';
import { TypewriterText } from '../ui/ScanData';
import { useGameAudioContext } from '../../contexts/AudioContext';

interface ProtocolStatus {
  scanComplete: boolean;
  credentialViewed: boolean;
  credentialConfirmed: boolean; // Credential has been scanned/confirmed
  credentialVerificationRequired: boolean;
  credentialVerified: boolean;
  databaseQueried: boolean;
  warrantCheckRequired: boolean;
  warrantChecked: boolean;
  probesRequired?: boolean;
  probesCompleted?: boolean;
  isCleanSubject?: boolean;
}

export const DecisionButtons = ({ 
  hudStage, 
  onDecision,
  onNext,
  disabled,
  hasDecision,
  protocolStatus,
}: { 
  hudStage: 'none' | 'wireframe' | 'outline' | 'full',
  onDecision: (type: 'APPROVE' | 'DENY') => void,
  onNext: () => void,
  disabled: boolean,
  hasDecision: boolean,
  protocolStatus?: ProtocolStatus,
}) => {
  const fillOpacity = useRef(new Animated.Value(0)).current;
  const { playButtonSound } = useGameAudioContext();

  const handleDecision = (type: 'APPROVE' | 'DENY') => {
    playButtonSound();
    onDecision(type);
  };

  useEffect(() => {
    // Buttons start dim and only light up when credentials are verified through the verification modal
    if (hudStage === 'full' && credentialVerified) {
      Animated.timing(fillOpacity, {
        toValue: 1,
        duration: 800,
        delay: BUILD_SEQUENCE.decisionButtons + 500,
        useNativeDriver: true,
      }).start();
    } else {
      fillOpacity.setValue(0);
    }
  }, [hudStage, credentialVerified]);

  // Calculate disabled states based on protocol
  const ps = protocolStatus || {
    scanComplete: true,
    credentialViewed: false,
    credentialConfirmed: false,
    credentialVerificationRequired: false,
    credentialVerified: false,
    databaseQueried: false,
    warrantCheckRequired: false,
    warrantChecked: false,
    probesRequired: false,
    probesCompleted: true,
  };

  // Buttons light up when credentials are verified through the verification modal
  // credentialVerified is true when verification completes OR when credential already has a status (CONFIRMED/EXPIRED)
  const credentialVerified = ps.credentialVerified;

  // Player always has the right to choose approve or deny once scan is complete
  // System checks are informational only - they provide status but don't block decisions
  // The border color in CredentialModal shows system status, but player can override
  
  // Only require scan completion - all other checks are informational
  const approveDisabled = disabled || !ps.scanComplete;
  const denyDisabled = disabled || !ps.scanComplete;

  // When decision is made, buttons are disabled and we wait for auto-advance
  if (hasDecision) {
    return (
      <HUDBox hudStage={hudStage} style={styles.container}>
        <View style={styles.buttonRow}>
          <View style={[styles.button, styles.buttonDisabled]}>
            <Text style={[styles.buttonText, styles.buttonTextDisabled]}>APPROVE</Text>
          </View>
          <View style={[styles.button, styles.buttonDisabled]}>
            <Text style={[styles.buttonText, styles.buttonTextDisabled]}>DENY</Text>
          </View>
        </View>
      </HUDBox>
    );
  }

  return (
    <HUDBox hudStage={hudStage} style={styles.container} buildDelay={BUILD_SEQUENCE.decisionButtons}>
      <View style={styles.buttonRow}>
        <TouchableOpacity 
          style={[
            styles.button, 
            styles.approveButton,
            approveDisabled && styles.buttonDisabled
          ]} 
          onPress={() => handleDecision('APPROVE')}
          disabled={approveDisabled}
        >
          <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(74, 138, 90, 0.1)', opacity: fillOpacity }]} />
          <TypewriterText 
            text="APPROVE" 
            active={hudStage !== 'none'} 
            delay={BUILD_SEQUENCE.decisionButtons + 800} 
            style={[styles.buttonText, approveDisabled && styles.buttonTextDisabled]} 
          />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.button, 
            styles.denyButton,
            denyDisabled && styles.buttonDisabled
          ]} 
          onPress={() => handleDecision('DENY')}
          disabled={denyDisabled}
        >
          <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(212, 83, 74, 0.1)', opacity: fillOpacity }]} />
          <TypewriterText 
            text="DENY" 
            active={hudStage !== 'none'} 
            delay={BUILD_SEQUENCE.decisionButtons + 1000} 
            style={[styles.buttonText, denyDisabled && styles.buttonTextDisabled]} 
          />
        </TouchableOpacity>
      </View>
    </HUDBox>
  );
};

import { Theme } from '../../constants/theme';
const StyleSheet = require('react-native').StyleSheet;

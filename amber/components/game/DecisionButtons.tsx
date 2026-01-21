import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { styles } from '../../styles/game/DecisionButtons.styles';
import { HUDBox } from '../ui/HUDBox';
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
  isNewGame = false,
  hasUsedResource = false, // Phase 2: Require at least 1 resource to be used
}: { 
  hudStage: 'none' | 'wireframe' | 'outline' | 'full',
  onDecision: (type: 'APPROVE' | 'DENY') => void,
  onNext: () => void,
  disabled: boolean,
  hasDecision: boolean,
  protocolStatus?: ProtocolStatus,
  isNewGame?: boolean, // Only animate on first game start
  hasUsedResource?: boolean, // Phase 2: At least 1 resource must be used before decisions
}) => {
  const { playButtonSound } = useGameAudioContext();

  const handleDecision = (type: 'APPROVE' | 'DENY') => {
    // Buttons are non-functional until game mechanics are added
    if (disabled) return;
    playButtonSound();
    onDecision(type);
  };

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

  // Phase 2: Require at least 1 resource to be used before decisions are allowed
  // This ensures players gather some information before making decisions
  const approveDisabled = disabled || !ps.scanComplete || !hasUsedResource;
  const denyDisabled = disabled || !ps.scanComplete || !hasUsedResource;

  // When decision is made, show disabled decision buttons and a "Next" button for player control
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
        <TouchableOpacity
          style={[styles.button, styles.nextButton]}
          onPress={() => {
            playButtonSound();
            onNext();
          }}
        >
          <Text style={styles.buttonText}>NEXT</Text>
        </TouchableOpacity>
      </HUDBox>
    );
  }

  // No animations - always show buttons immediately
  return (
    <HUDBox hudStage={hudStage} style={styles.container}>
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
          <Text style={[styles.buttonText, approveDisabled && styles.buttonTextDisabled]}>
            APPROVE
          </Text>
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
          <Text style={[styles.buttonText, denyDisabled && styles.buttonTextDisabled]}>
            DENY
          </Text>
        </TouchableOpacity>
      </View>
    </HUDBox>
  );
};

import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { styles } from '../../styles/game/DecisionButtons.styles';
import { HUDBox } from '../ui/HUDBox';
import { MechanicalButton } from '../ui/MechanicalUI';
import { useGameAudioContext } from '../../contexts/AudioContext';
import { Theme } from '../../constants/theme';

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
  disabled,
  hasDecision,
  protocolStatus,
  isNewGame = false,
}: { 
  hudStage: 'none' | 'wireframe' | 'outline' | 'full',
  onDecision: (type: 'APPROVE' | 'DENY') => void,
  disabled: boolean,
  hasDecision: boolean,
  protocolStatus?: ProtocolStatus,
  isNewGame?: boolean, // Only animate on first game start
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

  const approveDisabled = disabled || !ps.scanComplete;
  const denyDisabled = disabled || !ps.scanComplete;

  // When decision is made, show disabled decision buttons and a "Next" button for player control
  if (hasDecision) {
    return (
      <HUDBox hudStage={hudStage} style={styles.container} mechanical>
        <View style={styles.buttonRow}>
          <MechanicalButton label="ALLOW" onPress={() => {}} disabled color={Theme.colors.accentApprove} style={{ flex: 1 }} />
          <MechanicalButton label="REJECT" onPress={() => {}} disabled color={Theme.colors.accentDeny} style={{ flex: 1 }} />
        </View>
      </HUDBox>
    );
  }

  // No animations - always show buttons immediately
  return (
    <HUDBox hudStage={hudStage} style={styles.container} mechanical>
      <View style={styles.buttonRow}>
        <MechanicalButton 
          label="ALLOW" 
          onPress={() => handleDecision('APPROVE')} 
          disabled={approveDisabled} 
          color={Theme.colors.accentApprove}
          style={{ flex: 1 }}
        />
        <MechanicalButton 
          label="REJECT" 
          onPress={() => handleDecision('DENY')} 
          disabled={denyDisabled} 
          color={Theme.colors.accentDeny}
          style={{ flex: 1 }}
        />
      </View>
    </HUDBox>
  );
};

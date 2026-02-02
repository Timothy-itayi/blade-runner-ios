import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { styles } from '../../styles/game/DecisionButtons.styles';
import { HUDBox } from '../ui/HUDBox';
import { MechanicalButton } from '../ui/MechanicalUI';
import { Theme } from '../../constants/theme';
import { LabelTape } from '../ui/LabelTape';

// Metal texture
const METAL_TEXTURE = require('../../assets/textures/Texturelabs_Metal_264S.jpg');

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
  const handleDecision = (type: 'APPROVE' | 'DENY') => {
    // Buttons are non-functional until game mechanics are added
    if (disabled) return;
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
      <View style={buttonStyles.controlPanel}>
        {/* Metal texture background */}
        <View style={buttonStyles.textureContainer}>
          <Image source={METAL_TEXTURE} style={buttonStyles.texture} contentFit="cover" />
          <View style={buttonStyles.textureTint} />
        </View>
        
        <HUDBox hudStage={hudStage} style={styles.container} mechanical>
          <View style={styles.buttonRow}>
            <MechanicalButton 
              label="ALLOW" 
              onPress={() => {}} 
              disabled 
              color={Theme.colors.accentApprove} 
              style={{ flex: 1 }}
              showLED
              ledColor="green"
              ledActive={false}
            />
            <MechanicalButton 
              label="REJECT" 
              onPress={() => {}} 
              disabled 
              color={Theme.colors.accentDeny} 
              style={{ flex: 1 }}
              showLED
              ledColor="red"
              ledActive={false}
            />
          </View>
        </HUDBox>
      </View>
    );
  }

  // No animations - always show buttons immediately
  return (
    <View style={buttonStyles.controlPanel}>
      {/* Metal texture background */}
      <View style={buttonStyles.textureContainer}>
        <Image source={METAL_TEXTURE} style={buttonStyles.texture} contentFit="cover" />
        <View style={buttonStyles.textureTint} />
      </View>
      
      {/* Label tape heading */}
      <View style={buttonStyles.labelRow}>
        <LabelTape text="CLEARANCE" variant="cream" size="small" />
      </View>
      
      <HUDBox hudStage={hudStage} style={styles.container} mechanical>
        <View style={styles.buttonRow}>
          <MechanicalButton 
            label="ALLOW" 
            onPress={() => handleDecision('APPROVE')} 
            disabled={approveDisabled} 
            color={Theme.colors.accentApprove}
            style={{ flex: 1 }}
            showLED
            ledColor="green"
            ledActive={!approveDisabled}
          />
          <MechanicalButton 
            label="REJECT" 
            onPress={() => handleDecision('DENY')} 
            disabled={denyDisabled} 
            color={Theme.colors.accentDeny}
            style={{ flex: 1 }}
            showLED
            ledColor="red"
            ledActive={!denyDisabled}
          />
        </View>
      </HUDBox>
    </View>
  );
};

// Control panel styles
const buttonStyles = StyleSheet.create({
  controlPanel: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 3,
    marginHorizontal: 4,
    // Inset panel effect
    borderWidth: 2,
    borderTopColor: 'rgba(0,0,0,0.5)',
    borderLeftColor: 'rgba(0,0,0,0.4)',
    borderBottomColor: 'rgba(80,85,95,0.3)',
    borderRightColor: 'rgba(80,85,95,0.25)',
  },
  textureContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  texture: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.15,
  },
  textureTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(30, 34, 42, 0.92)',
  },
  labelRow: {
    paddingHorizontal: 12,
    paddingTop: 6,
  },
});

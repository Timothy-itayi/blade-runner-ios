import React, { useEffect, useRef } from 'react';
import { View, TouchableOpacity, Text, Animated } from 'react-native';
import { styles } from '../styles/DecisionButtons.styles';
import { HUDBox } from './HUDBox';
import { BUILD_SEQUENCE } from '../constants/animations';
import { TypewriterText } from './ScanData';

interface ProtocolStatus {
  scanComplete: boolean;
  credentialViewed: boolean;
  credentialVerificationRequired: boolean;
  credentialVerified: boolean;
  databaseQueried: boolean;
  warrantCheckRequired: boolean;
  warrantChecked: boolean;
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

  useEffect(() => {
    if (hudStage === 'full') {
      Animated.timing(fillOpacity, {
        toValue: 1,
        duration: 800,
        delay: BUILD_SEQUENCE.decisionButtons + 500,
        useNativeDriver: true,
      }).start();
    } else {
      fillOpacity.setValue(0);
    }
  }, [hudStage]);

  // Calculate disabled states based on protocol
  const ps = protocolStatus || { 
    scanComplete: true, 
    credentialViewed: false, 
    credentialVerificationRequired: false, 
    credentialVerified: false,
    databaseQueried: false,
    warrantCheckRequired: false,
    warrantChecked: false,
  };
  
  // Check individual requirements
  const needsCredentialView = !ps.credentialViewed;
  const needsCredentialVerify = ps.credentialVerificationRequired && !ps.credentialVerified;
  const needsDatabaseQuery = !ps.databaseQueried;
  const needsWarrantCheck = ps.warrantCheckRequired && !ps.warrantChecked;

  // APPROVE requires ALL checks complete
  const approveDisabled = disabled || 
    !ps.scanComplete || 
    needsCredentialView || 
    needsCredentialVerify ||
    needsDatabaseQuery ||
    needsWarrantCheck;
  
  // DENY requires: scan + credential viewed + database queried (can deny without full verification)
  const denyDisabled = disabled || 
    !ps.scanComplete || 
    needsCredentialView ||
    needsDatabaseQuery;

  // Protocol status message - show first incomplete step
  const getProtocolMessage = () => {
    if (!ps.scanComplete) return 'AWAITING SCAN...';
    if (needsCredentialView) return 'REVIEW CREDENTIAL';
    if (needsDatabaseQuery) return 'RUN DATABASE QUERY';
    if (needsWarrantCheck) return 'WARRANT CHECK REQUIRED';
    if (needsCredentialVerify) return 'VERIFY CREDENTIAL FOR APPROVAL';
    return 'PROTOCOL COMPLETE';
  };

  const isProtocolComplete = ps.scanComplete && 
    !needsCredentialView && 
    !needsCredentialVerify && 
    !needsDatabaseQuery && 
    !needsWarrantCheck;

  if (hasDecision) {
    return (
      <HUDBox hudStage={hudStage} style={styles.container}>
        <TouchableOpacity 
          style={[
            styles.button, 
            { borderColor: Theme.colors.accentWarn, flex: 1, height: 60 }
          ]} 
          onPress={onNext}
        >
          <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(201, 162, 39, 0.1)', opacity: 1 }]} />
          <Text style={[styles.buttonText, { color: Theme.colors.accentWarn, fontSize: 18 }]}>[ NEXT SUBJECT ]</Text>
        </TouchableOpacity>
      </HUDBox>
    );
  }

  return (
    <HUDBox hudStage={hudStage} style={styles.container} buildDelay={BUILD_SEQUENCE.decisionButtons}>
      {/* Protocol Status Indicator */}
      <View style={styles.protocolStatus}>
        <Text style={[
          styles.protocolText, 
          isProtocolComplete ? styles.protocolComplete : styles.protocolPending
        ]}>
          {isProtocolComplete ? '●' : '○'} {getProtocolMessage()}
        </Text>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity 
          style={[
            styles.button, 
            styles.approveButton,
            approveDisabled && styles.buttonDisabled
          ]} 
          onPress={() => onDecision('APPROVE')}
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
          onPress={() => onDecision('DENY')}
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

import { Theme } from '../constants/theme';
const StyleSheet = require('react-native').StyleSheet;

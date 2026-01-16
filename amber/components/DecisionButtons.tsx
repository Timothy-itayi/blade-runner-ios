import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { styles } from '../styles/DecisionButtons.styles';
import { HUDBox } from './HUDBox';

export const DecisionButtons = ({ 
  hudStage, 
  onDecision,
  disabled
}: { 
  hudStage: 'none' | 'wireframe' | 'outline' | 'full',
  onDecision: (type: 'APPROVE' | 'DENY') => void,
  disabled: boolean
}) => {
  return (
    <HUDBox hudStage={hudStage} style={styles.container}>
      <TouchableOpacity 
        style={[
          styles.button, 
          styles.approveButton,
          disabled && { opacity: 0.2 }
        ]} 
        onPress={() => onDecision('APPROVE')}
        disabled={disabled}
      >
        <Text style={[styles.buttonText, disabled && { color: '#3a5a6a' }]}>APPROVE</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[
          styles.button, 
          styles.denyButton,
          disabled && { opacity: 0.2 }
        ]} 
        onPress={() => onDecision('DENY')}
        disabled={disabled}
      >
        <Text style={[styles.buttonText, disabled && { color: '#3a5a6a' }]}>DENY</Text>
      </TouchableOpacity>
    </HUDBox>
  );
};

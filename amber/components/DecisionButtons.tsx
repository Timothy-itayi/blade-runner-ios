import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { styles } from '../styles/DecisionButtons.styles';
import { HUDBox } from './HUDBox';

export const DecisionButtons = ({ 
  hudStage, 
  onDecision 
}: { 
  hudStage: 'none' | 'wireframe' | 'outline' | 'full',
  onDecision: (type: 'APPROVE' | 'DENY') => void
}) => {
  return (
    <HUDBox hudStage={hudStage} style={styles.container}>
      <TouchableOpacity 
        style={[styles.button, styles.approveButton]} 
        onPress={() => onDecision('APPROVE')}
      >
        <Text style={styles.buttonText}>APPROVE</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.button, styles.denyButton]} 
        onPress={() => onDecision('DENY')}
      >
        <Text style={styles.buttonText}>DENY</Text>
      </TouchableOpacity>
    </HUDBox>
  );
};

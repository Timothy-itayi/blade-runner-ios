import React, { useEffect, useRef } from 'react';
import { View, TouchableOpacity, Text, Animated } from 'react-native';
import { styles } from '../styles/DecisionButtons.styles';
import { HUDBox } from './HUDBox';
import { BUILD_SEQUENCE } from '../constants/animations';
import { TypewriterText } from './ScanData';

export const DecisionButtons = ({ 
  hudStage, 
  onDecision,
  disabled
}: { 
  hudStage: 'none' | 'wireframe' | 'outline' | 'full',
  onDecision: (type: 'APPROVE' | 'DENY') => void,
  disabled: boolean
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

  return (
    <HUDBox hudStage={hudStage} style={styles.container} buildDelay={BUILD_SEQUENCE.decisionButtons}>
      <TouchableOpacity 
        style={[
          styles.button, 
          styles.approveButton,
          disabled && { opacity: 0.2 }
        ]} 
        onPress={() => onDecision('APPROVE')}
        disabled={disabled}
      >
        <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(74, 138, 90, 0.1)', opacity: fillOpacity }]} />
        <TypewriterText 
          text="APPROVE" 
          active={hudStage !== 'none'} 
          delay={BUILD_SEQUENCE.decisionButtons + 800} 
          style={[styles.buttonText, disabled && { color: '#3a5a6a' }]} 
        />
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
        <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(212, 83, 74, 0.1)', opacity: fillOpacity }]} />
        <TypewriterText 
          text="DENY" 
          active={hudStage !== 'none'} 
          delay={BUILD_SEQUENCE.decisionButtons + 1000} 
          style={[styles.buttonText, disabled && { color: '#3a5a6a' }]} 
        />
      </TouchableOpacity>
    </HUDBox>
  );
};

const StyleSheet = require('react-native').StyleSheet;

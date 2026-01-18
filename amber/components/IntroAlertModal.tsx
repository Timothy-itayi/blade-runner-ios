import React from 'react';
import { View, Text, Animated, Pressable } from 'react-native';
import { styles } from '../styles/HomeScreen.styles';

interface IntroAlertModalProps {
  visible: boolean;
  opacity: Animated.Value;
  scale: Animated.Value;
  onAuthenticate: () => void;
}

export const IntroAlertModal = ({ 
  visible, 
  opacity, 
  scale, 
  onAuthenticate 
}: IntroAlertModalProps) => {
  if (!visible) return null;

  return (
    <Animated.View style={[styles.alertContainer, { opacity }]}>
      <Animated.View 
        style={[
          styles.alertBox, 
          { transform: [{ scale }] }
        ]}
      >
        <View style={styles.alertHeader}>
          <View style={styles.alertIcon}>
            <Text style={styles.alertIconText}>⚠</Text>
          </View>
          <Text style={styles.alertTitle}>AMBER ALERT ASSISTANCE</Text>
        </View>
        
        <View style={styles.alertBody}>
          <View style={styles.alertRow}>
            <Text style={styles.alertLabel}>POST</Text>
            <Text style={styles.alertValue}>SECTOR 9 TRANSIT POINT</Text>
          </View>
          <View style={styles.alertRow}>
            <Text style={styles.alertLabel}>OPERATOR</Text>
            <Text style={styles.alertValue}>OP-7734 (PROVISIONAL)</Text>
          </View>
          <View style={styles.alertRow}>
            <Text style={styles.alertLabel}>PROTOCOL</Text>
            <Text style={styles.alertValue}>MANDATORY ASSISTANCE</Text>
          </View>
        </View>

        <Pressable 
          onPress={onAuthenticate}
          style={({ pressed }) => [
            styles.authenticateButton,
            pressed && styles.authenticateButtonPressed
          ]}
        >
          <Text style={styles.authenticateText}>[ AUTHENTICATE ]</Text>
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
};

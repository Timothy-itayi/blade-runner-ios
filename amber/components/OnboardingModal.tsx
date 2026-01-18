import React, { useState, useRef, useEffect } from 'react';
import { Modal, View, Text, Animated, Pressable } from 'react-native';
import { styles } from '../styles/OnboardingModal.styles';
import { TypewriterText } from './ScanData';

interface OnboardingModalProps {
  visible: boolean;
  onDismiss: () => void;
}

export const OnboardingModal = ({ visible, onDismiss }: OnboardingModalProps) => {
  const [showButton, setShowButton] = useState(false);
  const [isActive, setIsActive] = useState(false);
  
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;

  // Auto-start the briefing when visible
  useEffect(() => {
    if (visible) {
      setIsActive(true);
      
      // Fade in content after a brief pause (coming from boot sequence)
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 400,
        delay: 500,
        useNativeDriver: true,
      }).start();

      // Show button after text sequence finishes
      setTimeout(() => {
        setShowButton(true);
        Animated.timing(buttonOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }).start();
      }, 6000);
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent={false} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.content}>
            <Animated.View style={[styles.innerContent, { opacity: contentOpacity }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TypewriterText 
                  text="OPERATOR STATUS: " 
                  active={isActive} 
                  delay={800} 
                  style={[styles.text, styles.textStatus]} 
                />
                <TypewriterText 
                  text="ASSIGNED" 
                  active={isActive} 
                  delay={1350} 
                  style={[styles.text, styles.textStatus, styles.textStatusValue]} 
                />
              </View>
              <View style={styles.spacer} />
              <TypewriterText 
                text="You have been cleared for processing." 
                active={isActive} 
                delay={1800} 
                style={[styles.text, styles.textClearance]} 
              />
              <View style={styles.spacer} />
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TypewriterText 
                  text="Review. " 
                  active={isActive} 
                  delay={3200} 
                  style={[styles.text, styles.textInstruction, styles.textReview]} 
                />
                <TypewriterText 
                  text="Decide. " 
                  active={isActive} 
                  delay={3550} 
                  style={[styles.text, styles.textInstruction, styles.textDecide]} 
                />
                <TypewriterText 
                  text="Confirm." 
                  active={isActive} 
                  delay={3900} 
                  style={[styles.text, styles.textInstruction, styles.textConfirm]} 
                />
              </View>
              <View style={styles.spacer} />
              <TypewriterText 
                text="Trust the system." 
                active={isActive} 
                delay={4200} 
                style={[styles.text, styles.textPropaganda]} 
              />
              <TypewriterText 
                text="The system trusts you." 
                active={isActive} 
                delay={4800} 
                style={[styles.text, styles.textPropaganda]} 
              />
              <View style={styles.spacer} />
              <TypewriterText 
                text="No further instructions." 
                active={isActive} 
                delay={5500} 
                style={[styles.text, styles.textFinality]} 
              />
            </Animated.View>
          </View>

          {showButton && (
            <Animated.View style={{ opacity: buttonOpacity, marginTop: 40 }}>
              <Pressable 
                onPress={onDismiss} 
                style={({ pressed }) => [
                  styles.beginButton,
                  pressed && styles.beginButtonPressed
                ]}
              >
                <Text style={styles.beginButtonText}>[ BEGIN SHIFT ]</Text>
              </Pressable>
            </Animated.View>
          )}
        </View>
      </View>
    </Modal>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { Modal, View, Text, TouchableOpacity, Animated, Easing, Pressable } from 'react-native';
import { styles } from '../styles/OnboardingModal.styles';
import { TypewriterText } from './ScanData';

interface OnboardingModalProps {
  visible: boolean;
  onDismiss: () => void;
}

export const OnboardingModal = ({ visible, onDismiss }: OnboardingModalProps) => {
  const [isOpened, setIsOpened] = useState(false);
  const [showButton, setShowButton] = useState(false);
  
  const topBorderAnim = useRef(new Animated.Value(0)).current;
  const bottomBorderAnim = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;

  const handleOpen = () => {
    setIsOpened(true);
    
    Animated.parallel([
      Animated.timing(topBorderAnim, {
        toValue: -140,
        duration: 800,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(bottomBorderAnim, {
        toValue: 140,
        duration: 800,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 400,
        delay: 400,
        useNativeDriver: true,
      })
    ]).start();

    // Show button after text sequence finishes (approx 5s)
    setTimeout(() => {
      setShowButton(true);
      Animated.timing(buttonOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }, 5500);
  };

  return (
    <Modal visible={visible} transparent={false} animationType="fade">
      <View style={styles.overlay}>
        {!isOpened ? (
          <TouchableOpacity onPress={handleOpen} style={styles.initialButton}>
            <Text style={styles.buttonText}>[ OPEN ]</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.container}>
            <View style={styles.content}>
              <Animated.Text style={[styles.border, { transform: [{ translateY: topBorderAnim }] }]}>
                ┌─────────────────────────────────────────┐
              </Animated.Text>
              
              <Animated.View style={[styles.innerContent, { opacity: contentOpacity }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <TypewriterText 
                    text="OPERATOR STATUS: " 
                    active={isOpened} 
                    delay={800} 
                    style={[styles.text, styles.textStatus]} 
                  />
                  <TypewriterText 
                    text="ASSIGNED" 
                    active={isOpened} 
                    delay={1350} 
                    style={[styles.text, styles.textStatus, styles.textStatusValue]} 
                  />
                </View>
                <View style={styles.spacer} />
                <TypewriterText 
                  text="You have been cleared for processing." 
                  active={isOpened} 
                  delay={1800} 
                  style={[styles.text, styles.textClearance]} 
                />
                <View style={styles.spacer} />
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <TypewriterText 
                    text="Review. " 
                    active={isOpened} 
                    delay={3200} 
                    style={[styles.text, styles.textInstruction, styles.textReview]} 
                  />
                  <TypewriterText 
                    text="Decide. " 
                    active={isOpened} 
                    delay={3550} 
                    style={[styles.text, styles.textInstruction, styles.textDecide]} 
                  />
                  <TypewriterText 
                    text="Confirm." 
                    active={isOpened} 
                    delay={3900} 
                    style={[styles.text, styles.textInstruction, styles.textConfirm]} 
                  />
                </View>
                <View style={styles.spacer} />
                <TypewriterText 
                  text="Trust the system." 
                  active={isOpened} 
                  delay={4200} 
                  style={[styles.text, styles.textPropaganda]} 
                />
                <TypewriterText 
                  text="The system trusts you." 
                  active={isOpened} 
                  delay={4800} 
                  style={[styles.text, styles.textPropaganda]} 
                />
                <View style={styles.spacer} />
                <TypewriterText 
                  text="No further instructions." 
                  active={isOpened} 
                  delay={5500} 
                  style={[styles.text, styles.textFinality]} 
                />
              </Animated.View>

              <Animated.Text style={[styles.border, { transform: [{ translateY: bottomBorderAnim }] }]}>
                └─────────────────────────────────────────┘
              </Animated.Text>
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
        )}
      </View>
    </Modal>
  );
};

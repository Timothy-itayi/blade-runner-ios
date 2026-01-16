import React, { useState, useEffect, useRef } from 'react';
import { Modal, View, Text, TouchableOpacity, Animated, Easing } from 'react-native';
import { styles } from '../styles/OnboardingModal.styles';

interface OnboardingModalProps {
  visible: boolean;
  onDismiss: () => void;
}

export const OnboardingModal = ({ visible, onDismiss }: OnboardingModalProps) => {
  const [isOpened, setIsOpened] = useState(false);
  
  const topBorderAnim = useRef(new Animated.Value(0)).current;
  const bottomBorderAnim = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;

  const handleOpen = () => {
    setIsOpened(true);
    
    Animated.parallel([
      Animated.timing(topBorderAnim, {
        toValue: -120,
        duration: 800,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(bottomBorderAnim, {
        toValue: 120,
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
  };

  return (
    <Modal visible={visible} transparent={false} animationType="fade">
      <View style={styles.overlay}>
        {!isOpened ? (
          <TouchableOpacity onPress={handleOpen} style={styles.initialButton}>
            <Text style={styles.buttonText}>[ OPEN ]</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.content}>
            <Animated.Text style={[styles.border, { transform: [{ translateY: topBorderAnim }] }]}>
              ┌─────────────────────────────────────────┐
            </Animated.Text>
            
            <Animated.View style={[styles.innerContent, { opacity: contentOpacity }]}>
              <Text style={styles.text}>OPERATOR STATUS: ASSIGNED</Text>
              <View style={styles.spacer} />
              <Text style={styles.text}>You have been cleared for processing.</Text>
              <View style={styles.spacer} />
              <Text style={styles.text}>Review. Decide. Confirm.</Text>
              <View style={styles.spacer} />
              <Text style={styles.text}>Trust the system.</Text>
              <Text style={styles.text}>The system trusts you.</Text>
              <View style={styles.spacer} />
              <Text style={styles.text}>No further instructions.</Text>
              
              <TouchableOpacity onPress={onDismiss} style={styles.button}>
                <Text style={styles.buttonText}>[ BEGIN SHIFT ]</Text>
              </TouchableOpacity>
            </Animated.View>

            <Animated.Text style={[styles.border, { transform: [{ translateY: bottomBorderAnim }] }]}>
              └─────────────────────────────────────────┘
            </Animated.Text>
          </View>
        )}
      </View>
    </Modal>
  );
};

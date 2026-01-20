import React, { useState, useRef, useEffect } from 'react';
import { Modal, View, Text, Animated, Pressable } from 'react-native';
import { styles } from '../../styles/boot/OnboardingModal.styles';
import { TypewriterText } from '../ui/ScanData';

interface OnboardingModalProps {
  visible: boolean;
  onDismiss: () => void;
  operatorId: string;
}

export const OnboardingModal = ({ visible, onDismiss, operatorId }: OnboardingModalProps) => {
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
        duration: 300,
        delay: 300,
        useNativeDriver: true,
      }).start();

      // Show button after text sequence finishes (faster timing)
      setTimeout(() => {
        setShowButton(true);
        Animated.timing(buttonOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }).start();
      }, 5000);
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent={false} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.content}>
            <Animated.View style={[styles.innerContent, { opacity: contentOpacity }]}>
              {/* Terminal prompt style */}
              <View style={styles.terminalLine}>
                <Text style={styles.prompt}>&gt;</Text>
                <TypewriterText
                  text="OPERATOR STATUS: "
                  active={isActive}
                  delay={400}
                  style={[styles.text]}
                />
                <TypewriterText
                  text="ASSIGNED"
                  active={isActive}
                  delay={700}
                  style={[styles.text, styles.textStatusValue]}
                />
              </View>

              <View style={styles.terminalLine}>
                <Text style={styles.prompt}>&gt;</Text>
                <TypewriterText
                  text="ID: "
                  active={isActive}
                  delay={1000}
                  style={[styles.text]}
                />
                <TypewriterText
                  text={operatorId}
                  active={isActive}
                  delay={1100}
                  style={[styles.text, styles.textOperatorId]}
                />
              </View>

              <View style={styles.terminalLine}>
                <Text style={styles.prompt}>&gt;</Text>
                <TypewriterText
                  text="CLEARANCE: "
                  active={isActive}
                  delay={1400}
                  style={[styles.text]}
                />
                <TypewriterText
                  text="PROCESSING AUTHORIZED"
                  active={isActive}
                  delay={1600}
                  style={[styles.text, styles.textClearance]}
                />
              </View>

              <View style={styles.spacer} />

              {/* Instructions - each on own line */}
              <View style={styles.terminalLine}>
                <Text style={styles.prompt}>  </Text>
                <TypewriterText
                  text="1. "
                  active={isActive}
                  delay={2000}
                  style={[styles.text, styles.textDim]}
                />
                <TypewriterText
                  text="Review"
                  active={isActive}
                  delay={2100}
                  style={[styles.text, styles.textReview]}
                />
              </View>

              <View style={styles.terminalLine}>
                <Text style={styles.prompt}>  </Text>
                <TypewriterText
                  text="2. "
                  active={isActive}
                  delay={2400}
                  style={[styles.text, styles.textDim]}
                />
                <TypewriterText
                  text="Verify"
                  active={isActive}
                  delay={2500}
                  style={[styles.text, styles.textVerify]}
                />
              </View>

              <View style={styles.terminalLine}>
                <Text style={styles.prompt}>  </Text>
                <TypewriterText
                  text="3. "
                  active={isActive}
                  delay={2800}
                  style={[styles.text, styles.textDim]}
                />
                <TypewriterText
                  text="Decide"
                  active={isActive}
                  delay={2900}
                  style={[styles.text, styles.textDecide]}
                />
              </View>

              <View style={styles.spacer} />

              <View style={styles.terminalLine}>
                <Text style={styles.prompt}>!</Text>
                <TypewriterText
                  text="Always check credentials."
                  active={isActive}
                  delay={3400}
                  style={[styles.text, styles.textCredentialWarn]}
                />
              </View>

              <View style={styles.terminalLine}>
                <Text style={styles.prompt}>!</Text>
                <TypewriterText
                  text="Trust nothing at face value."
                  active={isActive}
                  delay={3900}
                  style={[styles.text, styles.textSecondary]}
                />
              </View>

              <View style={styles.spacerSmall} />

              <View style={styles.terminalLine}>
                <Text style={styles.prompt}>_</Text>
                <TypewriterText
                  text="The system is watching. :)"
                  active={isActive}
                  delay={4400}
                  style={[styles.text, styles.textFinality]}
                />
              </View>
            </Animated.View>
          </View>

          {showButton && (
            <Animated.View style={{ opacity: buttonOpacity, marginTop: 30 }}>
              <Pressable
                onPress={onDismiss}
                style={({ pressed }) => [
                  styles.beginButton,
                  pressed && styles.beginButtonPressed
                ]}
              >
                <Text style={styles.beginButtonText}>BEGIN SHIFT</Text>
              </Pressable>
            </Animated.View>
          )}
        </View>
      </View>
    </Modal>
  );
};

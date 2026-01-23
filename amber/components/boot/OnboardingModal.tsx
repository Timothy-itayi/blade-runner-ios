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

      // Show button after text sequence finishes
      setTimeout(() => {
        setShowButton(true);
        Animated.timing(buttonOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }).start();
      }, 9000);
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
                  text="Review dossier + biometrics"
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
                  text="Run scans (ID hold + Health)"
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
                  text="Play tapes (Warrant / Transit / Incident)"
                  active={isActive}
                  delay={2900}
                  style={[styles.text, styles.textVerify]}
                />
              </View>

              <View style={styles.terminalLine}>
                <Text style={styles.prompt}>  </Text>
                <TypewriterText
                  text="4. "
                  active={isActive}
                  delay={3200}
                  style={[styles.text, styles.textDim]}
                />
                <TypewriterText
                  text="Resources reset each subject (3 total)"
                  active={isActive}
                  delay={3300}
                  style={[styles.text, styles.textSecondary]}
                />
              </View>

              <View style={styles.terminalLine}>
                <Text style={styles.prompt}>  </Text>
                <TypewriterText
                  text="5. "
                  active={isActive}
                  delay={3600}
                  style={[styles.text, styles.textDim]}
                />
                <TypewriterText
                  text="Decide: Approve or Deny"
                  active={isActive}
                  delay={3700}
                  style={[styles.text, styles.textDecide]}
                />
              </View>

              <View style={styles.spacer} />

              <View style={styles.terminalLine}>
                <Text style={styles.prompt}>!</Text>
                <TypewriterText
                  text="Demo: 3 subjects, 1 shift. Credits disabled."
                  active={isActive}
                  delay={4200}
                  style={[styles.text, styles.textCredentialWarn]}
                />
              </View>

              <View style={styles.terminalLine}>
                <Text style={styles.prompt}>!</Text>
                <TypewriterText
                  text="Trust nothing at face value."
                  active={isActive}
                  delay={4700}
                  style={[styles.text, styles.textSecondary]}
                />
              </View>

              <View style={styles.spacerSmall} />

              <View style={styles.terminalLine}>
                <Text style={styles.prompt}>_</Text>
                <TypewriterText
                  text="The system is watching. :)"
                  active={isActive}
                  delay={5200}
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

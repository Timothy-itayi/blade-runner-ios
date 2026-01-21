import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, TouchableOpacity } from 'react-native';
import { Theme } from '../../constants/theme';
import { HUDBox } from '../ui/HUDBox';

export interface WarningPattern {
  type: 'NO_VERIFICATION' | 'EQUIPMENT_FAILURE' | 'REPEATED_MISTAKES' | 'DIRECTIVE_VIOLATION';
  count: number;
  message: string;
}

interface SupervisorWarningProps {
  visible: boolean;
  warning: WarningPattern | null;
  onDismiss: () => void;
}

export const SupervisorWarning = ({ visible, warning, onDismiss }: SupervisorWarningProps) => {
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible && warning) {
      // Slide in from top
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-dismiss after 5 seconds
      const timer = setTimeout(() => {
        handleDismiss();
      }, 5000);

      return () => clearTimeout(timer);
    } else {
      handleDismiss();
    }
  }, [visible, warning]);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  };

  if (!visible || !warning) {
    return null;
  }

  return (
    <View style={styles.container} pointerEvents="box-none">
      <Animated.View
        style={[
          styles.warningBox,
          {
            transform: [{ translateY: slideAnim }],
            opacity: opacityAnim,
          },
        ]}
      >
        <HUDBox hudStage="full" style={styles.hudBox}>
          <View style={styles.header}>
            <Text style={styles.headerText}>SUPERVISOR NOTICE</Text>
            <TouchableOpacity onPress={handleDismiss} style={styles.dismissButton}>
              <Text style={styles.dismissText}>×</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.content}>
            <Text style={styles.warningText}>{warning.message}</Text>
          </View>
        </HUDBox>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    alignItems: 'center',
    paddingTop: 20,
  },
  warningBox: {
    width: '90%',
    maxWidth: 500,
  },
  hudBox: {
    backgroundColor: 'rgba(201, 162, 39, 0.15)',
    borderWidth: 2,
    borderColor: Theme.colors.accentWarn,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.accentWarn,
  },
  headerText: {
    fontFamily: Theme.fonts.mono,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 2,
    color: Theme.colors.accentWarn,
    textTransform: 'uppercase',
  },
  dismissButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dismissText: {
    fontFamily: Theme.fonts.mono,
    fontSize: 20,
    color: Theme.colors.accentWarn,
    fontWeight: '700',
  },
  content: {
    padding: 16,
  },
  warningText: {
    fontFamily: Theme.fonts.mono,
    fontSize: 13,
    lineHeight: 18,
    color: Theme.colors.textPrimary,
  },
});

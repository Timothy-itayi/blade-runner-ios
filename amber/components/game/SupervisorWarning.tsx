import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
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
      {/* Dark overlay to block background elements */}
      <Animated.View 
        style={[
          styles.overlay,
          { opacity: opacityAnim }
        ]}
        pointerEvents="none"
      />
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
            <Text style={styles.headerText}>WARNING ISSUED</Text>
            <TouchableOpacity onPress={handleDismiss} style={styles.dismissButton}>
              <Text style={styles.dismissText}>×</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.separator} />
          <View style={styles.contentWrapper}>
            <ScrollView 
              style={styles.scrollContainer}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.content}>
                <Text style={styles.warningText}>{warning.message}</Text>
              </View>
            </ScrollView>
          </View>
          <View style={styles.footer}>
            <TouchableOpacity 
              style={styles.acknowledgeButton}
              onPress={handleDismiss}
            >
              <Text style={styles.acknowledgeText}>ACKNOWLEDGE</Text>
            </TouchableOpacity>
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
    bottom: 0,
    zIndex: 1000,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    zIndex: 999,
  },
  warningBox: {
    width: '90%',
    maxWidth: 560,
    zIndex: 1001,
  },
  hudBox: {
    backgroundColor: Theme.colors.bgDark,
    borderWidth: 2,
    borderColor: Theme.colors.accentWarn,
    borderRadius: 2,
    overflow: 'hidden',
    width: '100%',
    minHeight: 280,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 24,
    flexShrink: 0,
    height: 64,
  },
  headerText: {
    fontFamily: Theme.fonts.mono,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 3,
    color: Theme.colors.accentWarn,
    textTransform: 'uppercase',
    flex: 1,
    textAlign: 'center',
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
  separator: {
    height: 2,
    backgroundColor: Theme.colors.accentWarn,
    marginHorizontal: 24,
    flexShrink: 0,
  },
  contentWrapper: {
    flex: 1,
    minHeight: 120,
    maxHeight: 400,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 8,
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 28,
  },
  warningText: {
    fontFamily: Theme.fonts.mono,
    fontSize: 16,
    lineHeight: 26,
    color: Theme.colors.textPrimary,
    letterSpacing: 0.8,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 20,
    alignItems: 'center',
    flexShrink: 0,
    borderTopWidth: 1,
    borderTopColor: 'rgba(201, 162, 39, 0.2)',
    height: 80,
  },
  acknowledgeButton: {
    width: '100%',
    paddingVertical: 14,
    borderWidth: 2,
    borderColor: Theme.colors.accentWarn,
    backgroundColor: 'rgba(201, 162, 39, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  acknowledgeText: {
    fontFamily: Theme.fonts.mono,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 2.5,
    color: Theme.colors.accentWarn,
    textTransform: 'uppercase',
  },
});

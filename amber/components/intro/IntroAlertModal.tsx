import React from 'react';
import { View, Text, Animated, Pressable, StyleSheet } from 'react-native';
import { Theme } from '../../constants/theme';

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
        {/* Header - High Priority Alert */}
        <View style={styles.alertHeader}>
          <Text style={styles.alertIcon}>⚠</Text>
          <View style={styles.alertHeaderText}>
            <Text style={styles.alertTitle}>AMBER ALERT</Text>
            <Text style={styles.alertSubtitle}>OPERATOR ASSISTANCE REQUIRED</Text>
          </View>
        </View>

        {/* Priority Banner */}
        <View style={styles.priorityBanner}>
          <Text style={styles.priorityText}>PRIORITY: MANDATORY</Text>
        </View>

        {/* Assignment Details */}
        <View style={styles.alertBody}>
          {/* Location - Primary Info */}
          <View style={styles.locationCard}>
            <Text style={styles.locationLabel}>ASSIGNED POST</Text>
            <Text style={styles.locationValue}>SECTOR 9</Text>
            <Text style={styles.locationSub}>TRANSIT CHECKPOINT</Text>
          </View>

          {/* Operator Info */}
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>OPERATOR ID</Text>
              <Text style={styles.infoValue}>OP-7734</Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>CLEARANCE</Text>
              <Text style={[styles.infoValue, styles.infoValueGreen]}>PROVISIONAL</Text>
            </View>
          </View>

          {/* Instructions */}
          <View style={styles.instructionBox}>
            <Text style={styles.instructionText}>
              Report to your station immediately. Await further directives upon authentication.
            </Text>
          </View>
        </View>

        {/* Authenticate Button */}
        <Pressable
          onPress={onAuthenticate}
          style={({ pressed }) => [
            styles.authenticateButton,
            pressed && styles.authenticateButtonPressed
          ]}
        >
          <Text style={styles.authenticateText}>AUTHENTICATE</Text>
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  alertContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(10, 12, 15, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  alertBox: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: Theme.colors.bgPanel,
    borderWidth: 2,
    borderColor: Theme.colors.accentDeny,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(212, 83, 74, 0.12)',
    borderBottomWidth: 2,
    borderBottomColor: Theme.colors.accentDeny,
  },
  alertIcon: {
    fontSize: 28,
    color: Theme.colors.accentDeny,
    marginRight: 14,
  },
  alertHeaderText: {
    flex: 1,
  },
  alertTitle: {
    fontFamily: Theme.fonts.mono,
    fontSize: 18,
    fontWeight: '700',
    color: Theme.colors.accentDeny,
    letterSpacing: 2,
  },
  alertSubtitle: {
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    color: Theme.colors.textSecondary,
    letterSpacing: 1,
    marginTop: 2,
  },
  priorityBanner: {
    backgroundColor: Theme.colors.accentDeny,
    paddingVertical: 8,
    alignItems: 'center',
  },
  priorityText: {
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 2,
  },
  alertBody: {
    padding: 16,
  },
  locationCard: {
    backgroundColor: 'rgba(201, 162, 39, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(201, 162, 39, 0.3)',
    borderLeftWidth: 4,
    borderLeftColor: Theme.colors.accentWarn,
    padding: 14,
    marginBottom: 14,
    alignItems: 'center',
  },
  locationLabel: {
    fontFamily: Theme.fonts.mono,
    fontSize: 9,
    color: Theme.colors.textDim,
    letterSpacing: 1,
    marginBottom: 6,
  },
  locationValue: {
    fontFamily: Theme.fonts.mono,
    fontSize: 28,
    fontWeight: '700',
    color: Theme.colors.accentWarn,
    letterSpacing: 2,
  },
  locationSub: {
    fontFamily: Theme.fonts.mono,
    fontSize: 11,
    color: Theme.colors.textSecondary,
    letterSpacing: 1,
    marginTop: 4,
  },
  infoGrid: {
    flexDirection: 'row',
    backgroundColor: 'rgba(26, 42, 58, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(74, 106, 122, 0.3)',
    marginBottom: 14,
  },
  infoItem: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
  },
  infoDivider: {
    width: 1,
    backgroundColor: 'rgba(74, 106, 122, 0.3)',
  },
  infoLabel: {
    fontFamily: Theme.fonts.mono,
    fontSize: 9,
    color: Theme.colors.textDim,
    letterSpacing: 1,
    marginBottom: 4,
  },
  infoValue: {
    fontFamily: Theme.fonts.mono,
    fontSize: 14,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
  },
  infoValueGreen: {
    color: Theme.colors.accentApprove,
  },
  instructionBox: {
    borderWidth: 1,
    borderColor: Theme.colors.border,
    padding: 12,
    backgroundColor: 'rgba(127, 184, 216, 0.05)',
  },
  instructionText: {
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
    lineHeight: 20,
    textAlign: 'center',
  },
  authenticateButton: {
    margin: 16,
    marginTop: 0,
    paddingVertical: 16,
    backgroundColor: 'rgba(74, 138, 90, 0.15)',
    borderWidth: 2,
    borderColor: Theme.colors.accentApprove,
    alignItems: 'center',
  },
  authenticateButtonPressed: {
    backgroundColor: 'rgba(74, 138, 90, 0.3)',
  },
  authenticateText: {
    fontFamily: Theme.fonts.mono,
    fontSize: 16,
    fontWeight: '700',
    color: Theme.colors.accentApprove,
    letterSpacing: 3,
  },
});

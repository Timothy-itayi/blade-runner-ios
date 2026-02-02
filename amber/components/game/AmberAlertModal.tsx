import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Theme } from '../../constants/theme';
import { AlertLogEntry } from '../../store/gameStore';

interface AmberAlertModalProps {
  visible: boolean;
  alert: AlertLogEntry | null;
  onHandle: () => void;
  onIgnore: () => void;
}

export const AmberAlertModal = ({
  visible,
  alert,
  onHandle,
  onIgnore,
}: AmberAlertModalProps) => {
  if (!visible || !alert) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.panel}>
        <View style={styles.header}>
          <Text style={styles.headerIcon}>⚠</Text>
          <View>
            <Text style={styles.headerTitle}>AMBER ALERT</Text>
            <Text style={styles.headerSubtitle}>OPERATOR ACTION REQUIRED</Text>
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.row}>
            <Text style={styles.label}>SUBJECT</Text>
            <Text style={styles.value}>{alert.subjectName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>ALERT ID</Text>
            <Text style={styles.value}>{alert.subjectId}</Text>
          </View>
          <View style={styles.divider} />
          <Text style={styles.title}>{alert.scenario.title}</Text>
          <Text style={styles.location}>{alert.scenario.location}</Text>
          <Text style={styles.summary}>{alert.scenario.summary}</Text>
        </View>

        <View style={styles.actions}>
          <Pressable
            onPress={onHandle}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.primaryButtonPressed,
            ]}
          >
            <Text style={styles.primaryButtonText}>HANDLE</Text>
          </Pressable>
          <Pressable
            onPress={onIgnore}
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && styles.secondaryButtonPressed,
            ]}
          >
            <Text style={styles.secondaryButtonText}>IGNORE</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(8, 10, 14, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    zIndex: 200,
  },
  panel: {
    width: '100%',
    maxWidth: 360,
    borderWidth: 2,
    borderColor: Theme.colors.accentDeny,
    backgroundColor: Theme.colors.bgPanel,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 10,
    borderBottomWidth: 2,
    borderBottomColor: Theme.colors.accentDeny,
    backgroundColor: 'rgba(212, 83, 74, 0.12)',
  },
  headerIcon: {
    fontSize: 22,
    color: Theme.colors.accentDeny,
  },
  headerTitle: {
    fontFamily: Theme.fonts.mono,
    fontSize: 16,
    fontWeight: '700',
    color: Theme.colors.accentDeny,
    letterSpacing: 2,
  },
  headerSubtitle: {
    fontFamily: Theme.fonts.mono,
    fontSize: 9,
    color: Theme.colors.textSecondary,
    letterSpacing: 1,
    marginTop: 2,
  },
  body: {
    padding: 14,
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  label: {
    fontFamily: Theme.fonts.mono,
    fontSize: 9,
    color: Theme.colors.textDim,
    letterSpacing: 1,
  },
  value: {
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    color: Theme.colors.textPrimary,
    letterSpacing: 0.6,
  },
  divider: {
    height: 1,
    backgroundColor: Theme.colors.border,
    marginVertical: 6,
  },
  title: {
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
    color: Theme.colors.textPrimary,
    letterSpacing: 1,
  },
  location: {
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    color: Theme.colors.accentWarn,
    letterSpacing: 1,
  },
  summary: {
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    color: Theme.colors.textSecondary,
    letterSpacing: 0.5,
    lineHeight: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    padding: 14,
    paddingTop: 0,
  },
  primaryButton: {
    flex: 1,
    borderWidth: 2,
    borderColor: Theme.colors.accentApprove,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(74, 138, 90, 0.15)',
  },
  primaryButtonPressed: {
    backgroundColor: 'rgba(74, 138, 90, 0.3)',
  },
  primaryButtonText: {
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
    fontWeight: '700',
    color: Theme.colors.accentApprove,
    letterSpacing: 2,
  },
  secondaryButton: {
    flex: 1,
    borderWidth: 2,
    borderColor: Theme.colors.accentDeny,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(212, 83, 74, 0.1)',
  },
  secondaryButtonPressed: {
    backgroundColor: 'rgba(212, 83, 74, 0.2)',
  },
  secondaryButtonText: {
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
    fontWeight: '700',
    color: Theme.colors.accentDeny,
    letterSpacing: 2,
  },
});

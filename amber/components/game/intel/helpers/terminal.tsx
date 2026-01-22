import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Theme } from '../../../../constants/theme';

export const TerminalPrompt = ({ command, logged = true, operatorId, timestamp }: { command: string; logged?: boolean; operatorId: string; timestamp: string }) => (
  <View style={styles.promptBlock}>
    <View style={styles.promptLine}>
      <Text style={styles.promptSymbol}>$</Text>
      <Text style={styles.promptCommand}>{command}</Text>
    </View>
    {logged && (
      <Text style={styles.logNotice}>
        [LOGGED: {operatorId} @ {timestamp}]
      </Text>
    )}
  </View>
);

export const TerminalOutput = ({ label, value, status }: { label: string; value: string; status?: 'ok' | 'warn' | 'error' | 'dim' }) => {
  const valueColor = status === 'ok' ? styles.statusOk : 
                     status === 'warn' ? styles.statusWarn : 
                     status === 'error' ? styles.statusError : 
                     status === 'dim' ? styles.statusDim : styles.statusNeutral;
  return (
    <View style={styles.outputLine}>
      <Text style={styles.outputLabel}>{label}</Text>
      <Text style={[styles.outputValue, valueColor]}>{value}</Text>
    </View>
  );
};

export const TerminalDivider = () => (
  <Text style={styles.divider}>────────────────────────────────────</Text>
);

export const TerminalStatus = ({ message, status }: { message: string; status: 'ok' | 'warn' | 'error' }) => {
  const icon = status === 'ok' ? '✓' : status === 'warn' ? '⚠' : '✗';
  const color = status === 'ok' ? styles.statusOk : status === 'warn' ? styles.statusWarn : styles.statusError;
  return (
    <View style={styles.statusLine}>
      <Text style={[styles.statusIcon, color]}>{icon}</Text>
      <Text style={[styles.statusMessage, color]}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  promptBlock: {
    marginBottom: 8,
  },
  promptLine: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  promptSymbol: {
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    color: Theme.colors.accentApprove,
    marginRight: 6,
    fontWeight: '700',
  },
  promptCommand: {
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    color: Theme.colors.textSecondary,
  },
  logNotice: {
    fontFamily: Theme.fonts.mono,
    fontSize: 8,
    color: Theme.colors.textDim,
    marginLeft: 12,
    letterSpacing: 0.5,
  },
  outputLine: {
    flexDirection: 'row',
    marginVertical: 1,
  },
  outputLabel: {
    fontFamily: Theme.fonts.mono,
    fontSize: 9,
    color: Theme.colors.textDim,
    width: 100,
  },
  outputValue: {
    fontFamily: Theme.fonts.mono,
    fontSize: 9,
    fontWeight: '600',
    flex: 1,
  },
  divider: {
    fontFamily: Theme.fonts.mono,
    fontSize: 8,
    color: 'rgba(74, 106, 122, 0.3)',
    marginVertical: 4,
  },
  statusLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  statusIcon: {
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    marginRight: 6,
  },
  statusMessage: {
    fontFamily: Theme.fonts.mono,
    fontSize: 9,
    fontWeight: '700',
  },
  statusOk: { color: Theme.colors.accentApprove },
  statusWarn: { color: Theme.colors.accentWarn },
  statusError: { color: Theme.colors.accentDeny },
  statusDim: { color: Theme.colors.textSecondary },
  statusNeutral: { color: Theme.colors.textPrimary },
});

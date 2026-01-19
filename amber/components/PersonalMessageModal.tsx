import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable, Animated } from 'react-native';
import { Theme } from '../constants/theme';

interface PersonalMessageModalProps {
  message: string;
  onDismiss: () => void;
}

export const PersonalMessageModal = ({ message, onDismiss }: PersonalMessageModalProps) => {
  const parts = message.split(': ');
  const sender = parts.length > 1 ? parts[0] : 'SYSTEM';
  const body = parts.length > 1 ? parts[1] : message;

  const isSupervisor = sender === 'SUPERVISOR' || sender === 'SYSTEM';
  const color = isSupervisor ? Theme.colors.accentDeny : Theme.colors.accentWarn;
  const label = isSupervisor ? 'OFFICIAL NOTICE' : 'PERSONAL TRANSMISSION';

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <Text style={[styles.borderTop, { color }]}>
          {isSupervisor ? '╔═════════════════════════════════════════╗' : '┌─────────────────────────────────────────┐'}
        </Text>
        <View style={styles.content}>
          <Text style={[styles.label, { color }]}>{label}</Text>
          <Text style={[styles.senderLabel, { color }]}>FROM: {sender}</Text>
          <View style={styles.spacer} />
          <Text style={styles.messageText}>"{body}"</Text>
          <View style={styles.spacer} />
          <Pressable
            onPress={onDismiss}
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
              { borderColor: pressed ? color : 'transparent' }
            ]}
          >
            <Text style={[styles.buttonText, { color }]}>[ ACKNOWLEDGE ]</Text>
          </Pressable>
        </View>
        <Text style={[styles.borderBottom, { color }]}>
          {isSupervisor ? '╚═════════════════════════════════════════╝' : '└─────────────────────────────────────────┘'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 12, 15, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5000,
  },
  container: {
    width: '90%',
    alignItems: 'center',
  },
  content: {
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
    width: '100%',
  },
  borderTop: {
    color: Theme.colors.textSecondary,
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
  },
  borderBottom: {
    color: Theme.colors.textSecondary,
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
  },
  label: {
    color: Theme.colors.textSecondary,
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
    letterSpacing: 2,
  },
  senderLabel: {
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    marginTop: 4,
    fontWeight: '700',
  },
  messageText: {
    color: Theme.colors.textPrimary,
    fontFamily: Theme.fonts.mono,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    fontStyle: 'italic',
  },
  spacer: {
    height: 24,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  buttonPressed: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
  },
  buttonText: {
    color: Theme.colors.textPrimary,
    fontFamily: Theme.fonts.mono,
    fontSize: 14,
    fontWeight: '700',
  },
});

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Theme } from '../constants/theme';

interface PersonalMessageModalProps {
  message: string;
  onDismiss: () => void;
}

export const PersonalMessageModal = ({ message, onDismiss }: PersonalMessageModalProps) => {
  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <Text style={styles.borderTop}>┌─────────────────────────────────────────┐</Text>
        <View style={styles.content}>
          <Text style={styles.label}>MESSAGE RECEIVED</Text>
          <View style={styles.spacer} />
          <Text style={styles.messageText}>"{message}"</Text>
          <View style={styles.spacer} />
          <TouchableOpacity onPress={onDismiss} style={styles.button}>
            <Text style={styles.buttonText}>[ DISMISS ]</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.borderBottom}>└─────────────────────────────────────────┘</Text>
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
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  buttonText: {
    color: Theme.colors.textPrimary,
    fontFamily: Theme.fonts.mono,
    fontSize: 14,
    fontWeight: '700',
  },
});

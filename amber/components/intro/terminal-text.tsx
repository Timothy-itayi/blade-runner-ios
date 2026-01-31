import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SkiaTypewriterText } from '../ui/ScanData';
import { Theme } from '../../constants/theme';

interface TerminalTextProps {
  text: string;
  typingSpeed?: number;
  onComplete?: () => void;
  showSystemReady?: boolean;
  style?: object;
}

export default function TerminalText({
  text,
  typingSpeed = 80,
  onComplete,
  showSystemReady = true,
  style: styleOverride,
}: TerminalTextProps) {
  const [complete, setComplete] = useState(false);

  const handleComplete = () => {
    setComplete(true);
    onComplete?.();
  };

  return (
    <View style={styles.container}>
      <SkiaTypewriterText
        text={text}
        active={true}
        speed={typingSpeed}
        style={[styles.terminalText, styleOverride]}
        onComplete={handleComplete}
      />
      {showSystemReady && complete && (
        <Text style={styles.systemReady}>SYSTEM READY</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  terminalText: {
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
    color: Theme.colors.textPrimary,
    letterSpacing: 1,
  },
  systemReady: {
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    color: Theme.colors.textSecondary,
    letterSpacing: 1,
  },
});

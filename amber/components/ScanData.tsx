import React from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { styles } from '../styles/ScanData.styles';
import { HUDBox } from './HUDBox';
import { SubjectData } from '../data/subjects';

import { BUILD_SEQUENCE } from '../constants/animations';

export const TypewriterText = ({ text, active, delay = 0, style, showCursor = true }: { text: string, active: boolean, delay?: number, style?: any, showCursor?: boolean }) => {
  const [display, setDisplay] = React.useState('');
  const [isComplete, setIsComplete] = React.useState(false);
  const cursorOpacity = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    let interval: any = null;
    let timeout: any = null;

    if (!active) {
      setDisplay('');
      setIsComplete(false);
      return;
    }

    let currentText = '';
    setIsComplete(false);
    
    timeout = setTimeout(() => {
      interval = setInterval(() => {
        if (currentText.length < text.length) {
          currentText = text.slice(0, currentText.length + 1);
          setDisplay(currentText);
        } else {
          setIsComplete(true);
          if (interval) clearInterval(interval);
        }
      }, 30);
    }, delay);

    return () => {
      if (timeout) clearTimeout(timeout);
      if (interval) clearInterval(interval);
    };
  }, [active, text, delay]);

  React.useEffect(() => {
    if (showCursor && active && !isComplete) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(cursorOpacity, { toValue: 0, duration: 100, useNativeDriver: true }),
          Animated.timing(cursorOpacity, { toValue: 1, duration: 100, useNativeDriver: true }),
        ])
      ).start();
    } else {
      cursorOpacity.setValue(0);
    }
  }, [showCursor, active, isComplete]);

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Text style={style}>{display}</Text>
      {showCursor && !isComplete && (
        <Animated.View style={{ 
          width: 8, 
          height: 14, 
          backgroundColor: style?.color || '#7fb8d8', 
          opacity: cursorOpacity,
          marginLeft: 2
        }} />
      )}
    </View>
  );
};

export const ScrambleText = ({ text, active, delay = 0, keepScrambling = false, style }: { text: string, active: boolean, delay?: number, keepScrambling?: boolean, style?: any }) => {
  const placeholder = '-'.repeat(text.length);
  const [display, setDisplay] = React.useState(placeholder);
  const chars = '!@#$%^&*()_+{}[]|;:,.<>?';

  React.useEffect(() => {
    let interval: any = null;
    let timeout: any = null;

    if (!active) {
      setDisplay(text);
      return;
    }

    // Ensure we reset to placeholder if active flips but delay hasn't finished
    setDisplay(placeholder);

    timeout = setTimeout(() => {
      let iterations = 0;
      interval = setInterval(() => {
        setDisplay(prev => 
          prev.split('').map((char, index) => {
            if (!keepScrambling && index < iterations) return text[index];
            return chars[Math.floor(Math.random() * chars.length)];
          }).join('')
        );
        
        if (!keepScrambling && iterations >= text.length) {
          if (interval) clearInterval(interval);
        }
        iterations += 1/3;
      }, 30);
    }, delay);

    return () => {
      if (timeout) clearTimeout(timeout);
      if (interval) clearInterval(interval);
    };
  }, [active, text, keepScrambling, delay]);

  return <Text style={[styles.dataValue, style]}>{display}</Text>;
};

export const ScanData = ({ id, isScanning, scanProgress, hudStage, subject }: { 
  id: string, 
  isScanning: boolean, 
  scanProgress: Animated.Value,
  hudStage: 'none' | 'wireframe' | 'outline' | 'full',
  subject: SubjectData
}) => {
  const [hasReachedBottom, setHasReachedBottom] = React.useState(false);

  React.useEffect(() => {
    if (!isScanning) {
      setHasReachedBottom(false);
      return;
    }

    const listener = scanProgress.addListener(({ value }) => {
      if (value >= 0.95 && !hasReachedBottom) {
        setHasReachedBottom(true);
      }
    });

    return () => scanProgress.removeListener(listener);
  }, [isScanning, scanProgress]);

  // Scramble if we're in buildup OR if a scan is active AND hasn't finished its sweep
  const shouldScramble = hudStage !== 'full' || (isScanning && !hasReachedBottom);

  return (
    <HUDBox hudStage={hudStage} style={styles.container} buildDelay={BUILD_SEQUENCE.locRecord}>
      <View style={styles.leftColumn}>
        <TypewriterText text="IDENTIFICATION" active={hudStage !== 'none'} delay={BUILD_SEQUENCE.identification} style={styles.label} />
        {/* ID Code stays scrambled during build but reveals once full, regardless of scan sweep */}
        <ScrambleText text={id} active={hudStage !== 'full' || (isScanning && !hasReachedBottom)} keepScrambling={hudStage !== 'full' || (isScanning && !hasReachedBottom)} delay={BUILD_SEQUENCE.identification + 400} style={styles.idCode} />
      </View>
      
      <View style={styles.rightColumn}>
        <View style={styles.locationHeader}>
          <View style={styles.gridBox}>
            <View style={styles.gridDot} />
          </View>
          <TypewriterText text="LOC RECORD" active={hudStage !== 'none'} delay={BUILD_SEQUENCE.locRecord + 200} style={styles.gridLabel} />
        </View>
        
        <View style={styles.locGrid}>
          <View style={styles.locRow}>
            <View style={styles.dataRow}>
              <TypewriterText text="ADDR:" active={hudStage !== 'none'} delay={BUILD_SEQUENCE.locRecord + 400} style={styles.dataLabel} />
              <ScrambleText text={subject.locRecord.addr} active={shouldScramble} keepScrambling={shouldScramble} delay={BUILD_SEQUENCE.locRecord + 600} />
            </View>
            <View style={styles.dataRow}>
              <TypewriterText text="TIME:" active={hudStage !== 'none'} delay={BUILD_SEQUENCE.locRecord + 500} style={styles.dataLabel} />
              <ScrambleText text={subject.locRecord.time} active={shouldScramble} keepScrambling={shouldScramble} delay={BUILD_SEQUENCE.locRecord + 700} />
            </View>
          </View>
          <View style={styles.locRow}>
            <View style={styles.dataRow}>
              <TypewriterText text="PL:" active={hudStage !== 'none'} delay={BUILD_SEQUENCE.locRecord + 600} style={styles.dataLabel} />
              <ScrambleText text={subject.locRecord.pl} active={shouldScramble} keepScrambling={shouldScramble} delay={BUILD_SEQUENCE.locRecord + 800} />
            </View>
            <View style={styles.dataRow}>
              <TypewriterText text="D.O.B:" active={hudStage !== 'none'} delay={BUILD_SEQUENCE.locRecord + 700} style={styles.dataLabel} />
              <ScrambleText text={subject.locRecord.dob} active={shouldScramble} keepScrambling={shouldScramble} delay={BUILD_SEQUENCE.locRecord + 900} />
            </View>
          </View>
        </View>
      </View>
    </HUDBox>
  );
};

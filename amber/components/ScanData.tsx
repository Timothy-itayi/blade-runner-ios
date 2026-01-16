import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';
import { styles } from '../styles/ScanData.styles';
import { HUDBox } from './HUDBox';
import { SUBJECTS } from '../data/subjects';

export const ScanData = ({ id, isScanning, scanProgress, hudStage, currentSubjectIndex }: { 
  id: string, 
  isScanning: boolean, 
  scanProgress: Animated.Value,
  hudStage: 'none' | 'wireframe' | 'outline' | 'full',
  currentSubjectIndex: number
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [bpm, setBpm] = useState<string | number>(78);
  const currentSubject = SUBJECTS[currentSubjectIndex];

  useEffect(() => {
    if (!isScanning) {
      setBpm(currentSubject.bpm || 78);
      return;
    }

    if (currentSubject.bpm) {
      setBpm(currentSubject.bpm);
      return;
    }

    const listener = scanProgress.addListener(({ value }) => {
      // Rise from 78 up to 94 then stabilize back to 82
      if (value < 0.6) {
        setBpm(Math.floor(78 + (value * 26.6))); // 78 -> 94
      } else {
        setBpm(Math.floor(94 - ((value - 0.6) * 30))); // 94 -> 82
      }
    });

    return () => scanProgress.removeListener(listener);
  }, [isScanning, scanProgress, currentSubject]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <HUDBox hudStage={hudStage} style={styles.container}>
      <View style={styles.leftColumn}>
        <Text style={styles.label}>IDENT CONFIRM</Text>
        <Text style={styles.idCode}>{id}</Text>
      </View>
      <View style={styles.rightColumn}>
        <View style={styles.bpmRow}>
          <Animated.View style={[styles.pulseDot, { transform: [{ scale: pulseAnim }] }]} />
          <Text style={styles.metaLabel}>{bpm} {typeof bpm === 'number' ? 'BPM' : ''} {isScanning ? 'MONITORING' : 'STABILIZING'}</Text>
        </View>
        <View style={styles.heartOutline}>
          <View style={styles.heartLine} />
          <View style={[styles.heartLine, { width: '40%', opacity: 0.3 }]} />
        </View>
      </View>
    </HUDBox>
  );
};

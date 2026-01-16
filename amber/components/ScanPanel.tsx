import React, { useState, useEffect } from 'react';
import { View, Text, Animated } from 'react-native';
import { styles } from '../styles/ScanPanel.styles';
import { HUDBox } from './HUDBox';
import { SubjectData } from '../data/subjects';

const FINGERPRINT_ASCII = `
  .----.
 /  ..  \\
|  |  |  |
|  '--'  |
 \\      /
  '----'
`;

const ScrambleText = ({ text, active, delay = 0 }: { text: string, active: boolean, delay?: number }) => {
  const [display, setDisplay] = useState('');
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789░▒▓█$@#%';

  useEffect(() => {
    if (!active) {
      setDisplay(text.split('').map(() => chars[Math.floor(Math.random() * chars.length)]).join(''));
      return;
    }
    
    let iterations = 0;
    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        setDisplay(prev => 
          text.split('').map((char, index) => {
            if (index < iterations) return text[index];
            return chars[Math.floor(Math.random() * chars.length)];
          }).join('')
        );
        
        iterations += 1/4;
        if (iterations >= text.length) clearInterval(interval);
      }, 40);
      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(timeout);
  }, [active, text, delay]);

  return <Text style={styles.dataValue}>{display}</Text>;
};

export const ScanPanel = ({ isScanning, scanProgress, hudStage, subject }: { 
  isScanning: boolean, 
  scanProgress: Animated.Value,
  hudStage: 'none' | 'wireframe' | 'outline' | 'full',
  subject: SubjectData
}) => {
  const [statusText, setStatusText] = useState('READY');

  useEffect(() => {
    if (!isScanning) {
      setStatusText('READY');
      return;
    }

    const listener = scanProgress.addListener(({ value }) => {
      if (value < 0.4) {
        setStatusText('SCANNING');
      } else if (value < 0.9) {
        setStatusText('PROCESSING');
      } else {
        setStatusText('COMPLETE');
      }
    });

    return () => scanProgress.removeListener(listener);
  }, [isScanning, scanProgress]);

  return (
    <HUDBox hudStage={hudStage} style={styles.container}>
      <View style={styles.fingerprintSection}>
        <View style={styles.fingerprintHeader}>
          <Text style={styles.headerText}>L</Text>
          <Text style={styles.headerText}>R</Text>
        </View>
        <View style={styles.fingerprintSlots}>
          <Text style={styles.asciiFingerprint}>{FINGERPRINT_ASCII}</Text>
          <Text style={styles.asciiFingerprint}>{FINGERPRINT_ASCII}</Text>
        </View>
      </View>

      <View style={styles.matchSection}>
        <Text style={styles.label}>MATCH</Text>
        <View style={styles.matchIndicators}>
          <View style={[styles.indicator, isScanning && styles.activeIndicator]}>
            <Text style={styles.indicatorText}>F</Text>
          </View>
          <View style={styles.indicator}>
            <Text style={styles.indicatorText}>M</Text>
          </View>
        </View>
      </View>

      <View style={styles.locationGrid}>
        <View style={styles.locationHeader}>
          <View style={styles.gridBox}>
            <View style={styles.gridDot} />
          </View>
          <Text style={styles.gridLabel}>LOC RECORD</Text>
        </View>
        
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>ADDR:</Text>
          <ScrambleText text={subject.locRecord.addr} active={isScanning} delay={1000} />
        </View>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>TIME:</Text>
          <ScrambleText text={subject.locRecord.time} active={isScanning} delay={2000} />
        </View>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>LAT:</Text>
          <ScrambleText text={subject.locRecord.lat} active={isScanning} delay={3000} />
        </View>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>LNG:</Text>
          <ScrambleText text={subject.locRecord.lng} active={isScanning} delay={4000} />
        </View>
      </View>

      <View style={styles.visualizer}>
        <Text style={styles.visualizerText}>░░▪▪░ {statusText}</Text>
      </View>
    </HUDBox>
  );
};

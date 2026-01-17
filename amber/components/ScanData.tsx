import React from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { styles } from '../styles/ScanData.styles';
import { HUDBox } from './HUDBox';
import { SubjectData } from '../data/subjects';

const ScrambleText = ({ text, active, delay = 0 }: { text: string, active: boolean, delay?: number }) => {
  const [display, setDisplay] = React.useState(text);
  const chars = '!@#$%^&*()_+{}[]|;:,.<>?';

  React.useEffect(() => {
    if (!active) {
      setDisplay(text);
      return;
    }

    let iterations = 0;
    const interval = setInterval(() => {
      setDisplay(prev => 
        prev.split('').map((char, index) => {
          if (index < iterations) return text[index];
          return chars[Math.floor(Math.random() * chars.length)];
        }).join('')
      );
      
      if (iterations >= text.length) clearInterval(interval);
      iterations += 1/3;
    }, 30);

    return () => clearInterval(interval);
  }, [active, text]);

  return <Text style={styles.dataValue}>{display}</Text>;
};

export const ScanData = ({ id, isScanning, scanProgress, hudStage, subject }: { 
  id: string, 
  isScanning: boolean, 
  scanProgress: Animated.Value,
  hudStage: 'none' | 'wireframe' | 'outline' | 'full',
  subject: SubjectData
}) => {
  return (
    <HUDBox hudStage={hudStage} style={styles.container}>
      <View style={styles.leftColumn}>
        <Text style={styles.label}>IDENTIFICATION</Text>
        <Text style={styles.idCode}>{id}</Text>
      </View>
      
      <View style={styles.rightColumn}>
        <View style={styles.locationHeader}>
          <View style={styles.gridBox}>
            <View style={styles.gridDot} />
          </View>
          <Text style={styles.gridLabel}>LOC RECORD</Text>
        </View>
        
        <View style={styles.locGrid}>
          <View style={styles.locRow}>
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>ADDR:</Text>
              <ScrambleText text={subject.locRecord.addr} active={isScanning} delay={1000} />
            </View>
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>TIME:</Text>
              <ScrambleText text={subject.locRecord.time} active={isScanning} delay={1500} />
            </View>
          </View>
          <View style={styles.locRow}>
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>PL:</Text>
              <ScrambleText text={subject.locRecord.pl} active={isScanning} delay={2000} />
            </View>
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>D.O.B:</Text>
              <ScrambleText text={subject.locRecord.dob} active={isScanning} delay={2500} />
            </View>
          </View>
        </View>
      </View>
    </HUDBox>
  );
};

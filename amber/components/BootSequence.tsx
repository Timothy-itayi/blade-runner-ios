import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Animated, ScrollView } from 'react-native';
import { styles } from '../styles/BootSequence.styles';

const BOOT_LOGS = [
  "BIOS v4.0.2 (C) 2027 TYRELL CORP.",
  "CPU 12-CORE V-K SERIES 0.982ms",
  "MEMORY TEST: 65536KB OK",
  "[ OK ] Initializing core kernel...",
  "[ OK ] Loading terminal drivers...",
  "EXT4-fs (sda1): mounted filesystem with ordered data mode.",
  "EXT4-fs (sda1): re-mounted. Opts: errors=remount-ro",
  "[ OK ] Establishing encrypted link...",
  "ETH0: 100Gbps Full Duplex / Link Up",
  "IP: 10.0.2.15/24 BRD 10.0.2.255 SCOPE GLOBAL ETH0",
  "[ OK ] Mounting sensor array...",
  "V-K SENSOR: CALIBRATION 0.44.2",
  "V-K SENSOR: NOISE FLOOR DETECTED -44dB",
  "V-K SENSOR: PEAK RESPONSE AT 440Hz",
  "[ OK ] Verifying operator credentials...",
  "AUTH: OPERATOR_71527 GRANTED.",
  "SESSION: START_TIME 2026-01-17T07:51:00Z",
  "[ OK ] Clearing cache...",
  "CACHE: 1422 OBJECTS PURGED.",
  "[ !! ] Low signal detected in Sector 4",
  "WARN: SIGNAL_STRENGTH_DEGRADATION 12%",
  "[ OK ] Bypassing signal noise...",
  "[ OK ] Syncing biometric database...",
  "DB: SUBJECT_RECORDS_LOADED (3 ENTRIES)",
  "DB: QUERY_LATENCY 14ms",
  "[ OK ] Calibrating eye-scan reticle...",
  "RETICLE: ALIGNMENT_COMPLETE (X:0, Y:0, Z:0)",
  "[ OK ] Initializing identification protocols...",
  "PROTOCOL: ID_V2_ENFORCED",
  "[ OK ] Connection established.",
  "------------------------------------------",
  "SYSTEM STATUS: OPTIMAL",
  "READY FOR OPERATOR INPUT."
];

export const BootSequence = ({ onComplete }: { onComplete: () => void }) => {
  const [logs, setLogs] = useState<string[]>([]);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    let logIndex = 0;
    
    // Animate logs with randomized timing
    const showNextLog = () => {
      if (logIndex < BOOT_LOGS.length) {
        setLogs(prev => [...prev, BOOT_LOGS[logIndex]]);
        logIndex++;
        scrollViewRef.current?.scrollToEnd({ animated: true });
        
        const nextDelay = 100 + Math.random() * 400; // More random delay
        setTimeout(showNextLog, nextDelay);
      }
    };
    
    showNextLog();

    // Animate progress bar (much slower: 8 seconds)
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 10000,
      useNativeDriver: false,
    }).start(() => {
      setTimeout(onComplete, 1000);
    });
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView 
        ref={scrollViewRef}
        style={styles.logContainer}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {logs.map((log, i) => (
          <Text key={i} style={styles.logText}>{log}</Text>
        ))}
      </ScrollView>

      <View>
        <Text style={styles.statusText}>SYSTEM BOOT IN PROGRESS...</Text>
        <View style={styles.progressContainer}>
          <Animated.View 
            style={[
              styles.progressBar, 
              { width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%']
              }) }
            ]} 
          />
        </View>
      </View>
    </View>
  );
};

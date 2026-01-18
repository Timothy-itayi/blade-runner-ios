import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Animated, ScrollView } from 'react-native';
import { styles } from '../styles/BootSequence.styles';
import { useGameAudioContext } from '../contexts/AudioContext';

const BOOT_LOGS = [
  "BIOS v9.0.1 (C) 2026 GLOBAL SURVEILLANCE ORG.",
  "CONNECTING TO SECTOR 9 TRANSIT NETWORK...",
  "CPU STATUS: OPTIMAL (16-CORE)",
  "MEMORY TEST: 131072KB OK",
  "[ OK ] Initializing Amber Alert Assistance protocol...",
  "[ OK ] Syncing with Central Watcher database...",
  "LINK: ENCRYPTED (AES-4096)",
  "IP: 10.9.11.44/24 (SECTOR_9_NODAL_POINT)",
  "[ OK ] Loading Operator OP-7734 profile...",
  "STATUS: PROVISIONAL CLEARANCE GRANTED.",
  "WARNING: AMBER ALERT ASSISTANCE IS A MANDATORY PROTOCOL.",
  "WARNING: ALL DATA TRANSMISSION IS MONITORED.",
  "[ OK ] Mounting sensor array...",
  "SENSOR: V-K CALIBRATION 1.22.4",
  "SENSOR: NOISE FLOOR -52dB",
  "[ OK ] Establishing biometric uplink...",
  "DB: 1422 ACTIVE SUBJECT RECORDS LOADED.",
  "DB: SEARCH LATENCY 0.8ms",
  "[ OK ] Calibrating eye-scan reticle...",
  "RETICLE: ALIGNMENT_COMPLETE (X:0, Y:0, Z:0)",
  "[ OK ] Initializing identification protocols...",
  "PROTOCOL: ID_V3_ENFORCED (STRICT)",
  "------------------------------------------",
  "SYSTEM STATUS: OPERATIONAL",
  "POST: SECTOR 9 - TRANSIT POINT A",
  "WELCOME TO YOUR FIRST SHIFT, OPERATOR OP-7734.",
  "STAND BY FOR BRIEFING..."
];

export const BootSequence = ({ onComplete }: { onComplete: () => void }) => {
  const [logs, setLogs] = useState<string[]>([]);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  
  const { playBootSequence, stopBootSequence } = useGameAudioContext();

  useEffect(() => {
    // Start boot sequence sound
    playBootSequence();
    
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
      stopBootSequence(); // Stop boot sound when complete
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

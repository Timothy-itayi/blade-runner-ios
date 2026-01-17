import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Animated, Image, Easing, StyleSheet } from 'react-native';
import { styles } from '../styles/ScanPanel.styles';
import { HUDBox, DrawingBorder } from './HUDBox';
import { SubjectData } from '../data/subjects';
import { Theme } from '../constants/theme';
import { BUILD_SEQUENCE } from '../constants/animations';

const FINGERPRINT_IMG = require('../assets/finger-print.png');

const FingerprintSlot = ({ active, flipped = false, delay = 0, statusText }: { active: boolean, flipped?: boolean, delay?: number, statusText: string }) => {
  const contentFade = useRef(new Animated.Value(0)).current;
  const gridFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (active) {
      Animated.sequence([
        Animated.delay(delay + 400),
        Animated.timing(gridFade, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(contentFade, { toValue: 1, duration: 800, useNativeDriver: true }),
      ]).start();
    } else {
      contentFade.setValue(0);
      gridFade.setValue(0);
    }
  }, [active]);

  return (
    <View style={styles.fingerprintContainer}>
      <DrawingBorder active={active} delay={delay} color="rgba(74, 138, 90, 0.4)" />
      
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: gridFade }]}>
        <View style={styles.fingerprintGrid} />
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, { opacity: contentFade }]}>
        <Image 
          source={FINGERPRINT_IMG} 
          style={[styles.fingerprintImage, flipped && styles.flippedFingerprint, { transform: [{ scale: 1.4 }, flipped ? { scaleX: -1 } : { scaleX: 1 }] }]} 
          resizeMode="cover" 
        />
        <MinutiaeMarkers active={statusText === 'PROCESSING' || statusText === 'COMPLETE'} flipped={flipped} />
        <View style={[StyleSheet.absoluteFill, { overflow: 'hidden' }]}>
          <VerificationCircles active={statusText === 'COMPLETE'} />
        </View>
      </Animated.View>
    </View>
  );
};

const BPMMonitor = ({ active, delay = 0, bpm, pulseAnim }: { active: boolean, delay?: number, bpm: string | number, pulseAnim: Animated.Value }) => {
  const [flicker, setFlicker] = useState(false);
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (active) {
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();

      const flickerInterval = setInterval(() => {
        setFlicker(prev => !prev);
      }, 50);
      
      setTimeout(() => {
        clearInterval(flickerInterval);
        setFlicker(false);
      }, 1000);

      return () => clearInterval(flickerInterval);
    } else {
      opacity.setValue(0);
    }
  }, [active]);

  const isLive = active && !flicker;

  return (
    <Animated.View style={[styles.bpmColumn, { opacity }]}>
      <Text style={styles.label}>BIOMETRICS</Text>
      <View style={styles.bpmRow}>
        <Animated.View 
          style={[
            styles.pulseDot, 
            { 
              backgroundColor: isLive ? Theme.colors.accentDeny : Theme.colors.textDim,
              transform: [{ scale: isLive ? pulseAnim : 1 }] 
            }
          ]} 
        />
        <Text style={[styles.bpmText, !isLive && { color: Theme.colors.textDim }]}>
          {isLive ? `${bpm} BPM` : '-- BPM'}
        </Text>
      </View>
    </Animated.View>
  );
};

const BlinkingBars = () => {
  return (
    <View style={styles.barsContainer}>
      {[...Array(24)].map((_, i) => {
        const barAnim = useRef(new Animated.Value(Math.random())).current;
        useEffect(() => {
          Animated.loop(
            Animated.sequence([
              Animated.timing(barAnim, {
                toValue: Math.random(),
                duration: 400 + Math.random() * 800,
                easing: Easing.inOut(Easing.quad),
                useNativeDriver: false,
              }),
              Animated.timing(barAnim, {
                toValue: Math.random(),
                duration: 400 + Math.random() * 800,
                easing: Easing.inOut(Easing.quad),
                useNativeDriver: false,
              }),
            ])
          ).start();
        }, []);

        return (
          <Animated.View 
            key={i} 
            style={[
              styles.bar, 
              { 
                height: barAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [6, 36]
                }),
                opacity: barAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.2, 0.7]
                })
              }
            ]} 
          />
        );
      })}
    </View>
  );
};

const VerificationCircles = ({ active }: { active: boolean }) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (active) {
      Animated.loop(
        Animated.timing(anim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      anim.stopAnimation();
      anim.setValue(0);
    }
  }, [active]);

  if (!active) return null;

  return (
    <>
      {[0, 1, 2].map((i) => {
        return (
          <Animated.View 
            key={i}
            style={[
              styles.scanningCircle,
              { 
                width: 40, 
                height: 40,
                transform: [{ scale: anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.5 + (i * 0.2), 2 + (i * 0.2)]
                }) }],
                opacity: anim.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0, 0.4 - (i * 0.1), 0]
                }),
              }
            ]} 
          />
        );
      })}
    </>
  );
};

const MinutiaeMarkers = ({ active, flipped = false }: { active: boolean, flipped?: boolean }) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (active) {
      Animated.timing(anim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start();
    } else {
      anim.setValue(0);
    }
  }, [active]);

  if (!active) return null;

  const points = [
    { x: 15, y: 20, label: 'BIFUR', angle: -45 },
    { x: 40, y: 35, label: 'CORE', angle: 45 },
    { x: 22, y: 55, label: 'ISLAND', angle: -135 },
    { x: 45, y: 65, label: 'DELTA', angle: 135 },
  ];

  return (
    <View style={styles.minutiaeContainer}>
      {points.map((p, i) => {
        const x = flipped ? 60 - p.x : p.x;
        const angle = flipped ? -p.angle : p.angle;
        
        const opacity = anim.interpolate({
          inputRange: [0, 0.2 + (i * 0.2), 0.4 + (i * 0.2)],
          outputRange: [0, 0, 1],
        });

        const lineLen = 12;
        const rad = (angle * Math.PI) / 180;
        const lx = Math.cos(rad) * lineLen;
        const ly = Math.sin(rad) * lineLen;

        return (
          <Animated.View key={i} style={{ position: 'absolute', left: x, top: p.y, opacity }}>
            {/* Small red scanning circle on point */}
            <View style={[styles.minutiaeCircle, { left: -4, top: -4 }]} />
            <View style={[styles.minutiaeDot, { left: -1.5, top: -1.5 }]} />
            
            {/* Arrow/Line pointing out */}
            <View style={[
              styles.minutiaeLine, 
              { 
                width: lineLen, 
                transform: [
                  { translateX: lx / 2 },
                  { translateY: ly / 2 },
                  { rotate: `${angle}deg` }
                ] 
              }
            ]} />
            
            {/* Label */}
            <Text style={[
              styles.minutiaeText,
              {
                left: lx > 0 ? lineLen : -lineLen - 15,
                top: ly > 0 ? lineLen / 2 : -lineLen / 2,
                textAlign: lx > 0 ? 'left' : 'right',
              }
            ]}>
              {p.label}
            </Text>
          </Animated.View>
        );
      })}
    </View>
  );
};

export const ScanPanel = ({ isScanning, scanProgress, hudStage, subject }: { 
  isScanning: boolean, 
  scanProgress: Animated.Value,
  hudStage: 'none' | 'wireframe' | 'outline' | 'full',
  subject: SubjectData
}) => {
  const [statusText, setStatusText] = useState('READY');
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [bpm, setBpm] = useState<string | number>(78);
  
  // Layer animations
  const fingerprintOpacity = useRef(new Animated.Value(0)).current;
  const matchSectionOpacity = useRef(new Animated.Value(0)).current;
  const monitorsOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (hudStage === 'outline') {
      Animated.sequence([
        Animated.timing(fingerprintOpacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(matchSectionOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(monitorsOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]).start();
    } else if (hudStage === 'full') {
      fingerprintOpacity.setValue(1);
      matchSectionOpacity.setValue(1);
      monitorsOpacity.setValue(1);
    } else {
      fingerprintOpacity.setValue(0);
      matchSectionOpacity.setValue(0);
      monitorsOpacity.setValue(0);
    }
  }, [hudStage]);

  useEffect(() => {
    if (hudStage !== 'full') {
      setStatusText('INITIALIZING...');
      return;
    }

    if (!isScanning) {
      setBpm(subject.bpm || 78);
      setStatusText('READY');
      return;
    }

    if (subject.bpm) {
      setBpm(subject.bpm);
    }

    const listener = scanProgress.addListener(({ value }) => {
      // Status text
      if (value < 0.4) {
        setStatusText('SCANNING');
      } else if (value < 0.9) {
        setStatusText('PROCESSING');
      } else {
        setStatusText('COMPLETE');
      }

      // BPM calc if not fixed
      if (!subject.bpm) {
        if (value < 0.6) {
          setBpm(Math.floor(78 + (value * 26.6))); // 78 -> 94
        } else {
          setBpm(Math.floor(94 - ((value - 0.6) * 30))); // 94 -> 82
        }
      }
    });

    return () => scanProgress.removeListener(listener);
  }, [isScanning, scanProgress, subject, hudStage]);

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
    <HUDBox hudStage={hudStage} style={styles.container} buildDelay={BUILD_SEQUENCE.scanPanelBorder}>
      <View style={styles.fingerprintSection}>
        <View style={styles.fingerprintSlots}>
          <FingerprintSlot 
            active={true} 
            delay={BUILD_SEQUENCE.fingerprintLeft} 
            statusText={statusText} 
          />
          <FingerprintSlot 
            active={true} 
            flipped={true} 
            delay={BUILD_SEQUENCE.fingerprintRight} 
            statusText={statusText} 
          />
        </View>
        <View style={styles.fingerprintHeader}>
          <Text style={styles.headerText}>L</Text>
          <Text style={styles.headerText}>R</Text>
        </View>
      </View>

      <View style={styles.matchSection}>
        <Animated.View style={[styles.sexColumn, { opacity: matchSectionOpacity }]}>
          <Text style={styles.label}>SEX</Text>
          <View style={styles.matchIndicators}>
            <View style={[styles.indicator, subject.sex === 'F' && styles.activeIndicator]}>
              <Text style={[styles.indicatorText, subject.sex === 'F' && styles.activeIndicatorText]}>F</Text>
            </View>
            <View style={[styles.indicator, subject.sex === 'M' && styles.activeIndicator]}>
              <Text style={[styles.indicatorText, subject.sex === 'M' && styles.activeIndicatorText]}>M</Text>
            </View>
          </View>
        </Animated.View>

        <BPMMonitor 
          active={true} 
          delay={BUILD_SEQUENCE.bpmMonitor} 
          bpm={bpm} 
          pulseAnim={pulseAnim} 
        />
      </View>

      <Animated.View style={[styles.monitorSection, { opacity: monitorsOpacity }]}>
        <View style={styles.monitorGroup}>
          <BlinkingBars />
        </View>
      </Animated.View>

      <View style={styles.visualizer}>
        <Text style={styles.visualizerText}>░░▪▪░ {statusText}</Text>
      </View>
    </HUDBox>
  );
};

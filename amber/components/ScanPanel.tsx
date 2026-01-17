import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Animated, Image, Easing, StyleSheet } from 'react-native';
import { styles } from '../styles/ScanPanel.styles';
import { HUDBox } from './HUDBox';
import { SubjectData } from '../data/subjects';
import { Theme } from '../constants/theme';

const FINGERPRINT_IMG = require('../assets/finger-print.png');

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

  useEffect(() => {
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
  }, [isScanning, scanProgress, subject]);

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
      <View style={styles.fingerprintSection}>
        <View style={styles.fingerprintSlots}>
          <View style={styles.fingerprintContainer}>
            <Image 
              source={FINGERPRINT_IMG} 
              style={[styles.fingerprintImage, { transform: [{ scale: 1.4 }] }]} 
              resizeMode="cover" 
            />
            <MinutiaeMarkers active={statusText === 'PROCESSING' || statusText === 'COMPLETE'} />
            <View style={[StyleSheet.absoluteFill, { overflow: 'hidden' }]}>
              <VerificationCircles active={statusText === 'COMPLETE'} />
            </View>
          </View>
          <View style={styles.fingerprintContainer}>
            <Image 
              source={FINGERPRINT_IMG} 
              style={[styles.fingerprintImage, styles.flippedFingerprint, { transform: [{ scale: 1.4 }, { scaleX: -1 }] }]} 
              resizeMode="cover" 
            />
            <MinutiaeMarkers 
              active={statusText === 'PROCESSING' || statusText === 'COMPLETE'} 
              flipped={true} 
            />
            <View style={[StyleSheet.absoluteFill, { overflow: 'hidden' }]}>
              <VerificationCircles active={statusText === 'COMPLETE'} />
            </View>
          </View>
        </View>
        <View style={styles.fingerprintHeader}>
          <Text style={styles.headerText}>L</Text>
          <Text style={styles.headerText}>R</Text>
        </View>
      </View>

      <View style={styles.matchSection}>
        <View style={styles.sexColumn}>
          <Text style={styles.label}>SEX</Text>
          <View style={styles.matchIndicators}>
            <View style={[styles.indicator, subject.sex === 'F' && styles.activeIndicator]}>
              <Text style={[styles.indicatorText, subject.sex === 'F' && styles.activeIndicatorText]}>F</Text>
            </View>
            <View style={[styles.indicator, subject.sex === 'M' && styles.activeIndicator]}>
              <Text style={[styles.indicatorText, subject.sex === 'M' && styles.activeIndicatorText]}>M</Text>
            </View>
          </View>
        </View>

        <View style={styles.bpmColumn}>
          <Text style={styles.label}>BIOMETRICS</Text>
          <View style={styles.bpmRow}>
            <Animated.View style={[styles.pulseDot, { transform: [{ scale: pulseAnim }] }]} />
            <Text style={styles.bpmText}>{bpm} BPM</Text>
          </View>
        </View>
      </View>

      <View style={styles.monitorSection}>
        <View style={styles.monitorGroup}>
     
          <BlinkingBars />
        </View>
      </View>

      <View style={styles.visualizer}>
        <Text style={styles.visualizerText}>░░▪▪░ {statusText}</Text>
      </View>
    </HUDBox>
  );
};

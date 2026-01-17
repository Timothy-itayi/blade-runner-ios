import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Animated, Image, Easing, StyleSheet } from 'react-native';
import { styles } from '../styles/ScanPanel.styles';
import { HUDBox } from './HUDBox';
import { SubjectData } from '../data/subjects';

const FINGERPRINT_IMG = require('../assets/finger-print.png');

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
    { x: 12, y: 15, label: 'BIFUR', angle: -45 },
    { x: 32, y: 25, label: 'CORE', angle: 45 },
    { x: 18, y: 45, label: 'ISLAND', angle: -135 },
    { x: 35, y: 52, label: 'DELTA', angle: 135 },
  ];

  return (
    <View style={styles.minutiaeContainer}>
      {points.map((p, i) => {
        const x = flipped ? 48 - p.x : p.x;
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

const ScrambleText = ({ text, active, delay = 0 }: { text: string, active: boolean, delay?: number }) => {
// ... (rest of ScrambleText remains the same)
  return <Text style={styles.dataValue}>{text}</Text>;
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
          <View style={styles.fingerprintContainer}>
            <Image source={FINGERPRINT_IMG} style={styles.fingerprintImage} resizeMode="contain" />
            <MinutiaeMarkers active={statusText === 'PROCESSING' || statusText === 'COMPLETE'} />
            <View style={[StyleSheet.absoluteFill, { overflow: 'hidden' }]}>
              <VerificationCircles active={statusText === 'COMPLETE'} />
            </View>
          </View>
          <View style={styles.fingerprintContainer}>
            <Image 
              source={FINGERPRINT_IMG} 
              style={[styles.fingerprintImage, styles.flippedFingerprint]} 
              resizeMode="contain" 
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
      </View>

      <View style={styles.matchSection}>
        <Text style={styles.label}>MATCH</Text>
        <View style={styles.matchIndicators}>
          <View style={[styles.indicator, subject.sex === 'F' && styles.activeIndicator]}>
            <Text style={[styles.indicatorText, subject.sex === 'F' && styles.activeIndicatorText]}>F</Text>
          </View>
          <View style={[styles.indicator, subject.sex === 'M' && styles.activeIndicator]}>
            <Text style={[styles.indicatorText, subject.sex === 'M' && styles.activeIndicatorText]}>M</Text>
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
          <ScrambleText text={subject.locRecord.time} active={isScanning} delay={1500} />
        </View>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>PL:</Text>
          <ScrambleText text={subject.locRecord.pl} active={isScanning} delay={2000} />
        </View>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>D.O.B:</Text>
          <ScrambleText text={subject.locRecord.dob} active={isScanning} delay={2500} />
        </View>
      </View>

      <View style={styles.visualizer}>
        <Text style={styles.visualizerText}>░░▪▪░ {statusText}</Text>
      </View>
    </HUDBox>
  );
};

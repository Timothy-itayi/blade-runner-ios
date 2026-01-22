import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Animated, Image, Easing, StyleSheet } from 'react-native';
import { styles } from '../../styles/game/ScanPanel.styles';
import { HUDBox, DrawingBorder } from '../ui/HUDBox';
import { SubjectData } from '../../data/subjects';
import { Theme } from '../../constants/theme';
import { BUILD_SEQUENCE } from '../../constants/animations';

const FINGERPRINT_IMG = require('../../assets/finger-print.png');
const HAND_PRINT_0 = require('../../assets/handprints/hand-print0.png');
const HUMAN_PRINT_1 = require('../../assets/handprints/human-print1.png');
const HUMAN_PRINT_2 = require('../../assets/handprints/human-print2.png');
const AMPUTEE_HAND_0 = require('../../assets/handprints/amputee-hand0.png');
const REPLICANT_HAND = require('../../assets/handprints/replicant-hand.png');
const CYBORG_HAND = require('../../assets/handprints/cyborg-hand.png');

// Helper function to get the appropriate handprint image based on subject type
// Always returns subject-specific prints for UI consistency
const getHandprintImage = (subject: SubjectData, subjectIndex: number): any => {
  // Replicants get replicant handprint (check archetype string for 'REP')
  const archetypeStr = subject.archetype?.toString() || '';
  if (archetypeStr.includes('REP')) {
    return REPLICANT_HAND;
  }

  // Amputees get amputee handprint
  if (subject.biometricAnomaly === 'AMP') {
    return AMPUTEE_HAND_0;
  }

  // Cyborgs (prosthetics) get cyborg handprint
  if (subject.biometricAnomaly === 'PRO') {
    return CYBORG_HAND;
  }

  // Humans get one of the three human handprints (deterministic based on subject index)
  // Use modulo to cycle through the 3 options
  const humanPrintIndex = subjectIndex % 3;
  switch (humanPrintIndex) {
    case 0:
      return HAND_PRINT_0;
    case 1:
      return HUMAN_PRINT_1;
    case 2:
      return HUMAN_PRINT_2;
    default:
      return HAND_PRINT_0;
  }
};

const FingerprintSlot = ({ active, flipped = false, delay = 0, statusText, subjectIndex = 0, scanningHands = false, subject, biometricsRevealed = true }: { active: boolean, flipped?: boolean, delay?: number, statusText: string, subjectIndex?: number, scanningHands?: boolean, subject?: SubjectData, biometricsRevealed?: boolean }) => {
  // Get the appropriate handprint image based on subject type (always subject-specific)
  const imageSource = getHandprintImage(subject || {} as SubjectData, subjectIndex);
  const contentFade = useRef(new Animated.Value(0)).current;
  const gridFade = useRef(new Animated.Value(0)).current;
  const scanLineY = useRef(new Animated.Value(0)).current;
  const scanOpacity = useRef(new Animated.Value(0)).current;

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

  // Laser scan animation when scanning hands
  useEffect(() => {
    if (scanningHands) {
      scanLineY.setValue(0);
      scanOpacity.setValue(0);
      Animated.sequence([
        Animated.timing(scanOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scanLineY, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(scanOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [scanningHands]);

  return (
    <View style={styles.fingerprintContainer}>
      <DrawingBorder active={active} delay={delay} color="rgba(74, 138, 90, 0.4)" />
      
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: gridFade }]}>
        <View style={styles.fingerprintGrid} />
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, { opacity: contentFade }]}>
        <Image
          source={imageSource}
          style={[
            styles.handprintImage, // Always use handprint style for subject-specific prints
            flipped && styles.flippedFingerprint,
            { transform: [{ scale: 1.4 }, flipped ? { scaleX: -1 } : { scaleX: 1 }] }
          ]}
          resizeMode="cover"
        />
        {/* Laser scan line for hand scanning */}
        {scanningHands && (
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              {
                opacity: scanOpacity,
                transform: [{
                  translateY: scanLineY.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 80],
                  }),
                }],
              },
            ]}
          >
            <View style={styles.scanLine} />
          </Animated.View>
        )}
        <MinutiaeMarkers active={statusText === 'PROCESSING' || statusText === 'COMPLETE' || biometricsRevealed} flipped={flipped} />
        <View style={[StyleSheet.absoluteFill, { overflow: 'hidden' }]}>
          <VerificationCircles active={statusText === 'COMPLETE'} />
        </View>
      </Animated.View>
    </View>
  );
};

// Biometric ambiguity types
type BiometricStability = 'STABLE' | 'FLUCTUATING' | 'ANOMALOUS' | 'ERROR';

interface AmbiguousBiometrics {
  bpmRange: { min: number, max: number };
  stability: BiometricStability;
  confidence: number; // 0-100
  isError: boolean;
}

// Generate ambiguous biometric reading from base BPM
const generateAmbiguousBiometrics = (baseBpm: number | string, equipmentReliability: number = 85): AmbiguousBiometrics => {
  // Handle string BPM (special cases)
  if (typeof baseBpm === 'string') {
    const numMatch = baseBpm.match(/\d+/);
    baseBpm = numMatch ? parseInt(numMatch[0]) : 78;
  }

  // 15% chance of equipment error
  const isError = Math.random() > (equipmentReliability / 100);
  if (isError) {
    return {
      bpmRange: { min: 0, max: 0 },
      stability: 'ERROR',
      confidence: 0,
      isError: true,
    };
  }

  // Generate range (±4-8 BPM variance)
  const variance = 4 + Math.floor(Math.random() * 5);
  const min = Math.max(40, baseBpm - variance);
  const max = baseBpm + variance;

  // Determine stability based on BPM
  let stability: BiometricStability = 'STABLE';
  if (baseBpm > 100) {
    stability = 'ANOMALOUS';
  } else if (baseBpm > 85) {
    stability = 'FLUCTUATING';
  }

  // Confidence based on stability (lower for elevated readings)
  let confidence = 85 + Math.floor(Math.random() * 15); // 85-100
  if (stability === 'FLUCTUATING') confidence -= 15;
  if (stability === 'ANOMALOUS') confidence -= 25;

  return {
    bpmRange: { min, max },
    stability,
    confidence: Math.max(50, confidence),
    isError: false,
  };
};

const BPMMonitor = ({ active, delay = 0, bpm, pulseAnim, dataRevealed = true }: { active: boolean, delay?: number, bpm: string | number, pulseAnim: Animated.Value, dataRevealed?: boolean }) => {
  const [flicker, setFlicker] = useState(false);
  const opacity = useRef(new Animated.Value(0)).current;
  const [biometrics, setBiometrics] = useState<AmbiguousBiometrics | null>(null);

  // Phase 2: Handle equipment failure - show error if BPM is 'ERROR'
  const isEquipmentError = bpm === 'ERROR' || (typeof bpm === 'string' && bpm.includes('ERROR'));

  // Generate ambiguous reading when BPM changes (only if not error)
  useEffect(() => {
    if (isEquipmentError) {
      setBiometrics({
        bpmRange: { min: 0, max: 0 },
        stability: 'ERROR',
        confidence: 0,
        isError: true,
      });
    } else if (typeof bpm === 'number' || typeof bpm === 'string') {
      setBiometrics(generateAmbiguousBiometrics(bpm));
    }
  }, [bpm, isEquipmentError]);

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

  // Format BPM display with ambiguity
  const getBpmDisplay = () => {
    if (!isLive || !dataRevealed) return '-- BPM';
    if (!biometrics) return '-- BPM';
    if (biometrics.isError || isEquipmentError) return 'ERROR';

    const { bpmRange, stability } = biometrics;
    return `${bpmRange.min}-${bpmRange.max} BPM`;
  };

  const getStabilityColor = () => {
    if (!biometrics || biometrics.isError) return Theme.colors.textDim;
    switch (biometrics.stability) {
      case 'STABLE': return Theme.colors.accentApprove;
      case 'FLUCTUATING': return '#FF6B35'; // Orange/warning
      case 'ANOMALOUS': return Theme.colors.accentDeny;
      default: return Theme.colors.textDim;
    }
  };

  const getConfidenceDisplay = () => {
    if (!biometrics || biometrics.isError || !dataRevealed) return '';
    return `${biometrics.confidence}%`;
  };

  return (
    <Animated.View style={[styles.bpmColumn, { opacity }]}>
      <Text style={styles.label}>BIOMETRICS</Text>
      <View style={styles.bpmRow}>
        <Animated.View
          style={[
            styles.pulseDot,
            {
              backgroundColor: isLive && dataRevealed ? getStabilityColor() : Theme.colors.textDim,
              transform: [{ scale: isLive ? pulseAnim : 1 }]
            }
          ]}
        />
        <Text style={[styles.bpmText, (!isLive || !dataRevealed) && { color: Theme.colors.textDim }]}>
          {getBpmDisplay()}
        </Text>
      </View>
      {dataRevealed && biometrics && !biometrics.isError && (
        <View style={styles.bpmRow}>
          <Text style={[styles.stabilityText, { color: getStabilityColor() }]}>
            {biometrics.stability}
          </Text>
          <Text style={styles.confidenceText}>
            {getConfidenceDisplay()}
          </Text>
        </View>
      )}
      {dataRevealed && (biometrics?.isError || isEquipmentError) && (
        <Text style={[styles.stabilityText, { color: Theme.colors.accentDeny }]}>
          ERROR SENSOR MALFUNCTION
        </Text>
      )}
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

// Phase 5: Ambiguous biometric condition type
interface AmbiguousConditionDisplay {
  medicalExplanation: string;
  suspiciousExplanation: string;
}

export const ScanPanel = ({ isScanning, scanProgress, hudStage, subject, subjectIndex, scanningHands = false, businessProbeCount = 0, dimmed = false, biometricsRevealed = true, ambiguousCondition = null, equipmentFailures = [], bpmDataAvailable = true, interrogationBPM = null, isInterrogationActive = false, establishedBPM = 72 }: {
  isScanning: boolean,
  scanProgress: Animated.Value,
  hudStage: 'none' | 'wireframe' | 'outline' | 'full',
  subject: SubjectData,
  subjectIndex?: number,
  scanningHands?: boolean,
  businessProbeCount?: number,
  dimmed?: boolean,
  biometricsRevealed?: boolean, // Progressive revelation - biometrics visible after delay
  ambiguousCondition?: AmbiguousConditionDisplay | null, // Phase 5: Ambiguous biometric condition
  equipmentFailures?: string[], // Phase 2: Equipment failures
  bpmDataAvailable?: boolean, // Phase 2: Is BPM monitor working?
  interrogationBPM?: number | null, // Phase 2: Current BPM during interrogation (null = baseline)
  isInterrogationActive?: boolean, // Phase 2: Is interrogation currently active?
  establishedBPM?: number, // Phase 4: Baseline BPM established from greeting
}) => {
  const [statusText, setStatusText] = useState('READY');
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [bpm, setBpm] = useState<string | number>(78);
  const [baselineBPM, setBaselineBPM] = useState<string | number>(78);
  const panelOpacity = useRef(new Animated.Value(1)).current;
  
  // Layer animations
  const fingerprintOpacity = useRef(new Animated.Value(0)).current;
  const matchSectionOpacity = useRef(new Animated.Value(0)).current;
  
  // Dim panel when subject is offended from too many scans
  useEffect(() => {
    if (dimmed) {
      Animated.timing(panelOpacity, {
        toValue: 0.3,
        duration: 500,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(panelOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [dimmed]);
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

  // Phase 4: Use established BPM from greeting as baseline (falls back to subject.bpm)
  useEffect(() => {
    if (typeof subject.bpm === 'string') {
      setBaselineBPM(subject.bpm);
    } else {
      // Use established BPM from greeting if available, otherwise use subject default
      const baseBpm = establishedBPM || subject.bpm || 72;
      setBaselineBPM(baseBpm);
    }
  }, [subject.id, subject.bpm, establishedBPM]);

  // Phase 2: BPM monitoring - baseline until interrogation, then use interrogation BPM
  useEffect(() => {
    if (isInterrogationActive && interrogationBPM !== null) {
      // During interrogation, use the interrogation BPM
      setBpm(interrogationBPM);
    } else {
      // Before interrogation, use baseline BPM
      setBpm(baselineBPM);
    }
  }, [isInterrogationActive, interrogationBPM, baselineBPM]);

  useEffect(() => {
    if (hudStage !== 'full') {
      setStatusText('INITIALIZING...');
      return;
    }

    if (!isScanning) {
      setStatusText('READY');
      return;
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
    });

    return () => scanProgress.removeListener(listener);
  }, [isScanning, scanProgress, hudStage]);

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
    <Animated.View style={{ opacity: panelOpacity }}>
      <HUDBox hudStage={hudStage} style={styles.container} buildDelay={BUILD_SEQUENCE.scanPanelBorder}>
      <View style={styles.fingerprintSection}>
        <View style={styles.fingerprintSlots}>
          <FingerprintSlot 
            active={true} 
            delay={BUILD_SEQUENCE.fingerprintLeft} 
            statusText={statusText}
            subjectIndex={subjectIndex}
            scanningHands={scanningHands}
            subject={subject}
            biometricsRevealed={biometricsRevealed}
          />
          <FingerprintSlot 
            active={true} 
            flipped={true} 
            delay={BUILD_SEQUENCE.fingerprintRight} 
            statusText={statusText}
            subjectIndex={subjectIndex}
            scanningHands={scanningHands}
            subject={subject}
            biometricsRevealed={biometricsRevealed}
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
          bpm={bpmDataAvailable ? bpm : 'ERROR'}
          pulseAnim={pulseAnim}
          dataRevealed={biometricsRevealed && bpmDataAvailable}
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
    </Animated.View>
  );
};

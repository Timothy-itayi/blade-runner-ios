import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { EyeDisplay } from '../../ui/EyeDisplay';
import { CommLinkPanel } from '../CommLinkPanel';
import { SubjectData } from '../../../data/subjects';
import { ShiftData } from '../../../constants/shifts';
import { Theme } from '../../../constants/theme';
import { getSubjectGreeting } from '../../../data/subjectGreetings';
import { MechanicalButton } from '../../ui/MechanicalUI';
import { LabelTape, LEDIndicator, ControlGroup } from '../../ui/LabelTape';
import { Screw, NoiseOverlay } from '../../ui/ChassisFrame';
import { ScanlineOverlay } from '../../ui/CRTScreen';

// Metal texture for chassis
const METAL_TEXTURE = require('../../../assets/textures/Texturelabs_Metal_264S.jpg');

// Vibrant oscilloscope color palette
const OSC_COLORS = {
  // Screen colors
  screenGlow: '#00ffaa',
  screenBase: '#0a1a14',
  screenBorder: '#1a3a2a',
  
  // Panel colors
  panelCream: '#e8e0d0',
  panelBeige: '#d4c8b4',
  panelGray: '#4a4e54',
  panelDark: '#2a2e34',
  
  // Button colors - vibrant variety
  buttonCream: '#f0e8d8',
  buttonYellow: '#ffd54f',
  buttonOrange: '#ff9800',
  buttonRed: '#f44336',
  buttonGreen: '#4caf50',
  buttonBlue: '#2196f3',
  buttonPurple: '#9c27b0',
  buttonCyan: '#00bcd4',
  buttonPink: '#e91e63',
  
  // LED colors
  ledGreen: '#00ff88',
  ledRed: '#ff4444',
  ledYellow: '#ffdd00',
  ledBlue: '#00aaff',
  
  // Text colors
  textLight: '#f5f0e6',
  textDark: '#1a1a1a',
  textGlow: '#00ffaa',
};

interface GameScreenProps {
  hudStage: 'none' | 'wireframe' | 'outline' | 'full';
  currentShift: ShiftData;
  currentSubject: SubjectData;
  currentSubjectIndex: number;
  isScanning: boolean;
  scanProgress: Animated.Value;
  scanningHands: boolean;
  scanningIris: boolean;
  biometricsRevealed: boolean;
  hasDecision: boolean;
  decisionOutcome: { type: 'APPROVE' | 'DENY', outcome: any } | null;
  onSettingsPress: () => void;
  onDecision: (type: 'APPROVE' | 'DENY') => void;
  onNext: () => void;
  eyeScannerActive?: boolean;
  onToggleEyeScanner?: () => void;
  onEyeScannerTap?: (holdDurationMs?: number) => void;
  isIdentityScanning?: boolean;
  identityScanUsed?: boolean;
  onIdentityScanComplete?: () => void;
  // Simplified props - many removed
  [key: string]: any;
}

export const GameScreen = ({
  hudStage,
  currentShift,
  currentSubject,
  currentSubjectIndex,
  isScanning,
  scanProgress,
  biometricsRevealed,
  hasDecision,
  decisionOutcome,
  onDecision,
  onNext,
  eyeScannerActive = false,
  onToggleEyeScanner,
  onEyeScannerTap,
  isIdentityScanning = false,
  identityScanUsed = false,
  onIdentityScanComplete,
}: GameScreenProps) => {
  const router = useRouter();
  const [identityScanHoldActive, setIdentityScanHoldActive] = useState(false);
  const portraitBaseImageId = currentSubjectIndex % 3;
  const forceProceduralPortrait = true;
  
  const handleMapPress = () => {
    router.push('/map');
  };
  
  // Pulsing LED animation
  const ledPulse = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(ledPulse, { toValue: 1, duration: 800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(ledPulse, { toValue: 0, duration: 800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // Auto-advance after decision
  useEffect(() => {
    if (!hasDecision) return;
    const timer = setTimeout(() => {
      onNext();
    }, 1200);
    return () => clearTimeout(timer);
  }, [hasDecision, onNext]);

  const handleDecision = (type: 'APPROVE' | 'DENY') => {
    if (isScanning || hasDecision) return;
    onDecision(type);
  };

  if (hudStage === 'none') return null;

  return (
    <View style={styles.container}>
      {/* Metal chassis background */}
      <View style={styles.chassisBackground}>
        <Image source={METAL_TEXTURE} style={styles.chassisTexture} contentFit="cover" />
        <LinearGradient
          colors={['rgba(58,62,70,0.95)', 'rgba(42,46,52,0.98)']}
          style={styles.chassisOverlay}
        />
      </View>
      
      {/* Noise texture */}
      <NoiseOverlay opacity={0.015} />
      
      {/* Corner screws */}
      <Screw position="topLeft" size={14} />
      <Screw position="topRight" size={14} />
      <Screw position="bottomLeft" size={14} />
      <Screw position="bottomRight" size={14} />
      
      {/* Header panel */}
      <View style={styles.headerPanel}>
        <View style={styles.headerLeft}>
          <View style={styles.modelLabel}>
            <Text style={styles.modelText}>7613</Text>
          </View>
          <Text style={styles.deviceName}>FACE SCANNER</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.statusGroup}>
            <LEDIndicator active={!isScanning} color="green" size={8} />
            <Text style={styles.statusLabel}>READY</Text>
          </View>
          <View style={styles.statusGroup}>
            <LEDIndicator active={isScanning} color="yellow" size={8} />
            <Text style={styles.statusLabel}>SCAN</Text>
          </View>
          <View style={styles.statusGroup}>
            <LEDIndicator active={hasDecision} color={decisionOutcome?.type === 'APPROVE' ? 'green' : 'red'} size={8} />
            <Text style={styles.statusLabel}>RESULT</Text>
          </View>
        </View>
      </View>

      {/* Main screen area */}
      <View style={styles.screenContainer}>
        {/* Screen bezel */}
        <View style={styles.screenBezel}>
          {/* Inner screen with CRT effects */}
          <View style={styles.screenInner}>
            {/* Phosphor glow base */}
            <View style={styles.phosphorGlow} />
            
            {/* Face display */}
            <EyeDisplay
              key={`eye-${currentSubject.id}`}
              isScanning={isScanning}
              scanProgress={scanProgress}
              videoSource={currentSubject.videoSource}
              eyeVideo={currentSubject.eyeVideo}
              eyeImage={currentSubject.eyeImage}
              videoStartTime={currentSubject.videoStartTime}
              videoEndTime={currentSubject.videoEndTime}
              hudStage={hudStage}
              hasDecision={hasDecision}
              decisionType={decisionOutcome?.type}
              eyeScannerActive={eyeScannerActive}
              onToggleEyeScanner={onToggleEyeScanner}
              onEyeScannerTap={onEyeScannerTap}
              identityScanHoldActive={identityScanHoldActive}
              onIdentityScanHoldStart={() => setIdentityScanHoldActive(true)}
              onIdentityScanHoldEnd={() => setIdentityScanHoldActive(false)}
              interactionPhase="investigation"
              isIdentityScanning={isIdentityScanning}
              identityScanComplete={identityScanUsed}
              onIdentityScanComplete={onIdentityScanComplete}
              biometricsRevealed={biometricsRevealed}
              useProceduralPortrait={forceProceduralPortrait}
              subjectId={currentSubject.id}
              subjectType={currentSubject.subjectType}
              isAnomaly={currentSubject.biometricData?.anomalyDetected}
              baseImageIdOverride={portraitBaseImageId}
            />
            
            {/* Scanlines */}
            <ScanlineOverlay intensity={0.08} />
            
            {/* Screen vignette */}
            <View style={styles.screenVignette} pointerEvents="none" />
          </View>
        </View>
        
        {/* Subject / status readout - small counter-style screen */}
        <View style={styles.subjectReadout}>
          <View style={styles.subjectReadoutBezel}>
            <View style={styles.subjectReadoutScreen}>
              <View style={styles.subjectReadoutLabelRow}>
                <Text style={styles.subjectReadoutLabel}>SUBJECT</Text>
                <Text style={styles.subjectReadoutLabel}>STATUS</Text>
              </View>
              <View style={styles.subjectReadoutValueRow}>
                <Text style={styles.subjectReadoutId} numberOfLines={1}>{currentSubject.id}</Text>
                <Text style={styles.subjectReadoutStatus} numberOfLines={1}>
                  {isScanning ? 'SCANNING' : hasDecision ? (decisionOutcome?.type === 'APPROVE' ? 'CLEARED' : 'REJECTED') : 'AWAIT'}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Dialogue comms link - live transcription under screen */}
      <View style={styles.commsLinkWrapper}>
        <CommLinkPanel
          hudStage={hudStage}
          dialogue={currentSubject.dialogue ?? getSubjectGreeting(currentSubject.id, currentSubject)?.greetingText}
          subjectId={currentSubject.id}
          subjectType={currentSubject.subjectType}
          isAnomaly={currentSubject.biometricData?.anomalyDetected}
          useProceduralPortrait={forceProceduralPortrait}
          baseImageIdOverride={portraitBaseImageId}
        />
      </View>

      {/* Control panel */}
      <View style={styles.controlPanel}>
        {/* Control panel texture */}
        <View style={styles.controlPanelTexture}>
          <Image source={METAL_TEXTURE} style={styles.controlTexture} contentFit="cover" />
          <View style={styles.controlTextureOverlay} />
        </View>
        
        {/* Left control group - Mode selection */}
        <View style={styles.controlGroup}>
          <LabelTape text="MODE" variant="cream" size="small" />
          <View style={styles.buttonGroup}>
            <MechanicalButton
              label="SCAN"
              onPress={() => onToggleEyeScanner?.()}
              color={eyeScannerActive ? OSC_COLORS.buttonCyan : OSC_COLORS.buttonCream}
              showLED
              ledColor={eyeScannerActive ? 'blue' : 'green'}
              ledActive={eyeScannerActive}
              style={styles.modeButton}
            />
            <MechanicalButton
              label="MAP"
              onPress={handleMapPress}
              color={OSC_COLORS.buttonPurple}
              showLED
              ledColor="blue"
              ledActive={true}
              style={styles.modeButton}
            />
          </View>
        </View>

        {/* Right control group - Decision buttons */}
        <View style={styles.controlGroupLarge}>
          <LabelTape text="CLEARANCE" variant="cream" size="small" />
          <View style={styles.decisionRow}>
            <View style={styles.decisionButton}>
              <MechanicalButton
                label="ALLOW"
                onPress={() => handleDecision('APPROVE')}
                disabled={isScanning || hasDecision}
                color={OSC_COLORS.buttonGreen}
                showLED
                ledColor="green"
                ledActive={!isScanning && !hasDecision}
                style={styles.allowButton}
              />
            </View>
            <View style={styles.decisionButton}>
              <MechanicalButton
                label="REJECT"
                onPress={() => handleDecision('DENY')}
                disabled={isScanning || hasDecision}
                color={OSC_COLORS.buttonRed}
                showLED
                ledColor="red"
                ledActive={!isScanning && !hasDecision}
                style={styles.rejectButton}
              />
            </View>
          </View>
        </View>
      </View>

      {/* Bottom status bar */}
      <View style={styles.statusBar}>
        <View style={styles.statusItem}>
          <Text style={styles.statusBarLabel}>SHIFT</Text>
          <Text style={styles.statusBarValue}>{currentShift.id}</Text>
        </View>
        <View style={styles.statusItem}>
          <Text style={styles.statusBarLabel}>SUBJECT</Text>
          <Text style={styles.statusBarValue}>{currentSubjectIndex + 1}</Text>
        </View>
        <View style={styles.statusItem}>
          <LEDIndicator active={true} color="green" size={6} />
          <Text style={styles.statusBarLabel}>POWER</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: OSC_COLORS.panelGray,
    borderRadius: 8,
    overflow: 'hidden',
    padding: 8,
  },
  chassisBackground: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  chassisTexture: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.3,
  },
  chassisOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  
  // Header
  headerPanel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 8,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 4,
    borderWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    borderLeftColor: 'rgba(255,255,255,0.08)',
    borderBottomColor: 'rgba(0,0,0,0.4)',
    borderRightColor: 'rgba(0,0,0,0.3)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modelLabel: {
    backgroundColor: OSC_COLORS.buttonCream,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 2,
  },
  modelText: {
    fontFamily: Theme.fonts.mono,
    fontSize: 14,
    fontWeight: 'bold',
    color: OSC_COLORS.textDark,
    letterSpacing: 1,
  },
  deviceName: {
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
    fontWeight: 'bold',
    color: OSC_COLORS.textLight,
    letterSpacing: 2,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 16,
  },
  statusGroup: {
    alignItems: 'center',
    gap: 2,
  },
  statusLabel: {
    fontFamily: Theme.fonts.mono,
    fontSize: 7,
    color: OSC_COLORS.textLight,
    letterSpacing: 0.5,
    opacity: 0.8,
  },
  
  // Screen
  screenContainer: {
    flex: 1,
    marginBottom: 8,
  },
  commsLinkWrapper: {
    marginBottom: 10,
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: 'rgba(127, 184, 216, 0.15)',
    borderRadius: 4,
    backgroundColor: 'rgba(10, 14, 18, 0.6)',
  },
  screenBezel: {
    flex: 1,
    backgroundColor: '#1a1d22',
    borderRadius: 8,
    padding: 6,
    // Bezel effect
    borderWidth: 4,
    borderTopColor: 'rgba(80,85,95,0.6)',
    borderLeftColor: 'rgba(80,85,95,0.5)',
    borderBottomColor: 'rgba(15,18,22,0.9)',
    borderRightColor: 'rgba(15,18,22,0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  screenInner: {
    flex: 1,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: OSC_COLORS.screenBase,
    // Inner shadow
    borderWidth: 2,
    borderTopColor: 'rgba(0,0,0,0.6)',
    borderLeftColor: 'rgba(0,0,0,0.5)',
    borderBottomColor: 'rgba(0,255,170,0.1)',
    borderRightColor: 'rgba(0,255,170,0.08)',
  },
  phosphorGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 255, 170, 0.03)',
    zIndex: 1,
  },
  screenVignette: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 6,
    borderWidth: 30,
    borderColor: 'rgba(0,0,0,0.2)',
    zIndex: 100,
  },
  subjectReadout: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    alignItems: 'center',
  },
  subjectReadoutBezel: {
    backgroundColor: OSC_COLORS.panelDark,
    padding: 4,
    borderRadius: 4,
    borderWidth: 2,
    borderTopColor: 'rgba(80,85,95,0.6)',
    borderLeftColor: 'rgba(80,85,95,0.5)',
    borderBottomColor: 'rgba(15,18,22,0.9)',
    borderRightColor: 'rgba(15,18,22,0.8)',
    minWidth: 160,
  },
  subjectReadoutScreen: {
    backgroundColor: '#0a1218',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: 'rgba(0,255,170,0.25)',
  },
  subjectReadoutLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
    paddingBottom: 2,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,255,170,0.15)',
  },
  subjectReadoutLabel: {
    fontFamily: Theme.fonts.mono,
    fontSize: 7,
    color: OSC_COLORS.screenGlow,
    letterSpacing: 1.5,
    opacity: 0.7,
  },
  subjectReadoutValueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subjectReadoutId: {
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
    fontWeight: 'bold',
    color: OSC_COLORS.screenGlow,
    letterSpacing: 2,
    maxWidth: '55%',
  },
  subjectReadoutStatus: {
    fontFamily: Theme.fonts.mono,
    fontSize: 9,
    color: OSC_COLORS.textLight,
    letterSpacing: 1,
    opacity: 0.9,
    maxWidth: '40%',
  },
  
  // Control panel
  controlPanel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 6,
    marginBottom: 8,
    // Inset effect
    borderWidth: 2,
    borderTopColor: 'rgba(0,0,0,0.4)',
    borderLeftColor: 'rgba(0,0,0,0.3)',
    borderBottomColor: 'rgba(100,105,115,0.3)',
    borderRightColor: 'rgba(100,105,115,0.25)',
    position: 'relative',
    overflow: 'hidden',
  },
  controlPanelTexture: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  controlTexture: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.15,
  },
  controlTextureOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(42,46,52,0.92)',
  },
  controlGroup: {
    alignItems: 'center',
    gap: 8,
    zIndex: 1,
  },
  controlGroupLarge: {
    alignItems: 'center',
    gap: 8,
    flex: 1,
    maxWidth: 200,
    zIndex: 1,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  modeButton: {
    minWidth: 70,
    height: 44,
  },
  decisionRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  decisionButton: {
    flex: 1,
  },
  allowButton: {
    height: 52,
  },
  rejectButton: {
    height: 52,
  },
  
  // Status bar
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 6,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 4,
    borderWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.3)',
    borderBottomColor: 'rgba(100,105,115,0.2)',
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusBarLabel: {
    fontFamily: Theme.fonts.mono,
    fontSize: 9,
    color: OSC_COLORS.textLight,
    letterSpacing: 1,
    opacity: 0.7,
  },
  statusBarValue: {
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
    fontWeight: 'bold',
    color: OSC_COLORS.screenGlow,
    letterSpacing: 1,
  },
});

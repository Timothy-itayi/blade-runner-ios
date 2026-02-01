import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing, ScrollView, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { CommLinkPanel } from '../CommLinkPanel';
import { SubjectData } from '../../../data/subjects';
import { ShiftData } from '../../../constants/shifts';
import { Theme } from '../../../constants/theme';
import { getSubjectGreeting } from '../../../data/subjectGreetings';
import { MechanicalButton } from '../../ui/MechanicalUI';
import { LabelTape, LEDIndicator } from '../../ui/LabelTape';
import { Screw, NoiseOverlay } from '../../ui/ChassisFrame';
import { ScanlineOverlay } from '../../ui/CRTScreen';
import { createEmptyInformation, GatheredInformation, LastExtractSnapshot } from '../../../types/information';
import {
  formatRequiredChecks,
  getMissingRequiredChecks,
  getRequiredChecks,
  RequiredCheck,
} from '../../../utils/requiredChecks';

// Metal texture for chassis
const METAL_TEXTURE = require('../../../assets/textures/Texturelabs_Metal_264S.jpg');
const GLASS_TEXTURE = require('../../../assets/textures/Texturelabs_Glass_127S.jpg');

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

  // Section accents
  sectionDirective: '#e26a6a',
  sectionChecks: '#6fd1ff',
  sectionSubject: '#ffd48a',
};

type DbQueryType = 'WARRANT' | 'TRANSIT' | 'INCIDENT';

// Map query types to RequiredCheck types
const QUERY_TO_CHECK: Record<DbQueryType, RequiredCheck> = {
  WARRANT: 'WARRANT',
  TRANSIT: 'TRANSIT',
  INCIDENT: 'INCIDENT',
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
  gatheredInformation?: GatheredInformation;
  onInformationUpdate?: (info: Partial<GatheredInformation>) => void;
  [key: string]: any;
}

export const GameScreen = ({
  hudStage,
  currentShift,
  currentSubject,
  currentSubjectIndex,
  hasDecision,
  decisionOutcome,
  onDecision,
  onNext,
  gatheredInformation,
  onInformationUpdate,
}: GameScreenProps) => {
  const router = useRouter();
  const portraitBaseImageId = currentSubjectIndex % 3;
  const forceProceduralPortrait = true;
  const [dbOutput, setDbOutput] = useState<string[]>([]);
  const [lastQuery, setLastQuery] = useState<string>('NONE');
  const [pendingDecision, setPendingDecision] = useState<{
    type: 'APPROVE' | 'DENY';
    missing: RequiredCheck[];
  } | null>(null);

  const info = gatheredInformation || createEmptyInformation();
  const requiredChecks = useMemo(() => {
    if (currentSubject.requiredChecks?.length) {
      return currentSubject.requiredChecks;
    }
    return getRequiredChecks(currentShift);
  }, [currentShift.id, currentShift.activeRules, currentShift.unlockedChecks, currentSubject.requiredChecks]);
  const requiredCheckLabel = formatRequiredChecks(requiredChecks);
  const missingChecks = getMissingRequiredChecks(info, requiredChecks);
  const requiredCount = requiredChecks.length;
  const completedCount = requiredCount - missingChecks.length;

  // Helper: is this check type required by the current directive?
  const isCheckRequired = (query: DbQueryType): boolean => {
    const checkType = QUERY_TO_CHECK[query];
    // DATABASE is a wildcard that matches any check
    if (requiredChecks.includes('DATABASE' as RequiredCheck)) return true;
    return requiredChecks.includes(checkType);
  };
  const flags = useMemo(() => {
    const list: string[] = [];
    if (info.warrantCheck && currentSubject.warrants && currentSubject.warrants !== 'NONE') {
      list.push('WARRANT FOUND');
    }
    if (info.transitLog && currentSubject.databaseQuery?.travelHistory?.some((entry) => entry.flagged)) {
      list.push('TRANSIT FLAGGED');
    }
    if (info.incidentHistory && currentSubject.incidents > 0) {
      list.push('INCIDENT RECORD');
    }
    if (hasDecision && currentSubject.intendedOutcome && decisionOutcome?.type) {
      if (currentSubject.intendedOutcome !== decisionOutcome.type) {
        list.push('DIRECTIVE CONFLICT');
      }
    }
    return list;
  }, [
    info.warrantCheck,
    info.transitLog,
    info.incidentHistory,
    currentSubject.warrants,
    currentSubject.databaseQuery?.travelHistory,
    currentSubject.incidents,
    currentSubject.intendedOutcome,
    hasDecision,
    decisionOutcome?.type,
  ]);
  
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

  useEffect(() => {
    setDbOutput([]);
    setLastQuery('NONE');
    setPendingDecision(null);
  }, [currentSubject.id]);

  // Auto-advance after decision
  useEffect(() => {
    if (!hasDecision) return;
    const timer = setTimeout(() => {
      onNext();
    }, 1200);
    return () => clearTimeout(timer);
  }, [hasDecision, onNext]);

  const handleDecision = (type: 'APPROVE' | 'DENY') => {
    if (hasDecision) return;
    const missingChecks = getMissingRequiredChecks(info, requiredChecks);
    if (missingChecks.length > 0) {
      setPendingDecision({ type, missing: missingChecks });
      return;
    }
    onDecision(type);
  };

  const buildDbOutput = (query: DbQueryType): string[] => {
    const cached = currentSubject.evidenceOutputs?.[query];
    if (cached && cached.length > 0) {
      return cached;
    }

    const isRequired = isCheckRequired(query);
    const checkLabel = isRequired ? '[REQUIRED]' : '[OPTIONAL]';

    if (query === 'WARRANT') {
      const hasWarrant = currentSubject.warrants && currentSubject.warrants !== 'NONE';
      const lines: string[] = [
        `── WARRANT CHECK ${checkLabel} ──`,
        '',
        `STATUS: ${hasWarrant ? '⚠ ACTIVE' : '✓ CLEAR'}`,
      ];
      if (hasWarrant) {
        lines.push(`OFFENSE: ${currentSubject.warrants}`);
      }
      lines.push('');
      lines.push('── END ──');
      return lines;
    }

    if (query === 'TRANSIT') {
      const travel = currentSubject.databaseQuery?.travelHistory || [];
      const flaggedEntries = travel.filter((entry) => entry.flagged);
      const hasFlagged = flaggedEntries.length > 0;

      const lines: string[] = [
        `── TRANSIT LOG ${checkLabel} ──`,
        '',
        `RECORDS: ${travel.length}`,
        `STATUS: ${hasFlagged ? `⚠ ${flaggedEntries.length} FLAGGED` : '✓ CLEAR'}`,
        '',
      ];

      // Show travel entries with clear structure
      travel.slice(0, 3).forEach((entry) => {
        const fromPlanet = entry.from || (entry as any).fromPlanet || 'UNK';
        const toPlanet = entry.to || (entry as any).toPlanet || 'UNK';
        const date = entry.date || 'UNK';
        const flagMarker = entry.flagged ? ' ⚠' : '';
        lines.push(`${date}`);
        lines.push(`  ${fromPlanet} → ${toPlanet}${flagMarker}`);
        if (entry.flagged && entry.flagNote) {
          lines.push(`  REASON: ${entry.flagNote}`);
        } else if (entry.flagged) {
          lines.push(`  REASON: UNSPECIFIED`);
        }
      });

      if (travel.length > 3) {
        lines.push(`... ${travel.length - 3} more entries`);
      }

      lines.push('');

      // Add consequence warning for optional checks with flags
      if (!isRequired && hasFlagged) {
        lines.push('┌─ RISK WARNING ─┐');
        lines.push('│ APPROVAL MAY   │');
        lines.push('│ AFFECT OUTCOME │');
        lines.push('└────────────────┘');
      }

      lines.push('── END ──');
      return lines;
    }

    // INCIDENT
    const discrepancies = currentSubject.databaseQuery?.discrepancies || [];
    const incidents = typeof currentSubject.incidents === 'number' ? currentSubject.incidents : 0;
    const hasIssues = incidents > 0 || discrepancies.length > 0;

    const lines: string[] = [
      `── INCIDENT LOG ${checkLabel} ──`,
      '',
      `ON FILE: ${incidents}`,
      `STATUS: ${hasIssues ? '⚠ RECORDS FOUND' : '✓ CLEAR'}`,
      '',
    ];

    discrepancies.slice(0, 3).forEach((entry, index) => {
      lines.push(`${index + 1}. ${entry}`);
    });

    if (discrepancies.length > 3) {
      lines.push(`... ${discrepancies.length - 3} more entries`);
    }

    lines.push('');

    // Add consequence warning for optional checks with issues
    if (!isRequired && hasIssues) {
      lines.push('┌─ RISK WARNING ─┐');
      lines.push('│ APPROVAL MAY   │');
      lines.push('│ AFFECT OUTCOME │');
      lines.push('└────────────────┘');
    }

    lines.push('── END ──');
    return lines;
  };

  const handleDbQuery = (query: DbQueryType) => {
    const output = buildDbOutput(query);
    const now = Date.now();
    const nextExtract: LastExtractSnapshot = {
      lines: output.slice(0, 2),
      timestamp: now,
    };

    setDbOutput(output);
    setLastQuery(query);

    if (!onInformationUpdate) return;

    if (query === 'WARRANT') {
      onInformationUpdate({
        warrantCheck: true,
        timestamps: { ...info.timestamps, warrantCheck: now },
        lastExtracted: { ...info.lastExtracted, WARRANT: nextExtract },
      });
    } else if (query === 'TRANSIT') {
      onInformationUpdate({
        transitLog: true,
        timestamps: { ...info.timestamps, transitLog: now },
        lastExtracted: { ...info.lastExtracted, TRANSIT: nextExtract },
      });
    } else {
      onInformationUpdate({
        incidentHistory: true,
        timestamps: { ...info.timestamps, incidentHistory: now },
        lastExtracted: { ...info.lastExtracted, INCIDENT: nextExtract },
      });
    }
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
          <Text style={styles.deviceName}>CHECKPOINT</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.statusGroup}>
            <LEDIndicator active={!hasDecision} color="green" size={8} />
            <Text style={styles.statusLabel}>READY</Text>
          </View>
          <View style={styles.statusGroup}>
            <LEDIndicator active={hasDecision} color={decisionOutcome?.type === 'APPROVE' ? 'green' : 'red'} size={8} />
            <Text style={styles.statusLabel}>RESULT</Text>
          </View>
        </View>
      </View>

      {/* Main screen area - lightweight status (no face scanner) */}
      <View style={styles.screenContainer}>
        <View style={styles.screenBezel}>
          <View style={styles.screenInner}>
            <View style={styles.phosphorGlow} />
            <LinearGradient
              colors={['rgba(0, 255, 170, 0.08)', 'rgba(0, 0, 0, 0)']}
              style={styles.screenLight}
            />
            <Image source={GLASS_TEXTURE} style={styles.screenGlass} contentFit="cover" />
            <View style={styles.screenContent}>
              <View style={[styles.directiveStrip, pendingDecision && styles.directiveStripWarning]}>
                <Text style={styles.directiveStripLabel}>DIRECTIVE</Text>
                <View style={styles.directiveStripText}>
                  {currentShift.directive.split('\n').map((line, index) => (
                    <Text key={`${line}-${index}`} style={styles.directiveStripLine}>
                      {line}
                    </Text>
                  ))}
                </View>
                <View style={styles.directiveStripMeta}>
                  <Text style={styles.directiveStripMetaText}>
                    REQ CHECKS: {completedCount}/{requiredCount || 0}
                  </Text>
                  <Text style={styles.directiveStripMetaText}>
                    TARGET: {requiredCheckLabel}
                  </Text>
                </View>
              </View>

              <View style={styles.workSurface}>
                <View style={[styles.outputColumn, pendingDecision && styles.outputColumnWarning]}>
                  <View style={styles.outputHeader}>
                    <Text style={styles.outputLabel}>CHECKS</Text>
                    <Text style={styles.outputMeta}>
                      {requiredCount > 0 
                        ? `${completedCount}/${requiredCount} REQUIRED` 
                        : 'NO CHECKS REQUIRED'}
                    </Text>
                  </View>
                  <View style={styles.outputControls}>
                    {(['WARRANT', 'TRANSIT', 'INCIDENT'] as DbQueryType[]).map((queryType) => {
                      const required = isCheckRequired(queryType);
                      const completed = (queryType === 'WARRANT' && info.warrantCheck) ||
                                        (queryType === 'TRANSIT' && info.transitLog) ||
                                        (queryType === 'INCIDENT' && info.incidentHistory);
                      return (
                        <TouchableOpacity
                          key={queryType}
                          onPress={() => handleDbQuery(queryType)}
                          style={[
                            styles.outputButton,
                            required && styles.outputButtonRequired,
                            !required && styles.outputButtonOptional,
                            completed && styles.outputButtonCompleted,
                          ]}
                          activeOpacity={0.7}
                        >
                          <View style={styles.outputButtonContent}>
                            <Text style={[
                              styles.outputButtonText,
                              required && styles.outputButtonTextRequired,
                            ]}>
                              {queryType}
                            </Text>
                            <Text style={[
                              styles.outputButtonTag,
                              required ? styles.outputButtonTagRequired : styles.outputButtonTagOptional,
                            ]}>
                              {required ? 'REQ' : 'OPT'}
                            </Text>
                          </View>
                          {completed && (
                            <Text style={styles.outputButtonDone}>✓</Text>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                  {pendingDecision && (
                    <View style={styles.outputMissing}>
                      <Text style={styles.outputMissingText}>
                        MISSING CHECKS: {pendingDecision.missing.join(', ')}
                      </Text>
                    </View>
                  )}
                  <View style={styles.outputLog}>
                    <ScrollView
                      style={styles.outputLogScroll}
                      contentContainerStyle={styles.outputLogContent}
                      showsVerticalScrollIndicator={false}
                    >
                      {dbOutput.length > 0 ? (
                        dbOutput.map((line, index) => {
                          // Determine line styling based on content
                          const isHeader = line.startsWith('──');
                          const isStatus = line.startsWith('STATUS:');
                          const isWarning = line.includes('⚠');
                          const isClear = line.includes('✓');
                          const isReason = line.includes('REASON:');
                          const isRiskBox = line.startsWith('│') || line.startsWith('┌') || line.startsWith('└');
                          const isEmpty = line === '';

                          if (isEmpty) {
                            return <View key={`spacer-${index}`} style={styles.outputLogSpacer} />;
                          }

                          return (
                            <Text
                              key={`${line}-${index}`}
                              style={[
                                styles.outputLogLine,
                                isHeader && styles.outputLogHeader,
                                isStatus && (isWarning ? styles.outputLogWarning : styles.outputLogClear),
                                isWarning && !isStatus && styles.outputLogWarning,
                                isClear && !isStatus && styles.outputLogClear,
                                isReason && styles.outputLogReason,
                                isRiskBox && styles.outputLogRiskBox,
                              ]}
                            >
                              {line}
                            </Text>
                          );
                        })
                      ) : (
                        <Text style={styles.outputLogEmpty}>SELECT A CHECK</Text>
                      )}
                    </ScrollView>
                  </View>
                </View>

                <View style={[styles.subjectColumn, pendingDecision && styles.subjectColumnWarning]}>
                  <Text style={styles.subjectLabel}>SUBJECT</Text>
                  <View style={styles.subjectRow}>
                    <Text style={styles.subjectKey}>ID</Text>
                    <Text style={styles.subjectValue}>{currentSubject.id}</Text>
                  </View>
                  <View style={styles.subjectRow}>
                    <Text style={styles.subjectKey}>TYPE</Text>
                    <Text style={styles.subjectValue}>{currentSubject.subjectType ?? 'HUMAN'}</Text>
                  </View>
                  <View style={styles.subjectRow}>
                    <Text style={styles.subjectKey}>ORIGIN</Text>
                    <Text style={styles.subjectValue}>{currentSubject.originPlanet ?? 'MARS'}</Text>
                  </View>
                  <View style={styles.subjectRow}>
                    <Text style={styles.subjectKey}>STATUS</Text>
                    <Text
                      style={[
                        styles.subjectValue,
                        hasDecision &&
                          decisionOutcome?.type === 'APPROVE' &&
                          styles.statusDisplayCleared,
                        hasDecision &&
                          decisionOutcome?.type === 'DENY' &&
                          styles.statusDisplayRejected,
                      ]}
                    >
                      {hasDecision
                        ? decisionOutcome?.type === 'APPROVE'
                          ? 'CLEARED'
                          : 'REJECTED'
                        : 'AWAIT'}
                    </Text>
                  </View>
                  <View style={styles.flagsBlock}>
                    <Text style={styles.flagsLabel}>FLAGS</Text>
                    {flags.length > 0 ? (
                      flags.map((flag, index) => (
                        <Text key={`${flag}-${index}`} style={styles.flagsValue}>
                          ⚠ {flag}
                        </Text>
                      ))
                    ) : (
                      <Text style={styles.flagsEmpty}>NONE</Text>
                    )}
                  </View>
                </View>
              </View>
            </View>
            <NoiseOverlay opacity={0.02} />
            <ScanlineOverlay intensity={0.06} />
            <View style={styles.screenVignette} pointerEvents="none" />
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
        
        {/* Left control group - Map */}
        <View style={styles.controlGroup}>
          <LabelTape text="MODE" variant="cream" size="small" />
          <View style={styles.buttonGroup}>
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
                disabled={hasDecision}
                color={OSC_COLORS.buttonGreen}
                showLED
                ledColor="green"
                ledActive={!hasDecision}
                variant="inset"
                style={styles.allowButton}
              />
            </View>
            <View style={styles.decisionButton}>
              <MechanicalButton
                label="REJECT"
                onPress={() => handleDecision('DENY')}
                disabled={hasDecision}
                color={OSC_COLORS.buttonRed}
                showLED
                ledColor="red"
                ledActive={!hasDecision}
                variant="inset"
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

      {pendingDecision && (
        <View style={styles.warningOverlay}>
          <View style={styles.warningPanel}>
            <Text style={styles.warningTitle}>WARNING</Text>
            <Text style={styles.warningText}>
              REQUIRED CHECK INCOMPLETE: {pendingDecision.missing.join(', ')}
            </Text>
            <View style={styles.warningActions}>
              <TouchableOpacity
                onPress={() => {
                  const { type } = pendingDecision;
                  setPendingDecision(null);
                  onDecision(type);
                }}
              >
                <Text style={styles.warningActionText}>[ PROCEED ANYWAY ]</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setPendingDecision(null)}>
                <Text style={styles.warningActionText}>[ CANCEL ]</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
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
  screenLight: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
  },
  screenGlass: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.08,
    zIndex: 3,
  },
  screenContent: {
    flex: 1,
    padding: 12,
    zIndex: 4,
  },
  directiveStrip: {
    borderWidth: 1,
    borderLeftWidth: 3,
    borderColor: 'rgba(226, 106, 106, 0.6)',
    borderLeftColor: 'rgba(226, 106, 106, 0.95)',
    backgroundColor: 'rgba(70, 10, 12, 0.78)',
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginBottom: 8,
  },
  directiveStripWarning: {
    borderColor: 'rgba(255, 110, 80, 0.85)',
    borderLeftColor: 'rgba(255, 110, 80, 1)',
    backgroundColor: 'rgba(90, 16, 12, 0.82)',
  },
  directiveStripLabel: {
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    color: OSC_COLORS.sectionDirective,
    letterSpacing: 1.5,
    opacity: 0.95,
    marginBottom: 4,
  },
  directiveStripText: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  directiveStripLine: {
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
    fontWeight: '700',
    color: OSC_COLORS.textLight,
    letterSpacing: 0.9,
    marginRight: 8,
  },
  directiveStripMeta: {
    marginTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 6,
  },
  directiveStripMetaText: {
    fontFamily: Theme.fonts.mono,
    fontSize: 9,
    color: OSC_COLORS.textLight,
    letterSpacing: 0.6,
    opacity: 0.9,
  },
  workSurface: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    minHeight: 0,
  },
  outputColumn: {
    flex: 1.15,
    borderWidth: 1,
    borderLeftWidth: 3,
    borderColor: 'rgba(111, 209, 255, 0.35)',
    borderLeftColor: 'rgba(111, 209, 255, 0.95)',
    backgroundColor: 'rgba(6, 18, 26, 0.6)',
    padding: 10,
    minHeight: 0,
  },
  outputColumnWarning: {
    borderColor: 'rgba(255, 110, 80, 0.6)',
    borderLeftColor: 'rgba(255, 110, 80, 0.95)',
  },
  outputHeader: {
    marginBottom: 8,
    gap: 4,
  },
  outputLabel: {
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    color: OSC_COLORS.sectionChecks,
    letterSpacing: 1.4,
  },
  outputMeta: {
    fontFamily: Theme.fonts.mono,
    fontSize: 9,
    color: OSC_COLORS.textLight,
    letterSpacing: 0.6,
    opacity: 0.8,
  },
  outputControls: {
    gap: 8,
    marginBottom: 10,
  },
  outputButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(111, 209, 255, 0.4)',
    backgroundColor: 'rgba(0, 14, 22, 0.7)',
    borderRadius: 4,
    minHeight: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  outputButtonRequired: {
    borderWidth: 2,
    borderColor: 'rgba(111, 209, 255, 0.8)',
    backgroundColor: 'rgba(10, 30, 45, 0.85)',
  },
  outputButtonOptional: {
    borderColor: 'rgba(100, 100, 100, 0.4)',
    backgroundColor: 'rgba(20, 20, 25, 0.5)',
  },
  outputButtonCompleted: {
    borderColor: 'rgba(0, 255, 136, 0.5)',
  },
  outputButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  outputButtonText: {
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
    color: OSC_COLORS.textLight,
    letterSpacing: 1,
  },
  outputButtonTextRequired: {
    color: OSC_COLORS.sectionChecks,
    fontWeight: '700',
  },
  outputButtonTag: {
    fontFamily: Theme.fonts.mono,
    fontSize: 8,
    letterSpacing: 0.5,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 2,
  },
  outputButtonTagRequired: {
    backgroundColor: 'rgba(111, 209, 255, 0.25)',
    color: OSC_COLORS.sectionChecks,
  },
  outputButtonTagOptional: {
    backgroundColor: 'rgba(100, 100, 100, 0.3)',
    color: 'rgba(180, 180, 180, 0.8)',
  },
  outputButtonDone: {
    fontFamily: Theme.fonts.mono,
    fontSize: 14,
    color: '#00ff88',
  },
  outputMissing: {
    borderWidth: 1,
    borderColor: 'rgba(255, 110, 80, 0.6)',
    backgroundColor: 'rgba(60, 20, 12, 0.6)',
    paddingVertical: 4,
    paddingHorizontal: 6,
    marginBottom: 8,
  },
  outputMissingText: {
    fontFamily: Theme.fonts.mono,
    fontSize: 9,
    color: '#ffb38a',
    letterSpacing: 0.6,
  },
  outputLog: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(111, 209, 255, 0.22)',
    backgroundColor: 'rgba(0, 12, 18, 0.5)',
    padding: 8,
    minHeight: 0,
  },
  outputLogScroll: {
    flex: 1,
  },
  outputLogContent: {
    paddingBottom: 6,
  },
  outputLogLine: {
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    color: OSC_COLORS.textLight,
    letterSpacing: 0.5,
    marginBottom: 1,
    lineHeight: 14,
  },
  outputLogSpacer: {
    height: 6,
  },
  outputLogHeader: {
    color: OSC_COLORS.sectionChecks,
    opacity: 0.9,
    marginBottom: 2,
  },
  outputLogWarning: {
    color: '#ffb38a',
    fontWeight: '600',
  },
  outputLogClear: {
    color: '#00ff88',
  },
  outputLogReason: {
    color: '#ff9966',
    opacity: 0.9,
    marginLeft: 4,
  },
  outputLogRiskBox: {
    color: '#ffcc66',
    opacity: 0.95,
    textAlign: 'center',
  },
  outputLogEmpty: {
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    color: OSC_COLORS.textLight,
    letterSpacing: 0.6,
    opacity: 0.5,
  },
  subjectColumn: {
    flex: 0.85,
    borderWidth: 1,
    borderLeftWidth: 3,
    borderColor: 'rgba(255, 212, 138, 0.35)',
    borderLeftColor: 'rgba(255, 212, 138, 0.9)',
    backgroundColor: 'rgba(24, 18, 8, 0.55)',
    padding: 10,
    minHeight: 0,
  },
  subjectColumnWarning: {
    borderColor: 'rgba(255, 110, 80, 0.6)',
    borderLeftColor: 'rgba(255, 110, 80, 0.95)',
  },
  subjectLabel: {
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    color: OSC_COLORS.sectionSubject,
    letterSpacing: 1.4,
    marginBottom: 8,
  },
  subjectRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  subjectKey: {
    fontFamily: Theme.fonts.mono,
    fontSize: 9,
    color: OSC_COLORS.textLight,
    letterSpacing: 0.6,
    opacity: 0.7,
  },
  subjectValue: {
    fontFamily: Theme.fonts.mono,
    fontSize: 11,
    color: OSC_COLORS.textLight,
    letterSpacing: 0.6,
  },
  flagsBlock: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 212, 138, 0.25)',
  },
  flagsLabel: {
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    color: OSC_COLORS.sectionSubject,
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  flagsValue: {
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    color: '#ffb38a',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  flagsEmpty: {
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    color: OSC_COLORS.textLight,
    letterSpacing: 0.5,
    opacity: 0.6,
  },
  phosphorGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 255, 170, 0.03)',
    zIndex: 1,
  },
  statusDisplay: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  directiveScreen: {
    flex: 1,
    gap: 12,
  },
  systemMessageWrap: {
    flex: 1,
    justifyContent: 'center',
  },
  directivesBlock: {
    marginBottom: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderLeftWidth: 3,
    borderLeftColor: 'rgba(212, 83, 74, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(212, 83, 74, 0.2)',
    backgroundColor: 'rgba(212, 83, 74, 0.06)',
  },
  directivesLabel: {
    fontFamily: Theme.fonts.mono,
    fontSize: 9,
    color: OSC_COLORS.screenGlow,
    letterSpacing: 1.5,
    opacity: 0.8,
    marginBottom: 6,
  },
  directivesText: {
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
    fontWeight: 'bold',
    color: OSC_COLORS.textLight,
    letterSpacing: 1,
  },
  dossierBlock: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 170, 0.2)',
    backgroundColor: 'rgba(0, 26, 20, 0.4)',
  },
  databaseBlock: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 170, 0.15)',
    backgroundColor: 'rgba(0, 26, 20, 0.35)',
    minHeight: 0,
  },
  systemMessageBlock: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 170, 0.15)',
    backgroundColor: 'rgba(0, 10, 8, 0.45)',
  },
  systemMessageLabel: {
    fontFamily: Theme.fonts.mono,
    fontSize: 9,
    color: OSC_COLORS.screenGlow,
    letterSpacing: 1.5,
    opacity: 0.8,
    marginBottom: 6,
  },
  systemMessageText: {
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    color: OSC_COLORS.textLight,
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  dossierLabel: {
    fontFamily: Theme.fonts.mono,
    fontSize: 9,
    color: OSC_COLORS.screenGlow,
    letterSpacing: 1.5,
    opacity: 0.8,
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 255, 170, 0.15)',
  },
  dossierRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  dossierKey: {
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    color: OSC_COLORS.screenGlow,
    letterSpacing: 1,
    opacity: 0.7,
  },
  dossierValue: {
    fontFamily: Theme.fonts.mono,
    fontSize: 11,
    fontWeight: '600',
    color: OSC_COLORS.textLight,
    letterSpacing: 1,
  },
  databaseLabel: {
    fontFamily: Theme.fonts.mono,
    fontSize: 9,
    color: OSC_COLORS.screenGlow,
    letterSpacing: 1.5,
    opacity: 0.8,
    marginBottom: 4,
  },
  databaseSubject: {
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    color: OSC_COLORS.screenGlow,
    letterSpacing: 1,
    marginBottom: 8,
  },
  databaseMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  databaseMetaKey: {
    fontFamily: Theme.fonts.mono,
    fontSize: 9,
    color: OSC_COLORS.screenGlow,
    opacity: 0.7,
    letterSpacing: 1,
  },
  databaseMetaValue: {
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    color: OSC_COLORS.textLight,
    letterSpacing: 1,
  },
  databaseMessageLabel: {
    fontFamily: Theme.fonts.mono,
    fontSize: 9,
    color: OSC_COLORS.screenGlow,
    opacity: 0.7,
    letterSpacing: 1,
    marginTop: 6,
    marginBottom: 4,
  },
  databaseMessage: {
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    color: OSC_COLORS.textLight,
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  screenFooter: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 255, 170, 0.15)',
  },
  screenButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  screenButton: {
    flex: 1,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 170, 0.2)',
    backgroundColor: 'rgba(5, 20, 16, 0.6)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
    minHeight: 44,
    justifyContent: 'center',
  },
  screenButtonActive: {
    borderColor: 'rgba(0, 255, 170, 0.45)',
    backgroundColor: 'rgba(10, 40, 30, 0.9)',
  },
  screenButtonInner: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.5)',
  },
  screenButtonText: {
    fontFamily: Theme.fonts.mono,
    fontSize: 9,
    color: OSC_COLORS.textLight,
    letterSpacing: 1,
    textAlign: 'center',
    opacity: 0.7,
  },
  screenButtonTextActive: {
    opacity: 1,
    color: OSC_COLORS.screenGlow,
  },
  statusDisplayCleared: {
    color: OSC_COLORS.ledGreen,
  },
  statusDisplayRejected: {
    color: OSC_COLORS.ledRed,
  },
  databaseQueryGroup: {
    gap: 8,
    marginTop: 8,
    marginBottom: 10,
  },
  databaseQueryButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 170, 0.25)',
    backgroundColor: 'rgba(0, 20, 16, 0.5)',
  },
  databaseQueryText: {
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    color: OSC_COLORS.textLight,
    letterSpacing: 1,
  },
  databaseOutput: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 170, 0.25)',
    padding: 10,
    backgroundColor: 'rgba(0, 10, 8, 0.5)',
    minHeight: 80,
  },
  databaseOutputLabel: {
    fontFamily: Theme.fonts.mono,
    fontSize: 9,
    color: OSC_COLORS.screenGlow,
    letterSpacing: 1,
    marginBottom: 6,
  },
  databaseOutputScroll: {
    flex: 1,
  },
  databaseOutputContent: {
    paddingBottom: 6,
  },
  databaseOutputLine: {
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    color: OSC_COLORS.textLight,
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  databaseOutputEmpty: {
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    color: OSC_COLORS.textLight,
    opacity: 0.6,
    letterSpacing: 1,
  },
  warningOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 200,
    padding: 20,
  },
  warningPanel: {
    width: '100%',
    maxWidth: 360,
    borderWidth: 1,
    borderColor: OSC_COLORS.ledYellow,
    backgroundColor: '#0a1218',
    padding: 16,
  },
  warningTitle: {
    fontFamily: Theme.fonts.mono,
    fontSize: 14,
    color: OSC_COLORS.ledYellow,
    letterSpacing: 2,
    marginBottom: 8,
  },
  warningText: {
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    color: OSC_COLORS.textLight,
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  warningActions: {
    gap: 8,
  },
  warningActionText: {
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    color: OSC_COLORS.textLight,
    letterSpacing: 1,
  },
  screenVignette: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 6,
    borderWidth: 30,
    borderColor: 'rgba(0,0,0,0.2)',
    zIndex: 100,
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

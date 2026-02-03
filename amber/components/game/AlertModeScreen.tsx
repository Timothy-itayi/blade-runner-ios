// =============================================================================
// ALERT MODE SCREEN - Crisis Management & Negotiation UI
// =============================================================================
// Dedicated screen for handling AMBER alerts with player dialogue choices.
// Accessed via the AMBER button in the MODE section.

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Animated,
} from 'react-native';
import { Theme } from '../../constants/theme';
import { AlertLogEntry, useGameStore } from '../../store/gameStore';
import { MechanicalButton } from '../../components/ui/MechanicalUI';
import { LabelTape, LEDIndicator } from '../ui/LabelTape';
import { ProceduralPortrait } from '../ui/ProceduralPortrait';

type NegotiationMethod = 'INTIMIDATE' | 'PERSUADE' | 'REASON';
type AlertPhase = 'OVERVIEW' | 'NEGOTIATION' | 'RESOLUTION';

// Player dialogue options for each negotiation method
const PLAYER_DIALOGUE: Record<NegotiationMethod, string[]> = {
  INTIMIDATE: [
    'Stand down. Now.',
    'This ends here. Your choice how.',
    'I have authorization to neutralize. Don\'t test me.',
  ],
  PERSUADE: [
    'Help me understand what happened.',
    'There\'s still a way out of this. Let me help.',
    'Think about who\'s waiting for you.',
  ],
  REASON: [
    'The math doesn\'t favor you here.',
    'Consider the consequences. They\'re permanent.',
    'What outcome are you actually hoping for?',
  ],
};

const METHOD_STYLES: Record<NegotiationMethod, { color: string; background: string; border: string }> = {
  INTIMIDATE: {
    color: Theme.colors.accentDeny,
    background: 'rgba(212, 83, 74, 0.16)',
    border: 'rgba(212, 83, 74, 0.35)',
  },
  PERSUADE: {
    color: Theme.colors.accentApprove,
    background: 'rgba(74, 138, 90, 0.16)',
    border: 'rgba(74, 138, 90, 0.35)',
  },
  REASON: {
    color: Theme.colors.accentWarn,
    background: 'rgba(201, 162, 39, 0.16)',
    border: 'rgba(201, 162, 39, 0.35)',
  },
};

const OUTCOME_COLORS: Record<string, string> = {
  NEGOTIATED_SUCCESS: Theme.colors.accentApprove,
  NEGOTIATED_FAIL: Theme.colors.accentDeny,
  DETONATED: Theme.colors.accentDeny,
  INTERCEPTED: Theme.colors.accentWarn,
  IGNORED: Theme.colors.textDim,
};

interface AlertModeScreenProps {
  visible: boolean;
  onClose: () => void;
  onAlertResolved?: (subjectId: string, outcome: string) => void;
}

export function AlertModeScreen({
  visible,
  onClose,
  onAlertResolved,
}: AlertModeScreenProps) {
  const alertLog = useGameStore((state) => state.alertLog);
  const resolveAlert = useGameStore((state) => state.resolveAlert);
  const addPropaganda = useGameStore((state) => state.addPropaganda);

  const [selectedAlert, setSelectedAlert] = useState<AlertLogEntry | null>(null);
  const [phase, setPhase] = useState<AlertPhase>('OVERVIEW');
  const [selectedMethod, setSelectedMethod] = useState<NegotiationMethod | null>(null);
  const [selectedDialogue, setSelectedDialogue] = useState<number | null>(null);
  const [resolutionText, setResolutionText] = useState<string>('');
  const [resolutionOutcome, setResolutionOutcome] = useState<string | null>(null);
  const [pulseAnim] = useState(new Animated.Value(0));

  const pendingAlerts = alertLog.filter((a) => a.outcome === 'PENDING');
  const hasAlerts = pendingAlerts.length > 0;

  useEffect(() => {
    if (visible && hasAlerts) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
    return () => pulseAnim.setValue(0);
  }, [visible, hasAlerts]);

  // Auto-select first pending alert when opening the console.
  useEffect(() => {
    if (!visible) return;
    if (selectedAlert) return;
    if (!pendingAlerts.length) return;
    setSelectedAlert(pendingAlerts[0]);
    setPhase('OVERVIEW');
  }, [visible, pendingAlerts, selectedAlert]);

  const handleSelectAlert = (alert: AlertLogEntry) => {
    setSelectedAlert(alert);
    setPhase('OVERVIEW');
    setSelectedMethod(null);
    setSelectedDialogue(null);
    setResolutionOutcome(null);
  };

  const handleNegotiate = () => {
    setPhase('NEGOTIATION');
  };

  const handleSelectMethod = (method: NegotiationMethod) => {
    setSelectedMethod(method);
    setSelectedDialogue(null);
  };

  const handleSelectDialogue = (index: number) => {
    setSelectedDialogue(index);
  };

  const handleExecuteNegotiation = () => {
    if (!selectedAlert || !selectedMethod) return;

    const isSuccess = selectedMethod === selectedAlert.scenario.preferredNegotiation;
    const outcome = isSuccess ? 'NEGOTIATED_SUCCESS' : 'NEGOTIATED_FAIL';
    const outcomeText = isSuccess
      ? selectedAlert.scenario.outcomes.negotiateSuccess
      : selectedAlert.scenario.outcomes.negotiateFail;

    resolveAlert(selectedAlert.subjectId, {
      outcome,
      negotiationMethod: selectedMethod,
      resolvedAt: Date.now(),
    });

    // Add propaganda entry
    addPropaganda({
      id: `PROP-${selectedAlert.subjectId}-${Date.now()}`,
      subjectId: selectedAlert.subjectId,
      headline: selectedAlert.scenario.propaganda.headline,
      body: selectedAlert.scenario.propaganda.body,
      timestamp: Date.now(),
      outcome,
    });

    setResolutionText(outcomeText);
    setResolutionOutcome(outcome);
    setPhase('RESOLUTION');
    onAlertResolved?.(selectedAlert.subjectId, outcome);
  };

  const handleDetonate = () => {
    if (!selectedAlert) return;

    resolveAlert(selectedAlert.subjectId, {
      outcome: 'DETONATED',
      detonateUsed: true,
      resolvedAt: Date.now(),
      collateralCount: 1,
    });

    addPropaganda({
      id: `PROP-${selectedAlert.subjectId}-${Date.now()}`,
      subjectId: selectedAlert.subjectId,
      headline: selectedAlert.scenario.propaganda.headline,
      body: selectedAlert.scenario.propaganda.body,
      timestamp: Date.now(),
      outcome: 'DETONATED',
    });

    setResolutionText(selectedAlert.scenario.outcomes.detonate);
    setResolutionOutcome('DETONATED');
    setPhase('RESOLUTION');
    onAlertResolved?.(selectedAlert.subjectId, 'DETONATED');
  };

  const handleIntercept = () => {
    if (!selectedAlert) return;

    resolveAlert(selectedAlert.subjectId, {
      outcome: 'INTERCEPTED',
      interceptUsed: true,
      resolvedAt: Date.now(),
    });

    addPropaganda({
      id: `PROP-${selectedAlert.subjectId}-${Date.now()}`,
      subjectId: selectedAlert.subjectId,
      headline: selectedAlert.scenario.propaganda.headline,
      body: selectedAlert.scenario.propaganda.body,
      timestamp: Date.now(),
      outcome: 'INTERCEPTED',
    });

    setResolutionText(selectedAlert.scenario.outcomes.intercept);
    setResolutionOutcome('INTERCEPTED');
    setPhase('RESOLUTION');
    onAlertResolved?.(selectedAlert.subjectId, 'INTERCEPTED');
  };

  const handleIgnore = () => {
    if (!selectedAlert) return;

    resolveAlert(selectedAlert.subjectId, {
      outcome: 'IGNORED',
      resolvedAt: Date.now(),
    });

    setResolutionText(selectedAlert.scenario.outcomes.ignore);
    setResolutionOutcome('IGNORED');
    setPhase('RESOLUTION');
    onAlertResolved?.(selectedAlert.subjectId, 'IGNORED');
  };

  const handleClearResolution = () => {
    setSelectedAlert(null);
    setPhase('OVERVIEW');
    setSelectedMethod(null);
    setSelectedDialogue(null);
    setResolutionText('');
    setResolutionOutcome(null);
  };

  if (!visible) return null;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.amberLogo}>◆ AMBER</Text>
          <Text style={styles.headerTitle}>CRISIS MANAGEMENT</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.headerStatus}>
            <LEDIndicator active={hasAlerts} color={hasAlerts ? 'red' : 'green'} size={6} />
            <Text
              style={[
                styles.headerStatusText,
                hasAlerts ? styles.statusCritical : styles.statusClear,
              ]}
            >
              {hasAlerts ? `${pendingAlerts.length} ACTIVE` : 'ALL CLEAR'}
            </Text>
          </View>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>[ RETURN ]</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.content}>
        {/* Main Panel (Alert Dossier) */}
        <View style={styles.mainPanel}>
          <View style={styles.mainHeader}>
            <LabelTape
              text={selectedAlert ? 'ALERT DOSSIER' : 'ALERT CONSOLE'}
              variant={selectedAlert ? 'cream' : 'black'}
              size="small"
            />
            <Text
              style={[
                styles.mainHeaderStatus,
                !selectedAlert
                  ? styles.statusIdle
                  : phase === 'RESOLUTION'
                    ? styles.statusClear
                    : styles.statusCritical,
              ]}
            >
              STATUS: {!selectedAlert ? 'IDLE' : phase === 'RESOLUTION' ? 'RESOLVED' : 'ACTIVE'}
            </Text>
          </View>
          {!selectedAlert ? (
            <View style={styles.selectPrompt}>
              <Text style={styles.selectPromptText}>
                {hasAlerts ? 'SELECT AN ALERT TO MANAGE' : 'NO ALERTS PENDING'}
              </Text>
            </View>
          ) : phase === 'OVERVIEW' ? (
            // Overview Phase
            <View style={styles.overviewPanel}>
              <View style={styles.overviewHeader}>
                <View style={styles.portraitContainer}>
                  <ProceduralPortrait
                    subjectId={selectedAlert.subjectId}
                    portraitPreset="dossier"
                    style={styles.portrait}
                  />
                </View>
                <View style={styles.overviewInfo}>
                  <Text style={styles.overviewTitle}>{selectedAlert.scenario.title}</Text>
                  <Text style={styles.overviewLocation}>📍 {selectedAlert.scenario.location}</Text>
                  <Text style={styles.overviewSubject}>SUBJECT: {selectedAlert.subjectName}</Text>
                </View>
              </View>

              <View style={styles.summaryBox}>
                <Text style={styles.summaryLabel}>SITUATION REPORT</Text>
                <Text style={styles.summaryText}>{selectedAlert.scenario.summary}</Text>
                {selectedAlert.scenario.collateralContext && (
                  <Text style={styles.collateralText}>
                    ⚠ {selectedAlert.scenario.collateralContext}
                  </Text>
                )}
              </View>

              <Text style={styles.sectionLabel}>RESPONSE OPTIONS</Text>
              <View style={styles.actionRow}>
                <MechanicalButton
                  label="NEGOTIATE"
                  onPress={handleNegotiate}
                  color={Theme.colors.accentApprove}
                  style={styles.actionButton}
                />
                <MechanicalButton
                  label="INTERCEPT"
                  onPress={handleIntercept}
                  color={Theme.colors.accentWarn}
                  style={styles.actionButton}
                />
                <MechanicalButton
                  label="DETONATE"
                  onPress={handleDetonate}
                  color={Theme.colors.accentDeny}
                  style={styles.actionButton}
                />
              </View>
            </View>
          ) : phase === 'NEGOTIATION' ? (
            // Negotiation Phase
            <View style={styles.negotiationPanel}>
              <Text style={styles.negotiationTitle}>SELECT APPROACH</Text>

              <View style={styles.methodRow}>
                {(['INTIMIDATE', 'PERSUADE', 'REASON'] as NegotiationMethod[]).map((method) => {
                  const methodStyle = METHOD_STYLES[method];
                  return (
                    <Pressable
                      key={method}
                      style={[
                        styles.methodButton,
                        { borderColor: methodStyle.border },
                        selectedMethod === method && [
                          styles.methodButtonSelected,
                          { borderColor: methodStyle.color, backgroundColor: methodStyle.background },
                        ],
                      ]}
                      onPress={() => handleSelectMethod(method)}
                    >
                      <Text
                        style={[
                          styles.methodText,
                          { color: methodStyle.color },
                          selectedMethod === method && styles.methodTextSelected,
                        ]}
                      >
                        {method}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {selectedMethod && (
                <>
                  <Text style={styles.dialogueLabel}>CHOOSE YOUR WORDS</Text>
                  <View style={styles.dialogueOptions}>
                    {PLAYER_DIALOGUE[selectedMethod].map((line, idx) => (
                      <Pressable
                        key={idx}
                        style={[
                          styles.dialogueOption,
                          selectedDialogue === idx && styles.dialogueOptionSelected,
                        ]}
                        onPress={() => handleSelectDialogue(idx)}
                      >
                        <Text style={styles.dialogueNumber}>{idx + 1}.</Text>
                        <Text style={styles.dialogueText}>{line}</Text>
                      </Pressable>
                    ))}
                  </View>

                  {selectedDialogue !== null && (
                    <View style={styles.responseBox}>
                      <Text style={styles.responseLabel}>SUBJECT RESPONSE:</Text>
                      <Text style={styles.responseText}>
                        "{selectedAlert?.scenario.negotiation[selectedMethod.toLowerCase() as keyof typeof selectedAlert.scenario.negotiation]}"
                      </Text>
                    </View>
                  )}
                </>
              )}

              <View style={styles.negotiationActions}>
                <Pressable
                  onPress={() => setPhase('OVERVIEW')}
                  style={styles.backButton}
                >
                  <Text style={styles.backText}>[ BACK ]</Text>
                </Pressable>
                {selectedDialogue !== null && (
                  <MechanicalButton
                    label="EXECUTE"
                    onPress={handleExecuteNegotiation}
                    color={Theme.colors.accentApprove}
                    style={styles.executeButton}
                  />
                )}
              </View>
            </View>
          ) : (
            // Resolution Phase
            <View style={styles.resolutionPanel}>
              <Text style={styles.resolutionTitle}>SITUATION RESOLVED</Text>
              {resolutionOutcome && (
                <Text
                  style={[
                    styles.resolutionOutcome,
                    { color: OUTCOME_COLORS[resolutionOutcome] || Theme.colors.textSecondary },
                  ]}
                >
                  STATUS: {resolutionOutcome.replace(/_/g, ' ')}
                </Text>
              )}
              <View style={styles.resolutionBox}>
                <Text style={styles.resolutionText}>{resolutionText}</Text>
              </View>
              <MechanicalButton
                label="ACKNOWLEDGE"
                onPress={handleClearResolution}
                color={Theme.colors.textSecondary}
                style={styles.acknowledgeButton}
              />
            </View>
          )}
        </View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Theme.colors.bgDark,
    zIndex: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 2,
    borderBottomColor: Theme.colors.accentDeny,
    backgroundColor: Theme.colors.bgPanel,
    ...Theme.effects.bezel,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerStatusText: {
    fontFamily: Theme.fonts.mono,
    fontSize: 9,
    letterSpacing: 1,
  },
  amberLogo: {
    fontFamily: Theme.fonts.mono,
    fontSize: 18,
    fontWeight: '700',
    color: Theme.colors.accentDeny,
    letterSpacing: 2,
  },
  headerTitle: {
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
    color: Theme.colors.textSecondary,
    letterSpacing: 1,
  },
  closeButton: {
    padding: 8,
  },
  closeText: {
    fontFamily: Theme.fonts.mono,
    fontSize: 11,
    color: Theme.colors.textDim,
    letterSpacing: 1,
  },
  content: {
    flex: 1,
    flexDirection: 'column',
    padding: 12,
    gap: 12,
  },
  sidebar: {
    width: '100%',
 height: '20%',
    padding: 10,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    backgroundColor: Theme.colors.bgPanel,
    ...Theme.effects.bezel,
  },
  sidebarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
    paddingBottom: 8,
    marginBottom: 8,
  },
  sidebarStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sidebarStatusText: {
    fontFamily: Theme.fonts.mono,
    fontSize: 8,
    letterSpacing: 1,
  },
  alertList: {
    flex: 1,
    paddingVertical: 4,
  },
  noAlerts: {
    padding: 12,
    alignItems: 'center',
  },
  noAlertsText: {
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    color: Theme.colors.textDim,
    letterSpacing: 1,
  },
  noAlertsSubtext: {
    fontFamily: Theme.fonts.mono,
    fontSize: 8,
    color: Theme.colors.textDim,
    opacity: 0.6,
    marginTop: 4,
  },
  alertItem: {
    padding: 10,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderLeftWidth: 3,
    borderLeftColor: Theme.colors.accentDeny,
    backgroundColor: 'rgba(20, 24, 30, 0.9)',
    position: 'relative',
    overflow: 'hidden',
  },
  alertItemSelected: {
    backgroundColor: 'rgba(212, 83, 74, 0.22)',
    borderColor: Theme.colors.accentDeny,
    borderLeftColor: Theme.colors.accentDeny,
    borderWidth: 2,
  },
  alertPulse: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Theme.colors.accentDeny,
  },
  alertItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 6,
  },
  alertItemTitle: {
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    color: Theme.colors.textPrimary,
    letterSpacing: 0.5,
  },
  alertItemStatus: {
    fontFamily: Theme.fonts.mono,
    fontSize: 8,
    color: Theme.colors.accentDeny,
    letterSpacing: 1,
  },
  alertItemSubject: {
    fontFamily: Theme.fonts.mono,
    fontSize: 8,
    color: Theme.colors.textDim,
    marginTop: 2,
  },
  alertItemLocation: {
    fontFamily: Theme.fonts.mono,
    fontSize: 8,
    color: Theme.colors.accentWarn,
    marginTop: 2,
  },
  mainPanel: {
    flex: 1,
    padding: 14,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    backgroundColor: Theme.colors.bgPanel,
    ...Theme.effects.bezel,
  },
  mainHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
    paddingBottom: 8,
    marginBottom: 12,
  },
  mainHeaderStatus: {
    fontFamily: Theme.fonts.mono,
    fontSize: 9,
    letterSpacing: 1,
  },
  selectPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectPromptText: {
    fontFamily: Theme.fonts.mono,
    fontSize: 14,
    color: Theme.colors.textDim,
    letterSpacing: 2,
  },
  overviewPanel: {
    flex: 1,
  },
  overviewHeader: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  portraitContainer: {
    width: 80,
    height: 100,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    overflow: 'hidden',
  },
  portrait: {
    width: '100%',
    height: '100%',
  },
  overviewInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  overviewTitle: {
    fontFamily: Theme.fonts.mono,
    fontSize: 14,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
    letterSpacing: 1,
  },
  overviewLocation: {
    fontFamily: Theme.fonts.mono,
    fontSize: 11,
    color: Theme.colors.accentWarn,
    marginTop: 4,
  },
  overviewSubject: {
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    color: Theme.colors.textSecondary,
    marginTop: 4,
  },
  summaryBox: {
    padding: 12,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderLeftColor: Theme.colors.accentWarn,
    borderLeftWidth: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    marginBottom: 12,
  },
  summaryLabel: {
    fontFamily: Theme.fonts.mono,
    fontSize: 9,
    color: Theme.colors.textDim,
    letterSpacing: 1,
    marginBottom: 6,
  },
  summaryText: {
    fontFamily: Theme.fonts.mono,
    fontSize: 11,
    color: Theme.colors.textPrimary,
    lineHeight: 18,
  },
  collateralText: {
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    color: Theme.colors.accentWarn,
    marginTop: 8,
  },
  sectionLabel: {
    fontFamily: Theme.fonts.mono,
    fontSize: 9,
    color: Theme.colors.textDim,
    letterSpacing: 1,
    marginBottom: 8,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 0,
  },
  actionButton: {
    flex: 1,
    height: 44,
  },
  negotiationPanel: {
    flex: 1,
  },
  negotiationTitle: {
    fontFamily: Theme.fonts.mono,
    fontSize: 14,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
    letterSpacing: 2,
    marginBottom: 16,
  },
  methodRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  methodButton: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    alignItems: 'center',
    borderRadius: 2,
  },
  methodButtonSelected: {
    borderWidth: 2,
  },
  methodText: {
    fontFamily: Theme.fonts.mono,
    fontSize: 11,
    letterSpacing: 1,
  },
  methodTextSelected: {
    fontWeight: '700',
  },
  dialogueLabel: {
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    color: Theme.colors.textDim,
    letterSpacing: 1,
    marginBottom: 10,
  },
  dialogueOptions: {
    gap: 8,
    marginBottom: 16,
  },
  dialogueOption: {
    flexDirection: 'row',
    padding: 10,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    backgroundColor: 'rgba(0, 0, 0, 0.18)',
    gap: 8,
  },
  dialogueOptionSelected: {
    borderColor: Theme.colors.accentApprove,
    backgroundColor: 'rgba(74, 138, 90, 0.1)',
  },
  dialogueNumber: {
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    color: Theme.colors.textDim,
  },
  dialogueText: {
    flex: 1,
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    color: Theme.colors.textPrimary,
    lineHeight: 16,
  },
  responseBox: {
    padding: 12,
    borderWidth: 1,
    borderColor: Theme.colors.accentWarn,
    backgroundColor: 'rgba(201, 162, 39, 0.1)',
    marginBottom: 16,
  },
  responseLabel: {
    fontFamily: Theme.fonts.mono,
    fontSize: 9,
    color: Theme.colors.accentWarn,
    letterSpacing: 1,
    marginBottom: 6,
  },
  responseText: {
    fontFamily: Theme.fonts.mono,
    fontSize: 11,
    color: Theme.colors.textPrimary,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  negotiationActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
  },
  backText: {
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    color: Theme.colors.textDim,
    letterSpacing: 1,
  },
  executeButton: {
    minWidth: 120,
    height: 44,
  },
  resolutionPanel: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resolutionTitle: {
    fontFamily: Theme.fonts.mono,
    fontSize: 16,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
    letterSpacing: 2,
    marginBottom: 12,
  },
  resolutionOutcome: {
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    letterSpacing: 1.5,
    marginBottom: 16,
  },
  resolutionBox: {
    padding: 20,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    maxWidth: 300,
    marginBottom: 20,
  },
  resolutionText: {
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
    color: Theme.colors.textPrimary,
    textAlign: 'center',
    lineHeight: 20,
  },
  acknowledgeButton: {
    minWidth: 140,
    height: 44,
  },
  statusCritical: {
    color: Theme.colors.accentDeny,
  },
  statusClear: {
    color: Theme.colors.accentApprove,
  },
  statusIdle: {
    color: Theme.colors.textDim,
  },
});

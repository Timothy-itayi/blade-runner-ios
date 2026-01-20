import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { Theme } from '../../constants/theme';
import { HUDBox } from '../ui/HUDBox';
import { TypewriterText } from '../ui/ScanData';
import { BUILD_SEQUENCE } from '../../constants/animations';
import { ProbeType, ProbeResponse, PROBE_TYPES, PROBE_ORDER } from '../../constants/probes';

// Terminal-style line-by-line display component with typewriter effect
const TerminalLineDisplay = ({ text, active, style }: { text: string, active: boolean, style?: any }) => {
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [lines, setLines] = useState<string[]>([]);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const cursorOpacity = useRef(new Animated.Value(1)).current;

  // Split text by periods (sentences)
  useEffect(() => {
    if (!active) {
      setLines([]);
      setDisplayedText('');
      setCurrentLineIndex(0);
      setIsTyping(false);
      return;
    }

    // Split by periods, ensuring each sentence ends with a period
    const sentences = text.split(/\.\s*/).filter(s => s.trim().length > 0);
    const processedLines: string[] = [];
    
    sentences.forEach((sentence) => {
      const trimmed = sentence.trim();
      if (trimmed.length > 0) {
        // Add period to each sentence
        processedLines.push(trimmed + '.');
      }
    });

    // If no periods found, use the whole text
    const finalLines = processedLines.length > 0 ? processedLines : [text];
    setLines(finalLines);
    setCurrentLineIndex(0);
    setDisplayedText('');
    setIsTyping(false);
  }, [text, active]);

  // Typewriter effect for current line
  useEffect(() => {
    if (!active || lines.length === 0) {
      setDisplayedText('');
      setIsTyping(false);
      return;
    }

    const currentLine = lines[currentLineIndex];
    if (!currentLine) {
      setDisplayedText('');
      setIsTyping(false);
      return;
    }

    // Reset displayed text when line changes
    setDisplayedText('');
    setIsTyping(true);

    let charIndex = 0;
    const typeInterval = setInterval(() => {
      if (charIndex < currentLine.length) {
        setDisplayedText(currentLine.slice(0, charIndex + 1));
        charIndex++;
      } else {
        setIsTyping(false);
        clearInterval(typeInterval);
        
        // Move to next line after a delay
        if (currentLineIndex < lines.length - 1) {
          setTimeout(() => {
            setCurrentLineIndex(prev => prev + 1);
          }, 1500); // 1.5 second pause between lines
        }
      }
    }, 30); // 30ms per character

    return () => clearInterval(typeInterval);
  }, [active, lines, currentLineIndex]);

  // Animate cursor blink only when typing
  useEffect(() => {
    if (!active || !isTyping) {
      cursorOpacity.setValue(1);
      return;
    }

    const blink = Animated.loop(
      Animated.sequence([
        Animated.timing(cursorOpacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(cursorOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    );
    blink.start();
    return () => blink.stop();
  }, [active, isTyping, cursorOpacity]);

  return (
    <View style={styles.tickerContainer}>
      <View style={styles.terminalLineContainer}>
        <Text style={style} numberOfLines={1}>
          {displayedText}
        </Text>
        {active && isTyping && (
          <Animated.View style={[styles.terminalCursor, { opacity: cursorOpacity }]}>
            <Text style={style}>_</Text>
          </Animated.View>
        )}
      </View>
      {lines.length > 1 && (
        <Text style={styles.lineIndicator}>
          [{currentLineIndex + 1}/{lines.length}]
        </Text>
      )}
    </View>
  );
};

interface InterrogationPanelProps {
  hudStage: 'none' | 'wireframe' | 'outline' | 'full';
  completedProbes: Set<ProbeType>;
  currentResponse: ProbeResponse | null;
  requiredProbes?: ProbeType[];
  hasDiscrepancy: boolean;
  onProbeTriggered: (probeType: ProbeType) => void;
  disabled?: boolean;
  subjectDialogue?: string;
  unlockedProbes?: Set<ProbeType>; // Which probes are available to use
}

const ProbeButton = ({
  probeType,
  completed,
  required,
  isDiscrepancy,
  hasDiscrepancy,
  disabled,
  onPress,
}: {
  probeType: ProbeType;
  completed: boolean;
  required: boolean;
  isDiscrepancy: boolean;
  hasDiscrepancy: boolean;
  disabled: boolean;
  onPress: () => void;
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const probe = PROBE_TYPES[probeType];

  // Pulsing animation for required probes
  useEffect(() => {
    if (required && !completed && !disabled) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.3,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [required, completed, disabled, pulseAnim]);

  // Hide DISCREPANCY button if no discrepancy detected
  if (isDiscrepancy && !hasDiscrepancy) {
    return <View style={[styles.probeButton, styles.probeButtonHidden]} />;
  }

  // Allow re-tapping probes (only disable if overall disabled)
  const isDisabled = disabled;

  return (
    <TouchableOpacity
      style={[
        styles.probeButton,
        completed && styles.probeButtonCompleted,
        isDisabled && styles.probeButtonDisabled,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      <Animated.View
        style={[
          styles.probeButtonInner,
          required && !completed && {
            shadowOpacity: pulseAnim.interpolate({
              inputRange: [1, 1.3],
              outputRange: [0.3, 0.8],
            }),
          },
        ]}
      >
        {completed && (
          <View style={styles.checkmark}>
            <Text style={styles.checkmarkText}>✓</Text>
          </View>
        )}
        <Text style={[styles.probeLabel, completed && styles.probeLabelCompleted]}>
          {probe.label}
        </Text>
        <Text style={[styles.probeCommand, completed && styles.probeCommandCompleted]}>
          {probe.command}
        </Text>
        {completed && (
          <Text style={styles.repeatHint}>[ TAP TO REPEAT ]</Text>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

export const InterrogationPanel = ({
  hudStage,
  completedProbes,
  currentResponse,
  requiredProbes = [],
  hasDiscrepancy,
  onProbeTriggered,
  disabled = false,
  subjectDialogue,
  unlockedProbes = new Set(['HANDS', 'BUSINESS', 'DISCREPANCY', 'IDENTITY']), // Default: all unlocked
}: InterrogationPanelProps) => {
  if (hudStage === 'none') return null;

  const getToneColor = (tone?: ProbeResponse['toneShift']) => {
    switch (tone) {
      case 'AGITATED':
        return Theme.colors.accentDeny;
      case 'NERVOUS':
        return Theme.colors.accentWarn;
      case 'EVASIVE':
        return Theme.colors.accentWarn;
      case 'COOPERATIVE':
        return Theme.colors.accentApprove;
      default:
        return Theme.colors.textPrimary;
    }
  };

  // Extract only dialogue from response, removing descriptive text and brackets
  const extractDialogue = (text: string): string => {
    // Extract quoted dialogue first
    const dialogueMatch = text.match(/"([^"]*)"/);
    if (dialogueMatch) {
      return dialogueMatch[1];
    }
    
    // Remove descriptive text in brackets like [Subject complies...]
    let cleaned = text.replace(/\[[^\]]*\]/g, '').trim();
    
    // Remove any remaining quotes
    cleaned = cleaned.replace(/"/g, '').trim();
    
    // Return first sentence or truncate if too long (max 50 chars for small screen)
    const firstSentence = cleaned.split('.')[0].trim();
    return firstSentence.length > 50 ? firstSentence.substring(0, 47) + '...' : firstSentence;
  };


  return (
    <HUDBox hudStage={hudStage} style={styles.container} buildDelay={BUILD_SEQUENCE.header}>
      <View style={styles.header}>
        <TypewriterText
          text="INTERROGATION INTERFACE"
          active={true}
          delay={BUILD_SEQUENCE.header}
          style={styles.label}
          showCursor={false}
        />
        <View style={styles.statusIndicator}>
          <Text style={styles.statusText}>
            {completedProbes.size}/{PROBE_ORDER.filter(p => {
              const isUnlocked = unlockedProbes.has(p);
              const isDiscrepancyProbe = p === 'DISCREPANCY';
              return isUnlocked && (!isDiscrepancyProbe || hasDiscrepancy);
            }).length}
          </Text>
        </View>
      </View>

      <View style={styles.probeGrid}>
        {PROBE_ORDER.map((probeType) => {
          const isUnlocked = unlockedProbes.has(probeType);
          const isDiscrepancyProbe = probeType === 'DISCREPANCY';
          
          // Hide probe if not unlocked (or if DISCREPANCY and no discrepancy detected)
          if (!isUnlocked || (isDiscrepancyProbe && !hasDiscrepancy)) {
            return <View key={probeType} style={[styles.probeButton, styles.probeButtonHidden]} />;
          }
          
          return (
            <ProbeButton
              key={probeType}
              probeType={probeType}
              completed={completedProbes.has(probeType)}
              required={requiredProbes.includes(probeType)}
              isDiscrepancy={isDiscrepancyProbe}
              hasDiscrepancy={hasDiscrepancy}
              disabled={disabled || hudStage !== 'full'}
              onPress={() => onProbeTriggered(probeType)}
            />
          );
        })}
      </View>

      <View style={styles.responseArea}>
        {currentResponse ? (
          <View style={styles.responseContent}>
            <View style={styles.responseHeader}>
              <Text style={styles.responseLabel}>RESPONSE:</Text>
            </View>
            <TypewriterText
              text={extractDialogue(Array.isArray(currentResponse.response) 
                ? currentResponse.response[currentResponse.response.length - 1] 
                : currentResponse.response)}
              active={hudStage === 'full'}
              delay={100}
              style={[styles.responseText, { color: getToneColor(currentResponse.toneShift) }]}
            />
          </View>
        ) : (
          <View style={styles.initialDialogueArea}>
            <Text style={styles.initialDialogueLabel}>SUBJECT STATEMENT:</Text>
            {subjectDialogue ? (
              <TerminalLineDisplay
                text={`"${subjectDialogue}"`}
                active={hudStage === 'full'}
                style={styles.initialDialogueText}
              />
            ) : (
              <Text style={styles.awaitingResponse}>[ AWAITING PROBE SELECTION ]</Text>
            )}
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>PROTOCOL: STANDARD VERIFICATION // MODE: INTERROGATION</Text>
      </View>
    </HUDBox>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 200,
    backgroundColor: 'rgba(127, 184, 216, 0.03)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(127, 184, 216, 0.1)',
    paddingBottom: 4,
  },
  label: {
    color: Theme.colors.accentWarn,
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  statusIndicator: {
    backgroundColor: 'rgba(127, 184, 216, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 2,
  },
  statusText: {
    color: Theme.colors.textSecondary,
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
  },
  probeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  probeButton: {
    width: '48%',
    marginBottom: 6,
    backgroundColor: 'rgba(127, 184, 216, 0.05)',
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: 2,
  },
  probeButtonInner: {
    padding: 8,
    alignItems: 'center',
  },
  probeButtonCompleted: {
    backgroundColor: 'rgba(74, 138, 90, 0.1)',
    borderColor: Theme.colors.accentApprove,
  },
  probeButtonRequired: {
    borderColor: Theme.colors.accentWarn,
    borderWidth: 2,
  },
  probeButtonDisabled: {
    opacity: 0.5,
  },
  probeButtonHidden: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  checkmark: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 14,
    height: 14,
    backgroundColor: Theme.colors.accentApprove,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: 'bold',
  },
  probeLabel: {
    color: Theme.colors.textPrimary,
    fontFamily: Theme.fonts.mono,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  probeLabelCompleted: {
    color: Theme.colors.accentApprove,
  },
  probeCommand: {
    color: Theme.colors.textDim,
    fontFamily: Theme.fonts.mono,
    fontSize: 7,
    textAlign: 'center',
  },
  probeCommandCompleted: {
    color: Theme.colors.textSecondary,
  },
  repeatHint: {
    color: Theme.colors.textDim,
    fontFamily: Theme.fonts.mono,
    fontSize: 6,
    marginTop: 2,
    opacity: 0.6,
  },
  responseArea: {
    flex: 1,
    minHeight: 50,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(127, 184, 216, 0.1)',
    borderRadius: 2,
    padding: 8,
  },
  responseContent: {
    flex: 1,
  },
  responseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  responseLabel: {
    color: Theme.colors.textDim,
    fontFamily: Theme.fonts.mono,
    fontSize: 8,
    letterSpacing: 1,
  },
  toneIndicator: {
    fontFamily: Theme.fonts.mono,
    fontSize: 8,
    fontWeight: '700',
  },
  responseText: {
    color: Theme.colors.textPrimary,
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
    lineHeight: 16,
    fontStyle: 'italic',
  },
  awaitingResponse: {
    color: Theme.colors.textDim,
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    textAlign: 'center',
    opacity: 0.5,
  },
  initialDialogueArea: {
    flex: 1,
    padding: 4,
    overflow: 'hidden',
  },
  initialDialogueLabel: {
    color: Theme.colors.textDim,
    fontFamily: Theme.fonts.mono,
    fontSize: 8,
    letterSpacing: 1,
    marginBottom: 4,
  },
  initialDialogueText: {
    color: Theme.colors.textPrimary,
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
    lineHeight: 16,
    fontStyle: 'italic',
  },
  tickerContainer: {
    overflow: 'hidden',
    minHeight: 20,
    width: '100%',
  },
  terminalLineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  terminalCursor: {
    marginLeft: 2,
  },
  lineIndicator: {
    fontFamily: Theme.fonts.mono,
    fontSize: 8,
    color: Theme.colors.textDim,
    marginTop: 2,
    opacity: 0.6,
  },
  footer: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(127, 184, 216, 0.05)',
    paddingTop: 4,
  },
  footerText: {
    color: Theme.colors.textDim,
    fontFamily: Theme.fonts.mono,
    fontSize: 8,
  },
});

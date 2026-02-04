import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, Animated, TouchableOpacity, Easing, LayoutChangeEvent } from 'react-native';
import {
  Canvas,
  Group,
  Skia,
  Text as SkiaText,
  useFont,
} from '@shopify/react-native-skia';
import {
  Easing as ReanimatedEasing,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { ShareTechMono_400Regular } from '@expo-google-fonts/share-tech-mono';
import { styles } from '../../styles/ui/ScanData.styles';
import { HUDBox } from './HUDBox';
import { SubjectData } from '../../data/subjects';
import { BUILD_SEQUENCE } from '../../constants/animations';
import { Theme } from '../../constants/theme';
import { getSubjectGreeting } from '../../data/subjectGreetings';
import { MEMORY_SLOT_CAPACITY, type ServiceType } from '../../types/information';

export const TypewriterText = ({
  text,
  active,
  delay = 0,
  style,
  numberOfLines,
  showCursor = true,
  keepCursor = false,
  instant = false,
  speed = 25, // Phase 4: Customizable typing speed
  onComplete, // Phase 4: Callback when typing completes
}: {
  text: string,
  active: boolean,
  delay?: number,
  style?: any,
  numberOfLines?: number,
  showCursor?: boolean,
  keepCursor?: boolean,
  instant?: boolean,
  speed?: number,
  onComplete?: () => void,
}) => {
  const [display, setDisplay] = React.useState(instant ? text : '');
  const [isComplete, setIsComplete] = React.useState(instant);
  const [isTyping, setIsTyping] = React.useState(false);
  const [cursorVisible, setCursorVisible] = React.useState(true);

  React.useEffect(() => {
    if ((isTyping || keepCursor) && showCursor) {
      const cursorInterval = setInterval(() => {
        setCursorVisible(v => !v);
      }, 500);
      return () => clearInterval(cursorInterval);
    }
  }, [isTyping, keepCursor, showCursor]);

  React.useEffect(() => {
    // If instant mode, just show text immediately
    if (instant) {
      setDisplay(text);
      setIsComplete(true);
      setIsTyping(false);
      onComplete?.();
      return;
    }

    let interval: any = null;
    let timeout: any = null;

    if (!active) {
      setDisplay('');
      setIsComplete(false);
      setIsTyping(false);
      return;
    }

    // Reset state immediately when text or active changes
    setDisplay('');
    setIsComplete(false);
    setIsTyping(false);

    let currentText = '';

    timeout = setTimeout(() => {
      setIsTyping(true); // Start typing - show cursor
      interval = setInterval(() => {
        if (currentText.length < text.length) {
          currentText = text.slice(0, currentText.length + 1);
          setDisplay(currentText);
        } else {
          setIsComplete(true);
          setIsTyping(false); // Done typing
          if (interval) clearInterval(interval);
          onComplete?.(); // Phase 4: Call completion callback
        }
      }, speed);
    }, delay);

    return () => {
      if (timeout) clearTimeout(timeout);
      if (interval) clearInterval(interval);
    };
  }, [active, text, delay, instant, speed]);

  return (
    <Text
      style={style}
      numberOfLines={numberOfLines}
      ellipsizeMode={numberOfLines ? 'tail' : undefined}
    >
      {display}
      {showCursor && (isTyping || (keepCursor && isComplete)) && (
        <Text style={{ color: style?.color || Theme.colors.textPrimary, opacity: cursorVisible ? 0.8 : 0 }}>|</Text>
      )}
    </Text>
  );
};

export const SkiaTypewriterText = ({
  text,
  active,
  delay = 0,
  style,
  numberOfLines,
  instant = false,
  speed = 25,
  onComplete,
}: {
  text: string,
  active: boolean,
  delay?: number,
  style?: any,
  numberOfLines?: number,
  instant?: boolean,
  speed?: number,
  onComplete?: () => void,
}) => {
  const [layoutWidth, setLayoutWidth] = useState(0);
  const fontSize = style?.fontSize ?? 14;
  const lineHeight = style?.lineHeight ?? Math.round(fontSize * 1.3);
  const color = style?.color ?? Theme.colors.textPrimary;
  const progress = useSharedValue(0);

  const font = useFont(ShareTechMono_400Regular, fontSize);
  const metrics = useMemo(() => (font ? font.getMetrics() : null), [font]);
  const baseline = useMemo(() => (metrics ? Math.max(0, -metrics.ascent) : 0), [metrics]);

  const fallbackWidth = useMemo(() => {
    if (!text || !font) return 0;
    return Math.ceil(font.measureText(text).width);
  }, [font, text]);
  const availableWidth = layoutWidth || fallbackWidth;

  const lineData = useMemo(() => {
    if (!text || !availableWidth || !font) {
      return { lines: [''], widths: [0], lengths: [0], totalChars: 0, maxWidth: 0 };
    }
    const wrapLine = (input: string) => {
      const words = input.split(' ');
      const lines: string[] = [];
      let current = '';
      for (const word of words) {
        const next = current ? `${current} ${word}` : word;
        const width = font.measureText(next).width;
        if (width <= availableWidth || !current) {
          current = next;
          continue;
        }
        lines.push(current);
        current = word;
      }
      if (current) lines.push(current);
      return lines;
    };

    const paragraphs = text.split('\n');
    const wrapped = paragraphs.flatMap((line) => wrapLine(line));
    const lines = numberOfLines ? wrapped.slice(0, numberOfLines) : wrapped;
    const widths = lines.map((line) => font.measureText(line).width);
    const lengths = lines.map((line) => line.length);
    const totalChars = lengths.reduce((sum, len) => sum + len, 0);
    const maxWidth = Math.min(availableWidth, Math.max(0, ...widths));
    return { lines, widths, lengths, totalChars, maxWidth };
  }, [text, availableWidth, font, numberOfLines]);

  useEffect(() => {
    if (instant) {
      progress.value = 1;
      onComplete?.();
      return;
    }
    if (!active) {
      progress.value = 0;
      return;
    }
    progress.value = 0;
    const duration = Math.max(1, lineData.totalChars) * speed;
    const start = () => {
      progress.value = withTiming(1, { duration, easing: ReanimatedEasing.linear });
    };
    const timeout = setTimeout(start, delay);
    const done = setTimeout(() => onComplete?.(), delay + duration);
    return () => {
      clearTimeout(timeout);
      clearTimeout(done);
    };
  }, [active, delay, instant, lineData.totalChars, onComplete, progress, speed]);

  const clip = useDerivedValue(() => {
    const path = Skia.Path.Make();
    if (!lineData.totalChars || !availableWidth) return path;
    const visibleChars = Math.floor(progress.value * lineData.totalChars);
    let remaining = visibleChars;
    let lineIndex = 0;
    while (lineIndex < lineData.lengths.length && remaining > lineData.lengths[lineIndex]) {
      remaining -= lineData.lengths[lineIndex];
      lineIndex += 1;
    }
    for (let i = 0; i < lineIndex; i += 1) {
      path.addRect(Skia.XYWHRect(0, i * lineHeight, lineData.maxWidth, lineHeight));
    }
    if (lineIndex < lineData.lengths.length && lineData.lengths[lineIndex] > 0) {
      const lineWidth = lineData.widths[lineIndex] ?? 0;
      const fraction = Math.min(1, remaining / lineData.lengths[lineIndex]);
      path.addRect(Skia.XYWHRect(0, lineIndex * lineHeight, lineWidth * fraction, lineHeight));
    }
    return path;
  }, [lineData, lineHeight, availableWidth, progress]);

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    if (width && width !== layoutWidth) setLayoutWidth(width);
  };

  return (
    <View onLayout={handleLayout} style={style}>
      {availableWidth > 0 && font && (
        <Canvas style={{ width: availableWidth, height: lineData.lines.length * lineHeight }}>
          <Group clip={clip}>
            {lineData.lines.map((line, idx) => (
              <SkiaText
                key={`${line}-${idx}`}
                text={line}
                x={0}
                y={idx * lineHeight + baseline}
                font={font}
                color={color}
              />
            ))}
          </Group>
        </Canvas>
      )}
    </View>
  );
};

const ProgressBar = ({ 
  progress, 
  hasDecision, 
  decisionType,
  color
}: { 
  progress: Animated.Value, 
  hasDecision: boolean, 
  decisionType?: 'APPROVE' | 'DENY',
  color: string
}) => {
  const [barText, setBarText] = React.useState('▓▓▓▓░░░░');

  React.useEffect(() => {
    if (hasDecision) {
      // Animate the fill
      let current = 4;
      const interval = setInterval(() => {
        current++;
        let bar = '';
        for (let i = 0; i < 8; i++) {
          bar += i < current ? '█' : '░';
        }
        setBarText(bar);
        if (current >= 8) clearInterval(interval);
      }, 50);
      return () => clearInterval(interval);
    } else {
      setBarText('▓▓▓▓░░░░');
    }
  }, [hasDecision]);

  return <Text style={[styles.progressBarText, { color }]}>{barText}</Text>;
};

export const ScanData = ({ 
  id, 
  isScanning, 
  scanProgress, 
  hudStage,
  subject, 
  hasDecision, 
  decisionType,
  onIdentityScan,
  viewChannel = 'facial',
  identityScanUsed = false,
  activeServices = [],
  memoryCapacity = MEMORY_SLOT_CAPACITY,
  interactionPhase = 'investigation',
  subjectResponse = '',
  verificationStep = 0,
  onResponseComplete,
}: { 
  id: string, 
  isScanning: boolean, 
  scanProgress: Animated.Value,
  hudStage: 'none' | 'wireframe' | 'outline' | 'full',
  subject: SubjectData,
  hasDecision?: boolean,
  decisionType?: 'APPROVE' | 'DENY',
  onIdentityScan?: (holdDurationMs?: number) => void,
  viewChannel?: 'facial' | 'eye',
  identityScanUsed?: boolean,
  activeServices?: ServiceType[],
  memoryCapacity?: number,
  interactionPhase?: 'greeting' | 'credentials' | 'investigation',
  subjectResponse?: string,
  verificationStep?: number,
  onResponseComplete?: () => void,
}) => {
  const memoryFull = (activeServices?.length || 0) >= (memoryCapacity || MEMORY_SLOT_CAPACITY);
  const identityRunning = !!activeServices?.includes('IDENTITY_SCAN');

  const getStatusLine = () => {
    if (!hasDecision) {
      return null;
    }
    const isApprove = decisionType === 'APPROVE';
    const color = isApprove ? Theme.colors.accentApprove : Theme.colors.accentDeny;
    const text = isApprove ? 'STATUS: CLEARED' : 'STATUS: REJECTED';
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={[styles.statusDot, { backgroundColor: color }]} />
        <Text style={[styles.bpmMonitoring, { color }]}> {text}</Text>
      </View>
    );
  };

  const renderProgressBar = () => {
    const isApprove = decisionType === 'APPROVE';
    const color = hasDecision 
      ? (isApprove ? Theme.colors.accentApprove : Theme.colors.accentDeny)
      : Theme.colors.textPrimary;
    
    const label = hasDecision 
      ? (isApprove ? 'COMPLETE' : 'FLAGGED')
      : '';

    return (
      <View style={styles.progressRow}>
        <ProgressBar 
          progress={scanProgress} 
          hasDecision={!!hasDecision} 
          decisionType={decisionType} 
          color={color}
        />
        {hasDecision && <Text style={[styles.progressLabel, { color }]}> {label}</Text>}
      </View>
    );
  };

  const renderResponseBox = () => {
    if (hudStage !== 'full') return null;

    // Determine what text to show
    let textToShow = '';
    let isInterrogation = false;
    let commStyle = 'FLUENT';

    if (interactionPhase === 'greeting') {
      const greetingData = getSubjectGreeting(subject.id, subject);
      textToShow = greetingData?.greeting || subject.dialogue || '...';
      commStyle = greetingData?.communicationStyle || 'FLUENT';
    } else if (subjectResponse) {
      textToShow = subjectResponse;
      isInterrogation = true;
    }

    return (
      <View style={styles.responseBox}>
        <View style={styles.responseField}>
          <View style={styles.responseHeader}>
            <Text style={styles.responseLabel}>SUBJECT:</Text>
          </View>
          <SkiaTypewriterText
            text={
              textToShow
                ? (isInterrogation ? textToShow : `"${textToShow}"`)
                : ' '
            }
            active={true}
            delay={interactionPhase === 'greeting' ? 500 : 0}
            style={[
              styles.responseText,
              isInterrogation && styles.interrogationResponseText,
              commStyle === 'AGITATED' && styles.agitatedText,
              commStyle === 'BROKEN' && styles.brokenText,
              commStyle === 'SILENT' && styles.silentText,
            ]}
            onComplete={onResponseComplete}
            speed={commStyle === 'AGITATED' ? 20 : commStyle === 'BROKEN' ? 60 : 35}
          />
        </View>
      </View>
    );
  };

  const verificationAnim = React.useRef(new Animated.Value(0)).current;
  const infoCardAnim = React.useRef(new Animated.Value(0)).current;
  const verificationLabelOpacity = React.useRef(new Animated.Value(1)).current;
  const readyLabelOpacity = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(verificationAnim, {
      toValue: verificationStep,
      duration: 420,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [verificationStep]);

  React.useEffect(() => {
    if (hudStage !== 'full') {
      infoCardAnim.setValue(0);
      verificationLabelOpacity.setValue(1);
      readyLabelOpacity.setValue(0);
      return;
    }

    if (verificationStep >= 4) {
      verificationLabelOpacity.setValue(1);
      readyLabelOpacity.setValue(0);
      infoCardAnim.setValue(0);
      Animated.sequence([
        Animated.timing(verificationLabelOpacity, {
          toValue: 0,
          duration: 220,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
        Animated.timing(readyLabelOpacity, {
          toValue: 1,
          duration: 240,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
        Animated.timing(infoCardAnim, {
          toValue: 1,
          duration: 280,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      verificationLabelOpacity.setValue(1);
      readyLabelOpacity.setValue(0);
      Animated.timing(infoCardAnim, {
        toValue: 0,
        duration: 120,
        useNativeDriver: false,
      }).start();
    }
  }, [hudStage, verificationStep]);

  const verificationLabelColor = verificationAnim.interpolate({
    inputRange: [0, 1, 2, 3, 4],
    outputRange: [
      '#6a4a2a',
      '#8a5a2a',
      '#a36a2a',
      '#c97a2a',
      '#e08f3a',
    ],
  });

  return (
    <HUDBox hudStage={hudStage} style={styles.container} buildDelay={BUILD_SEQUENCE.locRecord} mechanical>
      <View style={styles.leftColumn}>
        {/* Top row: ID + Progress on left, Status on right */}
        <View style={styles.topRow}>
          <View style={styles.idSection}>
            <SkiaTypewriterText
              text={id}
              active={hudStage === 'full'}
              delay={BUILD_SEQUENCE.identification + 400}
              style={styles.idCode}
            />
            {renderProgressBar()}

            {hudStage === 'full' && (
              <View style={styles.verificationRow}>
                <View>
                  <Animated.Text style={[styles.verificationLabel, { color: verificationLabelColor, opacity: verificationLabelOpacity }]}>
                    VERIFICATION
                  </Animated.Text>
                  <Animated.Text style={[styles.verificationLabel, { color: verificationLabelColor, opacity: readyLabelOpacity, position: 'absolute', left: 0, top: 0 }]}>
                    SUBJECT READY
                  </Animated.Text>
                </View>
                <View style={styles.verificationTicks}>
                  {[0, 1, 2, 3].map((step) => (
                    <Animated.View
                      key={step}
                      style={[
                        styles.verificationTick,
                        {
                          borderColor: verificationAnim.interpolate({
                            inputRange: [step, step + 1],
                            outputRange: ['#2a3a4a', '#c9a227'],
                            extrapolate: 'clamp',
                          }),
                          backgroundColor: verificationAnim.interpolate({
                            inputRange: [step, step + 1],
                            outputRange: ['rgba(0,0,0,0)', '#c9a227'],
                            extrapolate: 'clamp',
                          }),
                        },
                      ]}
                    />
                  ))}
                </View>
              </View>
            )}
          </View>

          {/* Status on right side */}
          <View style={styles.statusColumn}>
            {getStatusLine()}
          </View>
        </View>

        <Animated.View
          style={{
            opacity: infoCardAnim,
            transform: [
              {
                translateY: infoCardAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [6, 0],
                }),
              },
            ],
          }}
        >
          {renderResponseBox()}
        </Animated.View>
      </View>
    </HUDBox>
  );
};

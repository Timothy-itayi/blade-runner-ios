import React from 'react';
import { View, Text, Animated, TouchableOpacity, Easing } from 'react-native';
import { useAudioPlayer } from 'expo-audio';
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
  instant?: boolean,
  speed?: number,
  onComplete?: () => void,
}) => {
  const [display, setDisplay] = React.useState(instant ? text : '');
  const [isComplete, setIsComplete] = React.useState(instant);
  const [isTyping, setIsTyping] = React.useState(false);

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
          setIsTyping(false); // Done typing - hide cursor
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
      {showCursor && isTyping && !isComplete && (
        <Text style={{ color: style?.color || Theme.colors.textPrimary, opacity: 0.8 }}>|</Text>
      )}
    </Text>
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
  onIdentityScanHoldStart,
  onIdentityScanHoldEnd,
  onHealthScan,
  viewChannel = 'facial',
  resourcesRemaining = 0,
  identityScanUsed = false,
  healthScanUsed = false,
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
  onIdentityScanHoldStart?: () => void,
  onIdentityScanHoldEnd?: (holdDurationMs: number) => void,
  onHealthScan?: () => void,
  viewChannel?: 'facial' | 'eye',
  resourcesRemaining?: number,
  identityScanUsed?: boolean,
  healthScanUsed?: boolean,
  activeServices?: ServiceType[],
  memoryCapacity?: number,
  interactionPhase?: 'greeting' | 'credentials' | 'investigation',
  subjectResponse?: string,
  verificationStep?: number,
  onResponseComplete?: () => void,
}) => {
  const memoryFull = (activeServices?.length || 0) >= (memoryCapacity || MEMORY_SLOT_CAPACITY);
  const identityRunning = !!activeServices?.includes('IDENTITY_SCAN');
  const healthRunning = !!activeServices?.includes('HEALTH_SCAN');
  const identityHoldStartRef = React.useRef<number | null>(null);
  const audioFile = subject.bioScanData?.audioFile;
  const audioPlayer = useAudioPlayer(audioFile || null);

  React.useEffect(() => {
    return () => {
      if (audioPlayer?.playing) {
        audioPlayer.pause();
      }
    };
  }, [audioPlayer, subject.id]);

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
          <TypewriterText
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
            showCursor={true}
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
    <HUDBox hudStage={hudStage} style={styles.container} buildDelay={BUILD_SEQUENCE.locRecord}>
      <View style={styles.leftColumn}>
        <View style={styles.identHeader}>
          <View style={styles.statusContainer}>
            {getStatusLine()}
          </View>
        </View>
        
        <View style={styles.idSection}>
          <TypewriterText 
            text={id} 
            active={hudStage === 'full'} 
            delay={BUILD_SEQUENCE.identification + 400} 
            style={styles.idCode} 
            showCursor={false}
          />
          {renderProgressBar()}
        </View>

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
      
      {/* Scan Buttons - Identity & Health */}
      {hudStage === 'full' && (
        <View style={styles.rightColumn}>
          <TouchableOpacity 
            style={[
              styles.scanButton,
              styles.identityScanButton,
              (identityScanUsed || identityRunning || memoryFull || interactionPhase !== 'investigation') && styles.channelToggleButtonDisabled
            ]}
            onPressIn={() => {
              identityHoldStartRef.current = Date.now();
              onIdentityScanHoldStart?.();
            }}
            onPressOut={() => {
              const startedAt = identityHoldStartRef.current;
              identityHoldStartRef.current = null;
              const duration = startedAt ? Date.now() - startedAt : 0;
              onIdentityScan?.(duration);
              onIdentityScanHoldEnd?.(duration);
            }}
            disabled={identityScanUsed || identityRunning || memoryFull || interactionPhase !== 'investigation'}
          >
            <Text style={[
              styles.channelToggleText,
              (identityScanUsed || identityRunning || memoryFull || interactionPhase !== 'investigation') && styles.channelToggleTextDisabled
            ]}>
              {identityRunning ? 'ID SCAN [RUNNING]' : identityScanUsed ? 'ID SCAN [USED]' : 'ID SCAN [HOLD]'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.scanButton,
              styles.healthScanButton,
              (healthScanUsed || healthRunning || memoryFull || interactionPhase !== 'investigation') && styles.channelToggleButtonDisabled
            ]}
            onPress={onHealthScan}
            disabled={healthScanUsed || healthRunning || memoryFull || interactionPhase !== 'investigation'}
          >
            <Text style={[
              styles.channelToggleText,
              (healthScanUsed || healthRunning || memoryFull || interactionPhase !== 'investigation') && styles.channelToggleTextDisabled
            ]}>
              {healthRunning ? 'HEALTH [RUNNING]' : healthScanUsed ? 'HEALTH [USED]' : 'HEALTH SCAN'}
            </Text>
          </TouchableOpacity>

          <View
            style={[
              styles.healthAudioPanel,
              !healthScanUsed && styles.healthAudioPanelDisabled,
            ]}
          >
            <Text
              style={[
                styles.healthAudioLabel,
                !healthScanUsed && styles.healthAudioLabelDisabled,
              ]}
            >
              HEALTH AUDIO
            </Text>
            <TouchableOpacity
              style={[
                styles.healthAudioButton,
                (!healthScanUsed || !audioFile) && styles.healthAudioButtonDisabled,
              ]}
              onPress={() => {
                if (!audioPlayer || !audioFile) return;
                if (audioPlayer.playing) {
                  audioPlayer.pause();
                } else {
                  audioPlayer.volume = 0.7;
                  audioPlayer.loop = false;
                  audioPlayer.play();
                }
              }}
              disabled={!healthScanUsed || !audioFile}
            >
              <Text
                style={[
                  styles.healthAudioButtonText,
                  (!healthScanUsed || !audioFile) && styles.healthAudioButtonTextDisabled,
                ]}
              >
                {audioPlayer?.playing ? '[ PAUSE ]' : '[ PLAY ]'}
              </Text>
            </TouchableOpacity>
            <Text
              style={[
                styles.healthAudioStatus,
                !healthScanUsed && styles.healthAudioStatusDisabled,
              ]}
            >
              {!healthScanUsed
                ? 'LOCKED UNTIL HEALTH SCAN COMPLETE'
                : audioFile
                  ? 'AUDIO READY'
                  : 'NO AUDIO FILE'}
            </Text>
          </View>

        </View>
      )}
    </HUDBox>
  );
};

import React from 'react';
import { View, Text, Animated, TouchableOpacity } from 'react-native';
import { styles } from '../../styles/ui/ScanData.styles';
import { HUDBox } from './HUDBox';
import { SubjectData } from '../../data/subjects';
import { BUILD_SEQUENCE } from '../../constants/animations';
import { Theme } from '../../constants/theme';
import { getSubjectGreeting } from '../../data/subjectGreetings';

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
  onHealthScan,
  viewChannel = 'facial',
  resourcesRemaining = 0,
  identityScanUsed = false,
  healthScanUsed = false,
  eyeScannerActive = false,
  onToggleEyeScanner,
  interactionPhase = 'investigation',
  subjectResponse = '',
  onResponseComplete,
}: { 
  id: string, 
  isScanning: boolean, 
  scanProgress: Animated.Value,
  hudStage: 'none' | 'wireframe' | 'outline' | 'full',
  subject: SubjectData,
  hasDecision?: boolean,
  decisionType?: 'APPROVE' | 'DENY',
  onIdentityScan?: () => void,
  onHealthScan?: () => void,
  viewChannel?: 'facial' | 'eye',
  resourcesRemaining?: number,
  identityScanUsed?: boolean,
  healthScanUsed?: boolean,
  eyeScannerActive?: boolean,
  onToggleEyeScanner?: () => void,
  interactionPhase?: 'greeting' | 'credentials' | 'investigation',
  subjectResponse?: string,
  onResponseComplete?: () => void,
}) => {
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

  return (
    <HUDBox hudStage={hudStage} style={styles.container} buildDelay={BUILD_SEQUENCE.locRecord}>
      <View style={styles.leftColumn}>
        <View style={styles.identHeader}>
          <TypewriterText text="IDENT CONFIRM" active={hudStage !== 'none'} delay={BUILD_SEQUENCE.identification} style={styles.label} />
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

        {renderResponseBox()}
      </View>
      
      {/* Scan Buttons - Identity & Health */}
      {hudStage === 'full' && (
        <View style={styles.rightColumn}>
          <TouchableOpacity 
            style={[
              styles.scanButton,
              styles.identityScanButton,
              (resourcesRemaining === 0 || identityScanUsed || interactionPhase !== 'investigation' || !eyeScannerActive) && styles.channelToggleButtonDisabled
            ]}
            onPress={onIdentityScan}
            disabled={resourcesRemaining === 0 || identityScanUsed || interactionPhase !== 'investigation' || !eyeScannerActive}
          >
            <Text style={[
              styles.channelToggleText,
              (resourcesRemaining === 0 || identityScanUsed || interactionPhase !== 'investigation') && styles.channelToggleTextDisabled
            ]}>
              {identityScanUsed ? 'IDENTITY [USED]' : 'IDENTITY SCAN'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.scanButton,
              styles.healthScanButton,
              (resourcesRemaining === 0 || healthScanUsed || interactionPhase !== 'investigation') && styles.channelToggleButtonDisabled
            ]}
            onPress={onHealthScan}
            disabled={resourcesRemaining === 0 || healthScanUsed || interactionPhase !== 'investigation'}
          >
            <Text style={[
              styles.channelToggleText,
              (resourcesRemaining === 0 || healthScanUsed || interactionPhase !== 'investigation') && styles.channelToggleTextDisabled
            ]}>
              {healthScanUsed ? 'HEALTH [USED]' : 'HEALTH SCAN'}
            </Text>
          </TouchableOpacity>

          {/* Eye Scanner Toggle */}
          <TouchableOpacity 
            style={[
              styles.scanButton,
              styles.eyeScannerButton,
              eyeScannerActive && styles.eyeScannerButtonActive,
              interactionPhase !== 'investigation' && styles.channelToggleButtonDisabled
            ]}
            onPress={onToggleEyeScanner}
            disabled={interactionPhase !== 'investigation'}
          >
            <Text style={[
              styles.channelToggleText,
              eyeScannerActive && styles.eyeScannerTextActive,
              interactionPhase !== 'investigation' && styles.channelToggleTextDisabled
            ]}>
              {eyeScannerActive ? 'EYE SCANNER [ON]' : 'EYE SCANNER [OFF]'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </HUDBox>
  );
};

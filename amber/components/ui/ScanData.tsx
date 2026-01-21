import React from 'react';
import { View, Text, Animated, TouchableOpacity } from 'react-native';
import { styles } from '../../styles/ui/ScanData.styles';
import { HUDBox } from './HUDBox';
import { SubjectData } from '../../data/subjects';
import { BUILD_SEQUENCE } from '../../constants/animations';
import { Theme } from '../../constants/theme';

export const TypewriterText = ({ text, active, delay = 0, style, showCursor = true, instant = false }: { text: string, active: boolean, delay?: number, style?: any, showCursor?: boolean, instant?: boolean }) => {
  const [display, setDisplay] = React.useState(instant ? text : '');
  const [isComplete, setIsComplete] = React.useState(instant);
  const [isTyping, setIsTyping] = React.useState(false);

  React.useEffect(() => {
    // If instant mode, just show text immediately
    if (instant) {
      setDisplay(text);
      setIsComplete(true);
      setIsTyping(false);
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
        }
      }, 25); // Slightly faster
    }, delay);

    return () => {
      if (timeout) clearTimeout(timeout);
      if (interval) clearInterval(interval);
    };
  }, [active, text, delay, instant]);

  return (
    <Text style={style}>
      {display}
      {showCursor && isTyping && !isComplete && (
        <Text style={{ color: style?.color || Theme.colors.textPrimary, opacity: 0.8 }}>█</Text>
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
  onBioScan,
  viewChannel = 'facial',
  resourcesRemaining = 0,
}: { 
  id: string, 
  isScanning: boolean, 
  scanProgress: Animated.Value,
  hudStage: 'none' | 'wireframe' | 'outline' | 'full',
  subject: SubjectData,
  hasDecision?: boolean,
  decisionType?: 'APPROVE' | 'DENY',
  onBioScan?: () => void,
  viewChannel?: 'facial' | 'eye',
  resourcesRemaining?: number,
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
      </View>
      
      {/* BIO SCAN Button - opposite IDENT CONFIRM */}
      {hudStage === 'full' && (
        <View style={styles.rightColumn}>
          <TouchableOpacity 
            style={[
              styles.bioScanButton,
              resourcesRemaining === 0 && styles.channelToggleButtonDisabled
            ]}
            onPress={onBioScan}
            disabled={resourcesRemaining === 0}
          >
            <Text style={[
              styles.channelToggleText,
              resourcesRemaining === 0 && styles.channelToggleTextDisabled
            ]}>
              BIO SCAN
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </HUDBox>
  );
};

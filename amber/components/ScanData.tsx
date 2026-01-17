import React from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { styles } from '../styles/ScanData.styles';
import { HUDBox } from './HUDBox';
import { SubjectData } from '../data/subjects';

import { BUILD_SEQUENCE } from '../constants/animations';

export const TypewriterText = ({ text, active, delay = 0, style, showCursor = true }: { text: string, active: boolean, delay?: number, style?: any, showCursor?: boolean }) => {
  const [display, setDisplay] = React.useState('');
  const [isComplete, setIsComplete] = React.useState(false);

  React.useEffect(() => {
    let interval: any = null;
    let timeout: any = null;

    if (!active) {
      setDisplay('');
      setIsComplete(false);
      return;
    }

    // Reset state immediately when text or active changes
    setDisplay('');
    setIsComplete(false);
    
    let currentText = '';
    
    timeout = setTimeout(() => {
      interval = setInterval(() => {
        if (currentText.length < text.length) {
          currentText = text.slice(0, currentText.length + 1);
          setDisplay(currentText);
        } else {
          setIsComplete(true);
          if (interval) clearInterval(interval);
        }
      }, 25); // Slightly faster
    }, delay);

    return () => {
      if (timeout) clearTimeout(timeout);
      if (interval) clearInterval(interval);
    };
  }, [active, text, delay]);

  return (
    <Text style={style}>
      {display}
      {showCursor && !isComplete && (
        <Text style={{ color: style?.color || Theme.colors.textPrimary, opacity: 0.8 }}>█</Text>
      )}
    </Text>
  );
};

export const ScrambleText = ({ text, active, delay = 0, keepScrambling = false, style }: { text: string, active: boolean, delay?: number, keepScrambling?: boolean, style?: any }) => {
  const [display, setDisplay] = React.useState(active ? '' : text);
  const chars = '!@#$%^&*()_+{}[]|;:,.<>?';

  React.useEffect(() => {
    let interval: any = null;
    let timeout: any = null;

    if (!active) {
      setDisplay(text);
      return;
    }

    // Start empty while waiting for delay if we just became active
    setDisplay('');

    timeout = setTimeout(() => {
      let iterations = 0;
      interval = setInterval(() => {
        setDisplay(prev => {
          // If the length is 0, we need to initialize it with some random chars or the final length
          const currentLength = text.length;
          let newDisplay = '';
          for (let i = 0; i < currentLength; i++) {
            if (!keepScrambling && i < iterations) {
              newDisplay += text[i];
            } else {
              newDisplay += chars[Math.floor(Math.random() * chars.length)];
            }
          }
          return newDisplay;
        });
        
        if (!keepScrambling && iterations >= text.length) {
          if (interval) clearInterval(interval);
        }
        iterations += 1;
      }, 30);
    }, delay);

    return () => {
      if (timeout) clearTimeout(timeout);
      if (interval) clearInterval(interval);
    };
  }, [active, text, keepScrambling, delay]);

  return <Text style={[styles.dataValue, style]}>{display}</Text>;
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

export const ScanData = ({ id, isScanning, scanProgress, hudStage, subject, hasDecision, decisionType }: { 
  id: string, 
  isScanning: boolean, 
  scanProgress: Animated.Value,
  hudStage: 'none' | 'wireframe' | 'outline' | 'full',
  subject: SubjectData,
  hasDecision?: boolean,
  decisionType?: 'APPROVE' | 'DENY'
}) => {
  const [hasReachedBottom, setHasReachedBottom] = React.useState(false);

  React.useEffect(() => {
    if (!isScanning) {
      setHasReachedBottom(false);
      return;
    }

    const listener = scanProgress.addListener(({ value }) => {
      if (value >= 0.95 && !hasReachedBottom) {
        setHasReachedBottom(true);
      }
    });

    return () => scanProgress.removeListener(listener);
  }, [isScanning, scanProgress]);

  // Scramble if we're in buildup OR if a scan is active AND hasn't finished its sweep
  const shouldScramble = hudStage !== 'full' || (isScanning && !hasReachedBottom);

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
          {getStatusLine()}
        </View>
        
        <View style={styles.idSection}>
          <ScrambleText text={id} active={hudStage !== 'full' || (isScanning && !hasReachedBottom)} keepScrambling={hudStage !== 'full' || (isScanning && !hasReachedBottom)} delay={BUILD_SEQUENCE.identification + 400} style={styles.idCode} />
          {renderProgressBar()}
        </View>
      </View>
      
      <View style={styles.rightColumn}>
        <View style={styles.locationHeader}>
          <View style={styles.gridBox}>
            <View style={styles.gridDot} />
          </View>
          <TypewriterText text="LOC RECORD" active={hudStage !== 'none'} delay={BUILD_SEQUENCE.locRecord + 200} style={styles.gridLabel} />
        </View>
        
        <View style={styles.locGrid}>
          <View style={styles.locRow}>
            <View style={styles.dataRow}>
              <TypewriterText text="ADDR:" active={hudStage !== 'none'} delay={BUILD_SEQUENCE.locRecord + 400} style={styles.dataLabel} />
              <ScrambleText text={subject.locRecord.addr} active={shouldScramble} keepScrambling={shouldScramble} delay={BUILD_SEQUENCE.locRecord + 600} />
            </View>
            <View style={styles.dataRow}>
              <TypewriterText text="TIME:" active={hudStage !== 'none'} delay={BUILD_SEQUENCE.locRecord + 500} style={styles.dataLabel} />
              <ScrambleText text={subject.locRecord.time} active={shouldScramble} keepScrambling={shouldScramble} delay={BUILD_SEQUENCE.locRecord + 700} />
            </View>
          </View>
          <View style={styles.locRow}>
            <View style={styles.dataRow}>
              <TypewriterText text="PL:" active={hudStage !== 'none'} delay={BUILD_SEQUENCE.locRecord + 600} style={styles.dataLabel} />
              <ScrambleText text={subject.locRecord.pl} active={shouldScramble} keepScrambling={shouldScramble} delay={BUILD_SEQUENCE.locRecord + 800} />
            </View>
            <View style={styles.dataRow}>
              <TypewriterText text="D.O.B:" active={hudStage !== 'none'} delay={BUILD_SEQUENCE.locRecord + 700} style={styles.dataLabel} />
              <ScrambleText text={subject.locRecord.dob} active={shouldScramble} keepScrambling={shouldScramble} delay={BUILD_SEQUENCE.locRecord + 900} />
            </View>
          </View>
        </View>
      </View>
    </HUDBox>
  );
};

import { Theme } from '../constants/theme';

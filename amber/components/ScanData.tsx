import React, { useState } from 'react';
import { View, Text, Animated, Pressable } from 'react-native';
import { styles } from '../styles/ScanData.styles';
import { HUDBox } from './HUDBox';
import { SubjectData } from '../data/subjects';
import { CredentialModal } from './CredentialModal';
import { BUILD_SEQUENCE } from '../constants/animations';
import { useGameAudioContext } from '../contexts/AudioContext';

export const TypewriterText = ({ text, active, delay = 0, style, showCursor = true }: { text: string, active: boolean, delay?: number, style?: any, showCursor?: boolean }) => {
  const [display, setDisplay] = React.useState('');
  const [isComplete, setIsComplete] = React.useState(false);
  const [isTyping, setIsTyping] = React.useState(false);

  React.useEffect(() => {
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
  }, [active, text, delay]);

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
  onCredentialViewed,
  onCredentialVerified,
}: { 
  id: string, 
  isScanning: boolean, 
  scanProgress: Animated.Value,
  hudStage: 'none' | 'wireframe' | 'outline' | 'full',
  subject: SubjectData,
  hasDecision?: boolean,
  decisionType?: 'APPROVE' | 'DENY',
  onCredentialViewed?: () => void,
  onCredentialVerified?: (verified: boolean) => void,
}) => {
  const { playButtonSound } = useGameAudioContext();
  const [hasReachedBottom, setHasReachedBottom] = React.useState(false);
  const [showCredentialModal, setShowCredentialModal] = useState(false);
  const [credentialVerified, setCredentialVerified] = useState(false);
  const [credentialViewed, setCredentialViewed] = useState(false);

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

  // Reset credential state when subject changes
  React.useEffect(() => {
    setCredentialVerified(false);
    setCredentialViewed(false);
    setShowCredentialModal(false);
  }, [subject.id]);

  const handleOpenCredential = () => {
    playButtonSound();
    setShowCredentialModal(true);
    if (!credentialViewed) {
      setCredentialViewed(true);
      onCredentialViewed?.();
    }
  };

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

  const getCredentialStatusColor = () => {
    if (!subject.credential) return Theme.colors.textDim;
    if (credentialVerified) {
      const verified = subject.credential.verifiedStatus || 'CONFIRMED';
      if (verified === 'CONFIRMED') return Theme.colors.accentApprove;
      if (verified === 'EXPIRED' || verified === 'DENIED') return Theme.colors.accentDeny;
      return Theme.colors.textSecondary;
    }
    if (subject.credential.initialStatus === 'CONFIRMED') return Theme.colors.accentApprove;
    if (subject.credential.initialStatus === 'PENDING') return Theme.colors.accentWarn;
    if (subject.credential.initialStatus === 'EXPIRED') return Theme.colors.accentDeny;
    return Theme.colors.textDim;
  };

  const getCredentialStatusText = () => {
    if (!subject.credential) return 'NONE';
    if (credentialVerified) {
      return subject.credential.verifiedStatus || 'CONFIRMED';
    }
    return subject.credential.initialStatus;
  };

  const handleVerifyComplete = (result: 'CONFIRMED' | 'EXPIRED' | 'DENIED' | 'UNVERIFIED') => {
    setCredentialVerified(true);
    onCredentialVerified?.(true);
  };

  return (
    <>
      <HUDBox hudStage={hudStage} style={styles.container} buildDelay={BUILD_SEQUENCE.locRecord}>
        <View style={styles.leftColumn}>
          <View style={styles.identHeader}>
            <TypewriterText text="IDENT CONFIRM" active={hudStage !== 'none'} delay={BUILD_SEQUENCE.identification} style={styles.label} />
            {getStatusLine()}
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
        
        {/* Credential Button - Right Column */}
        <View style={styles.rightColumn}>
          <TypewriterText 
            text="CREDENTIAL" 
            active={hudStage !== 'none'} 
            delay={BUILD_SEQUENCE.locRecord + 200} 
            style={styles.gridLabel} 
            showCursor={false}
          />
          
          <Pressable 
            onPress={handleOpenCredential}
            style={({ pressed }) => [
              styles.credentialButton,
              pressed && styles.credentialButtonPressed
            ]}
            disabled={hudStage !== 'full'}
          >
            <View style={styles.credentialContent}>
              <View style={[styles.credentialDot, { backgroundColor: getCredentialStatusColor() }]} />
              <Text style={[styles.credentialStatus, { color: getCredentialStatusColor() }]}>
                {getCredentialStatusText()}
              </Text>
            </View>
            <Text style={styles.credentialAction}>[ VIEW ]</Text>
          </Pressable>
        </View>
      </HUDBox>

      <CredentialModal
        visible={showCredentialModal}
        credential={subject.credential}
        alreadyVerified={credentialVerified}
        onClose={() => setShowCredentialModal(false)}
        onVerify={handleVerifyComplete}
      />
    </>
  );
};

import { Theme } from '../constants/theme';

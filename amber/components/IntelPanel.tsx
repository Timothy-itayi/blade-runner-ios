import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { styles } from '../styles/IntelPanel.styles';
import { SubjectData } from '../data/subjects';
import { HUDBox, DrawingBorder } from './HUDBox';
import { Theme } from '../constants/theme';
import { ScrambleText, TypewriterText } from './ScanData';
import { BUILD_SEQUENCE } from '../constants/animations';

const DigitalStatusLine = ({ 
  id, 
  hasDecision, 
  decisionType, 
  active 
}: { 
  id: string, 
  hasDecision: boolean, 
  decisionType?: 'APPROVE' | 'DENY',
  active: boolean
}) => {
  const [bpm, setBpm] = useState(78);
  const [barProgress, setBarProgress] = useState(0); // 0 to 8 segments
  const [isFlickering, setIsFlickering] = useState(false);
  
  useEffect(() => {
    if (!active) return;
    
    const interval = setInterval(() => {
      setBpm(prev => {
        const delta = Math.floor(Math.random() * 5) - 2;
        const next = prev + delta;
        return Math.min(Math.max(next, 65), 95);
      });
    }, 1500);
    
    return () => clearInterval(interval);
  }, [active]);

  useEffect(() => {
    if (!active) {
      setBarProgress(0);
      return;
    }

    if (hasDecision) {
      setIsFlickering(true);
      let current = 4;
      const interval = setInterval(() => {
        // Add a bit of "digital jitter" - sometimes it flickers backwards or stays
        const jitter = Math.random() > 0.8 ? -1 : 1;
        current = Math.min(Math.max(current + jitter, 4), 8);
        
        setBarProgress(current);
        if (current >= 8 && Math.random() > 0.7) {
          clearInterval(interval);
          setTimeout(() => setIsFlickering(false), 150);
        }
      }, 40);
      return () => clearInterval(interval);
    } else {
      setBarProgress(4);
      setIsFlickering(false);
    }
  }, [hasDecision, active]);

  if (!active) return <View style={styles.statusLineContainer} />;

  const renderBar = () => {
    let bar = '';
    const char = hasDecision ? '█' : '▓';
    for (let i = 0; i < 8; i++) {
      if (i < barProgress) bar += char;
      else bar += '░';
    }
    return bar;
  };

  const statusText = hasDecision 
    ? (decisionType === 'APPROVE' ? 'COMPLETE' : 'FLAGGED')
    : '';

  const statusLineLabel = hasDecision
    ? `STATUS: ${decisionType === 'APPROVE' ? 'CLEARED' : 'REJECTED'}`
    : `${bpm} BPM MONITORING`;

  const accentColor = hasDecision
    ? (decisionType === 'APPROVE' ? Theme.colors.accentApprove : Theme.colors.accentDeny)
    : Theme.colors.textPrimary;

  

 
  
};

export const IntelPanel = ({ 
  data, 
  index,
  hudStage, 
  onRevealVerify,
  hasDecision,
  decisionType
}: { 
  data: SubjectData, 
  index: number,
  hudStage: 'none' | 'wireframe' | 'outline' | 'full',
  onRevealVerify: () => void,
  hasDecision?: boolean,
  decisionType?: 'APPROVE' | 'DENY'
}) => {
  const shouldScramble = hudStage !== 'full';
  const flickerAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (hudStage === 'outline') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(flickerAnim, { toValue: 0.2, duration: 50, useNativeDriver: true }),
          Animated.timing(flickerAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
          Animated.timing(flickerAnim, { toValue: 0.4, duration: 80, useNativeDriver: true }),
          Animated.timing(flickerAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
        ])
      ).start();
    } else {
      flickerAnim.setValue(1);
    }
  }, [hudStage]);
  
  const getStatusColor = (status: string) => {
    if (shouldScramble) return Theme.colors.textDim;
    switch (status) {
      case 'ACTIVE':
        return Theme.colors.accentApprove;
      case 'PROVISIONAL':
      case 'UNDER REVIEW':
        return Theme.colors.accentWarn;
      case 'RESTRICTED':
      case '[TERMINATED]':
      case 'ERROR':
      case 'UNDEFINED':
        return Theme.colors.accentDeny;
      default:
        return Theme.colors.textPrimary;
    }
  };

  const getComplianceColor = (compliance: string) => {
    if (shouldScramble) return Theme.colors.textDim;
    if (['A', 'B'].includes(compliance)) return Theme.colors.accentApprove;
    if (['C', 'D'].includes(compliance)) return Theme.colors.accentWarn;
    if (['E', 'F'].includes(compliance)) return Theme.colors.accentDeny;
    return Theme.colors.textPrimary;
  };

  const renderRow = (label: string, value: string | number, valueStyle?: any, delay: number = 0) => (
    <View style={styles.row}>
      <TypewriterText text={label} active={hudStage !== 'none'} delay={delay} style={styles.label} />
      <ScrambleText 
        text={value.toString()} 
        active={hudStage !== 'none'} 
        keepScrambling={false} 
        delay={delay + 200} 
        style={[styles.value, valueStyle]}
      />
    </View>
  );

  return (
    <HUDBox hudStage={hudStage} style={styles.container} buildDelay={BUILD_SEQUENCE.subjectIntel}>
      <View style={{ flex: 1 }}>
        <View style={styles.headerRow}>
          <Text style={styles.subjectNo}>SUBJECT {index + 1}</Text>
        </View>
     
        <View style={{ height: 1 }} />
        {renderRow('NAME', data.name, {}, BUILD_SEQUENCE.subjectIntel + 0)}
        {renderRow('ID', data.id, {}, BUILD_SEQUENCE.subjectIntel + 100)}
        {renderRow('SECTOR', data.sector, {}, BUILD_SEQUENCE.subjectIntel + 200)}
        {renderRow('FUNCTION', data.function, {}, BUILD_SEQUENCE.subjectIntel + 300)}
        
        {renderRow('COMPLIANCE', data.compliance, { color: getComplianceColor(data.compliance) }, BUILD_SEQUENCE.subjectIntel + 400)}
        {renderRow('STATUS', data.status, { color: getStatusColor(data.status) }, BUILD_SEQUENCE.subjectIntel + 500)}
        {renderRow('INCIDENTS', data.incidents, { color: data.incidents > 0 ? Theme.colors.accentWarn : Theme.colors.textPrimary }, BUILD_SEQUENCE.subjectIntel + 600)}
        
        <View style={styles.arrestRow}>
          <TypewriterText text="WARRANTS" active={hudStage !== 'none'} delay={BUILD_SEQUENCE.subjectIntel + 700} style={styles.label} />
          <ScrambleText 
            text={data.warrants} 
            active={hudStage !== 'none'} 
            keepScrambling={false} 
            delay={BUILD_SEQUENCE.subjectIntel + 900} 
            style={[styles.value, data.warrants !== 'NONE' && styles.warningText]}
          />
        </View>
        
        <View style={styles.bentoContainer}>
          <View style={styles.reasonSection}>
            <View style={{ flexDirection: 'row' }}>
              <TypewriterText text="REQUESTING: " active={hudStage !== 'none'} delay={BUILD_SEQUENCE.subjectIntel + 800} style={styles.reasonLabel} />
              <ScrambleText 
                text={data.requestedSector} 
                active={hudStage !== 'none'} 
                keepScrambling={false} 
                delay={BUILD_SEQUENCE.subjectIntel + 1000} 
                style={styles.requestedSectorHighlight}
              />
            </View>
            <ScrambleText 
              text={data.reasonForVisit} 
              active={hudStage !== 'none'} 
              keepScrambling={false} 
              delay={BUILD_SEQUENCE.subjectIntel + 1100} 
              style={styles.reasonValue}
            />
          </View>

          <Animated.View style={{ opacity: flickerAnim }}>
            <TouchableOpacity style={styles.verifyRevealButton} onPress={onRevealVerify} disabled={shouldScramble}>
              <Text style={styles.verifyButtonText}>VERIFICATION</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>

        <DigitalStatusLine 
          id={data.id} 
          hasDecision={!!hasDecision} 
          decisionType={decisionType} 
          active={hudStage === 'full'}
        />
      </View>
    </HUDBox>
  );
};

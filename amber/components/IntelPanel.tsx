import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { styles } from '../styles/IntelPanel.styles';
import { SubjectData } from '../data/subjects';
import { HUDBox, DrawingBorder } from './HUDBox';
import { Theme } from '../constants/theme';
import { ScrambleText, TypewriterText } from './ScanData';
import { BUILD_SEQUENCE } from '../constants/animations';

export const IntelPanel = ({ 
  data, 
  index,
  hudStage, 
  onRevealVerify
}: { 
  data: SubjectData, 
  index: number,
  hudStage: 'none' | 'wireframe' | 'outline' | 'full',
  onRevealVerify: () => void
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
      </View>
    </HUDBox>
  );
};

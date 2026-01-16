import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { styles } from '../styles/IntelPanel.styles';
import { SubjectData, Outcome } from '../data/subjects';
import { Theme } from '../constants/theme';
import { HUDBox } from './HUDBox';

export const IntelPanel = ({ 
  data, 
  hudStage, 
  onRevealVerify,
  outcome,
  onNext
}: { 
  data: SubjectData, 
  hudStage: 'none' | 'wireframe' | 'outline' | 'full',
  onRevealVerify: () => void,
  outcome: { type: 'APPROVE' | 'DENY', outcome: Outcome } | null,
  onNext: () => void
}) => {
  const renderRow = (label: string, value: string | number) => (
    <View style={styles.row}>
      <Text style={styles.label}>{label.padEnd(15, ' ')}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );

  return (
    <HUDBox hudStage={hudStage} style={styles.container}>
      <View style={{ flex: 1 }}>
        {renderRow('NAME', data.name)}
        {renderRow('ID', data.id)}
        {renderRow('SECTOR', data.sector)}
        {renderRow('FUNCTION', data.function)}
        
        <View style={{ height: 1 }} />

        {renderRow('COMPLIANCE', data.compliance)}
        {renderRow('STATUS', data.status)}
        {renderRow('INCIDENTS', data.incidents)}
        
        <View style={styles.arrestRow}>
          <Text style={styles.label}>{'WARRANTS'.padEnd(15, ' ')}</Text>
          <Text style={[styles.value, data.warrants !== 'NONE' && styles.warningText]}>
            {data.warrants}
          </Text>
        </View>
        
        <View style={styles.bentoContainer}>
          <View style={styles.reasonSection}>
            <Text style={styles.reasonLabel}>REQUESTING: {data.requestedSector}</Text>
            <Text style={styles.reasonValue}>"{data.reasonForVisit}"</Text>
          </View>

          <TouchableOpacity style={styles.verifyRevealButton} onPress={onRevealVerify}>
            <Text style={styles.verifyButtonText}>[ REVEAL ]{'\n'}VERIFICATION</Text>
          </TouchableOpacity>
        </View>
      </View>

      {outcome && (
        <View style={[StyleSheet.absoluteFill, { 
          backgroundColor: 'rgba(10, 12, 15, 0.95)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20,
          zIndex: 100,
        }]}>
          <Text style={{ 
            color: outcome.type === 'APPROVE' ? Theme.colors.accentApprove : Theme.colors.accentDeny, 
            fontSize: 20, 
            fontFamily: Theme.fonts.mono,
            marginBottom: 10,
            textAlign: 'center'
          }}>
            {outcome.outcome.feedback}
          </Text>
          <Text style={{ 
            color: Theme.colors.textPrimary, 
            fontSize: 12, 
            fontFamily: Theme.fonts.mono,
            textAlign: 'center',
            marginBottom: 20,
            lineHeight: 18
          }}>
            CONSEQUENCE: {outcome.outcome.consequence}
          </Text>
          <TouchableOpacity 
            onPress={onNext}
            style={{
              borderWidth: 1,
              borderColor: Theme.colors.accentWarn,
              paddingHorizontal: 20,
              paddingVertical: 8,
              backgroundColor: 'rgba(201, 162, 39, 0.1)'
            }}
          >
            <Text style={{ color: Theme.colors.accentWarn, fontFamily: Theme.fonts.mono, fontSize: 12 }}>[ NEXT SUBJECT ]</Text>
          </TouchableOpacity>
        </View>
      )}
    </HUDBox>
  );
};

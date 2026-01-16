import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from '../styles/IntelPanel.styles';
import { SubjectData } from '../data/subjects';
import { HUDBox } from './HUDBox';

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
  const renderRow = (label: string, value: string | number) => (
    <View style={styles.row}>
      <Text style={styles.label}>{label.padEnd(15, ' ')}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );

  return (
    <HUDBox hudStage={hudStage} style={styles.container}>
      <View style={{ flex: 1 }}>
        <View style={styles.headerRow}>
          <Text style={styles.subjectNo}>SUBJECT {index + 1}</Text>
        </View>
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
    </HUDBox>
  );
};

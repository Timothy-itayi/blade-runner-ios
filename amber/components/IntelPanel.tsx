import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from '../styles/IntelPanel.styles';
import { SubjectData } from '../data/subjects';
import { HUDBox } from './HUDBox';
import { Theme } from '../constants/theme';

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
  const getStatusColor = (status: string) => {
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
    if (['A', 'B'].includes(compliance)) return Theme.colors.accentApprove;
    if (['C', 'D'].includes(compliance)) return Theme.colors.accentWarn;
    if (['E', 'F'].includes(compliance)) return Theme.colors.accentDeny;
    return Theme.colors.textPrimary;
  };

  const renderRow = (label: string, value: string | number, valueStyle?: any) => (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, valueStyle]}>{value}</Text>
    </View>
  );

  return (
    <HUDBox hudStage={hudStage} style={styles.container}>
      <View style={{ flex: 1 }}>
        <View style={styles.headerRow}>
          <Text style={styles.subjectNo}>SUBJECT {index + 1}</Text>
        </View>
     
        <View style={{ height: 1 }} />
        {renderRow('NAME', data.name)}
        {renderRow('ID', data.id)}
        {renderRow('SECTOR', data.sector)}
        {renderRow('FUNCTION', data.function)}
        
        {renderRow('COMPLIANCE', data.compliance, { color: getComplianceColor(data.compliance) })}
        {renderRow('STATUS', data.status, { color: getStatusColor(data.status) })}
        {renderRow('INCIDENTS', data.incidents, { color: data.incidents > 0 ? Theme.colors.accentWarn : Theme.colors.textPrimary })}
        
        <View style={styles.arrestRow}>
          <Text style={styles.label}>WARRANTS</Text>
          <Text style={[styles.value, data.warrants !== 'NONE' && styles.warningText]}>
            {data.warrants}
          </Text>
        </View>
        
        <View style={styles.bentoContainer}>
          <View style={styles.reasonSection}>
            <Text style={styles.reasonLabel}>
              REQUESTING: <Text style={styles.requestedSectorHighlight}>{data.requestedSector}</Text>
            </Text>
            <Text style={styles.reasonValue}>"{data.reasonForVisit}"</Text>
          </View>

          <TouchableOpacity style={styles.verifyRevealButton} onPress={onRevealVerify}>
            <Text style={styles.verifyButtonText}>VERIFICATION</Text>
          </TouchableOpacity>
        </View>
      </View>
    </HUDBox>
  );
};

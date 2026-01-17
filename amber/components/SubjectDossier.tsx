import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Animated, ScrollView, StyleSheet } from 'react-native';
import { SubjectData } from '../data/subjects';
import { HUDBox } from './HUDBox';
import { Theme } from '../constants/theme';
import { ScrambleText, TypewriterText } from './ScanData';
import { BUILD_SEQUENCE } from '../constants/animations';

export const SubjectDossier = ({ 
  data, 
  index,
  activeDirective,
  onClose
}: { 
  data: SubjectData, 
  index: number,
  activeDirective?: string | null,
  onClose: () => void
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
    <View style={styles.overlay}>
      <HUDBox hudStage="full" style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.subjectNo}>DOSSIER: SUBJECT {index + 1}</Text>
        </View>

        <ScrollView style={styles.scroll}>
          {activeDirective && (
            <View style={styles.directiveSection}>
              <Text style={styles.directiveLabel}>CURRENT STANDING DIRECTIVE:</Text>
              <Text style={styles.directiveValue}>{activeDirective}</Text>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>IDENTIFICATION</Text>
            {renderRow('NAME', data.name)}
            {renderRow('ID', data.id)}
            {renderRow('SECTOR', data.sector)}
            {renderRow('FUNCTION', data.function)}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>STATUS & COMPLIANCE</Text>
            {renderRow('COMPLIANCE', data.compliance, { color: getComplianceColor(data.compliance) })}
            {renderRow('STATUS', data.status, { color: getStatusColor(data.status) })}
            {renderRow('INCIDENTS', data.incidents, { color: data.incidents > 0 ? Theme.colors.accentWarn : Theme.colors.textPrimary })}
            {renderRow('WARRANTS', data.warrants, data.warrants !== 'NONE' && { color: Theme.colors.accentDeny })}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>REQUEST DETAILS</Text>
            <View style={styles.reasonBox}>
              <Text style={styles.reasonLabel}>REQUESTING ACCESS TO:</Text>
              <Text style={styles.requestedSector}>{data.requestedSector}</Text>
              <Text style={styles.reasonLabel}>REASON:</Text>
              <Text style={styles.reasonValue}>{data.reasonForVisit}</Text>
            </View>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>LOCATION RECORD</Text>
            {renderRow('LAST ADDR', data.locRecord.addr)}
            {renderRow('TIMESTAMP', data.locRecord.time)}
            {renderRow('PREV LOC', data.locRecord.pl)}
            {renderRow('D.O.B', data.locRecord.dob)}
          </View>
        </ScrollView>

        <TouchableOpacity onPress={onClose} style={styles.footer}>
          <Text style={styles.closeButton}>[ CLOSE FILE ]</Text>
        </TouchableOpacity>
      </HUDBox>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 12, 15, 0.95)',
    zIndex: 2000,
    padding: 20,
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: Theme.colors.bgPanel,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
    paddingBottom: 10,
  },
  subjectNo: {
    color: Theme.colors.accentWarn,
    fontFamily: Theme.fonts.mono,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 2,
  },
  footer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(212, 83, 74, 0.2)',
    alignItems: 'center',
  },
  closeButton: {
    color: Theme.colors.accentDeny,
    fontFamily: Theme.fonts.mono,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
  },
  scroll: {
    flex: 1,
  },
  directiveSection: {
    backgroundColor: 'rgba(212, 83, 74, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(212, 83, 74, 0.3)',
    padding: 12,
    marginBottom: 20,
  },
  directiveLabel: {
    color: Theme.colors.accentDeny,
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 4,
  },
  directiveValue: {
    color: Theme.colors.accentDeny,
    fontFamily: Theme.fonts.mono,
    fontSize: 14,
    fontWeight: '700',
  },
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    color: Theme.colors.textSecondary,
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: 1,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(74, 106, 122, 0.2)',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  label: {
    color: Theme.colors.textDim,
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
  },
  value: {
    color: Theme.colors.textPrimary,
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
    fontWeight: '700',
  },
  reasonBox: {
    backgroundColor: 'rgba(127, 184, 216, 0.05)',
    padding: 10,
    borderLeftWidth: 2,
    borderLeftColor: Theme.colors.textSecondary,
  },
  reasonLabel: {
    color: Theme.colors.textDim,
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    marginBottom: 2,
  },
  requestedSector: {
    color: Theme.colors.accentWarn,
    fontFamily: Theme.fonts.mono,
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 8,
  },
  reasonValue: {
    color: Theme.colors.textPrimary,
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
    fontStyle: 'italic',
  },
});

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { styles } from '../styles/VerificationDrawer.styles';
import { SubjectData } from '../data/subjects';
import { Theme } from '@/constants/theme';

interface VerificationDrawerProps {
  subject: SubjectData;
  onClose: () => void;
}

const ResultContainer = ({ title, children, status }: { title: string, children: React.ReactNode, status?: string }) => {
  const getBorderColor = () => {
    switch (status?.toUpperCase()) {
      case 'AUTHORIZED':
      case 'VERIFIED':
      case 'CLEARED':
        return Theme.colors.accentApprove;
      case 'FLAGGED':
      case 'REVIEW REQUIRED':
      case 'PENDING':
        return Theme.colors.accentWarn;
      case 'RESTRICTED':
      case 'EXPIRED':
      case 'INVALID':
        return Theme.colors.accentDeny;
      default:
        return Theme.colors.textPrimary;
    }
  };

  return (
    <View style={[styles.resultContainer, { borderColor: getBorderColor(), borderLeftWidth: 4 }]}>
      <Text style={[styles.resultTitle, { color: getBorderColor() }]}>{title}</Text>
      {children}
    </View>
  );
};

export const VerificationDrawer = ({ subject, onClose }: VerificationDrawerProps) => {
  const [activeCheck, setActiveCheck] = useState<string | null>(null);

  const renderCheckResult = () => {
    switch (activeCheck) {
      case 'SECTOR':
        const { sectorAuth } = subject.authData;
        return (
          <ResultContainer title="SECTOR AUTHORIZATION" status={sectorAuth.status}>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Target:</Text>
              <Text style={styles.resultValue}>{sectorAuth.requested}</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Status:</Text>
              <Text style={[styles.resultValue, styles[sectorAuth.status.toLowerCase() as keyof typeof styles]]}>
                {sectorAuth.status.toUpperCase()}
              </Text>
            </View>
            <Text style={[styles.statusText, styles[sectorAuth.status.toLowerCase() as keyof typeof styles]]}>
              {sectorAuth.message.toUpperCase()}
            </Text>
          </ResultContainer>
        );
      case 'FUNCTION':
        const { functionReg } = subject.authData;
        return (
          <ResultContainer title="FUNCTION REGISTRATION" status={functionReg.status}>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Designation:</Text>
              <Text style={styles.resultValue}>{subject.function}</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Status:</Text>
              <Text style={[styles.resultValue, styles[functionReg.status.toLowerCase() as keyof typeof styles]]}>
                {functionReg.status.toUpperCase()}
              </Text>
            </View>
            <Text style={[styles.statusText, styles[functionReg.status.toLowerCase() as keyof typeof styles]]}>
              {functionReg.message.toUpperCase()}
            </Text>
          </ResultContainer>
        );
      case 'WARRANT':
        const hasWarrants = subject.warrants !== 'NONE';
        const warrantStatus = hasWarrants ? 'RESTRICTED' : 'AUTHORIZED';
        return (
          <ResultContainer title="CRIMINAL RECORD CHECK" status={warrantStatus}>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Warrants:</Text>
              <Text style={[styles.resultValue, hasWarrants ? styles.restricted : styles.authorized]}>
                {subject.warrants}
              </Text>
            </View>
            <Text style={[styles.statusText, hasWarrants ? styles.restricted : styles.authorized]}>
              {hasWarrants ? 'OPERATOR ACTION REQUIRED: DETENTION RECOMMENDED.' : 'NO ACTIVE WARRANTS DETECTED IN DATABASE.'}
            </Text>
          </ResultContainer>
        );
      case 'MEDICAL':
        return (
          <ResultContainer title="BIOMETRIC HEALTH SCAN" status="AUTHORIZED">
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>BPM:</Text>
              <Text style={styles.resultValue}>{subject.bpm} (NORMAL)</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Vitals:</Text>
              <Text style={styles.resultValue}>STABLE</Text>
            </View>
            <Text style={styles.statusText}>ALL BIOMETRIC MARKERS WITHIN ACCEPTABLE PARAMETERS.</Text>
          </ResultContainer>
        );
      default:
        return (
          <View style={styles.buttonGrid}>
            <TouchableOpacity style={styles.verifyButton} onPress={() => setActiveCheck('SECTOR')}>
              <Text style={styles.buttonText}>[ SECTOR AUTH ]</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.verifyButton} onPress={() => setActiveCheck('FUNCTION')}>
              <Text style={styles.buttonText}>[ FUNCTION REG ]</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.verifyButton} onPress={() => setActiveCheck('WARRANT')}>
              <Text style={styles.buttonText}>[ WARRANT CHECK ]</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.verifyButton} onPress={() => setActiveCheck('MEDICAL')}>
              <Text style={styles.buttonText}>[ BIOMETRIC SCAN ]</Text>
            </TouchableOpacity>
          </View>
        );
    }
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.header}>VERIFY AGAINST:</Text>
          {activeCheck && (
            <TouchableOpacity onPress={() => setActiveCheck(null)}>
              <Text style={styles.backButtonText}>[ BACK ]</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {renderCheckResult()}

        {!activeCheck && (
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeText}>[ CLOSE DRAWER ]</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

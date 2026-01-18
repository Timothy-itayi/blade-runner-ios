import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { styles } from '../styles/VerificationDrawer.styles';
import { SubjectData } from '../data/subjects';
import { Theme } from '@/constants/theme';

interface VerificationDrawerProps {
  subject: SubjectData;
  onClose: () => void;
  onQueryPerformed?: (queryType: 'WARRANT' | 'TRANSIT' | 'INCIDENT' | 'DIALOGUE') => void;
}

const ResultContainer = ({ title, children, status }: { title: string, children: React.ReactNode, status?: string }) => {
  const getBorderColor = () => {
    switch (status?.toUpperCase()) {
      case 'CLEAR':
      case 'NONE':
      case 'NEUTRAL':
      case 'COOPERATIVE':
        return Theme.colors.accentApprove;
      case 'FLAGGED':
      case 'WARNING':
      case 'NERVOUS':
      case 'EVASIVE':
        return Theme.colors.accentWarn;
      case 'ACTIVE':
      case 'RESTRICTED':
      case 'AGITATED':
        return Theme.colors.accentDeny;
      default:
        return Theme.colors.textSecondary;
    }
  };

  return (
    <View style={[styles.resultContainer, { borderColor: getBorderColor(), borderLeftWidth: 4 }]}>
      <Text style={[styles.resultTitle, { color: getBorderColor() }]}>{title}</Text>
      {children}
    </View>
  );
};

export const VerificationDrawer = ({ subject, onClose, onQueryPerformed }: VerificationDrawerProps) => {
  const [activeCheck, setActiveCheck] = useState<string | null>(null);
  const [queriesPerformed, setQueriesPerformed] = useState<Set<string>>(new Set());

  const handleSelectCheck = (check: 'WARRANT' | 'TRANSIT' | 'INCIDENT' | 'DIALOGUE') => {
    setActiveCheck(check);
    if (!queriesPerformed.has(check)) {
      setQueriesPerformed(prev => new Set(prev).add(check));
      onQueryPerformed?.(check);
    }
  };

  const renderCheckResult = () => {
    switch (activeCheck) {
      case 'WARRANT':
        const hasWarrants = subject.warrants !== 'NONE';
        const warrantStatus = hasWarrants ? 'ACTIVE' : 'CLEAR';
        return (
          <ResultContainer title="CRIMINAL RECORD CHECK" status={warrantStatus}>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Warrants:</Text>
              <Text style={[styles.resultValue, hasWarrants ? styles.restricted : styles.authorized]}>
                {subject.warrants}
              </Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Incidents:</Text>
              <Text style={[styles.resultValue, subject.incidents > 0 ? styles.flagged : styles.authorized]}>
                {subject.incidents}
              </Text>
            </View>
            <Text style={[styles.statusText, hasWarrants ? styles.restricted : styles.authorized]}>
              {hasWarrants 
                ? '✗ ACTIVE WARRANT DETECTED. DETENTION RECOMMENDED.' 
                : '○ NO ACTIVE WARRANTS IN DATABASE.'}
            </Text>
          </ResultContainer>
        );

      case 'TRANSIT':
        const transitLog = subject.transitLog || [];
        const hasFlaggedTransit = transitLog.some(t => t.flagged);
        return (
          <ResultContainer title="RECENT TRANSIT HISTORY" status={hasFlaggedTransit ? 'FLAGGED' : 'CLEAR'}>
            {transitLog.length > 0 ? (
              <ScrollView style={{ maxHeight: 120 }}>
                {transitLog.map((entry, i) => (
                  <View key={i} style={styles.resultRow}>
                    <Text style={styles.resultLabel}>{entry.date}</Text>
                    <Text style={[styles.resultValue, entry.flagged && styles.flagged]}>
                      {entry.from} → {entry.to} {entry.flagged && '⚠'}
                    </Text>
                  </View>
                ))}
                {hasFlaggedTransit && transitLog.find(t => t.flagged)?.flagNote && (
                  <Text style={[styles.statusText, styles.flagged]}>
                    ⚠ {transitLog.find(t => t.flagged)?.flagNote}
                  </Text>
                )}
              </ScrollView>
            ) : (
              <Text style={styles.resultValue}>NO RECENT TRANSIT RECORDS.</Text>
            )}
            {!hasFlaggedTransit && transitLog.length > 0 && (
              <Text style={[styles.statusText, styles.authorized]}>
                ○ NO ANOMALIES DETECTED.
              </Text>
            )}
          </ResultContainer>
        );

      case 'INCIDENT':
        const incidentHistory = subject.incidentHistory || [];
        return (
          <ResultContainer title="INCIDENT LOG" status={incidentHistory.length > 0 ? 'WARNING' : 'CLEAR'}>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Total:</Text>
              <Text style={[styles.resultValue, incidentHistory.length > 0 ? styles.flagged : styles.authorized]}>
                {incidentHistory.length} INCIDENT{incidentHistory.length !== 1 ? 'S' : ''} ON FILE
              </Text>
            </View>
            {incidentHistory.length > 0 ? (
              <ScrollView style={{ maxHeight: 100, marginTop: 8 }}>
                {incidentHistory.map((entry, i) => (
                  <View key={i} style={styles.incidentEntry}>
                    <Text style={styles.incidentHeader}>#{i + 1} - {entry.date}</Text>
                    <Text style={styles.incidentDetail}>Type: {entry.type}</Text>
                    <Text style={styles.incidentDetail}>Location: {entry.location}</Text>
                    <Text style={styles.incidentDetail}>Resolution: {entry.resolution}</Text>
                  </View>
                ))}
              </ScrollView>
            ) : (
              <Text style={[styles.statusText, styles.authorized]}>
                ○ NO PRIOR INCIDENTS ON RECORD.
              </Text>
            )}
          </ResultContainer>
        );

      case 'DIALOGUE':
        const dialogueFlags = subject.dialogueFlags || [];
        const tone = subject.toneClassification || 'NEUTRAL';
        const hasFlags = dialogueFlags.length > 0;
        return (
          <ResultContainer title="DIALOGUE ANALYSIS" status={hasFlags ? 'FLAGGED' : tone}>
            <View style={styles.dialogueBox}>
              <Text style={styles.dialogueQuote}>"{subject.dialogue || 'No dialogue recorded.'}"</Text>
            </View>
            
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Tone:</Text>
              <Text style={[
                styles.resultValue, 
                tone === 'AGITATED' ? styles.restricted : 
                tone === 'NERVOUS' || tone === 'EVASIVE' ? styles.flagged : 
                styles.authorized
              ]}>
                {tone}
              </Text>
            </View>

            <Text style={styles.flagHeader}>FLAGGED KEYWORDS:</Text>
            {hasFlags ? (
              dialogueFlags.map((flag, i) => (
                <View key={i} style={styles.flagRow}>
                  <Text style={styles.flagIcon}>⚠</Text>
                  <Text style={styles.flagKeyword}>"{flag.keyword}"</Text>
                  <Text style={styles.flagCategory}> - {flag.category}</Text>
                </View>
              ))
            ) : (
              <Text style={[styles.resultValue, styles.authorized]}>○ NONE DETECTED</Text>
            )}
          </ResultContainer>
        );

      default:
        return (
          <View style={styles.buttonGrid}>
            <TouchableOpacity 
              style={[styles.verifyButton, queriesPerformed.has('WARRANT') && styles.queryComplete]} 
              onPress={() => handleSelectCheck('WARRANT')}
            >
              <Text style={[styles.buttonText, queriesPerformed.has('WARRANT') && styles.queryCompleteText]}>
                {queriesPerformed.has('WARRANT') ? '● ' : '○ '}WARRANT CHECK
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.verifyButton, queriesPerformed.has('TRANSIT') && styles.queryComplete]} 
              onPress={() => handleSelectCheck('TRANSIT')}
            >
              <Text style={[styles.buttonText, queriesPerformed.has('TRANSIT') && styles.queryCompleteText]}>
                {queriesPerformed.has('TRANSIT') ? '● ' : '○ '}TRANSIT LOG
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.verifyButton, queriesPerformed.has('INCIDENT') && styles.queryComplete]} 
              onPress={() => handleSelectCheck('INCIDENT')}
            >
              <Text style={[styles.buttonText, queriesPerformed.has('INCIDENT') && styles.queryCompleteText]}>
                {queriesPerformed.has('INCIDENT') ? '● ' : '○ '}INCIDENT HISTORY
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.verifyButton, queriesPerformed.has('DIALOGUE') && styles.queryComplete]} 
              onPress={() => handleSelectCheck('DIALOGUE')}
            >
              <Text style={[styles.buttonText, queriesPerformed.has('DIALOGUE') && styles.queryCompleteText]}>
                {queriesPerformed.has('DIALOGUE') ? '● ' : '○ '}DIALOGUE ANALYSIS
              </Text>
            </TouchableOpacity>
          </View>
        );
    }
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.header}>DATABASE QUERY</Text>
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

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet, ScrollView } from 'react-native';
import { HUDBox } from '../ui/HUDBox';
import { Theme } from '../../constants/theme';
import { SubjectData } from '../../data/subjects';
import {
  getSubjectCredentials,
  getCredentialTypeName,
  getExpirationStatus,
  CredentialDetails,
  SubjectCredential,
} from '../../data/credentialTypes';
import {
  getSubjectGreeting,
  CredentialBehavior,
  CREDENTIAL_BEHAVIOR_DESCRIPTIONS,
} from '../../data/subjectGreetings';

interface CredentialViewerProps {
  visible: boolean;
  subject: SubjectData;
  onComplete: () => void;
  onCredentialExamined: (hasAnomalies: boolean) => void;
}

// Visual styling for credential behaviors
const BEHAVIOR_STYLES: Record<CredentialBehavior, { color: string; bgColor: string }> = {
  COOPERATIVE: { color: Theme.colors.accentApprove, bgColor: 'rgba(74, 138, 90, 0.1)' },
  RELUCTANT: { color: Theme.colors.accentWarn, bgColor: 'rgba(201, 162, 39, 0.1)' },
  MISSING: { color: Theme.colors.accentDeny, bgColor: 'rgba(212, 83, 74, 0.1)' },
  FORGED: { color: Theme.colors.accentDeny, bgColor: 'rgba(212, 83, 74, 0.15)' },
  MULTIPLE: { color: Theme.colors.accentWarn, bgColor: 'rgba(201, 162, 39, 0.15)' },
  NONE: { color: Theme.colors.textDim, bgColor: 'rgba(58, 90, 106, 0.1)' },
};

export const CredentialViewer = ({
  visible,
  subject,
  onComplete,
  onCredentialExamined,
}: CredentialViewerProps) => {
  const [isPresenting, setIsPresenting] = useState(true);
  const [selectedCredential, setSelectedCredential] = useState<number | null>(null);
  const [examineComplete, setExamineComplete] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const greetingData = getSubjectGreeting(subject.id, subject);
  const credentialData = getSubjectCredentials(subject.id, subject);
  const behavior = greetingData?.credentialBehavior || 'COOPERATIVE';
  const isForged = behavior === 'FORGED';
  const behaviorStyle = BEHAVIOR_STYLES[behavior];
  const presentationDelay = credentialData?.presentationDelay || 0;

  useEffect(() => {
    if (visible) {
      setIsPresenting(true);
      setSelectedCredential(null);
      setExamineComplete(false);

      // Fade in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Simulate presentation delay based on behavior
      const delay = behavior === 'NONE' ? 500 : (presentationDelay * 1000) + 500;
      setTimeout(() => {
        setIsPresenting(false);
      }, delay);
    }
  }, [visible, subject.id]);

  const handleExamineCredential = (index: number) => {
    setSelectedCredential(index);
  };

  const handleCloseDetail = () => {
    setSelectedCredential(null);
  };

  const handleProceed = () => {
    const hasAnomalies = credentialData?.credentials.some(c => c.anomalies.length > 0) || false;
    onCredentialExamined(hasAnomalies);
    onComplete();
  };

  const handleSkipExamination = () => {
    setExamineComplete(true);
    onCredentialExamined(false); // Didn't check for anomalies
    onComplete();
  };

  if (!visible) return null;

  const credentials = credentialData?.credentials || [];

  return (
    <Animated.View
      style={[
        styles.overlay,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      <HUDBox hudStage="full" style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>CREDENTIAL VERIFICATION</Text>
          <View style={[styles.behaviorIndicator, { backgroundColor: behaviorStyle.bgColor }]}>
            <Text style={[styles.behaviorLabel, { color: behaviorStyle.color }]}>
              {CREDENTIAL_BEHAVIOR_DESCRIPTIONS[behavior]}
            </Text>
          </View>
        </View>

        {/* Subject Info */}
        <View style={styles.subjectInfo}>
          <Text style={styles.subjectName}>{subject.name}</Text>
          <Text style={styles.subjectOrigin}>
            {subject.originPlanet} | {subject.reasonForVisit}
          </Text>
        </View>

        {/* Presentation Phase */}
        {isPresenting && (
          <View style={styles.presentingContainer}>
            <Text style={styles.presentingText}>
              {behavior === 'NONE'
                ? 'SUBJECT REFUSES TO PRESENT CREDENTIALS'
                : behavior === 'MISSING'
                ? 'SUBJECT SEARCHING FOR CREDENTIALS...'
                : behavior === 'RELUCTANT'
                ? 'SUBJECT HESITATING...'
                : 'SUBJECT PRESENTING CREDENTIALS...'}
            </Text>
            {credentialData?.excuseIfMissing && (behavior === 'RELUCTANT' || behavior === 'MISSING') && (
              <Text style={styles.excuseText}>
                "{credentialData.excuseIfMissing}"
              </Text>
            )}
          </View>
        )}

        {/* Credentials List */}
        {!isPresenting && selectedCredential === null && (
          <View style={styles.credentialsList}>
            {behavior === 'NONE' ? (
              <View style={styles.noCredentials}>
                <Text style={styles.noCredentialsText}>NO CREDENTIALS PRESENTED</Text>
                <Text style={styles.noCredentialsNote}>
                  Subject refuses to provide documentation.
                  Proceed with investigation using alternative methods.
                </Text>
              </View>
            ) : credentials.length === 0 ? (
              <View style={styles.noCredentials}>
                <Text style={styles.noCredentialsText}>CREDENTIALS NOT FOUND</Text>
              </View>
            ) : (
              <>
                <Text style={styles.sectionLabel}>
                  PRESENTED DOCUMENTS ({credentials.length})
                </Text>
                <ScrollView style={styles.credentialScroll}>
                  {credentials.map((cred, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.credentialCard,
                        cred.anomalies.length > 0 && styles.credentialCardAnomaly,
                        isForged && styles.credentialCardForged,
                      ]}
                      onPress={() => handleExamineCredential(index)}
                    >
                      <View style={styles.credentialCardHeader}>
                        <Text style={[styles.credentialType, isForged && styles.credentialTextForged]}>
                          {getCredentialTypeName(cred.type)}
                        </Text>
                        {cred.anomalies.length > 0 && (
                          <View style={styles.anomalyBadge}>
                            <Text style={styles.anomalyBadgeText}>!</Text>
                          </View>
                        )}
                      </View>
                      <Text style={[styles.credentialNumber, isForged && styles.credentialTextForged]}>
                        {cred.number}
                      </Text>
                      <View style={styles.credentialMeta}>
                        <Text style={[styles.credentialMetaText, isForged && styles.credentialTextForged]}>
                          ISSUED: {cred.issuedBy}
                        </Text>
                        <Text
                          style={[
                            styles.credentialStatus,
                            getExpirationStatus(cred.expirationDate) === 'EXPIRED' &&
                              styles.statusExpired,
                            getExpirationStatus(cred.expirationDate) === 'EXPIRING_SOON' &&
                              styles.statusExpiring,
                          ]}
                        >
                          {getExpirationStatus(cred.expirationDate)}
                        </Text>
                      </View>
                      <Text style={styles.examineHint}>[ TAP TO EXAMINE ]</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* Suspicious Details Warning */}
                {credentialData?.suspiciousDetails && credentialData.suspiciousDetails.length > 0 && (
                  <View style={styles.suspiciousSection}>
                    <Text style={styles.suspiciousLabel}>SYSTEM FLAGS:</Text>
                    {credentialData.suspiciousDetails.map((detail, i) => (
                      <Text key={i} style={styles.suspiciousItem}>
                        - {detail}
                      </Text>
                    ))}
                  </View>
                )}
              </>
            )}
          </View>
        )}

        {/* Credential Detail View */}
        {!isPresenting && selectedCredential !== null && credentials[selectedCredential] && (
          <CredentialDetailView
            credential={credentials[selectedCredential]}
            onClose={handleCloseDetail}
          />
        )}

        {/* Actions */}
        {!isPresenting && selectedCredential === null && (
          <View style={styles.actions}>
            <TouchableOpacity style={styles.skipButton} onPress={handleSkipExamination}>
              <Text style={styles.skipButtonText}>[ SKIP EXAMINATION ]</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.proceedButton} onPress={handleProceed}>
              <Text style={styles.proceedButtonText}>[ PROCEED TO INVESTIGATION ]</Text>
            </TouchableOpacity>
          </View>
        )}
      </HUDBox>
    </Animated.View>
  );
};

// Credential Detail Sub-component
interface CredentialDetailViewProps {
  credential: CredentialDetails;
  onClose: () => void;
}

const CredentialDetailView = ({ credential, onClose }: CredentialDetailViewProps) => {
  const expirationStatus = getExpirationStatus(credential.expirationDate);

  return (
    <View style={styles.detailContainer}>
      <View style={styles.detailHeader}>
        <Text style={styles.detailTitle}>{getCredentialTypeName(credential.type)}</Text>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.detailClose}>[ CLOSE ]</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.detailBody}>
        <DetailRow label="DOCUMENT NUMBER" value={credential.number} />
        <DetailRow label="HOLDER NAME" value={credential.holderName} />
        <DetailRow label="ORIGIN" value={credential.originPlanet} />
        <DetailRow label="DESTINATION" value={credential.destinationPlanet} />
        <DetailRow label="PURPOSE" value={credential.purpose} />
        <DetailRow label="ISSUED BY" value={credential.issuedBy} />
        <DetailRow label="ISSUE DATE" value={credential.issuedDate} />
        <DetailRow
          label="EXPIRATION"
          value={credential.expirationDate}
          highlight={expirationStatus !== 'VALID'}
          highlightColor={expirationStatus === 'EXPIRED' ? Theme.colors.accentDeny : Theme.colors.accentWarn}
        />
        <DetailRow
          label="STATUS"
          value={credential.valid ? 'VALID' : 'INVALID'}
          highlight={!credential.valid}
          highlightColor={Theme.colors.accentDeny}
        />

        {credential.anomalies.length > 0 && (
          <View style={styles.anomaliesSection}>
            <Text style={styles.anomaliesLabel}>DETECTED ANOMALIES:</Text>
            {credential.anomalies.map((anomaly, i) => (
              <Text key={i} style={styles.anomalyItem}>
                - {anomaly}
              </Text>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

// Detail Row Helper
interface DetailRowProps {
  label: string;
  value: string;
  highlight?: boolean;
  highlightColor?: string;
}

const DetailRow = ({ label, value, highlight, highlightColor }: DetailRowProps) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}:</Text>
    <Text
      style={[
        styles.detailValue,
        highlight && { color: highlightColor || Theme.colors.accentWarn },
      ]}
    >
      {value}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 12, 15, 0.95)',
    zIndex: 2000,
    padding: 20,
    justifyContent: 'center',
  },
  container: {
    padding: 20,
    backgroundColor: Theme.colors.bgPanel,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  headerTitle: {
    color: Theme.colors.textPrimary,
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
  },
  behaviorIndicator: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  behaviorLabel: {
    fontFamily: Theme.fonts.mono,
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 1,
  },
  subjectInfo: {
    marginBottom: 16,
  },
  subjectName: {
    color: Theme.colors.textPrimary,
    fontFamily: Theme.fonts.mono,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 2,
  },
  subjectOrigin: {
    color: Theme.colors.textSecondary,
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    letterSpacing: 1,
  },
  presentingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  presentingText: {
    color: Theme.colors.textPrimary,
    fontFamily: Theme.fonts.mono,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 2,
    marginBottom: 16,
  },
  excuseText: {
    color: Theme.colors.textSecondary,
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  credentialsList: {
    flex: 1,
  },
  sectionLabel: {
    color: Theme.colors.textSecondary,
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 12,
  },
  credentialScroll: {
    maxHeight: 200,
  },
  credentialCard: {
    backgroundColor: 'rgba(26, 42, 58, 0.3)',
    borderWidth: 1,
    borderColor: Theme.colors.border,
    padding: 12,
    marginBottom: 8,
  },
  credentialCardForged: {
    borderStyle: 'dashed',
    borderColor: 'rgba(212, 83, 74, 0.6)',
    backgroundColor: 'rgba(212, 83, 74, 0.08)',
  },
  credentialCardAnomaly: {
    borderColor: Theme.colors.accentWarn,
    backgroundColor: 'rgba(201, 162, 39, 0.05)',
  },
  credentialCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  credentialType: {
    color: Theme.colors.textPrimary,
    fontFamily: Theme.fonts.mono,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  credentialTextForged: {
    color: Theme.colors.textDim,
    letterSpacing: 0,
    fontStyle: 'italic',
  },
  anomalyBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Theme.colors.accentWarn,
    alignItems: 'center',
    justifyContent: 'center',
  },
  anomalyBadgeText: {
    color: Theme.colors.bgDark,
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
    fontWeight: '700',
  },
  credentialNumber: {
    color: Theme.colors.textSecondary,
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    letterSpacing: 1,
    marginBottom: 6,
  },
  credentialMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  credentialMetaText: {
    color: Theme.colors.textDim,
    fontFamily: Theme.fonts.mono,
    fontSize: 9,
    letterSpacing: 1,
  },
  credentialStatus: {
    color: Theme.colors.accentApprove,
    fontFamily: Theme.fonts.mono,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
  },
  statusExpired: {
    color: Theme.colors.accentDeny,
  },
  statusExpiring: {
    color: Theme.colors.accentWarn,
  },
  examineHint: {
    color: Theme.colors.textDim,
    fontFamily: Theme.fonts.mono,
    fontSize: 9,
    letterSpacing: 1,
    marginTop: 8,
    textAlign: 'center',
  },
  noCredentials: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  noCredentialsText: {
    color: Theme.colors.accentDeny,
    fontFamily: Theme.fonts.mono,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 8,
  },
  noCredentialsNote: {
    color: Theme.colors.textSecondary,
    fontFamily: Theme.fonts.mono,
    fontSize: 11,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 18,
  },
  suspiciousSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
  },
  suspiciousLabel: {
    color: Theme.colors.accentWarn,
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 6,
  },
  suspiciousItem: {
    color: Theme.colors.accentWarn,
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    letterSpacing: 0.5,
    marginBottom: 4,
    opacity: 0.9,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
  },
  skipButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(26, 42, 58, 0.5)',
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  skipButtonText: {
    color: Theme.colors.textSecondary,
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
  },
  proceedButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(74, 138, 90, 0.2)',
    borderWidth: 1,
    borderColor: Theme.colors.accentApprove,
  },
  proceedButtonText: {
    color: Theme.colors.accentApprove,
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  // Detail View Styles
  detailContainer: {
    flex: 1,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  detailTitle: {
    color: Theme.colors.textPrimary,
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  detailClose: {
    color: Theme.colors.textSecondary,
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
  },
  detailBody: {
    paddingVertical: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(26, 42, 58, 0.3)',
  },
  detailLabel: {
    color: Theme.colors.textSecondary,
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    letterSpacing: 1,
  },
  detailValue: {
    color: Theme.colors.textPrimary,
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
  },
  anomaliesSection: {
    marginTop: 16,
    padding: 12,
    backgroundColor: 'rgba(212, 83, 74, 0.1)',
    borderWidth: 1,
    borderColor: Theme.colors.accentDeny,
  },
  anomaliesLabel: {
    color: Theme.colors.accentDeny,
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8,
  },
  anomalyItem: {
    color: Theme.colors.accentDeny,
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
});

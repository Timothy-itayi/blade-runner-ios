import React, { useState, useEffect } from 'react';
import { View, Text, Modal, Pressable, StyleSheet, Animated } from 'react-native';
import { Theme } from '../constants/theme';
import { Credential } from '../data/subjects';

interface CredentialModalProps {
  visible: boolean;
  credential?: Credential;
  alreadyVerified?: boolean; // If true, show verified status immediately
  onClose: () => void;
  onVerify?: (result: 'CONFIRMED' | 'EXPIRED' | 'DENIED' | 'UNVERIFIED') => void;
}

export const CredentialModal = ({ visible, credential, alreadyVerified = false, onClose, onVerify }: CredentialModalProps) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationComplete, setVerificationComplete] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<string | null>(null);
  const [syncProgress] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      setIsVerifying(false);
      // If already verified externally, skip to verified state
      if (alreadyVerified && credential?.verifiedStatus) {
        setVerificationComplete(true);
        setCurrentStatus(credential.verifiedStatus);
      } else {
        setVerificationComplete(false);
        setCurrentStatus(credential?.initialStatus || 'NONE');
      }
      syncProgress.setValue(0);
    }
  }, [visible, credential, alreadyVerified]);

  const handleVerify = () => {
    if (!credential || isVerifying || verificationComplete) return;
    setIsVerifying(true);
    syncProgress.setValue(0);

    // Animate sync progress
    Animated.timing(syncProgress, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: false,
    }).start(() => {
      setIsVerifying(false);
      setVerificationComplete(true);
      const result = credential.verifiedStatus || 'CONFIRMED';
      setCurrentStatus(result);
      onVerify?.(result);
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return Theme.colors.accentApprove;
      case 'PENDING':
        return Theme.colors.accentWarn;
      case 'EXPIRED':
      case 'DENIED':
        return Theme.colors.accentDeny;
      case 'UNVERIFIED':
      case 'NONE':
      default:
        return Theme.colors.textSecondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return '●';
      case 'PENDING':
        return '◐';
      case 'EXPIRED':
      case 'DENIED':
        return '✕';
      case 'UNVERIFIED':
      case 'NONE':
      default:
        return '○';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'TRANSIT_PERMIT':
        return 'TRANSIT PERMIT';
      case 'WORK_ORDER':
        return 'WORK ORDER';
      case 'MEDICAL_CLEARANCE':
        return 'MEDICAL CLEARANCE';
      case 'VISITOR_PASS':
        return 'VISITOR PASS';
      default:
        return type;
    }
  };

  // Format date to dd/mm/yyyy
  const formatDate = (dateStr: string) => {
    // Handle various input formats and convert to dd/mm/yyyy
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    }
    // If already in a format or can't parse, return as-is
    return dateStr;
  };

  const canVerify = credential && 
    (credential.initialStatus === 'PENDING' || credential.initialStatus === 'NONE') &&
    !verificationComplete &&
    !alreadyVerified;

  const syncWidth = syncProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerText}>CREDENTIAL VERIFICATION</Text>
            <View style={styles.headerLine} />
          </View>

          {/* Content */}
          {credential ? (
            <View style={styles.content}>
              {/* Credential Details */}
              <View style={styles.detailsBox}>
                <View style={styles.row}>
                  <Text style={styles.label}>TYPE</Text>
                  <Text style={styles.value}>{getTypeLabel(credential.type)}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>SECTOR</Text>
                  <Text style={styles.value}>{credential.destinationSector}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>ISSUED</Text>
                  <Text style={styles.value}>{formatDate(credential.issuedDate)}</Text>
                </View>
                {credential.expirationDate && (
                  <View style={styles.row}>
                    <Text style={styles.label}>EXPIRES</Text>
                    <Text style={[
                      styles.value,
                      credential.initialStatus === 'EXPIRED' && { color: Theme.colors.accentDeny }
                    ]}>
                      {formatDate(credential.expirationDate)}
                    </Text>
                  </View>
                )}
                <View style={styles.row}>
                  <Text style={styles.label}>AUTHORITY</Text>
                  <Text style={styles.value}>{credential.authority}</Text>
                </View>
              </View>

              {/* Status Box */}
              <View style={[styles.statusBox, { borderColor: getStatusColor(currentStatus || 'NONE') }]}>
                <View style={styles.statusRow}>
                  <Text style={[styles.statusIcon, { color: getStatusColor(currentStatus || 'NONE') }]}>
                    {getStatusIcon(currentStatus || 'NONE')}
                  </Text>
                  <Text style={[styles.statusText, { color: getStatusColor(currentStatus || 'NONE') }]}>
                    {currentStatus === 'PENDING' ? 'PENDING SYNC' : currentStatus}
                  </Text>
                </View>

                {/* Claim or Verification Note */}
                {currentStatus === 'PENDING' && credential.claim && !verificationComplete && !alreadyVerified && (
                  <Text style={styles.claimText}>"{credential.claim}"</Text>
                )}
                {(verificationComplete || alreadyVerified) && credential.verificationNote && (
                  <Text style={styles.verificationNote}>{credential.verificationNote}</Text>
                )}
              </View>

              {/* Sync Progress */}
              {isVerifying && (
                <View style={styles.syncContainer}>
                  <Text style={styles.syncLabel}>SYNCING WITH CENTRAL...</Text>
                  <View style={styles.syncBarBg}>
                    <Animated.View style={[styles.syncBarFill, { width: syncWidth }]} />
                  </View>
                </View>
              )}

              {/* Verify Button */}
              {canVerify && !isVerifying && (
                <Pressable
                  onPress={handleVerify}
                  style={({ pressed }) => [
                    styles.verifyButton,
                    pressed && styles.verifyButtonPressed
                  ]}
                >
                  <Text style={styles.verifyButtonText}>[ VERIFY CREDENTIAL ]</Text>
                </Pressable>
              )}
            </View>
          ) : (
            <View style={styles.content}>
              <View style={styles.noCredentialBox}>
                <Text style={styles.noCredentialIcon}>○</Text>
                <Text style={styles.noCredentialText}>NO CREDENTIAL PRESENTED</Text>
                <Text style={styles.noCredentialSub}>Subject has not provided transit documentation.</Text>
              </View>
            </View>
          )}

          {/* Footer */}
          <View style={styles.footer}>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [
                styles.closeButton,
                pressed && styles.closeButtonPressed
              ]}
            >
              <Text style={styles.closeButtonText}>[ CLOSE ]</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 12, 15, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: Theme.colors.bgPanel,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  header: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  headerText: {
    color: Theme.colors.accentWarn,
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
  },
  headerLine: {
    height: 1,
    backgroundColor: 'rgba(201, 162, 39, 0.3)',
    marginTop: 8,
  },
  content: {
    padding: 16,
  },
  detailsBox: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  label: {
    color: Theme.colors.textDim,
    fontFamily: Theme.fonts.mono,
    fontSize: 11,
  },
  value: {
    color: Theme.colors.textPrimary,
    fontFamily: Theme.fonts.mono,
    fontSize: 11,
    fontWeight: '700',
  },
  statusBox: {
    borderWidth: 1,
    padding: 12,
    marginBottom: 16,
    backgroundColor: 'rgba(127, 184, 216, 0.03)',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusIcon: {
    fontFamily: Theme.fonts.mono,
    fontSize: 14,
  },
  statusText: {
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  claimText: {
    color: Theme.colors.textSecondary,
    fontFamily: Theme.fonts.mono,
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: 8,
  },
  verificationNote: {
    color: Theme.colors.textPrimary,
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    marginTop: 8,
  },
  syncContainer: {
    marginBottom: 16,
  },
  syncLabel: {
    color: Theme.colors.accentWarn,
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    marginBottom: 6,
    letterSpacing: 1,
  },
  syncBarBg: {
    height: 4,
    backgroundColor: 'rgba(127, 184, 216, 0.1)',
    overflow: 'hidden',
  },
  syncBarFill: {
    height: '100%',
    backgroundColor: Theme.colors.accentWarn,
  },
  verifyButton: {
    borderWidth: 1,
    borderColor: Theme.colors.accentWarn,
    paddingVertical: 10,
    alignItems: 'center',
  },
  verifyButtonPressed: {
    backgroundColor: 'rgba(201, 162, 39, 0.1)',
  },
  verifyButtonText: {
    color: Theme.colors.accentWarn,
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  noCredentialBox: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  noCredentialIcon: {
    color: Theme.colors.textDim,
    fontFamily: Theme.fonts.mono,
    fontSize: 32,
    marginBottom: 12,
  },
  noCredentialText: {
    color: Theme.colors.textSecondary,
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8,
  },
  noCredentialSub: {
    color: Theme.colors.textDim,
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    textAlign: 'center',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
    padding: 12,
    alignItems: 'center',
  },
  closeButton: {
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  closeButtonPressed: {
    backgroundColor: 'rgba(127, 184, 216, 0.2)',
    borderColor: Theme.colors.textSecondary,
  },
  closeButtonText: {
    color: Theme.colors.textSecondary,
    fontFamily: Theme.fonts.mono,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1,
  },
});

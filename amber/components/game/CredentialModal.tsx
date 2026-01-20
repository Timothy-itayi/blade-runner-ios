import React, { useState, useEffect } from 'react';
import { View, Text, Modal, Pressable, StyleSheet, Animated } from 'react-native';
import { Theme } from '../../constants/theme';
import { Credential } from '../../data/subjects';

interface CredentialModalProps {
  visible: boolean;
  credential?: Credential;
  alreadyVerified?: boolean; // If true, show verified status immediately
  credentialsReceived?: boolean; // If false, show dim/empty state
  credentialConfirmed?: boolean; // If true, credential has been scanned/confirmed
  onClose: () => void;
  onVerify?: (result: 'CONFIRMED' | 'EXPIRED' | 'DENIED' | 'UNVERIFIED') => void;
  onViewed?: () => void; // Called when credentials are actually viewed (not empty state)
  onConfirmed?: () => void; // Called when credential is scanned/confirmed
}

export const CredentialModal = ({ visible, credential, alreadyVerified = false, credentialsReceived = false, credentialConfirmed = false, onClose, onVerify, onViewed, onConfirmed }: CredentialModalProps) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [verificationComplete, setVerificationComplete] = useState(false);
  const [scanComplete, setScanComplete] = useState(credentialConfirmed);
  const [currentStatus, setCurrentStatus] = useState<string | null>(null);
  const [scanProgress] = useState(new Animated.Value(0));
  const [syncProgress] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      setIsVerifying(false);
      setIsScanning(false);
      // If already verified externally, skip to verified state
      if (alreadyVerified && credential?.verifiedStatus) {
        setVerificationComplete(true);
        setCurrentStatus(credential.verifiedStatus);
      } else {
        setVerificationComplete(false);
        setCurrentStatus(credential?.initialStatus || 'NONE');
      }
      setScanComplete(credentialConfirmed);
      syncProgress.setValue(0);
      scanProgress.setValue(0);
      
      // Mark credentials as viewed only if they've been received and credential exists
      // (not the empty/awaiting state)
      if (credentialsReceived && credential) {
        onViewed?.();
      }
    }
  }, [visible, credential, alreadyVerified, credentialsReceived, credentialConfirmed, onViewed]);

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

  // Can scan if credentials received and not yet scanned
  // For subjects without credentials, can "confirm" by viewing the empty state
  const canScan = credentialsReceived && !scanComplete && !isScanning;

  const handleScan = () => {
    if (!credential || isScanning || scanComplete) return;
    setIsScanning(true);
    scanProgress.setValue(0);

    // Animate scan progress
    Animated.timing(scanProgress, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: false,
    }).start(() => {
      setIsScanning(false);
      setScanComplete(true);
      onConfirmed?.();
    });
  };

  const syncWidth = syncProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const scanWidth = scanProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  // Determine border color based on status
  const getBorderColor = () => {
    // Processing states (scanning or verifying)
    if (isScanning || isVerifying) {
      return Theme.colors.accentWarn; // Yellow
    }
    
    // After scan/verification, check the status
    if (scanComplete || verificationComplete || alreadyVerified) {
      const status = currentStatus || credential?.verifiedStatus || credential?.initialStatus;
      if (status === 'CONFIRMED') {
        return Theme.colors.accentApprove; // Green
      }
      if (status === 'EXPIRED' || status === 'DENIED') {
        return Theme.colors.accentDeny; // Red
      }
      if (status === 'PENDING') {
        return Theme.colors.accentWarn; // Yellow
      }
    }
    
    // Default: primary blue
    return Theme.colors.textPrimary;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { borderColor: getBorderColor() }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerText}>CREDENTIAL VERIFICATION</Text>
            <View style={styles.headerLine} />
          </View>

          {/* Content */}
          {!credentialsReceived ? (
            <View style={[styles.content, styles.dimmedContent]}>
              <View style={styles.noCredentialBox}>
                <Text style={styles.noCredentialIconDim}>○</Text>
                <Text style={styles.noCredentialTextDim}>AWAITING CREDENTIALS</Text>
                <Text style={styles.noCredentialSubDim}>Subject has not yet provided transit documentation.</Text>
              </View>
            </View>
          ) : credential ? (
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

              {/* Scan Progress */}
              {isScanning && (
                <View style={styles.syncContainer}>
                  <Text style={styles.syncLabel}>SCANNING CREDENTIAL...</Text>
                  <View style={styles.syncBarBg}>
                    <Animated.View style={[styles.syncBarFill, { width: scanWidth }]} />
                  </View>
                </View>
              )}

              {/* Scan Button - appears when credentials received but not yet scanned */}
              {canScan && (
                <Pressable
                  onPress={handleScan}
                  style={({ pressed }) => [
                    styles.scanButton,
                    pressed && styles.scanButtonPressed
                  ]}
                >
                  <Text style={styles.scanButtonText}>[ VERIFY CREDENTIAL ]</Text>
                </Pressable>
              )}

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
              
              {/* Scan/Confirm button for subjects without credentials */}
              {canScan && (
                <Pressable
                  onPress={handleScan}
                  style={({ pressed }) => [
                    styles.scanButton,
                    pressed && styles.scanButtonPressed
                  ]}
                >
                  <Text style={styles.scanButtonText}>[ CONFIRM NO CREDENTIAL ]</Text>
                </Pressable>
              )}
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
    backgroundColor: 'rgba(10, 12, 15, 0.97)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  container: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: Theme.colors.bgPanel,
    borderWidth: 2,
    borderColor: Theme.colors.accentWarn,
  },
  dimmedContent: {
    opacity: 0.4,
  },
  header: {
    padding: 16,
    borderBottomWidth: 2,
    borderBottomColor: Theme.colors.accentWarn,
    backgroundColor: 'rgba(201, 162, 39, 0.1)',
  },
  headerText: {
    color: Theme.colors.accentWarn,
    fontFamily: Theme.fonts.mono,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 3,
    textAlign: 'center',
  },
  headerLine: {
    height: 2,
    backgroundColor: 'rgba(201, 162, 39, 0.4)',
    marginTop: 10,
  },
  content: {
    padding: 20,
  },
  detailsBox: {
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    padding: 16,
    backgroundColor: 'rgba(26, 42, 58, 0.3)',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(127, 184, 216, 0.1)',
  },
  label: {
    color: Theme.colors.textDim,
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
    letterSpacing: 1,
  },
  value: {
    color: Theme.colors.textPrimary,
    fontFamily: Theme.fonts.mono,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
  },
  statusBox: {
    borderWidth: 2,
    padding: 16,
    marginBottom: 20,
    backgroundColor: 'rgba(127, 184, 216, 0.05)',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusIcon: {
    fontFamily: Theme.fonts.mono,
    fontSize: 20,
  },
  statusText: {
    fontFamily: Theme.fonts.mono,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 2,
  },
  claimText: {
    color: Theme.colors.textSecondary,
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 12,
    lineHeight: 18,
  },
  verificationNote: {
    color: Theme.colors.textPrimary,
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
    marginTop: 12,
    lineHeight: 18,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(127, 184, 216, 0.2)',
  },
  syncContainer: {
    marginBottom: 20,
  },
  syncLabel: {
    color: Theme.colors.accentWarn,
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
    marginBottom: 10,
    letterSpacing: 2,
    textAlign: 'center',
  },
  syncBarBg: {
    height: 8,
    backgroundColor: 'rgba(127, 184, 216, 0.1)',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  syncBarFill: {
    height: '100%',
    backgroundColor: Theme.colors.accentWarn,
  },
  scanButton: {
    borderWidth: 2,
    borderColor: Theme.colors.textPrimary,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: 'rgba(127, 184, 216, 0.1)',
    marginBottom: 12,
  },
  scanButtonPressed: {
    backgroundColor: 'rgba(127, 184, 216, 0.25)',
  },
  scanButtonText: {
    color: Theme.colors.textPrimary,
    fontFamily: Theme.fonts.mono,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 2,
  },
  scanCompleteBox: {
    borderWidth: 2,
    borderColor: Theme.colors.accentApprove,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    backgroundColor: 'rgba(74, 138, 90, 0.1)',
    marginBottom: 12,
  },
  scanCompleteText: {
    color: Theme.colors.accentApprove,
    fontFamily: Theme.fonts.mono,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 2,
  },
  verifyButton: {
    borderWidth: 2,
    borderColor: Theme.colors.accentWarn,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: 'rgba(201, 162, 39, 0.1)',
  },
  verifyButtonPressed: {
    backgroundColor: 'rgba(201, 162, 39, 0.25)',
  },
  verifyButtonText: {
    color: Theme.colors.accentWarn,
    fontFamily: Theme.fonts.mono,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 2,
  },
  noCredentialBox: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noCredentialIcon: {
    color: Theme.colors.textDim,
    fontFamily: Theme.fonts.mono,
    fontSize: 48,
    marginBottom: 16,
  },
  noCredentialText: {
    color: Theme.colors.textSecondary,
    fontFamily: Theme.fonts.mono,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 10,
  },
  noCredentialSub: {
    color: Theme.colors.textDim,
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  noCredentialIconDim: {
    color: Theme.colors.textDim,
    fontFamily: Theme.fonts.mono,
    fontSize: 48,
    marginBottom: 16,
    opacity: 0.5,
  },
  noCredentialTextDim: {
    color: Theme.colors.textDim,
    fontFamily: Theme.fonts.mono,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 10,
    opacity: 0.6,
  },
  noCredentialSubDim: {
    color: Theme.colors.textDim,
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    opacity: 0.5,
  },
  footer: {
    borderTopWidth: 2,
    borderTopColor: Theme.colors.border,
    padding: 16,
    alignItems: 'center',
  },
  closeButton: {
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderWidth: 1,
    borderColor: Theme.colors.textSecondary,
  },
  closeButtonPressed: {
    backgroundColor: 'rgba(127, 184, 216, 0.2)',
  },
  closeButtonText: {
    color: Theme.colors.textSecondary,
    fontFamily: Theme.fonts.mono,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 2,
  },
});

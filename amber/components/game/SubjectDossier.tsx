import React, { useEffect, useRef, useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, Pressable, Animated, ScrollView, StyleSheet, Image } from 'react-native';
import { SubjectData } from '../../data/subjects';
import { HUDBox } from '../ui/HUDBox';
import { Theme } from '../../constants/theme';
import { TypewriterText } from '../ui/ScanData';
import { BUILD_SEQUENCE } from '../../constants/animations';
import { generateDossierGaps, isFieldMissing, getRedactedValue, DossierGaps } from '../../utils/dossierGaps';
import { ScanQuality } from '../../types/information';
import { getIncompleteScanWarning, isIncompleteScan } from '../../utils/scanQuality';

export const SubjectDossier = ({
  data,
  index,
  activeDirective,
  onClose,
  dossierRevealed = false,
  scanQuality
}: {
  data: SubjectData,
  index: number,
  activeDirective?: string | null,
  onClose: () => void,
  dossierRevealed?: boolean,
  scanQuality?: ScanQuality
}) => {
  // Phase 2: Generate dossier gaps based on scan quality (deterministic per subject)
  const dossierGaps = useMemo(() => generateDossierGaps(data.id, scanQuality), [data.id, scanQuality]);
  
  // Get incomplete scan warning if applicable
  const incompleteWarning = scanQuality ? getIncompleteScanWarning(scanQuality) : null;

  return (
    <View style={styles.overlay}>
      <HUDBox hudStage="full" style={styles.container}>
        {/* Header with Subject Number */}
        <View style={styles.header}>
          <Text style={styles.subjectNo}>SUBJECT {index + 1}</Text>
        </View>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Active Directive Alert */}
          {activeDirective && (
            <View style={styles.directiveSection}>
              <Text style={styles.directiveLabel}>⚠ STANDING DIRECTIVE</Text>
              <Text style={styles.directiveValue}>{activeDirective}</Text>
            </View>
          )}

          {/* Incomplete Scan Warning */}
          {incompleteWarning && (
            <View style={styles.incompleteScanWarning}>
              <Text style={styles.incompleteScanLabel}>⚠ SCAN WARNING</Text>
              <Text style={styles.incompleteScanText}>{incompleteWarning}</Text>
            </View>
          )}

          {/* Passport-Style Identity Card */}
          <View style={styles.identityCard}>
            {dossierRevealed && data.dossier ? (
              <>
                {/* Profile Picture Section */}
                <View style={styles.profileSection}>
                  <View style={styles.profilePicContainer}>
                    {data.profilePic ? (
                      <>
                        <Image source={data.profilePic} style={styles.profilePic} />
                        {data.dossierAnomaly && data.dossierAnomaly.type === 'MISMATCH' && (
                          <View style={styles.mismatchOverlay}>
                            <Text style={styles.mismatchBadge}>⚠ MISMATCH</Text>
                          </View>
                        )}
                      </>
                    ) : (
                      <View style={styles.profilePicPlaceholder}>
                        <Text style={styles.profilePicText}>NO IMAGE</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.profileInfo}>
                    <Text style={styles.subjectName}>{data.name}</Text>
                    <Text style={styles.idCode}>{data.id}</Text>
                  </View>
                </View>
                
                {/* Dossier Anomaly Warning */}
                {data.dossierAnomaly && data.dossierAnomaly.type !== 'NONE' && (
                  <View style={styles.anomalyWarning}>
                    <Text style={styles.anomalyWarningText}>
                      ⚠ {data.dossierAnomaly.type === 'MISMATCH' ? 'APPEARANCE MISMATCH DETECTED' : 
                          data.dossierAnomaly.type === 'MISSING_INFO' ? 'INCOMPLETE DATA' :
                          data.dossierAnomaly.type === 'CORRUPTED' ? 'SCAN CORRUPTED' :
                          'SURGERY DETECTED'}
                    </Text>
                    {data.dossierAnomaly.type === 'MISMATCH' && (
                      <Text style={styles.anomalyDescription}>
                        Photo does not match live feed. Subject appearance inconsistent with dossier records.
                      </Text>
                    )}
                    {data.dossierAnomaly.explanation && (
                      <Text style={styles.anomalyExplanation}>
                        SUBJECT CLAIMS: "{data.dossierAnomaly.explanation}"
                      </Text>
                    )}
                  </View>
                )}
                
                {/* Dossier Details */}
                <View style={styles.dossierContent}>
                  <View style={styles.dossierRow}>
                    <Text style={styles.dossierLabel}>DATE OF BIRTH:</Text>
                    <Text style={[
                      styles.dossierValue,
                      isFieldMissing(dossierGaps, 'dateOfBirth') && styles.redactedValue
                    ]}>
                      {isFieldMissing(dossierGaps, 'dateOfBirth') 
                        ? getRedactedValue('dateOfBirth') 
                        : data.dossier.dateOfBirth}
                    </Text>
                  </View>
                  <View style={styles.dossierRow}>
                    <Text style={styles.dossierLabel}>ADDRESS:</Text>
                    <Text style={[
                      styles.dossierValue,
                      isFieldMissing(dossierGaps, 'address') && styles.redactedValue
                    ]}>
                      {isFieldMissing(dossierGaps, 'address') 
                        ? getRedactedValue('address') 
                        : data.dossier.address}
                    </Text>
                  </View>
                  <View style={styles.dossierRow}>
                    <Text style={styles.dossierLabel}>OCCUPATION:</Text>
                    <Text style={[
                      styles.dossierValue,
                      isFieldMissing(dossierGaps, 'occupation') && styles.redactedValue
                    ]}>
                      {isFieldMissing(dossierGaps, 'occupation') 
                        ? getRedactedValue('occupation') 
                        : data.dossier.occupation}
                    </Text>
                  </View>
                  <View style={styles.dossierRow}>
                    <Text style={styles.dossierLabel}>SEX:</Text>
                    <Text style={[
                      styles.dossierValue,
                      isFieldMissing(dossierGaps, 'sex') && styles.redactedValue
                    ]}>
                      {isFieldMissing(dossierGaps, 'sex') 
                        ? getRedactedValue('sex') 
                        : data.dossier.sex}
                    </Text>
                  </View>
                </View>
              </>
            ) : (
              <View style={styles.dossierPlaceholder}>
                <Text style={styles.dossierPlaceholderText}>
                  BIO SCAN REQUIRED{'\n'}
                  Dossier data will be revealed after biometric scan
                </Text>
              </View>
            )}
          </View>
        </ScrollView>

        <Pressable
          onPress={onClose}
          style={({ pressed }) => [
            styles.footer,
            pressed && styles.footerPressed
          ]}
        >
          {({ pressed }) => (
            <Text style={[styles.closeButton, pressed && styles.closeButtonPressed]}>[ CLOSE ]</Text>
          )}
        </Pressable>
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
    padding: 16,
    backgroundColor: Theme.colors.bgPanel,
    maxHeight: '80%',
  },
  header: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  subjectNo: {
    color: Theme.colors.textDim,
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 2,
  },
  scroll: {
    flexGrow: 0,
  },
  directiveSection: {
    backgroundColor: 'rgba(212, 83, 74, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(212, 83, 74, 0.4)',
    borderLeftWidth: 4,
    borderLeftColor: Theme.colors.accentDeny,
    padding: 14,
    marginBottom: 16,
  },
  directiveLabel: {
    color: Theme.colors.accentDeny,
    fontFamily: Theme.fonts.mono,
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 6,
    letterSpacing: 1,
  },
  directiveValue: {
    color: Theme.colors.accentDeny,
    fontFamily: Theme.fonts.mono,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  incompleteScanWarning: {
    marginTop: 12,
    marginBottom: 8,
    padding: 12,
    backgroundColor: 'rgba(201, 162, 39, 0.15)',
    borderWidth: 1,
    borderColor: Theme.colors.accentWarn,
    borderRadius: 4,
  },
  incompleteScanLabel: {
    color: Theme.colors.accentWarn,
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4,
  },
  incompleteScanText: {
    color: Theme.colors.accentWarn,
    fontFamily: Theme.fonts.mono,
    fontSize: 9,
    lineHeight: 14,
    opacity: 0.9,
  },
  identityCard: {
    backgroundColor: 'rgba(26, 42, 58, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(74, 106, 122, 0.3)',
    padding: 16,
    marginBottom: 12,
  },
  profileSection: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(74, 106, 122, 0.3)',
  },
  profilePicContainer: {
    position: 'relative',
    marginRight: 12,
  },
  profilePic: {
    width: 80,
    height: 100,
    backgroundColor: 'rgba(26, 42, 58, 0.5)',
    borderWidth: 2,
    borderColor: Theme.colors.border,
  },
  mismatchOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(212, 83, 74, 0.9)',
    paddingVertical: 2,
    paddingHorizontal: 4,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.accentDeny,
  },
  mismatchBadge: {
    color: '#fff',
    fontFamily: Theme.fonts.mono,
    fontSize: 7,
    fontWeight: '700',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  profilePicPlaceholder: {
    width: 80,
    height: 100,
    backgroundColor: 'rgba(26, 42, 58, 0.5)',
    borderWidth: 2,
    borderColor: Theme.colors.border,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profilePicText: {
    color: Theme.colors.textDim,
    fontFamily: Theme.fonts.mono,
    fontSize: 9,
    textAlign: 'center',
  },
  profileInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  subjectName: {
    color: Theme.colors.textPrimary,
    fontFamily: Theme.fonts.mono,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4,
  },
  idCode: {
    color: Theme.colors.textDim,
    fontFamily: Theme.fonts.mono,
    fontSize: 11,
    letterSpacing: 1,
  },
  anomalyWarning: {
    backgroundColor: 'rgba(212, 83, 74, 0.15)',
    borderWidth: 1,
    borderColor: Theme.colors.accentDeny,
    borderLeftWidth: 4,
    borderLeftColor: Theme.colors.accentDeny,
    padding: 12,
    marginBottom: 12,
  },
  anomalyWarningText: {
    color: Theme.colors.accentDeny,
    fontFamily: Theme.fonts.mono,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 6,
  },
  anomalyDescription: {
    color: Theme.colors.textPrimary,
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    lineHeight: 14,
    marginBottom: 8,
  },
  anomalyExplanation: {
    color: Theme.colors.textSecondary,
    fontFamily: Theme.fonts.mono,
    fontSize: 9,
    fontStyle: 'italic',
    lineHeight: 14,
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(212, 83, 74, 0.3)',
  },
  dossierContent: {
    marginTop: 12,
  },
  dossierRow: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  dossierLabel: {
    color: Theme.colors.textDim,
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    letterSpacing: 1,
    width: 100,
    marginRight: 12,
  },
  dossierValue: {
    color: Theme.colors.textPrimary,
    fontFamily: Theme.fonts.mono,
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
    lineHeight: 16,
  },
  redactedValue: {
    color: Theme.colors.textDim,
    fontStyle: 'italic',
    opacity: 0.7,
  },
  dossierPlaceholder: {
    marginTop: 12,
    padding: 16,
    backgroundColor: 'rgba(26, 42, 58, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(74, 106, 122, 0.3)',
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  dossierPlaceholderText: {
    color: Theme.colors.textDim,
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 16,
  },
  footer: {
    marginTop: 8,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
    alignItems: 'center',
  },
  footerPressed: {
    backgroundColor: 'rgba(127, 184, 216, 0.15)',
    borderColor: Theme.colors.textSecondary,
  },
  closeButton: {
    color: Theme.colors.textSecondary,
    fontFamily: Theme.fonts.mono,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1,
  },
  closeButtonPressed: {
    color: Theme.colors.textSecondary,
  },
});

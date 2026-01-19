import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Pressable, Animated, ScrollView, StyleSheet } from 'react-native';
import { SubjectData } from '../data/subjects';
import { HUDBox } from './HUDBox';
import { Theme } from '../constants/theme';
import { TypewriterText } from './ScanData';
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

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'rgba(74, 138, 90, 0.15)';
      case 'PROVISIONAL':
      case 'UNDER REVIEW':
        return 'rgba(212, 175, 55, 0.15)';
      case 'RESTRICTED':
      case '[TERMINATED]':
      case 'ERROR':
      case 'UNDEFINED':
        return 'rgba(212, 83, 74, 0.15)';
      default:
        return 'rgba(127, 184, 216, 0.1)';
    }
  };

  return (
    <View style={styles.overlay}>
      <HUDBox hudStage="full" style={styles.container}>
        {/* Header with Subject Number */}
        <View style={styles.header}>
          <Text style={styles.subjectNo}>SUBJECT {index + 1}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusBg(data.status) }]}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor(data.status) }]} />
            <Text style={[styles.statusText, { color: getStatusColor(data.status) }]}>{data.status}</Text>
          </View>
        </View>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Active Directive Alert */}
          {activeDirective && (
            <View style={styles.directiveSection}>
              <Text style={styles.directiveLabel}>⚠ STANDING DIRECTIVE</Text>
              <Text style={styles.directiveValue}>{activeDirective}</Text>
            </View>
          )}

          {/* Identity Card */}
          <View style={styles.identityCard}>
            <Text style={styles.subjectName}>{data.name}</Text>
            <View style={styles.identityMeta}>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>LOCATION</Text>
                <Text style={styles.metaValue}>{data.sector}</Text>
              </View>
              <View style={styles.metaDivider} />
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>OCCUPATION</Text>
                <Text style={styles.metaValue}>{data.function}</Text>
              </View>
            </View>
          </View>

          {/* Request Details - Primary Focus */}
          <View style={styles.requestCard}>
            <Text style={styles.requestHeader}>ACCESS REQUEST</Text>
            <View style={styles.requestDestination}>
              <Text style={styles.requestArrow}>→</Text>
              <Text style={styles.requestedSector}>{data.requestedSector}</Text>
            </View>
            <View style={styles.reasonContainer}>
              <Text style={styles.reasonLabel}>STATED REASON</Text>
              <Text style={styles.reasonValue}>"{data.reasonForVisit}"</Text>
            </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontFamily: Theme.fonts.mono,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
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
  identityCard: {
    backgroundColor: 'rgba(26, 42, 58, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(74, 106, 122, 0.3)',
    padding: 16,
    marginBottom: 12,
  },
  subjectName: {
    color: Theme.colors.textPrimary,
    fontFamily: Theme.fonts.mono,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 12,
  },
  identityMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaItem: {
    flex: 1,
  },
  metaDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(74, 106, 122, 0.3)',
    marginHorizontal: 12,
  },
  metaLabel: {
    color: Theme.colors.textDim,
    fontFamily: Theme.fonts.mono,
    fontSize: 9,
    letterSpacing: 1,
    marginBottom: 4,
  },
  metaValue: {
    color: Theme.colors.textSecondary,
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
    fontWeight: '600',
  },
  requestCard: {
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    padding: 16,
    marginBottom: 12,
  },
  requestHeader: {
    color: Theme.colors.accentWarn,
    fontFamily: Theme.fonts.mono,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 10,
  },
  requestDestination: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  requestArrow: {
    color: Theme.colors.accentWarn,
    fontFamily: Theme.fonts.mono,
    fontSize: 20,
    marginRight: 10,
  },
  requestedSector: {
    color: Theme.colors.accentWarn,
    fontFamily: Theme.fonts.mono,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 1,
  },
  reasonContainer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(212, 175, 55, 0.2)',
    paddingTop: 12,
  },
  reasonLabel: {
    color: Theme.colors.textDim,
    fontFamily: Theme.fonts.mono,
    fontSize: 9,
    letterSpacing: 1,
    marginBottom: 6,
  },
  reasonValue: {
    color: Theme.colors.textPrimary,
    fontFamily: Theme.fonts.mono,
    fontSize: 13,
    fontStyle: 'italic',
    lineHeight: 20,
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

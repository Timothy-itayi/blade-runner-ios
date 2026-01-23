import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Theme } from '../../constants/theme';
import { Consequence } from '../../types/consequence';
import { HUDBox } from '../ui/HUDBox';

interface CitationModalProps {
  visible: boolean;
  consequence: Consequence | null;
  onClose: () => void;
}

export const CitationModal = ({ visible, consequence, onClose }: CitationModalProps) => {
  if (!consequence || consequence.type === 'NONE') {
    return null;
  }

  const getConsequenceColor = () => {
    switch (consequence.type) {
      case 'WARNING':
        return Theme.colors.accentWarn;
      case 'CITATION':
        return '#FF6B35'; // Orange
      case 'SERIOUS_INFRACTION':
        return Theme.colors.accentDeny;
      default:
        return Theme.colors.textPrimary;
    }
  };

  const getConsequenceTitle = () => {
    switch (consequence.type) {
      case 'WARNING':
        return 'WARNING ISSUED';
      case 'CITATION':
        return 'CITATION ISSUED';
      case 'SERIOUS_INFRACTION':
        return 'SERIOUS INFRACTION';
      default:
        return 'NOTICE';
    }
  };

  if (!visible) {
    return null;
  }

  return (
    <View style={styles.overlay}>
      <HUDBox hudStage="full" style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: getConsequenceColor() }]}>
            {getConsequenceTitle()}
          </Text>
        </View>

        <ScrollView 
          style={styles.scroll} 
          showsVerticalScrollIndicator={false}
        >
          {/* Main Message */}
          <View style={styles.messageSection}>
            <Text style={styles.messageText}>{consequence.message}</Text>
          </View>

          {/* Missed Information */}
          {consequence.missedInformation.length > 0 && (
            <View style={styles.missedSection}>
              <Text style={styles.sectionTitle}>MISSED INFORMATION</Text>
              {consequence.missedInformation.map((missed, index) => (
                <View key={index} style={styles.missedItem}>
                  <Text style={styles.missedType}>{missed.type.replace('_', ' ')}</Text>
                  <Text style={styles.missedDescription}>{missed.description}</Text>
                  <View style={styles.revealBox}>
                    <Text style={styles.revealLabel}>Would have revealed:</Text>
                    <Text style={styles.revealText}>{missed.reveal}</Text>
                  </View>
                  <View style={styles.impactBox}>
                    <Text style={styles.impactLabel}>Impact:</Text>
                    <Text style={styles.impactText}>{missed.impact}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Penalty Information */}
          <View style={styles.penaltySection}>
            <Text style={styles.sectionTitle}>PENALTY</Text>
            <View style={styles.penaltyBox}>
              <Text style={styles.penaltyText}>
                Health lost: 1
              </Text>
              <Text style={styles.penaltyText}>
                Cumulative infractions: {consequence.infractionCount}
              </Text>
              <Text style={styles.penaltyText}>
                Severity: {consequence.severity}/100
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <Pressable
          onPress={onClose}
          style={({ pressed }) => [
            styles.footer,
            pressed && styles.footerPressed
          ]}
        >
          {({ pressed }) => (
            <Text style={[styles.closeButton, pressed && styles.closeButtonPressed, { color: getConsequenceColor() }]}>
              [ ACKNOWLEDGE ]
            </Text>
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
  headerTitle: {
    fontFamily: Theme.fonts.mono,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  scroll: {
    flexGrow: 0,
  },
  messageSection: {
    marginBottom: 16,
    padding: 14,
    backgroundColor: 'rgba(26, 42, 58, 0.5)',
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  messageText: {
    fontFamily: Theme.fonts.mono,
    fontSize: 14,
    lineHeight: 20,
    color: Theme.colors.textPrimary,
    fontWeight: '600',
  },
  sectionTitle: {
    fontFamily: Theme.fonts.mono,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    color: Theme.colors.textDim,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  missedSection: {
    marginBottom: 16,
  },
  missedItem: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: 'rgba(212, 83, 74, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(212, 83, 74, 0.3)',
  },
  missedType: {
    fontFamily: Theme.fonts.mono,
    fontSize: 11,
    fontWeight: '700',
    color: Theme.colors.accentDeny,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  missedDescription: {
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
    color: Theme.colors.textPrimary,
    marginBottom: 8,
  },
  revealBox: {
    marginTop: 8,
    padding: 8,
    backgroundColor: 'rgba(26, 42, 58, 0.7)',
    borderLeftWidth: 3,
    borderLeftColor: Theme.colors.accentWarn,
  },
  revealLabel: {
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    color: Theme.colors.textDim,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  revealText: {
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
    color: Theme.colors.accentWarn,
    fontStyle: 'italic',
  },
  impactBox: {
    marginTop: 8,
    padding: 8,
    backgroundColor: 'rgba(26, 42, 58, 0.7)',
    borderLeftWidth: 3,
    borderLeftColor: Theme.colors.textSecondary,
  },
  impactLabel: {
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    color: Theme.colors.textDim,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  impactText: {
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
    color: Theme.colors.textSecondary,
  },
  penaltySection: {
    marginBottom: 16,
  },
  penaltyBox: {
    padding: 12,
    backgroundColor: 'rgba(26, 42, 58, 0.5)',
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  penaltyText: {
    fontFamily: Theme.fonts.mono,
    fontSize: 11,
    color: Theme.colors.textPrimary,
    marginBottom: 4,
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
    fontFamily: Theme.fonts.mono,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1,
  },
  closeButtonPressed: {
    opacity: 0.7,
  },
});

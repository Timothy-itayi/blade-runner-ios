import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SubjectData } from '../../data/subjects';
import { HUDBox } from '../ui/HUDBox';
import { Theme } from '../../constants/theme';
import { TypewriterText } from '../ui/ScanData';
import { BUILD_SEQUENCE } from '../../constants/animations';

export const IntelPanel = ({ 
  data, 
  hudStage, 
  onOpenDossier,
  onRevealVerify,
  hasDecision,
  decisionType
}: { 
  data: SubjectData, 
  hudStage: 'none' | 'wireframe' | 'outline' | 'full',
  onOpenDossier: () => void,
  onRevealVerify: () => void,
  hasDecision?: boolean,
  decisionType?: 'APPROVE' | 'DENY'
}) => {
  // Verification button only active for non-clean subjects
  const isCleanSubject = data.archetype === 'CLN';
  const verificationDisabled = isCleanSubject || hudStage !== 'full';

  return (
    <HUDBox hudStage={hudStage} style={styles.container} buildDelay={BUILD_SEQUENCE.subjectIntel}>
      <View style={styles.mainRow}>
        <TouchableOpacity 
          style={styles.dossierButton} 
          onPress={onOpenDossier}
          disabled={hudStage !== 'full'}
        >
          <TypewriterText 
            text="[ ACCESS SUBJECT DOSSIER ]" 
            active={hudStage !== 'none'} 
            delay={BUILD_SEQUENCE.subjectIntel + 200}
            style={styles.buttonText}
            showCursor={false}
          />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.verifyButton,
            verificationDisabled && styles.verifyButtonDisabled
          ]} 
          onPress={onRevealVerify}
          disabled={verificationDisabled}
        >
          <Text style={[
            styles.verifyText,
            verificationDisabled && styles.verifyTextDisabled
          ]}>VERIFICATION</Text>
        </TouchableOpacity>
      </View>
    </HUDBox>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
  },
  mainRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dossierButton: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: Theme.colors.textSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(127, 184, 216, 0.05)',
  },
  buttonText: {
    color: Theme.colors.textPrimary,
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
    fontWeight: '700',
  },
  verifyButton: {
    width: 100,
    height: 50,
    borderWidth: 1,
    borderColor: Theme.colors.accentWarn,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(201, 162, 39, 0.1)',
  },
  verifyText: {
    color: Theme.colors.accentWarn,
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
  },
  verifyButtonDisabled: {
    opacity: 0.3,
    borderColor: Theme.colors.textDim,
  },
  verifyTextDisabled: {
    color: Theme.colors.textDim,
  },
});

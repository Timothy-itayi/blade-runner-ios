import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Theme } from '../../constants/theme';
import { HUDBox } from '../ui/HUDBox';
import { TypewriterText } from '../ui/ScanData';
import { BUILD_SEQUENCE } from '../../constants/animations';
import { ProceduralPortrait } from '../ui/ProceduralPortrait';
import { FaceLandmarkTfliteTest } from './FaceLandmarkTfliteTest';

export const CommLinkPanel = ({ 
  dialogue, 
  hudStage,
  subjectId,
  subjectType,
  isAnomaly = false,
  useProceduralPortrait = true,
  baseImageIdOverride,
}: { 
  dialogue?: string, 
  hudStage: 'none' | 'wireframe' | 'outline' | 'full',
  subjectId?: string,
  subjectType?: string,
  isAnomaly?: boolean,
  useProceduralPortrait?: boolean,
  baseImageIdOverride?: number,
}) => {
  if (hudStage === 'none') return null;

  const showPortrait = !!subjectId && useProceduralPortrait;

  return (
    <HUDBox hudStage={hudStage} style={styles.container} buildDelay={BUILD_SEQUENCE.header}>
      <View style={styles.header}>
        <TypewriterText 
          text="LIVE COMM-LINK TRANSCRIPTION" 
          active={true} 
          delay={BUILD_SEQUENCE.header}
          style={styles.label}
          showCursor={false}
        />
        <View style={styles.pulseDot} />
      </View>
      
      <View style={styles.content}>
        {showPortrait && (
          <View style={styles.portraitFrame}>
            <FaceLandmarkTfliteTest
              mode="portrait"
              activeIndex={baseImageIdOverride ?? 0}
              isScanning={false}
              scanProgress={0}
              style={styles.portraitImage}
            />
          </View>
        )}
        <View style={[styles.dialogueBlock, showPortrait && styles.dialogueBlockWithPortrait]}>
          {dialogue ? (
            <TypewriterText 
              text={`"${dialogue}"`} 
              active={hudStage === 'full'} 
              delay={BUILD_SEQUENCE.header + 500} 
              style={styles.dialogueText}
            />
          ) : (
            <Text style={[styles.dialogueText, { opacity: 0.3 }]}>[ NO ACTIVE TRANSMISSION ]</Text>
          )}
        </View>
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>ENCRYPTION: AES-256 BIT // SOURCE: SUBJECT_VOICE_CAPTURE</Text>
      </View>
    </HUDBox>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    height: 110,
    backgroundColor: 'rgba(127, 184, 216, 0.03)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(127, 184, 216, 0.1)',
    paddingBottom: 4,
  },
  label: {
    color: Theme.colors.accentWarn,
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Theme.colors.accentDeny,
    opacity: 0.8,
  },
  content: {
    flex: 1,
    paddingTop: 8,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  portraitFrame: {
    width: 72,
    height: 72,
    borderWidth: 1,
    borderColor: 'rgba(127, 184, 216, 0.12)',
    backgroundColor: '#070b0f',
    marginRight: 12,
  },
  portraitImage: {
    width: '100%',
    height: '100%',
  },
  dialogueBlock: {
    flex: 1,
  },
  dialogueBlockWithPortrait: {
    paddingRight: 4,
  },
  dialogueText: {
    color: Theme.colors.textPrimary,
    fontFamily: Theme.fonts.mono,
    fontSize: 14,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  footer: {
    marginTop: 'auto',
    borderTopWidth: 1,
    borderTopColor: 'rgba(127, 184, 216, 0.05)',
    paddingTop: 4,
  },
  footerText: {
    color: Theme.colors.textDim,
    fontFamily: Theme.fonts.mono,
    fontSize: 8,
  },
});

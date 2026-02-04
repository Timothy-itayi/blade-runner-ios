import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Theme } from '../../constants/theme';
import { HUDBox } from '../ui/HUDBox';
import { SkiaTypewriterText } from '../ui/ScanData';
import { BUILD_SEQUENCE } from '../../constants/animations';
import { FaceLandmarkTfliteTest } from './FaceLandmarkTfliteTest';

export const CommLinkPanel = ({ 
  dialogue, 
  hudStage,
  subjectId,
  useProceduralPortrait = true,
  baseImageIdOverride,
  portraitSeed,
  decisionStamp,
}: { 
  dialogue?: string, 
  hudStage: 'none' | 'wireframe' | 'outline' | 'full',
  subjectId?: string,
  useProceduralPortrait?: boolean,
  baseImageIdOverride?: number,
  portraitSeed?: string,
  decisionStamp?: 'APPROVE' | 'DENY' | null,
}) => {
  if (hudStage === 'none') return null;

  const showPortrait = !!subjectId && useProceduralPortrait;
  const stampOpacity = useRef(new Animated.Value(0)).current;
  const stampScale = useRef(new Animated.Value(0.6)).current;
  const [stampVisible, setStampVisible] = useState(false);

  useEffect(() => {
    if (!decisionStamp) return;
    setStampVisible(true);
    stampOpacity.setValue(0);
    stampScale.setValue(0.6);
    Animated.parallel([
      Animated.timing(stampOpacity, { toValue: 1, duration: 120, useNativeDriver: true }),
      Animated.spring(stampScale, { toValue: 1, friction: 7, tension: 80, useNativeDriver: true }),
    ]).start(() => {
      Animated.timing(stampOpacity, { toValue: 0, duration: 220, delay: 700, useNativeDriver: true }).start(() => {
        setStampVisible(false);
      });
    });
  }, [decisionStamp, stampOpacity, stampScale]);

  return (
    <HUDBox hudStage={hudStage} style={styles.container} buildDelay={BUILD_SEQUENCE.header}>
      <View style={styles.header}>
        <SkiaTypewriterText
          text="LIVE COMM-LINK TRANSCRIPTION"
          active={true}
          delay={BUILD_SEQUENCE.header}
          style={styles.label}
          numberOfLines={1}
        />
        <View style={styles.pulseDot} />
      </View>
      
      <View style={styles.content}>
        {showPortrait && (
          <View style={styles.portraitFrame}>
            <FaceLandmarkTfliteTest
              mode="portrait"
              activeIndex={baseImageIdOverride ?? 0}
              portraitSeed={portraitSeed}
              isScanning={false}
              scanProgress={0}
              style={styles.portraitImage}
            />
            {stampVisible && decisionStamp && (
              <Animated.View
                style={[
                  styles.stampContainer,
                  decisionStamp === 'APPROVE' ? styles.stampContainerApprove : styles.stampContainerDeny,
                  { opacity: stampOpacity, transform: [{ scale: stampScale }, { rotate: '-10deg' }] },
                ]}
                pointerEvents="none"
              >
                <Text
                  style={[
                    styles.stampText,
                    decisionStamp === 'APPROVE' ? styles.stampTextApprove : styles.stampTextDeny,
                  ]}
                  numberOfLines={1}
                  ellipsizeMode="clip"
                >
                  {decisionStamp === 'APPROVE' ? 'APPROVED' : 'DENIED'}
                </Text>
              </Animated.View>
            )}
          </View>
        )}
        <View style={[styles.dialogueBlock, showPortrait && styles.dialogueBlockWithPortrait]}>
          {dialogue ? (
            <SkiaTypewriterText
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
    paddingHorizontal: 4,
    paddingVertical: 8,
    height: 128,
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
  stampContainer: {
    position: 'absolute',
    right: -10,
    top: -6,
    borderWidth: 2,
    minWidth: 78,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: 'rgba(0,0,0,0.65)',
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stampContainerApprove: {
    borderColor: Theme.colors.accentApprove,
  },
  stampContainerDeny: {
    borderColor: Theme.colors.accentDeny,
  },
  stampText: {
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  stampTextApprove: {
    color: Theme.colors.accentApprove,
  },
  stampTextDeny: {
    color: Theme.colors.accentDeny,
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
    fontSize: 13,
    lineHeight: 17,
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

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { useAudioPlayer } from 'expo-audio';
import { SubjectData } from '../../data/subjects';
import { HUDBox } from '../ui/HUDBox';
import { Theme } from '../../constants/theme';

interface HealthScanModalProps {
  subject: SubjectData;
  onClose: () => void;
}

type ProgressState = 'initialising' | 'scanning' | 'analyzing' | 'ready';

export const HealthScanModal = ({ subject, onClose }: HealthScanModalProps) => {
  const [progressState, setProgressState] = useState<ProgressState>('initialising');
  const [progressValue, setProgressValue] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const progressAnim = useRef(new Animated.Value(0)).current;
  
  // Health scan reveals biometric data, diseases, pathogens
  const bioData = subject.bioScanData || {};
  const audioFile = bioData.audioFile;
  const audioPlayer = useAudioPlayer(audioFile || null);

  // Progress sequence: initialising -> scanning -> analyzing -> ready
  useEffect(() => {
    // Initialising phase (0-30%)
    const initialisingAnim = Animated.timing(progressAnim, {
      toValue: 0.3,
      duration: 1500,
      useNativeDriver: false,
    });

    // Scanning phase (30-70%)
    const scanningAnim = Animated.timing(progressAnim, {
      toValue: 0.7,
      duration: 2000,
      useNativeDriver: false,
    });

    // Analyzing phase (70-100%)
    const analyzingAnim = Animated.timing(progressAnim, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: false,
    });

    Animated.sequence([
      initialisingAnim,
      Animated.delay(300),
    ]).start(() => {
      setProgressState('scanning');
      scanningAnim.start(() => {
        setProgressState('analyzing');
        analyzingAnim.start(() => {
          setProgressState('ready');
        });
      });
    });

    // Update progress value for display
    const listener = progressAnim.addListener(({ value }) => {
      setProgressValue(value);
    });

    return () => {
      progressAnim.removeListener(listener);
    };
  }, []);

  const handleViewResults = () => {
    setShowResults(true);
    if (audioPlayer && audioFile) {
      audioPlayer.volume = 0.7;
      audioPlayer.loop = false;
      audioPlayer.seekTo(0);
      audioPlayer.play();
    }
  };

  const handleClose = () => {
    if (audioPlayer && audioPlayer.playing) {
      audioPlayer.pause();
    }
    onClose();
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  // Generate health findings from bio scan data
  const healthFindings = [];
  if (bioData.biologicalType === 'REPLICANT') {
    healthFindings.push('SYNTHETIC BIOLOGICAL MARKERS DETECTED');
  }
  if (bioData.augmentationLevel && bioData.augmentationLevel !== 'NONE') {
    healthFindings.push(`CYBERNETIC AUGMENTATIONS: ${bioData.augmentationLevel}`);
  }
  if (bioData.geneticPurity !== undefined && bioData.geneticPurity < 100) {
    healthFindings.push(`GENETIC PURITY: ${bioData.geneticPurity}%`);
  }
  if (bioData.bioStructure && bioData.bioStructure !== 'STANDARD') {
    healthFindings.push(`BIO STRUCTURE: ${bioData.bioStructure}`);
  }
  if (bioData.fingerprintType && bioData.fingerprintType !== 'HUMAN') {
    healthFindings.push(`FINGERPRINT TYPE: ${bioData.fingerprintType}`);
  }

  return (
    <View style={styles.overlay}>
      <HUDBox hudStage="full" style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>HEALTH SCAN - BIOMETRIC ANALYSIS</Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>[ CLOSE ]</Text>
          </TouchableOpacity>
        </View>

        {!showResults ? (
          <View style={styles.progressContainer}>
            <View style={styles.progressSection}>
              {/* Status Label - Secondary */}
              {progressState !== 'ready' && (
                <Text style={styles.progressLabel}>
                  {progressState === 'initialising' && 'INITIALISING BIOMETRIC SCANNER...'}
                  {progressState === 'scanning' && 'SCANNING BIOLOGICAL MARKERS...'}
                  {progressState === 'analyzing' && 'ANALYZING PATHOGENS & DISEASES...'}
                </Text>
              )}
              
              {/* Primary Message - Large and Prominent */}
              {progressState === 'ready' && (
                <Text style={styles.completeTitle}>ANALYSIS COMPLETE</Text>
              )}
              
              <View style={styles.progressBarContainer}>
                <Animated.View 
                  style={[
                    styles.progressBar, 
                    { width: progressWidth }
                  ]} 
                />
              </View>
              
              {/* Percentage - Clear and Visible */}
              <Text style={styles.progressPercent}>
                {Math.round(progressValue * 100)}%
              </Text>
            </View>

            {progressState === 'ready' && (
              <TouchableOpacity 
                style={styles.viewResultsButton}
                onPress={handleViewResults}
              >
                <Text style={styles.viewResultsText}>VIEW HEALTH REPORT</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsTitle}>HEALTH SCAN RESULTS</Text>
            <Text style={styles.resultsSubtitle}>BIOMETRIC ANALYSIS REPORT</Text>
            
            <View style={styles.audioSection}>
              <Text style={styles.audioLabel}>HEALTH SCAN AUDIO</Text>
              {audioFile ? (
                <View style={styles.audioControls}>
                  <TouchableOpacity
                    style={styles.audioButton}
                    onPress={() => {
                      if (audioPlayer) {
                        if (audioPlayer.playing) {
                          audioPlayer.pause();
                        } else {
                          audioPlayer.play();
                        }
                      }
                    }}
                  >
                    <Text style={styles.audioButtonText}>
                      {audioPlayer?.playing ? '[ PAUSE ]' : '[ PLAY ]'}
                    </Text>
                  </TouchableOpacity>
                  <Text style={styles.audioNote}>
                    [ MEMORY FULL - ONE-TIME PLAYBACK ONLY ]
                  </Text>
                </View>
              ) : (
                <Text style={styles.noAudioText}>NO AUDIO FILE AVAILABLE</Text>
              )}
            </View>

            <View style={styles.findingsContainer}>
              <Text style={styles.findingsTitle}>BIOMETRIC FINDINGS:</Text>
              {healthFindings.length > 0 ? (
                healthFindings.map((finding, index) => (
                  <View key={index} style={styles.findingRow}>
                    <Text style={styles.findingBullet}>•</Text>
                    <Text style={styles.findingText}>{finding}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.noFindingsText}>NO ANOMALIES DETECTED</Text>
              )}
            </View>

            <Text style={styles.noteText}>
              Health scan analyzes biological markers, pathogens, and diseases.
              Audio report contains detailed medical findings.
            </Text>
          </View>
        )}
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
    padding: 20,
    backgroundColor: Theme.colors.bgPanel,
    minHeight: 400,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: Theme.colors.border,
  },
  headerTitle: {
    color: Theme.colors.textPrimary,
    fontFamily: Theme.fonts.mono,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 2.5,
    flex: 1,
  },
  closeButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  closeButtonText: {
    color: Theme.colors.textSecondary,
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
  },
  progressContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  progressSection: {
    width: '100%',
    marginBottom: 30,
  },
  progressLabel: {
    color: Theme.colors.textSecondary,
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1.5,
    marginBottom: 20,
    textAlign: 'center',
  },
  completeTitle: {
    color: Theme.colors.accentWarn,
    fontFamily: Theme.fonts.mono,
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 3,
    marginBottom: 24,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  progressBarContainer: {
    width: '100%',
    height: 28,
    backgroundColor: 'rgba(26, 42, 58, 0.6)',
    borderWidth: 2,
    borderColor: Theme.colors.border,
    marginBottom: 16,
    overflow: 'hidden',
    borderRadius: 2,
  },
  progressBar: {
    height: '100%',
    backgroundColor: Theme.colors.accentWarn,
  },
  progressPercent: {
    color: Theme.colors.textPrimary,
    fontFamily: Theme.fonts.mono,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 2,
    marginTop: 4,
  },
  viewResultsButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    backgroundColor: 'rgba(201, 162, 39, 0.15)',
    borderWidth: 2,
    borderColor: Theme.colors.accentWarn,
    borderRadius: 2,
    marginTop: 8,
    minWidth: 280,
    alignItems: 'center',
  },
  viewResultsText: {
    color: Theme.colors.accentWarn,
    fontFamily: Theme.fonts.mono,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 2.5,
    textTransform: 'uppercase',
  },
  resultsContainer: {
    paddingVertical: 20,
  },
  resultsTitle: {
    color: Theme.colors.textPrimary,
    fontFamily: Theme.fonts.mono,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 8,
    textAlign: 'center',
  },
  resultsSubtitle: {
    color: Theme.colors.accentWarn,
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
    letterSpacing: 1,
    marginBottom: 24,
    textAlign: 'center',
  },
  audioSection: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: 'rgba(26, 42, 58, 0.3)',
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  audioLabel: {
    color: Theme.colors.textPrimary,
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 12,
  },
  audioControls: {
    alignItems: 'center',
  },
  audioButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(26, 42, 58, 0.5)',
    borderWidth: 1,
    borderColor: Theme.colors.border,
    marginBottom: 8,
  },
  audioButtonText: {
    color: Theme.colors.textPrimary,
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
  },
  audioNote: {
    color: Theme.colors.textDim,
    fontFamily: Theme.fonts.mono,
    fontSize: 9,
    letterSpacing: 0.5,
    fontStyle: 'italic',
  },
  noAudioText: {
    color: Theme.colors.textDim,
    fontFamily: Theme.fonts.mono,
    fontSize: 11,
    letterSpacing: 1,
    textAlign: 'center',
  },
  findingsContainer: {
    backgroundColor: 'rgba(26, 42, 58, 0.3)',
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  findingsTitle: {
    color: Theme.colors.textPrimary,
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 12,
  },
  findingRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  findingBullet: {
    color: Theme.colors.accentWarn,
    fontFamily: Theme.fonts.mono,
    fontSize: 11,
    marginRight: 8,
  },
  findingText: {
    color: Theme.colors.textPrimary,
    fontFamily: Theme.fonts.mono,
    fontSize: 11,
    flex: 1,
  },
  noFindingsText: {
    color: Theme.colors.textDim,
    fontFamily: Theme.fonts.mono,
    fontSize: 11,
    fontStyle: 'italic',
    letterSpacing: 0.5,
  },
  noteText: {
    color: Theme.colors.textDim,
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    fontStyle: 'italic',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});

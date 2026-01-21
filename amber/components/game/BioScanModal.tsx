import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { useAudioPlayer } from 'expo-audio';
import { SubjectData } from '../../data/subjects';
import { HUDBox } from '../ui/HUDBox';
import { Theme } from '../../constants/theme';

interface BioScanModalProps {
  subject: SubjectData;
  onClose: () => void;
}

type ProgressState = 'initialising' | 'compressing' | 'ready';

export const BioScanModal = ({ subject, onClose }: BioScanModalProps) => {
  const [progressState, setProgressState] = useState<ProgressState>('initialising');
  const [progressValue, setProgressValue] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const progressAnim = useRef(new Animated.Value(0)).current;
  
  const bioData = subject.bioScanData || {};
  const audioFile = bioData.audioFile;
  const audioPlayer = useAudioPlayer(audioFile || null);

  // Progress sequence: initialising -> compressing -> ready
  useEffect(() => {
    // Initialising phase (0-50%)
    const initialisingAnim = Animated.timing(progressAnim, {
      toValue: 0.5,
      duration: 2000,
      useNativeDriver: false,
    });

    // Compressing phase (50-100%)
    const compressingAnim = Animated.timing(progressAnim, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: false,
    });

    Animated.sequence([
      initialisingAnim,
      Animated.delay(500), // Brief pause before compressing
    ]).start(() => {
      setProgressState('compressing');
      compressingAnim.start(() => {
        setProgressState('ready');
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

  return (
    <View style={styles.overlay}>
      <HUDBox hudStage="full" style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>BIOMETRIC SCAN PROCESSING</Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>[ CLOSE ]</Text>
          </TouchableOpacity>
        </View>

        {!showResults ? (
          <View style={styles.progressContainer}>
            <View style={styles.progressSection}>
              <Text style={styles.progressLabel}>
                {progressState === 'initialising' && 'INITIALISING...'}
                {progressState === 'compressing' && 'COMPRESSING...'}
                {progressState === 'ready' && 'READY'}
              </Text>
              
              <View style={styles.progressBarContainer}>
                <Animated.View 
                  style={[
                    styles.progressBar, 
                    { width: progressWidth }
                  ]} 
                />
              </View>
              
              <Text style={styles.progressPercent}>
                {Math.round(progressValue * 100)}%
              </Text>
            </View>

            {progressState === 'ready' && (
              <TouchableOpacity 
                style={styles.viewResultsButton}
                onPress={handleViewResults}
              >
                <Text style={styles.viewResultsText}>[ VIEW RESULTS ]</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.resultsContainer}>
            <Text style={styles.audioLabel}>BIOMETRIC SCAN AUDIO</Text>
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
                <TouchableOpacity
                  style={styles.audioButton}
                  onPress={() => {
                    if (audioPlayer) {
                      audioPlayer.seekTo(0);
                      audioPlayer.play();
                    }
                  }}
                >
                  <Text style={styles.audioButtonText}>[ RESTART ]</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={styles.noAudioText}>NO AUDIO FILE AVAILABLE</Text>
            )}
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
    minHeight: 300,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  headerTitle: {
    color: Theme.colors.textPrimary,
    fontFamily: Theme.fonts.mono,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 2,
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
    color: Theme.colors.accentApprove,
    fontFamily: Theme.fonts.mono,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 16,
    textAlign: 'center',
  },
  progressBarContainer: {
    width: '100%',
    height: 24,
    backgroundColor: 'rgba(26, 42, 58, 0.5)',
    borderWidth: 1,
    borderColor: Theme.colors.border,
    marginBottom: 12,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: Theme.colors.accentApprove,
  },
  progressPercent: {
    color: Theme.colors.textPrimary,
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
    textAlign: 'center',
    letterSpacing: 1,
  },
  viewResultsButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(74, 138, 90, 0.2)',
    borderWidth: 1,
    borderColor: Theme.colors.accentApprove,
  },
  viewResultsText: {
    color: Theme.colors.accentApprove,
    fontFamily: Theme.fonts.mono,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 2,
  },
  resultsContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  audioLabel: {
    color: Theme.colors.textPrimary,
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 20,
  },
  audioControls: {
    flexDirection: 'row',
    gap: 12,
  },
  audioButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(26, 42, 58, 0.5)',
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  audioButtonText: {
    color: Theme.colors.textPrimary,
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
  },
  noAudioText: {
    color: Theme.colors.textDim,
    fontFamily: Theme.fonts.mono,
    fontSize: 11,
    letterSpacing: 1,
  },
});

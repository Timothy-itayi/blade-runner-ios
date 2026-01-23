import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet, Image } from 'react-native';
import { SubjectData } from '../../data/subjects';
import { HUDBox } from '../ui/HUDBox';
import { Theme } from '../../constants/theme';

interface IdentityScanModalProps {
  subject: SubjectData;
  onClose: () => void;
}

type ProgressState = 'initialising' | 'scanning' | 'analyzing' | 'ready';

export const IdentityScanModal = ({ subject, onClose }: IdentityScanModalProps) => {
  const [progressState, setProgressState] = useState<ProgressState>('initialising');
  const [progressValue, setProgressValue] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const progressAnim = useRef(new Animated.Value(0)).current;
  
  // Identity scan reveals dossier (personal identity information)
  const dossier = subject.dossier;
  const eyeImage = subject.eyeImage;

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
  };

  const handleClose = () => {
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
          <Text style={styles.headerTitle}>IDENTITY SCAN - RETINAL ANALYSIS</Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>[ CLOSE ]</Text>
          </TouchableOpacity>
        </View>

        {!showResults ? (
          <View style={styles.progressContainer}>
            <View style={styles.eyePreview}>
              {eyeImage && (
                <Image 
                  source={eyeImage} 
                  style={styles.eyeImage}
                  resizeMode="cover"
                />
              )}
              <View style={styles.scanOverlay}>
                <Animated.View 
                  style={[
                    styles.scanLine,
                    {
                      transform: [{
                        translateY: progressAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 100],
                        }),
                      }],
                    },
                  ]}
                />
              </View>
            </View>

            <View style={styles.progressSection}>
              <Text style={styles.progressLabel}>
                {progressState === 'initialising' && 'INITIALISING RETINAL SCANNER...'}
                {progressState === 'scanning' && 'SCANNING RETINAL PATTERNS...'}
                {progressState === 'analyzing' && 'ANALYZING IDENTITY MARKERS...'}
                {progressState === 'ready' && 'IDENTITY CONFIRMED'}
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
                <Text style={styles.viewResultsText}>[ VIEW DOSSIER ]</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsTitle}>IDENTITY SCAN RESULTS</Text>
            <Text style={styles.resultsSubtitle}>DOSSIER UNLOCKED</Text>
            
            {dossier ? (
              <View style={styles.dossierContainer}>
                <View style={styles.dossierRow}>
                  <Text style={styles.dossierLabel}>NAME:</Text>
                  <Text style={styles.dossierValue}>{dossier.name}</Text>
                </View>
                <View style={styles.dossierRow}>
                  <Text style={styles.dossierLabel}>DATE OF BIRTH:</Text>
                  <Text style={styles.dossierValue}>{dossier.dateOfBirth}</Text>
                </View>
                <View style={styles.dossierRow}>
                  <Text style={styles.dossierLabel}>ADDRESS:</Text>
                  <Text style={styles.dossierValue}>{dossier.address}</Text>
                </View>
                <View style={styles.dossierRow}>
                  <Text style={styles.dossierLabel}>OCCUPATION:</Text>
                  <Text style={styles.dossierValue}>{dossier.occupation}</Text>
                </View>
                <View style={styles.dossierRow}>
                  <Text style={styles.dossierLabel}>SEX:</Text>
                  <Text style={styles.dossierValue}>{dossier.sex}</Text>
                </View>
              </View>
            ) : (
              <Text style={styles.noDataText}>DOSSIER DATA UNAVAILABLE</Text>
            )}

            <Text style={styles.noteText}>
              Identity scan matches retinal patterns with credential database.
              Dossier information now accessible for verification.
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
    paddingVertical: 20,
  },
  eyePreview: {
    width: 200,
    height: 150,
    marginBottom: 30,
    position: 'relative',
    borderWidth: 2,
    borderColor: Theme.colors.border,
    overflow: 'hidden',
  },
  eyeImage: {
    width: '100%',
    height: '100%',
  },
  scanOverlay: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  scanLine: {
    position: 'absolute',
    width: '100%',
    height: 2,
    backgroundColor: Theme.colors.accentApprove,
    opacity: 0.8,
  },
  progressSection: {
    width: '100%',
    marginBottom: 30,
  },
  progressLabel: {
    color: Theme.colors.accentApprove,
    fontFamily: Theme.fonts.mono,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
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
    color: Theme.colors.accentApprove,
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
    letterSpacing: 1,
    marginBottom: 24,
    textAlign: 'center',
  },
  dossierContainer: {
    backgroundColor: 'rgba(26, 42, 58, 0.3)',
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  dossierRow: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(127, 184, 216, 0.1)',
  },
  dossierLabel: {
    color: Theme.colors.textSecondary,
    fontFamily: Theme.fonts.mono,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    width: 120,
  },
  dossierValue: {
    color: Theme.colors.textPrimary,
    fontFamily: Theme.fonts.mono,
    fontSize: 11,
    flex: 1,
  },
  noDataText: {
    color: Theme.colors.textDim,
    fontFamily: Theme.fonts.mono,
    fontSize: 11,
    textAlign: 'center',
    letterSpacing: 1,
    marginBottom: 20,
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

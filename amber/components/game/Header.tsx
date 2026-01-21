import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, TouchableOpacity, StyleSheet } from 'react-native';
import { styles } from '../../styles/game/Header.styles';
import { HUDBox } from '../ui/HUDBox';
import { Theme } from '../../constants/theme';

// Emergency event type (simplified for header display)
interface EmergencyAlert {
  title: string;
  rule: string;
}

interface HeaderProps {
  hudStage: 'none' | 'wireframe' | 'outline' | 'full';
  shiftTime?: string;
  shiftData?: any; // Contains stationName, city, authorityLabel
  onSettingsPress?: () => void;
  // Phase 6: Emergency alerts
  emergencyAlert?: EmergencyAlert | null;
  // Credits system
  credits?: number;
  resourcesRemaining?: number;
  resourcesPerShift?: number;
}

export const Header = ({ hudStage, shiftTime, shiftData, onSettingsPress, emergencyAlert, credits, resourcesRemaining, resourcesPerShift }: HeaderProps) => {
  const authorityLabel = shiftData?.authorityLabel || 'СУДЬБА (SUDBA)';
  const letters = authorityLabel.split('');
  
  // Use a ref to store an array of animated values that can grow as needed
  const letterAnims = useRef<Animated.Value[]>([]).current;

  // Ensure we have enough animated values for the current label
  if (letterAnims.length < letters.length) {
    for (let i = letterAnims.length; i < letters.length; i++) {
      letterAnims.push(new Animated.Value(0));
    }
  }

  useEffect(() => {
    // Reset values for the current label's letters
    letters.forEach((_: string, i: number) => {
      if (letterAnims[i]) letterAnims[i].setValue(0);
    });

    if (hudStage === 'outline' || hudStage === 'full') {
      const animations = letters.map((_: string, i: number) => 
        Animated.timing(letterAnims[i], {
          toValue: 1,
          duration: 300,
          delay: i * 50,
          useNativeDriver: true,
        })
      );
      Animated.stagger(50, animations).start();
    }
  }, [hudStage, authorityLabel]);

  // Pulsing animation for emergency alert
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (emergencyAlert) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 0.6, duration: 500, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [emergencyAlert]);

  return (
    <View>
      <HUDBox hudStage={hudStage} style={styles.container}>
        <View style={{ flexDirection: 'column', flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {letters.map((char: string, i: number) => (
              <Animated.Text
                key={`${authorityLabel}-${i}`}
                style={[styles.orgText, { opacity: letterAnims[i] }]}
              >
                {char}
              </Animated.Text>
            ))}
          </View>
          {shiftData && hudStage === 'full' && (
            <TouchableOpacity
              onPress={onSettingsPress}
              style={styles.locationButton}
              hitSlop={{ top: 8, bottom: 8, left: 0, right: 8 }}
            >
              <Text style={styles.locationText}>{shiftData.stationName} — {shiftData.chapter}</Text>
              <Text style={styles.locationArrow}>›</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          {resourcesRemaining !== undefined && resourcesPerShift !== undefined && hudStage === 'full' && (
            <View style={resourcesStyles.resourcesContainer}>
              <Text style={resourcesStyles.resourcesLabel}>RESOURCES</Text>
              <Text style={resourcesStyles.resourcesValue}>{resourcesRemaining}/{resourcesPerShift}</Text>
            </View>
          )}
          {credits !== undefined && hudStage === 'full' && (
            <View style={creditsStyles.creditsContainer}>
              <Text style={creditsStyles.creditsLabel}>CREDITS</Text>
              <Text style={creditsStyles.creditsValue}>{credits}</Text>
            </View>
          )}
        </View>
      </HUDBox>

      {/* Phase 6: Emergency Alert Banner */}
      {emergencyAlert && hudStage === 'full' && (
        <Animated.View style={[emergencyStyles.alertBanner, { opacity: pulseAnim }]}>
          <Text style={emergencyStyles.alertTitle}>⚠ {emergencyAlert.title}</Text>
          <Text style={emergencyStyles.alertRule}>{emergencyAlert.rule}</Text>
        </Animated.View>
      )}
    </View>
  );
};

const emergencyStyles = StyleSheet.create({
  alertBanner: {
    backgroundColor: 'rgba(212, 83, 74, 0.2)',
    borderWidth: 1,
    borderColor: Theme.colors.accentDeny,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 4,
  },
  alertTitle: {
    color: Theme.colors.accentDeny,
    fontFamily: Theme.fonts.mono,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  alertRule: {
    color: Theme.colors.accentDeny,
    fontFamily: Theme.fonts.mono,
    fontSize: 9,
    opacity: 0.9,
    marginTop: 2,
  },
});

const creditsStyles = StyleSheet.create({
  creditsContainer: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  creditsLabel: {
    color: Theme.colors.textSecondary,
    fontFamily: Theme.fonts.mono,
    fontSize: 8,
    letterSpacing: 1,
    opacity: 0.7,
  },
  creditsValue: {
    color: Theme.colors.textPrimary,
    fontFamily: Theme.fonts.mono,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

const resourcesStyles = StyleSheet.create({
  resourcesContainer: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  resourcesLabel: {
    color: Theme.colors.textSecondary,
    fontFamily: Theme.fonts.mono,
    fontSize: 8,
    letterSpacing: 1,
    opacity: 0.7,
  },
  resourcesValue: {
    color: Theme.colors.textPrimary,
    fontFamily: Theme.fonts.mono,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

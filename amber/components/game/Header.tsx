import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { styles } from '../../styles/game/Header.styles';
import { HUDBox } from '../ui/HUDBox';
import { Theme } from '../../constants/theme';
import { LabelTape, LEDIndicator } from '../ui/LabelTape';

// Metal texture
const METAL_TEXTURE = require('../../assets/textures/Texturelabs_Metal_264S.jpg');

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
}

export const Header = ({ hudStage, shiftTime, shiftData, onSettingsPress, emergencyAlert }: HeaderProps) => {
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
      <View style={headerStyles.headerPanel}>
        {/* Metal texture background */}
        <View style={headerStyles.textureContainer}>
          <Image source={METAL_TEXTURE} style={headerStyles.texture} contentFit="cover" />
          <View style={headerStyles.textureTint} />
        </View>
        
        <HUDBox hudStage={hudStage} style={styles.container} mechanical>
          <View style={{ flexDirection: 'column', flex: 1 }}>
            {/* Status LED */}
            <View style={headerStyles.statusRow}>
              <LEDIndicator active={true} color="green" size={6} />
              <Text style={headerStyles.statusText}>ONLINE</Text>
            </View>
            
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {letters.map((char: string, i: number) => (
                <Animated.Text
                  key={`${authorityLabel}-${i}`}
                  style={[styles.orgText, { opacity: letterAnims[i], color: Theme.colors.industrialCream }]}
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
                <LabelTape text={`${shiftData.stationName} — ${shiftData.chapter}`} variant="yellow" size="small" />
                <Text style={[styles.locationArrow, { color: Theme.colors.buttonYellow, marginLeft: 4 }]}>›</Text>
              </TouchableOpacity>
            )}
          </View>
        </HUDBox>
      </View>

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

const headerStyles = StyleSheet.create({
  headerPanel: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 3,
    marginBottom: 4,
    // Inset panel effect
    borderWidth: 2,
    borderTopColor: 'rgba(0,0,0,0.4)',
    borderLeftColor: 'rgba(0,0,0,0.3)',
    borderBottomColor: 'rgba(80,85,95,0.25)',
    borderRightColor: 'rgba(80,85,95,0.2)',
  },
  textureContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  texture: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.12,
  },
  textureTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(28, 32, 40, 0.94)',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  statusText: {
    fontFamily: Theme.fonts.mono,
    fontSize: 7,
    color: Theme.colors.accentApprove,
    letterSpacing: 1,
    fontWeight: '600',
  },
});

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



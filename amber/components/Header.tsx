import React, { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';
import { styles } from '../styles/Header.styles';
import { HUDBox } from './HUDBox';
import { DigitalClockSplitFlap } from './DigitalClockSplitFlap';

interface HeaderProps {
  hudStage: 'none' | 'wireframe' | 'outline' | 'full';
  shiftTime?: string;
  shiftData?: any; // Contains stationName, city, authorityLabel
}

export const Header = ({ hudStage, shiftTime, shiftData }: HeaderProps) => {
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

  return (
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
          <Text style={styles.locationText}>{shiftData.stationName} — {shiftData.city}</Text>
        )}
      </View>
      <View style={styles.signalContainer}>
        <DigitalClockSplitFlap hudStage={hudStage} shiftTime={shiftTime} />
      </View>
    </HUDBox>
  );
};

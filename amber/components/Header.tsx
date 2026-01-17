import React, { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';
import { styles } from '../styles/Header.styles';
import { HUDBox } from './HUDBox';
import { DigitalClockSplitFlap } from './DigitalClockSplitFlap';

export const Header = ({ hudStage }: { hudStage: 'none' | 'wireframe' | 'outline' | 'full' }) => {
  const title = 'СУДЬБА (SUDBA)';
  const letters = title.split('');
  const letterAnims = useRef(letters.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    if (hudStage === 'outline' || hudStage === 'full') {
      const animations = letters.map((_, i) => 
        Animated.timing(letterAnims[i], {
          toValue: 1,
          duration: 300,
          delay: i * 50,
          useNativeDriver: true,
        })
      );
      Animated.stagger(50, animations).start();
    } else {
      letterAnims.forEach(anim => anim.setValue(0));
    }
  }, [hudStage]);

  return (
    <HUDBox hudStage={hudStage} style={styles.container}>
      <View style={{ flexDirection: 'row' }}>
        {letters.map((char, i) => (
          <Animated.Text 
            key={i} 
            style={[styles.orgText, { opacity: letterAnims[i] }]}
          >
            {char}
          </Animated.Text>
        ))}
      </View>
      <View style={styles.signalContainer}>
        <DigitalClockSplitFlap hudStage={hudStage} />
      </View>
    </HUDBox>
  );
};

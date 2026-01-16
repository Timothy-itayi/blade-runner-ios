import React from 'react';
import { View, Text } from 'react-native';
import { styles } from '../styles/Header.styles';
import { HUDBox } from './HUDBox';
import { DigitalClockSplitFlap } from './DigitalClockSplitFlap';

export const Header = ({ hudStage }: { hudStage: 'none' | 'wireframe' | 'outline' | 'full' }) => {
  return (
    <HUDBox hudStage={hudStage} style={styles.container}>
      <Text style={styles.orgText}>СУДЬБА (SUDBA)</Text>
      <View style={styles.signalContainer}>
        <DigitalClockSplitFlap />
      </View>
    </HUDBox>
  );
};

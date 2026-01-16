import React from 'react';
import { View, Text } from 'react-native';
import { styles } from '../styles/Header.styles';
import { HUDBox } from './HUDBox';

export const Header = ({ hudStage }: { hudStage: 'none' | 'wireframe' | 'outline' | 'full' }) => {
  return (
    <HUDBox hudStage={hudStage} style={styles.container}>
      <Text style={styles.orgText}>警察LAPD</Text>
      <View style={styles.signalContainer}>
        <Text style={styles.signalText}>LOW SIGNAL</Text>
        <View style={styles.signalBars}>
          <View style={[styles.bar, styles.barFull]} />
          <View style={[styles.bar, styles.barFull]} />
          <View style={[styles.bar, styles.barDim]} />
          <View style={[styles.bar, styles.barDim]} />
        </View>
      </View>
    </HUDBox>
  );
};

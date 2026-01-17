import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Theme } from '../constants/theme';

export const DigitalClockSplitFlap = ({ hudStage }: { hudStage: 'none' | 'wireframe' | 'outline' | 'full' }) => {
  const [time, setTime] = useState(new Date());
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncValues, setSyncValues] = useState(['0', '0', '0', '0', '0', '0']);

  useEffect(() => {
    if (hudStage === 'outline') {
      setIsSyncing(true);
      let iterations = 0;
      const syncInterval = setInterval(() => {
        setSyncValues(prev => prev.map(() => Math.floor(Math.random() * 10).toString()));
        iterations++;
        if (iterations > 40) {
          clearInterval(syncInterval);
          setIsSyncing(false);
        }
      }, 50);
      return () => clearInterval(syncInterval);
    } else if (hudStage === 'full') {
      setIsSyncing(false);
      const timer = setInterval(() => setTime(new Date()), 1000);
      return () => clearInterval(timer);
    }
  }, [hudStage]);

  const formatTime = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return [hours[0], hours[1], minutes[0], minutes[1], seconds[0], seconds[1]];
  };

  const displayValues = isSyncing ? syncValues : formatTime(time);

  const Flap = ({ value }: { value: string }) => (
    <View style={styles.flap}>
      <Text style={styles.flapText}>{value}</Text>
      <View style={styles.flapDivider} />
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.prefix}>CLOCK</Text>
      <View style={styles.clockRow}>
        <Flap value={displayValues[0]} />
        <Flap value={displayValues[1]} />
        <Text style={styles.separator}>:</Text>
        <Flap value={displayValues[2]} />
        <Flap value={displayValues[3]} />
        <Text style={styles.separator}>:</Text>
        <Flap value={displayValues[4]} />
        <Flap value={displayValues[5]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  prefix: {
    color: Theme.colors.textSecondary,
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
    marginRight: 8,
    fontWeight: '700',
  },
  clockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  flap: {
    backgroundColor: 'rgba(13, 17, 23, 0.8)',
    borderWidth: 1,
    borderColor: Theme.colors.border,
    paddingHorizontal: 3,
    paddingVertical: 1,
    borderRadius: 2,
    minWidth: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flapText: {
    color: Theme.colors.textPrimary,
    fontFamily: Theme.fonts.mono,
    fontSize: 12, // Match the prefix size
    fontWeight: '700',
  },
  flapDivider: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  separator: {
    color: Theme.colors.textDim,
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
    paddingHorizontal: 1,
  },
});

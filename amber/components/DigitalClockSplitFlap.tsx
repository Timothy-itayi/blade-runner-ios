import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Theme } from '../constants/theme';

export const DigitalClockSplitFlap = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return { hours, minutes, seconds };
  };

  const { hours, minutes, seconds } = formatTime(time);

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
        <Flap value={hours[0]} />
        <Flap value={hours[1]} />
        <Text style={styles.separator}>:</Text>
        <Flap value={minutes[0]} />
        <Flap value={minutes[1]} />
        <Text style={styles.separator}>:</Text>
        <Flap value={seconds[0]} />
        <Flap value={seconds[1]} />
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

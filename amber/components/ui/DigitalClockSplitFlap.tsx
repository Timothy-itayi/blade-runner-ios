import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Theme } from '../../constants/theme';

interface ClockProps {
  hudStage: 'none' | 'wireframe' | 'outline' | 'full';
  shiftTime?: string; // e.g. "07:00" - if provided, uses shift time instead of real time
  isTransitioning?: boolean; // triggers the "scramble" effect during shift change
  // Countdown mode props
  countdownActive?: boolean;
  countdownSeconds?: number; // remaining seconds
}

export const DigitalClockSplitFlap = ({ hudStage, shiftTime, isTransitioning, countdownActive, countdownSeconds }: ClockProps) => {
  const [displayTime, setDisplayTime] = useState(['0', '0', '0', '0', '0', '0']);
  const [isSyncing, setIsSyncing] = useState(false);
  const secondsRef = useRef(0);

  // Parse countdown seconds into MM:SS display (only 4 digits needed)
  const parseCountdown = (seconds: number): string[] => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const minsStr = mins.toString().padStart(2, '0');
    const secsStr = secs.toString().padStart(2, '0');
    // Return as 6-digit array but first two are empty for consistent display
    return ['', '', minsStr[0], minsStr[1], secsStr[0], secsStr[1]];
  };

  // Parse shift time into display values
  const parseShiftTime = (time: string): string[] => {
    const [hours, minutes] = time.split(':');
    const secs = secondsRef.current.toString().padStart(2, '0');
    return [hours[0], hours[1], minutes[0], minutes[1], secs[0], secs[1]];
  };

  // Countdown display update
  useEffect(() => {
    if (countdownActive && countdownSeconds !== undefined && hudStage === 'full') {
      setDisplayTime(parseCountdown(countdownSeconds));
    }
  }, [countdownActive, countdownSeconds, hudStage]);

  useEffect(() => {
    // Skip if in countdown mode
    if (countdownActive && countdownSeconds !== undefined) return;

    if (hudStage === 'outline' || isTransitioning) {
      setIsSyncing(true);
      let iterations = 0;
      const syncInterval = setInterval(() => {
        setDisplayTime(prev => prev.map(() => Math.floor(Math.random() * 10).toString()));
        iterations++;
        if (iterations > 40) {
          clearInterval(syncInterval);
          setIsSyncing(false);
        }
      }, 50);
      return () => clearInterval(syncInterval);
    } else if (hudStage === 'full' && shiftTime) {
      // Use shift-based time with incrementing seconds
      setIsSyncing(false);
      const timer = setInterval(() => {
        secondsRef.current = (secondsRef.current + 1) % 60;
        setDisplayTime(parseShiftTime(shiftTime));
      }, 1000);
      // Initial set
      setDisplayTime(parseShiftTime(shiftTime));
      return () => clearInterval(timer);
    } else if (hudStage === 'full') {
      // Fallback to real time if no shift time provided
      setIsSyncing(false);
      const formatTime = (date: Date) => {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const seconds = date.getSeconds().toString().padStart(2, '0');
        return [hours[0], hours[1], minutes[0], minutes[1], seconds[0], seconds[1]];
      };
      const timer = setInterval(() => setDisplayTime(formatTime(new Date())), 1000);
      setDisplayTime(formatTime(new Date()));
      return () => clearInterval(timer);
    }
  }, [hudStage, shiftTime, isTransitioning, countdownActive]);

  // Urgency state when countdown is low
  const isUrgent = countdownActive && countdownSeconds !== undefined && countdownSeconds <= 10;
  const isCritical = countdownActive && countdownSeconds !== undefined && countdownSeconds <= 5;

  // Pulsing animation for urgent state
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isUrgent) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.4,
            duration: isCritical ? 200 : 400,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: isCritical ? 200 : 400,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isUrgent, isCritical]);

  const Flap = ({ value, urgent }: { value: string, urgent?: boolean }) => (
    <View style={[
      styles.flap,
      urgent && styles.flapUrgent,
    ]}>
      <Text style={[
        styles.flapText,
        urgent && styles.flapTextUrgent,
      ]}>{value}</Text>
      <View style={styles.flapDivider} />
    </View>
  );

  const isCountdownMode = countdownActive && countdownSeconds !== undefined;
  const prefixText = isCountdownMode ? 'TIME' : 'CLOCK';

  return (
    <Animated.View style={[styles.container, { opacity: isUrgent ? pulseAnim : 1 }]}>
      <Text style={[styles.prefix, isUrgent && styles.prefixUrgent]}>{prefixText}</Text>
      <View style={styles.clockRow}>
        {/* In countdown mode, only show MM:SS (skip first two digits) */}
        {!isCountdownMode && (
          <>
            <Flap value={displayTime[0]} urgent={isUrgent} />
            <Flap value={displayTime[1]} urgent={isUrgent} />
            <Text style={[styles.separator, isUrgent && styles.separatorUrgent]}>:</Text>
          </>
        )}
        <Flap value={displayTime[2]} urgent={isUrgent} />
        <Flap value={displayTime[3]} urgent={isUrgent} />
        <Text style={[styles.separator, isUrgent && styles.separatorUrgent]}>:</Text>
        <Flap value={displayTime[4]} urgent={isUrgent} />
        <Flap value={displayTime[5]} urgent={isUrgent} />
      </View>
    </Animated.View>
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
  // Urgent/countdown styles
  prefixUrgent: {
    color: Theme.colors.accentDeny,
  },
  flapUrgent: {
    borderColor: Theme.colors.accentDeny,
    backgroundColor: 'rgba(212, 83, 74, 0.15)',
  },
  flapTextUrgent: {
    color: Theme.colors.accentDeny,
  },
  separatorUrgent: {
    color: Theme.colors.accentDeny,
  },
});

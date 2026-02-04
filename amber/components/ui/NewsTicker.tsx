// =============================================================================
// NEWS TICKER - Horizontal scrolling AMBER news crawl
// =============================================================================
// Displays news headlines in a classic ticker-tape style, scrolling
// continuously from right to left. Used for propaganda and world-building.
// Uses the infinite scroll pattern: duplicate content, animate one segment width,
// seamless loop because second copy is identical to first.

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, Easing, LayoutChangeEvent } from 'react-native';
import { Theme } from '../../constants/theme';

interface NewsTickerProps {
  /** Array of headlines to display in sequence */
  headlines: string[];
  /** Speed of scroll in pixels per second (default: 60) */
  speed?: number;
  /** Background color variant */
  variant?: 'default' | 'alert' | 'info';
  /** Whether the ticker is visible */
  visible?: boolean;
  /** Optional prefix label (e.g., "AMBER NEWS") */
  prefix?: string;
}

// Container width for starting off-screen (will be measured)
const OFFSCREEN_START = 800;

export function NewsTicker({
  headlines,
  speed = 60,
  variant = 'default',
  visible = true,
  prefix = 'AMBER NEWS',
}: NewsTickerProps) {
  const scrollAnim = useRef(new Animated.Value(OFFSCREEN_START)).current;
  const [containerWidth, setContainerWidth] = useState(0);
  const [textWidth, setTextWidth] = useState(0);
  const [headlineIndex, setHeadlineIndex] = useState(0);
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);
  const isMounted = useRef(true);

  // Current headline to display
  const currentHeadline = headlines[headlineIndex] ?? '';

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Reset to first headline when headlines array changes
  useEffect(() => {
    setHeadlineIndex(0);
  }, [headlines]);

  // Animate current headline: start off-screen right, scroll to off-screen left, then next
  const runScrollAnimation = useCallback(() => {
    if (!isMounted.current || containerWidth <= 0 || textWidth <= 0) return;

    // Start position: just off the right edge of the container
    const startX = containerWidth;
    // End position: text fully scrolled off left edge
    const endX = -textWidth - 50; // Add buffer to ensure fully offscreen
    // Total distance to travel
    const distance = startX - endX;
    // Duration based on distance and speed
    const duration = (distance / speed) * 1000;

    scrollAnim.setValue(startX);
    animationRef.current = Animated.timing(scrollAnim, {
      toValue: endX,
      duration,
      easing: Easing.linear,
      useNativeDriver: true,
    });

    animationRef.current.start(({ finished }) => {
      if (finished && isMounted.current) {
        // Move to next headline
        setHeadlineIndex((prev) => (prev + 1) % headlines.length);
      }
    });
  }, [containerWidth, textWidth, speed, headlines.length, scrollAnim]);

  // Trigger animation when dimensions are ready or headline changes
  useEffect(() => {
    if (!visible || headlines.length === 0) return;
    if (containerWidth <= 0 || textWidth <= 0) return;

    // Small delay to ensure layout is stable
    const timer = setTimeout(() => {
        runScrollAnimation();
    }, 100);

    return () => {
        clearTimeout(timer);
      if (animationRef.current) {
        animationRef.current.stop();
      }
    };
  }, [visible, headlineIndex, containerWidth, textWidth, runScrollAnimation]);

  // Measure container width
  const onContainerLayout = useCallback((e: LayoutChangeEvent) => {
    const width = e.nativeEvent.layout.width;
    if (width > 0) setContainerWidth(width);
  }, []);

  // Measure text width
  const onTextLayout = useCallback((e: LayoutChangeEvent) => {
    const width = e.nativeEvent.layout.width;
    if (width > 0) setTextWidth(width);
  }, []);

  if (!visible || headlines.length === 0) return null;

  const variantStyles = {
    default: {
      background: 'rgba(6, 18, 26, 0.9)',
      border: Theme.colors.border,
      textColor: Theme.colors.textPrimary,
      prefixColor: Theme.colors.accentWarn,
    },
    alert: {
      background: 'rgba(212, 83, 74, 0.15)',
      border: Theme.colors.accentDeny,
      textColor: Theme.colors.textPrimary,
      prefixColor: Theme.colors.accentDeny,
    },
    info: {
      background: 'rgba(33, 150, 243, 0.1)',
      border: '#2196f3',
      textColor: Theme.colors.textPrimary,
      prefixColor: '#2196f3',
    },
  };

  const colors = variantStyles[variant];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          borderColor: colors.border,
        },
      ]}
    >
      {/* Fixed prefix label */}
      {prefix && (
        <View style={styles.prefixContainer}>
          <Text style={[styles.prefixText, { color: colors.prefixColor }]}>
            {prefix}
          </Text>
        </View>
      )}

      {/* Scrolling ticker area */}
      <View style={styles.tickerContainer} onLayout={onContainerLayout}>
        <Animated.View
          style={[
            styles.tickerContent,
            {
              transform: [{ translateX: scrollAnim }],
            },
          ]}
        >
          <Text
            style={[styles.tickerText, { color: colors.textColor }]}
            onLayout={onTextLayout}
          >
            {currentHeadline}
          </Text>
        </Animated.View>
      </View>

      {/* Decorative end cap */}
      <View style={[styles.endCap, { backgroundColor: colors.border }]}>
        <Text style={styles.endCapText}>◆</Text>
      </View>
    </View>
  );
}

// =============================================================================
// STATIC NEWS TICKER - For displaying a single static message
// =============================================================================

interface StaticNewsTickerProps {
  message: string;
  variant?: 'default' | 'alert' | 'info';
  visible?: boolean;
  prefix?: string;
}

export function StaticNewsTicker({
  message,
  variant = 'default',
  visible = true,
  prefix = 'AMBER',
}: StaticNewsTickerProps) {
  if (!visible) return null;

  const variantStyles = {
    default: {
      background: 'rgba(6, 18, 26, 0.9)',
      border: Theme.colors.border,
      textColor: Theme.colors.textPrimary,
      prefixColor: Theme.colors.accentWarn,
    },
    alert: {
      background: 'rgba(212, 83, 74, 0.15)',
      border: Theme.colors.accentDeny,
      textColor: Theme.colors.textPrimary,
      prefixColor: Theme.colors.accentDeny,
    },
    info: {
      background: 'rgba(33, 150, 243, 0.1)',
      border: '#2196f3',
      textColor: Theme.colors.textPrimary,
      prefixColor: '#2196f3',
    },
  };

  const colors = variantStyles[variant];

  return (
    <View
      style={[
        styles.staticContainer,
        {
          backgroundColor: colors.background,
          borderColor: colors.border,
        },
      ]}
    >
      {prefix && (
        <Text style={[styles.staticPrefix, { color: colors.prefixColor }]}>
          {prefix}:
        </Text>
      )}
      <Text
        style={[styles.staticMessage, { color: colors.textColor }]}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 28,
    borderWidth: 1,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    overflow: 'hidden',
  },
  prefixContainer: {
    paddingHorizontal: 10,
    height: '100%',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  prefixText: {
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  tickerContainer: {
    flex: 1,
    height: '100%',
    overflow: 'hidden',
    justifyContent: 'center',
    position: 'relative', // Ensure absolute child is relative to this
  },
  tickerContent: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignItems: 'center',
    position: 'absolute',
    left: 0,
    height: '100%',
    minWidth: '100%', 
  },
  tickerText: {
    fontFamily: Theme.fonts.mono,
    fontSize: 11,
    letterSpacing: 0.6,
    flexShrink: 0,
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    minWidth: '100%',
  },
  endCap: {
    width: 24,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  endCapText: {
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.3)',
  },
  // Static ticker styles
  staticContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 24,
    paddingHorizontal: 10,
    borderWidth: 1,
    gap: 8,
  },
  staticPrefix: {
    fontFamily: Theme.fonts.mono,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
  },
  staticMessage: {
    flex: 1,
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    letterSpacing: 0.3,
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

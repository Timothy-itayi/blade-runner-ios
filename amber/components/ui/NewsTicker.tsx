// =============================================================================
// NEWS TICKER - Horizontal scrolling AMBER news crawl
// =============================================================================
// Displays news headlines in a classic ticker-tape style, scrolling
// continuously from right to left. Used for propaganda and world-building.
// Uses the infinite scroll pattern: duplicate content, animate one segment width,
// seamless loop because second copy is identical to first.

import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { Theme } from '../../constants/theme';

interface NewsTickerProps {
  /** Array of headlines to display in rotation */
  headlines: string[];
  /** Speed of scroll in pixels per second (default: 50) */
  speed?: number;
  /** Background color variant */
  variant?: 'default' | 'alert' | 'info';
  /** Whether the ticker is visible */
  visible?: boolean;
  /** Optional prefix label (e.g., "AMBER NEWS") */
  prefix?: string;
}

const SEPARATOR = '   ◆   ';

export function NewsTicker({
  headlines,
  speed = 50,
  variant = 'default',
  visible = true,
  prefix = 'AMBER NEWS',
}: NewsTickerProps) {
  const scrollAnim = useRef(new Animated.Value(0)).current;
  const [textWidth, setTextWidth] = useState(0);
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);
  const isMounted = useRef(true);

  // Combine all headlines into one scrolling string (one segment)
  const combinedText = headlines.join(SEPARATOR) + SEPARATOR;

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!visible || headlines.length === 0 || textWidth <= 0) {
      scrollAnim.setValue(0);
      return;
    }

    // Duration for one segment to scroll through
    const duration = (textWidth / speed) * 1000;

    // Recursive animation: animate one full segment, then reset and repeat
    // Reset is invisible because the duplicate content is identical
    const runAnimation = () => {
      if (!isMounted.current) return;

      scrollAnim.setValue(0);
      animationRef.current = Animated.timing(scrollAnim, {
        toValue: -textWidth,
        duration,
        easing: Easing.linear,
        useNativeDriver: true,
      });

      animationRef.current.start(({ finished }) => {
        if (finished && isMounted.current) {
          runAnimation();
        }
      });
    };

    runAnimation();

    return () => {
      if (animationRef.current) {
        animationRef.current.stop();
      }
      scrollAnim.stopAnimation();
    };
  }, [visible, headlines, speed, textWidth]);

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
      <View style={styles.tickerContainer}>
        <Animated.View
          style={[
            styles.tickerContent,
            {
              transform: [{ translateX: scrollAnim }],
            },
          ]}
        >
          {/* First copy - measure this one */}
          <Text
            style={[styles.tickerText, { color: colors.textColor }]}
            onLayout={(e) => {
              const width = e.nativeEvent.layout.width;
              if (width > 0 && textWidth === 0) {
                setTextWidth(width);
              }
            }}
          >
            {combinedText}
          </Text>
          {/* Second copy - seamless continuation */}
          <Text style={[styles.tickerText, { color: colors.textColor }]}>
            {combinedText}
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
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  tickerContainer: {
    flex: 1,
    height: '100%',
    overflow: 'hidden',
    justifyContent: 'center',
  },
  tickerContent: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignItems: 'center',
    paddingLeft: 10,
  },
  tickerText: {
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    letterSpacing: 0.5,
    flexShrink: 0,
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
  },
});

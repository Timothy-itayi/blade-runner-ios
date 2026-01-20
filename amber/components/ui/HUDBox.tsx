import React, { useEffect, useRef, useState } from 'react';
import { View, Animated, StyleSheet, Easing, LayoutChangeEvent } from 'react-native';
import { Theme } from '../../constants/theme';

export const Blinker = () => {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 100, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 100, useNativeDriver: true }),
        Animated.delay(Math.random() * 500),
      ])
    ).start();
  }, []);

  return (
    <Animated.View style={[styles.blinker, { opacity }]} />
  );
};

export const DrawingBorder = ({ active, duration = 1000, delay = 0, color }: { active: boolean, duration?: number, delay?: number, color?: string }) => {
  const topWidth = useRef(new Animated.Value(0)).current;
  const rightHeight = useRef(new Animated.Value(0)).current;
  const bottomWidth = useRef(new Animated.Value(0)).current;
  const leftHeight = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (active) {
      const segmentDuration = duration / 4;
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(topWidth, { toValue: 1, duration: segmentDuration, easing: Easing.linear, useNativeDriver: false }),
        Animated.timing(rightHeight, { toValue: 1, duration: segmentDuration, easing: Easing.linear, useNativeDriver: false }),
        Animated.timing(bottomWidth, { toValue: 1, duration: segmentDuration, easing: Easing.linear, useNativeDriver: false }),
        Animated.timing(leftHeight, { toValue: 1, duration: segmentDuration, easing: Easing.linear, useNativeDriver: false }),
      ]).start();
    } else {
      topWidth.setValue(0);
      rightHeight.setValue(0);
      bottomWidth.setValue(0);
      leftHeight.setValue(0);
    }
  }, [active]);

  const borderColor = color || Theme.colors.border;

  return (
    <View style={StyleSheet.absoluteFill}>
      <Animated.View style={[styles.borderSegment, { top: 0, left: 0, height: 1, backgroundColor: borderColor, width: topWidth.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }]} />
      <Animated.View style={[styles.borderSegment, { top: 0, right: 0, width: 1, backgroundColor: borderColor, height: rightHeight.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }]} />
      <Animated.View style={[styles.borderSegment, { bottom: 0, right: 0, height: 1, backgroundColor: borderColor, width: bottomWidth.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }]} />
      <Animated.View style={[styles.borderSegment, { bottom: 0, left: 0, width: 1, backgroundColor: borderColor, height: leftHeight.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }]} />
    </View>
  );
};

export const HUDBox = ({ children, hudStage, style, buildDelay = 0 }: { children: React.ReactNode, hudStage: 'none' | 'wireframe' | 'outline' | 'full', style?: any, buildDelay?: number }) => {
  const contentOpacity = useRef(new Animated.Value(hudStage === 'full' ? 1 : 0)).current;

  useEffect(() => {
    if (hudStage === 'full') {
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 1000,
        delay: buildDelay,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }).start();
    }
  }, [hudStage]);

  if (hudStage === 'none') return null;

  const flatStyle = StyleSheet.flatten(style) || {};
  
  const {
    flex,
    flexDirection,
    justifyContent,
    alignItems,
    padding,
    paddingHorizontal,
    paddingVertical,
    paddingTop,
    paddingBottom,
    paddingLeft,
    paddingRight,
    gap,
    height,
    width,
    ...containerStyle
  } = flatStyle;

  return (
    <View style={[
      containerStyle,
      flex ? { flex } : {},
      height ? { height } : {},
      width ? { width } : {},
      { backgroundColor: 'transparent' }
    ]}>
      <DrawingBorder active={hudStage !== 'none'} delay={buildDelay} />
      
      <Animated.View style={[
        { opacity: contentOpacity },
        (flex || height) ? { flex: 1 } : {},
        {
          flexDirection,
          justifyContent,
          alignItems,
          padding,
          paddingHorizontal,
          paddingVertical,
          paddingTop,
          paddingBottom,
          paddingLeft,
          paddingRight,
          gap,
        }
      ]}>
        {children}
      </Animated.View>
      {hudStage !== 'full' && <Blinker />}
    </View>
  );
};

const styles = StyleSheet.create({
  blinker: {
    width: 4,
    height: 4,
    backgroundColor: Theme.colors.accentWarn,
    position: 'absolute',
    top: 4,
    right: 4,
  },
  borderSegment: {
    position: 'absolute',
  },
});

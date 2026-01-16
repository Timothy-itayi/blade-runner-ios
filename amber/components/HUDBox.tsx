import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Easing } from 'react-native';
import { Theme } from '../constants/theme';

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

export const HUDBox = ({ children, hudStage, style }: { children: React.ReactNode, hudStage: 'none' | 'wireframe' | 'outline' | 'full', style?: any }) => {
  const scaleX = useRef(new Animated.Value(hudStage === 'full' ? 1 : 0)).current;
  const scaleY = useRef(new Animated.Value(hudStage === 'full' ? 1 : 0.01)).current;
  const contentOpacity = useRef(new Animated.Value(hudStage === 'full' ? 1 : 0)).current;

  useEffect(() => {
    if (hudStage === 'wireframe') {
      Animated.timing(scaleX, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
    } else if (hudStage === 'outline') {
      scaleX.setValue(1);
      Animated.timing(scaleY, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
    } else if (hudStage === 'full') {
      scaleX.setValue(1);
      scaleY.setValue(1);
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 1500,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }).start();
    }
  }, [hudStage]);

  if (hudStage === 'none') return null;

  const flatStyle = StyleSheet.flatten(style) || {};
  
  // Extract layout props to apply to the inner Animated.View
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
    ...containerStyle
  } = flatStyle;

  return (
    <Animated.View style={[
      containerStyle,
      flex ? { flex } : {}, // Pass flex to outer container
      { transform: [{ scaleX }, { scaleY }] },
      hudStage !== 'full' && { borderColor: 'rgba(26, 42, 58, 0.5)', backgroundColor: 'transparent' }
    ]}>
      <Animated.View style={[
        { opacity: contentOpacity },
        flex ? { flex: 1 } : {}, // Only flex: 1 if the parent has flex
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
    </Animated.View>
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
});

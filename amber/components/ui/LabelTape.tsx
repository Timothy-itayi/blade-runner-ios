import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Theme } from '../../constants/theme';

interface LabelTapeProps {
  /** Label text */
  text: string;
  /** Tape color variant */
  variant?: 'cream' | 'yellow' | 'red' | 'green' | 'black';
  /** Size variant */
  size?: 'small' | 'medium' | 'large';
  /** Additional style */
  style?: ViewStyle;
  /** Text style override */
  textStyle?: TextStyle;
  /** Show adhesive edge effect */
  showEdge?: boolean;
}

/**
 * LabelTape - Embossed label tape style heading
 * 
 * Mimics those classic DYMO label makers used on vintage equipment.
 * Features:
 * - Tape-like background with subtle texture
 * - Embossed text appearance
 * - Slightly uneven edges
 * - Shadow for depth
 */
export const LabelTape: React.FC<LabelTapeProps> = ({
  text,
  variant = 'cream',
  size = 'medium',
  style,
  textStyle,
  showEdge = true,
}) => {
  const colorStyles = {
    cream: styles.variantCream,
    yellow: styles.variantYellow,
    red: styles.variantRed,
    green: styles.variantGreen,
    black: styles.variantBlack,
  };

  const sizeStyles = {
    small: styles.sizeSmall,
    medium: styles.sizeMedium,
    large: styles.sizeLarge,
  };

  const textSizeStyles = {
    small: styles.textSmall,
    medium: styles.textMedium,
    large: styles.textLarge,
  };

  const textColorStyles = {
    cream: styles.textDark,
    yellow: styles.textDark,
    red: styles.textLight,
    green: styles.textLight,
    black: styles.textLight,
  };

  return (
    <View style={[styles.container, style]}>
      {/* Shadow layer */}
      <View style={styles.shadowLayer} />
      
      {/* Main tape */}
      <View style={[styles.tape, colorStyles[variant], sizeStyles[size]]}>
        {/* Subtle texture overlay */}
        <View style={styles.textureOverlay} />
        
        {/* Embossed text */}
        <Text style={[
          styles.text,
          textSizeStyles[size],
          textColorStyles[variant],
          textStyle,
        ]}>
          {text}
        </Text>
        
        {/* Edge effects */}
        {showEdge && (
          <>
            <View style={styles.leftEdge} />
            <View style={styles.rightEdge} />
          </>
        )}
      </View>
    </View>
  );
};

/**
 * LEDIndicator - Small LED light for status indication
 */
interface LEDIndicatorProps {
  /** LED on/off state */
  active?: boolean;
  /** LED color when active */
  color?: 'green' | 'red' | 'yellow' | 'blue';
  /** LED size */
  size?: number;
  /** Pulsing animation */
  pulsing?: boolean;
  /** Additional style */
  style?: ViewStyle;
}

export const LEDIndicator: React.FC<LEDIndicatorProps> = ({
  active = false,
  color = 'green',
  size = 8,
  pulsing = false,
  style,
}) => {
  const colors = {
    green: { on: '#4ade80', off: '#1a3d25', glow: 'rgba(74,222,128,0.6)' },
    red: { on: '#ef4444', off: '#3d1a1a', glow: 'rgba(239,68,68,0.6)' },
    yellow: { on: '#facc15', off: '#3d351a', glow: 'rgba(250,204,21,0.6)' },
    blue: { on: '#3b82f6', off: '#1a253d', glow: 'rgba(59,130,246,0.6)' },
  };

  const ledColors = colors[color];

  return (
    <View style={[styles.ledContainer, { width: size, height: size }, style]}>
      {/* LED bezel */}
      <View style={[styles.ledBezel, { width: size, height: size }]}>
        {/* LED lens */}
        <View 
          style={[
            styles.ledLens,
            {
              width: size - 2,
              height: size - 2,
              backgroundColor: active ? ledColors.on : ledColors.off,
              shadowColor: active ? ledColors.glow : 'transparent',
              shadowOpacity: active ? 0.8 : 0,
            },
          ]}
        >
          {/* Highlight */}
          {active && (
            <View 
              style={[
                styles.ledHighlight,
                { width: size / 3, height: size / 3 },
              ]} 
            />
          )}
        </View>
      </View>
    </View>
  );
};

/**
 * ControlGroup - Container for grouping controls with a label
 */
interface ControlGroupProps {
  children: React.ReactNode;
  label?: string;
  style?: ViewStyle;
}

export const ControlGroup: React.FC<ControlGroupProps> = ({
  children,
  label,
  style,
}) => {
  return (
    <View style={[styles.controlGroup, style]}>
      {label && (
        <LabelTape text={label} size="small" variant="cream" />
      )}
      <View style={styles.controlGroupContent}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    marginBottom: 2,
  },
  shadowLayer: {
    position: 'absolute',
    top: 2,
    left: 1,
    right: -1,
    bottom: -2,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 1,
  },
  tape: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 1,
    overflow: 'hidden',
  },
  textureOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.03)',
    // Simulate subtle tape texture
  },
  text: {
    fontFamily: Theme.fonts.mono,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    // Subtle embossed effect
    textShadowColor: 'rgba(255,255,255,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 0,
  },
  leftEdge: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  rightEdge: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  // Color variants
  variantCream: {
    backgroundColor: Theme.colors.industrialCream,
  },
  variantYellow: {
    backgroundColor: '#f0c040',
  },
  variantRed: {
    backgroundColor: '#c53030',
  },
  variantGreen: {
    backgroundColor: '#276749',
  },
  variantBlack: {
    backgroundColor: '#1a1d22',
  },
  // Size variants
  sizeSmall: {
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  sizeMedium: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  sizeLarge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  // Text sizes
  textSmall: {
    fontSize: 7,
    letterSpacing: 1,
  },
  textMedium: {
    fontSize: 9,
    letterSpacing: 1.2,
  },
  textLarge: {
    fontSize: 11,
    letterSpacing: 1.5,
  },
  // Text colors
  textDark: {
    color: '#1a1a1a',
  },
  textLight: {
    color: '#f0f0f0',
  },
  // LED styles
  ledContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  ledBezel: {
    borderRadius: 100,
    backgroundColor: '#1a1d22',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.5)',
    borderLeftColor: 'rgba(0,0,0,0.4)',
    borderBottomColor: 'rgba(255,255,255,0.15)',
    borderRightColor: 'rgba(255,255,255,0.1)',
  },
  ledLens: {
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'flex-start',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 4,
    elevation: 2,
  },
  ledHighlight: {
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 100,
    marginLeft: 1,
    marginTop: 1,
  },
  // Control group
  controlGroup: {
    gap: 4,
  },
  controlGroupContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});

export default LabelTape;

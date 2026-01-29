import React from 'react';
import { View, StyleSheet, ViewStyle, Text } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '../../constants/theme';

// Metal texture assets
const METAL_TEXTURE_1 = require('../../assets/textures/Texturelabs_Metal_264S.jpg');
const METAL_TEXTURE_2 = require('../../assets/textures/Texturelabs_Metal_295S.jpg');

interface ChassisFrameProps {
  children: React.ReactNode;
  style?: ViewStyle;
  /** Show corner screws */
  screws?: boolean;
  /** Metal texture variant */
  textureVariant?: 1 | 2;
  /** Inset depth for screen area */
  insetDepth?: 'shallow' | 'deep';
  /** Show ventilation slots */
  ventSlots?: boolean;
  /** Frame color tint */
  tint?: string;
}

/**
 * ChassisFrame - Physical device frame with metal/plastic texture
 * 
 * Creates the illusion of a physical CRT device chassis with:
 * - Metal texture background
 * - Corner screws
 * - Inset screen bezel
 * - Ventilation slots
 * - Beveled edges
 */
export const ChassisFrame: React.FC<ChassisFrameProps> = ({
  children,
  style,
  screws = true,
  textureVariant = 1,
  insetDepth = 'deep',
  ventSlots = false,
  tint = 'rgba(32, 36, 44, 0.85)',
}) => {
  const textureSource = textureVariant === 1 ? METAL_TEXTURE_1 : METAL_TEXTURE_2;
  
  return (
    <View style={[styles.container, style]}>
      {/* Metal texture background */}
      <View style={styles.textureContainer}>
        <Image
          source={textureSource}
          style={styles.texture}
          contentFit="cover"
        />
        {/* Tint overlay to blend with theme */}
        <View style={[styles.textureTint, { backgroundColor: tint }]} />
      </View>

      {/* Outer bezel - raised edge effect */}
      <View style={styles.outerBezel}>
        <LinearGradient
          colors={['rgba(80,85,95,0.6)', 'rgba(20,22,28,0.4)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.bezelGradient}
        />
      </View>

      {/* Corner screws */}
      {screws && (
        <>
          <Screw position="topLeft" />
          <Screw position="topRight" />
          <Screw position="bottomLeft" />
          <Screw position="bottomRight" />
        </>
      )}

      {/* Ventilation slots */}
      {ventSlots && (
        <View style={styles.ventContainer}>
          {[...Array(5)].map((_, i) => (
            <View key={i} style={styles.ventSlot} />
          ))}
        </View>
      )}

      {/* Inner screen inset */}
      <View style={[
        styles.screenInset,
        insetDepth === 'deep' ? styles.screenInsetDeep : styles.screenInsetShallow
      ]}>
        {/* Screen bezel - inset shadow effect */}
        <View style={styles.screenBezel}>
          <LinearGradient
            colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.2)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.bezelInnerGradient}
          />
        </View>
        
        {/* Content area */}
        <View style={styles.contentArea}>
          {children}
        </View>
      </View>
    </View>
  );
};

/**
 * Screw - Decorative screw component for chassis corners
 */
interface ScrewProps {
  position: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
  size?: number;
}

export const Screw: React.FC<ScrewProps> = ({ position, size = 12 }) => {
  const positionStyles: Record<string, ViewStyle> = {
    topLeft: { top: 6, left: 6 },
    topRight: { top: 6, right: 6 },
    bottomLeft: { bottom: 6, left: 6 },
    bottomRight: { bottom: 6, right: 6 },
  };

  return (
    <View style={[styles.screw, positionStyles[position], { width: size, height: size }]}>
      <View style={styles.screwHead}>
        <View style={styles.screwSlot} />
        <View style={[styles.screwSlot, styles.screwSlotCross]} />
      </View>
      <View style={styles.screwHighlight} />
    </View>
  );
};

/**
 * InsetPanel - Recessed panel area within chassis
 */
interface InsetPanelProps {
  children: React.ReactNode;
  style?: ViewStyle;
  depth?: 'shallow' | 'medium' | 'deep';
}

export const InsetPanel: React.FC<InsetPanelProps> = ({
  children,
  style,
  depth = 'medium',
}) => {
  const depthStyles = {
    shallow: styles.insetShallow,
    medium: styles.insetMedium,
    deep: styles.insetDeep,
  };

  return (
    <View style={[styles.insetPanel, depthStyles[depth], style]}>
      <View style={styles.insetShadow} />
      {children}
    </View>
  );
};

/**
 * Faceplate - Raised panel section with label area
 */
interface FaceplateProps {
  children: React.ReactNode;
  label?: string;
  style?: ViewStyle;
}

export const Faceplate: React.FC<FaceplateProps> = ({
  children,
  label,
  style,
}) => {
  return (
    <View style={[styles.faceplate, style]}>
      {label && (
        <View style={styles.faceplateLabel}>
          <Text style={styles.faceplateLabelText}>{label}</Text>
        </View>
      )}
      <View style={styles.faceplateContent}>
        {children}
      </View>
    </View>
  );
};

/**
 * NoiseOverlay - Subtle static noise texture
 */
export const NoiseOverlay: React.FC<{ opacity?: number }> = ({ opacity = 0.03 }) => (
  <View style={[styles.noiseOverlay, { opacity }]} pointerEvents="none">
    {/* Using a pattern of tiny dots to simulate noise */}
    {[...Array(100)].map((_, i) => (
      <View
        key={i}
        style={[
          styles.noiseDot,
          {
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            opacity: 0.3 + Math.random() * 0.7,
          },
        ]}
      />
    ))}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.bgDark,
    borderRadius: 4,
    overflow: 'hidden',
  },
  textureContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  texture: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.4,
  },
  textureTint: {
    ...StyleSheet.absoluteFillObject,
  },
  outerBezel: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 3,
    borderRadius: 4,
    borderTopColor: 'rgba(100,105,115,0.5)',
    borderLeftColor: 'rgba(100,105,115,0.4)',
    borderBottomColor: 'rgba(10,12,16,0.8)',
    borderRightColor: 'rgba(10,12,16,0.7)',
    zIndex: 1,
  },
  bezelGradient: {
    flex: 1,
    opacity: 0.1,
  },
  screw: {
    position: 'absolute',
    zIndex: 10,
    borderRadius: 100,
    backgroundColor: '#2a2e36',
    justifyContent: 'center',
    alignItems: 'center',
    // 3D effect
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 3,
  },
  screwHead: {
    width: '100%',
    height: '100%',
    borderRadius: 100,
    backgroundColor: '#3a3e46',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    borderLeftColor: 'rgba(255,255,255,0.15)',
    borderBottomColor: 'rgba(0,0,0,0.4)',
    borderRightColor: 'rgba(0,0,0,0.3)',
  },
  screwSlot: {
    position: 'absolute',
    width: '60%',
    height: 2,
    backgroundColor: '#1a1d22',
    borderRadius: 1,
  },
  screwSlotCross: {
    transform: [{ rotate: '90deg' }],
  },
  screwHighlight: {
    position: 'absolute',
    top: 2,
    left: 2,
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  ventContainer: {
    position: 'absolute',
    top: 20,
    right: 8,
    gap: 3,
    zIndex: 5,
  },
  ventSlot: {
    width: 20,
    height: 3,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 1,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  screenInset: {
    flex: 1,
    margin: 8,
    borderRadius: 3,
    overflow: 'hidden',
    zIndex: 2,
  },
  screenInsetDeep: {
    margin: 10,
    borderWidth: 3,
    borderTopColor: 'rgba(0,0,0,0.6)',
    borderLeftColor: 'rgba(0,0,0,0.5)',
    borderBottomColor: 'rgba(60,65,75,0.4)',
    borderRightColor: 'rgba(60,65,75,0.3)',
  },
  screenInsetShallow: {
    margin: 6,
    borderWidth: 2,
    borderTopColor: 'rgba(0,0,0,0.4)',
    borderLeftColor: 'rgba(0,0,0,0.3)',
    borderBottomColor: 'rgba(60,65,75,0.3)',
    borderRightColor: 'rgba(60,65,75,0.2)',
  },
  screenBezel: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  bezelInnerGradient: {
    flex: 1,
    opacity: 0.2,
  },
  contentArea: {
    flex: 1,
    zIndex: 2,
  },
  insetPanel: {
    backgroundColor: 'rgba(10,12,16,0.8)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  insetShallow: {
    borderWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.4)',
    borderLeftColor: 'rgba(0,0,0,0.3)',
    borderBottomColor: 'rgba(80,85,95,0.2)',
    borderRightColor: 'rgba(80,85,95,0.15)',
  },
  insetMedium: {
    borderWidth: 2,
    borderTopColor: 'rgba(0,0,0,0.5)',
    borderLeftColor: 'rgba(0,0,0,0.4)',
    borderBottomColor: 'rgba(80,85,95,0.3)',
    borderRightColor: 'rgba(80,85,95,0.25)',
  },
  insetDeep: {
    borderWidth: 3,
    borderTopColor: 'rgba(0,0,0,0.6)',
    borderLeftColor: 'rgba(0,0,0,0.5)',
    borderBottomColor: 'rgba(80,85,95,0.4)',
    borderRightColor: 'rgba(80,85,95,0.3)',
  },
  insetShadow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  faceplate: {
    backgroundColor: Theme.colors.bgMechanical,
    borderRadius: 2,
    borderWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.15)',
    borderLeftColor: 'rgba(255,255,255,0.1)',
    borderBottomColor: 'rgba(0,0,0,0.4)',
    borderRightColor: 'rgba(0,0,0,0.3)',
    padding: 4,
  },
  faceplateLabel: {
    backgroundColor: Theme.colors.industrialCream,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginBottom: 4,
    alignSelf: 'flex-start',
  },
  faceplateLabelText: {
    fontFamily: Theme.fonts.mono,
    fontSize: 8,
    fontWeight: 'bold',
    color: '#1a1d22',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  faceplateContent: {
    flex: 1,
  },
  noiseOverlay: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  noiseDot: {
    position: 'absolute',
    width: 1,
    height: 1,
    backgroundColor: '#fff',
  },
});

export default ChassisFrame;

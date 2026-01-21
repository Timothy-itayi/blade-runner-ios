import { StyleSheet } from 'react-native';
import { Theme } from '../../constants/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 3,
    backgroundColor: Theme.colors.bgDark, // Darker frame
    borderWidth: 1,
    borderColor: Theme.colors.border,
    padding: 8, // Padding for monitor frame
    overflow: 'hidden',
    borderRadius: 4, // Outer frame slight rounding
  },
  videoWrapper: {
    flex: 1,
    position: 'relative',
    borderRadius: 8, // More pronounced rounding for the monitor screen
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(26, 42, 58, 0.8)',
    backgroundColor: '#000', // Screen black base
  },
  video: {
    width: '100%',
    height: '100%',
  },
  zoomContainer: {
    width: '100%',
    height: '100%',
  },
  staticOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: .2,
    zIndex: 5,
  },
  laserLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: Theme.colors.accentWarn,
    zIndex: 8,
  },
  irisScanLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: Theme.colors.accentApprove,
    shadowColor: Theme.colors.accentApprove,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 4,
    zIndex: 9,
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.2,
    zIndex: 10,
  },
  gridLine: {
    position: 'absolute',
    backgroundColor: Theme.colors.grid,
  },
  verticalLine: {
    width: 1,
    height: '100%',
  },
  horizontalLine: {
    width: '100%',
    height: 1,
  },
  reticle: {
    position: 'absolute',
    top: '25%',
    left: '25%',
    width: '50%',
    height: '50%',
    borderWidth: 1,
    borderColor: Theme.colors.accentWarn,
    opacity: 0.5,
  },
  reticleCorner: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderColor: Theme.colors.accentWarn,
    borderWidth: 2,
  },
  topLeft: { top: -2, left: -2, borderBottomWidth: 0, borderRightWidth: 0 },
  topRight: { top: -2, right: -2, borderBottomWidth: 0, borderLeftWidth: 0 },
  bottomLeft: { bottom: -2, left: -2, borderTopWidth: 0, borderRightWidth: 0 },
  bottomRight: { bottom: -2, right: -2, borderTopWidth: 0, borderLeftWidth: 0 },
  labelContainer: {
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
    zIndex: 15,
  },
  labelBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Theme.colors.bgDark,
    opacity: 0.7,
  },
  labelText: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  circularContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  circularBorder: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 1,
    borderColor: 'rgba(201, 162, 39, 0.3)',
    borderStyle: 'dashed',
  },
  eyeOverlay: {
    backgroundColor: 'transparent',
    zIndex: 6,
  },
  channelButtonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 20,
  },
  channelToggleButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(26, 42, 58, 0.8)',
    borderWidth: 1,
    borderColor: Theme.colors.textSecondary,
    borderRadius: 2,
    minWidth: 100,
  },
  channelToggleText: {
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    color: Theme.colors.textSecondary,
    letterSpacing: 1,
    fontWeight: '600',
    textAlign: 'center',
  },
});

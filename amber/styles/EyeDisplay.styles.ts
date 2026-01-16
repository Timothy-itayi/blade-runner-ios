import { StyleSheet } from 'react-native';
import { Theme } from '../constants/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 3,
    backgroundColor: Theme.colors.bgPanel,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    overflow: 'hidden',
  },
  videoWrapper: {
    flex: 1,
    position: 'relative',
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
});

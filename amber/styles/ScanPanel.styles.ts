import { StyleSheet } from 'react-native';
import { Theme } from '../constants/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 2,
    backgroundColor: Theme.colors.bgPanel,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    padding: 8,
  },
  fingerprintSection: {
    marginBottom: 16,
  },
  fingerprintHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 4,
  },
  headerText: {
    color: Theme.colors.textSecondary,
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    marginBottom: 2,
  },
  fingerprintSlots: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
  },
  fingerprintContainer: {
    width: 48,
    height: 64,
    borderWidth: 1,
    borderColor: 'rgba(74, 138, 90, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 12, 15, 0.6)',
    borderRadius: 2,
  },
  fingerprintImage: {
    width: '100%',
    height: '100%',
    opacity: 0.7,
    tintColor: '#4a8a5a',
  },
  flippedFingerprint: {
    transform: [{ scaleX: -1 }],
  },
  scanningCircle: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'rgba(74, 138, 90, 0.8)',
    borderRadius: 100,
  },
  minutiaeContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  minutiaeDot: {
    position: 'absolute',
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#d4534a', // accentDeny
    zIndex: 10,
  },
  minutiaeCircle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: '#d4534a',
    backgroundColor: 'rgba(212, 83, 74, 0.1)',
  },
  minutiaeLine: {
    position: 'absolute',
    height: 0.5,
    backgroundColor: '#d4534a',
    opacity: 0.6,
  },
  minutiaeText: {
    position: 'absolute',
    color: '#d4534a',
    fontFamily: Theme.fonts.mono,
    fontSize: 5,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  matchSection: {
    marginBottom: 12,
  },
  label: {
    color: Theme.colors.textSecondary,
    fontFamily: Theme.fonts.mono,
    fontSize: 9,
    marginBottom: 4,
  },
  matchIndicators: {
    flexDirection: 'row',
    gap: 4,
  },
  indicator: {
    width: 18,
    height: 18,
    borderWidth: 1,
    borderColor: Theme.colors.grid,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeIndicator: {
    borderColor: Theme.colors.textPrimary,
  },
  indicatorText: {
    color: Theme.colors.textDim,
    fontFamily: Theme.fonts.mono,
    fontSize: 9,
  },
  activeIndicatorText: {
    color: Theme.colors.textPrimary,
    fontWeight: '700',
  },
  locationGrid: {
    marginBottom: 8,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
    paddingTop: 8,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  gridBox: {
    width: 12,
    height: 12,
    borderWidth: 1,
    borderColor: Theme.colors.textPrimary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridDot: {
    width: 4,
    height: 4,
    backgroundColor: Theme.colors.textPrimary,
  },
  gridLabel: {
    color: Theme.colors.textSecondary,
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    fontWeight: '700',
  },
  dataRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  dataLabel: {
    color: Theme.colors.textDim,
    fontFamily: Theme.fonts.mono,
    fontSize: 8,
    width: 35,
  },
  dataValue: {
    color: Theme.colors.textSecondary,
    fontFamily: Theme.fonts.mono,
    fontSize: 8,
  },
  visualizer: {
    marginTop: 'auto',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
  },
  visualizerText: {
    color: Theme.colors.textDim,
    fontFamily: Theme.fonts.mono,
    fontSize: 8,
    letterSpacing: 1,
  },
});

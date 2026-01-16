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
    paddingHorizontal: 10,
  },
  asciiFingerprint: {
    color: Theme.colors.textDim,
    fontFamily: Theme.fonts.mono,
    fontSize: 6,
    lineHeight: 7,
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

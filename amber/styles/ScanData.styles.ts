import { StyleSheet } from 'react-native';
import { Theme } from '../constants/theme';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
  },
  leftColumn: {
    flex: 1,
  },
  rightColumn: {
    flex: 2,
    alignItems: 'flex-start',
    paddingLeft: 20,
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(26, 42, 58, 0.4)',
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  gridBox: {
    width: 12,
    height: 12,
    borderWidth: 1,
    borderColor: Theme.colors.accentWarn,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridDot: {
    width: 4,
    height: 4,
    backgroundColor: Theme.colors.accentWarn,
  },
  gridLabel: {
    color: Theme.colors.accentWarn,
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  locGrid: {
    width: '100%',
    gap: 4,
  },
  locRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 30,
  },
  dataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 100,
  },
  dataLabel: {
    color: Theme.colors.textDim,
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    width: 45,
  },
  dataValue: {
    color: Theme.colors.textSecondary,
    fontFamily: Theme.fonts.mono,
    fontSize: 11,
  },
  label: {
    color: Theme.colors.textSecondary,
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 2,
  },
  idCode: {
    color: Theme.colors.textPrimary,
    fontFamily: Theme.fonts.mono,
    fontSize: 14,
    letterSpacing: 1,
  },
  identHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  bpmMonitoring: {
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    color: Theme.colors.textSecondary,
  },
  idSection: {
    marginTop: 4,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  progressBarText: {
    fontFamily: Theme.fonts.mono,
    fontSize: 14,
    letterSpacing: 2,
  },
  progressLabel: {
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  metaLabel: {
    color: Theme.colors.textSecondary,
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
  },
  bpmRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Theme.colors.accentDeny,
  },
  heartOutline: {
    flexDirection: 'row',
    width: 120,
    height: 4,
    gap: 4,
  },
  heartLine: {
    height: '100%',
    width: '60%',
    backgroundColor: Theme.colors.textPrimary,
  },
});

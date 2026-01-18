import { StyleSheet } from 'react-native';
import { Theme } from '../constants/theme';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 18,
    
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  orgText: {
    color: Theme.colors.textPrimary,
    fontFamily: Theme.fonts.mono,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 2,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    backgroundColor: 'rgba(26, 42, 58, 0.5)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: 'rgba(74, 106, 122, 0.3)',
    alignSelf: 'flex-start',
  },
  locationText: {
    color: Theme.colors.textSecondary,
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    letterSpacing: 1,
  },
  locationArrow: {
    color: Theme.colors.textDim,
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
    marginLeft: 8,
  },
  signalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  signalText: {
    color: Theme.colors.textSecondary,
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
    marginRight: 8,
  },
  signalBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
  },
  bar: {
    width: 4,
    backgroundColor: Theme.colors.textDim,
  },
  barFull: {
    backgroundColor: Theme.colors.textSecondary,
  },
  barDim: {
    opacity: 0.3,
  },
});

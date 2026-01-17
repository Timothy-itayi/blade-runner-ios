import { StyleSheet } from 'react-native';
import { Theme } from '../constants/theme';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 2, // Keep it tight to the bottom
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(26, 42, 58, 0.5)',
    backgroundColor: Theme.colors.bgDark,
  },
  button: {
    flex: 1,
    height: 54, // Slightly shorter to prevent overflow
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1, // Cleaner than 2
    borderColor: Theme.colors.border,
    backgroundColor: Theme.colors.bgPanel,
  },
  approveButton: {
    backgroundColor: 'rgba(74, 138, 90, 0.3)',
    borderColor: Theme.colors.accentApprove,
  },
  denyButton: {
    backgroundColor: 'rgba(212, 83, 74, 0.3)',
    borderColor: Theme.colors.accentDeny,
  },
  buttonText: {
    color: Theme.colors.textPrimary,
    fontFamily: Theme.fonts.mono,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
});

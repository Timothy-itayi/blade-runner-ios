import { StyleSheet } from 'react-native';
import { Theme } from '../constants/theme';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
  },
  button: {
    flex: 1,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
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

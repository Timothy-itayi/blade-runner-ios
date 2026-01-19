import { StyleSheet } from 'react-native';
import { Theme } from '../constants/theme';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 2,
    borderTopWidth: 1,
    borderTopColor: 'rgba(26, 42, 58, 0.5)',
    backgroundColor: Theme.colors.bgDark,
  },
  protocolStatus: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    marginBottom: 10,
  },
  protocolStatusComplete: {
    // No additional styling needed
  },
  protocolText: {
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  protocolComplete: {
    color: Theme.colors.accentApprove,
  },
  protocolPending: {
    color: '#FF6B35',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
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
  buttonDisabled: {
    opacity: 0.25,
    backgroundColor: 'rgba(26, 42, 58, 0.2)',
    borderColor: Theme.colors.textDim,
  },
  buttonText: {
    color: Theme.colors.textPrimary,
    fontFamily: Theme.fonts.mono,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  buttonTextDisabled: {
    color: Theme.colors.textDim,
  },
});

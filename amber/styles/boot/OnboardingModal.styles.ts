import { StyleSheet } from 'react-native';
import { Theme } from '../../constants/theme';

export const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Theme.colors.bgDark,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    width: '100%',
    position: 'relative',
    minHeight: 320,
    justifyContent: 'center',
  },
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerContent: {
    width: '100%',
    paddingHorizontal: 8,
  },
  // Terminal line styling
  terminalLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  prompt: {
    color: Theme.colors.textDim,
    fontFamily: Theme.fonts.mono,
    fontSize: 14,
    width: 20,
    marginRight: 8,
  },
  text: {
    color: Theme.colors.textPrimary,
    fontFamily: Theme.fonts.mono,
    fontSize: 14,
    letterSpacing: 0.5,
  },
  textDim: {
    color: Theme.colors.textDim,
  },
  textStatus: {
    color: Theme.colors.textSecondary,
    fontSize: 13,
  },
  textStatusValue: {
    color: Theme.colors.accentApprove,
    fontWeight: '700',
  },
  textOperatorId: {
    color: Theme.colors.accentApprove,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 1,
  },
  textClearance: {
    color: Theme.colors.textPrimary,
    fontSize: 13,
  },
  // Review - primary/white
  textReview: {
    color: Theme.colors.textPrimary,
    fontWeight: '700',
    fontSize: 15,
  },
  // Verify - orange
  textVerify: {
    color: Theme.colors.accentWarn,
    fontWeight: '700',
    fontSize: 15,
  },
  // Decide - red
  textDecide: {
    color: Theme.colors.accentDeny,
    fontWeight: '700',
    fontSize: 15,
  },
  // Always check credentials - yellow/warn
  textCredentialWarn: {
    color: Theme.colors.accentWarn,
    fontWeight: '700',
    fontSize: 14,
  },
  textSecondary: {
    color: Theme.colors.textSecondary,
    fontSize: 13,
  },
  textFinality: {
    color: Theme.colors.textDim,
    fontSize: 12,
    fontStyle: 'italic',
  },
  spacer: {
    height: 16,
  },
  spacerSmall: {
    height: 8,
  },
  beginButton: {
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderWidth: 2,
    borderColor: Theme.colors.accentApprove,
    backgroundColor: 'rgba(74, 138, 90, 0.15)',
  },
  beginButtonPressed: {
    backgroundColor: 'rgba(74, 138, 90, 0.3)',
  },
  beginButtonText: {
    color: Theme.colors.accentApprove,
    fontFamily: Theme.fonts.mono,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 3,
  },
});

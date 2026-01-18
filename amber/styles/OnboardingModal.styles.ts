import { StyleSheet } from 'react-native';
import { Theme } from '../constants/theme';

export const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Theme.colors.bgDark, // Changed to solid background to hide game
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    width: '100%',
    alignItems: 'center',
    position: 'relative',
    height: 340,
    justifyContent: 'center',
  },
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialButton: {
    padding: 20,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    backgroundColor: Theme.colors.bgPanel,
  },
  innerContent: {
    position: 'absolute',
    width: '100%',
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  border: {
    color: Theme.colors.textSecondary,
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
    position: 'absolute',
  },
  text: {
    color: Theme.colors.textPrimary,
    fontFamily: Theme.fonts.mono,
    fontSize: 15,
    textAlign: 'center',
    marginVertical: 2,
    letterSpacing: 0.5,
  },
  textStatus: {
    color: Theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  textStatusValue: {
    color: Theme.colors.accentApprove,
  },
  textOperatorId: {
    color: Theme.colors.accentApprove,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 2,
  },
  textClearance: {
    color: Theme.colors.textPrimary,
    fontSize: 15,
  },
  textInstruction: {
    color: Theme.colors.textPrimary,
    fontSize: 15,
    letterSpacing: 1,
  },
  textReview: {
    color: Theme.colors.accentWarn,
  },
  textDecide: {
    color: Theme.colors.textPrimary,
  },
  textConfirm: {
    color: Theme.colors.accentApprove,
  },
  textPropaganda: {
    color: Theme.colors.textSecondary,
    fontSize: 13,
    fontStyle: 'italic',
  },
  textFinality: {
    color: Theme.colors.textSecondary,
    fontSize: 14,
  },
  spacer: {
    height: 18,
  },
  beginButton: {
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: Theme.colors.textPrimary,
  },
  beginButtonPressed: {
    backgroundColor: 'rgba(127, 184, 216, 0.2)',
  },
  beginButtonText: {
    color: Theme.colors.textPrimary,
    fontFamily: Theme.fonts.mono,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 2,
  },
  buttonText: {
    color: Theme.colors.textPrimary,
    fontFamily: Theme.fonts.mono,
    fontSize: 16,
    fontWeight: '700',
  },
});

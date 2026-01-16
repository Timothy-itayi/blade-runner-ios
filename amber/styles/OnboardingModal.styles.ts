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
    height: 300,
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
    fontSize: 14,
    textAlign: 'center',
    marginVertical: 2,
  },
  spacer: {
    height: 16,
  },
  button: {
    marginTop: 20,
    padding: 10,
  },
  buttonText: {
    color: Theme.colors.textPrimary,
    fontFamily: Theme.fonts.mono,
    fontSize: 16,
    fontWeight: '700',
  },
});

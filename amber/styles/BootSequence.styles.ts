import { StyleSheet } from 'react-native';
import { Theme } from '../constants/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.bgDark,
    padding: 20,
    justifyContent: 'flex-start',
  },
  logContainer: {
    flex: 1,
    marginTop: 40,
  },
  logText: {
    color: Theme.colors.textPrimary,
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    lineHeight: 14,
    marginBottom: 2,
  },
  progressContainer: {
    height: 30,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    marginBottom: 40,
    justifyContent: 'center',
    padding: 2,
  },
  progressBar: {
    height: '100%',
    backgroundColor: Theme.colors.textPrimary,
  },
  statusText: {
    color: Theme.colors.textSecondary,
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
});

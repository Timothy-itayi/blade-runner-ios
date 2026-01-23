import { StyleSheet } from 'react-native';
import { Theme } from '../../constants/theme';

export const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(6, 8, 10, 0.98)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 520,
    alignItems: 'center',
    gap: 16,
  },
  card: {
    width: '100%',
    borderWidth: 1,
    borderColor: Theme.colors.border,
    backgroundColor: 'rgba(13, 17, 23, 0.85)',
    padding: 18,
  },
  title: {
    color: Theme.colors.textPrimary,
    fontFamily: Theme.fonts.mono,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  body: {
    gap: 8,
  },
  bodyText: {
    color: Theme.colors.textSecondary,
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
    lineHeight: 18,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Theme.colors.textDim,
    backgroundColor: 'transparent',
  },
  dotActive: {
    borderColor: Theme.colors.accentWarn,
    backgroundColor: 'rgba(201, 162, 39, 0.6)',
  },
  actions: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: Theme.colors.textSecondary,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(13, 17, 23, 0.6)',
  },
  actionButtonPrimary: {
    flex: 1,
    borderWidth: 1,
    borderColor: Theme.colors.accentWarn,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(201, 162, 39, 0.12)',
  },
  actionButtonDisabled: {
    opacity: 0.35,
  },
  actionButtonPressed: {
    backgroundColor: 'rgba(127, 184, 216, 0.18)',
  },
  actionText: {
    color: Theme.colors.textPrimary,
    fontFamily: Theme.fonts.mono,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  actionTextPrimary: {
    color: Theme.colors.accentWarn,
    fontFamily: Theme.fonts.mono,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.4,
  },
});

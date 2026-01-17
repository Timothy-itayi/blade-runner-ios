import { StyleSheet } from 'react-native';
import { Theme } from '../constants/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(127, 184, 216, 0.2)',
    paddingBottom: 4,
  },
  subjectNo: {
    color: Theme.colors.accentWarn,
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  arrestRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  label: {
    color: Theme.colors.textSecondary,
    fontFamily: Theme.fonts.mono,
    fontSize: 13,
    fontWeight: '700',
  },
  value: {
    color: Theme.colors.textPrimary,
    fontFamily: Theme.fonts.mono,
    fontSize: 14,
    fontWeight: '700',
  },
  warningText: {
    color: Theme.colors.accentDeny,
    fontWeight: '700',
  },
  bentoContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  reasonSection: {
    flex: 1,
    padding: 14,
    backgroundColor: 'rgba(26, 42, 58, 0.3)',
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  verifyRevealButton: {
    width: 110,
    height: 80,
    borderWidth: 1,
    borderColor: Theme.colors.accentWarn,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(201, 162, 39, 0.15)',
  },
  verifyButtonText: {
    color: Theme.colors.accentWarn,
    fontFamily: Theme.fonts.mono,
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 14,
  },
  reasonLabel: {
    color: Theme.colors.textPrimary,
    fontFamily: Theme.fonts.mono,
   
    fontSize: 13,
   
    marginBottom: 6,
    letterSpacing: 1,
  },
  requestedSectorHighlight: {
    color: Theme.colors.accentWarn, // Bright contrast color
    fontWeight: '900',
    fontSize: 13,
    letterSpacing: 4,
  },
  reasonValue: {
    color: Theme.colors.textPrimary,
    fontFamily: Theme.fonts.mono,
    fontSize: 13,
    fontStyle: 'italic',
    lineHeight: 18,
  },
});

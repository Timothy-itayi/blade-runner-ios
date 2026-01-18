import { StyleSheet } from 'react-native';
import { Theme } from '../constants/theme';

export const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    zIndex: 1000,
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: Theme.colors.bgPanel,
    borderTopWidth: 2,
    borderTopColor: Theme.colors.border,
    padding: 20,
    minHeight: 300,
  },
  header: {
    color: Theme.colors.textPrimary,
    fontFamily: Theme.fonts.mono,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 20,
    letterSpacing: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButtonText: {
    color: Theme.colors.accentWarn,
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
    fontWeight: '700',
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  verifyButton: {
    width: '47%',
    height: 50,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(26, 42, 58, 0.3)',
  },
  queryComplete: {
    borderColor: Theme.colors.accentApprove,
    backgroundColor: 'rgba(74, 138, 90, 0.15)',
  },
  queryCompleteText: {
    color: Theme.colors.accentApprove,
  },
  lockedButton: {
    borderColor: Theme.colors.textDim,
    backgroundColor: 'rgba(10, 12, 15, 0.5)',
    opacity: 0.5,
  },
  buttonText: {
    color: Theme.colors.textPrimary,
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    textAlign: 'center',
  },
  lockedText: {
    color: Theme.colors.textDim,
  },
  resultContainer: {
    padding: 16,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    backgroundColor: 'rgba(10, 12, 15, 0.5)',
  },
  resultTitle: {
    color: Theme.colors.textPrimary,
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
    marginBottom: 12,
    textDecorationLine: 'underline',
  },
  resultRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  resultLabel: {
    color: Theme.colors.textPrimary,
    fontFamily: Theme.fonts.mono,
    fontSize: 11,
    width: 100,
  },
  resultValue: {
    color: Theme.colors.textPrimary,
    fontFamily: Theme.fonts.mono,
    fontSize: 11,
  },
  statusText: {
    marginTop: 16,
    fontFamily: Theme.fonts.mono,
    color: Theme.colors.textPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  authorized: { color: Theme.colors.accentApprove },
  restricted: { color: Theme.colors.accentDeny },
  flagged: { color: Theme.colors.accentWarn },
  closeButton: {
    marginTop: 20,
    alignSelf: 'center',
    padding: 10,
  },
  closeText: {
    color: Theme.colors.textPrimary,
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
  },
  // Incident History styles
  incidentEntry: {
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(127, 184, 216, 0.1)',
  },
  incidentHeader: {
    color: Theme.colors.textPrimary,
    fontFamily: Theme.fonts.mono,
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
  },
  incidentDetail: {
    color: Theme.colors.textSecondary,
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    marginLeft: 8,
  },
  // Dialogue Analysis styles
  dialogueBox: {
    backgroundColor: 'rgba(127, 184, 216, 0.05)',
    padding: 10,
    marginBottom: 12,
    borderLeftWidth: 2,
    borderLeftColor: Theme.colors.textSecondary,
  },
  dialogueQuote: {
    color: Theme.colors.textPrimary,
    fontFamily: Theme.fonts.mono,
    fontSize: 11,
    fontStyle: 'italic',
  },
  flagHeader: {
    color: Theme.colors.textSecondary,
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    marginTop: 12,
    marginBottom: 6,
    letterSpacing: 1,
  },
  flagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  flagIcon: {
    color: Theme.colors.accentWarn,
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    marginRight: 6,
  },
  flagKeyword: {
    color: Theme.colors.accentWarn,
    fontFamily: Theme.fonts.mono,
    fontSize: 11,
    fontWeight: '700',
  },
  flagCategory: {
    color: Theme.colors.textDim,
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
  },
});

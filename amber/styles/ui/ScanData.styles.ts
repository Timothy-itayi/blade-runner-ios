import { StyleSheet } from 'react-native';
import { Theme } from '../../constants/theme';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
  },
  leftColumn: {
    flex: 1.4,
  },
  rightColumn: {
    flex: 1,
    alignItems: 'flex-start',
    paddingLeft: 16,
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(26, 42, 58, 0.4)',
    justifyContent: 'center',
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  gridBox: {
    width: 12,
    height: 12,
    borderWidth: 1,
    borderColor: Theme.colors.accentWarn,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridDot: {
    width: 4,
    height: 4,
    backgroundColor: Theme.colors.accentWarn,
  },
  gridLabel: {
    color: Theme.colors.accentWarn,
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  locGrid: {
    width: '100%',
    gap: 4,
  },
  locRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 2,
  },
  dataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 2,
  },
  dataLabel: {
    color: Theme.colors.textDim,
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    width: 45,
  },
  dataValue: {
    color: Theme.colors.textSecondary,
    fontFamily: Theme.fonts.mono,
    fontSize: 11,
  },
  label: {
    color: Theme.colors.textSecondary,
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 2,
  },
  idCode: {
    color: Theme.colors.textPrimary,
    fontFamily: Theme.fonts.mono,
    fontSize: 14,
    letterSpacing: 1,
  },
  identHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
    gap: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  bpmMonitoring: {
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    color: Theme.colors.textSecondary,
  },
  idSection: {
    marginTop: 2,
  },
  verificationRow: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 2,
    marginTop: 4,
  },
  verificationLabel: {
    color: Theme.colors.textDim,
    fontFamily: Theme.fonts.mono,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
  },
  verificationTicks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  verificationTick: {
    width: 8,
    height: 6,
    borderWidth: 1,
    borderColor: Theme.colors.textDim,
    backgroundColor: 'transparent',
  },
  verificationTickActive: {
    borderColor: Theme.colors.textPrimary,
    backgroundColor: Theme.colors.textPrimary,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 1,
  },
  progressBarText: {
    fontFamily: Theme.fonts.mono,
    fontSize: 14,
    letterSpacing: 2,
  },
  progressLabel: {
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  metaLabel: {
    color: Theme.colors.textSecondary,
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
  },
  bpmRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Theme.colors.accentDeny,
  },
  heartOutline: {
    flexDirection: 'row',
    width: 120,
    height: 4,
    gap: 4,
  },
  heartLine: {
    height: '100%',
    width: '60%',
    backgroundColor: Theme.colors.textPrimary,
  },
  // Credential Button Styles
  credentialButton: {
    width: '100%',
    borderWidth: 1,
    borderColor: Theme.colors.textPrimary,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: 'rgba(127, 184, 216, 0.08)',
  },
  credentialButtonPressed: {
    backgroundColor: 'rgba(127, 184, 216, 0.2)',
  },
  credentialButtonText: {
    color: Theme.colors.textPrimary,
    fontFamily: Theme.fonts.mono,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  credentialReceivedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    marginTop: 4,
  },
  credentialReceivedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Theme.colors.accentApprove,
  },
  credentialReceivedText: {
    color: Theme.colors.accentApprove,
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  credentialButtonReceived: {
    borderColor: Theme.colors.accentApprove,
    backgroundColor: 'rgba(74, 138, 90, 0.15)',
  },
  credentialButtonTextReceived: {
    color: Theme.colors.accentApprove,
  },
  credentialReceivedDotActive: {
    backgroundColor: Theme.colors.accentApprove,
    shadowColor: Theme.colors.accentApprove,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  credentialReceivedTextActive: {
    color: Theme.colors.accentApprove,
    fontWeight: '900',
  },
  bioScanButton: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(74, 138, 90, 0.1)',
    borderWidth: 1,
    borderColor: Theme.colors.accentApprove,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanButton: {
    width: '100%',
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    borderWidth: 1,
  },
  identityScanButton: {
    backgroundColor: 'rgba(127, 184, 216, 0.1)',
    borderColor: Theme.colors.textSecondary,
  },
  healthScanButton: {
    backgroundColor: 'rgba(201, 162, 39, 0.1)',
    borderColor: Theme.colors.accentWarn,
  },
  healthAudioPanel: {
    width: '100%',
    marginTop: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(26, 42, 58, 0.25)',
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  healthAudioPanelDisabled: {
    opacity: 0.35,
  },
  healthAudioLabel: {
    color: Theme.colors.textPrimary,
    fontFamily: Theme.fonts.mono,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 6,
  },
  healthAudioLabelDisabled: {
    color: Theme.colors.textDim,
  },
  healthAudioButton: {
    width: '100%',
    paddingVertical: 6,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(26, 42, 58, 0.45)',
    borderWidth: 1,
    borderColor: Theme.colors.textSecondary,
    marginBottom: 6,
  },
  healthAudioButtonDisabled: {
    borderColor: Theme.colors.textDim,
    backgroundColor: 'rgba(26, 42, 58, 0.2)',
  },
  healthAudioButtonText: {
    color: Theme.colors.textPrimary,
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
  },
  healthAudioButtonTextDisabled: {
    color: Theme.colors.textDim,
  },
  healthAudioStatus: {
    color: Theme.colors.textSecondary,
    fontFamily: Theme.fonts.mono,
    fontSize: 8,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  healthAudioStatusDisabled: {
    color: Theme.colors.textDim,
  },
  eyeScannerButton: {
    backgroundColor: 'rgba(26, 42, 58, 0.3)',
    borderColor: Theme.colors.border,
    marginTop: 4,
  },
  eyeScannerButtonActive: {
    backgroundColor: 'rgba(74, 138, 90, 0.2)',
    borderColor: Theme.colors.accentApprove,
  },
  channelToggleText: {
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    color: Theme.colors.textPrimary,
    letterSpacing: 1,
    fontWeight: '600',
  },
  eyeScannerTextActive: {
    color: Theme.colors.accentApprove,
  },
  channelToggleButtonDisabled: {
    opacity: 0.3,
    borderColor: Theme.colors.textDim,
  },
  channelToggleTextDisabled: {
    color: Theme.colors.textDim,
  },
  // Subject Response Styles
  responseBox: {
    marginTop: 6,
    marginLeft: -4, 
    // Move box more to the left
    width: '100%',
    backgroundColor: 'black'
  },
  responseHeader: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  responseField: {
    // Keep a stable layout height so the UI doesn't jump as content changes.
    // Sized for header + ~4 lines of response text at 18px lineHeight.
    minHeight: 14 + 6 + 18 * 3,
    paddingHorizontal: 4,
    paddingVertical: 6,
    backgroundColor: 'rgba(13, 17, 23, 0.65)', // Theme.colors.bgPanel w/ opacity
    borderWidth: 1,
    borderColor: 'rgba(26, 42, 58, 0.55)', // Theme.colors.border w/ opacity
  },
  responseLabel: {
    color: Theme.colors.textSecondary,
    fontFamily: Theme.fonts.mono,
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  responseText: {
    color: Theme.colors.textPrimary,
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
    lineHeight: 18,
    fontStyle: 'italic',
    // Ensure long responses wrap cleanly instead of truncating/clipping.
    flexShrink: 1,
    width: '100%',
  },
  interrogationResponseText: {
    color: Theme.colors.accentApprove,
  },
  agitatedText: {
    letterSpacing: 0,
  },
  brokenText: {
    letterSpacing: 1,
    opacity: 0.9,
  },
  silentText: {
    color: Theme.colors.textDim,
    fontStyle: 'normal',
  },
});

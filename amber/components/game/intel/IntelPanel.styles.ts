import { StyleSheet } from 'react-native';
import { Theme } from '@/constants/theme';

export const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
    minHeight: 220, // Increased height to accommodate question and response
    flex: 1, // Utilize available space
  },
  mainRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  actionButton: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  verifyButton: {
    borderColor: Theme.colors.accentWarn,
    backgroundColor: 'rgba(201, 162, 39, 0.1)',
  },
  dossierButton: {
    borderColor: Theme.colors.textSecondary,
    backgroundColor: 'rgba(127, 184, 216, 0.1)',
  },
  dossierButtonLarge: {
    // The dossier card is a single-button view; make this a real tap target.
    flex: 0,
    alignSelf: 'stretch',
    height: 72,
  },
  dossierPreview: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(74, 106, 122, 0.35)',
    backgroundColor: 'rgba(26, 42, 58, 0.18)',
    padding: 12,
    justifyContent: 'space-between',
  },
  dossierPreviewDisabled: {
    opacity: 0.45,
  },
  dossierPreviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dossierPreviewPhoto: {
    width: 48,
    height: 60,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    backgroundColor: 'rgba(10, 12, 15, 0.35)',
  },
  dossierPreviewIdentity: {
    flex: 1,
    gap: 2,
  },
  dossierPreviewName: {
    color: Theme.colors.textPrimary,
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  dossierPreviewId: {
    color: Theme.colors.textDim,
    fontFamily: Theme.fonts.mono,
    fontSize: 9,
    letterSpacing: 1,
  },
  dossierPreviewBody: {
    gap: 6,
    marginTop: 10,
  },
  dossierPreviewRow: {
    flexDirection: 'row',
    gap: 10,
  },
  dossierPreviewLabel: {
    width: 78,
    color: Theme.colors.textDim,
    fontFamily: Theme.fonts.mono,
    fontSize: 8,
    letterSpacing: 1,
  },
  dossierPreviewValue: {
    flex: 1,
    color: Theme.colors.textPrimary,
    fontFamily: Theme.fonts.mono,
    fontSize: 9,
    letterSpacing: 0.3,
    opacity: 0.92,
  },
  dossierPreviewFooter: {
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(26, 42, 58, 0.35)',
  },
  dossierPreviewHint: {
    color: Theme.colors.textSecondary,
    fontFamily: Theme.fonts.mono,
    fontSize: 8,
    letterSpacing: 1,
    opacity: 0.8,
  },
  interrogateButton: {
    borderColor: Theme.colors.accentApprove,
    backgroundColor: 'rgba(74, 138, 90, 0.1)',
  },
  // Phase 4: Credential request button
  credentialButton: {
    borderColor: Theme.colors.textPrimary,
    backgroundColor: 'rgba(127, 184, 216, 0.15)',
  },
  credentialButtonText: {
    color: Theme.colors.textPrimary,
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  actionButtonDisabled: {
    opacity: 0.3,
    borderColor: Theme.colors.textDim,
  },
  actionButtonText: {
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
  },
  verifyButtonText: {
    color: Theme.colors.accentWarn,
  },
  dossierButtonText: {
    color: Theme.colors.textSecondary,
  },
  interrogateButtonText: {
    color: Theme.colors.accentApprove,
  },
  actionButtonTextDisabled: {
    color: Theme.colors.textDim,
  },
  // Phase 4: Greeting styles
  greetingLabel: {
    color: Theme.colors.textSecondary,
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
  },
  greetingText: {
    color: Theme.colors.textPrimary,
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
    lineHeight: 18,
    fontStyle: 'italic',
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
  // Phase 4: Credential styles
  credentialItem: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(26, 42, 58, 0.5)',
    paddingBottom: 8,
    marginBottom: 8,
  },
  credentialHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  credentialType: {
    color: Theme.colors.textPrimary,
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  credentialNumber: {
    color: Theme.colors.textSecondary,
    fontFamily: Theme.fonts.mono,
    fontSize: 9,
    letterSpacing: 0.6,
    marginTop: 2,
    marginBottom: 4,
    opacity: 0.9,
  },
  credentialDetail: {
    color: Theme.colors.textPrimary,
    fontFamily: Theme.fonts.mono,
    fontSize: 8,
    letterSpacing: 0.2,
    marginTop: 2,
    lineHeight: 12,
  },
  credentialExpirationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  credentialWarning: {
    color: Theme.colors.accentDeny,
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
  },
  anomalyBadge: {
    color: Theme.colors.accentWarn,
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
    fontWeight: '700',
  },
  anomalyText: {
    color: Theme.colors.accentWarn,
    fontFamily: Theme.fonts.mono,
    fontSize: 9,
    marginTop: 4,
  },
  suspiciousSection: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(201, 162, 39, 0.3)',
  },
  suspiciousLabel: {
    color: Theme.colors.accentWarn,
    fontFamily: Theme.fonts.mono,
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 4,
  },
  suspiciousItem: {
    color: Theme.colors.accentWarn,
    fontFamily: Theme.fonts.mono,
    fontSize: 9,
    letterSpacing: 0.5,
    opacity: 0.8,
  },
  // Phase 4: Investigation layout styles
  investigationContainer: {
    flex: 1,
  },
  investigationCarousel: {
    flex: 1,
  },
  investigationCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    backgroundColor: 'rgba(10, 12, 15, 0.45)',
    padding: 10,
    gap: 6,
  },
  investigationCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(26, 42, 58, 0.35)',
  },
  investigationNavHint: {
    color: Theme.colors.textDim,
    fontFamily: Theme.fonts.mono,
    fontSize: 7,
    letterSpacing: 1,
    opacity: 0.7,
  },
  sectionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 12,
  },
  investigationSection: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  sectionHeader: {
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(26, 42, 58, 0.3)',
  },
  sectionLabel: {
    color: Theme.colors.textPrimary,
    fontFamily: Theme.fonts.mono,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  sectionHint: {
    color: Theme.colors.textDim,
    fontFamily: Theme.fonts.mono,
    fontSize: 7,
    letterSpacing: 0.3,
    opacity: 0.6,
  },
  responseBox: {
    flex: 1,
    backgroundColor: 'rgba(10, 12, 15, 0.4)',
    borderWidth: 1,
    borderColor: Theme.colors.border,
    padding: 8,
    marginTop: 8,
  },
  gestureTarget: {
    width: '100%',
    height: 50,
  },
  // Verification: bottom-edge swipe handle (no "button" UI)
  verificationSwipeZone: {
    width: '100%',
    height: 28,
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(201, 162, 39, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  verificationSwipeZoneDisabled: {
    opacity: 0.35,
  },
  verificationSwipeGrip: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: Theme.colors.accentWarn,
    opacity: 0.75,
  },
  verificationSwipeProgressFill: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    height: 2,
    backgroundColor: Theme.colors.accentWarn,
  },
  // Phase 3: Credentials swipe styles
  swipeIndicator: {
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 4,
  },
  swipeIndicatorText: {
    color: Theme.colors.textDim,
    fontFamily: Theme.fonts.mono,
    fontSize: 8,
    letterSpacing: 1,
    opacity: 0.6,
  },
  credentialSwipeArea: {
    flex: 1,
    height: 60,
    justifyContent: 'center',
    position: 'relative',
  },
  sliderTrack: {
    backgroundColor: 'rgba(10, 12, 15, 0.8)',
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: 0, // Hard edges
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 0,
  },
  sliderHandle: {
    width: 60,
    height: 58,
    borderRadius: 0, // Hard edges
    backgroundColor: 'rgba(27, 126, 184, 0.1)',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: Theme.colors.textPrimary,
    zIndex: 3,
    justifyContent: 'center',
    alignItems: 'flex-start', // Align the handle content to the left
    flexDirection: 'row',
    position: 'absolute',
    left: 0, // Ensure handle hugs the left—start of gate row
    top: 0,
    paddingTop: 4,
  },
  gateContainer: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 5, // Start gates after the handle's initial width
    paddingRight: 12,
    zIndex: 1,
  },
  gateMark: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.3,
  },
  gateMarkActive: {
    opacity: 1,
  },
  gateIcon: {
    color: Theme.colors.textDim,
    fontSize: 14,
  },
  gateIconActive: {
    color: Theme.colors.accentApprove,
    textShadowColor: Theme.colors.accentApprove,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  sliderHandleText: {
    color: Theme.colors.textPrimary,
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  sliderLabel: {
    position: 'absolute',
    right: 12,
    color: Theme.colors.textDim,
    fontFamily: Theme.fonts.mono,
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 1,
    zIndex: 2,
    pointerEvents: 'none',
  },
  credentialDrawerHandle: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Theme.colors.textPrimary,
    backgroundColor: 'rgba(127, 184, 216, 0.05)',
    position: 'relative',
    borderRadius: 2,
  },
  drawerProgressBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: 2,
    backgroundColor: Theme.colors.accentApprove,
  },
});


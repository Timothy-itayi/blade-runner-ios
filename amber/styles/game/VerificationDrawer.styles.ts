import { StyleSheet } from 'react-native';
import { Theme } from '../../constants/theme';

export const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    zIndex: 1000,
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#0a0c0f',
    borderTopWidth: 1,
    borderTopColor: '#2a3a4a',
    maxHeight: '70%',
  },

  // Terminal Header
  terminalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#0d1117',
    borderBottomWidth: 1,
    borderBottomColor: '#1a2a3a',
  },
  tabBar: {
    flexDirection: 'row',
  },
  tab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#1a2a3a',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: '#2a3a4a',
  },
  tabActive: {
    backgroundColor: '#0a0c0f',
    borderColor: Theme.colors.accentWarn,
  },
  tabText: {
    fontFamily: Theme.fonts.mono,
    fontSize: 11,
    color: Theme.colors.accentWarn,
    letterSpacing: 0.5,
  },
  subjectRef: {
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    color: Theme.colors.textDim,
  },

  // Terminal Body
  terminalBody: {
    padding: 16,
    minHeight: 200,
  },

  // Prompt & Output
  promptBlock: {
    marginBottom: 8,
  },
  promptLine: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  promptSymbol: {
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
    color: Theme.colors.accentApprove,
    marginRight: 8,
    fontWeight: '700',
  },
  promptCommand: {
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
    color: Theme.colors.textSecondary,
  },
  logNotice: {
    fontFamily: Theme.fonts.mono,
    fontSize: 9,
    color: Theme.colors.textDim,
    marginLeft: 16,
    letterSpacing: 0.5,
  },
  responseHeader: {
    fontFamily: Theme.fonts.mono,
    fontSize: 11,
    color: Theme.colors.textDim,
    marginTop: 8,
    marginBottom: 4,
    letterSpacing: 1,
  },
  divider: {
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    color: '#2a3a4a',
    marginVertical: 8,
  },
  outputLine: {
    flexDirection: 'row',
    marginVertical: 2,
  },
  outputLabel: {
    fontFamily: Theme.fonts.mono,
    fontSize: 11,
    color: Theme.colors.textDim,
    width: 140,
  },
  outputValue: {
    fontFamily: Theme.fonts.mono,
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
  },

  // Status colors
  statusOk: { color: Theme.colors.accentApprove },
  statusWarn: { color: Theme.colors.accentWarn },
  statusError: { color: Theme.colors.accentDeny },
  statusDim: { color: Theme.colors.textSecondary },
  statusNeutral: { color: Theme.colors.textPrimary },

  // Warrant Check Styles
  warrantCard: {
    padding: 16,
    marginVertical: 8,
    borderWidth: 2,
    borderLeftWidth: 4,
  },
  warrantCardDanger: {
    backgroundColor: 'rgba(212, 83, 74, 0.12)',
    borderColor: 'rgba(212, 83, 74, 0.4)',
    borderLeftColor: Theme.colors.accentDeny,
  },
  warrantCardClear: {
    backgroundColor: 'rgba(74, 138, 90, 0.1)',
    borderColor: 'rgba(74, 138, 90, 0.3)',
    borderLeftColor: Theme.colors.accentApprove,
  },
  warrantCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  warrantCardIcon: {
    fontFamily: Theme.fonts.mono,
    fontSize: 18,
    marginRight: 10,
  },
  warrantCardLabel: {
    fontFamily: Theme.fonts.mono,
    fontSize: 11,
    color: Theme.colors.textDim,
    letterSpacing: 1,
  },
  warrantCardValue: {
    fontFamily: Theme.fonts.mono,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 2,
  },
  warrantStatsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginVertical: 8,
  },
  warrantStatBox: {
    flex: 1,
    padding: 14,
    borderWidth: 1,
    alignItems: 'center',
  },
  warrantStatBoxNeutral: {
    backgroundColor: 'rgba(74, 138, 90, 0.08)',
    borderColor: 'rgba(74, 138, 90, 0.25)',
  },
  warrantStatBoxOk: {
    backgroundColor: 'rgba(74, 138, 90, 0.1)',
    borderColor: 'rgba(74, 138, 90, 0.3)',
  },
  warrantStatBoxWarn: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  warrantStatBoxDanger: {
    backgroundColor: 'rgba(212, 83, 74, 0.1)',
    borderColor: 'rgba(212, 83, 74, 0.3)',
  },
  warrantStatLabel: {
    fontFamily: Theme.fonts.mono,
    fontSize: 9,
    color: Theme.colors.textDim,
    letterSpacing: 1,
    marginBottom: 6,
  },
  warrantStatValue: {
    fontFamily: Theme.fonts.mono,
    fontSize: 28,
    fontWeight: '700',
  },
  warrantStatStatus: {
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
    marginTop: 4,
  },
  warrantResultBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    marginTop: 4,
    borderWidth: 1,
  },
  warrantResultDanger: {
    backgroundColor: 'rgba(212, 83, 74, 0.15)',
    borderColor: Theme.colors.accentDeny,
  },
  warrantResultClear: {
    backgroundColor: 'rgba(74, 138, 90, 0.12)',
    borderColor: Theme.colors.accentApprove,
  },
  warrantResultIcon: {
    fontFamily: Theme.fonts.mono,
    fontSize: 24,
    marginRight: 14,
  },
  warrantResultText: {
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    lineHeight: 18,
  },

  // Status line
  statusLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  statusIcon: {
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
    marginRight: 8,
  },
  statusMessage: {
    fontFamily: Theme.fonts.mono,
    fontSize: 11,
    fontWeight: '700',
  },

  // Transit Log Card Styles
  transitScrollContainer: {
    maxHeight: 280,
  },
  transitCard: {
    backgroundColor: 'rgba(26, 42, 58, 0.4)',
    borderWidth: 1,
    borderColor: '#2a3a4a',
    borderLeftWidth: 3,
    borderLeftColor: Theme.colors.textSecondary,
    padding: 12,
    marginBottom: 10,
  },
  transitCardFlagged: {
    borderLeftColor: Theme.colors.accentWarn,
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
  },
  transitDateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(74, 106, 122, 0.2)',
  },
  transitDate: {
    fontFamily: Theme.fonts.mono,
    fontSize: 14,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
    letterSpacing: 1,
  },
  transitTime: {
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
    color: Theme.colors.textSecondary,
  },
  transitJourneyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  transitSector: {
    flex: 1,
  },
  transitSectorLabel: {
    fontFamily: Theme.fonts.mono,
    fontSize: 9,
    color: Theme.colors.textDim,
    letterSpacing: 1,
    marginBottom: 2,
  },
  transitSectorValue: {
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
    fontWeight: '600',
    color: Theme.colors.textPrimary,
  },
  transitArrowContainer: {
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  transitDirectionIcon: {
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    marginBottom: 2,
  },
  transitArrow: {
    fontFamily: Theme.fonts.mono,
    fontSize: 16,
    color: Theme.colors.textSecondary,
  },
  transitStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transitDirectionLabel: {
    fontFamily: Theme.fonts.mono,
    fontSize: 9,
    letterSpacing: 0.5,
  },
  transitFlagBadge: {
    fontFamily: Theme.fonts.mono,
    fontSize: 9,
    fontWeight: '700',
    color: Theme.colors.accentWarn,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  transitSafetyBadge: {
    fontFamily: Theme.fonts.mono,
    fontSize: 8,
    fontWeight: '600',
    color: Theme.colors.textDim,
    marginTop: 2,
  },
  transitSafetyBadgeDanger: {
    color: Theme.colors.accentDeny,
    fontWeight: '700',
  },

  // Legacy styles (kept for other uses)
  logEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
    gap: 12,
  },
  logTimestamp: {
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    color: Theme.colors.textDim,
    width: 110,
  },
  logRoute: {
    fontFamily: Theme.fonts.mono,
    fontSize: 11,
    color: Theme.colors.textPrimary,
    flex: 1,
  },
  flagMarker: {
    fontFamily: Theme.fonts.mono,
    fontSize: 9,
    color: Theme.colors.accentWarn,
    fontWeight: '700',
  },

  // Note box
  noteBox: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: Theme.colors.accentWarn,
    marginTop: 4,
  },
  noteLabel: {
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    color: Theme.colors.accentWarn,
    fontWeight: '700',
    marginBottom: 4,
  },
  noteText: {
    fontFamily: Theme.fonts.mono,
    fontSize: 11,
    color: Theme.colors.textPrimary,
    lineHeight: 16,
  },

  // Empty result
  emptyResult: {
    fontFamily: Theme.fonts.mono,
    fontSize: 11,
    color: Theme.colors.textDim,
    textAlign: 'center',
    marginVertical: 16,
  },

  // Scroll container
  scrollContainer: {
    maxHeight: 140,
  },

  // Incident block
  incidentBlock: {
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1a2a3a',
  },
  incidentNumber: {
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    color: Theme.colors.accentWarn,
    fontWeight: '700',
    marginBottom: 4,
  },

  // Dialogue
  dialogueContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(127, 184, 216, 0.05)',
    padding: 12,
    marginVertical: 8,
  },
  dialoguePrefix: {
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
    color: Theme.colors.textSecondary,
    marginRight: 8,
  },
  dialogueText: {
    fontFamily: Theme.fonts.mono,
    fontSize: 11,
    color: Theme.colors.textPrimary,
    flex: 1,
    lineHeight: 18,
    fontStyle: 'italic',
  },

  // Section header
  sectionHeader: {
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    color: Theme.colors.textDim,
    marginTop: 12,
    marginBottom: 6,
    letterSpacing: 1,
  },

  // Flags
  flagLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  flagBullet: {
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    color: Theme.colors.accentWarn,
    marginRight: 6,
  },
  flagWord: {
    fontFamily: Theme.fonts.mono,
    fontSize: 11,
    color: Theme.colors.accentWarn,
    fontWeight: '600',
    marginRight: 8,
  },
  flagCat: {
    fontFamily: Theme.fonts.mono,
  },
  // Scanning progress styles
  scanningContainer: {
    padding: 16,
  },
  progressContainer: {
    marginVertical: 20,
  },
  progressBarBg: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(127, 184, 216, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Theme.colors.accentWarn,
    borderRadius: 4,
  },
  progressText: {
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
  },
  scanningText: {
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    color: Theme.colors.textDim,
    fontStyle: 'italic',
    marginTop: 12,
  },
  redactedText: {
    color: Theme.colors.accentWarn,
    fontStyle: 'italic',
  },
  redactionNotice: {
    fontFamily: Theme.fonts.mono,
    fontSize: 8,
    color: Theme.colors.textDim,
    marginTop: 4,
    fontStyle: 'italic',
  },
  noFlags: {
    fontFamily: Theme.fonts.mono,
    fontSize: 11,
    color: Theme.colors.textDim,
  },

  // Menu
  menuContainer: {
    paddingVertical: 8,
  },
  operatorInfo: {
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    color: Theme.colors.textDim,
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1a2a3a',
  },
  menuPrompt: {
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
    color: Theme.colors.accentApprove,
    marginBottom: 16,
  },
  menuGrid: {
    gap: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(26, 42, 58, 0.3)',
    borderWidth: 1,
    borderColor: '#2a3a4a',
  },
  menuItemComplete: {
    borderColor: Theme.colors.accentApprove,
    backgroundColor: 'rgba(74, 138, 90, 0.1)',
  },
  menuIcon: {
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
    color: Theme.colors.textSecondary,
    marginRight: 12,
  },
  menuLabel: {
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
    color: Theme.colors.textPrimary,
    letterSpacing: 0.5,
  },
  menuLabelComplete: {
    color: Theme.colors.accentApprove,
  },
  menuItemDisabled: {
    opacity: 0.4,
    borderColor: Theme.colors.textDim,
  },
  menuLabelDisabled: {
    color: Theme.colors.textDim,
  },
  resourceWarning: {
    fontFamily: Theme.fonts.mono,
    fontSize: 8,
    color: Theme.colors.accentDeny,
    marginTop: 4,
    fontWeight: '700',
  },

  // Footer
  terminalFooter: {
    borderTopWidth: 1,
    borderTopColor: '#1a2a3a',
    padding: 16,
    alignItems: 'center',
  },
  footerButton: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  footerButtonPressed: {
    backgroundColor: 'rgba(127, 184, 216, 0.2)',
    borderColor: Theme.colors.textSecondary,
  },
  footerButtonText: {
    fontFamily: Theme.fonts.mono,
    fontSize: 14,
    fontWeight: '600',
    color: Theme.colors.textSecondary,
    letterSpacing: 1,
  },
} as const);

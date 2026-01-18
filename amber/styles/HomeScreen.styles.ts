import { StyleSheet, Dimensions } from 'react-native';
import { Theme } from '../constants/theme';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#d8dcd0', // Desaturated, slightly greenish-grey for that bland/comfy dystopian feel
  },
  
  // Status bar (phone-like header)
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusTime: {
    fontFamily: 'Courier',
    fontSize: 14,
    color: '#4a5d4a',
    fontWeight: '600',
  },
  statusRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  signalBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
  },
  signalBar: {
    width: 3,
    backgroundColor: '#4a5d4a',
  },
  signalBar1: { height: 4 },
  signalBar2: { height: 6 },
  signalBar3: { height: 8 },
  signalBar4: { height: 10 },
  batteryText: {
    fontFamily: 'Courier',
    fontSize: 12,
    color: '#4a5d4a',
  },

  // Phase 1: Menu Style
  menuContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  menuContent: {
    alignItems: 'center',
  },
  menuTitle: {
    fontFamily: Theme.fonts.mono,
    fontSize: 42,
    fontWeight: '700',
    color: '#3a4a3a',
    letterSpacing: 4,
    marginBottom: 10,
    textAlign: 'center',
  },
  menuSubtitle: {
    fontFamily: 'Courier',
    fontSize: 9,
    color: '#6a7a6a',
    letterSpacing: 1,
    marginBottom: 60,
    textAlign: 'center',
    opacity: 0.9,
    paddingHorizontal: 20,
  },
  menuVersion: {
    fontFamily: 'Courier',
    fontSize: 10,
    color: '#7a8a7a',
    marginBottom: 40,
  },
  startButton: {
    width: 240,
    height: 72,
    backgroundColor: '#c8ccc0',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    // Deep shadow for 3D lift
    shadowColor: '#2a3a2a',
    shadowOffset: { width: 6, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 12,
    // Top-left highlight edge
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderTopColor: 'rgba(255, 255, 255, 0.7)',
    borderLeftColor: 'rgba(255, 255, 255, 0.5)',
    // Bottom-right darker edge
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderBottomColor: 'rgba(0, 0, 0, 0.15)',
    borderRightColor: 'rgba(0, 0, 0, 0.1)',
  },
  startButtonInner: {
    width: '92%',
    height: '85%',
    borderRadius: 10,
    backgroundColor: '#d2d6ca',
    justifyContent: 'center',
    alignItems: 'center',
    // Inner bevel
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.8)',
    borderLeftColor: 'rgba(255, 255, 255, 0.6)',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.08)',
    borderRightColor: 'rgba(0, 0, 0, 0.05)',
    // Subtle inner shadow effect via gradient-like appearance
    shadowColor: '#fff',
    shadowOffset: { width: -2, height: -2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  startButtonText: {
    fontFamily: 'Courier',
    fontSize: 18,
    fontWeight: '800',
    color: '#3a4a3a',
    letterSpacing: 4,
    textShadowColor: 'rgba(255, 255, 255, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  // Pressed states - invert the 3D effect
  startButtonPressed: {
    // Kill the shadow - button is pushed down
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
    // Invert bevels: top-left becomes dark (shadow), bottom-right becomes light
    borderTopColor: 'rgba(0, 0, 0, 0.12)',
    borderLeftColor: 'rgba(0, 0, 0, 0.08)',
    borderBottomColor: 'rgba(255, 255, 255, 0.4)',
    borderRightColor: 'rgba(255, 255, 255, 0.3)',
    // Slight shift down
    transform: [{ translateY: 3 }],
  },
  startButtonInnerPressed: {
    backgroundColor: '#c8ccc0',
    // Invert inner bevel
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
    borderLeftColor: 'rgba(0, 0, 0, 0.06)',
    borderBottomColor: 'rgba(255, 255, 255, 0.5)',
    borderRightColor: 'rgba(255, 255, 255, 0.4)',
    // Remove the highlight shadow
    shadowOpacity: 0,
  },
  startButtonTextPressed: {
    // Invert text shadow for embossed-to-debossed
    textShadowColor: 'rgba(0, 0, 0, 0.15)',
    textShadowOffset: { width: -1, height: -1 },
    color: '#4a5a4a',
  },
  footerText: {
    fontFamily: 'Courier',
    fontSize: 9,
    color: '#7a8a7a',
    marginTop: 40,
    letterSpacing: 1,
  },
  settingsButton: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(58, 74, 58, 0.08)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(58, 74, 58, 0.2)',
  },
  settingsButtonPressed: {
    backgroundColor: 'rgba(58, 74, 58, 0.15)',
  },
  settingsButtonText: {
    fontFamily: 'Courier',
    fontSize: 12,
    color: '#5a6a5a',
    letterSpacing: 2,
  },

  // Phase 2: Clean Messaging UI
  onboardContainer: {
    flex: 1,
    paddingTop: 16,
    paddingHorizontal: 20,
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(74, 93, 74, 0.1)',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#c5cbc0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontFamily: 'Courier',
    fontSize: 18,
    fontWeight: '700',
    color: '#4a5d4a',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#6a8a6a',
    borderWidth: 2,
    borderColor: '#d8dcd0',
  },
  headerText: {
    flex: 1,
  },
  contactName: {
    fontFamily: 'Courier',
    fontSize: 16,
    fontWeight: '700',
    color: '#3a4a3a',
    letterSpacing: 1,
  },
  contactStatus: {
    fontFamily: 'Courier',
    fontSize: 9,
    color: '#6a8a6a',
    letterSpacing: 1,
    marginTop: 2,
  },
  timestampContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  timestampText: {
    fontFamily: 'Courier',
    fontSize: 11,
    color: '#8a9a8a',
    backgroundColor: '#d8dcd0',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
    overflow: 'hidden',
  },

  messagesArea: {
    flex: 1,
  },
  
  messageBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#e1e5da', // Slightly lighter than background
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 15,
    borderTopLeftRadius: 2,
    marginBottom: 12,
    maxWidth: '85%',
    // Skeuomorphic depth
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  messageText: {
    fontFamily: 'Courier',
    fontSize: 14,
    color: '#3a4a3a',
    lineHeight: 18,
  },
  messageTime: {
    fontFamily: 'Courier',
    fontSize: 9,
    color: '#8a9a8a',
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },
  readReceipt: {
    fontFamily: 'Courier',
    fontSize: 9,
    color: '#6a8a6a',
    fontWeight: '600',
  },
  // Sent messages (player's replies)
  messageBubbleSent: {
    alignSelf: 'flex-end',
    backgroundColor: '#6a8a6a',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 2,
  },
  messageTextSent: {
    color: '#f0f4ec',
  },
  
  // Failed message bubble
  failedMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
    marginBottom: 12,
  },
  messageBubbleFailed: {
    backgroundColor: '#8a7a7a',
    opacity: 0.9,
  },
  readReceiptFailed: {
    color: '#ffaaaa',
  },
  failedIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#c45a50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  failedIconText: {
    color: '#fff',
    fontFamily: 'Courier',
    fontSize: 14,
    fontWeight: '700',
  },
  
  // Typing indicator bubble
  typingBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#e1e5da',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 15,
    borderTopLeftRadius: 2,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#8a9a8a',
  },
  typingDot1: {
    opacity: 0.4,
  },
  typingDot2: {
    opacity: 0.6,
  },
  typingDot3: {
    opacity: 0.8,
  },

  photoMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#e1e5da',
    padding: 6,
    borderRadius: 12,
    borderTopLeftRadius: 2,
    marginBottom: 12,
    maxWidth: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  photoFrame: {
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#ced3c7',
  },
  photoImage: {
    width: width * 0.7,
    height: width * 0.5,
    opacity: 0.9,
  },
  photoTime: {
    fontFamily: 'Courier',
    fontSize: 9,
    color: '#8a9a8a',
    marginTop: 4,
  },
  photoCaption: {
    fontFamily: 'Courier',
    fontSize: 13,
    color: '#3a4a3a',
    marginTop: 8,
    marginHorizontal: 4,
    lineHeight: 17,
  },

  // Input bar
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
  },
  inputField: {
    flex: 1,
    height: 44,
    backgroundColor: '#e1e5da',
    borderRadius: 22,
    paddingHorizontal: 16,
    justifyContent: 'center',
    // Subtle inset shadow effect
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.06)',
    borderLeftColor: 'rgba(0, 0, 0, 0.04)',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.6)',
    borderRightColor: 'rgba(255, 255, 255, 0.5)',
  },
  inputPlaceholder: {
    fontFamily: 'Courier',
    fontSize: 13,
    color: '#8a9a8a',
  },
  inputFieldActive: {
    backgroundColor: '#f8fbf6',
    // Focus glow effect
    borderTopColor: '#5a7a5a',
    borderLeftColor: '#5a7a5a',
    borderBottomColor: '#8aaa8a',
    borderRightColor: '#8aaa8a',
    shadowColor: '#6a8a6a',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  inputText: {
    fontFamily: 'Courier',
    fontSize: 13,
    color: '#3a4a3a',
  },
  cursor: {
    color: '#4a5d4a',
    fontWeight: '300',
  },
  cursorHidden: {
    opacity: 0,
  },
  sendButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#b8beb2',
    justifyContent: 'center',
    alignItems: 'center',
    // 3D raised effect
    shadowColor: '#2a3a2a',
    shadowOffset: { width: 3, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
    // Bevel
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderTopColor: 'rgba(255, 255, 255, 0.5)',
    borderLeftColor: 'rgba(255, 255, 255, 0.4)',
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderBottomColor: 'rgba(0, 0, 0, 0.12)',
    borderRightColor: 'rgba(0, 0, 0, 0.08)',
  },
  sendButtonActive: {
    backgroundColor: '#5a7a5a',
  },
  sendButtonPressed: {
    backgroundColor: '#4a6a4a',
    // Deeply pressed state - fully inverted bevel, shadow collapsed
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.2)',
    borderLeftColor: 'rgba(0, 0, 0, 0.15)',
    borderBottomColor: 'rgba(255, 255, 255, 0.5)',
    borderRightColor: 'rgba(255, 255, 255, 0.4)',
    transform: [{ translateY: 3 }, { scale: 0.95 }],
  },
  sendButtonSending: {
    backgroundColor: '#7a9a7a',
  },
  sendButtonFailed: {
    backgroundColor: '#c45a50',
  },
  sendButtonText: {
    fontFamily: 'Courier',
    fontSize: 18,
    color: '#fff',
    fontWeight: '700',
  },
  inputTextContainer: {
    flex: 1,
  },
  inputFieldFailed: {
    borderColor: '#c45a50',
    backgroundColor: '#f5e8e7',
  },
  inputTextFailed: {
    color: '#8a5a5a',
  },
  sendFailedLabel: {
    fontFamily: 'Courier',
    fontSize: 9,
    color: '#c45a50',
    marginTop: 2,
  },

  // The Corporate Alert Overlay - Game UI Aesthetic
  alertContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(10, 12, 15, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  alertBox: {
    width: '100%',
    backgroundColor: Theme.colors.bgDark,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    padding: 24,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  alertIcon: {
    marginRight: 12,
  },
  alertIconText: {
    fontSize: 20,
    color: Theme.colors.accentWarn,
  },
  alertTitle: {
    fontFamily: Theme.fonts.mono,
    fontSize: 14,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
    letterSpacing: 2,
    textAlign: 'center',
  },
  alertBody: {
    marginBottom: 24,
  },
  alertRow: {
    marginBottom: 12,
    borderLeftWidth: 2,
    borderLeftColor: Theme.colors.textSecondary,
    paddingLeft: 12,
  },
  alertLabel: {
    fontFamily: Theme.fonts.mono,
    fontSize: 9,
    color: Theme.colors.textDim,
    marginBottom: 2,
    letterSpacing: 1,
  },
  alertValue: {
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
    color: Theme.colors.textPrimary,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  authenticateButton: {
    borderWidth: 1,
    borderColor: Theme.colors.textPrimary,
    paddingVertical: 14,
    alignItems: 'center',
  },
  authenticateButtonPressed: {
    backgroundColor: 'rgba(127, 184, 216, 0.15)',
  },
  authenticateText: {
    fontFamily: Theme.fonts.mono,
    fontSize: 14,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
    letterSpacing: 2,
  },

  // Takeover transition overlays
  desatOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#2a2a2a',
  },
  interferenceOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#7fb8d8',
  },
  blackoutOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0a0c0f',
  },
  messagesWrapper: {
    flex: 1,
    backgroundColor: '#d8dcd0',
  },
});
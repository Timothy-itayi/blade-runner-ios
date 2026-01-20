import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Animated, Pressable, Easing, Image, Modal } from 'react-native';
import { styles } from '../../styles/intro/HomeScreen.styles';
import { MessageThread } from './MessageThread';
import { IntroAlertModal } from './IntroAlertModal';
import { IntroSettingsModal } from './IntroSettingsModal';
import { INTRO_MESSAGES, ALERT_DELAY, INTERRUPTED_MESSAGE } from '../../constants/intro';
import { useIntroAudio } from '../../hooks/useIntroAudio';

interface HomeScreenProps {
  onComplete: () => void;
  onContinue?: () => void;
  hasSaveData?: boolean;
  saveShiftNumber?: number;
}

export const HomeScreen = ({ onComplete, onContinue, hasSaveData, saveShiftNumber }: HomeScreenProps) => {
  // Audio settings
  const [musicVolume, setMusicVolume] = useState(1);
  const [sfxVolume, setSfxVolume] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [showConfirmNewGame, setShowConfirmNewGame] = useState(false);

  // Audio hook
  const {
    playMenuSoundtrack,
    fadeOutMenuSoundtrack,
    playTextReceive,
    playMessageSent,
    playAmberAlert,
    killAllAudio,
  } = useIntroAudio({ musicVolume, sfxVolume });

  // Phase state
  const [phase, setPhase] = useState<'menu' | 'messages'>('menu');
  const [takeoverPhase, setTakeoverPhase] = useState<'none' | 'desaturate' | 'black'>('none');
  
  // Message state
  const [visibleIndices, setVisibleIndices] = useState<number[]>([]);
  const [readIndices, setReadIndices] = useState<number[]>([]);
  const [currentTime, setCurrentTime] = useState('');
  
  // Typing state
  const [typingText, setTypingText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [wifeIsTyping, setWifeIsTyping] = useState(false);
  const [sendButtonPressed, setSendButtonPressed] = useState(false);
  
  // Failed message state (message moved from input to bubble, then failed)
  const [failedMessage, setFailedMessage] = useState<string | null>(null);
  const [failedMessageStatus, setFailedMessageStatus] = useState<'sending' | 'failed' | null>(null);
  
  // Alert state
  const [showAlert, setShowAlert] = useState(false);
  const [isDismantling, setIsDismantling] = useState(false);
  
  // Menu animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const messagesFadeAnim = useRef(new Animated.Value(0)).current;
  
  // Alert animations
  const alertOpacity = useRef(new Animated.Value(0)).current;
  const alertScale = useRef(new Animated.Value(0.9)).current;
  
  // Takeover animations
  const uiOpacity = useRef(new Animated.Value(1)).current;
  const desaturation = useRef(new Animated.Value(0)).current;
  const glitchOffset = useRef(new Animated.Value(0)).current;
  const interferenceOpacity = useRef(new Animated.Value(0)).current;
  const blackoutOpacity = useRef(new Animated.Value(0)).current;

  // Message animations
  const messageAnims = useRef(INTRO_MESSAGES.map(() => new Animated.Value(0))).current;
  
  // Typing interval ref (to stop typing when alert appears)
  const typingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const now = new Date();
    setCurrentTime(
      `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
    );
    
    // Start menu soundtrack
    playMenuSoundtrack();
    
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleStart = () => {
    if (hasSaveData) {
      setShowConfirmNewGame(true);
    } else {
      startNewGame();
    }
  };

  const startNewGame = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start(() => {
      // Don't fade out music - let it continue through AmberIntro
      onComplete();
    });
  };

  const handleContinue = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start(() => {
      fadeOutMenuSoundtrack();
      onContinue?.();
    });
  };

  const startMessageSequence = () => {
    const cursorInterval = setInterval(() => setShowCursor(prev => !prev), 530);

    // Schedule each message with its typing indicator
    INTRO_MESSAGES.forEach((msg, index) => {
      // Show typing indicator
      setTimeout(() => {
        if (isDismantling) return;
        if (msg.sender === 'wife') {
          setWifeIsTyping(true);
        } else {
          typePlayerMessage(msg.text as string);
        }
      }, msg.typingStart);

      // Show actual message
      setTimeout(() => {
        if (isDismantling) return;
        
        if (msg.sender === 'wife') {
          setWifeIsTyping(false);
          playTextReceive(); // Play receive sound for wife's messages
        } else {
          clearPlayerTyping();
          playMessageSent(); // Play sent sound for player's messages
        }
        
          setVisibleIndices(prev => [...prev, index]);
          Animated.spring(messageAnims[index], {
            toValue: 1,
            friction: 8,
            tension: 40,
            useNativeDriver: true,
          }).start();
        
        // Mark previous player message as read
        if (msg.sender === 'wife' && index > 0 && INTRO_MESSAGES[index - 1].sender === 'player') {
          setTimeout(() => setReadIndices(prev => [...prev, index - 1]), 600);
        }
      }, msg.delay);
    });

    // Final typing sequence before alert
    const typingStartDelay = ALERT_DELAY - 6000;
    
    // Mark last message as read
    setTimeout(() => {
      if (!isDismantling) setReadIndices(prev => [...prev, INTRO_MESSAGES.length - 1]);
    }, typingStartDelay - 500);

    // Start typing final message
    setTimeout(() => {
      if (!isDismantling) {
        typeInterruptedMessage();
      }
    }, typingStartDelay);

    // Calculate when typing finishes
    const typingDuration = INTERRUPTED_MESSAGE.length * 120;
    const typingEndTime = typingStartDelay + typingDuration + 600;

    // Player pauses, then presses send button
    const buttonPressTime = typingEndTime + 800;
    setTimeout(() => {
      if (isDismantling) return;
      setSendButtonPressed(true);
    }, buttonPressTime);

    // Button releases, message moves to bubble
    const sendTime = buttonPressTime + 600;
    setTimeout(() => {
      if (isDismantling) return;
      setSendButtonPressed(false);
      // Stop typing, clear input
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
        typingIntervalRef.current = null;
      }
      setIsTyping(false);
      setTypingText('');
      // Show as bubble with "sending" status
      setFailedMessage(INTERRUPTED_MESSAGE);
      setFailedMessageStatus('sending');
      playMessageSent(); // Play sent sound
    }, sendTime);

    // Message fails to send
    setTimeout(() => {
      if (isDismantling) return;
      setFailedMessageStatus('failed');
    }, sendTime + 1500);

    // Alert appears after failure is visible
    setTimeout(() => {
      if (isDismantling) return;
      clearInterval(cursorInterval);
      fadeOutMenuSoundtrack(600); // Fade music as alert appears
      playAmberAlert(); // Start alert sound (loops until authenticate)
        setShowAlert(true);
        Animated.parallel([
        Animated.timing(alertOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(alertScale, { toValue: 1, friction: 8, tension: 40, useNativeDriver: true }),
        ]).start();
    }, sendTime + 3000);
  };

  const typePlayerMessage = (message: string) => {
    let i = 0;
    setTypingText('');
    setIsTyping(true);
    const interval = setInterval(() => {
      if (i < message.length) {
        setTypingText(message.slice(0, ++i));
      } else {
        clearInterval(interval);
      }
    }, 130);
  };

  const typeInterruptedMessage = () => {
    let i = 0;
    setTypingText('');
    setIsTyping(true);
    const interval = setInterval(() => {
      if (i < INTERRUPTED_MESSAGE.length && !isDismantling) {
        setTypingText(INTERRUPTED_MESSAGE.slice(0, ++i));
      } else {
        clearInterval(interval);
      }
    }, 120);
    typingIntervalRef.current = interval;
  };

  const clearPlayerTyping = () => {
    setIsTyping(false);
    setTypingText('');
  };

  const handleAuthenticate = () => {
    setIsDismantling(true);
    killAllAudio();
    Animated.timing(alertOpacity, { toValue: 0, duration: 150, useNativeDriver: true }).start();
    
    setTimeout(() => {
      setTakeoverPhase('desaturate');
      runTakeoverSequence();
    }, 200);
  };
      
  const runTakeoverSequence = () => {
      Animated.sequence([
      // Desaturation
        Animated.timing(desaturation, {
        toValue: 0.6,
        duration: 1200,
        easing: Easing.out(Easing.quad),
          useNativeDriver: false,
        }),
      Animated.delay(200),
      // Glitch + interference
        Animated.parallel([
        Animated.sequence([
          Animated.timing(glitchOffset, { toValue: 12, duration: 40, useNativeDriver: true }),
          Animated.timing(glitchOffset, { toValue: -8, duration: 35, useNativeDriver: true }),
          Animated.timing(glitchOffset, { toValue: 5, duration: 40, useNativeDriver: true }),
          Animated.timing(glitchOffset, { toValue: -3, duration: 30, useNativeDriver: true }),
          Animated.timing(glitchOffset, { toValue: 0, duration: 25, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(interferenceOpacity, { toValue: 0.8, duration: 60, useNativeDriver: true }),
          Animated.timing(interferenceOpacity, { toValue: 0.2, duration: 50, useNativeDriver: true }),
          Animated.timing(interferenceOpacity, { toValue: 0.6, duration: 55, useNativeDriver: true }),
          Animated.timing(blackoutOpacity, { toValue: 1, duration: 80, useNativeDriver: true }),
        ]),
      ]),
      Animated.delay(300),
      ]).start(() => {
        setTakeoverPhase('black');
        onComplete();
      });
  };

  // ─────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────

  if (phase === 'menu') {
    return (
      <View style={styles.container}>
        {/* Windows XP-style title bar */}
        <View style={styles.titleBar}>
          <View style={styles.titleBarLeft}>
            <View style={styles.titleBarIcon} />
            <Text style={styles.titleBarText}>AMBER Control Panel</Text>
          </View>
          <View style={styles.titleBarButtons}>
            <View style={styles.titleBarButton}>
              <Text style={styles.titleBarButtonText}>−</Text>
            </View>
            <View style={styles.titleBarButton}>
              <Text style={styles.titleBarButtonText}>□</Text>
            </View>
            <View style={[styles.titleBarButton, styles.titleBarButtonClose]}>
              <Text style={styles.titleBarButtonText}>×</Text>
            </View>
          </View>
        </View>

        <Animated.View style={[styles.menuContainer, { opacity: fadeAnim }]}>
          <View style={styles.menuContent}>
            {/* Logo Image */}
            <View style={styles.logoContainer}>
              <Image
                source={require('../../assets/app-icon.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>

            <Text style={styles.menuTitle}>AMBER</Text>
            <Text style={styles.menuSubtitle}>Automated Movement & Biometric Evaluation Registry</Text>

            <View style={styles.divider} />

            <Text style={styles.menuSlogan}>"Securing Identity. Protecting Tomorrow."</Text>

            <Text style={styles.menuVersion}>Version 2.4.1 Build 1847</Text>

            {hasSaveData && (
              <Pressable
                onPress={handleContinue}
                style={({ pressed }) => [styles.continueButton, pressed && styles.continueButtonPressed]}
              >
                {({ pressed }) => (
                  <View style={[styles.continueButtonInner, pressed && styles.continueButtonInnerPressed]}>
                    <Text style={[styles.continueButtonText, pressed && styles.continueButtonTextPressed]}>
                      CONTINUE
                    </Text>
                    <Text style={[styles.continueSubtext, pressed && styles.continueSubtextPressed]}>
                      Shift {saveShiftNumber || 1} / 20
                    </Text>
                  </View>
                )}
              </Pressable>
            )}

            <Pressable
              onPress={handleStart}
              style={({ pressed }) => [styles.startButton, pressed && styles.startButtonPressed]}
            >
              {({ pressed }) => (
                <View style={[styles.startButtonInner, pressed && styles.startButtonInnerPressed]}>
                  <Text style={[styles.startButtonText, pressed && styles.startButtonTextPressed]}>
                    {hasSaveData ? 'NEW GAME' : 'START SYSTEM'}
                  </Text>
                </View>
              )}
            </Pressable>

            <Pressable
              onPress={() => setShowSettings(true)}
              style={({ pressed }) => [styles.settingsButton, pressed && styles.settingsButtonPressed]}
            >
              <Text style={styles.settingsButtonText}>Audio Settings</Text>
            </Pressable>
          </View>

          <View style={styles.footerBar}>
            <Text style={styles.footerText}>© 2019 AMBER Systems International. All Rights Reserved.</Text>
            <Text style={styles.footerSubtext}>AUTHORIZED PERSONNEL ONLY</Text>
          </View>
        </Animated.View>

        <IntroSettingsModal
          visible={showSettings}
          onClose={() => setShowSettings(false)}
          musicVolume={musicVolume}
          sfxVolume={sfxVolume}
          onMusicVolumeChange={setMusicVolume}
          onSfxVolumeChange={setSfxVolume}
        />

        {/* Confirmation Modal for New Game */}
        <Modal
          visible={showConfirmNewGame}
          transparent
          animationType="fade"
          onRequestClose={() => setShowConfirmNewGame(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.confirmModal}>
              <View style={styles.confirmTitleBar}>
                <Text style={styles.confirmTitleText}>Confirm New Game</Text>
                <Pressable onPress={() => setShowConfirmNewGame(false)}>
                  <Text style={styles.confirmCloseButton}>×</Text>
                </Pressable>
              </View>
              <View style={styles.confirmContent}>
                <Text style={styles.confirmIcon}>⚠</Text>
                <Text style={styles.confirmMessage}>
                  This will erase your current progress (Shift {saveShiftNumber || 1}/20).
                </Text>
                <Text style={styles.confirmQuestion}>Continue?</Text>
              </View>
              <View style={styles.confirmButtons}>
                <Pressable
                  onPress={() => {
                    setShowConfirmNewGame(false);
                    startNewGame();
                  }}
                  style={({ pressed }) => [styles.confirmButton, pressed && styles.confirmButtonPressed]}
                >
                  <Text style={styles.confirmButtonText}>Yes</Text>
                </Pressable>
                <Pressable
                  onPress={() => setShowConfirmNewGame(false)}
                  style={({ pressed }) => [styles.confirmButton, pressed && styles.confirmButtonPressed]}
                >
                  <Text style={styles.confirmButtonText}>No</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

    const combinedOpacity = Animated.multiply(messagesFadeAnim, uiOpacity);
    
    return (
    <View style={styles.container}>
      <View style={styles.messagesWrapper}>
        <Animated.View 
          style={[
            styles.onboardContainer, 
            { opacity: combinedOpacity, transform: [{ translateX: glitchOffset }] }
          ]}
        >
          <MessageThread
            visibleIndices={visibleIndices}
            readIndices={readIndices}
            messageAnims={messageAnims}
            currentTime={currentTime}
            wifeIsTyping={wifeIsTyping}
            isTyping={isTyping}
            typingText={typingText}
            showCursor={showCursor}
            sendButtonPressed={sendButtonPressed}
            failedMessage={failedMessage}
            failedMessageStatus={failedMessageStatus}
          />

          <IntroAlertModal
            visible={showAlert}
            opacity={alertOpacity}
            scale={alertScale}
            onAuthenticate={handleAuthenticate}
          />
        </Animated.View>

        {/* Takeover overlays */}
        <Animated.View pointerEvents="none" style={[styles.desatOverlay, { opacity: desaturation }]} />
        
        {takeoverPhase === 'desaturate' && (
          <Animated.View pointerEvents="none" style={[styles.interferenceOverlay, { opacity: interferenceOpacity }]} />
        )}
        
        <Animated.View pointerEvents="none" style={[styles.blackoutOverlay, { opacity: blackoutOpacity }]} />
      </View>
    </View>
  );
};

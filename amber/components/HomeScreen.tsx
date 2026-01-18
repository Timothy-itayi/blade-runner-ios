import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Animated, Image, Pressable, Easing, Dimensions, StyleSheet } from 'react-native';
import { styles } from '../styles/HomeScreen.styles';

const { width, height } = Dimensions.get('window');

interface HomeScreenProps {
  onComplete: () => void;
}

// Simplified: 2 messages + 1 photo
const MESSAGES = [
  { type: 'text', text: "Have fun at work! See you soon!", delay: 800 },
  { type: 'image', delay: 2500 },
  { type: 'text', text: "First day jitters are normal. You've got this ♡", delay: 4500 },
];

const ALERT_DELAY = 7000;

export const HomeScreen = ({ onComplete }: HomeScreenProps) => {
  const [phase, setPhase] = useState<'menu' | 'messages'>('menu');
  const [visibleIndices, setVisibleIndices] = useState<number[]>([]);
  const [showAlert, setShowAlert] = useState(false);
  const [isDismantling, setIsDismantling] = useState(false);
  const [showCorruption, setShowCorruption] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const messagesFadeAnim = useRef(new Animated.Value(0)).current;
  const alertOpacity = useRef(new Animated.Value(0)).current;
  const alertScale = useRef(new Animated.Value(0.9)).current;
  const dismantleAnim = useRef(new Animated.Value(1)).current;

  // Corruption/RGB split animations for authenticate
  const corruptionX = useRef(new Animated.Value(0)).current;
  const corruptionY = useRef(new Animated.Value(0)).current;
  const rgbRedX = useRef(new Animated.Value(0)).current;
  const rgbBlueX = useRef(new Animated.Value(0)).current;
  const rgbGreenY = useRef(new Animated.Value(0)).current;
  const desaturation = useRef(new Animated.Value(0)).current;
  const scanLineY = useRef(new Animated.Value(0)).current;
  const noiseOpacity = useRef(new Animated.Value(0)).current;
  const tearOffset = useRef(new Animated.Value(0)).current;

  // Track animations for each message
  const messageAnims = useRef(MESSAGES.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    // Set current time
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const mins = now.getMinutes().toString().padStart(2, '0');
    setCurrentTime(`${hours}:${mins}`);
    
    // Initial fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleStart = () => {
    // Smooth crossfade: fade out menu, switch, fade in messages
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start(() => {
      setPhase('messages');
      // Fade in the messages screen
      Animated.timing(messagesFadeAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }).start();
      startMessageSequence();
    });
  };

  const startMessageSequence = () => {
    MESSAGES.forEach((msg, index) => {
      setTimeout(() => {
        if (!isDismantling) {
          setVisibleIndices(prev => [...prev, index]);
          Animated.spring(messageAnims[index], {
            toValue: 1,
            friction: 8,
            tension: 40,
            useNativeDriver: true,
          }).start();
        }
      }, msg.delay);
    });

    setTimeout(() => {
      if (!isDismantling) {
        setShowAlert(true);
        Animated.parallel([
          Animated.timing(alertOpacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.spring(alertScale, {
            toValue: 1,
            friction: 8,
            tension: 40,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }, ALERT_DELAY);
  };

  const handleAuthenticate = () => {
    setIsDismantling(true);
    setShowCorruption(true);
    
    // Phase 1: Initial shock - RGB split begins
    const phase1 = Animated.parallel([
      Animated.timing(rgbRedX, { toValue: -6, duration: 100, useNativeDriver: true }),
      Animated.timing(rgbBlueX, { toValue: 6, duration: 100, useNativeDriver: true }),
      Animated.timing(noiseOpacity, { toValue: 0.3, duration: 100, useNativeDriver: true }),
    ]);

    // Phase 2: Jitter and desaturation begins
    const phase2 = Animated.sequence([
      Animated.parallel([
        Animated.timing(corruptionX, { toValue: 12, duration: 60, useNativeDriver: true }),
        Animated.timing(desaturation, { toValue: 0.3, duration: 150, useNativeDriver: false }),
      ]),
      Animated.timing(corruptionX, { toValue: -8, duration: 50, useNativeDriver: true }),
      Animated.timing(corruptionX, { toValue: 4, duration: 40, useNativeDriver: true }),
    ]);

    // Phase 3: Heavy corruption - scan lines, more RGB split
    const phase3 = Animated.parallel([
      Animated.timing(rgbRedX, { toValue: -12, duration: 200, useNativeDriver: true }),
      Animated.timing(rgbBlueX, { toValue: 14, duration: 200, useNativeDriver: true }),
      Animated.timing(rgbGreenY, { toValue: -4, duration: 200, useNativeDriver: true }),
      Animated.timing(desaturation, { toValue: 0.6, duration: 300, useNativeDriver: false }),
      Animated.timing(noiseOpacity, { toValue: 0.5, duration: 200, useNativeDriver: true }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanLineY, { toValue: height, duration: 400, useNativeDriver: true }),
          Animated.timing(scanLineY, { toValue: 0, duration: 0, useNativeDriver: true }),
        ]),
        { iterations: 2 }
      ),
    ]);

    // Phase 4: Tearing effect
    const phase4 = Animated.sequence([
      Animated.timing(tearOffset, { toValue: 20, duration: 80, useNativeDriver: true }),
      Animated.timing(tearOffset, { toValue: -15, duration: 60, useNativeDriver: true }),
      Animated.timing(tearOffset, { toValue: 8, duration: 50, useNativeDriver: true }),
      Animated.timing(tearOffset, { toValue: 0, duration: 40, useNativeDriver: true }),
    ]);

    // Phase 5: More jitter with increasing desaturation
    const phase5 = Animated.parallel([
      Animated.sequence([
        Animated.timing(corruptionY, { toValue: -6, duration: 70, useNativeDriver: true }),
        Animated.timing(corruptionY, { toValue: 8, duration: 60, useNativeDriver: true }),
        Animated.timing(corruptionY, { toValue: -3, duration: 50, useNativeDriver: true }),
      ]),
      Animated.timing(desaturation, { toValue: 0.85, duration: 400, useNativeDriver: false }),
      Animated.timing(rgbRedX, { toValue: -18, duration: 300, useNativeDriver: true }),
      Animated.timing(rgbBlueX, { toValue: 20, duration: 300, useNativeDriver: true }),
    ]);

    // Phase 6: Flicker and fade
    const phase6 = Animated.sequence([
      Animated.timing(dismantleAnim, { toValue: 0.4, duration: 80, useNativeDriver: true }),
      Animated.timing(dismantleAnim, { toValue: 0.7, duration: 50, useNativeDriver: true }),
      Animated.timing(dismantleAnim, { toValue: 0.2, duration: 60, useNativeDriver: true }),
      Animated.timing(dismantleAnim, { toValue: 0.5, duration: 40, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(dismantleAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
        Animated.timing(desaturation, { toValue: 1, duration: 400, useNativeDriver: false }),
        Animated.timing(noiseOpacity, { toValue: 0.8, duration: 400, useNativeDriver: true }),
      ]),
    ]);

    // Run the full corruption sequence
    Animated.sequence([
      phase1,
      Animated.delay(50),
      phase2,
      phase3,
      phase4,
      Animated.delay(100),
      phase5,
      Animated.delay(150),
      phase6,
    ]).start(() => {
      onComplete();
    });
  };

  const renderCorruptionOverlays = () => {
    if (!showCorruption) return null;

    return (
      <>
        {/* Red channel offset */}
        <Animated.View
          pointerEvents="none"
          style={[
            corruptionStyles.rgbLayer,
            {
              backgroundColor: 'rgba(255, 0, 0, 0.15)',
              transform: [{ translateX: rgbRedX }],
              opacity: noiseOpacity,
            },
          ]}
        />
        
        {/* Blue channel offset */}
        <Animated.View
          pointerEvents="none"
          style={[
            corruptionStyles.rgbLayer,
            {
              backgroundColor: 'rgba(0, 0, 255, 0.12)',
              transform: [{ translateX: rgbBlueX }],
              opacity: noiseOpacity,
            },
          ]}
        />
        
        {/* Green channel offset */}
        <Animated.View
          pointerEvents="none"
          style={[
            corruptionStyles.rgbLayer,
            {
              backgroundColor: 'rgba(0, 255, 0, 0.08)',
              transform: [{ translateY: rgbGreenY }],
              opacity: noiseOpacity,
            },
          ]}
        />

        {/* Desaturation overlay */}
        <Animated.View
          pointerEvents="none"
          style={[
            corruptionStyles.desatLayer,
            { opacity: desaturation },
          ]}
        />

        {/* Scan line */}
        <Animated.View
          pointerEvents="none"
          style={[
            corruptionStyles.scanLine,
            { transform: [{ translateY: scanLineY }] },
          ]}
        />

        {/* Noise/static overlay */}
        <Animated.View
          pointerEvents="none"
          style={[
            corruptionStyles.noiseLayer,
            { opacity: noiseOpacity },
          ]}
        >
          {/* Simulated scan lines */}
          {Array.from({ length: 40 }).map((_, i) => (
            <View
              key={i}
              style={[
                corruptionStyles.noiseLine,
                { 
                  top: i * (height / 40),
                  opacity: Math.random() > 0.5 ? 0.3 : 0.1,
                  height: Math.random() > 0.7 ? 3 : 1,
                },
              ]}
            />
          ))}
        </Animated.View>

        {/* Horizontal tear bars */}
        <Animated.View
          pointerEvents="none"
          style={[
            corruptionStyles.tearBar,
            { 
              top: '30%',
              transform: [{ translateX: tearOffset }],
            },
          ]}
        />
        <Animated.View
          pointerEvents="none"
          style={[
            corruptionStyles.tearBar,
            { 
              top: '65%',
              transform: [{ translateX: Animated.multiply(tearOffset, -1.5) }],
            },
          ]}
        />
      </>
    );
  };

  const renderMenu = () => (
    <Animated.View 
      style={[
        styles.menuContainer, 
        { opacity: fadeAnim }
      ]}
    >
      <View style={styles.statusBar}>
        <Text style={styles.statusTime}>{currentTime}</Text>
        <View style={styles.statusRight}>
          <View style={styles.signalBars}>
            <View style={[styles.signalBar, styles.signalBar1]} />
            <View style={[styles.signalBar, styles.signalBar2]} />
            <View style={[styles.signalBar, styles.signalBar3]} />
            <View style={[styles.signalBar, styles.signalBar4]} />
          </View>
          <Text style={styles.batteryText}>87%</Text>
        </View>
      </View>

      <View style={styles.menuContent}>
        <Text style={styles.menuTitle}>AMBER ALERT</Text>
        <Text style={styles.menuSubtitle}>GLOBAL SURVEILLANCE NETWORK</Text>
        <Text style={styles.menuVersion}>v2.4.1</Text>
        
        <Pressable onPress={handleStart} style={styles.startButton}>
          <View style={styles.startButtonInner}>
            <Text style={styles.startButtonText}>START</Text>
          </View>
        </Pressable>
        
        <Text style={styles.footerText}>AUTHORIZED PERSONNEL ONLY</Text>
      </View>
    </Animated.View>
  );

  const renderMessages = () => {
    // Combine fade-in and dismantle opacity
    const combinedOpacity = Animated.multiply(messagesFadeAnim, dismantleAnim);
    
    return (
    <Animated.View 
      style={[
        styles.onboardContainer, 
        { 
          opacity: combinedOpacity,
          transform: [
            { translateX: corruptionX },
            { translateY: corruptionY },
            { scale: dismantleAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.96, 1]
            })},
          ]
        }
      ]}
    >
      <View style={styles.statusBar}>
        <Text style={styles.statusTime}>{currentTime}</Text>
        <View style={styles.statusRight}>
          <View style={styles.signalBars}>
            <View style={[styles.signalBar, styles.signalBar1]} />
            <View style={[styles.signalBar, styles.signalBar2]} />
            <View style={[styles.signalBar, styles.signalBar3]} />
            <View style={[styles.signalBar, styles.signalBar4]} />
          </View>
          <Text style={styles.batteryText}>87%</Text>
        </View>
      </View>

      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>M</Text>
          </View>
          <View style={styles.onlineIndicator} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.contactName}>Maya</Text>
          <Text style={styles.contactStatus}>online</Text>
        </View>
      </View>

      <View style={styles.timestampContainer}>
        <Text style={styles.timestampText}>Today</Text>
      </View>

      <View style={styles.messagesArea}>
        {MESSAGES.map((msg, index) => (
          visibleIndices.includes(index) && (
            <Animated.View 
              key={index} 
              style={{
                opacity: messageAnims[index],
                transform: [{
                  translateY: messageAnims[index].interpolate({
                    inputRange: [0, 1],
                    outputRange: [10, 0]
                  })
                }]
              }}
            >
              {msg.type === 'text' ? (
                <View style={styles.messageBubble}>
                  <Text style={styles.messageText}>{msg.text}</Text>
                  <Text style={styles.messageTime}>{currentTime}</Text>
                </View>
              ) : (
                <View style={styles.photoMessage}>
                  <View style={styles.photoFrame}>
                    <Image 
                      source={require('../assets/family-photo.png')} 
                      style={styles.photoImage}
                      resizeMode="cover"
                    />
                  </View>
                  <Text style={styles.photoTime}>{currentTime}</Text>
                </View>
              )}
            </Animated.View>
          )
        ))}
      </View>

      <View style={styles.inputBar}>
        <View style={styles.inputField}>
          <Text style={styles.inputPlaceholder}>Message...</Text>
        </View>
        <View style={styles.sendButton}>
          <Text style={styles.sendButtonText}>→</Text>
        </View>
      </View>

      {showAlert && (
        <Animated.View style={[styles.alertContainer, { opacity: alertOpacity }]}>
          <Animated.View 
            style={[
              styles.alertBox, 
              { transform: [{ scale: alertScale }] }
            ]}
          >
            <View style={styles.alertHeader}>
              <View style={styles.alertIcon}>
                <Text style={styles.alertIconText}>⚠</Text>
              </View>
              <Text style={styles.alertTitle}>AMBER ALERT ASSISTANCE</Text>
            </View>
            
            <View style={styles.alertBody}>
              <View style={styles.alertRow}>
                <Text style={styles.alertLabel}>POST</Text>
                <Text style={styles.alertValue}>SECTOR 9 TRANSIT POINT</Text>
              </View>
              <View style={styles.alertRow}>
                <Text style={styles.alertLabel}>OPERATOR</Text>
                <Text style={styles.alertValue}>OP-7734 (PROVISIONAL)</Text>
              </View>
              <View style={styles.alertRow}>
                <Text style={styles.alertLabel}>PROTOCOL</Text>
                <Text style={styles.alertValue}>MANDATORY ASSISTANCE</Text>
              </View>
            </View>

            <Pressable 
              onPress={handleAuthenticate}
              style={({ pressed }) => [
                styles.authenticateButton,
                { opacity: pressed ? 0.7 : 1 }
              ]}
            >
              <Text style={styles.authenticateText}>AUTHENTICATE</Text>
            </Pressable>
          </Animated.View>
        </Animated.View>
      )}

      {renderCorruptionOverlays()}
    </Animated.View>
  );
  };

  return (
    <View style={styles.container}>
      {phase === 'menu' ? renderMenu() : renderMessages()}
    </View>
  );
};

const corruptionStyles = StyleSheet.create({
  rgbLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  desatLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#888',
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  noiseLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  noiseLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  tearBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
});

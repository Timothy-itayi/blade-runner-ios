import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Animated, Image, Pressable, Easing, Dimensions, StyleSheet } from 'react-native';
import { styles } from '../styles/HomeScreen.styles';

const { width, height } = Dimensions.get('window');

interface HomeScreenProps {
  onComplete: () => void;
}

const MESSAGES = [
  { type: 'text', text: "Have fun at work! See you soon!", delay: 1500 },
  { type: 'image', delay: 4500 },
  { type: 'text', text: "First day jitters are normal. You've got this ♡", delay: 8000 },
];

const ALERT_DELAY = 12000;

export const HomeScreen = ({ onComplete }: HomeScreenProps) => {
  const [phase, setPhase] = useState<'menu' | 'messages'>('menu');
  const [visibleIndices, setVisibleIndices] = useState<number[]>([]);
  const [showAlert, setShowAlert] = useState(false);
  const [isDismantling, setIsDismantling] = useState(false);
  const [takeoverPhase, setTakeoverPhase] = useState<'none' | 'desaturate' | 'black'>('none');
  const [currentTime, setCurrentTime] = useState('');
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const messagesFadeAnim = useRef(new Animated.Value(0)).current;
  const alertOpacity = useRef(new Animated.Value(0)).current;
  const alertScale = useRef(new Animated.Value(0.9)).current;
  
  // Takeover animations
  const desaturation = useRef(new Animated.Value(0)).current;
  const uiOpacity = useRef(new Animated.Value(1)).current;
  const verticalCollapse = useRef(new Animated.Value(1)).current;
  const collapseLineOpacity = useRef(new Animated.Value(0)).current;

  const messageAnims = useRef(MESSAGES.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const mins = now.getMinutes().toString().padStart(2, '0');
    setCurrentTime(`${hours}:${mins}`);
    
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleStart = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start(() => {
      setPhase('messages');
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
    
    // Quick alert dismiss
    Animated.timing(alertOpacity, { toValue: 0, duration: 150, useNativeDriver: true }).start();
    
    setTimeout(() => {
      setTakeoverPhase('desaturate');
      
      // CRT-style vertical collapse sequence
      Animated.sequence([
        // Step 1: Quick desaturation
        Animated.timing(desaturation, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: false,
        }),
        // Step 2: Vertical collapse to center line
        Animated.parallel([
          Animated.timing(verticalCollapse, {
            toValue: 0,
            duration: 350,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(collapseLineOpacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]),
        // Step 3: Hold the line briefly
        Animated.delay(150),
        // Step 4: Fade the line out
        Animated.timing(collapseLineOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setTakeoverPhase('black');
        onComplete();
      });
    }, 200);
  };

  const renderMenu = () => (
    <Animated.View 
      style={[
        styles.menuContainer, 
        { opacity: fadeAnim }
      ]}
    >
      <View style={styles.menuContent}>
        <Text style={styles.menuTitle}>A.M.B.E.R</Text>
        <Text style={styles.menuSubtitle}>ACTIVE MEASURES BUREAU FOR ENTITY REVIEW</Text>
        <Text style={styles.menuVersion}>v2.4.1</Text>
        
        <Pressable 
          onPress={handleStart} 
          style={({ pressed }) => [
            styles.startButton,
            pressed && styles.startButtonPressed
          ]}
        >
          {({ pressed }) => (
            <View style={[
              styles.startButtonInner,
              pressed && styles.startButtonInnerPressed
            ]}>
              <Text style={[
                styles.startButtonText,
                pressed && styles.startButtonTextPressed
              ]}>START</Text>
            </View>
          )}
        </Pressable>
        
        <Text style={styles.footerText}>AUTHORIZED PERSONNEL ONLY</Text>
      </View>
    </Animated.View>
  );

  const renderMessages = () => {
    const combinedOpacity = Animated.multiply(messagesFadeAnim, uiOpacity);
    
    return (
      <View style={{ flex: 1, backgroundColor: '#d8dcd0' }}>
        <Animated.View 
          style={[
            styles.onboardContainer, 
            { 
              opacity: combinedOpacity,
              transform: [{ scaleY: verticalCollapse }],
            }
          ]}
        >
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
                    pressed && { backgroundColor: 'rgba(127, 184, 216, 0.15)' }
                  ]}
                >
                  <Text style={styles.authenticateText}>[ AUTHENTICATE ]</Text>
                </Pressable>
              </Animated.View>
            </Animated.View>
          )}
        </Animated.View>

        {/* Desaturation overlay */}
        <Animated.View 
          pointerEvents="none"
          style={[
            takeoverStyles.desatOverlay,
            { opacity: desaturation }
          ]}
        />

        {/* CRT collapse line */}
        {takeoverPhase === 'desaturate' && (
          <Animated.View 
            pointerEvents="none"
            style={[
              takeoverStyles.collapseLine,
              { opacity: collapseLineOpacity }
            ]}
          />
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {phase === 'menu' ? renderMenu() : renderMessages()}
    </View>
  );
};

const takeoverStyles = StyleSheet.create({
  desatOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#1a1a1a',
  },
  collapseLine: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#8a9a8a',
    marginTop: -1,
    shadowColor: '#8a9a8a',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
  },
});

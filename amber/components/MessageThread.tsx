import React from 'react';
import { View, Text, Animated, Image } from 'react-native';
import { styles } from '../styles/HomeScreen.styles';
import { INTRO_MESSAGES, CONTACT, IntroMessage } from '../constants/intro';

interface MessageThreadProps {
  visibleIndices: number[];
  readIndices: number[];
  messageAnims: Animated.Value[];
  currentTime: string;
  wifeIsTyping: boolean;
  isTyping: boolean;
  typingText: string;
  showCursor: boolean;
  failedMessage: string | null;
  failedMessageStatus: 'sending' | 'failed' | null;
}

export const MessageThread = ({
  visibleIndices,
  readIndices,
  messageAnims,
  currentTime,
  wifeIsTyping,
  isTyping,
  typingText,
  showCursor,
  failedMessage,
  failedMessageStatus,
}: MessageThreadProps) => {
  const renderMessage = (msg: IntroMessage, index: number) => {
    if (!visibleIndices.includes(index)) return null;

    return (
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
          <View style={[
            styles.messageBubble,
            msg.sender === 'player' && styles.messageBubbleSent
          ]}>
            <Text style={[
              styles.messageText,
              msg.sender === 'player' && styles.messageTextSent
            ]}>{msg.text}</Text>
            <View style={styles.messageFooter}>
              <Text style={styles.messageTime}>{currentTime}</Text>
              {msg.sender === 'player' && (
                <Text style={styles.readReceipt}>
                  {readIndices.includes(index) ? 'Read' : '✓✓'}
                </Text>
              )}
            </View>
          </View>
        ) : (
          <View style={styles.photoMessage}>
            <View style={styles.photoFrame}>
              <Image 
                source={require('../assets/wife-on-a-walk.png')} 
                style={styles.photoImage}
                resizeMode="cover"
              />
            </View>
            {msg.caption && (
              <Text style={styles.photoCaption}>{msg.caption}</Text>
            )}
            <Text style={styles.photoTime}>{currentTime}</Text>
          </View>
        )}
      </Animated.View>
    );
  };

  return (
    <>
      {/* Chat header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{CONTACT.initial}</Text>
          </View>
          <View style={styles.onlineIndicator} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.contactName}>{CONTACT.name}</Text>
          <Text style={styles.contactStatus}>{CONTACT.status}</Text>
        </View>
      </View>

      {/* Timestamp */}
      <View style={styles.timestampContainer}>
        <Text style={styles.timestampText}>Today</Text>
      </View>

      {/* Messages */}
      <View style={styles.messagesArea}>
        {INTRO_MESSAGES.map((msg, index) => renderMessage(msg, index))}
        
        {/* Wife typing indicator */}
        {wifeIsTyping && (
          <View style={styles.typingBubble}>
            <View style={styles.typingDots}>
              <View style={[styles.typingDot, styles.typingDot1]} />
              <View style={[styles.typingDot, styles.typingDot2]} />
              <View style={[styles.typingDot, styles.typingDot3]} />
            </View>
          </View>
        )}

        {/* Failed message bubble - appears after player "sends" */}
        {failedMessage && (
          <View style={styles.failedMessageContainer}>
            <View style={[
              styles.messageBubble,
              styles.messageBubbleSent,
              failedMessageStatus === 'failed' && styles.messageBubbleFailed
            ]}>
              <Text style={[styles.messageText, styles.messageTextSent]}>
                {failedMessage}
              </Text>
              <View style={styles.messageFooter}>
                <Text style={styles.messageTime}>{currentTime}</Text>
                <Text style={[
                  styles.readReceipt,
                  failedMessageStatus === 'failed' && styles.readReceiptFailed
                ]}>
                  {failedMessageStatus === 'sending' ? 'Sending...' : 'Not delivered'}
                </Text>
              </View>
            </View>
            {failedMessageStatus === 'failed' && (
              <View style={styles.failedIcon}>
                <Text style={styles.failedIconText}>!</Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Input bar */}
      <View style={styles.inputBar}>
        <View style={[styles.inputField, isTyping && styles.inputFieldActive]}>
          {isTyping ? (
            <Text style={styles.inputText} numberOfLines={1}>
              {typingText}
              <Text style={[styles.cursor, !showCursor && styles.cursorHidden]}>|</Text>
            </Text>
          ) : (
            <Text style={styles.inputPlaceholder}>Message...</Text>
          )}
        </View>
        <View style={[styles.sendButton, isTyping && styles.sendButtonActive]}>
          <Text style={styles.sendButtonText}>→</Text>
        </View>
      </View>
    </>
  );
};

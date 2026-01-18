// Intro sequence message data and timing constants

export interface IntroMessage {
  type: 'text' | 'image';
  text?: string;
  caption?: string;
  delay: number;
  sender: 'wife' | 'player';
  typingStart: number;
}

export const INTRO_MESSAGES: IntroMessage[] = [
  { 
    type: 'text', 
    text: "Good luck at work today, you've got this!", 
    delay: 2500, 
    sender: 'wife', 
    typingStart: 0 
  },
  { 
    type: 'text', 
    text: "Thanks bubba :)", 
    delay: 9000, 
    sender: 'player', 
    typingStart: 4000 
  },
  { 
    type: 'image', 
    caption: "Going for a walk! Have a wonderful day, we miss you", 
    delay: 13000, 
    sender: 'wife', 
    typingStart: 10500 
  },
];

// Delay before AMBER alert appears
export const ALERT_DELAY = 20000;

// Message player is typing when alert interrupts
export const INTERRUPTED_MESSAGE = "Miss you too bubba love you";

// Contact info displayed in message header
export const CONTACT = {
  name: 'Maya',
  initial: 'M',
  status: 'online',
};

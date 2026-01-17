export interface NarrativeMessage {
  text: string;
  sender?: 'WIFE' | 'SUPERVISOR' | 'SYSTEM';
  minShift?: number;
  maxShift?: number;
  minInfractions?: number;
}

export const POSITIVE_MESSAGES: NarrativeMessage[] = [
  { sender: 'WIFE', text: "Miss you.", minShift: 1, maxShift: 3 },
  { sender: 'WIFE', text: "Dinner's ready when you are.", minShift: 1, maxShift: 3 },
  { sender: 'WIFE', text: "She drew a picture of you today.", minShift: 1, maxShift: 3 },
  { sender: 'WIFE', text: "They said you're doing well.", minShift: 4, maxShift: 6 },
  { sender: 'WIFE', text: "I'm proud of you. Stay focused.", minShift: 4, maxShift: 6 },
  { sender: 'WIFE', text: "Someone dropped off a package. Said it was a thank you.", minShift: 4, maxShift: 6 },
  { sender: 'WIFE', text: "They mentioned a promotion.", minShift: 7, maxShift: 9 },
  { sender: 'WIFE', text: "We might get to move to a better sector.", minShift: 7, maxShift: 9 },
  { sender: 'WIFE', text: "I feel safe knowing you're out there.", minShift: 7, maxShift: 9 },
  { sender: 'WIFE', text: "Come home soon. We'll be here.", minShift: 10 },
];

export const NEGATIVE_MESSAGES: NarrativeMessage[] = [
  { sender: 'SUPERVISOR', text: "NOTICE: Subject processing error detected. Accuracy is mandatory.", minInfractions: 1 },
  { sender: 'WIFE', text: "Tim... two men in grey coats were standing outside the house today. They didn't knock. Just watched.", minInfractions: 2 },
  { sender: 'SUPERVISOR', text: "URGENT: Multiple protocol violations logged. Disciplinary action pending.", minInfractions: 3 },
  { sender: 'WIFE', text: "Someone bumped into me at the market. He knew your name, Tim. He said you should 'stay focused.' I'm scared.", minInfractions: 4 },
  { sender: 'SYSTEM', text: "CITIZEN STATUS UNDER REVIEW. SECURITY CLEARANCE DEGRADED.", minInfractions: 5 },
  { sender: 'WIFE', text: "Please be careful. I don't know what to tell them anymore.", minShift: 4, maxShift: 6 },
  { sender: 'WIFE', text: "Someone came by. I didn't answer.", minShift: 7, maxShift: 9 },
];

export const NEUTRAL_MESSAGES: NarrativeMessage[] = [
  { text: "I was worried. But we're okay.", minShift: 4 },
  { text: "Whatever happened, it seems to have passed.", minShift: 4 },
  { text: "Something feels different. Is everything okay?", minShift: 4 },
  { text: "You seem distracted lately. They notice.", minShift: 4 },
  { text: "I never know what to expect anymore.", minShift: 4 },
  { text: "Just... be consistent. For us.", minShift: 4 },
];

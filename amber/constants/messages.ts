export interface NarrativeMessage {
  text: string;
  sender?: 'WIFE' | 'SUPERVISOR' | 'SYSTEM';
  minShift?: number;
  maxShift?: number;
  minInfractions?: number;
}

export const POSITIVE_MESSAGES: NarrativeMessage[] = [
  { sender: 'WIFE', text: "Have fun at your new post. I know it's not the job you wanted, but it's a start.", minShift: 1, maxShift: 2 },
  { sender: 'WIFE', text: "Just saw a train pass. Was that yours? Stay safe in the city.", minShift: 1, maxShift: 3 },
  { sender: 'WIFE', text: "Dinner's ready when you are. The rations today were actually decent.", minShift: 1, maxShift: 3 },
  { sender: 'WIFE', text: "She drew a picture of you at your 'big desk' today.", minShift: 1, maxShift: 3 },
  { sender: 'WIFE', text: "The neighbors asked about your new clearance. I didn't say much.", minShift: 4, maxShift: 6 },
  { sender: 'WIFE', text: "I'm proud of you. Even if the work is... heavy. Stay focused.", minShift: 4, maxShift: 6 },
  { sender: 'WIFE', text: "Someone dropped off a package. Said it was a 'processing bonus.'", minShift: 4, maxShift: 6 },
  { sender: 'WIFE', text: "They mentioned a promotion to Senior Watcher.", minShift: 7, maxShift: 9 },
  { sender: 'WIFE', text: "We might get to move to a Sector with actual sunlight soon.", minShift: 7, maxShift: 9 },
  { sender: 'WIFE', text: "I feel safe knowing you're behind the screen.", minShift: 7, maxShift: 9 },
  { sender: 'WIFE', text: "Come home soon. The city feels quieter when you're on shift.", minShift: 10 },
];

export const NEGATIVE_MESSAGES: NarrativeMessage[] = [
  { sender: 'SUPERVISOR', text: "NOTICE: Processing discrepancy detected. Amber Alert Assistance requires 100% fidelity.", minInfractions: 1 },
  { sender: 'WIFE', text: "Tim... two men in grey coats were standing outside the house today. They didn't knock. Just watched.", minInfractions: 2 },
  { sender: 'SUPERVISOR', text: "URGENT: Multiple protocol violations logged. Your sector clearance is being reviewed.", minInfractions: 3 },
  { sender: 'WIFE', text: "Someone bumped into me at the market. He knew your name, Tim. He said you should 'stop looking so closely.' I'm scared.", minInfractions: 4 },
  { sender: 'SYSTEM', text: "OPERATOR STATUS: CRITICAL. LOYALTY PROTOCOLS ACTIVATED.", minInfractions: 5 },
  { sender: 'WIFE', text: "Please be careful. I don't know what to tell the Watchers anymore.", minShift: 4, maxShift: 6 },
  { sender: 'WIFE', text: "Someone came by. They asked if you were 'seeing things correctly.'", minShift: 7, maxShift: 9 },
];

export const NEUTRAL_MESSAGES: NarrativeMessage[] = [
  { text: "I was worried. But we're okay.", minShift: 4 },
  { text: "Whatever happened, it seems to have passed.", minShift: 4 },
  { text: "Something feels different. Is everything okay?", minShift: 4 },
  { text: "You seem distracted lately. They notice.", minShift: 4 },
  { text: "I never know what to expect anymore.", minShift: 4 },
  { text: "Just... be consistent. For us.", minShift: 4 },
];

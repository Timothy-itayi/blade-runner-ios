export interface NarrativeMessage {
  text: string;
  minShift?: number;
  maxShift?: number;
}

export const POSITIVE_MESSAGES: NarrativeMessage[] = [
  { text: "Miss you.", minShift: 1, maxShift: 3 },
  { text: "Dinner's ready when you are.", minShift: 1, maxShift: 3 },
  { text: "She drew a picture of you today.", minShift: 1, maxShift: 3 },
  { text: "They said you're doing well.", minShift: 4, maxShift: 6 },
  { text: "I'm proud of you. Stay focused.", minShift: 4, maxShift: 6 },
  { text: "Someone dropped off a package. Said it was a thank you.", minShift: 4, maxShift: 6 },
  { text: "They mentioned a promotion.", minShift: 7, maxShift: 9 },
  { text: "We might get to move to a better sector.", minShift: 7, maxShift: 9 },
  { text: "I feel safe knowing you're out there.", minShift: 7, maxShift: 9 },
  { text: "Come home soon. We'll be here.", minShift: 10 },
];

export const NEGATIVE_MESSAGES: NarrativeMessage[] = [
  { text: "Miss you.", minShift: 1, maxShift: 3 },
  { text: "Dinner's cold but I saved you a plate.", minShift: 1, maxShift: 3 },
  { text: "She asked about you again today.", minShift: 1, maxShift: 3 },
  { text: "They're asking questions about you.", minShift: 4, maxShift: 6 },
  { text: "Please be careful.", minShift: 4, maxShift: 6 },
  { text: "I don't know what to tell them anymore.", minShift: 4, maxShift: 6 },
  { text: "Someone came by. I didn't answer.", minShift: 7, maxShift: 9 },
  { text: "I haven't heard from you.", minShift: 7, maxShift: 9 },
  { text: "Are you still there?", minShift: 7, maxShift: 9 },
];

export const NEUTRAL_MESSAGES: NarrativeMessage[] = [
  { text: "I was worried. But we're okay.", minShift: 4 },
  { text: "Whatever happened, it seems to have passed.", minShift: 4 },
  { text: "Something feels different. Is everything okay?", minShift: 4 },
  { text: "You seem distracted lately. They notice.", minShift: 4 },
  { text: "I never know what to expect anymore.", minShift: 4 },
  { text: "Just... be consistent. For us.", minShift: 4 },
];

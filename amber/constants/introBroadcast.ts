// =============================================================================
// INTRO NEWS BROADCAST - World-building content for pre-game cinematic
// =============================================================================

export interface IntroBroadcastSegment {
  type: 'BREAKING' | 'SYSTEM' | 'LOCAL' | 'ALERT';
  headline: string;
  subtext: string;
  duration: number; // milliseconds
}

export const INTRO_NEWS_SEGMENTS: IntroBroadcastSegment[] = [
  {
    type: 'ALERT',
    headline: 'SECTOR TRANSIT AUTHORITY BULLETIN',
    subtext: 'All citizens reminded: Inter-sector movement requires valid credentials. Unauthorized transit is a Class-2 violation punishable by detention.',
    duration: 7000,
  },
  {
    type: 'SYSTEM',
    headline: 'CHECKPOINT OPERATIONS RESUME',
    subtext: 'Verification operators across all sectors report to designated stations. Your duty: confirm identity, verify credentials, protect the system.',
    duration: 7000,
  },
  {
    type: 'LOCAL',
    headline: 'SECTOR 9 TRANSIT POINT NOW ACTIVE',
    subtext: 'Morning processing begins at 0600. All subjects must present valid documentation for sector access approval. Cooperation ensures efficiency.',
    duration: 6000,
  },
  {
    type: 'BREAKING',
    headline: 'REMINDER: TRUST NOTHING AT FACE VALUE',
    subtext: 'Recent security incidents highlight the importance of thorough verification. The system depends on your vigilance. The system is watching.',
    duration: 6000,
  },
];

// Total duration of intro broadcast (for progress tracking)
export const INTRO_BROADCAST_DURATION = INTRO_NEWS_SEGMENTS.reduce(
  (total, segment) => total + segment.duration,
  0
);

// Scrolling ticker items for ambient world-building
export const INTRO_TICKER_ITEMS = [
  'TRANSIT AUTHORITY: ALL SYSTEMS NOMINAL',
  'CHECKPOINT 9: ONLINE',
  'SECTOR 8: AWAITING CLEARANCE',
  'COMPLIANCE MANDATORY',
  'VERIFICATION PROTOCOL: ACTIVE',
  'CURFEW: 2200-0600',
  'REPORT SUSPICIOUS ACTIVITY',
  'THE SYSTEM PROTECTS',
];

// Audio file reference (to be created)
export const INTRO_AUDIO = {
  narration: require('../assets/news/anchor-narration/shift1-news-2.mp3'), // Placeholder - use existing audio for now
};

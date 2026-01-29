# Phase 5: The Wrapped

## Goal

Create the end-of-shift summary screen — Spotify Wrapped style stats and visualization.

---

## Core Concept

After processing all subjects, the player sees their shift summarized:
- Stats and numbers
- Visual breakdown
- Node map state
- AMBER's "congratulations"

This is the bridge between processing and bug resolution.

---

## Flow

```
LAST SUBJECT DECIDED
        ↓
    STATS DISPLAY
        ↓
    NODE MAP SHOWN
        ↓
  AMBER MESSAGE
        ↓
  BUG RESOLUTION (Phase 4)
```

---

## Stats Displayed

| Stat | Format |
|------|--------|
| **Subjects Processed** | "3 SUBJECTS" |
| **Approved** | "2 APPROVED" (with green) |
| **Denied** | "1 DENIED" (with red) |
| **Consequences** | "1 CASUALTY" (if any) |
| **Time** | "AVG 23s PER SUBJECT" (optional) |

---

## Visual Breakdown

### Pie/Donut Chart
- Green segment: Approved
- Red segment: Denied
- Animated fill

### Bar Chart (Alternative)
- Horizontal bars for each stat
- Animated grow

### Icon Grid
- Subject icons with colored state indicators
- Quick visual scan

---

## Node Map Preview

After stats, show current node map state:
- Zoom out to show all nodes
- Highlight new connections from this shift
- Brief pause for player to absorb

---

## AMBER Message

Corporate congratulations. Hollow. On purpose.

**Examples:**

```
"SHIFT COMPLETE. 
PROCESSING EFFICIENCY: ACCEPTABLE.
GOOD WORK, OPERATOR."
```

```
"3 SUBJECTS PROCESSED.
THROUGHPUT WITHIN PARAMETERS.
AMBER THANKS YOU."
```

```
"SHIFT 1 CONCLUDED.
0 CITATIONS. 0 WARNINGS.
CONTINUE TO NEXT SHIFT."
```

The message is intentionally bureaucratic. It doesn't acknowledge deaths or consequences. Just metrics.

---

## Data Structures

```typescript
interface ShiftSummary {
  shiftId: number;
  subjectsProcessed: number;
  approved: number;
  denied: number;
  consequences: {
    casualties: number;
    cascades: number;
  };
  avgDecisionTimeMs?: number;
  timestamp: number;
}
```

---

## UI Layout

```
┌─────────────────────────────────────┐
│                                     │
│          SHIFT 1 COMPLETE           │
│                                     │
│   ┌───────────────────────────┐     │
│   │     3 SUBJECTS            │     │
│   │     ●● APPROVED           │     │
│   │     ● DENIED              │     │
│   └───────────────────────────┘     │
│                                     │
│         [NODE MAP PREVIEW]          │
│                                     │
│   "GOOD WORK, OPERATOR."            │
│                                     │
│         [ CONTINUE ]                │
│                                     │
└─────────────────────────────────────┘
```

---

## Animation Sequence

1. **Fade in title** — "SHIFT 1 COMPLETE" (0.5s)
2. **Count up stats** — Numbers animate from 0 (1s total)
3. **Chart fills** — Pie/bar animates (0.5s)
4. **Node map zooms in** — From overview to detail (1s)
5. **AMBER message types** — Typewriter effect (1s)
6. **Continue button fades in** — (0.3s)

Total: ~4 seconds, feel significant but not slow.

---

## MVP Scope

| Item | Count |
|------|-------|
| Stats | 3 (processed, approved, denied) |
| Visualization | 1 (simple pie or bars) |
| AMBER messages | 3 variants |

---

## Acceptance Criteria

- [ ] Wrapped screen appears after last decision
- [ ] Stats display with count-up animation
- [ ] Visualization renders correctly
- [ ] Node map preview shows current state
- [ ] AMBER message displays
- [ ] Continue button leads to bug resolution
- [ ] Skip button (optional) for replay

---

## Audio (Optional)

- Stats reveal: Subtle beeps/chimes
- AMBER message: Synthetic voice or text-to-speech effect
- Continue: Button click sound

---

## Out of Scope (Phase 5)

- Detailed casualty breakdown (Phase 6)
- Cross-shift comparisons (Phase 6)
- Social sharing of wrapped (future)

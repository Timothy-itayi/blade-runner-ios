# Phase 4: Bug Resolution

## Goal

Implement the post-shift phase where denied subjects are "resolved" through 5 options.

---

## Core Concept

AMBER reframes denials as "bugs" that need to become "features." The player chooses what happens to each denied subject.

---

## The 5 Options

| Option | What It Does | Map Effect |
|--------|--------------|------------|
| **SEND** | Route to another station | New station node spawns, subject connects |
| **FIX** | Modify and requeue | Successor node (-2) spawns below |
| **PASS** | Send to higher authority | Subject connects to Central node |
| **HOLD** | Store indefinitely | Node state → held, connection freezes |
| **RELEASE** | Let go off-grid | Node state → gone, empties |

---

## Flow

1. Shift ends
2. Wrapped displays (Phase 5)
3. AMBER shows denied subjects list
4. For each denied subject:
   - Prompt appears
   - Player selects option
   - Node map updates
   - Next subject (or shift ends)
5. Next shift begins

---

## Prompt UI

```
┌─────────────────────────────────────┐
│  KIRA                               │
│  DENIED — AWAITING ASSIGNMENT       │
│                                     │
│  ▸ SEND                             │
│    Route to another station.        │
│    Opens new path on map.           │
│                                     │
│  ▸ FIX                              │
│    Modify and requeue.              │
│    They come back changed.          │
│                                     │
│  ▸ PASS                             │
│    Send to higher authority.        │
│    You won't see what happens.      │
│                                     │
│  ▸ HOLD                             │
│    Store indefinitely.              │
│    Frozen. Not gone.                │
│                                     │
│  ▸ RELEASE                          │
│    Let go. Off-grid.                │
│    They don't come back.            │
│                                     │
└─────────────────────────────────────┘
```

---

## Data Structures

```typescript
type ResolutionOption = 'SEND' | 'FIX' | 'PASS' | 'HOLD' | 'RELEASE';

interface Resolution {
  subjectId: string;
  option: ResolutionOption;
  timestamp: number;
  resultingNodeId?: string; // For SEND (station) or FIX (successor)
}

interface BugResolutionState {
  pendingSubjects: string[]; // IDs of denied subjects
  currentIndex: number;
  resolutions: Resolution[];
}
```

---

## Option Details

### SEND
- Creates new station node
- Station name: "STATION-[random number]"
- Subject connects to station via ROUTE edge
- Future subjects may route through this station

### FIX
- Creates successor node: "[NAME]-2"
- Original node labeled "[NAME] → [NAME]-2"
- Successor may appear in future shifts
- Successor has modified traits

### PASS
- Central node exists (singleton)
- Subject connects via ESCALATE edge
- Subject state → pending (forever)
- May be referenced in news reports

### HOLD
- No new nodes
- Subject state → held
- Connection gets X marker
- Can be "recalled" in future (not MVP)

### RELEASE
- No new nodes
- Subject state → gone
- Node empties (no fill)
- Label: "[NAME] — GONE"

---

## MVP Scope

| Item | Count |
|------|-------|
| Denied subjects per shift | 0-3 |
| Resolution options | 5 |
| Immediate effects | Node map updates only |

---

## Acceptance Criteria

- [ ] Denied subjects queued after shift
- [ ] Resolution prompt appears for each
- [ ] All 5 options are selectable
- [ ] SEND creates station node and edge
- [ ] FIX creates successor node
- [ ] PASS creates Central connection
- [ ] HOLD freezes node
- [ ] RELEASE empties node
- [ ] Resolution stored in state
- [ ] Next shift begins after resolution complete

---

## UI Notes

### Option Buttons
- Vertical stack
- Clear labels
- Description on second line
- Tap to select
- Confirmation not required (immediate)

### Transition
- Selection animates briefly
- Node map updates in background
- Short delay before next prompt

---

## Out of Scope (Phase 4)

- FIX subjects appearing in future shifts (Phase 6)
- SEND stations affecting future subjects (Phase 6)
- PASS news report references (Phase 6)
- HOLD recall system (future feature)

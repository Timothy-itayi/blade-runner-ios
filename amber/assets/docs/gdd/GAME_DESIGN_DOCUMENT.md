# AMBER: Game Design Document v2.0

## One-Line Pitch

A border control game where every decision creates consequences you must see — and live with.

---

## Core Loop

```
PROCESS → DECIDE → SEE CONSEQUENCES → RESOLVE DENIALS → REPEAT
```

1. **Process**: Subjects appear at your checkpoint. You investigate.
2. **Decide**: Approve or Deny based on the directive.
3. **See**: Node map shows what happened. Who lived. Who died. Why.
4. **Resolve**: Denied subjects become "bugs." You choose what happens to them.
5. **Repeat**: Next shift. Directive changes. Complexity grows.

---

## Design Pillars

### 1. Full Transparency
The game shows exactly what happened and why. No hidden mechanics. No random failures. Every consequence traces back to a decision you made.

### 2. No Recovery
Choices are permanent. The node map is your legacy. You can't undo, reload, or fix mistakes. You can only decide what to do next.

### 3. No Judgment
The game doesn't tell you that you were wrong. It shows you what happened. Whether that's "good" or "bad" is your interpretation.

### 4. Player-Authored Story
You create the narrative through your decisions. The game visualizes it. At the end, you see the web you wove.

---

## The Setting

### Year 3184 — AMBER Transit Network

**Earth** is the destination. Everyone wants in. Limited access. High security.

**AMBER** is the gatekeeper. A transit hub in orbit around Earth. All traffic flows through AMBER.

**You** are an operator. You process subjects. You follow directives. You don't ask questions.

### The Network

| Location | Description |
|----------|-------------|
| **EARTH** | Destination. Protected. Exclusive. |
| **MARS** | Corporate world. Compliant population. |
| **EUROPA** | Scientific outpost. Secretive. |
| **TITAN** | Industrial. Desperate. High denial rate. |
| **IO** | Lawless fringe. Default suspicion. |
| **THE VOID** | Off-grid space. Untracked. Unknown. |
| **ARCHIVE** | AMBER storage. Indefinite hold. |
| **CENTRAL** | Higher authority. Above your clearance. |

---

## Subject Types

| Type | Description |
|------|-------------|
| **HUMAN** | Baseline Earth-origin |
| **REPLICANT** | Synthetic human, full autonomy |
| **HYBRID** | Human with synthetic augments |
| **CONSTRUCT** | Fully synthetic, non-human origin |
| **REMNANT** | Post-human, degraded/glitching |
| **UNKNOWN** | Classification pending |

---

## The Directive System

Each shift has a directive with exceptions. Clear. Binary. Learnable.

### Format

```
DENY: [CATEGORY]
EXCEPT: [CONDITION]
```

### Examples

**Shift 1 (Simple)**
```
DENY: WARRANTS
```

**Shift 2 (One Exception)**
```
DENY: ENGINEERS
EXCEPT: HUMANS
```

**Shift 3 (Stacked)**
```
DENY: REPLICANTS
EXCEPT: VIP CLEARANCE
EXCEPT: MEDICAL EMERGENCY
```

The player must check:
1. Does the subject match the DENY category?
2. Does the subject match ANY exception?
3. If DENY and no exception → DENY
4. If DENY but exception matches → APPROVE

---

## The Node Map

The primary storytelling surface. Every decision visualized.

### Node States

| State | Meaning | Visual |
|-------|---------|--------|
| **GREEN** | Approved, no harm | Green ring |
| **RED** | Approved, caused harm | Red ring |
| **GRAY** | Denied correctly | Gray ring |
| **YELLOW** | Denied incorrectly | Yellow ring |

### Connections

| Type | Meaning | Visual |
|------|---------|--------|
| **Solid** | Direct consequence | Solid line |
| **Dashed** | Indirect consequence | Dashed line |
| **Pulse** | Active harm chain | Red pulse animation |

### How It Works

1. Player is center node
2. Each subject is a node connected to player
3. Subjects can connect to each other (relationships, consequences)
4. As shifts stack, the web grows
5. End of game: full constellation of choices

---

## Bug Resolution

After each shift, denied subjects are reframed as "bugs" that need resolution.

### The 5 Options

| Option | What It Does | Map Visual |
|--------|--------------|------------|
| **SEND** | Route to another station | New branch spawns |
| **FIX** | Modify and requeue | Successor node appears |
| **PASS** | Send to higher authority | Faded connection |
| **HOLD** | Store indefinitely | Frozen connection (X) |
| **RELEASE** | Let go off-grid | Empty node (gone) |

### Prompt Format

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

## The Wrapped

End-of-shift summary. Spotify Wrapped style.

### Stats Shown

- Subjects processed
- Approved / Denied counts
- Consequence count (deaths, cascades)
- Time per decision (optional)

### Flow

1. Stats display with animations
2. Node map shown with current state
3. AMBER congratulates: "Good work, Operator."
4. Bug resolution begins

---

## Consequence Chains

### How Subject A Affects Subject B

**Direct Reference**: Subject B's file mentions Subject A.
> "KNOWN ASSOCIATE: KIRA (S1-02)"

**Conditional Outcome**: Subject B's fate changes based on Subject A.
> [If A approved]: B has access to weapon A smuggled
> [If A denied]: B is unarmed

**Delayed Revelation**: News report reveals connection.
> "EXPLOSION IN SECTOR 7. WEAPON TRACED TO KIRA. CASUALTIES INCLUDE VEX."

---

## Game Structure

### MVP Scope

| Shifts | Subjects | Directives |
|--------|----------|------------|
| 3 | 9 total (3 per shift) | Simple → Stacked |

### Full Scope

| Shifts | Subjects | Directives |
|--------|----------|------------|
| 9 | 36 total (4 per shift) | Full ladder |

### Shift Progression

| Shift | Directive Complexity | Subject Connections |
|-------|---------------------|---------------------|
| 1-3 | Simple (1 rule, 0-1 exception) | Few connections |
| 4-6 | Medium (1 rule, 1-2 exceptions) | Cross-shift connections |
| 7-9 | Complex (stacked rules, multiple exceptions) | Dense web |

---

## Endgame

### Final Beat Options

**A. The Full Web**
Slow zoom out. All nodes visible. No text. Just the shape of your decisions.

**B. The Names**
Scroll of every subject. Name + outcome.
> "KIRA — APPROVED — DECEASED"
> "VEX — DENIED — RELEASED — GONE"

**C. The Mirror**
Stats about your patterns.
> "You approved 70% of humans."
> "You denied 90% of replicants."

**D. Silence**
Web fades. Black screen. Credits.

---

## Development Phases

| Phase | Focus | Deliverable |
|-------|-------|-------------|
| 1 | Core Loop | Subject processing, Approve/Deny |
| 2 | Directive System | Rules + Exceptions |
| 3 | Node Map | Consequence visualization |
| 4 | Bug Resolution | Post-shift resolution |
| 5 | The Wrapped | Stats summary |
| 6 | Content | 36 subjects, full directive ladder |

Each phase has its own overview and Trello board in the `/gdd/phase-X-*/` directories.

---

## Language Guidelines

### Keep It Simple

- One idea per line
- Verbs first (DENY, ALLOW, SEND, FIX)
- No corporate jargon
- Consequences in plain words

### Examples

**Bad**: "Subject status has been updated to TERMINAL following discharge to unmonitored space."

**Good**: "They don't come back."

---

## Success Metrics

### Player Experience

- Decision time: 10-30 seconds per subject (engaged, not rushed)
- Completion rate: 80%+ finish the game
- Replay rate: 30%+ play again with different choices

### Technical

- 60fps during all interactions
- Node map renders smoothly at 50+ nodes
- No loading between subjects

---

## References

- **Papers Please**: Directive system, document checking
- **The Hurt Locker**: Stakes, incomplete information, consequences
- **Disco Elysium**: Morally agnostic design, player interpretation
- **Frostpunk**: Visualized consequences, no "right" answer

---

## File Structure

```
/gdd/
├── GAME_DESIGN_DOCUMENT.md (this file)
├── phase-1-core-loop/
│   ├── OVERVIEW.md
│   └── TRELLO.md
├── phase-2-directive-system/
│   ├── OVERVIEW.md
│   └── TRELLO.md
├── phase-3-node-map/
│   ├── OVERVIEW.md
│   └── TRELLO.md
├── phase-4-bug-resolution/
│   ├── OVERVIEW.md
│   └── TRELLO.md
├── phase-5-the-wrapped/
│   ├── OVERVIEW.md
│   └── TRELLO.md
└── phase-6-content/
    ├── OVERVIEW.md
    └── TRELLO.md
```

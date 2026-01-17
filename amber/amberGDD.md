# PROJECT: AMBER — СУДЬБА (SUDBA)
## Game Design Document v0.2

---

## PREMISE

The year is irrelevant. You are an Operator at a Sector Verification Station. Your job is to process subjects requesting transit between sectors. The system is cold, clinical, and increasingly contradictory.

AMBER is a high-tension, narrative-driven verification simulator for iOS. It challenges the player's ability to cross-reference data under the guise of an "efficient" bureaucratic machine. What begins as a straightforward task of checking warrants and IDs slowly descends into a moral quagmire where the rules stop making sense and the human cost of your decisions starts to haunt the HUD.

**Design Philosophy:** Unlike Papers Please, which relies on physical document manipulation, AMBER creates tension through *observation* and *accumulation*. Mobile users don't read—they notice. Every system is designed around micro-discoveries that reward attention without demanding text comprehension.

---

## CORE MECHANICS

### 1. Biometric Verification (`ScanPanel`, `EyeDisplay`)

| Element | Function | Tension Source |
|---------|----------|----------------|
| Retinal Scan | Live-feed monitoring of ocular response | Micro-anomalies (blink patterns, pupil dilation) |
| Fingerprint Analysis | Ridge characteristics (BIFUR, CORE, DELTA, ISLAND) | Point count discrepancies |
| BPM Monitoring | Real-time heart rate | Stress tells vs. baseline records |

**Design Note:** BPM is a *clue*, not a verdict. High BPM could mean guilt, fear of authority, or a heart condition. The system doesn't care. You might.

### 2. Data Cross-Referencing (`IntelPanel`, `ScanData`)

| Field | Verification Logic |
|-------|-------------------|
| ID Code | Check format validity, flag duplicates |
| LOC Record | Previous Location (PL) vs. stated origin |
| D.O.B | Age verification, era inconsistencies |
| Compliance Rating | A (exemplary) → F (flagged for review) |
| Status | ACTIVE / PROVISIONAL / RESTRICTED / TERMINATED |

### 3. Verification Protocol (`VerificationDrawer`)

The "Deep Dive" panel. Cross-references:
- Sector authorization levels
- Function permits (Engineering, Logistics, Medical, etc.)
- Active warrant database
- **The Discrepancy:** Mismatches between stated *Reason for Visit* and official *Function*

### 4. Decision Interface (`DecisionButtons`)

Two buttons. No undo.

| Action | Consequence |
|--------|-------------|
| **APPROVE** | Subject granted transit. Logged to your record. |
| **DENY** | Subject rejected. Logged to your record. |

Every choice echoes. A denial in Phase 2 may surface as a consequence in Phase 5.

---

## NARRATIVE SYSTEMS

### The Supervisor Protocol

The Supervisor is never seen. They exist only as **SYSTEM BRIEFINGS**—terse, authoritarian notifications that appear at shift start or mid-shift.

**Design Principles:**
- Briefings are **one-liners**, not paragraphs
- Each briefing changes exactly one rule
- The next subject always tests the new rule
- Briefings become contradictory by Phase 4

**Example Briefing Cascade:**

| Phase | Briefing | Immediate Test |
|-------|----------|----------------|
| 1 | `STANDARD PROTOCOL: DENY ALL ACTIVE WARRANTS` | Subject with active warrant |
| 2 | `UPDATE: ENGINEERING PERSONNEL REQUIRE DUAL AUTHORIZATION` | Engineer requesting solo transit |
| 3 | `PRIORITY: SECTOR 4 REPAIRS CRITICAL. EXPEDITE ENGINEERING.` | Same engineer returns |
| 4 | `CORRECTION: DUAL AUTHORIZATION REMAINS MANDATORY. NO EXCEPTIONS.` | Engineer again. BPM elevated. |
| 5 | `NOTICE: THERMAL FAILURE IN SECTOR 4. CASUALTIES REPORTED.` | No subject. Just the weight. |

**Supervisor Tone:**
- Never explains *why*
- Never acknowledges your decisions
- Occasionally acknowledges *failures* with: `PERFORMANCE REVIEW SCHEDULED`
- In late game: briefings arrive mid-verification, forcing rushed decisions

### The Evidence Locker (`LoreObjectSystem`)

Certain denied subjects trigger a system notification:

```
CONTRABAND LOGGED: ITEM #0047
```

The player cannot see what it is. Items accumulate silently.

**Unlock Threshold:** After 10 logged items, a new drawer appears in the interface:

```
[ EVIDENCE LOCKER ] — 10 ITEMS
```

**Lore Object Types:**

| Category | Example | Emotional Weight |
|----------|---------|------------------|
| Personal | Child's drawing of "home" | Humanizes the denied |
| Documentary | Photograph with faces scratched out | Implies state violence |
| Cartographic | Hand-drawn map fragment | Builds the Sector Map |
| Systemic | Memo with redacted sender | Questions the Supervisor |
| Temporal | Calendar marked "LAST DAY" | Creates dread |

**Design Rules:**
- Objects are **visual**, not textual
- No object requires reading more than 5 words
- Objects from related subjects (VOSS family, VOLKOV family) form mini-collections
- Some objects only make sense when paired with others

**Collection Mechanic:**
- Objects are organized by category tabs
- Tapping an object shows it fullscreen with minimal annotation
- Some objects have a `[?]` that reveals a single line of context after Phase 4

### The Sector Map (`MapProgressionSystem`)

The map is never *given*. It is *built* from your decisions.

**How It Works:**

Every processed subject mentions a sector. Every approval/denial modifies the map state.

| Action | Map Effect |
|--------|------------|
| Approve transit to Sector X | Sector X gains population indicator |
| Deny transit from Sector Y | Sector Y dims slightly |
| Deny subject with medical flag | Red cross appears at their origin sector |
| Approve subject with warrant | Sector gains "instability" marker |

**Discovery Moment:**

After processing ~15 subjects, a new menu option flickers into existence:

```
[ SYSTEM DIAGNOSTIC ]
```

Tapping it reveals the map for the first time—a schematic of sectors you've been shaping without knowing. The map reflects your choices:

- High-approval sectors: Bright, populated
- High-denial sectors: Dim, marked "LOW ACTIVITY"
- Sectors you've never processed: Completely dark, labeled `NO DATA`

**Map Evolution:**

| Phase | Map State |
|-------|-----------|
| 1-2 | Map hidden. Data collecting silently. |
| 3 | `SYSTEM DIAGNOSTIC` appears. Map revealed. |
| 4 | Map starts showing consequences (medical emergencies, population shifts) |
| 5 | Your Operator ID appears at your station's sector |
| 6 | A sector disappears entirely. No explanation. |

**Cartographic Lore Objects:**

Hand-drawn map fragments from the Evidence Locker can be **overlaid** onto the system map, revealing:
- Patrol routes (handwritten: "WEST PATROL", "SOUTH PATROL")
- Danger zones (circled: "HOSTILE CAMP?", "INFESTATION")
- Escape routes (pink line: "SAFEST ROUTE TO CHECKPOINT CHARLIE")
- The Wall Perimeter

This creates a dual-layer map: the clinical system view and the human survival view.

---

## GAME FLOW (THE CURVE)

| Phase | Mechanical Focus | Emotional Tone | New Systems |
|-------|-----------------|----------------|-------------|
| **1: Calibration** | Learn the interface | Neutral efficiency | Basic verification |
| **2: Discrepancy** | Spot mismatches | Growing suspicion | Function/Sector conflicts |
| **3: The Tell** | Use behavioral data | Uncertainty | BPM analysis, DIAGNOSTIC unlocks |
| **4: Small Wrongness** | Notice micro-anomalies | Paranoia | Evidence Locker opens |
| **5: The Human Cost** | Face moral weight | Guilt/Defiance | Consequences surface |
| **6: System Failure** | Survive contradictions | Dread | Map sectors vanish, briefings conflict |

---

## KEY CHARACTERS

### Tutorial Arc

**ELARA VANCE (Subject 1)**
- Function: Engineering
- Status: Active, Compliance B
- Purpose: Establish baseline verification flow
- Clean record. Clear approval. Teaches PL/ADDR logic.

**KANE MORROW (Subject 2)**
- Function: Logistics
- Status: Active Warrant
- Purpose: Test basic procedural compliance
- First mandatory denial. Establishes consequences.

### Escalation Arc

**ELENA VOSS (Subject 3)**
- Function: Administrative
- Anomaly: Meeting scheduled for 03:42
- Purpose: First "small wrongness"
- Everything checks out *except* the timestamp. What do you do?

**DMITRI VOLKOV (Subject 7)**
- Function: Unknown
- Origin: SECTOR 9 (Status: REVOKED)
- Purpose: Introduce systemic erasure
- His sector no longer exists in the database. He does.

### Echo Arc

**MIRA VOSS (Subject 12)**
- Relation: Elena's daughter
- Anomaly: Requesting transit to your sector
- Purpose: Your past decision returns
- If you denied Elena, Mira's file contains: `MOTHER: DETAINED`

**LENA VOLKOV (Subject 15)**
- Relation: Dmitri's sister
- Anomaly: Carrying Item #0032 (photo)
- Purpose: Evidence Locker payoff
- The photo shows Dmitri. And someone who looks like your Operator portrait.

### The Mirror

**SUBJECT [REDACTED] (Subject 20)**
- ID: [YOUR OPERATOR CODE - 1]
- Previous Location: YOUR STATION
- Compliance: Inverse of your approval rate
- Purpose: The system is watching you too

---

## INTERFACE HIERARCHY

```
┌─────────────────────────────────────────┐
│  СУДЬБА (SUDBA)          CLOCK 15:56:14 │
├─────────────────────────────────────────┤
│ ┌─────────┐ ┌─────────┐ ┌─────────────┐ │
│ │ L PRINT │ │ R PRINT │ │             │ │
│ │ ● ● ●   │ │   ● ● ● │ │  RETINAL    │ │
│ │  BIFUR  │ │  DELTA  │ │   SCAN      │ │
│ └─────────┘ └─────────┘ │             │ │
│                         │  ◉ 82 BPM   │ │
│ MATCH: [F] [M]          └─────────────┘ │
│                                         │
│ LOC RECORD                              │
│ ADDR: SECTOR 7                          │
│ TIME: 14:22:11                          │
│ PL:   SECTOR 5                          │
│ D.O.B: 12/04/92                         │
├─────────────────────────────────────────┤
│ IDENTIFICATION          ● 82 BPM ACTIVE │
│ V1-EV001                                │
├─────────────────────────────────────────┤
│ SUBJECT 1                               │
│ NAME      ELARA VANCE                   │
│ ID        V1-EV001                      │
│ SECTOR    SECTOR 7                      │
│ FUNCTION  ENGINEERING                   │
│ COMPLIANCE B                            │
│ STATUS    ACTIVE                        │
│ INCIDENTS 0                             │
│ WARRANTS  NONE                          │
├─────────────────────────────────────────┤
│ REQUESTING: SECTOR 4                    │
│ "Repairs to thermal regulator."         │
│                    [ REVEAL VERIFICATION]│
├─────────────────────────────────────────┤
│   [ APPROVE ]          [ DENY ]         │
└─────────────────────────────────────────┘
```

**Hidden Interface Elements (unlock progressively):**

| Element | Unlock Condition | Location |
|---------|-----------------|----------|
| `SYSTEM DIAGNOSTIC` | 15 subjects processed | Top menu |
| `EVIDENCE LOCKER` | 10 contraband items | Bottom drawer |
| `OPERATOR FILE` | Phase 5 start | Long-press your ID |
| `[CORRUPTED]` | Specific denial pattern | Replaces subject name randomly |

---

## TECHNICAL ARCHITECTURE

### Stack
- **Framework:** React Native (Expo)
- **Typography:** Share Tech Mono (primary), monospace fallback
- **Animation:** React Native Reanimated for scanline effects, BPM pulse
- **State:** Zustand for decision history, narrative flags

### Data Model

```typescript
interface Subject {
  id: string;
  name: string;
  sector: string;
  function: SubjectFunction;
  compliance: 'A' | 'B' | 'C' | 'D' | 'F';
  status: 'ACTIVE' | 'PROVISIONAL' | 'RESTRICTED' | 'TERMINATED';
  incidents: number;
  warrants: Warrant[];
  bpm: number;
  bpmBaseline: number;
  previousLocation: string;
  dob: string;
  requestedSector: string;
  reason: string;
  anomalies: Anomaly[];
  linkedSubjects: string[]; // IDs of related characters
  contrabandItem?: LoreObject;
}

interface LoreObject {
  id: string;
  category: 'personal' | 'documentary' | 'cartographic' | 'systemic' | 'temporal';
  image: ImageSource;
  annotation?: string; // Max 5 words
  unlocksAt: Phase;
  pairedWith?: string[]; // Other object IDs that form a set
}

interface SectorState {
  id: string;
  population: number;
  stability: number;
  medicalIncidents: number;
  approvalCount: number;
  denialCount: number;
  status: 'ACTIVE' | 'RESTRICTED' | 'REVOKED' | 'NO_DATA';
}

interface Briefing {
  phase: Phase;
  trigger: 'SHIFT_START' | 'MID_SHIFT' | 'POST_DECISION';
  text: string; // Max 60 characters
  ruleChange?: RuleModification;
}
```

---

## AUDIO DESIGN

| Event | Sound |
|-------|-------|
| Subject arrival | Low hum + data chirp |
| BPM spike | Heartbeat becomes audible |
| Briefing received | Sharp tone, CRT flicker |
| APPROVE | Positive chime, brief |
| DENY | Negative buzz, lingers |
| Contraband logged | Muffled thud |
| Evidence Locker unlock | Mechanical drawer sound |
| Map sector change | Distant rumble |
| Sector REVOKED | Static burst, silence |

---

## APPENDIX: DESIGN PILLARS

1. **Observation Over Reading** — Every important element is visual or numerical
2. **Accumulation Over Exposition** — The story emerges from patterns
3. **Complicity Over Victimhood** — You are not a passive observer
4. **Ambiguity Over Answers** — The system is never fully explained
5. **Weight Over Speed** — Every decision should feel heavy

---

## VERSION HISTORY

| Version | Date | Changes |
|---------|------|---------|
| 0.1 | — | Initial mechanics draft |
| 0.2 | 2026-01-17 | Added Supervisor Protocol, Evidence Locker, Sector Map systems |
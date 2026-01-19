# AMBER: Turing Test Mechanic
## Detection Protocol for Non-Human Subjects

---

## Overview

The Turing Test is a new tab in the `VerificationDrawer` that becomes available from **Shift 5** onwards. It allows the Operator to probe subjects for signs of artificial origin through a series of pre-set questions.

---

## UI Location

```
┌─────────────────────────────────────────┐
│ VERIFICATION DRAWER                     │
├─────────────────────────────────────────┤
│ [SECTOR] [FUNCTION] [WARRANT] [MEDICAL] │
│                                         │
│ [TURING TEST] ← NEW TAB (Shift 5+)      │
└─────────────────────────────────────────┘
```

---

## Mechanic Flow

1. **Open Turing Test tab** in VerificationDrawer
2. **Select a question** from the question bank (3-5 available per subject)
3. **Subject responds** with text + response latency indicator
4. **System analysis** shows:
   - Response time (instant = suspicious, natural pause = human-like)
   - Cross-reference result (matches database? contradicts records?)
   - Confidence rating (HIGH / MEDIUM / LOW / INCONCLUSIVE)

---

## Question Bank

Each question probes a different aspect of humanity. Questions available depend on subject data.

### Memory Probes
| Question | Human Tell | Replicant Tell |
|----------|------------|----------------|
| "Describe your childhood home." | Specific sensory details, emotional inflection | Vague, generic, or suspiciously perfect |
| "What's your mother's name?" | Immediate, natural | Slight delay, or cross-reference mismatch |
| "What did you eat yesterday?" | Mundane, imperfect recall | Either can't recall or recites perfectly |

### Identity Probes  
| Question | Human Tell | Replicant Tell |
|----------|------------|----------------|
| "Have we met before?" | Genuine confusion or recognition | Too certain, exactly matches database |
| "How did you get that scar?" | Story with emotion, hesitation | Rehearsed, or no scar in bio-record |
| "Where were you this morning?" | Cross-reference with transit log | Transit log shows impossible location |

### Cognitive Probes
| Question | Human Tell | Replicant Tell |
|----------|------------|----------------|
| "What's 7 times 8?" | Slight pause (cognitive load), "56" | Instant: "56" (no processing delay) |
| "Tell me something you regret." | Hesitation, personal, emotional | Deflection, or programmed guilt response |
| "What would you do if you couldn't leave?" | Emotional response, fear/anger | Logical response, lack of affect |

### Contradiction Probes
| Question | Purpose |
|----------|---------|
| "Your record says you work in Logistics. Tell me about your last delivery." | If function is ENGINEERING, catch the lie |
| "Your transit log shows you were in Sector 6 yesterday. What were you doing there?" | If they weren't there, they'll fabricate or panic |
| "Your sister works here, right?" | If they have no sister, test for improvisation |

---

## Response Latency Indicator

```
RESPONSE TIME: ███████░░░ 1.2s [NATURAL]
RESPONSE TIME: ██████████ 0.1s [INSTANT] ⚠
RESPONSE TIME: ██░░░░░░░░ 4.8s [DELAYED] ?
```

| Latency | Interpretation |
|---------|----------------|
| `0.0s - 0.3s` | INSTANT — Suspiciously fast. Pre-programmed? |
| `0.4s - 2.0s` | NATURAL — Human-like processing time |
| `2.1s - 4.0s` | DELAYED — Nervous? Calculating? |
| `4.0s+` | STALLING — Avoiding the question? |

---

## Cross-Reference System

When a question is asked, the system automatically checks the answer against known data.

```
QUESTION: "What's your mother's name?"
RESPONSE: "Elena. Elena Volkov."
LATENCY: 0.8s [NATURAL]

CROSS-REFERENCE:
├─ FAMILY RECORD: Mother listed as "ELENA VOLKOV" ✓
├─ TONE: Emotional inflection detected ✓
└─ CONFIDENCE: HIGH — Response consistent
```

```
QUESTION: "What's your mother's name?"
RESPONSE: "Maria. Maria... Petrov."
LATENCY: 0.2s [INSTANT] ⚠

CROSS-REFERENCE:
├─ FAMILY RECORD: Mother listed as "NADIA PETROV" ✗
├─ TONE: Flat affect detected ⚠
└─ CONFIDENCE: LOW — Response inconsistent
```

---

## Turing Test Results

| Result | Display | Meaning |
|--------|---------|---------|
| `PASS` | `[TURING: PASS]` | Responses consistent. Human-like latency. Likely human. |
| `FAIL` | `[TURING: FAIL]` | Inconsistencies detected. Rehearsed answers. Likely replicant. |
| `INCONCLUSIVE` | `[TURING: ???]` | Some flags but not definitive. Player must decide. |
| `N/A` | `[TURING: N/A]` | No video feed or pre-Shift 5. Cannot perform test. |

---

## Subjects Without Video

If a subject has `has_video: false`, the Turing Test shows:

```
┌─────────────────────────────────────────┐
│ TURING TEST                             │
├─────────────────────────────────────────┤
│ ⚠ NO VIDEO FEED AVAILABLE               │
│                                         │
│ Subject communication limited to:       │
│ • Text-based dialogue                   │
│ • Biometric data (if available)         │
│ • Database cross-reference              │
│                                         │
│ TURING TEST: UNAVAILABLE                │
│                                         │
│ Operator must rely on other evidence.   │
└─────────────────────────────────────────┘
```

This forces the player to decide based on fingerprints, dialogue, and data alone.

---

## Integration with Biometric Anomalies

The Turing Test works in conjunction with scanner data:

| Scanner Shows | Turing Result | Interpretation |
|---------------|---------------|----------------|
| `SYN` (Synthetic) | `FAIL` | Definite replicant. |
| `SYN` (Synthetic) | `PASS` | Advanced replicant with human-like responses? Or scanner error? |
| `NON` (Normal) | `FAIL` | Human with prosthetics? Or hidden replicant? |
| `MIS` (Mismatch) | `INCONCLUSIVE` | Identity theft? Memory manipulation? Database corruption? |
| `PRO` (Prosthetic) | `PASS` | Human with synthetic parts. Medical history likely explains it. |

---

## Progressive Difficulty

| Shift | Turing Reliability | Replicant Sophistication |
|-------|-------------------|--------------------------|
| 5 | HIGH — Clear results | Basic models. Obvious tells. |
| 6 | HIGH | Standard models. Some natural responses. |
| 7 | MEDIUM — Some ambiguity | Advanced models. Implanted memories. |
| 8 | LOW — System degraded | Cutting-edge. Indistinguishable from human. |
| 9 | UNRELIABLE | The system might be testing YOU. |
| 10 | FAILING | Does it matter anymore? |

---

## Implementation Notes

### Data Structure Addition to Subject

```typescript
interface TuringTestData {
  available: boolean;           // false before Shift 5
  result: 'PASS' | 'FAIL' | 'INCONCLUSIVE' | 'N/A';
  questions: TuringQuestion[];  // Available questions for this subject
  hasVideoFeed: boolean;        // If false, Turing unavailable
}

interface TuringQuestion {
  id: string;
  text: string;
  category: 'MEMORY' | 'IDENTITY' | 'COGNITIVE' | 'CONTRADICTION';
  response: string;             // Pre-written response
  latency: number;              // Response time in seconds
  crossReference: {
    field: string;              // Database field to check
    matches: boolean;           // Does response match record?
    note: string;               // Cross-reference result text
  };
  toneAnalysis: 'EMOTIONAL' | 'FLAT' | 'NERVOUS' | 'REHEARSED';
}
```

### Component Structure

```
VerificationDrawer/
├── SectorTab.tsx
├── FunctionTab.tsx
├── WarrantTab.tsx
├── MedicalTab.tsx
└── TuringTestTab.tsx  ← NEW
    ├── QuestionSelector.tsx
    ├── ResponseDisplay.tsx
    ├── LatencyIndicator.tsx
    ├── CrossReferencePanel.tsx
    └── ConfidenceRating.tsx
```

---

## Example Interaction

**Subject: ELENA ROSS (Shift 8)**

Player opens Turing Test tab:

```
┌─────────────────────────────────────────┐
│ TURING TEST — ELENA ROSS                │
├─────────────────────────────────────────┤
│ SELECT QUESTION:                        │
│ ○ "Describe your childhood home."       │
│ ○ "Have we met before?"                 │
│ ● "Your record shows you were in S4     │
│    last week. What were you doing?"     │
│                                         │
│ [ ASK QUESTION ]                        │
└─────────────────────────────────────────┘
```

Player selects "Have we met before?" and taps ASK:

```
┌─────────────────────────────────────────┐
│ TURING TEST — ELENA ROSS                │
├─────────────────────────────────────────┤
│ QUESTION: "Have we met before?"         │
│                                         │
│ RESPONSE:                               │
│ "Yes. You approved me last week.        │
│  Sector 4. The thermal repair.          │
│  Don't you remember?"                   │
│                                         │
│ LATENCY: ██████████ 0.2s [INSTANT] ⚠    │
│                                         │
│ CROSS-REFERENCE:                        │
│ ├─ TRANSIT LOG: No entry for ELENA ROSS │
│ │  in your approval history ✗           │
│ ├─ MEMORY: Too specific, no hesitation  │
│ └─ CONFIDENCE: LOW                      │
│                                         │
│ [TURING: INCONCLUSIVE]                  │
│                                         │
│ Note: Either subject has false memory,  │
│ database was modified, or subject is    │
│ attempting deception.                   │
└─────────────────────────────────────────┘
```

**The horror**: Did you approve her? You don't remember. The database says no. But she's so certain. Is her memory fake? Is yours?

---

## Design Philosophy

The Turing Test is not meant to give definitive answers. It's meant to:

1. **Give the player a tool** — Something to cling to when everything else is uncertain
2. **Create doubt** — Sometimes it confirms, sometimes it contradicts
3. **Build tension** — The act of questioning makes the player invested
4. **Blur the line** — By Shift 8+, even PASS results feel unreliable

The best moments are when the player *knows* something is wrong but can't prove it.

---

*Document Version: 1.0*  
*Last Updated: 2026-01-19*

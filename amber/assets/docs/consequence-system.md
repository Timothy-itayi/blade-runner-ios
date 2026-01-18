# AMBER: Consequence System
## The Two Views

---

## Core Principle

Every decision gives you a window into the subject's fate—but from a different perspective:

| Decision | Report Type | Perspective | Tone |
|----------|-------------|-------------|------|
| **DENY** | Incident Report | The SYSTEM | Cold, bureaucratic, increasingly redacted |
| **APPROVE** | Personal Message | The SUBJECT | Warm, human, sometimes unsettling |

The player sees the world through **two lenses**:
1. **The System's View** (DENY) — What the bureaucracy recorded
2. **The Human's View** (APPROVE) — What the person experienced

Neither is complete. Neither is fully trustworthy.

---

## Consequence Delivery: The Shift Debrief

**All consequences are delivered at the END of each shift.**

This gives the player time to reflect on their decisions before seeing how they turned out. The `ShiftTransition` screen becomes a **debrief** with multiple sections.

---

### Shift Debrief Structure

```
┌─────────────────────────────────────────┐
│ SHIFT COMPLETE                          │
├─────────────────────────────────────────┤
│ SUBJECTS PROCESSED: 4                   │
│ APPROVED: 3  |  DENIED: 1               │
├─────────────────────────────────────────┤
│ THIS SHIFT'S REPORTS:                   │
│ ┌─────────────────────────────────────┐ │
│ │ [INCIDENT] KANE MORROW              │ │
│ │ Detained. Appeal filed.             │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ [MESSAGE] ELARA VANCE               │ │
│ │ "Repair complete. Thanks."          │ │
│ └─────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│ DELAYED REPORTS (From Previous Shifts): │
│ ┌─────────────────────────────────────┐ │
│ │ [INCIDENT] Subject from Shift 1     │ │
│ │ "Unauthorized access... casualties" │ │
│ └─────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│ FAMILY STATUS:                          │
│ "Miss you. She drew a picture of you."  │
├─────────────────────────────────────────┤
│ NEXT REGION: SECTOR 12 — MOSCOW         │
│ DIRECTIVE: VERIFY SECTOR CLEARANCE      │
│                                         │
│ [ CONTINUE ]                            │
└─────────────────────────────────────────┘
```

---

### Report Categories in Debrief

| Category | Source | Description |
|----------|--------|-------------|
| **This Shift's Reports** | Current shift decisions | Immediate consequences for subjects you just processed |
| **Delayed Reports** | Previous shifts (via `revealShift`) | Consequences that were queued to appear later |
| **Sector Reports** | Aggregate over-approval | Triggered when too many flagged subjects approved |
| **Family Status** | Performance-based | Wife's message reflecting your overall standing |

---

### Why End-of-Shift Delivery?

1. **Reflection Time**: Player processes all decisions before seeing outcomes
2. **Narrative Weight**: Consequences hit harder when bundled together
3. **Clear Rhythm**: Play → Debrief → Play → Debrief (like Papers Please day cycle)
4. **Delayed Horror**: When a Shift 1 consequence appears in Shift 3 debrief, the player has to think back
5. **No Interruptions**: Gameplay isn't broken up by random modals

---

## DENY → Incident Report (System Perspective)

When you deny someone, you receive an **Incident Report**—a bureaucratic file on what happened to them after denial.

---

### The Redaction Ladder

As the story progresses and subjects become more suspicious/connected to the revolution, the reports become more redacted.

| Act | Subject Type | Redaction Level | Visual Example |
|-----|--------------|-----------------|----------------|
| 1 | Clean worker | `NONE` | Full file. All fields visible. |
| 2 | Minor flag | `LIGHT` | Some fields marked `[PROCESSING]` |
| 3 | Suspicious | `MODERATE` | Key details `[REDACTED]` |
| 4 | Revolutionary | `HEAVY` | Most fields `[CLASSIFIED]` |
| 5 | Chaos | `TOTAL` | `████████████` or `[FILE NOT FOUND]` |

---

### Incident Report Structure

```typescript
interface IncidentReport {
  fileNumber: string;           // e.g., "#4221" or "[REDACTED]"
  subjectName: string;          // Can be redacted: "[REDACTED]"
  subjectId: string;            // Usually visible
  sector: string;               // Can be redacted: "[CLASSIFIED]"
  status: string;               // "DETAINED" | "RELOCATED" | "[PROCESSING]"
  summary: string;              // The main narrative text
  outcome: string;              // What happened to them
  timestamp: string;            // Time of processing
  redactionLevel: 'NONE' | 'LIGHT' | 'MODERATE' | 'HEAVY' | 'TOTAL';
}
```

---

### Example Incident Reports by Act

---

#### ACT 1 — No Redaction (Clean Worker)

```
══════════════════════════════════════════
INCIDENT REPORT — FILE #4221
══════════════════════════════════════════
SUBJECT: KANE MORROW
ID: V1-KM002
SECTOR: 3
STATUS: DETAINED

SUMMARY:
  Subject denied transit at Checkpoint 7.
  Active warrant confirmed (NO. 45221).
  Subject remanded to Processing Queue.

OUTCOME:
  Transferred to Holding Sector 11.
  Family notified.
  Daughter's birthday party missed.

TIMESTAMP: 09:17:02
══════════════════════════════════════════
```

**Tone**: Matter-of-fact. The system worked. Slight emotional hook (daughter's birthday).

---

#### ACT 2 — Light Redaction (Minor Flag)

```
══════════════════════════════════════════
INCIDENT REPORT — FILE #7892
══════════════════════════════════════════
SUBJECT: SILAS QUINN
ID: V2-SQ012
SECTOR: 5
STATUS: [PROCESSING]

SUMMARY:
  Subject denied transit at Checkpoint 12.
  Medical appointment missed.
  Subject flagged for elevated stress.

OUTCOME:
  [PENDING REVIEW]
  Condition status: [UNCONFIRMED]

TIMESTAMP: 11:22:45
══════════════════════════════════════════
```

**Tone**: Incomplete. You denied someone who needed medical care. You'll never know if they were okay.

---

#### ACT 3 — Moderate Redaction (Suspicious)

```
══════════════════════════════════════════
INCIDENT REPORT — FILE #[REDACTED]
══════════════════════════════════════════
SUBJECT: [REDACTED]
ID: V3-SK023
SECTOR: [CLASSIFIED]
STATUS: [PROCESSING]

SUMMARY:
  Subject denied transit at Checkpoint [REDACTED].
  Warrant status: [SEE ATTACHED].
  Subject transferred to [REDACTED].

OUTCOME:
  [PENDING REVIEW]

TIMESTAMP: 08:05:30
══════════════════════════════════════════
```

**Tone**: The system is hiding something. Why is this person classified?

---

#### ACT 4 — Heavy Redaction (Revolutionary)

```
══════════════════════════════════════════
INCIDENT REPORT — FILE #[CLASSIFIED]
══════════════════════════════════════════
SUBJECT: VERA OKONKWO
ID: V3-[CLASSIFIED]
SECTOR: [CLASSIFIED]
STATUS: [CLASSIFIED]

SUMMARY:
  [CONTENT RESTRICTED - LEVEL 5 CLEARANCE REQUIRED]

OUTCOME:
  [SEALED BY ORDER OF CENTRAL]

TIMESTAMP: [CLASSIFIED]
══════════════════════════════════════════
```

**Tone**: The system is actively hiding this person's fate. They matter.

---

#### ACT 5 — Total Redaction (Chaos)

```
══════════════════════════════════════════
INCIDENT REPORT — FILE #█████
══════════════════════════════════════════
SUBJECT: ████████████
ID: ████████████
SECTOR: ████████████
STATUS: ████████████

SUMMARY:
  ████████████████████████████████████████
  ████████████████████████████████████████
  ████████████████████████████████████████

OUTCOME:
  ████████████████████████████████████████

TIMESTAMP: ██:██:██
══════════════════════════════════════════
```

**Tone**: The system has collapsed or is actively censoring everything. Nothing is knowable.

---

## APPROVE → Personal Message (Subject Perspective)

When you approve someone, they might send you a **Personal Message**—a human communication that ranges from grateful to ominous.

---

### The Message Ladder

| Act | Subject Type | Message Tone | Example |
|-----|--------------|--------------|---------|
| 1 | Clean worker | **Grateful** | "Made it to my daughter's party. Thanks." |
| 2 | Minor issue | **Relieved** | "The appointment went well. You didn't have to help." |
| 3 | Suspicious | **Ambiguous** | "You did the right thing. You'll see." |
| 4 | Revolutionary | **Ominous** | "We remember those who let us through." |
| 5 | Chaos | **Silent/Cryptic** | `[MESSAGE INTERCEPTED]` or nothing |

---

### Personal Message Structure

```typescript
interface PersonalMessage {
  from: string;                 // Subject name or "[UNKNOWN]"
  text: string;                 // The message content
  intercepted?: boolean;        // If true, show [MESSAGE INTERCEPTED]
  tone: 'GRATEFUL' | 'RELIEVED' | 'AMBIGUOUS' | 'OMINOUS' | 'SILENT';
}
```

---

### Example Personal Messages by Act

---

#### ACT 1 — Grateful (Clean Worker)

```
┌─────────────────────────────────────────┐
  PERSONAL TRANSMISSION
  FROM: KANE MORROW

  "Made it to the party. She was so happy.
   Thanks for not making this harder
   than it had to be."

  [ ACKNOWLEDGE ]
└─────────────────────────────────────────┘
```

**Tone**: Warm. Human. The player helped someone.

---

#### ACT 2 — Relieved (Minor Issue)

```
┌─────────────────────────────────────────┐
  PERSONAL TRANSMISSION
  FROM: SILAS QUINN

  "The appointment went well.
   They said if I'd been any later,
   it might have been serious.

   You didn't have to help. But you did."

  [ ACKNOWLEDGE ]
└─────────────────────────────────────────┘
```

**Tone**: Gratitude with a hint of weight. The player's choice mattered.

---

#### ACT 3 — Ambiguous (Suspicious/Revolutionary Seed)

```
┌─────────────────────────────────────────┐
  PERSONAL TRANSMISSION
  FROM: VERA OKONKWO

  "You let me through.
   Not everyone would have.

   We remember."

  [ ACKNOWLEDGE ]
└─────────────────────────────────────────┘
```

**Tone**: Unsettling. Who is "we"? What did you just enable?

---

#### ACT 4 — Ominous (Revolutionary)

```
┌─────────────────────────────────────────┐
  PERSONAL TRANSMISSION
  FROM: [BLOCKED SENDER]

  "The network knows your ID.
   You've been marked.

   When the time comes,
   we'll remember what you did."

  [ ACKNOWLEDGE ]
└─────────────────────────────────────────┘
```

**Tone**: Threatening. Or is it a promise of protection? The player can't be sure.

---

#### ACT 5 — Silent/Intercepted (Chaos)

```
┌─────────────────────────────────────────┐
  PERSONAL TRANSMISSION
  FROM: [UNKNOWN]

  [MESSAGE INTERCEPTED BY SYSTEM]
  [CONTENT FLAGGED FOR REVIEW]
  [YOUR COMM-LINK HAS BEEN LOGGED]

  [ ACKNOWLEDGE ]
└─────────────────────────────────────────┘
```

**Tone**: The system is watching. Someone tried to reach you. They failed.

---

## Over-Approval Penalty: Sector Reports

If the player approves too many flagged subjects, they don't get "fired"—they get **Sector Reports**.

These are aggregate consequences: the system is failing because of your leniency.

---

### Sector Report Triggers

| Condition | Trigger |
|-----------|---------|
| 3+ flagged subjects approved in one shift | Sector Incident Summary |
| 5+ total flagged subjects approved (cumulative) | Lockdown Notice |
| Approved a known revolutionary (Act 4+) | Security Breach Alert |
| Family deficit detected (credits < requirement) | Housing Priority Downgrade |

---

### Sector Report Types

---

#### Sector Incident Summary

Triggered when too many flagged subjects are approved in a single shift.

```
╔═════════════════════════════════════════╗
  SECTOR INCIDENT SUMMARY — SECTOR 4
╠═════════════════════════════════════════╣
  PERIOD: SHIFT 3
  OPERATOR: 0992

  INCIDENTS LOGGED: 3
  • Unauthorized access to Grid Control
  • Medical supply chain disruption
  • Unregistered personnel in Restricted Zone

  COMMON FACTOR:
    All subjects processed by Operator 0992.

  RECOMMENDATION:
    Review approval patterns.

  NOTE:
    Your family's housing priority
    has been downgraded.
╚═════════════════════════════════════════╝
```

---

#### Lockdown Notice

Triggered when cumulative flagged approvals exceed threshold.

```
╔═════════════════════════════════════════╗
  LOCKDOWN NOTICE — SECTOR 6
╠═════════════════════════════════════════╣
  EFFECTIVE IMMEDIATELY

  Due to repeated security breaches,
  Sector 6 is under RESTRICTED ACCESS.

  CAUSE: Operator approval patterns
         flagged for non-compliance.

  IMPACT:
  • Transit delays: 4-6 hours
  • Medical access: SUSPENDED
  • Family visitation: DENIED

  YOUR APPROVAL LOG HAS BEEN ATTACHED
  TO THIS NOTICE.
╚═════════════════════════════════════════╝
```

---

#### Security Breach Alert

Triggered when a known revolutionary is approved.

```
╔═════════════════════════════════════════╗
  ⚠ SECURITY BREACH ALERT ⚠
╠═════════════════════════════════════════╣
  CLASSIFICATION: PRIORITY ALPHA

  Subject VERA OKONKWO (V3-VO021)
  accessed restricted terminal via
  Checkpoint 7.

  CROSS-REFERENCE:
    Approved by Operator 0992
    on Shift 5, 13:42:11.

  YOUR ID HAS BEEN FLAGGED.

  AWAIT FURTHER INSTRUCTIONS.
╚═════════════════════════════════════════╝
```

---

## Character Types and Story Timing

---

### Character Categories

| Type | Description | When They Appear |
|------|-------------|------------------|
| **CLEAN** | Normal workers. No flags. Easy approve. | Acts 1-5 (consistent) |
| **FLAGGED** | Minor issues. Warrants, discrepancies. | Acts 1-5 (consistent) |
| **CONNECTED** | Reference other subjects. Siblings, coworkers. | Acts 2-5 |
| **EDGE CASE** | Physical variations. One hand, blind, mute. | Acts 2-4 |
| **REVOLUTIONARY** | Clean papers but part of the network. | Acts 3-4 (seeded), Act 4 (revealed) |
| **SYSTEM** | Glitched data, ERROR subjects, REPLICANTS. | Act 4-5 only |
| **META** | The OPERATOR (you), the ADMINISTRATOR. | Act 5 only |

---

### Edge Case Variations

| Variation | Scanner Impact | Verification Impact |
|-----------|----------------|---------------------|
| `ONE_HAND` | Single fingerprint slot. Other shows `N/A - AMPUTEE`. | Less biometric data. |
| `BLIND` | Eye scan shows `PROSTHETIC DETECTED`. | Forces reliance on fingerprints. |
| `MUTE` | Dialogue shows `[SUBJECT NON-VERBAL]`. | Forces reliance on data. |
| `ELDERLY` | Fingerprints degraded. Cataracts on eye scan. | All data is `LOW CONFIDENCE`. |
| `CHILD` | Fingerprints not in system. Eye scan: `MINOR - GUARDIAN REQUIRED`. | Decide without full data. |

---

### Revolutionary Thread (Seeded Across Acts)

| Act | Subject | Role | If Approved | If Denied |
|-----|---------|------|-------------|-----------|
| 3 | VERA OKONKWO | Leader | `SILENT` (seed planted) | "Subject relocated. Message intercepted." |
| 3 | YURI PETROV | Courier | `SILENT` (delivers "package" in Act 4) | "Subject detained. Comms seized." |
| 4 | LENA VASQUEZ | Sleeper | Data breach triggered | "Operative captured. Your ID noted." |
| 4 | VERA OKONKWO (return) | Leader | Hack succeeds. Terminal compromised. | Hack still succeeds—you're just "compliant." |

---

## Scanner States (Narrative-Driven)

Scanner reliability is tied to **story events**, not player performance.

| Trigger | Scanner State | Visual Effect |
|---------|---------------|---------------|
| Normal operation | `NOMINAL` | Clean scans. Full data. |
| Subject has one hand | `PARTIAL` | One fingerprint slot shows `N/A - AMPUTEE`. |
| Subject is blind | `PROSTHETIC` | Eye scan shows `PROSTHETIC DETECTED`. |
| Act 3 instability | `DEGRADED` | Static bursts. Low confidence labels. |
| Act 4 hack begins | `CORRUPTED` | Eye feed shows wrong subject. Data mismatches. |
| Act 5 silence | `OFFLINE` | Terminal awaits input that never comes. |

---

## Player Behavior Matrix

| Behavior | Consequence | Narrative Outcome |
|----------|-------------|-------------------|
| **DENY everyone** | Incident Reports pile up. | Many mundane. Some heartbreaking. "Vagrant Status. Expired." |
| **APPROVE everyone** | Sector Reports pile up. | System blames you. Family housing downgraded. Lockdowns. |
| **Follow the Directive** | Safe. Credits stable. | You'll never know the human cost. Ignorance is complicity. |
| **Use Judgment** | Risky. Mixed results. | Sometimes you're right. Sometimes the revolutionary thanks you. |

---

## Data Structure Updates

---

### Subject Outcome (Updated)

```typescript
interface SubjectOutcome {
  feedback: string;             // "SUBJECT PROCESSED" | "ENTRY DENIED"
  
  // For DENY
  incidentReport: {
    fileNumber: string;
    redactionLevel: 'NONE' | 'LIGHT' | 'MODERATE' | 'HEAVY' | 'TOTAL';
    summary: string;
    outcome: string;
  };
  
  // For APPROVE
  personalMessage: {
    from: string;
    text: string;
    tone: 'GRATEFUL' | 'RELIEVED' | 'AMBIGUOUS' | 'OMINOUS' | 'SILENT';
    intercepted?: boolean;
  };
  
  // Delayed consequence
  revealShift?: number;         // If set, show this consequence N shifts later
  
  // Aggregate tracking
  flagWeight: number;           // 0 = clean, 1 = minor, 2 = major, 3 = critical
}
```

---

### Shift Data (Updated)

```typescript
interface ShiftData {
  id: number;
  timeBlock: string;
  stationName: string;
  city: string;
  authorityLabel: string;
  briefing: string;
  directive: string;            // NEW: The simple rule for this shift
  unlockedChecks: ('SECTOR' | 'FUNCTION' | 'WARRANT' | 'MEDICAL')[];
  activeRules: string[];
  scannerState?: 'NOMINAL' | 'DEGRADED' | 'CORRUPTED' | 'OFFLINE';  // NEW
}
```

---

## Implementation Checklist

| Task | File | Priority |
|------|------|----------|
| Expand `ShiftTransition` to display debrief reports | `ShiftTransition.tsx` | **CRITICAL** |
| Add `incidentReport` and `personalMessage` to all subjects | `subjects.ts` | HIGH |
| Create consequence queue state for delayed reports | `index.tsx` | HIGH |
| Add `revealShift` property to outcomes | `subjects.ts` | HIGH |
| Track cumulative `flagWeight` for Sector Reports | `index.tsx` | MEDIUM |
| Update `PersonalMessageModal` for intercepted messages | `PersonalMessageModal.tsx` | MEDIUM |
| Add `scannerState` to `EyeDisplay` and `ScanPanel` | Components | MEDIUM |
| Seed revolutionary subjects in Act 3 | `subjects.ts` | HIGH |

---

## References

- `Narrative.md` — 5-act structure and story beats
- `subjects.ts` — Subject data definitions
- `shifts.ts` — Shift configurations
- `PersonalMessageModal.tsx` — Current message display
- `index.tsx` — Main game loop and state

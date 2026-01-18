# AMBER: Narrative Structure
## "The Weight of the Stamp"

---

## Core Thesis

**Papers Please**: Border control. Clear mandate. *"Protect the nation from outsiders."*

**AMBER**: Internal surveillance. Ambiguous mandate. *"Monitor citizens moving within the system."*

The difference is massive. In Papers Please, the "enemy" is external. In AMBER, the "enemy" is *anyone*—and the player is complicit in deciding who that is based on incomplete data and arbitrary directives.

---

## The Six Narrative Layers

---

### Layer 1: The Directive (The State's Priority)

The directive is simple because **the state doesn't care about nuance**. It's a blunt instrument.

- `"DENY SECTOR 9"` doesn't mean Sector 9 is dangerous
- It means the state is *currently* cracking down on Sector 9 (political dissent, resource hoarding, whatever)
- The directive changes each shift—not because of logic, but because of **policy whims**

**Player Experience**: The directive is easy to follow. But it often feels *wrong*.

**Current Implementation** (`index.tsx`):
```typescript
const [activeDirective, setActiveDirective] = useState<string | null>("DENY ALL FROM SECTOR 9");
```

**Proposed Change**: Directive rotates per shift via `shifts.ts`. Each shift has a `directive` field that overrides the default.

---

### Layer 2: The Verification Data (The System's Evidence)

Warrants, discrepancies, biometrics—these are the "real" data points.

**The Twist**:
- A warrant doesn't mean **guilt**. It means the system *suspects* them.
- A clean record doesn't mean **innocence**. It means the system *hasn't caught them yet*.

**Player Experience**: The data is overwhelming, but it's all circumstantial. You're never sure.

**Current Implementation** (`VerificationDrawer.tsx`, `subjects.ts`):
- `authData` object contains sector authorization, function registration, warrant status, medical flags
- Player must cross-reference these against the subject's stated `reasonForVisit` and `requestedSector`

**Proposed Change**: Add `reliabilityScore` to data fields. In later acts, some fields show `[UNVERIFIED]` or `[CONFLICTING DATA]`.

---

### Layer 3: The Delayed Consequence (The Blade Runner Hook)

This is where AMBER diverges from Papers Please.

**Papers Please**: Consequences are immediate. Approve a terrorist? Bomb goes off. You see it.

**AMBER**: Consequences are *delayed* and delivered at the **end of each shift**. The player has time to reflect on their decisions before seeing how they turned out.

---

#### The Shift Debrief

At the end of every shift, the `ShiftTransition` screen becomes a **debrief**:

1. **Performance Stats**: Subjects processed, approved, denied
2. **Immediate Consequences**: Reports for decisions made THIS shift
3. **Delayed Consequences**: Reports queued from PREVIOUS shifts (via `revealShift`)
4. **Family Message**: Wife's message based on overall performance
5. **Region Reassignment**: Next shift location and directive

---

#### Consequence Delivery Flow

```
SHIFT 1 ENDS
    ↓
┌─────────────────────────────────────┐
│ SHIFT DEBRIEF                       │
├─────────────────────────────────────┤
│ SUBJECTS PROCESSED: 4               │
│ APPROVED: 3  |  DENIED: 1           │
├─────────────────────────────────────┤
│ IMMEDIATE REPORTS (This Shift):     │
│ • KANE MORROW - Detained. Appeal.   │
│ • ELARA VANCE - Repair complete.    │
├─────────────────────────────────────┤
│ DELAYED REPORTS (From Past Shifts): │
│ • (None yet)                        │
├─────────────────────────────────────┤
│ PERSONAL TRANSMISSION:              │
│ "Miss you. She drew a picture."     │
├─────────────────────────────────────┤
│ NEXT REGION: SECTOR 12 - MOSCOW     │
│ DIRECTIVE: VERIFY SECTOR CLEARANCE  │
└─────────────────────────────────────┘
    ↓
SHIFT 2 BEGINS
```

---

#### Delayed Consequence Example

1. **Shift 1, Subject 4**: A factory worker. Clean papers. No warrants. Player APPROVES.
2. **Shift 1 Debrief**: Shows "ELARA VANCE - Repair complete." (immediate, mundane)
3. **Shift 3 Debrief**: Shows delayed report: `INCIDENT REPORT: Unauthorized access to Sector 6 Power Grid. 14 casualties. Subject profile matches Operator 0992 approved entry log.`
4. **Player's Reaction**: Wait. That was... the factory worker from Shift 1? I approved him. He was clean.

**The Horror**: The horror isn't the explosion. It's the **realization that you enabled it**—and you only find out when the shift ends and you have time to sit with it.

---

**Current Implementation**: 
- `ShiftTransition.tsx` exists but only shows stats
- Outcomes exist in `subjects.ts` but most are `SILENT`
- `narrativeVariants` allows subjects to change based on past decisions

**Proposed Change**: 
- Expand `ShiftTransition` to display consequence reports
- Add `revealShift` property to outcomes for delayed delivery
- Queue consequences in state and display at appropriate shift end

---

### Layer 4: The Inverse Consequence (The Moral Trap)

Here's where it gets darker:

| Decision | Delayed Consequence |
|----------|---------------------|
| **DENY someone innocent** | `SYSTEM: Subject 12 (DENIED) flagged for 'Vagrant Status.' Subject expired in Processing Queue.` |
| **APPROVE someone dangerous** | `INCIDENT REPORT: Subject 12 implicated in data breach. Your sector flagged for compliance review.` |

**The Point**: There is no "correct" answer. Every stamp has weight. The game doesn't punish you for being wrong—it shows you the **human cost** of both choices.

**Current Implementation**: DENY consequences are mostly `SILENT`. No human cost shown.

**Proposed Change**: Every subject gets both an `incidentReport` (DENY) and `personalMessage` (APPROVE). See `consequence-system.md`.

---

### Layer 5: The Escalation (The Subjects Get Harder)

The directive stays simple. The subjects become more complicated.

| Shift | Subject Complexity |
|-------|-------------------|
| 1-2 | Easy subjects. Clear-cut cases. The directive catches obvious problems. |
| 3-4 | Discrepancies appear. Stated destination doesn't match sector authorization. Clerical error or lie? |
| 5-6 | Subjects reference each other. "My sister was approved yesterday. She hasn't reported in." |
| 7+ | Subjects reference the player. "You approved me last week. Don't you remember?" (They're lying. Or are they?) |

**Current Implementation** (`subjects.ts`):
- Phase 1 (1-10): Mostly clean subjects
- Phase 2 (11-20): Some linked narratives via `narrativeVariants`
- Phase 3 (21-32): Jumps too fast to ERROR subjects and REPLICANTS

**Proposed Change**: Restructure into 5 acts. See below.

---

### Layer 6: The Game Never Ends (The System Continues)

Unlike Papers Please, where failure = game over, **AMBER never stops**.

- Your family suffers. Your credits drain. The incidents pile up.
- But the terminal stays on. The next subject appears.
- The only "ending" is when the player *chooses* to stop—either by deliberate failure or by closing the app.

**The Message**: The surveillance state doesn't end. It just keeps processing.

**True Ending**: The terminal shuts off. Credits roll. Then the START button reappears. The loop continues.

---

## Current State (Problems to Fix)

---

### 1. Most Outcomes Are `SILENT`

Looking at `subjects.ts`, the majority of outcomes are:

```typescript
outcomes: {
  APPROVE: { feedback: 'SUBJECT PROCESSED', consequence: 'SILENT' },
  DENY: { feedback: 'ENTRY DENIED', consequence: 'SILENT' }
}
```

**Problem**: No narrative payoff. The player never sees what happened.

---

### 2. The Phases Jump Too Fast

| Current Phase | Subjects | Content |
|---------------|----------|---------|
| Phase 1 (1-10) | Normal workers | Good. |
| Phase 2 (11-20) | Some linked narratives | Inconsistent. Some consequences. |
| Phase 3 (21-32) | REPLICANTS, BINARY CODE, ERROR LOGS | Act 5 material showing up in Act 2. |

**Problem**: The weird stuff comes too early. No buildup.

---

### 3. No DENY Consequences

Right now, if you DENY someone, the consequence is almost always `SILENT` or a vague "delay."

**Problem**: The player doesn't see the human cost of being overly cautious.

---

### 4. Sector Hierarchy Isn't Enforced

The design says Sector 1 = high importance, Sector 9 = low.

**Problem**: The current data doesn't reflect this structurally.

---

## The 5-Act Structure

---

### ACT 1: The Routine (Shifts 1-2, Subjects 1-8)

**Tone**: Mundane. Bureaucratic. Almost boring.

**Directive**: Clear and logical. `"DENY ALL ACTIVE WARRANTS."`

**Scanner State**: `NOMINAL`. Everything works.

**Player Experience**: Learning the system. Feeling competent.

---

#### Subject Breakdown

| Subject Type | Directive Conflict | APPROVE Consequence | DENY Consequence |
|--------------|-------------------|---------------------|------------------|
| Clean workers | None | Grateful message | Inconvenience (missed train, late for meeting) |
| Minor discrepancy | Easy to spot | Mundane thanks | Delay (paperwork rescheduled) |
| Warrant holder | Clear violation | "Thanks for looking the other way." | Neutral (apprehended, system worked) |

---

#### Example Consequences

**DENY (Funny/Small)**:
> Subject KANE MORROW detained. Daughter's birthday party missed. Appeal filed: "My kid is crying because of you."

**APPROVE (Funny/Small)**:
> Subject ELARA VANCE completed repair. Sector 4 temperature normalized. You are responsible for 247 people being slightly less sweaty today.

---

#### Files to Modify
- `subjects.ts`: Subjects 1-8 get full `incidentReport` and `personalMessage` data
- `shifts.ts`: Shifts 1-2 have simple directives

---

### ACT 2: The Cracks (Shifts 3-4, Subjects 9-16)

**Tone**: Something is off. The directive doesn't always make sense.

**Directive**: Slightly arbitrary. `"VERIFY SECTOR CLEARANCE."` Why now?

**Scanner State**: Occasional hiccups. One subject has `PARTIAL` (one fingerprint only).

**Player Experience**: Doubt creeping in. Was that the right call?

---

#### Subject Breakdown

| Subject Type | Directive Conflict | APPROVE Consequence | DENY Consequence |
|--------------|-------------------|---------------------|------------------|
| Connected subjects | Siblings, coworkers appear | Relieved message | Emotional (someone is looking for them) |
| Ambiguous cases | Elevated BPM, minor flags | "You didn't have to help." | Doubt (condition worsened, appeal logged) |
| System glitches | Scanner hiccups | Confusion (routed wrong) | Confusion (data doesn't match) |

---

#### Example Consequences

**DENY**:
> Subject SILAS QUINN missed medical appointment. Condition worsened. Appeal logged. You'll never know if it was serious.

**APPROVE**:
> Subject LYRA BELLE routed to wrong sector. Lost 4 hours. Supervisor docked her pay. You cost her 50 credits.

---

#### Files to Modify
- `subjects.ts`: Add linked narratives. Subject 14 references Subject 3.
- `ScanPanel.tsx`: Handle `scannerState === 'PARTIAL'`

---

### ACT 3: The Revolution Seeds (Shifts 5-6, Subjects 17-24)

**Tone**: Unease. Some subjects seem... organized.

**Directive**: Contradictory. `"EXPEDITE ENGINEERING."` then `"SECTOR FLAGS MANDATORY."`

**Scanner State**: `DEGRADED`. Some static. Data confidence dropping.

**Player Experience**: Something is happening. You're not sure what.

---

#### Subject Breakdown

| Subject Type | Directive Conflict | APPROVE Consequence | DENY Consequence |
|--------------|-------------------|---------------------|------------------|
| "Normal" workers | Clean papers, something feels wrong | `SILENT` (seed planted) | Delayed Incident (shows up 2 shifts later) |
| First revolutionaries | No flags. Odd dialogue. | `SILENT` (you don't know yet) | "Subject relocated. Message intercepted." |
| Repeat visitors | Same person, different reason | Ambiguous ("We remember.") | Suspicion (why are they back?) |

---

#### Key Subject: VERA OKONKWO (Revolutionary Leader)

```
Name: VERA OKONKWO
Dialogue: "Just a routine visit. Sector 4. Nothing special."
Papers: Clean.

Outcome APPROVE: SILENT (for now)
Outcome DENY: "Subject relocated. Message intercepted: 'She's been flagged. Move to Plan B.'"
```

The player won't know VERA is important until Act 4.

---

#### Files to Modify
- `subjects.ts`: Add VERA and other revolutionary seeds with `revealShift` delayed to Act 4
- `messages.ts`: Add intercepted message variants

---

### ACT 4: The Hack (Shifts 7-8, Subjects 25-32)

**Tone**: Chaos. The system is under attack.

**Directive**: Lockdown. `"DENY ALL."` No exceptions.

**Scanner State**: `CORRUPTED`. Eye feed shows wrong subject. Fingerprints return `NO MATCH`.

**Player Experience**: Paranoia. You can't trust the data.

---

#### Subject Breakdown

| Subject Type | Directive Conflict | APPROVE Consequence | DENY Consequence |
|--------------|-------------------|---------------------|------------------|
| Compromised data | Eye scanner shows wrong feed | Unreliable (you can't trust the data) | Unreliable (innocent? guilty?) |
| Returning revolutionaries | VERA is back. Flagged now. | Reveal ("DATA BREACH. Your ID flagged.") | "Revolution delayed. Operative captured." |
| System errors | Subjects with ERROR fields | Paranoia (is this real?) | Paranoia (did you just deny a ghost?) |

---

#### Example Incident Report (Delayed from Act 3)

```
INCIDENT: SECTOR 4 DATA BREACH
Subject VERA OKONKWO accessed restricted terminal.
Cross-reference: Your approval log.
Your ID has been flagged for review.
```

---

#### Narrative Beat

A message appears mid-scan:

```
░░░ THEY ARE WATCHING YOU TOO ░░░
░░░ THE TERMINAL REMEMBERS ░░░
░░░ VERA SENDS HER REGARDS ░░░
```

---

#### Files to Modify
- `EyeDisplay.tsx`: Handle `scannerState === 'CORRUPTED'`
- `subjects.ts`: Returning subjects (same ID, different data)
- `PersonalMessageModal.tsx`: Handle intercepted/hacked messages

---

### ACT 5: The Silence (Shifts 9-10, Subjects 33-40)

**Tone**: Cold. Quiet. The revolution has happened. Or failed. You don't know.

**Directive**: `"AWAIT FURTHER INSTRUCTIONS."` Nothing comes.

**Scanner State**: `OFFLINE`. The terminal awaits input that never comes.

**Player Experience**: Emptiness. The system continues regardless.

---

#### Subject Breakdown

| Subject Type | Directive Conflict | APPROVE Consequence | DENY Consequence |
|--------------|-------------------|---------------------|------------------|
| Aftermath subjects | Refugees, scared workers | `[MESSAGE INTERCEPTED]` | Despair (the system continues) |
| The OPERATOR | You process yourself | Terminal shuts down. Credits roll. | "MANDATORY OVERTIME. Continue processing." |
| Terminal shutdown | No more subjects | The End | The machine never stops. |

---

#### Final Subject: The OPERATOR (You)

```
Name: [YOUR NAME]
Dialogue: "I just want to go home."

Outcome APPROVE: Terminal shuts down. Credits roll.
Outcome DENY: "MANDATORY OVERTIME. Continue processing."
```

---

#### Narrative Beat

One final message from WIFE:

```
"Tim, they're at the door. I lo—"
[MESSAGE TERMINATED]
```

---

#### Files to Modify
- `index.tsx`: Handle game end state and credits roll
- `BootSequence.tsx` or new `CreditsSequence.tsx`: Display ending
- `subjects.ts`: Add final 8 subjects including OPERATOR

---

## The Consequence Ladder (Summary)

| Act | APPROVE Consequence | DENY Consequence |
|-----|---------------------|------------------|
| 1 | "Repair completed. 247 people less sweaty." | "Missed daughter's birthday. Kid crying." |
| 2 | "Routed wrong. Lost 4 hours. Pay docked." | "Missed medical appointment. Condition unknown." |
| 3 | `SILENT` (seed planted) | "Subject relocated. Message intercepted." |
| 4 | "DATA BREACH. Your ID flagged." | "Revolution delayed. Operative captured." |
| 5 | Terminal shuts down. | The machine continues. |

---

## Sector Hierarchy

Lower number = higher importance = stricter access = worse consequences for errors.

| Sector | Importance | Access Level | Typical Residents |
|--------|------------|--------------|-------------------|
| 0 | CORE | CLASSIFIED | System processes only |
| 1 | HIGH COMMAND | TOP CLEARANCE | Administrators, Data Analysts |
| 2 | CRITICAL | RESTRICTED | Medical, Engineering Leads |
| 3-4 | STANDARD | AUTHORIZED | Workers, Logistics |
| 5-6 | LOW | OPEN | Maintenance, Transport |
| 7-8 | PERIPHERAL | MINIMAL CHECKS | Sanitation, Archive |
| 9 | REVOKED | DENIED | Former residents, vagrants |

---

### Sector Error Severity

**Rule**: The lower the sector number, the more serious the consequences for errors.

| Sector | Error Severity | Example Consequence |
|--------|----------------|---------------------|
| 0-1 | **CRITICAL** | Immediate flagging. Family housing downgraded. |
| 2-3 | **MAJOR** | Supervisor warning. Credits docked. |
| 4-6 | **MODERATE** | Incident logged. Appeal filed. |
| 7-8 | **MINOR** | Delay noted. No escalation. |
| 9 | **NEGLIGIBLE** | Nobody cares about Sector 9. |

---

## Implementation Checklist

| Task | File(s) | Priority | Status |
|------|---------|----------|--------|
| Expand `ShiftTransition` to display Shift Debrief | `ShiftTransition.tsx` | **CRITICAL** | Pending |
| Create consequence queue state for delayed reports | `index.tsx` | HIGH | Pending |
| Add `incidentReport` and `personalMessage` to all subjects | `subjects.ts` | HIGH | Pending |
| Add `revealShift` to outcomes | `subjects.ts` | HIGH | Pending |
| Restructure subjects into 5 acts | `subjects.ts` | HIGH | Pending |
| Seed revolutionary subjects in Act 3 | `subjects.ts` | HIGH | Pending |
| Add `scannerState` prop to displays | `EyeDisplay.tsx`, `ScanPanel.tsx` | MEDIUM | Pending |
| Add sector hierarchy to directive logic | `shifts.ts` | MEDIUM | Pending |
| Handle game end and credits | `index.tsx` | LOW | Pending |

---

## References

- `consequence-system.md` — Details on APPROVE vs DENY consequences
- `subjects.ts` — Subject data definitions
- `shifts.ts` — Shift configurations and directives
- `messages.ts` — Narrative message pools

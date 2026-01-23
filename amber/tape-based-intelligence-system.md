## Tape-Based Intelligence System (Design Brief)

### Goal

Replace passive, tap-to-open folders with **time-bound, resource-consuming intelligence tapes** that better support:

- procedural gameplay
- planning under constraint
- immersion (old terminal / Papers, Please–style)
- anti-spam interrogation

The player is not “reading files”; they are **running services** on an underpowered terminal.

---

### Core Concept

Verification data (WARRANT, TRANSIT, INCIDENT) is delivered as **audio tapes**, not static documents.

Each tape represents a **live intelligence service**:

- it takes time to run
- it occupies terminal memory
- it extracts actionable facts when complete

Tapes replace “open folder” interactions.

---

### Tape Mechanics

#### Tape Properties

- Duration: **~20 seconds**
- Content: spoken intelligence with **flagged keywords** (NSA-style)
- Output: a **scrolling transcript** with highlights
- Completion flips the corresponding `gatheredInformation` flag

#### Examples

- WARRANT tape → `gathered.warrantCheck = true`
- INCIDENT tape → `gathered.incidentHistory = true`

Flags only flip **on tape completion**, not on start.

---

### Interaction Flow

1. Player opens the verification drawer
2. Sees **tape cartridges** (WARRANT / TRANSIT / INCIDENT)
3. Player **drags a tape into a playback bay**
4. Tape begins playing automatically
5. Transcript scrolls; flagged words highlight
6. On completion:
   - “EXTRACT COMPLETE” appears
   - gathered info becomes available for interrogation logic
7. Player may stop the tape early to free memory (at the cost of incomplete intel)

---

### Resource Model (unchanged, clarified)

- Terminal has **3 active service slots per subject**
- Each tape consumes **1 slot while playing**
- Other services (ID scan, health scan, DB lookup) also consume slots
- When capacity is full, starting a new tape requires terminating an active service

#### Important

- **Terminating a tape does NOT erase already-gathered info**
- It only stops further extraction

This preserves existing interrogation logic (Model B).

---

### Audio Focus Rule

- Only **one tape plays audio at a time**
- Other active tapes are paused/muted and labeled `BUFFERED`
- Prevents cognitive overload and preserves clarity

---

### Why Tapes (Design Rationale)

#### Fixes current issues

- Folder tap has no physical or temporal cost
- Infinite peeking undermines tension
- UI feels like a phone app, not a terminal

#### What tapes add

- Time pressure (can’t skim audio)
- Physicality (something is *running*)
- Natural mapping to memory constraints
- Clear opportunity cost (what do I listen to now?)

---

### Citations (Important Clarification)

Citations **do not tell the player what they missed**.

Like **Papers, Please**:

- Citations state **what the subject successfully passed**
- Not what the player failed to check

#### Example

```
SYSTEM VIOLATION — CASE S1-02
UNAUTHORIZED ENTRY:
• ACTIVE WARRANT
• PRIOR INCIDENT RECORD
```

No hinting. No coaching. The player must infer:

> “I should have run that tape.”

This preserves fairness *and* tension.

---

### Accessibility & Readability

- All tapes produce transcripts
- Key facts are visually highlighted
- Audio is additive, not required
- Players can play silently if needed

---

### Summary

- Tapes replace folders as **active intelligence services**
- Audio introduces time, cost, and presence
- Transcripts preserve clarity and speed
- Memory slots create real strategic decisions
- Citations remain diegetic and non-tutorializing

This is not a cosmetic change — it’s a **mechanical upgrade** that aligns fiction, UI, and game rules.


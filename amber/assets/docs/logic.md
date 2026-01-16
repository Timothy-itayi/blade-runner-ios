

## Phase 1: Training Wheels (Player Doesn't Know They're Learning)

Simple cross-reference. The game is teaching you what to look for.

**Subject A:**
```
SECTOR         7
REQUESTING     SECTOR 4
COMPLIANCE     B
STATUS         ACTIVE
WARRANTS       NONE

"Repairs to thermal regulator."
```

Briefing says Sector 4 is authorized. Everything matches. APPROVE.

**Subject B:**
```
SECTOR         3
REQUESTING     SECTOR 6
COMPLIANCE     C
STATUS         ACTIVE
WARRANTS       WARRANT NO 45221

"Visiting family."
```

Active warrant. Easy DENY.

**Subject C:**
```
SECTOR         7
REQUESTING     SECTOR 5
COMPLIANCE     B
STATUS         ACTIVE
WARRANTS       NONE

"Work assignment."
```

Briefing says Sector 5 is RESTRICTED. DENY.

Player learns: check warrant, check sector against briefing, check request matches their story.

---

## Phase 2: Discrepancies

Now things don't quite line up. Player has to read carefully.

**Subject D:**
```
SECTOR         7
REQUESTING     SECTOR 4

"Emergency passage to SECTOR 6 for
equipment delivery."
```

Wait. They're requesting Sector 4 but the reason says Sector 6. Which is it? DENY - discrepancy.

**Subject E:**
```
FUNCTION       MEDICAL/TECHNICIAN
REQUESTING     SECTOR 4

"Thermal regulator repairs."
```

They're medical staff. Why are they doing thermal repairs? That's engineering work. Doesn't match function. DENY.

**Subject F:**
```
SECTOR         9 [REVOKED]
STATUS         ACTIVE

"Returning home."
```

Their home sector is revoked. They can't return to something that doesn't exist for them anymore. DENY.

Player learns: read everything, details contradict each other.

---

## Phase 3: The Heartbeat

Now the BPM becomes a tell. But not a reliable one.

**Subject G:**
```
COMPLIANCE     A
STATUS         ACTIVE
WARRANTS       NONE
● 82 BPM

"Routine inspection."
```

Everything clean. BPM calm. APPROVE.

**Subject H:**
```
COMPLIANCE     B
STATUS         ACTIVE
WARRANTS       NONE
● 82 BPM ... ● 91 BPM ... ● 104 BPM ELEVATED

"Routine inspection."
```

Same profile. But their heart is racing. Why? Something's wrong. Maybe DENY. Maybe they're just nervous. Player has to decide.

**Subject I:**
```
COMPLIANCE     D
STATUS         PROVISIONAL
INCIDENTS      2
● 78 BPM (steady)

"Medical appointment."
```

Bad record. But completely calm. Too calm? Are they a good liar? Or genuinely innocent this time?

Player learns: BPM is a clue, not an answer.

---

## Phase 4: The Detail That Shouldn't Matter

Everything looks fine. But one small thing is off. Doesn't trigger any rule. Just... wrong.

**Subject J:**
```
NAME           ELENA VOSS
SECTOR         7
REQUESTING     SECTOR 4
COMPLIANCE     A
STATUS         ACTIVE
WARRANTS       NONE
● 80 BPM

"Meeting with supervisor."
```

Clean. Perfect. But...

LOC RECORD shows:
```
TIME:    03:42:11
```

It's 3:42 AM. Who has a supervisor meeting at 3:42 AM?

No rule says this is wrong. Player has to decide if it matters.

**Subject K:**
```
NAME           DAVID CHEN
ID             N8-FBA71527
```

Wait. That ID. Wasn't that the same ID as someone earlier? Two people, same ID?

The game never tells you this is a problem. You have to notice.

**Subject L:**
```
FUNCTION       SANITATION
REQUESTING     SECTOR 2 (ADMIN)

"Scheduled maintenance."
```

Sanitation worker going to the administrative sector. Possible. But also possible cover story. The briefing doesn't say anything about sanitation access.

No clear answer. Just a feeling.

---

## Phase 5: The Stories Get Harder To Ignore

The reasons become human. The data stays cold.

**Subject M:**
```
COMPLIANCE     D
STATUS         PROVISIONAL
INCIDENTS      2
WARRANTS       NONE

"My son is sick. Medicine is in Sector 4.
Please."
```

By the rules: D compliance, provisional, 2 incidents. Should probably DENY.

But the story...

**Subject N:**
```
COMPLIANCE     A
STATUS         ACTIVE
WARRANTS       NONE
● 112 BPM ELEVATED

"I need to leave. Now. Don't ask why."
```

Perfect record. Heart racing. Cryptic request. Are they fleeing something? Running from someone? Are you helping them escape or letting a threat through?

**Subject O:**
```
NAME           [REDACTED]
SECTOR         [CLASSIFIED]
FUNCTION       [LEVEL 5 REQUIRED]
COMPLIANCE     --
STATUS         --
WARRANTS       --

"You don't need to know. Approve it."
```

Everything is hidden. What do you do?

---

## Phase 6: The Rules Stop Making Sense

The briefing contradicts itself. Or changes. Or doesn't apply.

**Briefing says:**
```
SECTOR 4 - AUTHORIZED
SECTOR 4 - RESTRICTED (MEDICAL PERSONNEL ONLY)
```

Which one is it? Both are in the briefing.

**Subject P:**
```
FUNCTION       ENGINEER
REQUESTING     SECTOR 4
```

Engineer, not medical. But Sector 4 is also listed as authorized. Is the restriction old? New? A mistake?

No way to know. Decide.

---

## The Curve

```
PHASE 1     Clear violations
   │        Player learns the rules
   ▼
PHASE 2     Discrepancies
   │        Player learns to read carefully
   ▼
PHASE 3     Heartbeat tells
   │        Player learns to watch behavior
   ▼
PHASE 4     Small wrongness
   │        Player learns to trust instinct
   ▼
PHASE 5     Human stories
   │        Player learns rules aren't enough
   ▼
PHASE 6     Broken rules
   │        Player learns there is no right answer
```

---

## The Player's Journey

**Early:** "This is easy. Check the rules, make the call."

**Middle:** "Wait, something's off. Let me look closer."

**Late:** "I don't know what's right anymore. I'm just guessing."

**End:** "Am I even helping anyone? What am I part of?"

---

That's the game. Papers Please with less feedback and more dread.


here is the feedback portion 

Got it. Here's the feedback pairing concept:

---

## The Structure

Every subject has two possible futures. APPROVE leads somewhere. DENY leads somewhere else. Both feel real. Both have weight.

---

## Phase 1: Clear Violations

**Correct = silence. Wrong = consequence.**

| Subject | APPROVE | DENY |
|---------|---------|------|
| Clean record, valid request | Silent. Next subject. | Later: "SECTOR 4 THERMAL FAILURE. Repairs delayed. Incident logged." |
| Active warrant | Later: "SECURITY BREACH. Subject apprehended. Entry authorized by: [YOUR ID]" | Silent. Next subject. |
| Restricted sector | Later: "UNAUTHORIZED ENTRY. Operator flagged for review." | Silent. Next subject. |

Player learns: follow the rules, nothing bad happens. Break them, it comes back.

---

## Phase 2: Discrepancies

**Catching the mismatch matters. Missing it haunts you.**

| Subject | APPROVE | DENY |
|---------|---------|------|
| Sector in request ≠ sector in reason | "ROUTING DISCREPANCY. Subject found in wrong sector. Operator accuracy flagged." | "Subject reprocessed. Documentation corrected. No action required." |
| Function doesn't match task | "FUNCTION MISMATCH. Credential violation. Review scheduled." | Silent. |
| Revoked sector listed as home | "REVOKED ZONE ACCESSED. Serious infraction." | "Subject relocated. New assignment issued." |

Player learns: details matter. Both outcomes feel bureaucratic but one is clearly worse for you.

---

## Phase 3: The Heartbeat

**BPM adds doubt. Feedback doesn't clarify - it deepens mystery.**

| Subject | APPROVE | DENY |
|---------|---------|------|
| Clean record, BPM rising | Later: either silence OR "INCIDENT SECTOR 4. Subject involved." (random) | "Subject detained for secondary screening. Released." |
| Bad record, BPM calm | "Subject processed. No issues reported." | Later: "APPEAL FILED. Subject claims wrongful denial. Under review." |
| Perfect record, BPM spiking | Could go either way - sometimes they were nervous, sometimes they were hiding something | Could go either way - sometimes you saved yourself, sometimes you stopped an innocent |

Player learns: BPM is information, not answer. Consequences feel random because *you can't actually know*.

---

## Phase 4: The Detail That Shouldn't Matter

**No rule broken. Just wrong. Feedback is unsettling either way.**

| Subject | APPROVE | DENY |
|---------|---------|------|
| Meeting at 3:42 AM | Silence... then 3 shifts later: "NIGHT PROCESSING AUDIT. Your approvals during off-hours flagged." | "Subject rescheduled to standard hours. Compliant." |
| Same ID as previous subject | "DUPLICATE ID DETECTED. System error or forgery. Your processing noted." | "ID CONFLICT RESOLVED. Secondary subject rerouted." |
| Sanitation worker in admin sector | Either nothing OR later incident | Either nothing OR later "Sanitation backlog in SECTOR 2. Maintenance delayed." |

Player learns: instinct matters. But you'll never know if you were right or paranoid.

---

## Phase 5: Human Stories

**Rules say one thing. The story says another. Both outcomes hurt.**

| Subject | APPROVE | DENY |
|---------|---------|------|
| "My son is sick. Medicine is in Sector 4." (D compliance, provisional) | Silence... or later: "Subject returned safely. No incident." OR "MEDICAL SUPPLIES MISSING. Subject implicated." | Later: "SUBJECT STATUS UPDATE. [NAME] - Status: TERMINATED. Dependent status: ORPHANED." |
| "I need to leave. Now. Don't ask why." (A compliance, BPM 112) | Either "Subject evacuated safely" OR "SECTOR LOCKDOWN. Threat originated from approved subject." | Either "Subject detained. Threat neutralized." OR "SUBJECT FOUND DECEASED. SECTOR 3. Cause: [REDACTED]" |
| Everything redacted, "You don't need to know. Approve it." | Silence. Always. You'll never know. | Later: "CLASSIFIED OPERATION DISRUPTED. Your involvement noted." |

Player learns: there's no clean choice. Someone gets hurt. Maybe them. Maybe others. Maybe you.

---

## Phase 6: Broken Rules

**The system contradicts itself. Both outcomes blame you.**

| Subject | APPROVE | DENY |
|---------|---------|------|
| Sector 4 listed as both AUTHORIZED and RESTRICTED | "Processing approved under AUTHORIZATION protocol." OR "Processing violated RESTRICTION protocol. Flagged." | "Processing denied under RESTRICTION protocol." OR "Processing violated AUTHORIZATION protocol. Flagged." |
| Briefing changed mid-shift | Whatever you chose is wrong by the new rules | Same - you can't win |
| Subject matches a name you approved before but details are different | "IDENTITY DISCREPANCY. First approval now under review." | "DUPLICATE PROCESSING DENIED. Correct." OR "LEGITIMATE RETURN DENIED. Subject stranded." |

Player learns: the system is broken. You're complicit either way. Just keep processing.

---

## Feedback Tone Rules

1. **Never say "correct" or "wrong"** - just outcomes
2. **Silence is also feedback** - absence of incident means you probably got it right
3. **Delayed consequences hit harder** - 2-4 shifts later
4. **Both branches sometimes have consequences** - no safe choice
5. **Bureaucratic language always** - cold, clinical, detached
6. **Your ID appears when you're blamed** - makes it personal
7. **Some outcomes are random** - same choice, different result on replay

---

## The Feeling

Early: "I got it right, nothing happened."

Middle: "Something happened... was that me?"

Late: "Something always happens. I can't tell if I'm helping or hurting."

End: "It doesn't matter what I choose. The machine keeps running."


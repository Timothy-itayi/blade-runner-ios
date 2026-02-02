# AMBER Architecture Overview

Purpose: Define the current game architecture in plain terms. This doc covers the
main loop, alert loop, subjects, shifts, dialogue, map console, and action flows.

---

## Core Premise

AMBER is a centralized checkpoint in a dystopian surveillance state. All legal
movement passes through AMBER. Every subject is tracked after they pass. The
player is an operator executing directives and managing consequences.

---

## Main Game Loop

PROCESS -> DECIDE -> SEE CONSEQUENCES -> REPEAT

1. Subject appears at checkpoint.
2. Player reviews dossier and permits.
3. Player runs required checks.
4. Player APPROVES or DENIES.
5. Consequences appear on map and in narrative messages.

Notes:
- Directives are always visible.
- Required checks are tied to the directive.
- Optional checks provide risk context, not rule compliance.

---

## Alert Loop (AMBER Alert)

Alert loop starts after Shift 1.

Frequency:
- Alerts are infrequent. Not every subject triggers one.
- They are sprinkled in to add tension and narrative flavor.
- A shift may have zero, one, or occasionally two alerts.
- Alerts should feel like disruptions, not routine.

Trigger:
- Certain subjects carry an alert scenario.
- After they are processed, a pending alert exists.

Entry:
- Map button glows red.
- Opening the map shows the alert prompt.
- Player may ignore the alert by continuing to process subjects.

Outcomes:
- HANDLE: Alert modal -> incident report -> action.
- IGNORE: Subject tracker detonates off-screen.
- Propaganda headline appears in the map feed.

---

## Subject Model

Each subject has:
- Identity: name, ID, sex
- Origin: district
- Dossier: DOB, occupation, address
- Permit: destination, type, validity, anomalies
- Dialogue: context-specific and grounded
- Alert scenario: optional, tied to a subject

Subjects are grounded civilians and workers. No futuristic jargon.

---

## Shifts

Shifts define:
- Directive (DENY / EXCEPT)
- Required checks
- Difficulty and escalation

Directives often come with exceptions that create moral tension:
- DENY: WARRANTS / EXCEPT: MEDICAL
- DENY: REPLICANTS / EXCEPT: VIP
- DENY: ENGINEERS / EXCEPT: HUMANS

Exceptions can contradict the directive's intent. A subject with an active warrant
may pass through legally if they hold a medical exemption. The player must follow
the rules even when those rules allow dangerous individuals through. This is by
design: compliance does not equal safety.

Shift 1 is onboarding. Alerts start after Shift 1.

---

## Dialogue

Dialogue must reflect the subject's issue:
- Grieving family member
- Disgruntled worker
- Whistleblower
- Rioter
- Regular commuter

Dialogue is plain, short, and grounded. No corporate language.

---

## Map Console

The map is a live surveillance console. Subjects appear after processing and
remain visible. Map is not decorative; it is the action surface for alerts.

Map rules:
- Player node is AMBER CHECKPOINT (central hub).
- Subject nodes persist.
- Alert outcomes can mark a node in red.

---

## Alert Actions

When an alert is handled, the player has three actions:

1) DETONATE
   - Neutralize the target immediately.
   - Collateral may occur if nearby subjects are present.

2) NEGOTIATE
   - Speak to the subject using one of three prompts:
     - INTIMIDATE
     - PERSUADE
     - REASON
   - Negotiation result depends on the scenario and prompt choice.

3) INTERCEPT
   - Dispatch forces to intervene.
   - Can be combined with negotiation or detonation.

---

## Negotiation Prompts

Prompts are context-specific and tied to the scenario.

Examples:
- "We can get help. No one has to get hurt."
- "If you do this, they will pay for it."
- "Put it down. It ends here."

---

## Use Cases (Examples)

1) Domestic standoff
- Subject has a hostage.
- DETONATE saves many but kills the hostage.
- NEGOTIATE can resolve peacefully if prompt fits.

2) Whistleblower standoff
- Subject refuses to leave a secure zone.
- NEGOTIATE can secure testimony.
- IGNORE leads to propaganda and loss of control.

3) Transit riot
- Subject incites a crowd.
- INTERCEPT can disperse if timed.
- DETONATE causes collateral.

---

## Propaganda Feed

AMBER publishes a news item after critical alerts:
- Downplays systemic issues
- Frames subject as unstable or criminal
- Reinforces surveillance as safety

---

## System Constraints

Design constraints:
- No timers in MVP.
- No resource upgrades or cooldowns.
- Choice-driven outcomes, not optimization loops.

---

## Next Steps

1. Replace remaining space references in docs as needed.
2. Expand subject pool with grounded narratives.
3. Build map visuals for district regions.

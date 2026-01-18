# PROJECT: AMBER - BR-IOS (BLADE RUNNER INSPIRED OPERATING SYSTEM)

## PREMISE

The year is irrelevant. You are a citizen—a spouse, a parent. Your morning begins with a text from your wife: "Good luck at work today." You start typing a reply. "Miss you too."

You never send it.

The AMBER system—**Active Measures Bureau for Entity Review**—hijacks your device mid-sentence. The screen glitches, your message fails, and a cold government interface replaces your life. You have been drafted as **Operator OP-7734**. Your new job: verify subjects requesting transit between sectors. The system is cold, clinical, and increasingly contradictory.

What begins as a straightforward task of checking warrants and IDs slowly descends into a moral quagmire where the rules stop making sense and the human cost of your decisions starts to haunt the HUD. Between shifts, you can send a single emoji to your wife. She doesn't know what's happening. Neither do you.

---

## INTRO SEQUENCE

The game opens on a personal phone interface—a text conversation with your spouse. The player watches as:

1. **Wife sends messages** — "Good luck at work today, you've got this!"
2. **Player "types" a reply** — "Thanks ♡ Will message you between shifts"
3. **Wife sends a photo** — shadows on a walk, caption: "Have a wonderful day, we miss you"
4. **Player types final message** — "Miss you too"
5. **Player presses send** — message appears as bubble, shows "Sending..."
6. **Message fails** — "Not delivered" with red error indicator
7. **AMBER ALERT hijacks screen** — glitch, interference, blackout
8. **Boot sequence** — cold terminal logs scrolling
9. **Terminal access** — "TERMINAL ACCESS INITIALIZING"
10. **Operator assignment** — "You are now OP-7734"

The emotional punch: the player's last words to their family are cut off. The system doesn't care.

---

## SOUND DESIGN & MUSIC

### Aesthetic Direction
The audio should evoke **Vangelis's Blade Runner score** meets **industrial ambience**—synthesizers that breathe, not blare. Tension through texture, not volume. The sound of bureaucracy as oppression.

### ElevenLabs / Audio Production Notes

**Intro Sequence:**
| Moment | Sound Design |
|--------|--------------|
| Text message appears | Soft, warm notification chime—the last "normal" sound |
| Player typing | Gentle keyboard clicks, intimate and personal |
| Photo arrives | Slightly longer notification, hopeful |
| Send button press | Satisfying tactile "whoosh" |
| Message fails | Dissonant error tone, hollow—something is wrong |
| AMBER alert appears | Low drone rising, industrial hum |
| Glitch/takeover | Digital corruption, static bursts, analog distortion |
| Boot sequence | Cold terminal beeps, mechanical whirring |
| Operator assignment | Single resonant tone, finality |

**Main Game Ambience:**
- **Background drone** — Low-frequency synth pad, barely audible but ever-present. The sound of the system watching.
- **Decision sounds** — APPROVE: cold ping, clinical. DENY: heavier thud, weight of consequence.
- **Shift transitions** — Detuned synth swell, time collapsing.
- **Narrative messages** — Subtle static crackle before system messages.
- **Personal messages (wife)** — Warmer tone, slight reverb—distant, unreachable.

**Music Cues:**
- **Menu/Title** — Sparse piano notes over synth bed. Melancholic but not dramatic.
- **Early shifts** — Minimal. Silence is the score. Occasional bass pulse.
- **Mid-game** — Tension builds. Rhythmic elements emerge, mechanical and unfeeling.
- **Late game** — Dissonance. The music fights itself. Player's moral clarity is gone.
- **Endings** — Dependent on choices. Warm resolution or cold void.

### Implementation
- Audio format: `.mp3` or `.m4a` for compatibility
- Location: `assets/sound-effects/`
- Library: `expo-audio` for playback (replaces deprecated `expo-av`)
- Approach: `useAudioPlayer` hooks with volume controls via settings modal

---

## CORE MECHANICS

### 1. Biometric Verification (`ScanPanel`, `EyeDisplay`)
- **Retinal Scan:** Live-feed monitoring of the subject's ocular response.
- **Fingerprint Analysis:** Forensic-level analysis of ridge characteristics (minutiae).
- **BPM Monitoring:** Real-time heart rate tracking. A rising BPM can signal deception, stress, or simple exhaustion. It is a clue, not a verdict.

### 2. Data Cross-Referencing (`IntelPanel`, `ScanData`)
- **Identity (ID):** Checking for valid ID codes and duplicate records.
- **Location Record (LOC):** Reviewing the subject's **Previous Location (PL)** and **Date of Birth (D.O.B)** against their story. 
- **Compliance & Status:** Evaluating their legal standing—Active, Provisional, Restricted, or Terminated.

### 3. Verification Protocol (`VerificationDrawer`)
- The "Deep Dive." Cross-referencing current sector authorization, function permits (Engineering, Logistics, etc.), and active warrant checks.
- **The Discrepancy:** Catching mismatches between their stated *Reason for Visit* and their official *Function* or *Requested Sector*.

### 4. Decision Making (`DecisionButtons`)
- **APPROVE:** Grant access.
- **DENY:** Reject access.
- Every choice is logged. Decisions in early phases may have echoing consequences in later phases.

---

## GAME FLOW (THE CURVE)

1. **Phase 1: Training Wheels** — Simple cross-referencing. Clear violations (Active Warrants).
2. **Phase 2: Discrepancies** — Subtle mismatches. A Logistics worker requesting access for "Engineering Repairs."
3. **Phase 3: The Heartbeat** — Using behavioral tells. High stress vs. calm records.
4. **Phase 4: Small Wrongness** — Details that shouldn't matter but do. Meetings scheduled for 3:42 AM.
5. **Phase 5: Human Stories** — The machine vs. the human. "My son is sick." The rules say Deny. What do you do?
6. **Phase 6: System Failure** — Contradictory briefings. The system blames you regardless of the outcome.

---

## KEY CHARACTERS & SUBJECTS

- **ELARA VANCE (Subject 1):** The setup. Engineering background, clear record. Establish the PL/ADDR logic.
- **KANE MORROW (Subject 2):** The first warrant. A test of basic procedural compliance.
- **ELENA VOSS (Subject 3):** The first subtle red flag—the 3 AM supervisor meeting.
- **DMITRI VOLKOV:** A resident of a Revoked Sector. Represents the systemic erasure of individuals.
- **THE ECHOES:** Characters like **MIRA VOSS** or **LENA VOLKOV** who return later, their lives irrevocably changed by how you treated their relatives in previous shifts.
- **THE OPERATOR (YOU):** OP-7734. Your ID is attached to every approval and every failure. You have a wife. You have a life. The system took it.

---

## ARCHITECTURE & STACK

- **Framework:** React Native (Expo)
- **UI/UX:** Custom HUD-based design with heavy emphasis on mono fonts (`Share Tech Mono`), scanline aesthetics, and animated feedback loops.
- **State Management:** Sequential narrative injection based on decision history.
- **Audio:** `expo-audio` for sound playback, ElevenLabs for sound effect generation.
- **Assets:** `/assets/audio/`, `/assets/videos/`, `/assets/ui/`

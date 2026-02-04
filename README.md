Based on your new requirements, here is the revised **Game Design Document (GDD) v2.0 for AMBER**.

This version strips out the sci-fi elements (Replicants, space travel, biometrics) to focus on a grounded, gritty surveillance simulation about human processing, consequences, and interface familiarity.

---

# AMBER: Game Design Document (Revision 2.0)

## 1. High Concept

**AMBER** is a grounded surveillance simulation set in a fictional, divided city. Players act as an operator at the **Main Transit Hub**, the central checkpoint connecting various Districts. Unlike broad sci-fi epics, this is a game about **humans dealing with human problems**—smuggling, warrants, and civil unrest.

**Core Philosophy:** "Streamlined Surveillance." The interface mimics a familiar handheld device, stripped of retro-junk clutter, focusing on clean data and high-stakes decisions.

**Core Loop:** `Review Documents` → `Run Database Checks` → `Decide (Approve/Deny)` → `Live with the Consequences`.

---

## 2. Setting & Narrative

* **The World:** A realistic, near-future city divided into **Districts** (e.g., Industrial District, Uptown, The Fringes). There is no space travel; all transit is local/regional.
* **The Subjects:** Purely human. Citizens, workers, refugees, and criminals. No androids or cyborgs (yet).
* **Tone:** Grounded reality. The horror comes from bureaucratic indifference and the ripple effects of your choices, not sci-fi monsters.

---

## 3. Gameplay Mechanics (Current Build)

### 3.1 The Process

The player processes subjects at the Main Hub. The flow is streamlined to prioritize efficient data analysis over mini-games.

1. **Subject Intake:**
* A subject arrives from a specific **District**.
* They present a **Ticket** and **ID** (Text/Static Image based for now; video assets are out of scope).


2. **Investigation (The Work Surface):**
* **Warrant Check:** Queries the central police database for outstanding arrests.
* **Transit Check:** Verifies travel history (e.g., "Did they really come from District 4?").
* **Mechanic - The Forced Decision:** Players *can* check everything, or they can check nothing. If a player attempts to process a subject without running checks, the game forces the decision immediately. There is no hand-holding; if you approve a criminal because you didn't run a warrant check, the consequences are yours.


3. **News & Alerts:**
* Decisions trigger world events.
* **UI Feedback:** Major consequences appear immediately as **AMBER News Alerts** scrolling on the main UI (e.g., "RIOT IN DISTRICT 9 LINKED TO SMUGGLED ARMS").



### 3.2 The Node Map (Consequence System)

The primary method of tracking progress and narrative branching.

* **Structure:** A visual node graph.
* **Center Node:** Represents **You** (The Main Hub / Player Character).
* **Connected Nodes:** Represent processed **Subjects**.


* **Interaction:**
* **Tap a Subject Node:** Reveals the subject's details (Name, Origin, Outcome).
* **Causality View:** If a subject triggered an event (e.g., a bombing or a protest), tapping their node reveals the **Trigger Link**—showing exactly how your decision led to that event.



---

## 4. User Interface (UI) & Aesthetic

### 4.1 Visual Style

* **Vibe:** Streamlined Surveillance. Clean lines, functional data, less "rusty retro-tech," more "utilitarian handheld."
* **Audio:** **None.** The current build is silent to focus purely on visual information and mechanics.

### 4.2 Main Menu

* **Concept:** A personal handheld device.
* **Texture:** The background features a **Sticker-bombed texture**, giving it a lived-in, grounded feel.
* **Interaction:**
* The user sees a sleeping/locked screen.
* **Gesture:** User **slides down** to reveal the "START" button.
* **Transition:** The screen reveals the text **"WELCOME TO AMBER"** which fades in, followed by the **AMBER LOGO**.



### 4.3 Main Game Screen

* **Layout:**
* **Top:** News Ticker (Alerts).
* **Center:** Subject Data (ID, Ticket details).
* **Bottom:** Action Controls (Warrant Check, Transit Check, Approve, Deny).


* **Feedback:** Stark, text-based confirmations. No complex animations or sound effects.

---

## 5. Development Roadmap & Scope

### Phase 1 (Current Scope - "The Human Element")

* **Entities:** Humans only.
* **Locations:** City Districts (No planets).
* **Features:**
* Warrant & Transit Checks.
* Node Map with Event Triggers.
* News Ticker Integration.
* Handheld/Sticker UI styling.
* Slide-to-start Menu.



### Phase 2 (Future Updates)

* **Biometrics:** Fingerprint and retinal scanners.
* **Video Assets:** Live footage of subjects.
* **Sci-Fi Expansion:** Introduction of Replicants and Cyborgs (Post-launch narrative expansion).
* **Audio:** Sound effects and ambience.

---

## 6. Technical Implementation Notes

* **Data Models:**
* `Subject` type must be refactored to remove `Planet` enums and replace them with `District` strings.
* `Replicant` and `Cyborg` flags in `SubjectSeed` should be disabled or removed for the current build.


* **State Management:**
* The `decisionLog` in `gameStore.ts` needs to track "Checks Performed" vs "Checks Skipped" to determine if a decision was "Forced/Blind."


* **Assets:**
* Utilize `Texturelabs_InkPaint_399S.jpg` for the main menu background.
* Remove references to `sound-effects` folders in the asset loading sequence for now.

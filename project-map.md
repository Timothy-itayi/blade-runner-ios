# PROJECT: AMBER - BR-IOS (BLADE RUNNER INSPIRED OPERATING SYSTEM)

## PREMISE
The year is irrelevant. You are an Operator at a Sector Verification Station. Your job is to process subjects requesting transit between sectors. The system is cold, clinical, and increasingly contradictory.

AMBER is a high-tension, narrative-driven verification simulator. It challenges the player's ability to cross-reference data under the guise of an "efficient" bureaucratic machine. What begins as a straightforward task of checking warrants and IDs slowly descends into a moral quagmire where the rules stop making sense and the human cost of your decisions starts to haunt the HUD.

---

## CORE MECHANICS

### 1. Biometric Verification (`ScanPanel`, `EyeDisplay`)
*   **Retinal Scan:** Live-feed monitoring of the subject's ocular response.
*   **Fingerprint Analysis:** Forensic-level analysis of ridge characteristics (minutiae).
*   **BPM Monitoring:** Real-time heart rate tracking. A rising BPM can signal deception, stress, or simple exhaustion. It is a clue, not a verdict.

### 2. Data Cross-Referencing (`IntelPanel`, `ScanData`)
*   **Identity (ID):** Checking for valid ID codes and duplicate records.
*   **Location Record (LOC):** Reviewing the subject's **Previous Location (PL)** and **Date of Birth (D.O.B)** against their story. 
*   **Compliance & Status:** Evaluating their legal standing—Active, Provisional, Restricted, or Terminated.

### 3. Verification Protocol (`VerificationDrawer`)
*   The "Deep Dive." Cross-referencing current sector authorization, function permits (Engineering, Logistics, etc.), and active warrant checks.
*   **The Discrepancy:** Catching mismatches between their stated *Reason for Visit* and their official *Function* or *Requested Sector*.

### 4. Decision Making (`DecisionButtons`)
*   **APPROVE:** Grant access.
*   **DENY:** Reject access.
*   Every choice is logged. Decisions in early phases may have echoing consequences in later phases.

---

## GAME FLOW (THE CURVE)

1.  **Phase 1: Training Wheels:** Simple cross-referencing. Clear violations (Active Warrants).
2.  **Phase 2: Discrepancies:** Subtle mismatches. A Logistics worker requesting access for "Engineering Repairs."
3.  **Phase 3: The Heartbeat:** Using behavioral tells. High stress vs. calm records.
4.  **Phase 4: Small Wrongness:** Details that shouldn't matter but do. Meetings scheduled for 3:42 AM.
5.  **Phase 5: Human Stories:** The machine vs. the human. "My son is sick." The rules say Deny. What do you do?
6.  **Phase 6: System Failure:** Contradictory briefings. The system blames you regardless of the outcome.

---

## KEY CHARACTERS & SUBJECTS

*   **ELARA VANCE (Subject 1):** The setup. Engineering background, clear record. Establish the PL/ADDR logic.
*   **KANE MORROW (Subject 2):** The first warrant. A test of basic procedural compliance.
*   **ELENA VOSS (Subject 3):** The first subtle red flag—the 3 AM supervisor meeting.
*   **DMITRI VOLKOV:** A resident of a Revoked Sector. Represents the systemic erasure of individuals.
*   **THE ECHOES:** Characters like **MIRA VOSS** or **LENA VOLKOV** who return later, their lives irrevocably changed by how you treated their relatives in previous shifts.
*   **THE OPERATOR:** You. Your ID is attached to every approval and every failure.

---

## ARCHITECTURE & STACK
*   **Framework:** React Native (Expo)
*   **UI/UX:** Custom HUD-based design with heavy emphasis on mono fonts (`Share Tech Mono`), scanline aesthetics, and animated feedback loops.
*   **State Management:** Sequential narrative injection based on decision history.

# AMBER (｀_´)ゞ

> A grounded surveillance simulation where human decisions have city-wide consequences. 

**Status:** (ง •̀_•́)ง Prototype Phase (Build 4) | Work in Progress
*AMBER is currently in active development. We are actively gathering and iterating on user feedback to refine the core mechanics and UI/UX.*

## ( 📝・ω・) High Concept
AMBER places you in the role of an operator at the Main Transit Hub of a fictional, divided city. Stripped of broad sci-fi tropes, this is a game about **humans dealing with human problems**—smuggling, warrants, and civil unrest. The horror and tension stem from bureaucratic indifference and the ripple effects of your split-second choices.

**Core Philosophy:** *Streamlined Surveillance.* The interface mimics a familiar utilitarian handheld device, focusing on clean data, high-stakes decisions, and zero hand-holding.

## (↻・ω・)↻ Core Gameplay Loop
`Review Documents` ➔ `Run Database Checks` ➔ `Decide (Approve/Deny)` ➔ `Live with the Consequences`

## (☆ω☆) Features (Current Build)
* **The Work Surface:** Manually process subjects arriving from various City Districts by reviewing their ID and Transit Tickets.
* **Active Investigations:** Query the central police database for outstanding warrants or verify travel history to catch discrepancies.
* **The Forced Decision:** No hand-holding. Skip the background checks if you want, but you own the consequences of a blind approval.
* **The Node Map (Causality System):** A visual graph tracking your narrative branching. Tap a subject node to view the "Trigger Link" and see exactly how your decision led to a specific city-wide event.
* **Live News Alerts:** Major consequences from your decisions appear immediately as scrolling AMBER News Alerts on your UI.
* **Utilitarian UI:** A grounded, sticker-bombed handheld interface featuring a "slide-to-start" unlock mechanism. 

## ( 🔭・ω・) Development Roadmap
### Phase 1: The Human Element (Current Focus)
- [x] Warrant & Transit Checks
- [x] Node Map with Event Triggers
- [x] News Ticker Integration
- [x] Refactoring global enums (transitioning from planetary to district-based logic)

### Phase 2: Future Updates
- [ ] **Biometrics:** Fingerprint and retinal scanners.
- [ ] **Video Assets:** Live footage integration for subject processing.
- [ ] **Audio:** Immersive sound effects and ambient hub noise.
- [ ] **Expanded Lore:** Introduction of Replicants and Cyborgs.

## (💻・ω・) Technical Notes (Build 4)
* **State Management:** The `decisionLog` actively tracks "Checks Performed" vs. "Checks Skipped" to evaluate blind decisions.
* **Assets:** Current build utilizes `Texturelabs_InkPaint_399S.jpg` for menu styling. Audio asset loading is temporarily disabled for pure visual/mechanic focus.

(👂・ω・) Feedback & Iteration
Because the current testers are local neighbors and co-workers, feedback is gathered through direct observation and verbal interviews.

Current Focus: Observing how non-technical users interact with the "Slide to Unlock" mechanic and the News Ticker.

Latest Iterations: Simplified the warrant check UI based on verbal feedback that the previous version was "too cluttered."

Active Goal: Translating "I got stuck" into specific UI/UX improvements for Build 5. (ง •̀_•́)ง

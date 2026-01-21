# Trello Board Structure: Information-Based Deduction System

## Board: AMBER - Information-Based Deduction System

### Labels
- 🔴 **Phase 1: Foundation**
- 🟠 **Phase 2: Core Systems**
- 🟡 **Phase 3: Advanced Features**
- 🟢 **Phase 4: Polish & Testing**
- 🔵 **Bug Fix**
- ⚫ **Blocked**

---

## PHASE 1: Foundation & Infrastructure

### List: 🔴 Phase 1 - Foundation

#### Card: Remove Predetermined Flags ✅ COMPLETE
**Description:**
Remove `shouldApprove` and `shouldDeny` flags from all subjects in `subjects.ts`. These flags are no longer used in decision evaluation.

**Tasks:**
- [x] Remove `shouldApprove` and `shouldDeny` from `SubjectData` interface
- [x] Remove these fields from all 12 subjects
- [x] Update any code that references these fields
- [x] Test that subjects still load correctly

**Acceptance Criteria:**
- ✅ No references to `shouldApprove`/`shouldDeny` in codebase
- ✅ All subjects load without errors
- ✅ Game still runs (even if decision logic is broken temporarily)

---

#### Card: Create Information Tracking System ✅ COMPLETE
**Description:**
Build the core system that tracks what information the player has gathered for each subject.

**Tasks:**
- [x] Create `GatheredInformation` interface/type
- [x] Add information tracking to game state
- [x] Track: basicScan, bioScan, warrantCheck, transitLog, incidentHistory
- [x] Track: interrogation questions asked, responses, BPM changes
- [x] Track: equipment failures (which equipment is broken)
- [x] Reset information tracking when moving to next subject

**Acceptance Criteria:**
- ✅ Information tracking persists during subject processing
- ✅ Can query what information has been gathered
- ✅ Resets correctly for new subjects

**Files Modified:**
- ✅ `amber/types/information.ts` (NEW)
- ✅ `amber/hooks/useGameState.ts`

---

#### Card: Update Resource System (Memory Model) ✅ COMPLETE
**Description:**
Ensure resources work like computer memory—once used, cannot be reused. No replaying bio scan audio, no re-running queries.

**Tasks:**
- [x] Verify resource consumption is one-time only
- [x] Disable bio scan button after use (cannot replay audio)
- [x] Disable verification queries after use (cannot re-query)
- [x] Add visual feedback when resources are exhausted
- [x] Test resource reset at shift start

**Acceptance Criteria:**
- ✅ Resources cannot be reused once consumed
- ✅ Buttons properly disable after use (shows "[USED]")
- ✅ Resources reset correctly at shift start
- ✅ Visual feedback is clear

**Files Modified:**
- ✅ `amber/store/gameStore.ts`
- ✅ `amber/components/ui/ScanData.tsx` (bio scan button)
- ✅ `amber/components/game/VerificationDrawer.tsx`
- ✅ `amber/app/index.tsx` (information tracking integration)

---

## PHASE 2: Core Systems

### List: 🟠 Phase 2 - Core Systems

#### Card: Implement Dossier Gap System ✅ COMPLETE
**Description:**
Dossiers revealed by bio scan should have random missing fields per subject.

**Tasks:**
- [x] Create dossier gap generation function
- [x] Randomly remove 1-4 fields from each subject's dossier
- [x] Update dossier display to show missing fields as "[REDACTED]" or blank
- [x] Ensure gaps are consistent (same subject always has same gaps)
- [x] Test with all 12 subjects

**Acceptance Criteria:**
- ✅ Each subject has random missing fields in dossier
- ✅ Missing fields are clearly indicated in UI (shown as [REDACTED])
- ✅ Gaps are consistent per subject (deterministic based on subject ID)
- ✅ Dossier still displays correctly with gaps

**Files Modified:**
- ✅ `amber/utils/dossierGaps.ts` (NEW)
- ✅ `amber/components/game/SubjectDossier.tsx` (display gaps)

---

#### Card: Dynamic Interrogation Question Generation ✅ COMPLETE
**Description:**
Interrogation questions must adapt based on what information has been gathered.

**Tasks:**
- [x] Create question generation function that checks gathered information
- [x] **No info**: Basic "state your business" questions
- [x] **Some info** (bio scan OR one verification): Questions about specific findings
- [x] **All info** (bio scan + all 3 verifications): Cross-reference questions
- [x] Update `IntelPanel.tsx` to use dynamic questions
- [x] Test all three question states

**Acceptance Criteria:**
- ✅ Questions change based on information gathered
- ✅ No info → basic questions
- ✅ Some info → specific questions about findings
- ✅ All info → cross-reference questions (combines multiple findings)
- ✅ Questions are contextually relevant

**Files Modified:**
- ✅ `amber/utils/questionGeneration.ts` (NEW)
- ✅ `amber/components/game/IntelPanel.tsx`

---

#### Card: BPM Real-Time Monitoring During Interrogation ✅ COMPLETE
**Description:**
BPM should only change during interrogation, updating in real-time as questions are asked.

**Tasks:**
- [x] BPM remains at baseline until interrogation starts
- [x] BPM updates in real-time as each question is asked
- [x] Track BPM value for each question
- [x] Display BPM changes in interrogation UI
- [x] Store BPM changes in information tracking

**Acceptance Criteria:**
- ✅ BPM doesn't change until interrogation begins
- ✅ BPM updates in real-time during questioning
- ✅ BPM values are tracked per question
- ✅ Visual feedback shows BPM changes

**Files Modified:**
- ✅ `amber/components/game/ScanPanel.tsx` (BPM monitor)
- ✅ `amber/components/game/IntelPanel.tsx` (interrogation)
- ✅ `amber/app/index.tsx` (BPM state management)

---

#### Card: Equipment Failure System ✅ COMPLETE
**Description:**
Equipment can randomly malfunction, showing error states and preventing data collection.

**Tasks:**
- [x] Create equipment failure system (random per subject)
- [x] **Biometric Scanner**: Show "ERROR Sensor Malfunction"
- [x] **BPM Monitor**: Show "ERROR Sensor Malfunction"
- [x] When broken: No data available from that equipment
- [x] Visual indicators for broken equipment
- [x] Track equipment failures in information tracking

**Acceptance Criteria:**
- ✅ Equipment can randomly fail per subject
- ✅ Error states are clearly displayed
- ✅ Broken equipment provides no data
- ✅ Failures are tracked in information system

**Files Modified:**
- ✅ `amber/utils/equipmentFailures.ts` (NEW - equipment failure logic)
- ✅ `amber/components/game/ScanPanel.tsx` (error displays)
- ✅ `amber/types/information.ts` (equipment failure tracking)
- ✅ `amber/app/index.tsx` (equipment failure initialization)

---

## PHASE 3: Advanced Features

### List: 🟡 Phase 3 - Advanced Features

#### Card: BPM Behavioral Tells ✅ COMPLETE
**Description:**
Implement BPM contradictions and false positives. Some subjects have BPM that contradicts their statements.

**Tasks:**
- [x] Define BPM tell patterns for subjects
- [x] **Contradiction**: Subject says calm but BPM elevated
- [x] **False positive**: Elevated BPM but subject is truthful (genuine stress)
- [x] **False negative**: Calm BPM but subject is lying (good liar)
- [x] Add BPM tell data to subjects
- [x] Display BPM tells in interrogation UI

**Acceptance Criteria:**
- ✅ BPM contradictions are visible
- ✅ False positives exist (elevated BPM but truthful)
- ✅ False negatives exist (calm BPM but lying)
- ✅ Player must interpret, not just react to numbers

**Files Modified:**
- ✅ `amber/data/subjects.ts` (add BPM tell data to subjects)
- ✅ `amber/components/game/IntelPanel.tsx` (BPM calculation with tells, display contradictions)

---

#### Card: Consequence Evaluation System ✅ COMPLETE
**Description:**
Replace correctness checking with consequence calculation based on information gathered + decision + directive.

**Tasks:**
- [x] Remove `isDecisionCorrect` function (or rewrite it)
- [x] Create `evaluateConsequence` function
- [x] Calculate consequence based on:
  - Information gathered
  - Decision made
  - Directive compliance
  - What information was missed
- [x] Return consequence object with type, message, missed info

**Acceptance Criteria:**
- ✅ No more "correct/wrong" binary
- ✅ Consequences calculated from information + decision
- ✅ System identifies what information was missed
- ✅ Consequences are contextually appropriate

**Files Modified:**
- ✅ `amber/types/consequence.ts` (NEW - consequence evaluation system)
- ✅ `amber/hooks/useGameHandlers.ts` (use new consequence system)
- ✅ `amber/app/index.tsx` (consequence state management)

---

#### Card: Citation & Feedback System (Papers Please Style) ✅ COMPLETE
**Description:**
After decisions, show consequences and reveal what information was missed.

**Tasks:**
- [x] Create citation screen/modal
- [x] Display consequence type (warning, citation, serious infraction)
- [x] Show what information was missed
- [x] Reveal how missed information would have changed decision
- [x] Examples: "Warrant check would have revealed: WARRANT NO 88412"
- [x] Examples: "Visa valid for 2 weeks. Subject stated 'a few weeks'—discrepancy detected."

**Acceptance Criteria:**
- ✅ Citations display after decisions
- ✅ Shows what was missed clearly
- ✅ Reveals how it would have affected decision
- ✅ Similar to Papers Please feedback style

**Files Created:**
- ✅ `amber/components/game/CitationModal.tsx`

**Files Modified:**
- ✅ `amber/app/index.tsx` (show citation modal)

---

#### Card: Supervisor Warnings (Mid-Process) ✅ COMPLETE
**Description:**
Supervisor sends warnings during shift if player is making patterns of mistakes.

**Tasks:**
- [x] Track infraction patterns (e.g., "approved 2 subjects without database verification")
- [x] Create supervisor warning messages
- [x] Display warnings mid-shift (not just at end)
- [x] Examples: "Operator, you've approved 2 subjects without database verification this shift"
- [x] Examples: "Operator, biometric scanner malfunction detected. Proceed with caution."

**Acceptance Criteria:**
- ✅ Warnings appear during shift (not just at end)
- ✅ Warnings are contextually relevant
- ✅ Warnings track patterns, not just single mistakes
- ✅ Visual/audio feedback for warnings

**Files Created:**
- ✅ `amber/components/game/SupervisorWarning.tsx`
- ✅ `amber/utils/warningPatterns.ts`

**Files Modified:**
- ✅ `amber/hooks/useGameHandlers.ts` (track patterns)
- ✅ `amber/app/index.tsx` (display warnings)

---

#### Card: Consequence Compounding ✅ COMPLETE
**Description:**
Multiple infractions lead to worse consequences. Track cumulative infractions.

**Tasks:**
- [x] Track total infractions across shifts
- [x] Scale consequences based on infraction count:
  - 1 infraction: Warning
  - 3 infractions: Citation
  - 5 infractions: Serious citation
- [x] Display cumulative infraction count
- [x] Reset infractions at appropriate times (or never?)

**Acceptance Criteria:**
- ✅ Infractions compound across shifts
- ✅ Consequences scale with infraction count
- ✅ Player can see their infraction count (shown in citation modal)
- ✅ System is balanced (not too punishing)

**Files Modified:**
- ✅ `amber/types/consequence.ts` (consequence scaling with cumulative infractions)
- ✅ `amber/hooks/useGameHandlers.ts` (infraction tracking)

---

## PHASE 4: Polish & Testing

### List: 🟢 Phase 4 - Polish & Testing

#### Card: Equipment Repair System
**Description:**
Players can repair broken equipment using credits over time.

**Tasks:**
- [ ] Add repair option to UI (settings or main screen)
- [ ] Repair costs credits
- [ ] Repair takes time (or instant?)
- [ ] Visual feedback when equipment is repaired
- [ ] Test repair flow

**Acceptance Criteria:**
- Players can repair equipment
- Repair costs are balanced
- Repair works correctly
- UI is clear and intuitive

**Files to Modify:**
- `amber/store/gameStore.ts` (repair function)
- `amber/components/settings/SettingsModal.tsx` (or create repair UI)

---

#### Card: Bio Scan Audio Integration
**Description:**
Ensure bio scan audio plays correctly and cannot be replayed (one-time only, uses resources).

**Tasks:**
- [ ] Verify bio scan audio plays when button is pressed
- [ ] Ensure audio cannot be replayed (button disabled after use)
- [ ] Test audio playback for all 12 subjects
- [ ] Handle audio loading errors gracefully
- [ ] Test with equipment failures (audio still plays?)

**Acceptance Criteria:**
- Audio plays correctly for all subjects
- Cannot replay audio (one-time only)
- Handles errors gracefully
- Works with equipment failures

**Files to Modify:**
- `amber/components/game/BioScanModal.tsx`
- `amber/app/index.tsx` (bio scan handler)

---

#### Card: Ambiguous Subject Implementation
**Description:**
Create subjects that remain ambiguous even with full information gathered.

**Tasks:**
- [ ] Design 2-3 ambiguous subjects
- [ ] Subjects have conflicting signals even with all info
- [ ] Examples: Elevated BPM but could be stress or deception
- [ ] Examples: Sad story but directive says deny
- [ ] Test that ambiguity is clear but not frustrating

**Acceptance Criteria:**
- Ambiguous subjects exist
- Ambiguity is intentional and clear
- Not frustrating (player understands why it's ambiguous)
- Creates moral complexity

**Files to Modify:**
- `amber/data/subjects.ts` (add ambiguous subjects)

---

#### Card: Comprehensive Testing
**Description:**
Test all systems together, ensure everything works correctly.

**Tasks:**
- [ ] Test information tracking across multiple subjects
- [ ] Test resource consumption and reset
- [ ] Test equipment failures and repairs
- [ ] Test dynamic question generation (all states)
- [ ] Test BPM tells and contradictions
- [ ] Test consequence evaluation (all scenarios)
- [ ] Test citation system
- [ ] Test supervisor warnings
- [ ] Test dossier gaps
- [ ] Test edge cases (no resources, all equipment broken, etc.)

**Acceptance Criteria:**
- All systems work together correctly
- No crashes or errors
- Edge cases handled gracefully
- Game is playable end-to-end

---

#### Card: Balance & Tuning
**Description:**
Balance resource costs, equipment failure rates, consequence severity, etc.

**Tasks:**
- [ ] Tune resource costs (3 per shift feels right?)
- [ ] Tune equipment failure rates (not too frequent, not too rare)
- [ ] Tune consequence severity (not too punishing, not too lenient)
- [ ] Tune BPM tell thresholds (what counts as elevated?)
- [ ] Playtest and adjust based on feedback

**Acceptance Criteria:**
- Game feels balanced
- Not too easy, not too hard
- Resource scarcity creates tension
- Equipment failures add uncertainty without frustration

---

## Additional Cards (Backlog)

### List: 📋 Backlog - Future Enhancements

#### Card: Question-Specific BPM Changes
**Description:**
Some questions cause bigger BPM spikes than others. Pattern recognition for consistent elevation vs. spikes.

#### Card: Equipment Degradation Over Time
**Description:**
Equipment breaks down over time with usage. Must maintain or face increasing failures.

#### Card: Narrative Consequences
**Description:**
Decisions affect later subjects (family members, connections). Compound narrative threads.

#### Card: Advanced BPM Analysis
**Description:**
Pattern recognition: consistent elevation vs. spikes on specific topics. More sophisticated tells.

#### Card: Additional Subjects
**Description:**
Add more subjects with varying information requirements and complexity levels.

---

## Testing Checklist

### Phase 1 Testing ✅ COMPLETE
- [x] Subjects load without `shouldApprove`/`shouldDeny` flags
- [x] Information tracking works correctly
- [x] Resources cannot be reused
- [x] Resources reset at shift start

### Phase 2 Testing
- [x] Dossier gaps appear randomly per subject
- [x] Questions adapt to gathered information
- [x] BPM changes only during interrogation
- [x] Equipment failures work correctly
- [x] Decision buttons require at least 1 resource to be used

### Phase 3 Testing
- [x] BPM tells are visible and interpretable
- [x] Consequences calculated correctly
- [x] Citations show what was missed
- [x] Supervisor warnings appear mid-shift
- [x] Infractions compound correctly

### Phase 4 Testing
- [ ] Equipment repair works
- [ ] Bio scan audio plays correctly
- [ ] Ambiguous subjects are clear
- [ ] All systems work together
- [ ] Game is balanced and fun

---

## Notes for Development

1. **Start with Phase 1**: Foundation must be solid before building on top
2. **Test incrementally**: Don't wait until all phases are done to test
3. **Keep old code commented**: In case we need to roll back
4. **Document decisions**: Why we made certain choices
5. **Balance is iterative**: Will need multiple passes to get right

---

## Definition of Done

A card is done when:
- [ ] All tasks completed
- [ ] Acceptance criteria met
- [ ] Code reviewed (if applicable)
- [ ] Tested and working
- [ ] No regressions introduced
- [ ] Documentation updated (if needed)

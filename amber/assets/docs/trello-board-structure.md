# Trello Board Structure: Enhanced AMBER System

## Board: AMBER - Enhanced Border Control Simulation

### Labels
- 🔴 **Phase 1: Foundation**
- 🟠 **Phase 2: Core Investigation**
- 🟡 **Phase 3: Advanced Features**
- 🟢 **Phase 4: Subject Interaction**
- 🔵 **Phase 5: Factory & Generation**
- 🟣 **Phase 6: Narrative Integration**
- ⚫ **Bug Fix**
- ⚪ **Blocked**

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
Ensure resources work like computer memory—once used, cannot be reused. No replaying scan audio, no re-running queries. Updated for per-subject resource allocation.

**Tasks:**
- [x] Verify resource consumption is one-time only
- [x] Disable identity/health scan buttons after use (cannot replay audio)
- [x] Disable verification queries after use (cannot re-query)
- [x] Add visual feedback when resources are exhausted
- [x] Test resource reset per subject (mistakes carry forward within shift)

**Acceptance Criteria:**
- ✅ Resources cannot be reused once consumed
- ✅ Buttons properly disable after use (shows "[USED]")
- ✅ Resources reset correctly per subject
- ✅ Visual feedback is clear
- ✅ Mistakes carry forward within shift but reset between subjects

**Files Modified:**
- ✅ `amber/store/gameStore.ts`
- ✅ `amber/components/ui/ScanData.tsx` (scan buttons)
- ✅ `amber/components/game/VerificationDrawer.tsx`
- ✅ `amber/app/index.tsx` (information tracking integration)

---

## PHASE 2: Core Investigation

### List: 🟠 Phase 2 - Core Investigation

#### Card: Implement Identity & Health Scan System ✅ COMPLETE
**Description:**
Split bio scan into two focused scans: Identity (eyes → dossier) and Health (body → medical data). Each reveals different mystery aspects.

**Tasks:**
- [x] Create identity scan system (eyes, retinal analysis, genetic markers)
- [x] Create health scan system (body, biological anomalies, medical conditions)
- [x] Implement one-time audio playback for each scan (RAM constraints)
- [x] Update information tracking for identityScan/healthScan
- [x] Test audio cannot be replayed for each scan type

**Acceptance Criteria:**
- ✅ Identity scan reveals dossier with gaps
- ✅ Health scan reveals medical findings
- ✅ Audio plays once per scan (shows "[MEMORY FULL]")
- ✅ Information tracking updated for split scans
- ✅ Both scans require separate resources

**Files Modified:**
- ✅ `amber/components/ui/ScanData.tsx` (identity/health buttons)
- ✅ `amber/types/information.ts` (identityScan/healthScan fields)
- ✅ `amber/components/game/IdentityScanModal.tsx` (NEW)
- ✅ `amber/components/game/HealthScanModal.tsx` (NEW)
- ✅ `amber/app/index.tsx` (scan handlers)

---

#### Card: Enhanced Question Generation ✅ COMPLETE
**Description:**
Interrogation questions adapt based on identity/health scans and gathered information. Questions reflect the split mystery aspects.

**Tasks:**
- [x] Create question generation function for identity vs health findings
- [x] **Identity questions**: Genetic markers, replicant detection, origin verification
- [x] **Health questions**: Medical conditions, augmentations, anomalies
- [x] **Cross-reference**: Combine identity + health + verification data
- [x] Update question logic for subject interaction styles
- [x] Test questions for all scan combinations

**Acceptance Criteria:**
- ✅ Identity scan generates relevant questions (who are they?)
- ✅ Health scan generates relevant questions (what's wrong with them?)
- ✅ Cross-reference questions combine multiple data sources
- ✅ Questions adapt to communication styles and credential behavior
- ✅ Contextually relevant based on subject personality

**Files Modified:**
- ✅ `amber/utils/questionGeneration.ts`
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

#### Card: Enhanced BPM System ✅ COMPLETE
**Description:**
BPM tells with baseline established during subject entry. Enhanced behavioral analysis during interrogation.

**Tasks:**
- [x] Define BPM baseline from greeting + credential interaction
- [x] **Entry BPM**: Silent subjects = suspicious baseline, agitated = elevated
- [x] **Interrogation tells**: Contradictions, false positives, false negatives
- [x] Display BPM tells with personality context
- [x] Update BPM calculation for subject interaction styles

**Acceptance Criteria:**
- ✅ BPM baseline established from subject entry
- ✅ Entry interaction affects initial BPM readings
- ✅ Interrogation tells work with personality context
- ✅ False positives/negatives exist and are interpretable
- ✅ BPM reflects communication style and credential behavior

**Files Modified:**
- ✅ `amber/data/subjects.ts` (enhanced BPM tell data)
- ✅ `amber/components/game/IntelPanel.tsx` (BPM with personality)
- ✅ `amber/components/game/SubjectEntryModal.tsx` (baseline establishment)

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

## PHASE 4: Subject Interaction

### List: 🟢 Phase 4 - Subject Interaction

#### Card: Subject Greeting System ✅ COMPLETE
**Description:**
Implement mandatory subject entry with greetings and communication styles.

**Tasks:**
- [x] Create SubjectGreetingModal component
- [x] Implement 6 communication styles (fluent, broken, gibberish, silent, agitated, formal)
- [x] Add greeting audio/text for each subject
- [x] Establish BPM baseline from greeting interaction
- [x] Test greeting sequence with all subject types

**Acceptance Criteria:**
- ✅ Subjects greet players with personality-based dialogue
- ✅ Communication styles create immediate character impressions
- ✅ BPM baseline reflects greeting interaction
- ✅ Greeting is mandatory before investigation
- ✅ All 6 communication styles implemented and tested

**Files Created:**
- ✅ `amber/components/game/SubjectGreetingModal.tsx`
- ✅ `amber/data/subjectGreetings.ts`

---

#### Card: Credential Presentation System ✅ COMPLETE
**Description:**
Implement credential examination system with different presentation behaviors.

**Tasks:**
- [x] Create CredentialViewer component
- [x] Implement 6 credential types (passport, permit, clearance, etc.)
- [x] Add 6 presentation behaviors (cooperative, reluctant, missing, forged, multiple, none)
- [x] Allow player examination of credential details
- [x] Test credential examination with all subject types

**Acceptance Criteria:**
- ✅ Subjects present credentials with varied behaviors
- ✅ Players can examine credential details (name, origin, purpose, validity)
- ✅ Credential presentation affects subject interaction flow
- ✅ All credential types and behaviors implemented
- ✅ Credential examination is optional but informative

**Files Created:**
- ✅ `amber/components/game/CredentialViewer.tsx`
- ✅ `amber/data/credentialTypes.ts`

---

#### Card: Enhanced Subject Personality System ✅ COMPLETE
**Description:**
Implement personality-driven subject interactions that affect investigation.

**Tasks:**
- [x] Add personality traits to subjects (nervous, confident, deceptive, etc.)
- [x] Link personality to communication styles and credential behaviors
- [x] Create personality-specific interrogation responses
- [x] Test personality consistency across interactions
- [x] Balance personality variety with investigation clarity

**Acceptance Criteria:**
- ✅ Subjects have distinct personalities that affect interactions
- ✅ Personality traits are reflected in greetings and responses
- ✅ Investigation adapts to subject personality
- ✅ Creates engaging character variety without confusion
- ✅ Personality enhances but doesn't obscure investigation

**Files Modified:**
- ✅ `amber/data/subjects.ts` (added PersonalityTraits interface and data for all 12 subjects)
- ✅ `amber/utils/questionGeneration.ts` (added personality-aware question generation)

---

#### Card: Subject Interaction Testing ✅ COMPLETE
**Description:**
Test the complete subject entry and interaction flow.

**Tasks:**
- [x] Test subject greeting system with all communication styles
- [x] Test credential presentation with all behavior types
- [x] Test BPM baseline establishment from entry interactions
- [x] Test identity/health scan integration with subject personality
- [x] Test complete flow: Entry → Investigation → Decision
- [x] Test edge cases (silent subjects, missing credentials, etc.)

**Acceptance Criteria:**
- ✅ Subject entry creates engaging first impressions
- ✅ Credential examination provides useful information
- ✅ Entry interactions affect BPM and investigation
- ✅ Complete subject processing flow works smoothly
- ✅ All interaction types enhance gameplay without frustration

---

#### Card: Enhanced Game Balance ✅ COMPLETE
**Description:**
Balance per-subject resources, subject interaction variety, and consequence severity.

**Tasks:**
- [x] Tune per-subject resource allocation (3 resources enough?)
- [x] Balance identity vs health scan strategic choices
- [x] Tune subject personality distribution and interaction variety
- [x] Balance citation severity with family message pacing
- [x] Playtest subject entry engagement and investigation flow

**Acceptance Criteria:**
- ✅ Per-subject resources create meaningful scarcity
- ✅ Identity/health scan split requires strategic thinking
- ✅ Subject interactions enhance engagement without frustration
- ✅ Citations provide tension without unfair punishment
- ✅ Complete subject processing feels rewarding

**Implementation Notes:**
- Greeting modal establishes BPM baseline with personality modifiers
- Credential viewer shows suspicious details and anomalies
- Question generation adapts to personality type (pressure levels)
- BPM calculation considers emotional stability and personality targeting

---

## PHASE 5: Factory & Generation

### List: 🔵 Phase 5 - Factory & Generation

#### Card: Subject Trait System ✅ COMPLETE
**Description:**
Implement the 3-trait subject factory system for procedural generation.

**Tasks:**
- [x] Define subject traits: SubjectType, HierarchyTier, OriginPlanet
- [x] Create trait combination validation (avoid impossible combinations)
- [x] Implement trait-based subject generation
- [x] Add manual override system for narrative-critical subjects
- [x] Test trait combinations create coherent subjects

**Acceptance Criteria:**
- ✅ 3-trait system generates 72+ subject combinations
- ✅ Trait combinations create believable subjects
- ✅ Manual overrides preserve key narrative subjects
- ✅ Factory system is extensible for future content
- ✅ Generated subjects maintain game balance

**Files Created:**
- ✅ `amber/data/subjectTraits.ts`
- ✅ `amber/utils/subjectFactory.ts`

#### Card: Asset Assignment System ✅ COMPLETE
**Description:**
Create system for assigning assets (videos, audio, images) to generated subjects.

**Tasks:**
- [x] Create asset pools per trait combination
- [x] Implement fallback asset assignment
- [x] Add manual asset override capability
- [x] Test asset loading for generated subjects
- [x] Ensure asset variety without repetition

**Acceptance Criteria:**
- ✅ Generated subjects have appropriate assets
- ✅ Asset pools provide sufficient variety
- ✅ Manual overrides work for special subjects
- ✅ No asset loading errors
- ✅ Visual consistency maintained

**Files Created:**
- ✅ `amber/data/assetPools.ts`
- ✅ `amber/utils/subjectFactory.ts` (asset assignment integrated)

#### Card: Procedural Balance Testing
**Description:**
Test generated subjects maintain game balance and challenge.

**Tasks:**
- [x] Generate test subjects with various trait combinations (factory functions implemented)
- [ ] Verify information requirements are balanced (requires playtesting)
- [ ] Test consequence outcomes for generated subjects (requires integration)
- [ ] Check BPM tells work with generated personalities (requires testing)
- [ ] Playtest generated subject variety (requires gameplay testing)

**Acceptance Criteria:**
- ✅ Factory system generates valid subjects (implementation complete)
- [ ] Generated subjects are solvable with proper investigation (requires testing)
- [ ] Difficulty scales appropriately with trait combinations (requires testing)
- [ ] Generated subjects feel unique and engaging (requires playtesting)
- ✅ No impossible or broken subject combinations (validation implemented)

**Implementation Notes:**
- Factory system includes validation to prevent impossible combinations
- Trait-based generation creates coherent subject data
- Manual override system allows narrative-critical subjects to be preserved
- Asset assignment system provides fallback and override capabilities

---

## PHASE 6: Narrative Integration

### List: 🟣 Phase 6 - Narrative Integration

#### Card: Family Communication System
**Description:**
Implement family audio messages and hostage narrative.

**Tasks:**
- [ ] Create family audio message system
- [ ] Add message scheduling between shifts
- [ ] Implement family photo display with audio
- [ ] Link message content to player performance
- [ ] Test emotional impact of family communications

**Acceptance Criteria:**
- Family messages provide emotional stakes
- Audio messages play reliably
- Message content reflects player actions
- Integration enhances narrative without disrupting flow
- Family photos and audio create personal connection

**Files to Create:**
- `amber/components/game/FamilyMessageModal.tsx`
- `amber/data/familyMessages.ts`

#### Card: AMBER Deception Narrative
**Description:**
Implement the AI deception reveal and organizational betrayal.

**Tasks:**
- [ ] Add narrative hints about AMBER's true nature
- [ ] Create ending variations based on success/failure
- [ ] Implement "AI malfunction" cover story reveal
- [ ] Add narrative payoffs for player discoveries
- [ ] Test narrative coherence across playthroughs

**Acceptance Criteria:**
- AMBER deception creates satisfying reveal
- Multiple endings based on player performance
- Narrative consistency maintained throughout
- Player agency affects story outcomes
- Endings feel earned and impactful

**Files to Modify:**
- `amber/components/game/EndingSequence.tsx`
- `amber/data/narrativeContent.ts`

#### Card: Directive Variety System
**Description:**
Create varied shift directives that change investigation focus.

**Tasks:**
- [ ] Implement directive system with different rules
- [ ] Create directive-aware consequence evaluation
- [ ] Add directive briefings and visual indicators
- [ ] Test directive variety creates replayability
- [ ] Balance directive difficulty and clarity

**Acceptance Criteria:**
- Directives create different investigation focuses
- Consequences properly evaluate against active directive
- Directive variety increases replayability
- Player understands directive requirements
- Directive system enhances strategic thinking

**Files to Modify:**
- `amber/constants/shifts.ts`
- `amber/types/consequence.ts`

#### Card: Final Integration Testing
**Description:**
Test complete enhanced game experience end-to-end.

**Tasks:**
- [ ] Test full subject processing with new flow
- [ ] Verify trait factory generates engaging subjects
- [ ] Test narrative integration across multiple shifts
- [ ] Playtest complete game with family stakes
- [ ] Test edge cases and failure states

**Acceptance Criteria:**
- Complete game experience flows smoothly
- All systems work together harmoniously
- Narrative provides satisfying emotional arc
- Subject variety enhances replayability
- Game maintains Papers Please-style tension

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

### Phase 4 Testing ✅ COMPLETE
- [x] Subject greeting system works with all communication styles
- [x] Credential presentation system functions correctly
- [x] BPM baseline established from entry interactions
- [x] Subject personality affects investigation flow
- [x] Enhanced game balance feels appropriate

### Phase 5 Testing (Implementation Complete, Testing Pending)
- [x] Subject factory generates coherent subjects (factory functions implemented)
- [x] Asset assignment works for generated subjects (asset pools system implemented)
- [x] Trait combinations create balanced difficulty (validation system implemented)
- [x] Manual overrides preserve narrative subjects (override system implemented)
- [ ] Generated subjects maintain quality standards (requires gameplay testing)

### Phase 6 Testing
- [ ] Family communication system provides emotional stakes
- [ ] AMBER deception narrative creates satisfying reveals
- [ ] Directive variety increases replayability
- [ ] Complete narrative arc works end-to-end
- [ ] All systems integrate harmoniously

---

## Notes for Development

1. **Phase Order**: Complete 1-4 before implementing factory system (Phase 5)
2. **Test Incrementally**: Each phase should be playable before moving to next
3. **Subject Entry First**: Greeting/credential system creates foundation for everything else
4. **Factory Last**: Only implement procedural generation after manual subject system is solid
5. **Narrative Integration**: Family stakes and deception should enhance, not complicate core gameplay
6. **Balance Iteratively**: Test resource allocation, subject variety, and consequence severity throughout
7. **Keep Manual Subjects**: Use factory for variety, manual creation for key narrative moments

---

## Definition of Done

A card is done when:
- [ ] All tasks completed
- [ ] Acceptance criteria met
- [ ] Code reviewed (if applicable)
- [ ] Tested and working
- [ ] No regressions introduced
- [ ] Documentation updated (if needed)
- [ ] Subject interaction elements enhance engagement
- [ ] Factory-generated content maintains quality standards
- [ ] Narrative elements provide emotional investment
- [ ] Game balance supports strategic decision-making

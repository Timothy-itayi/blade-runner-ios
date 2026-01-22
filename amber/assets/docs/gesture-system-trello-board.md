# Trello Board Structure: AMBER Gesture System

## Board: AMBER - Gesture System Implementation

### Labels
- 🔴 **Phase 1: Foundation** (Core gesture infrastructure)
- 🟠 **Phase 2: Eye Scanner** (Pressure hold system)
- 🟡 **Phase 3: Navigation** (Carousel and swipe gestures)
- 🟢 **Phase 4: Investigation** (Interrogation pressure system)
- 🔵 **Phase 5: Polish** (Feedback and balance)
- 🟣 **Phase 6: Testing** (Integration and iteration)
- ⚫ **Bug Fix**
- ⚪ **Blocked**

---

## PHASE 1: Foundation & Infrastructure

### List: 🔴 Phase 1 - Gesture Foundation

#### Card: Set Up Gesture Dependencies ✅ COMPLETE
**Description:**
Install and configure react-native-gesture-handler and react-native-reanimated for gesture support.

**Tasks:**
- [x] Verify react-native-gesture-handler is installed and configured
- [x] Verify react-native-reanimated is installed and configured
- [x] Add expo-haptics for tactile feedback
- [x] Test basic gesture detection works
- [x] Update app configuration for gesture handling

**Acceptance Criteria:**
- ✅ Gesture handler properly configured in app
- ✅ Reanimated works for animations
- ✅ Haptic feedback available
- ✅ Basic tap gesture responds correctly

**Files Modified:**
- ✅ `package.json` (dependencies verified - already installed)
- ✅ `app/_layout.tsx` (GestureHandlerRootView added)

---

#### Card: Create Gesture Utilities Library ✅ COMPLETE
**Description:**
Build reusable gesture utilities for pressure holds, swipes, and carousel navigation.

**Tasks:**
- [x] Create `utils/gestures.ts` with core gesture functions
- [x] Implement `createPressureHold()` for timed interactions
- [x] Implement `createSwipeReveal()` for directional gestures
- [x] Implement `createCarouselSwipe()` for navigation
- [x] Add gesture state management utilities
- [x] Create gesture debugging utilities

**Acceptance Criteria:**
- ✅ Utility functions handle gesture detection correctly
- ✅ Gesture states are properly managed
- ✅ Error handling for gesture failures
- ✅ Functions are reusable across components

**Files Created:**
- ✅ `amber/utils/gestures.ts`

---

#### Card: Implement Haptic Feedback System ✅ COMPLETE
**Description:**
Add tactile feedback for gesture interactions to enhance immersion.

**Tasks:**
- [x] Define haptic patterns for different gesture intensities
- [x] Create `createHapticFeedback()` utility function
- [x] Add success/failure haptic feedback
- [x] Add progressive intensity feedback for holds
- [x] Test haptic feedback on target devices

**Acceptance Criteria:**
- ✅ Haptic feedback enhances but doesn't annoy
- ✅ Different gesture types have distinct feedback
- ✅ Feedback is accessible (can be disabled)
- ✅ Battery impact is minimal

**Files Modified:**
- ✅ `amber/utils/gestures.ts` (haptic integration)
- ✅ Haptic system integrated into all gesture utilities

---

## PHASE 2: Eye Scanner Pressure System

### List: 🟠 Phase 2 - Eye Scanner

#### Card: Eye Scanner Pressure Hold Implementation
**Description:**
Convert eye scanner tap to pressure hold system with partial scan results based on hold duration.

**Tasks:**
- [ ] Modify `EyeDisplay.tsx` to use pressure hold gesture
- [ ] Add visual progress ring around eye area
- [ ] Implement scan quality calculation based on hold time
- [ ] Add partial result handling (PARTIAL, STANDARD, DEEP, COMPLETE)
- [ ] Update scan result display for different quality levels

**Acceptance Criteria:**
- ✅ Hold duration affects scan quality
- ✅ Visual feedback shows progress clearly
- ✅ Partial scans provide incomplete information
- ✅ Complete scans unlock full dossier access

**Files Modified:**
- `amber/components/ui/EyeDisplay.tsx`
- `amber/app/index.tsx` (scan result handling)

---

#### Card: Eye Scanner Audio-Visual Feedback
**Description:**
Add progressive audio and visual intensification during eye scanner hold.

**Tasks:**
- [ ] Add low hum that builds in intensity during hold
- [ ] Implement laser scan animation speed increase
- [ ] Add screen shake or subtle distortion effects
- [ ] Create "SCAN INTERRUPTED" message for early releases
- [ ] Add haptic feedback progression

**Acceptance Criteria:**
- ✅ Audio builds tension appropriately
- ✅ Visual effects enhance immersion
- ✅ Early release provides clear feedback
- ✅ Feedback feels responsive and polished

**Files Modified:**
- `amber/components/ui/EyeDisplay.tsx`
- `amber/assets/audio/` (scan audio files)

---

#### Card: Partial Scan Result System ✅ COMPLETE
**Description:**
Implement different information reveals based on scan quality levels.

**Tasks:**
- [x] Define information tiers for each scan quality
- [x] Modify dossier gap generation based on scan quality
- [x] Add "INCOMPLETE SCAN" warnings for partial results
- [x] Test that partial scans still allow basic investigation
- [x] Balance scan quality vs investigation difficulty

**Acceptance Criteria:**
- ✅ Different hold durations unlock different information
- ✅ Partial scans create meaningful investigation challenges
- ✅ Players understand scan quality trade-offs
- ✅ System encourages careful scanning

**Files Modified:**
- ✅ `amber/utils/dossierGaps.ts` (scan quality integration)
- ✅ `amber/types/information.ts` (scan quality tracking)
- ✅ `amber/utils/scanQuality.ts` (NEW - scan quality utilities)
- ✅ `amber/components/game/SubjectDossier.tsx` (incomplete scan warnings)
- ✅ `amber/app/index.tsx` (scan quality prop passing)

---

## PHASE 3: Navigation Gestures

### List: 🟡 Phase 3 - Navigation

#### Card: Intel Panel Carousel System ✅ COMPLETE
**Description:**
Convert static button row to swipeable carousel housing Verification, Dossier, and Interrogation.

**Tasks:**
- [x] Create carousel container component
- [x] Implement swipe left/right navigation
- [x] Add mode indicators and active state highlighting
- [x] Preserve all existing functionality within each mode
- [x] Add smooth transitions between modes

**Acceptance Criteria:**
- ✅ Swipe navigation feels natural and responsive
- ✅ All existing functionality preserved
- ✅ Visual indicators show current mode clearly
- ✅ Transitions are smooth and polished

**Files Modified:**
- ✅ `amber/components/game/IntelPanel.tsx`
- ✅ Styles integrated into component

---

#### Card: Credentials Swipe-Down Reveal ✅ COMPLETE
**Description:**
Replace tap button with swipe-down gesture to reveal credentials like opening a digital tray.

**Tasks:**
- [x] Replace "REQUEST CREDENTIALS" tap with swipe gesture
- [x] Add tray slide-down animation with spring physics
- [x] Implement finger-following during swipe
- [x] Add visual progress feedback
- [x] Maintain credential examination functionality

**Acceptance Criteria:**
- ✅ Swipe gesture feels like opening a physical drawer
- ✅ Animation is smooth and satisfying
- ✅ Visual feedback enhances the mechanical feel
- ✅ All credential functionality preserved

**Files Modified:**
- ✅ `amber/components/game/IntelPanel.tsx`
- ✅ Styles integrated into component

---

#### Card: Verification Analog Drawer ✅ COMPLETE
**Description:**
Convert digital verification drawer to analog-feeling drawer with resistance and momentum.

**Tasks:**
- [x] Replace tap opening with swipe-up gesture
- [x] Add progressive resistance during swipe
- [x] Implement magnetic snap-open with velocity threshold
- [x] Add visual feedback during resistance
- [x] Maintain all verification query functionality

**Acceptance Criteria:**
- ✅ Drawer feels heavy and mechanical
- ✅ Resistance provides satisfying interaction
- ✅ Visual feedback enhances physical feel
- ✅ All verification functionality preserved

**Files Modified:**
- ✅ `amber/components/game/IntelPanel.tsx` (swipe gesture on verification button)
- ✅ Styles integrated into component

---

## PHASE 4: Interrogation Pressure System

### List: 🟢 Phase 4 - Interrogation

#### Card: Interrogation Pressure Hold Implementation
**Description:**
Convert interrogation tap to pressure hold system with escalating intensity and subject responses.

**Tasks:**
- [ ] Replace tap with pressure hold gesture on INTERROGATE button
- [ ] Add pressure meter UI that fills during hold
- [ ] Implement 5 intensity bands (SURFACE to BREAKING)
- [ ] Add real-time subject response changes
- [ ] Create different dialogue branches per intensity level

**Acceptance Criteria:**
- ✅ Hold duration determines question intensity
- ✅ Visual feedback shows pressure level clearly
- ✅ Subject responses vary by intensity
- ✅ Intensity bands create meaningful strategic choices

**Files Modified:**
- `amber/components/game/IntelPanel.tsx`
- `amber/data/subjects.ts` (intensity-based responses)

---

#### Card: Pressure-Based Subject Reactions
**Description:**
Subject behavior and responses change based on interrogation pressure level.

**Tasks:**
- [ ] Define subject reactions for each intensity band
- [ ] Add communication style changes under pressure
- [ ] Implement subject "breaking" at maximum pressure
- [ ] Add BPM escalation tied to pressure level
- [ ] Create "shutdown" state for excessive pressure

**Acceptance Criteria:**
- ✅ Subject reactions feel authentic to intensity
- ✅ Communication styles adapt under pressure
- ✅ Breaking point creates meaningful consequences
- ✅ BPM escalation enhances lie detection

**Files Modified:**
- `amber/data/subjectGreetings.ts` (pressure responses)
- `amber/components/game/IntelPanel.tsx` (reaction handling)

---

#### Card: Strategic Pressure Management
**Description:**
Make pressure timing a core strategic mechanic with risk/reward trade-offs.

**Tasks:**
- [ ] Implement question slot cost for failed pressure attempts
- [ ] Add "cooldown" periods between intense interrogations
- [ ] Create pressure-based consequence modifiers
- [ ] Balance pressure bands for optimal strategy
- [ ] Add tutorial hints for pressure management

**Acceptance Criteria:**
- ✅ Pressure management affects investigation strategy
- ✅ Failed attempts have meaningful costs
- ✅ Pressure bands encourage thoughtful timing
- ✅ System is learnable but challenging

**Files Modified:**
- `amber/hooks/useGameHandlers.ts` (pressure consequences)
- `amber/utils/questionGeneration.ts` (pressure integration)

---

## PHASE 5: Polish & Feedback

### List: 🔵 Phase 5 - Polish

#### Card: Gesture Animation Polish
**Description:**
Refine all gesture animations for smooth, responsive feel.

**Tasks:**
- [ ] Tune gesture thresholds for optimal responsiveness
- [ ] Add momentum physics to swipe gestures
- [ ] Implement spring animations for state changes
- [ ] Optimize animation performance (60fps target)
- [ ] Add micro-interactions for gesture feedback

**Acceptance Criteria:**
- ✅ Gestures feel responsive and natural
- ✅ Animations are smooth and polished
- ✅ Performance impact is minimal
- ✅ Feedback enhances rather than distracts

**Files Modified:**
- `amber/utils/gestures.ts` (animation tuning)
- All gesture-implemented components

---

#### Card: Audio Integration
**Description:**
Add contextual audio feedback for all gesture interactions.

**Tasks:**
- [ ] Create gesture-specific audio effects
- [ ] Add progressive audio layering for holds
- [ ] Implement gesture success/failure sounds
- [ ] Balance audio with existing game audio
- [ ] Add audio cues for gesture availability

**Acceptance Criteria:**
- ✅ Audio enhances gesture feel without overwhelming
- ✅ Progressive audio builds appropriate tension
- ✅ Success/failure feedback is clear
- ✅ Audio integrates well with existing soundscape

**Files Modified:**
- `amber/assets/audio/` (gesture audio files)
- `amber/contexts/AudioContext.tsx`

---

#### Card: Accessibility & Fallbacks
**Description:**
Ensure gestures are accessible with comprehensive fallback options.

**Tasks:**
- [ ] Add tap fallbacks for all gesture interactions
- [ ] Implement accessibility settings for gesture sensitivity
- [ ] Add visual gesture hints for new players
- [ ] Create gesture tutorial system
- [ ] Test with motor accessibility requirements

**Acceptance Criteria:**
- ✅ All gestures have functional tap alternatives
- ✅ Accessibility settings work correctly
- ✅ New players can learn gesture system
- ✅ Motor accessibility requirements met

**Files Modified:**
- `amber/components/settings/SettingsModal.tsx`
- `amber/utils/gestures.ts` (accessibility options)

---

## PHASE 6: Testing & Iteration

### List: 🟣 Phase 6 - Testing

#### Card: Gesture Integration Testing
**Description:**
Test all gestures work correctly within the complete game flow.

**Tasks:**
- [ ] Test eye scanner pressure system end-to-end
- [ ] Test carousel navigation with all panel modes
- [ ] Test interrogation pressure with different subjects
- [ ] Test credential and verification swipe gestures
- [ ] Verify all gestures work on target devices

**Acceptance Criteria:**
- ✅ All gestures function in complete game context
- ✅ Gesture interactions don't break existing functionality
- ✅ Performance is acceptable on target devices
- ✅ Gesture conflicts are resolved

**Testing Notes:**
- Test on iOS simulator and physical devices
- Verify gesture areas don't conflict with UI elements
- Test edge cases (rapid gestures, interrupted holds)

---

#### Card: Balance & Difficulty Testing
**Description:**
Balance gesture timing and difficulty for engaging but fair gameplay.

**Tasks:**
- [ ] Playtest pressure hold timing across different players
- [ ] Adjust gesture thresholds based on feedback
- [ ] Balance scan quality vs investigation difficulty
- [ ] Tune pressure band boundaries for strategic depth
- [ ] Test gesture learning curve

**Acceptance Criteria:**
- ✅ Gesture timing feels fair and learnable
- ✅ Pressure bands create meaningful strategic choices
- ✅ Scan quality affects but doesn't break investigation
- ✅ New players can adapt to gesture system

**Balance Metrics:**
- Average scan completion time
- Pressure band usage distribution
- Gesture success rate by player experience
- Investigation completion rate with gestures

---

#### Card: Performance Optimization
**Description:**
Optimize gesture system for smooth performance across all interactions.

**Tasks:**
- [ ] Profile gesture performance on target devices
- [ ] Optimize animation frame rates (60fps minimum)
- [ ] Reduce gesture processing overhead
- [ ] Implement gesture debouncing to prevent spam
- [ ] Memory leak testing for gesture components

**Acceptance Criteria:**
- ✅ 60fps animation performance maintained
- ✅ No gesture-related memory leaks
- ✅ Battery impact is acceptable
- ✅ Performance scales with device capability

**Performance Targets:**
- Gesture recognition: <16ms latency
- Animation smoothness: 60fps
- Memory usage: <10MB additional
- Battery drain: <5% increase

---

#### Card: Final Integration & Polish
**Description:**
Complete gesture system integration with final polish and edge case handling.

**Tasks:**
- [ ] Final gesture threshold tuning
- [ ] Edge case handling (interrupted gestures, device rotation)
- [ ] Final audio balancing
- [ ] Documentation completion
- [ ] Final accessibility review

**Acceptance Criteria:**
- ✅ All gesture interactions feel polished and complete
- ✅ Edge cases handled gracefully
- ✅ System is ready for production release
- ✅ Documentation is comprehensive

---

## Implementation Roadmap

### Week 1: Foundation
- [ ] Set up gesture dependencies
- [ ] Create gesture utilities library
- [ ] Implement haptic feedback system

### Week 2: Eye Scanner
- [ ] Pressure hold implementation
- [ ] Audio-visual feedback
- [ ] Partial scan result system

### Week 3: Navigation
- [ ] Intel panel carousel
- [ ] Credentials swipe-down
- [ ] Verification analog drawer

### Week 4: Interrogation
- [ ] Pressure hold system
- [ ] Subject reactions
- [ ] Strategic pressure management

### Week 5: Polish
- [ ] Animation polish
- [ ] Audio integration
- [ ] Accessibility & fallbacks

### Week 6: Testing
- [ ] Integration testing
- [ ] Balance testing
- [ ] Performance optimization
- [ ] Final polish

---

## Risk Mitigation

### Technical Risks
- **Gesture Conflicts**: Comprehensive overlap testing
- **Performance Issues**: Early profiling and optimization
- **Platform Differences**: Cross-device testing
- **Memory Leaks**: Component lifecycle management

### UX Risks
- **Learning Curve**: Progressive disclosure and tutorials
- **Accessibility**: Multiple fallback options
- **Player Frustration**: Clear feedback and undo mechanisms
- **Overcomplication**: Simple gesture vocabulary

### Design Risks
- **Inconsistency**: Unified gesture language
- **Balance Problems**: Extensive playtesting
- **Feature Creep**: Focused scope management

---

## Success Metrics

### Technical Performance
- **Gesture Responsiveness**: <16ms recognition latency
- **Animation Quality**: 60fps across all interactions
- **Memory Efficiency**: <10MB additional usage
- **Battery Impact**: <5% increase

### Player Experience
- **Gesture Adoption**: >70% of players use gestures over taps
- **Session Quality**: 25% increase in investigation completion
- **Strategic Depth**: Pressure band usage shows tactical thinking
- **Satisfaction**: >80% positive feedback on gesture interactions

### Accessibility
- **Fallback Usage**: <15% of players require tap fallbacks
- **Error Rate**: <3% accidental gesture triggers
- **Learning Time**: <5 minutes for gesture proficiency

---

## Definition of Done

A gesture implementation is complete when:
- [ ] Gesture provides clear tactile feedback
- [ ] All existing functionality is preserved
- [ ] Performance meets targets (60fps, <16ms latency)
- [ ] Accessibility fallbacks are functional
- [ ] Testing shows positive player reception
- [ ] Integration doesn't break existing features
- [ ] Documentation is complete and accurate
- [ ] Balance creates meaningful strategic choices

The gesture system transforms AMBER from a **static button interface** into a **dynamic, tactile investigation experience** that rewards careful, strategic interaction with the dystopian border control system.
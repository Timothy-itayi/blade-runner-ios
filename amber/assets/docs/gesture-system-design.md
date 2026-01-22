# AMBER: Gesture System Design Document

## Executive Summary

AMBER's gesture system transforms the game from a simple button-tapping interface into a tactile, strategic investigation experience. By implementing pressure-based holds, swipe gestures, and timing mechanics, we create an immersive dystopian interface that rewards careful interaction while punishing thoughtless clicking.

## Core Design Philosophy

**Tactile Digital Interface**: Gestures should feel like operating imperfect, decaying equipment in a broken system - precise but finicky, rewarding skill while allowing for human error.

**Strategic Depth**: Every gesture becomes a micro-decision with risk/reward trade-offs, encouraging thoughtful investigation over rapid clicking.

**Progressive Enhancement**: All gestures maintain tap fallbacks for accessibility while adding depth for engaged players.

---

## Gesture System Overview

### 1. Eye Scanner - Pressure Hold System

#### Current State
- Toggle: Simple tap on "EYE SCANNER [OFF/ON]" button
- Identity Scan: Tap directly on eye display area
- Duration: Fixed 1.5s laser scan animation
- Result: Always complete scan

#### New Implementation
**Trigger**: Tap and hold on eye scanner display area
**Duration**: 0.5s minimum to 4.0s maximum hold time
**Feedback**: Visual progress ring, haptic pulses, audio intensification

#### Pressure Bands
| Hold Duration | Scan Quality | Result | Risk |
|---------------|--------------|---------|------|
| < 1.0s | PARTIAL | Basic identity only | High (incomplete data) |
| 1.0s - 2.0s | STANDARD | Full identity + basic anomalies | Medium |
| 2.0s - 3.0s | DEEP | Full identity + detailed analysis | Low |
| > 3.0s | COMPLETE | Perfect scan with all details | None |

#### Implementation Notes
- Visual: Progress ring fills around eye, laser scan intensity increases
- Audio: Low hum builds to intense scanning sound
- Haptic: Subtle pulses every 0.5s during hold
- Release early: Partial results with "SCAN INTERRUPTED" message

---

### 2. Intel Panel - Carousel System

#### Current State
- Static button row: VERIFICATION | DOSSIER | INTERROGATE
- Individual tap interactions
- No navigation between functions

#### New Implementation
**Structure**: Horizontal carousel with swipe navigation
**Modes**: Verification, Dossier, Interrogation
**Navigation**: Swipe left/right to cycle through modes
**Visual**: Mode indicators with active state highlighting

#### Carousel Modes
```typescript
type PanelMode = 'verification' | 'dossier' | 'interrogation';

const carouselModes = [
  { id: 'verification', label: 'VERIFICATION', icon: '🔍', color: Theme.colors.accentWarn },
  { id: 'dossier', label: 'DOSSIER', icon: '📄', color: Theme.colors.textSecondary },
  { id: 'interrogation', label: 'INTERROGATE', icon: '❓', color: Theme.colors.accentApprove }
];
```

#### Implementation Notes
- Momentum physics for natural swiping feel
- Snap-to-position with spring animation
- Visual indicators show current mode and available swipes
- Maintains all existing functionality within each mode

---

### 3. Credentials - Swipe-Down Reveal

#### Current State
- Trigger: Tap "REQUEST CREDENTIALS" button
- Display: All credentials shown in ScrollView
- Interaction: Static, read-only display

#### New Implementation
**Trigger**: Swipe down on intel panel during greeting phase
**Animation**: Digital tray/gate slides down from top
**Feel**: Physical drawer being pulled open

#### Gesture Parameters
- **Direction**: Downward swipe only
- **Threshold**: 100px minimum swipe distance
- **Tolerance**: ±10px horizontal forgiveness
- **Animation**: Spring-loaded reveal with bounce

#### Implementation Notes
- Visual: Tray slides down with realistic physics
- Audio: Mechanical drawer opening sound
- Feedback: Haptic click when threshold reached
- State: Persists until investigation phase begins

---

### 4. Verification - Analog Drawer System

#### Current State
- Trigger: Tap "VERIFICATION" button
- Interface: Digital drawer slides down instantly
- Queries: Individual tap buttons (WARRANT/TRANSIT/INCIDENT)

#### New Implementation
**Trigger**: Swipe down on verification carousel panel
**Feel**: Heavy, mechanical drawer that resists opening
**Interaction**: Finger-following animation during swipe

#### Gesture Parameters
- **Direction**: Downward swipe with finger tracking
- **Resistance**: Progressive difficulty (feels "stuck")
- **Threshold**: 150px minimum or 500px/s velocity
- **Animation**: Magnetic snap-open with spring physics

#### Implementation Notes
- Visual: Drawer follows finger position during swipe
- Audio: Grinding mechanical sounds during resistance
- Haptic: Resistance feedback, success click
- Theme: Feels like forcing open a malfunctioning file cabinet

---

### 5. Interrogation - Pressure Intensity System

#### Current State
- Trigger: Simple tap on "INTERROGATE" button
- Questions: Fixed cycling through available questions
- Intensity: Always same pressure level
- BPM Impact: Fixed calculation based on question type

#### New Implementation
**Trigger**: Press and hold "INTERROGATE" button
**Duration**: 0.2s minimum to 3.0s maximum hold time
**Feedback**: UI fills, audio intensifies, subject stress builds

#### Pressure Bands
| Hold Duration | Intensity | Subject Response | BPM Impact | Risk |
|---------------|-----------|------------------|------------|------|
| < 0.5s | SURFACE | Safe, useless answers | +5-15 BPM | None |
| 0.5s - 1.5s | DEFENSIVE | Partial truth, evasive | +15-30 BPM | Low |
| 1.5s - 2.5s | PROBING | Deeper revelations | +30-50 BPM | Medium |
| 2.5s - 3.0s | INTENSE | Full confessions | +50-70 BPM | High |
| > 3.0s | BREAKING | Emotional cracks or shutdown | +70-90 BPM | Critical |

#### Implementation Notes
- **Visual**: Pressure meter fills with color-coded intensity
- **Audio**: Background tension builds, subject voice changes tone
- **Haptic**: Intensifying vibration patterns
- **Subject Response**: Different dialogue branches based on pressure
- **Strategic Cost**: Wrong pressure = wasted question slot

---

## Technical Implementation

### Dependencies
```json
{
  "react-native-gesture-handler": "~2.28.0",
  "react-native-reanimated": "~4.1.1",
  "expo-haptics": "~15.0.8"
}
```

### Core Gesture Utilities
```typescript
// utils/gestures.ts
import { Gesture } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';

export const createPressureHold = (
  onStart: () => void,
  onUpdate: (pressure: number) => void,
  onComplete: (finalPressure: number) => void,
  maxDuration: number = 3000
) => {
  return Gesture.LongPress()
    .minDuration(200)
    .maxDistance(10)
    .onStart(() => runOnJS(onStart)())
    .onUpdate((event) => {
      const pressure = Math.min(1, event.duration / maxDuration);
      runOnJS(onUpdate)(pressure);
    })
    .onEnd((event) => {
      const finalPressure = Math.min(1, event.duration / maxDuration);
      runOnJS(onComplete)(finalPressure);
    });
};

export const createSwipeReveal = (
  direction: 'up' | 'down' | 'left' | 'right',
  onComplete: () => void,
  threshold: number = 100
) => {
  return Gesture.Pan()
    .onEnd((event) => {
      const { translationX, translationY } = event;
      let triggered = false;

      if (direction === 'down' && translationY > threshold) triggered = true;
      if (direction === 'up' && translationY < -threshold) triggered = true;
      if (direction === 'right' && translationX > threshold) triggered = true;
      if (direction === 'left' && translationX < -threshold) triggered = true;

      if (triggered) runOnJS(onComplete)();
    });
};
```

### Integration Pattern
```typescript
// Component integration example
const interrogationGesture = createPressureHold(
  () => startPressureBuild(),
  (pressure) => updatePressureMeter(pressure),
  (finalPressure) => askQuestionWithIntensity(finalPressure)
);

return (
  <GestureDetector gesture={interrogationGesture}>
    <TouchableOpacity onPress={fallbackTapHandler}>
      {/* Component content */}
    </TouchableOpacity>
  </GestureDetector>
);
```

---

## Game Design Impact

### Strategic Depth Added
1. **Eye Scanner**: Timing precision affects information quality
2. **Credentials**: Gesture flow replaces button hunting
3. **Verification**: Physical effort reinforces investigative weight
4. **Interrogation**: Pressure management becomes core mechanic
5. **Navigation**: Carousel reduces cognitive load

### Risk/Reward Balance
- **Low Pressure**: Safe but ineffective (surface information)
- **Optimal Pressure**: Best information yield
- **High Pressure**: Maximum revelations but risk of subject breakdown
- **Failed Gestures**: Partial results or system "glitches"

### Accessibility Considerations
- All gestures include tap fallbacks
- Adjustable timing thresholds via settings
- Visual and audio feedback for gesture progress
- Motor difficulty accommodations

---

## Implementation Roadmap

### Phase 1: Core Gestures (Week 1-2)
- [ ] Eye Scanner pressure hold system
- [ ] Interrogation pressure intensity
- [ ] Basic gesture utilities setup

### Phase 2: Navigation Gestures (Week 3)
- [ ] Intel Panel carousel system
- [ ] Credentials swipe-down reveal
- [ ] Verification analog drawer

### Phase 3: Polish & Balance (Week 4)
- [ ] Haptic feedback tuning
- [ ] Audio integration
- [ ] Balance testing and iteration
- [ ] Accessibility fallbacks

### Phase 4: Advanced Features (Week 5)
- [ ] Gesture combination mechanics
- [ ] Equipment failure integration
- [ ] Performance optimization

---

## Success Metrics

### Player Experience
- **Gesture Adoption**: % of players using gestures vs taps
- **Session Quality**: Average investigation completion time
- **Strategic Depth**: Question success rate by pressure level

### Technical Performance
- **Gesture Responsiveness**: <16ms gesture recognition
- **Animation Smoothness**: 60fps during all gesture interactions
- **Memory Usage**: <5MB additional RAM for gesture system

### Accessibility
- **Fallback Usage**: <10% of players requiring tap fallbacks
- **Error Rate**: <5% accidental gesture triggers
- **Learning Curve**: 90% of players comfortable within 3 sessions

---

## Risk Mitigation

### Technical Risks
- **Gesture Conflicts**: Comprehensive testing across all screen sizes
- **Performance Impact**: Gesture processing kept off main thread
- **Battery Drain**: Efficient animation scheduling

### UX Risks
- **Learning Curve**: Progressive disclosure with tutorials
- **Accessibility Issues**: Multiple fallback options
- **Player Frustration**: Clear visual feedback and undo mechanisms

### Design Risks
- **Overcomplication**: Simple gesture vocabulary (hold, swipe, tap)
- **Inconsistency**: Unified gesture language across all interactions
- **Balance Issues**: Extensive playtesting for optimal pressure bands

This gesture system transforms AMBER from a button-clicking game into a **tactile investigation simulator** where **how** you interact with the interface matters as much as **what** decisions you make.
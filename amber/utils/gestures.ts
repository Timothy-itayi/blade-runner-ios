// =============================================================================
// GESTURE UTILITIES - Phase 1: Foundation
// =============================================================================
// Reusable gesture utilities for pressure holds, swipes, and carousel navigation

import { Gesture } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';

// =============================================================================
// HAPTIC FEEDBACK SYSTEM
// =============================================================================

export type HapticIntensity = 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'warning';

/**
 * Creates haptic feedback for gesture interactions
 * @param intensity - The intensity level of the haptic feedback
 * @param enabled - Whether haptics are enabled (for accessibility)
 */
export const createHapticFeedback = (
  intensity: HapticIntensity = 'medium',
  enabled: boolean = true
): void => {
  // Intentionally disabled to isolate gesture stability issues.
  // Leaving the API in place so call-sites don't need churn.
  void intensity;
  void enabled;
};

/**
 * Progressive haptic feedback for pressure holds
 * Pulses at intervals to indicate progress
 */
export const createProgressiveHaptic = (
  pressure: number,
  enabled: boolean = true
): void => {
  // Intentionally disabled to isolate gesture stability issues.
  void pressure;
  void enabled;
};

// =============================================================================
// PRESSURE HOLD GESTURES
// =============================================================================

export interface PressureHoldCallbacks {
  onStart?: () => void;
  onUpdate?: (pressure: number) => void;
  onComplete: (finalPressure: number) => void;
  onCancel?: () => void;
}

/**
 * Creates a pressure hold gesture for timed interactions
 * Used for eye scanner and interrogation pressure systems
 * 
 * @param callbacks - Callback functions for gesture events
 * @param maxDuration - Maximum hold duration in milliseconds (default: 3000ms)
 * @param minDuration - Minimum hold duration to trigger (default: 200ms)
 * @param hapticEnabled - Whether to enable haptic feedback (default: true)
 * @returns Configured gesture
 */
export const createPressureHold = (
  callbacks: PressureHoldCallbacks,
  maxDuration: number = 3000,
  minDuration: number = 200,
  hapticEnabled: boolean = false
): ReturnType<typeof Gesture.Pan> => {
  const { onStart, onUpdate, onComplete, onCancel } = callbacks;
  let startTime = 0;

  return Gesture.Pan()
    .minDistance(0)
    .onStart(() => {
      startTime = Date.now();
      if (onStart) runOnJS(onStart)();
    })
    .onUpdate((event) => {
      // Intentionally minimal: device-only native crashes have been observed when
      // doing too much work inside gesture worklets. Keep progress in JS space
      // when needed via non-native handlers.
      void event;
      void onUpdate;
      void minDuration;
      void hapticEnabled;
    })
    .onEnd((event) => {
      const duration = Date.now() - startTime;
      const finalPressure = Math.min(1, duration / maxDuration);
      runOnJS(onComplete)(finalPressure);
    })
    .onTouchesCancelled(() => {
      if (onCancel) runOnJS(onCancel)();
    });
};

// =============================================================================
// SWIPE GESTURES
// =============================================================================

export type SwipeDirection = 'up' | 'down' | 'left' | 'right';

export interface SwipeRevealCallbacks {
  onStart?: () => void;
  onUpdate?: (progress: number) => void;
  onComplete: () => void;
  onCancel?: () => void;
}

/**
 * Creates a swipe reveal gesture for directional interactions
 * Used for credentials swipe-down and verification drawer
 * 
 * @param direction - Direction of swipe to trigger
 * @param callbacks - Callback functions for gesture events
 * @param threshold - Minimum swipe distance in pixels (default: 100)
 * @param velocityThreshold - Alternative trigger via velocity (default: 500 px/s)
 * @param hapticEnabled - Whether to enable haptic feedback (default: true)
 * @returns Configured gesture
 */
export const createSwipeReveal = (
  direction: SwipeDirection,
  callbacks: SwipeRevealCallbacks,
  threshold: number = 100,
  velocityThreshold: number = 500,
  hapticEnabled: boolean = false
): ReturnType<typeof Gesture.Pan> => {
  const { onStart, onUpdate, onComplete, onCancel } = callbacks;

  return Gesture.Pan()
    .onStart(() => {
      if (onStart) runOnJS(onStart)();
    })
    .onUpdate((event) => {
      const { translationX, translationY } = event;
      let progress = 0;

      if (direction === 'down') {
        progress = Math.max(0, Math.min(1, translationY / threshold));
      } else if (direction === 'up') {
        progress = Math.max(0, Math.min(1, -translationY / threshold));
      } else if (direction === 'right') {
        progress = Math.max(0, Math.min(1, translationX / threshold));
      } else if (direction === 'left') {
        progress = Math.max(0, Math.min(1, -translationX / threshold));
      }

      if (onUpdate) runOnJS(onUpdate)(progress);
    })
    .onEnd((event) => {
      const { translationX, translationY, velocityX, velocityY } = event;
      let triggered = false;

      // Check distance threshold
      if (direction === 'down' && translationY > threshold) triggered = true;
      if (direction === 'up' && translationY < -threshold) triggered = true;
      if (direction === 'right' && translationX > threshold) triggered = true;
      if (direction === 'left' && translationX < -threshold) triggered = true;

      // Check velocity threshold (alternative trigger)
      if (!triggered) {
        if (direction === 'down' && velocityY > velocityThreshold) triggered = true;
        if (direction === 'up' && velocityY < -velocityThreshold) triggered = true;
        if (direction === 'right' && velocityX > velocityThreshold) triggered = true;
        if (direction === 'left' && velocityX < -velocityThreshold) triggered = true;
      }

      if (triggered) {
        runOnJS(onComplete)();
      } else {
        if (onCancel) runOnJS(onCancel)();
      }
    })
    .onTouchesCancelled(() => {
      if (onCancel) runOnJS(onCancel)();
    });
};

export interface RatchetedSwipeCallbacks {
  onStart?: () => void;
  onUpdate?: (progress: number, gateIndex: number) => void;
  onGateReached?: (gateIndex: number) => void;
  onComplete: () => void;
  onCancel?: () => void;
}

/**
 * Creates a ratcheted swipe gesture with discrete steps (gates)
 * Jumps between gates with haptic feedback
 * 
 * @param direction - Direction of swipe
 * @param numGates - Number of discrete steps
 * @param callbacks - Callback functions
 * @param threshold - Total distance for full swipe
 * @param hapticEnabled - Whether to enable haptics
 * @returns Configured gesture
 */
export const createRatchetedSwipe = (
  direction: SwipeDirection,
  numGates: number,
  callbacks: RatchetedSwipeCallbacks,
  threshold: number = 200,
  hapticEnabled: boolean = true
): ReturnType<typeof Gesture.Pan> => {
  const { onStart, onUpdate, onGateReached, onComplete, onCancel } = callbacks;
  let lastGate = 0;

  return Gesture.Pan()
    .onStart(() => {
      lastGate = 0;
      if (onStart) runOnJS(onStart)();
    })
    .onUpdate((event) => {
      const { translationX, translationY } = event;
      let rawProgress = 0;

      if (direction === 'right') rawProgress = translationX / threshold;
      else if (direction === 'left') rawProgress = -translationX / threshold;
      else if (direction === 'down') rawProgress = translationY / threshold;
      else if (direction === 'up') rawProgress = -translationY / threshold;

      rawProgress = Math.max(0, Math.min(1, rawProgress));

      // Convert continuous progress to discrete gate index.
      // Range: 0..numGates (inclusive). Gate 0 is start, gate numGates is final.
      const nextGate = Math.max(0, Math.min(numGates, Math.floor(rawProgress * (numGates + 0.000001))));

      // Critical: do NOT spam JS on every frame. Only emit when the gate changes.
      if (nextGate !== lastGate) {
        lastGate = nextGate;
        if (onGateReached) runOnJS(onGateReached)(nextGate);
        if (onUpdate) runOnJS(onUpdate)(rawProgress, nextGate);
      }
    })
    .onEnd((event) => {
      const { translationX, translationY } = event;
      let finalDist = 0;

      if (direction === 'right') finalDist = translationX;
      else if (direction === 'left') finalDist = -translationX;
      else if (direction === 'down') finalDist = translationY;
      else if (direction === 'up') finalDist = -translationY;

      void hapticEnabled; // haptics intentionally disabled (see createHapticFeedback)

      const endProgress = Math.max(0, Math.min(1, finalDist / threshold));
      const endGate = Math.max(0, Math.min(numGates, Math.floor(endProgress * (numGates + 0.000001))));

      // Release behavior: only commit if they release at final gate.
      if (endGate >= numGates) runOnJS(onComplete)();
      else if (onCancel) runOnJS(onCancel)();
    });
};

// =============================================================================
// CAROUSEL GESTURES
// =============================================================================

export interface CarouselCallbacks {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onUpdate?: (offset: number) => void;
}

/**
 * Creates a carousel swipe gesture for horizontal navigation
 * Used for Intel Panel mode switching
 * 
 * @param callbacks - Callback functions for gesture events
 * @param threshold - Minimum swipe distance in pixels (default: 100)
 * @param hapticEnabled - Whether to enable haptic feedback (default: true)
 * @returns Configured gesture
 */
export const createCarouselSwipe = (
  callbacks: CarouselCallbacks,
  threshold: number = 100,
  hapticEnabled: boolean = false
): ReturnType<typeof Gesture.Pan> => {
  const { onSwipeLeft, onSwipeRight, onUpdate } = callbacks;

  return Gesture.Pan()
    .activeOffsetX([-10, 10]) // Horizontal tolerance
    .onUpdate((event) => {
      const { translationX } = event;
      if (onUpdate) runOnJS(onUpdate)(translationX);
    })
    .onEnd((event) => {
      const { translationX, velocityX } = event;
      const absTranslation = Math.abs(translationX);
      const absVelocity = Math.abs(velocityX);

      // Trigger on distance or velocity threshold
      if (absTranslation > threshold || absVelocity > 500) {
        if (translationX > 0) {
          // Swipe right - previous mode
          if (onSwipeRight) {
            runOnJS(onSwipeRight)();
          }
        } else {
          // Swipe left - next mode
          if (onSwipeLeft) {
            runOnJS(onSwipeLeft)();
          }
        }
      }
    });
};

// =============================================================================
// GESTURE STATE MANAGEMENT
// =============================================================================

export interface GestureState {
  isActive: boolean;
  progress: number;
  startTime: number | null;
}

/**
 * Creates a gesture state manager for tracking gesture progress
 */
export const createGestureState = (): GestureState => ({
  isActive: false,
  progress: 0,
  startTime: null,
});

/**
 * Updates gesture state with new progress
 */
export const updateGestureState = (
  state: GestureState,
  progress: number,
  isActive: boolean = true
): GestureState => ({
  ...state,
  isActive,
  progress: Math.max(0, Math.min(1, progress)),
  startTime: state.startTime || (isActive ? Date.now() : null),
});

// =============================================================================
// GESTURE DEBUGGING UTILITIES
// =============================================================================

/**
 * Logs gesture events for debugging (only in development)
 */
export const logGestureEvent = (event: string, data?: any): void => {
  if (__DEV__) {
    console.log(`[Gesture] ${event}`, data || '');
  }
};

/**
 * Validates gesture configuration
 */
export const validateGestureConfig = (config: {
  maxDuration?: number;
  minDuration?: number;
  threshold?: number;
}): boolean => {
  if (config.maxDuration && config.maxDuration <= 0) {
    console.warn('[Gesture] maxDuration must be > 0');
    return false;
  }
  if (config.minDuration && config.minDuration < 0) {
    console.warn('[Gesture] minDuration must be >= 0');
    return false;
  }
  if (config.maxDuration && config.minDuration && config.minDuration >= config.maxDuration) {
    console.warn('[Gesture] minDuration must be < maxDuration');
    return false;
  }
  if (config.threshold && config.threshold <= 0) {
    console.warn('[Gesture] threshold must be > 0');
    return false;
  }
  return true;
};

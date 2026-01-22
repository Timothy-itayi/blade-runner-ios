import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  clamp,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Theme } from '@/constants/theme';
import type { SubjectData } from '../../../data/subjects';
import { styles } from './IntelPanel.styles';
import { VerificationFolders } from './VerificationFolders';
import { VerificationFolderStack3D } from './VerificationFolderStack3D';

type QueryType = 'WARRANT' | 'TRANSIT' | 'INCIDENT';

// Gesture travel is intentionally shorter than the physical door height
// so “swipe anywhere” feels responsive instead of requiring a huge pull.
const DOOR_GESTURE_TRAVEL = 115;
const DOOR_HEIGHT = 164; // keep in sync with styles.verificationDrawerViewport height

function applyResistance(t: number) {
  'worklet';
  // Reads as a “heavy mechanism”: linear early, increasingly stubborn near the end.
  const cutoff = 0.72;
  if (t <= cutoff) return t;
  return cutoff + (t - cutoff) * 0.32;
}

export function VerificationDrawer({
  subject,
  gatheredInformation,
  resourcesRemaining,
  onQueryPerformed,
  onInformationUpdate,
}: {
  subject: SubjectData;
  gatheredInformation: any;
  resourcesRemaining: number;
  onQueryPerformed?: (queryType: QueryType) => void;
  onInformationUpdate?: (info: Partial<any>) => void;
}) {
  const [activeFolder, setActiveFolder] = useState<QueryType | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Reset on subject change.
  useEffect(() => {
    setActiveFolder(null);
    setIsOpen(false);
  }, [subject.id]);

  const openSV = useSharedValue(0); // 0..1 door opening
  const doorShadowSV = useSharedValue(0);
  const stackScrollSV = useSharedValue(0); // horizontal scroll for record-stack feel
  const openStartSV = useSharedValue(0);

  const commitOpen = (next: boolean) => {
    setIsOpen(next);
  };

  const unlockAndSelectFolder = (folder: QueryType) => {
    const isComplete =
      (folder === 'WARRANT' && gatheredInformation.warrantCheck) ||
      (folder === 'TRANSIT' && gatheredInformation.transitLog) ||
      (folder === 'INCIDENT' && gatheredInformation.incidentHistory);

    if (!isComplete && resourcesRemaining && resourcesRemaining > 0) {
      onQueryPerformed?.(folder);
      onInformationUpdate?.({
        [folder === 'WARRANT'
          ? 'warrantCheck'
          : folder === 'TRANSIT'
            ? 'transitLog'
            : 'incidentHistory']: true,
        timestamps: {
          ...(gatheredInformation.timestamps || {}),
          [folder === 'WARRANT'
            ? 'warrantCheck'
            : folder === 'TRANSIT'
              ? 'transitLog'
              : 'incidentHistory']: Date.now(),
        },
      });
    }

    setActiveFolder(folder);
  };

  const openGesture = useMemo(() => {
    return Gesture.Pan()
      // Activate on either direction once they mean it.
      .activeOffsetY([-8, 8])
      // Don’t steal horizontal intents (especially when stack is open).
      .failOffsetX([-14, 14])
      .onBegin(() => {
        openStartSV.value = openSV.value;
        doorShadowSV.value = withTiming(1, { duration: 120 });
      })
      .onUpdate((e) => {
        const raw = clamp(openStartSV.value + e.translationY / DOOR_GESTURE_TRAVEL, 0, 1);
        // Only apply resistance near the “end” to keep close gestures snappy.
        openSV.value = raw < 0.85 ? raw : applyResistance(raw);
      })
      .onEnd((e) => {
        // Fast swipe wins; otherwise position threshold.
        const fastOpen = e.velocityY > 650;
        const fastClose = e.velocityY < -650;
        const shouldOpen = fastOpen ? true : fastClose ? false : openSV.value > 0.5;
        if (shouldOpen) {
          openSV.value = withSpring(1, { damping: 14, stiffness: 160 });
          doorShadowSV.value = withTiming(0, { duration: 220 });
          runOnJS(commitOpen)(true);
        } else {
          openSV.value = withSpring(0, { damping: 16, stiffness: 180 });
          doorShadowSV.value = withTiming(0, { duration: 180 });
          runOnJS(commitOpen)(false);
        }
      })
      .onFinalize(() => {
        doorShadowSV.value = withTiming(0, { duration: 220 });
      });
  }, [gatheredInformation, resourcesRemaining]);

  const doorStyle = useAnimatedStyle(() => {
    // Reveal should read top → bottom: retract door *down* instead of a top-hinged flip.
    // Keep a subtle tilt so it still feels “mechanical” rather than a flat slide.
    const translateY = openSV.value * DOOR_HEIGHT;
    const tilt = `${openSV.value * 6}deg`;
    return {
      transform: [
        { perspective: 900 },
        { translateY },
        { rotateX: tilt },
      ],
    };
  });

  const doorOverlayStyle = useAnimatedStyle(() => {
    // As the door opens, the overlay fades and shadow pulls back.
    const opacity = 1 - openSV.value;
    const shadowOpacity = 0.35 * doorShadowSV.value + 0.18 * (1 - openSV.value);
    return {
      opacity,
      shadowOpacity,
    };
  });

  const underlayStyle = useAnimatedStyle(() => {
    return {
      opacity: 0.25 + openSV.value * 0.75,
    };
  });

  return (
    <View style={styles.verificationDrawerRoot}>
      <View style={styles.verificationDrawerViewport}>
        {/* One gesture surface for the entire viewport (no competing detectors). */}
        <GestureDetector gesture={openGesture}>
          <View style={{ flex: 1 }} collapsable={false}>
            <Animated.View style={[styles.verificationDrawerUnderlay, underlayStyle]}>
              {/* Skeuomorphic interior dressing (non-interactive) */}
              <View pointerEvents="none" style={styles.verificationDrawerInterior}>
                <View style={styles.verificationDrawerInteriorBackplate} />
                <View style={styles.verificationDrawerRailLeft} />
                <View style={styles.verificationDrawerRailRight} />
                <View style={styles.verificationDrawerLipTop} />
                <View style={styles.verificationDrawerLipBottom} />
              </View>

              <View style={styles.verificationDrawerCanvasHitbox} collapsable={false}>
                <VerificationFolderStack3D
                  activeFolder={activeFolder}
                  gatheredInformation={gatheredInformation}
                  resourcesRemaining={resourcesRemaining}
                  scrollX={stackScrollSV}
                  onPressFolder={(folder) => {
                    // Only allow selecting once it’s meaningfully open; otherwise it feels like a UI bug.
                    if (!isOpen) return;
                    unlockAndSelectFolder(folder);
                  }}
                />
              </View>
            </Animated.View>

            <Animated.View style={[styles.verificationDrawerDoor, doorStyle]} collapsable={false}>
              <View style={styles.verificationDrawerDoorFace}>
                {/* Door bevel/trim for a more physical read */}
                <View pointerEvents="none" style={styles.verificationDrawerDoorBevelOuter} />
                <View pointerEvents="none" style={styles.verificationDrawerDoorBevelInner} />
                <View pointerEvents="none" style={styles.verificationDrawerDoorGrooveLine} />

                <Text style={styles.verificationDrawerDoorTopLeftLabel}>
                  {isOpen ? 'SWIPE UP' : 'SWIPE DOWN'}
                </Text>

                <View style={styles.verificationDrawerHandleRow}>
                  <View style={styles.verificationDrawerHandlePlate}>
                    <View pointerEvents="none" style={styles.verificationDrawerHandleRivetLeft} />
                    <View pointerEvents="none" style={styles.verificationDrawerHandleRivetRight} />
                    <View style={styles.verificationDrawerHandleInset} />
                  </View>
                </View>
              </View>
              {/* Overlay should shade the *entire* door (handle included) to avoid “desynced” look. */}
              <Animated.View pointerEvents="none" style={[styles.verificationDrawerDoorOverlay, doorOverlayStyle]} />
            </Animated.View>
          </View>
        </GestureDetector>
      </View>

      <View style={styles.verificationDrawerBody}>
        <View style={styles.verificationDrawerBodyHeader}>
          <Text style={styles.sectionLabel}>FILES</Text>
          {isOpen ? (
            <TouchableOpacity
              onPress={() => {
                setIsOpen(false);
                openSV.value = withSpring(0, { damping: 16, stiffness: 180 });
              }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.investigationNavHint}>[ CLOSE ]</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.sectionHint}>Swipe down to open drawer</Text>
          )}
        </View>

        {!isOpen ? (
          <View style={styles.verificationDrawerClosedNote}>
            <Text style={styles.verificationDrawerClosedText}>
              Drawer sealed. Pull it open like you mean it.
            </Text>
          </View>
        ) : (
          <View style={styles.verificationDrawerContent}>
            {/* “File image” placeholder panel (swap for real images later) */}
            <View style={styles.verificationDrawerFilePreview}>
              <Text style={styles.verificationDrawerFilePreviewTitle}>
                {activeFolder ? `${activeFolder}_FILE.png` : 'NO FILE SELECTED'}
              </Text>
              <Text style={styles.verificationDrawerFilePreviewSub}>
                {activeFolder ? 'Tap file tabs below to inspect.' : 'Tap a folder in the stack above.'}
              </Text>
              <View style={styles.verificationDrawerFilePreviewRule} />
              <Text style={styles.verificationDrawerFilePreviewMono}>
                {activeFolder
                  ? `SUBJECT=${subject.id}\nOPERATOR=OP-7734\nACCESS=${
                      resourcesRemaining > 0 ? 'AVAILABLE' : 'RESTRICTED'
                    }`
                  : `SUBJECT=${subject.id}\nOPERATOR=OP-7734`}
              </Text>
            </View>

            <VerificationFolders
              subject={subject}
              activeFolder={activeFolder}
              onSelectFolder={(folder) => {
                unlockAndSelectFolder(folder);
              }}
              gatheredInformation={gatheredInformation}
              resourcesRemaining={resourcesRemaining || 0}
            />
          </View>
        )}
      </View>
    </View>
  );
}


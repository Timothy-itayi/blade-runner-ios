import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
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
import { useGameStore } from '../../../store/gameStore';
import { styles } from './IntelPanel.styles';
import { VerificationFolderStack3D } from './VerificationFolderStack3D';
import { MEMORY_SLOT_CAPACITY, type LastExtractSnapshot, type ServiceType } from '../../../types/information';
import { isSuspiciousTransit } from '../../../constants/planets';

type QueryType = 'WARRANT' | 'TRANSIT' | 'INCIDENT';

// Gesture travel is intentionally shorter than the physical door height
// so “swipe anywhere” feels responsive instead of requiring a huge pull.
const DOOR_GESTURE_TRAVEL = 115;
const DOOR_HEIGHT = 164; // keep in sync with styles.verificationDrawerViewport height

const TAPE_DURATION_MS = 20_000;

type TapeStatus = 'IDLE' | 'PLAYING' | 'BUFFERED' | 'COMPLETE';
type TapeState = {
  status: TapeStatus;
  elapsedMs: number;
  script: string[];
  confirmStop: boolean;
};

function buildTapeScript(subject: SubjectData, tape: QueryType): string[] {
  switch (tape) {
    case 'WARRANT': {
      const hasWarrant = subject.warrants && subject.warrants !== 'NONE';
      const incidents = typeof subject.incidents === 'number' ? subject.incidents : 0;
      const compliance = (subject as any).compliance || 'UNKNOWN';
      return [
        'AMBER INTEL / WARRANT CHANNEL / INIT',
        `SUBJECT: ${subject.id}`,
        'QUERY: WARRANT INDEX',
        `RESULT: ${hasWarrant ? 'ACTIVE WARRANT' : 'CLEAR'}`,
        hasWarrant ? `DETAIL: ${subject.warrants}` : 'DETAIL: NONE',
        `ANCILLARY: INCIDENT COUNT = ${incidents}`,
        `COMPLIANCE RATING = ${compliance}`,
        'NOTE: WARRANT ENFORCEMENT AUTHORIZED',
        'EXTRACT COMPLETE',
      ];
    }
    case 'TRANSIT': {
      const travel = (subject as any).databaseQuery?.travelHistory || [];
      const processed = travel.map((entry: any) => {
        const fromPlanet = entry.from || entry.fromPlanet || '';
        const toPlanet = entry.to || entry.toPlanet || '';
        const flagged = isSuspiciousTransit(fromPlanet, toPlanet) || entry.flagged;
        return { fromPlanet, toPlanet, date: entry.date || 'UNK', flagged };
      });
      const flaggedTrips = processed.filter((t: any) => t.flagged);
      const headline =
        flaggedTrips.length > 0
          ? `ALERT: ${flaggedTrips.length} FLAGGED ROUTE(S)`
          : 'ALERT: NO ANOMALIES';
      return [
        'AMBER INTEL / TRANSIT CHANNEL / INIT',
        `SUBJECT: ${subject.id}`,
        `RECORDS: ${processed.length}`,
        headline,
        ...processed.slice(0, 3).map(
          (t: any) => `${t.date}: ${t.fromPlanet} -> ${t.toPlanet}${t.flagged ? '  [FLAGGED]' : ''}`
        ),
        processed.length > 3 ? `... ${processed.length - 3} MORE` : '... END OF LOG',
        'EXTRACT COMPLETE',
      ];
    }
    case 'INCIDENT': {
      const incidents = (subject as any).databaseQuery?.discrepancies || [];
      return [
        'AMBER INTEL / INCIDENT CHANNEL / INIT',
        `SUBJECT: ${subject.id}`,
        `ON FILE: ${incidents.length} RECORD(S)`,
        ...(incidents.slice(0, 3).map((inc: any, i: number) => {
          const type = inc.type || 'UNSPECIFIED';
          const date = inc.date || 'UNK';
          return `INCIDENT ${i + 1}: ${type} (${date})`;
        }) || []),
        incidents.length > 3 ? `... ${incidents.length - 3} MORE` : '... END OF RECORD',
        'EXTRACT COMPLETE',
      ];
    }
    default:
      return ['AMBER INTEL / UNKNOWN TAPE', 'EXTRACT COMPLETE'];
  }
}

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
  const [memoryFullFor, setMemoryFullFor] = useState<ServiceType | null>(null);
  const [confirmAbortFor, setConfirmAbortFor] = useState<ServiceType | null>(null);
  const [tapes, setTapes] = useState<Record<QueryType, TapeState>>(() => ({
    WARRANT: { status: 'IDLE', elapsedMs: 0, script: [], confirmStop: false },
    TRANSIT: { status: 'IDLE', elapsedMs: 0, script: [], confirmStop: false },
    INCIDENT: { status: 'IDLE', elapsedMs: 0, script: [], confirmStop: false },
  }));

  // Reset on subject change.
  useEffect(() => {
    setActiveFolder(null);
    setIsOpen(false);
    setMemoryFullFor(null);
    setConfirmAbortFor(null);
    setTapes({
      WARRANT: { status: 'IDLE', elapsedMs: 0, script: [], confirmStop: false },
      TRANSIT: { status: 'IDLE', elapsedMs: 0, script: [], confirmStop: false },
      INCIDENT: { status: 'IDLE', elapsedMs: 0, script: [], confirmStop: false },
    });
  }, [subject.id]);

  const activeServices: ServiceType[] = gatheredInformation?.activeServices || [];
  const memoryUsed = activeServices.length;
  const memoryFull = memoryUsed >= MEMORY_SLOT_CAPACITY;

  const isInProgressService = (svc: ServiceType) => {
    // Scans
    if (svc === 'IDENTITY_SCAN') return !gatheredInformation?.identityScan;
    if (svc === 'HEALTH_SCAN') return !gatheredInformation?.healthScan;

    // Tapes: in-progress means playing/buffered and not yet complete.
    if (svc === 'WARRANT') {
      return (
        !gatheredInformation?.warrantCheck &&
        (tapes.WARRANT.status === 'PLAYING' || tapes.WARRANT.status === 'BUFFERED')
      );
    }
    if (svc === 'TRANSIT') {
      return (
        !gatheredInformation?.transitLog &&
        (tapes.TRANSIT.status === 'PLAYING' || tapes.TRANSIT.status === 'BUFFERED')
      );
    }
    if (svc === 'INCIDENT') {
      return (
        !gatheredInformation?.incidentHistory &&
        (tapes.INCIDENT.status === 'PLAYING' || tapes.INCIDENT.status === 'BUFFERED')
      );
    }

    return false;
  };

  const lastExtracted: Partial<Record<ServiceType, LastExtractSnapshot>> =
    gatheredInformation?.lastExtracted || {};

  const mostRecentExtract = useMemo<LastExtractSnapshot | null>(() => {
    const all = Object.values(lastExtracted).filter(Boolean) as LastExtractSnapshot[];
    if (!all.length) return null;
    return all.reduce((a, b) => (a.timestamp >= b.timestamp ? a : b));
  }, [lastExtracted]);

  const startService = (service: ServiceType) => {
    if (activeServices.includes(service)) return true; // uniqueness per type
    if (memoryFull) {
      setMemoryFullFor(service);
      setConfirmAbortFor(null);
      return false;
    }
    onInformationUpdate?.({
      activeServices: [...activeServices, service],
    });
    return true;
  };

  const stopService = (service: ServiceType) => {
    onInformationUpdate?.({
      activeServices: activeServices.filter((s) => s !== service),
    });
    if (memoryFullFor === service) setMemoryFullFor(null);
  };

  const getExtractLines = (folder: QueryType): string[] => {
    switch (folder) {
      case 'WARRANT': {
        const warrant = subject.warrants || 'UNKNOWN';
        const incidents = typeof subject.incidents === 'number' ? subject.incidents : 0;
        return [`WARRANT_STATUS: ${warrant}`, `INCIDENTS: ${incidents}`];
      }
      case 'TRANSIT': {
        const travel = subject.databaseQuery?.travelHistory || [];
        const flagged = travel.filter((entry: any) => {
          const fromPlanet = entry.from || entry.fromPlanet || '';
          const toPlanet = entry.to || entry.toPlanet || '';
          return isSuspiciousTransit(fromPlanet, toPlanet) || entry.flagged;
        }).length;
        return [`TRANSIT_LOG: ${travel.length} RECORD(S)`, `FLAGGED: ${flagged}`];
      }
      case 'INCIDENT': {
        const incidents = subject.databaseQuery?.discrepancies || [];
        return [`INCIDENTS: ${incidents.length} RECORD(S)`, `ON_FILE: ${subject.incidents || 0}`];
      }
      default:
        return ['NO DATA'];
    }
  };

  const openSV = useSharedValue(0); // 0..1 door opening
  const doorShadowSV = useSharedValue(0);
  const stackScrollSV = useSharedValue(0); // horizontal scroll for record-stack feel
  const openStartSV = useSharedValue(0);

  const commitOpen = (next: boolean) => {
    setIsOpen(next);
  };

  const playTape = (folder: QueryType) => {
    // Starting occupies a slot; gathered flags flip ONLY on completion.
    const service = folder as ServiceType;
    const alreadyComplete =
      (folder === 'WARRANT' && !!gatheredInformation?.warrantCheck) ||
      (folder === 'TRANSIT' && !!gatheredInformation?.transitLog) ||
      (folder === 'INCIDENT' && !!gatheredInformation?.incidentHistory);
    const st = tapes[folder];
    if (alreadyComplete || st.status === 'PLAYING' || st.status === 'BUFFERED') {
      setActiveFolder(folder);
      return;
    }

    if (memoryFull) {
      if (!startService(service)) return;
      return;
    }

    const store = useGameStore.getState();
    if (!store.useSubjectResource()) return;
    if (!startService(service)) return;

    // Audio focus rule: one plays; others buffer.
    setTapes((prev) => {
      const next: Record<QueryType, TapeState> = { ...prev };
      (Object.keys(next) as QueryType[]).forEach((k) => {
        if (k !== folder && next[k].status === 'PLAYING') {
          next[k] = { ...next[k], status: 'BUFFERED', confirmStop: false };
        }
        if (k !== folder && next[k].confirmStop) {
          next[k] = { ...next[k], confirmStop: false };
        }
      });

      const existing = next[folder];
      const script = existing.script.length ? existing.script : buildTapeScript(subject, folder);
      next[folder] = { ...existing, status: 'PLAYING', script, confirmStop: false };
      return next;
    });

    setMemoryFullFor(null);
    setConfirmAbortFor(null);
    setActiveFolder(folder);
  };

  const stopTape = (folder: QueryType) => {
    const service = folder as ServiceType;
    const st = tapes[folder];
    const isComplete =
      (folder === 'WARRANT' && !!gatheredInformation?.warrantCheck) ||
      (folder === 'TRANSIT' && !!gatheredInformation?.transitLog) ||
      (folder === 'INCIDENT' && !!gatheredInformation?.incidentHistory);

    const inProgress =
      !isComplete &&
      (st.status === 'PLAYING' || st.status === 'BUFFERED') &&
      st.elapsedMs < TAPE_DURATION_MS;

    if (inProgress && !st.confirmStop) {
      setTapes((prev) => ({
        ...prev,
        [folder]: { ...prev[folder], confirmStop: true },
      }));
      return;
    }

    // Abort: free slot, discard extraction progress, do NOT set gathered flags.
    setTapes((prev) => ({
      ...prev,
      [folder]: { status: 'IDLE', elapsedMs: 0, script: [], confirmStop: false },
    }));
    stopService(service);
    if (activeFolder === folder) setActiveFolder(null);
  };

  const closeActiveFile = () => {
    if (!activeFolder) return;
    const service = activeFolder as ServiceType;
    const snapshot: LastExtractSnapshot = {
      lines: getExtractLines(activeFolder).slice(0, 2),
      timestamp: Date.now(),
    };
    onInformationUpdate?.({
      lastExtracted: {
        ...(lastExtracted || {}),
        [service]: snapshot,
      },
      activeServices: activeServices.filter((s) => s !== service),
    });
    setTapes((prev) => ({
      ...prev,
      [activeFolder]: { status: 'IDLE', elapsedMs: 0, script: [], confirmStop: false },
    }));
    setActiveFolder(null);
  };

  // Tape playback tick (only the currently PLAYING tape advances).
  useEffect(() => {
    const playing = (Object.keys(tapes) as QueryType[]).find((k) => tapes[k].status === 'PLAYING');
    if (!playing) return;

    const interval = setInterval(() => {
      setTapes((prev) => {
        const st = prev[playing];
        if (st.status !== 'PLAYING') return prev;
        const nextElapsed = Math.min(TAPE_DURATION_MS, st.elapsedMs + 250);
        return { ...prev, [playing]: { ...st, elapsedMs: nextElapsed } };
      });
    }, 250);

    return () => clearInterval(interval);
  }, [tapes]);

  // Completion: flip gathered flag + snapshot, free slot, mark COMPLETE.
  useEffect(() => {
    (['WARRANT', 'TRANSIT', 'INCIDENT'] as QueryType[]).forEach((folder) => {
      const st = tapes[folder];
      if (st.elapsedMs < TAPE_DURATION_MS) return;
      if (st.status !== 'PLAYING' && st.status !== 'BUFFERED') return;

      const flagKey =
        folder === 'WARRANT' ? 'warrantCheck' : folder === 'TRANSIT' ? 'transitLog' : 'incidentHistory';
      const already = !!gatheredInformation?.[flagKey];
      const service = folder as ServiceType;

      if (!already) {
        onQueryPerformed?.(folder);
      }

      onInformationUpdate?.({
        ...(already ? {} : { [flagKey]: true }),
        timestamps: {
          ...(gatheredInformation.timestamps || {}),
          ...(already ? {} : { [flagKey]: Date.now() }),
        },
        lastExtracted: {
          ...(lastExtracted || {}),
          [service]: {
            lines: getExtractLines(folder).slice(0, 2),
            timestamp: Date.now(),
          },
        },
        activeServices: activeServices.filter((s) => s !== service),
      });

      setTapes((prev) => ({
        ...prev,
        [folder]: { ...prev[folder], status: 'COMPLETE', confirmStop: false },
      }));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tapes.WARRANT.elapsedMs, tapes.TRANSIT.elapsedMs, tapes.INCIDENT.elapsedMs]);

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
  }, [gatheredInformation]);

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
                    playTape(folder);
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
                <Text style={[styles.verificationDrawerDoorTopLeftLabel, { position: 'absolute', right: 10, top: 10, opacity: 0.9 }]}>
                  MEM {memoryUsed}/{MEMORY_SLOT_CAPACITY}
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
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 10 }}>
            <Text style={styles.sectionLabel}>FILES</Text>
            <Text style={[styles.sectionHint, { opacity: 0.9 }]}>
              MEM {memoryUsed}/{MEMORY_SLOT_CAPACITY}
            </Text>
          </View>
          {isOpen ? (
            <View style={{ flexDirection: 'row', gap: 12 }}>
              {activeFolder ? (
                <TouchableOpacity
                  onPress={closeActiveFile}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={styles.investigationNavHint}>[ CLOSE FILE ]</Text>
                </TouchableOpacity>
              ) : null}
              <TouchableOpacity
                onPress={() => {
                  setIsOpen(false);
                  openSV.value = withSpring(0, { damping: 16, stiffness: 180 });
                }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.investigationNavHint}>[ CLOSE ]</Text>
              </TouchableOpacity>
            </View>
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
                {activeFolder ? 'File loaded into memory.' : 'Tap a folder in the stack above.'}
              </Text>
              <View style={styles.verificationDrawerFilePreviewRule} />
              <Text style={styles.verificationDrawerFilePreviewMono}>
                {`SUBJECT=${subject.id}\nOPERATOR=OP-7734\nMEMORY=${memoryUsed}/${MEMORY_SLOT_CAPACITY}`}
              </Text>
              {!activeFolder && mostRecentExtract ? (
                <View style={{ marginTop: 8 }}>
                  <Text style={[styles.verificationDrawerFilePreviewSub, { opacity: 0.9 }]}>
                    LAST EXTRACT
                  </Text>
                  {mostRecentExtract.lines.slice(0, 2).map((ln, idx) => (
                    <Text key={idx} style={styles.verificationDrawerFilePreviewMono}>
                      {ln}
                    </Text>
                  ))}
                </View>
              ) : null}
            </View>

            {memoryFullFor ? (
              <View
                style={{
                  borderWidth: 1,
                  borderColor: 'rgba(212,83,74,0.55)',
                  backgroundColor: 'rgba(212,83,74,0.08)',
                  padding: 10,
                  marginBottom: 10,
                }}
              >
                <Text style={{ color: Theme.colors.accentDeny, fontSize: 10, fontFamily: Theme.fonts.mono, fontWeight: '800' }}>
                  MEMORY FULL — TERMINATE A PROCESS
                </Text>
                <Text style={{ color: Theme.colors.textDim, fontSize: 9, fontFamily: Theme.fonts.mono, marginTop: 4 }}>
                  Request: {memoryFullFor}
                </Text>
                {confirmAbortFor && isInProgressService(confirmAbortFor) ? (
                  <Text style={{ color: Theme.colors.accentWarn, fontSize: 9, fontFamily: Theme.fonts.mono, marginTop: 6 }}>
                    Process in progress. Aborting discards results (no gathered flag).
                  </Text>
                ) : null}
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
                  {activeServices.map((svc) => (
                    <TouchableOpacity
                      key={svc}
                      onPress={() => {
                        // Tightened semantics: in-progress scans/tapes require explicit confirmation to abort.
                        if (isInProgressService(svc) && confirmAbortFor !== svc) {
                          setConfirmAbortFor(svc);
                          return;
                        }

                        const pending = memoryFullFor;
                        const nextActive = activeServices.filter((s) => s !== svc);

                        // If they killed the focused file, close it.
                        if (activeFolder && (activeFolder as ServiceType) === svc) {
                          setActiveFolder(null);
                        }

                        // Uniqueness per type: only add if not already active.
                        const shouldAdd = pending && !nextActive.includes(pending);
                        const nextWithPending =
                          shouldAdd && nextActive.length < MEMORY_SLOT_CAPACITY
                            ? [...nextActive, pending]
                            : nextActive;

                        onInformationUpdate?.({ activeServices: nextWithPending });

                        setMemoryFullFor(null);
                        setConfirmAbortFor(null);

                        // If the pending request is a tape, start playback now (no instant gather).
                        if (pending && (pending === 'WARRANT' || pending === 'TRANSIT' || pending === 'INCIDENT')) {
                          const folder = pending as QueryType;
                          setActiveFolder(folder);
                          setTapes((prev) => {
                            const next: Record<QueryType, TapeState> = { ...prev };
                            (Object.keys(next) as QueryType[]).forEach((k) => {
                              if (k !== folder && next[k].status === 'PLAYING') {
                                next[k] = { ...next[k], status: 'BUFFERED', confirmStop: false };
                              }
                            });
                            const existing = next[folder];
                            const script = existing.script.length ? existing.script : buildTapeScript(subject, folder);
                            next[folder] = { ...existing, status: 'PLAYING', script, confirmStop: false };
                            return next;
                          });
                        }
                      }}
                      style={{
                        borderWidth: 1,
                        borderColor: 'rgba(74,106,122,0.55)',
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                        backgroundColor: 'rgba(13,17,23,0.35)',
                      }}
                      activeOpacity={0.85}
                    >
                      <Text style={{ color: Theme.colors.textPrimary, fontSize: 9, fontFamily: Theme.fonts.mono }}>
                        {isInProgressService(svc)
                          ? confirmAbortFor === svc
                            ? `CONFIRM ABORT ${svc}`
                            : `ABORT ${svc}`
                          : `TERMINATE ${svc}`}
                      </Text>
                    </TouchableOpacity>
                  ))}
                  <TouchableOpacity
                    onPress={() => {
                      setMemoryFullFor(null);
                      setConfirmAbortFor(null);
                    }}
                    style={{
                      borderWidth: 1,
                      borderColor: 'rgba(74,106,122,0.55)',
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                      backgroundColor: 'rgba(13,17,23,0.2)',
                    }}
                    activeOpacity={0.85}
                  >
                    <Text style={{ color: Theme.colors.textDim, fontSize: 9, fontFamily: Theme.fonts.mono }}>
                      CANCEL
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : null}

            <View
              style={{
                borderWidth: 1,
                borderColor: 'rgba(74, 106, 122, 0.35)',
                backgroundColor: 'rgba(13, 17, 23, 0.55)',
                padding: 10,
              }}
            >
              {!activeFolder ? (
                <Text style={{ color: Theme.colors.textDim, fontFamily: Theme.fonts.mono, fontSize: 9 }}>
                  INSERT A TAPE (WARRANT / TRANSIT / INCIDENT)
                </Text>
              ) : (
                <>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <Text
                      style={{
                        color: Theme.colors.textPrimary,
                        fontFamily: Theme.fonts.mono,
                        fontSize: 10,
                        fontWeight: '800',
                        letterSpacing: 1,
                      }}
                    >
                      {activeFolder}_TAPE
                    </Text>
                    <Text style={{ color: Theme.colors.textDim, fontFamily: Theme.fonts.mono, fontSize: 8, letterSpacing: 0.8 }}>
                      {tapes[activeFolder].status === 'BUFFERED' ? 'BUFFERED' : tapes[activeFolder].status}
                    </Text>
                  </View>

                  <View style={{ height: 6, backgroundColor: 'rgba(255,255,255,0.06)', marginTop: 8 }}>
                    <View
                      style={{
                        height: 6,
                        width: `${Math.round((tapes[activeFolder].elapsedMs / TAPE_DURATION_MS) * 100)}%`,
                        backgroundColor: Theme.colors.accentWarn,
                        opacity: tapes[activeFolder].status === 'COMPLETE' ? 0.6 : 0.9,
                      }}
                    />
                  </View>

                  <ScrollView style={{ marginTop: 10, maxHeight: 92 }} showsVerticalScrollIndicator={false}>
                    {(tapes[activeFolder].script.length ? tapes[activeFolder].script : buildTapeScript(subject, activeFolder))
                      .slice(0, Math.max(1, Math.floor((tapes[activeFolder].elapsedMs / TAPE_DURATION_MS) * 9)))
                      .map((line, idx) => {
                        const flagged = /\b(ACTIVE WARRANT|FLAGGED|INCIDENT|SYNTHETIC|REPLICANT|ALERT)\b/i.test(line);
                        return (
                          <Text
                            key={`${activeFolder}-${idx}`}
                            style={{
                              color: flagged ? Theme.colors.accentWarn : Theme.colors.textPrimary,
                              fontFamily: Theme.fonts.mono,
                              fontSize: 8.5,
                              lineHeight: 12,
                              opacity: 0.95,
                            }}
                          >
                            {line}
                          </Text>
                        );
                      })}
                  </ScrollView>

                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
                    <TouchableOpacity
                      onPress={() => {
                        const current = tapes[activeFolder];
                        if (current.status === 'COMPLETE') {
                          setActiveFolder(null);
                          return;
                        }
                        stopTape(activeFolder);
                      }}
                      activeOpacity={0.85}
                      style={{
                        borderWidth: 1,
                        borderColor: 'rgba(74,106,122,0.55)',
                        paddingHorizontal: 10,
                        paddingVertical: 8,
                        backgroundColor: 'rgba(13,17,23,0.35)',
                      }}
                    >
                      <Text style={{ color: Theme.colors.textPrimary, fontFamily: Theme.fonts.mono, fontSize: 9 }}>
                        {tapes[activeFolder].status === 'COMPLETE'
                          ? '[ CLOSE ]'
                          : tapes[activeFolder].confirmStop
                            ? '[ CONFIRM ABORT ]'
                            : '[ ABORT ]'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => playTape(activeFolder)}
                      activeOpacity={0.85}
                      style={{
                        borderWidth: 1,
                        borderColor: 'rgba(74,106,122,0.55)',
                        paddingHorizontal: 10,
                        paddingVertical: 8,
                        backgroundColor: 'rgba(13,17,23,0.2)',
                        opacity: tapes[activeFolder].status === 'PLAYING' ? 0.4 : 1,
                      }}
                      disabled={tapes[activeFolder].status === 'PLAYING'}
                    >
                      <Text style={{ color: Theme.colors.textSecondary, fontFamily: Theme.fonts.mono, fontSize: 9 }}>
                        [ PLAY ]
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          </View>
        )}
      </View>
    </View>
  );
}


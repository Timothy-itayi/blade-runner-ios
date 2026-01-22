import React, { useMemo } from 'react';
import { NativeModules, Text, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';

type QueryType = 'WARRANT' | 'TRANSIT' | 'INCIDENT';

export interface VerificationFolder3DItem {
  id: QueryType;
  label: string;
  accent: string;
  complete: boolean;
  locked: boolean;
}

function hasExpoGLNativeModule() {
  return !!(
    // iOS/Android module names used by expo-gl
    NativeModules?.ExponentGLObjectManager ||
    NativeModules?.ExponentGLViewManager ||
    // some builds expose it without the Exponent prefix
    NativeModules?.ExpoGLObjectManager ||
    NativeModules?.ExpoGLViewManager
  );
}

function FolderStackFallback2D({
  items,
  scrollX,
  onPressFolder,
}: {
  items: VerificationFolder3DItem[];
  scrollX: SharedValue<number>;
  onPressFolder: (id: QueryType) => void;
}) {
  const translateStyle = useAnimatedStyle(() => {
    // keep the exact same gesture plumbing; just map “world units” to px
    return {
      // NOTE: transforms do not merge across style objects; compose them here.
      transform: [
        { perspective: 900 },
        { rotateZ: '-10deg' },
        { translateX: -scrollX.value * 240 },
      ],
    };
  });

  return (
    <View style={{ flex: 1, justifyContent: 'center' }}>
      <Animated.View
        style={[
          {
            flexDirection: 'row',
            paddingLeft: 10,
          },
          translateStyle,
        ]}
      >
        {items.map((it, idx) => {
          const body = it.locked ? 'rgba(42,47,54,0.95)' : 'rgba(191,164,101,0.95)';
          const ear = it.locked ? 'rgba(58,63,71,0.95)' : 'rgba(215,198,143,0.95)';
          const earText = it.locked ? 'rgba(230,235,240,0.9)' : 'rgba(11,15,20,0.9)';
          const stepX = 14; // diagonal spread (x)
          const stepY = 7; // diagonal spread (y)
          return (
            <TouchableOpacity
              key={it.id}
              onPress={() => onPressFolder(it.id)}
              activeOpacity={0.9}
              style={{
                width: 132,
                height: 86,
                marginRight: -58, // overlap like physical folders (stronger for diagonal read)
                borderWidth: 1,
                borderColor: 'rgba(0,0,0,0.25)',
                backgroundColor: body,
                padding: 10,
                justifyContent: 'space-between',
                shadowColor: '#000',
                shadowOpacity: 0.25,
                shadowRadius: 12,
                shadowOffset: { width: 0, height: 6 },
                elevation: 8,
                zIndex: 30 - idx,
                // Stagger diagonally so we see the top-right corner of each folder.
                transform: [
                  { perspective: 900 },
                  { translateX: idx * stepX },
                  { translateY: idx * stepY },
                  { rotateZ: '-8deg' },
                  { rotateX: '10deg' },
                ],
              }}
            >
              <View
                style={{
                  position: 'absolute',
                  top: -1,
                  right: 8,
                  // “Snug”: width driven by content, but capped.
                  maxWidth: 86,
                  height: 18,
                  borderWidth: 1,
                  borderColor: 'rgba(0,0,0,0.2)',
                  backgroundColor: ear,
                  paddingHorizontal: 6,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={{
                    fontSize: 8,
                    letterSpacing: 0.6,
                    fontWeight: '800',
                    color: earText,
                  }}
                >
                  {it.label}
                </Text>
              </View>
              <View
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: 6,
                  backgroundColor: it.complete ? it.accent : 'rgba(74,106,122,0.95)',
                }}
              />
              {/* Label lives on the top-right tab now. */}
              <View />
              <Text style={{ fontSize: 8, color: 'rgba(11,15,20,0.7)', letterSpacing: 0.5 }}>
                {it.locked ? 'LOCKED' : it.complete ? 'COMPLETE' : 'UNOPENED'}
              </Text>
            </TouchableOpacity>
          );
        })}
      </Animated.View>

      <View style={{ position: 'absolute', right: 8, bottom: 6, opacity: 0.55 }}>
        <Text style={{ fontSize: 9, color: '#7a8b98' }}>GL unavailable — using 2D fallback</Text>
      </View>
    </View>
  );
}

export function VerificationFolderStack3D({
  activeFolder,
  gatheredInformation,
  resourcesRemaining,
  scrollX,
  onPressFolder,
}: {
  activeFolder: QueryType | null;
  gatheredInformation: any;
  resourcesRemaining: number;
  scrollX: SharedValue<number>;
  onPressFolder: (id: QueryType) => void;
}) {
  const items = useMemo<VerificationFolder3DItem[]>(() => {
    const completeWarrant = !!gatheredInformation?.warrantCheck;
    const completeTransit = !!gatheredInformation?.transitLog;
    const completeIncident = !!gatheredInformation?.incidentHistory;

    return [
      {
        id: 'WARRANT',
        label: 'WARRANT',
        accent: '#c9a227',
        complete: completeWarrant,
        locked: !completeWarrant && resourcesRemaining === 0,
      },
      {
        id: 'TRANSIT',
        label: 'TRANSIT',
        accent: '#7fb8d8',
        complete: completeTransit,
        locked: !completeTransit && resourcesRemaining === 0,
      },
      {
        id: 'INCIDENT',
        label: 'INCIDENT',
        accent: '#d4534a',
        complete: completeIncident,
        locked: !completeIncident && resourcesRemaining === 0,
      },
    ];
  }, [gatheredInformation, resourcesRemaining]);

  void activeFolder;

  // Hard stop: if the native module isn’t in this build, do NOT import fiber/native.
  // That import crashes immediately (your screenshot).
  const glReady = hasExpoGLNativeModule();

  if (!glReady) {
    return <FolderStackFallback2D items={items} scrollX={scrollX} onPressFolder={onPressFolder} />;
  }

  // Dynamically require GL stack to avoid crashing when native module is missing.
  let Canvas: any = null;
  let useFrame: any = null;
  let Group: any = null;
  try {
    Canvas = require('@react-three/fiber/native').Canvas;
    useFrame = require('@react-three/fiber').useFrame;
    Group = require('three').Group;
  } catch (_err) {
    return <FolderStackFallback2D items={items} scrollX={scrollX} onPressFolder={onPressFolder} />;
  }

  function FolderMesh3D({
    item,
    index,
    onPress,
  }: {
    item: VerificationFolder3DItem;
    index: number;
    onPress: (id: VerificationFolder3DItem['id']) => void;
  }) {
    const baseX = index * 1.15;
    const baseZ = -index * 0.18;
    const liftY = item.complete ? 0.06 : 0;

    const bodyColor = item.locked ? '#2a2f36' : '#bfa465';
    const edgeColor = item.locked ? '#3a3f47' : '#d7c68f';

    return (
      <group
        position={[baseX, liftY, baseZ]}
        // Angle so the top-right corner is the read: slight pitch + yaw + a touch of roll.
        rotation={[-0.22, -0.6, 0.12]}
      >
        <mesh
          onPointerDown={(e: any) => {
            e.stopPropagation();
            onPress(item.id);
          }}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[1.0, 0.66, 0.09]} />
          <meshStandardMaterial color={bodyColor} roughness={0.9} metalness={0.08} />
        </mesh>

        <mesh position={[0.18, 0.24, 0.055]} castShadow receiveShadow>
          <boxGeometry args={[0.64, 0.22, 0.02]} />
          <meshStandardMaterial color={edgeColor} roughness={0.85} metalness={0.05} />
        </mesh>

        <mesh position={[-0.44, 0.0, 0.055]}>
          <boxGeometry args={[0.05, 0.62, 0.012]} />
          <meshStandardMaterial
            color={item.complete ? item.accent : '#4a6a7a'}
            roughness={0.75}
            metalness={0.18}
            emissive={item.complete ? item.accent : '#000000'}
            emissiveIntensity={item.complete ? 0.18 : 0}
          />
        </mesh>
      </group>
    );
  }

  function FolderStackScene3D({
    items: sceneItems,
    scrollX: sceneScrollX,
    onPressFolder: press,
  }: {
    items: VerificationFolder3DItem[];
    scrollX: SharedValue<number>;
    onPressFolder: (id: QueryType) => void;
  }) {
    const groupRef = React.useRef<any>(null);

    useFrame(() => {
      if (!groupRef.current) return;
      groupRef.current.position.x = -sceneScrollX.value;
    });

    return (
      <>
        <ambientLight intensity={0.55} />
        <directionalLight position={[3.5, 3.0, 2.5]} intensity={1.25} castShadow />
        <directionalLight position={[-3.5, 1.0, 1.5]} intensity={0.4} />

        <group ref={groupRef} position={[-0.15, 0, 0]}>
          {sceneItems.map((it, i) => (
            <FolderMesh3D key={it.id} item={it} index={i} onPress={press} />
          ))}
        </group>
      </>
    );
  }

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [0.4, 0.55, 2.75], fov: 42, near: 0.1, far: 50 }}
      gl={{ antialias: true, alpha: true }}
    >
      <FolderStackScene3D items={items} scrollX={scrollX} onPressFolder={onPressFolder} />
    </Canvas>
  );
}


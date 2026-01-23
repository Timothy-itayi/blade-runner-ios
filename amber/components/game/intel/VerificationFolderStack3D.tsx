import React, { useMemo } from 'react';
import { NativeModules, Text, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';
import { MEMORY_SLOT_CAPACITY, type ServiceType } from '../../../types/information';

type QueryType = 'WARRANT' | 'TRANSIT' | 'INCIDENT';

export interface VerificationFolder3DItem {
  id: QueryType;
  label: string;
  accent: string;
  complete: boolean;
  locked: boolean;
  active: boolean;
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
          const body = it.locked ? 'rgba(42,47,54,0.95)' : 'rgba(13,17,23,0.92)';
          const labelPlate = it.locked ? 'rgba(58,63,71,0.95)' : 'rgba(26,42,58,0.85)';
          const labelText = it.locked ? 'rgba(230,235,240,0.92)' : 'rgba(230,235,240,0.92)';
          const stepX = 14; // diagonal spread (x)
          const stepY = 7; // diagonal spread (y)
          const borderColor = it.active
            ? it.accent
            : it.complete
              ? 'rgba(74,138,90,0.85)'
              : 'rgba(0,0,0,0.25)';
          return (
            <TouchableOpacity
              key={it.id}
              onPress={() => onPressFolder(it.id)}
              activeOpacity={0.9}
              style={{
                width: 142,
                height: 78,
                marginRight: -58, // overlap like physical folders (stronger for diagonal read)
                borderWidth: 1,
                borderColor,
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
                  top: 6,
                  right: 22, // leave room for the notch on the far right
                  // “Snug”: width driven by content, but capped.
                  maxWidth: 92,
                  height: 18,
                  borderWidth: 1,
                  borderColor: 'rgba(0,0,0,0.2)',
                  backgroundColor: labelPlate,
                  paddingHorizontal: 6,
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: 3,
                }}
              >
                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={{
                    fontSize: 8,
                    letterSpacing: 0.6,
                    fontWeight: '800',
                    color: labelText,
                  }}
                >
                  {it.label}
                </Text>
              </View>

              {/* Notch / write-protect cutout */}
              <View
                pointerEvents="none"
                style={{
                  position: 'absolute',
                  right: -1,
                  top: 18,
                  width: 18,
                  height: 24,
                  borderLeftWidth: 1,
                  borderTopWidth: 1,
                  borderBottomWidth: 1,
                  borderColor: it.active ? it.accent : 'rgba(0,0,0,0.25)',
                  backgroundColor: it.locked ? 'rgba(22,26,32,0.95)' : 'rgba(10,12,15,0.85)',
                  borderTopLeftRadius: 3,
                  borderBottomLeftRadius: 3,
                }}
              />

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

              {/* Cartridge window + reels */}
              <View
                pointerEvents="none"
                style={{
                  position: 'absolute',
                  left: 10,
                  right: 28,
                  top: 28,
                  height: 18,
                  borderWidth: 1,
                  borderColor: 'rgba(74,106,122,0.35)',
                  backgroundColor: 'rgba(10,12,15,0.55)',
                  borderRadius: 4,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingHorizontal: 10,
                }}
              >
                <View
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    borderWidth: 1,
                    borderColor: 'rgba(127, 184, 216, 0.35)',
                    backgroundColor: 'rgba(13, 17, 23, 0.55)',
                  }}
                />
                <View
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    borderWidth: 1,
                    borderColor: 'rgba(127, 184, 216, 0.35)',
                    backgroundColor: 'rgba(13, 17, 23, 0.55)',
                  }}
                />
                <View
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: 0,
                    height: 3,
                    backgroundColor: 'rgba(255,255,255,0.06)',
                  }}
                />
              </View>

              <Text
                pointerEvents="none"
                style={{
                  position: 'absolute',
                  left: 10,
                  bottom: 8,
                  fontSize: 8,
                  color: it.locked ? 'rgba(230,235,240,0.55)' : 'rgba(230,235,240,0.75)',
                  letterSpacing: 0.8,
                }}
              >
                {it.locked ? 'LOCKED' : it.complete ? 'COMPLETE' : it.active ? 'PLAYING' : 'UNOPENED'}
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
  scrollX,
  onPressFolder,
}: {
  activeFolder: QueryType | null;
  gatheredInformation: any;
  scrollX: SharedValue<number>;
  onPressFolder: (id: QueryType) => void;
}) {
  const items = useMemo<VerificationFolder3DItem[]>(() => {
    const activeServices: ServiceType[] = gatheredInformation?.activeServices || [];
    const memoryFull = activeServices.length >= MEMORY_SLOT_CAPACITY;
    const isActive = (t: ServiceType) => activeServices.includes(t);

    const completeWarrant = !!gatheredInformation?.warrantCheck;
    const completeTransit = !!gatheredInformation?.transitLog;
    const completeIncident = !!gatheredInformation?.incidentHistory;

    return [
      {
        id: 'WARRANT',
        label: 'WARRANT',
        accent: '#c9a227',
        complete: completeWarrant,
        locked: !isActive('WARRANT') && memoryFull,
        active: activeFolder === 'WARRANT',
      },
      {
        id: 'TRANSIT',
        label: 'TRANSIT',
        accent: '#7fb8d8',
        complete: completeTransit,
        locked: !isActive('TRANSIT') && memoryFull,
        active: activeFolder === 'TRANSIT',
      },
      {
        id: 'INCIDENT',
        label: 'INCIDENT',
        accent: '#d4534a',
        complete: completeIncident,
        locked: !isActive('INCIDENT') && memoryFull,
        active: activeFolder === 'INCIDENT',
      },
    ];
  }, [gatheredInformation, activeFolder]);

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
    const liftY = item.active ? 0.10 : item.complete ? 0.06 : 0;

    const bodyColor = item.locked ? '#2a2f36' : '#141a21';
    const edgeColor = item.locked ? '#3a3f47' : '#223240';
    const rimColor = item.active ? item.accent : item.complete ? '#4a8a5a' : '#4a6a7a';

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
          <boxGeometry args={[1.06, 0.6, 0.1]} />
          <meshStandardMaterial color={bodyColor} roughness={0.95} metalness={0.06} />
        </mesh>

        {/* Label plate (top-right) */}
        <mesh position={[0.20, 0.18, 0.065]} castShadow receiveShadow>
          <boxGeometry args={[0.72, 0.16, 0.02]} />
          <meshStandardMaterial color={edgeColor} roughness={0.88} metalness={0.07} />
        </mesh>

        {/* Accent stripe */}
        <mesh position={[-0.505, 0.0, 0.066]}>
          <boxGeometry args={[0.05, 0.56, 0.014]} />
          <meshStandardMaterial
            color={rimColor}
            roughness={0.75}
            metalness={0.18}
            emissive={item.active ? rimColor : item.complete ? rimColor : '#000000'}
            emissiveIntensity={item.active ? 0.22 : item.complete ? 0.12 : 0}
          />
        </mesh>

        {/* Window frame */}
        <mesh position={[-0.02, -0.02, 0.064]} castShadow receiveShadow>
          <boxGeometry args={[0.78, 0.22, 0.02]} />
          <meshStandardMaterial color={'#0b0f14'} roughness={0.95} metalness={0.05} />
        </mesh>

        {/* Reels (two cylinders) */}
        <mesh position={[-0.28, -0.02, 0.075]} castShadow receiveShadow>
          <cylinderGeometry args={[0.075, 0.075, 0.016, 16]} />
          <meshStandardMaterial color={'#1c2630'} roughness={0.92} metalness={0.06} />
        </mesh>
        <mesh position={[0.24, -0.02, 0.075]} castShadow receiveShadow>
          <cylinderGeometry args={[0.075, 0.075, 0.016, 16]} />
          <meshStandardMaterial color={'#1c2630'} roughness={0.92} metalness={0.06} />
        </mesh>

        {/* Notch (write-protect cutout proxy) */}
        <mesh position={[0.52, -0.02, 0.065]} castShadow receiveShadow>
          <boxGeometry args={[0.16, 0.28, 0.02]} />
          <meshStandardMaterial color={'#0a0c0f'} roughness={0.98} metalness={0.03} />
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


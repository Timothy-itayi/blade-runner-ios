// =============================================================================
// PROCEDURAL PORTRAIT - Machine-generated human reconstruction
// =============================================================================
// Design: Data pretending to be a face. Multiple translucent layers,
// dense wireframe grids, visible geometric plates, asymmetric lighting.
// References: Observer face scanning, MGS codec, SCP reconstructions,
// Annihilation humanoid shimmer.

import React, { useRef, useMemo, useEffect, useState } from 'react';
import { View, StyleSheet, Text, Animated, LayoutChangeEvent, StyleProp, ViewStyle } from 'react-native';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Image as ExpoImage } from 'expo-image';
import { PortraitCache } from '../../utils/PortraitCache';
import { SynthesizedPortrait } from './SynthesizedPortrait';
import {
  PORTRAIT_GENERATOR_VERSION,
  PORTRAIT_HEADSET_VERSION,
  PORTRAIT_OUTPUT_SIZES,
  PortraitPreset,
  resolvePortraitFraming,
} from '../../utils/PortraitConfig';
import { getHeadAsset } from './portraitAssets';

// React Native requires @react-three/fiber/native Canvas to create a GL surface.
// The default @react-three/fiber Canvas is DOM-only and renders nothing in RN.
let NativeCanvas: React.ComponentType<any> | null = null;
try {
  NativeCanvas = require('@react-three/fiber/native').Canvas;
} catch {
  // Fallback when native not available (e.g. web or missing expo-gl)
}
import {
  generateFaceGeometry,
  getTemplateBasedGeometry,
  generateVisualTraits,
  FaceGeometry,
  SubjectVisualTraits,
} from '../../utils/faceGenerator';
import { SeededRandom } from '../../utils/seededRandom';

// =============================================================================
// SHADER MATERIALS
// =============================================================================

// Base skin layer - translucent, showing structure beneath
const skinVertexShader = `
  uniform float uTime;
  uniform float uInstability;
  
  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying float vFresnel;
  
  void main() {
    vUv = uv;
    vPosition = position;
    vNormal = normalize(normalMatrix * normal);
    
    // Fresnel for edge glow
    vec3 viewDir = normalize(cameraPosition - (modelMatrix * vec4(position, 1.0)).xyz);
    vFresnel = 1.0 - abs(dot(viewDir, vNormal));
    
    // Unstable reconstruction - stronger drift
    vec3 pos = position;
    float wave = sin(uTime * 2.5 + position.y * 8.0) * uInstability * 0.018;
    float wave2 = cos(uTime * 1.8 + position.x * 12.0) * uInstability * 0.012;
    pos.x += wave;
    pos.z += wave * 0.5 + wave2;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const skinFragmentShader = `
  uniform float uTime;
  uniform vec3 uSkinColor;
  uniform vec3 uWarmColor;
  uniform vec3 uCoolColor;
  uniform float uOpacity;
  uniform float uGridDensity;
  
  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying float vFresnel;
  
  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
  }
  
  void main() {
    float sideBias = smoothstep(-0.3, 0.3, vPosition.x);
    vec3 baseColor = mix(uWarmColor, uCoolColor, sideBias);
    // Sickly tint - data reconstruction artefact
    baseColor = mix(baseColor, vec3(0.5, 0.55, 0.48), 0.12);
    
    float gridX = abs(sin(vUv.x * uGridDensity * 3.14159));
    float gridY = abs(sin(vUv.y * uGridDensity * 3.14159));
    float grid = max(
      smoothstep(0.95, 1.0, gridX),
      smoothstep(0.95, 1.0, gridY)
    );
    float diagGrid = abs(sin((vUv.x + vUv.y) * uGridDensity * 0.7 * 3.14159));
    grid = max(grid, smoothstep(0.97, 1.0, diagGrid) * 0.5);
    
    // Horizontal data-dropout bands (unstable signal)
    float band = floor(vUv.y * 30.0 + uTime * 0.8);
    if (random(vec2(band, floor(uTime))) > 0.88) {
      baseColor *= 0.6;
    }
    
    float scanline = abs(sin(vUv.y * 220.0 + uTime * 2.5));
    scanline = smoothstep(0.75, 1.0, scanline) * 0.22;
    
    vec3 color = baseColor;
    color = mix(color, vec3(1.0), grid * 0.45);
    color += scanline * 0.12;
    color += vFresnel * vFresnel * 0.35 * mix(uWarmColor, uCoolColor, 0.5);
    
    float edgeFade = 1.0 - smoothstep(0.25, 0.48, length(vPosition.xy));
    float alpha = uOpacity * (0.3 + grid * 0.4) * edgeFade;
    alpha += vFresnel * 0.2;
    
    gl_FragColor = vec4(color, alpha);
  }
`;

// Wireframe grid layer - denser, more visible
const gridVertexShader = `
  uniform float uTime;
  uniform float uJitter;
  
  varying vec2 vUv;
  varying vec3 vPosition;
  
  void main() {
    vUv = uv;
    vPosition = position;
    
    vec3 pos = position;
    
    // Visible jitter - reconstruction instability
    float noise = sin(uTime * 6.0 + position.x * 20.0 + position.y * 15.0);
    float noise2 = cos(uTime * 4.5 + position.y * 18.0);
    pos.x += noise * uJitter * 0.012;
    pos.y += noise2 * uJitter * 0.01;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const gridFragmentShader = `
  uniform float uTime;
  uniform vec3 uGridColor;
  uniform float uOpacity;
  uniform float uCorruption;
  
  varying vec2 vUv;
  varying vec3 vPosition;
  
  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
  }
  
  void main() {
    vec3 color = uGridColor;
    float alpha = uOpacity;
    
    // Corruption dropout - more visible missing data
    float corrupt = random(floor(vUv * 20.0) + floor(uTime * 3.0));
    if (corrupt < uCorruption * 0.65) {
      alpha *= 0.15;
    }
    
    // Distance fade
    float dist = length(vPosition.xy);
    alpha *= 1.0 - smoothstep(0.35, 0.55, dist);
    
    // Pulse
    float pulse = sin(uTime * 1.5 + dist * 10.0) * 0.1 + 0.9;
    alpha *= pulse;
    
    gl_FragColor = vec4(color, alpha);
  }
`;

// Eye shader - cold, dead, slightly wrong
const eyeVertexShader = `
  varying vec2 vUv;
  varying vec3 vPosition;
  
  void main() {
    vUv = uv;
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const eyeFragmentShader = `
  uniform float uTime;
  uniform vec3 uIrisColor;
  uniform float uPupilSize;
  uniform vec2 uPupilOffset;
  uniform float uFlicker;
  uniform bool uIsDead;
  
  varying vec2 vUv;
  varying vec3 vPosition;
  
  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
  }
  
  void main() {
    vec2 center = vec2(0.5, 0.5) + uPupilOffset;
    float dist = length(vUv - center);
    
    vec3 color = vec3(0.0);
    float alpha = 0.0;
    
    // Sclera - off-white, slightly yellow/grey (unhealthy, synthetic)
    if (dist < 0.5) {
      color = vec3(0.78, 0.76, 0.72);
      alpha = 0.9;
    }
    
    // Iris
    float irisOuter = 0.35;
    float irisInner = uPupilSize;
    if (dist < irisOuter && dist > irisInner) {
      float irisT = (dist - irisInner) / (irisOuter - irisInner);
      color = mix(uIrisColor * 0.3, uIrisColor, irisT);
      
      // Iris texture - radial lines
      float angle = atan(vUv.y - center.y, vUv.x - center.x);
      float rays = sin(angle * 30.0) * 0.5 + 0.5;
      color = mix(color, uIrisColor * 1.2, rays * 0.3);
      
      alpha = 0.95;
    }
    
    // Pupil - deep black, fixed size (unnatural)
    if (dist < irisInner) {
      color = vec3(0.02);
      alpha = 1.0;
      
      // Dead eye - wrong reflections (two catchlights in wrong places)
      if (uIsDead) {
        vec2 catch1 = center + vec2(0.06, 0.09);
        vec2 catch2 = center + vec2(-0.04, 0.05);
        float d1 = length(vUv - catch1);
        float d2 = length(vUv - catch2);
        if (d1 < 0.025) color = vec3(0.45);
        if (d2 < 0.02) color = vec3(0.35);
      }
    }
    
    // Flicker/glitch - more frequent, red bleed
    float flick = random(vec2(floor(uTime * uFlicker), 0.0));
    if (flick > 0.86) {
      alpha *= 0.35;
      color = mix(color, vec3(0.9, 0.1, 0.1), 0.4);
    }
    
    // Edge fade
    alpha *= 1.0 - smoothstep(0.4, 0.5, dist);
    
    gl_FragColor = vec4(color, alpha);
  }
`;

// Geometric plate shader - visible reconstruction panels
const plateFragmentShader = `
  uniform float uTime;
  uniform vec3 uPlateColor;
  uniform float uOpacity;
  
  varying vec2 vUv;
  
  void main() {
    vec3 color = uPlateColor;
    
    // Edge highlight
    float edge = min(min(vUv.x, 1.0 - vUv.x), min(vUv.y, 1.0 - vUv.y));
    float edgeGlow = 1.0 - smoothstep(0.0, 0.15, edge);
    color += edgeGlow * 0.5;
    
    // Internal grid
    float gridX = abs(sin(vUv.x * 20.0 * 3.14159));
    float gridY = abs(sin(vUv.y * 20.0 * 3.14159));
    float grid = max(smoothstep(0.9, 1.0, gridX), smoothstep(0.9, 1.0, gridY));
    color += grid * 0.2;
    
    // Pulse
    float pulse = sin(uTime * 2.0) * 0.1 + 0.9;
    
    gl_FragColor = vec4(color, uOpacity * pulse);
  }
`;

// =============================================================================
// FACE MESH - Multi-layered reconstruction
// =============================================================================

interface FaceMeshProps {
  geometry: FaceGeometry;
  traits: SubjectVisualTraits;
  isScanning: boolean;
  scanProgress: number;
  seed: string;
}

function FaceMesh({ geometry, traits, isScanning, scanProgress, seed }: FaceMeshProps) {
  const groupRef = useRef<THREE.Group>(null);
  const skinMaterialRef = useRef<THREE.ShaderMaterial>(null);
  const gridMaterialRef = useRef<THREE.ShaderMaterial>(null);
  const eyeMaterialRefs = useRef<THREE.ShaderMaterial[]>([]);
  const plateMaterialRefs = useRef<THREE.ShaderMaterial[]>([]);
  
  const rng = useMemo(() => new SeededRandom(seed), [seed]);
  
  // Face proportions from geometry (template or procedural) — one defined base, varied per subject
  const width = 0.8 * geometry.headWidth;
  const height = 1.0 * geometry.headHeight;

  // Generate face shape geometry driven by geometry params
  const faceGeometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(width, height, 32, 40);
    const positions = geo.attributes.position;

    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);

      let z = 0;
      const distFromCenter = Math.sqrt((x / (width / 2)) ** 2 + (y / (height / 2)) ** 2);

      z = Math.max(0, 0.15 - distFromCenter * 0.3);

      if (y > 0.2 * height) {
        z += 0.03 * (1 - (Math.abs(x) / (width / 2)) * 0.5);
      }

      if (y > -0.1 * height && y < 0.15 * height && Math.abs(x) > 0.15 * width) {
        z += 0.02;
      }

      if (Math.abs(x) < geometry.noseWidth * 2 && y > -0.15 * height && y < 0.1 * height) {
        z += 0.04 * (1 - Math.abs(x) / (geometry.noseWidth * 2) * 2);
      }

      // Jaw width from geometry
      if (y < -0.2 * height) {
        const jawWidthAtY = (geometry.jawWidth * width * 0.5) * (1 - Math.abs(y + 0.2 * height) / (0.3 * height));
        if (Math.abs(x) > jawWidthAtY) {
          z = 0;
        }
      }

      z += x * geometry.asymmetryX * 0.5;
      z += y * geometry.asymmetryY * 0.3;

      positions.setZ(i, z);
    }

    geo.computeVertexNormals();
    return geo;
  }, [geometry, width, height]);

  // Wireframe grid follows face proportions
  const gridGeometry = useMemo(() => {
    const lines: number[] = [];
    const gridSize = 24;
    const w = width * 1.05;
    const h = height * 1.05;

    for (let i = 0; i <= gridSize; i++) {
      const y = -h / 2 + (i / gridSize) * h;
      const lineWidth = w * (1 - Math.abs(y / (h / 2)) * 0.35);
      lines.push(-lineWidth / 2, y, 0.01);
      lines.push(lineWidth / 2, y, 0.01);
    }

    for (let i = 0; i <= gridSize; i++) {
      const x = -w / 2 + (i / gridSize) * w;
      const lineHeight = h * (1 - Math.abs(x / (w / 2)) * 0.4);
      lines.push(x, -lineHeight / 2, 0.01);
      lines.push(x, lineHeight / 2, 0.01);
    }

    for (let i = 0; i <= gridSize / 2; i++) {
      const offset = (i / (gridSize / 2)) * w;
      lines.push(-w / 2 + offset, -h / 2, 0.005);
      lines.push(w / 2, -h / 2 + offset * (h / w), 0.005);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(lines, 3));
    return geo;
  }, [width, height]);

  // Eye positions from geometry (defined characteristics)
  const leftEyePos = useMemo(
    () =>
      [
        -geometry.eyeSpacing + geometry.leftEyeOffset.x,
        geometry.eyeHeight + geometry.leftEyeOffset.y,
        0.12,
      ] as [number, number, number],
    [geometry]
  );

  const rightEyePos = useMemo(
    () =>
      [
        geometry.eyeSpacing + geometry.rightEyeOffset.x,
        geometry.eyeHeight + geometry.rightEyeOffset.y,
        0.12,
      ] as [number, number, number],
    [geometry]
  );
  
  // Generate geometric plates (reconstruction panels)
  const plates = useMemo(() => {
    const plateList: Array<{
      position: [number, number, number];
      rotation: [number, number, number];
      scale: [number, number];
      color: string;
    }> = [];
    
    // Always have some plates visible
    const plateCount = 3 + Math.floor(rng.next() * 4);
    
    const positions = [
      { pos: [-0.28, 0.15, 0.02], rot: [0, 0.3, 0.1] },
      { pos: [0.28, 0.08, 0.02], rot: [0, -0.2, -0.05] },
      { pos: [-0.2, -0.2, 0.01], rot: [0.1, 0.2, 0.15] },
      { pos: [0.22, -0.15, 0.01], rot: [-0.05, -0.25, 0.08] },
      { pos: [0, 0.38, 0.03], rot: [0.2, 0, 0] },
      { pos: [-0.1, -0.35, 0.01], rot: [-0.1, 0.1, 0.2] },
      { pos: [0.15, 0.32, 0.02], rot: [0.15, -0.1, -0.1] },
    ];
    
    for (let i = 0; i < Math.min(plateCount, positions.length); i++) {
      const p = positions[i];
      plateList.push({
        position: p.pos as [number, number, number],
        rotation: p.rot as [number, number, number],
        scale: [0.08 + rng.next() * 0.06, 0.06 + rng.next() * 0.05],
        color: rng.bool(0.3) ? '#ffaa44' : '#44aaff',
      });
    }
    
    return plateList;
  }, [rng]);
  
  // Colors - sickly, clinical, not quite human
  const warmColor = useMemo(() => new THREE.Color('#b89a7a'), []);
  const coolColor = useMemo(() => new THREE.Color('#6a9a9a'), []);
  const skinColor = useMemo(() => new THREE.Color('#a89888'), []);
  const gridColor = useMemo(() => {
    const h = traits.primaryHue / 360;
    return new THREE.Color().setHSL(h, 0.4, 0.5);
  }, [traits.primaryHue]);
  
  // Iris - cold or slightly wrong hues; left/right can mismatch
  const leftIrisColor = useMemo(() => {
    const colors = ['#3a6c7f', '#5b7e6a', '#7b6345', '#4d5d6e', '#6f7c7d', '#5a4a6a'];
    return new THREE.Color(rng.pick(colors));
  }, [rng]);
  
  const rightIrisColor = useMemo(() => {
    const colors = ['#3a6c7f', '#5b7e6a', '#7b6345', '#4d5d6e', '#6f7c7d', '#5a4a6a'];
    return new THREE.Color(rng.pick(colors));
  }, [rng]);
  
  // Animation
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    if (skinMaterialRef.current) {
      skinMaterialRef.current.uniforms.uTime.value = time;
    }
    
    if (gridMaterialRef.current) {
      gridMaterialRef.current.uniforms.uTime.value = time;
    }
    
    eyeMaterialRefs.current.forEach(mat => {
      if (mat) mat.uniforms.uTime.value = time;
    });
    
    plateMaterialRefs.current.forEach(mat => {
      if (mat) mat.uniforms.uTime.value = time;
    });
    
    // Slight drift + irregular micro-twitch (uncanny)
    if (groupRef.current) {
      const driftY = Math.sin(time * 0.15) * 0.025;
      const driftX = Math.cos(time * 0.12) * 0.012;
      const twitch = Math.sin(time * 13.7) * Math.sin(time * 5.3) * 0.008;
      const twitchX = Math.cos(time * 11.2) * Math.sin(time * 4.1) * 0.006;
      groupRef.current.rotation.y = driftY + twitch;
      groupRef.current.rotation.x = driftX + twitchX;
    }
  });
  
  return (
    <group ref={groupRef} scale={[1.6, 1.6, 1.6]} position={[0, 0, 0]}>
      {/* Layer 1: Translucent skin surface */}
      <mesh geometry={faceGeometry}>
        <shaderMaterial
          ref={skinMaterialRef}
          vertexShader={skinVertexShader}
          fragmentShader={skinFragmentShader}
          uniforms={{
            uTime: { value: 0 },
            uSkinColor: { value: skinColor },
            uWarmColor: { value: warmColor },
            uCoolColor: { value: coolColor },
            uOpacity: { value: 0.6 },
            uGridDensity: { value: 40 },
            uInstability: { value: 1 - traits.scanStability },
          }}
          transparent
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.NormalBlending}
        />
      </mesh>
      
      {/* Layer 2: Dense wireframe grid */}
      <lineSegments geometry={gridGeometry}>
        <shaderMaterial
          ref={gridMaterialRef}
          vertexShader={gridVertexShader}
          fragmentShader={gridFragmentShader}
          uniforms={{
            uTime: { value: 0 },
            uGridColor: { value: gridColor },
            uOpacity: { value: 0.5 },
            uCorruption: { value: geometry.corruptionLevel },
            uJitter: { value: geometry.jitterAmplitude * 10 },
          }}
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>
      
      {/* Layer 3: Face outline */}
      <FaceOutline geometry={geometry} color={gridColor} />
      
      {/* Layer 4: Eyes - dead, misaligned */}
      <mesh position={leftEyePos}>
        <circleGeometry args={[0.055 * geometry.leftEyeOffset.scale, 32]} />
        <shaderMaterial
          ref={(ref) => { if (ref) eyeMaterialRefs.current[0] = ref; }}
          vertexShader={eyeVertexShader}
          fragmentShader={eyeFragmentShader}
          uniforms={{
            uTime: { value: 0 },
            uIrisColor: { value: leftIrisColor },
            uPupilSize: { value: 0.12 + traits.pupilDilation * 0.08 },
            uPupilOffset: { value: new THREE.Vector2(geometry.pupilMisalignment.left, 0.02) },
            uFlicker: { value: traits.eyeFlickerRate },
            uIsDead: { value: true },
          }}
          transparent
        />
      </mesh>
      
      <mesh position={rightEyePos}>
        <circleGeometry args={[0.055 * geometry.rightEyeOffset.scale, 32]} />
        <shaderMaterial
          ref={(ref) => { if (ref) eyeMaterialRefs.current[1] = ref; }}
          vertexShader={eyeVertexShader}
          fragmentShader={eyeFragmentShader}
          uniforms={{
            uTime: { value: 0 },
            uIrisColor: { value: rightIrisColor },
            uPupilSize: { value: 0.11 + traits.pupilDilation * 0.09 },
            uPupilOffset: { value: new THREE.Vector2(geometry.pupilMisalignment.right, -0.01) },
            uFlicker: { value: traits.eyeFlickerRate * 1.1 },
            uIsDead: { value: true },
          }}
          transparent
        />
      </mesh>
      
      {/* Layer 5: Geometric reconstruction plates */}
      {plates.map((plate, i) => (
        <mesh
          key={`plate-${i}`}
          position={plate.position}
          rotation={plate.rotation}
        >
          <planeGeometry args={plate.scale} />
          <shaderMaterial
            ref={(ref) => { if (ref) plateMaterialRefs.current[i] = ref; }}
            vertexShader={`
              varying vec2 vUv;
              void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
              }
            `}
            fragmentShader={plateFragmentShader}
            uniforms={{
              uTime: { value: 0 },
              uPlateColor: { value: new THREE.Color(plate.color) },
              uOpacity: { value: 0.3 },
            }}
            transparent
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}
      
      {/* Layer 6: Facial features (nose, mouth, brows) */}
      <FacialFeatures geometry={geometry} color={gridColor} />
      
      {/* Scan line when active */}
      {isScanning && (
        <mesh position={[0, -0.5 + scanProgress, 0.15]}>
          <planeGeometry args={[1, 0.015]} />
          <meshBasicMaterial
            color="#ffffff"
            transparent
            opacity={0.9}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}
    </group>
  );
}

// =============================================================================
// FACE OUTLINE - Wireframe head shape
// =============================================================================

function FaceOutline({ geometry, color }: { geometry: FaceGeometry; color: THREE.Color }) {
  const outlineGeometry = useMemo(() => {
    const points: number[] = [];
    const segments = 48;
    
    for (let i = 0; i <= segments; i++) {
      const t = (i / segments) * Math.PI * 2;
      let x = Math.sin(t) * 0.4 * geometry.headWidth;
      let y = Math.cos(t) * 0.5 * geometry.headHeight;
      
      // Jaw narrowing
      if (y < -0.1) {
        const jawFactor = Math.abs(y + 0.1) / 0.4;
        x *= 1 - (1 - geometry.jawWidth) * Math.min(jawFactor, 1);
      }
      
      x += geometry.asymmetryX;
      y += geometry.asymmetryY;
      
      points.push(x, y, 0.02);
    }
    
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
    return geo;
  }, [geometry]);
  
  return (
    <lineLoop geometry={outlineGeometry}>
      <lineBasicMaterial color={color} transparent opacity={0.7} />
    </lineLoop>
  );
}

// =============================================================================
// FACIAL FEATURES - Nose, mouth, brows
// =============================================================================

function FacialFeatures({ geometry, color }: { geometry: FaceGeometry; color: THREE.Color }) {
  // Nose bridge
  const noseGeometry = useMemo(() => {
    const points = [
      geometry.noseSkew, 0.08, 0.14,
      geometry.noseSkew - 0.02, 0.0, 0.13,
      geometry.noseSkew, -0.08, 0.15,
      geometry.noseSkew + 0.02, 0.0, 0.13,
      geometry.noseSkew, 0.08, 0.14,
    ];
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
    return geo;
  }, [geometry]);
  
  // Mouth
  const mouthGeometry = useMemo(() => {
    const points: number[] = [];
    const segments = 12;
    for (let i = 0; i <= segments; i++) {
      const t = (i / segments) - 0.5;
      const x = t * geometry.mouthWidth * 0.8 + geometry.mouthSkew;
      const y = -0.22 + Math.cos(t * Math.PI) * 0.01;
      points.push(x, y, 0.08);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
    return geo;
  }, [geometry]);
  
  // Eyebrows
  const leftBrowGeometry = useMemo(() => {
    const points: number[] = [];
    for (let i = 0; i <= 6; i++) {
      const t = i / 6;
      const x = -0.22 + t * 0.12;
      const y = 0.22 + Math.sin(t * Math.PI) * 0.015;
      points.push(x, y, 0.08);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
    return geo;
  }, []);
  
  const rightBrowGeometry = useMemo(() => {
    const points: number[] = [];
    for (let i = 0; i <= 6; i++) {
      const t = i / 6;
      const x = 0.1 + t * 0.12;
      const y = 0.21 + Math.sin(t * Math.PI) * 0.012;
      points.push(x, y, 0.08);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
    return geo;
  }, []);
  
  return (
    <group>
      <line geometry={noseGeometry}>
        <lineBasicMaterial color={color} transparent opacity={0.5} />
      </line>
      <line geometry={mouthGeometry}>
        <lineBasicMaterial color={color} transparent opacity={0.4} />
      </line>
      <line geometry={leftBrowGeometry}>
        <lineBasicMaterial color={color} transparent opacity={0.35} />
      </line>
      <line geometry={rightBrowGeometry}>
        <lineBasicMaterial color={color} transparent opacity={0.35} />
      </line>
    </group>
  );
}

// =============================================================================
// DATA PARTICLES - Floating fragments
// =============================================================================

function DataParticles({ seed, corruption }: { seed: string; corruption: number }) {
  const particlesRef = useRef<THREE.Points>(null);
  const rng = useMemo(() => new SeededRandom(seed + '_particles'), [seed]);
  
  const particleCount = Math.floor(40 + corruption * 60);
  
  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const angle = rng.next() * Math.PI * 2;
      const radius = 0.3 + rng.next() * 0.4;
      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = (rng.next() - 0.5) * 1.2;
      pos[i * 3 + 2] = rng.next() * 0.2 - 0.1;
    }
    return pos;
  }, [rng, particleCount]);
  
  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.z = state.clock.elapsedTime * 0.02;
      particlesRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
    }
  });
  
  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color={0x88ccff}
        size={0.006}
        transparent
        opacity={0.25}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

// =============================================================================
// PORTRAIT FRAME - Canonical framing + per-head calibration
// =============================================================================

function PortraitFrame({
  preset,
  headIndex,
  style,
  overlay,
  children,
}: {
  preset: PortraitPreset;
  headIndex: number;
  style?: any;
  overlay?: React.ReactNode;
  children: React.ReactNode;
}) {
  const [layout, setLayout] = useState({ width: 0, height: 0 });
  const framing = useMemo(() => resolvePortraitFraming(preset, headIndex), [preset, headIndex]);

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    if (width === layout.width && height === layout.height) return;
    setLayout({ width, height });
  };

  const contentStyle = useMemo<StyleProp<ViewStyle>>(() => {
    if (!layout.width || !layout.height) return styles.frameContent;
    const translateX = framing.x * layout.width;
    const translateY = framing.y * layout.height;
    const transforms: Array<{ translateX?: number; translateY?: number; scale?: number; rotate?: string }> = [
      { translateX },
      { translateY },
      { scale: framing.scale },
    ];
    if (framing.rotation) {
      transforms.push({ rotate: `${framing.rotation}deg` });
    }
    return [styles.frameContent, { transform: transforms as any }];
  }, [layout, framing]);

  return (
    <View style={[styles.container, style]} onLayout={handleLayout} collapsable={false}>
      <View style={contentStyle}>{children}</View>
      {overlay}
    </View>
  );
}

// =============================================================================
// FALLBACK - When native Canvas is unavailable (Expo Go / web)
// =============================================================================

function ProceduralPortraitFallback({
  subjectId,
  isScanning,
  scanProgress,
  style,
}: {
  subjectId: string;
  isScanning: boolean;
  scanProgress: number;
  style?: any;
}) {
  const scanLineY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isScanning) {
      scanLineY.setValue(0);
      Animated.timing(scanLineY, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }).start();
    } else {
      scanLineY.setValue(0);
    }
  }, [isScanning]);

  return (
    <View style={[styles.container, styles.fallback, style]}>
      <Text style={styles.fallbackText}>RECONSTRUCTING...</Text>
      <Text style={styles.fallbackSubtext}>SUBJECT {subjectId}</Text>
      {isScanning && (
        <Animated.View
          style={[
            styles.fallbackScanLine,
            {
              transform: [
                {
                  translateY: scanLineY.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 300],
                  }),
                },
              ],
            },
          ]}
        />
      )}
      <View style={styles.vignette} pointerEvents="none" />
    </View>
  );
}

// =============================================================================
// RAW HEAD FALLBACK - Base head image with framing
// =============================================================================

function RawHeadFallback({
  headIndex,
  preset,
  style,
  showScanLine = false,
  scanProgress = 0,
}: {
  headIndex: number;
  preset: PortraitPreset;
  style?: any;
  showScanLine?: boolean;
  scanProgress?: number;
}) {
  const overlay = (
    <>
      {showScanLine && (
        <View style={[styles.scanLineContainer, { top: `${scanProgress * 100}%` }]}>
          <View style={styles.scanLine} />
        </View>
      )}
      <View style={styles.vignette} pointerEvents="none" />
    </>
  );

  return (
    <PortraitFrame preset={preset} headIndex={headIndex} style={style} overlay={overlay}>
      <ExpoImage source={getHeadAsset(headIndex)} style={StyleSheet.absoluteFill} contentFit="cover" />
    </PortraitFrame>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================
// Geometry: either template-based (reference face + subject variation) or fully procedural.
// Renders a new face with defined characteristics via 3D mesh, not the template image.

export interface ProceduralPortraitProps {
  subjectId: string;
  subjectType?: string;
  isAnomaly?: boolean;
  isScanning?: boolean;
  scanProgress?: number;
  style?: any;
  portraitPreset?: PortraitPreset;
  outputSize?: number;
  /** Use template as geometry reference: one base face + subject variation. Default true. */
  useTemplateGeometry?: boolean;
  /** Use synthesized shader portrait. Default true. */
  useSynthesized?: boolean;
}

export function ProceduralPortrait({
  subjectId,
  subjectType,
  isAnomaly,
  isScanning = false,
  scanProgress = 0,
  style,
  portraitPreset = 'scanner',
  outputSize,
  useTemplateGeometry = true,
  useSynthesized = true,
}: ProceduralPortraitProps) {
  const [cachedUri, setCachedUri] = useState<string | null>(null);
  const [needsRender, setNeedsRender] = useState(false);
  const [, setQueueTick] = useState(0);
  const [renderFailed, setRenderFailed] = useState(false);
  const generatorVersion = PORTRAIT_GENERATOR_VERSION;
  const targetSize = outputSize || PORTRAIT_OUTPUT_SIZES[portraitPreset];

  const geometry = useMemo(
    () =>
      useTemplateGeometry
        ? getTemplateBasedGeometry(subjectId, subjectType, isAnomaly)
        : generateFaceGeometry(subjectId),
    [subjectId, subjectType, isAnomaly, useTemplateGeometry]
  );
  const traits = useMemo(
    () => generateVisualTraits(subjectId, subjectType, isAnomaly),
    [subjectId, subjectType, isAnomaly]
  );

  useEffect(() => {
    setCachedUri(null);
    setNeedsRender(false);
    setRenderFailed(false);
  }, [subjectId, generatorVersion, targetSize]);

  useEffect(() => {
    if (useSynthesized) {
      const checkCache = async () => {
        await PortraitCache.init();
        const exists = await PortraitCache.exists({
          subjectId,
          size: targetSize,
          version: generatorVersion,
          headSetVersion: PORTRAIT_HEADSET_VERSION,
        });
        if (exists) {
          setCachedUri(
            PortraitCache.getUri({
              subjectId,
              size: targetSize,
              version: generatorVersion,
              headSetVersion: PORTRAIT_HEADSET_VERSION,
            })
          );
          await PortraitCache.touch({
            subjectId,
            size: targetSize,
            version: generatorVersion,
            headSetVersion: PORTRAIT_HEADSET_VERSION,
          });
        } else {
          setNeedsRender(true);
        }
      };
      checkCache();
    }
  }, [subjectId, targetSize, generatorVersion, useSynthesized]);

  const handleCapture = async (base64: string) => {
    try {
      const uri = await PortraitCache.save(
        {
          subjectId,
          size: targetSize,
          version: generatorVersion,
          headSetVersion: PORTRAIT_HEADSET_VERSION,
        },
        base64
      );
      setCachedUri(uri);
      setNeedsRender(false);
      setRenderFailed(false);
    } catch (error) {
      console.error('Failed to cache portrait:', error);
      setRenderFailed(true);
      setNeedsRender(false);
    }
  };

  useEffect(() => {
    return PortraitCache.subscribeQueue(() => setQueueTick((tick) => tick + 1));
  }, []);

  const cacheKey = useMemo(
    () =>
      PortraitCache.getKey({
        subjectId,
        size: targetSize,
        version: generatorVersion,
        headSetVersion: PORTRAIT_HEADSET_VERSION,
      }),
    [subjectId, targetSize, generatorVersion]
  );

  const needsCapture = useSynthesized && needsRender && !isScanning;
  const hasRenderSlot = needsCapture && PortraitCache.isRenderSlotActive(cacheKey);

  useEffect(() => {
    if (!needsCapture) return;
    PortraitCache.requestRenderSlot(cacheKey);
    return () => {
      PortraitCache.releaseRenderSlot(cacheKey);
    };
  }, [needsCapture, cacheKey]);

  const overlay = (
    <>
      {isScanning && (
        <View style={[styles.scanLineContainer, { top: `${scanProgress * 100}%` }]}>
          <View style={styles.scanLine} />
        </View>
      )}
      <View style={styles.vignette} pointerEvents="none" />
    </>
  );

  const renderBaseHead = (extra?: React.ReactNode) => (
    <PortraitFrame
      preset={portraitPreset}
      headIndex={geometry.baseHeadIndex}
      style={style}
      overlay={overlay}
    >
      <>
        <ExpoImage source={getHeadAsset(geometry.baseHeadIndex)} style={StyleSheet.absoluteFill} contentFit="cover" />
        {extra}
      </>
    </PortraitFrame>
  );

  // If we have a cached image, show it (fast UI)
  if (useSynthesized && cachedUri && !isScanning) {
    return (
      <PortraitFrame
        preset={portraitPreset}
        headIndex={geometry.baseHeadIndex}
        style={style}
        overlay={overlay}
      >
        <ExpoImage
          source={{ uri: cachedUri }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
        />
      </PortraitFrame>
    );
  }

  // Live scanning view (no capture - keep deterministic cache)
  if (useSynthesized && isScanning) {
    return (
      <PortraitFrame
        preset={portraitPreset}
        headIndex={geometry.baseHeadIndex}
        style={style}
        overlay={overlay}
      >
        <SynthesizedPortrait
          geometry={geometry}
          isStatic={false}
          style={StyleSheet.absoluteFillObject}
        />
      </PortraitFrame>
    );
  }

  // Cache capture path (single render slot)
  if (useSynthesized && needsCapture) {
    if (hasRenderSlot) {
      return renderBaseHead(
        <SynthesizedPortrait
          geometry={geometry}
          onCapture={handleCapture}
          onCaptureError={() => {
            setRenderFailed(true);
            setNeedsRender(false);
          }}
          isStatic
          renderSize={targetSize}
          style={styles.captureHidden}
        />
      );
    }
    return renderBaseHead();
  }

  // If rendering failed, fall back to base head
  if (useSynthesized && renderFailed) {
    return (
      <RawHeadFallback
        headIndex={geometry.baseHeadIndex}
        preset={portraitPreset}
        style={style}
        showScanLine={isScanning}
        scanProgress={scanProgress}
      />
    );
  }

  // Legacy/Fallback/Original Wireframe Look
  if (!NativeCanvas) {
    return (
      <ProceduralPortraitFallback
        subjectId={subjectId}
        isScanning={isScanning}
        scanProgress={scanProgress}
        style={style}
      />
    );
  }

  return (
    <PortraitFrame
      preset={portraitPreset}
      headIndex={geometry.baseHeadIndex}
      style={style}
      overlay={overlay}
    >
      <NativeCanvas
        gl={{ antialias: true, alpha: true }}
        camera={{ position: [0, 0, 1.2], fov: 45 }}
        style={StyleSheet.absoluteFill}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[-2, 1, 2]} intensity={0.3} color="#ffddaa" />
        <directionalLight position={[2, 1, 2]} intensity={0.25} color="#aaddff" />
        
        <FaceMesh
          geometry={geometry}
          traits={traits}
          isScanning={isScanning}
          scanProgress={scanProgress}
          seed={subjectId}
        />
        
        <DataParticles seed={subjectId} corruption={geometry.corruptionLevel} />
      </NativeCanvas>
    </PortraitFrame>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0f14',
    overflow: 'hidden',
  },
  frameContent: {
    ...StyleSheet.absoluteFillObject,
  },
  captureHidden: {
    position: 'absolute',
    left: 0,
    top: 0,
    opacity: 0,
  },
  canvas: {
    flex: 1,
  },
  fallback: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackText: {
    fontSize: 11,
    letterSpacing: 3,
    color: 'rgba(120, 180, 200, 0.7)',
    fontWeight: '600',
  },
  fallbackSubtext: {
    fontSize: 9,
    letterSpacing: 2,
    color: 'rgba(80, 120, 140, 0.5)',
    marginTop: 8,
  },
  fallbackScanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(0, 255, 170, 0.6)',
    zIndex: 5,
  },
  vignette: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 30,
    borderColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 8,
  },
  scanLineContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 4,
    zIndex: 10,
  },
  scanLine: {
    height: 2,
    backgroundColor: '#00ffaa',
    shadowColor: '#00ffaa',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
});

export default ProceduralPortrait;

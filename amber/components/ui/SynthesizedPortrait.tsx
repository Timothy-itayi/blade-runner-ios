import React, { useMemo, useRef, useEffect, Suspense } from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { Canvas, useFrame, useThree } from '@react-three/fiber/native';
import { useTexture } from '@react-three/drei/native';
import * as THREE from 'three';
import { GLView } from 'expo-gl';
import { portraitVertexShader, portraitFragmentShader } from './PortraitShader';
import { FaceGeometry } from '../../utils/faceGenerator';
import { getHeadAsset, getOverlayAsset } from './portraitAssets';

interface SynthesizedPortraitProps {
  geometry: FaceGeometry;
  onCapture?: (base64: string) => void;
  onCaptureError?: (error: Error) => void;
  isStatic?: boolean;
  renderSize?: number;
  style?: StyleProp<ViewStyle>;
}

function PortraitMesh({ geometry, onCapture, onCaptureError, isStatic }: SynthesizedPortraitProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { gl, invalidate } = useThree();
  
  const assetModule = getHeadAsset(geometry.baseHeadIndex);
  const baseTex = useTexture(assetModule) as THREE.Texture;
  const overlayModule = getOverlayAsset(geometry.overlayVariant ?? 0);
  const overlayTex = useTexture(overlayModule) as THREE.Texture;

  useEffect(() => {
    if (baseTex) {
      baseTex.minFilter = THREE.LinearFilter;
      baseTex.magFilter = THREE.LinearFilter;
      baseTex.needsUpdate = true;
      invalidate();
    }
  }, [baseTex, invalidate]);

  useEffect(() => {
    if (overlayTex) {
      overlayTex.minFilter = THREE.LinearFilter;
      overlayTex.magFilter = THREE.LinearFilter;
      overlayTex.wrapS = THREE.RepeatWrapping;
      overlayTex.wrapT = THREE.RepeatWrapping;
      overlayTex.needsUpdate = true;
      invalidate();
    }
  }, [overlayTex, invalidate]);
  
  const uniforms = useMemo(() => {
    return {
      uBaseTex: { value: baseTex },
      uTime: { value: 0 },
      
      // Warp
      uJawTaper: { value: geometry.warp.jawTaper },
      uCheekFullness: { value: geometry.warp.cheekFullness },
      uBrowHeight: { value: geometry.warp.browHeight },
      uEyeSpacing: { value: geometry.warp.eyeSpacing },
      uNoseWidth: { value: geometry.warp.noseWidth },
      uMouthWidth: { value: geometry.warp.mouthWidth },
      
      // Tone
      uHueShift: { value: geometry.tone.hueShift },
      uSaturation: { value: geometry.tone.saturation },
      uContrast: { value: geometry.tone.contrast },
      
      // Details
      uFreckleDensity: { value: geometry.details.freckleDensity },
      uPoreStrength: { value: geometry.details.poreStrength },
      uBlemishSeed: { value: geometry.details.blemishSeed },
      
      // Cyber
      uBarcodeIndex: { value: geometry.cyber.barcodeIndex },
      uScratchIntensity: { value: geometry.cyber.scratchIntensity },
      uGlowStrength: { value: geometry.cyber.glowStrength },
      uScanlineIntensity: { value: geometry.cyber.scanlineIntensity },

      uOverlayTex: { value: overlayTex },
      uOverlayMix: { value: geometry.overlayIntensity },
      uOverlayScale: { value: geometry.overlayScale },
      uOverlayRotation: { value: geometry.overlayRotation },
    };
  }, [baseTex, overlayTex, geometry]);

  // Update texture uniform when it changes
  useEffect(() => {
    if (materialRef.current && baseTex) {
      materialRef.current.uniforms.uBaseTex.value = baseTex;
      materialRef.current.needsUpdate = true;
    }
  }, [baseTex]);

  useEffect(() => {
    if (materialRef.current && overlayTex) {
      materialRef.current.uniforms.uOverlayTex.value = overlayTex;
      materialRef.current.needsUpdate = true;
    }
  }, [overlayTex]);

  useFrame((state) => {
    if (materialRef.current && !isStatic) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  // Capture logic
  const hasAttemptedCapture = useRef(false);
  useEffect(() => {
    hasAttemptedCapture.current = false;
  }, [onCapture, geometry]);

  useEffect(() => {
    let cancelled = false;
    if (!onCapture || !baseTex || hasAttemptedCapture.current) return;
    hasAttemptedCapture.current = true;

    const performCapture = async () => {
      invalidate();
      // Wait for a few frames to ensure rendering is complete
      await new Promise(resolve => requestAnimationFrame(resolve));
      await new Promise(resolve => requestAnimationFrame(resolve));
      await new Promise(resolve => setTimeout(resolve, 200));

      try {
        const glContext = gl.getContext();
        
        const result = await GLView.takeSnapshotAsync(glContext, {
          format: 'png',
          compress: 1,
        });
        
        if (!cancelled && result.uri) {
          const FileSystem = require('expo-file-system/legacy');
          const base64 = await FileSystem.readAsStringAsync(result.uri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          onCapture(base64);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Failed to capture portrait:', err);
          onCaptureError?.(err as Error);
        }
      }
    };
    
    performCapture();
    return () => {
      cancelled = true;
    };
  }, [onCapture, onCaptureError, baseTex, gl, invalidate]);

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={portraitVertexShader}
        fragmentShader={portraitFragmentShader}
        uniforms={uniforms}
        transparent
      />
    </mesh>
  );
}

function LoadingFallback() {
  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <meshBasicMaterial color="#1a2030" />
    </mesh>
  );
}

export function SynthesizedPortrait(props: SynthesizedPortraitProps) {
  const containerStyle: ViewStyle = props.renderSize
    ? { width: props.renderSize, height: props.renderSize }
    : { flex: 1 };

  return (
    <View style={[styles.container, containerStyle, props.style]}>
      <Canvas
        gl={{
          antialias: false,
          alpha: true,
          preserveDrawingBuffer: !!props.onCapture,
          powerPreference: 'low-power',
        }}
        camera={{ position: [0, 0, 1], fov: 90 }}
        dpr={1}
        frameloop={props.isStatic ? 'demand' : 'always'}
      >
        <Suspense fallback={<LoadingFallback />}>
          <PortraitMesh {...props} />
        </Suspense>
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0a0f14',
  },
});


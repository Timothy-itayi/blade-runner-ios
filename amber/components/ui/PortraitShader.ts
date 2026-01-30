// =============================================================================
// PORTRAIT SYNTHESIS SHADER - GPU-based human reconstruction
// =============================================================================

export const portraitVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const portraitFragmentShader = `
  precision highp float;
  
  uniform sampler2D uBaseTex;
  uniform float uTime;
  
  // Warp params
  uniform float uJawTaper;
  uniform float uCheekFullness;
  uniform float uBrowHeight;
  uniform float uEyeSpacing;
  uniform float uNoseWidth;
  uniform float uMouthWidth;
  
  // Tone params
  uniform float uHueShift;
  uniform float uSaturation;
  uniform float uContrast;
  
  // Detail params
  uniform float uFreckleDensity;
  uniform float uPoreStrength;
  uniform float uBlemishSeed;
  
  // Cyber params
  uniform float uBarcodeIndex;
  uniform float uScratchIntensity;
  uniform float uGlowStrength;
  uniform float uScanlineIntensity;
  
  varying vec2 vUv;

  // Helper: Random/Noise
  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
  }

  float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }

  // UV Warp Logic
  vec2 applyWarp(vec2 uv) {
    vec2 targetUv = uv;
    vec2 center = vec2(0.5, 0.5);
    vec2 dist = uv - center;

    // Prevent edge tearing - fade warp near UV bounds
    float edgeX = smoothstep(0.02, 0.18, uv.x) * smoothstep(0.98, 0.82, uv.x);
    float edgeY = smoothstep(0.02, 0.18, uv.y) * smoothstep(0.98, 0.82, uv.y);
    float warpMask = edgeX * edgeY;
    float warpGain = mix(0.7, 1.2, noise(vec2(uBlemishSeed, 4.2)));
    float warpScale = warpMask * warpGain;

    // Jaw Taper (lower half)
    if (uv.y < 0.4) {
      float jawFactor = smoothstep(0.4, 0.0, uv.y);
      targetUv.x += dist.x * jawFactor * uJawTaper * 1.2 * warpScale;
      targetUv.y -= jawFactor * uJawTaper * 0.06 * warpScale;
    }

    // Cheek Fullness
    float cheekRegion = smoothstep(0.6, 0.4, abs(uv.x - 0.5)) * smoothstep(0.3, 0.5, uv.y) * smoothstep(0.7, 0.5, uv.y);
    targetUv.x -= dist.x * cheekRegion * uCheekFullness * 1.25 * warpScale;
    targetUv.y += cheekRegion * uCheekFullness * 0.05 * warpScale;

    // Brow Height
    if (uv.y > 0.65) {
      float browFactor = smoothstep(0.65, 0.85, uv.y);
      targetUv.y -= browFactor * uBrowHeight * 0.14 * warpScale;
    }

    // Eye Spacing
    float eyeRegionY = smoothstep(0.5, 0.65, uv.y) * smoothstep(0.8, 0.65, uv.y);
    if (abs(uv.x - 0.5) > 0.1) {
      targetUv.x += sign(uv.x - 0.5) * eyeRegionY * uEyeSpacing * 0.14 * warpScale;
    }

    // Nose Width
    float noseRegionX = smoothstep(0.15, 0.0, abs(uv.x - 0.5));
    float noseRegionY = smoothstep(0.4, 0.6, uv.y) * smoothstep(0.8, 0.6, uv.y);
    targetUv.x += dist.x * noseRegionX * noseRegionY * uNoseWidth * 1.2 * warpScale;

    // Mouth Width
    float mouthRegionY = smoothstep(0.35, 0.2, uv.y) * smoothstep(0.1, 0.2, uv.y);
    float mouthRegionX = smoothstep(0.25, 0.1, abs(uv.x - 0.5));
    targetUv.x += dist.x * mouthRegionX * mouthRegionY * uMouthWidth * 1.2 * warpScale;

    // Asymmetry bias (seeded)
    float asym = (noise(vec2(uBlemishSeed, 9.7)) - 0.5) * 0.1;
    targetUv.y += dist.x * asym * 0.2 * warpScale;
    targetUv.x += dist.y * asym * 0.12 * warpScale;

    // Micro warp - subtle per-subject field variation
    float microX = (noise(uv * 30.0 + uBlemishSeed) - 0.5) * 0.025;
    float microY = (noise(uv * 28.0 + uBlemishSeed + 7.13) - 0.5) * 0.025;
    float microScale = 0.45 + abs(uCheekFullness) * 3.0;
    targetUv += vec2(microX, microY) * microScale * warpScale;

    return targetUv;
  }

  // Color Grading
  vec3 applyTone(vec3 color) {
    // Simple Hue Shift (approximate)
    float angle = uHueShift * 3.14159;
    vec3 k = vec3(0.57735, 0.57735, 0.57735);
    float cosAngle = cos(angle);
    color = color * cosAngle + cross(k, color) * sin(angle) + k * dot(k, color) * (1.0 - cosAngle);

    // Saturation
    float luma = dot(color, vec3(0.2126, 0.7152, 0.0722));
    color = mix(vec3(luma), color, uSaturation);

    // Contrast
    color = (color - 0.5) * uContrast + 0.5;

    return color;
  }

  void main() {
    vec2 warpedUv = applyWarp(vUv);
    
    // Bounds check
    if (warpedUv.x < 0.0 || warpedUv.x > 1.0 || warpedUv.y < 0.0 || warpedUv.y > 1.0) {
      discard;
    }

    vec4 texColor = texture2D(uBaseTex, warpedUv);
    vec3 color = texColor.rgb;
    float alpha = texColor.a;

    // 1. Details: Freckles
    float freckleNoise = noise(vUv * 50.0 + uBlemishSeed);
    float freckleMask = smoothstep(0.7, 0.9, freckleNoise);
    // Limit freckles to cheek/nose area
    float freckleZone = smoothstep(0.3, 0.1, abs(vUv.x - 0.5)) * smoothstep(0.4, 0.6, vUv.y) * smoothstep(0.8, 0.6, vUv.y);
    color = mix(color, color * 0.6, freckleMask * uFreckleDensity * freckleZone);

    // 2. Details: Pores (high frequency noise)
    float poreNoise = random(vUv * 200.0);
    color *= (1.0 - poreNoise * uPoreStrength * 0.1);

    // 3. Cyber: Barcode/Stamps
    if (uBarcodeIndex > 0.0) {
      // Small vertical stripes on neck or cheek
      vec2 barcodePos = vUv - vec2(0.2, 0.2);
      if (abs(barcodePos.x) < 0.05 && abs(barcodePos.y) < 0.02) {
        float stripe = step(0.5, sin(barcodePos.x * 500.0 + uBarcodeIndex));
        color = mix(color, vec3(0.0), stripe * 0.7);
      }
    }

    // 4. Cyber: Scratches
    float scratch = noise(vUv * vec2(100.0, 1.0) + uTime * 0.01);
    scratch = smoothstep(0.95, 1.0, scratch);
    color += scratch * uScratchIntensity * 0.3;

    // 5. Tone
    color = applyTone(color);

    // 6. Scanlines
    float scanline = sin(vUv.y * 800.0) * 0.5 + 0.5;
    color *= (1.0 - scanline * uScanlineIntensity * 0.2);

    // 7. Glow (additive)
    color += color * uGlowStrength * 0.2;

    gl_FragColor = vec4(color, alpha);
  }
`;

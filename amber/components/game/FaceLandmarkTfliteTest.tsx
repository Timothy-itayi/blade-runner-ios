import React, { useEffect, useMemo, useRef, useState } from 'react';
import { LayoutChangeEvent, ScrollView, StyleSheet, Text, View, StyleProp, ViewStyle } from 'react-native';
import { Tensor, useTensorflowModel } from 'react-native-fast-tflite';
import {
  AlphaType,
  Canvas,
  ColorType,
  Fill,
  Group,
  Image as SkiaImage,
  ImageShader,
  LinearGradient,
  RadialGradient,
  Path,
  Shader,
  Skia,
  useImage,
  vec,
} from '@shopify/react-native-skia';
import { SeededRandom } from '../../utils/seededRandom';

type SupportedTypedArray =
  | Float32Array
  | Float64Array
  | Int8Array
  | Int16Array
  | Int32Array
  | Uint8Array
  | Uint16Array
  | Uint32Array
  | BigInt64Array
  | BigUint64Array;

type RunSummary = {
  inputShape: string;
  inputType: Tensor['dataType'];
  normalization: string;
  landmarksNormalized: string;
  outputShapes: string;
  outputTypes: string;
  outputLength: number;
  landmarkCount: number | null;
  landmarkSample: string;
  runCount: number;
  segmentationShape: string;
};

type ImageRun = {
  key: string;
  label: string;
  baseImageId: string;
  seed: string;
  archetype: 'human' | 'cyborg' | 'uncanny';
  imageStatus: string;
  imageSize: string;
  crop: string;
  originalSize: string;
  inputSize: string;
  cropSource: 'center' | 'landmarks' | 'segmentation';
  landmarksNormalized: string;
  presence: number | null;
  outputLength: number;
  landmarkCount: number | null;
  landmarkSample: string;
  previewImage: ReturnType<typeof useImage> | null;
  maskImage: ReturnType<typeof useImage> | null;
  edgeImage: ReturnType<typeof useImage> | null;
  inputWidth: number;
  inputHeight: number;
  landmarks: Array<{ x: number; y: number; z: number }>;
};

const MODEL_ASSET = require('../../models/face_landmark.tflite');
const SEGMENT_MODEL_ASSET = require('../../models/selfie_segmentation.tflite');
const IMAGE_SOURCES = [
  {
    key: 'neutral',
    label: 'neutral-expression',
    archetype: 'human' as const,
    asset: require('../../assets/ai-portraits/timothy_itayi_neutral_expression_facing_camera_head_and_shoul_0f9d1137-478a-44d0-bd39-d600c34db2cc_3.png'),
  },
  {
    key: 'cyborg',
    label: 'cyborg-implants',
    archetype: 'cyborg' as const,
    asset: require('../../assets/ai-portraits/timothy_itayi_human_cyborg_hybrid_partial_facial_implants_exp_c337c6ba-b3cb-4046-9554-357c27634711_3.png'),
  },
  {
    key: 'uncanny',
    label: 'uncanny',
    archetype: 'uncanny' as const,
    asset: require('../../assets/ai-portraits/timothy_itayi_synthetic_human_replicant_slightly_uncanny_feat_5902affe-5785-43a1-8928-41222ec93cbe_3.png'),
  },
  {
    key: 'alien',
    label: 'alien-texture',
    asset: require('../../assets/ai-portraits/timothy_itayi_humanoid_alien_unfamiliar_skin_texture_slightly_4ef3b708-c23a-48b3-bd36-fac8be599008_1.png'),
  },
  {
    key: 'robot',
    label: 'robot-plates',
    asset: require('../../assets/ai-portraits/timothy_itayi_humanoid_robot_face_plates_and_seams_visible_me_b66526ea-6817-4949-9792-8be4981abf9e_0.png'),
  },
];
const ACTIVE_SOURCES = IMAGE_SOURCES.slice(0, 3);
const TEXTURE_KEYS = [
  'blueMetalDiff',
  'blueMetalDisp',
  'leatherRed',
  'rockWallDiff',
  'rockWallDisp',
  'concrete206',
  'grunge336',
  'grunge342',
  'inkPaint399',
  'metal264',
  'metal295',
  'soil125',
  'soil130',
  'soil146',
  'stone165',
] as const;

type TextureKey = (typeof TEXTURE_KEYS)[number];

const TEXTURE_ASSETS: Record<TextureKey, number> = {
  blueMetalDiff: require('../../assets/textures/blue_metal_plate_diff_1k.jpg'),
  blueMetalDisp: require('../../assets/textures/blue_metal_plate_disp_1k.png'),
  leatherRed: require('../../assets/textures/leather_red_02_coll1_1k.png'),
  rockWallDiff: require('../../assets/textures/rock_wall_16_diff_1k.jpg'),
  rockWallDisp: require('../../assets/textures/rock_wall_16_disp_1k.png'),
  concrete206: require('../../assets/textures/Texturelabs_Concrete_206S.jpg'),
  grunge336: require('../../assets/textures/Texturelabs_Grunge_336S.jpg'),
  grunge342: require('../../assets/textures/Texturelabs_Grunge_342S.jpg'),
  inkPaint399: require('../../assets/textures/Texturelabs_InkPaint_399S.jpg'),
  metal264: require('../../assets/textures/Texturelabs_Metal_264S.jpg'),
  metal295: require('../../assets/textures/Texturelabs_Metal_295S.jpg'),
  soil125: require('../../assets/textures/Texturelabs_Soil_125S.jpg'),
  soil130: require('../../assets/textures/Texturelabs_Soil_130S.jpg'),
  soil146: require('../../assets/textures/Texturelabs_Soil_146S.jpg'),
  stone165: require('../../assets/textures/Texturelabs_Stone_165S.jpg'),
};

const TEXTURE_POOL_PRIMARY: Record<'human' | 'cyborg' | 'uncanny', TextureKey[]> = {
  human: [
    'leatherRed',
    'grunge336',
    'grunge342',
    'inkPaint399',
    'concrete206',
    'soil125',
    'soil130',
    'soil146',
    'stone165',
    'rockWallDiff',
    'rockWallDisp',
  ],
  cyborg: ['metal264', 'metal295', 'blueMetalDiff', 'blueMetalDisp'],
  uncanny: ['soil146'],
};
const TEXTURE_POOL_SECONDARY: Record<'human' | 'cyborg' | 'uncanny', TextureKey[]> = {
  human: [
    'grunge336',
    'grunge342',
    'inkPaint399',
    'concrete206',
    'soil125',
    'soil130',
    'soil146',
    'stone165',
  ],
  cyborg: ['metal295', 'metal264', 'blueMetalDiff'],
  uncanny: ['soil146'],
};
const PREVIEW_WIDTH = 120;
const CROP_TWEAK = {
  scale: 1.12,
  offsetX: 0,
  offsetY: -0.06,
};
const FACE_PRESENCE_THRESHOLD = -5;
const SEGMENTATION_THRESHOLD = 0.35;
const SEGMENTATION_PADDING = {
  x: 0.12,
  top: 0.12,
  bottom: 0.22,
};
const LANDMARK_PADDING = {
  x: 0.32,
  top: 0.38,
  bottom: 0.48,
};

const FACE_OVAL_INDICES = [
  10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378,
  400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21,
  54, 103, 67, 109,
];

const EDGE_SETTINGS = {
  strength: 1.9,
  threshold: 0.18,
  softness: 0.06,
};
const USE_GPU_EDGES = false;
const USE_TEXTURE_OVERLAY = true;
const SHOW_LANDMARK_OVERLAY = false;
const EDGE_BLEND = {
  fine: 0.75,
  mid: 0.55,
  coarse: 0.5,
  dog: 0.7,
  threshold: 0.8,
  thresholdLevel: 0.22,
  thresholdSoftness: 0.07,
};
const ARCHETYPE_EDGE_SCALE: Record<'human' | 'cyborg' | 'uncanny', number> = {
  human: 0.9,
  cyborg: 1.7,
  uncanny: 1.1,
};
const ARCHETYPE_EDGE_BIAS: Record<'human' | 'cyborg' | 'uncanny', Partial<typeof EDGE_BLEND>> = {
  human: { threshold: 0.6, dog: 0.4 },
  cyborg: { threshold: 0.95, coarse: 0.65, dog: 0.8 },
  uncanny: { threshold: 0.75, dog: 0.6 },
};
const ARCHETYPE_EDGE_OPACITY: Record<'human' | 'cyborg' | 'uncanny', number> = {
  human: 0.32,
  cyborg: 0.55,
  uncanny: 0.42,
};
const ARCHETYPE_EDGE_BLEND_MODE: Record<'human' | 'cyborg' | 'uncanny', 'multiply' | 'softLight'> = {
  human: 'softLight',
  cyborg: 'multiply',
  uncanny: 'multiply',
};
const ARCHETYPE_TINT: Record<
  'human' | 'cyborg' | 'uncanny',
  { color: string; opacity: number; blendMode: 'softLight' | 'overlay' | 'multiply' | 'screen' }
> = {
  human: { color: '#9bb37a', opacity: 0.24, blendMode: 'multiply' },
  cyborg: { color: '#1f2430', opacity: 0.35, blendMode: 'multiply' },
  uncanny: { color: '#e9e3ef', opacity: 0.22, blendMode: 'screen' },
};
const ARCHETYPE_TEXTURE_STRENGTH: Record<'human' | 'cyborg' | 'uncanny', number> = {
  human: 0.45,
  cyborg: 0.65,
  uncanny: 0.52,
};
const ARCHETYPE_TINT_SECOND: Record<
  'human' | 'cyborg' | 'uncanny',
  { color: string; opacity: number; blendMode: 'color' | 'overlay' | 'softLight' }
> = {
  human: { color: '#6d8b5a', opacity: 0.18, blendMode: 'color' },
  cyborg: { color: '#5aa5b8', opacity: 0.24, blendMode: 'color' },
  uncanny: { color: '#b8a0d8', opacity: 0.2, blendMode: 'color' },
};
const ARCHETYPE_TEXTURE_SECOND_STRENGTH: Record<'human' | 'cyborg' | 'uncanny', number> = {
  human: 0.22,
  cyborg: 0.45,
  uncanny: 0.26,
};
const ARCHETYPE_LIGHTING: Record<
  'human' | 'cyborg' | 'uncanny',
  {
    warm: string;
    cool: string;
    shadow: string;
    highlight: string;
    colorOpacity: number;
    shadowOpacity: number;
    highlightOpacity: number;
  }
> = {
  human: {
    warm: '#e6d7a2',
    cool: '#8fa86f',
    shadow: '#141a12',
    highlight: '#fff0bf',
    colorOpacity: 0.45,
    shadowOpacity: 0.38,
    highlightOpacity: 0.3,
  },
  cyborg: {
    warm: '#f1b98c',
    cool: '#6cc8ff',
    shadow: '#131a24',
    highlight: '#ffe0b8',
    colorOpacity: 0.42,
    shadowOpacity: 0.3,
    highlightOpacity: 0.22,
  },
  uncanny: {
    warm: '#e8d6e8',
    cool: '#c8d6e8',
    shadow: '#1d2330',
    highlight: '#f0e8f5',
    colorOpacity: 0.06,
    shadowOpacity: 0.02,
    highlightOpacity: 0.04,
  },
};
const HUMAN_FACE_EFFECTS = {
  blotchOpacity: 0.18,
  underEyeOpacity: 0.35,
  cheekOpacity: 0.28,
  underEyeColor: 'rgba(20, 24, 18, 0.85)',
  cheekColor: 'rgba(162, 94, 94, 0.85)',
  noseBridgeColor: 'rgba(255, 244, 200, 0.9)',
};
const UNCANNY_FACE_EFFECTS = {
  eyeTintColor: 'rgba(160, 200, 160, 0.85)',
  lipTintColor: 'rgba(140, 90, 170, 0.75)',
  eyeTintOpacity: 0.18,
  lipTintOpacity: 0.22,
  soilOpacity: 0.6,
  stoneOpacity: 0.45,
  waxOpacity: 0.1,
  eyeGlowOpacity: 0.35,
  eyeSheenOpacity: 0.25,
  eyeGlowColor: 'rgba(196, 168, 96, 0.9)',
  eyeSheenBright: 'rgba(240, 205, 120, 0.95)',
  eyeSheenDark: 'rgba(120, 90, 50, 0.6)',
};

const SOBEL_SHADER = Skia.RuntimeEffect.Make(`
uniform shader image;
uniform shader mask;
uniform float2 size;
uniform float strength;
uniform float threshold;
uniform float softness;
uniform float mixAmount;

float luma(float2 p) {
  half4 c = image.eval(p);
  return dot(c.rgb, float3(0.299, 0.587, 0.114));
}

half4 main(float2 p) {
  float2 texel = 1.0 / size;
  float gx = 0.0;
  float gy = 0.0;

  gx += -1.0 * luma(p + float2(-texel.x, -texel.y));
  gx +=  1.0 * luma(p + float2( texel.x, -texel.y));
  gx += -2.0 * luma(p + float2(-texel.x, 0.0));
  gx +=  2.0 * luma(p + float2( texel.x, 0.0));
  gx += -1.0 * luma(p + float2(-texel.x, texel.y));
  gx +=  1.0 * luma(p + float2( texel.x, texel.y));

  gy += -1.0 * luma(p + float2(-texel.x, -texel.y));
  gy += -2.0 * luma(p + float2(0.0, -texel.y));
  gy += -1.0 * luma(p + float2(texel.x, -texel.y));
  gy +=  1.0 * luma(p + float2(-texel.x, texel.y));
  gy +=  2.0 * luma(p + float2(0.0, texel.y));
  gy +=  1.0 * luma(p + float2(texel.x, texel.y));

  float mag = clamp(sqrt(gx * gx + gy * gy) * strength, 0.0, 1.0);
  float hardEdge = smoothstep(threshold - softness, threshold + softness, mag);
  float edge = mix(mag, hardEdge, mixAmount);
  float m = clamp(mask.eval(p).r, 0.0, 1.0);
  float value = edge * m;
  return half4(value, value, value, value);
}
`);

const FACEMESH_LIPS: Array<[number, number]> = [
  [61, 146], [146, 91], [91, 181], [181, 84], [84, 17],
  [17, 314], [314, 405], [405, 321], [321, 375], [375, 291],
  [61, 185], [185, 40], [40, 39], [39, 37], [37, 0],
  [0, 267], [267, 269], [269, 270], [270, 409], [409, 291],
  [78, 95], [95, 88], [88, 178], [178, 87], [87, 14],
  [14, 317], [317, 402], [402, 318], [318, 324], [324, 308],
  [78, 191], [191, 80], [80, 81], [81, 82], [82, 13],
  [13, 312], [312, 311], [311, 310], [310, 415], [415, 308],
];

const FACEMESH_IRISES: Array<[number, number]> = [
  [474, 475], [475, 476], [476, 477], [477, 474],
  [469, 470], [470, 471], [471, 472], [472, 469],
];

const FACEMESH_NOSE: Array<[number, number]> = [
  [168, 6], [6, 197], [197, 195], [195, 5], [5, 4], [4, 1],
  [1, 19], [19, 94], [94, 2], [98, 97], [97, 2], [2, 326],
  [326, 327], [327, 294], [294, 278], [278, 344], [344, 440],
  [440, 275], [275, 4], [4, 45], [45, 220], [220, 115],
  [115, 48], [48, 64], [64, 98],
];

const FACEMESH_CONTOURS: Array<[number, number]> = [
  [61, 146], [146, 91], [91, 181], [181, 84], [84, 17],
  [17, 314], [314, 405], [405, 321], [321, 375],
  [375, 291], [61, 185], [185, 40], [40, 39], [39, 37],
  [37, 0], [0, 267], [267, 269], [269, 270], [270, 409], [409, 291],
  [78, 95], [95, 88], [88, 178], [178, 87], [87, 14],
  [14, 317], [317, 402], [402, 318], [318, 324], [324, 308],
  [78, 191], [191, 80], [80, 81], [81, 82], [82, 13],
  [13, 312], [312, 311], [311, 310], [310, 415], [415, 308],
  [263, 249], [249, 390], [390, 373], [373, 374], [374, 380],
  [380, 381], [381, 382], [382, 362], [263, 466], [466, 388],
  [388, 387], [387, 386], [386, 385], [385, 384], [384, 398], [398, 362],
  [33, 7], [7, 163], [163, 144], [144, 145], [145, 153],
  [153, 154], [154, 155], [155, 133], [33, 246], [246, 161],
  [161, 160], [160, 159], [159, 158], [158, 157], [157, 173], [173, 133],
  [276, 283], [283, 282], [282, 295], [295, 285], [300, 293],
  [293, 334], [334, 296], [296, 336],
  [46, 53], [53, 52], [52, 65], [65, 55], [70, 63], [63, 105],
  [105, 66], [66, 107],
  [10, 338], [338, 297], [297, 332], [332, 284], [284, 251],
  [251, 389], [389, 356], [356, 454], [454, 323], [323, 361],
  [361, 288], [288, 397], [397, 365], [365, 379], [379, 378],
  [378, 400], [400, 377], [377, 152], [152, 148], [148, 176],
  [176, 149], [149, 150], [150, 136], [136, 172], [172, 58],
  [58, 132], [132, 93], [93, 234], [234, 127], [127, 162],
  [162, 21], [21, 54], [54, 103], [103, 67], [67, 109], [109, 10],
];

const formatShape = (shape?: number[]) => {
  if (!shape || shape.length === 0) return '[]';
  return `[${shape.join(', ')}]`;
};

const getNormalizationLabel = (dataType: Tensor['dataType']) => {
  switch (dataType) {
    case 'float16':
      return 'float16 (zero-filled, no encoder)';
    case 'float32':
    case 'float64':
      return 'float 0..1';
    case 'uint8':
      return 'uint8 0..255';
    case 'int8':
      return 'int8 -128..127';
    case 'int16':
      return 'int16 -32768..32767';
    case 'int32':
      return 'int32 (scaled)';
    case 'int64':
      return 'int64 (zero-filled)';
    case 'bool':
      return 'bool 0|1';
    default:
      return 'unknown (zero-filled)';
  }
};

const createTypedArrayForDataType = (dataType: Tensor['dataType'], length: number): SupportedTypedArray => {
  switch (dataType) {
    case 'float32':
      return new Float32Array(length);
    case 'float64':
      return new Float64Array(length);
    case 'float16':
      return new Uint16Array(length);
    case 'uint8':
      return new Uint8Array(length);
    case 'int8':
      return new Int8Array(length);
    case 'int16':
      return new Int16Array(length);
    case 'int32':
      return new Int32Array(length);
    case 'int64':
      return new BigInt64Array(length);
    case 'bool':
      return new Uint8Array(length);
    default:
      return new Float32Array(length);
  }
};

const encodeValue = (normalized: number, dataType: Tensor['dataType']): number | bigint => {
  switch (dataType) {
    case 'float32':
    case 'float64':
      return normalized;
    case 'uint8':
      return Math.round(normalized * 255);
    case 'int8':
      return Math.round(normalized * 255) - 128;
    case 'int16':
      return Math.round(normalized * 65535) - 32768;
    case 'int32':
      return Math.round(normalized * 2147483647);
    case 'bool':
      return normalized > 0.5 ? 1 : 0;
    case 'int64':
      return BigInt(0);
    case 'float16':
    default:
      return 0;
  }
};

const buildSyntheticInput = (inputTensor: Tensor) => {
  const sanitizedShape = inputTensor.shape.map((dim) => (dim && dim > 0 ? dim : 1));
  const length = sanitizedShape.reduce((acc, dim) => acc * dim, 1);
  const buffer = createTypedArrayForDataType(inputTensor.dataType, length);

  const layout = (() => {
    if (sanitizedShape.length >= 4) {
      const last = sanitizedShape[sanitizedShape.length - 1];
      const thirdLast = sanitizedShape[sanitizedShape.length - 3];
      if ([1, 3, 4].includes(last)) return 'nhwc';
      if ([1, 3, 4].includes(thirdLast)) return 'nchw';
    }
    return 'flat';
  })();

  const batch = sanitizedShape.length >= 4 ? sanitizedShape[0] : 1;
  const height = layout === 'nhwc'
    ? sanitizedShape[sanitizedShape.length - 3]
    : layout === 'nchw'
      ? sanitizedShape[sanitizedShape.length - 2]
      : 1;
  const width = layout === 'nhwc'
    ? sanitizedShape[sanitizedShape.length - 2]
    : layout === 'nchw'
      ? sanitizedShape[sanitizedShape.length - 1]
      : 1;
  const channels = layout === 'nhwc'
    ? sanitizedShape[sanitizedShape.length - 1]
    : layout === 'nchw'
      ? sanitizedShape[sanitizedShape.length - 3]
      : 1;

  const isBigInt = inputTensor.dataType === 'int64';
  for (let b = 0; b < batch; b++) {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        for (let c = 0; c < channels; c++) {
          const normalized =
            c === 0
              ? x / Math.max(1, width - 1)
              : c === 1
                ? y / Math.max(1, height - 1)
                : c === 2
                  ? 0.5
                  : 1.0;
          const value = encodeValue(normalized, inputTensor.dataType);
          let idx = 0;
          if (layout === 'nhwc') {
            idx = (((b * height + y) * width + x) * channels + c);
          } else if (layout === 'nchw') {
            idx = (((b * channels + c) * height + y) * width + x);
          } else {
            idx = ((b * height + y) * width + x);
          }

          if (isBigInt) {
            (buffer as BigInt64Array)[idx] = value as bigint;
          } else {
            (buffer as Exclude<SupportedTypedArray, BigInt64Array | BigUint64Array>)[idx] = value as number;
          }
        }
      }
    }
  }

  return {
    buffer,
    normalization: getNormalizationLabel(inputTensor.dataType),
    imageStatus: 'synthetic',
    imageSize: 'n/a',
    crop: 'n/a',
    originalSize: 'n/a',
    inputSize: `${width}x${height}`,
    inputWidth: width,
    inputHeight: height,
    previewImage: null,
  };
};

const float32ToFloat16 = (value: number) => {
  const floatView = new Float32Array(1);
  const intView = new Int32Array(floatView.buffer);
  floatView[0] = value;
  const x = intView[0];
  const sign = (x >> 16) & 0x8000;
  const mantissa = x & 0x7fffff;
  const exp = (x >> 23) & 0xff;

  if (exp === 0xff) {
    return sign | 0x7c00 | (mantissa ? 1 : 0);
  }

  const halfExp = exp - 127 + 15;
  if (halfExp >= 0x1f) {
    return sign | 0x7c00;
  }
  if (halfExp <= 0) {
    if (halfExp < -10) return sign;
    const shift = 14 - halfExp;
    const halfMantissa = (mantissa | 0x800000) >> shift;
    return sign | halfMantissa;
  }

  return sign | (halfExp << 10) | (mantissa >> 13);
};

type CropRect = { x: number; y: number; width: number; height: number };

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const computeCropRect = (
  srcWidth: number,
  srcHeight: number,
  targetAspect: number
): CropRect => {
  const srcAspect = srcWidth / srcHeight;
  let cropWidth = srcWidth;
  let cropHeight = srcHeight;
  if (srcAspect > targetAspect) {
    cropWidth = srcHeight * targetAspect;
  } else {
    cropHeight = srcWidth / targetAspect;
  }
  cropWidth /= Math.max(0.5, CROP_TWEAK.scale);
  cropHeight /= Math.max(0.5, CROP_TWEAK.scale);
  let cropX = (srcWidth - cropWidth) / 2 + CROP_TWEAK.offsetX * srcWidth;
  let cropY = (srcHeight - cropHeight) / 2 + CROP_TWEAK.offsetY * srcHeight;
  cropX = Math.max(0, Math.min(cropX, srcWidth - cropWidth));
  cropY = Math.max(0, Math.min(cropY, srcHeight - cropHeight));
  return { x: cropX, y: cropY, width: cropWidth, height: cropHeight };
};

const computeLandmarkBBox = (
  landmarks: Array<{ x: number; y: number; z: number }>,
  indices: number[]
) => {
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;
  let found = false;
  for (const idx of indices) {
    const point = landmarks[idx];
    if (!point) continue;
    found = true;
    minX = Math.min(minX, point.x);
    minY = Math.min(minY, point.y);
    maxX = Math.max(maxX, point.x);
    maxY = Math.max(maxY, point.y);
  }
  if (!found) return null;
  return { minX, minY, maxX, maxY };
};

const refineCropFromLandmarks = (
  initialCrop: CropRect,
  bbox: { minX: number; minY: number; maxX: number; maxY: number },
  inputWidth: number,
  inputHeight: number,
  srcWidth: number,
  srcHeight: number,
  targetAspect: number
): CropRect => {
  const scaleX = initialCrop.width / inputWidth;
  const scaleY = initialCrop.height / inputHeight;
  const faceMinX = initialCrop.x + bbox.minX * scaleX;
  const faceMaxX = initialCrop.x + bbox.maxX * scaleX;
  const faceMinY = initialCrop.y + bbox.minY * scaleY;
  const faceMaxY = initialCrop.y + bbox.maxY * scaleY;

  let width = faceMaxX - faceMinX;
  let height = faceMaxY - faceMinY;

  const padX = width * LANDMARK_PADDING.x;
  const padTop = height * LANDMARK_PADDING.top;
  const padBottom = height * LANDMARK_PADDING.bottom;

  let cropX = faceMinX - padX;
  let cropY = faceMinY - padTop;
  width += padX * 2;
  height += padTop + padBottom;

  const currentAspect = width / height;
  if (currentAspect > targetAspect) {
    const desiredHeight = width / targetAspect;
    const delta = desiredHeight - height;
    cropY -= delta / 2;
    height = desiredHeight;
  } else {
    const desiredWidth = height * targetAspect;
    const delta = desiredWidth - width;
    cropX -= delta / 2;
    width = desiredWidth;
  }

  cropX = clamp(cropX, 0, srcWidth - width);
  cropY = clamp(cropY, 0, srcHeight - height);
  width = Math.min(width, srcWidth);
  height = Math.min(height, srcHeight);

  return { x: cropX, y: cropY, width, height };
};

const computeMaskBoundingBox = (
  mask: Float32Array,
  width: number,
  height: number,
  threshold: number
) => {
  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;
  let found = false;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const value = mask[y * width + x];
      if (value >= threshold) {
        found = true;
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (!found) return null;
  return { minX, minY, maxX, maxY };
};

const computeCropRectFromSegmentation = (
  bbox: { minX: number; minY: number; maxX: number; maxY: number },
  segWidth: number,
  segHeight: number,
  srcWidth: number,
  srcHeight: number,
  targetAspect: number
): CropRect => {
  const minX = (bbox.minX / segWidth) * srcWidth;
  const maxX = (bbox.maxX / segWidth) * srcWidth;
  const minY = (bbox.minY / segHeight) * srcHeight;
  const maxY = (bbox.maxY / segHeight) * srcHeight;

  let width = maxX - minX;
  let height = maxY - minY;

  const padX = width * SEGMENTATION_PADDING.x;
  const padTop = height * SEGMENTATION_PADDING.top;
  const padBottom = height * SEGMENTATION_PADDING.bottom;

  let cropX = minX - padX;
  let cropY = minY - padTop;
  width += padX * 2;
  height += padTop + padBottom;

  const currentAspect = width / height;
  if (currentAspect > targetAspect) {
    const desiredHeight = width / targetAspect;
    const delta = desiredHeight - height;
    cropY -= delta / 2;
    height = desiredHeight;
  } else {
    const desiredWidth = height * targetAspect;
    const delta = desiredWidth - width;
    cropX -= delta / 2;
    width = desiredWidth;
  }

  cropX = clamp(cropX, 0, srcWidth - width);
  cropY = clamp(cropY, 0, srcHeight - height);
  width = Math.min(width, srcWidth);
  height = Math.min(height, srcHeight);

  return { x: cropX, y: cropY, width, height };
};

const buildInputFromImage = (
  image: ReturnType<typeof useImage>,
  inputTensor: Tensor,
  cropRect?: CropRect
) => {
  if (!image) return null;

  const sanitizedShape = inputTensor.shape.map((dim) => (dim && dim > 0 ? dim : 1));
  const layout = (() => {
    if (sanitizedShape.length >= 4) {
      const last = sanitizedShape[sanitizedShape.length - 1];
      const thirdLast = sanitizedShape[sanitizedShape.length - 3];
      if ([1, 3, 4].includes(last)) return 'nhwc';
      if ([1, 3, 4].includes(thirdLast)) return 'nchw';
    }
    return 'flat';
  })();

  const height = layout === 'nhwc'
    ? sanitizedShape[sanitizedShape.length - 3]
    : layout === 'nchw'
      ? sanitizedShape[sanitizedShape.length - 2]
      : sanitizedShape[sanitizedShape.length - 2] ?? 1;
  const width = layout === 'nhwc'
    ? sanitizedShape[sanitizedShape.length - 2]
    : layout === 'nchw'
      ? sanitizedShape[sanitizedShape.length - 1]
      : sanitizedShape[sanitizedShape.length - 1] ?? 1;
  const channels = layout === 'nhwc'
    ? sanitizedShape[sanitizedShape.length - 1]
    : layout === 'nchw'
      ? sanitizedShape[sanitizedShape.length - 3]
      : sanitizedShape[sanitizedShape.length - 1] ?? 1;

  const surface = Skia.Surface.MakeOffscreen(width, height) ?? Skia.Surface.Make(width, height);
  if (!surface) {
    return null;
  }

  const srcWidth = image.width();
  const srcHeight = image.height();
  const targetAspect = width / height;
  const crop = cropRect ?? computeCropRect(srcWidth, srcHeight, targetAspect);

  const canvas = surface.getCanvas();
  const paint = Skia.Paint();
  const srcRect = Skia.XYWHRect(crop.x, crop.y, crop.width, crop.height);
  const dstRect = Skia.XYWHRect(0, 0, width, height);
  canvas.clear(Skia.Color('#000'));
  canvas.drawImageRect(image, srcRect, dstRect, paint);
  surface.flush();

  const snapshot = surface.makeImageSnapshot();
  const imageInfo = {
    width,
    height,
    colorType: ColorType.RGBA_8888,
    alphaType: AlphaType.Premul,
  };
  const pixels = snapshot.readPixels(0, 0, imageInfo);
  if (!pixels || !(pixels instanceof Uint8Array)) {
    return null;
  }
  const previewImage = Skia.Image.MakeImage(
    imageInfo,
    Skia.Data.fromBytes(pixels),
    width * 4
  );

  const batch = sanitizedShape.length >= 4 ? sanitizedShape[0] : 1;
  const length = batch * width * height * channels;
  const buffer = createTypedArrayForDataType(inputTensor.dataType, length);
  const normalization = getNormalizationLabel(inputTensor.dataType);
  const isBigInt = inputTensor.dataType === 'int64';

  const readRGB = (index: number) => {
    const r = pixels[index];
    const g = pixels[index + 1];
    const b = pixels[index + 2];
    return { r, g, b };
  };

  for (let b = 0; b < batch; b++) {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const base = (y * width + x) * 4;
        const { r, g, b: blue } = readRGB(base);
        const a = pixels[base + 3];
        const pixel = [r, g, blue, a];
        const grayscale = Math.round((r + g + blue) / 3);

        for (let c = 0; c < channels; c++) {
          const rawValue = channels === 1 ? grayscale : (pixel[c] ?? pixel[2]);
          const normalized = rawValue / 255;
          let encoded: number | bigint;

          switch (inputTensor.dataType) {
            case 'float16':
              encoded = float32ToFloat16(normalized);
              break;
            case 'float32':
            case 'float64':
              encoded = normalized;
              break;
            case 'uint8':
              encoded = rawValue;
              break;
            case 'int8':
              encoded = Math.round(normalized * 255) - 128;
              break;
            case 'int16':
              encoded = Math.round(normalized * 65535) - 32768;
              break;
            case 'int32':
              encoded = Math.round(normalized * 2147483647);
              break;
            case 'bool':
              encoded = normalized > 0.5 ? 1 : 0;
              break;
            case 'int64':
              encoded = BigInt(0);
              break;
            default:
              encoded = normalized;
              break;
          }

          let idx = 0;
          if (layout === 'nhwc') {
            idx = (((b * height + y) * width + x) * channels + c);
          } else if (layout === 'nchw') {
            idx = (((b * channels + c) * height + y) * width + x);
          } else {
            idx = (((b * height + y) * width + x) * channels + c);
          }

          if (isBigInt) {
            (buffer as BigInt64Array)[idx] = encoded as bigint;
          } else {
            (buffer as Exclude<SupportedTypedArray, BigInt64Array | BigUint64Array>)[idx] = encoded as number;
          }
        }
      }
    }
  }

  return {
    buffer,
    normalization,
    imageStatus: 'asset',
    imageSize: `${image.width()}x${image.height()}`,
    crop: `${Math.round(crop.width)}x${Math.round(crop.height)}@${Math.round(crop.x)},${Math.round(crop.y)}`,
    originalSize: `${Math.round(srcWidth)}x${Math.round(srcHeight)}`,
    inputSize: `${width}x${height}`,
    inputWidth: width,
    inputHeight: height,
    previewImage: previewImage ?? null,
    pixels,
  };
};

const resolveTensorDims = (tensor: Tensor) => {
  const shape = tensor.shape.map((dim) => (dim && dim > 0 ? dim : 1));
  if (shape.length >= 4) {
    const last = shape[shape.length - 1];
    const thirdLast = shape[shape.length - 3];
    if ([1, 2, 3, 4].includes(last)) {
      return {
        width: shape[shape.length - 2],
        height: shape[shape.length - 3],
        channels: last,
      };
    }
    if ([1, 2, 3, 4].includes(thirdLast)) {
      return {
        width: shape[shape.length - 1],
        height: shape[shape.length - 2],
        channels: thirdLast,
      };
    }
  }
  return { width: shape[shape.length - 2] ?? 1, height: shape[shape.length - 1] ?? 1, channels: 1 };
};

const buildSegmentationMask = (
  output: SupportedTypedArray | undefined,
  outputTensor: Tensor | undefined
) => {
  if (!output || !outputTensor) return null;
  const { width, height, channels } = resolveTensorDims(outputTensor);
  const mask = new Float32Array(width * height);
  for (let i = 0; i < width * height; i++) {
    const offset = i * channels;
    let value = 0;
    if (channels === 1) {
      value = Number(output[offset]);
    } else {
      value = Number(output[offset + (channels - 1)]);
    }
    mask[i] = Math.max(0, Math.min(1, value));
  }
  return { mask, width, height };
};

const sampleSegMaskForCrop = (
  mask: Float32Array,
  segWidth: number,
  segHeight: number,
  srcWidth: number,
  srcHeight: number,
  crop: CropRect,
  outWidth: number,
  outHeight: number
) => {
  const result = new Float32Array(outWidth * outHeight);
  for (let y = 0; y < outHeight; y++) {
    const origY = crop.y + ((y + 0.5) / outHeight) * crop.height;
    const segY = clamp(Math.round((origY / srcHeight) * segHeight), 0, segHeight - 1);
    for (let x = 0; x < outWidth; x++) {
      const origX = crop.x + ((x + 0.5) / outWidth) * crop.width;
      const segX = clamp(Math.round((origX / srcWidth) * segWidth), 0, segWidth - 1);
      result[y * outWidth + x] = mask[segY * segWidth + segX];
    }
  }
  return result;
};

const buildMaskImage = (mask: Float32Array, width: number, height: number) => {
  const rgba = new Uint8Array(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    const value = Math.round(Math.max(0, Math.min(1, mask[i])) * 255);
    const idx = i * 4;
    rgba[idx] = value;
    rgba[idx + 1] = value;
    rgba[idx + 2] = value;
    rgba[idx + 3] = value;
  }
  return Skia.Image.MakeImage(
    {
      width,
      height,
      colorType: ColorType.RGBA_8888,
      alphaType: AlphaType.Premul,
    },
    Skia.Data.fromBytes(rgba),
    width * 4
  );
};

const buildLandmarkMaskImage = (
  landmarks: Array<{ x: number; y: number; z: number }>,
  width: number,
  height: number
) => {
  if (!landmarks.length) return null;
  const surface = Skia.Surface.MakeOffscreen(width, height) ?? Skia.Surface.Make(width, height);
  if (!surface) return null;
  const canvas = surface.getCanvas();
  canvas.clear(Skia.Color('#000'));
  const path = Skia.Path.Make();
  const first = landmarks[FACE_OVAL_INDICES[0]];
  if (!first) return null;
  path.moveTo(first.x, first.y);
  for (let i = 1; i < FACE_OVAL_INDICES.length; i++) {
    const point = landmarks[FACE_OVAL_INDICES[i]];
    if (point) {
      path.lineTo(point.x, point.y);
    }
  }
  path.close();
  const paint = Skia.Paint();
  paint.setColor(Skia.Color('#fff'));
  canvas.drawPath(path, paint);
  surface.flush();
  return surface.makeImageSnapshot();
};

const buildLandmarkMask = (
  landmarks: Array<{ x: number; y: number; z: number }>,
  width: number,
  height: number
) => {
  const image = buildLandmarkMaskImage(landmarks, width, height);
  if (!image) return { maskImage: null, maskArray: null };
  const imageInfo = {
    width,
    height,
    colorType: ColorType.RGBA_8888,
    alphaType: AlphaType.Premul,
  };
  const pixels = image.readPixels(0, 0, imageInfo);
  if (!pixels || !(pixels instanceof Uint8Array)) {
    return { maskImage: image, maskArray: null };
  }
  const maskArray = new Float32Array(width * height);
  for (let i = 0; i < width * height; i++) {
    maskArray[i] = pixels[i * 4] / 255;
  }
  return { maskImage: image, maskArray };
};

const computeSobelEdges = (
  pixels: Uint8Array,
  width: number,
  height: number,
  mask: Float32Array,
  step: number
) => {
  const out = new Float32Array(width * height);
  const getGray = (x: number, y: number) => {
    const idx = (y * width + x) * 4;
    const r = pixels[idx];
    const g = pixels[idx + 1];
    const b = pixels[idx + 2];
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  };
  for (let y = step; y < height - step; y++) {
    for (let x = step; x < width - step; x++) {
      const gx = (
        -1 * getGray(x - step, y - step) +
        1 * getGray(x + step, y - step) +
        -2 * getGray(x - step, y) +
        2 * getGray(x + step, y) +
        -1 * getGray(x - step, y + step) +
        1 * getGray(x + step, y + step)
      );
      const gy = (
        -1 * getGray(x - step, y - step) +
        -2 * getGray(x, y - step) +
        -1 * getGray(x + step, y - step) +
        1 * getGray(x - step, y + step) +
        2 * getGray(x, y + step) +
        1 * getGray(x + step, y + step)
      );
      const magnitude = Math.min(1, Math.sqrt(gx * gx + gy * gy));
      out[y * width + x] = magnitude * mask[y * width + x];
    }
  }
  return out;
};

const blurGray = (pixels: Uint8Array, width: number, height: number, radius: number) => {
  const out = new Float32Array(width * height);
  const getGray = (x: number, y: number) => {
    const idx = (y * width + x) * 4;
    const r = pixels[idx];
    const g = pixels[idx + 1];
    const b = pixels[idx + 2];
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  };
  const size = radius * 2 + 1;
  const denom = size * size;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let sum = 0;
      for (let ky = -radius; ky <= radius; ky++) {
        const yy = clamp(y + ky, 0, height - 1);
        for (let kx = -radius; kx <= radius; kx++) {
          const xx = clamp(x + kx, 0, width - 1);
          sum += getGray(xx, yy);
        }
      }
      out[y * width + x] = sum / denom;
    }
  }
  return out;
};

const computeDoG = (
  pixels: Uint8Array,
  width: number,
  height: number,
  mask: Float32Array
) => {
  const small = blurGray(pixels, width, height, 1);
  const large = blurGray(pixels, width, height, 3);
  const out = new Float32Array(width * height);
  for (let i = 0; i < width * height; i++) {
    const value = Math.abs(small[i] - large[i]);
    out[i] = Math.min(1, value) * mask[i];
  }
  return out;
};

const thresholdEdges = (
  edges: Float32Array,
  width: number,
  height: number,
  threshold: number,
  softness: number
) => {
  const out = new Float32Array(width * height);
  for (let i = 0; i < width * height; i++) {
    const value = edges[i];
    const low = threshold - softness;
    const high = threshold + softness;
    const t = clamp((value - low) / Math.max(0.0001, high - low), 0, 1);
    out[i] = t;
  }
  return out;
};

const blendEdges = (
  fine: Float32Array,
  mid: Float32Array,
  coarse: Float32Array,
  dog: Float32Array,
  thresholded: Float32Array,
  width: number,
  height: number,
  weights: typeof EDGE_BLEND
) => {
  const out = new Float32Array(width * height);
  for (let i = 0; i < width * height; i++) {
    const value =
      fine[i] * weights.fine +
      mid[i] * weights.mid +
      coarse[i] * weights.coarse +
      dog[i] * weights.dog +
      thresholded[i] * weights.threshold;
    out[i] = Math.min(1, value);
  }
  return out;
};

const resolveEdgeWeights = (archetype: ImageRun['archetype']) => {
  const scale = ARCHETYPE_EDGE_SCALE[archetype];
  const bias = ARCHETYPE_EDGE_BIAS[archetype];
  return {
    fine: (bias.fine ?? EDGE_BLEND.fine) * scale,
    mid: (bias.mid ?? EDGE_BLEND.mid) * scale,
    coarse: (bias.coarse ?? EDGE_BLEND.coarse) * scale,
    dog: (bias.dog ?? EDGE_BLEND.dog) * scale,
    threshold: (bias.threshold ?? EDGE_BLEND.threshold) * scale,
    thresholdLevel: bias.thresholdLevel ?? EDGE_BLEND.thresholdLevel,
    thresholdSoftness: bias.thresholdSoftness ?? EDGE_BLEND.thresholdSoftness,
  };
};

const buildEdgeImage = (edges: Float32Array, width: number, height: number) => {
  const rgba = new Uint8Array(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    const value = Math.round(Math.max(0, Math.min(1, edges[i])) * 255);
    const idx = i * 4;
    rgba[idx] = value;
    rgba[idx + 1] = value;
    rgba[idx + 2] = value;
    rgba[idx + 3] = value;
  }
  return Skia.Image.MakeImage(
    {
      width,
      height,
      colorType: ColorType.RGBA_8888,
      alphaType: AlphaType.Premul,
    },
    Skia.Data.fromBytes(rgba),
    width * 4
  );
};
const buildPath = (
  landmarks: Array<{ x: number; y: number; z: number }>,
  inputWidth: number,
  inputHeight: number,
  previewWidth: number,
  previewHeight: number,
  connections: Array<[number, number]>
) => {
  if (!landmarks.length || !inputWidth || !inputHeight) return null;
  const scaleX = previewWidth / inputWidth;
  const scaleY = previewHeight / inputHeight;
  const path = Skia.Path.Make();
  for (const [start, end] of connections) {
    const a = landmarks[start];
    const b = landmarks[end];
    if (!a || !b) continue;
    path.moveTo(a.x * scaleX, a.y * scaleY);
    path.lineTo(b.x * scaleX, b.y * scaleY);
  }
  return path;
};

const buildFaceOvalPath = (
  landmarks: Array<{ x: number; y: number; z: number }>,
  inputWidth: number,
  inputHeight: number,
  previewWidth: number,
  previewHeight: number
) => {
  if (!landmarks.length || !inputWidth || !inputHeight) return null;
  const scaleX = previewWidth / inputWidth;
  const scaleY = previewHeight / inputHeight;
  const path = Skia.Path.Make();
  const first = landmarks[FACE_OVAL_INDICES[0]];
  if (!first) return null;
  path.moveTo(first.x * scaleX, first.y * scaleY);
  for (let i = 1; i < FACE_OVAL_INDICES.length; i++) {
    const point = landmarks[FACE_OVAL_INDICES[i]];
    if (point) {
      path.lineTo(point.x * scaleX, point.y * scaleY);
    }
  }
  path.close();
  return path;
};

const summarizeLandmarks = (output: SupportedTypedArray | undefined, shape?: number[]) => {
  if (!output) {
    return { landmarkCount: null, landmarkSample: 'no output' };
  }
  const length = output.length;
  let count: number | null = null;
  if (shape && shape.length > 0) {
    const last = shape[shape.length - 1];
    if (last === 3) {
      count = Math.floor(length / 3);
    }
  }
  if (count == null && length % 3 === 0) {
    count = Math.floor(length / 3);
  }

  if (!count || count <= 0) {
    return { landmarkCount: null, landmarkSample: 'unrecognized output' };
  }

  const sampleCount = Math.min(3, count);
  const samples: string[] = [];
  for (let i = 0; i < sampleCount; i++) {
    const base = i * 3;
    const x = Number(output[base + 0]).toFixed(4);
    const y = Number(output[base + 1]).toFixed(4);
    const z = Number(output[base + 2]).toFixed(4);
    samples.push(`(${x}, ${y}, ${z})`);
  }

  return { landmarkCount: count, landmarkSample: samples.join(' ') };
};

const extractLandmarkOutputs = (
  outputs: SupportedTypedArray[],
  outputTensors: Tensor[]
) => {
  let landmarks: SupportedTypedArray | undefined;
  let presence: SupportedTypedArray | undefined;
  for (const output of outputs) {
    if (!output) continue;
    if (output.length >= 1000) {
      landmarks = output;
    } else if (output.length === 1) {
      presence = output;
    }
  }
  if (!landmarks && outputs.length > 0) {
    landmarks = outputs[0];
  }
  const presenceValue = presence ? Number(presence[0]) : null;
  return { landmarks, presenceValue };
};

type FaceLandmarkTfliteTestProps = {
  scanProgress?: number;
  isScanning?: boolean;
  mode?: 'panel' | 'portrait';
  activeIndex?: number;
  style?: StyleProp<ViewStyle>;
};

export function FaceLandmarkTfliteTest({
  scanProgress = 0,
  isScanning = false,
  mode = 'panel',
  activeIndex = 0,
  style,
}: FaceLandmarkTfliteTestProps) {
  const modelState = useTensorflowModel(MODEL_ASSET);
  const segmentationState = useTensorflowModel(SEGMENT_MODEL_ASSET);
  const [summary, setSummary] = useState<RunSummary | null>(null);
  const [runs, setRuns] = useState<ImageRun[]>([]);
  const runStageRef = useRef<'none' | 'landmarks' | 'segmentation'>('none');
  const [portraitLayout, setPortraitLayout] = useState({ width: 0, height: 0 });
  const imageNeutral = useImage(ACTIVE_SOURCES[0].asset);
  const imageCyborg = useImage(ACTIVE_SOURCES[1].asset);
  const imageUncanny = useImage(ACTIVE_SOURCES[2].asset);
  const textureBlueMetalDiff = useImage(TEXTURE_ASSETS.blueMetalDiff);
  const textureBlueMetalDisp = useImage(TEXTURE_ASSETS.blueMetalDisp);
  const textureLeatherRed = useImage(TEXTURE_ASSETS.leatherRed);
  const textureRockWallDiff = useImage(TEXTURE_ASSETS.rockWallDiff);
  const textureRockWallDisp = useImage(TEXTURE_ASSETS.rockWallDisp);
  const textureConcrete206 = useImage(TEXTURE_ASSETS.concrete206);
  const textureGrunge336 = useImage(TEXTURE_ASSETS.grunge336);
  const textureGrunge342 = useImage(TEXTURE_ASSETS.grunge342);
  const textureInkPaint399 = useImage(TEXTURE_ASSETS.inkPaint399);
  const textureMetal264 = useImage(TEXTURE_ASSETS.metal264);
  const textureMetal295 = useImage(TEXTURE_ASSETS.metal295);
  const textureSoil125 = useImage(TEXTURE_ASSETS.soil125);
  const textureSoil130 = useImage(TEXTURE_ASSETS.soil130);
  const textureSoil146 = useImage(TEXTURE_ASSETS.soil146);
  const textureStone165 = useImage(TEXTURE_ASSETS.stone165);

  const textureLookup = useMemo(
    () => ({
      blueMetalDiff: textureBlueMetalDiff,
      blueMetalDisp: textureBlueMetalDisp,
      leatherRed: textureLeatherRed,
      rockWallDiff: textureRockWallDiff,
      rockWallDisp: textureRockWallDisp,
      concrete206: textureConcrete206,
      grunge336: textureGrunge336,
      grunge342: textureGrunge342,
      inkPaint399: textureInkPaint399,
      metal264: textureMetal264,
      metal295: textureMetal295,
      soil125: textureSoil125,
      soil130: textureSoil130,
      soil146: textureSoil146,
      stone165: textureStone165,
    }),
    [
      textureBlueMetalDiff,
      textureBlueMetalDisp,
      textureLeatherRed,
      textureRockWallDiff,
      textureRockWallDisp,
      textureConcrete206,
      textureGrunge336,
      textureGrunge342,
      textureInkPaint399,
      textureMetal264,
      textureMetal295,
      textureSoil125,
      textureSoil130,
      textureSoil146,
      textureStone165,
    ]
  );

  const texturePools = useMemo(
    () => ({
      human: {
        primary: TEXTURE_POOL_PRIMARY.human.map((key) => textureLookup[key]).filter(Boolean),
        secondary: TEXTURE_POOL_SECONDARY.human.map((key) => textureLookup[key]).filter(Boolean),
      },
      cyborg: {
        primary: TEXTURE_POOL_PRIMARY.cyborg.map((key) => textureLookup[key]).filter(Boolean),
        secondary: TEXTURE_POOL_SECONDARY.cyborg.map((key) => textureLookup[key]).filter(Boolean),
      },
      uncanny: {
        primary: TEXTURE_POOL_PRIMARY.uncanny.map((key) => textureLookup[key]).filter(Boolean),
        secondary: TEXTURE_POOL_SECONDARY.uncanny.map((key) => textureLookup[key]).filter(Boolean),
      },
    }),
    [textureLookup]
  );
  const resolveTextureRecipe = (seed: string, archetype: ImageRun['archetype']) => {
    const pools = texturePools[archetype];
    const rng = new SeededRandom(`${seed}_texture`);
    const pick = (pool: Array<ReturnType<typeof useImage> | null>) => {
      const available = pool.filter(Boolean) as Array<NonNullable<ReturnType<typeof useImage>>>;
      if (!available.length) return null;
      return available[rng.int(0, available.length - 1)];
    };
    const primary = pick(pools.primary);
    let secondary = pick(pools.secondary);
    if (secondary && primary && secondary === primary && pools.secondary.length > 1) {
      secondary = pick(pools.secondary);
    }
    return {
      primary,
      secondary,
      primaryRepeat: rng.bool(0.8),
      secondaryRepeat: rng.bool(0.6),
      primaryScale: rng.range(0.25, 0.55),
      secondaryScale: rng.range(0.35, 0.75),
      primaryOpacity: rng.range(0.8, 1.1),
      secondaryOpacity: rng.range(0.7, 0.95),
    };
  };
  const images = useMemo(
    () => [
      {
        ...ACTIVE_SOURCES[0],
        image: imageNeutral,
      },
      {
        ...ACTIVE_SOURCES[1],
        image: imageCyborg,
      },
      {
        ...ACTIVE_SOURCES[2],
        image: imageUncanny,
      },
    ],
    [
      imageCyborg,
      imageNeutral,
      imageUncanny,
    ]
  );

  const inputInfo = useMemo(() => {
    if (modelState.state !== 'loaded') return null;
    return modelState.model.inputs[0];
  }, [modelState]);
  const segmentationInfo = useMemo(() => {
    if (segmentationState.state !== 'loaded') return null;
    return segmentationState.model.outputs[0];
  }, [segmentationState]);

  useEffect(() => {
    if (modelState.state !== 'loaded') return;
    if (images.some((source) => !source.image)) return;
    const segmentationReady = segmentationState.state === 'loaded';
    if (segmentationReady && runStageRef.current === 'segmentation') return;
    if (!segmentationReady && runStageRef.current === 'landmarks') return;
    runStageRef.current = segmentationReady ? 'segmentation' : 'landmarks';

    const model = modelState.model;
    const segmentModel = segmentationReady ? segmentationState.model : null;
    const inputTensor = model.inputs[0];
    if (!inputTensor) {
      console.warn('[TFLite] No input tensors found for face_landmark.tflite');
      return;
    }

    const outputTensors = model.outputs;
    const outputTensor = outputTensors[0];
    const outputShapes = outputTensors.map((tensor) => formatShape(tensor.shape)).join(' | ');
    const outputTypes = outputTensors.map((tensor) => tensor.dataType).join(' | ');
    const segmentationOutput = segmentModel?.outputs[0];
    const segmentationShape = segmentationOutput ? formatShape(segmentationOutput.shape) : 'loading';

    const runResults: ImageRun[] = [];
    let sampleSummary: Omit<RunSummary, 'runCount'> | null = null;

    const landmarkDims = resolveTensorDims(inputTensor);
    const targetAspect = landmarkDims.width / landmarkDims.height;

    for (const source of images) {
      const image = source.image;
      if (!image) {
        continue;
      }
      const archetype = source.archetype ?? 'human';
      const srcWidth = image.width();
      const srcHeight = image.height();
      const fullRect: CropRect = { x: 0, y: 0, width: srcWidth, height: srcHeight };

      const segMask = (() => {
        if (!segmentModel || !segmentationOutput) return null;
        const segmentInput = buildInputFromImage(image, segmentModel.inputs[0], fullRect);
        const segBuffer = segmentInput?.buffer ?? buildSyntheticInput(segmentModel.inputs[0]).buffer;
        const segOutputs = segmentModel.runSync([segBuffer]) as SupportedTypedArray[];
        const segData = segOutputs[0];
        return buildSegmentationMask(segData, segmentationOutput);
      })();

      let cropSource: ImageRun['cropSource'] = 'center';
      const cropRect = (() => {
        if (segMask) {
          const bbox = computeMaskBoundingBox(segMask.mask, segMask.width, segMask.height, SEGMENTATION_THRESHOLD);
          if (bbox) {
            cropSource = 'segmentation';
            return computeCropRectFromSegmentation(
              bbox,
              segMask.width,
              segMask.height,
              srcWidth,
              srcHeight,
              targetAspect
            );
          }
        }
        return computeCropRect(srcWidth, srcHeight, targetAspect);
      })();

      const initialInput = buildInputFromImage(source.image, inputTensor, cropRect);
      const initialBuffer = initialInput?.buffer ?? buildSyntheticInput(inputTensor).buffer;
      const initialOutputs = model.runSync([initialBuffer]) as SupportedTypedArray[];
      const { landmarks: initialLandmarksRaw, presenceValue: initialPresence } = extractLandmarkOutputs(initialOutputs, outputTensors);

      let refinedCrop = cropRect;
      if (initialLandmarksRaw && initialPresence != null && initialPresence >= FACE_PRESENCE_THRESHOLD) {
        const points: Array<{ x: number; y: number; z: number }> = [];
        for (let i = 0; i + 2 < initialLandmarksRaw.length; i += 3) {
          points.push({
            x: Number(initialLandmarksRaw[i]),
            y: Number(initialLandmarksRaw[i + 1]),
            z: Number(initialLandmarksRaw[i + 2]),
          });
        }
        const maxX = Math.max(...points.map((p) => p.x));
        const maxY = Math.max(...points.map((p) => p.y));
        const normalized = maxX <= 2 && maxY <= 2;
        const adjustedPoints = normalized
          ? points.map((p) => ({
              x: p.x * landmarkDims.width,
              y: p.y * landmarkDims.height,
              z: p.z,
            }))
          : points;
        const bbox = computeLandmarkBBox(adjustedPoints, FACE_OVAL_INDICES);
        if (bbox) {
          refinedCrop = refineCropFromLandmarks(
            cropRect,
            bbox,
            landmarkDims.width,
            landmarkDims.height,
            srcWidth,
            srcHeight,
            targetAspect
          );
          cropSource = 'landmarks';
        }
      }

      const imageInput = buildInputFromImage(image, inputTensor, refinedCrop);
      const {
        buffer,
        normalization,
        imageStatus,
        imageSize,
        crop,
        originalSize,
        inputSize,
        inputWidth,
        inputHeight,
        previewImage,
      } = imageInput ?? buildSyntheticInput(inputTensor);

      const outputs = model.runSync([buffer]) as SupportedTypedArray[];
      const { landmarks: outputLandmarksRaw, presenceValue } = extractLandmarkOutputs(outputs, outputTensors);
      const outputData = outputLandmarksRaw ?? outputs[0];
      const { landmarkCount, landmarkSample } = summarizeLandmarks(outputData, outputTensor?.shape);

      const points: Array<{ x: number; y: number; z: number }> = [];
      let maxX = 0;
      let maxY = 0;
      if (outputData) {
        for (let i = 0; i + 2 < outputData.length; i += 3) {
          const x = Number(outputData[i]);
          const y = Number(outputData[i + 1]);
          const z = Number(outputData[i + 2]);
          points.push({ x, y, z });
          if (x > maxX) maxX = x;
          if (y > maxY) maxY = y;
        }
      }
      const normalized = maxX <= 2 && maxY <= 2;
      const normalizedLabel = normalized ? 'yes' : 'no';
      if (normalized && inputWidth && inputHeight) {
        for (const point of points) {
          point.x *= inputWidth;
          point.y *= inputHeight;
        }
      }

      let maskImage: ReturnType<typeof useImage> | null = null;
      let maskArray: Float32Array | null = null;
      if (segMask) {
        const resizedMask = sampleSegMaskForCrop(
          segMask.mask,
          segMask.width,
          segMask.height,
          srcWidth,
          srcHeight,
          refinedCrop,
          inputWidth,
          inputHeight
        );
        maskArray = resizedMask;
        maskImage = buildMaskImage(resizedMask, inputWidth, inputHeight);
      } else {
        const fallback = buildLandmarkMask(points, inputWidth, inputHeight);
        maskImage = fallback.maskImage;
        maskArray = fallback.maskArray;
      }

      let edgeImage: ReturnType<typeof useImage> | null = null;
      if (!USE_GPU_EDGES && maskArray && imageInput?.pixels) {
        const fine = computeSobelEdges(imageInput.pixels, inputWidth, inputHeight, maskArray, 1);
        const mid = computeSobelEdges(imageInput.pixels, inputWidth, inputHeight, maskArray, 2);
        const coarse = computeSobelEdges(imageInput.pixels, inputWidth, inputHeight, maskArray, 3);
        const dog = computeDoG(imageInput.pixels, inputWidth, inputHeight, maskArray);
        const weights = resolveEdgeWeights(archetype);
        const thresholded = thresholdEdges(
          fine,
          inputWidth,
          inputHeight,
          weights.thresholdLevel,
          weights.thresholdSoftness
        );
        const blended = blendEdges(fine, mid, coarse, dog, thresholded, inputWidth, inputHeight, weights);
        edgeImage = buildEdgeImage(blended, inputWidth, inputHeight);
      }

      const seed = `${source.key}_${archetype}`;
      runResults.push({
        key: source.key,
        label: source.label,
        baseImageId: source.key,
        seed,
        archetype,
        imageStatus,
        imageSize,
        crop,
        originalSize,
        inputSize,
        cropSource,
        landmarksNormalized: normalizedLabel,
        presence: presenceValue,
        outputLength: outputData?.length ?? 0,
        landmarkCount,
        landmarkSample,
        previewImage,
        maskImage,
        edgeImage,
        inputWidth,
        inputHeight,
        landmarks: points,
      });

      console.log(`[TFLite] image: ${source.label} ${imageStatus} ${imageSize}`);
      console.log(`[TFLite] crop: ${crop} (${cropSource})`);
      console.log(`[TFLite] presence: ${presenceValue ?? 'n/a'}`);
      console.log(`[TFLite] output length: ${outputData?.length ?? 0}`);
      if (landmarkCount) {
        console.log(`[TFLite] landmarks: ${landmarkCount} sample ${landmarkSample}`);
      } else {
        console.log('[TFLite] landmark parsing failed');
      }

      if (!sampleSummary) {
        sampleSummary = {
          inputShape: formatShape(inputTensor.shape),
          inputType: inputTensor.dataType,
          normalization,
          landmarksNormalized: normalizedLabel,
          outputShapes,
          outputTypes,
          outputLength: outputData?.length ?? 0,
          landmarkCount,
          landmarkSample,
          segmentationShape,
        };
      }
    }

    setRuns(runResults);
    if (sampleSummary) {
      setSummary({ ...sampleSummary, runCount: runResults.length });
    }

    console.log('[TFLite] face_landmark.tflite loaded');
    console.log(`[TFLite] input: ${inputTensor.dataType} ${formatShape(inputTensor.shape)} (${runResults[0]?.landmarksNormalized ?? 'n/a'})`);
    console.log(`[TFLite] output: ${outputTypes} ${outputShapes}`);
    console.log(`[TFLite] segmentation output: ${segmentationShape}`);
  }, [images, modelState, segmentationState]);

  if (modelState.state === 'loading') {
    return (
      <View style={styles.panel}>
        <Text style={styles.title}>TFLite Face Landmark</Text>
        <Text style={styles.line}>MODEL LOADING</Text>
      </View>
    );
  }

  if (modelState.state === 'error') {
    return (
      <View style={styles.panel}>
        <Text style={styles.title}>TFLite Face Landmark</Text>
        <Text style={styles.error}>MODEL ERROR</Text>
        <Text style={styles.line}>{modelState.error.message}</Text>
      </View>
    );
  }
  if (images.some((source) => !source.image)) {
    return (
      <View style={styles.panel}>
        <Text style={styles.title}>TFLite Face Landmark</Text>
        <Text style={styles.line}>IMAGES LOADING</Text>
        <Text style={styles.line}>{ACTIVE_SOURCES.length} portraits</Text>
      </View>
    );
  }
  if (segmentationState.state === 'error') {
    return (
      <View style={styles.panel}>
        <Text style={styles.title}>TFLite Face Landmark</Text>
        <Text style={styles.error}>SEGMENTATION ERROR</Text>
        <Text style={styles.line}>{segmentationState.error.message}</Text>
      </View>
    );
  }

  if (mode === 'portrait') {
    const portraitRun = runs.length ? runs[activeIndex % runs.length] : null;
    const handleLayout = (event: LayoutChangeEvent) => {
      const { width, height } = event.nativeEvent.layout;
      if (width === portraitLayout.width && height === portraitLayout.height) return;
      setPortraitLayout({ width, height });
    };
    const renderWidth = portraitLayout.width;
    const renderHeight = portraitLayout.height;

    return (
      <View style={[styles.portraitContainer, style]} onLayout={handleLayout}>
        {portraitRun && renderWidth > 0 && renderHeight > 0 ? (
          (() => {
            const previewWidth = renderWidth;
            const previewHeight = renderHeight;
            const contourPath = buildPath(
              portraitRun.landmarks,
              portraitRun.inputWidth,
              portraitRun.inputHeight,
              previewWidth,
              previewHeight,
              FACEMESH_CONTOURS
            );
            const lipPath = buildPath(
              portraitRun.landmarks,
              portraitRun.inputWidth,
              portraitRun.inputHeight,
              previewWidth,
              previewHeight,
              FACEMESH_LIPS
            );
            const nosePath = buildPath(
              portraitRun.landmarks,
              portraitRun.inputWidth,
              portraitRun.inputHeight,
              previewWidth,
              previewHeight,
              FACEMESH_NOSE
            );
            const irisPath = buildPath(
              portraitRun.landmarks,
              portraitRun.inputWidth,
              portraitRun.inputHeight,
              previewWidth,
              previewHeight,
              FACEMESH_IRISES
            );
            const faceOvalPath = buildFaceOvalPath(
              portraitRun.landmarks,
              portraitRun.inputWidth,
              portraitRun.inputHeight,
              previewWidth,
              previewHeight
            );
            const featureEdgePath = (() => {
              if (!irisPath && !lipPath && !nosePath) return null;
              const path = Skia.Path.Make();
              if (irisPath) path.addPath(irisPath);
              if (lipPath) path.addPath(lipPath);
              if (nosePath) path.addPath(nosePath);
              return path;
            })();
            const humanBlotchTexture =
              textureLookup.inkPaint399 || textureLookup.grunge336 || textureLookup.grunge342 || null;
            const uncannySoilTexture = textureLookup.soil146 || null;
            const uncannyStoneTexture = textureLookup.stone165 || null;
            const textureRecipe = resolveTextureRecipe(portraitRun.seed, portraitRun.archetype);
            const textureBase = ARCHETYPE_TEXTURE_STRENGTH[portraitRun.archetype];
            const textureOpacity = isScanning
              ? clamp(scanProgress, 0, 1) * (textureBase + 0.2) * (textureRecipe?.primaryOpacity ?? 1)
              : textureBase * (textureRecipe?.primaryOpacity ?? 1);
            const tint = ARCHETYPE_TINT[portraitRun.archetype];
            const tintSecondary = ARCHETYPE_TINT_SECOND[portraitRun.archetype];
            const textureSecondaryBase = ARCHETYPE_TEXTURE_SECOND_STRENGTH[portraitRun.archetype];
            const textureSecondaryOpacity = isScanning
              ? clamp(scanProgress, 0, 1) * (textureSecondaryBase + 0.15) * (textureRecipe?.secondaryOpacity ?? 1)
              : textureSecondaryBase * (textureRecipe?.secondaryOpacity ?? 1);
            const lighting = ARCHETYPE_LIGHTING[portraitRun.archetype];
            const edgeOpacity = ARCHETYPE_EDGE_OPACITY[portraitRun.archetype];
            const edgeBlendMode = ARCHETYPE_EDGE_BLEND_MODE[portraitRun.archetype];
            const primaryTileWidth = textureRecipe?.primaryRepeat
              ? previewWidth * (textureRecipe?.primaryScale ?? 1)
              : previewWidth;
            const primaryTileHeight = textureRecipe?.primaryRepeat
              ? previewHeight * (textureRecipe?.primaryScale ?? 1)
              : previewHeight;
            const secondaryTileWidth = textureRecipe?.secondaryRepeat
              ? previewWidth * (textureRecipe?.secondaryScale ?? 1)
              : previewWidth;
            const secondaryTileHeight = textureRecipe?.secondaryRepeat
              ? previewHeight * (textureRecipe?.secondaryScale ?? 1)
              : previewHeight;
            const mixAmount = isScanning ? clamp(scanProgress, 0, 1) : 0;

            return (
              <Canvas style={{ width: previewWidth, height: previewHeight }}>
                {faceOvalPath ? (
                  <Group clip={faceOvalPath}>
                    <SkiaImage
                      image={portraitRun.previewImage}
                      x={0}
                      y={0}
                      width={previewWidth}
                      height={previewHeight}
                      fit="fill"
                    />
                    {USE_GPU_EDGES && portraitRun.maskImage && SOBEL_SHADER && (
                      <Group
                        blendMode={edgeBlendMode}
                        opacity={edgeOpacity}
                        clip={portraitRun.archetype === 'human' ? featureEdgePath ?? undefined : undefined}
                      >
                        <Fill>
                          <Shader
                            source={SOBEL_SHADER}
                            uniforms={{
                              size: [previewWidth, previewHeight],
                              strength: EDGE_SETTINGS.strength,
                              threshold: EDGE_SETTINGS.threshold,
                              softness: EDGE_SETTINGS.softness,
                              mixAmount,
                            }}
                          >
                            <ImageShader
                              image={portraitRun.previewImage}
                              fit="fill"
                              rect={{ x: 0, y: 0, width: previewWidth, height: previewHeight }}
                            />
                            <ImageShader
                              image={portraitRun.maskImage}
                              fit="fill"
                              rect={{ x: 0, y: 0, width: previewWidth, height: previewHeight }}
                            />
                          </Shader>
                        </Fill>
                      </Group>
                    )}
                    {!USE_GPU_EDGES && portraitRun.edgeImage && (
                      <Group
                        blendMode={edgeBlendMode}
                        opacity={edgeOpacity}
                        clip={portraitRun.archetype === 'human' ? featureEdgePath ?? undefined : undefined}
                      >
                        <SkiaImage
                          image={portraitRun.edgeImage}
                          x={0}
                          y={0}
                          width={previewWidth}
                          height={previewHeight}
                          fit="fill"
                        />
                      </Group>
                    )}
                    {portraitRun.archetype === 'human' && humanBlotchTexture && (
                      <Group blendMode="softLight" opacity={HUMAN_FACE_EFFECTS.blotchOpacity}>
                        <Fill>
                          <ImageShader
                            image={humanBlotchTexture}
                            rect={{
                              x: 0,
                              y: 0,
                              width: previewWidth * 1.8,
                              height: previewHeight * 1.8,
                            }}
                            fit="cover"
                            tx="repeat"
                            ty="repeat"
                          />
                        </Fill>
                      </Group>
                    )}
                    {USE_TEXTURE_OVERLAY && textureRecipe?.primary && (
                      <Group blendMode="overlay" opacity={textureOpacity}>
                        <Fill>
                          <ImageShader
                            image={textureRecipe.primary}
                            rect={{ x: 0, y: 0, width: primaryTileWidth, height: primaryTileHeight }}
                            fit="cover"
                            tx={textureRecipe.primaryRepeat ? 'repeat' : 'clamp'}
                            ty={textureRecipe.primaryRepeat ? 'repeat' : 'clamp'}
                          />
                        </Fill>
                      </Group>
                    )}
                    {USE_TEXTURE_OVERLAY && textureRecipe?.secondary && (
                      <Group blendMode="softLight" opacity={textureSecondaryOpacity}>
                        <Fill>
                          <ImageShader
                            image={textureRecipe.secondary}
                            rect={{ x: 0, y: 0, width: secondaryTileWidth, height: secondaryTileHeight }}
                            fit="cover"
                            tx={textureRecipe.secondaryRepeat ? 'repeat' : 'clamp'}
                            ty={textureRecipe.secondaryRepeat ? 'repeat' : 'clamp'}
                          />
                        </Fill>
                      </Group>
                    )}
                    {portraitRun.archetype === 'human' && (
                      <>
                        <Group blendMode="multiply" opacity={HUMAN_FACE_EFFECTS.underEyeOpacity}>
                          <Fill>
                            <RadialGradient
                              c={vec(previewWidth * 0.36, previewHeight * 0.46)}
                              r={previewWidth * 0.18}
                              colors={[HUMAN_FACE_EFFECTS.underEyeColor, 'rgba(0,0,0,0)']}
                            />
                          </Fill>
                        </Group>
                        <Group blendMode="multiply" opacity={HUMAN_FACE_EFFECTS.underEyeOpacity}>
                          <Fill>
                            <RadialGradient
                              c={vec(previewWidth * 0.64, previewHeight * 0.46)}
                              r={previewWidth * 0.18}
                              colors={[HUMAN_FACE_EFFECTS.underEyeColor, 'rgba(0,0,0,0)']}
                            />
                          </Fill>
                        </Group>
                        <Group blendMode="softLight" opacity={HUMAN_FACE_EFFECTS.cheekOpacity}>
                          <Fill>
                            <RadialGradient
                              c={vec(previewWidth * 0.34, previewHeight * 0.62)}
                              r={previewWidth * 0.22}
                              colors={[HUMAN_FACE_EFFECTS.cheekColor, 'rgba(0,0,0,0)']}
                            />
                          </Fill>
                        </Group>
                        <Group blendMode="softLight" opacity={HUMAN_FACE_EFFECTS.cheekOpacity}>
                          <Fill>
                            <RadialGradient
                              c={vec(previewWidth * 0.66, previewHeight * 0.62)}
                              r={previewWidth * 0.22}
                              colors={[HUMAN_FACE_EFFECTS.cheekColor, 'rgba(0,0,0,0)']}
                            />
                          </Fill>
                        </Group>
                        {nosePath && (
                          <Group clip={nosePath} blendMode="screen" opacity={0.4}>
                            <Fill color={HUMAN_FACE_EFFECTS.noseBridgeColor} />
                          </Group>
                        )}
                        <Group blendMode="multiply" opacity={0.4}>
                          <Fill>
                            <LinearGradient
                              start={vec(0, previewHeight * 0.55)}
                              end={vec(0, previewHeight)}
                              colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.9)']}
                            />
                          </Fill>
                        </Group>
                      </>
                    )}
                    {portraitRun.archetype === 'uncanny' && (
                      <>
                        {(() => {
                          const patternRng = new SeededRandom(`${portraitRun.seed}_uncannyPattern`);
                          const soilScale = patternRng.range(0.18, 0.28);
                          const stoneScale = patternRng.range(0.12, 0.2);
                          const soilOffset = {
                            x: patternRng.range(-previewWidth * 0.25, previewWidth * 0.25),
                            y: patternRng.range(-previewHeight * 0.25, previewHeight * 0.25),
                          };
                          const stoneOffset = {
                            x: patternRng.range(-previewWidth * 0.35, previewWidth * 0.35),
                            y: patternRng.range(-previewHeight * 0.35, previewHeight * 0.35),
                          };
                          return (
                            <>
                              {uncannySoilTexture && (
                                <Group blendMode="softLight" opacity={UNCANNY_FACE_EFFECTS.soilOpacity}>
                                  <Fill>
                                    <ImageShader
                                      image={uncannySoilTexture}
                                      rect={{
                                        x: soilOffset.x,
                                        y: soilOffset.y,
                                        width: previewWidth * soilScale,
                                        height: previewHeight * soilScale,
                                      }}
                                      fit="cover"
                                      tx="repeat"
                                      ty="repeat"
                                    />
                                  </Fill>
                                </Group>
                              )}
                              {uncannyStoneTexture && (
                                <Group blendMode="overlay" opacity={UNCANNY_FACE_EFFECTS.stoneOpacity}>
                                  <Fill>
                                    <ImageShader
                                      image={uncannyStoneTexture}
                                      rect={{
                                        x: stoneOffset.x,
                                        y: stoneOffset.y,
                                        width: previewWidth * stoneScale,
                                        height: previewHeight * stoneScale,
                                      }}
                                      fit="cover"
                                      tx="repeat"
                                      ty="repeat"
                                    />
                                  </Fill>
                                </Group>
                              )}
                            </>
                          );
                        })()}
                        {irisPath && (
                          <Group clip={irisPath} blendMode="color" opacity={UNCANNY_FACE_EFFECTS.eyeTintOpacity}>
                            <Fill color={UNCANNY_FACE_EFFECTS.eyeTintColor} />
                          </Group>
                        )}
                        {irisPath && (
                          <Group clip={irisPath} blendMode="screen" opacity={UNCANNY_FACE_EFFECTS.eyeGlowOpacity}>
                            <Fill color={UNCANNY_FACE_EFFECTS.eyeGlowColor} />
                          </Group>
                        )}
                        {irisPath && (
                          <Group clip={irisPath} blendMode="softLight" opacity={UNCANNY_FACE_EFFECTS.eyeSheenOpacity}>
                            <Fill>
                              <LinearGradient
                                start={vec(0, 0)}
                                end={vec(previewWidth, previewHeight)}
                                colors={[UNCANNY_FACE_EFFECTS.eyeSheenBright, UNCANNY_FACE_EFFECTS.eyeSheenDark]}
                              />
                            </Fill>
                          </Group>
                        )}
                        {lipPath && (
                          <Group clip={lipPath} blendMode="color" opacity={UNCANNY_FACE_EFFECTS.lipTintOpacity}>
                            <Fill color={UNCANNY_FACE_EFFECTS.lipTintColor} />
                          </Group>
                        )}
                        <Group blendMode="screen" opacity={UNCANNY_FACE_EFFECTS.waxOpacity}>
                          <Fill>
                            <LinearGradient
                              start={vec(previewWidth * 0.1, 0)}
                              end={vec(previewWidth * 0.9, previewHeight)}
                              colors={['rgba(255,255,255,0.5)', 'rgba(255,255,255,0)']}
                            />
                          </Fill>
                        </Group>
                      </>
                    )}
                    <Group blendMode={tint.blendMode} opacity={tint.opacity}>
                      <Fill color={tint.color} />
                    </Group>
                    <Group blendMode={tintSecondary.blendMode} opacity={tintSecondary.opacity}>
                      <Fill color={tintSecondary.color} />
                    </Group>
                    <Group blendMode="softLight" opacity={lighting.colorOpacity}>
                      <Fill>
                        <LinearGradient
                          start={vec(0, 0)}
                          end={vec(previewWidth, previewHeight)}
                          colors={[lighting.warm, lighting.cool]}
                        />
                      </Fill>
                    </Group>
                    <Group blendMode="multiply" opacity={lighting.shadowOpacity}>
                      <Fill>
                        <LinearGradient
                          start={vec(0, 0)}
                          end={vec(0, previewHeight)}
                          colors={['rgba(0,0,0,0)', lighting.shadow]}
                        />
                      </Fill>
                    </Group>
                    <Group blendMode="screen" opacity={lighting.highlightOpacity}>
                      <Fill>
                        <LinearGradient
                          start={vec(0, 0)}
                          end={vec(previewWidth * 0.6, previewHeight * 0.4)}
                          colors={[lighting.highlight, 'rgba(255,255,255,0)']}
                        />
                      </Fill>
                    </Group>
                  </Group>
                ) : (
                  <SkiaImage
                    image={portraitRun.previewImage}
                    x={0}
                    y={0}
                    width={previewWidth}
                    height={previewHeight}
                    fit="fill"
                  />
                )}
              </Canvas>
            );
          })()
        ) : null}
      </View>
    );
  }

  return (
    <View style={styles.panel}>
      <Text style={styles.title}>TFLite Face Landmark</Text>
      <Text style={styles.line}>MODEL LOADED</Text>
      <Text style={styles.line}>IMAGES {summary?.runCount ?? 0}</Text>
      {inputInfo && (
        <>
          <Text style={styles.line}>INPUT {inputInfo.dataType} {formatShape(inputInfo.shape)}</Text>
          <Text style={styles.line}>NORM {summary?.normalization ?? 'pending'}</Text>
        </>
      )}
      {segmentationInfo && (
        <Text style={styles.line}>SEG OUT {summary?.segmentationShape ?? 'n/a'}</Text>
      )}
      {segmentationState.state === 'loading' && (
        <Text style={styles.line}>SEGMENTATION LOADING</Text>
      )}
      {summary && (
        <>
          <Text style={styles.line}>LANDMARKS NORM {summary.landmarksNormalized}</Text>
          <Text style={styles.line}>OUTPUT {summary.outputTypes} {summary.outputShapes}</Text>
          <Text style={styles.line}>LEN {summary.outputLength}</Text>
          <Text style={styles.line}>LM {summary.landmarkCount ?? 'n/a'} {summary.landmarkSample}</Text>
        </>
      )}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.previewRow}
        pointerEvents="auto"
      >
        {runs.map((run) => {
          if (!run.previewImage) return null;
          const previewWidth = PREVIEW_WIDTH;
          const previewHeight = Math.round(PREVIEW_WIDTH * (run.inputHeight / run.inputWidth));
          const contourPath = buildPath(run.landmarks, run.inputWidth, run.inputHeight, previewWidth, previewHeight, FACEMESH_CONTOURS);
          const lipPath = buildPath(run.landmarks, run.inputWidth, run.inputHeight, previewWidth, previewHeight, FACEMESH_LIPS);
          const nosePath = buildPath(run.landmarks, run.inputWidth, run.inputHeight, previewWidth, previewHeight, FACEMESH_NOSE);
          const irisPath = buildPath(run.landmarks, run.inputWidth, run.inputHeight, previewWidth, previewHeight, FACEMESH_IRISES);
          const faceOvalPath = buildFaceOvalPath(run.landmarks, run.inputWidth, run.inputHeight, previewWidth, previewHeight);
          const featureEdgePath = (() => {
            if (!irisPath && !lipPath && !nosePath) return null;
            const path = Skia.Path.Make();
            if (irisPath) path.addPath(irisPath);
            if (lipPath) path.addPath(lipPath);
            if (nosePath) path.addPath(nosePath);
            return path;
          })();
          const humanBlotchTexture =
            textureLookup.inkPaint399 || textureLookup.grunge336 || textureLookup.grunge342 || null;
          const uncannySoilTexture = textureLookup.soil146 || null;
          const uncannyStoneTexture = textureLookup.stone165 || null;
          const textureRecipe = resolveTextureRecipe(run.seed, run.archetype);
          const textureBase = ARCHETYPE_TEXTURE_STRENGTH[run.archetype];
          const textureOpacity = isScanning
            ? clamp(scanProgress, 0, 1) * (textureBase + 0.2) * (textureRecipe?.primaryOpacity ?? 1)
            : textureBase * (textureRecipe?.primaryOpacity ?? 1);
          const tint = ARCHETYPE_TINT[run.archetype];
          const tintSecondary = ARCHETYPE_TINT_SECOND[run.archetype];
          const textureSecondaryBase = ARCHETYPE_TEXTURE_SECOND_STRENGTH[run.archetype];
          const textureSecondaryOpacity = isScanning
            ? clamp(scanProgress, 0, 1) * (textureSecondaryBase + 0.15) * (textureRecipe?.secondaryOpacity ?? 1)
            : textureSecondaryBase * (textureRecipe?.secondaryOpacity ?? 1);
          const lighting = ARCHETYPE_LIGHTING[run.archetype];
          const edgeOpacity = ARCHETYPE_EDGE_OPACITY[run.archetype];
          const edgeBlendMode = ARCHETYPE_EDGE_BLEND_MODE[run.archetype];
          const primaryTileWidth = textureRecipe?.primaryRepeat
            ? previewWidth * (textureRecipe?.primaryScale ?? 1)
            : previewWidth;
          const primaryTileHeight = textureRecipe?.primaryRepeat
            ? previewHeight * (textureRecipe?.primaryScale ?? 1)
            : previewHeight;
          const secondaryTileWidth = textureRecipe?.secondaryRepeat
            ? previewWidth * (textureRecipe?.secondaryScale ?? 1)
            : previewWidth;
          const secondaryTileHeight = textureRecipe?.secondaryRepeat
            ? previewHeight * (textureRecipe?.secondaryScale ?? 1)
            : previewHeight;

          const mixAmount = isScanning ? clamp(scanProgress, 0, 1) : 0;
          const hasFaceClip = !!faceOvalPath;

          return (
            <View key={run.key} style={styles.previewItem}>
              <Canvas style={{ width: previewWidth, height: previewHeight }}>
                {hasFaceClip ? (
                  <Group clip={faceOvalPath!}>
                    <SkiaImage
                      image={run.previewImage}
                      x={0}
                      y={0}
                      width={previewWidth}
                      height={previewHeight}
                      fit="fill"
                    />
                  {USE_GPU_EDGES && run.maskImage && SOBEL_SHADER && (
                    <Group
                      blendMode={edgeBlendMode}
                      opacity={edgeOpacity}
                      clip={run.archetype === 'human' ? featureEdgePath ?? undefined : undefined}
                    >
                        <Fill>
                          <Shader
                            source={SOBEL_SHADER}
                            uniforms={{
                              size: [previewWidth, previewHeight],
                              strength: EDGE_SETTINGS.strength,
                              threshold: EDGE_SETTINGS.threshold,
                              softness: EDGE_SETTINGS.softness,
                              mixAmount,
                            }}
                          >
                            <ImageShader
                              image={run.previewImage}
                              fit="fill"
                              rect={{ x: 0, y: 0, width: previewWidth, height: previewHeight }}
                            />
                            <ImageShader
                              image={run.maskImage}
                              fit="fill"
                              rect={{ x: 0, y: 0, width: previewWidth, height: previewHeight }}
                            />
                          </Shader>
                        </Fill>
                      </Group>
                    )}
                    {!USE_GPU_EDGES && run.edgeImage && (
                      <Group
                        blendMode={edgeBlendMode}
                        opacity={edgeOpacity}
                        clip={run.archetype === 'human' ? featureEdgePath ?? undefined : undefined}
                      >
                        <SkiaImage
                          image={run.edgeImage}
                          x={0}
                          y={0}
                          width={previewWidth}
                          height={previewHeight}
                          fit="fill"
                        />
                      </Group>
                    )}
                    {run.archetype === 'human' && humanBlotchTexture && (
                      <Group blendMode="softLight" opacity={HUMAN_FACE_EFFECTS.blotchOpacity}>
                        <Fill>
                          <ImageShader
                            image={humanBlotchTexture}
                            rect={{
                              x: 0,
                              y: 0,
                              width: previewWidth * 1.8,
                              height: previewHeight * 1.8,
                            }}
                            fit="cover"
                            tx="repeat"
                            ty="repeat"
                          />
                        </Fill>
                      </Group>
                    )}
                    {USE_TEXTURE_OVERLAY && textureRecipe?.primary && (
                      <Group blendMode="overlay" opacity={textureOpacity}>
                        <Fill>
                          <ImageShader
                            image={textureRecipe.primary}
                            rect={{ x: 0, y: 0, width: primaryTileWidth, height: primaryTileHeight }}
                            fit="cover"
                            tx={textureRecipe.primaryRepeat ? 'repeat' : 'clamp'}
                            ty={textureRecipe.primaryRepeat ? 'repeat' : 'clamp'}
                          />
                        </Fill>
                      </Group>
                    )}
                    {USE_TEXTURE_OVERLAY && textureRecipe?.secondary && (
                      <Group blendMode="softLight" opacity={textureSecondaryOpacity}>
                        <Fill>
                          <ImageShader
                            image={textureRecipe.secondary}
                            rect={{ x: 0, y: 0, width: secondaryTileWidth, height: secondaryTileHeight }}
                            fit="cover"
                            tx={textureRecipe.secondaryRepeat ? 'repeat' : 'clamp'}
                            ty={textureRecipe.secondaryRepeat ? 'repeat' : 'clamp'}
                          />
                        </Fill>
                      </Group>
                    )}
                    {run.archetype === 'human' && (
                      <>
                        <Group blendMode="multiply" opacity={HUMAN_FACE_EFFECTS.underEyeOpacity}>
                          <Fill>
                            <RadialGradient
                              c={vec(previewWidth * 0.36, previewHeight * 0.46)}
                              r={previewWidth * 0.18}
                              colors={[HUMAN_FACE_EFFECTS.underEyeColor, 'rgba(0,0,0,0)']}
                            />
                          </Fill>
                        </Group>
                        <Group blendMode="multiply" opacity={HUMAN_FACE_EFFECTS.underEyeOpacity}>
                          <Fill>
                            <RadialGradient
                              c={vec(previewWidth * 0.64, previewHeight * 0.46)}
                              r={previewWidth * 0.18}
                              colors={[HUMAN_FACE_EFFECTS.underEyeColor, 'rgba(0,0,0,0)']}
                            />
                          </Fill>
                        </Group>
                        <Group blendMode="softLight" opacity={HUMAN_FACE_EFFECTS.cheekOpacity}>
                          <Fill>
                            <RadialGradient
                              c={vec(previewWidth * 0.34, previewHeight * 0.62)}
                              r={previewWidth * 0.22}
                              colors={[HUMAN_FACE_EFFECTS.cheekColor, 'rgba(0,0,0,0)']}
                            />
                          </Fill>
                        </Group>
                        <Group blendMode="softLight" opacity={HUMAN_FACE_EFFECTS.cheekOpacity}>
                          <Fill>
                            <RadialGradient
                              c={vec(previewWidth * 0.66, previewHeight * 0.62)}
                              r={previewWidth * 0.22}
                              colors={[HUMAN_FACE_EFFECTS.cheekColor, 'rgba(0,0,0,0)']}
                            />
                          </Fill>
                        </Group>
                        {nosePath && (
                          <Group clip={nosePath} blendMode="screen" opacity={0.4}>
                            <Fill color={HUMAN_FACE_EFFECTS.noseBridgeColor} />
                          </Group>
                        )}
                        <Group blendMode="multiply" opacity={0.4}>
                          <Fill>
                            <LinearGradient
                              start={vec(0, previewHeight * 0.55)}
                              end={vec(0, previewHeight)}
                              colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.9)']}
                            />
                          </Fill>
                        </Group>
                      </>
                    )}
                    {run.archetype === 'uncanny' && (
                      <>
                        {(() => {
                          const patternRng = new SeededRandom(`${run.seed}_uncannyPattern`);
                          const soilScale = patternRng.range(0.18, 0.28);
                          const stoneScale = patternRng.range(0.12, 0.2);
                          const soilOffset = {
                            x: patternRng.range(-previewWidth * 0.25, previewWidth * 0.25),
                            y: patternRng.range(-previewHeight * 0.25, previewHeight * 0.25),
                          };
                          const stoneOffset = {
                            x: patternRng.range(-previewWidth * 0.35, previewWidth * 0.35),
                            y: patternRng.range(-previewHeight * 0.35, previewHeight * 0.35),
                          };
                          return (
                            <>
                              {uncannySoilTexture && (
                                <Group blendMode="softLight" opacity={UNCANNY_FACE_EFFECTS.soilOpacity}>
                                  <Fill>
                                    <ImageShader
                                      image={uncannySoilTexture}
                                      rect={{
                                        x: soilOffset.x,
                                        y: soilOffset.y,
                                        width: previewWidth * soilScale,
                                        height: previewHeight * soilScale,
                                      }}
                                      fit="cover"
                                      tx="repeat"
                                      ty="repeat"
                                    />
                                  </Fill>
                                </Group>
                              )}
                              {uncannyStoneTexture && (
                                <Group blendMode="overlay" opacity={UNCANNY_FACE_EFFECTS.stoneOpacity}>
                                  <Fill>
                                    <ImageShader
                                      image={uncannyStoneTexture}
                                      rect={{
                                        x: stoneOffset.x,
                                        y: stoneOffset.y,
                                        width: previewWidth * stoneScale,
                                        height: previewHeight * stoneScale,
                                      }}
                                      fit="cover"
                                      tx="repeat"
                                      ty="repeat"
                                    />
                                  </Fill>
                                </Group>
                              )}
                            </>
                          );
                        })()}
                        {irisPath && (
                          <Group clip={irisPath} blendMode="color" opacity={UNCANNY_FACE_EFFECTS.eyeTintOpacity}>
                            <Fill color={UNCANNY_FACE_EFFECTS.eyeTintColor} />
                          </Group>
                        )}
                        {irisPath && (
                          <Group clip={irisPath} blendMode="screen" opacity={UNCANNY_FACE_EFFECTS.eyeGlowOpacity}>
                            <Fill color={UNCANNY_FACE_EFFECTS.eyeGlowColor} />
                          </Group>
                        )}
                        {irisPath && (
                          <Group clip={irisPath} blendMode="softLight" opacity={UNCANNY_FACE_EFFECTS.eyeSheenOpacity}>
                            <Fill>
                              <LinearGradient
                                start={vec(0, 0)}
                                end={vec(previewWidth, previewHeight)}
                                colors={[UNCANNY_FACE_EFFECTS.eyeSheenBright, UNCANNY_FACE_EFFECTS.eyeSheenDark]}
                              />
                            </Fill>
                          </Group>
                        )}
                        {lipPath && (
                          <Group clip={lipPath} blendMode="color" opacity={UNCANNY_FACE_EFFECTS.lipTintOpacity}>
                            <Fill color={UNCANNY_FACE_EFFECTS.lipTintColor} />
                          </Group>
                        )}
                        <Group blendMode="screen" opacity={UNCANNY_FACE_EFFECTS.waxOpacity}>
                          <Fill>
                            <LinearGradient
                              start={vec(previewWidth * 0.1, 0)}
                              end={vec(previewWidth * 0.9, previewHeight)}
                              colors={['rgba(255,255,255,0.5)', 'rgba(255,255,255,0)']}
                            />
                          </Fill>
                        </Group>
                      </>
                    )}
                    <Group blendMode={tint.blendMode} opacity={tint.opacity}>
                      <Fill color={tint.color} />
                    </Group>
                    <Group blendMode={tintSecondary.blendMode} opacity={tintSecondary.opacity}>
                      <Fill color={tintSecondary.color} />
                    </Group>
                    <Group blendMode="softLight" opacity={lighting.colorOpacity}>
                      <Fill>
                        <LinearGradient
                          start={vec(0, 0)}
                          end={vec(previewWidth, previewHeight)}
                          colors={[lighting.warm, lighting.cool]}
                        />
                      </Fill>
                    </Group>
                    <Group blendMode="multiply" opacity={lighting.shadowOpacity}>
                      <Fill>
                        <LinearGradient
                          start={vec(0, 0)}
                          end={vec(0, previewHeight)}
                          colors={['rgba(0,0,0,0)', lighting.shadow]}
                        />
                      </Fill>
                    </Group>
                    <Group blendMode="screen" opacity={lighting.highlightOpacity}>
                      <Fill>
                        <LinearGradient
                          start={vec(0, 0)}
                          end={vec(previewWidth * 0.6, previewHeight * 0.4)}
                          colors={[lighting.highlight, 'rgba(255,255,255,0)']}
                        />
                      </Fill>
                    </Group>
                  </Group>
                ) : (
                  <SkiaImage
                    image={run.previewImage}
                    x={0}
                    y={0}
                    width={previewWidth}
                    height={previewHeight}
                    fit="fill"
                  />
                )}
                {SHOW_LANDMARK_OVERLAY && contourPath && (
                  <Path
                    path={contourPath}
                    color="rgba(82, 212, 255, 0.75)"
                    style="stroke"
                    strokeWidth={0.8}
                  />
                )}
                {SHOW_LANDMARK_OVERLAY && nosePath && (
                  <Path
                    path={nosePath}
                    color="rgba(255, 199, 64, 0.9)"
                    style="stroke"
                    strokeWidth={0.9}
                  />
                )}
                {SHOW_LANDMARK_OVERLAY && lipPath && (
                  <Path
                    path={lipPath}
                    color="rgba(255, 112, 139, 0.9)"
                    style="stroke"
                    strokeWidth={0.9}
                  />
                )}
                {SHOW_LANDMARK_OVERLAY && irisPath && (
                  <Path
                    path={irisPath}
                    color="rgba(118, 255, 184, 0.9)"
                    style="stroke"
                    strokeWidth={0.9}
                  />
                )}
              </Canvas>
              <Text style={styles.previewLabel}>{run.label}</Text>
              <Text style={styles.previewMeta}>LM {run.landmarkCount ?? 'n/a'} P {run.presence?.toFixed(2) ?? 'n/a'}</Text>
              <Text style={styles.previewMeta}>TYPE {run.archetype}</Text>
              <Text style={styles.previewMeta}>SRC {run.originalSize}</Text>
              <Text style={styles.previewMeta}>CROP {run.crop} {run.cropSource}</Text>
              <Text style={styles.previewMeta}>IN {run.inputSize}</Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    backgroundColor: 'rgba(10, 12, 15, 0.92)',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#3a3f47',
    borderRadius: 6,
    maxWidth: undefined,
    zIndex: 1000,
  },
  title: {
    color: '#d8c3a6',
    fontSize: 12,
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  line: {
    color: '#e2d3bf',
    fontSize: 10,
    marginBottom: 2,
  },
  error: {
    color: '#d4534a',
    fontSize: 11,
    marginBottom: 2,
  },
  previewRow: {
    marginTop: 6,
    paddingBottom: 4,
    gap: 8,
  },
  previewItem: {
    borderWidth: 1,
    borderColor: '#3a3f47',
    backgroundColor: '#0a0f14',
    padding: 4,
  },
  previewLabel: {
    color: '#8f816f',
    fontSize: 9,
    marginTop: 4,
  },
  previewMeta: {
    color: '#6e5f4d',
    fontSize: 9,
  },
  portraitContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});

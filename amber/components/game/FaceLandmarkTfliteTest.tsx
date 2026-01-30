import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Tensor, useTensorflowModel } from 'react-native-fast-tflite';
import {
  AlphaType,
  Canvas,
  ColorType,
  Fill,
  Image as SkiaImage,
  ImageShader,
  Path,
  Shader,
  Skia,
  useImage,
} from '@shopify/react-native-skia';

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
    asset: require('../../assets/ai-portraits/timothy_itayi_neutral_expression_facing_camera_head_and_shoul_0f9d1137-478a-44d0-bd39-d600c34db2cc_3.png'),
  },
  {
    key: 'cyborg',
    label: 'cyborg-implants',
    asset: require('../../assets/ai-portraits/timothy_itayi_human_cyborg_hybrid_partial_facial_implants_exp_c337c6ba-b3cb-4046-9554-357c27634711_3.png'),
  },
  {
    key: 'uncanny',
    label: 'uncanny',
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
  strength: 1.35,
  threshold: 0.22,
  softness: 0.05,
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
};

export function FaceLandmarkTfliteTest({
  scanProgress = 0,
  isScanning = false,
}: FaceLandmarkTfliteTestProps) {
  const modelState = useTensorflowModel(MODEL_ASSET);
  const segmentationState = useTensorflowModel(SEGMENT_MODEL_ASSET);
  const [summary, setSummary] = useState<RunSummary | null>(null);
  const [runs, setRuns] = useState<ImageRun[]>([]);
  const runStageRef = useRef<'none' | 'landmarks' | 'segmentation'>('none');
  const imageNeutral = useImage(IMAGE_SOURCES[0].asset);
  const imageCyborg = useImage(IMAGE_SOURCES[1].asset);
  const imageUncanny = useImage(IMAGE_SOURCES[2].asset);
  const imageAlien = useImage(IMAGE_SOURCES[3].asset);
  const imageRobot = useImage(IMAGE_SOURCES[4].asset);
  const images = useMemo(
    () => [
      { ...IMAGE_SOURCES[0], image: imageNeutral },
      { ...IMAGE_SOURCES[1], image: imageCyborg },
      { ...IMAGE_SOURCES[2], image: imageUncanny },
      { ...IMAGE_SOURCES[3], image: imageAlien },
      { ...IMAGE_SOURCES[4], image: imageRobot },
    ],
    [imageAlien, imageCyborg, imageNeutral, imageRobot, imageUncanny]
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
      const srcWidth = source.image.width();
      const srcHeight = source.image.height();
      const fullRect: CropRect = { x: 0, y: 0, width: srcWidth, height: srcHeight };

      const segMask = (() => {
        if (!segmentModel || !segmentationOutput) return null;
        const segmentInput = buildInputFromImage(source.image, segmentModel.inputs[0], fullRect);
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

      const imageInput = buildInputFromImage(source.image, inputTensor, refinedCrop);
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
        maskImage = buildMaskImage(resizedMask, inputWidth, inputHeight);
      } else {
        maskImage = buildLandmarkMaskImage(points, inputWidth, inputHeight);
      }

      runResults.push({
        key: source.key,
        label: source.label,
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
        <Text style={styles.line}>{IMAGE_SOURCES.length} portraits</Text>
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

          const mixAmount = isScanning ? clamp(scanProgress, 0, 1) : 0;

          return (
            <View key={run.key} style={styles.previewItem}>
              <Canvas style={{ width: previewWidth, height: previewHeight }}>
                <SkiaImage
                  image={run.previewImage}
                  x={0}
                  y={0}
                  width={previewWidth}
                  height={previewHeight}
                  fit="fill"
                />
                {run.maskImage && SOBEL_SHADER && (
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
                )}
                {contourPath && (
                  <Path
                    path={contourPath}
                    color="rgba(82, 212, 255, 0.75)"
                    style="stroke"
                    strokeWidth={0.8}
                  />
                )}
                {nosePath && (
                  <Path
                    path={nosePath}
                    color="rgba(255, 199, 64, 0.9)"
                    style="stroke"
                    strokeWidth={0.9}
                  />
                )}
                {lipPath && (
                  <Path
                    path={lipPath}
                    color="rgba(255, 112, 139, 0.9)"
                    style="stroke"
                    strokeWidth={0.9}
                  />
                )}
                {irisPath && (
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
});

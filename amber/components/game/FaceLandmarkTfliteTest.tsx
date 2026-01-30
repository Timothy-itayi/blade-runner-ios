import React, { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Tensor, useTensorflowModel } from 'react-native-fast-tflite';
import { AlphaType, ColorType, Skia, useImage } from '@shopify/react-native-skia';

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
  imageStatus: string;
  imageSize: string;
  outputShapes: string;
  outputTypes: string;
  outputLength: number;
  landmarkCount: number | null;
  landmarkSample: string;
};

const MODEL_ASSET = require('../../models/face_landmark.tflite');
const IMAGE_ASSET = require('../../assets/ai-portraits/timothy_itayi_neutral_expression_facing_camera_head_and_shoul_0f9d1137-478a-44d0-bd39-d600c34db2cc_3.png');
const IMAGE_LABEL = 'ai-portraits/neutral-expression.png';

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

const buildInputFromImage = (image: ReturnType<typeof useImage>, inputTensor: Tensor) => {
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

  const canvas = surface.getCanvas();
  const paint = Skia.Paint();
  const srcRect = Skia.XYWHRect(0, 0, image.width(), image.height());
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
  };
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

export function FaceLandmarkTfliteTest() {
  const modelState = useTensorflowModel(MODEL_ASSET);
  const [summary, setSummary] = useState<RunSummary | null>(null);
  const hasRunRef = useRef(false);
  const portraitImage = useImage(IMAGE_ASSET);

  const inputInfo = useMemo(() => {
    if (modelState.state !== 'loaded') return null;
    return modelState.model.inputs[0];
  }, [modelState]);

  useEffect(() => {
    if (modelState.state !== 'loaded') return;
    if (!portraitImage) return;
    if (hasRunRef.current) return;
    hasRunRef.current = true;

    const model = modelState.model;
    const inputTensor = model.inputs[0];
    if (!inputTensor) {
      console.warn('[TFLite] No input tensors found for face_landmark.tflite');
      return;
    }

    const imageInput = buildInputFromImage(portraitImage, inputTensor);
    const { buffer, normalization, imageStatus, imageSize } = imageInput ?? buildSyntheticInput(inputTensor);
    const outputs = model.runSync([buffer]) as SupportedTypedArray[];
    const outputTensors = model.outputs;
    const outputTensor = outputTensors[0];
    const outputData = outputs[0];

    const outputShapes = outputTensors.map((tensor) => formatShape(tensor.shape)).join(' | ');
    const outputTypes = outputTensors.map((tensor) => tensor.dataType).join(' | ');
    const { landmarkCount, landmarkSample } = summarizeLandmarks(outputData, outputTensor?.shape);

    console.log('[TFLite] face_landmark.tflite loaded');
    console.log(`[TFLite] input: ${inputTensor.dataType} ${formatShape(inputTensor.shape)} (${normalization})`);
    console.log(`[TFLite] image: ${imageStatus} ${imageSize} (${IMAGE_LABEL})`);
    console.log(`[TFLite] output: ${outputTypes} ${outputShapes}`);
    console.log(`[TFLite] output length: ${outputData?.length ?? 0}`);
    if (landmarkCount) {
      console.log(`[TFLite] landmarks: ${landmarkCount} sample ${landmarkSample}`);
    } else {
      console.log('[TFLite] landmark parsing failed');
    }

    setSummary({
      inputShape: formatShape(inputTensor.shape),
      inputType: inputTensor.dataType,
      normalization,
      imageStatus,
      imageSize,
      outputShapes,
      outputTypes,
      outputLength: outputData?.length ?? 0,
      landmarkCount,
      landmarkSample,
    });
  }, [modelState, portraitImage]);

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

  if (!portraitImage) {
    return (
      <View style={styles.panel}>
        <Text style={styles.title}>TFLite Face Landmark</Text>
        <Text style={styles.line}>IMAGE LOADING</Text>
        <Text style={styles.line}>{IMAGE_LABEL}</Text>
      </View>
    );
  }

  return (
    <View style={styles.panel}>
      <Text style={styles.title}>TFLite Face Landmark</Text>
      <Text style={styles.line}>MODEL LOADED</Text>
      <Text style={styles.line}>IMAGE {IMAGE_LABEL}</Text>
      {inputInfo && (
        <>
          <Text style={styles.line}>INPUT {inputInfo.dataType} {formatShape(inputInfo.shape)}</Text>
          <Text style={styles.line}>NORM {summary?.normalization ?? 'pending'}</Text>
        </>
      )}
      {summary && (
        <>
          <Text style={styles.line}>IMG {summary.imageStatus} {summary.imageSize}</Text>
          <Text style={styles.line}>OUTPUT {summary.outputTypes} {summary.outputShapes}</Text>
          <Text style={styles.line}>LEN {summary.outputLength}</Text>
          <Text style={styles.line}>LM {summary.landmarkCount ?? 'n/a'} {summary.landmarkSample}</Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(10, 12, 15, 0.92)',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#3a3f47',
    borderRadius: 6,
    maxWidth: 260,
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
});

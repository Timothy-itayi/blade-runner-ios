# Face Debug Notes

## Current State
- Models: `models/face_landmark.tflite`, `models/selfie_segmentation.tflite`
- Debug view: `components/game/FaceLandmarkTfliteTest.tsx`
- Active images: neutral-expression, cyborg-implants, uncanny (3 only)

## Pipeline (per image)
1. Run segmentation on full image (if available).
2. Compute crop:
   - If segmentation bbox exists: use segmentation-derived crop.
   - Else: center crop.
3. First landmark pass on crop.
4. Refine crop from landmark face-oval bbox (presence threshold allowed).
5. Re-run landmarks on refined crop.
6. Mask:
   - Segmentation mask sampled into refined crop OR
   - Landmark oval mask fallback.
7. Edge passes:
   - Sobel fine + mid + coarse
   - DoG (Difference of Gaussians)
   - Thresholded Sobel
   - Blend into single edge map (CPU).
8. Texture overlay:
   - Apply per-image texture in face mask (blend mode overlay).
   - Use scan progress to reveal strength.
9. Scanner FX:
   - Scanlines, noise, subtle glow.

## Notes
- GPU RuntimeEffect Sobel was crashing; GPU edge pass is disabled.
- Texture overlay uses Skia `Group` blend on GPU (no RuntimeEffect).
- Per-image crop + per-image mask are required; no reuse across images.
- Debug row shows SRC, CROP, IN, presence, and crop source.
- Edge weights and color grading are per-archetype (human softer, cyborg harder) and stronger overall.
- Tints: human/cyborg darker, uncanny lighter. Texture strength is archetype-scaled.
- Two texture layers per archetype + hue-shift overlay.

## Tuning knobs
- `FACE_PRESENCE_THRESHOLD`
- `SEGMENTATION_THRESHOLD` + `SEGMENTATION_PADDING`
- `LANDMARK_PADDING`
- `EDGE_SETTINGS` + `EDGE_BLEND`


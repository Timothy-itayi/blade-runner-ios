# Face Debug Notes

This page explains in everyday terms how our face processing pipeline works, why we do it, and what we actually can (and can’t) achieve with it. The ultimate aim is to create a system that lets us generate visually distinct NPCs by applying different "styles" to base face scans—not to invent brand new faces out of thin air.

---

## The Main Goal: Stylized, Remixable NPCs

Our ambition is to take a small set of scanned faces and process them so that we can produce lots of stylistic variations for NPCs in the game. Think of it like having a collection of 2D head base layers, then re-drawing, re-coloring, re-texturing, and lightly re-shaping them in unique ways to fit different art styles or vibes.

**Key points:**
- **Not about generating completely new facial identities:**  
  The system does NOT invent new faces; it restyles or remixes the visuals of our existing base faces.
- **Multiple art directions:**  
  Right now, our outputs look like semi-3D faces on a flat, 2D surface. We're experimenting, so we might switch to a totally different visual style (impressionistic, painterly, abstract, etc.) later.
- **Why bother?**  
  This approach lets us get variety in the game’s NPCs, and quickly adapt to changes in art direction, without hand-crafting every portrait from scratch.

**Status update:**  
The face pipeline is now wired into the main UI (scanner + comms portrait). This means what you see in the live game is the same processing stack we test here.

---

## Step-by-Step: How the Face Pipeline Works

**Files in Play:**
- **Debug UI:**  
  `amber/components/game/FaceLandmarkTfliteTest.tsx` — lets us inspect each step of the pipeline.
- **ML Models:**  
  - `amber/models/face_landmark.tflite` (finds key face points)
  - `amber/models/selfie_segmentation.tflite` (cuts face shape out from background)

**For each image, processing goes like this:**

1. **Segmentation:**  
   Try to detect the full face/head region in the raw image, cutting out just the subject, not any background.
2. **Initial Crop:**  
   Use the detected segment’s bounding box—or center crop if missed—to zoom in for analysis.
3. **Landmark Detection Pass 1:**  
   Identify facial landmarks (chin, mouth, eyes, nose, etc.) on this crop.
4. **Refine Crop:**  
   Make a tighter cutout based on the landmark fit, focusing more precisely on the actual face.
5. **Landmark Detection Pass 2:**  
   With less noise/background, run the landmark model again for even sharper accuracy.
6. **Create Mask:**  
   Use the segmentation mask if possible (or fallback on the oval from landmarks) to outline the face area—this becomes our "base layer."
7. **Edge Detection (CPU steps):**
   - Sobel filter (detects edges at fine/mid/coarse levels)
   - DoG filter (Difference of Gaussians, for highlighting features)
   - Thresholded Sobel (gives clear B&W outlines)
   - Blend all those into one edge map that reveals facial structure
8. **Texture + Color Remix:**  
   Apply texture overlays (leather/metal/etc.) inside the face mask, then grade or tint the result for a new style.
9. **Scanner FX:**  
   Scanlines, noise, and subtle glow are layered last to hide repetition and sell the “scanner” fantasy.

**Debug Panel Shows:**
- **SRC:** The raw, original image
- **CROP:** The portion we isolate per image
- **IN:** The transformed input (what the models “see”)
- **Presence:** Indicates if/where the model found a face

---

## Current Pipeline Settings

- We’re only using the first 3 portraits (for speed and testing purposes)
- GPU-based Sobel is ON (CPU edges are removed)
- Segmentation is currently skipped in the live pipeline to reduce stalls
- Texture overlay is ON (per-image, masked)
- Edge blend weights are archetype-tuned (human softer, cyborg harder) and globally stronger.
- Color grading is archetype-tinted (mask-clipped), with darker tints for human/cyborg and lighter for uncanny.
- Texture strength is archetype-scaled, with two layered textures per subject for stronger remixing.
- Hue shift overlay is applied per archetype (mask-clipped).

## Near-Term Roadmap (Plain English)

- Add more baseline faces so the pipeline has more raw material to remix.
- Add more style passes so each base face can look radically different (different texture sets, tone grades, and lighting moods).

---

## Honest Reality Check

- **What works:**  
  Our pipeline reliably finds, cuts out, and highlights facial shapes and landmarks, ready for whatever art treatment we want next. It allows us to restyle “the same” face multiple ways (flat-shaded, painted, toon, glitch, etc.) and is flexible enough to let us quickly prototype new looks.
- **What it can’t do:**  
  It cannot generate truly new faces, nor automatically combine features into unseen humans. We’re locked to remaking or remixing the original set of faces, just with new visual spin.
- **Where the magic happens:**  
  All creative style changes—cartoon, painterly, stylized 3D, etc.—must come from how we render or process the outputs from this pipeline, not from inventing new geometry or faces from scratch.

**TL;DR:**  
With this setup, we can get lots of NPC portrait variety by altering colors, outlines, rendering effects, or overall style on top of a fixed, limited set of base faces. This provides enough flexibility for changing art direction or freshening up the look, but it’s not a replacement for true, high-diversity face generation. If we want every NPC to have a wholly unique bone structure or features, more advanced methods (and much more data) will be needed down the line.

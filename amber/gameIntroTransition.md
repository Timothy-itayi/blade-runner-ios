# Game Intro Transition: HUD Buildup Sequence

The transition from the terminal boot sequence to the live operator interface has been refined to emphasize the "calibration and sync" of the SUDBA system.

## Key Visual Enhancements

### 1. Sequential Title Reveal (Header)

The organization title `СУДЬБА (SUDBA)` no longer simply appears. It now fades in letter-by-letter from left to right during the `outline` stage, simulating a character-stream initialization.

### 2. Clock Synchronization (Split-Flap)

The digital clock now features a "sync" state. During the system buildup, the numbers cycle rapidly through random digits before locking onto the actual system time. This reinforces the idea that the local terminal is syncing with a master temporal source.

### 3. Layered Asset Initialization (Scan Panel)

The complexity of the scanning interface is added in distinct layers:

- **Layer 1**: Fingerprint slots and minutiae markers.
- **Layer 2**: Biometric data (Sex, BPM).
- **Layer 3**: System maintenance monitors (Blinking Bars).

Each layer has a timed fade-in, making the UI feel like it is being "assembled" in real-time.

### 4. Verification Flicker (Intel Panel)

The "VERIFICATION" button now exhibits a "low-power" flicker effect during the initial startup phase. This visual glitch indicates that the verification module is still warming up or establishing a secure connection.

### 5. Persistent Scramble-to-Sync (Data Panels)

Text scrambling has been synchronized with the buildup:

- Identification and Loc Records scramble indefinitely until the system is "Full".
- Subject Intel (Name, ID, etc.) remains scrambled and dimmed during the structural build-up, preventing data spoilers until the system is ready for operator input.

## Build Stages Reference

- **Wireframe**: Basic geometric structure and borders.
- **Outline**: Dynamic elements start initializing (Title stream, Clock sync, Button flicker).
- **Full**: UI locks in, scrambling settles, and the identification scan triggers.

## Files Involved

The following files were modified or created to implement this sequence:

- **`amber/app/index.tsx`**: Manages the high-level timing and state transitions (`hudStage`) of the buildup.
- **`amber/components/Header.tsx`**: Implements the sequential letter-by-letter title reveal.
- **`amber/components/DigitalClockSplitFlap.tsx`**: Handles the rapid-cycle synchronization effect for the system clock.
- **`amber/components/ScanPanel.tsx`**: Manages the layered fade-in of biometric and maintenance assets.
- **`amber/components/IntelPanel.tsx`**: Implements the verification button flicker and data scrambling during initialization.
- **`amber/components/ScanData.tsx`**: Home of the enhanced `TypewriterText` component used for persistent data reveal.
- **`amber/styles/ScanPanel.styles.ts`**: Updated to support the new monitoring layouts and expanded bar visualizer.
- **`amber/styles/IntelPanel.styles.ts`**: Refined for proper data alignment and color hierarchy.

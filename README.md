# AMBER

A narrative decision-making game built for iOS. Players operate as a security checkpoint operator in a dystopian sci-fi setting, investigating subjects and making APPROVE/DENY decisions that shape the narrative.

## Tech Stack

**Framework & Runtime**
- React Native 0.81.5 (Expo SDK ~54)
- React 19.1.0
- TypeScript 5.9.2 (strict mode)

**State Management**
- Zustand 5.0.10 — global game state (lives, equipment status, citations)
- React hooks (`useState`, `useEffect`) — component-local state and game flow
- Custom hooks (`useGameState`, `useGameHandlers`) — game logic abstraction

**Navigation & Routing**
- Expo Router 6.0.21 — file-based routing
- React Navigation 7.x — underlying navigation primitives

**Audio**
- expo-audio 1.1.1 — primary audio playback
- expo-av 16.0.8 — legacy video/audio support

**UI & Styling**
- Custom HUD-based design system
- Share Tech Mono (via `@expo-google-fonts/share-tech-mono`) — terminal aesthetic
- React Native Animated API — UI transitions and feedback
- expo-haptics — tactile feedback

**3D Graphics** (if used)
- Three.js 0.182.0
- @react-three/fiber 9.5.0
- @react-three/drei 10.7.7

**Persistence**
- @react-native-async-storage/async-storage 2.2.0 — save game state

**Development**
- ESLint 9.25.0 (expo config)
- Expo CLI — build tooling and dev server

## Architecture

**Project Structure**
```
amber/
├── app/              # Expo Router entry points
├── components/       # React components (game, intro, UI)
├── hooks/           # Custom React hooks (game state, audio, handlers)
├── store/           # Zustand stores (gameStore.ts)
├── data/            # Static game data (subjects, credentials, traits)
├── constants/       # Game constants (shifts, themes, messages)
├── utils/           # Utility functions (save manager, helpers)
├── types/           # TypeScript type definitions
└── assets/          # Media assets (audio, video, images)
```

**State Architecture**
- **Global state** (Zustand): Lives, equipment failures, citations — persists across sessions
- **Game state** (hooks): Current subject, scan status, decisions, gathered information — resets per shift
- **Component state**: UI visibility, animations, modal states — ephemeral

**Game Flow**
1. Intro sequence → boot sequence → operator assignment
2. Shift loop: subject appears → investigation → decision → consequences
3. Between shifts: news reports, personal messages, narrative progression
4. Save/load via AsyncStorage

**Decision System**
- Information-based deduction (no predetermined flags)
- Players gather intel via scans, credential checks, interrogation
- Decisions evaluated against gathered information
- Consequences accumulate across shifts

## Build & Run

```bash
cd amber
npm install
npm start          # Expo dev server
npm run ios        # Run on iOS simulator
npm run android    # Run on Android emulator
```

**Requirements**
- Node.js 18+
- iOS: Xcode 15+ (for native builds)
- EAS Build account (for TestFlight/App Store builds)

## Notes

- Currently in beta/demo stage (3 subjects)
- Uses Expo's new architecture (`newArchEnabled: true`)
- React Compiler enabled (`reactCompiler: true`)
- Strict TypeScript with path aliases (`@/*`)

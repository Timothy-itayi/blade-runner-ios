# Phase 1: Core Loop

## Goal

Build the foundational gameplay: subject appears → player investigates → player decides → feedback.

---

## What Gets Built

### Subject Processing Flow

```
SUBJECT APPEARS → SCAN → INTERROGATE → DECIDE → FEEDBACK
```

### Components

| Component | Description |
|-----------|-------------|
| Subject Display | Video/image of subject, name, basic info |
| Scan Panel | Biometric data, BPM, identity info |
| Interrogate Button | Ask questions, get responses |
| Decision Buttons | APPROVE / DENY |
| Feedback Display | Shows result of decision |

### Data Structures

```typescript
interface Subject {
  id: string;
  name: string;
  type: 'HUMAN' | 'REPLICANT' | 'HYBRID' | 'CONSTRUCT' | 'REMNANT' | 'UNKNOWN';
  origin: 'EARTH' | 'MARS' | 'EUROPA' | 'TITAN' | 'IO' | 'VOID';
  occupation: string;
  traits: string[];
  connections: string[]; // IDs of connected subjects
  greeting: string;
  responses: Record<string, string>;
}

interface Decision {
  subjectId: string;
  choice: 'APPROVE' | 'DENY';
  timestamp: number;
}
```

---

## MVP Scope

| Item | Count |
|------|-------|
| Subjects | 3 (one shift) |
| Questions per subject | 2 |
| Scan types | 1 (basic identity) |

---

## UI Requirements

### Subject View
- Full-screen subject video/image
- Name overlay
- Greeting text (typewriter effect)

### Scan Panel
- Identity info (name, type, origin)
- BPM display (static for Phase 1)
- Occupation

### Decision Buttons
- APPROVE (green)
- DENY (red)
- Disabled until scan complete

### Feedback
- Brief text showing decision registered
- Transition to next subject

---

## Acceptance Criteria

- [ ] Subject appears with video/image
- [ ] Name and greeting display
- [ ] Scan reveals basic info
- [ ] 2 questions can be asked
- [ ] APPROVE/DENY buttons work
- [ ] Decision is stored
- [ ] Next subject loads after decision
- [ ] Shift completes after 3 subjects

---

## Technical Notes

### State Management

```typescript
interface GameState {
  currentShift: number;
  currentSubjectIndex: number;
  decisions: Decision[];
  subjects: Subject[];
}
```

### Hooks

- `useGameState()` - manages game progression
- `useSubject()` - current subject data
- `useDecision()` - handles approve/deny logic

---

## Out of Scope (Phase 1)

- Directive system (Phase 2)
- Node map (Phase 3)
- Bug resolution (Phase 4)
- Stats/Wrapped (Phase 5)
- Multiple shifts (Phase 6)

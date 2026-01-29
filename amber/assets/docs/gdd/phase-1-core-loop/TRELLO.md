# Phase 1: Core Loop — Trello Board

## Lists

### 📋 Backlog

| Card | Labels | Description |
|------|--------|-------------|
| Define Subject data structure | `data` | Create TypeScript interfaces for Subject |
| Define Decision data structure | `data` | Create TypeScript interfaces for Decision |
| Define GameState structure | `data` | Create Zustand store interface |

---

### 🎨 Design

| Card | Labels | Description |
|------|--------|-------------|
| Subject view layout | `ui` | Figma/sketch of subject display |
| Scan panel layout | `ui` | Figma/sketch of scan info |
| Decision buttons layout | `ui` | APPROVE/DENY button design |
| Feedback display layout | `ui` | Post-decision feedback UI |

---

### 🔧 In Progress

| Card | Labels | Description |
|------|--------|-------------|
| — | — | — |

---

### 🧪 Testing

| Card | Labels | Description |
|------|--------|-------------|
| Subject display test | `qa` | Verify subject renders correctly |
| Decision flow test | `qa` | Verify approve/deny stores decision |
| Shift completion test | `qa` | Verify 3 subjects completes shift |

---

### ✅ Done

| Card | Labels | Description |
|------|--------|-------------|
| — | — | — |

---

## Cards (Detailed)

### Data Layer

**Card: Define Subject data structure**
```
Labels: data, priority-high
Checklist:
- [ ] Create Subject interface
- [ ] Create SubjectType enum
- [ ] Create Origin enum
- [ ] Add to types/subject.ts
```

**Card: Define Decision data structure**
```
Labels: data, priority-high
Checklist:
- [ ] Create Decision interface
- [ ] Add timestamp field
- [ ] Add to types/decision.ts
```

**Card: Define GameState structure**
```
Labels: data, priority-high
Checklist:
- [ ] Create GameState interface
- [ ] Implement Zustand store
- [ ] Add currentShift, currentSubjectIndex
- [ ] Add decisions array
```

---

### Components

**Card: SubjectDisplay component**
```
Labels: ui, priority-high
Checklist:
- [ ] Create component shell
- [ ] Add video/image display
- [ ] Add name overlay
- [ ] Add greeting typewriter effect
- [ ] Style with cassette futurism theme
```

**Card: ScanPanel component**
```
Labels: ui, priority-medium
Checklist:
- [ ] Create component shell
- [ ] Display name, type, origin
- [ ] Display occupation
- [ ] Display BPM (static)
- [ ] Style with mechanical UI
```

**Card: DecisionButtons component**
```
Labels: ui, priority-high
Checklist:
- [ ] Create APPROVE button (green)
- [ ] Create DENY button (red)
- [ ] Add disabled state
- [ ] Connect to decision handler
- [ ] Add haptic feedback
```

**Card: InterrogatePanel component**
```
Labels: ui, priority-medium
Checklist:
- [ ] Create question display
- [ ] Create response display
- [ ] Limit to 2 questions
- [ ] Typewriter effect for responses
```

---

### Logic

**Card: useGameState hook**
```
Labels: logic, priority-high
Checklist:
- [ ] Track current shift
- [ ] Track current subject index
- [ ] Track decisions array
- [ ] Add nextSubject() function
- [ ] Add completeShift() function
```

**Card: useDecision hook**
```
Labels: logic, priority-high
Checklist:
- [ ] Create approve() function
- [ ] Create deny() function
- [ ] Store decision with timestamp
- [ ] Trigger next subject
```

---

### Testing

**Card: Subject display test**
```
Labels: qa, priority-medium
Checklist:
- [ ] Subject video/image renders
- [ ] Name displays correctly
- [ ] Greeting animates
```

**Card: Decision flow test**
```
Labels: qa, priority-high
Checklist:
- [ ] APPROVE stores decision
- [ ] DENY stores decision
- [ ] Next subject loads
- [ ] Decision persists in state
```

**Card: Shift completion test**
```
Labels: qa, priority-medium
Checklist:
- [ ] 3 subjects completes shift
- [ ] Shift end triggers correctly
- [ ] State resets for next shift
```

---

## Labels

| Label | Color | Use For |
|-------|-------|---------|
| `data` | Blue | Data structures, types |
| `ui` | Purple | UI components |
| `logic` | Green | Hooks, business logic |
| `qa` | Orange | Testing tasks |
| `priority-high` | Red | Do first |
| `priority-medium` | Yellow | Do second |
| `priority-low` | Gray | Do if time |

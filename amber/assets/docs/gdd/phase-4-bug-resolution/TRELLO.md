# Phase 4: Bug Resolution — Trello Board

## Lists

### 📋 Backlog

| Card | Labels | Description |
|------|--------|-------------|
| Define ResolutionOption type | `data` | The 5 options |
| Define Resolution interface | `data` | Resolution record |
| Define BugResolutionState | `data` | Queue and progress state |
| Create resolution store | `data` | Zustand store |

---

### 🎨 Design

| Card | Labels | Description |
|------|--------|-------------|
| Resolution prompt layout | `ui` | Full-screen prompt design |
| Option button design | `ui` | Vertical stack, labels |
| Transition animations | `ui` | Selection → map update |

---

### 🔧 In Progress

| Card | Labels | Description |
|------|--------|-------------|
| — | — | — |

---

### 🧪 Testing

| Card | Labels | Description |
|------|--------|-------------|
| Resolution flow test | `qa` | All 5 options work |
| Node map integration test | `qa` | Map updates correctly |
| Edge case test | `qa` | 0 denials, 3 denials |

---

### ✅ Done

| Card | Labels | Description |
|------|--------|-------------|
| — | — | — |

---

## Cards (Detailed)

### Data Layer

**Card: Define ResolutionOption type**
```
Labels: data, priority-high
Checklist:
- [ ] SEND
- [ ] FIX
- [ ] PASS
- [ ] HOLD
- [ ] RELEASE
```

**Card: Define Resolution interface**
```
Labels: data, priority-high
Checklist:
- [ ] subjectId: string
- [ ] option: ResolutionOption
- [ ] timestamp: number
- [ ] resultingNodeId?: string
```

**Card: Define BugResolutionState**
```
Labels: data, priority-high
Checklist:
- [ ] pendingSubjects: string[]
- [ ] currentIndex: number
- [ ] resolutions: Resolution[]
```

**Card: Create resolution Zustand store**
```
Labels: data, priority-high
Checklist:
- [ ] Initialize from denied decisions
- [ ] getCurrentSubject()
- [ ] resolveSubject(option)
- [ ] nextSubject()
- [ ] isComplete()
```

---

### Components

**Card: ResolutionScreen component**
```
Labels: ui, priority-high
Checklist:
- [ ] Full-screen container
- [ ] Subject name header
- [ ] "DENIED — AWAITING ASSIGNMENT" subtitle
- [ ] Option buttons stack
- [ ] Transition to next on selection
```

**Card: ResolutionOption component**
```
Labels: ui, priority-high
Checklist:
- [ ] Button with label
- [ ] Description text below
- [ ] Tap handler
- [ ] Pressed state
```

**Card: ResolutionTransition component**
```
Labels: ui, priority-medium
Checklist:
- [ ] Brief animation on selection
- [ ] Fade to node map update
- [ ] Fade to next prompt (or shift start)
```

---

### Logic

**Card: SEND resolution logic**
```
Labels: logic, priority-high
Checklist:
- [ ] Generate station ID
- [ ] Create station node
- [ ] Create ROUTE edge from subject
- [ ] Update node map store
```

**Card: FIX resolution logic**
```
Labels: logic, priority-high
Checklist:
- [ ] Generate successor ID ([name]-2)
- [ ] Create successor node
- [ ] Update original node label
- [ ] Create edge original → successor
- [ ] Update node map store
```

**Card: PASS resolution logic**
```
Labels: logic, priority-high
Checklist:
- [ ] Ensure Central node exists
- [ ] Create ESCALATE edge
- [ ] Update subject state → pending
```

**Card: HOLD resolution logic**
```
Labels: logic, priority-high
Checklist:
- [ ] Update subject state → held
- [ ] Mark connection with X
- [ ] No new nodes
```

**Card: RELEASE resolution logic**
```
Labels: logic, priority-high
Checklist:
- [ ] Update subject state → gone
- [ ] Empty node (no fill)
- [ ] Update label → "[NAME] — GONE"
```

---

### Integration

**Card: Connect shift end to resolution**
```
Labels: logic, priority-high
Checklist:
- [ ] On shift complete, get denied subjects
- [ ] Initialize resolution queue
- [ ] Transition to resolution screen
```

**Card: Connect resolution to next shift**
```
Labels: logic, priority-high
Checklist:
- [ ] On resolution complete, start next shift
- [ ] Handle case: 0 denied subjects
```

---

### Testing

**Card: Resolution flow test**
```
Labels: qa, priority-high
Checklist:
- [ ] SEND creates station node
- [ ] FIX creates successor node
- [ ] PASS connects to Central
- [ ] HOLD freezes node
- [ ] RELEASE empties node
```

**Card: Node map integration test**
```
Labels: qa, priority-high
Checklist:
- [ ] Node map reflects resolution
- [ ] New nodes positioned correctly
- [ ] Edges render correctly
```

**Card: Edge case test**
```
Labels: qa, priority-medium
Checklist:
- [ ] 0 denials → skip resolution
- [ ] 3 denials → all resolve
- [ ] Mixed decisions
```

---

## Labels

| Label | Color | Use For |
|-------|-------|---------|
| `data` | Blue | Data structures |
| `ui` | Purple | UI components |
| `logic` | Green | Business logic |
| `qa` | Orange | Testing |
| `priority-high` | Red | Do first |
| `priority-medium` | Yellow | Do second |

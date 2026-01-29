# Phase 5: The Wrapped — Trello Board

## Lists

### 📋 Backlog

| Card | Labels | Description |
|------|--------|-------------|
| Define ShiftSummary interface | `data` | Stats data structure |
| Calculate shift summary | `logic` | Derive stats from decisions |
| Create AMBER messages | `content` | 3+ message variants |

---

### 🎨 Design

| Card | Labels | Description |
|------|--------|-------------|
| Wrapped screen layout | `ui` | Full layout design |
| Stats visualization | `ui` | Pie/bar chart design |
| Animation timing | `ui` | Sequence and duration |
| AMBER message style | `ui` | Typography, positioning |

---

### 🔧 In Progress

| Card | Labels | Description |
|------|--------|-------------|
| — | — | — |

---

### 🧪 Testing

| Card | Labels | Description |
|------|--------|-------------|
| Stats calculation test | `qa` | Correct counts |
| Animation test | `qa` | Smooth, correct timing |
| Flow test | `qa` | Wrapped → Resolution |

---

### ✅ Done

| Card | Labels | Description |
|------|--------|-------------|
| — | — | — |

---

## Cards (Detailed)

### Data Layer

**Card: Define ShiftSummary interface**
```
Labels: data, priority-high
Checklist:
- [ ] shiftId: number
- [ ] subjectsProcessed: number
- [ ] approved: number
- [ ] denied: number
- [ ] consequences object
- [ ] avgDecisionTimeMs (optional)
- [ ] timestamp: number
```

**Card: Calculate shift summary**
```
Labels: logic, priority-high
Checklist:
- [ ] Count approved decisions
- [ ] Count denied decisions
- [ ] Count casualties from node map
- [ ] Calculate avg time (optional)
- [ ] Create ShiftSummary object
```

---

### Content

**Card: Create AMBER messages**
```
Labels: content, priority-medium
Checklist:
- [ ] Generic success message
- [ ] High efficiency message
- [ ] Neutral message
- [ ] (Future: consequence-aware messages)
```

**Message Examples:**
```
1. "SHIFT COMPLETE. PROCESSING EFFICIENCY: ACCEPTABLE. GOOD WORK, OPERATOR."
2. "3 SUBJECTS PROCESSED. THROUGHPUT WITHIN PARAMETERS. AMBER THANKS YOU."
3. "SHIFT 1 CONCLUDED. 0 CITATIONS. 0 WARNINGS. CONTINUE TO NEXT SHIFT."
```

---

### Components

**Card: WrappedScreen component**
```
Labels: ui, priority-high
Checklist:
- [ ] Full-screen container
- [ ] Title: "SHIFT X COMPLETE"
- [ ] Stats section
- [ ] Visualization section
- [ ] Node map preview
- [ ] AMBER message
- [ ] Continue button
```

**Card: StatCounter component**
```
Labels: ui, priority-medium
Checklist:
- [ ] Animated count from 0 to value
- [ ] Label below number
- [ ] Color coding (green/red)
- [ ] Easing function for animation
```

**Card: StatsVisualization component**
```
Labels: ui, priority-medium
Checklist:
- [ ] Pie chart OR bar chart
- [ ] Animated fill
- [ ] Green for approved
- [ ] Red for denied
- [ ] Legend labels
```

**Card: AmberMessage component**
```
Labels: ui, priority-medium
Checklist:
- [ ] Typewriter text effect
- [ ] Synthetic/corporate styling
- [ ] Fade in after stats
```

**Card: NodeMapPreview component**
```
Labels: ui, priority-medium
Checklist:
- [ ] Scaled-down node map
- [ ] Non-interactive (view only)
- [ ] Highlight new nodes/edges
- [ ] Zoom to fit all
```

---

### Animation

**Card: Wrapped animation sequence**
```
Labels: ui, priority-medium
Checklist:
- [ ] Title fade in (0.5s)
- [ ] Stat counters animate (1s)
- [ ] Visualization fills (0.5s)
- [ ] Node map zoom (1s)
- [ ] AMBER message types (1s)
- [ ] Button fade in (0.3s)
```

---

### Integration

**Card: Connect shift end to wrapped**
```
Labels: logic, priority-high
Checklist:
- [ ] On last decision, calculate summary
- [ ] Transition to wrapped screen
- [ ] Pass summary data to screen
```

**Card: Connect wrapped to resolution**
```
Labels: logic, priority-high
Checklist:
- [ ] On continue, check for denied subjects
- [ ] If denials: go to resolution
- [ ] If no denials: go to next shift
```

---

### Testing

**Card: Stats calculation test**
```
Labels: qa, priority-high
Checklist:
- [ ] 3 approved = shows 3
- [ ] 1 denied = shows 1
- [ ] 0 casualties = shows 0
- [ ] Mixed decisions correct
```

**Card: Animation test**
```
Labels: qa, priority-medium
Checklist:
- [ ] Count animation smooth
- [ ] Visualization fills correctly
- [ ] Typewriter works
- [ ] Total time ~4s
```

**Card: Flow test**
```
Labels: qa, priority-high
Checklist:
- [ ] Wrapped appears after shift
- [ ] Continue leads to resolution
- [ ] No denials skips resolution
```

---

## Labels

| Label | Color | Use For |
|-------|-------|---------|
| `data` | Blue | Data structures |
| `ui` | Purple | UI components |
| `logic` | Green | Business logic |
| `content` | Teal | Writing, messages |
| `qa` | Orange | Testing |
| `priority-high` | Red | Do first |
| `priority-medium` | Yellow | Do second |

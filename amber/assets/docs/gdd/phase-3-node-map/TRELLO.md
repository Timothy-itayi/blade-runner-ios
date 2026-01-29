# Phase 3: Node Map — Trello Board

## Lists

### 📋 Backlog

| Card | Labels | Description |
|------|--------|-------------|
| Define NodeMapNode interface | `data` | Node data structure |
| Define NodeMapEdge interface | `data` | Edge data structure |
| Define NodeState enum | `data` | All node states |
| Create NodeMap store | `data` | Zustand store for map |

---

### 🎨 Design

| Card | Labels | Description |
|------|--------|-------------|
| Node visual design | `ui` | Player, subject, station nodes |
| Edge visual design | `ui` | Line styles, colors |
| State color palette | `ui` | Green, red, gray, yellow, blue |
| Label typography | `ui` | Font, size, positioning |

---

### 🔧 In Progress

| Card | Labels | Description |
|------|--------|-------------|
| — | — | — |

---

### 🧪 Testing

| Card | Labels | Description |
|------|--------|-------------|
| Node rendering test | `qa` | All node types render |
| Edge rendering test | `qa` | All edge types render |
| Interaction test | `qa` | Tap, pan, zoom work |
| Performance test | `qa` | 10+ nodes renders at 60fps |

---

### ✅ Done

| Card | Labels | Description |
|------|--------|-------------|
| — | — | — |

---

## Cards (Detailed)

### Data Layer

**Card: Define NodeMapNode interface**
```
Labels: data, priority-high
Checklist:
- [ ] id: string
- [ ] type: 'player' | 'subject' | 'station' | 'central'
- [ ] label: string
- [ ] state: NodeState
- [ ] position: { x, y }
- [ ] subjectId?: string
```

**Card: Define NodeMapEdge interface**
```
Labels: data, priority-high
Checklist:
- [ ] id: string
- [ ] from: string
- [ ] to: string
- [ ] type: edge type enum
- [ ] label?: string
```

**Card: Define NodeState enum**
```
Labels: data, priority-high
Checklist:
- [ ] approved-clean
- [ ] approved-harm
- [ ] denied-clean
- [ ] denied-harm
- [ ] held
- [ ] gone
- [ ] pending
```

**Card: Create NodeMap Zustand store**
```
Labels: data, priority-high
Checklist:
- [ ] nodes array
- [ ] edges array
- [ ] addNode() function
- [ ] addEdge() function
- [ ] updateNodeState() function
- [ ] getNodeById() function
```

---

### Components

**Card: NodeMapCanvas component**
```
Labels: ui, priority-high
Checklist:
- [ ] Create SVG canvas
- [ ] Implement pan gesture
- [ ] Implement pinch-to-zoom
- [ ] Render nodes from store
- [ ] Render edges from store
```

**Card: MapNode component**
```
Labels: ui, priority-high
Checklist:
- [ ] Circle for subjects
- [ ] Distinct style for player
- [ ] Square for stations
- [ ] Diamond for central
- [ ] Ring color by state
- [ ] Label text below
```

**Card: MapEdge component**
```
Labels: ui, priority-medium
Checklist:
- [ ] Solid line for decision
- [ ] Dashed line for consequence
- [ ] Arrow for route
- [ ] Dotted for escalate
- [ ] Red for death
```

**Card: NodePopup component**
```
Labels: ui, priority-medium
Checklist:
- [ ] Appears on node tap
- [ ] Shows subject details
- [ ] Shows decision made
- [ ] Shows outcome
- [ ] Dismiss on tap outside
```

---

### Logic

**Card: Layout algorithm**
```
Labels: logic, priority-high
Checklist:
- [ ] Player at center
- [ ] Subjects in circle (radius 150)
- [ ] Calculate positions for n subjects
- [ ] Update positions on resolution
```

**Card: Connect decisions to map**
```
Labels: logic, priority-high
Checklist:
- [ ] On approve: add edge player→subject
- [ ] On deny: add edge player→subject, set pending
- [ ] Update node state based on consequence
```

**Card: Consequence chain logic**
```
Labels: logic, priority-medium
Checklist:
- [ ] Define consequence relationships in subject data
- [ ] On approve: check if causes harm
- [ ] Add consequence edges
- [ ] Update affected node states
```

---

### Animation

**Card: Node animations**
```
Labels: ui, priority-low
Checklist:
- [ ] Fade in on create
- [ ] Pulse on state change
- [ ] Empty animation for GONE
```

**Card: Edge animations**
```
Labels: ui, priority-low
Checklist:
- [ ] Draw from source to target
- [ ] Red pulse for death edges
```

---

### Testing

**Card: Node rendering test**
```
Labels: qa, priority-high
Checklist:
- [ ] Player node visible
- [ ] Subject nodes visible
- [ ] Correct colors by state
- [ ] Labels readable
```

**Card: Edge rendering test**
```
Labels: qa, priority-medium
Checklist:
- [ ] Decision edges render
- [ ] Consequence edges render
- [ ] Correct line styles
```

**Card: Interaction test**
```
Labels: qa, priority-medium
Checklist:
- [ ] Tap shows popup
- [ ] Pan moves canvas
- [ ] Zoom works
```

**Card: Performance test**
```
Labels: qa, priority-medium
Checklist:
- [ ] 10 nodes at 60fps
- [ ] 20 nodes at 60fps
- [ ] Identify threshold
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
| `priority-low` | Gray | Nice to have |

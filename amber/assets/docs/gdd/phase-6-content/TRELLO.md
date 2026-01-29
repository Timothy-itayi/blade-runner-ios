# Phase 6: Content & Polish — Trello Board

## Lists

### 📋 Backlog

| Card | Labels | Description |
|------|--------|-------------|
| Define subject roster | `content` | All 36 subjects |
| Define directive ladder | `content` | All 9 directives |
| Define consequence chains | `content` | 15+ chains |
| Source video assets | `assets` | 36 subject videos |

---

### 🎨 Design

| Card | Labels | Description |
|------|--------|-------------|
| Subject visual style guide | `ui` | Consistent look |
| Endgame sequence design | `ui` | Final wrapped |
| Audio style guide | `audio` | Sound design direction |

---

### 🔧 In Progress

| Card | Labels | Description |
|------|--------|-------------|
| — | — | — |

---

### 🧪 Testing

| Card | Labels | Description |
|------|--------|-------------|
| Full playthrough test | `qa` | All 36 subjects |
| Consequence chain test | `qa` | All chains trigger |
| Performance test | `qa` | 36 subjects, large map |

---

### ✅ Done

| Card | Labels | Description |
|------|--------|-------------|
| — | — | — |

---

## Cards (Detailed)

### Subjects - Shift 1

**Card: Subject 1 - EVA**
```
Labels: content, shift-1
Checklist:
- [ ] Define traits
- [ ] Write greeting
- [ ] Write responses
- [ ] Define connections
- [ ] Source video
- [ ] Test in game
```

**Card: Subject 2 - REX**
```
Labels: content, shift-1
Checklist:
- [ ] Define traits (warrant)
- [ ] Write greeting
- [ ] Write responses
- [ ] Define connections (to Orin)
- [ ] Source video
- [ ] Test in game
```

**Card: Subject 3 - NOVA**
```
Labels: content, shift-1
Checklist:
- [ ] Define traits (replicant)
- [ ] Write greeting
- [ ] Write responses
- [ ] Define connections
- [ ] Source video
- [ ] Test in game
```

**Card: Subject 4 - CASS**
```
Labels: content, shift-1
Checklist:
- [ ] Define traits (medical)
- [ ] Write greeting
- [ ] Write responses
- [ ] Define connections (to Luca, child)
- [ ] Source video
- [ ] Test in game
```

---

### Subjects - Shift 2

**Card: Subject 5 - VEX**
```
Labels: content, shift-2
```

**Card: Subject 6 - KIRA**
```
Labels: content, shift-2
```

**Card: Subject 7 - SOL**
```
Labels: content, shift-2
```

**Card: Subject 8 - RHEA**
```
Labels: content, shift-2
```

---

### Subjects - Shift 3

**Card: Subject 9 - ORIN**
```
Labels: content, shift-3
```

**Card: Subject 10 - JACE**
```
Labels: content, shift-3
```

**Card: Subject 11 - ZARA**
```
Labels: content, shift-3
```

**Card: Subject 12 - LUCA**
```
Labels: content, shift-3
```

---

### Directives

**Card: Directive ladder implementation**
```
Labels: logic, priority-high
Checklist:
- [ ] Shift 1: DENY WARRANTS
- [ ] Shift 2: DENY ENGINEERS EXCEPT HUMANS
- [ ] Shift 3: DENY REPLICANTS EXCEPT VIP
- [ ] Shift 4: DENY TITAN EXCEPT MEDICAL
- [ ] Shift 5: DENY SYNTHETICS EXCEPT VIP/MEDICAL
- [ ] Shift 6: DENY WARRANTS+IO EXCEPT EARTH
- [ ] Shift 7: DENY REMNANTS+CONSTRUCTS EXCEPT VIP
- [ ] Shift 8: DENY NON-HUMANS EXCEPT VIP/MEDICAL
- [ ] Shift 9: DENY ALL EXCEPT VIP
```

---

### Consequence Chains

**Card: Chain 1 - The Weapon**
```
Labels: content, priority-high
Checklist:
- [ ] Eva carries component
- [ ] Kira is assembler
- [ ] Jace is target
- [ ] Logic: Eva+Kira approved → Jace dies
- [ ] Test chain
```

**Card: Chain 2 - The Information**
```
Labels: content, priority-high
Checklist:
- [ ] Rex has intel
- [ ] Orin is leader
- [ ] Logic: Rex approved → Orin flagged
- [ ] Test chain
```

**Card: Chain 3 - The Family**
```
Labels: content, priority-high
Checklist:
- [ ] Cass has child
- [ ] Luca is guardian
- [ ] Logic: denials affect child
- [ ] Test chain
```

---

### Assets

**Card: Source subject videos**
```
Labels: assets, priority-high
Checklist:
- [ ] Shift 1: 4 videos
- [ ] Shift 2: 4 videos
- [ ] Shift 3: 4 videos
- [ ] Shifts 4-6: 12 videos
- [ ] Shifts 7-9: 12 videos
- [ ] All 36 in correct format
```

**Card: Create audio assets**
```
Labels: assets, audio, priority-medium
Checklist:
- [ ] Scan sounds
- [ ] Decision sounds
- [ ] Resolution sounds
- [ ] Wrapped sounds
- [ ] AMBER voice lines
```

---

### Endgame

**Card: Final subject (NICO)**
```
Labels: content, priority-high
Checklist:
- [ ] Define convergence logic
- [ ] Write conditional dialogue
- [ ] Define multiple outcomes
- [ ] Test all paths
```

**Card: Final wrapped sequence**
```
Labels: ui, priority-high
Checklist:
- [ ] Full map zoom out
- [ ] 36 name scroll
- [ ] Pattern statistics
- [ ] AMBER final message
- [ ] Credits/end
```

---

### Testing

**Card: Full playthrough test**
```
Labels: qa, priority-high
Checklist:
- [ ] Complete all 36 subjects
- [ ] All directives work
- [ ] All consequences trigger
- [ ] Endgame triggers
- [ ] No crashes
```

**Card: Performance test**
```
Labels: qa, priority-high
Checklist:
- [ ] 36-node map renders
- [ ] 60fps maintained
- [ ] Memory usage acceptable
- [ ] No lag on transitions
```

---

## Labels

| Label | Color | Use For |
|-------|-------|---------|
| `content` | Teal | Subjects, dialogue, chains |
| `assets` | Pink | Video, audio, images |
| `audio` | Purple | Sound design |
| `ui` | Blue | UI components |
| `logic` | Green | Game logic |
| `qa` | Orange | Testing |
| `shift-1` | Light gray | Shift 1 subjects |
| `shift-2` | Gray | Shift 2 subjects |
| `shift-3` | Dark gray | Shift 3 subjects |
| `priority-high` | Red | Do first |
| `priority-medium` | Yellow | Do second |

---

## Milestones

### Alpha (MVP)
- 9 subjects (Shifts 1-3)
- 3 directives
- 3 consequence chains
- Core loop complete

### Beta
- 24 subjects (Shifts 1-6)
- 6 directives
- 9 consequence chains
- Full wrapped

### Release
- 36 subjects (All shifts)
- 9 directives
- 15+ consequence chains
- Endgame complete
- Full polish

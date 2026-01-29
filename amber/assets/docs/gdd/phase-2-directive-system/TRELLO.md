# Phase 2: Directive System — Trello Board

## Lists

### 📋 Backlog

| Card | Labels | Description |
|------|--------|-------------|
| Define Directive data structure | `data` | TypeScript interfaces |
| Define DenyCategory enum | `data` | All deny categories |
| Define ExceptionCondition enum | `data` | All exception conditions |
| Create directive evaluation logic | `logic` | shouldDeny function |

---

### 🎨 Design

| Card | Labels | Description |
|------|--------|-------------|
| Shift briefing screen | `ui` | Directive display at shift start |
| Persistent directive header | `ui` | During-processing display |
| Directive visual language | `ui` | Colors, typography, hierarchy |

---

### 🔧 In Progress

| Card | Labels | Description |
|------|--------|-------------|
| — | — | — |

---

### 🧪 Testing

| Card | Labels | Description |
|------|--------|-------------|
| Directive logic test | `qa` | Verify rule evaluation |
| Exception logic test | `qa` | Verify exceptions work |
| Edge case test | `qa` | Multiple categories/exceptions |

---

### ✅ Done

| Card | Labels | Description |
|------|--------|-------------|
| — | — | — |

---

## Cards (Detailed)

### Data Layer

**Card: Define Directive data structure**
```
Labels: data, priority-high
Checklist:
- [ ] Create Directive interface
- [ ] Add shiftId field
- [ ] Add denyCategories array
- [ ] Add exceptions array
- [ ] Add displayText object
- [ ] Add to types/directive.ts
```

**Card: Define DenyCategory enum**
```
Labels: data, priority-high
Checklist:
- [ ] WARRANTS
- [ ] REPLICANTS
- [ ] ENGINEERS
- [ ] TITAN_ORIGIN
- [ ] SYNTHETICS
```

**Card: Define ExceptionCondition enum**
```
Labels: data, priority-high
Checklist:
- [ ] HUMANS
- [ ] VIP
- [ ] MEDICAL
- [ ] EARTH_ORIGIN
```

**Card: Create 3 MVP directives**
```
Labels: data, priority-medium
Checklist:
- [ ] Shift 1: DENY WARRANTS
- [ ] Shift 2: DENY ENGINEERS EXCEPT HUMANS
- [ ] Shift 3: DENY REPLICANTS EXCEPT VIP/MEDICAL
```

---

### Logic

**Card: Create directive evaluation logic**
```
Labels: logic, priority-high
Checklist:
- [ ] Create shouldDeny() function
- [ ] Implement category matching
- [ ] Implement exception matching
- [ ] Return boolean result
- [ ] Add unit tests
```

**Card: Create category matcher**
```
Labels: logic, priority-high
Checklist:
- [ ] subjectMatchesCategory() function
- [ ] Handle all DenyCategory values
- [ ] Return boolean
```

**Card: Create exception matcher**
```
Labels: logic, priority-high
Checklist:
- [ ] subjectMatchesCondition() function
- [ ] Handle all ExceptionCondition values
- [ ] Return boolean
```

---

### Components

**Card: ShiftBriefing component**
```
Labels: ui, priority-high
Checklist:
- [ ] Create component shell
- [ ] Display directive text
- [ ] DENY in red text
- [ ] EXCEPT in yellow text
- [ ] "Begin Shift" button
- [ ] Transition animation
```

**Card: DirectiveHeader component**
```
Labels: ui, priority-medium
Checklist:
- [ ] Compact directive display
- [ ] Fixed position during processing
- [ ] Same color language as briefing
- [ ] Collapsible/expandable (optional)
```

---

### Integration

**Card: Connect directive to decision flow**
```
Labels: logic, priority-high
Checklist:
- [ ] Load directive at shift start
- [ ] Pass directive to decision logic
- [ ] Evaluate decision against directive
- [ ] Store result in decision record
```

---

### Testing

**Card: Directive logic test**
```
Labels: qa, priority-high
Checklist:
- [ ] Subject with warrant → DENY
- [ ] Subject without warrant → APPROVE OK
- [ ] Engineer + Human → exception applies
- [ ] Engineer + Replicant → DENY
```

**Card: Exception logic test**
```
Labels: qa, priority-high
Checklist:
- [ ] VIP exception works
- [ ] MEDICAL exception works
- [ ] Multiple exceptions tested
```

**Card: Edge case test**
```
Labels: qa, priority-medium
Checklist:
- [ ] Subject matches multiple deny categories
- [ ] Subject matches multiple exceptions
- [ ] Empty exceptions array
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

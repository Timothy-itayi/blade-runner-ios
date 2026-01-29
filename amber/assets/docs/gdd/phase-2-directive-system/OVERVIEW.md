# Phase 2: Directive System

## Goal

Implement the rule system that gives players clear reasons to APPROVE or DENY.

---

## Core Concept

Each shift has a directive with optional exceptions. The player checks if the subject matches the rule.

```
DENY: [CATEGORY]
EXCEPT: [CONDITION]
```

---

## Rule Logic

```typescript
function shouldDeny(subject: Subject, directive: Directive): boolean {
  // Check if subject matches DENY category
  const matchesDeny = directive.denyCategories.some(cat => 
    subjectMatchesCategory(subject, cat)
  );
  
  if (!matchesDeny) return false;
  
  // Check if subject matches any exception
  const matchesException = directive.exceptions.some(exc => 
    subjectMatchesCondition(subject, exc)
  );
  
  return !matchesException;
}
```

---

## Directive Categories

### Deny Categories (What to reject)

| Category | Matches |
|----------|---------|
| `WARRANTS` | subject.hasWarrant === true |
| `REPLICANTS` | subject.type === 'REPLICANT' |
| `ENGINEERS` | subject.occupation === 'ENGINEER' |
| `TITAN` | subject.origin === 'TITAN' |
| `SYNTHETICS` | subject.type in ['REPLICANT', 'CONSTRUCT'] |

### Exception Conditions (Who is exempt)

| Condition | Matches |
|-----------|---------|
| `HUMANS` | subject.type === 'HUMAN' |
| `VIP` | subject.clearance === 'VIP' |
| `MEDICAL` | subject.hasMedicalEmergency === true |
| `EARTH_ORIGIN` | subject.origin === 'EARTH' |

---

## Directive Progression

### Shift 1: Tutorial
```
DENY: WARRANTS
```
Simple. One rule. No exceptions.

### Shift 2: First Exception
```
DENY: ENGINEERS
EXCEPT: HUMANS
```
Introduces exception logic.

### Shift 3: Stacked Exceptions
```
DENY: REPLICANTS
EXCEPT: VIP
EXCEPT: MEDICAL
```
Multiple exceptions to check.

---

## Data Structures

```typescript
interface Directive {
  id: string;
  shiftId: number;
  denyCategories: DenyCategory[];
  exceptions: ExceptionCondition[];
  displayText: {
    deny: string;
    except: string[];
  };
}

type DenyCategory = 
  | 'WARRANTS' 
  | 'REPLICANTS' 
  | 'ENGINEERS' 
  | 'TITAN_ORIGIN'
  | 'SYNTHETICS';

type ExceptionCondition = 
  | 'HUMANS' 
  | 'VIP' 
  | 'MEDICAL' 
  | 'EARTH_ORIGIN';
```

---

## UI Requirements

### Directive Display
- Shown at shift start (briefing screen)
- Persistent during processing (header or sidebar)
- Clear visual hierarchy: DENY in red, EXCEPT in yellow

### Example UI
```
┌─────────────────────────────────┐
│  SHIFT DIRECTIVE                │
│                                 │
│  DENY: ENGINEERS                │
│  EXCEPT: HUMANS                 │
│                                 │
└─────────────────────────────────┘
```

---

## MVP Scope

| Item | Count |
|------|-------|
| Directives | 3 (one per shift) |
| Deny categories | 3 |
| Exception conditions | 3 |

---

## Acceptance Criteria

- [ ] Directive displays at shift start
- [ ] Directive visible during processing
- [ ] Rule logic correctly evaluates subjects
- [ ] Exception logic correctly exempts subjects
- [ ] Feedback indicates if decision followed directive
- [ ] 3 distinct directives implemented

---

## Out of Scope (Phase 2)

- Consequence tracking (Phase 3)
- Bug resolution (Phase 4)
- Complex stacked rules (Phase 6)

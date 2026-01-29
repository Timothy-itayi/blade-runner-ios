# Phase 6: Content & Polish

## Goal

Create the full subject roster, directive ladder, consequence chains, and polish for release.

---

## Scope

| Item | MVP | Full |
|------|-----|------|
| Shifts | 3 | 9 |
| Subjects | 9 | 36 |
| Directives | 3 | 9 |
| Consequence chains | 3 | 15+ |

---

## Subject Roster

### Naming Guidelines

- **Short**: 1-2 syllables preferred
- **Distinct**: No similar sounds (avoid Mara/Maya)
- **Memorable**: Easy to reference in node map
- **Mixed origins**: Variety of cultural influences

### Subject Template

```typescript
interface SubjectContent {
  // Identity
  name: string;           // "KIRA"
  type: SubjectType;      // "REPLICANT"
  origin: Origin;         // "TITAN"
  occupation: string;     // "Engineer"
  
  // Visuals
  videoAsset: string;     // Path to video
  imageAsset: string;     // Fallback image
  
  // Traits (for directive matching)
  traits: string[];       // ["VIP", "MEDICAL"]
  hasWarrant: boolean;
  clearance: string;      // "STANDARD" | "VIP"
  
  // Dialogue
  greeting: string;
  responses: Record<string, string>;
  
  // Connections
  connections: {
    subjectId: string;
    relationship: string; // "sibling", "colleague", "target"
    consequenceIfApproved?: string;
    consequenceIfDenied?: string;
  }[];
}
```

---

## Subject List (36 Total)

### Shift 1: Tutorial (4 subjects)

| # | Name | Type | Origin | Hook |
|---|------|------|--------|------|
| 1 | **EVA** | Human | Mars | Clean, baseline subject |
| 2 | **REX** | Human | Titan | Has warrant |
| 3 | **NOVA** | Replicant | Europa | No warrant, exception test |
| 4 | **CASS** | Human | Earth | Medical emergency |

### Shift 2: First Complexity (4 subjects)

| # | Name | Type | Origin | Hook |
|---|------|------|--------|------|
| 5 | **VEX** | Hybrid | Mars | VIP clearance, arrogant |
| 6 | **KIRA** | Replicant | Titan | Engineer, connected to Rex |
| 7 | **SOL** | Human | Io | Damaged credentials |
| 8 | **RHEA** | Construct | Europa | Corporate envoy |

### Shift 3: Stakes Rise (4 subjects)

| # | Name | Type | Origin | Hook |
|---|------|------|--------|------|
| 9 | **ORIN** | Replicant | Titan | Philosophical, clean |
| 10 | **JACE** | Human | Mars | Connected to Kira |
| 11 | **ZARA** | Remnant | Void | Glitching, unstable |
| 12 | **LUCA** | Human | Earth | VIP, hiding something |

### Shifts 4-6: Full Complexity (12 subjects)

Names: FINN, SAGE, VERA, DION, MIRA, COLE, LYRA, NASH, TOVA, REMY, ASHA, DANE

### Shifts 7-9: Endgame (12 subjects)

Names: WREN, CRUZ, THEA, BECK, IRIS, HUGO, NYLA, REED, ZOYA, KYLE, ESME, NICO

---

## Directive Ladder

| Shift | Directive | Exception(s) |
|-------|-----------|--------------|
| 1 | DENY: WARRANTS | — |
| 2 | DENY: ENGINEERS | EXCEPT: HUMANS |
| 3 | DENY: REPLICANTS | EXCEPT: VIP |
| 4 | DENY: TITAN ORIGIN | EXCEPT: MEDICAL |
| 5 | DENY: SYNTHETICS | EXCEPT: VIP, MEDICAL |
| 6 | DENY: WARRANTS + IO ORIGIN | EXCEPT: EARTH ORIGIN |
| 7 | DENY: REMNANTS + CONSTRUCTS | EXCEPT: VIP |
| 8 | DENY: ALL NON-HUMANS | EXCEPT: VIP, MEDICAL |
| 9 | DENY: ALL | EXCEPT: VIP |

---

## Consequence Chains

### Chain 1: The Weapon
- **Eva** (S1) carries hidden weapon component
- **Kira** (S2) is the assembler
- **Jace** (S3) is the target
- If Eva AND Kira approved → Jace dies (even if denied)

### Chain 2: The Information
- **Rex** (S1) has intel about Orin
- **Orin** (S3) is revolutionary leader
- If Rex denied → Orin's identity protected
- If Rex approved → Orin flagged for Central

### Chain 3: The Family
- **Cass** (S1) has child on Earth
- **Luca** (S3) is the child's guardian
- If Cass denied → Child alone
- If Luca denied → Child orphaned

### Chains 4-15: Defined in full scope document

---

## Endgame Content

### Final Subject
- **Subject 36: NICO**
- All previous decisions converge
- Nico's fate depends on cumulative web
- Multiple possible outcomes

### Final Wrapped
- Full node map zoom out
- All 36 names scroll
- Pattern statistics revealed
- AMBER's final message

---

## Polish Items

### Audio
- [ ] Subject greetings (recorded or TTS)
- [ ] Scan sounds
- [ ] Decision sounds
- [ ] Resolution sounds
- [ ] Wrapped music/sounds
- [ ] AMBER voice

### Visual
- [ ] Subject video assets (36)
- [ ] Node map animations
- [ ] Transition effects
- [ ] Loading states

### Writing
- [ ] All subject dialogue
- [ ] All AMBER messages
- [ ] Consequence descriptions
- [ ] News report snippets (optional)

---

## Production Pipeline

### Per Subject
1. Define traits and connections
2. Write dialogue
3. Create/source video asset
4. Test in game
5. Balance consequence weight

### Per Shift
1. Define directive
2. Select subjects (4)
3. Test directive logic
4. Balance difficulty

### Integration
1. Connect all consequence chains
2. Test full playthrough
3. Balance pacing
4. Polish transitions

---

## Acceptance Criteria

- [ ] 36 subjects implemented
- [ ] 9 directives implemented
- [ ] All consequence chains work
- [ ] Full playthrough completes
- [ ] Endgame triggers correctly
- [ ] All audio assets in place
- [ ] All video assets in place
- [ ] Performance acceptable (60fps)

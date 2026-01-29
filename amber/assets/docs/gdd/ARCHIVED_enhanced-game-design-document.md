# AMBER: Enhanced Game Design Document

## Executive Summary

AMBER is an information-based border control simulation game where players serve as operators for AMBER Security, Earth's interplanetary border control system. The game emphasizes strategic investigation, resource management, and moral decision-making in a Papers Please-inspired framework.

**Core Experience:**
- Players investigate subjects using limited resources
- Decisions have real consequences that accumulate over shifts
- Success leads to family reunion; failure leads to elimination
- The organization claims AI runs the system to maintain public trust

---

## Current Game State Analysis

### What Exists Currently

**Subject System:**
- 12 manually crafted subjects with hardcoded data
- Subjects have: name, origin, type, dossier, bio scan data, outcomes
- Stored in `subjects.ts` as a static array

**Investigation Tools:**
- Basic scan (free): biometric data
- Bio scan (1 resource): audio analysis + dossier
- Verification queries (1 resource each): warrant, transit, incident
- Interrogation (free): 3 questions max, dynamic generation

**Resource System:**
- 3 resources per shift (reset per shift)
- Resources consumed by bio scan and verification queries
- Credits earned from correct decisions

**Decision System:**
- Information-based consequences (no predetermined flags)
- Citations for wrong decisions
- Supervisor warnings for patterns

### Current Flow Problems

1. **Sterile Entry**: Subjects appear → immediate scanning (no character interaction)
2. **Unified Bio Scan**: One scan covers everything (identity + health)
3. **No Subject Personality**: All subjects enter identically
4. **Resource Reset**: Mistakes don't carry forward between subjects

---

## Enhanced Game Design

### 1. Core Narrative

**Setting: 3184 - Interplanetary Border Control**
- Earth is the galactic center of power and opportunity
- AMBER Security controls all planetary entry
- Players are "human operators" but the public believes it's fully automated AI

**Player Role:**
- Undercover human operator maintaining the illusion of AI control
- Family held hostage as insurance (classic dystopian setup)
- Success = family reunion + freedom
- Failure = "AI malfunction" cover story + player elimination

**Family Communication:**
- Cannot directly communicate with family
- Receive audio messages next to family photos between shifts
- Messages build emotional investment and stakes

**Organizational Deception:**
- Public: "AMBER is fully automated AI system"
- Reality: Human operators with family leverage
- Players discover this truth through gameplay
- Ending reveals: AMBER tells world "AI malfunctioned" if player fails

### 2. Enhanced Subject Entry System

#### Subject Greetings (Mandatory Interaction)

**Purpose:** Create immediate character and mystery

**Communication Styles:**
```typescript
type CommunicationStyle =
  | 'ENGLISH_FLUENT'     // Professional/business-like
  | 'ENGLISH_BROKEN'     // Accented/heavily accented
  | 'GIBBERISH'          // Speaks nonsense/foreign language
  | 'SILENT'             // Says nothing, stares
  | 'AGITATED'           // Yells/rambles incoherently
  | 'FORMAL'             // Corporate/diplomatic speak
```

**Examples:**
- **Fluent**: "Good morning, officer. I'm here for the interplanetary conference."
- **Broken**: "Hello... I come Earth see family. Very important."
- **Gibberish**: "Blorg zorp nexus prime terra firma..."
- **Silent**: *[No dialogue, just stands there]*
- **Agitated**: "LET ME IN! MY WIFE IS DYING! YOU DON'T UNDERSTAND!"

#### Credential Presentation System

**Purpose:** Papers Please-style document interaction

**Credential Types:**
```typescript
type CredentialType =
  | 'VISITOR_PASSPORT'     // Standard travel document
  | 'WORK_PERMIT'          // Employment authorization
  | 'MEDICAL_CLEARANCE'    // Health travel permit
  | 'DIPLOMATIC_PASSPORT'  // VIP diplomatic access
  | 'STUDENT_VISA'         // Educational travel
  | 'EMERGENCY_CLEARANCE'  // Crisis travel
```

**Credential Behaviors:**
```typescript
type CredentialBehavior =
  | 'COOPERATIVE'        // Presents immediately
  | 'RELUCTANT'          // Takes time to present
  | 'MISSING'            // No documents shown
  | 'FORGED'             // Obvious fake marks
  | 'MULTIPLE'           // Conflicting documents
  | 'NONE'               // Refuses to present
```

**Credential Examination:**
- **Name, ID, Photo**: Basic identity
- **Origin/Destination**: Travel details
- **Expiration/Status**: Validity checks
- **Purpose**: Stated reason for visit
- **Visual Anomalies**: Forgery indicators, damage

#### BPM Integration with Entry

**Initial BPM Baseline:**
- Established during greeting sequence
- Affected by communication style and credential behavior
- **Cooperative + Fluent** → Normal baseline (70-80 BPM)
- **Silent + Missing Credential** → Elevated baseline (90-100 BPM)
- **Agitated + Multiple Credentials** → High baseline (100-110 BPM)

### 3. Split Bio Scan System

#### Identity Scan (Eyes → Dossier)
**Cost:** 1 resource
**Reveals:** Personal identity information
- Retinal patterns, iris analysis
- Genetic markers, replicant detection
- Race classification, augmentation detection
- **Dossier unlock** with random gaps

#### Health Scan (Body → Medical)
**Cost:** 1 resource
**Reveals:** Biological and medical information
- Biological anomalies, surgical history
- Genetic purity, bio-structure analysis
- Medical conditions, prosthetic detection
- Health dossier with medical findings

#### Audio Limitations
- **One-time playback only** (RAM constraints)
- Identity scan audio: Identity findings
- Health scan audio: Medical findings
- Cannot replay audio (shows "[MEMORY FULL]")

### 4. Enhanced Resource & Credit System

#### Resource Mechanics
```
3 resources PER SUBJECT (reset each subject)
3 questions per subject (reset each subject)
```

**Resource Costs:**
- Identity Scan: 1 resource
- Health Scan: 1 resource
- Verification Query: 1 resource (warrant/transit/incident)

**Strategic Choice:**
- Early investigation: Use identity scan (need to know who they are)
- Medical concerns: Use health scan (check for issues)
- Legal verification: Use database queries

#### Credit System
**Earning Credits:**
- Base pay per shift completion
- Bonus credits for "clean" shifts (no citations)
- Reduced pay for citations

**Credit Uses:**
- Equipment repairs
- Information hints (limited)
- Cannot buy resources directly

**Citation Impact:**
- Citations reduce shift pay
- Accumulate across shifts
- Recovery through continued play (reduced pay still accumulates)

### 5. Subject Creation & Factory System

#### Current Subject Structure
```typescript
interface SubjectData {
  // Identity
  name: string;
  id: string;
  sex: 'M' | 'F' | 'X';
  
  // Traits (universal)
  subjectType: SubjectType;      // HUMAN, REPLICANT, etc.
  hierarchyTier: HierarchyTier;  // LOWER, MIDDLE, UPPER, VIP
  originPlanet: string;          // MARS, EUROPA, TITAN
  
  // Interaction (NEW)
  communicationStyle: CommunicationStyle;
  credentialBehavior: CredentialBehavior;
  greetingText?: string;
  
  // Game data
  bioScanData: BioScanData;
  dossier: Dossier;
  outcomes: Outcomes;
  // ... etc
}
```

#### Trait-Based Factory System

**3 Universal Traits:**
1. **SubjectType** (6 values): Affects identity scan results
2. **HierarchyTier** (4 values): Affects dialogue tone, credentials
3. **OriginPlanet** (3+ values): Affects background, cultural references

**Factory Function:**
```typescript
function createSubjectFromTraits(
  traits: SubjectTraits,
  overrides?: Partial<SubjectData>
): SubjectData {
  // Generate base subject from traits
  // Apply narrative overrides for assets/outcomes
}
```

**Trait Combinations:**
- **REPLICANT + LOWER + TITAN** → Corporate experiment escapee
- **HUMAN + UPPER + EUROPA** → Corporate executive
- **HUMAN_CYBORG + MIDDLE + MARS** → Factory worker with augmentations

#### Manual Overrides for Key Subjects
- Assets (videos, audio files) assigned per subject
- Character briefs and BPM tells
- Specific outcomes and dossier data
- Narrative-critical subjects kept manual

### 6. Enhanced Investigation Flow

#### Complete Subject Processing Sequence

**Phase 1: Subject Entry (NEW)**
1. Subject appears with video
2. Greeting dialogue plays (communication style)
3. Credential presented (behavior type)
4. Player examines credential (free)
5. BPM baseline established

**Phase 2: Investigation**
1. **Identity Scan** (1 resource): Eyes → dossier + audio
2. **Health Scan** (1 resource): Body → medical data + audio
3. **Verification Queries** (1 resource each):
   - Warrant check
   - Transit log
   - Incident history
4. **Interrogation** (3 questions max, free)

**Phase 3: Decision & Consequence**
1. APPROVE/DENY decision
2. Citation evaluation against directive
3. Feedback showing what was missed

### 7. Contrast: Current vs Enhanced Flow

#### Current Flow
```
Subject Appears → Basic Scan (free) → Bio Scan (1R) → Verification (1R each) → Interrogation → Decision
                                                                 ↓
                                                    Biometric data revealed immediately
                                                    Unified bio scan (identity + health)
                                                    Resources reset per shift
                                                    No character interaction
```

#### Enhanced Flow
```
Subject Appears → Greeting + Credential → Identity Scan (1R) → Health Scan (1R) → Verification → Interrogation → Decision
                    ↓                              ↓                           ↓
     Character interaction + mystery        Eyes → dossier + identity     Body → medical + health
     BPM baseline established               One-time audio               One-time audio
     Resources reset per subject            Strategic choice required
```

#### Key Improvements

**Engagement:**
- **Current:** Sterile scanning interface
- **Enhanced:** Character-driven interactions with personality

**Strategic Depth:**
- **Current:** Unified bio scan, shift-based resources
- **Enhanced:** Split scans with subject-based resources, forced choices

**Immersion:**
- **Current:** Jump straight to investigation
- **Enhanced:** Natural border control flow with greetings and documents

**Emotional Investment:**
- **Current:** Abstract consequences
- **Enhanced:** Family messages, personal stakes, AI deception reveal

### 8. Technical Implementation

#### New Interfaces
```typescript
interface SubjectTraits {
  subjectType: SubjectType;
  hierarchyTier: HierarchyTier;
  originPlanet: OriginPlanet;
}

interface SubjectEntryData {
  communicationStyle: CommunicationStyle;
  credentialBehavior: CredentialBehavior;
  credentialType: CredentialType;
  greetingText?: string;
  initialBPM: number;
}

interface EnhancedGatheredInformation {
  identityScan: boolean;    // Eyes + dossier
  healthScan: boolean;      // Body + medical
  verificationQuery: boolean; // Database checks
  interrogation: {
    questionsAsked: number;
    responses: string[];
    bpmChanges: number[];
  };
}
```

#### Factory Implementation
```typescript
export function createSubjectFromTraits(
  traits: SubjectTraits,
  entryData: SubjectEntryData,
  overrides?: Partial<SubjectData>
): SubjectData {
  // Generate base data from traits
  const baseSubject = generateBaseSubject(traits);
  
  // Apply entry interaction data
  const subjectWithEntry = {
    ...baseSubject,
    ...entryData,
  };
  
  // Apply manual overrides (assets, outcomes, etc.)
  return {
    ...subjectWithEntry,
    ...overrides,
  };
}
```

### 9. Game Balance Considerations

#### Resource Scarcity
- 3 resources per subject creates meaningful choices
- Cannot investigate everything → strategic prioritization
- Mistakes carry forward through reduced pay

#### Citation System
- Citations accumulate but don't prevent progression
- Recovery through continued play
- Creates long-term consequence pressure

#### Subject Variety
- 6 × 4 × 3 = 72 base trait combinations
- Entry interactions add personality layers
- Manual overrides ensure narrative-critical subjects work

### 10. Conclusion

The enhanced design transforms AMBER from a functional investigation simulator into an emotionally engaging border control experience. Key improvements:

1. **Character-Driven Entry**: Greetings and credentials create immediate personality
2. **Strategic Scan Split**: Identity vs Health scans require informed choices
3. **Personal Stakes**: Family messages and AI deception reveal add emotional depth
4. **Improved Resource Flow**: Subject-based resources with consequence carry-over
5. **Factory System**: Trait-based generation enables procedural variety

The game maintains its core information-based deduction while adding the human elements that make Papers Please memorable. Players aren't just processing data—they're making human connections and moral choices in a dystopian system that demands their compliance.
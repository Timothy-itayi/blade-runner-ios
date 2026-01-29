# Information-Based Deduction System - Game Design Document

## Executive Summary

This document outlines the transition from a predetermined flag-based decision system to a dynamic, information-based deduction system where player decisions are evaluated based on the information they gathered, not predetermined outcomes. The system emphasizes strategic resource management, equipment failures, and consequences that reveal what was missed—similar to Papers Please.

---

## Problems We Were Facing

### 1. **Flat, Predetermined Decision Logic**

**Problem:**
- Subjects had `shouldApprove`/`shouldDeny` flags that predetermined the "correct" decision
- Players were essentially checking flags rather than making deductions
- Gameplay felt like a binary test rather than investigative work
- No strategic depth—players could brute force by trying both options

**Impact:**
- Reduced player agency and engagement
- Eliminated the core detective/investigation fantasy
- Made resource management meaningless (why spend resources if you can just guess?)

### 2. **Lack of Strategic Resource Management**

**Problem:**
- Resources existed but weren't strategically meaningful
- Players could gather all information without consequence
- No trade-offs between different information sources
- Resources felt like a gate rather than a strategic choice

**Impact:**
- No meaningful player decisions about which tools to use
- Reduced replayability
- Missed opportunity for resource scarcity to create tension

### 3. **BPM as Decorative, Not Mechanic**

**Problem:**
- BPM was displayed but not used in decision logic
- No contradictions between BPM and subject statements
- BPM didn't change during interrogation
- No false positives or ambiguity

**Impact:**
- Wasted mechanic that could add depth
- Missed opportunity for behavioral tells
- No subtle deception detection

### 4. **Information Symmetry Issues**

**Problem:**
- All crucial information was always available
- No hidden details that required specific tools to discover
- Dossiers were always complete
- No information gaps that created uncertainty

**Impact:**
- No reason to use different tools strategically
- Reduced difficulty and engagement
- No consequences for missing crucial details

### 5. **Static Interrogation System**

**Problem:**
- Interrogation questions were generic and didn't adapt to gathered information
- Questions didn't cross-reference findings from different sources
- No dynamic question generation based on what player discovered

**Impact:**
- Interrogation felt disconnected from investigation
- No sense of building a case through information gathering
- Reduced player agency in investigation

---

## Solutions: Information-Based Deduction System

### Core Philosophy

**Decision Correctness = Information Gathered + Decision Made + Directive Compliance**

The game no longer evaluates decisions based on predetermined flags. Instead, it evaluates:
1. What information did the player gather?
2. What decision did they make?
3. What are the consequences based on that combination?

**Wrong decisions happen when you miss crucial details.** The game reveals what you missed after the decision, similar to Papers Please.

---

## System Architecture

### 1. Resource System (Computer Memory Model)

**Concept:**
Resources represent computer memory/processing power. Each tool that requires computer processing consumes 1 resource. Like RAM, you can't run things twice—once you've used a resource, it's consumed.

**Resource Costs:**
- **Bio Scan** (1 resource): Reveals audio bio markers + dossier
- **Verification Drawer** (3 options, each 1 resource):
  - **Warrant Check**: Deep warrant database search
  - **Transit Log**: Travel history and transit patterns
  - **Incident History**: Past incidents and violations

**Resource Mechanics:**
- Players start with 3 resources per shift
- Resources reset at the start of each shift
- Once a resource is used, it cannot be reused (no replaying bio scan audio)
- Forces strategic choices: which information is most critical?

**Free Tools (No Resource Cost):**
- **Basic Scan**: Fingerprint/retinal match (always available)
- **BPM Monitoring**: Passive observation (baseline + during interrogation)
- **Interrogation**: Asking questions (free, but questions adapt to gathered info)

---

### 2. Information Gathering System

#### A. Basic Scan (Free)
- Always available, no resource cost
- Reveals: Fingerprint match, retinal match, basic biometric status
- **Can malfunction**: Shows "ERROR Sensor Malfunction" randomly
- When malfunctioning: Data is unreliable or missing

#### B. Bio Scan (1 Resource)
- **Audio-only**: Bio markers delivered via audio narration (no text transcript)
- Players must listen and note details
- Reveals:
  - Biological type (Human, Replicant, Cyborg, etc.)
  - Genetic purity percentage
  - Surgical modifications
  - Augmentation levels
  - **Dossier** (with random missing fields)
- **One-time only**: Cannot replay (uses resources like memory)
- **Dossier gaps**: Random fields missing per subject (name, DOB, address, occupation, sex)

#### C. Verification Drawer (3 Options, Each 1 Resource)

**Warrant Check:**
- Deep database search for active warrants
- May reveal warrants not visible in basic scan
- Shows warrant details, dates, severity

**Transit Log:**
- Complete travel history
- Transit patterns and frequency
- Flagged transit routes
- Discrepancies with stated purpose

**Incident History:**
- Past violations and incidents
- Compliance history
- Red flags and patterns

#### D. Interrogation (Free, Dynamic Questions)

**Question Generation Based on Information Gathered:**

**No Information Gathered:**
- Basic "state your business" questions
- Generic: "What is your purpose for visiting?"
- "How long do you plan to stay?"
- "Have you been to Earth before?"

**Some Information Gathered (Bio Scan OR One Verification):**
- Questions about specific findings
- Example: "The scan shows synthetic markers. Can you explain?"
- Example: "Your transit log shows discrepancies. Explain."

**All Information Gathered (Bio Scan + All 3 Verifications):**
- Deep cross-referencing questions
- Example: "Your bio scan shows X, but your transit log shows Y, and your incident history indicates Z. Explain the inconsistencies."
- Questions reference multiple findings simultaneously

**Question Mechanics:**
- Maximum 3 questions per subject
- Questions adapt in real-time based on what you've discovered
- More information = more specific, probing questions

---

### 3. BPM Behavioral Tell System

#### Baseline BPM (Free Observation)
- Displayed during basic scan
- Shows resting heart rate (e.g., "73-83 BPM, STABLE 96%")
- **Can malfunction**: Shows "ERROR Sensor Malfunction"
- When broken: No BPM data available

#### BPM During Interrogation (Real-Time Changes)
- **Only changes when questioned**: BPM remains baseline until interrogation begins
- **Real-time updates**: BPM changes as each question is asked
- **Behavioral tells**: BPM contradictions reveal deception or stress

**BPM Tell Examples:**
- Subject says: "I'm calm, this is routine"
- BPM during question: 110 BPM (elevated)
- **Tell**: Body contradicts words → suspicious

- Subject says: "My mother is dying, I need to see her"
- BPM during question: 105 BPM (slightly elevated)
- **Ambiguity**: Is this stress about mother (truthful) or deception?

**False Positives:**
- Some subjects have elevated BPM but are telling the truth (genuine stress)
- Some subjects have calm BPM but are lying (good liars)
- Player must interpret, not just react to numbers

**Equipment Failure:**
- BPM monitor can break/malfunction
- When broken: No BPM data during interrogation
- Forces decisions without behavioral tells
- Can be repaired with credits over time

---

### 4. Equipment Failure System

**Malfunctioning Equipment:**
- **Biometric Scanner**: Shows "ERROR Sensor Malfunction"
  - Fingerprint/retinal data unreliable or missing
  - Visual indicator: Red error state on scan panels
  
- **BPM Monitor**: Shows "ERROR Sensor Malfunction"
  - No BPM data available
  - Cannot observe behavioral tells

**Failure Mechanics:**
- **Random per subject**: Equipment can fail randomly
- **Persistent until repaired**: Once broken, stays broken until player repairs
- **Repair system**: Players can repair with credits over time
- **Strategic impact**: Forces decisions with incomplete information

---

### 5. Dossier Gap System

**Concept:**
Dossiers are revealed by bio scan, but contain random missing fields per subject.

**Possible Missing Fields:**
- Name
- Date of Birth
- Address
- Occupation
- Sex

**Gap Mechanics:**
- Random fields missing per subject
- Some subjects: 1-2 fields missing
- Some subjects: 3-4 fields missing
- Creates information gaps that player must work around

**Strategic Impact:**
- Missing occupation: Can't verify stated job
- Missing address: Can't verify location claims
- Missing DOB: Can't verify age-related claims
- Forces strategic choices: Accept incomplete data or spend resources to fill gaps?

---

### 6. Decision Evaluation System

#### No Predetermined Flags

**Old System:**
```typescript
if (decision === 'APPROVE') {
  return subject.shouldApprove; // Predetermined flag
}
```

**New System:**
```typescript
// Track what information was gathered
const infoGathered = {
  basicScan: true,
  bioScan: false,
  warrantCheck: false,
  transitLog: false,
  incidentHistory: false,
  interrogation: true,
  bpmData: true
};

// Evaluate consequence based on:
// 1. Information gathered
// 2. Decision made
// 3. Directive compliance
// 4. What was missed
```

#### Consequence Calculation

**Example: Subject with Hidden Warrant**

**Scenario 1: No Warrant Check + APPROVE**
- Information: Basic scan only (warrant not visible)
- Decision: APPROVE
- Consequence: "Subject entered with undisclosed warrant. Citation issued."
- Reveals: "Warrant check would have revealed: WARRANT NO 88412"

**Scenario 2: Warrant Check + Found Warrant + APPROVE**
- Information: Warrant check performed, warrant found
- Decision: APPROVE (despite known warrant)
- Consequence: "Subject entered despite known warrant. Serious infraction logged."
- Reveals: "Directive violation: DENY ALL ACTIVE WARRANTS"

**Scenario 3: Warrant Check + Found Warrant + DENY**
- Information: Warrant check performed, warrant found
- Decision: DENY
- Consequence: "Subject detained per protocol. No citation."

#### Consequence Types

**Citations (Like Papers Please):**
- Minor citation: Missing information that should have been checked
- Major citation: Directive violation despite having information
- Serious infraction: Multiple violations or severe directive breach

**Supervisor Warnings (Mid-Process):**
- "Operator, you've approved 2 subjects without database verification this shift"
- "Operator, biometric scanner malfunction detected. Proceed with caution."
- Real-time feedback during shift

**Consequence Compounding:**
- 1 infraction: Warning
- 3 infractions: Citation
- 5 infractions: Serious citation
- Multiple infractions = worse outcomes

#### Revealing What Was Missed

**Post-Decision Feedback:**
- Shows what information would have changed the decision
- Example: "Visa valid for 2 weeks. Subject stated 'a few weeks'—discrepancy detected."
- Example: "Bio scan would have revealed: REPLICANT markers"
- Example: "Transit log shows: Last visit 6 months ago, not 'first time' as claimed"

**Not Punitive, Informative:**
- Doesn't say "you were wrong"
- Shows what you missed and how it would have affected the decision
- Encourages learning and strategic thinking

---

### 7. Ambiguous Subjects

**Even With Full Information:**
- Some subjects remain ambiguous even when all information is gathered
- Example: BPM elevated but could be stress or deception
- Example: Story is sad but directive says deny
- Example: Multiple conflicting signals

**Purpose:**
- Creates moral complexity
- No "perfect" decision path
- Forces player to make judgment calls
- Adds replayability and discussion value

---

## UI/UX Implementation

### Main Game Screen (Current UI)

**Top Bar:**
- AMBER SECURITY - EARTH BORDER CONTROL
- RESOURCES: X/3 (current/available)
- CREDITS: X (for repairs)

**Biometric Display:**
- Left: Hand scans (L/R) with fingerprint data
- Right: Eye scan with retinal data
- Biometric status: BPM range, stability, confidence
- **Error states**: "ERROR Sensor Malfunction" when equipment fails

**Action Buttons:**
- **BIO SCAN** (Green): Active when resources available, reveals audio + dossier
- **VERIFICATION** (Yellow): Opens drawer with 3 options (warrant, transit, incident)
- **DOSSIER** (Grayed out): Only active after bio scan, shows dossier with gaps
- **INTERROGATE** (Green): Always available, questions adapt to gathered info

**Information Display:**
- Large text area showing interrogation Q&A
- Real-time BPM updates during questioning
- No transcript for bio scan audio (must listen)

**Decision Buttons:**
- **APPROVE** (Green)
- **DENY** (Red)

### Verification Drawer

**Terminal Interface:**
- Command-line aesthetic
- Three query options:
  1. `warrant_check` (1 resource)
  2. `transit_log` (1 resource)
  3. `incident_history` (1 resource)
- Each query shows terminal output with results
- Timestamps and operator logging

### Post-Decision Feedback

**Citation Screen:**
- Shows consequence
- Reveals what was missed
- Highlights information that would have changed decision
- Similar to Papers Please citation system

---

## Technical Implementation Notes

### Information Tracking

```typescript
interface GatheredInformation {
  basicScan: boolean;
  bioScan: boolean;
  warrantCheck: boolean;
  transitLog: boolean;
  incidentHistory: boolean;
  interrogation: {
    questionsAsked: number;
    responses: string[];
    bpmChanges: number[]; // BPM at each question
  };
  bpmDataAvailable: boolean; // Equipment working?
  equipmentFailures: EquipmentType[];
}
```

### Decision Evaluation

```typescript
function evaluateDecision(
  subject: SubjectData,
  decision: 'APPROVE' | 'DENY',
  info: GatheredInformation,
  directive: Directive
): Consequence {
  // Check what information was gathered
  // Check what information was missing
  // Calculate consequence based on:
  // - Information + Decision + Directive
  // - What was missed
  // - Compounding infractions
  
  return {
    type: 'CITATION' | 'WARNING' | 'SERIOUS_INFRACTION',
    message: string,
    missedInformation: string[],
    reveal: string // What would have changed decision
  };
}
```

### Dynamic Question Generation

```typescript
function generateInterrogationQuestion(
  subject: SubjectData,
  info: GatheredInformation
): string {
  if (!info.bioScan && !info.warrantCheck && !info.transitLog && !info.incidentHistory) {
    // No info: Basic questions
    return "What is your purpose for visiting?";
  }
  
  if (info.bioScan && info.warrantCheck && info.transitLog && info.incidentHistory) {
    // All info: Cross-reference questions
    return `Your bio scan shows ${bioFindings}, but your transit log shows ${transitFindings}, and your incident history indicates ${incidentFindings}. Explain the inconsistencies.`;
  }
  
  // Some info: Questions about specific findings
  if (info.bioScan) {
    return `The scan shows ${bioFindings}. Can you explain?`;
  }
  // ... etc
}
```

---

## Gameplay Flow Example

### Subject: MARA VOLKOV (Human with Active Warrant)

**Directive:** DENY ALL ACTIVE WARRANTS

**Player Actions:**
1. Basic scan (free): Shows warrant status = CLEAR (misleading—warrant not visible in basic scan)
2. Interrogate (free): "What is your purpose?" → "Visiting family on Earth. The warrant... it's a misunderstanding."
3. BPM during question: 95 BPM (slightly elevated)
4. Player decides: APPROVE (didn't check warrant)

**Consequence:**
- Citation: "Subject entered with undisclosed warrant."
- Reveals: "Warrant check would have revealed: WARRANT NO 88412"
- Shows: "Directive: DENY ALL ACTIVE WARRANTS"

**Alternative Path:**
1. Basic scan (free)
2. Warrant check (1 resource): Reveals WARRANT NO 88412
3. Interrogate: "The system shows an active warrant. Explain." → "It's a mistake, I just want to see my family."
4. BPM during question: 110 BPM (elevated—stress or deception?)
5. Player decides: DENY (found warrant, followed directive)

**Consequence:**
- No citation
- Subject detained per protocol

---

## Future Enhancements

### Additional Subjects
- More subjects with varying information requirements
- Subjects that require multiple tools to fully understand
- Subjects with conflicting signals (ambiguous even with full info)

### Advanced BPM Tells
- Question-specific BPM changes
- Some questions cause bigger spikes than others
- Pattern recognition: consistent elevation vs. spikes on specific topics

### Equipment Degradation
- Equipment breaks down over time
- Must maintain equipment or face increasing failures
- Repair costs increase with usage

### Narrative Consequences
- Decisions affect later subjects (family members, connections)
- Compound narrative threads based on information gathering patterns
- Different endings based on information gathering efficiency

---

## Conclusion

This information-based deduction system transforms AMBER from a binary decision game into a strategic investigation experience where:

1. **Resources matter**: Strategic choices about which information to gather
2. **Information gathering is the core mechanic**: Not just checking flags
3. **Consequences reveal learning**: Shows what was missed, not just "wrong"
4. **Equipment failures add uncertainty**: Forces decisions with incomplete data
5. **BPM tells add depth**: Behavioral analysis, not just numbers
6. **Dynamic questions**: Interrogation adapts to what you've discovered
7. **Ambiguity creates complexity**: Some subjects remain unclear even with full info

The system rewards careful investigation, strategic resource management, and pattern recognition while maintaining the moral complexity and human stories that make the game compelling.

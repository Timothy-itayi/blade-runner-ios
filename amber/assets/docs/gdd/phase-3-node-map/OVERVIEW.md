# Phase 3: Node Map

## Goal

Visualize decisions and consequences as an interactive node graph.

---

## Core Concept

The node map is the primary storytelling surface. Every decision creates or modifies a node. Connections show relationships and consequences.

```
        [SUBJECT A]────caused────[SUBJECT B]
              │                      │
         approved                  died
              │                      │
              └──────────[YOU]───────┘
```

---

## Node Types

| Type | Visual | Meaning |
|------|--------|---------|
| **Player** | Center, distinct color | You |
| **Subject** | Circle with ring | A person you processed |
| **Station** | Square | A location (from SEND resolution) |
| **Central** | Diamond | Higher authority (from PASS resolution) |

---

## Node States

| State | Ring Color | Meaning |
|-------|------------|---------|
| **Approved Clean** | Green | Approved, no harm occurred |
| **Approved Harm** | Red | Approved, caused downstream harm |
| **Denied Clean** | Gray | Denied, correct call |
| **Denied Harm** | Yellow | Denied, caused harm (innocent) |
| **Held** | Blue | In HOLD/Archive |
| **Gone** | Empty (no fill) | Released/Terminal |
| **Pending** | Pulsing outline | Awaiting resolution |

---

## Connection Types

| Type | Visual | Meaning |
|------|--------|---------|
| **Decision** | Solid line | You → Subject (your decision) |
| **Consequence** | Dashed line | Subject → Subject (they affected each other) |
| **Route** | Arrow | Subject → Station (sent somewhere) |
| **Escalate** | Dotted line | Subject → Central (passed up) |
| **Death** | Red line | One caused other's death |

---

## Map Labels

Short text appears on or near nodes.

| Action | Label |
|--------|-------|
| Approved | "KIRA — APPROVED" |
| Denied | "KIRA — DENIED" |
| Sent | "KIRA → STATION 7" |
| Fixed | "KIRA → KIRA-2" |
| Passed | "KIRA → CENTRAL" |
| Held | "KIRA — HELD" |
| Released | "KIRA — GONE" |

---

## Data Structures

```typescript
interface NodeMapNode {
  id: string;
  type: 'player' | 'subject' | 'station' | 'central';
  label: string;
  state: NodeState;
  position: { x: number; y: number };
  subjectId?: string;
}

type NodeState = 
  | 'approved-clean'
  | 'approved-harm'
  | 'denied-clean'
  | 'denied-harm'
  | 'held'
  | 'gone'
  | 'pending';

interface NodeMapEdge {
  id: string;
  from: string;
  to: string;
  type: 'decision' | 'consequence' | 'route' | 'escalate' | 'death';
  label?: string;
}

interface NodeMapState {
  nodes: NodeMapNode[];
  edges: NodeMapEdge[];
}
```

---

## Layout Algorithm

### Initial Layout
- Player node at center (0, 0)
- Subject nodes arranged in circle around player
- Distance from player = 150px

### After Resolution
- SEND: New station node spawns, subject connects to it
- FIX: Successor node spawns below original
- PASS: Central node appears (if not exists), subject connects
- HOLD: Node stays in place, state changes
- RELEASE: Node empties (no fill), stays in place

### Cross-Shift
- New shift subjects arranged in outer ring
- Connections span across rings
- Zoom adjusts to fit all nodes

---

## Interactions

### Tap Node
- Shows subject summary popup
- Name, type, origin, decision, outcome

### Pinch Zoom
- Zoom in/out on map

### Pan
- Drag to move around map

### Highlight Connections
- Tap and hold: highlight all connections to/from this node

---

## MVP Scope

| Item | Count |
|------|-------|
| Nodes | 3 subjects + 1 player |
| Edge types | 2 (decision, consequence) |
| Node states | 4 (approved-clean, approved-harm, denied-clean, pending) |

---

## Acceptance Criteria

- [ ] Player node renders at center
- [ ] Subject nodes render in circle
- [ ] Edges connect player to subjects
- [ ] Node states reflect decisions
- [ ] Consequence edges show harm chains
- [ ] Map is pannable and zoomable
- [ ] Nodes are tappable for details

---

## Technical Notes

### Rendering Options

1. **React Native SVG** - Simple, good for <50 nodes
2. **React Native Skia** - Better performance for complex maps
3. **WebView + D3.js** - Maximum flexibility, bridging overhead

**Recommendation:** Start with SVG for MVP, migrate to Skia if performance issues.

### Animation

- New nodes fade in
- Edges draw from source to target
- State changes pulse briefly
- Harm connections pulse red

---

## Out of Scope (Phase 3)

- Bug resolution (creates nodes in Phase 4)
- Full wrapped integration (Phase 5)
- Dense maps (Phase 6 with 36 subjects)

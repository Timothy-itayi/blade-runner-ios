/**
 * 2001: A Space Odyssey inspired color palette for Node Map
 * 
 * References:
 * - HAL 9000's red eye
 * - Sterile white Discovery interiors
 * - Deep space black
 * - Cool blue Earth views
 * - Warm amber interior lighting
 * - Monolith absolute black
 * - Green computer displays
 */

export const MapTheme = {
  colors: {
    // Backgrounds
    void: '#0a0a0c',           // Deep space black
    panel: '#12141a',          // Slightly lighter panel
    grid: 'rgba(255, 255, 255, 0.03)', // Subtle grid
    
    // HAL's Eye - Critical/Danger
    halRed: '#e63946',
    halRedGlow: 'rgba(230, 57, 70, 0.3)',
    halRedDim: 'rgba(230, 57, 70, 0.15)',
    
    // Discovery Interior - Warm
    interiorAmber: '#f4a261',
    interiorOrange: '#e76f51',
    interiorWarm: 'rgba(244, 162, 97, 0.2)',
    
    // Computer Displays - Cool
    displayBlue: '#4cc9f0',
    displayCyan: '#4895ef',
    displayGlow: 'rgba(76, 201, 240, 0.2)',
    
    // Status Greens
    statusGreen: '#06d6a0',
    statusGreenDim: 'rgba(6, 214, 160, 0.6)',
    
    // Monolith - Pure elements
    monolithBlack: '#000000',
    sterileWhite: '#f8f9fa',
    sterileCream: '#e9ecef',
    
    // Node States (matching GDD)
    nodeApprovedClean: '#06d6a0',    // Green - no harm
    nodeApprovedHarm: '#e63946',     // Red - caused harm
    nodeDeniedClean: '#6c757d',      // Gray - correct denial
    nodeDeniedHarm: '#f4a261',       // Amber - incorrect denial
    nodeHeld: '#4cc9f0',             // Blue - in hold
    nodeGone: 'rgba(255,255,255,0.2)', // Faded - released
    nodePending: '#4895ef',          // Pulsing blue
    
    // Edges
    edgeDecision: 'rgba(255, 255, 255, 0.15)',
    edgeConsequence: 'rgba(244, 162, 97, 0.4)',
    edgeDeath: '#e63946',
    edgeRoute: '#4cc9f0',
    edgeEscalate: 'rgba(255, 255, 255, 0.08)',
    
    // Core Node (Player)
    coreNode: '#f8f9fa',
    coreRing: 'rgba(248, 249, 250, 0.4)',
    coreGlow: 'rgba(248, 249, 250, 0.1)',
    
    // Text
    textPrimary: '#f8f9fa',
    textSecondary: 'rgba(248, 249, 250, 0.7)',
    textDim: 'rgba(248, 249, 250, 0.4)',
    
    // Scan effect
    scanLine: '#4cc9f0',
    scanGlow: 'rgba(76, 201, 240, 0.15)',
  },
  
  // Animation timings (in ms)
  timing: {
    nodePulse: 1200,
    scanSweep: 800,
    edgeDraw: 600,
    fadeIn: 400,
  },
};

// Node state to color mapping
export function getNodeStateColor(state: string): string {
  switch (state) {
    case 'approved-clean': return MapTheme.colors.nodeApprovedClean;
    case 'approved-harm': return MapTheme.colors.nodeApprovedHarm;
    case 'denied-clean': return MapTheme.colors.nodeDeniedClean;
    case 'denied-harm': return MapTheme.colors.nodeDeniedHarm;
    case 'held': return MapTheme.colors.nodeHeld;
    case 'gone': return MapTheme.colors.nodeGone;
    case 'pending': return MapTheme.colors.nodePending;
    default: return MapTheme.colors.textDim;
  }
}

// Edge type to color mapping
export function getEdgeTypeColor(type: string): string {
  switch (type) {
    case 'decision': return MapTheme.colors.edgeDecision;
    case 'consequence': return MapTheme.colors.edgeConsequence;
    case 'death': return MapTheme.colors.edgeDeath;
    case 'route': return MapTheme.colors.edgeRoute;
    case 'escalate': return MapTheme.colors.edgeEscalate;
    default: return MapTheme.colors.edgeDecision;
  }
}

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  interpolate,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Svg, { Line, G } from 'react-native-svg';
import { MapTheme, getNodeStateColor, getEdgeTypeColor } from '../../constants/mapTheme';
import { Theme } from '../../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ============================================
// TYPES
// ============================================
export type NodeState = 
  | 'approved-clean'
  | 'approved-harm'
  | 'denied-clean'
  | 'denied-harm'
  | 'held'
  | 'gone'
  | 'pending'
  | 'alert-red';

export type EdgeType = 'decision' | 'consequence' | 'route' | 'escalate' | 'death';

export interface MapNode {
  id: string;
  type: 'player' | 'subject' | 'station' | 'central';
  label: string;
  state: NodeState;
  subjectId?: string;
}

export interface MapEdge {
  id: string;
  from: string;
  to: string;
  type: EdgeType;
  label?: string;
}

interface NodePosition {
  x: number;
  y: number;
  angle: number;
}

interface NodeMapProps {
  nodes: MapNode[];
  edges: MapEdge[];
  width?: number;
  height?: number;
  showGrid?: boolean;
  onNodePress?: (node: MapNode) => void;
  selectedNodeId?: string | null;
}

// ============================================
// HELPER FUNCTIONS
// ============================================
function getNodePosition(index: number, containerWidth: number, containerHeight: number): NodePosition {
  const centerX = containerWidth / 2;
  const centerY = containerHeight / 2;
  
  const baseRadius = Math.min(containerWidth, containerHeight) * 0.25;
  const radiusGrowth = Math.min(containerWidth, containerHeight) * 0.06;
  const angleStep = (Math.PI * 2) / 5;
  const angleOffset = -Math.PI / 2;
  
  const ringIndex = Math.floor(index / 5);
  const posInRing = index % 5;
  
  const angle = angleOffset + (posInRing * angleStep) + (ringIndex * 0.4);
  const radius = baseRadius + (ringIndex * radiusGrowth * 2.5);
  
  return {
    x: centerX + Math.cos(angle) * radius,
    y: centerY + Math.sin(angle) * radius,
    angle,
  };
}

// ============================================
// GRID BACKGROUND - 2001 Style
// ============================================
function GridBackground({ width, height }: { width: number; height: number }) {
  const lines = useMemo(() => {
    const elements: JSX.Element[] = [];
    const spacing = 40;
    
    // Vertical lines
    for (let x = 0; x < width; x += spacing) {
      elements.push(
        <Line
          key={`v-${x}`}
          x1={x}
          y1={0}
          x2={x}
          y2={height}
          stroke={MapTheme.colors.grid}
          strokeWidth={1}
        />
      );
    }
    
    // Horizontal lines
    for (let y = 0; y < height; y += spacing) {
      elements.push(
        <Line
          key={`h-${y}`}
          x1={0}
          y1={y}
          x2={width}
          y2={y}
          stroke={MapTheme.colors.grid}
          strokeWidth={1}
        />
      );
    }
    
    return elements;
  }, [width, height]);

  return <G>{lines}</G>;
}

// ============================================
// CORE NODE (Player - Center) - HAL-inspired
// ============================================
function CoreNode({ centerX, centerY }: { centerX: number; centerY: number }) {
  const pulse = useSharedValue(0);
  
  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: MapTheme.timing.nodePulse, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: MapTheme.timing.nodePulse, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, []);
  
  const coreStyle = useAnimatedStyle(() => {
    const scale = interpolate(pulse.value, [0, 1], [1, 1.08]);
    return { transform: [{ scale }] };
  });
  
  const outerRingStyle = useAnimatedStyle(() => {
    const scale = interpolate(pulse.value, [0, 1], [1, 1.25]);
    const opacity = interpolate(pulse.value, [0, 1], [0.4, 0.15]);
    return { transform: [{ scale }], opacity };
  });

  const innerRingStyle = useAnimatedStyle(() => {
    const scale = interpolate(pulse.value, [0, 1], [1, 1.12]);
    const opacity = interpolate(pulse.value, [0, 1], [0.6, 0.3]);
    return { transform: [{ scale }], opacity };
  });

  return (
    <View style={[styles.coreContainer, { left: centerX - 30, top: centerY - 30 }]}>
      {/* Outer glow ring */}
      <Animated.View style={[styles.coreOuterRing, outerRingStyle]} />
      {/* Inner ring */}
      <Animated.View style={[styles.coreInnerRing, innerRingStyle]} />
      {/* Core */}
      <Animated.View style={[styles.coreNode, coreStyle]} />
      {/* Highlight */}
      <View style={styles.coreHighlight} />
    </View>
  );
}

// ============================================
// SUBJECT NODE
// ============================================
interface SubjectNodeProps {
  node: MapNode;
  position: NodePosition;
  isSelected?: boolean;
  onPress?: () => void;
}

function SubjectNode({ node, position, isSelected, onPress }: SubjectNodeProps) {
  const color = getNodeStateColor(node.state);
  const pulse = useSharedValue(0);
  const isGone = node.state === 'gone';
  const isPending = node.state === 'pending';
  const isAlert = node.state === 'alert-red';
  
  useEffect(() => {
    if (isPending || node.state === 'approved-harm' || isAlert) {
      pulse.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 800, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
    }
  }, [node.state]);
  
  const nodeStyle = useAnimatedStyle(() => {
    if (!isPending && node.state !== 'approved-harm' && !isAlert) return {};
    const scale = interpolate(pulse.value, [0, 1], [1, 1.2]);
    return { transform: [{ scale }] };
  });

  const glowStyle = useAnimatedStyle(() => {
    if (!isPending && node.state !== 'approved-harm' && !isAlert) return { opacity: 0 };
    const opacity = interpolate(pulse.value, [0, 1], [0.3, 0.6]);
    return { opacity };
  });

  return (
    <TouchableOpacity
      style={[styles.nodeContainer, { left: position.x - 20, top: position.y - 20 }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Selection ring */}
      {isSelected && (
        <View style={[styles.nodeSelection, { borderColor: color }]} />
      )}
      
      {/* Glow for critical states */}
      <Animated.View 
        style={[
          styles.nodeGlow, 
          { backgroundColor: color },
          glowStyle,
        ]} 
      />
      
      {/* Main node */}
      <Animated.View 
        style={[
          styles.node, 
          { 
            backgroundColor: isGone ? 'transparent' : color,
            borderWidth: isGone ? 1 : 0,
            borderColor: color,
            borderStyle: isGone ? 'dashed' : 'solid',
          },
          nodeStyle,
        ]} 
      />
      
      {/* Label */}
      <Text style={styles.nodeLabel}>
        {node.label.split(' — ')[0]}
      </Text>
    </TouchableOpacity>
  );
}

// ============================================
// EDGE COMPONENT
// ============================================
interface EdgeComponentProps {
  edge: MapEdge;
  fromPos: { x: number; y: number };
  toPos: { x: number; y: number };
  isHighlighted?: boolean;
}

function EdgeComponent({ edge, fromPos, toPos, isHighlighted }: EdgeComponentProps) {
  const color = getEdgeTypeColor(edge.type);
  const isDeath = edge.type === 'death';
  
  return (
    <Line
      x1={fromPos.x}
      y1={fromPos.y}
      x2={toPos.x}
      y2={toPos.y}
      stroke={isHighlighted ? MapTheme.colors.sterileWhite : color}
      strokeWidth={isDeath ? 2 : 1}
      strokeDasharray={edge.type === 'escalate' ? '4,4' : edge.type === 'consequence' ? '8,4' : undefined}
    />
  );
}

// ============================================
// NODE TOOLTIP
// ============================================
interface NodeTooltipProps {
  node: MapNode;
  position: NodePosition;
  containerWidth: number;
  containerHeight: number;
}

function NodeTooltip({ node, position, containerWidth, containerHeight }: NodeTooltipProps) {
  const color = getNodeStateColor(node.state);
  const centerX = containerWidth / 2;
  const centerY = containerHeight / 2;
  
  const TOOLTIP_WIDTH = 100;
  const TOOLTIP_HEIGHT = 50;
  const NODE_OFFSET = 30; // Distance from node
  const CENTER_SAFE_ZONE = 50; // Keep tooltip away from center node
  
  // Determine which side to place tooltip (prefer away from center)
  const nodeIsRightOfCenter = position.x > centerX;
  const nodeIsAboveCenter = position.y < centerY;
  
  // Calculate base tooltip position
  let tooltipLeft: number;
  let tooltipTop: number;
  
  // Horizontal positioning - place tooltip on opposite side from center
  if (nodeIsRightOfCenter) {
    // Node is right of center, put tooltip to the right of node (away from center)
    tooltipLeft = position.x + NODE_OFFSET;
    // If that would go off screen, put it to the left
    if (tooltipLeft + TOOLTIP_WIDTH > containerWidth - 10) {
      tooltipLeft = position.x - TOOLTIP_WIDTH - NODE_OFFSET + 20;
    }
  } else {
    // Node is left of center, put tooltip to the left of node (away from center)
    tooltipLeft = position.x - TOOLTIP_WIDTH - NODE_OFFSET + 20;
    // If that would go off screen, put it to the right
    if (tooltipLeft < 10) {
      tooltipLeft = position.x + NODE_OFFSET;
    }
  }
  
  // Vertical positioning - place tooltip on opposite side from center vertically
  if (nodeIsAboveCenter) {
    // Node is above center, put tooltip above node
    tooltipTop = position.y - TOOLTIP_HEIGHT - 10;
    if (tooltipTop < 10) {
      tooltipTop = position.y + 20;
    }
  } else {
    // Node is below center, put tooltip below node
    tooltipTop = position.y + 20;
    if (tooltipTop + TOOLTIP_HEIGHT > containerHeight - 10) {
      tooltipTop = position.y - TOOLTIP_HEIGHT - 10;
    }
  }
  
  // Final check: ensure tooltip doesn't overlap center zone
  const tooltipCenterX = tooltipLeft + TOOLTIP_WIDTH / 2;
  const tooltipCenterY = tooltipTop + TOOLTIP_HEIGHT / 2;
  const distToCenter = Math.sqrt(
    Math.pow(tooltipCenterX - centerX, 2) + Math.pow(tooltipCenterY - centerY, 2)
  );
  
  if (distToCenter < CENTER_SAFE_ZONE + 30) {
    // Push tooltip further away from center
    const angle = Math.atan2(tooltipCenterY - centerY, tooltipCenterX - centerX);
    const pushDistance = CENTER_SAFE_ZONE + 40 - distToCenter;
    tooltipLeft += Math.cos(angle) * pushDistance;
    tooltipTop += Math.sin(angle) * pushDistance;
  }

  const getStateLabel = (state: NodeState): string => {
    switch (state) {
      case 'approved-clean': return 'APPROVED';
      case 'approved-harm': return 'APPROVED — HARM';
      case 'denied-clean': return 'DENIED';
      case 'denied-harm': return 'DENIED — HARM';
      case 'held': return 'HELD';
      case 'gone': return 'GONE';
      case 'pending': return 'PENDING';
      default: return 'UNKNOWN';
    }
  };

  return (
    <View style={[styles.tooltip, { left: tooltipLeft, top: tooltipTop }]}>
      <View style={[styles.tooltipBadge, { backgroundColor: color }]}>
        <Text style={styles.tooltipBadgeText}>{getStateLabel(node.state)}</Text>
      </View>
      <Text style={styles.tooltipName} numberOfLines={1}>{node.label}</Text>
    </View>
  );
}

// ============================================
// ZOOM/PAN CONSTANTS
// ============================================
const MIN_SCALE = 0.5;
const MAX_SCALE = 3;
const SPRING_CONFIG = { damping: 15, stiffness: 150 };

// ============================================
// MAIN COMPONENT
// ============================================
export default function NodeMap({
  nodes,
  edges,
  width = SCREEN_WIDTH,
  height = 400,
  showGrid = true,
  onNodePress,
  selectedNodeId,
}: NodeMapProps) {
  const [internalSelectedId, setInternalSelectedId] = useState<string | null>(null);
  const [containerHeight, setContainerHeight] = useState(height);
  
  // Pan and zoom state
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);
  const [isTransformed, setIsTransformed] = useState(false);
  
  const selectedId = selectedNodeId !== undefined ? selectedNodeId : internalSelectedId;
  const effectiveHeight = height || containerHeight;
  const centerX = width / 2;
  const centerY = effectiveHeight / 2;
  
  // Filter out player node (rendered separately as core)
  const subjectNodes = nodes.filter(n => n.type !== 'player');
  
  // Calculate positions for subject nodes
  const positions = useMemo(() => 
    subjectNodes.map((_, i) => getNodePosition(i, width, effectiveHeight)),
    [subjectNodes.length, width, effectiveHeight]
  );
  
  // Create position lookup for edges
  const positionLookup = useMemo(() => {
    const lookup: Record<string, { x: number; y: number }> = {
      'player': { x: centerX, y: centerY },
    };
    subjectNodes.forEach((node, i) => {
      lookup[node.id] = { x: positions[i].x, y: positions[i].y };
    });
    return lookup;
  }, [subjectNodes, positions, centerX, centerY]);
  
  // Find selected node for tooltip
  const selectedNode = nodes.find(n => n.id === selectedId);
  const selectedPosition = selectedNode && selectedNode.type !== 'player'
    ? positions[subjectNodes.indexOf(selectedNode)]
    : null;

  const handleNodePress = (node: MapNode) => {
    if (onNodePress) {
      onNodePress(node);
    } else {
      setInternalSelectedId(prev => prev === node.id ? null : node.id);
    }
  };

  // Update transformed state indicator
  const updateTransformState = useCallback((transformed: boolean) => {
    setIsTransformed(transformed);
  }, []);

  // Recenter the map
  const handleRecenter = useCallback(() => {
    scale.value = withSpring(1, SPRING_CONFIG);
    translateX.value = withSpring(0, SPRING_CONFIG);
    translateY.value = withSpring(0, SPRING_CONFIG);
    savedScale.value = 1;
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
    setIsTransformed(false);
  }, []);

  // Pan gesture
  const panGesture = Gesture.Pan()
    .onStart(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    })
    .onUpdate((event) => {
      translateX.value = savedTranslateX.value + event.translationX;
      translateY.value = savedTranslateY.value + event.translationY;
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
      const isAtOrigin = Math.abs(translateX.value) < 5 && 
                         Math.abs(translateY.value) < 5 && 
                         Math.abs(scale.value - 1) < 0.05;
      runOnJS(updateTransformState)(!isAtOrigin);
    });

  // Pinch gesture for zoom
  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      savedScale.value = scale.value;
    })
    .onUpdate((event) => {
      const newScale = savedScale.value * event.scale;
      scale.value = Math.min(Math.max(newScale, MIN_SCALE), MAX_SCALE);
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      const isAtOrigin = Math.abs(translateX.value) < 5 && 
                         Math.abs(translateY.value) < 5 && 
                         Math.abs(scale.value - 1) < 0.05;
      runOnJS(updateTransformState)(!isAtOrigin);
    });

  // Combine gestures
  const combinedGesture = Gesture.Simultaneous(panGesture, pinchGesture);

  // Animated style for the map content
  const animatedMapStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <View style={[styles.container, { width, height: effectiveHeight }]}>
      <GestureDetector gesture={combinedGesture}>
        <Animated.View style={[styles.mapContent, animatedMapStyle]}>
          {/* SVG Layer - Grid and Edges */}
          <View style={styles.svgContainer}>
            <Svg width={width} height={effectiveHeight}>
              {showGrid && <GridBackground width={width} height={effectiveHeight} />}
              
              {/* Edges */}
              {edges.map((edge) => {
                const fromPos = positionLookup[edge.from];
                const toPos = positionLookup[edge.to];
                if (!fromPos || !toPos) return null;
                
                return (
                  <EdgeComponent
                    key={edge.id}
                    edge={edge}
                    fromPos={fromPos}
                    toPos={toPos}
                    isHighlighted={selectedId === edge.from || selectedId === edge.to}
                  />
                );
              })}
            </Svg>
          </View>
          
          {/* Core node (player) */}
          <CoreNode centerX={centerX} centerY={centerY} />
          
          {/* Subject nodes */}
          {subjectNodes.map((node, i) => (
            <SubjectNode
              key={node.id}
              node={node}
              position={positions[i]}
              isSelected={selectedId === node.id}
              onPress={() => handleNodePress(node)}
            />
          ))}
          
          {/* Tooltip for selected node */}
          {selectedNode && selectedPosition && (
            <NodeTooltip 
              node={selectedNode} 
              position={selectedPosition}
              containerWidth={width}
              containerHeight={effectiveHeight}
            />
          )}
        </Animated.View>
      </GestureDetector>
      
      {/* Recenter button - only visible when map is panned/zoomed */}
      {isTransformed && (
        <TouchableOpacity style={styles.recenterButton} onPress={handleRecenter}>
          <Text style={styles.recenterText}>⊕</Text>
          <Text style={styles.recenterLabel}>CENTER</Text>
        </TouchableOpacity>
      )}
      
      {/* Empty state */}
      {subjectNodes.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>NO SUBJECTS PROCESSED</Text>
          <Text style={styles.emptySubtext}>Decisions will appear here</Text>
        </View>
      )}
    </View>
  );
}

// ============================================
// STYLES
// ============================================
const styles = StyleSheet.create({
  container: {
    backgroundColor: MapTheme.colors.void,
    overflow: 'hidden',
  },
  mapContent: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  svgContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  recenterButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(20, 24, 30, 0.9)',
    borderWidth: 1,
    borderColor: MapTheme.colors.edgeDecision,
    paddingVertical: 6,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  recenterText: {
    fontFamily: Theme.fonts.mono,
    fontSize: 14,
    color: MapTheme.colors.textPrimary,
  },
  recenterLabel: {
    fontFamily: Theme.fonts.mono,
    fontSize: 9,
    color: MapTheme.colors.textSecondary,
    letterSpacing: 1,
  },
  // Core node styles (Player - HAL inspired)
  coreContainer: {
    position: 'absolute',
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coreNode: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: MapTheme.colors.coreNode,
    position: 'absolute',
  },
  coreInnerRing: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: MapTheme.colors.coreRing,
    position: 'absolute',
  },
  coreOuterRing: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: MapTheme.colors.coreGlow,
    position: 'absolute',
  },
  coreHighlight: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.5)',
    position: 'absolute',
    top: 24,
    left: 24,
  },
  // Subject node styles
  nodeContainer: {
    position: 'absolute',
    width: 70,
    height: 50,
    alignItems: 'center',
    marginLeft: -15, // offset for wider container
  },
  node: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  nodeGlow: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    top: -7, // center around node (node is 14px, glow is 28px, so offset by (28-14)/2 = 7)
    left: 21, // center horizontally (container is 70px, glow is 28px, so (70-28)/2 = 21)
  },
  nodeSelection: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    top: -7, // center around node
    left: 21, // center horizontally
  },
  nodeLabel: {
    fontFamily: Theme.fonts.mono,
    fontSize: 8,
    color: MapTheme.colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  // Tooltip styles
  tooltip: {
    position: 'absolute',
    backgroundColor: MapTheme.colors.panel,
    borderWidth: 1,
    borderColor: MapTheme.colors.edgeDecision,
    padding: 8,
    width: 100,
    zIndex: 100,
  },
  tooltipBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  tooltipBadgeText: {
    fontFamily: Theme.fonts.mono,
    fontSize: 7,
    fontWeight: '700',
    color: MapTheme.colors.void,
    letterSpacing: 0.5,
  },
  tooltipName: {
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    fontWeight: '700',
    color: MapTheme.colors.textPrimary,
  },
  // Empty state
  emptyState: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 120, // Move text up so it doesn't block the center node
  },
  emptyText: {
    fontFamily: Theme.fonts.mono,
    fontSize: 11,
    fontWeight: '700',
    color: MapTheme.colors.textDim,
    letterSpacing: 2,
  },
  emptySubtext: {
    fontFamily: Theme.fonts.mono,
    fontSize: 9,
    color: MapTheme.colors.textDim,
    marginTop: 4,
    opacity: 0.6,
  },
});

import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Dimensions, LayoutChangeEvent } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import NodeMap, { MapNode, MapEdge, NodeState } from '../components/map/NodeMap';
import { MapTheme } from '../constants/mapTheme';
import { Theme } from '../constants/theme';
import { MechanicalButton } from '../components/ui/MechanicalUI';
import { HUDBox } from '../components/ui/HUDBox';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const METAL_TEXTURE = require('../assets/textures/Texturelabs_Metal_264S.jpg');

// Placeholder data: only center (YOU) node until we record real decisions
const DEMO_NODES: MapNode[] = [
  { id: 'player', type: 'player', label: 'YOU', state: 'approved-clean' },
];
const DEMO_EDGES: MapEdge[] = [];

export default function MapScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedNode, setSelectedNode] = useState<MapNode | null>(null);
  const [mapLayout, setMapLayout] = useState({ width: SCREEN_WIDTH - 32, height: SCREEN_HEIGHT * 0.5 });

  const handleBack = () => {
    router.back();
  };

  const handleMapLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (height > 0 && width > 0) {
      setMapLayout({ width, height });
    }
  };

  const handleNodePress = (node: MapNode) => {
    setSelectedNode(prev => prev?.id === node.id ? null : node);
  };

  // Stats from nodes (subject count only)
  const stats = useMemo(() => {
    const subjects = DEMO_NODES.filter(n => n.type === 'subject');
    return {
      total: subjects.length,
      approved: subjects.filter(n => n.state.startsWith('approved')).length,
      denied: subjects.filter(n => n.state.startsWith('denied')).length,
      harm: subjects.filter(n => n.state.includes('harm')).length,
    };
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.container, { paddingBottom: insets.bottom }]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerPanel}>
            {/* Metal texture background */}
            <View style={styles.textureContainer}>
              <Image source={METAL_TEXTURE} style={styles.texture} contentFit="cover" />
              <View style={styles.textureTint} />
            </View>
            
            <HUDBox hudStage="full" style={styles.headerContent} mechanical>
              <View style={styles.headerRow}>
                <View>
                  <Text style={styles.headerLabel}>CONSEQUENCE MAP</Text>
                  <Text style={styles.headerSubtext}>DECISION NETWORK VISUALIZATION</Text>
                </View>
                <TouchableOpacity onPress={handleBack} style={styles.closeButton}>
                  <Text style={styles.closeButtonText}>×</Text>
                </TouchableOpacity>
              </View>
            </HUDBox>
          </View>
        </View>

        {/* Stats Bar */}
        <View style={styles.statsBar}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>PROCESSED</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: MapTheme.colors.nodeApprovedClean }]}>{stats.approved}</Text>
            <Text style={styles.statLabel}>APPROVED</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: MapTheme.colors.nodeDeniedClean }]}>{stats.denied}</Text>
            <Text style={styles.statLabel}>DENIED</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: MapTheme.colors.nodeApprovedHarm }]}>{stats.harm}</Text>
            <Text style={styles.statLabel}>CASUALTIES</Text>
          </View>
        </View>

        {/* Map Container - full height, center node in middle */}
        <View style={styles.mapContainer} onLayout={handleMapLayout}>
          <View style={styles.mapBorder}>
            <NodeMap
              nodes={DEMO_NODES}
              edges={DEMO_EDGES}
              width={mapLayout.width - 4} // subtract border width
              height={mapLayout.height - 4} // subtract border width
              showGrid={true}
              onNodePress={handleNodePress}
              selectedNodeId={selectedNode?.id}
            />
          </View>
          
          {/* Scan lines overlay */}
          <View style={styles.scanLines} pointerEvents="none" />
        </View>

        {/* Selected Node Details */}
        {selectedNode && selectedNode.type !== 'player' && (
          <View style={styles.detailPanel}>
            <View style={styles.detailHeader}>
              <View style={[styles.detailBadge, { backgroundColor: getStateColor(selectedNode.state) }]}>
                <Text style={styles.detailBadgeText}>{getStateLabel(selectedNode.state)}</Text>
              </View>
              <Text style={styles.detailId}>{selectedNode.subjectId}</Text>
            </View>
            <Text style={styles.detailName}>{selectedNode.label}</Text>
            <Text style={styles.detailType}>TYPE: {selectedNode.type.toUpperCase()}</Text>
          </View>
        )}

        {/* Legend */}
        <View style={styles.legend}>
          <Text style={styles.legendTitle}>LEGEND</Text>
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: MapTheme.colors.nodeApprovedClean }]} />
            <Text style={styles.legendText}>APPROVED</Text>
          </View>
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: MapTheme.colors.nodeApprovedHarm }]} />
            <Text style={styles.legendText}>CAUSED HARM</Text>
          </View>
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: MapTheme.colors.nodeDeniedClean }]} />
            <Text style={styles.legendText}>DENIED</Text>
          </View>
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: MapTheme.colors.coreNode }]} />
            <Text style={styles.legendText}>YOU</Text>
          </View>
        </View>

        {/* Back Button */}
        <View style={styles.footer}>
          <MechanicalButton
            label="RETURN TO PROCESSING"
            onPress={handleBack}
            color={Theme.colors.industrialCream}
            style={{ flex: 1 }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

// Helper functions
function getStateColor(state: NodeState): string {
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

function getStateLabel(state: NodeState): string {
  switch (state) {
    case 'approved-clean': return 'APPROVED';
    case 'approved-harm': return 'HARM CAUSED';
    case 'denied-clean': return 'DENIED';
    case 'denied-harm': return 'DENIED — HARM';
    case 'held': return 'HELD';
    case 'gone': return 'GONE';
    case 'pending': return 'PENDING';
    default: return 'UNKNOWN';
  }
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: MapTheme.colors.void,
  },
  container: {
    flex: 1,
    backgroundColor: Theme.colors.bgDark,
    padding: 12,
  },
  // Header
  header: {
    marginBottom: 12,
  },
  headerPanel: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 3,
    borderWidth: 2,
    borderTopColor: 'rgba(0,0,0,0.4)',
    borderLeftColor: 'rgba(0,0,0,0.3)',
    borderBottomColor: 'rgba(80,85,95,0.25)',
    borderRightColor: 'rgba(80,85,95,0.2)',
  },
  textureContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  texture: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.12,
  },
  textureTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(28, 32, 40, 0.94)',
  },
  headerContent: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLabel: {
    fontFamily: Theme.fonts.mono,
    fontSize: 14,
    fontWeight: '700',
    color: Theme.colors.industrialCream,
    letterSpacing: 2,
  },
  headerSubtext: {
    fontFamily: Theme.fonts.mono,
    fontSize: 9,
    color: Theme.colors.textDim,
    marginTop: 2,
    letterSpacing: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 2,
  },
  closeButtonText: {
    fontFamily: Theme.fonts.mono,
    fontSize: 24,
    color: Theme.colors.textSecondary,
    marginTop: -4,
  },
  // Stats Bar
  statsBar: {
    flexDirection: 'row',
    backgroundColor: MapTheme.colors.panel,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontFamily: Theme.fonts.mono,
    fontSize: 18,
    fontWeight: '700',
    color: MapTheme.colors.textPrimary,
  },
  statLabel: {
    fontFamily: Theme.fonts.mono,
    fontSize: 8,
    color: MapTheme.colors.textDim,
    letterSpacing: 1,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 4,
  },
  // Map
  mapContainer: {
    flex: 1,
    position: 'relative',
    marginBottom: 8, // Give footer more room
  },
  mapBorder: {
    flex: 1,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
    backgroundColor: MapTheme.colors.void, // Ensure bg is flush
  },
  scanLines: {
    ...StyleSheet.absoluteFillObject,
    // CSS-like scan lines effect would go here
    // For now, just a subtle overlay
    backgroundColor: 'transparent',
  },
  // Detail Panel
  detailPanel: {
    backgroundColor: MapTheme.colors.panel,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: 8,
  },
  detailBadgeText: {
    fontFamily: Theme.fonts.mono,
    fontSize: 9,
    fontWeight: '700',
    color: MapTheme.colors.void,
    letterSpacing: 0.5,
  },
  detailId: {
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    color: MapTheme.colors.textDim,
  },
  detailName: {
    fontFamily: Theme.fonts.mono,
    fontSize: 16,
    fontWeight: '700',
    color: MapTheme.colors.textPrimary,
    letterSpacing: 1,
  },
  detailType: {
    fontFamily: Theme.fonts.mono,
    fontSize: 9,
    color: MapTheme.colors.textSecondary,
    marginTop: 4,
  },
  // Legend
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginTop: 8,
    gap: 12,
  },
  legendTitle: {
    fontFamily: Theme.fonts.mono,
    fontSize: 8,
    color: MapTheme.colors.textDim,
    letterSpacing: 1,
    marginRight: 8,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontFamily: Theme.fonts.mono,
    fontSize: 8,
    color: MapTheme.colors.textSecondary,
    letterSpacing: 0.5,
  },
  // Footer
  footer: {
    marginTop: 16, // Increase space between legend and button
  },
});

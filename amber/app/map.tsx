import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Dimensions, LayoutChangeEvent } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import NodeMap, { MapNode, MapEdge, NodeState } from '../components/map/NodeMap';
import { MapTheme } from '../constants/mapTheme';
import { Theme } from '../constants/theme';
import { MechanicalButton } from '../components/ui/MechanicalUI';
import { HUDBox } from '../components/ui/HUDBox';
import { useGameStore } from '../store/gameStore';
import { ProceduralPortrait } from '../components/ui/ProceduralPortrait';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const METAL_TEXTURE = require('../assets/textures/Texturelabs_Metal_264S.jpg');

export default function MapScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedNode, setSelectedNode] = useState<MapNode | null>(null);
  const [mapLayout, setMapLayout] = useState({ width: SCREEN_WIDTH - 32, height: SCREEN_HEIGHT * 0.5 });
  const decisionLog = useGameStore((state) => state.decisionLog);
  const alertLog = useGameStore((state) => state.alertLog);
  const propagandaFeed = useGameStore((state) => state.propagandaFeed);

  // Alert state is handled by the dedicated AlertModeScreen
  // We still use alertLog for node coloring on the map

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

  const { nodes, edges } = useMemo(() => {
    const subjectNodes: MapNode[] = [];
    const subjectEdges: MapEdge[] = [];
    decisionLog.forEach((entry, index) => {
      const decisionLabel = entry.decision === 'APPROVE' ? 'APPROVED' : 'DENIED';
      const alertEntry = alertLog.find(alert => alert.subjectId === entry.subjectId);
      const isAlertRed = alertEntry?.outcome === 'IGNORED' || alertEntry?.outcome === 'DETONATED';
      const state: NodeState =
        entry.decision === 'APPROVE'
          ? (entry.correct ? 'approved-clean' : 'approved-harm')
          : (entry.correct ? 'denied-clean' : 'denied-harm');
      const finalState: NodeState = isAlertRed ? 'alert-red' : state;
      const nodeId = `subject-${entry.subjectId}-${index}`;
      subjectNodes.push({
        id: nodeId,
        type: 'subject',
        label: `${entry.subjectName} — ${decisionLabel}`,
        state: finalState,
        subjectId: entry.subjectId,
      });
      subjectEdges.push({
        id: `edge-${nodeId}`,
        from: 'player',
        to: nodeId,
        type: 'decision',
      });
    });
    return {
      nodes: [{ id: 'player', type: 'player', label: 'AMBER CHECKPOINT', state: 'approved-clean' }, ...subjectNodes],
      edges: subjectEdges,
    };
  }, [decisionLog, alertLog]);

  // Stats from nodes (subject count only)
  const stats = useMemo(() => {
    const subjects = nodes.filter(n => n.type === 'subject');
    return {
      total: subjects.length,
      approved: subjects.filter(n => n.state.startsWith('approved')).length,
      denied: subjects.filter(n => n.state.startsWith('denied')).length,
      harm: subjects.filter(n => n.state.includes('harm') || n.state === 'alert-red').length,
    };
  }, [nodes]);

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
              nodes={nodes}
              edges={edges}
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


        {/* Legend */}
        <View style={styles.legend}>
   
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: MapTheme.colors.nodeApprovedClean }]} />
            <Text style={styles.legendText}>APPROVED</Text>
          </View>
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: MapTheme.colors.nodeDeniedClean }]} />
            <Text style={styles.legendText}>DENIED</Text>
          </View>
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: MapTheme.colors.nodeAlertRed }]} />
            <Text style={styles.legendText}>ALERT</Text>
          </View>
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: MapTheme.colors.coreNode }]} />
            <Text style={styles.legendText}>YOU</Text>
          </View>
        </View>

        {/* Propaganda Feed */}
        {propagandaFeed.length > 0 && (
          <View style={styles.propagandaPanel}>
            <Text style={styles.propagandaLabel}>AMBER NEWS</Text>
            <Text style={styles.propagandaHeadline}>{propagandaFeed[0].headline}</Text>
            <Text style={styles.propagandaBody}>{propagandaFeed[0].body}</Text>
          </View>
        )}

        {/* Back Button */}
        <View style={styles.footer}>
          <MechanicalButton
            label="RETURN TO PROCESSING"
            onPress={handleBack}
            color={Theme.colors.industrialCream}
            style={{ flex: 1 }}
          />
        </View>

        {/* Selected Node Details - Overlay positioned at bottom of map */}
        {selectedNode && (
          <View style={styles.detailPanelOverlay}>
            <TouchableOpacity 
              style={styles.detailPanelBackdrop} 
              activeOpacity={1} 
              onPress={() => setSelectedNode(null)} 
            />
            <View style={styles.detailPanel}>
              <TouchableOpacity style={styles.detailCloseButton} onPress={() => setSelectedNode(null)}>
                <Text style={styles.detailCloseText}>×</Text>
              </TouchableOpacity>
              {selectedNode.type === 'player' ? (
                <>
                  <Text style={styles.detailName}>{selectedNode.label}</Text>
                  <Text style={styles.detailType}>LOCATION: CENTRAL HUB</Text>
                </>
              ) : (() => {
                const logEntry = decisionLog.find(entry => entry.subjectId === selectedNode.subjectId);
                const isApproved = selectedNode.state.startsWith('approved');
                const isDenied = selectedNode.state.startsWith('denied');
                
                return (
                  <>
                    <View style={styles.detailHeader}>
                      <View style={[styles.detailBadge, { backgroundColor: getStateColor(selectedNode.state) }]}>
                        <Text style={styles.detailBadgeText}>{getStateLabel(selectedNode.state)}</Text>
                      </View>
                      <Text style={styles.detailId}>{selectedNode.subjectId}</Text>
                    </View>
                    
                    {/* Portrait and Name Row */}
                    <View style={styles.detailPortraitRow}>
                      <View style={styles.detailPortraitContainer}>
                        <ProceduralPortrait
                          subjectId={selectedNode.subjectId || selectedNode.id}
                          subjectType={logEntry?.subjectType}
                          sex={logEntry?.sex || 'M'}
                          portraitPreset="dossier"
                          style={styles.detailPortrait}
                        />
                      </View>
                      <View style={styles.detailNameContainer}>
                        <Text style={styles.detailName}>{logEntry?.subjectName || selectedNode.label.split(' — ')[0]}</Text>
                        {/* Subject Info Grid */}
                        <View style={styles.detailGridCompact}>
                          <View style={styles.detailGridItem}>
                            <Text style={styles.detailGridLabel}>TYPE</Text>
                            <Text style={styles.detailGridValue}>{logEntry?.subjectType || 'HUMAN'}</Text>
                          </View>
                          <View style={styles.detailGridItem}>
                            <Text style={styles.detailGridLabel}>ORIGIN</Text>
                            <Text style={styles.detailGridValue}>{logEntry?.originPlanet || '—'}</Text>
                          </View>
                        </View>
                      </View>
                    </View>
                    
                    {/* Approved: Show ticket info */}
                    {isApproved && (
                      <View style={styles.detailSection}>
                        <Text style={styles.detailSectionLabel}>TRANSIT CLEARANCE</Text>
                        <View style={styles.detailGrid}>
                          <View style={styles.detailGridItem}>
                            <Text style={styles.detailGridLabel}>DESTINATION</Text>
                            <Text style={[styles.detailGridValue, styles.detailGridValueHighlight]}>
                              {logEntry?.destinationPlanet || '—'}
                            </Text>
                          </View>
                          <View style={styles.detailGridItem}>
                            <Text style={styles.detailGridLabel}>OCCUPATION</Text>
                            <Text style={styles.detailGridValue}>{logEntry?.permitType || '—'}</Text>
                          </View>
                        </View>
                        {logEntry?.warrants && logEntry.warrants !== 'NONE' && (
                          <View style={styles.detailWarning}>
                            <Text style={styles.detailWarningText}>⚠ WARRANT: {logEntry.warrants}</Text>
                          </View>
                        )}
                      </View>
                    )}
                    
                    {/* Denied: Show reason */}
                    {isDenied && (
                      <View style={styles.detailSection}>
                        <Text style={styles.detailSectionLabel}>DENIAL REASON</Text>
                        <Text style={styles.detailDenyReason}>{logEntry?.denyReason || 'UNSPECIFIED'}</Text>
                        {logEntry?.destinationPlanet && (
                          <Text style={styles.detailDenyContext}>
                            INTENDED DESTINATION: {logEntry.destinationPlanet}
                          </Text>
                        )}
                      </View>
                    )}
                    
                    {/* Alert info if exists */}
                    {alertLog.some(entry => entry.subjectId === selectedNode.subjectId) && (
                      <View style={styles.alertDetail}>
                        {alertLog
                          .filter(entry => entry.subjectId === selectedNode.subjectId)
                          .map(entry => (
                            <View key={`alert-${entry.subjectId}`}>
                              <Text style={styles.alertDetailLabel}>ALERT STATUS</Text>
                              <Text style={styles.alertDetailValue}>{entry.outcome.replace('_', ' ')}</Text>
                              {entry.collateralCount ? (
                                <Text style={styles.alertDetailValue}>COLLATERAL: {entry.collateralCount}</Text>
                              ) : null}
                            </View>
                          ))}
                      </View>
                    )}
                  </>
                );
              })()}
            </View>
          </View>
        )}
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
    case 'alert-red': return MapTheme.colors.nodeAlertRed;
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
    case 'alert-red': return 'ALERT';
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
  // Detail Panel - Overlay style
  detailPanelOverlay: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 80, // Above the footer button
    zIndex: 50,
  },
  detailPanelBackdrop: {
    position: 'absolute',
    top: -2000,
    left: -100,
    right: -100,
    bottom: -100,
  },
  detailPanel: {
    backgroundColor: MapTheme.colors.panel,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  detailCloseButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  detailCloseText: {
    fontFamily: Theme.fonts.mono,
    fontSize: 18,
    color: MapTheme.colors.textDim,
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
  detailPortraitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginTop: 4,
  },
  detailPortraitContainer: {
    width: 64,
    height: 80,
    backgroundColor: MapTheme.colors.void,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    overflow: 'hidden',
  },
  detailPortrait: {
    width: '100%',
    height: '100%',
  },
  detailNameContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  detailGridCompact: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
  },
  detailGrid: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  detailGridItem: {
    flex: 1,
  },
  detailGridLabel: {
    fontFamily: Theme.fonts.mono,
    fontSize: 7,
    color: MapTheme.colors.textDim,
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  detailGridValue: {
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    color: MapTheme.colors.textPrimary,
  },
  detailGridValueHighlight: {
    color: MapTheme.colors.nodeApprovedClean,
    fontWeight: 'bold',
  },
  detailSection: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  detailSectionLabel: {
    fontFamily: Theme.fonts.mono,
    fontSize: 8,
    color: MapTheme.colors.textDim,
    letterSpacing: 1,
    marginBottom: 6,
  },
  detailDenyReason: {
    fontFamily: Theme.fonts.mono,
    fontSize: 11,
    color: MapTheme.colors.nodeDeniedHarm,
    fontWeight: 'bold',
  },
  detailDenyContext: {
    fontFamily: Theme.fonts.mono,
    fontSize: 9,
    color: MapTheme.colors.textSecondary,
    marginTop: 4,
  },
  detailWarning: {
    marginTop: 6,
    paddingVertical: 4,
    paddingHorizontal: 6,
    backgroundColor: 'rgba(255, 107, 107, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
  },
  detailWarningText: {
    fontFamily: Theme.fonts.mono,
    fontSize: 9,
    color: MapTheme.colors.nodeApprovedHarm,
  },
  alertDetail: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  alertDetailLabel: {
    fontFamily: Theme.fonts.mono,
    fontSize: 8,
    color: MapTheme.colors.textDim,
    letterSpacing: 1,
    marginBottom: 4,
  },
  alertDetailValue: {
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    color: MapTheme.colors.textPrimary,
    marginBottom: 2,
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
  propagandaPanel: {
    marginTop: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: MapTheme.colors.panel,
  },
  propagandaLabel: {
    fontFamily: Theme.fonts.mono,
    fontSize: 9,
    color: MapTheme.colors.textDim,
    letterSpacing: 1,
    marginBottom: 6,
  },
  propagandaHeadline: {
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
    color: MapTheme.colors.textPrimary,
    marginBottom: 4,
  },
  propagandaBody: {
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    color: MapTheme.colors.textSecondary,
    lineHeight: 14,
  },
  // Footer
  footer: {
    marginTop: 16, // Increase space between legend and button
  },
  alertOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  alertPanel: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: MapTheme.colors.panel,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: 16,
  },
  alertTitle: {
    fontFamily: Theme.fonts.mono,
    fontSize: 14,
    color: MapTheme.colors.nodeApprovedHarm,
    letterSpacing: 2,
    marginBottom: 6,
  },
  alertSubtitle: {
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
    color: MapTheme.colors.textPrimary,
    marginBottom: 4,
  },
  alertLocation: {
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    color: MapTheme.colors.textSecondary,
    marginBottom: 8,
  },
  alertSummary: {
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    color: MapTheme.colors.textSecondary,
    marginBottom: 10,
    lineHeight: 14,
  },
  alertCollateral: {
    fontFamily: Theme.fonts.mono,
    fontSize: 9,
    color: MapTheme.colors.nodeDeniedHarm,
    marginBottom: 10,
  },
  alertActions: {
    gap: 8,
  },
  alertButton: {
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(20,20,28,0.8)',
    alignItems: 'center',
  },
  alertButtonDanger: {
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: MapTheme.colors.halRed,
    backgroundColor: MapTheme.colors.halRedDim,
    alignItems: 'center',
  },
  alertButtonMuted: {
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(10,10,14,0.6)',
    alignItems: 'center',
  },
  alertButtonText: {
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    color: MapTheme.colors.textPrimary,
    letterSpacing: 1,
  },
  alertButtonTextMuted: {
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    color: MapTheme.colors.textDim,
    letterSpacing: 1,
  },
  alertToggle: {
    marginVertical: 8,
  },
  alertToggleText: {
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    color: MapTheme.colors.textPrimary,
    letterSpacing: 1,
  },
  // AMBER Alerts Panel
  alertsPanel: {
    backgroundColor: MapTheme.colors.panel,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
    marginBottom: 10,
    padding: 10,
  },
  alertsPanelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 107, 107, 0.15)',
  },
  alertsPanelTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  alertsPanelIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(100, 100, 100, 0.5)',
  },
  alertsPanelIndicatorActive: {
    backgroundColor: MapTheme.colors.nodeApprovedHarm,
  },
  alertsPanelTitle: {
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    color: MapTheme.colors.nodeApprovedHarm,
    letterSpacing: 1.5,
  },
  alertsPanelMeta: {
    fontFamily: Theme.fonts.mono,
    fontSize: 8,
    color: MapTheme.colors.textDim,
    letterSpacing: 0.5,
  },
  alertsPanelActive: {
    backgroundColor: 'rgba(255, 107, 107, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.25)',
    padding: 8,
  },
  alertActiveHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  alertActiveLabel: {
    fontFamily: Theme.fonts.mono,
    fontSize: 9,
    color: MapTheme.colors.nodeApprovedHarm,
    letterSpacing: 1,
  },
  alertActiveId: {
    fontFamily: Theme.fonts.mono,
    fontSize: 9,
    color: MapTheme.colors.textDim,
  },
  alertActiveTitle: {
    fontFamily: Theme.fonts.mono,
    fontSize: 11,
    color: MapTheme.colors.textPrimary,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  alertActiveLocation: {
    fontFamily: Theme.fonts.mono,
    fontSize: 9,
    color: MapTheme.colors.textSecondary,
    marginBottom: 4,
  },
  alertActiveSummary: {
    fontFamily: Theme.fonts.mono,
    fontSize: 9,
    color: MapTheme.colors.textDim,
    lineHeight: 12,
    marginBottom: 8,
  },
  alertActiveActions: {
    flexDirection: 'row',
    gap: 8,
  },
  alertActiveButton: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.5)',
    alignItems: 'center',
  },
  alertActiveButtonText: {
    fontFamily: Theme.fonts.mono,
    fontSize: 9,
    color: MapTheme.colors.textPrimary,
    letterSpacing: 1,
  },
  alertActiveButtonMuted: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: 'rgba(50, 50, 60, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(100, 100, 110, 0.3)',
    alignItems: 'center',
  },
  alertActiveButtonTextMuted: {
    fontFamily: Theme.fonts.mono,
    fontSize: 9,
    color: MapTheme.colors.textDim,
    letterSpacing: 1,
  },
  alertsPanelEmpty: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  alertsPanelEmptyText: {
    fontFamily: Theme.fonts.mono,
    fontSize: 9,
    color: MapTheme.colors.textDim,
    letterSpacing: 1,
  },
  alertsHistory: {
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  alertsHistoryLabel: {
    fontFamily: Theme.fonts.mono,
    fontSize: 8,
    color: MapTheme.colors.textDim,
    letterSpacing: 1,
    marginBottom: 4,
  },
  alertsHistoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 3,
  },
  alertsHistoryId: {
    fontFamily: Theme.fonts.mono,
    fontSize: 9,
    color: MapTheme.colors.textSecondary,
  },
  alertsHistoryOutcome: {
    fontFamily: Theme.fonts.mono,
    fontSize: 8,
    letterSpacing: 0.5,
  },
  alertsHistoryOutcomeRed: {
    color: MapTheme.colors.nodeApprovedHarm,
  },
  alertsHistoryOutcomeGreen: {
    color: MapTheme.colors.nodeApprovedClean,
  },
});

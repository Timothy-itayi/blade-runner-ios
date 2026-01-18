import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Theme } from '../constants/theme';

// Sector video sources
const SECTOR_VIDEOS: Record<string, any> = {
  'SECTOR 9': require('../assets/videos/example-vid.mp4'),
  // Add more sector videos as they become available
};

// Sector schematic maps (ASCII art)
const SECTOR_MAPS: Record<string, string> = {
  'SECTOR 0': `
    ╔═══════════════════╗
    ║   ┌───────────┐   ║
    ║   │ ◉ CORE ◉  │   ║
    ║   │  ╔═══╗    │   ║
    ║   │  ║ ◈ ║    │   ║
    ║   │  ╚═══╝    │   ║
    ║   └───────────┘   ║
    ╚═══════════════════╝`,
  'SECTOR 1': `
    ┌─────────────────────┐
    │ ████ HQ ████████████│
    │ ████████│  COUNCIL  │
    │─────────┼───────────│
    │ COMM    │  SECURE   │
    │ CENTER  │  VAULT    │
    └─────────────────────┘`,
  'SECTOR 2': `
    ┌─────────────────────┐
    │ ╋ MED-A ╋ │ BIOLAB  │
    │───────────┼─────────│
    │   ICU    │ PHARMA   │
    │───────────┼─────────│
    │ EMERGENCY│ RESEARCH │
    └─────────────────────┘`,
  'SECTOR 3': `
    ┌─────────────────────┐
    │ ═══ RAIL ══════════ │
    │ ▓▓▓│DEPOT│▓▓▓│SORT │
    │────┼─────┼───┼──────│
    │LOAD│     │   │DISTRO│
    │ ═══ RAIL ══════════ │
    └─────────────────────┘`,
  'SECTOR 4': `
    ┌─────────────────────┐
    │ ▒▒▒ │ ▒▒▒ │ ▒▒▒ │▒▒ │
    │ RES │ RES │ RES │COM│
    │─────┼─────┼─────┼───│
    │ ADMIN CENTER   │SVC│
    │─────────────────┼───│
    │ ▒▒▒ │ ▒▒▒ │ ▒▒▒ │▒▒ │
    └─────────────────────┘`,
  'SECTOR 5': `
    ┌─────────────────────┐
    │ ⚙ MAINT │ ⚙ REPAIR │
    │─────────┼───────────│
    │ PARTS   │  TOOLS    │
    │ DEPOT   │  STORAGE  │
    │─────────┼───────────│
    │   ⚙ WORKSHOPS ⚙     │
    └─────────────────────┘`,
  'SECTOR 6': `
    ┌─────────────────────┐
    │ ══ TRANSIT HUB ════ │
    │ ▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶ │
    │─────────────────────│
    │ ⚡POWER │ WATER│GRID│
    │─────────┼─────┼─────│
    │ ◀◀◀◀◀◀◀◀◀◀◀◀◀◀◀◀◀◀ │
    └─────────────────────┘`,
  'SECTOR 7': `
    ┌─────────────────────┐
    │ ▓▓▓ FACTORY A ▓▓▓▓▓ │
    │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
    │─────────────────────│
    │ ▓▓▓ FACTORY B ▓▓▓▓▓ │
    │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
    │ ░░░ WASTE ░░░░░░░░░ │
    └─────────────────────┘`,
  'SECTOR 8': `
    ┌─────────────────────┐
    │ ░░░░░░░░░░░░░░░░░░░ │
    │ ░ ARCHIVE A ░░░░░░░ │
    │ ░░░░░░░░░░░░░░░░░░░ │
    │─────────────────────│
    │ ░ STORAGE │ RECYCLE │
    │ ░░░░░░░░░│░░░░░░░░░ │
    └─────────────────────┘`,
  'SECTOR 9': `
    ┌─────────────────────┐
    │ ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒ │
    │ ▒ HOUSING ▒▒▒▒▒▒▒▒▒ │
    │ ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒ │
    │ ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒ │
    │ ░░ WASTE ░░│ TEMP ░ │
    │ ░░░░░░░░░░░│░░░░░░░ │
    └─────────────────────┘`,
};

// Sector information database
const SECTOR_INFO: Record<string, { division: string; function: string; clearance: string; population: string; notes: string }> = {
  'SECTOR 0': {
    division: 'CORE SYSTEMS',
    function: 'Central processing, global network control, AI oversight',
    clearance: 'LEVEL 0 — SYSTEM ONLY',
    population: 'CLASSIFIED',
    notes: 'No human personnel authorized. Autonomous operations.',
  },
  'SECTOR 1': {
    division: 'HIGH COMMAND',
    function: 'Executive administration, policy enforcement, global coordination',
    clearance: 'LEVEL 1 — TOP SECRET',
    population: '~2,400',
    notes: 'Central authority hub. All sector directives originate here.',
  },
  'SECTOR 2': {
    division: 'CRITICAL INFRASTRUCTURE',
    function: 'Medical facilities, emergency response, biotech research',
    clearance: 'LEVEL 2 — RESTRICTED',
    population: '~18,000',
    notes: 'Primary healthcare and life support systems for all sectors.',
  },
  'SECTOR 3': {
    division: 'LOGISTICS HUB',
    function: 'Supply chain management, resource allocation, distribution',
    clearance: 'LEVEL 3 — AUTHORIZED',
    population: '~45,000',
    notes: 'Central routing for all inter-sector material transfers.',
  },
  'SECTOR 4': {
    division: 'STANDARD OPERATIONS',
    function: 'General workforce, administrative services, data processing',
    clearance: 'LEVEL 4 — STANDARD',
    population: '~120,000',
    notes: 'Primary residential and commercial zone for active personnel.',
  },
  'SECTOR 5': {
    division: 'ENGINEERING & MAINTENANCE',
    function: 'Infrastructure repair, system maintenance, technical services',
    clearance: 'LEVEL 5 — STANDARD',
    population: '~85,000',
    notes: 'Skilled labor pool. High transit frequency to other sectors.',
  },
  'SECTOR 6': {
    division: 'TRANSPORT & UTILITIES',
    function: 'Transit operations, power distribution, waste management',
    clearance: 'LEVEL 6 — OPEN',
    population: '~95,000',
    notes: 'Essential services hub. 24-hour operational cycle.',
  },
  'SECTOR 7': {
    division: 'INDUSTRIAL ZONE',
    function: 'Manufacturing, fabrication, heavy machinery operations',
    clearance: 'LEVEL 7 — OPEN',
    population: '~110,000',
    notes: 'Primary production facilities. High pollution index.',
  },
  'SECTOR 8': {
    division: 'ARCHIVE & STORAGE',
    function: 'Data archives, material storage, recycling operations',
    clearance: 'LEVEL 8 — MINIMAL',
    population: '~65,000',
    notes: 'Long-term storage facilities. Low priority maintenance.',
  },
  'SECTOR 9': {
    division: 'PERIPHERAL ZONE',
    function: 'Overflow housing, transitional services, waste processing',
    clearance: 'LEVEL 9 — MINIMAL',
    population: '~140,000',
    notes: 'High population density. Limited infrastructure investment.',
  },
};

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  operatorId?: string;
  currentShift?: number;
  totalSubjectsProcessed?: number;
  accuracy?: number;
  shiftData?: {
    stationName: string;
    city: string;
    authorityLabel: string;
    briefing: string;
  };
}

export const SettingsModal = ({ 
  visible, 
  onClose, 
  operatorId = 'OP-7734',
  currentShift = 1,
  totalSubjectsProcessed = 0,
  accuracy = 1.0,
  shiftData,
}: SettingsModalProps) => {
  
  const accuracyPercent = Math.round(accuracy * 100);
  const accuracyColor = accuracyPercent >= 90 ? Theme.colors.accentApprove : 
                        accuracyPercent >= 70 ? Theme.colors.accentWarn : 
                        Theme.colors.accentDeny;

  // Get sector info based on current station
  const sectorKey = shiftData?.stationName || 'SECTOR 4';
  const sectorInfo = SECTOR_INFO[sectorKey] || SECTOR_INFO['SECTOR 4'];
  const sectorMap = SECTOR_MAPS[sectorKey] || SECTOR_MAPS['SECTOR 4'];
  const sectorVideoSource = SECTOR_VIDEOS[sectorKey];
  
  // Create video player for sector schematic
  const player = useVideoPlayer(sectorVideoSource || null, (player) => {
    if (sectorVideoSource) {
      player.loop = true;
      player.muted = true;
      player.play();
    }
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{shiftData?.stationName || 'SECTOR INFO'}</Text>
            <Text style={styles.headerSub}>{shiftData?.city || 'TERMINAL'} — {shiftData?.authorityLabel || 'SYSTEM'}</Text>
          </View>

          <ScrollView style={styles.content}>
            {/* Sector Map */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>SECTOR SCHEMATIC</Text>
              <View style={styles.sectorMapBox}>
                {sectorVideoSource ? (
                  <VideoView
                    player={player}
                    style={styles.sectorVideo}
                    contentFit="cover"
                    nativeControls={false}
                  />
                ) : (
                  <Text style={styles.sectorMapText}>{sectorMap}</Text>
                )}
              </View>
            </View>

            {/* Sector Info */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>SECTOR INFORMATION</Text>
              <View style={styles.sectorInfoBox}>
                <Text style={styles.sectorDivision}>{sectorInfo.division}</Text>
                <Text style={styles.sectorFunction}>{sectorInfo.function}</Text>
                <View style={styles.sectorDetailsGrid}>
                  <View style={styles.sectorDetailItem}>
                    <Text style={styles.sectorDetailLabel}>CLEARANCE</Text>
                    <Text style={styles.sectorDetailValue}>{sectorInfo.clearance}</Text>
                  </View>
                  <View style={styles.sectorDetailItem}>
                    <Text style={styles.sectorDetailLabel}>POPULATION</Text>
                    <Text style={styles.sectorDetailValue}>{sectorInfo.population}</Text>
                  </View>
                </View>
                <Text style={styles.sectorNotes}>{sectorInfo.notes}</Text>
              </View>
            </View>

            {/* Current Directive */}
            {shiftData?.briefing && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>ACTIVE DIRECTIVE</Text>
                <View style={styles.directiveBox}>
                  <Text style={styles.directiveText}>{shiftData.briefing}</Text>
                </View>
              </View>
            )}

            {/* Operator Info */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>OPERATOR STATUS</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>ID:</Text>
                <Text style={styles.infoValue}>{operatorId}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>SHIFT:</Text>
                <Text style={styles.infoValue}>{currentShift} / 10</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>PROCESSED:</Text>
                <Text style={styles.infoValue}>{totalSubjectsProcessed} SUBJECTS</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>ACCURACY:</Text>
                <Text style={[styles.infoValue, { color: accuracyColor }]}>{accuracyPercent}%</Text>
              </View>
            </View>

            {/* System Info */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>SYSTEM STATUS</Text>
              <View style={styles.statusRow}>
                <View style={[styles.statusDot, styles.statusActive]} />
                <Text style={styles.statusText}>NETWORK: CONNECTED</Text>
              </View>
              <View style={styles.statusRow}>
                <View style={[styles.statusDot, styles.statusActive]} />
                <Text style={styles.statusText}>DATABASE: SYNCED</Text>
              </View>
              <View style={styles.statusRow}>
                <View style={[styles.statusDot, styles.statusActive]} />
                <Text style={styles.statusText}>BIOMETRICS: ONLINE</Text>
              </View>
            </View>

            {/* Options */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>OPTIONS</Text>
              <TouchableOpacity style={styles.optionButton} disabled>
                <Text style={styles.optionText}>AUDIO: ON</Text>
                <Text style={styles.optionArrow}>▶</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.optionButton} disabled>
                <Text style={styles.optionText}>HAPTICS: ON</Text>
                <Text style={styles.optionArrow}>▶</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.optionButton} disabled>
                <Text style={styles.optionText}>LANGUAGE: EN</Text>
                <Text style={styles.optionArrow}>▶</Text>
              </TouchableOpacity>
            </View>

            {/* Legal */}
            <View style={styles.section}>
              <Text style={styles.legalText}>
                ALL OPERATOR ACTIONS ARE LOGGED AND MONITORED.{'\n'}
                UNAUTHORIZED ACCESS IS A CLASS-3 VIOLATION.
              </Text>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>[ CLOSE ]</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxHeight: '80%',
    backgroundColor: '#0a0c0f',
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
    backgroundColor: 'rgba(26, 42, 58, 0.3)',
  },
  headerTitle: {
    fontFamily: Theme.fonts.mono,
    fontSize: 16,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
    letterSpacing: 2,
  },
  headerSub: {
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    color: Theme.colors.textDim,
    marginTop: 4,
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: Theme.fonts.mono,
    fontSize: 11,
    fontWeight: '700',
    color: Theme.colors.textSecondary,
    letterSpacing: 1,
    marginBottom: 12,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(74, 106, 122, 0.2)',
  },
  sectorMapBox: {
    backgroundColor: '#0a0c0f',
    borderWidth: 1,
    borderColor: 'rgba(74, 106, 122, 0.4)',
    padding: 0,
    alignItems: 'center',
    overflow: 'hidden',
  },
  sectorVideo: {
    width: '100%',
    height: 180,
  },
  sectorMapText: {
    fontFamily: Theme.fonts.mono,
    fontSize: 9,
    color: Theme.colors.accentWarn,
    lineHeight: 12,
    letterSpacing: 0,
    padding: 8,
  },
  sectorInfoBox: {
    backgroundColor: 'rgba(26, 42, 58, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(74, 106, 122, 0.3)',
    padding: 12,
  },
  sectorDivision: {
    fontFamily: Theme.fonts.mono,
    fontSize: 14,
    fontWeight: '700',
    color: Theme.colors.accentWarn,
    letterSpacing: 1,
    marginBottom: 4,
  },
  sectorFunction: {
    fontFamily: Theme.fonts.mono,
    fontSize: 11,
    color: Theme.colors.textSecondary,
    lineHeight: 16,
    marginBottom: 12,
  },
  sectorDetailsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  sectorDetailItem: {
    flex: 1,
  },
  sectorDetailLabel: {
    fontFamily: Theme.fonts.mono,
    fontSize: 9,
    color: Theme.colors.textDim,
    letterSpacing: 1,
    marginBottom: 2,
  },
  sectorDetailValue: {
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    color: Theme.colors.textPrimary,
    fontWeight: '600',
  },
  sectorNotes: {
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    color: Theme.colors.textDim,
    fontStyle: 'italic',
    lineHeight: 14,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(74, 106, 122, 0.2)',
  },
  directiveBox: {
    backgroundColor: 'rgba(212, 83, 74, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(212, 83, 74, 0.3)',
    borderLeftWidth: 3,
    borderLeftColor: Theme.colors.accentDeny,
    padding: 12,
  },
  directiveText: {
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
    fontWeight: '700',
    color: Theme.colors.accentDeny,
    lineHeight: 18,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
    color: Theme.colors.textDim,
  },
  infoValue: {
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
    fontWeight: '600',
    color: Theme.colors.textPrimary,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  statusActive: {
    backgroundColor: Theme.colors.accentApprove,
  },
  statusInactive: {
    backgroundColor: Theme.colors.accentDeny,
  },
  statusText: {
    fontFamily: Theme.fonts.mono,
    fontSize: 11,
    color: Theme.colors.textSecondary,
  },
  optionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(26, 42, 58, 0.2)',
    borderWidth: 1,
    borderColor: '#2a3a4a',
    marginBottom: 8,
    opacity: 0.6,
  },
  optionText: {
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
    color: Theme.colors.textSecondary,
  },
  optionArrow: {
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    color: Theme.colors.textDim,
  },
  legalText: {
    fontFamily: Theme.fonts.mono,
    fontSize: 9,
    color: Theme.colors.textDim,
    textAlign: 'center',
    lineHeight: 14,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
    alignItems: 'center',
  },
  closeButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  closeButtonText: {
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
    color: Theme.colors.textSecondary,
    letterSpacing: 1,
  },
});

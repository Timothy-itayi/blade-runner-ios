import React from 'react';
import { View, Text, Modal, TouchableOpacity, Pressable, StyleSheet, ScrollView } from 'react-native';
import { Theme } from '../../constants/theme';
import { useGameAudioContext } from '../../contexts/AudioContext';

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
    chapter: string;
    authorityLabel: string;
    briefing: string;
    directive: string;
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
  const { sfxEnabled, setSfxEnabled } = useGameAudioContext();

  const handleToggleSfx = () => {
    setSfxEnabled(!sfxEnabled);
  };
  
  const accuracyPercent = Math.round(accuracy * 100);
  const accuracyColor = accuracyPercent >= 90 ? Theme.colors.accentApprove : 
                        accuracyPercent >= 70 ? Theme.colors.accentWarn : 
                        Theme.colors.accentDeny;

  // Get sector info based on current station
  const sectorKey = shiftData?.stationName || 'SECTOR 4';
  const sectorInfo = SECTOR_INFO[sectorKey] || SECTOR_INFO['SECTOR 4'];
  
  // Helper function to generate dynamic system status based on game narrative
  const getSystemStatus = (accuracy: number, subjectsProcessed: number, shiftNum: number) => {
    const statusElements: React.ReactElement[] = [];
    
    // Network status - degrades as shifts progress
    const networkStatus = shiftNum > 15 ? 'DEGRADED' : shiftNum > 10 ? 'UNSTABLE' : 'CONNECTED';
    statusElements.push(
      <View key="network" style={styles.statusRow}>
        <View style={[styles.statusDot, networkStatus === 'CONNECTED' ? styles.statusActive : styles.statusInactive]} />
        <Text style={styles.statusText}>NETWORK: {networkStatus}</Text>
      </View>
    );
    
    // Database status - issues appear later
    const dbStatus = shiftNum > 12 && accuracy < 0.7 ? 'SYNC ERRORS' : 'SYNCED';
    statusElements.push(
      <View key="database" style={styles.statusRow}>
        <View style={[styles.statusDot, dbStatus === 'SYNCED' ? styles.statusActive : styles.statusInactive]} />
        <Text style={styles.statusText}>DATABASE: {dbStatus}</Text>
      </View>
    );
    
    // Biometrics - always online but may show warnings
    const bioStatus = shiftNum > 16 ? 'ANOMALIES DETECTED' : 'ONLINE';
    statusElements.push(
      <View key="biometrics" style={styles.statusRow}>
        <View style={[styles.statusDot, styles.statusActive]} />
        <Text style={styles.statusText}>BIOMETRICS: {bioStatus}</Text>
      </View>
    );
    
    // Additional status based on accuracy
    if (accuracy < 0.6) {
      statusElements.push(
        <View key="warning" style={styles.statusRow}>
          <View style={[styles.statusDot, styles.statusInactive]} />
          <Text style={styles.statusText}>PERFORMANCE: FLAGGED FOR REVIEW</Text>
        </View>
      );
    }
    
    // System stability warning in later shifts
    if (shiftNum > 18) {
      statusElements.push(
        <View key="stability" style={styles.statusRow}>
          <View style={[styles.statusDot, styles.statusInactive]} />
          <Text style={styles.statusText}>SYSTEM STABILITY: CRITICAL</Text>
        </View>
      );
    }
    
    return <>{statusElements}</>;
  };

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
            <Text style={styles.headerSub}>{shiftData?.chapter || 'TERMINAL'} — {shiftData?.authorityLabel || 'SYSTEM'}</Text>
          </View>

          <ScrollView style={styles.content}>
            {/* Current Directive - Moved to top */}
            {shiftData?.directive && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>ACTIVE DIRECTIVE</Text>
                <View style={styles.directiveBox}>
                  <Text style={styles.directiveText}>{shiftData.directive}</Text>
                </View>
              </View>
            )}

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

            {/* Operator Info */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>OPERATOR STATUS</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>ID:</Text>
                <Text style={styles.infoValue}>{operatorId}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>SHIFT:</Text>
                <Text style={styles.infoValue}>{currentShift} / 20</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>PROCESSED:</Text>
                <Text style={styles.infoValue}>{totalSubjectsProcessed} / 80 SUBJECTS</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>ACCURACY:</Text>
                <Text style={[styles.infoValue, { color: accuracyColor }]}>{accuracyPercent}%</Text>
              </View>
            </View>

            {/* System Status - Dynamic based on game narrative */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>SYSTEM STATUS</Text>
              {getSystemStatus(accuracy, totalSubjectsProcessed, currentShift)}
            </View>

            {/* Options - Only SFX */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>OPTIONS</Text>
              <TouchableOpacity style={styles.optionButton} onPress={handleToggleSfx}>
                <Text style={styles.optionText}>SFX: {sfxEnabled ? 'ON' : 'OFF'}</Text>
                <Text style={[styles.optionArrow, !sfxEnabled && styles.optionOff]}>
                  {sfxEnabled ? '▶' : '◼'}
                </Text>
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
            <Pressable
              style={({ pressed }) => [
                styles.closeButton,
                pressed && styles.closeButtonPressed
              ]}
              onPress={onClose}
            >
              <Text style={styles.closeButtonText}>[ CLOSE ]</Text>
            </Pressable>
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
  optionOff: {
    color: Theme.colors.accentDeny,
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
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  closeButtonPressed: {
    backgroundColor: 'rgba(127, 184, 216, 0.2)',
    borderColor: Theme.colors.textSecondary,
  },
  closeButtonText: {
    fontFamily: Theme.fonts.mono,
    fontSize: 14,
    fontWeight: '600',
    color: Theme.colors.textSecondary,
    letterSpacing: 1,
  },
});

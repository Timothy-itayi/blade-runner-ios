import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SubjectData } from '../data/subjects';
import { Theme } from '@/constants/theme';

interface VerificationDrawerProps {
  subject: SubjectData;
  onClose: () => void;
  onQueryPerformed?: (queryType: 'WARRANT' | 'TRANSIT' | 'INCIDENT' | 'DIALOGUE') => void;
}

type QueryType = 'WARRANT' | 'TRANSIT' | 'INCIDENT' | 'DIALOGUE';

const QUERY_LABELS: Record<QueryType, string> = {
  WARRANT: 'warrant_check',
  TRANSIT: 'transit_log',
  INCIDENT: 'incident_history',
  DIALOGUE: 'dialogue_analysis',
};

// Operator ID - in production this would come from auth context
const OPERATOR_ID = 'OP-7734';

export const VerificationDrawer = ({ subject, onClose, onQueryPerformed }: VerificationDrawerProps) => {
  const [activeCheck, setActiveCheck] = useState<QueryType | null>(null);
  const [queriesPerformed, setQueriesPerformed] = useState<Set<string>>(new Set());
  const [queryTimestamps, setQueryTimestamps] = useState<Record<string, string>>({});

  const getTimestamp = () => {
    const now = new Date();
    return `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
  };

  const handleSelectCheck = (check: QueryType) => {
    setActiveCheck(check);
    if (!queriesPerformed.has(check)) {
      setQueriesPerformed(prev => new Set(prev).add(check));
      setQueryTimestamps(prev => ({ ...prev, [check]: getTimestamp() }));
      onQueryPerformed?.(check);
    }
  };

  const handleBack = () => setActiveCheck(null);

  // Terminal line components
  const TerminalPrompt = ({ command, logged = true }: { command: string; logged?: boolean }) => (
    <View style={styles.promptBlock}>
      <View style={styles.promptLine}>
        <Text style={styles.promptSymbol}>$</Text>
        <Text style={styles.promptCommand}>{command}</Text>
      </View>
      {logged && (
        <Text style={styles.logNotice}>
          [LOGGED: {OPERATOR_ID} @ {queryTimestamps[activeCheck || ''] || getTimestamp()}]
        </Text>
      )}
    </View>
  );

  const TerminalOutput = ({ label, value, status }: { label: string; value: string; status?: 'ok' | 'warn' | 'error' | 'dim' }) => {
    const valueColor = status === 'ok' ? styles.statusOk : 
                       status === 'warn' ? styles.statusWarn : 
                       status === 'error' ? styles.statusError : 
                       status === 'dim' ? styles.statusDim : styles.statusNeutral;
    return (
      <View style={styles.outputLine}>
        <Text style={styles.outputLabel}>{label}</Text>
        <Text style={[styles.outputValue, valueColor]}>{value}</Text>
      </View>
    );
  };

  const TerminalDivider = () => (
    <Text style={styles.divider}>────────────────────────────────────</Text>
  );

  const TerminalStatus = ({ message, status }: { message: string; status: 'ok' | 'warn' | 'error' }) => {
    const icon = status === 'ok' ? '✓' : status === 'warn' ? '⚠' : '✗';
    const color = status === 'ok' ? styles.statusOk : status === 'warn' ? styles.statusWarn : styles.statusError;
    return (
      <View style={styles.statusLine}>
        <Text style={[styles.statusIcon, color]}>{icon}</Text>
        <Text style={[styles.statusMessage, color]}>{message}</Text>
      </View>
    );
  };

  const renderWarrantCheck = () => {
    const hasWarrants = subject.warrants !== 'NONE';
    return (
      <>
        <TerminalPrompt command={`nquery --table=warrants --subject=${subject.id}`} />
        <Text style={styles.responseHeader}>[NETWORK RESPONSE]</Text>
        <TerminalDivider />
        
        <TerminalOutput 
          label="WARRANT_STATUS:" 
          value={subject.warrants} 
          status={hasWarrants ? 'error' : 'ok'} 
        />
        <TerminalOutput 
          label="INCIDENT_COUNT:" 
          value={String(subject.incidents)} 
          status={subject.incidents > 0 ? 'warn' : 'ok'} 
        />
        <TerminalOutput 
          label="COMPLIANCE_RATING:" 
          value={subject.compliance} 
          status={['A', 'B'].includes(subject.compliance) ? 'ok' : ['C', 'D'].includes(subject.compliance) ? 'warn' : 'error'} 
        />

        <TerminalDivider />
        <TerminalStatus 
          message={hasWarrants ? 'ACTIVE WARRANT DETECTED. DETENTION RECOMMENDED.' : 'NO ACTIVE WARRANTS IN DATABASE.'} 
          status={hasWarrants ? 'error' : 'ok'} 
        />
      </>
    );
  };

  const renderTransitLog = () => {
    const transitLog = subject.transitLog || [];
    const hasFlaggedTransit = transitLog.some(t => t.flagged);

    // Extract sector number for hierarchy comparison (lower number = higher clearance)
    const getSectorLevel = (sector: string): number => {
      const match = sector.match(/SECTOR\s*(\d+)/i);
      return match ? parseInt(match[1], 10) : 99;
    };

    // Get subject's home sector level
    const subjectSectorLevel = getSectorLevel(subject.sector);

    // Determine transit direction based on sector hierarchy
    // Only flag as restricted when LOW clearance subject (high sector #) accesses HIGH clearance area (low sector #)
    const getTransitDirection = (from: string, to: string): { icon: string; label: string; color: 'ok' | 'warn' | 'dim' } => {
      const fromLevel = getSectorLevel(from);
      const toLevel = getSectorLevel(to);
      
      if (toLevel < fromLevel) {
        // Going to a higher clearance area (lower sector number)
        // Only flag if subject is from a low-clearance sector trying to access high-clearance
        if (subjectSectorLevel >= 5) {
          return { icon: '▲', label: 'RESTRICTED ZONE', color: 'warn' };
        }
        return { icon: '▲', label: 'AUTHORIZED', color: 'ok' }; // High clearance subject, no issue
      }
      if (toLevel > fromLevel) {
        return { icon: '▼', label: 'STANDARD', color: 'dim' }; // Going to lower clearance, always fine
      }
      return { icon: '●', label: 'INTERNAL', color: 'dim' }; // Same sector level
    };

    // Parse date string into readable parts
    const parseDate = (dateStr: string) => {
      const parts = dateStr.split(' ');
      const datePart = parts[0] || dateStr;
      const timePart = parts[1] || '';
      return { date: datePart, time: timePart };
    };

    return (
      <>
        <TerminalPrompt command={`nquery --table=transit --range=7d --subject=${subject.id}`} />
        <Text style={styles.responseHeader}>[NETWORK RESPONSE: {transitLog.length} RECORDS]</Text>
        <TerminalDivider />
        
        {transitLog.length > 0 ? (
          <ScrollView style={styles.transitScrollContainer}>
            {transitLog.map((entry, i) => {
              const { date, time } = parseDate(entry.date);
              const direction = getTransitDirection(entry.from, entry.to);
              const directionColor = direction.color === 'ok' ? styles.statusOk : 
                                     direction.color === 'warn' ? styles.statusWarn : styles.statusDim;
              
              return (
                <View key={i} style={[styles.transitCard, entry.flagged && styles.transitCardFlagged]}>
                  {/* Date Header */}
                  <View style={styles.transitDateRow}>
                    <Text style={styles.transitDate}>{date}</Text>
                    <Text style={styles.transitTime}>{time}</Text>
                  </View>
                  
                  {/* Journey Row */}
                  <View style={styles.transitJourneyRow}>
                    <View style={styles.transitSector}>
                      <Text style={styles.transitSectorLabel}>FROM</Text>
                      <Text style={styles.transitSectorValue}>{entry.from}</Text>
                    </View>
                    
                    <View style={styles.transitArrowContainer}>
                      <Text style={[styles.transitDirectionIcon, directionColor]}>{direction.icon}</Text>
                      <Text style={styles.transitArrow}>→</Text>
                    </View>
                    
                    <View style={styles.transitSector}>
                      <Text style={styles.transitSectorLabel}>TO</Text>
                      <Text style={[styles.transitSectorValue, entry.flagged && styles.statusWarn]}>
                        {entry.to}
                      </Text>
                    </View>
                  </View>
                  
                  {/* Status Row */}
                  <View style={styles.transitStatusRow}>
                    <Text style={[styles.transitDirectionLabel, directionColor]}>
                      {direction.label} TRANSIT
                    </Text>
                    {entry.flagged && (
                      <Text style={styles.transitFlagBadge}>⚠ FLAGGED</Text>
                    )}
                  </View>
                </View>
              );
            })}
            
            {hasFlaggedTransit && transitLog.find(t => t.flagged)?.flagNote && (
              <View style={styles.noteBox}>
                <Text style={styles.noteLabel}>⚠ SYSTEM NOTE:</Text>
                <Text style={styles.noteText}>{transitLog.find(t => t.flagged)?.flagNote}</Text>
              </View>
            )}
          </ScrollView>
        ) : (
          <Text style={styles.emptyResult}>-- NO RECORDS FOUND --</Text>
        )}

        <TerminalDivider />
        <TerminalStatus 
          message={hasFlaggedTransit ? 'ANOMALY DETECTED IN TRANSIT PATTERN.' : 'NO TRANSIT ANOMALIES.'} 
          status={hasFlaggedTransit ? 'warn' : 'ok'} 
        />
      </>
    );
  };

  const renderIncidentHistory = () => {
    const incidentHistory = subject.incidentHistory || [];
    const hasIncidents = incidentHistory.length > 0;

    return (
      <>
        <TerminalPrompt command={`nquery --table=incidents --subject=${subject.id}`} />
        <Text style={styles.responseHeader}>[NETWORK RESPONSE: {incidentHistory.length} ON FILE]</Text>
        <TerminalDivider />
        
        {hasIncidents ? (
          <ScrollView style={styles.scrollContainer}>
            {incidentHistory.map((entry, i) => (
              <View key={i} style={styles.incidentBlock}>
                <Text style={styles.incidentNumber}>INCIDENT #{i + 1}</Text>
                <TerminalOutput label="  DATE:" value={entry.date} status="dim" />
                <TerminalOutput label="  TYPE:" value={entry.type} status="warn" />
                <TerminalOutput label="  LOC:" value={entry.location} status="dim" />
                <TerminalOutput label="  RES:" value={entry.resolution} status="dim" />
              </View>
            ))}
          </ScrollView>
        ) : (
          <Text style={styles.emptyResult}>-- NO PRIOR INCIDENTS --</Text>
        )}

        <TerminalDivider />
        <TerminalStatus 
          message={hasIncidents ? `${incidentHistory.length} INCIDENT(S) ON RECORD.` : 'CLEAN RECORD.'} 
          status={hasIncidents ? 'warn' : 'ok'} 
        />
      </>
    );
  };

  const renderDialogueAnalysis = () => {
    const dialogueFlags = subject.dialogueFlags || [];
    const tone = subject.toneClassification || 'NEUTRAL';
    const hasFlags = dialogueFlags.length > 0;
    const toneStatus = tone === 'AGITATED' ? 'error' : 
                       tone === 'NERVOUS' || tone === 'EVASIVE' ? 'warn' : 'ok';

    return (
      <>
        <TerminalPrompt command={`nquery --table=comms --mode=realtime --subject=${subject.id}`} />
        <Text style={styles.responseHeader}>[NETWORK RESPONSE: DIALOGUE ANALYSIS]</Text>
        <TerminalDivider />
        
        <View style={styles.dialogueContainer}>
          <Text style={styles.dialoguePrefix}>&gt;</Text>
          <Text style={styles.dialogueText}>"{subject.dialogue || 'No dialogue recorded.'}"</Text>
        </View>

        <TerminalDivider />
        <TerminalOutput label="TONE_CLASS:" value={tone} status={toneStatus} />
        
        <Text style={styles.sectionHeader}>KEYWORD_SCAN:</Text>
        {hasFlags ? (
          dialogueFlags.map((flag, i) => (
            <View key={i} style={styles.flagLine}>
              <Text style={styles.flagBullet}>  ⚠</Text>
              <Text style={styles.flagWord}>"{flag.keyword}"</Text>
              <Text style={styles.flagCat}>[{flag.category}]</Text>
            </View>
          ))
        ) : (
          <Text style={styles.noFlags}>  -- NONE DETECTED --</Text>
        )}

        <TerminalDivider />
        <TerminalStatus 
          message={hasFlags ? 'FLAGGED KEYWORDS DETECTED.' : toneStatus === 'ok' ? 'NO CONCERNS.' : 'ELEVATED TONE DETECTED.'} 
          status={hasFlags ? 'warn' : toneStatus} 
        />
      </>
    );
  };

  const renderQueryMenu = () => (
    <View style={styles.menuContainer}>
      <Text style={styles.operatorInfo}>OPERATOR: {OPERATOR_ID}</Text>
      <Text style={styles.menuPrompt}>$ nquery --list-available</Text>
      <View style={styles.menuGrid}>
        {(['WARRANT', 'TRANSIT', 'INCIDENT', 'DIALOGUE'] as QueryType[]).map((query) => {
          const isComplete = queriesPerformed.has(query);
          return (
            <TouchableOpacity 
              key={query}
              style={[styles.menuItem, isComplete && styles.menuItemComplete]} 
              onPress={() => handleSelectCheck(query)}
            >
              <Text style={styles.menuIcon}>{isComplete ? '●' : '○'}</Text>
              <Text style={[styles.menuLabel, isComplete && styles.menuLabelComplete]}>
                {QUERY_LABELS[query]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const renderContent = () => {
    switch (activeCheck) {
      case 'WARRANT': return renderWarrantCheck();
      case 'TRANSIT': return renderTransitLog();
      case 'INCIDENT': return renderIncidentHistory();
      case 'DIALOGUE': return renderDialogueAnalysis();
      default: return renderQueryMenu();
    }
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        {/* Terminal Header */}
        <View style={styles.terminalHeader}>
          <View style={styles.tabBar}>
            <View style={[styles.tab, styles.tabActive]}>
              <Text style={styles.tabText}>
                {activeCheck ? `nquery/${QUERY_LABELS[activeCheck]}` : 'db_network'}
              </Text>
            </View>
          </View>
          <Text style={styles.subjectRef}>subject: {subject.id}</Text>
        </View>

        {/* Terminal Body */}
        <ScrollView style={styles.terminalBody} showsVerticalScrollIndicator={false}>
          {renderContent()}
        </ScrollView>

        {/* Terminal Footer - Navigation */}
        <View style={styles.terminalFooter}>
          {activeCheck ? (
            <TouchableOpacity style={styles.footerButton} onPress={handleBack}>
              <Text style={styles.footerButtonText}>[ ← BACK ]</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.footerButton} onPress={onClose}>
              <Text style={styles.footerButtonText}>[ CLOSE TERMINAL ]</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    zIndex: 1000,
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#0a0c0f',
    borderTopWidth: 1,
    borderTopColor: '#2a3a4a',
    maxHeight: '70%',
  },

  // Terminal Header
  terminalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#0d1117',
    borderBottomWidth: 1,
    borderBottomColor: '#1a2a3a',
  },
  tabBar: {
    flexDirection: 'row',
  },
  tab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#1a2a3a',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: '#2a3a4a',
  },
  tabActive: {
    backgroundColor: '#0a0c0f',
    borderColor: Theme.colors.accentWarn,
  },
  tabText: {
    fontFamily: Theme.fonts.mono,
    fontSize: 11,
    color: Theme.colors.accentWarn,
    letterSpacing: 0.5,
  },
  subjectRef: {
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    color: Theme.colors.textDim,
  },

  // Terminal Body
  terminalBody: {
    padding: 16,
    minHeight: 200,
  },

  // Prompt & Output
  promptBlock: {
    marginBottom: 8,
  },
  promptLine: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  promptSymbol: {
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
    color: Theme.colors.accentApprove,
    marginRight: 8,
    fontWeight: '700',
  },
  promptCommand: {
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
    color: Theme.colors.textSecondary,
  },
  logNotice: {
    fontFamily: Theme.fonts.mono,
    fontSize: 9,
    color: Theme.colors.textDim,
    marginLeft: 16,
    letterSpacing: 0.5,
  },
  responseHeader: {
    fontFamily: Theme.fonts.mono,
    fontSize: 11,
    color: Theme.colors.textDim,
    marginTop: 8,
    marginBottom: 4,
    letterSpacing: 1,
  },
  divider: {
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    color: '#2a3a4a',
    marginVertical: 8,
  },
  outputLine: {
    flexDirection: 'row',
    marginVertical: 2,
  },
  outputLabel: {
    fontFamily: Theme.fonts.mono,
    fontSize: 11,
    color: Theme.colors.textDim,
    width: 140,
  },
  outputValue: {
    fontFamily: Theme.fonts.mono,
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
  },

  // Status colors
  statusOk: { color: Theme.colors.accentApprove },
  statusWarn: { color: Theme.colors.accentWarn },
  statusError: { color: Theme.colors.accentDeny },
  statusDim: { color: Theme.colors.textSecondary },
  statusNeutral: { color: Theme.colors.textPrimary },

  // Status line
  statusLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  statusIcon: {
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
    marginRight: 8,
  },
  statusMessage: {
    fontFamily: Theme.fonts.mono,
    fontSize: 11,
    fontWeight: '700',
  },

  // Log entries
  // Transit Log Card Styles
  transitScrollContainer: {
    maxHeight: 280,
  },
  transitCard: {
    backgroundColor: 'rgba(26, 42, 58, 0.4)',
    borderWidth: 1,
    borderColor: '#2a3a4a',
    borderLeftWidth: 3,
    borderLeftColor: Theme.colors.textSecondary,
    padding: 12,
    marginBottom: 10,
  },
  transitCardFlagged: {
    borderLeftColor: Theme.colors.accentWarn,
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
  },
  transitDateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(74, 106, 122, 0.2)',
  },
  transitDate: {
    fontFamily: Theme.fonts.mono,
    fontSize: 14,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
    letterSpacing: 1,
  },
  transitTime: {
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
    color: Theme.colors.textSecondary,
  },
  transitJourneyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  transitSector: {
    flex: 1,
  },
  transitSectorLabel: {
    fontFamily: Theme.fonts.mono,
    fontSize: 9,
    color: Theme.colors.textDim,
    letterSpacing: 1,
    marginBottom: 2,
  },
  transitSectorValue: {
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
    fontWeight: '600',
    color: Theme.colors.textPrimary,
  },
  transitArrowContainer: {
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  transitDirectionIcon: {
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    marginBottom: 2,
  },
  transitArrow: {
    fontFamily: Theme.fonts.mono,
    fontSize: 16,
    color: Theme.colors.textSecondary,
  },
  transitStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transitDirectionLabel: {
    fontFamily: Theme.fonts.mono,
    fontSize: 9,
    letterSpacing: 0.5,
  },
  transitFlagBadge: {
    fontFamily: Theme.fonts.mono,
    fontSize: 9,
    fontWeight: '700',
    color: Theme.colors.accentWarn,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
  },

  // Legacy styles (kept for other uses)
  logEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
    gap: 12,
  },
  logTimestamp: {
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    color: Theme.colors.textDim,
    width: 110,
  },
  logRoute: {
    fontFamily: Theme.fonts.mono,
    fontSize: 11,
    color: Theme.colors.textPrimary,
    flex: 1,
  },
  flagMarker: {
    fontFamily: Theme.fonts.mono,
    fontSize: 9,
    color: Theme.colors.accentWarn,
    fontWeight: '700',
  },

  // Note box
  noteBox: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: Theme.colors.accentWarn,
    marginTop: 4,
  },
  noteLabel: {
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    color: Theme.colors.accentWarn,
    fontWeight: '700',
    marginBottom: 4,
  },
  noteText: {
    fontFamily: Theme.fonts.mono,
    fontSize: 11,
    color: Theme.colors.textPrimary,
    lineHeight: 16,
  },

  // Empty result
  emptyResult: {
    fontFamily: Theme.fonts.mono,
    fontSize: 11,
    color: Theme.colors.textDim,
    textAlign: 'center',
    marginVertical: 16,
  },

  // Scroll container
  scrollContainer: {
    maxHeight: 140,
  },

  // Incident block
  incidentBlock: {
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1a2a3a',
  },
  incidentNumber: {
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    color: Theme.colors.accentWarn,
    fontWeight: '700',
    marginBottom: 4,
  },

  // Dialogue
  dialogueContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(127, 184, 216, 0.05)',
    padding: 12,
    marginVertical: 8,
  },
  dialoguePrefix: {
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
    color: Theme.colors.textSecondary,
    marginRight: 8,
  },
  dialogueText: {
    fontFamily: Theme.fonts.mono,
    fontSize: 11,
    color: Theme.colors.textPrimary,
    flex: 1,
    lineHeight: 18,
    fontStyle: 'italic',
  },

  // Section header
  sectionHeader: {
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    color: Theme.colors.textDim,
    marginTop: 12,
    marginBottom: 6,
    letterSpacing: 1,
  },

  // Flags
  flagLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  flagBullet: {
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    color: Theme.colors.accentWarn,
    marginRight: 6,
  },
  flagWord: {
    fontFamily: Theme.fonts.mono,
    fontSize: 11,
    color: Theme.colors.accentWarn,
    fontWeight: '600',
    marginRight: 8,
  },
  flagCat: {
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    color: Theme.colors.textDim,
  },
  noFlags: {
    fontFamily: Theme.fonts.mono,
    fontSize: 11,
    color: Theme.colors.textDim,
  },

  // Menu
  menuContainer: {
    paddingVertical: 8,
  },
  operatorInfo: {
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    color: Theme.colors.textDim,
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1a2a3a',
  },
  menuPrompt: {
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
    color: Theme.colors.accentApprove,
    marginBottom: 16,
  },
  menuGrid: {
    gap: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(26, 42, 58, 0.3)',
    borderWidth: 1,
    borderColor: '#2a3a4a',
  },
  menuItemComplete: {
    borderColor: Theme.colors.accentApprove,
    backgroundColor: 'rgba(74, 138, 90, 0.1)',
  },
  menuIcon: {
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
    color: Theme.colors.textSecondary,
    marginRight: 12,
  },
  menuLabel: {
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
    color: Theme.colors.textPrimary,
    letterSpacing: 0.5,
  },
  menuLabelComplete: {
    color: Theme.colors.accentApprove,
  },

  // Footer
  terminalFooter: {
    borderTopWidth: 1,
    borderTopColor: '#1a2a3a',
    padding: 16,
    alignItems: 'center',
  },
  footerButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  footerButtonText: {
    fontFamily: Theme.fonts.mono,
    fontSize: 12,
    color: Theme.colors.textSecondary,
    letterSpacing: 1,
  },
});

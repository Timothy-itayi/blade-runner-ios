import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Pressable, ScrollView, Animated } from 'react-native';
import { SubjectData } from '../../data/subjects';
import { Theme } from '@/constants/theme';
import { styles } from '../../styles/game/VerificationDrawer.styles';

interface VerificationDrawerProps {
  subject: SubjectData;
  onClose: () => void;
  onQueryPerformed?: (queryType: 'WARRANT' | 'TRANSIT' | 'INCIDENT') => void;
}

type QueryType = 'WARRANT' | 'TRANSIT' | 'INCIDENT';

const QUERY_LABELS: Record<QueryType, string> = {
  WARRANT: 'warrant_check',
  TRANSIT: 'transit_log',
  INCIDENT: 'incident_history',
};

// Operator ID - in production this would come from auth context
const OPERATOR_ID = 'OP-7734';

export const VerificationDrawer = ({ subject, onClose, onQueryPerformed }: VerificationDrawerProps) => {
  const [activeCheck, setActiveCheck] = useState<QueryType | null>(null);
  const [queriesPerformed, setQueriesPerformed] = useState<Set<string>>(new Set());
  const [queryTimestamps, setQueryTimestamps] = useState<Record<string, string>>({});
  const [isScanning, setIsScanning] = useState(true);
  const [scanProgress, setScanProgress] = useState(0);
  const scanProgressAnim = useRef(new Animated.Value(0)).current;

  // Start scanning animation when drawer opens
  useEffect(() => {
    setIsScanning(true);
    setScanProgress(0);
    scanProgressAnim.setValue(0);
    
    Animated.timing(scanProgressAnim, {
      toValue: 1,
      duration: 2500,
      useNativeDriver: false,
    }).start(() => {
      setIsScanning(false);
      setScanProgress(100);
    });

    // Update progress state
    const listener = scanProgressAnim.addListener(({ value }) => {
      setScanProgress(Math.round(value * 100));
    });

    return () => {
      scanProgressAnim.removeListener(listener);
    };
  }, []);

  // Check if subject has redacted information
  const isRedacted = subject.incidentHistory?.some(inc => inc.redactionLevel && inc.redactionLevel !== 'NONE') ||
                     subject.archetype === 'SYS' ||
                     (subject.archetype && subject.archetype.toString().includes('REP'));

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

  // Helper to redact text based on subject type
  const redactText = (text: string, level: 'NONE' | 'LIGHT' | 'MODERATE' | 'HEAVY' | 'TOTAL' = 'NONE'): string => {
    if (!isRedacted || level === 'NONE') return text;
    if (level === 'TOTAL') return '[REDACTED]';
    if (level === 'HEAVY') return text.replace(/./g, '█');
    if (level === 'MODERATE') {
      // Redact middle portion
      const mid = Math.floor(text.length / 2);
      return text.substring(0, mid - 2) + '███' + text.substring(mid + 1);
    }
    // LIGHT: just mask some characters
    return text.replace(/\w/g, (char, i) => i % 3 === 0 ? char : '█');
  };

  const renderWarrantCheck = () => {
    const hasWarrants = subject.warrants !== 'NONE';
    const hasIncidents = subject.incidents > 0;
    const complianceGood = ['A', 'B'].includes(subject.compliance);
    const complianceMid = ['C', 'D'].includes(subject.compliance);
    
    // Filter: Only show warrant info if subject has warrants or is flagged
    if (!hasWarrants && subject.archetype === 'CLN') {
      return (
        <>
          <TerminalPrompt command={`nquery --table=warrants --subject=${subject.id}`} />
          <Text style={styles.responseHeader}>[NETWORK RESPONSE]</Text>
          <TerminalDivider />
          <Text style={styles.emptyResult}>-- NO WARRANT RECORDS --</Text>
          <TerminalDivider />
          <TerminalStatus message="CLEAR." status="ok" />
        </>
      );
    }

    return (
      <>
        <TerminalPrompt command={`nquery --table=warrants --subject=${subject.id}`} />
        <Text style={styles.responseHeader}>[NETWORK RESPONSE]</Text>
        <TerminalDivider />

        {/* Warrant Status - Primary Alert Card */}
        <View style={[
          styles.warrantCard,
          hasWarrants ? styles.warrantCardDanger : styles.warrantCardClear
        ]}>
          <View style={styles.warrantCardHeader}>
            <Text style={[
              styles.warrantCardIcon,
              { color: hasWarrants ? Theme.colors.accentDeny : Theme.colors.accentApprove }
            ]}>
              {hasWarrants ? '⚠' : '✓'}
            </Text>
            <Text style={styles.warrantCardLabel}>WARRANT STATUS</Text>
          </View>
          <Text style={[
            styles.warrantCardValue,
            { color: hasWarrants ? Theme.colors.accentDeny : Theme.colors.accentApprove }
          ]}>
            {subject.warrants}
          </Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.warrantStatsGrid}>
          {/* Incident Count */}
          <View style={[
            styles.warrantStatBox,
            hasIncidents ? styles.warrantStatBoxWarn : styles.warrantStatBoxNeutral
          ]}>
            <Text style={styles.warrantStatLabel}>INCIDENTS</Text>
            <Text style={[
              styles.warrantStatValue,
              { color: hasIncidents ? Theme.colors.accentWarn : Theme.colors.accentApprove }
            ]}>
              {subject.incidents}
            </Text>
            <Text style={[
              styles.warrantStatStatus,
              { color: hasIncidents ? Theme.colors.accentWarn : Theme.colors.textDim }
            ]}>
              {hasIncidents ? 'ON RECORD' : 'CLEAN'}
            </Text>
          </View>

          {/* Compliance Rating */}
          <View style={[
            styles.warrantStatBox,
            complianceGood ? styles.warrantStatBoxOk : complianceMid ? styles.warrantStatBoxWarn : styles.warrantStatBoxDanger
          ]}>
            <Text style={styles.warrantStatLabel}>COMPLIANCE</Text>
            <Text style={[
              styles.warrantStatValue,
              { color: complianceGood ? Theme.colors.accentApprove : complianceMid ? Theme.colors.accentWarn : Theme.colors.accentDeny }
            ]}>
              {subject.compliance}
            </Text>
            <Text style={[
              styles.warrantStatStatus,
              { color: complianceGood ? Theme.colors.accentApprove : complianceMid ? Theme.colors.accentWarn : Theme.colors.accentDeny }
            ]}>
              {complianceGood ? 'GOOD' : complianceMid ? 'REVIEW' : 'FLAGGED'}
            </Text>
          </View>
        </View>

        <TerminalDivider />

        {/* Final Status Banner */}
        <View style={[
          styles.warrantResultBanner,
          hasWarrants ? styles.warrantResultDanger : styles.warrantResultClear
        ]}>
          <Text style={[
            styles.warrantResultIcon,
            { color: hasWarrants ? Theme.colors.accentDeny : Theme.colors.accentApprove }
          ]}>
            {hasWarrants ? '✗' : '✓'}
          </Text>
          <Text style={[
            styles.warrantResultText,
            { color: hasWarrants ? Theme.colors.accentDeny : Theme.colors.accentApprove }
          ]}>
            {hasWarrants ? 'ACTIVE WARRANT DETECTED\nDETENTION RECOMMENDED' : 'NO ACTIVE WARRANTS\nSUBJECT CLEAR'}
          </Text>
        </View>
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
    
    // Filter: Only show incidents if subject has them or is flagged
    if (!hasIncidents && subject.archetype === 'CLN') {
      return (
        <>
          <TerminalPrompt command={`nquery --table=incidents --subject=${subject.id}`} />
          <Text style={styles.responseHeader}>[NETWORK RESPONSE: 0 ON FILE]</Text>
          <TerminalDivider />
          <Text style={styles.emptyResult}>-- NO INCIDENT RECORDS --</Text>
          <TerminalDivider />
          <TerminalStatus message="CLEAR." status="ok" />
        </>
      );
    }

    return (
      <>
        <TerminalPrompt command={`nquery --table=incidents --subject=${subject.id}`} />
        <Text style={styles.responseHeader}>[NETWORK RESPONSE: {incidentHistory.length} ON FILE]</Text>
        <TerminalDivider />
        
        {hasIncidents ? (
          <ScrollView style={styles.scrollContainer}>
            {incidentHistory.map((entry, i) => {
              // Apply redaction based on incident redaction level
              const redactionLevel = entry.redactionLevel || (isRedacted ? 'MODERATE' : 'NONE');
              const location = redactionLevel !== 'NONE' ? redactText(entry.location, redactionLevel) : entry.location;
              const resolution = redactionLevel !== 'NONE' ? redactText(entry.resolution, redactionLevel) : entry.resolution;
              
              return (
                <View key={i} style={styles.incidentBlock}>
                  <Text style={styles.incidentNumber}>INCIDENT #{i + 1}</Text>
                  <TerminalOutput label="  DATE:" value={entry.date} status="dim" />
                  <TerminalOutput label="  TYPE:" value={entry.type} status="warn" />
                  <TerminalOutput label="  LOC:" value={location} status={redactionLevel !== 'NONE' ? 'warn' : 'dim'} />
                  <TerminalOutput label="  RES:" value={resolution} status={redactionLevel !== 'NONE' ? 'warn' : 'dim'} />
                  {redactionLevel !== 'NONE' && (
                    <Text style={styles.redactionNotice}>[REDACTION LEVEL: {redactionLevel}]</Text>
                  )}
                </View>
              );
            })}
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

  const renderQueryMenu = () => {
    // Filter queries based on subject - only show relevant ones
    const allQueries: QueryType[] = ['WARRANT', 'TRANSIT', 'INCIDENT'];
    const relevantQueries: QueryType[] = [];
    
    // WARRANT: Show if subject has warrants or is flagged
    if (subject.warrants !== 'NONE' || subject.archetype !== 'CLN') {
      relevantQueries.push('WARRANT');
    }
    
    // TRANSIT: Always show (all subjects have transit history)
    relevantQueries.push('TRANSIT');
    
    // INCIDENT: Show if subject has incidents or is flagged
    if (subject.incidents > 0 || subject.archetype !== 'CLN') {
      relevantQueries.push('INCIDENT');
    }
    
    return (
      <View style={styles.menuContainer}>
        <Text style={styles.operatorInfo}>OPERATOR: {OPERATOR_ID}</Text>
        <Text style={styles.menuPrompt}>$ nquery --list-available</Text>
        <View style={styles.menuGrid}>
          {relevantQueries.map((query) => {
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
  };

  const renderContent = () => {
    switch (activeCheck) {
      case 'WARRANT': return renderWarrantCheck();
      case 'TRANSIT': return renderTransitLog();
      case 'INCIDENT': return renderIncidentHistory();
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
          {isScanning ? (
            <View style={styles.scanningContainer}>
              <TerminalPrompt command={`scan --subject=${subject.id} --records`} />
              <Text style={styles.responseHeader}>[SCANNING SUBJECT RECORDS...]</Text>
              <TerminalDivider />
              <View style={styles.progressContainer}>
                <View style={styles.progressBarBg}>
                  <Animated.View 
                    style={[
                      styles.progressBarFill,
                      {
                        width: scanProgressAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0%', '100%'],
                        }),
                      },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>{scanProgress}%</Text>
              </View>
              <Text style={styles.scanningText}>Accessing database... Analyzing records...</Text>
            </View>
          ) : (
            renderContent()
          )}
        </ScrollView>

        {/* Terminal Footer - Navigation */}
        <View style={styles.terminalFooter}>
          {activeCheck ? (
            <Pressable
              style={({ pressed }) => [
                styles.footerButton,
                pressed && styles.footerButtonPressed
              ]}
              onPress={handleBack}
            >
              <Text style={styles.footerButtonText}>[ ← BACK ]</Text>
            </Pressable>
          ) : (
            <Pressable
              style={({ pressed }) => [
                styles.footerButton,
                pressed && styles.footerButtonPressed
              ]}
              onPress={onClose}
            >
              <Text style={styles.footerButtonText}>[ CLOSE TERMINAL ]</Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
};

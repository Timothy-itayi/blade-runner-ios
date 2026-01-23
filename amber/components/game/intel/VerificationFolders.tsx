import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SubjectData } from '../../../data/subjects';
import { Theme } from '@/constants/theme';
import { styles } from './IntelPanel.styles';
import { 
  TerminalPrompt, 
  TerminalOutput, 
  TerminalDivider, 
  TerminalStatus 
} from './helpers/terminal';
import { isSuspiciousTransit, getPlanetSafety, getTransitRisk, PlanetSafetyLevel } from '../../../constants/planets';

type QueryType = 'WARRANT' | 'TRANSIT' | 'INCIDENT';

interface VerificationFoldersProps {
  subject: SubjectData;
  activeFolder: QueryType | null;
  onSelectFolder: (folder: QueryType) => void;
  gatheredInformation: any;
  resourcesRemaining: number;
}

const getTimestamp = () => {
  const now = new Date();
  return `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
};

export const VerificationFolders = ({
  subject,
  activeFolder,
  onSelectFolder,
  gatheredInformation,
  resourcesRemaining
}: VerificationFoldersProps) => {

  const renderWarrantCheck = () => {
    const hasWarrants = subject.warrants !== 'NONE';
    const hasIncidents = subject.incidents > 0;
    const complianceGood = ['A', 'B'].includes(subject.compliance);
    const complianceMid = ['C', 'D'].includes(subject.compliance);

    return (
      <View>
        <TerminalPrompt 
          command={`nquery --table=warrants --subject=${subject.id}`} 
          operatorId="OP-7734"
          timestamp={getTimestamp()}
        />
        <TerminalDivider />
        <TerminalOutput label="WARRANT_STATUS:" value={subject.warrants} status={hasWarrants ? 'error' : 'ok'} />
        <TerminalOutput label="INCIDENTS:" value={String(subject.incidents)} status={hasIncidents ? 'warn' : 'ok'} />
        <TerminalOutput label="COMPLIANCE:" value={subject.compliance} status={complianceGood ? 'ok' : complianceMid ? 'warn' : 'error'} />
        <TerminalDivider />
        <TerminalStatus 
          message={hasWarrants ? 'ACTIVE WARRANT DETECTED.' : 'SUBJECT CLEAR.'} 
          status={hasWarrants ? 'error' : 'ok'} 
        />
      </View>
    );
  };

  const renderTransitLog = () => {
    const transitLog = subject.databaseQuery?.travelHistory || [];
    const processedTransitLog = transitLog.map((entry: any) => {
      const fromPlanet = entry.from || entry.fromPlanet || '';
      const toPlanet = entry.to || entry.toPlanet || '';
      return {
        ...entry,
        fromPlanet,
        toPlanet,
        flagged: isSuspiciousTransit(fromPlanet, toPlanet) || entry.flagged,
      };
    });
    
    const hasFlaggedTransit = processedTransitLog.some((t: any) => t.flagged);

    return (
      <View>
        <TerminalPrompt 
          command={`nquery --table=transit --subject=${subject.id}`} 
          operatorId="OP-7734"
          timestamp={getTimestamp()}
        />
        <TerminalDivider />
        {processedTransitLog.slice(0, 3).map((entry: any, i: number) => (
          <View key={i} style={{ marginBottom: 4 }}>
            <Text style={{ color: Theme.colors.textDim, fontSize: 8, fontFamily: Theme.fonts.mono }}>
              {entry.date}: {entry.fromPlanet} &rarr; {entry.toPlanet}
            </Text>
            {entry.flagged && <Text style={{ color: Theme.colors.accentWarn, fontSize: 8, fontFamily: Theme.fonts.mono }}>  [!] SUSPICIOUS ROUTE</Text>}
          </View>
        ))}
        {processedTransitLog.length > 3 && <Text style={{ color: Theme.colors.textDim, fontSize: 8, fontFamily: Theme.fonts.mono }}>... {processedTransitLog.length - 3} MORE RECORDS</Text>}
        <TerminalDivider />
        <TerminalStatus 
          message={hasFlaggedTransit ? 'TRANSIT ANOMALY.' : 'NO ANOMALIES.'} 
          status={hasFlaggedTransit ? 'warn' : 'ok'} 
        />
      </View>
    );
  };

  const renderIncidentHistory = () => {
    const incidents = subject.databaseQuery?.discrepancies || [];
    const incidentsCount = incidents.length;
    return (
      <View>
        <TerminalPrompt 
          command={`nquery --table=incidents --subject=${subject.id}`} 
          operatorId="OP-7734"
          timestamp={getTimestamp()}
        />
        <TerminalDivider />
        {incidents.length === 0 ? (
          <Text style={{ color: Theme.colors.textDim, fontSize: 9, fontFamily: Theme.fonts.mono }}>-- NO RECORDS FOUND --</Text>
        ) : (
          incidents.slice(0, 2).map((inc: any, i: number) => (
            <View key={i} style={{ marginBottom: 6 }}>
              <Text style={{ color: Theme.colors.accentWarn, fontSize: 9, fontFamily: Theme.fonts.mono }}>INCIDENT #{i+1}: {inc.type}</Text>
              <Text style={{ color: Theme.colors.textDim, fontSize: 8, fontFamily: Theme.fonts.mono }}>  DATE: {inc.date}</Text>
              <Text style={{ color: Theme.colors.textDim, fontSize: 8, fontFamily: Theme.fonts.mono }}>  RES: {inc.resolution}</Text>
            </View>
          ))
        )}
        <TerminalDivider />
        <TerminalStatus 
          message={incidents.length > 0 ? `${incidents.length} RECORD(S) ON FILE.` : 'CLEAN RECORD.'} 
          status={incidents.length > 0 ? 'warn' : 'ok'} 
        />
      </View>
    );
  };

  const renderFolderContent = () => {
    if (!activeFolder) {
      return (
        <View style={styles.folderEmptyState}>
          <Text style={styles.folderEmptyText}>SELECT FILE TO OPEN</Text>
        </View>
      );
    }

    switch (activeFolder) {
      case 'WARRANT': return renderWarrantCheck();
      case 'TRANSIT': return renderTransitLog();
      case 'INCIDENT': return renderIncidentHistory();
      default: return null;
    }
  };

  return (
    <View style={styles.folderContainer}>
      <View style={styles.folderTabsContainer}>
        {(['WARRANT', 'TRANSIT', 'INCIDENT'] as QueryType[]).map((type) => {
          const isComplete = 
            (type === 'WARRANT' && gatheredInformation.warrantCheck) ||
            (type === 'TRANSIT' && gatheredInformation.transitLog) ||
            (type === 'INCIDENT' && gatheredInformation.incidentHistory);

          const isActive = activeFolder === type;
          
          return (
            <TouchableOpacity 
              key={type}
              style={[
                styles.tapeTab,
                isActive && styles.tapeTabActive,
                isComplete && styles.tapeTabComplete,
              ]}
              onPress={() => onSelectFolder(type)}
              activeOpacity={0.85}
            >
              {/* Notch / write-protect cutout */}
              <View style={styles.tapeNotch} pointerEvents="none" />

              {/* Top-right nameplate (easy to scan) */}
              <View
                pointerEvents="none"
                style={[styles.tapeNameplate, isActive && styles.tapeNameplateActive]}
              >
                <Text style={[styles.tapeLabel, isActive && styles.tapeLabelActive]} numberOfLines={1}>
                  {type}
                </Text>
                <View
                  style={[
                    styles.tapeStatusDot,
                    isComplete ? styles.tapeStatusDotComplete : styles.tapeStatusDotIdle,
                    isActive && styles.tapeStatusDotActive,
                  ]}
                />
              </View>

              {/* Cartridge window + reels */}
              <View style={styles.tapeWindow} pointerEvents="none">
                <View style={styles.tapeReel} />
                <View style={styles.tapeReel} />
                <View style={styles.tapeWindowRidge} />
              </View>

              <Text style={[styles.tapeSubLabel, isActive && styles.tapeSubLabelActive]} pointerEvents="none">
                INTEL TAPE
              </Text>

              {!!resourcesRemaining && (
                <Text style={styles.tapeMeta} pointerEvents="none">
                  SLOT 1
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
      <View style={styles.folderContent}>
        <ScrollView 
          style={styles.folderTerminalScroll}
          showsVerticalScrollIndicator={false}
        >
          {renderFolderContent()}
        </ScrollView>
      </View>
    </View>
  );
};

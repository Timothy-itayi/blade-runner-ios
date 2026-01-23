import React from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { Theme } from '../../constants/theme';
import type { Consequence } from '../../types/consequence';

const FACT_LABELS: Record<string, string> = {
  WARRANT: 'ACTIVE WARRANT',
  INCIDENT_HISTORY: 'PRIOR INCIDENT RECORD',
  TRANSIT_LOG: 'FLAGGED TRANSIT',
  HEALTH_SCAN: 'SYNTHETIC MARKERS',
  IDENTITY_SCAN: 'IDENTITY UNVERIFIED',
  INTERROGATION: 'STATEMENT UNVERIFIED',
};

function getConsequenceColor(consequence: Consequence): string {
  switch (consequence.type) {
    case 'WARNING':
      return Theme.colors.accentWarn;
    case 'CITATION':
      return '#FF6B35';
    case 'SERIOUS_INFRACTION':
      return Theme.colors.accentDeny;
    default:
      return Theme.colors.textPrimary;
  }
}

function getConsequenceTitle(consequence: Consequence): string {
  switch (consequence.type) {
    case 'WARNING':
      return 'SYSTEM WARNING';
    case 'CITATION':
      return 'SYSTEM VIOLATION';
    case 'SERIOUS_INFRACTION':
      return 'SYSTEM VIOLATION';
    default:
      return 'NOTICE';
  }
}

export function CitationStrip({
  visible,
  consequence,
  caseId,
  onAcknowledge,
}: {
  visible: boolean;
  consequence: Consequence | null;
  caseId: string;
  onAcknowledge: () => void;
}) {
  const anim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(anim, {
      toValue: visible ? 1 : 0,
      duration: visible ? 180 : 140,
      useNativeDriver: false, // height animation
    }).start();
  }, [visible, anim]);

  if (!consequence || consequence.type === 'NONE') return null;

  const color = getConsequenceColor(consequence);
  const title = getConsequenceTitle(consequence);

  const height = anim.interpolate({ inputRange: [0, 1], outputRange: [0, 66] });
  const opacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });

  const missedTypes = Array.from(
    new Set((consequence.missedInformation || []).map((m) => m.type))
  );
  const factLabels = missedTypes.map((t) => FACT_LABELS[t] || t.replace(/_/g, ' '));
  const factsLine =
    factLabels.length === 0
      ? 'RECORD UPDATED'
      : factLabels.length <= 3
        ? `UNAUTHORIZED ENTRY: ${factLabels.join(' • ')}`
        : `UNAUTHORIZED ENTRY: ${factLabels.slice(0, 3).join(' • ')} +${factLabels.length - 3}`;

  return (
    <Animated.View style={[styles.wrap, { height, opacity }]}>
      <View style={[styles.strip, { borderColor: `${color}55` }]}>
        <View style={[styles.tape, { backgroundColor: `${color}22` }]} />

        <View style={styles.left}>
          <Text style={[styles.title, { color }]} numberOfLines={1}>
            {title} — CASE {caseId}
          </Text>
          <Text style={styles.message} numberOfLines={1}>
            {factsLine}
          </Text>
          <Text style={styles.penalty} numberOfLines={1}>
            PENALTY RECORDED: -{consequence.creditsPenalty} CREDITS • +{consequence.infractionCount} INFRACTION(S)
          </Text>
        </View>

        <Pressable onPress={onAcknowledge} style={styles.ack} hitSlop={8}>
          <Text style={[styles.ackText, { color }]}>{'[ ACK ]'}</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
  },
  strip: {
    borderWidth: 1,
    backgroundColor: 'rgba(10, 12, 15, 0.55)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  tape: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 6,
  },
  left: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontFamily: Theme.fonts.mono,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  message: {
    fontFamily: Theme.fonts.mono,
    fontSize: 9,
    color: Theme.colors.textPrimary,
    opacity: 0.92,
    lineHeight: 12,
  },
  penalty: {
    fontFamily: Theme.fonts.mono,
    fontSize: 8,
    color: Theme.colors.textDim,
    letterSpacing: 0.3,
  },
  ack: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(74, 106, 122, 0.35)',
    backgroundColor: 'rgba(13, 17, 23, 0.35)',
    alignSelf: 'stretch',
    justifyContent: 'center',
  },
  ackText: {
    fontFamily: Theme.fonts.mono,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
});


import React, { useMemo, useState } from 'react';
import { Modal, View, Text, Pressable } from 'react-native';
import { styles } from '../../styles/demo-onboard/DemoOnboardModal.styles';
import { useGameAudioContext } from '../../contexts/AudioContext';

type Slide = {
  title: string;
  lines: string[];
};

const SLIDES: Slide[] = [
  {
    title: 'TRANSIT CHECKPOINT',
    lines: [
      'You are assigned to AMBER DEPOT perimeter.',
      'Verify all subjects requesting transit clearance.',
      'Approve or deny based on documentation.',
    ],
  },
  {
    title: 'VERIFICATION PROTOCOL',
    lines: [
      'Each subject presents credentials and testimony.',
      'Cross-reference with transit records.',
      'Decide: APPROVE or DENY entry.',
    ],
  },
  {
    title: 'INVESTIGATION TOOLS',
    lines: [
      'Identity scans access the personnel database.',
      'Query transit logs and warrant histories.',
      'Ask up to 3 questions to clarify discrepancies.',
    ],
  },
  {
    title: 'BEGIN PROCESSING',
    lines: [
      'Subjects are waiting at the gate.',
      'Follow the active directive from command.',
      'Your decisions shape what comes next.',
    ],
  },
];

export const DemoOnboardModal = ({ visible, onDismiss }: { visible: boolean; onDismiss: () => void }) => {
  const [index, setIndex] = useState(0);
  const slide = useMemo(() => SLIDES[index], [index]);
  const isFirst = index === 0;
  const isLast = index === SLIDES.length - 1;
  const { playButtonSound, playLoadingSound } = useGameAudioContext();

  return (
    <Modal visible={visible} transparent={false} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.card}>
            <Text style={styles.title}>{slide.title}</Text>
            <View style={styles.body}>
              {slide.lines.map((line) => (
                <Text key={line} style={styles.bodyText}>
                  {line}
                </Text>
              ))}
            </View>
          </View>

          <View style={styles.dotsRow}>
            {SLIDES.map((_, i) => (
              <View key={`dot-${i}`} style={[styles.dot, i === index && styles.dotActive]} />
            ))}
          </View>

          <View style={styles.actions}>
            <Pressable
              onPress={() => {
                playButtonSound();
                setIndex((prev) => Math.max(0, prev - 1));
              }}
              disabled={isFirst}
              style={({ pressed }) => [
                styles.actionButton,
                isFirst && styles.actionButtonDisabled,
                pressed && !isFirst && styles.actionButtonPressed,
              ]}
            >
              <Text style={styles.actionText}>BACK</Text>
            </Pressable>

            {!isLast ? (
              <Pressable
                onPress={() => {
                  playButtonSound();
                  setIndex((prev) => Math.min(SLIDES.length - 1, prev + 1));
                }}
                style={({ pressed }) => [styles.actionButton, pressed && styles.actionButtonPressed]}
              >
                <Text style={styles.actionText}>NEXT</Text>
              </Pressable>
            ) : (
              <Pressable
                onPress={() => {
                  // "Begin shift" should be audible even if the modal unmounts immediately.
                  playLoadingSound();
                  setTimeout(onDismiss, 120);
                }}
                style={({ pressed }) => [styles.actionButtonPrimary, pressed && styles.actionButtonPressed]}
              >
                <Text style={styles.actionTextPrimary}>BEGIN SHIFT</Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

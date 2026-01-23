import React, { useMemo, useState } from 'react';
import { Modal, View, Text, Pressable } from 'react-native';
import { styles } from '../../styles/demo-onboard/DemoOnboardModal.styles';

type Slide = {
  title: string;
  lines: string[];
};

const SLIDES: Slide[] = [
  {
    title: 'WELCOME, OPERATOR',
    lines: [
      'AMBER CONTROL welcomes you.',
      'Inspect every subject.',
      'Verify their story before you decide.',
    ],
  },
  {
    title: 'YOUR TASK',
    lines: [
      'Review biometrics and documents.',
      'Use scans and tapes to confirm details.',
      'Decide: APPROVE or DENY.',
    ],
  },
  {
    title: 'RESOURCES',
    lines: [
      'You get 3 resources per subject.',
      'Each service costs 1 resource.',
      'Scans + tapes are all optional—choose carefully.',
      'Resources reset on the next subject.',
    ],
  },
  {
    title: 'TOOLS',
    lines: [
      'ID scan (hold) and Health scan.',
      'Tapes: Warrant / Transit / Incident.',
      'You get 3 questions per subject. Ask wisely.',
    ],
  },
  {
    title: 'DEMO MODE',
    lines: [
      'This build is 3 subjects, 1 shift.',
      'No credits, no economy—focus on accuracy.',
      'You are being evaluated.',
    ],
  },
];

export const DemoOnboardModal = ({ visible, onDismiss }: { visible: boolean; onDismiss: () => void }) => {
  const [index, setIndex] = useState(0);
  const slide = useMemo(() => SLIDES[index], [index]);
  const isFirst = index === 0;
  const isLast = index === SLIDES.length - 1;

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
              onPress={() => setIndex((prev) => Math.max(0, prev - 1))}
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
                onPress={() => setIndex((prev) => Math.min(SLIDES.length - 1, prev + 1))}
                style={({ pressed }) => [styles.actionButton, pressed && styles.actionButtonPressed]}
              >
                <Text style={styles.actionText}>NEXT</Text>
              </Pressable>
            ) : (
              <Pressable
                onPress={onDismiss}
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

import React, { useMemo, useState } from 'react';
import { Modal, View, Text, Pressable } from 'react-native';
import { styles } from '../../styles/demo-onboard/DemoOnboardModal.styles';

type Slide = {
  title: string;
  lines: string[];
};

const SLIDES: Slide[] = [
  {
    title: 'YOUR ROLE',
    lines: [
      'You operate a transit checkpoint.',
      'Subjects arrive. You decide who passes.',
      'Follow the directive. Approve or deny.',
    ],
  },
  {
    title: 'DIRECTIVES',
    lines: [
      'Each shift has a rule. Example: DENY: WARRANTS.',
      'Some rules have exceptions based on occupation or clearance.',
      'Example: DENY: ENGINEERS / EXCEPT: MEDICAL.',
      'Follow the rule. Exceptions may complicate things.',
    ],
  },
  {
    title: 'VERIFICATION',
    lines: [
      'Review each subject\'s credentials and dossier.',
      'Run warrant checks when required.',
      'Look for discrepancies. Then decide.',
    ],
  },
  {
    title: 'CONSEQUENCE MAP',
    lines: [
      'Every decision updates the consequence map.',
      'Tap MAP to review outcomes and casualty chains.',
      'Use it to trace what your approvals caused.',
    ],
  },
  {
    title: 'BEGIN',
    lines: [
      'Subjects are waiting to be processed.',

      'Your choices are final.',
      
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
              onPress={() => {
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
                  setIndex((prev) => Math.min(SLIDES.length - 1, prev + 1));
                }}
                style={({ pressed }) => [styles.actionButton, pressed && styles.actionButtonPressed]}
              >
                <Text style={styles.actionText}>NEXT</Text>
              </Pressable>
            ) : (
              <Pressable
                onPress={() => {
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

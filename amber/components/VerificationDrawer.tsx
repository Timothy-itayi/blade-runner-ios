import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { styles } from '../styles/VerificationDrawer.styles';
import { SubjectData } from '../data/subjects';

interface VerificationDrawerProps {
  subject: SubjectData;
  onClose: () => void;
}

export const VerificationDrawer = ({ subject, onClose }: VerificationDrawerProps) => {
  const [activeCheck, setActiveCheck] = useState<string | null>(null);

  const renderCheckResult = () => {
    switch (activeCheck) {
      case 'SECTOR':
        const { sectorAuth } = subject.authData;
        return (
          <View style={styles.resultContainer}>
            <Text style={styles.resultTitle}>SECTOR AUTHORIZATION CHECK</Text>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Requested:</Text>
              <Text style={styles.resultValue}>{sectorAuth.requested}</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Status:</Text>
              <Text style={[styles.resultValue, styles[sectorAuth.status.toLowerCase() as keyof typeof styles]]}>
                {sectorAuth.status}
              </Text>
            </View>
            <Text style={[styles.statusText, styles[sectorAuth.status.toLowerCase() as keyof typeof styles]]}>
              {sectorAuth.message}
            </Text>
          </View>
        );
      case 'FUNCTION':
        const { functionReg } = subject.authData;
        return (
          <View style={styles.resultContainer}>
            <Text style={styles.resultTitle}>FUNCTION REGISTRATION CHECK</Text>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Function:</Text>
              <Text style={styles.resultValue}>{subject.function}</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Status:</Text>
              <Text style={styles.resultValue}>{functionReg.status}</Text>
            </View>
            <Text style={styles.statusText}>{functionReg.message}</Text>
          </View>
        );
      // We can add more cases here for WARRANT and MEDICAL
      default:
        return (
          <View style={styles.buttonGrid}>
            <TouchableOpacity style={styles.verifyButton} onPress={() => setActiveCheck('SECTOR')}>
              <Text style={styles.buttonText}>[ SECTOR AUTH ]</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.verifyButton} onPress={() => setActiveCheck('FUNCTION')}>
              <Text style={styles.buttonText}>[ FUNCTION REG ]</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.verifyButton}>
              <Text style={styles.buttonText}>[ WARRANT CHECK ]</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.verifyButton}>
              <Text style={styles.buttonText}>[ MEDICAL FLAG ]</Text>
            </TouchableOpacity>
          </View>
        );
    }
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <Text style={styles.header}>VERIFY AGAINST:</Text>
        
        {renderCheckResult()}

        {activeCheck ? (
          <TouchableOpacity style={styles.closeButton} onPress={() => setActiveCheck(null)}>
            <Text style={styles.closeText}>[ BACK TO MENU ]</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeText}>[ CLOSE DRAWER ]</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

// =============================================================================
// SCAN QUALITY SYSTEM - Phase 2: Partial Scan Results
// =============================================================================
// Determines scan quality based on pressure hold duration and affects
// information revelation in dossiers

import { ScanQuality } from '../types/information';

/**
 * Determines scan quality based on hold duration (pressure value 0-1)
 * 
 * @param pressure - Normalized pressure value (0.0 to 1.0)
 * @returns Scan quality level
 */
export const determineScanQuality = (pressure: number): ScanQuality => {
  if (pressure < 0.33) {
    return 'PARTIAL';      // < 1.0s hold
  } else if (pressure < 0.66) {
    return 'STANDARD';      // 1.0s - 2.0s hold
  } else if (pressure < 0.9) {
    return 'DEEP';          // 2.0s - 3.0s hold
  } else {
    return 'COMPLETE';      // > 3.0s hold
  }
};

/**
 * Determines scan quality based on actual hold duration in milliseconds
 * 
 * @param durationMs - Hold duration in milliseconds
 * @param maxDurationMs - Maximum duration for complete scan (default: 3000ms)
 * @returns Scan quality level
 */
export const determineScanQualityFromDuration = (
  durationMs: number,
  maxDurationMs: number = 3000
): ScanQuality => {
  const pressure = Math.min(1, durationMs / maxDurationMs);
  return determineScanQuality(pressure);
};

/**
 * Gets the minimum hold duration required for a specific quality level
 * 
 * @param quality - Desired scan quality
 * @param maxDurationMs - Maximum duration for complete scan (default: 3000ms)
 * @returns Minimum duration in milliseconds
 */
export const getMinDurationForQuality = (
  quality: ScanQuality,
  maxDurationMs: number = 3000
): number => {
  switch (quality) {
    case 'PARTIAL':
      return 0; // Any hold triggers partial
    case 'STANDARD':
      return Math.floor(maxDurationMs * 0.33); // ~1.0s
    case 'DEEP':
      return Math.floor(maxDurationMs * 0.66); // ~2.0s
    case 'COMPLETE':
      return Math.floor(maxDurationMs * 0.9); // ~2.7s
  }
};

/**
 * Gets a human-readable description of scan quality
 */
export const getScanQualityDescription = (quality: ScanQuality): string => {
  switch (quality) {
    case 'PARTIAL':
      return 'Basic identity only - incomplete data';
    case 'STANDARD':
      return 'Full identity + basic anomalies';
    case 'DEEP':
      return 'Full identity + detailed analysis';
    case 'COMPLETE':
      return 'Perfect scan with all details';
  }
};

/**
 * Gets a warning message for incomplete scans
 */
export const getIncompleteScanWarning = (quality: ScanQuality): string | null => {
  switch (quality) {
    case 'PARTIAL':
      return 'SCAN INTERRUPTED - Partial data only. Critical information may be missing.';
    case 'STANDARD':
      return 'SCAN INCOMPLETE - Standard resolution. Some details may be unclear.';
    case 'DEEP':
      return null; // No warning for deep scans
    case 'COMPLETE':
      return null; // No warning for complete scans
  }
};

/**
 * Checks if scan quality is considered incomplete
 */
export const isIncompleteScan = (quality: ScanQuality): boolean => {
  return quality === 'PARTIAL' || quality === 'STANDARD';
};

/**
 * Gets the information completeness percentage for a scan quality
 */
export const getScanCompleteness = (quality: ScanQuality): number => {
  switch (quality) {
    case 'PARTIAL':
      return 0.4; // 40% of information
    case 'STANDARD':
      return 0.7; // 70% of information
    case 'DEEP':
      return 0.9; // 90% of information
    case 'COMPLETE':
      return 1.0; // 100% of information
  }
};

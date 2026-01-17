export const BUILD_SEQUENCE = {
  header: 0,
  clock: 200,
  scanPanelBorder: 400,
  fingerprintLeft: 600,
  fingerprintRight: 800,
  minutiaePoints: 1000,    // Then animate each point individually
  retinalBorder: 1200,
  retinalScanlines: 1400,
  retinalImage: 1800,
  locRecord: 2000,
  identification: 2200,
  subjectIntel: 2400,      // Each field staggers by 100ms
  verificationButton: 2800,
  decisionButtons: 3000,
  bpmMonitor: 3200,        // Last thing to go "live"
} as const;

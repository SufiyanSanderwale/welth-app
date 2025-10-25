import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.welth.finance',
  appName: 'WELTH Finance',
  webDir: '.next',
  server: {
    androidScheme: 'http',
    url: 'http://192.168.1.163:3001',
    cleartext: true,
    hostname: '192.168.1.163'
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true
  }
};

export default config;
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.wandpool.app',
  appName: 'WandPool',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true
  },
  plugins: {
    Camera: {
      permissionsType: 'prompt'
    },
    Geolocation: {
      permissionsType: 'prompt'
    }
  }
};

export default config;

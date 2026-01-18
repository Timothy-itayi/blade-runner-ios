import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { Theme } from '../constants/theme';
import { useFonts, ShareTechMono_400Regular } from '@expo-google-fonts/share-tech-mono';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { GameAudioProvider } from '../contexts/AudioContext';

SplashScreen.preventAutoHideAsync();

export default function Layout() {
  const [loaded, error] = useFonts({
    ShareTechMono_400Regular,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <GameAudioProvider>
      <View style={{ flex: 1, backgroundColor: Theme.colors.bgDark }}>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: Theme.colors.bgDark },
          }}
        />
      </View>
    </GameAudioProvider>
  );
}

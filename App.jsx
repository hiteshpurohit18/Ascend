import { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { View, ActivityIndicator } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppProviders } from "./src/app/AppProviders";
import { AppShell } from "./src/app/AppShell";
import { styles } from "./src/styles/styles";
import OnboardingScreen from "./src/screens/onboarding/OnboardingScreen";
import "./src/features/notifications/notifications.service";
import { THEME } from "./src/constants/theme";
import { ChatProvider } from "./src/features/ai/chat.context";
import Toast from "react-native-toast-message";

export default function App() {
  const [loading, setLoading] = useState(true);
  const [viewOnboarding, setViewOnboarding] = useState(false);

  useEffect(() => {
    checkFirstLaunch();
  }, []);

  const checkFirstLaunch = async () => {
    try {
      const value = await AsyncStorage.getItem("@has_launched");
      if (value === null) {
        setViewOnboarding(true);
      } else {
        setViewOnboarding(false);
      }
    } catch (e) {
      console.error("Error checking launch status", e);
    } finally {
      setLoading(false);
    }
  };

  const handleOnboardingFinish = async () => {
    try {
      await AsyncStorage.setItem("@has_launched", "true");
      setViewOnboarding(false);
    } catch (e) {
      console.log("Error saving onboarding status");
      setViewOnboarding(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={THEME.primary} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <StatusBar style="dark" />
        {viewOnboarding ? (
          <OnboardingScreen onFinish={handleOnboardingFinish} />
        ) : (
          <AppProviders>
            <ChatProvider>
              <AppShell />
            </ChatProvider>
          </AppProviders>
        )}
      </View>
      <Toast />
    </SafeAreaProvider>
  );
}

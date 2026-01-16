import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../features/theme/theme.context';

export default function GradientBackground({ children, style }) {
  const { theme } = useTheme();

  return (
    <LinearGradient
      colors={theme.gradientBackground || [theme.background, theme.background]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.container, style]}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

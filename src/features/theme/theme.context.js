import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LightTheme, DarkTheme } from '../../constants/theme';
import { StatusBar } from 'expo-status-bar';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [theme, setTheme] = useState(LightTheme);

  useEffect(() => {
    loadThemePermission();
  }, []);

  const loadThemePermission = async () => {
    try {
      const saved = await AsyncStorage.getItem('@theme_preference');
      if (saved === 'dark') {
         setIsDarkMode(true);
         setTheme(DarkTheme);
      }
    } catch (e) {
      console.log('Failed to load theme', e);
    }
  };

  const toggleTheme = async () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    setTheme(newMode ? DarkTheme : LightTheme);
    try {
      await AsyncStorage.setItem('@theme_preference', newMode ? 'dark' : 'light');
    } catch (e) {
      console.log('Failed to save theme', e);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme }}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} backgroundColor={theme.background} />
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

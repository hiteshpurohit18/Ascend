import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from 'react-native';
import { useAuth } from '../auth/auth.context';

const SleepContext = createContext();

const DEFAULT_ROUTINE = [
  { id: '1', label: 'No Screens (30m)', checked: false },
  { id: '2', label: 'Brush Teeth', checked: false },
  { id: '3', label: 'Read a Book', checked: false },
  { id: '4', label: 'Meditate / Breathe', checked: false },
  { id: '5', label: 'Set Alarm', checked: false },
];

export const SleepProvider = ({ children }) => {
  const { user } = useAuth();
  const [checklist, setChecklist] = useState(DEFAULT_ROUTINE);
  const [lastUpdated, setLastUpdated] = useState(null);
  
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    loadData();

    const subscription = AppState.addEventListener('change', nextAppState => {
       if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
          checkDayReset();
       }
       appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [user]);

  const checkDayReset = () => {
    const today = new Date().toDateString();
    if (lastUpdated && lastUpdated !== today) {
       resetRoutine(today);
    }
  };

  const loadData = async () => {
    try {
      const key = user ? `@sleep_routine_${user.id}` : '@guest_sleep_routine';
      const saved = await AsyncStorage.getItem(key);
      
      if (saved) {
        const data = JSON.parse(saved);
        const today = new Date().toDateString();
        
        
        if (data.date !== today) {
          resetRoutine(today);
        } else {
          setChecklist(data.checklist || DEFAULT_ROUTINE);
          setLastUpdated(data.date);
        }
      } else {
        
        resetRoutine(new Date().toDateString());
      }
    } catch (e) {
      console.error("Failed to load sleep data", e);
    }
  };

  const saveData = async (list, date) => {
    try {
      const data = {
        checklist: list,
        date: date || new Date().toDateString()
      };
      const key = user ? `@sleep_routine_${user.id}` : '@guest_sleep_routine';
      await AsyncStorage.setItem(key, JSON.stringify(data));
      setLastUpdated(data.date);
    } catch (e) {
      console.error("Failed to save sleep data", e);
    }
  };

  const resetRoutine = (date) => {
    
    const freshStart = DEFAULT_ROUTINE.map(item => ({ ...item, checked: false }));
    setChecklist(freshStart);
    saveData(freshStart, date);
  };

  const toggleItem = (id) => {
    const updated = checklist.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    setChecklist(updated);
    saveData(updated, lastUpdated);
  };

  return (
    <SleepContext.Provider value={{ 
      checklist, 
      toggleItem,
      progress: Math.round((checklist.filter(i => i.checked).length / checklist.length) * 100)
    }}>
      {children}
    </SleepContext.Provider>
  );
};

export const useSleep = () => useContext(SleepContext);

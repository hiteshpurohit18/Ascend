import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from 'react-native';
import { useAuth } from '../auth/auth.context';
import { scheduleHydrationReminder } from '../notifications/notifications.service';

const HydrationContext = createContext();

export const HydrationProvider = ({ children }) => {
  const { user } = useAuth();
  const [currentIntake, setCurrentIntake] = useState(0);
  const [dailyGoal, setDailyGoal] = useState(2500); 
  const [lastUpdated, setLastUpdated] = useState(null);
  const [history, setHistory] = useState([]); 
  const [weeklyHistory, setWeeklyHistory] = useState([]); 
  const [remindersEnabled, setRemindersEnabled] = useState(false);
  
  const appState = useRef(AppState.currentState);

  
  useEffect(() => {
    loadData();

    const subscription = AppState.addEventListener('change', nextAppState => {
       if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
          
          checkDayReset();
       }
       appState.current = nextAppState;
    });

    
    const interval = setInterval(checkDayReset, 60000);

    return () => {
      subscription.remove();
      clearInterval(interval);
    };
  }, [user]);

  
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem("hydrationReminders");
        if (saved !== null) {
          setRemindersEnabled(JSON.parse(saved));
        }
      } catch (e) { console.log(e); }
    })();
  }, []);

  
  const tryReschedule = (intake, goal) => {
    if (remindersEnabled) {
      scheduleHydrationReminder(intake, goal);
    }
  };

  const checkDayReset = () => {
     const today = new Date().toDateString();
     if (lastUpdated && lastUpdated !== today) {
         
         
         
         let newWeeklyHistory = weeklyHistory;
         
         if (lastUpdated) {
             const yesterdayEntry = { date: lastUpdated, amount: currentIntake, goal: dailyGoal };
             newWeeklyHistory = [yesterdayEntry, ...weeklyHistory].slice(0, 7);
         }

         setCurrentIntake(0);
         setHistory([]);
         setLastUpdated(today);
         setWeeklyHistory(newWeeklyHistory);
         saveData(0, dailyGoal, [], today, newWeeklyHistory);
     }
  };

  const loadData = async () => {
    try {
      if (!user) {
        
        const saved = await AsyncStorage.getItem('@guest_hydration');
        if (saved) parseAndSetData(saved);
        return;
      }
      
      const key = `@hydration_${user.id}`;
      const saved = await AsyncStorage.getItem(key);
      if (saved) parseAndSetData(saved);
      else {
        
        setCurrentIntake(0);
        setDailyGoal(2500);
        setHistory([]);
        setWeeklyHistory([]);
      }
    } catch (e) {
      console.error("Failed to load hydration data", e);
    }
  };

  const parseAndSetData = (jsonString) => {
    const data = JSON.parse(jsonString);
    const today = new Date().toDateString();
    
    
    if (data.date !== today) {
      
      let newWeeklyHistory = data.weeklyHistory || [];
      const yesterdayEntry = { date: data.date, amount: data.currentIntake || 0, goal: data.dailyGoal || 2500 };
      newWeeklyHistory = [yesterdayEntry, ...newWeeklyHistory].slice(0, 7);

      setCurrentIntake(0); 
      setHistory([]);
      setLastUpdated(today);
      setWeeklyHistory(newWeeklyHistory);
      saveData(0, data.dailyGoal || 2500, [], today, newWeeklyHistory);
    } else {
      setCurrentIntake(data.currentIntake || 0);
      setDailyGoal(data.dailyGoal || 2500);
      setHistory(data.history || []);
      setWeeklyHistory(data.weeklyHistory || []);
      setLastUpdated(data.date);
    }
  };

  const saveData = async (intake, goal, hist, date, weeklyHist) => {
    try {
      
      const finalWeekly = weeklyHist !== undefined ? weeklyHist : weeklyHistory;
      
      const data = {
        currentIntake: intake,
        dailyGoal: goal,
        history: hist,
        date: date || new Date().toDateString(),
        weeklyHistory: finalWeekly
      };
      
      const jsonStr = JSON.stringify(data);
      
      if (user) {
        await AsyncStorage.setItem(`@hydration_${user.id}`, jsonStr);
      } else {
        await AsyncStorage.setItem('@guest_hydration', jsonStr);
      }
    } catch (e) {
      console.error("Failed to save hydration data", e);
    }
  };

  const addWater = (amount) => {
    if (amount <= 0) return;
    const newAmount = currentIntake + amount;
    
    const finalAmount = Math.min(newAmount, 10000); 
    
    const newHistory = [...history, amount];
    
    setCurrentIntake(finalAmount);
    setHistory(newHistory);
    saveData(finalAmount, dailyGoal, newHistory, lastUpdated, weeklyHistory);
    tryReschedule(finalAmount, dailyGoal);
  };
  
  const undoLast = () => {
    if (history.length === 0) return;
    
    const lastAmount = history[history.length - 1];
    const newHistory = history.slice(0, -1);
    const newIntake = Math.max(0, currentIntake - lastAmount);
    
    setCurrentIntake(newIntake);
    setHistory(newHistory);
    saveData(newIntake, dailyGoal, newHistory, lastUpdated, weeklyHistory);
    tryReschedule(newIntake, dailyGoal);
  };

  const setGoal = (newGoal) => {
    setDailyGoal(newGoal);
    saveData(currentIntake, newGoal, history, lastUpdated, weeklyHistory);
    tryReschedule(currentIntake, newGoal);
  };

  const resetIntake = () => {
    setCurrentIntake(0);
    setHistory([]);
    saveData(0, dailyGoal, [], lastUpdated, weeklyHistory);
    tryReschedule(0, dailyGoal);
  };

  return (
    <HydrationContext.Provider value={{ 
      currentIntake, 
      dailyGoal, 
      addWater,
      undoLast,
      resetIntake,
      setGoal,
      history,
      weeklyHistory,
      percentage: dailyGoal > 0 ? Math.min(100, Math.round((currentIntake / dailyGoal) * 100)) : 0,
      setRemindersEnabled 
    }}>
      {children}
    </HydrationContext.Provider>
  );
};

export const useHydration = () => useContext(HydrationContext);

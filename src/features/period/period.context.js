import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const PeriodContext = createContext();

export const PeriodProvider = ({ children }) => {
  const [logs, setLogs] = useState([]); 
  const [averageCycle, setAverageCycle] = useState(28);
  const [isRegular, setIsRegular] = useState(true);
  const [cycleReviews, setCycleReviews] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const savedLogs = await AsyncStorage.getItem("@period_logs");
      if (savedLogs) {
        setLogs(JSON.parse(savedLogs));
        recalculateStats(JSON.parse(savedLogs));
      }
      const savedReviews = await AsyncStorage.getItem("@period_reviews");
      if (savedReviews) setCycleReviews(JSON.parse(savedReviews));
    } catch (e) {
      console.error("Failed to load period logs", e);
    }
  };

  const recalculateStats = (currentLogs) => {
    if (currentLogs.length < 2) {
        setAverageCycle(28); 
        return;
    }

    
    const sorted = [...currentLogs].sort((a, b) => new Date(b) - new Date(a));
    
    let totalDays = 0;
    let intervals = 0;

    const cycleLengths = [];

    for (let i = 0; i < sorted.length - 1; i++) {
        const start = new Date(sorted[i]);
        const prev = new Date(sorted[i+1]);
        const diffTime = Math.abs(start - prev);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        
        if (diffDays < 45 && diffDays > 15) {
            totalDays += diffDays;
            intervals++;
            cycleLengths.push(diffDays);
        }
    }

    if (intervals > 0) {
        setAverageCycle(Math.round(totalDays / intervals));
    } else {
        setAverageCycle(28);
    }
  };

  const logPeriod = async (dateStr) => {
    
    const exists = logs.includes(dateStr);
    if (exists) return;

    
    const newLogs = [...logs, dateStr].sort((a, b) => new Date(b) - new Date(a));
    
    setLogs(newLogs);
    recalculateStats(newLogs);
    await AsyncStorage.setItem("@period_logs", JSON.stringify(newLogs));
  };

  const deleteLog = async (dateStr) => {
      const newLogs = logs.filter(d => d !== dateStr);
      setLogs(newLogs);
      recalculateStats(newLogs);
      await AsyncStorage.setItem("@period_logs", JSON.stringify(newLogs));
  };

  
  const getCycleStatus = () => {
      if (logs.length === 0) return { status: 'unknown', msg: "Log your period to see predictions." };
      
      const lastStart = new Date(logs[0]);
      const nextDue = new Date(lastStart);
      nextDue.setDate(lastStart.getDate() + averageCycle);

      const today = new Date();
      
      today.setHours(0,0,0,0);
      nextDue.setHours(0,0,0,0);

      const diffTime = nextDue - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays > 0) {
          return { status: 'future', days: diffDays, nextDate: nextDue.toISOString() };
      } else if (diffDays === 0) {
          return { status: 'due', days: 0, nextDate: nextDue.toISOString() };
      } else {
          return { status: 'late', days: Math.abs(diffDays), nextDate: nextDue.toISOString() };
      }
  };

  
  
  const getLastCycleAnalysis = () => {
      if (logs.length < 2) return null;
      
      const latest = new Date(logs[0]);
      const previous = new Date(logs[1]);
      const diffTime = Math.abs(latest - previous);
      const currentLength = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      const diff = currentLength - averageCycle;

      if (Math.abs(diff) <= 2) return { type: 'regular', diff: 0, length: currentLength };
      if (diff < -2) return { type: 'early', diff: Math.abs(diff), length: currentLength };
      if (diff > 2) return { type: 'late', diff: diff, length: currentLength };
  };

  
  const [loveNotes, setLoveNotes] = useState([]);

  useEffect(() => {
      loadNotes();
  }, []);

  const loadNotes = async () => {
      try {
          const saved = await AsyncStorage.getItem("@love_notes");
          if (saved) setLoveNotes(JSON.parse(saved));
      } catch (e) { console.log(e); }
  };

  const saveLoveNote = async (text) => {
      const newNote = { id: Date.now(), text, date: new Date().toISOString(), read: false };
      const updated = [...loveNotes, newNote];
      setLoveNotes(updated);
      await AsyncStorage.setItem("@love_notes", JSON.stringify(updated));
  };

  const deleteNote = async (id) => {
      const updated = loveNotes.filter(n => n.id !== id);
      setLoveNotes(updated);
      await AsyncStorage.setItem("@love_notes", JSON.stringify(updated));
  };

  const saveCycleReview = async (dateStr, data) => {
      const filtered = cycleReviews.filter(r => r.date !== dateStr);
      const newReview = { date: dateStr, ...data, timestamp: Date.now() };
      const updated = [newReview, ...filtered].sort((a,b) => new Date(b.date) - new Date(a.date));
      setCycleReviews(updated);
      await AsyncStorage.setItem("@period_reviews", JSON.stringify(updated));
  };

  const getAvailableNotes = () => {
      
      return loveNotes.filter(n => !n.read);
  };

  
  const getCurrentCycleDay = () => {
      if (logs.length === 0) return null;
      const lastStart = new Date(logs[0]);
      const now = new Date();
      const diffTime = Math.abs(now - lastStart);
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  
  const getHistoryChartData = () => {
      if (logs.length < 2) return { labels: [], data: [] };
      
      const data = [];
      const labels = [];
      
      
      
      
      
      const loops = Math.min(logs.length - 1, 12);
      
      
      for (let i = loops - 1; i >= 0; i--) {
          const end = new Date(logs[i]); 
          const start = new Date(logs[i+1]); 
          const len = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
          
          if (len < 60) { 
             data.push(len);
             labels.push(end.toLocaleDateString('en-US', { month: 'short' }));
          }
      }
      return { labels, data };
  };

  return (
    <PeriodContext.Provider value={{ 
      logs, 
      averageCycle, 
      logPeriod, 
      deleteLog,
      getCycleStatus,
      getLastCycleAnalysis,
      getHistoryChartData,
      loveNotes,
      saveLoveNote,
      deleteNote,
      getCurrentCycleDay,
      cycleReviews,
      saveCycleReview
    }}>
      {children}
    </PeriodContext.Provider>
  );
};

export const usePeriod = () => useContext(PeriodContext);

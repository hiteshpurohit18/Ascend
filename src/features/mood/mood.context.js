import { createContext, useContext, useEffect, useState } from "react";
import { storage } from "../../storage/storage";
import { getWeeklyInsight, calculateStreak } from "./mood.utils";

const MoodContext = createContext();

export const MoodProvider = ({ children }) => {
  const [currentMood, setCurrentMood] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const loadMoodData = async () => {
      const storedMood = await storage.get("currentMood", null);
      const storedDate = await storage.get("currentMoodDate", null);
      const historyData = await storage.get("moodHistory", []);

      setHistory(historyData);

      
      const today = new Date().toDateString();
      if (storedMood && storedDate === today) {
        setCurrentMood(storedMood);
      } else {
        setCurrentMood(null); 
      }
    };
    
    loadMoodData();
  }, []);

  const setMood = async (mood) => {
    const now = new Date();
    const today = now.toDateString();
    
    
    
    
    
    
    
    
    
    const entry = { mood, date: now.toISOString() };
    const updated = [...history, entry];
    
    setCurrentMood(mood);
    setHistory(updated);
    
    await storage.set("currentMood", mood);
    await storage.set("currentMoodDate", today); 
    await storage.set("moodHistory", updated);
  };

  const streak = calculateStreak(history);
  
  
  const now = new Date();
  const todayStr = now.toDateString();
  const checkinsToday = history.filter(item => {
    const itemDate = new Date(item.date);
    return itemDate <= now && itemDate.toDateString() === todayStr;
  }).length;

  return (
    <MoodContext.Provider value={{ currentMood, history, setMood, streak, checkinsToday }}>
      {children}
    </MoodContext.Provider>
  );
};

export const useMood = () => useContext(MoodContext);

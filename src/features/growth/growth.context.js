import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMood } from "../mood/mood.context";
import { useJournal } from "../journal/journal.context";
import { useHydration } from "../hydration/hydration.context";
import { useBlogs } from "../blogs/blogs.context";

const GrowthContext = createContext();

const DEFAULT_GOALS = [
  { id: "1", title: "Meditate for 10 mins", icon: "sunny-outline" },
  { id: "2", title: "Drink 2L Water", icon: "water-outline" },
  { id: "3", title: "Read 5 pages", icon: "book-outline" },
  { id: "4", title: "Write in Journal", icon: "pencil-outline" },
  { id: "5", title: "Exercise", icon: "bicycle-outline" },
];

export const GrowthProvider = ({ children }) => {
  const { history: moodHistory } = useMood();
  const { entries: journalHistory } = useJournal();
  const { weeklyHistory: hydrationHistory, percentage: hydrationPercentage } = useHydration();
  const { readHistory: readBlogsHistory } = useBlogs();
  
  const [completedGoals, setCompletedGoals] = useState([]);
  const [goalsHistory, setGoalsHistory] = useState({}); 
  const [growthHistory, setGrowthHistory] = useState([]);

  useEffect(() => {
    loadGoalsData();
  }, []);

  const loadGoalsData = async () => {
    try {
      const savedGoals = await AsyncStorage.getItem("@daily_goals");
      const savedDate = await AsyncStorage.getItem("@daily_goals_date");
      const savedHistory = await AsyncStorage.getItem("@goals_history");
      const today = new Date().toDateString();

      if (savedHistory) setGoalsHistory(JSON.parse(savedHistory));

      if (savedDate !== today) {
        
        
        
        
        setCompletedGoals([]);
        await AsyncStorage.setItem("@daily_goals_date", today);
        await AsyncStorage.setItem("@daily_goals", JSON.stringify([]));
      } else if (savedGoals) {
        setCompletedGoals(JSON.parse(savedGoals));
      }
    } catch (e) {
      console.error("Failed to load goals", e);
    }
  };

  const toggleGoal = async (id) => {
    let newCompleted;
    if (completedGoals.includes(id)) {
      newCompleted = completedGoals.filter((c) => c !== id);
    } else {
      newCompleted = [...completedGoals, id];
    }
    setCompletedGoals(newCompleted);
    
    
    await AsyncStorage.setItem("@daily_goals", JSON.stringify(newCompleted));
    
    
    const todayKey = new Date().toISOString().split('T')[0];
    const ratio = newCompleted.length / DEFAULT_GOALS.length;
    
    const newHistory = { ...goalsHistory, [todayKey]: ratio };
    setGoalsHistory(newHistory);
    await AsyncStorage.setItem("@goals_history", JSON.stringify(newHistory));
  };

  
  const calculateGrowthHistory = () => {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const dateObj = d.toDateString();

        
        
        
        
        let hydScore = 0;
        const hydEntry = hydrationHistory.find(h => new Date(h.date).toDateString() === dateObj);
        
        if (i === 0) {
            hydScore = Math.min((hydrationPercentage || 0) / 100, 1) * 20;
        } else if (hydEntry) {
            hydScore = Math.min((hydEntry.amount / hydEntry.goal), 1) * 20;
        }

        
        
        const hasJournal = journalHistory.some(j => j.date.startsWith(dateStr));
        const journalScore = hasJournal ? 20 : 0;

        
        
        const hasMood = moodHistory.some(m => m.date.startsWith(dateStr));
        const moodScore = hasMood ? 20 : 0;

        
        const goalRatio = goalsHistory[dateStr] || 0;
        const goalScore = goalRatio * 20;

        
        
        
        const hasRead = readBlogsHistory.some(r => {
            if (!r.date) return false;
            
            return r.date.startsWith(dateStr);
        });
        const readScore = hasRead ? 20 : 0;

        last7Days.push({
            date: dateStr,
            score: Math.round(hydScore + journalScore + moodScore + goalScore + readScore),
            
            breakdown: { hydScore, journalScore, moodScore, goalScore, readScore }
        });
    }
    return last7Days;
  };

  return (
    <GrowthContext.Provider value={{ 
      completedGoals, 
      toggleGoal, 
      defaultGoals: DEFAULT_GOALS,
      getGrowthHistory: calculateGrowthHistory
    }}>
      {children}
    </GrowthContext.Provider>
  );
};

export const useGrowth = () => useContext(GrowthContext);

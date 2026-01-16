import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../auth/auth.context";

const JournalContext = createContext();

export const JournalProvider = ({ children }) => {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  
  useEffect(() => {
    if (user) {
      loadEntries();
    } else {
      setEntries([]);
      setLoading(false);
    }
  }, [user]);

  const loadEntries = async () => {
    try {
      setLoading(true);
      const key = user.id ? `@journal_${user.id}` : `@journal_${user.email}`;
      const stored = await AsyncStorage.getItem(key);
      if (stored) {
        setEntries(JSON.parse(stored));
      } else {
        setEntries([]);
      }
    } catch (e) {
      console.error("Failed to load journal", e);
    } finally {
      setLoading(false);
    }
  };

  const addEntry = async (items, photos = [], tags = [], customDate = null) => {
    if (!user) return;

    const newEntry = {
      id: Date.now().toString(),
      date: customDate || new Date().toISOString(),
      items: items, 
      photos: photos, 
      tags: tags, 
    };

    const updated = [newEntry, ...entries];
    setEntries(updated);
    await saveEntries(updated);
  };

  const deleteEntry = async (id) => {
    if (!user) return;
    const updated = entries.filter((e) => e.id !== id);
    setEntries(updated);
    await saveEntries(updated);
  };

  const updateEntry = async (id, updatedItems, updatedPhotos = null, updatedTags = null) => {
    if (!user) return;
    
    const updated = entries.map((entry) => {
      if (entry.id === id) {
        return { 
            ...entry, 
            items: updatedItems,
            
            photos: updatedPhotos !== null ? updatedPhotos : (entry.photos || []),
            tags: updatedTags !== null ? updatedTags : (entry.tags || [])
        };
      }
      return entry;
    });

    setEntries(updated);
    await saveEntries(updated);
  };

  const saveEntries = async (data) => {
    try {
      const key = user.id ? `@journal_${user.id}` : `@journal_${user.email}`;
      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error("Failed to save journal", e);
    }
  };

  const deleteAllEntries = async () => {
    if (!user) return;
    setEntries([]);
    await saveEntries([]);
  };

  return (
    <JournalContext.Provider value={{ entries, addEntry, deleteEntry, updateEntry, deleteAllEntries, loading }}>
      {children}
    </JournalContext.Provider>
  );
};

export const useJournal = () => useContext(JournalContext);

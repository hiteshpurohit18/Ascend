import { createContext, useContext, useEffect, useState } from "react";
import { storage } from "../../storage/storage";
import { useAuth } from "../auth/auth.context";

const BlogsContext = createContext();

export const BlogsProvider = ({ children }) => {
  const { user } = useAuth();
  const [readHistory, setReadHistory] = useState([]); 
  const [bookmarkedBlogs, setBookmarkedBlogs] = useState([]);

  useEffect(() => {
    if (user) {
      
      storage.get("readBlogs", []).then(data => {
        if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'string') {
          
          const migrated = data.map(id => ({ id, date: new Date(0).toISOString() }));
          setReadHistory(migrated);
          storage.set("readBlogs", migrated); 
        } else {
          setReadHistory(data || []);
        }
      });
      storage.get("bookmarkedBlogs", []).then(setBookmarkedBlogs);
    } else {
      setReadHistory([]);
      setBookmarkedBlogs([]);
    }
  }, [user]);

  const markRead = async (id) => {
    if (!user) return;
    
    
    const today = new Date().toDateString();
    const alreadyReadToday = readHistory.some(
      item => item.id === id && new Date(item.date).toDateString() === today
    );

    if (alreadyReadToday) return;

    
    const newEntry = { id, date: new Date().toISOString() };
    const updated = [...readHistory, newEntry];
    
    setReadHistory(updated);
    await storage.set("readBlogs", updated);
  };

  const toggleBookmark = async (id) => {
    if (!user) return;
    let updated;
    if (bookmarkedBlogs.includes(id)) {
      updated = bookmarkedBlogs.filter((bId) => bId !== id);
    } else {
      updated = [...bookmarkedBlogs, id];
    }
    setBookmarkedBlogs(updated);
    await storage.set("bookmarkedBlogs", updated);
  };

  
  
  
  const readBlogs = [...new Set(readHistory.map(item => item.id))];

  
  const readsToday = readHistory.filter(item => 
    new Date(item.date).toDateString() === new Date().toDateString()
  ).length;

  return (
    <BlogsContext.Provider value={{ readBlogs, markRead, bookmarkedBlogs, toggleBookmark, readsToday, readHistory }}>
      {children}
    </BlogsContext.Provider>
  );
};

export const useBlogs = () => useContext(BlogsContext);

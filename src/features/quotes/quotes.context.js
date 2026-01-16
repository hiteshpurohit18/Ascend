import { createContext, useContext, useEffect, useState } from "react";
import { storage } from "../../storage/storage";
import { useAuth } from "../auth/auth.context";

const QuotesContext = createContext();

export const QuotesProvider = ({ children }) => {
  const { user } = useAuth();
  const [likedQuotes, setLikedQuotes] = useState([]);

  useEffect(() => {
    if (user) {
      
      storage.get("likedQuotes", []).then(setLikedQuotes);
    } else {
      setLikedQuotes([]);
    }
  }, [user]);

  const toggleQuote = async (id) => {
    if (!user) return; 

    const updated = likedQuotes.includes(id)
      ? likedQuotes.filter((q) => q !== id)
      : [...likedQuotes, id];

    setLikedQuotes(updated);
    await storage.set("likedQuotes", updated);
  };

  return (
    <QuotesContext.Provider value={{ likedQuotes, toggleQuote }}>
      {children}
    </QuotesContext.Provider>
  );
};

export const useQuotes = () => useContext(QuotesContext);

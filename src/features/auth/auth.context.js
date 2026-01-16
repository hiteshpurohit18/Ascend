import { createContext, useContext, useEffect, useState } from "react";
import { storage } from "../../storage/storage";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingAction, setPendingAction] = useState(null); 

  useEffect(() => {
    loadUser();
  }, []);

  
  const loadUser = async () => {
    try {
      const storedUser = await storage.get("user_session");
      if (storedUser) {
        setUser(storedUser);
      }
    } catch (e) {
      console.log("Failed to load user session");
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    
    const registeredUsers = (await storage.get("registered_users")) || [];
    
    
    const foundUser = registeredUsers.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (!foundUser) {
      throw new Error("Invalid credentials");
    }

    
    const { password: _, ...userSession } = foundUser;
    
    setUser(userSession);
    await storage.set("user_session", userSession);
    return true;
  };
  
  
  const setAuthPendingAction = (action) => {
    setPendingAction(action);
  };

  
  const consumePendingAction = () => {
    const action = pendingAction;
    setPendingAction(null);
    return action;
  };

  const signup = async (name, surname, email, password, userTag = "", gender = null) => {
    
    const registeredUsers = (await storage.get("registered_users")) || [];
    
    
    if (registeredUsers.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error("Email already registered");
    }

    const newUser = {
      id: Date.now().toString(),
      name,
      surname,
      email,
      password, 
      userTag: userTag || "Hero in Training", 
      gender,
      profileImage: null,
    };
    
    
    const updatedUsers = [...registeredUsers, newUser];
    await storage.set("registered_users", updatedUsers);

    
    const { password: _, ...userSession } = newUser;
    setUser(userSession);
    await storage.set("user_session", userSession);
    
    return true;
  };

  const logout = async () => {
    setUser(null);
    await storage.remove("user_session");
  };

  const updateProfileImage = async (uri) => {
    await updateProfile({ profileImage: uri });
  };

  const updateProfile = async (updates) => {
    if (!user) return;
    
    
    const updatedSession = { ...user, ...updates };
    setUser(updatedSession);
    await storage.set("user_session", updatedSession);
    
    
    const registeredUsers = (await storage.get("registered_users")) || [];
    const updatedUsers = registeredUsers.map(u => 
      u.email === user.email ? { ...u, ...updates } : u
    );
    await storage.set("registered_users", updatedUsers);
  };

  return (
    <AuthContext.Provider
      value={{ 
        user, 
        loading, 
        login, 
        signup, 
        logout, 
        updateProfileImage,
        updateProfile,
        setAuthPendingAction,
        consumePendingAction
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

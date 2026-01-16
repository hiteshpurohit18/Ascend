import { createContext, useContext, useState } from "react";

const NavigationContext = createContext();

export const NavigationProvider = ({ children }) => {
  const [activeTab, setActiveTab] = useState("Home");
  const [routeParams, setRouteParams] = useState({});

  const navigate = (tab, params = {}) => {
    setActiveTab(tab);
    setRouteParams(params);
  };

  return (
    <NavigationContext.Provider
      value={{ activeTab, navigate, routeParams, setRouteParams }}
    >
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => useContext(NavigationContext);

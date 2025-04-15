"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  Dispatch,
  SetStateAction,
} from "react";

interface AppContextType {
  isDarkMode: boolean;
  setIsDarkMode: Dispatch<SetStateAction<boolean>>;
  isSidebarOpen: boolean;
  setIsSidebarOpen: Dispatch<SetStateAction<boolean>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const value = {
    isDarkMode,
    setIsDarkMode,
    isSidebarOpen,
    setIsSidebarOpen,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

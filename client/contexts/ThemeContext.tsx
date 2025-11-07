import React, { createContext, useContext, useState, ReactNode } from "react";

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
  theme: {
    backgroundColor: string;
    textColor: string;
    cardBackground: string;
    borderColor: string;
    secondaryText: string;
    primary: string;
  };
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const theme = {
    backgroundColor: isDarkMode ? "#1a1a1a" : "#ffffff",
    textColor: isDarkMode ? "#ffffff" : "#000000",
    cardBackground: isDarkMode ? "#2a2a2a" : "#f5f5f5",
    borderColor: isDarkMode ? "#444444" : "#e0e0e0",
    secondaryText: isDarkMode ? "#888888" : "#666666",
    primary: isDarkMode ? "#d6d6d6ff" : "#000000ff",
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};

'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'dynamic';
type Appearance = 'light' | 'afternoon' | 'dark' | 'night';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  appearance: Appearance;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  const [appearance, setAppearance] = useState<Appearance>('light');

  // Load saved theme from local storage
  useEffect(() => {
    // We still load from localStorage for the initial render to prevent flash
    // But ThemeSync will override this if a user is logged in with a different preference
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  // Save theme to local storage
  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Calculate appearance based on theme and time
  useEffect(() => {
    const updateAppearance = () => {
      if (theme === 'light') {
        setAppearance('light');
      } else if (theme === 'dark') {
        setAppearance('dark');
      } else if (theme === 'dynamic') {
        const hour = new Date().getHours();
        
        if (hour >= 6 && hour < 12) {
          // 6 AM - 12 PM: Morning (Light)
          setAppearance('light');
        } else if (hour >= 12 && hour < 18) {
          // 12 PM - 6 PM: Afternoon (Mid-Light)
          setAppearance('afternoon');
        } else if (hour >= 18 && hour <= 23) {
          // 6 PM - 12 AM: Evening (Dark)
          setAppearance('dark');
        } else {
          // 12 AM - 6 AM: Night (Deep Dark)
          setAppearance('night');
        }
      }
    };

    updateAppearance();

    // Check every minute for dynamic updates
    const interval = setInterval(updateAppearance, 60000);
    return () => clearInterval(interval);
  }, [theme]);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    // Remove all previous theme attributes
    root.removeAttribute('data-theme');
    
    // Apply new theme if it's not default light (which has no attribute in our CSS)
    if (appearance !== 'light') {
      root.setAttribute('data-theme', appearance);
    }
  }, [appearance]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, appearance }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

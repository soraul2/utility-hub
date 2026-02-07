import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { THEME_STYLES, ALL_THEME_VARS } from '../lib/constants/themes';
import { useAuth } from '../hooks/useAuth';

type Theme = 'light' | 'dark';

interface ThemeContextType {
      theme: Theme;
      colorTheme: string;
      toggleTheme: () => void;
      setColorTheme: (key: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
      const { user } = useAuth();

      const [theme, setTheme] = useState<Theme>(() => {
            const saved = localStorage.getItem('theme');
            return (saved as Theme) || 'light';
      });

      const [colorTheme, setColorThemeState] = useState<string>(() => {
            return localStorage.getItem('colorTheme') || 'default';
      });

      // Apply light/dark class
      useEffect(() => {
            const root = window.document.documentElement;
            root.classList.remove('light', 'dark');
            root.classList.add(theme);
            localStorage.setItem('theme', theme);
      }, [theme]);

      // Apply color theme CSS variables
      useEffect(() => {
            const root = document.documentElement;
            const styles = THEME_STYLES[colorTheme] || THEME_STYLES['default'];
            const vars = theme === 'dark' ? styles.variables.dark : styles.variables.light;

            // Reset all theme variables first
            ALL_THEME_VARS.forEach((key) => {
                  root.style.removeProperty(key);
            });

            // Apply overrides
            Object.entries(vars).forEach(([key, value]) => {
                  root.style.setProperty(key, value);
            });

            // Apply background pattern
            const bgEl = document.getElementById('theme-bg-pattern');
            if (bgEl) {
                  const bgCss = theme === 'dark'
                        ? styles.backgroundCss?.dark
                        : styles.backgroundCss?.light;
                  bgEl.style.backgroundImage = bgCss || 'none';
            }

            localStorage.setItem('colorTheme', colorTheme);
      }, [colorTheme, theme]);

      // Sync with auth user's active theme
      useEffect(() => {
            if (user) {
                  setColorThemeState(user.activeThemeKey || 'default');
            }
      }, [user?.activeThemeKey, user?.id]);

      const toggleTheme = () => {
            setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
      };

      const setColorTheme = useCallback((key: string) => {
            setColorThemeState(key);
      }, []);

      return (
            <ThemeContext.Provider value={{ theme, colorTheme, toggleTheme, setColorTheme }}>
                  {children}
            </ThemeContext.Provider>
      );
};

export const useTheme = () => {
      const context = useContext(ThemeContext);
      if (context === undefined) {
            throw new Error('useTheme must be used within a ThemeProvider');
      }
      return context;
};

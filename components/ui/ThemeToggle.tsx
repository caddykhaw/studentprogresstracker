'use client'

import React, { useState, useEffect } from 'react';

/**
 * ThemeToggle component - Provides dark mode functionality based on system preferences
 * with the ability to manually override via a toggle button
 */
const ThemeToggle: React.FC = () => {
  // State for theme - initialized with system preference and localStorage
  const [isDarkTheme, setIsDarkTheme] = useState<boolean | null>(null);

  // On mount, check localStorage first, then system preference
  useEffect(() => {
    // Check if theme is saved in localStorage
    const savedTheme = localStorage.getItem('darkMode');
    
    if (savedTheme !== null) {
      setIsDarkTheme(savedTheme === 'true');
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkTheme(true);
    } else {
      setIsDarkTheme(false);
    }
  }, []);
  
  // Apply theme changes when isDarkTheme changes
  useEffect(() => {
    if (isDarkTheme === null) return;
    
    // Apply to document
    if (isDarkTheme) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }
    
    // Save to localStorage
    localStorage.setItem('darkMode', isDarkTheme ? 'true' : 'false');
  }, [isDarkTheme]);
  
  // Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      // Only update if user hasn't manually set preference
      if (localStorage.getItem('darkMode') === null) {
        setIsDarkTheme(e.matches);
      }
    };
    
    // Add event listener
    mediaQuery.addEventListener('change', handleChange);
    
    // Cleanup
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = () => {
    setIsDarkTheme(prev => !prev);
  };

  // Don't render anything until we've determined the theme
  if (isDarkTheme === null) return null;

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full bg-blue-700 dark:bg-blue-900 text-white dark:text-white 
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 
        hover:bg-blue-800 dark:hover:bg-blue-950 transition-colors duration-200"
      aria-label={isDarkTheme ? "Switch to light mode" : "Switch to dark mode"}
      title={isDarkTheme ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDarkTheme ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )}
    </button>
  );
};

export default ThemeToggle; 

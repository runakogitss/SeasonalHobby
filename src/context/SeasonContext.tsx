'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Season = 'summer' | 'winter';

interface SeasonContextType {
  season: Season;
  setSeason: (season: Season) => void;
  toggleSeason: () => void;
}

const SeasonContext = createContext<SeasonContextType | undefined>(undefined);

export function SeasonProvider({ children }: { children: React.ReactNode }) {
  const [season, setSeasonState] = useState<Season>('summer');

  const updateThemeClass = (s: Season) => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      root.classList.remove('theme-summer', 'theme-winter');
      root.classList.add(`theme-${s}`);
    }
  };

  // Load from localStorage on client mount
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const saved = localStorage.getItem('seasonal-hobby-season') as Season;
    if (saved === 'summer' || saved === 'winter') {
      setSeasonState(saved);
      updateThemeClass(saved);
    } else {
      updateThemeClass('summer');
    }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const setSeason = (newSeason: Season) => {
    setSeasonState(newSeason);
    localStorage.setItem('seasonal-hobby-season', newSeason);
    updateThemeClass(newSeason);
  };

  const toggleSeason = () => {
    const nextSeason = season === 'summer' ? 'winter' : 'summer';
    setSeason(nextSeason);
  };

  return (
    <SeasonContext.Provider value={{ season, setSeason, toggleSeason }}>
      {children}
    </SeasonContext.Provider>
  );
}

export function useSeason() {
  const context = useContext(SeasonContext);
  if (!context) {
    throw new Error('useSeason must be used within a SeasonProvider');
  }
  return context;
}

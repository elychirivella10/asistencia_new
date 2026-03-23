"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const ThemePresetContext = createContext({
  preset: "default",
  setPreset: () => {},
  effect: "none",
  setEffect: () => {},
});

export function useThemePreset() {
  return useContext(ThemePresetContext);
}

export function ThemeProvider({ children }) {
  const [preset, setPreset] = useState(() => {
    if (typeof window === "undefined") return "default";
    try {
      return localStorage.getItem("theme-preset") || "default";
    } catch {
      return "default";
    }
  });
  
  const [effect, setEffect] = useState(() => {
    if (typeof window === "undefined") return "none";
    try {
      return localStorage.getItem("theme-effect") || "none";
    } catch {
      return "none";
    }
  });

  useEffect(() => {
    try {
      if (preset && preset !== "default") {
        document.documentElement.dataset.preset = preset;
        localStorage.setItem("theme-preset", preset);
      } else {
        delete document.documentElement.dataset.preset;
        localStorage.removeItem("theme-preset");
      }
    } catch {}
  }, [preset]);

  useEffect(() => {
    try {
      if (effect && effect !== "none") {
        document.documentElement.dataset.effect = effect;
        localStorage.setItem("theme-effect", effect);
      } else {
        delete document.documentElement.dataset.effect;
        localStorage.removeItem("theme-effect");
      }
    } catch {}
  }, [effect]);

  const contextValue = useMemo(() => ({ preset, setPreset, effect, setEffect }), [preset, effect]);

  return (
    <NextThemesProvider
      attribute="class"
      storageKey="theme-mode"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      themes={["light", "dark"]}
    >
      <ThemePresetContext.Provider value={contextValue}>
        {children}
      </ThemePresetContext.Provider>
    </NextThemesProvider>
  );
}

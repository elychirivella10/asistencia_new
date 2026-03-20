"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const ThemePresetContext = createContext({
  preset: "default",
  setPreset: () => {},
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

  useEffect(() => {
    try {
      if (preset && preset !== "default") {
        document.documentElement.dataset.preset = preset;
        localStorage.setItem("theme-preset", preset);
        return;
      }

      delete document.documentElement.dataset.preset;
      localStorage.removeItem("theme-preset");
    } catch {}
  }, [preset]);

  const contextValue = useMemo(() => ({ preset, setPreset }), [preset]);

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

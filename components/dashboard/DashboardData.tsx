"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { loadSaved, type SavedCv } from "../../lib/cv";

const DashboardData = createContext<{
  saved: SavedCv[] | null;
  query: string;
  setQuery: (query: string) => void;
} | null>(null);

export function DashboardDataProvider({ children }: { children: ReactNode }) {
  const path = usePathname();
  const [saved, setSaved] = useState<SavedCv[] | null>(null);
  const [query, setQuery] = useState("");
  useEffect(() => {
    const read = () => setSaved(loadSaved().reverse());
    read();
    window.addEventListener("storage", read);
    window.addEventListener("focus", read);
    return () => {
      window.removeEventListener("storage", read);
      window.removeEventListener("focus", read);
    };
  }, [path]);
  return (
    <DashboardData.Provider value={{ saved, query, setQuery }}>
      {children}
    </DashboardData.Provider>
  );
}

export function useDashboardData() {
  const value = useContext(DashboardData);
  if (!value) throw new Error("DashboardDataProvider is required");
  return value;
}

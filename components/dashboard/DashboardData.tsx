"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { useAccountId } from "./AccountContext";
import { loadSaved, type SavedCv } from "../../lib/cv";
import { syncSaved } from "../../lib/cv-sync";

const DashboardData = createContext<{
  saved: SavedCv[] | null;
  query: string;
  setQuery: (query: string) => void;
} | null>(null);

export function DashboardDataProvider({ children }: { children: ReactNode }) {
  const userId = useAccountId();
  const path = usePathname();
  const [saved, setSaved] = useState<SavedCv[] | null>(null);
  const [query, setQuery] = useState("");
  useEffect(() => {
    let active = true;
    const read = () => setSaved([...loadSaved(userId)].reverse());
    const load = () => {
      read();
      // Server adalah sumber utama; cache lokal dipakai bila jaringan bermasalah.
      void syncSaved(userId).then(list => {
        if (active && list) setSaved([...list].reverse());
      });
    };
    load();
    window.addEventListener("storage", read);
    window.addEventListener("focus", load);
    return () => {
      active = false;
      window.removeEventListener("storage", read);
      window.removeEventListener("focus", load);
    };
  }, [path, userId]);
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

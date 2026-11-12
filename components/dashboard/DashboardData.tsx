"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
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
  // Sinkron ke server paling banyak sekali per menit; fokus jendela beruntun
  // tidak menghasilkan request jaringan setiap kali.
  const lastSync = useRef(0);
  useEffect(() => {
    let active = true;
    const read = () => setSaved([...loadSaved(userId)].reverse());
    const sync = (force: boolean) => {
      read();
      if (!force && Date.now() - lastSync.current < 60_000) return;
      lastSync.current = Date.now();
      // Server adalah sumber utama; cache lokal dipakai bila jaringan bermasalah.
      void syncSaved(userId).then(list => {
        if (active && list) setSaved([...list].reverse());
      });
    };
    const load = () => sync(true);
    load();
    window.addEventListener("storage", read);
    const onFocus = () => sync(false);
    window.addEventListener("focus", onFocus);
    return () => {
      active = false;
      window.removeEventListener("storage", read);
      window.removeEventListener("focus", onFocus);
    };
  }, [path, userId]);
  const value = useMemo(() => ({ saved, query, setQuery }), [saved, query]);
  return (
    <DashboardData.Provider value={value}>
      {children}
    </DashboardData.Provider>
  );
}

export function useDashboardData() {
  const value = useContext(DashboardData);
  if (!value) throw new Error("DashboardDataProvider is required");
  return value;
}

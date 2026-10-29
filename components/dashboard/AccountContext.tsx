"use client";
import { setLanguageAccount } from "../i18n/LanguageProvider";
import { createContext, useContext, useEffect, type ReactNode } from "react";
const AccountContext = createContext<string | null>(null);
export function AccountProvider({ userId, children }: { userId: string; children: ReactNode }) {
  useEffect(() => { setLanguageAccount(userId); }, [userId]);
  return <AccountContext.Provider value={userId}>{children}</AccountContext.Provider>;
}
export function useAccountId() { return useContext(AccountContext); }

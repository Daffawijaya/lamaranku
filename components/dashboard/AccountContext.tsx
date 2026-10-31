"use client";
import { setLanguageAccount } from "../i18n/LanguageProvider";
import { createContext, useContext, useEffect, type ReactNode } from "react";
const AccountContext = createContext<string | null>(null);
const AccountPlusContext = createContext(false);
export function AccountProvider({ userId, plus = false, children }: { userId: string; plus?: boolean; children: ReactNode }) {
  useEffect(() => { setLanguageAccount(userId); }, [userId]);
  return <AccountContext.Provider value={userId}><AccountPlusContext.Provider value={plus}>{children}</AccountPlusContext.Provider></AccountContext.Provider>;
}
export function useAccountId() { return useContext(AccountContext); }
export function useAccountPlus() { return useContext(AccountPlusContext); }

"use client";
import { createContext, useContext, type ReactNode } from "react";
const AccountContext = createContext<string | null>(null);
export function AccountProvider({ userId, children }: { userId: string; children: ReactNode }) {
  return <AccountContext.Provider value={userId}>{children}</AccountContext.Provider>;
}
export function useAccountId() { return useContext(AccountContext); }

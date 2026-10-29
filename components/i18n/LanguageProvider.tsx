"use client";
import { Children, cloneElement, createContext, isValidElement, useContext, useEffect, useMemo, useState, type ReactElement, type ReactNode } from "react";
import { readDashboardPreferences } from "../../lib/dashboard-preferences";
import { resolveSettingsLanguage, settingsTranslator, type SettingsLanguage } from "../../lib/settings-language";
import { supabaseBrowser } from "../../lib/supabase/client";
const LanguageContext = createContext<SettingsLanguage>("id");
let activeLanguage: SettingsLanguage = "id";
let activeAccount: string | null = null;
export function setLanguageAccount(userId: string | null) {
  activeAccount = userId;
  window.dispatchEvent(new CustomEvent("lamaranku:account", { detail: userId }));
}
export const translateMessage = (text: string) => settingsTranslator(activeLanguage)(text);
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<SettingsLanguage>("id");
  useEffect(() => {
    let account: string | null = activeAccount;
    let disposed = false;
    const sync = () => {
      const next = resolveSettingsLanguage(readDashboardPreferences(account).language, navigator.language);
      activeLanguage = next; setLanguage(next); document.documentElement.lang = next;
    };
    const accountChanged = (event: Event) => { account = (event as CustomEvent<string | null>).detail; sync(); };
    window.addEventListener("lamaranku:account", accountChanged);
    sync();
    let unsubscribe = () => {};
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const client = supabaseBrowser();
      const { data } = client.auth.onAuthStateChange((_event, session) => {
        if (!disposed) { account = _event === "SIGNED_OUT" ? null : session?.user?.id ?? activeAccount; activeAccount = account; sync(); }
      });
      unsubscribe = () => data.subscription.unsubscribe();
    }
    window.addEventListener("lamaranku:preferences", sync);
    window.addEventListener("storage", sync);
    window.addEventListener("languagechange", sync);
    return () => { disposed = true; unsubscribe(); window.removeEventListener("lamaranku:account", accountChanged); window.removeEventListener("lamaranku:preferences", sync); window.removeEventListener("storage", sync); window.removeEventListener("languagechange", sync); };
  }, []);
  return <LanguageContext.Provider value={language}>{children}</LanguageContext.Provider>;
}
export function useAppLanguage() {
  const language = useContext(LanguageContext);
  return { language, t: useMemo(() => settingsTranslator(language), [language]) };
}
function translateNodes(node: ReactNode, t: (text: string) => string): ReactNode {
  if (typeof node === "string") {
    const trimmed = node.trim();
    return trimmed ? node.replace(trimmed, t(trimmed)) : node;
  }
  if (Array.isArray(node)) return Children.map(node, child => translateNodes(child, t));
  if (isValidElement<{ children?: ReactNode; "data-document-preview"?: boolean }>(node) && node.props.children && !node.props["data-document-preview"]) return cloneElement(node, {}, translateNodes(node.props.children, t));
  return node;
}
/** Only wrap application copy, never user-entered document content. */
export function T({ text, values }: { text: ReactNode; values?: readonly ReactNode[] }) {
  const { t } = useAppLanguage();
  if (typeof text === "string" && values) {
    const translated = t(text);
    return <>{translated.split(/(\{\d+\})/).map((part, index) => /^\{\d+\}$/.test(part) ? <span key={index}>{values[Number(part.slice(1, -1))]}</span> : part)}</>;
  }
  return <>{translateNodes(text, t)}</>;
}
/** Translate labels without changing event handlers, input values, identifiers or URLs. */
export function LocalizedAttributes({ children }: { children: ReactElement }) {
  const { t } = useAppLanguage();
  const props = children.props as Record<string, unknown>;
  const patch: Record<string, string> = {};
  for (const name of ["aria-label", "alt", "title", "placeholder", "label", "description"]) {
    if (typeof props[name] === "string") patch[name] = t(props[name] as string);
  }
  return cloneElement(children, patch);
}

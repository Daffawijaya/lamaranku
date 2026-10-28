import { readAccountValue } from "./account-storage";
export type DashboardPreferences = { confirmLogout: boolean; compact: boolean; reduceMotion: boolean };
export const DEFAULT_PREFERENCES: DashboardPreferences = { confirmLogout: false, compact: false, reduceMotion: false };
export function readDashboardPreferences(userId?: string | null): DashboardPreferences {
  const stored = readAccountValue("lamaranku_dashboard_preferences", userId) as Partial<DashboardPreferences> | null;
  return { confirmLogout: stored?.confirmLogout === true, compact: stored?.compact === true, reduceMotion: stored?.reduceMotion === true };
}

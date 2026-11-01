import { supabaseBrowser } from "./supabase/client";
import { isSavedCv, loadSaved, storeSaved, type CvData, type SavedCv } from "./cv";

// CV disimpan di akun (tabel public.saved_cvs). localStorage hanya cache supaya
// dashboard tetap tampil saat offline atau saat SQL belum dijalankan.
const TABLE = "saved_cvs";

type Row = { cv_id: string; judul: string; data: unknown; updated_at: string };

export function updatedLabel(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

function toSaved(rows: Row[]): SavedCv[] {
  return rows
    .map(row => ({
      id: row.cv_id,
      judul: row.judul,
      updatedAt: updatedLabel(row.updated_at),
      data: row.data as CvData,
    }))
    .filter(isSavedCv);
}

function cache(list: SavedCv[], userId?: string | null) {
  try { storeSaved(list, userId); } catch { /* cache penuh: data tetap aman di akun */ }
}

export async function pullSaved(userId?: string | null): Promise<SavedCv[] | null> {
  if (!userId) return null;
  try {
    const { data, error } = await supabaseBrowser()
      .from(TABLE)
      .select("cv_id,judul,data,updated_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: true })
      .order("cv_id", { ascending: true });
    if (error) return null;
    return toSaved((data ?? []) as Row[]);
  } catch {
    return null;
  }
}

/** true bila CV sudah tersimpan di akun. */
export async function pushSaved(entry: SavedCv, userId?: string | null): Promise<boolean> {
  if (!userId) return false;
  try {
    const { error } = await supabaseBrowser().from(TABLE).upsert(
      {
        user_id: userId,
        cv_id: entry.id,
        judul: entry.judul,
        data: entry.data,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,cv_id" },
    );
    return !error;
  } catch {
    return false;
  }
}

export async function removeSaved(cvId: string, userId?: string | null): Promise<boolean> {
  if (!userId) return false;
  try {
    const { error } = await supabaseBrowser().from(TABLE).delete().eq("user_id", userId).eq("cv_id", cvId);
    return !error;
  } catch {
    return false;
  }
}

// Unggah CV yang masih hanya ada di browser akun ini. Urutan dipertahankan lewat created_at.
async function uploadLocal(entries: SavedCv[], userId?: string | null): Promise<boolean> {
  if (!userId || !entries.length) return false;
  try {
    const now = Date.now();
    const rows = entries.map((entry, index) => ({
      user_id: userId,
      cv_id: entry.id,
      judul: entry.judul,
      data: entry.data,
      created_at: new Date(now + index).toISOString(),
      updated_at: new Date(now + index).toISOString(),
    }));
    const { error } = await supabaseBrowser().from(TABLE).upsert(rows, { onConflict: "user_id,cv_id" });
    return !error;
  } catch {
    return false;
  }
}

/**
 * Daftar CV akun: ambil dari server, perbarui cache, dan unggah data lama sekali
 * bila akun belum punya CV di server. null = server tidak terjangkau, pakai cache.
 */
export async function syncSaved(userId?: string | null): Promise<SavedCv[] | null> {
  const remote = await pullSaved(userId);
  if (remote === null) return null;
  if (remote.length) {
    cache(remote, userId);
    return remote;
  }
  const local = loadSaved(userId);
  if (!local.length) return [];
  await uploadLocal(local, userId);
  return local;
}

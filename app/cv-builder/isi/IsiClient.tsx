"use client";

import { T, LocalizedAttributes } from "../../../components/i18n/LanguageProvider";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAccountId } from "../../../components/dashboard/AccountContext";
import { readAccountValue, writeAccountValue } from "../../../lib/account-storage";
import { CvWorkspace } from "../../../components/cv/CvWorkspace";
import {
  emptyCv, isCvData, cloneCv, isPlus, loadSaved, newCvId, storeSaved,
  type CvData, type SavedCv,
} from "../../../lib/cv";
import { templateById } from "../../../data/templates";

// Authentication is enforced by the dashboard layout and middleware.
export default function IsiClient() {
  const userId = useAccountId();
  const params = useSearchParams();
  const selectedId = params.get("cv");
  const templateId = params.get("template");
  const [ready, setReady] = useState(false);
  const [cv, setCv] = useState<CvData>(emptyCv());
  const [plus, setPlus] = useState(false);
  const [saved, setSaved] = useState<SavedCv[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [judul, setJudul] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  const tpl = templateById(cv.templateId);
  const limitHabis = !plus && editingId === null && saved.length >= 2;

  useEffect(() => {
    const entries = loadSaved(userId);
    let selected = entries.find(entry => entry.id === selectedId);
    const initial = templateById(templateId ?? "harvard");
    setPlus(isPlus());
    setSaved(entries);
    const draft = readAccountValue("lamaranku_cv_draft", userId) as { cv?: unknown; title?: unknown; editingId?: unknown } | null;
    const restored = !selectedId && !templateId && draft && isCvData(draft.cv) ? draft : null;
    if (!selectedId && !templateId && !restored) selected = entries[entries.length - 1];
    setCv(selected ? cloneCv(selected.data) : restored ? cloneCv(restored.cv as CvData) : emptyCv(initial.id));
    setEditingId(selected?.id ?? (restored && typeof restored.editingId === "string" && entries.some(entry => entry.id === restored.editingId) ? restored.editingId : null));
    setJudul(selected?.judul ?? (restored && typeof restored.title === "string" ? restored.title : ""));
    setNotice(null);
    setReady(true);
  }, [selectedId, templateId, userId]);

  useEffect(() => {
    if (!ready) return;
    try { writeAccountValue("lamaranku_cv_draft", { cv, title: judul, editingId }, userId); }
    catch { setNotice("Draft belum tersimpan. Penyimpanan browser penuh atau diblokir."); }
  }, [cv, judul, editingId, ready, userId]);

  const simpan = () => {
    const entries = loadSaved(userId);
    const exists = entries.some(entry => entry.id === editingId);
    if (!plus && !exists && entries.length >= 2) {
      setSaved(entries);
      setNotice("Batas Basic habis: 2 CV tersimpan. Upgrade Plus untuk tanpa batas, atau hapus salah satu CV lama.");
      return;
    }
    const entry: SavedCv = {
      id: editingId ?? newCvId(),
      judul: judul.trim() || `${cv.nama || "CV"} - ${tpl.name}`,
      updatedAt: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
      data: cloneCv(cv),
    };
    const next = exists ? entries.map(item => item.id === entry.id ? entry : item) : [...entries, entry];
    try {
      storeSaved(next, userId);
      setSaved(next);
      setEditingId(entry.id);
      setNotice(`Tersimpan: ${entry.judul}. Total ${next.length} CV.`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "CV belum tersimpan.");
    }
  };

  const buka = (entry: SavedCv) => {
    setCv(cloneCv(entry.data));
    setEditingId(entry.id);
    setJudul(entry.judul);
    setNotice(null);
  };

  const hapus = (id: string) => {
    const next = loadSaved(userId).filter(entry => entry.id !== id);
    try {
      storeSaved(next, userId);
      setSaved(next);
      if (editingId === id) {
        setEditingId(null);
        setCv(emptyCv(cv.templateId));
        setJudul("");
      }
      setNotice("CV dihapus dari peramban ini.");
    } catch {
      setNotice("CV belum dihapus. Penyimpanan browser tidak dapat diperbarui.");
    }
  };

  const baru = () => {
    setCv(emptyCv(cv.templateId));
    setEditingId(null);
    setJudul("");
    setNotice(null);
  };

  if (!ready) return <p role="status" className="py-12 text-center text-sm text-zinc-500"><T text={"Memuat editor CV…"} /></p>;

  return (
    <LocalizedAttributes><CvWorkspace
      cv={cv}
      onChange={setCv}
      title={judul}
      onTitleChange={setJudul}
      plus={plus}
      saved={saved}
      editingId={editingId}
      notice={notice}
      limitReached={limitHabis}
      onSave={simpan}
      onNew={baru}
      onOpen={buka}
      onDelete={hapus}
    /></LocalizedAttributes>
  );
}

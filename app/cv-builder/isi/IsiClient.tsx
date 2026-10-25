"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CvWorkspace } from "../../../components/cv/CvWorkspace";
import {
  DEFAULT_CV, cloneCv, isPlus, loadSaved, newCvId, storeSaved,
  type CvData, type SavedCv,
} from "../../../lib/cv";
import { templateById } from "../../../data/templates";

// Authentication is enforced by the dashboard layout and middleware.
export default function IsiClient() {
  const params = useSearchParams();
  const selectedId = params.get("cv");
  const templateId = params.get("template");
  const [ready, setReady] = useState(false);
  const [cv, setCv] = useState<CvData>(DEFAULT_CV);
  const [plus, setPlus] = useState(false);
  const [saved, setSaved] = useState<SavedCv[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [judul, setJudul] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  const tpl = templateById(cv.templateId);
  const limitHabis = !plus && editingId === null && saved.length >= 2;

  useEffect(() => {
    const entries = loadSaved();
    const selected = entries.find(entry => entry.id === selectedId);
    const initial = templateById(templateId ?? DEFAULT_CV.templateId);
    setPlus(isPlus());
    setSaved(entries);
    setCv(selected ? cloneCv(selected.data) : { ...cloneCv(DEFAULT_CV), templateId: initial.id });
    setEditingId(selected?.id ?? null);
    setJudul(selected?.judul ?? `${DEFAULT_CV.nama} - ${initial.name}`);
    setNotice(null);
    setReady(true);
  }, [selectedId, templateId]);

  const simpan = () => {
    const entries = loadSaved();
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
      storeSaved(next);
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
    const next = loadSaved().filter(entry => entry.id !== id);
    try {
      storeSaved(next);
      setSaved(next);
      if (editingId === id) {
        setEditingId(null);
        setJudul("");
      }
      setNotice("CV dihapus dari peramban ini.");
    } catch {
      setNotice("CV belum dihapus. Penyimpanan browser tidak dapat diperbarui.");
    }
  };

  const baru = () => {
    setCv({ ...cloneCv(DEFAULT_CV), templateId: cv.templateId });
    setEditingId(null);
    setJudul("");
    setNotice(null);
  };

  if (!ready) return <p role="status" className="py-12 text-center text-sm text-zinc-500">Memuat editor CV…</p>;

  return (
    <CvWorkspace
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
    />
  );
}

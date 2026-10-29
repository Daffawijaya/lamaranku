"use client";
import { T, LocalizedAttributes } from "../i18n/LanguageProvider";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Camera, Check, Pencil, X } from "lucide-react";
import { supabaseBrowser } from "../../lib/supabase/client";
import { isPlus } from "../../lib/cv";
import { useAccountId } from "./AccountContext";
import "./profile.css";

type Props = { name: string; email: string; avatarUrl: string; username: string };
type EditableField = "name" | "username" | "email";
async function preparePhoto(file: File): Promise<string> {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) throw new Error("Pilih foto JPG, PNG, atau WebP.");
  if (file.size > 5 * 1024 * 1024) throw new Error("Ukuran foto maksimal 5 MB.");
  const bitmap = await createImageBitmap(file);
  try {
    const canvas = document.createElement("canvas"); canvas.width = 256; canvas.height = 256;
    const context = canvas.getContext("2d"); if (!context) throw new Error("Foto belum dapat diproses.");
    const side = Math.min(bitmap.width, bitmap.height);
    context.fillStyle = "#ffffff"; context.fillRect(0, 0, 256, 256);
    context.drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, 256, 256);
    const photo = canvas.toDataURL("image/jpeg", .78);
    if (photo.length > 60000) throw new Error("Foto terlalu detail. Coba gunakan foto yang lebih sederhana.");
    return photo;
  } finally { bitmap.close(); }
}

export function ProfileWorkspace({ name, email, avatarUrl, username }: Props) {
  const router = useRouter();
  const userId = useAccountId();
  const [editing, setEditing] = useState<EditableField | null>(null);
  const [draft, setDraft] = useState("");
  const [profileName, setProfileName] = useState(name);
  const [profileUsername, setProfileUsername] = useState(username);
  const [photo, setPhoto] = useState(avatarUrl);
  const [photoFailed, setPhotoFailed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [plus, setPlus] = useState(false);
  const photoInput = useRef<HTMLInputElement>(null);
  useEffect(() => { setProfileName(name); setProfileUsername(username); }, [name, username]);
  useEffect(() => { setPhoto(avatarUrl); setPhotoFailed(false); }, [avatarUrl]);
  useEffect(() => setPlus(isPlus()), []);

  function startEdit(field: EditableField) {
    setDraft(field === "name" ? profileName : field === "username" ? profileUsername : email);
    setEditing(field);
    setMessage("");
  }
  async function saveProfile(event: FormEvent) {
    event.preventDefault();
    if (!editing || busy) return;
    const value = draft.trim();
    if (!value) { setMessage("Kolom ini wajib diisi."); return; }
    setBusy(true); setMessage("");
    try {
      const update = editing === "email" ? { email: value } : { data: { [editing === "name" ? "full_name" : "username"]: value } };
      const { error } = await supabaseBrowser().auth.updateUser(update);
      if (error) throw error;
      if (editing === "name") setProfileName(value);
      if (editing === "username") setProfileUsername(value);
      setMessage(editing === "email" ? "Permintaan perubahan email dikirim. Ikuti tautan konfirmasi di emailmu sebelum email akun berubah." : "Profil berhasil disimpan.");
      setEditing(null); router.refresh();
    } catch { setMessage("Perubahan belum tersimpan. Silakan coba lagi."); }
    finally { setBusy(false); }
  }
  async function selectPhoto(file?: File) {
    if (!file) return; setBusy(true); setMessage("");
    try {
      const next = await preparePhoto(file);
      if (!userId) throw new Error("Silakan masuk kembali untuk mengganti foto.");
      const client = supabaseBrowser();
      const path = `${userId}/avatar.jpg`;
      const photoBlob = await (await fetch(next)).blob();
      const { error: uploadError } = await client.storage.from("profile-avatars").upload(path, photoBlob, { contentType: "image/jpeg", upsert: true, cacheControl: "0" });
      if (uploadError) throw new Error("Foto belum terunggah. Silakan coba lagi.");
      const { error } = await client.auth.updateUser({ data: { avatar_path: path } });
      if (error) throw new Error("Foto belum tersimpan. Silakan coba lagi.");
      setPhoto(next); setPhotoFailed(false); setMessage("Foto profil berhasil diperbarui."); router.refresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Foto belum dapat diproses."); }
    finally { setBusy(false); if (photoInput.current) photoInput.current.value = ""; }
  }

  const fields: { id: EditableField; label: string; value: string }[] = [
    { id: "name", label: "Name", value: profileName },
    { id: "username", label: "Username", value: profileUsername ? `@${profileUsername}` : "Belum diisi" },
    { id: "email", label: "Email", value: email },
  ];
  return <div className="profile-workspace">
    <div className="profile-page-content">
      <header className="profile-hero">
        <LocalizedAttributes><button className="profile-photo" disabled={busy} aria-label="Ganti foto profil" onClick={() => photoInput.current?.click()}>
          {photo && !photoFailed ? <LocalizedAttributes><img src={photo} alt="Foto profil" width={112} height={112} onError={() => setPhotoFailed(true)} /></LocalizedAttributes> : <span className="profile-initials">{(profileName || email).slice(0, 1).toUpperCase()}</span>}
          <span className="profile-photo-overlay"><Camera size={20} /><T text={"Ganti foto"} /></span>
        </button></LocalizedAttributes>
        <input ref={photoInput} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={event => void selectPhoto(event.target.files?.[0])} />
        <h1>{profileName || email.split("@")[0]}</h1>
        <p>@{profileUsername || email.split("@")[0]}</p>
      </header>
      <section className="profile-general" aria-labelledby="profile-general-heading">
        <h2 id="profile-general-heading"><T text={"General"} /></h2>
        <div className="profile-account-card">
          {fields.map(field => <div className="profile-account-row" key={field.id}>
            <span className="profile-account-label"><T text={field.label} /></span>
            {editing === field.id ? <form className="profile-inline-edit" onSubmit={event => void saveProfile(event)}>
              <LocalizedAttributes><input aria-label={field.label} value={draft} onChange={event => setDraft(event.target.value)} autoFocus required type={field.id === "email" ? "email" : "text"} maxLength={field.id === "username" ? 40 : field.id === "email" ? 254 : 100} pattern={field.id === "username" ? "[a-zA-Z0-9_.-]+" : undefined} autoComplete={field.id === "name" ? "name" : field.id} disabled={busy} /></LocalizedAttributes>
              <LocalizedAttributes><button type="submit" disabled={busy} aria-label={`Simpan ${field.label}`}><Check /></button></LocalizedAttributes>
              <LocalizedAttributes><button type="button" disabled={busy} aria-label="Batal mengubah profil" onClick={() => setEditing(null)}><X /></button></LocalizedAttributes>
            </form> : <div className="profile-account-value"><span>{field.value || <T text="Belum diisi" />}</span><LocalizedAttributes><button type="button" disabled={busy} aria-label={`Ubah ${field.label}`} onClick={() => startEdit(field.id)}><Pencil /></button></LocalizedAttributes></div>}
          </div>)}
          <div className="profile-account-row"><span className="profile-account-label"><T text={"Account Status"} /></span><span className="profile-account-status"><T text={plus ? "Plus" : "Basic"} /></span></div>
        </div>
        {message && <p className="profile-message" role="status"><T text={message} /></p>}
      </section>
    </div>
  </div>;
}

"use client";

import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { T, LocalizedAttributes } from "../i18n/LanguageProvider";
import { WA_NUMBER } from "../../data/features";
import { wa } from "../../lib/wa";
import { mountModal } from "../../lib/modal-motion";
import "./help-modal.css";

export const HELP_TOPICS = {
  guide: "Panduan penggunaan",
  faq: "Pertanyaan umum",
  report: "Laporkan masalah",
  feedback: "Kirim saran",
  contact: "Hubungi kami",
} as const;
export type HelpTopic = keyof typeof HELP_TOPICS;

export function HelpModal({ topic, route, themeStyle, darkMode, onClose }: {
  topic: HelpTopic; route: string; themeStyle?: CSSProperties; darkMode?: boolean; onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [message, setMessage] = useState("");
  const [notice, setNotice] = useState("");
  const contactReady = WA_NUMBER !== "6280000000000";
  const isForm = topic === "report" || topic === "feedback";
  const draft = `${HELP_TOPICS[topic]}\nHalaman: ${route}\n\n${message.trim()}`;
  useLayoutEffect(() => {
    if (dialog.current) return mountModal(dialog.current);
  }, []);
  async function copy() {
    try { await navigator.clipboard.writeText(draft); setNotice("Teks berhasil disalin."); }
    catch { setNotice("Teks belum bisa disalin. Silakan salin isi pesan secara manual."); }
  }
  return createPortal(<LocalizedAttributes><dialog ref={dialog} className="help-modal" style={themeStyle} data-theme-mode={darkMode ? "dark" : "light"} aria-labelledby="help-modal-title" onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => { if (event.target === event.currentTarget) {
    const rect = event.currentTarget.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onClose();
  } }}>
    <button type="button" className="help-modal-close" aria-label="Tutup bantuan" onClick={onClose} autoFocus><X size={18} /></button>
    <header><p className="help-modal-eyebrow"><T text="Bantuan Lamaranku" /></p><h2 id="help-modal-title"><T text={HELP_TOPICS[topic]} /></h2></header>
    <div className="help-modal-body">
      {topic === "guide" && <ol className="help-guide">
        <li><h3><T text="Buat CV" /></h3><p><T text="Pilih template, lengkapi data diri dan pengalaman, lalu unduh PDF." /></p></li>
        <li><h3><T text="Review CV" /></h3><p><T text="Unggah CV dan deskripsi lowongan untuk mendapat saran perbaikan." /></p></li>
        <li><h3><T text="Susun portofolio" /></h3><p><T text="Isi profil, tambahkan karya dan tautannya, lalu simpan atau unduh PDF." /></p></li>
        <li><h3><T text="Buat surat lamaran" /></h3><p><T text="Isi nama, perusahaan, dan posisi tujuan, lalu klik Buat surat." /></p></li>
      </ol>}
      {topic === "faq" && <div className="help-faq">
        <details name="help-faq" open><summary><T text="Di mana data saya disimpan?" /></summary><p><T text="Draft dan dokumen tersimpan di penyimpanan browser untuk akun yang digunakan. Simpan salinan PDF sebelum menghapus data browser atau berpindah perangkat." /></p></details>
        <details name="help-faq"><summary><T text="Apakah mengganti template menghapus isi CV?" /></summary><p><T text="Tidak. Mengganti template tetap mempertahankan data CV yang sudah kamu isi." /></p></details>
        <details name="help-faq"><summary><T text="Bagaimana cara mengunduh PDF?" /></summary><p><T text="Gunakan tombol unduh pada Pembuat CV atau Unduh PDF di portofolio. Jika dialog cetak muncul, pilih Simpan sebagai PDF." /></p></details>
        <details name="help-faq"><summary><T text="Bagaimana cara mengganti tema?" /></summary><p><T text="Buka menu Tampilan untuk berganti mode terang dan gelap, atau buka Pengaturan untuk menyesuaikan warna dan font." /></p></details>
      </div>}
      {isForm && <>
        <p><T text={topic === "report" ? "Ceritakan apa yang terjadi, langkah untuk mengulanginya, dan hasil yang kamu harapkan." : "Ceritakan ide atau perubahan yang akan membuat Lamaranku lebih nyaman digunakan."} /></p>
        <form onSubmit={event => { event.preventDefault(); void copy(); }}>
          <label htmlFor="help-message"><T text={topic === "report" ? "Detail masalah" : "Saran kamu"} /></label>
          <textarea id="help-message" rows={3} required maxLength={4000} value={message} onChange={event => setMessage(event.target.value)} />
          <p className="help-modal-caption"><T text="Halaman terkait:" /> {route}</p>
          <div className="help-modal-actions"><button type="submit" disabled={!message.trim()}><T text="Salin pesan" /></button>{contactReady && <a href={wa(draft)} target="_blank" rel="noopener noreferrer"><T text="Lanjut ke WhatsApp" /></a>}</div>
          {!contactReady && <p className="help-modal-caption"><T text="Kontak dukungan belum tersedia. Kamu dapat menyalin pesan ini untuk disimpan; pesan belum dikirim." /></p>}
        </form>
      </>}
      {topic === "contact" && <><h3><T text="Butuh bantuan lebih lanjut?" /></h3><p><T text="Jelaskan pertanyaanmu dan sebutkan halaman atau fitur yang sedang digunakan. Jangan sertakan password atau kode masuk akun." /></p>{contactReady ? <div className="help-modal-actions"><a href={wa("Halo Lamaranku, saya butuh bantuan terkait: ")} target="_blank" rel="noopener noreferrer"><T text="Hubungi lewat WhatsApp" /></a></div> : <p className="help-contact-status"><T text="Kontak dukungan belum tersedia. Untuk sementara, lihat Panduan penggunaan dan Pertanyaan umum di menu Bantuan." /></p>}</>}
      {notice && <p role="status" className="help-modal-caption"><T text={notice} /></p>}
    </div>
  </dialog></LocalizedAttributes>, document.body);
}

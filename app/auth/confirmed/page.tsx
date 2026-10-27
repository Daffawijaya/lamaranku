import { cookies } from "next/headers";
import Link from "next/link";
import { Check, Mail } from "lucide-react";

export const metadata = { title: "Konfirmasi email | Lamaranku", robots: { index: false, follow: false } };

export default async function EmailConfirmedPage() {
  const store = await cookies();
  const confirmed = store.get("email-confirmation-result")?.value === "success";
  return <main className="flex min-h-svh items-center justify-center bg-[#f6f8ff] px-5 py-12">
    <section className="w-full max-w-md rounded-3xl bg-white px-7 py-10 text-center shadow-[0_16px_64px_rgb(39_77_234_/_0.08)] sm:p-12">
      <span className={`mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl ${confirmed ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"}`}>
        {confirmed ? <Check size={30} /> : <Mail size={30} />}
      </span>
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900">{confirmed ? "Email berhasil dikonfirmasi" : "Tautan konfirmasi tidak berlaku"}</h1>
      <p className="mt-4 text-base leading-7 text-zinc-500">{confirmed ? "Akunmu sudah aktif. Kamu bisa kembali ke halaman pendaftaran yang tadi terbuka, atau masuk di perangkat ini." : "Tautan mungkin sudah digunakan atau kedaluwarsa. Jika sebelumnya sudah dikonfirmasi, langsung masuk dengan email dan password akunmu."}</p>
      <Link href="/masuk" className="mt-8 flex min-h-14 items-center justify-center rounded-full bg-[#3b63fb] px-6 font-semibold text-white hover:bg-[#274dea]">Kembali ke login</Link>
    </section>
  </main>;
}

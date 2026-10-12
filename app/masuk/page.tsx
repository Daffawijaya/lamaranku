import type { Metadata } from "next";
import LoginHero from "../../components/auth/LoginHero";
import { MasukForm } from "../../components/MasukForm";

export const metadata: Metadata = {
  title: "Masuk",
  description: "Masuk ke akun Lamaranku.",
};

export default function MasukPage() {
  return (
    <main className="min-h-screen bg-white font-sans text-slate-900 antialiased">
      <div className="grid min-h-screen lg:grid-cols-5">
        <div className="lg:col-span-2">
          <LoginHero />
        </div>

        <div className="lg:col-span-3">
          <MasukForm />
        </div>
      </div>
    </main>
  );
}

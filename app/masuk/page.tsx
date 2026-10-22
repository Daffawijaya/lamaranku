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
      <div className="grid min-h-screen lg:grid-cols-2">
        <div className="hidden lg:block">
          <LoginHero />
        </div>

        <div className="min-w-0">
          <MasukForm />
        </div>
      </div>
    </main>
  );
}

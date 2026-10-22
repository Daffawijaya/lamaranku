import type { Metadata } from "next";
import { MasukForm } from "../../components/MasukForm";
import "../../components/auth/bedim-reference.css";
export const metadata: Metadata = { title: "Masuk", description: "Masuk ke akun Lamaranku." };
export default function MasukPage() { return <main className="bedim-page"><MasukForm /></main>; }

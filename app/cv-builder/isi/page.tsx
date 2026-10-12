import type { Metadata } from "next";
import IsiClient from "./IsiClient";

export const metadata: Metadata = {
  title: "Isi CV",
  description: "Isi data CV sesuai template pilihan, lalu simpan dan unduh. Perlu masuk dulu.",
};

export default function IsiPage() {
  return <IsiClient />;
}

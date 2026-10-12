"use client";

import { FaTachometerAlt } from "react-icons/fa";
import { PageIntro } from "../jds/PageIntro";
import { SkorHasil, SkorUploadPill, useSkor } from "../SkorChecker";

export function SkorHero() {
  const s = useSkor();

  return (
    <>
      <section className="scroll-mt-28 bg-[#f5f5f5]">
        <div className="grid w-full lg:grid-cols-2">
          <div className="flex min-h-[560px] flex-col justify-center px-5 py-8 sm:px-4 lg:min-h-[calc(100svh-4rem)] lg:py-14 lg:pl-[max(1.5rem,calc((100vw-1310px)/2+1.5rem))] lg:pr-16">
            <PageIntro
              label="Cek Skor CV"
              icon={
                <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#001e36] text-[#31a8ff]">
                  <FaTachometerAlt className="h-6 w-6" />
                </span>
              }
              title="Seberapa siap CV-mu dibaca sistem?"
              description="Upload PDF, AI menilai kesiapan ATS dalam hitungan detik. Gratis, tanpa daftar."
              titleClassName="max-w-[480px]"
              descriptionClassName="max-w-[500px]"
            />
            <p className="mt-6 text-lg font-bold">Mulai dari PDF yang kamu punya.</p>
            <div className="mt-4">
              <SkorUploadPill s={s} />
            </div>
          </div>

          <div className="relative min-h-[520px] overflow-hidden bg-white lg:min-h-[calc(100svh-4rem)]" aria-hidden="true">
            <img
              src="https://images.pexels.com/photos/1424745/pexels-photo-1424745.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              loading="eager"
            />
          </div>
        </div>
      </section>

      {s.phase === "hasil" && (
        <section className="relative scroll-mt-24 bg-white pb-16 pt-14 lg:pb-24">
          <div className="mx-auto max-w-3xl px-5 sm:px-4 lg:px-6">
            <SkorHasil s={s} />
          </div>
        </section>
      )}
    </>
  );
}

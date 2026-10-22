import Image from "next/image";

export default function LoginHero() {
  return (
    <section className="relative hidden h-full min-h-screen lg:block">
      <div className="absolute inset-0 overflow-hidden">
        <Image
          src="/minimalist-resume-workspace-flat-lay.png"
          alt="Meja kerja minimalis untuk menyiapkan CV"
          fill
          priority
          unoptimized
          sizes="50vw"
          className="object-cover"
        />

      </div>
    </section>
  );
}

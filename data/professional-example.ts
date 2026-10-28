import { DEFAULT_CV, type CvData } from "../lib/cv";

// Gallery content is fictional; uploaded CVs never become public examples.
export const PROFESSIONAL_EXAMPLE: CvData = {
  ...DEFAULT_CV,
  templateId: "professional",
  nama: "Ridwan Pratama",
  posisi: "FULLSTACK DEVELOPER | IT & DIGITALIZATION SPECIALIST",
  website: "ridwan.example.com",
  ringkasan: "Full-Stack Web Developer and IT Specialist with experience in application development, database management, and digitalization. Experienced in building information systems, REST APIs, and responsive interfaces to support organizational and business needs.",
  pengalaman: [
    { perusahaan: "PT NUSANTARA DIGITAL", jabatan: "IT & Digitalization Specialist", periode: "2024 - Present", deskripsi: "Built a web-based catalog to organize business profiles and promote local products.\nDeveloped authentication, reporting, search, and administrative features.\nPerformed system maintenance and troubleshooting to support daily operations." },
    { perusahaan: "INOVASI TEKNOLOGI INDONESIA", jabatan: "Frontend Developer", periode: "2022 - 2024", deskripsi: "Developed responsive interfaces for an internal information system.\nIntegrated frontend features with backend APIs and supported testing.\nCollaborated with the team to improve accessibility and usability." },
  ],
  pendidikan: [
    { sekolah: "UNIVERSITAS NUSANTARA", gelar: "Informatics Engineering | GPA: 3.80/4.00", tahun: "2019 - 2023" },
    { sekolah: "SMA NEGERI 1 MALANG", gelar: "Natural Sciences", tahun: "2016 - 2019" },
  ],
  proyek: [{ nama: "BUSINESS CATALOG PLATFORM", peran: "Full-Stack Developer | Next.js, React, TypeScript, PostgreSQL", periode: "2025", deskripsi: "Developed business profiles, product catalogs, and search features.\nBuilt frontend, backend, authentication, database, and deployment." }],
  keahlian: "Programming Languages: JavaScript, TypeScript, PHP, HTML5, CSS3\nFrontend Development: Next.js, React.js, Vue.js, Tailwind CSS\nBackend Development: Laravel, Node.js, REST API\nDatabase & Cloud: PostgreSQL, Supabase, SQL\nTools & Platforms: Git, GitHub, Vercel",
  softSkills: "Problem Solving\nAnalytical Thinking\nCommunication\nTeamwork\nAdaptability\nTime Management\nAttention to Detail\nInitiative",
  sertifikasi: [{ nama: "Cloud Computing Fundamentals", penerbit: "Learning Academy", tahun: "2024" }],
};

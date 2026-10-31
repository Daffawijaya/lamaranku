import { ArrowDown, ArrowUpRight, MapPin, Sparkles } from "lucide-react";
import {
  portfolioImageUrl,
  safePortfolioUrl,
  type WebPortfolio,
} from "../../lib/portfolio";
import "./portfolio-website.css";

export function PortfolioWebsite({
  data,
  demo = false,
}: {
  data: WebPortfolio;
  demo?: boolean;
}) {
  const skills = data.skills;
  const website = safePortfolioUrl(data.website);
  const avatar = portfolioImageUrl(data.avatar);
  return (
    <div className={`pw pw-${data.template}`} data-document-preview>
      <div className="pw-container">
        <nav className="pw-nav" aria-label="Navigasi portofolio">
          <a className="pw-brand" href="#home">
            <Sparkles size={18} /> {data.name || "Namamu"}
            <span>®</span>
          </a>
          <div>
            <a href="#work">Karya</a>
            <a href="#about">Tentang</a>
            <a href="#contact" className="pw-nav-contact">
              Mari bicara <ArrowUpRight size={14} />
            </a>
          </div>
        </nav>
        <main id="home">
          <section className="pw-hero" aria-label="Profil">
            <div className="pw-hero-copy">
              <span className="pw-eyebrow">
                {data.available ? (
                  <>
                    <i /> Terbuka untuk kolaborasi
                  </>
                ) : (
                  data.role || "Portofolio pilihan"
                )}
              </span>
              <p className="pw-intro">
                Halo, saya {data.name || "Namamu"} <span>↗</span>
              </p>
              <h1>
                {data.headline || data.role || "Ceritakan ide besarmu di sini."}
              </h1>
              <p className="pw-role">{data.role || "Peran & spesialisasimu"}</p>
              <a href="#work" className="pw-hero-link">
                Jelajahi karya <ArrowDown size={16} />
              </a>
            </div>
            <div className={`pw-portrait${avatar ? " has-image" : ""}`}>
              {avatar ? (
                <img
                  src={avatar}
                  alt={`Potret ${data.name}`}
                  width={600}
                  height={720}
                />
              ) : (
                <div className="pw-portrait-art" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                  <b>{(data.name || "A").slice(0, 1)}</b>
                  <small>THINK. CREATE. REPEAT.</small>
                </div>
              )}
              {data.location && (
                <span className="pw-location">
                  <MapPin size={13} />
                  {data.location}
                </span>
              )}
            </div>
          </section>
          <section id="about" className="pw-about" aria-label="Tentang saya">
            <div>
              <span className="pw-section-label">01 / Tentang saya</span>
              <h2>
                Di balik setiap karya,
                <br />
                ada sebuah cerita.
              </h2>
            </div>
            <div>
              <p>
                {data.bio ||
                  "Tambahkan cerita singkat tentang dirimu, pendekatan kerja, dan hal yang ingin kamu ciptakan."}
              </p>
              {skills.length > 0 && (
                <ul className="pw-skills">
                  {skills.map((skill) => (
                    <li key={skill}>{skill}</li>
                  ))}
                </ul>
              )}
            </div>
          </section>
          <section
            id="work"
            className="pw-work"
            aria-labelledby="pw-work-title"
          >
            <header>
              <div>
                <span className="pw-section-label">02 / Karya pilihan</span>
                <h2 id="pw-work-title">
                  Selected work
                  <span>
                    {" "}
                    ({String(data.projects.length).padStart(2, "0")})
                  </span>
                </h2>
              </div>
              <span className="pw-work-note">
                Dibuat dengan ide. Diselesaikan dengan hati.
              </span>
            </header>
            <div className="pw-projects">
              {data.projects.map((project, i) => {
                const image = portfolioImageUrl(project.image);
                const href = safePortfolioUrl(project.url);
                const visual = (
                  <>
                    {image ? (
                      <img
                        src={image}
                        alt={project.title || "Gambar karya"}
                        width={1200}
                        height={850}
                        loading="lazy"
                      />
                    ) : (
                      <div
                        className={`pw-project-art pw-art-${i % 3}`}
                        aria-hidden="true"
                      >
                        <span />
                        <b>{["forma.", "Objects", "Make room."][i % 3]}</b>
                        <small>
                          {demo
                            ? "CONTOH VISUAL"
                            : "PROJECT " + String(i + 1).padStart(2, "0")}
                        </small>
                      </div>
                    )}
                    <span className="pw-project-arrow">
                      <ArrowUpRight size={20} />
                    </span>
                  </>
                );
                return (
                  <article key={project.id} className="pw-project">
                    {href ? (
                      <a
                        className="pw-project-image"
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Buka karya ${project.title}`}
                      >
                        {visual}
                      </a>
                    ) : (
                      <div className="pw-project-image">{visual}</div>
                    )}
                    <div className="pw-project-meta">
                      <h3>{project.title || "Judul karya"}</h3>
                      <span>{project.category || `Karya ${i + 1}`}</span>
                    </div>
                    {project.description && <p>{project.description}</p>}
                  </article>
                );
              })}
            </div>
            {!data.projects.length && (
              <p className="pw-empty">Karya berikutnya sedang disiapkan.</p>
            )}
          </section>
          <section id="contact" className="pw-contact">
            <span className="pw-section-label">03 / Selanjutnya?</span>
            <h2>
              Mari buat sesuatu
              <br />
              <em>yang berarti.</em>
            </h2>
            <div>
              {data.email && (
                <a href={`mailto:${data.email}`} className="pw-contact-button">
                  {data.email} <ArrowUpRight size={20} />
                </a>
              )}
              {website && (
                <a href={website} target="_blank" rel="noopener noreferrer">
                  Temukan saya <ArrowUpRight size={16} />
                </a>
              )}
              {!data.email && !website && <p>Kontak akan segera tersedia.</p>}
            </div>
          </section>
        </main>
        <footer className="pw-footer">
          <span>
            © {new Date().getFullYear()} {data.name || "Namamu"}
          </span>
          <a href="/portfolio" target="_blank" rel="noopener noreferrer">
            Made with Lamaranku ↗
          </a>
        </footer>
      </div>
    </div>
  );
}

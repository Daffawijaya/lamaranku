import {
  ArrowDown,
  ArrowUpRight,
  Download,
  Mail,
  MapPin,
  Sparkles,
} from "lucide-react";
import {
  portfolioImageUrl,
  safePortfolioUrl,
  socialLinkUrl,
  SOCIAL_NETWORKS,
  type WebPortfolio,
} from "../../lib/portfolio";
import "./vivid-theme.css";

// Label pendek di tombol bulat "Find me on" saat platform sosial media dipakai.
const SOCIAL_BADGE: Record<string, string> = {
  instagram: "Ig",
  linkedin: "in",
  x: "X",
  tiktok: "Tt",
  github: "Gh",
  behance: "Be",
  dribbble: "Dr",
  youtube: "Yt",
};

export function VividPortfolio({ data }: { data: WebPortfolio }) {
  const name = data.name.trim() || "Namamu";
  const role = data.role.trim() || "Visual Designer";
  const heading =
    data.headline.trim() ||
    [role, data.location.trim() ? `Based in ${data.location.trim()}` : ""]
      .filter(Boolean)
      .join("\n");
  const avatar = portfolioImageUrl(data.avatar);
  const website = safePortfolioUrl(data.website);
  const email = data.email.trim();
  const socials = (data.socials ?? []).flatMap((social) => {
    const label = SOCIAL_NETWORKS.find(
      (entry) => entry.id === social.network,
    )?.label;
    const href = socialLinkUrl(social.network, social.url);
    return label && href
      ? [
          {
            id: social.id,
            label,
            href,
            badge: SOCIAL_BADGE[social.network] ?? label.slice(0, 2),
          },
        ]
      : [];
  });
  const contactHref = email ? `mailto:${email}` : "#contact";
  const marquee = (data.skills.length
    ? data.skills.slice(0, 8)
    : ["Web Design", "Mobile App Design", "Brand Identity", "Visual Design"]
  )
    .slice(0, 8)
    .map((item) => item.toUpperCase());

  return (
    <div className="pw pw-vivid" data-document-preview>
      <div className="pv-page">
        <header className="pv-nav">
          <a className="pv-brand" href="#home">
            <span className="pv-logo" aria-hidden="true">
              <svg viewBox="0 0 20 20" width="13" height="13" fill="none">
                <path
                  d="M4 10.6 8 14.5 16 5.5"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span>{name.split(" ")[0]}</span>
          </a>
          <nav className="pv-links" aria-label="Navigasi portofolio">
            <a href="#home">Home</a>
            <a href="#about">About</a>
            <a href="#work">Works</a>
            <a href="#contact">Contact</a>
          </nav>
        </header>

        <main id="home">
          <section className="pv-hero" aria-label="Perkenalan">
            <div className="pv-copy">
              <span className="pv-badge">
                <i aria-hidden="true" />
                Hi everyone, I am {name}
              </span>
              <h1>
                {heading.split("\n").map((line, index) => (
                  <span key={`${line}-${index}`}>{line}</span>
                ))}
              </h1>
              <p className="pv-intro">
                {data.bio.trim() ||
                  "Saya merancang pengalaman visual yang tidak hanya memenuhi kebutuhan, tetapi juga terasa menyenangkan dan mudah diingat."}
              </p>
              <div className="pv-actions">
                <a className="pv-button" href={contactHref}>
                  {email ? "Get In Touch" : "Kirim pesan"}
                  <ArrowUpRight size={15} aria-hidden="true" />
                </a>
                <a
                  className="pv-download"
                  href={website ?? "#work"}
                  {...(website
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                >
                  {website ? "Kunjungi Website" : "Lihat Karya"}
                  {website ? (
                    <ArrowUpRight size={14} aria-hidden="true" />
                  ) : (
                    <Download size={14} aria-hidden="true" />
                  )}
                </a>
              </div>
              <div className="pv-find">
                <span>Find me on:</span>
                <ul aria-label="Media sosial">
                  {socials.length > 0 ? (
                    socials.map((social) => (
                      <li key={social.id}>
                        <a
                          href={social.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={social.label}
                          title={social.label}
                        >
                          {social.badge}
                        </a>
                      </li>
                    ))
                  ) : (
                    <li>
                      <a
                        href={contactHref}
                        aria-label="Email"
                        title="Email"
                      >
                        <Mail size={13} aria-hidden="true" />
                      </a>
                    </li>
                  )}
                </ul>
              </div>
            </div>

            <div className="pv-visual">
              <span className="pv-scribble" aria-hidden="true">
                <svg viewBox="0 0 60 24" width="52" height="21" fill="none">
                  <path
                    d="M2 20 10 6l9 13L28 6l9 13L46 6l12 14"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span className="pv-frame" aria-hidden="true" />
              <figure className={`pv-photo${avatar ? " has-image" : ""}`}>
                {avatar ? (
                  <img
                    src={avatar}
                    alt={`Potret ${name}`}
                    width={520}
                    height={640}
                  />
                ) : (
                  <div className="pv-photo-empty" aria-hidden="true">
                    <span>{name.slice(0, 1).toUpperCase()}</span>
                    <small>Add a portrait</small>
                  </div>
                )}
              </figure>
              <a className="pv-scroll" href="#about" aria-label="Gulir ke tentang">
                <ArrowDown size={16} aria-hidden="true" />
              </a>
              <span className="pv-blob" aria-hidden="true" />
              <span className="pv-streak" aria-hidden="true" />
            </div>
          </section>

          <div className="pv-marquee" aria-hidden="true">
            <div className="pv-marquee-track">
              {[...marquee, ...marquee].map((item, index) => (
                <span key={`${item}-${index}`} className="pv-marquee-item">
                  {item}
                  <i>
                    <Sparkles size={12} />
                  </i>
                </span>
              ))}
            </div>
          </div>

          <section id="about" className="pv-section pv-about">
            <div>
              <span className="pv-label">01 / About</span>
              <h2>
                {data.available ? "Open for collaboration" : "About my work"}
              </h2>
              <p className="pv-about-copy">
                {data.bio.trim() ||
                  "Ceritakan pendekatan kerjamu, nilai yang kamu pegang, dan hal yang ingin kamu ciptakan bersama klien atau tim."}
              </p>
              <div className="pv-meta">
                {data.location.trim() && (
                  <span>
                    <MapPin size={13} aria-hidden="true" />
                    {data.location.trim()}
                  </span>
                )}
                <span>
                  <i aria-hidden="true" />
                  {data.available ? "Available for work" : "By invitation"}
                </span>
              </div>
            </div>
            <div>
              <span className="pv-label">Skills</span>
              {data.skills.length > 0 ? (
                <ul className="pv-skills">
                  {data.skills.map((skill, index) => (
                    <li key={skill}>
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      {skill}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="pv-empty">Keahlian belum ditambahkan.</p>
              )}
            </div>
          </section>

          <section id="work" className="pv-section pv-work">
            <header className="pv-work-head">
              <div>
                <span className="pv-label">02 / Selected work</span>
                <h2>Recent projects</h2>
              </div>
              <span className="pv-work-count">
                ({String(data.projects.length).padStart(2, "0")})
              </span>
            </header>
            <div className="pv-projects">
              {data.projects.map((project, index) => {
                const image = portfolioImageUrl(project.image);
                const href = safePortfolioUrl(project.url);
                const media = image ? (
                  <img
                    src={image}
                    alt={project.title || "Gambar karya"}
                    width={900}
                    height={680}
                    loading="lazy"
                  />
                ) : (
                  <div
                    className={`pv-project-art pv-art-${index % 3}`}
                    aria-hidden="true"
                  >
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <b>{project.title || "New project"}</b>
                  </div>
                );
                return (
                  <article className="pv-card" key={project.id}>
                    {href ? (
                      <a
                        className="pv-card-media"
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Buka karya ${project.title}`}
                      >
                        {media}
                      </a>
                    ) : (
                      <div className="pv-card-media">{media}</div>
                    )}
                    <div className="pv-card-body">
                      <div>
                        <h3>{project.title || "Judul karya"}</h3>
                        <span>{project.category || `Project ${index + 1}`}</span>
                      </div>
                      {project.description && <p>{project.description}</p>}
                    </div>
                  </article>
                );
              })}
            </div>
            {!data.projects.length && (
              <p className="pv-empty">Karya berikutnya sedang disiapkan.</p>
            )}
          </section>

          <section id="contact" className="pv-contact">
            <div className="pv-contact-copy">
              <span className="pv-label">03 / Contact</span>
              <h2>
                Let&apos;s build
                <br />
                something bold.
              </h2>
            </div>
            <div className="pv-contact-links">
              {email && (
                <a href={`mailto:${email}`} className="pv-contact-mail">
                  <Mail size={16} aria-hidden="true" />
                  {email}
                  <ArrowUpRight size={16} aria-hidden="true" />
                </a>
              )}
              {website && (
                <a href={website} target="_blank" rel="noopener noreferrer">
                  {website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                  <ArrowUpRight size={16} aria-hidden="true" />
                </a>
              )}
              {socials.map((social) => (
                <a
                  key={social.id}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {social.label}
                  <ArrowUpRight size={16} aria-hidden="true" />
                </a>
              ))}
              {!email && !website && !socials.length && (
                <p className="pv-empty">Kontak akan segera tersedia.</p>
              )}
            </div>
          </section>
        </main>

        <footer className="pv-footer">
          <span>
            © {new Date().getFullYear()} {name}
          </span>
          <span>{role}</span>
          <a href="/portfolio" target="_blank" rel="noopener noreferrer">
            Made with Lamaranku ↗
          </a>
        </footer>
      </div>
    </div>
  );
}

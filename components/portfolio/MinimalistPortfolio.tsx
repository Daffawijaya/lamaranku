import {
  ArrowUpRight,
  Globe2,
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
import "./minimalist-theme.css";

export function MinimalistPortfolio({ data }: { data: WebPortfolio }) {
  const name = data.name.trim() || "Namamu";
  const role = data.role.trim() || "Product Designer";
  const headline =
    data.headline.trim() ||
    "Building digital products, brands, and experience.";
  const bio = data.bio.trim();
  const location = data.location.trim();
  const avatar = portfolioImageUrl(data.avatar);
  const website = safePortfolioUrl(data.website);
  const websiteLabel = website
    ?.replace(/^https?:\/\//, "")
    .replace(/\/$/, "");
  const email = data.email.trim();
  const socials = (data.socials ?? []).flatMap((social) => {
    const label = SOCIAL_NETWORKS.find(
      (entry) => entry.id === social.network,
    )?.label;
    const href = socialLinkUrl(social.network, social.url);
    return label && href ? [{ id: social.id, label, href }] : [];
  });
  const contactHref = email ? `mailto:${email}` : "#contact";

  return (
    <div className="pw pw-minimalist" data-document-preview>
      <div className="mp-page">
        <header className="mp-topbar">
          <a className="mp-brand" href="#home">
            <Sparkles size={15} /> {name.split(" ")[0]}
          </a>
          <nav className="mp-nav" aria-label="Navigasi portofolio">
            <a href="#home">Home</a>
            <a href="#work">Work</a>
            <a href="#about">About</a>
            <a href="#contact">Contact</a>
          </nav>
        </header>

        <main id="home">
          {/* Hero */}
          <section className="mp-hero" aria-label="Perkenalan">
            <div className="mp-hero-inner">
              {avatar ? (
                <figure className="mp-portrait">
                  <img
                    src={avatar}
                    alt={`Potret ${name}`}
                    width={400}
                    height={400}
                  />
                </figure>
              ) : (
                <div className="mp-portrait mp-portrait-empty">
                  <span>{name.slice(0, 1).toUpperCase()}</span>
                </div>
              )}
              <span className="mp-eyebrow">{role}</span>
              <h1 className="mp-headline">{headline}</h1>
              <div className="mp-hero-meta">
                {location && (
                  <span className="mp-meta-item">
                    <MapPin size={13} aria-hidden="true" />
                    {location}
                  </span>
                )}
                <span className="mp-meta-item">
                  <i
                    className={data.available ? "is-on" : "is-off"}
                    aria-hidden="true"
                  />
                  {data.available ? "Available for work" : "By invitation"}
                </span>
              </div>
              <a href={contactHref} className="mp-button">
                Contact me
                <ArrowUpRight size={13} />
              </a>
            </div>
          </section>

          {/* Selected work */}
          <section id="work" className="mp-work" aria-label="Karya pilihan">
            <div className="mp-work-inner">
              <div className="mp-section-head">
                <div>
                  <span className="mp-label">01 / Selected work</span>
                  <h2>Recent projects</h2>
                </div>
                <span className="mp-count">
                  {String(data.projects.length).padStart(2, "0")}
                </span>
              </div>
              <div className="mp-projects">
                {data.projects.map((project, index) => {
                  const image = portfolioImageUrl(project.image);
                  const href = safePortfolioUrl(project.url);
                  const media = (
                    <>
                      {image ? (
                        <img
                          src={image}
                          alt={project.title || "Gambar karya"}
                          width={1200}
                          height={800}
                          loading="lazy"
                        />
                      ) : (
                        <div
                          className="mp-project-placeholder"
                          aria-hidden="true"
                        >
                          <span>{String(index + 1).padStart(2, "0")}</span>
                          <small>Project visual</small>
                        </div>
                      )}
                      <span className="mp-project-arrow">
                        <ArrowUpRight size={16} />
                      </span>
                    </>
                  );
                  return (
                    <article key={project.id} className="mp-project">
                      {href ? (
                        <a
                          className="mp-project-media"
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Buka karya ${project.title}`}
                        >
                          {media}
                        </a>
                      ) : (
                        <div className="mp-project-media">{media}</div>
                      )}
                      <div className="mp-project-body">
                        <div className="mp-project-top">
                          <h3>{project.title || `Project ${index + 1}`}</h3>
                          <span>
                            {project.category || `Karya ${index + 1}`}
                          </span>
                        </div>
                        {project.description && <p>{project.description}</p>}
                      </div>
                    </article>
                  );
                })}
              </div>
              {!data.projects.length && (
                <p className="mp-empty">Karya berikutnya sedang disiapkan.</p>
              )}
            </div>
          </section>

          {/* About + skills */}
          <section id="about" className="mp-about" aria-label="Tentang saya">
            <div className="mp-about-inner">
              <span className="mp-label">02 / About</span>
              <h2 className="mp-about-title">About my work</h2>
              <p className="mp-about-copy">
                {bio ||
                  "Tambahkan cerita singkat tentang dirimu, pendekatan kerja, dan hal yang ingin kamu ciptakan."}
              </p>
              {data.skills.length > 0 && (
                <div className="mp-skills">
                  <span className="mp-label">Expertise</span>
                  <ul>
                    {data.skills.map((skill, index) => (
                      <li key={skill}>
                        <span>{String(index + 1).padStart(2, "0")}</span>
                        {skill}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>

          {/* CTA */}
          <section id="contact" className="mp-contact" aria-label="Kontak">
            <div className="mp-contact-inner">
              <span className="mp-label">03 / Contact</span>
              <h2 className="mp-contact-title">
                Tell me about your <br />
                <span>next project.</span>
              </h2>
              <div className="mp-contact-links">
                <a href={contactHref} className="mp-button">
                  Contact me
                  <ArrowUpRight size={13} />
                </a>
                {email && (
                  <a
                    href={`mailto:${email}`}
                    className="mp-contact-mail"
                    aria-label="Kirim email"
                  >
                    <Mail size={14} /> {email}
                  </a>
                )}
                {website && (
                  <a
                    href={website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mp-contact-mail"
                    aria-label="Kunjungi website"
                  >
                    <Globe2 size={14} /> {websiteLabel}
                  </a>
                )}
                {socials.length > 0 && (
                  <ul className="mp-socials" aria-label="Media sosial">
                    {socials.map((social) => (
                      <li key={social.id}>
                        <a
                          href={social.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mp-social-link"
                          aria-label={social.label}
                        >
                          {social.label}
                          <ArrowUpRight size={12} />
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
                {!email && !website && !socials.length && (
                  <p className="mp-empty">Kontak akan segera tersedia.</p>
                )}
              </div>
            </div>
          </section>
        </main>

        <footer className="mp-footer">
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

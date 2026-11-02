import { ArrowDown, ArrowUpRight, Globe2, Mail, MapPin } from "lucide-react";
import {
  portfolioImageUrl,
  safePortfolioUrl,
  socialLinkUrl,
  SOCIAL_NETWORKS,
  type WebPortfolio,
} from "../../lib/portfolio";

export function MonoPortfolio({ data }: { data: WebPortfolio }) {
  const name = data.name.trim() || "Namamu";
  const role = data.role.trim() || "Creative Portfolio";
  const roleParts = role
    .split(/\s*(?:&|\/|•|\||\n)\s*|,\s*/)
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 2);
  const avatar = portfolioImageUrl(data.avatar);
  const website = safePortfolioUrl(data.website);
  const websiteLabel = website
    ?.replace(/^https?:\/\//, "")
    .replace(/\/$/, "");
  const socials = (data.socials ?? []).flatMap((social) => {
    const label = SOCIAL_NETWORKS.find(
      (entry) => entry.id === social.network,
    )?.label;
    const href = socialLinkUrl(social.network, social.url);
    return label && href ? [{ id: social.id, label, href }] : [];
  });

  return (
    <div className="pw pw-mono" data-document-preview>
      <div className="pm-page">
        <header className="pm-topbar">
          <a className="pm-credit" href="#home">
            <span>©</span>
            <span className="pm-credit-name">{name}</span>
            {roleParts[0] && (
              <span className="pm-credit-role">{roleParts[0]}</span>
            )}
          </a>
          <nav aria-label="Navigasi portofolio">
            <a href="#about">About</a>
            <a href="#work">Projects</a>
            <a href="#contact">Contact</a>
          </nav>
        </header>

        <main>
          <section
            id="home"
            className="pm-hero"
            aria-label={`Portofolio ${name}`}
          >
            {avatar ? (
              <h1 className="pm-name pm-name-blend">{name}</h1>
            ) : (
              <h1 className="pm-name">{name}</h1>
            )}

            <div className="pm-portrait-wrap" aria-hidden={!avatar}>
              {avatar ? (
                <img
                  className="pm-portrait"
                  src={avatar}
                  alt={`Potret ${name}`}
                  width={900}
                  height={1200}
                />
              ) : (
                <div className="pm-portrait-placeholder">
                  <span>{name.slice(0, 1)}</span>
                  <small>Upload portrait</small>
                </div>
              )}
            </div>

            {avatar ? (
              <p className="pm-role pm-role-blend">
                {roleParts.map((part, index) => (
                  <span key={`${part}-${index}-blend`}>{part}</span>
                ))}
              </p>
            ) : (
              <p className="pm-role">
                {roleParts.map((part, index) => (
                  <span key={`${part}-${index}`}>{part}</span>
                ))}
              </p>
            )}

            <div className="pm-socials" aria-label="Kontak cepat">
              {website && (
                <a
                  href={website}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Website"
                  title="Website"
                >
                  <Globe2 size={16} />
                </a>
              )}
              {data.email && (
                <a
                  href={`mailto:${data.email}`}
                  aria-label={`Email ${data.email}`}
                  title="Email"
                >
                  <Mail size={16} />
                </a>
              )}
              <a href="#contact" aria-label="Kontak" title="Contact">
                <ArrowDown size={16} />
              </a>
            </div>
          </section>

          <section id="about" className="pm-section pm-about">
            <div className="pm-section-bar">
              <span>01 / About</span>
              <span>{data.location || "Portfolio & art direction"}</span>
            </div>
            <div className="pm-about-grid">
              <h2>
                {data.headline || (
                  <>
                    Designing with purpose.
                    <br />
                    Building with clarity.
                  </>
                )}
              </h2>
              <div className="pm-about-copy">
                <p>
                  {data.bio ||
                    "Tambahkan cerita singkat tentang dirimu, pendekatan kerja, dan hal yang ingin kamu ciptakan."}
                </p>
                {data.available && (
                  <span className="pm-availability">
                    <i /> Available for select projects
                  </span>
                )}
                {data.skills.length > 0 && (
                  <div className="pm-skills">
                    <span>Expertise</span>
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
                {data.location && (
                  <span className="pm-location">
                    <MapPin size={13} /> {data.location}
                  </span>
                )}
              </div>
            </div>
          </section>

          <section
            id="work"
            className="pm-section pm-work"
            aria-labelledby="pm-work-title"
          >
            <div className="pm-section-bar">
              <span>02 / Projects</span>
              <span>
                {String(data.projects.length).padStart(2, "0")} selected works
              </span>
            </div>
            <h2 id="pm-work-title" className="pm-work-title">
              Selected work
            </h2>
            <div className="pm-projects">
              {data.projects.map((project, index) => {
                const image = portfolioImageUrl(project.image);
                const href = safePortfolioUrl(project.url);
                const media = (
                  <>
                    {image ? (
                      <img
                        src={image}
                        alt={project.title || "Gambar karya"}
                        width={1400}
                        height={900}
                        loading="lazy"
                      />
                    ) : (
                      <div className="pm-project-placeholder">
                        <span>{String(index + 1).padStart(2, "0")}</span>
                        <small>Project visual</small>
                      </div>
                    )}
                    <span className="pm-project-arrow">
                      <ArrowUpRight size={18} />
                    </span>
                  </>
                );
                return (
                  <article key={project.id} className="pm-project">
                    {href ? (
                      <a
                        className="pm-project-media"
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Buka karya ${project.title}`}
                      >
                        {media}
                      </a>
                    ) : (
                      <div className="pm-project-media">{media}</div>
                    )}
                    <div className="pm-project-caption">
                      <span className="pm-project-number">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <h3>{project.title || "Untitled project"}</h3>
                      <span className="pm-project-category">
                        {project.category || "Selected work"}
                      </span>
                    </div>
                    {project.description && (
                      <p className="pm-project-description">
                        {project.description}
                      </p>
                    )}
                  </article>
                );
              })}
            </div>
            {!data.projects.length && (
              <p className="pm-empty">
                The next project is being shaped. Check back soon.
              </p>
            )}
          </section>

          <section id="contact" className="pm-contact">
            <div className="pm-section-bar">
              <span>03 / Contact</span>
              <span>{data.location || "Open worldwide"}</span>
            </div>
            <div className="pm-contact-main">
              <h2>
                Let&apos;s make
                <br />
                <span>something real.</span>
              </h2>
              <div className="pm-contact-links">
                {data.email && (
                  <a href={`mailto:${data.email}`}>
                    <span>{data.email}</span>
                    <ArrowUpRight size={18} />
                  </a>
                )}
                {website && (
                  <a
                    href={website}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span>{websiteLabel}</span>
                    <ArrowUpRight size={18} />
                  </a>
                )}
                {socials.map((social) => (
                  <a
                    key={social.id}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span>{social.label}</span>
                    <ArrowUpRight size={18} />
                  </a>
                ))}
                {!data.email && !website && !socials.length && (
                  <p>Contact details are coming soon.</p>
                )}
              </div>
            </div>
          </section>
        </main>

        <footer className="pm-footer">
          <span>
            © {new Date().getFullYear()} {name}
          </span>
          <span>{roleParts.join(" / ")}</span>
          <a href="/portfolio" target="_blank" rel="noopener noreferrer">
            Made with Lamaranku ↗
          </a>
        </footer>
      </div>
    </div>
  );
}

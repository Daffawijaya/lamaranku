import { ArrowUpRight, Globe2, Mail, MapPin } from "lucide-react";
import {
  portfolioImageUrl,
  safePortfolioUrl,
  socialLinkUrl,
  SOCIAL_NETWORKS,
  type WebPortfolio,
} from "../../lib/portfolio";
import "./poster-theme.css";

// Posisi tanda "+" pada perpotongan grid hero. Grid-nya sendiri digambar lewat
// CSS; tanda plus dibuat eksplisit supaya rapinya sama seperti poster cetak.
const GRID_MARKS = [
  [4.6, 6.5],
  [34.7, 6.5],
  [64.8, 6.5],
  [94.9, 6.5],
  [4.6, 47.3],
  [34.7, 47.3],
  [64.8, 47.3],
  [94.9, 47.3],
  [4.6, 88.1],
  [34.7, 88.1],
  [64.8, 88.1],
  [94.9, 88.1],
  [4.6, 97.5],
  [94.9, 97.5],
] as const;

export function PosterPortfolio({ data }: { data: WebPortfolio }) {
  const name = data.name.trim() || "Namamu";
  const firstName = name.split(/\s+/)[0] || "Namamu";
  const initial = firstName.slice(0, 1).toUpperCase();
  const role = data.role.trim() || "UI/UX Designer";
  const headline = data.headline.trim() || role;
  const bio = data.bio.trim();
  const location = data.location.trim();
  const email = data.email.trim();
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
  const projects = data.projects;
  const projectCount = String(projects.length).padStart(2, "0");
  const serviceCount = String(data.skills.length).padStart(2, "0");
  const featured = projects[0];
  const featuredImage = featured ? portfolioImageUrl(featured.image) : undefined;
  const featuredHref = featured ? safePortfolioUrl(featured.url) : undefined;
  const contactHref = email ? `mailto:${email}` : "#contact";

  return (
    <div className="pw pw-poster" data-document-preview>
      <section
        id="home"
        className="po-hero"
        aria-label={`Portofolio ${name}`}
      >
        <div className="po-grid" aria-hidden="true">
          {GRID_MARKS.map(([left, top]) => (
            <i
              key={`${left}-${top}`}
              className="po-mark"
              style={{ left: `${left}%`, top: `${top}%` }}
            />
          ))}
        </div>

        <header className="po-nav">
          <a className="po-brand" href="#home">
            {firstName}
            <sup>®</sup>
          </a>
          <nav className="po-nav-links" aria-label="Navigasi portofolio">
            <a className="is-active" href="#home">
              Home
            </a>
            <a href="#about">About</a>
            <a href="#work">
              Work <small>({projectCount})</small>
            </a>
            <a href="#services">
              Services <small>({serviceCount})</small>
            </a>
            <a href="#contact">Contact</a>
          </nav>
          <a className="po-menu" href="#contact" aria-label="Buka kontak">
            <span />
            <span />
          </a>
        </header>

        <span className="po-ghost-name" aria-hidden="true">
          {firstName}
        </span>

        <p className="po-statement">{headline}</p>

        <div
          className={`po-portrait${avatar ? " has-image" : ""}`}
          aria-hidden={!avatar}
        >
          {avatar ? (
            <img
              src={avatar}
              alt={`Potret ${name}`}
              width={1200}
              height={1200}
            />
          ) : (
            <div className="po-figure" aria-hidden="true">
              <i />
              <i />
            </div>
          )}
        </div>

        {featured && (
          <a
            className="po-hero-project"
            href={featuredHref || "#work"}
            {...(featuredHref
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {})}
            aria-label={`Lihat karya ${featured.title || "pilihan"}`}
          >
            <span className="po-hero-project-media">
              {featuredImage ? (
                <img
                  src={featuredImage}
                  alt={featured.title || "Gambar karya"}
                  width={600}
                  height={520}
                />
              ) : (
                <span className="po-hero-project-empty" aria-hidden="true">
                  {firstName.slice(0, 1)}
                </span>
              )}
            </span>
            <span className="po-hero-project-meta">
              <span className="po-star" aria-hidden="true">
                ✳
              </span>
              <strong>{featured.title || "Selected work"}</strong>
              <span>/{featured.category || "Project"}</span>
            </span>
          </a>
        )}

        <span className="po-copyright">©{new Date().getFullYear()}</span>
        <h1 className="po-name">{firstName}</h1>

        <a className="po-talk" href={contactHref}>
          <span className="po-talk-avatar">
            {avatar ? (
              <img
                src={avatar}
                alt=""
                width={220}
                height={220}
                aria-hidden="true"
              />
            ) : (
              <span aria-hidden="true">{initial}</span>
            )}
          </span>
          <span className="po-talk-copy">
            <span className="po-talk-label">
              Let&apos;s Talk
              <span className="po-star" aria-hidden="true">
                ✳
              </span>
            </span>
            <strong>{firstName}</strong>
            <small>{role}</small>
          </span>
          <span className="po-talk-arrow">
            <ArrowUpRight size={20} aria-hidden="true" />
          </span>
        </a>
      </section>

      <section id="work" className="po-work" aria-labelledby="po-work-title">
        <header className="po-section-head">
          <div>
            <span className="po-label">02 / Selected work</span>
            <h2 id="po-work-title">
              Work <sup>({projectCount})</sup>
            </h2>
          </div>
          <p>
            Karya pilihan yang menggabungkan strategi, desain, dan detail yang
            membuat sebuah produk terasa utuh.
          </p>
        </header>

        <div className="po-projects">
          {projects.map((project, index) => {
            const image = portfolioImageUrl(project.image);
            const href = safePortfolioUrl(project.url);
            const number = String(index + 1).padStart(2, "0");
            const media = (
              <>
                {image ? (
                  <img
                    src={image}
                    alt={project.title || "Gambar karya"}
                    width={1400}
                    height={1000}
                    loading="lazy"
                  />
                ) : (
                  <span className="po-project-empty" aria-hidden="true">
                    {number}
                  </span>
                )}
                <span className="po-project-arrow">
                  <ArrowUpRight size={20} aria-hidden="true" />
                </span>
              </>
            );
            return (
              <article
                key={project.id}
                className={`po-project${index === 0 ? " is-featured" : ""}`}
              >
                {href ? (
                  <a
                    className="po-project-media"
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Buka karya ${project.title}`}
                  >
                    {media}
                  </a>
                ) : (
                  <div className="po-project-media">{media}</div>
                )}
                <div className="po-project-body">
                  <div className="po-project-top">
                    <span className="po-project-index">{number}</span>
                    <span className="po-project-category">
                      {project.category || "Selected work"}
                    </span>
                  </div>
                  <h3>{project.title || `Project ${index + 1}`}</h3>
                  {project.description && <p>{project.description}</p>}
                  {href && (
                    <a
                      className="po-project-link"
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View project <ArrowUpRight size={13} aria-hidden="true" />
                    </a>
                  )}
                </div>
              </article>
            );
          })}
        </div>
        {!projects.length && (
          <p className="po-empty">Karya berikutnya sedang disiapkan.</p>
        )}
      </section>

      <section id="about" className="po-about" aria-labelledby="po-about-title">
        <div className="po-about-copy">
          <span className="po-label">03 / About</span>
          <h2 id="po-about-title">{headline}</h2>
          <p className="po-role">{role}</p>
          <p className="po-bio">
            {bio ||
              "Tambahkan cerita singkat tentang dirimu, pendekatan kerja, dan hal yang ingin kamu ciptakan."}
          </p>
          <div className="po-meta">
            {location && (
              <span>
                <MapPin size={13} aria-hidden="true" /> {location}
              </span>
            )}
            <span className={data.available ? "is-on" : "is-off"}>
              <i aria-hidden="true" />
              {data.available ? "Available for work" : "By invitation"}
            </span>
          </div>
        </div>

        <div id="services" className="po-services">
          <div className="po-services-head">
            <span className="po-label">Services</span>
            <span>({serviceCount})</span>
          </div>
          {data.skills.length > 0 ? (
            <ul>
              {data.skills.map((skill, index) => (
                <li key={skill}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  {skill}
                </li>
              ))}
            </ul>
          ) : (
            <p className="po-empty">Keahlian akan segera ditambahkan.</p>
          )}
        </div>
      </section>

      <section id="contact" className="po-contact" aria-labelledby="po-contact-title">
        <div className="po-contact-head">
          <span className="po-label">04 / Contact</span>
          <span>{location || "Jakarta, Indonesia"}</span>
        </div>
        <h2 id="po-contact-title">
          Let&apos;s talk
          <span className="po-star" aria-hidden="true">
            ✳
          </span>
        </h2>
        <div className="po-contact-grid">
          <div className="po-contact-main">
            {email ? (
              <a className="po-contact-mail" href={`mailto:${email}`}>
                {email}
                <ArrowUpRight size={22} aria-hidden="true" />
              </a>
            ) : (
              <span className="po-contact-mail is-empty">
                Kontak akan segera tersedia.
              </span>
            )}
            {website && (
              <a
                className="po-contact-website"
                href={website}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Globe2 size={15} aria-hidden="true" /> {websiteLabel}
                <ArrowUpRight size={14} aria-hidden="true" />
              </a>
            )}
          </div>
          <div className="po-contact-side">
            <span className="po-contact-label">Find me on</span>
            {socials.length > 0 ? (
              <ul className="po-socials">
                {socials.map((social) => (
                  <li key={social.id}>
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {social.label}
                      <ArrowUpRight size={13} aria-hidden="true" />
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="po-empty">Sosial media akan segera tersedia.</p>
            )}
          </div>
          <div className="po-contact-profile">
            <span className="po-talk-avatar">
              {avatar ? (
                <img
                  src={avatar}
                  alt=""
                  width={220}
                  height={220}
                  aria-hidden="true"
                />
              ) : (
                <span aria-hidden="true">{initial}</span>
              )}
            </span>
            <div>
              <strong>{name}</strong>
              <span>{role}</span>
              {location && (
                <small>
                  <MapPin size={12} aria-hidden="true" /> {location}
                </small>
              )}
            </div>
            <a href={contactHref} aria-label="Kirim email">
              <Mail size={16} aria-hidden="true" />
            </a>
          </div>
        </div>

        <footer className="po-footer">
          <span>
            © {new Date().getFullYear()} {name}
          </span>
          <a href="/portfolio" target="_blank" rel="noopener noreferrer">
            Made with Lamaranku ↗
          </a>
        </footer>
      </section>
    </div>
  );
}

import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  ArrowUpRight,
  Award,
  CalendarDays,
  Globe2,
  Handshake,
  Hourglass,
  Mail,
  MapPin,
  MessageSquare,
  PenTool,
  Sparkles,
  Target,
} from "lucide-react";
import {
  portfolioImageUrl,
  safePortfolioUrl,
  socialLinkUrl,
  SOCIAL_NETWORKS,
  type WebPortfolio,
} from "../../lib/portfolio";
import "./abrantes-theme.css";

// Semua isi di tema ini diambil dari form portofolio. Ikon dan warna hanya
// dekorasi, jadi tidak ada angka atau klaim yang dikarang di sini.
const DO_ICONS: LucideIcon[] = [Target, PenTool, CalendarDays, Globe2];
const STEP_ICONS: LucideIcon[] = [Hourglass, Target, Handshake, MessageSquare];
const TONES = ["tone-green", "tone-purple", "tone-peach", "tone-blue"] as const;

type ContactCard = {
  id: string;
  tone: string;
  icon: LucideIcon;
  label: string;
  value: string;
  href: string;
  cta: string;
  external: boolean;
};

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function tagsFor(category: string) {
  return category
    .split(/\s*(?:•|·|\||,)\s*/)
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 3);
}

export function AbrantesPortfolio({ data }: { data: WebPortfolio }) {
  const name = data.name.trim() || "Namamu";
  const role = data.role.trim();
  const headline = data.headline.trim();
  const heading = headline || role || "Portfolio";
  const bio = data.bio.trim();
  const location = data.location.trim();
  const email = data.email.trim();
  const avatar = portfolioImageUrl(data.avatar);
  const website = safePortfolioUrl(data.website);
  const websiteLabel = website
    ?.replace(/^https?:\/\//, "")
    .replace(/\/$/, "");
  const contactHref = email ? `mailto:${email}` : "#contact";
  const mapHref = location
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`
    : "";
  const initial = name.slice(0, 1).toUpperCase();

  const socials = (data.socials ?? []).flatMap((social) => {
    const label = SOCIAL_NETWORKS.find(
      (entry) => entry.id === social.network,
    )?.label;
    const href = socialLinkUrl(social.network, social.url);
    return label && href ? [{ id: social.id, label, href }] : [];
  });

  const stats: {
    tone: string;
    icon: LucideIcon;
    value: string;
    label: string;
  }[] = [];
  if (data.projects.length > 0) {
    stats.push({
      tone: "tone-purple",
      icon: Sparkles,
      value: pad(data.projects.length),
      label: "Selected projects",
    });
  }
  if (data.skills.length > 0) {
    stats.push({
      tone: "tone-peach",
      icon: Award,
      value: pad(data.skills.length),
      label: "Skills & expertise",
    });
  }

  const contactCards: ContactCard[] = [];
  if (email) {
    contactCards.push({
      id: "email",
      tone: "tone-green",
      icon: Mail,
      label: "Email",
      value: email,
      href: `mailto:${email}`,
      cta: "Start Chat",
      external: false,
    });
  }
  if (location) {
    contactCards.push({
      id: "address",
      tone: "tone-purple",
      icon: MapPin,
      label: "Address",
      value: location,
      href: mapHref,
      cta: "Show on Map",
      external: true,
    });
  }
  if (website && websiteLabel) {
    contactCards.push({
      id: "website",
      tone: "tone-peach",
      icon: Globe2,
      label: "Website",
      value: websiteLabel,
      href: website,
      cta: "Visit Website",
      external: true,
    });
  }

  return (
    <div className="pw pw-abrantes" data-document-preview>
      <div className="ab-wrapper">
        <header className="ab-nav">
          <a className="ab-brand" href="#home" title={name}>
            {name}
          </a>
          <nav className="ab-nav-links" aria-label="Navigasi portofolio">
            <a href="#home">Home</a>
            <a href="#work">Works</a>
            <a href="#about">About</a>
            <a href="#contact">Contact</a>
          </nav>
          <div className="ab-nav-actions">
            {data.available && (
              <span className="ab-available">
                <i aria-hidden="true" />
                <span>Open to work</span>
              </span>
            )}
            <a className="ab-nav-cta" href={contactHref}>
              Get in Touch
            </a>
          </div>
        </header>

        <main>
          <section id="home" className="ab-hero" aria-label={`Portofolio ${name}`}>
            <div className="ab-hero-copy">
              <span className="ab-greeting">Hi, I&apos;m {name}</span>
              <div className="ab-headline-wrap">
                <h1 className="ab-headline">{heading}</h1>
                <svg
                  className="ab-doodle-arrow"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    d="M8 38c4-16 18-24 31-26"
                    fill="none"
                    stroke="#f0a06c"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <path
                    d="M30 8l10 3-4 10"
                    fill="none"
                    stroke="#f0a06c"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              {headline && role && headline !== role && (
                <p className="ab-role">{role}</p>
              )}
              <p className="ab-bio">
                {bio ||
                  "Tambahkan cerita singkat tentang dirimu, pendekatan kerja, dan hal yang ingin kamu ciptakan."}
              </p>

              <div className="ab-hero-cta">
                <a className="ab-cta" href="#work">
                  <span>See My Works</span>
                  <span className="ab-cta-arrow">
                    <ArrowRight size={15} aria-hidden="true" />
                  </span>
                </a>
                <svg
                  className="ab-squiggle"
                  viewBox="0 0 90 34"
                  aria-hidden="true"
                >
                  <path
                    d="M4 24c14-16 28 8 44-4 10-8 22 2 38-6"
                    fill="none"
                    stroke="#a78bfa"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              {stats.length > 0 && (
                <div className="ab-stats">
                  {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                      <div
                        className={`ab-stat ${stat.tone}`}
                        key={stat.label}
                      >
                        <Icon
                          className="ab-stat-icon"
                          size={22}
                          aria-hidden="true"
                        />
                        <strong className="ab-stat-value">
                          {stat.value}
                        </strong>
                        <span className="ab-stat-label">{stat.label}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="ab-hero-portrait">
              {avatar ? (
                <img
                  src={avatar}
                  alt={`Potret ${name}`}
                  width={800}
                  height={960}
                />
              ) : (
                <div className="ab-portrait-placeholder">
                  <span>{initial}</span>
                  <small>Upload portrait</small>
                </div>
              )}
            </div>
          </section>

          <section id="work" className="ab-work" aria-labelledby="ab-work-title">
            <svg className="ab-spark ab-spark-work" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M12 2l2.2 7.8L22 12l-7.8 2.2L12 22l-2.2-7.8L2 12l7.8-2.2z"
                fill="#8ed96a"
              />
            </svg>
            <header className="ab-section-head">
              <h2 id="ab-work-title" className="ab-h2">
                What I Do
              </h2>
              <p>
                Selected work I&apos;ve helped shape — from the first idea to
                the final delivery.
              </p>
            </header>

            {data.projects.length > 0 ? (
              <div className="ab-do-grid">
                {data.projects.map((project, index) => {
                  const Icon = DO_ICONS[index % DO_ICONS.length];
                  const tone = TONES[index % TONES.length];
                  const href = safePortfolioUrl(project.url);
                  const image = portfolioImageUrl(project.image);
                  const tags = tagsFor(project.category);
                  return (
                    <article
                      className={`ab-do-card ${tone}`}
                      key={project.id}
                    >
                      <div className="ab-do-media">
                        {image ? (
                          <>
                            <img
                              src={image}
                              alt={project.title || "Gambar karya"}
                              width={1200}
                              height={675}
                              loading="lazy"
                            />
                            <span
                              className="ab-do-icon"
                              aria-hidden="true"
                            >
                              <Icon size={19} />
                            </span>
                          </>
                        ) : (
                          <span
                            className="ab-do-media-fallback"
                            aria-hidden="true"
                          >
                            <span className="ab-do-media-icon">
                              <Icon size={28} />
                            </span>
                          </span>
                        )}
                      </div>
                      <div className="ab-do-body">
                        <h3 className="ab-do-title">
                          {project.title || "Selected work"}
                        </h3>
                        {project.description && (
                          <p className="ab-do-desc">{project.description}</p>
                        )}
                        {tags.length > 0 && (
                          <div className="ab-do-tags">
                            {tags.map((tag) => (
                              <span className="ab-do-tag" key={tag}>
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="ab-do-foot">
                        <a
                          className="ab-do-btn"
                          href={href || "#contact"}
                          {...(href
                            ? { target: "_blank", rel: "noopener noreferrer" }
                            : {})}
                        >
                          <span>{href ? "View Details" : "Ask About It"}</span>
                          <span className="ab-do-arrow">
                            <ArrowRight size={14} aria-hidden="true" />
                          </span>
                        </a>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <p className="ab-empty">
                Karya pilihan akan muncul di sini setelah kamu menambahkannya
                lewat form portofolio.
              </p>
            )}
          </section>

          {data.skills.length > 0 && (
            <section
              className="ab-process-section"
              aria-labelledby="ab-skills-title"
            >
              <svg
                className="ab-spark ab-spark-process"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  d="M12 2l2.2 7.8L22 12l-7.8 2.2L12 22l-2.2-7.8L2 12l7.8-2.2z"
                  fill="#b79cf3"
                />
              </svg>
              <header className="ab-section-head">
                <h2 id="ab-skills-title" className="ab-h2">
                  Skills &amp; Expertise
                </h2>
                <p>
                  The disciplines and strengths I bring to every collaboration.
                </p>
              </header>

              <div className="ab-process">
                <span className="ab-process-line" aria-hidden="true" />
                {data.skills.slice(0, 8).map((skill, index) => {
                  const Icon = STEP_ICONS[index % STEP_ICONS.length];
                  const tone = TONES[index % TONES.length];
                  return (
                    <div
                      className={`ab-step ${
                        index % 2 === 0 ? "ab-step-right" : "ab-step-left"
                      }`}
                      key={`${skill}-${index}`}
                    >
                      <span className="ab-step-badge">{pad(index + 1)}</span>
                      <article className={`ab-step-card ${tone}`}>
                        <span className="ab-step-icon" aria-hidden="true">
                          <Icon size={18} />
                        </span>
                        <div className="ab-step-body">
                          <span className="ab-step-kicker">
                            Expertise {pad(index + 1)}
                          </span>
                          <h3 className="ab-step-title">{skill}</h3>
                        </div>
                      </article>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          <section
            id="about"
            className="ab-about"
            aria-labelledby="ab-about-title"
          >
            <div className="ab-about-grid">
              <div className="ab-about-copy">
                <h2 id="ab-about-title" className="ab-h2">
                  Who I AM
                </h2>
                <p className="ab-about-text">
                  {bio ||
                    "Tambahkan cerita tentang latar belakang, cara kerja, dan hal yang membuatmu berbeda."}
                </p>
                {location && (
                  <p className="ab-about-location">
                    <MapPin size={13} aria-hidden="true" /> {location}
                  </p>
                )}
                <div className="ab-quote">
                  <Sparkles
                    className="ab-quote-star"
                    size={18}
                    aria-hidden="true"
                  />
                  <p>
                    {data.available
                      ? "Open to new collaborations and interesting projects."
                      : "Currently focused on ongoing work and partnerships."}
                  </p>
                </div>
              </div>

              <div className="ab-about-side">
                <div className="ab-about-portrait">
                  {(role || location) && (
                    <span className="ab-about-tag">
                      {role || location}
                    </span>
                  )}
                  {avatar ? (
                    <img
                      src={avatar}
                      alt={`Potret ${name}`}
                      width={700}
                      height={760}
                    />
                  ) : (
                    <div className="ab-portrait-placeholder">
                      <span>{initial}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section
            id="contact"
            className="ab-contact"
            aria-labelledby="ab-contact-title"
          >
            <svg
              className="ab-contact-doodle"
              viewBox="0 0 90 34"
              aria-hidden="true"
            >
              <path
                d="M4 24c14-16 28 8 44-4 10-8 22 2 38-6"
                fill="none"
                stroke="#a78bfa"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
            <svg
              className="ab-spark ab-spark-contact"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                d="M12 2l2.2 7.8L22 12l-7.8 2.2L12 22l-2.2-7.8L2 12l7.8-2.2z"
                fill="#8ed96a"
              />
            </svg>
            <header className="ab-section-head">
              <h2 id="ab-contact-title" className="ab-h2">
                Get In Touch
              </h2>
              <p>Please feel free to contact me.</p>
            </header>

            {contactCards.length > 0 ? (
              <div className="ab-contact-grid">
                {contactCards.map((card) => {
                  const Icon = card.icon;
                  return (
                    <article
                      className={`ab-contact-card ${card.tone}`}
                      key={card.id}
                    >
                      <span className="ab-contact-icon" aria-hidden="true">
                        <Icon size={20} />
                      </span>
                      <span className="ab-contact-label">{card.label}</span>
                      <span className="ab-contact-value">{card.value}</span>
                      <a
                        className="ab-contact-btn"
                        href={card.href}
                        {...(card.external
                          ? { target: "_blank", rel: "noopener noreferrer" }
                          : {})}
                      >
                        <span>{card.cta}</span>
                        <span className="ab-contact-arrow">
                          <ArrowUpRight size={14} aria-hidden="true" />
                        </span>
                      </a>
                    </article>
                  );
                })}
              </div>
            ) : (
              <p className="ab-empty">
                Detail kontak akan muncul di sini setelah kamu mengisinya lewat
                form portofolio.
              </p>
            )}

            {socials.length > 0 && (
              <div className="ab-socials" aria-label="Sosial media">
                {socials.map((social) => (
                  <a
                    key={social.id}
                    className="ab-social"
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {social.label}
                    <ArrowUpRight size={13} aria-hidden="true" />
                  </a>
                ))}
              </div>
            )}
          </section>
        </main>

        <footer className="ab-footer">
          <span>
            © {new Date().getFullYear()} {name}
          </span>
          <span>{role || "Portfolio"}</span>
          <a href="/portfolio" target="_blank" rel="noopener noreferrer">
            Made with Lamaranku ↗
          </a>
        </footer>
      </div>
    </div>
  );
}

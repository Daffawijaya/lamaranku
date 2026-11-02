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
              <h1 className="mp-headline">{headline}</h1>
              <a href={contactHref} className="mp-button">
                Contact me
                <ArrowUpRight size={13} />
              </a>
            </div>
          </section>

          {/* Client logos */}
          <section id="work" className="mp-clients" aria-label="Klien">
            <div className="mp-logo-track">
              {data.projects.slice(0, 6).map((project, index) => {
                const image = portfolioImageUrl(project.image);
                return (
                  <figure
                    key={project.id}
                    className={`mp-logo ${image ? "has-image" : "empty"}`}
                    aria-label={project.title || `Klien ${index + 1}`}
                  >
                    {image ? (
                      <img
                        src={image}
                        alt={project.title || "Logo klien"}
                        width={200}
                        height={100}
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <span className="mp-logo-letter">
                        {(project.title || "C").slice(0, 1).toUpperCase()}
                      </span>
                    )}
                  </figure>
                );
              })}
            </div>
          </section>

          {/* About + Features */}
          <section id="about" className="mp-about" aria-label="Tentang saya">
            <div className="mp-about-inner">
              <h2 className="mp-about-title">
                Collaborate with brands and agencies
                <br />
                <span>to create impactful results.</span>
              </h2>
              <ul className="mp-feature-grid" aria-label="Layanan">
                {[
                  {
                    title: "Product Design",
                    desc: "Craft intuitive digital products focused on real users.",
                  },
                  {
                    title: "Brand Identity",
                    desc: "Build visual identities that reflect your brand values.",
                  },
                  {
                    title: "Web Development",
                    desc: "Create modern, fast, responsive websites.",
                  },
                  {
                    title: "Art Direction",
                    desc: "Guide creative vision for consistent, striking work.",
                  },
                ].map((item) => (
                  <li key={item.title} className="mp-feature">
                    <span className="mp-feature-icon" aria-hidden="true">
                      <Sparkles size={14} />
                    </span>
                    <div className="mp-feature-body">
                      <h3>{item.title}</h3>
                      <p>{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* CTA */}
          <section id="contact" className="mp-contact" aria-label="Kontak">
            <div className="mp-contact-inner">
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

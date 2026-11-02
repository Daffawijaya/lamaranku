import {
  ArrowUpRight,
  Sparkles,
  Target,
  PenTool,
  Calendar,
  Hourglass,
  Handshake,
  MessageSquare,
  Mail,
  MapPin,
  Phone,
  Globe,
  Award,
  CheckCircle2,
} from "lucide-react";
import {
  portfolioImageUrl,
  safePortfolioUrl,
  socialLinkUrl,
  SOCIAL_NETWORKS,
  type WebPortfolio,
} from "../../lib/portfolio";
import "./abrantes-theme.css";

export function AbrantesPortfolio({ data }: { data: WebPortfolio }) {
  const name = data.name.trim() || "Raukia Abrantes";
  const firstName = name.split(/\s+/)[0] || "Raukia";
  const initial = firstName.slice(0, 1).toUpperCase();
  const role = data.role.trim() || "Communication and Brand Strategy Expert";
  const headline = data.headline.trim() || role;
  const bio =
    data.bio.trim() ||
    "I am a seasoned and versatile marketing communications professional with strong conceptual and communications skills.";
  const location = data.location.trim() || "100 Smith Street Collingwood VIC 3066 AU";
  const email = data.email.trim() || "raukia.abrantes@gmail.com";
  const website = safePortfolioUrl(data.website);
  const avatar = portfolioImageUrl(data.avatar);

  const skills = data.skills.length > 0 ? data.skills : ["Concept & Strategy", "Content", "Project Management"];
  const projects = data.projects.length > 0 ? data.projects : [
    {
      id: "demo-ab-1",
      title: "Concept & Strategy",
      category: "Campaigns • Messaging • Strategy",
      description: "I develop a central communication idea as part of the concept. This includes powerful messaging, outreach strategy.",
      url: "",
      image: "",
    },
    {
      id: "demo-ab-2",
      title: "Content",
      category: "Writing • Design • Video",
      description: "I create, design and produce tailor-made content, including printed, digital, text formats and visual assets for all channels.",
      url: "",
      image: "",
    },
    {
      id: "demo-ab-3",
      title: "Project Management",
      category: "Leadership • Global • 20 Years",
      description: "I can lead teams or support existing projects with well-organized, pro-active project management across campaigns.",
      url: "",
      image: "",
    },
  ];

  const primaryProject = projects[0];
  const secondProject = projects[1];
  const thirdProject = projects[2];

  const contactHref = email ? `mailto:${email}` : "#contact";

  return (
    <div className="pw-abrantes" data-document-preview>
      <div className="ab-wrapper">
        {/* Navbar */}
        <header className="ab-nav">
          <a className="ab-brand" href="#home">
            {firstName}
          </a>
          <nav className="ab-nav-links" aria-label="Navigasi">
            <a href="#home">Home</a>
            <a href="#services">Services</a>
            <a href="#about">About</a>
            <a href="#contact">Contact</a>
          </nav>
          <div className="ab-nav-actions">
            <span className="ab-lang-pill">
              ENG <span style={{ fontSize: 10 }}>▼</span>
            </span>
            <a className="ab-btn-pill" href={contactHref}>
              Get in Touch
            </a>
          </div>
        </header>

        {/* Hero Section */}
        <section id="home" className="ab-hero">
          <div className="ab-hero-copy">
            <span className="ab-greeting">Hi, I&apos;m {name}</span>
            <div className="ab-headline-wrap">
              <h1 className="ab-headline">{headline}</h1>
              <svg
                className="ab-headline-arrow"
                width="36"
                height="36"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#f49c6b"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M7 17l92-12" />
                <path d="M11 5h6v6" />
              </svg>
            </div>
            <p className="ab-bio">{bio}</p>

            <div className="ab-hero-cta-row">
              <a className="ab-cta-works" href="#work">
                See My Works
                <span className="ab-arrow-circle">→</span>
              </a>
              <svg
                className="ab-squiggle-doodle"
                width="64"
                height="28"
                viewBox="0 0 100 40"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              >
                <path d="M5 25C25 5 45 35 75 15C85 8 95 20 95 20" />
              </svg>
            </div>

            <div className="ab-hero-stats">
              <div className="ab-stat-card purple">
                <div className="ab-stat-icon">
                  <Sparkles size={20} />
                </div>
                <div className="ab-stat-val">20 Years</div>
                <div className="ab-stat-lbl">Experience and Expertise</div>
              </div>
              <div className="ab-stat-card peach">
                <div className="ab-stat-icon">
                  <Award size={20} />
                </div>
                <div className="ab-stat-val">4.9</div>
                <div className="ab-stat-lbl">2.6K+ Positive Feedback</div>
              </div>
            </div>
          </div>

          <div className="ab-hero-portrait">
            {avatar ? (
              <img src={avatar} alt={`Potret ${name}`} width={800} height={960} />
            ) : (
              <div className="ab-hero-portrait-placeholder">
                <div className="ab-hero-portrait-initial">{initial}</div>
                <small>PORTRAIT</small>
              </div>
            )}
          </div>
        </section>

        {/* What I Do Section */}
        <section id="work" className="ab-section">
          <div className="ab-section-head">
            <span style={{ fontSize: 12, fontWeight: 700, color: "#6c5ce7", letterSpacing: 1 }}>
              01 / WHAT I DO
            </span>
            <h2 className="ab-section-title">What I Do</h2>
            <p className="ab-section-sub">
              For any communication, a good concept is central. It serves as an anchor, allowing you to focus on your essential business and audience. It helps you to focus on your goals whilst offering a roadmap of how to get there.
            </p>
          </div>

          <div className="ab-do-grid">
            {/* Card 1: Green */}
            <div className="ab-do-card green">
              <div className="ab-do-icon-wrap">
                <Target size={26} color="#255214" />
              </div>
              <div className="ab-do-content">
                <h3 className="ab-do-title">{primaryProject.title}</h3>
                <p className="ab-do-desc">
                  {primaryProject.description || "I develop a central communication idea as part of the concept. This includes powerful messaging, outreach strategy."}
                </p>
                <div className="ab-do-tags">
                  <span className="ab-do-tag">Campaigns</span>
                  <span className="ab-do-tag">Messaging</span>
                  <span className="ab-do-tag">Strategy</span>
                </div>
              </div>
              <a
                className="ab-do-btn"
                href={safePortfolioUrl(primaryProject.url) || "#contact"}
                {...(primaryProject.url ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              >
                <span>View Details</span>
                <span className="ab-btn-arrow">→</span>
              </a>
            </div>

            {/* Card 2: Purple */}
            <div className="ab-do-card purple">
              <div className="ab-do-icon-wrap">
                <PenTool size={26} color="#4d3a79" />
              </div>
              <div className="ab-do-content">
                <h3 className="ab-do-title">{secondProject ? secondProject.title : "Content"}</h3>
                <p className="ab-do-desc">
                  {secondProject?.description || "I create, design and produce tailor-made content, including printed, digital, text formats and visual assets for all channels."}
                </p>
                <div className="ab-do-tags">
                  <span className="ab-do-tag">Writing</span>
                  <span className="ab-do-tag">Design</span>
                  <span className="ab-do-tag">Video</span>
                </div>
              </div>
              <a
                className="ab-do-btn"
                href={safePortfolioUrl(secondProject?.url) || "#contact"}
                {...(secondProject?.url ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              >
                <span>View Details</span>
                <span className="ab-btn-arrow">→</span>
              </a>
            </div>

            {/* Card 3: Peach */}
            <div className="ab-do-card peach">
              <div className="ab-do-icon-wrap">
                <Calendar size={26} color="#7a3b18" />
              </div>
              <div className="ab-do-content">
                <h3 className="ab-do-title">{thirdProject ? thirdProject.title : "Project Management"}</h3>
                <p className="ab-do-desc">
                  {thirdProject?.description || "I can lead teams or support existing projects with well-organized, pro-active project management across campaigns."}
                </p>
                <div className="ab-do-tags">
                  <span className="ab-do-tag">Leadership</span>
                  <span className="ab-do-tag">Global</span>
                  <span className="ab-do-tag">20 Years</span>
                </div>
              </div>
              <a
                className="ab-do-btn"
                href={safePortfolioUrl(thirdProject?.url) || "#contact"}
                {...(thirdProject?.url ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              >
                <span>View Details</span>
                <span className="ab-btn-arrow">→</span>
              </a>
            </div>
          </div>
        </section>

        {/* How I Do It Section */}
        <section className="ab-section">
          <div className="ab-section-head">
            <span style={{ fontSize: 12, fontWeight: 700, color: "#6c5ce7", letterSpacing: 1 }}>
              02 / WORKFLOW
            </span>
            <h2 className="ab-section-title">How I Do It</h2>
            <p className="ab-section-sub">
              Connect your tools, connect your teams. With over 100 apps already available in our directory, your team&apos;s favourite tools are just a click away.
            </p>
          </div>

          <div className="ab-process-container">
            <div className="ab-process-line" />
            <div className="ab-process-steps">
              {/* Step 1 */}
              <div className="ab-process-step right">
                <div />
                <div className="ab-step-badge">01</div>
                <div className="ab-process-card green">
                  <Hourglass className="ab-process-card-icon" color="#255214" />
                  <div className="ab-process-card-body">
                    <h4 className="ab-process-card-title">The Earlier the Better</h4>
                    <p className="ab-process-card-text">
                      Involving me early ensures clear goals, saves time, and optimizes resources for maximum project success.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="ab-process-step left">
                <div className="ab-process-card purple">
                  <Target className="ab-process-card-icon" color="#4d3a79" />
                  <div className="ab-process-card-body">
                    <h4 className="ab-process-card-title">Briefing</h4>
                    <p className="ab-process-card-text">
                      Understanding goals, audience, and resources for smart planning and strategic alignment from the start.
                    </p>
                  </div>
                </div>
                <div className="ab-step-badge">02</div>
                <div />
              </div>

              {/* Step 3 */}
              <div className="ab-process-step right">
                <div />
                <div className="ab-step-badge">03</div>
                <div className="ab-process-card peach">
                  <Handshake className="ab-process-card-icon" color="#7a3b18" />
                  <div className="ab-process-card-body">
                    <h4 className="ab-process-card-title">Co-Creation &amp; Collaboration</h4>
                    <p className="ab-process-card-text">
                      Working with partners to scale projects quickly and effectively, leveraging collective expertise and creativity.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="ab-process-step left">
                <div className="ab-process-card blue">
                  <MessageSquare className="ab-process-card-icon" color="#093b45" />
                  <div className="ab-process-card-body">
                    <h4 className="ab-process-card-title">Languages</h4>
                    <p className="ab-process-card-text">
                      Services available in German and English for wider reach, ensuring clear communication across diverse markets.
                    </p>
                  </div>
                </div>
                <div className="ab-step-badge">04</div>
                <div />
              </div>
            </div>
          </div>
        </section>

        {/* Who I AM Section */}
        <section id="about" className="ab-section">
          <div className="ab-about-grid">
            <div className="ab-about-left">
              <span className="ab-about-top-tag">20+ Years in Marketing &amp; Branding</span>
              <h2 className="ab-section-title" style={{ textAlign: "left", margin: 0 }}>Who I AM</h2>
              <p className="ab-about-text">
                I&apos;m a strategic marketing communications professional who transforms ideas into compelling brand stories.
              </p>
              <p className="ab-about-text">
                {bio}
              </p>

              <div className="ab-about-features">
                <div className="ab-feat-card green">
                  <div className="ab-feat-icon">
                    <Target size={18} color="#255214" />
                  </div>
                  <div className="ab-feat-info">
                    <div className="ab-feat-title">Strategic Communication</div>
                    <div className="ab-feat-desc">Crafting impactful messaging with target audiences.</div>
                  </div>
                </div>
                <div className="ab-feat-card purple">
                  <div className="ab-feat-icon">
                    <Award size={18} color="#4d3a79" />
                  </div>
                  <div className="ab-feat-info">
                    <div className="ab-feat-title">Location Branding</div>
                    <div className="ab-feat-desc">Specialized expertise from national &amp; international initiatives.</div>
                  </div>
                </div>
                <div className="ab-feat-card peach">
                  <div className="ab-feat-icon">
                    <Sparkles size={18} color="#7a3b18" />
                  </div>
                  <div className="ab-feat-info">
                    <div className="ab-feat-title">Brand Storytelling</div>
                    <div className="ab-feat-desc">Designing narratives that drive market expansion and growth.</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="ab-about-right">
              <div className="ab-about-portrait">
                {avatar ? (
                  <img src={avatar} alt={`Potret ${name}`} width={600} height={660} />
                ) : (
                  <div className="ab-hero-portrait-placeholder" style={{ height: "100%" }}>
                    <div className="ab-hero-portrait-initial">{initial}</div>
                  </div>
                )}
              </div>
              <div className="ab-about-quote-box">
                <Sparkles className="ab-quote-star" size={20} />
                <p className="ab-quote-text">
                  My work with top industry partners has given me deep expertise in brand positioning and international market development.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Get In Touch Section */}
        <section id="contact" className="ab-section">
          <div className="ab-section-head">
            <span style={{ fontSize: 12, fontWeight: 700, color: "#6c5ce7", letterSpacing: 1 }}>
              03 / CONTACT
            </span>
            <h2 className="ab-section-title">Get In Touch</h2>
            <p className="ab-section-sub">Please feel free to contact me</p>
          </div>

          <div className="ab-contact-grid">
            {/* Email Card */}
            <div className="ab-contact-card green">
              <div className="ab-contact-head-icon">
                <Mail size={22} color="#255214" />
              </div>
              <div className="ab-contact-info">
                <span className="ab-contact-lbl">Email</span>
                <span className="ab-contact-val">{email || "hello@example.com"}</span>
              </div>
              <a className="ab-contact-btn" href={`mailto:${email}`}>
                <span>Start Chat</span>
                <span className="ab-btn-arrow">→</span>
              </a>
            </div>

            {/* Address Card */}
            <div className="ab-contact-card purple">
              <div className="ab-contact-head-icon">
                <MapPin size={22} color="#4d3a79" />
              </div>
              <div className="ab-contact-info">
                <span className="ab-contact-lbl">Address</span>
                <span className="ab-contact-val">{location || "Jakarta, Indonesia"}</span>
              </div>
              <a
                className="ab-contact-btn"
                href={`https://maps.google.com/?q=${encodeURIComponent(location)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>Show On Map</span>
                <span className="ab-btn-arrow">→</span>
              </a>
            </div>

            {/* Phone Card */}
            <div className="ab-contact-card peach">
              <div className="ab-contact-head-icon">
                <Phone size={22} color="#7a3b18" />
              </div>
              <div className="ab-contact-info">
                <span className="ab-contact-lbl">Phone / Contact</span>
                <span className="ab-contact-val">{website ? website.replace(/^https?:\/\//, "") : "+1 (555) 000-0000"}</span>
              </div>
              <a
                className="ab-contact-btn"
                href={website || `tel:${email}`}
                {...(website ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              >
                <span>Call / Connect</span>
                <span className="ab-btn-arrow">→</span>
              </a>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="ab-footer">
          <span>&copy; {new Date().getFullYear()} {name}. All rights reserved.</span>
          <a href="/portfolio" target="_blank" rel="noopener noreferrer">
            Made with Lamaranku ↗
          </a>
        </footer>
      </div>
    </div>
  );
}

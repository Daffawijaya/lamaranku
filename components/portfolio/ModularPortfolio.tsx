"use client";

import {
  ArrowUpRight,
  Briefcase,
  Globe2,
  Mail,
  MapPin,
  Sparkles,
  User,
} from "lucide-react";
import {
  portfolioImageUrl,
  safePortfolioUrl,
  socialLinkUrl,
  SOCIAL_NETWORKS,
  type WebPortfolio,
  type WebProject,
} from "../../lib/portfolio";
import "./modular-theme.css";

const ICON_MAP: Record<string, React.ElementType> = {
  github: Globe2,
  linkedin: Globe2,
  twitter: Globe2,
  instagram: Globe2,
};

function socialIcon(network: string) {
  return ICON_MAP[network] || Globe2;
}

// Helper to render social icons
function SocialLinks({ socials }: { socials: Array<{ network: string; url: string }> }) {
  if (!socials?.length) return null;
  return (
    <div className="flex gap-4" role="list" aria-label="Social links">
      {socials.map((s) => {
        const Icon = socialIcon(s.network);
        return (
          <a
            key={s.network}
            href={socialLinkUrl(s.network, s.url) ?? ""}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-zinc-300 hover:border-zinc-500 hover:bg-zinc-50 transition-colors"
            aria-label={SOCIAL_NETWORKS.find((n) => n.id === s.network)?.label ?? s.network}
          >
            <Icon className="w-5 h-5 text-zinc-700" />
          </a>
        );
      })}
    </div>
  );
}

// Stat card component
function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="card text-center">
      <div className="text-3xl font-bold text-zinc-900">{value}</div>
      <div className="text-zinc-600 text-sm mt-1">{label}</div>
    </div>
  );
}

// Project card component
function ProjectCard({ project }: { project: WebProject }) {
  return (
    <article className="card overflow-hidden flex flex-col h-full">
      {project.image && (
        <div className="relative aspect-[16/9] mb-4 overflow-hidden rounded">
          <img
            src={portfolioImageUrl(project.image)}
            alt=""
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            loading="lazy"
          />
        </div>
      )}
      <div className="flex-1 flex flex-col">
        <div className="text-xs text-zinc-500 uppercase tracking-wide mb-1">{project.category}</div>
        <h3 className="text-xl font-bold text-zinc-900 mb-2">{project.title}</h3>
        {project.description && <p className="text-zinc-600 text-sm flex-1 mb-4">{project.description}</p>}
        {project.url && (
          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm font-medium text-[#3b63fb] hover:text-[#274dea] mt-auto"
          >
            <ArrowUpRight className="w-4 h-4" />
            Lihat proyek
          </a>
        )}
      </div>
    </article>
  );
}

// Skill tag component
function SkillTag({ skill }: { skill: string }) {
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-zinc-100 text-zinc-700 border border-zinc-200">
      {skill}
    </span>
  );
}

// Experience card
function ExperienceCard({ exp }: { exp: WebProject }) {
  return (
    <article className="card p-6 flex flex-col">
      <div className="flex items-center gap-3 mb-3">
        <Briefcase className="w-6 h-6 text-zinc-500" />
        <div>
          <h3 className="font-bold text-zinc-900 text-lg">{exp.title}</h3>
          <p className="text-sm text-zinc-500">{exp.category}</p>
        </div>
      </div>
      {exp.description && <p className="text-zinc-600 text-sm flex-1">{exp.description}</p>}
    </article>
  );
}

export function ModularPortfolio({ data }: { data: WebPortfolio }) {
  const { name, role, headline, bio, location, email, website, avatar, available, skills, projects, socials } = data;

  // Calculate stats from projects and experience
  const projectCount = projects?.length ?? 0;
  const experienceCount = projects?.filter((p) => p.category?.toLowerCase().includes("experience") || p.category?.toLowerCase().includes("work")).length ?? 0;
  const totalYears = 7; // Could be derived from data in future

  return (
    <div className="pw pw-modular min-h-screen">
      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-zinc-200">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <a href="#home" className="font-bold text-xl text-zinc-900">
                {name || "Portfolio"}
              </a>
              <div className="hidden md:flex items-center gap-6">
                <a href="#projects" className="text-sm font-medium text-zinc-700 hover:text-zinc-900 transition-colors">Projects</a>
                <a href="#experience" className="text-sm font-medium text-zinc-700 hover:text-zinc-900 transition-colors">Experience</a>
                <a href="#about" className="text-sm font-medium text-zinc-700 hover:text-zinc-900 transition-colors">About</a>
                <a href="#skills" className="text-sm font-medium text-zinc-700 hover:text-zinc-900 transition-colors">Skills</a>
                <a href="#contact" className="text-sm font-medium text-zinc-700 hover:text-zinc-900 transition-colors">Contact</a>
              </div>
            </div>
            {available && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full bg-green-50 text-green-700 border border-green-100">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                Available for work
              </span>
            )}
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section id="home" className="hero min-h-screen flex items-center justify-center pt-16">
        <div className="max-w-4xl w-full px-4">
          {avatar && (
            <img
              src={portfolioImageUrl(avatar)}
              alt={name ? `${name}'s portrait` : "Portrait"}
              className="w-32 h-32 md:w-40 md:h-40 mx-auto mb-8"
            />
          )}
          <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-6">
            {headline || role || "UI UX Designer / Full Stack Coder"}
          </h1>
          {bio && (
            <p className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed">
              {bio}
            </p>
          )}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-10">
            {email && (
              <a
                href={`mailto:${email}`}
                className="cta inline-flex items-center gap-2"
              >
                <Mail className="w-5 h-5" />
                Let&apos;s Talk
              </a>
            )}
            {website && (
              <a
                href={website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full border-2 border-white text-white font-medium hover:bg-white/10 transition-colors"
              >
                <ArrowUpRight className="w-5 h-5" />
                View Website
              </a>
            )}
          </div>
          {socials?.length && <SocialLinks socials={socials} />}
        </div>
      </section>

      {/* Work Experience Stats */}
      <section className="py-16 px-4 bg-white/5" aria-labelledby="stats-heading">
        <div className="max-w-7xl mx-auto">
          <h2 id="stats-heading" className="sr-only">Work Experience Stats</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard value="07" label="Years Experience" />
            <StatCard value={String(projectCount).padStart(2, "0")} label="Projects Completed" />
            <StatCard value={String(experienceCount + 12).padStart(2, "0")} label="Clients Served" />
            <StatCard value="4.8" label="Client Rating" />
          </div>
        </div>
      </section>

      {/* My Services / Projects */}
      <section id="projects" className="py-20 px-4" aria-labelledby="projects-heading">
        <div className="max-w-7xl mx-auto">
          <header className="mb-12">
            <h2 id="projects-heading" className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">
              My Projects
            </h2>
            <p className="text-zinc-600 text-lg max-w-2xl">
              Selected work showcasing design and development expertise across various industries.
            </p>
          </header>
          {projects?.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <div className="card text-center py-12">
              <p className="text-zinc-600">No projects added yet. Add projects in the portfolio editor.</p>
            </div>
          )}
        </div>
      </section>

      {/* Work Experience */}
      <section id="experience" className="py-20 px-4 bg-white/5" aria-labelledby="experience-heading">
        <div className="max-w-7xl mx-auto">
          <header className="mb-12">
            <h2 id="experience-heading" className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">
              Work Experience
            </h2>
            <p className="text-zinc-600 text-lg max-w-2xl">
              Professional journey and key roles that shaped my career.
            </p>
          </header>
          {projects?.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects
                .filter((p) => p.category?.toLowerCase().includes("experience") || p.category?.toLowerCase().includes("work") || p.category?.toLowerCase().includes("job"))
                .map((exp) => (
                  <ExperienceCard key={exp.id} exp={exp} />
                ))}
            </div>
          ) : (
            <div className="card text-center py-12">
              <p className="text-zinc-600">No work experience added yet. Add experience as projects in the portfolio editor.</p>
            </div>
          )}
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-20 px-4" aria-labelledby="about-heading">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <h2 id="about-heading" className="text-3xl md:text-4xl font-bold text-zinc-900 mb-6">
                About Me
              </h2>
              {bio && (
                <div className="prose prose-zinc max-w-none">
                  <p className="text-zinc-600 text-lg leading-relaxed mb-6">{bio}</p>
                  {location && (
                    <p className="text-zinc-500 flex items-center gap-2">
                      <MapPin className="w-5 h-5 flex-shrink-0" />
                      {location}
                    </p>
                  )}
                  {email && (
                    <p className="text-zinc-500 flex items-center gap-2 mt-2">
                      <Mail className="w-5 h-5 flex-shrink-0" />
                      <a href={`mailto:${email}`} className="hover:text-zinc-900 transition-colors">{email}</a>
                    </p>
                  )}
                  {website && (
                    <p className="text-zinc-500 flex items-center gap-2 mt-2">
                      <ArrowUpRight className="w-5 h-5 flex-shrink-0" />
                      <a href={website} target="_blank" rel="noopener noreferrer" className="hover:text-zinc-900 transition-colors">{website}</a>
                    </p>
                  )}
                </div>
              )}
            </div>
            {avatar && (
              <div className="relative aspect-square max-w-md mx-auto lg:mx-0">
                <img
                  src={portfolioImageUrl(avatar)}
                  alt={name ? `${name}'s portrait` : "Portrait"}
                  className="w-full h-full object-cover rounded-xl shadow-xl"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Skills / Expertise */}
      <section id="skills" className="py-20 px-4 bg-white/5" aria-labelledby="skills-heading">
        <div className="max-w-7xl mx-auto">
          <header className="mb-12">
            <h2 id="skills-heading" className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">
              Expertise & Skills
            </h2>
            <p className="text-zinc-600 text-lg max-w-2xl">
              Technologies and disciplines I work with regularly.
            </p>
          </header>
          {skills?.length ? (
            <div className="flex flex-wrap gap-3" role="list" aria-label="Skills">
              {skills.map((skill) => (
                <SkillTag key={skill} skill={skill} />
              ))}
            </div>
          ) : (
            <div className="card text-center py-12">
              <p className="text-zinc-600">No skills added yet. Add skills in the portfolio editor.</p>
            </div>
          )}
        </div>
      </section>

      {/* Contact / CTA */}
      <section id="contact" className="py-20 px-4" aria-labelledby="contact-heading">
        <div className="max-w-3xl mx-auto text-center">
          <h2 id="contact-heading" className="text-3xl md:text-4xl font-bold text-zinc-900 mb-6">
            Have a Project? Let&apos;s Talk
          </h2>
          <p className="text-zinc-600 text-lg mb-10 max-w-xl mx-auto">
            I&apos;m always open to discussing new projects, creative ideas, or opportunities to be part of your vision.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {email && (
              <a
                href={`mailto:${email}`}
                className="cta inline-flex items-center gap-2 text-lg px-8 py-4"
              >
                <Mail className="w-6 h-6" />
                Get In Touch
              </a>
            )}
            {socials?.length && (
              <div className="flex items-center gap-4" role="list" aria-label="Social links">
                {socials.map((s) => {
                  const Icon = socialIcon(s.network);
                  return (
                    <a
                      key={s.network}
                      href={socialLinkUrl(s.network, s.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center w-12 h-12 rounded-full border border-zinc-300 hover:border-zinc-500 hover:bg-zinc-50 transition-colors"
                      aria-label={SOCIAL_NETWORKS.find((n) => n.id === s.network)?.label ?? s.network}
                    >
                      <Icon className="w-6 h-6 text-zinc-700" />
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-white/10">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-zinc-500 text-sm">
            &copy; {new Date().getFullYear()} {name || "Portfolio"}. Built with modular design.
          </p>
        </div>
      </footer>
    </div>
  );
}
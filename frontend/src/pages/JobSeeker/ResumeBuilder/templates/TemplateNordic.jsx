import React from "react";
import { DEFAULT_SECTION_ORDER, DEFAULT_SECTION_VISIBILITY } from "../sectionConfig";

const Link = ({ href, children }) =>
  href ? (
    <a
      href={href.startsWith("http") ? href : `https://${href}`}
      target="_blank"
      rel="noopener noreferrer"
      className="text-stone-700 underline underline-offset-4 decoration-stone-300 hover:decoration-stone-700 transition-colors"
    >
      {children}
    </a>
  ) : (
    <span>{children}</span>
  );

const TemplateNordic = ({ data }) => {
  const {
    personalInfo = {},
    summary = "",
    experience = [],
    education = [],
    skills = [],
    projects = [],
    certifications = [],
    sectionOrder = DEFAULT_SECTION_ORDER,
    sectionVisibility = DEFAULT_SECTION_VISIBILITY,
  } = data || {};

  const { fullName, jobTitle, email, phone, location, linkedin, website } = personalInfo;

  const order = sectionOrder && sectionOrder.length > 0 ? sectionOrder : DEFAULT_SECTION_ORDER;
  const visibility = { ...DEFAULT_SECTION_VISIBILITY, ...(sectionVisibility || {}) };

  const sections = {
    summary: summary && visibility.summary !== false && (
      <div key="summary" className="max-w-2xl mx-auto mb-9 text-center">
        <p className="text-xs text-stone-600 leading-relaxed font-light italic">
          "{summary}"
        </p>
      </div>
    ),

    experience: experience.length > 0 && visibility.experience !== false && (
      <div key="experience" className="mb-9">
        <div className="flex items-center gap-3 mb-5">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-900">
            Experience
          </h2>
          <div className="flex-1 h-px bg-stone-200" />
        </div>

        <div className="space-y-6">
          {experience.map((exp, i) => (
            <div key={i} className="space-y-1.5">
              <div className="flex items-baseline justify-between flex-wrap gap-2">
                <div className="flex items-baseline gap-2">
                  <h3 className="text-sm font-medium text-stone-900">{exp.title || "Job Title"}</h3>
                  <span className="text-xs text-stone-500 font-light">at {exp.company}</span>
                </div>
                <span className="text-[11px] text-stone-400 font-light tracking-wide">
                  {exp.startDate}{exp.endDate ? ` — ${exp.endDate}` : exp.current ? " — Present" : ""}
                  {exp.location ? ` | ${exp.location}` : ""}
                </span>
              </div>
              {exp.description && (
                <p className="text-xs text-stone-600 leading-relaxed font-light whitespace-pre-line pl-0.5">
                  {exp.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    ),

    education: education.length > 0 && visibility.education !== false && (
      <div key="education" className="mb-9">
        <div className="flex items-center gap-3 mb-5">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-900">
            Education
          </h2>
          <div className="flex-1 h-px bg-stone-200" />
        </div>

        <div className="space-y-4">
          {education.map((edu, i) => (
            <div key={i} className="flex items-baseline justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-sm font-medium text-stone-900">{edu.degree}</h3>
                <p className="text-xs text-stone-500 font-light">
                  {edu.school}{edu.location ? `, ${edu.location}` : ""}
                  {edu.gpa && <span className="ml-2 text-stone-400">• GPA {edu.gpa}</span>}
                </p>
              </div>
              <span className="text-[11px] text-stone-400 font-light">
                {edu.startDate}{edu.endDate ? ` — ${edu.endDate}` : ""}
              </span>
            </div>
          ))}
        </div>
      </div>
    ),

    projects: projects.length > 0 && visibility.projects !== false && (
      <div key="projects" className="mb-9">
        <div className="flex items-center gap-3 mb-5">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-900">
            Projects
          </h2>
          <div className="flex-1 h-px bg-stone-200" />
        </div>

        <div className="space-y-5">
          {projects.map((proj, i) => (
            <div key={i} className="space-y-1">
              <div className="flex items-baseline justify-between flex-wrap gap-2">
                <h3 className="text-sm font-medium text-stone-900">{proj.name}</h3>
                {proj.link && (
                  <span className="text-xs font-light">
                    <Link href={proj.link}>View Project ↗</Link>
                  </span>
                )}
              </div>
              {proj.technologies?.length > 0 && (
                <p className="text-[11px] text-stone-400 font-light">
                  {Array.isArray(proj.technologies) ? proj.technologies.join(" · ") : proj.technologies}
                </p>
              )}
              {proj.description && (
                <p className="text-xs text-stone-600 leading-relaxed font-light">
                  {proj.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    ),

    skills: skills.length > 0 && visibility.skills !== false && (
      <div key="skills" className="mb-8">
        <div className="flex items-center gap-3 mb-3.5">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-900">
            Skills & Competencies
          </h2>
          <div className="flex-1 h-px bg-stone-200" />
        </div>
        <div className="flex flex-wrap gap-2">
          {skills.map((skill, sIdx) => (
            <span
              key={sIdx}
              className="text-xs font-light text-stone-700 bg-stone-200/60 border border-stone-200 px-2.5 py-1 rounded-full"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
    ),

    certifications: certifications.length > 0 && visibility.certifications !== false && (
      <div key="certifications" className="mb-8">
        <div className="flex items-center gap-3 mb-3.5">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-900">
            Certifications
          </h2>
          <div className="flex-1 h-px bg-stone-200" />
        </div>
        <div className="space-y-1.5">
          {certifications.map((cert, i) => (
            <p key={i} className="text-xs text-stone-700 font-light">
              <span className="font-medium text-stone-900">{cert.name}</span>
              {cert.issuer && ` — ${cert.issuer}`}
              {cert.date && <span className="text-stone-400 ml-1.5">({cert.date})</span>}
            </p>
          ))}
        </div>
      </div>
    ),
  };

  return (
    <div
      className="bg-[#faf9f6] w-full text-stone-800 px-12 pt-12 pb-20 min-h-[1123px]"
      style={{ fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif" }}
    >
      {/* Nordic Centered & Airy Header */}
      <div className="text-center max-w-xl mx-auto mb-10">
        <h1 className="text-3xl sm:text-4xl font-light tracking-wide text-stone-900 mb-2">
          {fullName || "Your Name"}
        </h1>
        {jobTitle && (
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-stone-500 mb-4">
            {jobTitle}
          </p>
        )}
        <div className="flex flex-wrap justify-center items-center gap-x-3 gap-y-1 text-xs text-stone-500 font-light">
          {email && <span>{email}</span>}
          {phone && <span>• {phone}</span>}
          {location && <span>• {location}</span>}
          {linkedin && <span>• <Link href={linkedin}>LinkedIn</Link></span>}
          {website && <span>• <Link href={website}>Portfolio</Link></span>}
        </div>
      </div>

      <div className="w-16 h-px bg-stone-300 mx-auto mb-9" />

      {/* Dynamic Ordered & Visible Sections */}
      {order.map(key => sections[key] || null)}
    </div>
  );
};

export default TemplateNordic;

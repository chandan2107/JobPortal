import React from "react";
import { DEFAULT_SECTION_ORDER, DEFAULT_SECTION_VISIBILITY } from "../sectionConfig";

const Link = ({ href, children }) =>
  href ? (
    <a
      href={href.startsWith("http") ? href : `https://${href}`}
      target="_blank"
      rel="noopener noreferrer"
      className="italic hover:underline text-neutral-800"
    >
      {children}
    </a>
  ) : (
    <span>{children}</span>
  );

const TemplateEditorial = ({ data }) => {
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
      <div key="summary" className="mb-7">
        <p className="text-xs text-neutral-700 leading-relaxed italic text-center max-w-2xl mx-auto">
          {summary}
        </p>
      </div>
    ),

    experience: experience.length > 0 && visibility.experience !== false && (
      <div key="experience" className="mb-7">
        <div className="border-b border-neutral-400 pb-1 mb-4 flex items-baseline justify-between">
          <h2 className="text-xs font-bold uppercase tracking-[0.25em] text-neutral-900 font-sans">
            Professional Experience
          </h2>
        </div>

        <div className="space-y-5">
          {experience.map((exp, i) => (
            <div key={i}>
              <div className="flex items-baseline justify-between flex-wrap gap-1">
                <div>
                  <h3 className="text-sm font-bold text-neutral-950 inline">
                    {exp.company}
                  </h3>
                  <span className="text-sm italic text-neutral-600 ml-2">
                    — {exp.title || "Job Title"}
                  </span>
                </div>
                <span className="text-xs text-neutral-500 font-sans">
                  {exp.startDate}{exp.endDate ? ` – ${exp.endDate}` : exp.current ? " – Present" : ""}
                  {exp.location ? ` | ${exp.location}` : ""}
                </span>
              </div>
              {exp.description && (
                <p className="text-xs text-neutral-700 mt-1.5 leading-relaxed font-sans pl-1 whitespace-pre-line">
                  {exp.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    ),

    education: education.length > 0 && visibility.education !== false && (
      <div key="education" className="mb-7">
        <div className="border-b border-neutral-400 pb-1 mb-4">
          <h2 className="text-xs font-bold uppercase tracking-[0.25em] text-neutral-900 font-sans">
            Education
          </h2>
        </div>

        <div className="space-y-3.5">
          {education.map((edu, i) => (
            <div key={i} className="flex items-baseline justify-between flex-wrap gap-1">
              <div>
                <h3 className="text-sm font-bold text-neutral-950 inline">
                  {edu.school}
                </h3>
                <span className="text-sm italic text-neutral-600 ml-2">
                  — {edu.degree}
                </span>
                {edu.gpa && <span className="text-xs text-neutral-500 font-sans ml-2">(GPA: {edu.gpa})</span>}
              </div>
              <span className="text-xs text-neutral-500 font-sans">
                {edu.startDate}{edu.endDate ? ` – ${edu.endDate}` : ""}
              </span>
            </div>
          ))}
        </div>
      </div>
    ),

    projects: projects.length > 0 && visibility.projects !== false && (
      <div key="projects" className="mb-7">
        <div className="border-b border-neutral-400 pb-1 mb-4">
          <h2 className="text-xs font-bold uppercase tracking-[0.25em] text-neutral-900 font-sans">
            Key Projects
          </h2>
        </div>

        <div className="space-y-4">
          {projects.map((proj, i) => (
            <div key={i}>
              <div className="flex items-baseline justify-between flex-wrap gap-1">
                <h3 className="text-sm font-bold text-neutral-950">
                  {proj.name}
                </h3>
                {proj.link && <span className="text-xs font-sans"><Link href={proj.link}>Link ↗</Link></span>}
              </div>
              {proj.technologies?.length > 0 && (
                <p className="text-[11px] text-neutral-500 italic">
                  {Array.isArray(proj.technologies) ? proj.technologies.join(", ") : proj.technologies}
                </p>
              )}
              {proj.description && (
                <p className="text-xs text-neutral-700 mt-1 leading-relaxed font-sans">
                  {proj.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    ),

    skills: skills.length > 0 && visibility.skills !== false && (
      <div key="skills" className="mb-7">
        <div className="border-b border-neutral-400 pb-1 mb-2">
          <h2 className="text-xs font-bold uppercase tracking-[0.25em] text-neutral-900 font-sans">
            Core Competencies
          </h2>
        </div>
        <p className="text-xs text-neutral-700 leading-relaxed font-sans">
          {skills.join(" • ")}
        </p>
      </div>
    ),

    certifications: certifications.length > 0 && visibility.certifications !== false && (
      <div key="certifications" className="mb-7">
        <div className="border-b border-neutral-400 pb-1 mb-2">
          <h2 className="text-xs font-bold uppercase tracking-[0.25em] text-neutral-900 font-sans">
            Honors & Certifications
          </h2>
        </div>
        <div className="space-y-1">
          {certifications.map((cert, i) => (
            <p key={i} className="text-xs text-neutral-700 font-sans">
              <span className="font-semibold text-neutral-900">{cert.name}</span>
              {cert.issuer && ` — ${cert.issuer}`}
              {cert.date && <span className="text-neutral-500 ml-1.5">({cert.date})</span>}
            </p>
          ))}
        </div>
      </div>
    ),
  };

  return (
    <div
      className="bg-white w-full text-neutral-900 px-14 pt-12 pb-20 min-h-[1123px]"
      style={{ fontFamily: "'Newsreader', 'Georgia', Cambria, 'Times New Roman', serif" }}
    >
      {/* Centered Editorial Header */}
      <div className="text-center pb-6 mb-7 border-b border-neutral-900">
        <h1 className="text-4xl font-normal tracking-wide text-neutral-950 mb-1.5 uppercase">
          {fullName || "Your Name"}
        </h1>
        {jobTitle && (
          <p className="text-sm italic tracking-widest text-neutral-600 font-sans uppercase mb-3">
            {jobTitle}
          </p>
        )}
        <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-1 text-xs text-neutral-600 font-sans tracking-wide">
          {location && <span>{location}</span>}
          {email && <span>• {email}</span>}
          {phone && <span>• {phone}</span>}
          {linkedin && <span>• <Link href={linkedin}>LinkedIn</Link></span>}
          {website && <span>• <Link href={website}>Portfolio</Link></span>}
        </div>
      </div>

      {/* Dynamic Ordered & Visible Sections */}
      {order.map(key => sections[key] || null)}
    </div>
  );
};

export default TemplateEditorial;

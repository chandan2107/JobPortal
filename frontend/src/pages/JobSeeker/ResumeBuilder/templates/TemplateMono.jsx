import React from "react";
import { DEFAULT_SECTION_ORDER, DEFAULT_SECTION_VISIBILITY } from "../sectionConfig";

const Link = ({ href, children }) =>
  href ? (
    <a
      href={href.startsWith("http") ? href : `https://${href}`}
      target="_blank"
      rel="noopener noreferrer"
      className="underline hover:text-black font-mono transition-colors"
    >
      {children}
    </a>
  ) : (
    <span>{children}</span>
  );

const TemplateMono = ({ data }) => {
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
      <div key="summary" className="mb-6">
        <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
          # ABOUT / SUMMARY
        </div>
        <p className="text-xs text-neutral-700 leading-relaxed font-sans font-normal border-l-2 border-neutral-300 pl-3 py-0.5">
          {summary}
        </p>
      </div>
    ),

    experience: experience.length > 0 && visibility.experience !== false && (
      <div key="experience" className="mb-6">
        <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-3 border-b border-neutral-200 pb-1">
          # WORK_EXPERIENCE ({experience.length})
        </div>
        <div className="space-y-5">
          {experience.map((exp, i) => (
            <div key={i} className="text-xs">
              <div className="flex items-baseline justify-between flex-wrap gap-1 font-mono">
                <span className="font-bold text-neutral-950">
                  {exp.title || "Job Title"} <span className="font-normal text-neutral-500">@ {exp.company}</span>
                </span>
                <span className="text-[11px] text-neutral-400">
                  [{exp.startDate}{exp.endDate ? ` .. ${exp.endDate}` : exp.current ? " .. now" : ""}]
                  {exp.location ? ` | ${exp.location}` : ""}
                </span>
              </div>
              {exp.description && (
                <p className="font-sans text-xs text-neutral-600 mt-1.5 leading-relaxed pl-2 whitespace-pre-line border-l border-neutral-200">
                  {exp.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    ),

    projects: projects.length > 0 && visibility.projects !== false && (
      <div key="projects" className="mb-6">
        <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-3 border-b border-neutral-200 pb-1">
          # FEATURED_PROJECTS ({projects.length})
        </div>
        <div className="space-y-4">
          {projects.map((proj, i) => (
            <div key={i} className="text-xs">
              <div className="flex items-baseline justify-between flex-wrap gap-1 font-mono">
                <span className="font-bold text-neutral-950">{proj.name}</span>
                {proj.link && <span className="text-[11px]"><Link href={proj.link}>src ↗</Link></span>}
              </div>
              {proj.technologies?.length > 0 && (
                <p className="text-[10px] text-neutral-500 font-mono mt-0.5">
                  stack: [{Array.isArray(proj.technologies) ? proj.technologies.join(", ") : proj.technologies}]
                </p>
              )}
              {proj.description && (
                <p className="font-sans text-xs text-neutral-600 mt-1 leading-relaxed pl-2 border-l border-neutral-200">
                  {proj.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    ),

    skills: skills.length > 0 && visibility.skills !== false && (
      <div key="skills" className="mb-6">
        <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-2 border-b border-neutral-200 pb-1">
          # TECH_STACK & SKILLS
        </div>
        <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
          {skills.map((skill, sIdx) => (
            <span
              key={sIdx}
              className="bg-neutral-100 text-neutral-800 px-2 py-0.5 rounded border border-neutral-200"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
    ),

    education: education.length > 0 && visibility.education !== false && (
      <div key="education" className="mb-6">
        <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-3 border-b border-neutral-200 pb-1">
          # EDUCATION
        </div>
        <div className="space-y-3 font-mono text-xs">
          {education.map((edu, i) => (
            <div key={i} className="flex items-baseline justify-between flex-wrap gap-1">
              <div>
                <span className="font-bold text-neutral-900">{edu.degree}</span>
                <span className="text-neutral-500 font-normal"> — {edu.school}{edu.location ? `, ${edu.location}` : ""}</span>
                {edu.gpa && <span className="text-neutral-400 text-[11px] ml-2">[GPA: {edu.gpa}]</span>}
              </div>
              <span className="text-[11px] text-neutral-400">
                {edu.startDate}{edu.endDate ? ` .. ${edu.endDate}` : ""}
              </span>
            </div>
          ))}
        </div>
      </div>
    ),

    certifications: certifications.length > 0 && visibility.certifications !== false && (
      <div key="certifications" className="mb-6">
        <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-2 border-b border-neutral-200 pb-1">
          # CREDENTIALS & ACHIEVEMENTS
        </div>
        <div className="space-y-1 font-mono text-xs">
          {certifications.map((cert, i) => (
            <p key={i} className="text-neutral-700">
              &gt; <span className="font-semibold text-neutral-900">{cert.name}</span>
              {cert.issuer && ` / ${cert.issuer}`}
              {cert.date && <span className="text-neutral-400 ml-2">({cert.date})</span>}
            </p>
          ))}
        </div>
      </div>
    ),
  };

  return (
    <div
      className="bg-white w-full text-neutral-900 px-12 pt-11 pb-20 min-h-[1123px]"
      style={{ fontFamily: "'JetBrains Mono', 'SF Mono', Consolas, 'Fira Code', monospace" }}
    >
      {/* Tech Mono Minimalist Header */}
      <div className="border-b border-neutral-300 pb-5 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
          <div>
            
            <h1 className="text-3xl font-bold tracking-tight text-neutral-950 mt-1">
              {fullName || "Your Name"}
            </h1>
            {jobTitle && (
              <p className="text-xs text-neutral-600 font-medium mt-1">
                &gt; {jobTitle}
              </p>
            )}
          </div>
          <div className="text-xs text-neutral-500 space-y-0.5 sm:text-right">
            {email && <p>{email}</p>}
            {phone && <p>{phone}</p>}
            {location && <p>{location}</p>}
            <div className="flex sm:justify-end gap-3 text-[11px] text-neutral-700 pt-0.5">
              {linkedin && <Link href={linkedin}>[linkedin]</Link>}
              {website && <Link href={website}>[portfolio]</Link>}
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Ordered & Visible Sections */}
      {order.map(key => sections[key] || null)}
    </div>
  );
};

export default TemplateMono;

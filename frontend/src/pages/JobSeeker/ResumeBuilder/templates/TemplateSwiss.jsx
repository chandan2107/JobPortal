import React from "react";
import { DEFAULT_SECTION_ORDER, DEFAULT_SECTION_VISIBILITY } from "../sectionConfig";

const Link = ({ href, children }) =>
  href ? (
    <a
      href={href.startsWith("http") ? href : `https://${href}`}
      target="_blank"
      rel="noopener noreferrer"
      className="underline underline-offset-2 hover:text-black transition-colors"
    >
      {children}
    </a>
  ) : (
    <span>{children}</span>
  );

const TemplateSwiss = ({ data }) => {
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
      <div key="summary" className="mb-7 grid grid-cols-[140px_1fr] gap-6 items-start">
        <span className="text-[11px] font-black uppercase tracking-widest text-zinc-400">
          Profile
        </span>
        <p className="text-xs text-zinc-700 leading-relaxed font-normal">
          {summary}
        </p>
      </div>
    ),

    experience: experience.length > 0 && visibility.experience !== false && (
      <div key="experience" className="mb-7">
        <div className="border-t border-zinc-200 pt-3 mb-4 flex items-center justify-between">
          <h2 className="text-[11px] font-black uppercase tracking-widest text-zinc-900">
            Experience
          </h2>
          <span className="text-[10px] text-zinc-400 font-mono">Work History</span>
        </div>

        <div className="space-y-6">
          {experience.map((exp, i) => (
            <div key={i} className="grid grid-cols-[140px_1fr] gap-6">
              <div className="text-xs text-zinc-400 font-mono pt-0.5">
                <p>{exp.startDate}{exp.endDate ? ` — ${exp.endDate}` : exp.current ? " — Present" : ""}</p>
                {exp.location && <p className="text-zinc-500 text-[11px] mt-0.5">{exp.location}</p>}
              </div>
              <div>
                <div className="flex items-baseline justify-between">
                  <h3 className="text-sm font-bold text-zinc-900 tracking-tight">
                    {exp.title || "Job Title"}
                  </h3>
                  <span className="text-xs font-semibold text-zinc-600">{exp.company}</span>
                </div>
                {exp.description && (
                  <p className="text-xs text-zinc-600 mt-2 leading-relaxed whitespace-pre-line">
                    {exp.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    ),

    education: education.length > 0 && visibility.education !== false && (
      <div key="education" className="mb-7">
        <div className="border-t border-zinc-200 pt-3 mb-4 flex items-center justify-between">
          <h2 className="text-[11px] font-black uppercase tracking-widest text-zinc-900">
            Education
          </h2>
          <span className="text-[10px] text-zinc-400 font-mono">Academic</span>
        </div>

        <div className="space-y-4">
          {education.map((edu, i) => (
            <div key={i} className="grid grid-cols-[140px_1fr] gap-6">
              <div className="text-xs text-zinc-400 font-mono pt-0.5">
                {edu.startDate}{edu.endDate ? ` — ${edu.endDate}` : ""}
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-900">{edu.degree}</h3>
                <p className="text-xs text-zinc-600 mt-0.5">
                  {edu.school}{edu.location ? `, ${edu.location}` : ""}
                  {edu.gpa && <span className="ml-2 font-mono text-zinc-400">• GPA {edu.gpa}</span>}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),

    projects: projects.length > 0 && visibility.projects !== false && (
      <div key="projects" className="mb-7">
        <div className="border-t border-zinc-200 pt-3 mb-4 flex items-center justify-between">
          <h2 className="text-[11px] font-black uppercase tracking-widest text-zinc-900">
            Selected Works
          </h2>
          <span className="text-[10px] text-zinc-400 font-mono">Projects</span>
        </div>

        <div className="space-y-4">
          {projects.map((proj, i) => (
            <div key={i} className="grid grid-cols-[140px_1fr] gap-6">
              <div className="text-xs text-zinc-400 font-mono pt-0.5">
                {proj.link ? <Link href={proj.link}>View ↗</Link> : `Project 0${i + 1}`}
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-sm font-bold text-zinc-900">{proj.name}</h3>
                </div>
                {proj.technologies?.length > 0 && (
                  <p className="text-[11px] font-mono text-zinc-500 mt-0.5">
                    [{Array.isArray(proj.technologies) ? proj.technologies.join(" / ") : proj.technologies}]
                  </p>
                )}
                {proj.description && (
                  <p className="text-xs text-zinc-600 mt-1.5 leading-relaxed">
                    {proj.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    ),

    skills: skills.length > 0 && visibility.skills !== false && (
      <div key="skills" className="mb-7">
        <div className="border-t border-zinc-200 pt-3 mb-3 flex items-center justify-between">
          <h2 className="text-[11px] font-black uppercase tracking-widest text-zinc-900">
            Capabilities
          </h2>
          <span className="text-[10px] text-zinc-400 font-mono">Competencies</span>
        </div>
        <div className="grid grid-cols-[140px_1fr] gap-6">
          <span className="text-xs text-zinc-400 font-mono">Technical</span>
          <div className="flex flex-wrap gap-1.5">
            {skills.map((skill, sIdx) => (
              <span
                key={sIdx}
                className="text-[11px] font-medium text-zinc-800 bg-zinc-100 px-2 py-0.5 rounded-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
    ),

    certifications: certifications.length > 0 && visibility.certifications !== false && (
      <div key="certifications" className="mb-7">
        <div className="border-t border-zinc-200 pt-3 mb-3 flex items-center justify-between">
          <h2 className="text-[11px] font-black uppercase tracking-widest text-zinc-900">
            Honors & Certs
          </h2>
          <span className="text-[10px] text-zinc-400 font-mono">Credentials</span>
        </div>
        <div className="grid grid-cols-[140px_1fr] gap-6">
          <span className="text-xs text-zinc-400 font-mono">Verified</span>
          <div className="space-y-1">
            {certifications.map((cert, i) => (
              <p key={i} className="text-xs text-zinc-700">
                <span className="font-semibold text-zinc-900">{cert.name}</span>
                {cert.issuer && ` — ${cert.issuer}`}
                {cert.date && <span className="text-zinc-400 font-mono ml-2">({cert.date})</span>}
              </p>
            ))}
          </div>
        </div>
      </div>
    ),
  };

  return (
    <div
      className="bg-white w-full text-zinc-900 px-12 pt-11 pb-20 min-h-[1123px]"
      style={{ fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}
    >
      {/* Swiss Asymmetric Header */}
      <div className="border-b-2 border-zinc-900 pb-6 mb-7">
        <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-zinc-950 uppercase">
              {fullName || "Your Name"}
            </h1>
            {jobTitle && (
              <p className="text-sm font-semibold tracking-wider text-zinc-600 uppercase mt-1">
                {jobTitle}
              </p>
            )}
          </div>
          <div className="flex flex-wrap md:flex-col md:items-end gap-x-4 gap-y-1 text-xs font-medium text-zinc-500">
            {email && <span>{email}</span>}
            {phone && <span>{phone}</span>}
            {location && <span>{location}</span>}
            {linkedin && <Link href={linkedin}>LinkedIn</Link>}
            {website && <Link href={website}>Portfolio</Link>}
          </div>
        </div>
      </div>

      {/* Dynamic Ordered & Visible Sections */}
      {order.map(key => sections[key] || null)}
    </div>
  );
};

export default TemplateSwiss;

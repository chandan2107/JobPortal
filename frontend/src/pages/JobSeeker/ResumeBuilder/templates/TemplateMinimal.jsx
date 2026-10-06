import React from "react";
import { DEFAULT_SECTION_ORDER, DEFAULT_SECTION_VISIBILITY } from "../sectionConfig";

const Link = ({ href, children }) =>
  href ? (
    <a href={href.startsWith("http") ? href : `https://${href}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
      {children}
    </a>
  ) : <span>{children}</span>;

const TemplateMinimal = ({ data }) => {
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
        <p className="text-sm text-gray-600 leading-relaxed max-w-2xl">{summary}</p>
      </div>
    ),

    experience: experience.length > 0 && visibility.experience !== false && (
      <div key="experience" className="mb-6">
        <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-4">Experience</h2>
        <div className="space-y-5">
          {experience.map((exp, i) => (
            <div key={i} className="grid grid-cols-[150px_1fr] gap-6">
              <div className="text-xs text-gray-400 pt-0.5">
                <p>{exp.startDate}{exp.endDate ? ` – ${exp.endDate}` : exp.current ? " – Now" : ""}</p>
                {exp.location && <p className="mt-0.5">{exp.location}</p>}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">{exp.title || "Job Title"}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{exp.company}</p>
                {exp.description && <p className="text-xs text-gray-600 mt-1.5 leading-relaxed whitespace-pre-line">{exp.description}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    ),

    education: education.length > 0 && visibility.education !== false && (
      <div key="education" className="mb-6">
        <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-4">Education</h2>
        <div className="space-y-4">
          {education.map((edu, i) => (
            <div key={i} className="grid grid-cols-[150px_1fr] gap-6">
              <div className="text-xs text-gray-400 pt-0.5">{edu.startDate}{edu.endDate ? ` – ${edu.endDate}` : ""}</div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">{edu.degree}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{edu.school}{edu.location ? `, ${edu.location}` : ""}</p>
                {edu.gpa && <p className="text-xs text-gray-400 mt-0.5">GPA: {edu.gpa}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    ),

    projects: projects.length > 0 && visibility.projects !== false && (
      <div key="projects" className="mb-6">
        <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-4">Projects</h2>
        <div className="space-y-4">
          {projects.map((proj, i) => (
            <div key={i}>
              <div className="flex items-baseline gap-3 flex-wrap">
                <h3 className="text-sm font-semibold text-gray-900">{proj.name}</h3>
                {proj.link && <Link href={proj.link}><span className="text-xs text-gray-500 underline underline-offset-2">View Project</span></Link>}
              </div>
              {proj.technologies?.length > 0 && (
                <p className="text-xs text-gray-400 mt-0.5">
                  {Array.isArray(proj.technologies) ? proj.technologies.join(" · ") : proj.technologies}
                </p>
              )}
              {proj.description && <p className="text-xs text-gray-600 mt-1 leading-relaxed">{proj.description}</p>}
            </div>
          ))}
        </div>
      </div>
    ),

    skills: skills.length > 0 && visibility.skills !== false && (
      <div key="skills" className="mb-6">
        <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2">Skills</h2>
        <p className="text-sm text-gray-600">{skills.join(", ")}</p>
      </div>
    ),

    certifications: certifications.length > 0 && visibility.certifications !== false && (
      <div key="certifications" className="mb-5">
        <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-3">Certifications & Achievements</h2>
        <div className="space-y-1.5">
          {certifications.map((cert, i) => (
            <p key={i} className="text-sm text-gray-700">
              {cert.name}
              {cert.type === "hackathon" && <span className="ml-2 text-[10px] text-orange-600 font-semibold">[Hackathon]</span>}
              {cert.issuer ? ` — ${cert.issuer}` : ""}
              {cert.date ? ` (${cert.date})` : ""}
            </p>
          ))}
        </div>
      </div>
    ),
  };

  return (
    <div className="bg-white w-full px-12 pt-10 pb-20 min-h-[1123px]" style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
      {/* Header */}
      <div className="mb-7">
        <h1 className="text-5xl font-light text-gray-900 tracking-tight">
          {fullName || "Your Name"}
        </h1>
        {jobTitle && <p className="text-sm text-gray-500 mt-1.5 tracking-wide">{jobTitle}</p>}
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-xs text-gray-500">
          {email && <span>{email}</span>}
          {phone && <span>{phone}</span>}
          {location && <span>{location}</span>}
          {linkedin && <Link href={linkedin}><span className="text-gray-700 underline underline-offset-2">LinkedIn</span></Link>}
          {website && <Link href={website}><span className="text-gray-700 underline underline-offset-2">Portfolio</span></Link>}
        </div>
      </div>

      <div className="border-t border-gray-200 my-5" />

      {/* Dynamic Ordered & Visible Sections */}
      {order.map(key => sections[key] || null)}
    </div>
  );
};

export default TemplateMinimal;

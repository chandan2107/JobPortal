import React from "react";
import { DEFAULT_SECTION_ORDER, DEFAULT_SECTION_VISIBILITY } from "../sectionConfig";

// Clean two-column executive template — no colors, pure black & white
const Link = ({ href, children }) =>
  href ? (
    <a href={href.startsWith("http") ? href : `https://${href}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "underline" }}>
      {children}
    </a>
  ) : <span>{children}</span>;

const TemplateExecutive = ({ data }) => {
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

  const leftSectionsMap = {
    experience: experience.length > 0 && visibility.experience !== false && (
      <div key="experience" className="mb-5">
        <h2 className="text-xs font-bold uppercase tracking-widest border-b border-black pb-0.5 mb-3">Work Experience</h2>
        <div className="space-y-4">
          {experience.map((exp, i) => (
            <div key={i}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-bold">{exp.title || "Job Title"}</h3>
                  <p className="text-xs italic text-gray-600">{exp.company}{exp.location ? `, ${exp.location}` : ""}</p>
                </div>
                <span className="text-xs text-gray-500 shrink-0 ml-2">
                  {exp.startDate}{exp.endDate ? ` – ${exp.endDate}` : exp.current ? " – Present" : ""}
                </span>
              </div>
              {exp.description && <p className="text-xs text-gray-700 mt-1 leading-relaxed whitespace-pre-line">{exp.description}</p>}
            </div>
          ))}
        </div>
      </div>
    ),

    projects: projects.length > 0 && visibility.projects !== false && (
      <div key="projects" className="mb-5">
        <h2 className="text-xs font-bold uppercase tracking-widest border-b border-black pb-0.5 mb-3">Key Projects</h2>
        <div className="space-y-3">
          {projects.map((proj, i) => (
            <div key={i}>
              <div className="flex justify-between items-baseline">
                <h3 className="text-xs font-bold">{proj.name}</h3>
                {proj.link && <Link href={proj.link}><span className="text-[10px] text-gray-600">View</span></Link>}
              </div>
              {proj.technologies?.length > 0 && (
                <p className="text-[10px] text-gray-500">
                  {Array.isArray(proj.technologies) ? proj.technologies.join(", ") : proj.technologies}
                </p>
              )}
              {proj.description && <p className="text-xs text-gray-700 mt-0.5 leading-relaxed">{proj.description}</p>}
            </div>
          ))}
        </div>
      </div>
    ),
  };

  const rightSectionsMap = {
    education: education.length > 0 && visibility.education !== false && (
      <div key="education" className="mb-5">
        <h2 className="text-xs font-bold uppercase tracking-widest border-b border-black pb-0.5 mb-2">Education</h2>
        <div className="space-y-3">
          {education.map((edu, i) => (
            <div key={i}>
              <p className="text-xs font-bold leading-tight">{edu.degree}</p>
              <p className="text-xs text-gray-600">{edu.school}</p>
              <p className="text-xs text-gray-400">{edu.startDate}{edu.endDate ? ` – ${edu.endDate}` : ""}</p>
              {edu.gpa && <p className="text-xs text-gray-500">GPA: {edu.gpa}</p>}
            </div>
          ))}
        </div>
      </div>
    ),

    skills: skills.length > 0 && visibility.skills !== false && (
      <div key="skills" className="mb-5">
        <h2 className="text-xs font-bold uppercase tracking-widest border-b border-black pb-0.5 mb-2">Skills</h2>
        <p className="text-xs leading-relaxed text-gray-700">{skills.join(", ")}</p>
      </div>
    ),

    certifications: certifications.length > 0 && visibility.certifications !== false && (
      <div key="certifications" className="mb-5">
        <h2 className="text-xs font-bold uppercase tracking-widest border-b border-black pb-0.5 mb-2">Certifications</h2>
        <div className="space-y-1.5">
          {certifications.map((cert, i) => (
            <div key={i}>
              <p className="text-xs font-semibold leading-tight">{cert.name}</p>
              {cert.issuer && <p className="text-[11px] text-gray-500">{cert.issuer}</p>}
              {cert.date && <p className="text-[11px] text-gray-400">{cert.date}</p>}
            </div>
          ))}
        </div>
      </div>
    ),
  };

  return (
    <div className="bg-white w-full px-10 pt-9 pb-16 min-h-[1123px]" style={{ fontFamily: "'Times New Roman', serif", color: "#111" }}>
      {/* Header — centered */}
      <div className="text-center border-b-2 border-black pb-4 mb-5">
        <h1 className="text-3xl font-bold tracking-tight uppercase letter-spacing-wide">
          {fullName || "Your Name"}
        </h1>
        {jobTitle && <p className="text-sm mt-1 italic text-gray-600">{jobTitle}</p>}
        <div className="flex justify-center flex-wrap gap-x-3 gap-y-0.5 mt-2 text-xs text-gray-700">
          {email && <span>{email}</span>}
          {phone && <span>| {phone}</span>}
          {location && <span>| {location}</span>}
          {linkedin && <span>| <Link href={linkedin}>LinkedIn</Link></span>}
          {website && <span>| <Link href={website}>Portfolio</Link></span>}
        </div>
      </div>

      {summary && visibility.summary !== false && (
        <div className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-widest border-b border-black pb-0.5 mb-2">Objective / Summary</h2>
          <p className="text-sm leading-relaxed text-gray-800">{summary}</p>
        </div>
      )}

      <div className="grid grid-cols-[1fr_170px] gap-8">
        {/* Left */}
        <div>
          {order.filter(key => leftSectionsMap[key]).map(key => leftSectionsMap[key])}
        </div>

        {/* Right */}
        <div>
          {order.filter(key => rightSectionsMap[key]).map(key => rightSectionsMap[key])}
        </div>
      </div>
    </div>
  );
};

export default TemplateExecutive;

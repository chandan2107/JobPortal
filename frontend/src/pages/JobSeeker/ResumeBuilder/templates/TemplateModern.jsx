import React from "react";
import { DEFAULT_SECTION_ORDER, DEFAULT_SECTION_VISIBILITY } from "../sectionConfig";

const Link = ({ href, children }) =>
  href ? (
    <a href={href.startsWith("http") ? href : `https://${href}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
      {children}
    </a>
  ) : <span>{children}</span>;

const TemplateModern = ({ data }) => {
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

  const rightSectionsMap = {
    summary: summary && visibility.summary !== false && (
      <div key="summary" className="mb-5">
        <h2 className="text-[10px] font-bold uppercase tracking-widest text-blue-600 mb-1.5">About Me</h2>
        <div className="w-6 h-0.5 bg-blue-400 mb-2" />
        <p className="text-xs text-gray-700 leading-relaxed">{summary}</p>
      </div>
    ),

    experience: experience.length > 0 && visibility.experience !== false && (
      <div key="experience" className="mb-5">
        <h2 className="text-[10px] font-bold uppercase tracking-widest text-blue-600 mb-1.5">Experience</h2>
        <div className="w-6 h-0.5 bg-blue-400 mb-3" />
        <div className="space-y-4">
          {experience.map((exp, i) => (
            <div key={i} className="border-l-2 border-blue-100 pl-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xs font-bold text-gray-900">{exp.title || "Job Title"}</h3>
                  <p className="text-[11px] text-gray-500">{exp.company}{exp.location ? ` · ${exp.location}` : ""}</p>
                </div>
                <span className="text-[10px] text-gray-400 shrink-0 ml-3 bg-gray-100 px-2 py-0.5 rounded-full whitespace-nowrap">
                  {exp.startDate}{exp.endDate ? ` – ${exp.endDate}` : exp.current ? " – Present" : ""}
                </span>
              </div>
              {exp.description && <p className="text-[11px] text-gray-600 mt-1 leading-relaxed whitespace-pre-line">{exp.description}</p>}
            </div>
          ))}
        </div>
      </div>
    ),

    projects: projects.length > 0 && visibility.projects !== false && (
      <div key="projects" className="mb-5">
        <h2 className="text-[10px] font-bold uppercase tracking-widest text-blue-600 mb-1.5">Projects</h2>
        <div className="w-6 h-0.5 bg-blue-400 mb-3" />
        <div className="space-y-3">
          {projects.map((proj, i) => (
            <div key={i} className="border-l-2 border-blue-100 pl-3">
              <div className="flex justify-between items-start">
                <h3 className="text-xs font-bold text-gray-900">{proj.name}</h3>
                {proj.link && (
                  <Link href={proj.link}>
                    <span className="text-[10px] text-blue-500 ml-2">View →</span>
                  </Link>
                )}
              </div>
              {proj.technologies?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {(Array.isArray(proj.technologies) ? proj.technologies : [proj.technologies]).filter(Boolean).map((t, ti) => (
                    <span key={ti} className="text-[9px] bg-blue-50 text-blue-600 border border-blue-100 px-1.5 py-0.5 rounded-full">{t}</span>
                  ))}
                </div>
              )}
              {proj.description && <p className="text-[11px] text-gray-600 mt-1 leading-relaxed">{proj.description}</p>}
            </div>
          ))}
        </div>
      </div>
    ),
  };

  return (
    <div className="bg-white w-full flex min-h-[1123px]" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Left Sidebar */}
      <div className="w-[32%] bg-slate-800 text-white flex-shrink-0 px-5 py-7">
        <h1 className="text-xl font-bold text-white leading-tight">
          {fullName || "Your Name"}
        </h1>
        {jobTitle && (
          <p className="text-blue-300 text-xs font-semibold mt-1 leading-snug">{jobTitle}</p>
        )}

        {/* Contact */}
        <div className="mt-5 border-t border-slate-600 pt-4">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-blue-300 mb-2">Contact</h3>
          <div className="space-y-1.5 text-[11px] text-slate-300">
            {email && <p className="break-all">{email}</p>}
            {phone && <p>{phone}</p>}
            {location && <p>{location}</p>}
            {linkedin && <p><Link href={linkedin}><span className="text-blue-300 hover:text-blue-200">LinkedIn</span></Link></p>}
            {website && <p><Link href={website}><span className="text-blue-300 hover:text-blue-200">Portfolio</span></Link></p>}
          </div>
        </div>

        {/* Skills */}
        {skills.length > 0 && visibility.skills !== false && (
          <div className="mt-5 border-t border-slate-600 pt-4">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-blue-300 mb-2">Skills</h3>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((skill, i) => (
                <span key={i} className="text-[10px] bg-slate-700 text-slate-200 px-2 py-0.5 rounded-full border border-slate-600">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {education.length > 0 && visibility.education !== false && (
          <div className="mt-5 border-t border-slate-600 pt-4">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-blue-300 mb-2">Education</h3>
            <div className="space-y-3">
              {education.map((edu, i) => (
                <div key={i}>
                  <p className="text-[11px] font-bold text-white leading-tight">{edu.degree}</p>
                  <p className="text-[10px] text-slate-300 mt-0.5">{edu.school}</p>
                  {edu.location && <p className="text-[10px] text-slate-400">{edu.location}</p>}
                  <p className="text-[10px] text-slate-400 mt-0.5">{edu.startDate}{edu.endDate ? ` – ${edu.endDate}` : ""}</p>
                  {edu.gpa && <p className="text-[10px] text-blue-300">GPA: {edu.gpa}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {certifications.length > 0 && visibility.certifications !== false && (
          <div className="mt-5 border-t border-slate-600 pt-4">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-blue-300 mb-2">
              Certs & Hackathons
            </h3>
            <div className="space-y-2">
              {certifications.map((cert, i) => (
                <div key={i}>
                  <p className="text-[11px] font-semibold text-white leading-tight">
                    {cert.name}
                    {cert.type === "hackathon" && (
                      <span className="ml-1.5 text-[9px] bg-orange-400/30 text-orange-300 px-1.5 py-0.5 rounded font-bold">Hackathon</span>
                    )}
                  </p>
                  {cert.issuer && <p className="text-[10px] text-slate-400">{cert.issuer}</p>}
                  {cert.date && <p className="text-[10px] text-slate-500">{cert.date}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Main Content */}
      <div className="flex-1 px-6 py-7 pb-14">
        {order.filter(key => rightSectionsMap[key]).map(key => rightSectionsMap[key])}
      </div>
    </div>
  );
};

export default TemplateModern;

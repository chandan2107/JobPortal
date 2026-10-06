import React from "react";
import { DEFAULT_SECTION_ORDER, DEFAULT_SECTION_VISIBILITY } from "../sectionConfig";

const Link = ({ href, children }) =>
  href ? (
    <a href={href.startsWith("http") ? href : `https://${href}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
      {children}
    </a>
  ) : <span>{children}</span>;

const TemplateBold = ({ data }) => {
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

  const mainSectionsMap = {
    summary: summary && visibility.summary !== false && (
      <div key="summary" className="mb-5">
        <h2 className="text-[10px] font-black uppercase tracking-widest text-violet-700 mb-1">Summary</h2>
        <div className="w-6 h-0.5 bg-violet-400 mb-2" />
        <p className="text-xs text-gray-700 leading-relaxed">{summary}</p>
      </div>
    ),

    experience: experience.length > 0 && visibility.experience !== false && (
      <div key="experience" className="mb-5">
        <h2 className="text-[10px] font-black uppercase tracking-widest text-violet-700 mb-1">Experience</h2>
        <div className="w-6 h-0.5 bg-violet-400 mb-3" />
        <div className="space-y-4">
          {experience.map((exp, i) => (
            <div key={i}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xs font-bold text-gray-900">{exp.title || "Job Title"}</h3>
                  <p className="text-[11px] text-violet-600 font-semibold">{exp.company}</p>
                </div>
                <span className="text-[10px] text-gray-400 shrink-0">
                  {exp.startDate}{exp.endDate ? ` – ${exp.endDate}` : exp.current ? " – Present" : ""}
                </span>
              </div>
              {exp.description && (
                <p className="text-[11px] text-gray-600 mt-1 leading-relaxed whitespace-pre-line">{exp.description}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    ),

    projects: projects.length > 0 && visibility.projects !== false && (
      <div key="projects" className="mb-5">
        <h2 className="text-[10px] font-black uppercase tracking-widest text-violet-700 mb-1">Projects</h2>
        <div className="w-6 h-0.5 bg-violet-400 mb-3" />
        <div className="space-y-3">
          {projects.map((proj, i) => (
            <div key={i}>
              <div className="flex justify-between items-baseline">
                <h3 className="text-xs font-bold text-gray-900">{proj.name}</h3>
                {proj.link && <Link href={proj.link}><span className="text-[10px] text-violet-600">View</span></Link>}
              </div>
              {proj.technologies?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {(Array.isArray(proj.technologies) ? proj.technologies : [proj.technologies]).map((t, ti) => (
                    <span key={ti} className="text-[9px] bg-gray-100 text-gray-600 px-1 rounded">{t}</span>
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

  const sidebarSectionsMap = {
    skills: skills.length > 0 && visibility.skills !== false && (
      <div key="skills" className="mb-5">
        <h2 className="text-[10px] font-black uppercase tracking-widest text-violet-700 mb-1">Skills</h2>
        <div className="w-6 h-0.5 bg-violet-400 mb-2" />
        <div className="flex flex-wrap gap-1.5">
          {skills.map((skill, i) => (
            <span key={i} className="text-[10px] font-semibold bg-violet-50 text-violet-700 border border-violet-200 px-2 py-0.5 rounded">
              {skill}
            </span>
          ))}
        </div>
      </div>
    ),

    education: education.length > 0 && visibility.education !== false && (
      <div key="education" className="mb-5">
        <h2 className="text-[10px] font-black uppercase tracking-widest text-violet-700 mb-1">Education</h2>
        <div className="w-6 h-0.5 bg-violet-400 mb-2" />
        <div className="space-y-3">
          {education.map((edu, i) => (
            <div key={i}>
              <p className="text-[11px] font-bold text-gray-900 leading-tight">{edu.degree}</p>
              <p className="text-[10px] text-gray-600">{edu.school}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{edu.startDate}{edu.endDate ? ` – ${edu.endDate}` : ""}</p>
              {edu.gpa && <p className="text-[10px] text-violet-700 font-semibold">GPA: {edu.gpa}</p>}
            </div>
          ))}
        </div>
      </div>
    ),

    certifications: certifications.length > 0 && visibility.certifications !== false && (
      <div key="certifications" className="mb-5">
        <h2 className="text-[10px] font-black uppercase tracking-widest text-violet-700 mb-1">Certs</h2>
        <div className="w-6 h-0.5 bg-violet-400 mb-2" />
        <div className="space-y-2">
          {certifications.map((cert, i) => (
            <div key={i}>
              <p className="text-[11px] font-semibold text-gray-900 leading-tight">
                {cert.name}
                {cert.type === "hackathon" && (
                  <span className="ml-1.5 text-[9px] bg-orange-100 text-orange-600 px-1 py-0.5 rounded font-bold">🏆</span>
                )}
              </p>
              {cert.issuer && <p className="text-[10px] text-gray-500">{cert.issuer}</p>}
              {cert.date && <p className="text-[10px] text-violet-700">{cert.date}</p>}
            </div>
          ))}
        </div>
      </div>
    ),
  };

  return (
    <div className="bg-white w-full min-h-[1123px]" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Bold Header */}
      <div className="bg-gradient-to-r from-violet-700 to-indigo-600 px-10 py-7 text-white">
        <h1 className="text-4xl font-black tracking-tight leading-none">
          {fullName || "Your Name"}
        </h1>
        {jobTitle && <p className="text-violet-200 text-xs font-bold mt-2 uppercase tracking-widest">{jobTitle}</p>}
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-xs text-violet-100">
          {email && <span>{email}</span>}
          {phone && <span>{phone}</span>}
          {location && <span>{location}</span>}
          {linkedin && <Link href={linkedin}><span className="underline underline-offset-2">LinkedIn</span></Link>}
          {website && <Link href={website}><span className="underline underline-offset-2">Portfolio</span></Link>}
        </div>
      </div>

      <div className="px-10 py-6 pb-14 grid grid-cols-[1fr_185px] gap-7">
        {/* Left Main */}
        <div>
          {order.filter(key => mainSectionsMap[key]).map(key => mainSectionsMap[key])}
        </div>

        {/* Right Sidebar */}
        <div>
          {order.filter(key => sidebarSectionsMap[key]).map(key => sidebarSectionsMap[key])}
        </div>
      </div>
    </div>
  );
};

export default TemplateBold;

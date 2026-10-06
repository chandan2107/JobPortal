import React from "react";
import { DEFAULT_SECTION_ORDER, DEFAULT_SECTION_VISIBILITY } from "../sectionConfig";

const Link = ({ href, children }) => (
  href ? (
    <a href={href.startsWith("http") ? href : `https://${href}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
      {children}
    </a>
  ) : <span>{children}</span>
);

const TemplateClassic = ({ data }) => {
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

  const contacts = [
    email && <span key="email">{email}</span>,
    phone && <span key="phone">{phone}</span>,
    location && <span key="loc">{location}</span>,
    linkedin && <Link key="li" href={linkedin}>LinkedIn</Link>,
    website && <Link key="web" href={website}>Portfolio</Link>,
  ].filter(Boolean);

  const sections = {
    summary: summary && visibility.summary !== false && (
      <div key="summary" className="mb-5">
        <h2 className="text-xs font-bold uppercase tracking-widest text-gray-700 border-b border-gray-300 pb-1 mb-2">Professional Summary</h2>
        <p className="text-sm text-gray-700 leading-relaxed">{summary}</p>
      </div>
    ),

    experience: experience.length > 0 && visibility.experience !== false && (
      <div key="experience" className="mb-5">
        <h2 className="text-xs font-bold uppercase tracking-widest text-gray-700 border-b border-gray-300 pb-1 mb-3">Work Experience</h2>
        <div className="space-y-4">
          {experience.map((exp, i) => (
            <div key={i}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-bold">{exp.title || "Job Title"}</h3>
                  <p className="text-sm italic text-gray-600">{exp.company}{exp.location ? `, ${exp.location}` : ""}</p>
                </div>
                <span className="text-xs text-gray-500 shrink-0 ml-4">
                  {exp.startDate}{exp.endDate ? ` – ${exp.endDate}` : exp.current ? " – Present" : ""}
                </span>
              </div>
              {exp.description && <p className="text-sm text-gray-700 mt-1 leading-relaxed whitespace-pre-line">{exp.description}</p>}
            </div>
          ))}
        </div>
      </div>
    ),

    education: education.length > 0 && visibility.education !== false && (
      <div key="education" className="mb-5">
        <h2 className="text-xs font-bold uppercase tracking-widest text-gray-700 border-b border-gray-300 pb-1 mb-3">Education</h2>
        <div className="space-y-3">
          {education.map((edu, i) => (
            <div key={i} className="flex justify-between items-start">
              <div>
                <h3 className="text-sm font-bold">{edu.degree}</h3>
                <p className="text-sm italic text-gray-600">{edu.school}{edu.location ? `, ${edu.location}` : ""}</p>
                {edu.gpa && <p className="text-xs text-gray-500">GPA: {edu.gpa}</p>}
              </div>
              <span className="text-xs text-gray-500 shrink-0 ml-4">{edu.startDate}{edu.endDate ? ` – ${edu.endDate}` : ""}</span>
            </div>
          ))}
        </div>
      </div>
    ),

    skills: skills.length > 0 && visibility.skills !== false && (
      <div key="skills" className="mb-5">
        <h2 className="text-xs font-bold uppercase tracking-widest text-gray-700 border-b border-gray-300 pb-1 mb-2">Skills</h2>
        <p className="text-sm text-gray-700">{skills.join(" · ")}</p>
      </div>
    ),

    projects: projects.length > 0 && visibility.projects !== false && (
      <div key="projects" className="mb-5">
        <h2 className="text-xs font-bold uppercase tracking-widest text-gray-700 border-b border-gray-300 pb-1 mb-3">Projects</h2>
        <div className="space-y-3">
          {projects.map((proj, i) => (
            <div key={i}>
              <div className="flex justify-between items-baseline">
                <h3 className="text-sm font-bold">{proj.name}</h3>
                {proj.link && <Link href={proj.link}><span className="text-xs text-blue-600 ml-4">View Project</span></Link>}
              </div>
              {proj.technologies?.length > 0 && (
                <p className="text-xs text-gray-500 mt-0.5">
                  {Array.isArray(proj.technologies) ? proj.technologies.join(", ") : proj.technologies}
                </p>
              )}
              {proj.description && <p className="text-sm text-gray-700 mt-1 leading-relaxed">{proj.description}</p>}
            </div>
          ))}
        </div>
      </div>
    ),

    certifications: certifications.length > 0 && visibility.certifications !== false && (
      <div key="certifications" className="mb-5">
        <h2 className="text-xs font-bold uppercase tracking-widest text-gray-700 border-b border-gray-300 pb-1 mb-3">
          Certifications & Achievements
        </h2>
        <div className="space-y-2">
          {certifications.map((cert, i) => (
            <div key={i} className="flex justify-between items-center">
              <div>
                <span className="text-sm font-semibold">{cert.name}</span>
                {cert.type === "hackathon" && <span className="ml-2 text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded font-bold">Hackathon</span>}
                {cert.issuer && <span className="text-sm text-gray-600"> — {cert.issuer}</span>}
              </div>
              {cert.date && <span className="text-xs text-gray-500">{cert.date}</span>}
            </div>
          ))}
        </div>
      </div>
    ),
  };

  return (
    <div className="bg-white w-full font-serif text-gray-900 px-10 pt-10 pb-16 min-h-[1123px]" style={{ fontFamily: "'Georgia', serif" }}>
      {/* Header */}
      <div className="border-b-4 border-gray-800 pb-4 mb-6">
        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
          {fullName || "Your Name"}
        </h1>
        {jobTitle && <p className="text-lg text-gray-600 mt-1 font-normal">{jobTitle}</p>}
        {contacts.length > 0 && (
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-sm text-gray-600">
            {contacts.map((c, i) => (
              <span key={i}>{i > 0 && <span className="mr-4 text-gray-300">|</span>}{c}</span>
            ))}
          </div>
        )}
      </div>

      {/* Dynamic Ordered & Visible Sections */}
      {order.map(key => sections[key] || null)}
    </div>
  );
};

export default TemplateClassic;

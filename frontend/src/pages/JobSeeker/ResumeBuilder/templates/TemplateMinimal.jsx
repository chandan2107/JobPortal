import React from "react";
import { DEFAULT_SECTION_ORDER, DEFAULT_SECTION_VISIBILITY } from "../sectionConfig";
import { formatDateRange, formatResumeDate } from "../dateUtils";
import Link from "../ResumeLink";

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
      <div key="summary" className="mb-5">
        <p className="text-[13.5px] font-normal text-black leading-relaxed max-w-2xl">{summary}</p>
      </div>
    ),

    experience: experience.length > 0 && visibility.experience !== false && (
      <div key="experience" className="mb-5">
        <h2 className="text-[15px] font-bold uppercase text-black border-b border-black pb-0.5 mb-3">Experience</h2>
        <div className="space-y-4">
          {experience.map((exp, i) => (
            <div key={i} className="grid grid-cols-[140px_1fr] gap-4">
              <div className="text-[13.5px] font-medium text-black pt-0.5">
                <p>{formatDateRange(exp.startDate, exp.endDate, exp.current)}</p>
                {exp.location && <p className="mt-0.5 font-normal text-zinc-700">{exp.location}</p>}
              </div>
              <div>
                <h3 className="text-[14px] font-semibold text-black">{exp.title || "Job Title"}</h3>
                <p className="text-[13.5px] font-medium text-zinc-800 mt-0.5">{exp.company}</p>
                {exp.description && <p className="text-[13.5px] font-normal text-black mt-1 leading-relaxed whitespace-pre-line">{exp.description}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    ),

    education: education.length > 0 && visibility.education !== false && (
      <div key="education" className="mb-5">
        <h2 className="text-[15px] font-bold uppercase text-black border-b border-black pb-0.5 mb-3">Education</h2>
        <div className="space-y-3">
          {education.map((edu, i) => (
            <div key={i} className="grid grid-cols-[140px_1fr] gap-4">
              <div className="text-[13.5px] font-medium text-black pt-0.5">{formatDateRange(edu.startDate, edu.endDate)}</div>
              <div>
                <h3 className="text-[13.5px] font-semibold text-black">{edu.degree}</h3>
                <p className="text-[13.5px] font-medium text-zinc-800 mt-0.5">{edu.school}{edu.location ? `, ${edu.location}` : ""}</p>
                {edu.gpa && <p className="text-[11px] font-normal text-black mt-0.5">GPA: {edu.gpa}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    ),

    projects: projects.length > 0 && visibility.projects !== false && (
      <div key="projects" className="mb-5">
        <h2 className="text-[15px] font-bold uppercase text-black border-b border-black pb-0.5 mb-3">Projects</h2>
        <div className="space-y-3">
          {projects.map((proj, i) => (
            <div key={i}>
              <div className="flex items-baseline gap-3 flex-wrap">
                <h3 className="text-[13.5px] font-semibold text-black">{proj.name}</h3>
                {proj.link && (
                  <Link href={proj.link} className="text-black font-medium text-[11px] underline underline-offset-2">
                    Link
                  </Link>
                )}
              </div>
              {proj.technologies?.length > 0 && (
                <p className="text-[13.5px] font-normal text-zinc-800 mt-0.5">
                  {Array.isArray(proj.technologies) ? proj.technologies.join(" · ") : proj.technologies}
                </p>
              )}
              {proj.description && <p className="text-[13.5px] font-normal text-black mt-1 leading-relaxed">{proj.description}</p>}
            </div>
          ))}
        </div>
      </div>
    ),

    skills: skills.length > 0 && visibility.skills !== false && (
      <div key="skills" className="mb-5">
        <h2 className="text-[15px] font-bold uppercase text-black border-b border-black pb-0.5 mb-2">Skills</h2>
        <p className="text-[13.5px] font-normal text-black leading-relaxed">{skills.join(", ")}</p>
      </div>
    ),

    certifications: certifications.length > 0 && visibility.certifications !== false && (
      <div key="certifications" className="mb-4">
        <h2 className="text-[15px] font-bold uppercase text-black border-b border-black pb-0.5 mb-2.5">Certifications & Achievements</h2>
        <div className="space-y-1">
          {certifications.map((cert, i) => (
            <p key={i} className="text-[13.5px] text-black">
              <span className="text-[13.5px] font-semibold text-black">{cert.name}</span>
              {cert.type === "hackathon" && <span className="ml-2 text-[9.5px] text-blue-900 bg-blue-100 border border-blue-300 px-1 py-0.5 rounded font-medium">[Hackathon]</span>}
              {cert.issuer ? ` — ${cert.issuer}` : ""}
              {cert.date ? ` (${formatResumeDate(cert.date)})` : ""}
            </p>
          ))}
        </div>
      </div>
    ),
  };

  return (
    <div className="bg-white w-full px-12 pt-9 pb-16 min-h-[1123px]" style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-[26px] font-bold text-black leading-tight">
          {fullName || "Your Name"}
        </h1>
        {jobTitle && <p className="text-[13.5px] font-medium text-black mt-1">{jobTitle}</p>}
        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-[13.5px] text-black font-normal">
          {email && <Link href={`mailto:${email.trim()}`} className="text-black">{email}</Link>}
          {phone && <Link href={`tel:${phone.trim()}`} className="text-black">{phone}</Link>}
          {location && <span className="text-black">{location}</span>}
          {linkedin && <Link href={linkedin} className="text-black font-medium underline underline-offset-2">LinkedIn</Link>}
          {website && <Link href={website} className="text-black font-medium underline underline-offset-2">Portfolio</Link>}
        </div>
      </div>

      <div className="border-t-2 border-black my-4" />

      {/* Dynamic Ordered & Visible Sections */}
      {order.map(key => sections[key] || null)}
    </div>
  );
};

export default TemplateMinimal;

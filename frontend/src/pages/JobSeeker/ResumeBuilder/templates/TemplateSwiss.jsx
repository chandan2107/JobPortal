import React from "react";
import { DEFAULT_SECTION_ORDER, DEFAULT_SECTION_VISIBILITY } from "../sectionConfig";
import { formatDateRange, formatResumeDate } from "../dateUtils";
import Link from "../ResumeLink";

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
      <div key="summary" className="mb-5 grid grid-cols-[140px_1fr] gap-5 items-start">
        <h2 className="text-[15px] font-bold uppercase text-black">
          Profile
        </h2>
        <p className="text-[13.5px] font-normal text-black leading-relaxed">
          {summary}
        </p>
      </div>
    ),

    experience: experience.length > 0 && visibility.experience !== false && (
      <div key="experience" className="mb-5">
        <div className="border-t-2 border-black pt-2 mb-3 flex items-center justify-between">
          <h2 className="text-[15px] font-bold uppercase text-black">
            Experience
          </h2>
          <span className="text-[11px] text-zinc-700 font-mono font-medium">Work History</span>
        </div>

        <div className="space-y-4">
          {experience.map((exp, i) => (
            <div key={i} className="grid grid-cols-[140px_1fr] gap-5">
              <div className="text-[13.5px] text-black font-mono font-medium pt-0.5">
                <p>{formatDateRange(exp.startDate, exp.endDate, exp.current)}</p>
                {exp.location && <p className="text-zinc-700 text-[11.5px] mt-0.5 font-normal">{exp.location}</p>}
              </div>
              <div>
                <div className="flex items-baseline justify-between">
                  <h3 className="text-[14px] font-semibold text-black">
                    {exp.title || "Job Title"}
                  </h3>
                  <span className="text-[13.5px] font-medium text-zinc-800">{exp.company}</span>
                </div>
                {exp.description && (
                  <p className="text-[13.5px] font-normal text-black mt-1 leading-relaxed whitespace-pre-line">
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
      <div key="education" className="mb-5">
        <div className="border-t-2 border-black pt-2 mb-3 flex items-center justify-between">
          <h2 className="text-[15px] font-bold uppercase text-black">
            Education
          </h2>
          <span className="text-[11px] text-zinc-700 font-mono font-medium">Academic</span>
        </div>

        <div className="space-y-3">
          {education.map((edu, i) => (
            <div key={i} className="grid grid-cols-[140px_1fr] gap-5">
              <div className="text-[13.5px] text-black font-mono font-medium pt-0.5">
                {formatDateRange(edu.startDate, edu.endDate)}
              </div>
              <div>
                <h3 className="text-[13.5px] font-semibold text-black">{edu.degree}</h3>
                <p className="text-[13.5px] font-medium text-zinc-800 mt-0.5">
                  {edu.school}{edu.location ? `, ${edu.location}` : ""}
                  {edu.gpa && <span className="ml-2 font-mono text-[11px] text-black font-normal">• GPA {edu.gpa}</span>}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),

    projects: projects.length > 0 && visibility.projects !== false && (
      <div key="projects" className="mb-5">
        <div className="border-t-2 border-black pt-2 mb-3 flex items-center justify-between">
          <h2 className="text-[15px] font-bold uppercase text-black">
            Selected Works
          </h2>
          <span className="text-[11px] text-zinc-700 font-mono font-medium">Projects</span>
        </div>

        <div className="space-y-3.5">
          {projects.map((proj, i) => (
            <div key={i} className="grid grid-cols-[140px_1fr] gap-5">
              <div className="text-[13.5px] text-black font-mono font-medium pt-0.5">
                {proj.link ? <Link href={proj.link} className="text-black font-medium text-[11px] underline underline-offset-2">Link</Link> : `Project 0${i + 1}`}
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-[13.5px] font-semibold text-black">{proj.name}</h3>
                </div>
                {proj.technologies?.length > 0 && (
                  <p className="text-[13.5px] font-mono font-normal text-zinc-800 mt-0.5">
                    [{Array.isArray(proj.technologies) ? proj.technologies.join(" / ") : proj.technologies}]
                  </p>
                )}
                {proj.description && (
                  <p className="text-[13.5px] font-normal text-black mt-1 leading-relaxed">
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
      <div key="skills" className="mb-5">
        <div className="border-t-2 border-black pt-2 mb-2.5 flex items-center justify-between">
          <h2 className="text-[15px] font-bold uppercase text-black">
            Capabilities
          </h2>
          <span className="text-[11px] text-zinc-700 font-mono font-medium">Competencies</span>
        </div>
        <div className="grid grid-cols-[140px_1fr] gap-5">
          <span className="text-[13.5px] text-black font-mono font-medium">Technical</span>
          <div className="flex flex-wrap gap-1.5">
            {skills.map((skill, sIdx) => (
              <span
                key={sIdx}
                className="text-[13.5px] font-medium text-black bg-zinc-100 border border-zinc-300 px-2.5 py-0.5 rounded-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
    ),

    certifications: certifications.length > 0 && visibility.certifications !== false && (
      <div key="certifications" className="mb-5">
        <div className="border-t-2 border-black pt-2 mb-2.5 flex items-center justify-between">
          <h2 className="text-[15px] font-bold uppercase text-black">
            Honors & Certs
          </h2>
          <span className="text-[11px] text-zinc-700 font-mono font-medium">Credentials</span>
        </div>
        <div className="grid grid-cols-[140px_1fr] gap-5">
          <span className="text-[13.5px] text-black font-mono font-medium">Verified</span>
          <div className="space-y-1">
            {certifications.map((cert, i) => (
              <p key={i} className="text-[13.5px] text-black">
                <span className="text-[13.5px] font-semibold text-black">{cert.name}</span>
                {cert.issuer && ` — ${cert.issuer}`}
                {cert.date && <span className="text-black font-mono font-normal ml-2 text-[11px]">({formatResumeDate(cert.date)})</span>}
              </p>
            ))}
          </div>
        </div>
      </div>
    ),
  };

  return (
    <div
      className="bg-white w-full text-black px-12 pt-10 pb-16 min-h-[1123px]"
      style={{ fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}
    >
      {/* Swiss Asymmetric Header */}
      <div className="border-b-4 border-black pb-4 mb-5">
        <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-3">
          <div>
            <h1 className="text-[26px] font-bold text-black uppercase leading-tight">
              {fullName || "Your Name"}
            </h1>
            {jobTitle && (
              <p className="text-[13.5px] font-medium text-black uppercase mt-1">
                {jobTitle}
              </p>
            )}
          </div>
          <div className="flex flex-wrap md:flex-col md:items-end gap-x-3 gap-y-1 text-[13.5px] font-normal text-black">
            {email && <Link href={`mailto:${email.trim()}`} className="text-black">{email}</Link>}
            {phone && <Link href={`tel:${phone.trim()}`} className="text-black">{phone}</Link>}
            {location && <span>{location}</span>}
            {linkedin && <Link href={linkedin} className="text-black font-medium underline underline-offset-2">LinkedIn</Link>}
            {website && <Link href={website} className="text-black font-medium underline underline-offset-2">Portfolio</Link>}
          </div>
        </div>
      </div>

      {/* Dynamic Ordered & Visible Sections */}
      {order.map(key => sections[key] || null)}
    </div>
  );
};

export default TemplateSwiss;

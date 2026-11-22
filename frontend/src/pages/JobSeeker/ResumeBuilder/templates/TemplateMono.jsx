import React from "react";
import { DEFAULT_SECTION_ORDER, DEFAULT_SECTION_VISIBILITY } from "../sectionConfig";
import { formatDateRange, formatResumeDate } from "../dateUtils";
import Link from "../ResumeLink";

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
      <div key="summary" className="mb-5">
        <h2 className="text-[15px] font-bold uppercase text-black mb-1.5 border-b-2 border-black pb-0.5">
          # ABOUT / SUMMARY
        </h2>
        <p className="text-[13.5px] text-black leading-relaxed font-sans font-normal border-l-2 border-black pl-3 py-0.5">
          {summary}
        </p>
      </div>
    ),

    experience: experience.length > 0 && visibility.experience !== false && (
      <div key="experience" className="mb-5">
        <h2 className="text-[15px] font-bold uppercase text-black mb-2.5 border-b-2 border-black pb-0.5">
          # WORK_EXPERIENCE ({experience.length})
        </h2>
        <div className="space-y-4">
          {experience.map((exp, i) => (
            <div key={i} className="text-xs">
              <div className="flex items-baseline justify-between flex-wrap gap-1 font-mono">
                <h3 className="font-semibold text-[14px] text-black">
                  {exp.title || "Job Title"} <span className="font-medium text-[13.5px] text-zinc-800">@ {exp.company}</span>
                </h3>
                <span className="text-[13.5px] font-medium text-black">
                  [{formatDateRange(exp.startDate, exp.endDate, exp.current)}]
                  {exp.location ? ` | ${exp.location}` : ""}
                </span>
              </div>
              {exp.description && (
                <p className="font-sans text-[13.5px] text-black mt-1 leading-relaxed pl-2 whitespace-pre-line border-l-2 border-zinc-400 font-normal">
                  {exp.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    ),

    projects: projects.length > 0 && visibility.projects !== false && (
      <div key="projects" className="mb-5">
        <h2 className="text-[15px] font-bold uppercase text-black mb-2.5 border-b-2 border-black pb-0.5">
          # FEATURED_PROJECTS ({projects.length})
        </h2>
        <div className="space-y-3.5">
          {projects.map((proj, i) => (
            <div key={i} className="text-xs">
              <div className="flex items-baseline justify-between flex-wrap gap-1 font-mono">
                <h3 className="font-semibold text-[13.5px] text-black">{proj.name}</h3>
                {proj.link && (
                  <Link href={proj.link} className="text-black font-medium text-[11px] underline underline-offset-2">Link</Link>
                )}
              </div>
              {proj.technologies?.length > 0 && (
                <p className="text-[13.5px] text-zinc-800 font-mono font-normal mt-0.5">
                  stack: [{Array.isArray(proj.technologies) ? proj.technologies.join(", ") : proj.technologies}]
                </p>
              )}
              {proj.description && (
                <p className="font-sans text-[13.5px] text-black mt-1 leading-relaxed pl-2 border-l-2 border-zinc-400 font-normal">
                  {proj.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    ),

    skills: skills.length > 0 && visibility.skills !== false && (
      <div key="skills" className="mb-5">
        <h2 className="text-[15px] font-bold uppercase text-black mb-2 border-b-2 border-black pb-0.5">
          # TECH_STACK & SKILLS
        </h2>
        <div className="flex flex-wrap gap-1.5 font-mono">
          {skills.map((skill, sIdx) => (
            <span
              key={sIdx}
              className="bg-zinc-100 text-black text-[13.5px] font-medium px-2.5 py-0.5 rounded border border-zinc-300"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
    ),

    education: education.length > 0 && visibility.education !== false && (
      <div key="education" className="mb-5">
        <h2 className="text-[15px] font-bold uppercase text-black mb-2.5 border-b-2 border-black pb-0.5">
          # EDUCATION
        </h2>
        <div className="space-y-2.5 font-mono">
          {education.map((edu, i) => (
            <div key={i} className="flex items-baseline justify-between flex-wrap gap-1">
              <div>
                <h3 className="font-semibold text-[13.5px] text-black inline">{edu.degree}</h3>
                <span className="text-zinc-800 font-medium text-[13.5px]"> — {edu.school}{edu.location ? `, ${edu.location}` : ""}</span>
                {edu.gpa && <span className="text-zinc-700 font-normal text-[11px] ml-2">[GPA: {edu.gpa}]</span>}
              </div>
              <span className="text-[13.5px] text-black font-medium">
                [{formatDateRange(edu.startDate, edu.endDate)}]
              </span>
            </div>
          ))}
        </div>
      </div>
    ),

    certifications: certifications.length > 0 && visibility.certifications !== false && (
      <div key="certifications" className="mb-5">
        <h2 className="text-[15px] font-bold uppercase text-black mb-2 border-b-2 border-black pb-0.5">
          # CREDENTIALS & ACHIEVEMENTS
        </h2>
        <div className="space-y-1 font-mono">
          {certifications.map((cert, i) => (
            <p key={i} className="text-black text-[13.5px]">
              &gt; <span className="font-semibold text-[13.5px] text-black">{cert.name}</span>
              {cert.issuer && ` / ${cert.issuer}`}
              {cert.date && <span className="text-black font-normal ml-2 text-[11px]">({formatResumeDate(cert.date)})</span>}
            </p>
          ))}
        </div>
      </div>
    ),
  };

  return (
    <div
      className="bg-white w-full text-black px-12 pt-10 pb-16 min-h-[1123px]"
      style={{ fontFamily: "'JetBrains Mono', 'SF Mono', Consolas, 'Fira Code', monospace" }}
    >
      {/* Tech Mono Minimalist Header */}
      <div className="border-b-4 border-black pb-4 mb-5">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
          <div>
            <h1 className="text-[26px] font-bold text-black mt-1 leading-tight">
              {fullName || "Your Name"}
            </h1>
            {jobTitle && (
              <p className="text-[13.5px] text-zinc-800 font-medium mt-1">
                &gt; {jobTitle}
              </p>
            )}
          </div>
          <div className="text-[13.5px] text-black font-normal space-y-0.5 sm:text-right">
            {email && <p><Link href={`mailto:${email.trim()}`} className="text-black">{email}</Link></p>}
            {phone && <p><Link href={`tel:${phone.trim()}`} className="text-black">{phone}</Link></p>}
            {location && <p>{location}</p>}
            <div className="flex sm:justify-end gap-3 text-[13.5px] text-black font-medium pt-0.5">
              {linkedin && <Link href={linkedin} className="text-black font-medium underline underline-offset-2">LinkedIn</Link>}
              {website && <Link href={website} className="text-black font-medium underline underline-offset-2">Portfolio</Link>}
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

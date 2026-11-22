import React from "react";
import { DEFAULT_SECTION_ORDER, DEFAULT_SECTION_VISIBILITY } from "../sectionConfig";
import { formatDateRange, formatResumeDate } from "../dateUtils";
import Link from "../ResumeLink";

const TemplateEditorial = ({ data }) => {
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
        <p className="text-[13.5px] font-normal text-black leading-relaxed italic text-center max-w-2xl mx-auto">
          {summary}
        </p>
      </div>
    ),

    experience: experience.length > 0 && visibility.experience !== false && (
      <div key="experience" className="mb-5">
        <div className="border-b-2 border-black pb-1 mb-3 flex items-baseline justify-between">
          <h2 className="text-[15px] font-bold uppercase text-black font-sans">
            Professional Experience
          </h2>
        </div>

        <div className="space-y-4">
          {experience.map((exp, i) => (
            <div key={i}>
              <div className="flex items-baseline justify-between flex-wrap gap-1">
                <div>
                  <h3 className="text-[14px] font-semibold text-black inline">
                    {exp.company}
                  </h3>
                  <span className="text-[13.5px] italic font-medium text-zinc-800 ml-1.5">
                    — {exp.title || "Job Title"}
                  </span>
                </div>
                <span className="text-[13.5px] font-medium text-black font-sans">
                  {formatDateRange(exp.startDate, exp.endDate, exp.current)}
                  {exp.location ? ` | ${exp.location}` : ""}
                </span>
              </div>
              {exp.description && (
                <p className="text-[13.5px] font-normal text-black mt-1 leading-relaxed font-sans pl-1 whitespace-pre-line">
                  {exp.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    ),

    education: education.length > 0 && visibility.education !== false && (
      <div key="education" className="mb-5">
        <div className="border-b-2 border-black pb-1 mb-3">
          <h2 className="text-[15px] font-bold uppercase text-black font-sans">
            Education
          </h2>
        </div>

        <div className="space-y-3">
          {education.map((edu, i) => (
            <div key={i} className="flex items-baseline justify-between flex-wrap gap-1">
              <div>
                <h3 className="text-[14px] font-semibold text-black inline">
                  {edu.school}
                </h3>
                <span className="text-[13.5px] italic font-medium text-zinc-800 ml-1.5">
                  — {edu.degree}
                </span>
                {edu.gpa && <span className="text-[11px] font-normal text-black font-sans ml-2">(GPA: {edu.gpa})</span>}
              </div>
              <span className="text-[13.5px] font-medium text-black font-sans">
                {formatDateRange(edu.startDate, edu.endDate)}
              </span>
            </div>
          ))}
        </div>
      </div>
    ),

    projects: projects.length > 0 && visibility.projects !== false && (
      <div key="projects" className="mb-5">
        <div className="border-b-2 border-black pb-1 mb-3">
          <h2 className="text-[15px] font-bold uppercase text-black font-sans">
            Key Projects
          </h2>
        </div>

        <div className="space-y-3.5">
          {projects.map((proj, i) => (
            <div key={i}>
              <div className="flex items-baseline justify-between flex-wrap gap-1">
                <h3 className="text-[13.5px] font-semibold text-black">
                  {proj.name}
                </h3>
                {proj.link && (
                  <Link href={proj.link} className="text-black font-medium text-[11px] underline underline-offset-2 font-sans">
                    Link
                  </Link>
                )}
              </div>
              {proj.technologies?.length > 0 && (
                <p className="text-[13.5px] font-normal text-zinc-800 italic">
                  {Array.isArray(proj.technologies) ? proj.technologies.join(", ") : proj.technologies}
                </p>
              )}
              {proj.description && (
                <p className="text-[13.5px] font-normal text-black mt-1 leading-relaxed font-sans">
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
        <div className="border-b-2 border-black pb-1 mb-2">
          <h2 className="text-[15px] font-bold uppercase text-black font-sans">
            Core Competencies
          </h2>
        </div>
        <p className="text-[13.5px] font-normal text-black leading-relaxed font-sans">
          {skills.join(" • ")}
        </p>
      </div>
    ),

    certifications: certifications.length > 0 && visibility.certifications !== false && (
      <div key="certifications" className="mb-5">
        <div className="border-b-2 border-black pb-1 mb-2">
          <h2 className="text-[15px] font-bold uppercase text-black font-sans">
            Honors & Certifications
          </h2>
        </div>
        <div className="space-y-1">
          {certifications.map((cert, i) => (
            <p key={i} className="text-[13.5px] text-black font-sans">
              <span className="text-[13.5px] font-semibold text-black">{cert.name}</span>
              {cert.issuer && ` — ${cert.issuer}`}
              {cert.date && <span className="text-black font-medium ml-1.5 text-[11px]">({formatResumeDate(cert.date)})</span>}
            </p>
          ))}
        </div>
      </div>
    ),
  };

  return (
    <div
      className="bg-white w-full text-black px-12 pt-10 pb-16 min-h-[1123px]"
      style={{ fontFamily: "'Newsreader', 'Georgia', Cambria, 'Times New Roman', serif" }}
    >
      {/* Centered Editorial Header */}
      <div className="text-center pb-4 mb-5 border-b-2 border-black">
        <h1 className="text-[26px] font-bold text-black mb-1 uppercase leading-tight">
          {fullName || "Your Name"}
        </h1>
        {jobTitle && (
          <p className="text-[13.5px] font-medium text-black font-sans uppercase mb-2">
            {jobTitle}
          </p>
        )}
        <div className="flex flex-wrap justify-center items-center gap-x-3 gap-y-1 text-[13.5px] text-black font-sans font-normal">
          {location && <span>{location}</span>}
          {email && <Link href={`mailto:${email.trim()}`} className="text-black">{email}</Link>}
          {phone && <Link href={`tel:${phone.trim()}`} className="text-black">{phone}</Link>}
          {linkedin && <Link href={linkedin} className="text-black font-medium underline underline-offset-2">LinkedIn</Link>}
          {website && <Link href={website} className="text-black font-medium underline underline-offset-2">Portfolio</Link>}
        </div>
      </div>

      {/* Dynamic Ordered & Visible Sections */}
      {order.map(key => sections[key] || null)}
    </div>
  );
};

export default TemplateEditorial;

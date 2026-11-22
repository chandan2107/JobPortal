import React from "react";
import { DEFAULT_SECTION_ORDER, DEFAULT_SECTION_VISIBILITY } from "../sectionConfig";
import { formatDateRange, formatResumeDate } from "../dateUtils";
import Link from "../ResumeLink";

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


  const sections = {
    summary: summary && visibility.summary !== false && (
      <div key="summary" className="mb-5">
        <h2 className="text-[15px] font-bold uppercase text-black border-b-2 border-black pb-0.5 mb-2">
          Professional Summary
        </h2>
        <p className="text-[13.5px] font-normal text-black leading-relaxed">{summary}</p>
      </div>
    ),

    experience: experience.length > 0 && visibility.experience !== false && (
      <div key="experience" className="mb-5">
        <h2 className="text-[15px] font-bold uppercase text-black border-b-2 border-black pb-0.5 mb-2.5">
          Work Experience
        </h2>
        <div className="space-y-3.5">
          {experience.map((exp, i) => (
            <div key={i}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-[14px] font-semibold text-black">{exp.title || "Job Title"}</h3>
                  <p className="text-[13.5px] italic font-medium text-zinc-800">{exp.company}{exp.location ? `, ${exp.location}` : ""}</p>
                </div>
                <span className="text-[13.5px] font-medium text-black shrink-0 ml-3">
                  {formatDateRange(exp.startDate, exp.endDate, exp.current)}
                </span>
              </div>
              {exp.description && <p className="text-[13.5px] font-normal text-black mt-1 leading-relaxed whitespace-pre-line">{exp.description}</p>}
            </div>
          ))}
        </div>
      </div>
    ),

    education: education.length > 0 && visibility.education !== false && (
      <div key="education" className="mb-5">
        <h2 className="text-[15px] font-bold uppercase text-black border-b-2 border-black pb-0.5 mb-2.5">
          Education
        </h2>
        <div className="space-y-2.5">
          {education.map((edu, i) => (
            <div key={i} className="flex justify-between items-start">
              <div>
                <h3 className="text-[13.5px] font-semibold text-black">{edu.degree}</h3>
                <p className="text-[13.5px] italic font-medium text-zinc-800">{edu.school}{edu.location ? `, ${edu.location}` : ""}</p>
                {edu.gpa && <p className="text-[11px] font-normal text-black">GPA: {edu.gpa}</p>}
              </div>
              <span className="text-[13.5px] font-medium text-black shrink-0 ml-3">{formatDateRange(edu.startDate, edu.endDate)}</span>
            </div>
          ))}
        </div>
      </div>
    ),

    skills: skills.length > 0 && visibility.skills !== false && (
      <div key="skills" className="mb-5">
        <h2 className="text-[15px] font-bold uppercase text-black border-b-2 border-black pb-0.5 mb-2">
          Skills
        </h2>
        <p className="text-[13.5px] font-normal text-black leading-relaxed">{skills.join(" · ")}</p>
      </div>
    ),

    projects: projects.length > 0 && visibility.projects !== false && (
      <div key="projects" className="mb-5">
        <h2 className="text-[15px] font-bold uppercase text-black border-b-2 border-black pb-0.5 mb-2.5">
          Projects
        </h2>
        <div className="space-y-3">
          {projects.map((proj, i) => (
            <div key={i}>
              <div className="flex justify-between items-baseline">
                <h3 className="text-[13.5px] font-semibold text-black">{proj.name}</h3>
                {proj.link && (
                  <Link href={proj.link} className="text-black font-medium text-[11px] ml-3 underline underline-offset-2">
                    Link
                  </Link>
                )}
              </div>
              {proj.technologies?.length > 0 && (
                <p className="text-[13.5px] font-normal text-zinc-800 mt-0.5">
                  {Array.isArray(proj.technologies) ? proj.technologies.join(", ") : proj.technologies}
                </p>
              )}
              {proj.description && <p className="text-[13.5px] font-normal text-black mt-1 leading-relaxed">{proj.description}</p>}
            </div>
          ))}
        </div>
      </div>
    ),

    certifications: certifications.length > 0 && visibility.certifications !== false && (
      <div key="certifications" className="mb-5">
        <h2 className="text-[15px] font-bold uppercase text-black border-b-2 border-black pb-0.5 mb-2.5">
          Certifications & Achievements
        </h2>
        <div className="space-y-1.5">
          {certifications.map((cert, i) => (
            <div key={i} className="flex justify-between items-center">
              <div>
                <span className="text-[13.5px] font-semibold text-black">{cert.name}</span>
                {cert.type === "hackathon" && <span className="ml-2 text-[9.5px] bg-blue-100 text-blue-900 border border-blue-300 px-1 py-0.5 rounded font-medium">Hackathon</span>}
                {cert.issuer && <span className="text-[13.5px] font-normal text-zinc-800"> — {cert.issuer}</span>}
              </div>
              {cert.date && <span className="text-[11px] font-medium text-black">{formatResumeDate(cert.date)}</span>}
            </div>
          ))}
        </div>
      </div>
    ),
  };

  return (
    <div className="bg-white w-full text-black px-10 pt-9 pb-16 min-h-[1123px]" style={{ fontFamily: "'Georgia', serif" }}>
      {/* Header */}
      <div className="border-b-4 border-black pb-3 mb-5">
        <h1 className="text-[26px] font-bold text-black leading-tight">
          {fullName || "Your Name"}
        </h1>
        {jobTitle && <p className="text-[13.5px] text-black mt-1 font-medium">{jobTitle}</p>}
        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-[13.5px] text-black font-normal">
          {email && <Link href={`mailto:${email.trim()}`} className="text-black">{email}</Link>}
          {phone && <Link href={`tel:${phone.trim()}`} className="text-black">{phone}</Link>}
          {location && <span className="text-black">{location}</span>}
          {linkedin && <Link href={linkedin} className="text-black font-medium underline underline-offset-2">LinkedIn</Link>}
          {website && <Link href={website} className="text-black font-medium underline underline-offset-2">Portfolio</Link>}
        </div>
      </div>

      {/* Dynamic Ordered & Visible Sections */}
      {order.map(key => sections[key] || null)}
    </div>
  );
};

export default TemplateClassic;

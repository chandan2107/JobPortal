import React from "react";
import { DEFAULT_SECTION_ORDER, DEFAULT_SECTION_VISIBILITY } from "../sectionConfig";
import { formatDateRange, formatResumeDate } from "../dateUtils";
import Link from "../ResumeLink";

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
        <h2 className="text-[15px] font-bold uppercase border-b-2 border-black pb-0.5 mb-2.5 text-black">Work Experience</h2>
        <div className="space-y-3.5">
          {experience.map((exp, i) => (
            <div key={i}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-[14px] font-semibold text-black">{exp.title || "Job Title"}</h3>
                  <p className="text-[13.5px] italic font-medium text-zinc-800">{exp.company}{exp.location ? `, ${exp.location}` : ""}</p>
                </div>
                <span className="text-[13.5px] font-medium text-black shrink-0 ml-2">
                  {formatDateRange(exp.startDate, exp.endDate, exp.current)}
                </span>
              </div>
              {exp.description && <p className="text-[13.5px] text-black mt-1 leading-relaxed whitespace-pre-line font-normal">{exp.description}</p>}
            </div>
          ))}
        </div>
      </div>
    ),

    projects: projects.length > 0 && visibility.projects !== false && (
      <div key="projects" className="mb-5">
        <h2 className="text-[15px] font-bold uppercase border-b-2 border-black pb-0.5 mb-2.5 text-black">Key Projects</h2>
        <div className="space-y-3">
          {projects.map((proj, i) => (
            <div key={i}>
              <div className="flex justify-between items-baseline">
                <h3 className="text-[13.5px] font-semibold text-black">{proj.name}</h3>
                {proj.link && (
                  <Link href={proj.link} className="text-black font-medium text-[11px] underline underline-offset-2">
                    Link
                  </Link>
                )}
              </div>
              {proj.technologies?.length > 0 && (
                <p className="text-[13.5px] font-normal text-zinc-800 mt-0.5">
                  {Array.isArray(proj.technologies) ? proj.technologies.join(", ") : proj.technologies}
                </p>
              )}
              {proj.description && <p className="text-[13.5px] text-black mt-0.5 leading-relaxed font-normal">{proj.description}</p>}
            </div>
          ))}
        </div>
      </div>
    ),
  };

  const rightSectionsMap = {
    education: education.length > 0 && visibility.education !== false && (
      <div key="education" className="mb-5">
        <h2 className="text-[15px] font-bold uppercase border-b-2 border-black pb-0.5 mb-2 text-black">Education</h2>
        <div className="space-y-2.5">
          {education.map((edu, i) => (
            <div key={i}>
              <p className="text-[13.5px] font-semibold text-black leading-tight">{edu.degree}</p>
              <p className="text-[13.5px] font-normal text-zinc-800">{edu.school}</p>
              <p className="text-[13.5px] font-normal text-black">{formatDateRange(edu.startDate, edu.endDate)}</p>
              {edu.gpa && <p className="text-[11px] text-zinc-700 font-normal">GPA: {edu.gpa}</p>}
            </div>
          ))}
        </div>
      </div>
    ),

    skills: skills.length > 0 && visibility.skills !== false && (
      <div key="skills" className="mb-5">
        <h2 className="text-[15px] font-bold uppercase border-b-2 border-black pb-0.5 mb-2 text-black">Skills</h2>
        <p className="text-[13.5px] font-normal leading-relaxed text-black">{skills.join(", ")}</p>
      </div>
    ),

    certifications: certifications.length > 0 && visibility.certifications !== false && (
      <div key="certifications" className="mb-5">
        <h2 className="text-[15px] font-bold uppercase border-b-2 border-black pb-0.5 mb-2 text-black">Certifications</h2>
        <div className="space-y-1.5">
          {certifications.map((cert, i) => (
            <div key={i}>
              <p className="text-[13.5px] font-semibold text-black leading-tight">{cert.name}</p>
              {cert.issuer && <p className="text-[13.5px] font-normal text-zinc-800">{cert.issuer}</p>}
              {cert.date && <p className="text-[11px] font-normal text-black">{formatResumeDate(cert.date)}</p>}
            </div>
          ))}
        </div>
      </div>
    ),
  };

  return (
    <div className="bg-white w-full px-10 pt-8 pb-16 min-h-[1123px]" style={{ fontFamily: "'Times New Roman', serif", color: "#000000" }}>
      {/* Header — centered */}
      <div className="text-center border-b-4 border-black pb-3 mb-4">
        <h1 className="text-[26px] font-bold uppercase text-black leading-tight">
          {fullName || "Your Name"}
        </h1>
        {jobTitle && <p className="text-[13.5px] mt-1 italic font-medium text-black">{jobTitle}</p>}
        <div className="flex justify-center flex-wrap gap-x-3 gap-y-1 mt-2 text-[13.5px] font-normal text-black">
          {email && <Link href={`mailto:${email.trim()}`} className="text-black">{email}</Link>}
          {phone && <Link href={`tel:${phone.trim()}`} className="text-black">{phone}</Link>}
          {location && <span>{location}</span>}
          {linkedin && <Link href={linkedin} className="text-black font-medium underline underline-offset-2">LinkedIn</Link>}
          {website && <Link href={website} className="text-black font-medium underline underline-offset-2">Portfolio</Link>}
        </div>
      </div>

      {summary && visibility.summary !== false && (
        <div className="mb-4">
          <h2 className="text-[15px] font-bold uppercase border-b-2 border-black pb-0.5 mb-1.5 text-black">Objective / Summary</h2>
          <p className="text-[13.5px] leading-relaxed text-black font-normal">{summary}</p>
        </div>
      )}

      <div className="grid grid-cols-[1fr_170px] gap-6">
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

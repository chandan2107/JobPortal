import React from "react";
import { DEFAULT_SECTION_ORDER, DEFAULT_SECTION_VISIBILITY } from "../sectionConfig";
import { formatDateRange, formatResumeDate } from "../dateUtils";
import Link from "../ResumeLink";

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
        <h2 className="text-[15px] font-bold uppercase text-black mb-1.5 flex items-center gap-2">
          <span>Summary</span>
          <span className="flex-1 h-0.5 bg-black" />
        </h2>
        <p className="text-[13.5px] font-normal text-black leading-relaxed">{summary}</p>
      </div>
    ),

    experience: experience.length > 0 && visibility.experience !== false && (
      <div key="experience" className="mb-5">
        <h2 className="text-[15px] font-bold uppercase text-black mb-2 flex items-center gap-2">
          <span>Experience</span>
          <span className="flex-1 h-0.5 bg-black" />
        </h2>
        <div className="space-y-3.5">
          {experience.map((exp, i) => (
            <div key={i} className="border-l-2 border-black pl-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-[14px] font-semibold text-black">{exp.title || "Job Title"}</h3>
                  <p className="text-[13.5px] font-medium text-zinc-800">{exp.company}</p>
                </div>
                <span className="text-[13.5px] font-medium text-black shrink-0 ml-2 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-300">
                  {formatDateRange(exp.startDate, exp.endDate, exp.current)}
                </span>
              </div>
              {exp.description && (
                <p className="text-[13.5px] font-normal text-black mt-1 leading-relaxed whitespace-pre-line">{exp.description}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    ),

    projects: projects.length > 0 && visibility.projects !== false && (
      <div key="projects" className="mb-5">
        <h2 className="text-[15px] font-bold uppercase text-black mb-2 flex items-center gap-2">
          <span>Projects</span>
          <span className="flex-1 h-0.5 bg-black" />
        </h2>
        <div className="space-y-3">
          {projects.map((proj, i) => (
            <div key={i} className="border-l-2 border-black pl-3">
              <div className="flex justify-between items-baseline">
                <h3 className="text-[13.5px] font-semibold text-black">{proj.name}</h3>
                {proj.link && (
                  <Link href={proj.link} className="text-black font-medium text-[11px] ml-2 underline underline-offset-2">
                    Link
                  </Link>
                )}
              </div>
              {proj.technologies?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {(Array.isArray(proj.technologies) ? proj.technologies : [proj.technologies]).map((t, ti) => (
                    <span key={ti} className="text-[13.5px] font-normal bg-zinc-100 text-black border border-zinc-300 px-1.5 rounded">{t}</span>
                  ))}
                </div>
              )}
              {proj.description && <p className="text-[13.5px] font-normal text-black mt-1 leading-relaxed">{proj.description}</p>}
            </div>
          ))}
        </div>
      </div>
    ),
  };

  const sidebarSectionsMap = {
    skills: skills.length > 0 && visibility.skills !== false && (
      <div key="skills" className="mb-5">
        <h2 className="text-[15px] font-bold uppercase text-black mb-1.5 border-b-2 border-black pb-0.5">Skills</h2>
        <div className="flex flex-wrap gap-1 mt-1.5">
          {skills.map((skill, i) => (
            <span key={i} className="text-[13.5px] font-medium bg-zinc-100 text-black border border-zinc-300 px-2 py-0.5 rounded">
              {skill}
            </span>
          ))}
        </div>
      </div>
    ),

    education: education.length > 0 && visibility.education !== false && (
      <div key="education" className="mb-5">
        <h2 className="text-[15px] font-bold uppercase text-black mb-1.5 border-b-2 border-black pb-0.5">Education</h2>
        <div className="space-y-2.5 mt-1.5">
          {education.map((edu, i) => (
            <div key={i}>
              <p className="text-[13.5px] font-semibold text-black leading-tight">{edu.degree}</p>
              <p className="text-[13.5px] font-normal text-zinc-800 mt-0.5">{edu.school}</p>
              <p className="text-[13.5px] font-normal text-black mt-0.5">{formatDateRange(edu.startDate, edu.endDate)}</p>
              {edu.gpa && <p className="text-[11px] text-zinc-700 font-normal">GPA: {edu.gpa}</p>}
            </div>
          ))}
        </div>
      </div>
    ),

    certifications: certifications.length > 0 && visibility.certifications !== false && (
      <div key="certifications" className="mb-5">
        <h2 className="text-[15px] font-bold uppercase text-black mb-1.5 border-b-2 border-black pb-0.5">Certs</h2>
        <div className="space-y-1.5 mt-1.5">
          {certifications.map((cert, i) => (
            <div key={i}>
              <p className="text-[13.5px] font-semibold text-black leading-tight">
                {cert.name}
                {cert.type === "hackathon" && (
                  <span className="ml-1 text-[9.5px] bg-blue-100 text-blue-900 border border-blue-300 px-1.5 py-0.5 rounded font-medium">Hackathon</span>
                )}
              </p>
              {cert.issuer && <p className="text-[13.5px] font-normal text-zinc-800">{cert.issuer}</p>}
              {cert.date && <p className="text-[11px] font-normal text-black">{formatResumeDate(cert.date)}</p>}
            </div>
          ))}
        </div>
      </div>
    ),
  };

  return (
    <div className="bg-white w-full min-h-[1123px]" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Bold Header */}
      <div className="bg-gradient-to-r from-violet-800 to-indigo-700 px-9 py-6 text-white">
        <h1 className="text-[26px] font-bold leading-tight text-white">
          {fullName || "Your Name"}
        </h1>
        {jobTitle && <p className="text-white text-[13.5px] font-medium mt-1 uppercase">{jobTitle}</p>}
        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-[13.5px] text-white font-normal">
          {email && <Link href={`mailto:${email.trim()}`} style={{ color: "#ffffff" }} className="hover:text-violet-200">{email}</Link>}
          {phone && <Link href={`tel:${phone.trim()}`} style={{ color: "#ffffff" }} className="hover:text-violet-200">{phone}</Link>}
          {location && <span>{location}</span>}
          {linkedin && <Link href={linkedin} style={{ color: "#ffffff" }} className="font-medium underline underline-offset-2 hover:text-violet-200">LinkedIn</Link>}
          {website && <Link href={website} style={{ color: "#ffffff" }} className="font-medium underline underline-offset-2 hover:text-violet-200">Portfolio</Link>}
        </div>
      </div>

      <div className="px-9 py-5 pb-12 grid grid-cols-[1fr_190px] gap-6">
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

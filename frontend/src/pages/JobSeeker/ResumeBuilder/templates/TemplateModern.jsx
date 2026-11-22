import React from "react";
import { DEFAULT_SECTION_ORDER, DEFAULT_SECTION_VISIBILITY } from "../sectionConfig";
import { formatDateRange, formatResumeDate } from "../dateUtils";
import Link from "../ResumeLink";

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
        <h2 className="text-[15px] font-bold uppercase text-black mb-1.5 flex items-center gap-2">
          <span>About Me</span>
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
            <div key={i} className="border-l-2 border-zinc-900 pl-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-[14px] font-semibold text-black">{exp.title || "Job Title"}</h3>
                  <p className="text-[13.5px] font-medium text-zinc-800">{exp.company}{exp.location ? ` · ${exp.location}` : ""}</p>
                </div>
                <span className="text-[13.5px] font-medium text-black shrink-0 ml-2 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-300">
                  {formatDateRange(exp.startDate, exp.endDate, exp.current)}
                </span>
              </div>
              {exp.description && <p className="text-[13.5px] font-normal text-black mt-1 leading-relaxed whitespace-pre-line">{exp.description}</p>}
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
            <div key={i} className="border-l-2 border-zinc-900 pl-3">
              <div className="flex justify-between items-start">
                <h3 className="text-[13.5px] font-semibold text-black">{proj.name}</h3>
                {proj.link && (
                  <Link href={proj.link} className="text-black font-medium text-[11px] underline underline-offset-2">
                    Link
                  </Link>
                )}
              </div>
              {proj.technologies?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {(Array.isArray(proj.technologies) ? proj.technologies : [proj.technologies]).filter(Boolean).map((t, ti) => (
                    <span key={ti} className="text-[13.5px] font-normal bg-zinc-100 text-black border border-zinc-300 px-2 py-0.5 rounded">{t}</span>
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

  return (
    <div className="bg-white w-full flex min-h-[1123px]" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Left Sidebar */}
      <div className="w-[34%] bg-slate-900 text-white flex-shrink-0 px-5 py-7">
        <h1 className="text-[26px] font-bold text-white leading-tight">
          {fullName || "Your Name"}
        </h1>
        {jobTitle && (
          <p className="text-slate-200 text-[13.5px] font-medium mt-1 leading-snug">{jobTitle}</p>
        )}

        {/* Contact */}
        <div className="mt-5 border-t border-slate-700 pt-3.5">
          <h3 className="text-[15px] font-bold uppercase text-slate-100 mb-2">Contact</h3>
          <div className="space-y-1.5 text-[13.5px] text-slate-200 font-normal">
            {email && <p className="break-all"><Link href={`mailto:${email.trim()}`} style={{ color: "#ffffff" }} className="hover:text-slate-200">{email}</Link></p>}
            {phone && <p><Link href={`tel:${phone.trim()}`} style={{ color: "#ffffff" }} className="hover:text-slate-200">{phone}</Link></p>}
            {location && <p>{location}</p>}
            {linkedin && <p><Link href={linkedin} style={{ color: "#ffffff" }} className="font-medium underline underline-offset-2 hover:text-slate-200">LinkedIn</Link></p>}
            {website && <p><Link href={website} style={{ color: "#ffffff" }} className="font-medium underline underline-offset-2 hover:text-slate-200">Portfolio</Link></p>}
          </div>
        </div>

        {/* Skills */}
        {skills.length > 0 && visibility.skills !== false && (
          <div className="mt-5 border-t border-slate-700 pt-3.5">
            <h3 className="text-[15px] font-bold uppercase text-slate-100 mb-2">Skills</h3>
            <div className="flex flex-wrap gap-1">
              {skills.map((skill, i) => (
                <span key={i} className="text-[13.5px] font-normal bg-slate-800 text-slate-100 px-2 py-0.5 rounded border border-slate-700">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {education.length > 0 && visibility.education !== false && (
          <div className="mt-5 border-t border-slate-700 pt-3.5">
            <h3 className="text-[15px] font-bold uppercase text-slate-100 mb-2">Education</h3>
            <div className="space-y-2.5">
              {education.map((edu, i) => (
                <div key={i}>
                  <p className="text-[13.5px] font-semibold text-white leading-tight">{edu.degree}</p>
                  <p className="text-[13.5px] text-slate-200 font-medium mt-0.5">{edu.school}</p>
                  {edu.location && <p className="text-[13.5px] text-slate-300">{edu.location}</p>}
                  <p className="text-[13.5px] text-slate-300 font-normal mt-0.5">{formatDateRange(edu.startDate, edu.endDate)}</p>
                  {edu.gpa && <p className="text-[11px] text-slate-200 font-medium">GPA: {edu.gpa}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {certifications.length > 0 && visibility.certifications !== false && (
          <div className="mt-5 border-t border-slate-700 pt-3.5">
            <h3 className="text-[15px] font-bold uppercase text-slate-100 mb-2">
              Certs
            </h3>
            <div className="space-y-2">
              {certifications.map((cert, i) => (
                <div key={i}>
                  <p className="text-[13.5px] font-semibold text-white leading-tight">
                    {cert.name}
                    {cert.type === "hackathon" && (
                      <span className="ml-1.5 text-[9.5px] bg-blue-500/30 text-blue-200 px-1 py-0.5 rounded font-medium">Hackathon</span>
                    )}
                  </p>
                  {cert.issuer && <p className="text-[13.5px] text-slate-300">{cert.issuer}</p>}
                  {cert.date && <p className="text-[11px] text-slate-300 font-normal">{formatResumeDate(cert.date)}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Main Content */}
      <div className="flex-1 px-6 py-6 pb-12">
        {order.filter(key => rightSectionsMap[key]).map(key => rightSectionsMap[key])}
      </div>
    </div>
  );
};

export default TemplateModern;

import React from "react";
import { DEFAULT_SECTION_ORDER, DEFAULT_SECTION_VISIBILITY } from "../sectionConfig";
import { formatDateRange, formatResumeDate } from "../dateUtils";
import Link from "../ResumeLink";

const TemplateNordic = ({ data }) => {
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
      <div key="summary" className="max-w-2xl mx-auto mb-6 text-center">
        <p className="text-[13.5px] text-black leading-relaxed italic font-normal">
          "{summary}"
        </p>
      </div>
    ),

    experience: experience.length > 0 && visibility.experience !== false && (
      <div key="experience" className="mb-6">
        <div className="flex items-center gap-3 mb-3.5">
          <h2 className="text-[15px] font-bold uppercase text-black">
            Experience
          </h2>
          <div className="flex-1 h-0.5 bg-black" />
        </div>

        <div className="space-y-4">
          {experience.map((exp, i) => (
            <div key={i} className="space-y-0.5">
              <div className="flex items-baseline justify-between flex-wrap gap-2">
                <div className="flex items-baseline gap-2">
                  <h3 className="text-[14px] font-semibold text-black">{exp.title || "Job Title"}</h3>
                  <span className="text-[13.5px] text-zinc-800 font-medium">at {exp.company}</span>
                </div>
                <span className="text-[13.5px] text-black font-medium">
                  {formatDateRange(exp.startDate, exp.endDate, exp.current)}
                  {exp.location ? ` | ${exp.location}` : ""}
                </span>
              </div>
              {exp.description && (
                <p className="text-[13.5px] text-black leading-relaxed whitespace-pre-line pl-0.5 font-normal">
                  {exp.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    ),

    education: education.length > 0 && visibility.education !== false && (
      <div key="education" className="mb-6">
        <div className="flex items-center gap-3 mb-3.5">
          <h2 className="text-[15px] font-bold uppercase text-black">
            Education
          </h2>
          <div className="flex-1 h-0.5 bg-black" />
        </div>

        <div className="space-y-3">
          {education.map((edu, i) => (
            <div key={i} className="flex items-baseline justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-[13.5px] font-semibold text-black">{edu.degree}</h3>
                <p className="text-[13.5px] text-zinc-800 font-medium">
                  {edu.school}{edu.location ? `, ${edu.location}` : ""}
                  {edu.gpa && <span className="ml-2 text-black font-normal text-[11px]">• GPA {edu.gpa}</span>}
                </p>
              </div>
              <span className="text-[13.5px] text-black font-medium">
                {formatDateRange(edu.startDate, edu.endDate)}
              </span>
            </div>
          ))}
        </div>
      </div>
    ),

    projects: projects.length > 0 && visibility.projects !== false && (
      <div key="projects" className="mb-6">
        <div className="flex items-center gap-3 mb-3.5">
          <h2 className="text-[15px] font-bold uppercase text-black">
            Projects
          </h2>
          <div className="flex-1 h-0.5 bg-black" />
        </div>

        <div className="space-y-3.5">
          {projects.map((proj, i) => (
            <div key={i} className="space-y-0.5">
              <div className="flex items-baseline justify-between flex-wrap gap-2">
                <h3 className="text-[13.5px] font-semibold text-black">{proj.name}</h3>
                {proj.link && (
                  <Link href={proj.link} className="text-black font-medium text-[11px] underline underline-offset-2">Link</Link>
                )}
              </div>
              {proj.technologies?.length > 0 && (
                <p className="text-[13.5px] text-zinc-800 font-normal">
                  {Array.isArray(proj.technologies) ? proj.technologies.join(" · ") : proj.technologies}
                </p>
              )}
              {proj.description && (
                <p className="text-[13.5px] text-black leading-relaxed font-normal">
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
        <div className="flex items-center gap-3 mb-2.5">
          <h2 className="text-[15px] font-bold uppercase text-black">
            Skills & Competencies
          </h2>
          <div className="flex-1 h-0.5 bg-black" />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {skills.map((skill, sIdx) => (
            <span
              key={sIdx}
              className="text-[13.5px] font-medium text-black bg-zinc-100 border border-zinc-300 px-2.5 py-0.5 rounded-full"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
    ),

    certifications: certifications.length > 0 && visibility.certifications !== false && (
      <div key="certifications" className="mb-5">
        <div className="flex items-center gap-3 mb-2.5">
          <h2 className="text-[15px] font-bold uppercase text-black">
            Certifications
          </h2>
          <div className="flex-1 h-0.5 bg-black" />
        </div>
        <div className="space-y-1">
          {certifications.map((cert, i) => (
            <p key={i} className="text-[13.5px] text-black">
              <span className="text-[13.5px] font-semibold text-black">{cert.name}</span>
              {cert.issuer && ` — ${cert.issuer}`}
              {cert.date && <span className="text-black font-normal ml-1.5 text-[11px]">({formatResumeDate(cert.date)})</span>}
            </p>
          ))}
        </div>
      </div>
    ),
  };

  return (
    <div
      className="bg-white w-full text-black px-12 pt-10 pb-16 min-h-[1123px]"
      style={{ fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif" }}
    >
      {/* Nordic Centered Header */}
      <div className="text-center max-w-xl mx-auto mb-7">
        <h1 className="text-[26px] font-bold text-black mb-1 leading-tight">
          {fullName || "Your Name"}
        </h1>
        {jobTitle && (
          <p className="text-[13.5px] font-medium uppercase text-black mb-2">
            {jobTitle}
          </p>
        )}
        <div className="flex flex-wrap justify-center items-center gap-x-3 gap-y-1 text-[13.5px] text-black font-normal">
          {email && <Link href={`mailto:${email.trim()}`} className="text-black">{email}</Link>}
          {phone && <Link href={`tel:${phone.trim()}`} className="text-black">{phone}</Link>}
          {location && <span>{location}</span>}
          {linkedin && <Link href={linkedin} className="text-black font-medium underline underline-offset-2">LinkedIn</Link>}
          {website && <Link href={website} className="text-black font-medium underline underline-offset-2">Portfolio</Link>}
        </div>
      </div>

      <div className="w-16 h-0.5 bg-black mx-auto mb-6" />

      {/* Dynamic Ordered & Visible Sections */}
      {order.map(key => sections[key] || null)}
    </div>
  );
};

export default TemplateNordic;

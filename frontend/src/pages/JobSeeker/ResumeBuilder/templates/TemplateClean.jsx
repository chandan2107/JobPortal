import React from "react";
import { DEFAULT_SECTION_ORDER, DEFAULT_SECTION_VISIBILITY } from "../sectionConfig";
import { formatDateRange, formatResumeDate } from "../dateUtils";
import Link from "../ResumeLink";

const Divider = () => <div style={{ borderTop: "1px solid #111111", marginTop: "11px", marginBottom: "11px" }} />;

const SectionHeading = ({ children }) => (
  <h2 style={{ fontSize: "15px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "normal", color: "#000000", marginBottom: "7px" }}>
    {children}
  </h2>
);

const TemplateClean = ({ data }) => {
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
      <div key="summary">
        <SectionHeading>Summary</SectionHeading>
        <p style={{ fontSize: "13.5px", fontWeight: 400, color: "#000000", lineHeight: 1.55, marginBottom: "2px" }}>{summary}</p>
        <Divider />
      </div>
    ),

    experience: experience.length > 0 && visibility.experience !== false && (
      <div key="experience">
        <SectionHeading>Work Experience</SectionHeading>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {experience.map((exp, i) => (
            <div key={i}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontSize: "14px", fontWeight: 600, color: "#000000" }}>{exp.title || "Job Title"}</span>
                <span style={{ fontSize: "13.5px", fontWeight: 500, color: "#222222" }}>
                  {formatDateRange(exp.startDate, exp.endDate, exp.current)}
                </span>
              </div>
              <p style={{ fontSize: "13.5px", fontWeight: 500, color: "#222222", margin: "2px 0 3px" }}>
                {exp.company}{exp.location ? ` · ${exp.location}` : ""}
              </p>
              {exp.description && (
                <p style={{ fontSize: "13.5px", fontWeight: 400, color: "#000000", lineHeight: 1.55, whiteSpace: "pre-line" }}>{exp.description}</p>
              )}
            </div>
          ))}
        </div>
        <Divider />
      </div>
    ),

    education: education.length > 0 && visibility.education !== false && (
      <div key="education">
        <SectionHeading>Education</SectionHeading>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {education.map((edu, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <div>
                <span style={{ fontSize: "13.5px", fontWeight: 600, color: "#000000" }}>{edu.degree}</span>
                <span style={{ fontSize: "13.5px", fontWeight: 500, color: "#222222" }}> — {edu.school}{edu.location ? `, ${edu.location}` : ""}</span>
                {edu.gpa && <span style={{ fontSize: "11px", fontWeight: 400, color: "#333333" }}> (GPA: {edu.gpa})</span>}
              </div>
              <span style={{ fontSize: "13.5px", fontWeight: 500, color: "#222222", flexShrink: 0, marginLeft: "8px" }}>
                {formatDateRange(edu.startDate, edu.endDate)}
              </span>
            </div>
          ))}
        </div>
        <Divider />
      </div>
    ),

    skills: skills.length > 0 && visibility.skills !== false && (
      <div key="skills">
        <SectionHeading>Skills & Technologies</SectionHeading>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
          {skills.map((skill, i) => (
            <span key={i} style={{ fontSize: "13.5px", fontWeight: 500, background: "#f4f4f5", color: "#000000", border: "1px solid #d4d4d8", padding: "2.5px 8px", borderRadius: "3px" }}>
              {skill}
            </span>
          ))}
        </div>
        <Divider />
      </div>
    ),

    projects: projects.length > 0 && visibility.projects !== false && (
      <div key="projects">
        <SectionHeading>Projects</SectionHeading>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {projects.map((proj, i) => (
            <div key={i}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontSize: "13.5px", fontWeight: 600, color: "#000000" }}>{proj.name}</span>
                {proj.link && <Link href={proj.link} className="text-black font-medium text-[11px] underline underline-offset-2">Link</Link>}
              </div>
              {proj.technologies?.length > 0 && (
                <p style={{ fontSize: "13.5px", fontWeight: 400, color: "#333333", margin: "2px 0 3px" }}>
                  {Array.isArray(proj.technologies) ? proj.technologies.join(" · ") : proj.technologies}
                </p>
              )}
              {proj.description && <p style={{ fontSize: "13.5px", fontWeight: 400, color: "#000000", lineHeight: 1.55 }}>{proj.description}</p>}
            </div>
          ))}
        </div>
        <Divider />
      </div>
    ),

    certifications: certifications.length > 0 && visibility.certifications !== false && (
      <div key="certifications">
        <SectionHeading>Certifications</SectionHeading>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {certifications.map((cert, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontSize: "12.5px", color: "#000000" }}>
                <strong style={{ fontWeight: 600, color: "#000000" }}>{cert.name}</strong>
                {cert.issuer ? ` — ${cert.issuer}` : ""}
              </span>
              {cert.date && <span style={{ fontSize: "11px", fontWeight: 500, color: "#222222" }}>{formatResumeDate(cert.date)}</span>}
            </div>
          ))}
        </div>
      </div>
    ),
  };

  return (
    <div style={{ background: "#fff", fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", padding: "36px 40px 48px", color: "#000000", minHeight: "1123px" }}>
      {/* Header */}
      <div style={{ marginBottom: "16px" }}>
        <h1 style={{ fontSize: "26px", fontWeight: 700, color: "#000000", lineHeight: 1.15 }}>
          {fullName || "Your Name"}
        </h1>
        {jobTitle && <p style={{ fontSize: "13.5px", color: "#222222", marginTop: "3px", fontWeight: 500 }}>{jobTitle}</p>}
        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-[13.5px] text-black font-normal">
          {email && <Link href={`mailto:${email.trim()}`} className="text-black">{email}</Link>}
          {phone && <Link href={`tel:${phone.trim()}`} className="text-black">{phone}</Link>}
          {location && <span className="text-black">{location}</span>}
          {linkedin && <Link href={linkedin} className="text-black font-medium underline underline-offset-2">LinkedIn</Link>}
          {website && <Link href={website} className="text-black font-medium underline underline-offset-2">Portfolio</Link>}
        </div>
      </div>

      <Divider />

      {/* Dynamic Ordered & Visible Sections */}
      {order.map(key => sections[key] || null)}
    </div>
  );
};

export default TemplateClean;
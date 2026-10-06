import React from "react";
import { DEFAULT_SECTION_ORDER, DEFAULT_SECTION_VISIBILITY } from "../sectionConfig";

// Compact single-column clean template — no colors, space-efficient
const Link = ({ href, children }) =>
  href ? (
    <a href={href.startsWith("http") ? href : `https://${href}`} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
      {children}
    </a>
  ) : <span>{children}</span>;

const Divider = () => <div style={{ borderTop: "1px solid #d1d5db", marginTop: "12px", marginBottom: "12px" }} />;

const SectionHeading = ({ children }) => (
  <h2 style={{ fontSize: "10px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.15em", color: "#374151", marginBottom: "8px" }}>
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
        <p style={{ fontSize: "12px", color: "#4b5563", lineHeight: 1.7, marginBottom: "4px" }}>{summary}</p>
        <Divider />
      </div>
    ),

    experience: experience.length > 0 && visibility.experience !== false && (
      <div key="experience">
        <SectionHeading>Work Experience</SectionHeading>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {experience.map((exp, i) => (
            <div key={i}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#111827" }}>{exp.title || "Job Title"}</span>
                <span style={{ fontSize: "11px", color: "#9ca3af" }}>
                  {exp.startDate}{exp.endDate ? ` – ${exp.endDate}` : exp.current ? " – Present" : ""}
                </span>
              </div>
              <p style={{ fontSize: "11px", color: "#6b7280", margin: "1px 0 4px" }}>
                {exp.company}{exp.location ? ` · ${exp.location}` : ""}
              </p>
              {exp.description && (
                <p style={{ fontSize: "11px", color: "#4b5563", lineHeight: 1.6, whiteSpace: "pre-line" }}>{exp.description}</p>
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
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#111827" }}>{edu.degree}</span>
                <span style={{ fontSize: "11px", color: "#6b7280" }}> — {edu.school}{edu.location ? `, ${edu.location}` : ""}</span>
                {edu.gpa && <span style={{ fontSize: "10px", color: "#9ca3af" }}> (GPA: {edu.gpa})</span>}
              </div>
              <span style={{ fontSize: "11px", color: "#9ca3af", flexShrink: 0, marginLeft: "8px" }}>
                {edu.startDate}{edu.endDate ? ` – ${edu.endDate}` : ""}
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
            <span key={i} style={{ fontSize: "11px", background: "#f3f4f6", color: "#374151", padding: "2px 8px", borderRadius: "4px" }}>
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
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#111827" }}>{proj.name}</span>
                {proj.link && <Link href={proj.link}><span style={{ fontSize: "10px", color: "#6b7280" }}>View</span></Link>}
              </div>
              {proj.technologies?.length > 0 && (
                <p style={{ fontSize: "10px", color: "#9ca3af", margin: "1px 0" }}>
                  {Array.isArray(proj.technologies) ? proj.technologies.join(", ") : proj.technologies}
                </p>
              )}
              {proj.description && <p style={{ fontSize: "11px", color: "#4b5563", lineHeight: 1.6 }}>{proj.description}</p>}
            </div>
          ))}
        </div>
        <Divider />
      </div>
    ),

    certifications: certifications.length > 0 && visibility.certifications !== false && (
      <div key="certifications">
        <SectionHeading>Certifications</SectionHeading>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {certifications.map((cert, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontSize: "11px", color: "#374151" }}>
                <strong>{cert.name}</strong>
                {cert.issuer ? ` — ${cert.issuer}` : ""}
              </span>
              {cert.date && <span style={{ fontSize: "10px", color: "#9ca3af" }}>{cert.date}</span>}
            </div>
          ))}
        </div>
      </div>
    ),
  };

  return (
    <div style={{ background: "#fff", fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", padding: "36px 40px 64px", color: "#111", minHeight: "1123px" }}>
      {/* Header */}
      <div style={{ marginBottom: "20px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: 700, color: "#111827", lineHeight: 1.2 }}>
          {fullName || "Your Name"}
        </h1>
        {jobTitle && <p style={{ fontSize: "13px", color: "#6b7280", marginTop: "4px", fontWeight: 500 }}>{jobTitle}</p>}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginTop: "8px", fontSize: "11px", color: "#6b7280" }}>
          {email && <span>{email}</span>}
          {phone && <span>{phone}</span>}
          {location && <span>{location}</span>}
          {linkedin && <Link href={linkedin}><span style={{ color: "#374151", textDecoration: "underline" }}>LinkedIn</span></Link>}
          {website && <Link href={website}><span style={{ color: "#374151", textDecoration: "underline" }}>Portfolio</span></Link>}
        </div>
      </div>

      <Divider />

      {/* Dynamic Ordered & Visible Sections */}
      {order.map(key => sections[key] || null)}
    </div>
  );
};

export default TemplateClean;

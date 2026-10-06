// Section ordering and visibility configuration
export const DEFAULT_SECTION_ORDER = [
  "summary",
  "experience",
  "education",
  "projects",
  "skills",
  "certifications",
];

export const DEFAULT_SECTION_VISIBILITY = {
  summary: true,
  experience: true,
  education: true,
  projects: true,
  skills: true,
  certifications: true,
};

export const SECTION_METADATA = {
  summary: {
    id: "summary",
    tabId: "personal",
    label: "Professional Summary",
    shortLabel: "Summary",
    description: "2–3 sentence executive elevator pitch",
    iconName: "FileText",
  },
  experience: {
    id: "experience",
    tabId: "experience",
    label: "Work Experience",
    shortLabel: "Experience",
    description: "Roles, achievements and metrics",
    iconName: "Briefcase",
  },
  education: {
    id: "education",
    tabId: "education",
    label: "Education & Degrees",
    shortLabel: "Education",
    description: "Universities, degrees, and GPAs",
    iconName: "GraduationCap",
  },
  projects: {
    id: "projects",
    tabId: "projects",
    label: "Key Projects",
    shortLabel: "Projects",
    description: "Portfolio showcases, live links & tech",
    iconName: "FolderOpen",
  },
  skills: {
    id: "skills",
    tabId: "skills",
    label: "Skills & Technologies",
    shortLabel: "Skills",
    description: "Core competencies and tools",
    iconName: "Code",
  },
  certifications: {
    id: "certifications",
    tabId: "certifications",
    label: "Certifications & Hackathons",
    shortLabel: "Certs",
    description: "Verified credentials and achievements",
    iconName: "Award",
  },
};

export const SECTION_PRESETS = [
  {
    id: "standard",
    label: "Standard / Experienced",
    badge: "Most Common",
    description: "Summary → Experience → Education → Projects → Skills → Certs",
    order: ["summary", "experience", "education", "projects", "skills", "certifications"],
  },
  {
    id: "fresher",
    label: "Student / Fresher",
    badge: "Academics First",
    description: "Summary → Education → Projects → Skills → Experience → Certs",
    order: ["summary", "education", "projects", "skills", "experience", "certifications"],
  },
  {
    id: "technical",
    label: "Skills & Projects First",
    badge: "Portfolio Heavy",
    description: "Summary → Skills → Projects → Experience → Education → Certs",
    order: ["summary", "skills", "projects", "experience", "education", "certifications"],
  },
];

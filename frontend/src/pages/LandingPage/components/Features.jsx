import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, ArrowRight, FileCheck2, MapPin, CheckCircle, Clock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const jobListings = [
  {
    title: "Senior Full Stack Engineer",
    company: "Vercel",
    location: "Remote Worldwide",
    salary: "₹34L - ₹48L",
    equity: "0.05% - 0.12%",
    time: "2h ago",
    tags: ["React 19", "TypeScript", "Next.js", "Server Actions"],
    category: "Engineering"
  },
  {
    title: "Staff Product Designer",
    company: "Linear",
    location: "Remote",
    salary: "₹28L - ₹42L",
    equity: "0.10% - 0.20%",
    time: "4h ago",
    tags: ["Figma", "Design Systems", "Prototyping", "UI/UX"],
    category: "Design"
  },
  {
    title: "Cloud Infrastructure Architect",
    company: "Supabase",
    location: "Bengaluru / Hybrid",
    salary: "₹38L - ₹54L",
    equity: "Top Tier",
    time: "6h ago",
    tags: ["Kubernetes", "Go", "AWS", "PostgreSQL"],
    category: "DevOps"
  },
  {
    title: "Lead Frontend Architect",
    company: "Resend",
    location: "Remote Worldwide",
    salary: "₹32L - ₹45L",
    equity: "0.08% - 0.15%",
    time: "12h ago",
    tags: ["React", "Tailwind CSS", "TypeScript", "Micro-frontends"],
    category: "Engineering"
  },
  {
    title: "Product Manager (Core Platform)",
    company: "Raycast",
    location: "Remote",
    salary: "₹26L - ₹38L",
    equity: "Standard Grant",
    time: "1d ago",
    tags: ["API Platform", "Developer Experience", "Roadmap"],
    category: "Product"
  },
  {
    title: "Senior DevOps / SRE Specialist",
    company: "Postman",
    location: "Bengaluru",
    salary: "₹30L - ₹44L",
    equity: "Annual ESOP",
    time: "1d ago",
    tags: ["Terraform", "Docker", "Observability", "CI/CD"],
    category: "DevOps"
  }
];

const Features = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredJobs = selectedCategory === "All"
    ? jobListings
    : jobListings.filter(j => j.category === selectedCategory || (selectedCategory === "Remote" && j.location.includes("Remote")));

  const categories = [
    { label: "All Roles", value: "All", count: "1,280" },
    { label: "Remote", value: "Remote", count: "640" },
    { label: "Engineering", value: "Engineering", count: "480" },
    { label: "Product Design", value: "Design", count: "140" },
    { label: "DevOps & Cloud", value: "DevOps", count: "160" },
  ];

  return (
    <div className="w-full bg-white dark:bg-[#090c15] transition-colors">
      
      {/* ── SECTION 1: FULL-WIDTH LIVE DIRECTORY FEED ── */}
      <section className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 py-14 lg:py-20 border-b border-zinc-200/80 dark:border-zinc-800/80">
        
        {/* Section Header with Category Tabs */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
                Live Engineering Directory
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Active openings verified by our talent team within the last 48 hours.
            </p>
          </div>

          {/* Category Tabs with Animated Indicator */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800">
            {categories.map((cat) => (
              <motion.button
                key={cat.value}
                whileTap={{ scale: 0.96 }}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 relative ${
                  selectedCategory === cat.value
                    ? "bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-xs"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white"
                }`}
              >
                <span>{cat.label}</span>
                <span className="font-mono text-[10px] opacity-60">
                  {cat.count}
                </span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Full-Width Structured Job Table with Staggered Entrance */}
        <div className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 divide-y divide-zinc-200/80 dark:divide-zinc-800/80 overflow-hidden bg-white dark:bg-zinc-950/40 shadow-xs">
          <AnimatePresence mode="popLayout">
            {filteredJobs.map((job, idx) => (
              <motion.div
                key={job.title + job.company}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.25, delay: idx * 0.04 }}
                onClick={() => navigate("/find-jobs")}
                className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-zinc-50 dark:hover:bg-zinc-900/60 transition-colors cursor-pointer group"
              >
                {/* Role & Company */}
                <div className="flex items-start gap-4 min-w-[280px]">
                  <motion.div
                    whileHover={{ scale: 1.08 }}
                    className="w-11 h-11 rounded-xl bg-zinc-950 dark:bg-zinc-850 text-white flex items-center justify-center font-bold text-sm shadow-xs flex-shrink-0"
                  >
                    {job.company.substring(0, 2).toUpperCase()}
                  </motion.div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-zinc-950 dark:text-zinc-100 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                      {job.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                      <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                        {job.company}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-zinc-400" />
                        {job.location}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1 font-mono text-[11px]">
                        <Clock className="w-3 h-3 text-zinc-400" />
                        {job.time}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Skills Tags */}
                <div className="flex flex-wrap items-center gap-1.5 lg:max-w-md">
                  {job.tags.map((tag, tIdx) => (
                    <span
                      key={tIdx}
                      className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200/50 dark:border-zinc-800 transition-colors group-hover:border-zinc-300 dark:group-hover:border-zinc-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Salary & Action */}
                <div className="flex items-center justify-between lg:justify-end gap-6 pt-2 lg:pt-0 border-t lg:border-t-0 border-zinc-100 dark:border-zinc-850">
                  <div className="text-left lg:text-right">
                    <div className="font-mono text-sm sm:text-base font-bold text-zinc-950 dark:text-white tracking-tight">
                      {job.salary}
                    </div>
                    <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
                      {job.equity} equity
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.04, x: 2 }}
                    whileTap={{ scale: 0.96 }}
                    type="button"
                    className="h-9 px-4 rounded-lg bg-zinc-100 hover:bg-zinc-950 hover:text-white dark:bg-zinc-900 dark:hover:bg-white dark:hover:text-zinc-950 text-zinc-800 dark:text-zinc-200 text-xs font-bold transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer shadow-xs"
                  >
                    <span>View Role</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </motion.button>
                </div>

              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* View All Button full-width row */}
        <motion.div
          whileHover={{ scale: 1.005 }}
          whileTap={{ scale: 0.995 }}
          className="mt-8 text-center"
        >
          <Link
            to="/find-jobs"
            className="inline-flex items-center justify-center gap-2 w-full py-4 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500 bg-zinc-50/50 dark:bg-zinc-900/30 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white transition-all shadow-xs"
          >
            <span>Browse all 1,280 positions in the main directory</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

      </section>

      {/* ── SECTION 2: FULL-WIDTH ATS RESUME SCANNER ENGINE ── */}
      <section className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 py-16 lg:py-24 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/40 overflow-hidden">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Why ATS Matters */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-6 space-y-5"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold font-mono">
              <FileCheck2 className="w-4 h-4 animate-bounce" />
              <span>BUILT-IN APPLICANT TRACKING ENGINE</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-zinc-950 dark:text-white leading-[1.12]">
              Stop guessing why your resume got rejected.
            </h2>

            <p className="text-base text-zinc-600 dark:text-zinc-300 leading-relaxed font-normal">
              Most applicant tracking systems drop resumes before human eyes see them due to formatting glitches or mismatched tech taxonomy. Our built-in ATS scanner scores your resume against live job specifications in real time.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <motion.div
                whileHover={{ y: -2 }}
                className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs"
              >
                <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 block mb-1">
                  01 · SKILL TAXONOMY
                </span>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  Instant detection of missing required keywords and stack frameworks.
                </p>
              </motion.div>

              <motion.div
                whileHover={{ y: -2 }}
                className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs"
              >
                <span className="text-xs font-mono font-bold text-sky-600 dark:text-sky-400 block mb-1">
                  02 · VECTOR CLEANLINESS
                </span>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  Guarantees multi-column layouts and fonts don't break automated parsers.
                </p>
              </motion.div>
            </div>

            <div className="pt-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/ats-scanner")}
                className="h-11 px-6 rounded-xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 text-xs font-bold hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all inline-flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <span>Launch Free ATS Scanner</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>

          {/* Right Column: Live Interactive ATS Preview Component */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-6"
          >
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow">
              
              <div className="flex items-center justify-between pb-6 border-b border-zinc-100 dark:border-zinc-800">
                <div>
                  <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block">
                    Target Opportunity
                  </span>
                  <h4 className="text-base font-bold text-zinc-950 dark:text-white mt-0.5">
                    Staff Frontend Architect
                  </h4>
                </div>
                <div className="text-right">
                  <motion.span
                    initial={{ scale: 0.5, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                    className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400 inline-block"
                  >
                    94%
                  </motion.span>
                  <span className="text-[10px] font-mono block text-zinc-400">
                    MATCH SCORE
                  </span>
                </div>
              </div>

              {/* Animated Score Progress Bar */}
              <div className="py-6 border-b border-zinc-100 dark:border-zinc-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300">Overall ATS Compatibility</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">Excellent</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                  <motion.div
                    initial={{ width: "0%" }}
                    whileInView={{ width: "94%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                  />
                </div>
              </div>

              {/* Animated Checklist Items */}
              <div className="py-6 space-y-3 text-xs">
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <span className="text-zinc-800 dark:text-zinc-200 font-medium">Core Stack Match</span>
                  </div>
                  <span className="font-mono text-zinc-500">14 / 15 Tech Skills</span>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <span className="text-zinc-800 dark:text-zinc-200 font-medium">Section Parsing (Experience, Edu)</span>
                  </div>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">100% Passed</span>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 }}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <span className="text-zinc-800 dark:text-zinc-200 font-medium">Single-Column Flow</span>
                  </div>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">Parser-Friendly</span>
                </motion.div>
              </div>

              {/* Try button with Framer Motion hover/tap */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/ats-scanner")}
                className="w-full py-3 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white text-xs font-bold transition-all text-center cursor-pointer shadow-xs"
              >
                Upload Your Resume to Test Instantly
              </motion.button>

            </div>
          </motion.div>

        </div>
      </section>

    </div>
  );
};

export default Features;
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Search, MapPin, ArrowRight, Bot, FileText, FileCheck2, ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import toast from "react-hot-toast";

const Hero = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword.trim()) params.append("query", keyword.trim());
    if (location.trim()) params.append("location", location.trim());
    navigate(`/find-jobs?${params.toString()}`);
  };

  const trendingTags = ["Remote", "Frontend", "Full Stack", "Design", "DevOps"];

  const handleFeatureClick = (feature) => {
    if (!isAuthenticated) {
      toast.error(`Please login to access ${feature.title}`);
      navigate("/login");
      return;
    }

    if (feature.route) {
      navigate(feature.route);
    } else {
      toast.success(`${feature.title} feature coming soon!`);
    }
  };

  const featureBoxes = [
    {
      icon: Bot,
      title: "AI Mock Interview",
      desc: "Simulate technical & behavioral rounds with real-time feedback.",
      badge: "AI",
      route: "/mock-interview",
    },
    {
      icon: FileText,
      title: "Resume Builder",
      desc: "Create clean, ATS-optimized resumes ready to export.",
      badge: "Resume",
      route: "/resume-builder",
    },
    {
      icon: FileCheck2,
      title: "ATS Scanner",
      desc: "Scan your resume against job postings to boost your match score.",
      badge: "ATS",
      route: "/ats-scanner",
    },
  ];

  return (
    <section className="relative w-full flex-1 flex flex-col justify-center px-6 lg:px-12 py-12 lg:py-20 bg-white dark:bg-[#090c15] transition-colors overflow-hidden">
      
      {/* Subtle Architectural Dot Grid Background */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(#e4e4e7_1px,transparent_1px)] dark:bg-[radial-gradient(#1e2638_1px,transparent_1px)] [background-size:24px_24px] opacity-70 dark:opacity-40" />

      <div className="relative z-10 w-full max-w-5xl mx-auto text-center space-y-8">
        
        {/* Headline & Subtitle */}
        <div className="space-y-4">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-zinc-950 dark:text-white leading-[1.12]"
          >
            Find your next tech role with{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-blue-600 dark:from-sky-400 dark:to-blue-400">
              transparent pay.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-base sm:text-lg text-zinc-600 dark:text-zinc-300 max-w-2xl mx-auto leading-relaxed font-normal"
          >
            Curated engineering, product, and design roles. Upfront compensation, direct recruiter pipelines, and zero ghosting.
          </motion.p>
        </div>

        {/* Search Console */}
        <motion.form
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          onSubmit={handleSearch}
          className="max-w-3xl mx-auto rounded-2xl border-2 border-zinc-200 dark:border-zinc-800 bg-zinc-50/90 dark:bg-zinc-900/90 backdrop-blur-xs p-2 shadow-sm flex flex-col sm:flex-row gap-2 transition-colors focus-within:ring-2 focus-within:ring-sky-500/20"
        >
          <div className="flex-1 flex items-center gap-3 px-3.5 py-2">
            <Search className="w-5 h-5 text-zinc-400 flex-shrink-0" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Job title, tech skill, or keyword..."
              className="w-full bg-transparent text-sm font-medium text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none"
            />
          </div>

          <div className="sm:border-l border-zinc-200 dark:border-zinc-800 flex-1 flex items-center gap-3 px-3.5 py-2">
            <MapPin className="w-5 h-5 text-zinc-400 flex-shrink-0" />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, or 'Remote'..."
              className="w-full bg-transparent text-sm font-medium text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="px-6 py-3 rounded-xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 text-xs font-bold hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs whitespace-nowrap"
          >
            <span>Search Jobs</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </motion.form>

        {/* Quick Tags */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-2 text-xs"
        >
          <span className="text-zinc-400 dark:text-zinc-500 font-medium">Popular:</span>
          {trendingTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() =>
                navigate(
                  tag === "Remote"
                    ? "/find-jobs?location=Remote"
                    : `/find-jobs?query=${encodeURIComponent(tag)}`
                )
              }
              className="px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800/90 border border-zinc-200 dark:border-zinc-700/80 text-zinc-700 dark:text-zinc-200 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors font-medium cursor-pointer shadow-xs"
            >
              {tag}
            </button>
          ))}
        </motion.div>

        {/* 3 Core Tools: AI Mock Interview, Resume Builder, ATS Scanner */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="pt-8 max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-zinc-200/80 dark:border-zinc-800/80"
        >
          {featureBoxes.map((feature, i) => (
            <div
              key={i}
              onClick={() => handleFeatureClick(feature)}
              className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 p-4 sm:p-5 text-left shadow-xs hover:border-zinc-400 dark:hover:border-zinc-600 hover:shadow-sm transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/70 dark:border-zinc-700/60 flex items-center justify-center text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-950 dark:group-hover:text-white transition-colors">
                    <feature.icon className="w-4.5 h-4.5" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border border-zinc-200/70 dark:border-zinc-700/60">
                      {feature.badge}
                    </span>
                    <ArrowUpRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-950 dark:group-hover:text-white transition-colors" />
                  </div>
                </div>

                <h3 className="text-sm sm:text-[15px] font-bold tracking-tight text-zinc-900 dark:text-zinc-100 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-xs sm:text-[13px] text-zinc-500 dark:text-zinc-400 mt-1.5 leading-relaxed font-normal">
                  {feature.desc}
                </p>
              </div>
            </div>
          ))}
        </motion.div>

      </div>
    </section>
  );
};

export default Hero;
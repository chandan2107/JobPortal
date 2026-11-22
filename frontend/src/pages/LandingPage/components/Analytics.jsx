import React from "react";
import { motion } from "framer-motion";
import {
  Clock,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  Code2,
  Palette,
  BarChart2,
  Cpu,
  Layers,
  ArrowUpRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const metrics = [
  {
    icon: Clock,
    value: "4.2 Days",
    label: "Median time to 1st screen",
    description: "Fast-tracked recruiter reviews with zero stale postings.",
    badge: "3x Faster"
  },
  {
    icon: ShieldCheck,
    value: "94%",
    label: "Salary disclosure rate",
    description: "All roles include verified compensation ranges upfront.",
    badge: "Transparent"
  },
  {
    icon: TrendingUp,
    value: "88%",
    label: "ATS interview rate",
    description: "Candidates using the ATS scanner advance 2.8x more often.",
    badge: "Optimized"
  },
  {
    icon: CheckCircle2,
    value: "0 Ghosting",
    label: "Pipeline transparency",
    description: "Automated status notifications at every stage of the review.",
    badge: "Guaranteed"
  }
];

const topDisciplines = [
  { name: "Frontend & Full Stack", count: "480+ roles", icon: Code2, query: "Frontend" },
  { name: "UI/UX & Product Design", count: "190+ roles", icon: Palette, query: "Design" },
  { name: "Cloud & DevOps", count: "230+ roles", icon: Cpu, query: "DevOps" },
  { name: "Data & Machine Learning", count: "310+ roles", icon: BarChart2, query: "Data" },
  { name: "Product & Engineering Lead", count: "120+ roles", icon: Layers, query: "Product" },
];

const Analytics = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 lg:py-28 bg-white dark:bg-slate-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Metric Grid */}
        <div className="mb-20">
          <div className="max-w-3xl mb-12">
            <span className="text-xs uppercase font-bold tracking-wider text-sky-600 dark:text-sky-400">
              Measurable Impact
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
              Built on fairness, velocity, and real feedback.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {metrics.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.08 }}
                className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-slate-700 text-white flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-sky-400" />
                    </div>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                      {item.badge}
                    </span>
                  </div>
                  <div className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                    {item.value}
                  </div>
                  <div className="text-xs font-semibold text-slate-700 dark:text-slate-200 mt-1">
                    {item.label}
                  </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-4 leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Curated Disciplines Explorer */}
        <div className="rounded-2xl p-8 sm:p-10 bg-slate-950 text-white dark:bg-slate-850 border border-slate-800 relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-sky-400">
                Explore by Domain
              </span>
              <h3 className="text-2xl font-bold text-white mt-1">
                High-demand specializations open right now
              </h3>
            </div>
            <button
              onClick={() => navigate("/find-jobs")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-slate-950 text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer w-fit"
            >
              <span>View All 1,840+ Openings</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {topDisciplines.map((discipline, i) => (
              <button
                key={i}
                onClick={() => navigate(`/find-jobs?category=${encodeURIComponent(discipline.query)}`)}
                className="p-4 rounded-xl bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-left transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-800 text-sky-400 flex items-center justify-center">
                    <discipline.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-sky-300 transition-colors">
                      {discipline.name}
                    </h4>
                    <span className="text-[11px] text-slate-400">{discipline.count}</span>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default Analytics;
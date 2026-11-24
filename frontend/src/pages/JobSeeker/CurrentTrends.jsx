import { useEffect, useState } from "react";
import {
  TrendingUp,
  ArrowLeft,
  Briefcase,
  DollarSign,
  Globe,
  Flame,
  Sparkles,
  ArrowUpRight,
  CheckCircle2,
  User,
  FileText,
  Shield,
  BarChart3,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import Navbar from "../../components/layout/Navbar";

const TRACKS = ["All", "Engineering", "Design", "Data/AI", "DevOps"];

const BASELINE_BY_TRACK = {
  All: {
    activeJobs: 24,
    avgSalaryMin: 85000,
    avgSalaryMax: 165000,
    remoteCount: 9,
    remoteShare: 38,
    fastestGrowingRole: "Full Stack Engineering",
    topSkills: [
      { name: "React", count: 18, percentage: 75 },
      { name: "TypeScript", count: 15, percentage: 63 },
      { name: "Node.js", count: 14, percentage: 58 },
      { name: "Python", count: 12, percentage: 50 },
      { name: "AWS", count: 11, percentage: 46 },
      { name: "SQL", count: 10, percentage: 42 },
      { name: "Docker", count: 9, percentage: 38 },
      { name: "Tailwind CSS", count: 8, percentage: 33 },
      { name: "MongoDB", count: 8, percentage: 33 },
      { name: "Git", count: 7, percentage: 29 },
    ],
    roleDemand: [
      { role: "Full Stack Developer", count: 9, share: 38, avgSalaryMin: 95000, avgSalaryMax: 180000 },
      { role: "Frontend Engineer", count: 6, share: 25, avgSalaryMin: 80000, avgSalaryMax: 150000 },
      { role: "Data / AI Engineer", count: 4, share: 17, avgSalaryMin: 105000, avgSalaryMax: 195000 },
      { role: "DevOps / Cloud", count: 3, share: 13, avgSalaryMin: 95000, avgSalaryMax: 175000 },
      { role: "UI/UX Design", count: 2, share: 8, avgSalaryMin: 70000, avgSalaryMax: 135000 },
    ],
  },
  Engineering: {
    activeJobs: 15,
    avgSalaryMin: 90000,
    avgSalaryMax: 175000,
    remoteCount: 6,
    remoteShare: 40,
    fastestGrowingRole: "Full Stack Developer",
    topSkills: [
      { name: "React", count: 13, percentage: 87 },
      { name: "TypeScript", count: 11, percentage: 73 },
      { name: "Node.js", count: 10, percentage: 67 },
      { name: "Next.js", count: 8, percentage: 53 },
      { name: "JavaScript", count: 8, percentage: 53 },
      { name: "MongoDB", count: 7, percentage: 47 },
      { name: "REST APIs", count: 7, percentage: 47 },
      { name: "Tailwind CSS", count: 6, percentage: 40 },
      { name: "SQL", count: 5, percentage: 33 },
      { name: "Git", count: 5, percentage: 33 },
    ],
    roleDemand: [
      { role: "Full Stack Developer", count: 7, share: 47, avgSalaryMin: 95000, avgSalaryMax: 180000 },
      { role: "Frontend Engineer", count: 5, share: 33, avgSalaryMin: 80000, avgSalaryMax: 150000 },
      { role: "Backend Engineer", count: 3, share: 20, avgSalaryMin: 90000, avgSalaryMax: 170000 },
    ],
  },
  Design: {
    activeJobs: 5,
    avgSalaryMin: 70000,
    avgSalaryMax: 135000,
    remoteCount: 3,
    remoteShare: 60,
    fastestGrowingRole: "Product Designer",
    topSkills: [
      { name: "Figma", count: 5, percentage: 100 },
      { name: "UI/UX", count: 5, percentage: 100 },
      { name: "Tailwind CSS", count: 3, percentage: 60 },
      { name: "React", count: 2, percentage: 40 },
      { name: "JavaScript", count: 2, percentage: 40 },
    ],
    roleDemand: [
      { role: "Product Designer", count: 3, share: 60, avgSalaryMin: 75000, avgSalaryMax: 145000 },
      { role: "UI/UX Designer", count: 2, share: 40, avgSalaryMin: 65000, avgSalaryMax: 120000 },
    ],
  },
  "Data/AI": {
    activeJobs: 6,
    avgSalaryMin: 105000,
    avgSalaryMax: 195000,
    remoteCount: 2,
    remoteShare: 33,
    fastestGrowingRole: "AI / ML Engineer",
    topSkills: [
      { name: "Python", count: 6, percentage: 100 },
      { name: "Machine Learning", count: 5, percentage: 83 },
      { name: "SQL", count: 5, percentage: 83 },
      { name: "PyTorch", count: 4, percentage: 67 },
      { name: "TensorFlow", count: 3, percentage: 50 },
      { name: "AWS", count: 3, percentage: 50 },
      { name: "Docker", count: 2, percentage: 33 },
    ],
    roleDemand: [
      { role: "AI / ML Engineer", count: 4, share: 67, avgSalaryMin: 115000, avgSalaryMax: 210000 },
      { role: "Data Analyst", count: 2, share: 33, avgSalaryMin: 85000, avgSalaryMax: 155000 },
    ],
  },
  DevOps: {
    activeJobs: 5,
    avgSalaryMin: 95000,
    avgSalaryMax: 180000,
    remoteCount: 3,
    remoteShare: 60,
    fastestGrowingRole: "Cloud & DevOps Engineer",
    topSkills: [
      { name: "AWS", count: 5, percentage: 100 },
      { name: "Docker", count: 5, percentage: 100 },
      { name: "Kubernetes", count: 4, percentage: 80 },
      { name: "CI/CD", count: 4, percentage: 80 },
      { name: "Linux", count: 4, percentage: 80 },
      { name: "Terraform", count: 3, percentage: 60 },
      { name: "Python", count: 2, percentage: 40 },
    ],
    roleDemand: [
      { role: "Cloud & DevOps Engineer", count: 3, share: 60, avgSalaryMin: 95000, avgSalaryMax: 180000 },
      { role: "Site Reliability Engineer", count: 2, share: 40, avgSalaryMin: 105000, avgSalaryMax: 190000 },
    ],
  },
};

const formatSalaryNum = (num) => {
  if (!num && num !== 0) return "—";
  const n = Number(num);
  if (isNaN(n) || n === 0) return "—";
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1).replace(/\.0$/, "")}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1).replace(/\.0$/, "")}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)}k`;
  return `₹${n.toLocaleString("en-IN")}`;
};

const formatSalaryRange = (min, max) => {
  if (!min && !max) return "Competitive";
  if (min && max) return `${formatSalaryNum(min)} - ${formatSalaryNum(max)}/m`;
  return `${formatSalaryNum(min || max)}/m`;
};

const CurrentTrends = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [selectedTrack, setSelectedTrack] = useState("All");
  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState(true);
  const [usingBaseline, setUsingBaseline] = useState(false);

  useEffect(() => {
    const fetchTrends = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get(API_PATHS.JOBS.GET_TRENDS, {
          params: { track: selectedTrack },
        });
        const data = res.data;
        if (data && data.activeJobs > 0 && data.topSkills?.length > 0) {
          setTrends(data);
          setUsingBaseline(false);
        } else {
          setTrends(BASELINE_BY_TRACK[selectedTrack] || BASELINE_BY_TRACK.All);
          setUsingBaseline(true);
        }
      } catch {
        setTrends(BASELINE_BY_TRACK[selectedTrack] || BASELINE_BY_TRACK.All);
        setUsingBaseline(true);
      } finally {
        setLoading(false);
      }
    };

    fetchTrends();
  }, [selectedTrack]);

  const data = trends || BASELINE_BY_TRACK[selectedTrack] || BASELINE_BY_TRACK.All;

  // Compute personalized skill match against top trending skills
  const userSkillsLower = (user?.skills || []).map((s) => s.toLowerCase().trim());
  const topTrendingSkills = data.topSkills || [];
  const matchedTrending = topTrendingSkills.filter((skill) =>
    userSkillsLower.some(
      (us) => us === skill.name.toLowerCase() || us.includes(skill.name.toLowerCase()) || skill.name.toLowerCase().includes(us)
    )
  );
  const missingTrending = topTrendingSkills.filter(
    (skill) => !matchedTrending.some((m) => m.name === skill.name)
  );
  const matchDenominator = topTrendingSkills.length || 10;
  const matchCount = matchedTrending.length;
  const matchPercent = matchDenominator > 0 ? Math.round((matchCount / matchDenominator) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#090c15] pb-20 transition-colors">
      <Navbar />

      <div className="max-w-7xl mx-auto mt-8 px-4 sm:px-6">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white font-medium text-sm mb-6 group transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back
        </button>

        {/* ── Header + Track Filter ── */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 mb-8">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-200 dark:shadow-purple-950/50 flex-shrink-0">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                  Current Market Trends
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60">
                  {usingBaseline ? "Market Benchmark" : "Live Portal Data"}
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-zinc-400 font-medium mt-0.5">
                In-demand skills, salary ranges, and hiring momentum across active tech roles
              </p>
            </div>
          </div>

          {/* Track Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-zinc-900 p-1.5 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xs self-start lg:self-auto">
            {TRACKS.map((track) => {
              const isActive = selectedTrack === track;
              return (
                <button
                  key={track}
                  onClick={() => setSelectedTrack(track)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-gray-600 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800"
                  }`}
                >
                  {track}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── 4 KPI Summary Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* KPI 1: Active Jobs */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-gray-200 dark:border-zinc-800 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">
                Active Jobs
              </span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-800/60 flex items-center justify-center">
                <Briefcase className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            {loading ? (
              <div className="h-8 w-20 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse" />
            ) : (
              <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
                {data.activeJobs}
              </p>
            )}
            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
              Open roles in {selectedTrack === "All" ? "all tracks" : selectedTrack}
            </p>
          </div>

          {/* KPI 2: Avg. Salary Range */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-gray-200 dark:border-zinc-800 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">
                Avg. Salary Range
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800/60 flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            {loading ? (
              <div className="h-8 w-36 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse" />
            ) : (
              <p className="text-xl sm:text-2xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 truncate">
                {formatSalaryRange(data.avgSalaryMin, data.avgSalaryMax)}
              </p>
            )}
            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
              Average monthly compensation
            </p>
          </div>

          {/* KPI 3: Remote Share % */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-gray-200 dark:border-zinc-800 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">
                Remote Share
              </span>
              <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-800/60 flex items-center justify-center">
                <Globe className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
            {loading ? (
              <div className="h-8 w-16 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse" />
            ) : (
              <p className="text-2xl sm:text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
                {data.remoteShare}%
              </p>
            )}
            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
              {data.remoteCount} remote-friendly positions
            </p>
          </div>

          {/* KPI 4: Fastest-Growing Role */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-gray-200 dark:border-zinc-800 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">
                Fastest-Growing Role
              </span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-800/60 flex items-center justify-center">
                <Flame className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            {loading ? (
              <div className="h-8 w-36 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse" />
            ) : (
              <p className="text-lg sm:text-xl font-extrabold text-gray-900 dark:text-white truncate">
                {data.fastestGrowingRole}
              </p>
            )}
            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
              Highest hiring demand right now
            </p>
          </div>
        </div>

        {/* ── 2-Column Analytics Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Left: Top In-Demand Skills */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    Top In-Demand Skills
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                    Click any skill to search matching jobs
                  </p>
                </div>
                <span className="text-[11px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">
                  Demand %
                </span>
              </div>

              {loading ? (
                <div className="space-y-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-8 bg-gray-100 dark:bg-zinc-800 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="space-y-3.5">
                  {topTrendingSkills.map((skill, idx) => {
                    const hasSkill = matchedTrending.some((m) => m.name === skill.name);
                    return (
                      <div
                        key={skill.name}
                        onClick={() => navigate(`/find-jobs?query=${encodeURIComponent(skill.name)}`)}
                        className="group cursor-pointer"
                      >
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-md bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 font-bold text-[11px] flex items-center justify-center">
                              {idx + 1}
                            </span>
                            <span className="font-bold text-gray-800 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {skill.name}
                            </span>
                            {hasSkill && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                                <CheckCircle2 className="w-2.5 h-2.5" />
                                In Profile
                              </span>
                            )}
                          </div>
                          <span className="font-mono font-bold text-gray-500 dark:text-zinc-400">
                            {skill.percentage}%
                          </span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 group-hover:from-purple-500 group-hover:to-blue-600 transition-all duration-500"
                            style={{ width: `${Math.max(8, skill.percentage)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Clickable Skill Tags */}
            {!loading && topTrendingSkills.length > 0 && (
              <div className="mt-6 pt-5 border-t border-gray-100 dark:border-zinc-800">
                <p className="text-[11px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-2.5">
                  Quick Job Search by Skill
                </p>
                <div className="flex flex-wrap gap-2">
                  {topTrendingSkills.map((skill) => (
                    <button
                      key={skill.name}
                      onClick={() => navigate(`/find-jobs?query=${encodeURIComponent(skill.name)}`)}
                      className="px-3 py-1.5 bg-gray-50 dark:bg-zinc-800/80 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-gray-700 dark:text-zinc-300 hover:text-blue-700 dark:hover:text-blue-300 border border-gray-200 dark:border-zinc-700 hover:border-blue-300 dark:hover:border-blue-700 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <span>{skill.name}</span>
                      <ArrowUpRight className="w-3 h-3 opacity-60" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Salary & Hiring Demand by Role */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Salary & Hiring Demand by Role
                </h2>
                <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                  Active openings and compensation benchmarks
                </p>
              </div>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-20 bg-gray-100 dark:bg-zinc-800 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {(data.roleDemand || []).map((item) => (
                  <div
                    key={item.role}
                    onClick={() => navigate(`/find-jobs?query=${encodeURIComponent(item.role)}`)}
                    className="p-4 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/60 dark:bg-zinc-950/50 hover:border-blue-300 dark:hover:border-blue-700 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                        {item.role}
                      </h3>
                      <span className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                        {formatSalaryRange(item.avgSalaryMin, item.avgSalaryMax)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-zinc-400 mb-2">
                      <span>
                        {item.count} open {item.count === 1 ? "role" : "roles"}
                      </span>
                      <span className="font-semibold">{item.share}% share</span>
                    </div>

                    <div className="w-full h-1.5 bg-gray-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
                        style={{ width: `${Math.max(10, item.share)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Personalized Skill Match Banner ── */}
        <div className="rounded-2xl border border-indigo-200 dark:border-indigo-800/60 bg-gradient-to-r from-blue-50/90 via-indigo-50/90 to-purple-50/90 dark:from-blue-950/40 dark:via-indigo-950/40 dark:to-purple-950/40 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 dark:bg-zinc-900/80 border border-indigo-200 dark:border-indigo-800 text-xs font-bold text-indigo-700 dark:text-indigo-300">
                <Sparkles className="w-3.5 h-3.5" />
                Personalized Skill Match
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                You match {matchCount}/{matchDenominator} trending skills for{" "}
                {selectedTrack === "All" ? "Full Stack" : selectedTrack} roles
              </h2>

              <p className="text-sm text-gray-600 dark:text-zinc-300">
                {user?.skills?.length > 0
                  ? `Your profile covers ${matchPercent}% of the top skills employers are hiring for right now.`
                  : "Add your skills to your profile to see how you stack up against live market demand."}
              </p>

              {/* Missing Trending Skills Pills */}
              {missingTrending.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-xs font-semibold text-gray-500 dark:text-zinc-400 mr-1">
                    Top skills to add:
                  </span>
                  {missingTrending.slice(0, 5).map((s) => (
                    <span
                      key={s.name}
                      className="px-2.5 py-0.5 rounded-lg text-[11px] font-semibold bg-white/80 dark:bg-zinc-900/80 border border-indigo-200/80 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300"
                    >
                      + {s.name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Links to Profile, Resume Builder, ATS Scanner */}
            <div className="flex flex-wrap items-center gap-3 flex-shrink-0">
              <button
                onClick={() => navigate("/profile")}
                className="px-4 py-2.5 bg-white dark:bg-zinc-900 hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-800 dark:text-zinc-100 border border-gray-200 dark:border-zinc-700 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Update Profile
              </button>
              <button
                onClick={() => navigate("/resume-builder")}
                className="px-4 py-2.5 bg-white dark:bg-zinc-900 hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-800 dark:text-zinc-100 border border-gray-200 dark:border-zinc-700 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Resume Builder
              </button>
              <button
                onClick={() => navigate("/ats-scanner")}
                className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm hover:shadow-md"
              >
                <Shield className="w-4 h-4" />
                ATS Scanner
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrentTrends;

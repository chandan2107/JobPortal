import React from "react";
import { motion } from "framer-motion";
import { Search, ArrowRight, Users, Building2, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";


const Hero = () => {
  const {user, isAuthenticated} = useAuth()
  const navigate = useNavigate();

  const stats = [
    { icon: Users, label: "Active Job Seekers", value: "10K+" },
    { icon: Building2, label: "Companies", value: "500+" },
    { icon: TrendingUp, label: "Jobs Posted", value: "10K+" },
  ];

  return (
    <div>
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 bg-white min-h-screen flex items-center overflow-hidden">
        {/* subtle background elements */}
        <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/40 rounded-full blur-[120px] mix-blend-multiply"></div>
            <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-purple-100/40 rounded-full blur-[120px] mix-blend-multiply"></div>
            <div className="absolute top-[20%] right-[15%] w-[30%] h-[30%] bg-sky-100/30 rounded-full blur-[100px] mix-blend-multiply"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Main heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 mb-6 leading-tight tracking-tight"
            >
              Find Your Dream Job or
              <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mt-2 pb-2">Perfect Hire</span>
            </motion.h1>

            {/* Subheading */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-lg md:text-xl text-gray-500 mb-12 max-w-2xl mx-auto leading-relaxed font-medium"
            >
              Connecting Talent with Opportunity - Your Gateway to Success
            </motion.p>

            {/* CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group w-full sm:w-auto bg-gray-900 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-800 transition-all duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex items-center justify-center space-x-2"
                onClick={() => navigate("/find-jobs")}
              >
                <Search className="w-5 h-5 text-gray-300" />
                <span>Find Jobs</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform text-gray-300" />
              </motion.button>

             <motion.button
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
  className="w-full sm:w-auto bg-white border border-gray-200 text-gray-700 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 shadow-sm"
  onClick={() =>
    navigate(
      isAuthenticated && user?.role === "employer"
        ? "/employer-dashboard"
        : "/login"
    )
  }
>
                Post a Job
              </motion.button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 + index * 0.1, duration: 0.6 }}
                  className="flex flex-col items-center space-y-3 p-6 rounded-3xl bg-white/80 backdrop-blur-md border border-gray-100/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300"
                >
                  <div className="w-14 h-14 bg-blue-50/80 rounded-2xl flex items-center justify-center mb-1">
                    <stat.icon className="w-7 h-7 text-blue-600" />
                  </div>
                  <div className="text-3xl font-extrabold text-gray-900 tracking-tight">{stat.value}</div>
                  <div className="text-sm text-gray-500 font-medium uppercase tracking-wider">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>


      </section>
    </div>
  );
};

export default Hero;
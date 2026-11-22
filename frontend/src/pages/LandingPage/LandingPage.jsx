import React from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Footer from "./components/Footer";

const LandingPage = () => {
  return (
    <div className="w-full min-h-screen bg-white dark:bg-[#090c15] text-zinc-900 dark:text-zinc-100 transition-colors duration-200 flex flex-col justify-between">
      <Header />
      <main className="w-full flex-1 flex flex-col justify-center">
        <Hero />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;

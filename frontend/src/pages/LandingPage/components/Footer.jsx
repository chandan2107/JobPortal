import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="w-full border-t border-zinc-200 dark:border-zinc-800/80 py-5 px-6 lg:px-12 bg-white dark:bg-[#090c15] transition-colors">
      <div className="w-full flex items-center justify-between text-xs text-zinc-700 dark:text-zinc-400">
        <span>Simple, transparent tech hiring</span>
        <span className="font-mono text-[11px]">
          <Link
            to="/admin-login"
            className="hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors cursor-pointer select-none"
            title="Admin Portal"
          >
            &copy;
          </Link>{" "}
          {new Date().getFullYear()}
        </span>
      </div>
    </footer>
  );
};

export default Footer;

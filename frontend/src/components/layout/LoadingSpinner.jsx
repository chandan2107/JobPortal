import AppLogo from "./AppLogo";

const LoadingSpinner = ({ fullScreen = true }) => {
  return (
    <div
      className={`relative w-full flex flex-col items-center justify-center bg-white dark:bg-[#090c15] text-zinc-900 dark:text-zinc-100 transition-colors overflow-hidden px-4 ${
        fullScreen ? "min-h-screen" : "py-20"
      }`}
    >
      {/* Background Dot Grid */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(#e4e4e7_1px,transparent_1px)] dark:bg-[radial-gradient(#1e2638_1px,transparent_1px)] [background-size:24px_24px] opacity-70 dark:opacity-30" />

      {/* Ambient Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-blue-500/10 dark:bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Central Round Loading with Logo */}
      <div className="relative z-10 flex items-center justify-center">
        {/* Round Spinning Loader Ring */}
        <div className="w-20 h-20 rounded-full border-3 border-blue-100 dark:border-blue-950/70 border-t-blue-600 dark:border-t-blue-500 animate-spin" />

        {/* Center Plaque with App Logo */}
        <div className="absolute w-13 h-13 bg-white/90 dark:bg-zinc-900/90 rounded-2xl shadow-lg shadow-blue-500/5 dark:shadow-black/40 border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-center p-2.5 backdrop-blur-xs">
          <AppLogo className="w-full h-auto" />
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
import { Briefcase } from "lucide-react";

const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-white">
      <div className="flex flex-col items-center gap-5">
        {/* Spinner ring */}
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
          <div className="absolute w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-blue-600" />
          </div>
        </div>

        <div className="text-center">
          <p className="text-base font-bold text-gray-900">Loading...</p>
          <p className="text-sm text-gray-400 mt-0.5">Finding amazing opportunities</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
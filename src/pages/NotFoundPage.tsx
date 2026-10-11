import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="max-w-xl mx-auto py-20 px-4 text-center space-y-6">
      <div className="w-20 h-20 rounded-3xl bg-[#580F69]/10 border border-[#580F69]/20 text-[#580F69] mx-auto flex items-center justify-center">
        <Compass className="w-10 h-10 animate-spin-slow" aria-hidden="true" />
      </div>

      <div className="space-y-2">
        <h1 className="text-4xl font-black text-[#370D48] tracking-tight">404</h1>
        <h2 className="text-xl font-bold text-[#370D48]">Page Not Found</h2>
        <p className="text-sm text-[#240D2F]/75 max-w-sm mx-auto leading-relaxed">
          The career navigation pathway or resource you are looking for does not exist or has been moved.
        </p>
      </div>

      <div className="pt-4 flex items-center justify-center gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#580F69] hover:bg-[#370D48] text-white font-bold text-sm shadow-md transition-all min-h-[44px]"
        >
          <Home className="w-4 h-4" />
          <span>Return Home</span>
        </Link>
        <Link
          to="/careers"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#D2B9E0] text-[#370D48] font-bold text-sm hover:bg-[#D2B9E0]/20 transition-all min-h-[44px]"
        >
          <span>Explore Careers</span>
        </Link>
      </div>
    </div>
  );
};

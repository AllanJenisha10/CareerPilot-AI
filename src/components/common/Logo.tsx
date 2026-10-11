import React, { useState } from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  iconOnly?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  className = ''
}) => {
  const [imageError, setImageError] = useState(false);

  // Exact public path for the official logo image
  const logoUrl = '/careerpilotai%20logo.jpeg';

  // Responsive height and sizing preserving square 1:1 aspect ratio for header, mobile drawer, and footer
  const sizeClasses = {
    sm: 'h-10 w-auto max-h-[40px]',
    md: 'h-14 w-auto max-h-[58px]',
    lg: 'h-20 w-auto max-h-[80px]',
    xl: 'h-28 w-auto max-h-[110px]'
  }[size];

  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      {!imageError ? (
        <img
          src={logoUrl}
          alt="CareerPilot AI — Navigate Your Career. Shape Your Future."
          onError={() => setImageError(true)}
          className={`w-auto h-auto object-contain block ${sizeClasses}`}
        />
      ) : (
        /*
          Clean non-button fallback only shown if the image asset is not yet uploaded into public/
        */
        <div
          title="Place 'careerpilotai logo.jpeg' in public/ to display official logo"
          className="flex items-center gap-2 px-2 py-1 rounded-lg text-[#580F69] font-bold text-sm bg-[#580F69]/10 border border-[#580F69]/20"
        >
          <span className="w-2 h-2 rounded-full bg-[#580F69] animate-pulse" aria-hidden="true" />
          <span>CareerPilot AI</span>
        </div>
      )}
    </div>
  );
};




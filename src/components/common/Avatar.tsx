import React, { useState } from 'react';

interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  alt?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name = 'Candidate',
  size = 'md',
  className = '',
  alt
}) => {
  const [imageError, setImageError] = useState(false);

  // Extract up to 2 initials
  const initials = name
    .trim()
    .split(/\s+/)
    .map(part => part.charAt(0).toUpperCase())
    .filter(Boolean)
    .slice(0, 2)
    .join('') || 'CP';

  const sizeStyles = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-16 h-16 text-lg font-bold',
    xl: 'w-28 h-28 text-3xl font-black'
  }[size];

  const effectiveAlt = alt || `${name}'s profile avatar`;

  if (src && !imageError) {
    return (
      <div
        className={`relative inline-block rounded-full overflow-hidden shrink-0 border-2 border-[#D2B9E0] shadow-xs bg-[#F7F5F8] ${sizeStyles} ${className}`}
      >
        <img
          src={src}
          alt={effectiveAlt}
          onError={() => setImageError(true)}
          className="w-full h-full object-cover rounded-full"
        />
      </div>
    );
  }

  return (
    <div
      role="img"
      aria-label={effectiveAlt}
      className={`inline-flex items-center justify-center rounded-full shrink-0 select-none bg-gradient-to-br from-[#580F69] to-[#370D48] text-white border-2 border-[#D2B9E0] font-bold shadow-xs ${sizeStyles} ${className}`}
    >
      <span aria-hidden="true" className="tracking-wide">
        {initials}
      </span>
    </div>
  );
};

import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'accent' | 'neutral' | 'success' | 'warning' | 'info';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = ''
}) => {
  const variantStyles = {
    // Deep Indigo on soft thistle tint (WCAG AA compliant contrast > 4.5:1)
    primary: 'bg-[#580F69]/10 text-[#580F69] border border-[#580F69]/20 font-semibold',
    // Blackberry strong
    secondary: 'bg-[#370D48] text-white font-medium',
    // Thistle highlight
    accent: 'bg-[#D2B9E0] text-[#370D48] font-semibold border border-[#B992CD]',
    // Neutral chalk / dark text
    neutral: 'bg-white text-[#240D2F] border border-[#D2B9E0]',
    // Success status
    success: 'bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold',
    // Warning status
    warning: 'bg-amber-50 text-amber-900 border border-amber-200 font-semibold',
    // Info
    info: 'bg-purple-50 text-[#580F69] border border-purple-200 font-semibold'
  }[variant];

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 rounded-md',
    md: 'text-xs px-2.5 py-1 rounded-lg'
  }[size];

  return (
    <span className={`inline-flex items-center gap-1 leading-none ${sizeStyles} ${variantStyles} ${className}`}>
      {children}
    </span>
  );
};

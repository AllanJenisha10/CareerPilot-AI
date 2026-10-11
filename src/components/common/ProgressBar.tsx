import React from 'react';

interface ProgressBarProps {
  value: number; // 0 to 100
  label?: string;
  showPercent?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  srContext?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  label,
  showPercent = true,
  size = 'md',
  className = '',
  srContext
}) => {
  const clamped = Math.min(Math.max(Math.round(value), 0), 100);

  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4'
  }[size];

  return (
    <div className={`w-full ${className}`}>
      {(label || showPercent) && (
        <div className="flex justify-between items-center text-xs font-medium text-[#240D2F] mb-1.5">
          {label && <span>{label}</span>}
          {showPercent && (
            <span className="font-semibold text-[#580F69] ml-auto">
              {clamped}%
            </span>
          )}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label || srContext || 'Progress indicator'}
        className={`w-full bg-[#E5D7EE] rounded-full overflow-hidden ${heightClasses}`}
      >
        <div
          className="h-full rounded-full transition-all duration-300 ease-out bg-gradient-to-r from-[#580F69] to-[#370D48]"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
};

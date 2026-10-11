import React from 'react';
import { LucideIcon, Compass } from 'lucide-react';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Compass,
  title,
  description,
  actionText,
  actionHref,
  onAction,
  className = ''
}) => {
  return (
    <div className={`text-center py-12 px-4 rounded-2xl bg-white border border-[#D2B9E0]/60 shadow-xs max-w-xl mx-auto my-6 ${className}`}>
      <div className="w-14 h-14 mx-auto rounded-2xl bg-[#D2B9E0]/30 border border-[#D2B9E0] flex items-center justify-center text-[#580F69] mb-4">
        <Icon className="w-7 h-7" aria-hidden="true" />
      </div>
      <h3 className="text-lg font-bold text-[#370D48] tracking-tight">{title}</h3>
      <p className="text-sm text-[#240D2F]/75 mt-1.5 max-w-md mx-auto leading-relaxed">
        {description}
      </p>

      {(actionText && (actionHref || onAction)) && (
        <div className="mt-6">
          {actionHref ? (
            <Link
              to={actionHref}
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-[#580F69] text-white font-semibold text-sm hover:bg-[#370D48] transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-[#580F69] focus:ring-offset-2 min-h-[44px]"
            >
              {actionText}
            </Link>
          ) : (
            <button
              onClick={onAction}
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-[#580F69] text-white font-semibold text-sm hover:bg-[#370D48] transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-[#580F69] focus:ring-offset-2 min-h-[44px]"
            >
              {actionText}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

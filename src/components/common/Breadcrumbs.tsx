import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className = '' }) => {
  return (
    <nav aria-label="Breadcrumb" className={`text-sm text-[#240D2F]/75 ${className}`}>
      <ol className="flex items-center flex-wrap gap-1.5">
        <li>
          <Link
            to="/"
            className="flex items-center gap-1 text-[#580F69] hover:text-[#370D48] hover:underline transition-colors font-medium rounded p-0.5"
          >
            <Home className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Home</span>
          </Link>
        </li>
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <li key={idx} className="flex items-center gap-1.5">
              <ChevronRight className="w-3.5 h-3.5 text-[#A375A1] shrink-0" aria-hidden="true" />
              {isLast || !item.href ? (
                <span
                  aria-current={isLast ? 'page' : undefined}
                  className="font-semibold text-[#370D48] truncate max-w-[200px] sm:max-w-xs"
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.href}
                  className="text-[#580F69] hover:text-[#370D48] hover:underline transition-colors font-medium truncate max-w-[150px] sm:max-w-none rounded p-0.5"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

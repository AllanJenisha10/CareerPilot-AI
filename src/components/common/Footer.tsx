import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';
import { Heart, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer
      role="contentinfo"
      className="bg-[#370D48] text-white pt-16 pb-12 border-t-4 border-[#580F69] mt-20 no-print print:hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-12 border-b border-[#580F69]/80">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white p-3.5 rounded-2xl inline-block shadow-xs border border-white/20">
              <Logo size="lg" />
            </div>
            <p className="text-sm text-[#F7F5F8]/80 leading-relaxed max-w-sm">
              The comprehensive career navigation system empowering students and tech job seekers to bridge skill gaps, build structured roadmaps, and engineer ATS-optimized resumes.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#D2B9E0]">
              <ShieldCheck className="w-4 h-4 text-[#D2B9E0]" aria-hidden="true" />
              <span>WCAG 2.2 AA Accessible • Production-Grade Heuristics</span>
            </div>
          </div>

          {/* Quick Links: Career Discovery */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#D2B9E0] mb-4">
              Career Discovery
            </h4>
            <ul className="space-y-2.5 text-sm text-[#F7F5F8]/85">
              <li>
                <Link to="/careers" className="hover:text-[#D2B9E0] transition-colors focus:outline-none focus:underline">
                  Browse All Careers
                </Link>
              </li>
              <li>
                <Link to="/careers/software-developer" className="hover:text-[#D2B9E0] transition-colors focus:outline-none focus:underline">
                  Software Developer Path
                </Link>
              </li>
              <li>
                <Link to="/careers/ai-ml-engineer" className="hover:text-[#D2B9E0] transition-colors focus:outline-none focus:underline">
                  AI / ML Engineer Path
                </Link>
              </li>
              <li>
                <Link to="/careers/data-analyst" className="hover:text-[#D2B9E0] transition-colors focus:outline-none focus:underline">
                  Data Analyst Path
                </Link>
              </li>
              <li>
                <Link to="/careers/cybersecurity-analyst" className="hover:text-[#D2B9E0] transition-colors focus:outline-none focus:underline">
                  Cybersecurity Path
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links: Skills & Roadmaps */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#D2B9E0] mb-4">
              Skills & Roadmaps
            </h4>
            <ul className="space-y-2.5 text-sm text-[#F7F5F8]/85">
              <li>
                <Link to="/skills" className="hover:text-[#D2B9E0] transition-colors focus:outline-none focus:underline">
                  Skills Assessment
                </Link>
              </li>
              <li>
                <Link to="/skills/javascript" className="hover:text-[#D2B9E0] transition-colors focus:outline-none focus:underline">
                  JavaScript & TypeScript
                </Link>
              </li>
              <li>
                <Link to="/roadmap" className="hover:text-[#D2B9E0] transition-colors focus:outline-none focus:underline">
                  Career Roadmaps
                </Link>
              </li>
              <li>
                <Link to="/roadmap/roadmap-software-dev-1" className="hover:text-[#D2B9E0] transition-colors focus:outline-none focus:underline">
                  Active Learning Path
                </Link>
              </li>
              <li>
                <Link to="/onboarding" className="hover:text-[#D2B9E0] transition-colors focus:outline-none focus:underline">
                  Student Onboarding
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links: Resume Intelligence */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#D2B9E0] mb-4">
              Resume Intelligence
            </h4>
            <ul className="space-y-2.5 text-sm text-[#F7F5F8]/85">
              <li>
                <Link to="/resume" className="hover:text-[#D2B9E0] transition-colors focus:outline-none focus:underline">
                  Resume Hub
                </Link>
              </li>
              <li>
                <Link to="/resume/builder" className="hover:text-[#D2B9E0] transition-colors focus:outline-none focus:underline">
                  ATS Resume Builder
                </Link>
              </li>
              <li>
                <Link to="/resume/analysis" className="hover:text-[#D2B9E0] transition-colors focus:outline-none focus:underline">
                  Resume Content Scanner
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-[#D2B9E0] transition-colors focus:outline-none focus:underline">
                  Candidate Dashboard
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-[#D2B9E0] transition-colors focus:outline-none focus:underline">
                  Settings & Data Reset
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Brand Colour Swatches & Accessibility Statement */}
        <div className="py-8 border-b border-[#580F69]/70 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-[#D2B9E0]">
          <div className="flex items-center gap-3 flex-wrap justify-center md:justify-start">
            <span className="font-semibold text-white">Official Brand Palette:</span>
            <div className="flex items-center gap-1.5" title="Deep Indigo #580F69">
              <span className="w-3.5 h-3.5 rounded-full bg-[#580F69] border border-white/20 inline-block" />
              <span>Deep Indigo</span>
            </div>
            <div className="flex items-center gap-1.5" title="Blackberry Purple #370D48">
              <span className="w-3.5 h-3.5 rounded-full bg-[#370D48] border border-white/20 inline-block" />
              <span>Blackberry</span>
            </div>
            <div className="flex items-center gap-1.5" title="Smoky Purple #A375A1">
              <span className="w-3.5 h-3.5 rounded-full bg-[#A375A1] border border-white/20 inline-block" />
              <span>Smoky</span>
            </div>
            <div className="flex items-center gap-1.5" title="Chalk White #F7F5F8">
              <span className="w-3.5 h-3.5 rounded-full bg-[#F7F5F8] border border-black/20 inline-block" />
              <span className="text-white">Chalk White</span>
            </div>
            <div className="flex items-center gap-1.5" title="Thistle Purple #D2B9E0">
              <span className="w-3.5 h-3.5 rounded-full bg-[#D2B9E0] border border-black/20 inline-block" />
              <span>Thistle</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[#F7F5F8]/75">
            <CheckCircle2 className="w-4 h-4 text-[#D2B9E0]" aria-hidden="true" />
            <span>Contrast verified for AA compliance across all viewports</span>
          </div>
        </div>

        {/* Bottom Disclaimer & Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#F7F5F8]/60 gap-4 text-center sm:text-left">
          <p>
            © {new Date().getFullYear()} CareerPilot AI. Built for students & job seekers. Data persisted in client browser storage.
          </p>
          <p className="flex items-center justify-center gap-1">
            <span>Navigating careers with precision & integrity</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Compass, Award, Map, FileText, LayoutDashboard, UserCheck, Sparkles } from 'lucide-react';
import { Logo } from './Logo';
import { Avatar } from './Avatar';
import { StorageService, STORAGE_EVENT } from '../../services/storage';
import { UserProfile } from '../../types';

export const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profile, setProfile] = useState<UserProfile>(StorageService.getProfile());
  const location = useLocation();

  useEffect(() => {
    const handleUpdate = () => {
      setProfile(StorageService.getProfile());
    };
    window.addEventListener(STORAGE_EVENT, handleUpdate);
    return () => window.removeEventListener(STORAGE_EVENT, handleUpdate);
  }, []);

  const navLinks = [
    { label: 'Home', path: '/', icon: Compass },
    { label: 'Careers', path: '/careers', icon: Compass },
    { label: 'Skills', path: '/skills', icon: Award },
    { label: 'Roadmap', path: '/roadmap', icon: Map },
    { label: 'Resume', path: '/resume', icon: FileText },
    { label: 'AI Studio', path: '/ai-hub', icon: Sparkles },
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Profile', path: '/profile', icon: UserCheck }
  ];

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Handle escape key to close mobile menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener(KeyboardEvent ? 'keydown' : 'keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  return (
    <>
      {/* Skip to Content Link for keyboard accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2.5 focus:bg-[#370D48] focus:text-white focus:rounded-lg focus:shadow-xl focus:outline-none focus:ring-2 focus:ring-[#D2B9E0] text-sm font-bold"
      >
        Skip to main content
      </a>

      <header
        role="banner"
        className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#D2B9E0]/70 transition-shadow duration-200 shadow-xs no-print print:hidden"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo brand link */}
            <Link
              to="/"
              className="flex items-center shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#580F69] rounded-lg transition-opacity hover:opacity-95"
              aria-label="CareerPilot AI Home"
            >
              <Logo size="md" />
            </Link>

            {/* Desktop Navigation */}
            <nav
              aria-label="Primary Navigation"
              className="hidden lg:flex items-center gap-1 xl:gap-2"
            >
              {navLinks.map(link => {
                const isActive =
                  link.path === '/'
                    ? location.pathname === '/'
                    : location.pathname.startsWith(link.path);

                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    aria-current={isActive ? 'page' : undefined}
                    className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-150 flex items-center gap-1.5 min-h-[44px] ${
                      isActive
                        ? 'bg-[#580F69]/10 text-[#580F69] border border-[#580F69]/20 shadow-xs font-bold'
                        : 'text-[#370D48]/85 hover:text-[#580F69] hover:bg-[#D2B9E0]/20'
                    }`}
                  >
                    <link.icon className={`w-4 h-4 ${isActive ? 'text-[#580F69]' : 'text-[#A375A1]'}`} aria-hidden="true" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Quick Actions & Profile Avatar Desktop */}
            <div className="hidden lg:flex items-center gap-3">
              <Link
                to="/resume/builder"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#580F69] text-white text-sm font-semibold hover:bg-[#370D48] transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-[#580F69] focus:ring-offset-2 min-h-[44px]"
              >
                <Sparkles className="w-4 h-4 text-[#D2B9E0]" aria-hidden="true" />
                <span>Build Resume</span>
              </Link>

              {/* Avatar indicator */}
              <Link
                to="/profile"
                className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-[#580F69] transition-all focus:outline-none focus:ring-2 focus:ring-[#580F69]"
                aria-label={`Open profile settings for ${profile.fullName || 'Candidate'}`}
                title={`Profile: ${profile.fullName || 'Candidate'}`}
              >
                <Avatar
                  src={profile.avatarUrl}
                  name={profile.fullName}
                  size="sm"
                  alt={`${profile.fullName || 'Candidate'} avatar`}
                />
              </Link>
            </div>

            {/* Mobile Menu Hamburger Button */}
            <div className="flex lg:hidden items-center gap-2.5">
              <Link
                to="/profile"
                aria-label={`Profile settings for ${profile.fullName || 'Candidate'}`}
                className="focus:outline-none focus:ring-2 focus:ring-[#580F69] rounded-full"
              >
                <Avatar
                  src={profile.avatarUrl}
                  name={profile.fullName}
                  size="sm"
                  alt={`${profile.fullName || 'Candidate'} avatar`}
                />
              </Link>

              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-nav-menu"
                aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                className="inline-flex items-center justify-center p-2.5 rounded-xl text-[#370D48] hover:bg-[#D2B9E0]/30 focus:outline-none focus:ring-2 focus:ring-[#580F69] min-w-[44px] min-h-[44px]"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" aria-hidden="true" />
                ) : (
                  <Menu className="w-6 h-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div
            id="mobile-nav-menu"
            className="lg:hidden border-t border-[#D2B9E0] bg-white px-4 pt-3 pb-6 shadow-xl animate-in slide-in-from-top-2 duration-150"
          >
            {/* Mobile Header Brand inside Drawer */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#D2B9E0]/40">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="focus:outline-none focus-visible:ring-2 focus-visible:ring-[#580F69] rounded-lg"
                aria-label="CareerPilot AI Home"
              >
                <Logo size="sm" />
              </Link>
              <span className="text-xs font-semibold text-[#580F69] px-2.5 py-1 rounded-full bg-[#580F69]/10 border border-[#580F69]/20">
                Career Navigator
              </span>
            </div>

            {/* User Profile Banner in Mobile Menu */}
            <div className="flex items-center gap-3 p-3 mb-3 rounded-2xl bg-[#F7F5F8] border border-[#D2B9E0]">
              <Avatar
                src={profile.avatarUrl}
                name={profile.fullName}
                size="md"
                alt={`${profile.fullName || 'Candidate'} avatar`}
              />
              <div className="min-w-0 flex-1">
                <div className="font-bold text-sm text-[#370D48] truncate">
                  {profile.fullName || 'Candidate'}
                </div>
                <div className="text-xs text-[#240D2F]/70 truncate">
                  {profile.email || 'candidate@example.edu'}
                </div>
              </div>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="text-xs font-bold text-[#580F69] hover:underline shrink-0 p-1"
              >
                Settings
              </Link>
            </div>

            <nav aria-label="Mobile Navigation" className="flex flex-col gap-1.5">
              {navLinks.map(link => {
                const isActive =
                  link.path === '/'
                    ? location.pathname === '/'
                    : location.pathname.startsWith(link.path);

                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    aria-current={isActive ? 'page' : undefined}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium min-h-[44px] ${
                      isActive
                        ? 'bg-[#580F69]/10 text-[#580F69] font-bold border border-[#580F69]/20'
                        : 'text-[#370D48] hover:bg-[#D2B9E0]/20'
                    }`}
                  >
                    <link.icon className={`w-5 h-5 ${isActive ? 'text-[#580F69]' : 'text-[#A375A1]'}`} aria-hidden="true" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}

              <div className="pt-3 mt-2 border-t border-[#F7F5F8] flex flex-col gap-2">
                <Link
                  to="/resume/builder"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 py-3 rounded-xl bg-[#580F69] text-white font-semibold text-sm shadow-sm min-h-[44px]"
                >
                  <Sparkles className="w-4 h-4 text-[#D2B9E0]" aria-hidden="true" />
                  <span>Build ATS Resume</span>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  );
};

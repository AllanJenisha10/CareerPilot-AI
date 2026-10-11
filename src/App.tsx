import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';

// Pages
import { HomePage } from './pages/HomePage';
import { CareersPage } from './pages/CareersPage';
import { CareerDetailPage } from './pages/CareerDetailPage';
import { SkillsPage } from './pages/SkillsPage';
import { SkillDetailPage } from './pages/SkillDetailPage';
import { RoadmapPage } from './pages/RoadmapPage';
import { LearningPathDetailPage } from './pages/LearningPathDetailPage';
import { ResumeDashboardPage } from './pages/ResumeDashboardPage';
import { ResumeBuilderPage } from './pages/ResumeBuilderPage';
import { ResumeAnalysisPage } from './pages/ResumeAnalysisPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProfileSettingsPage } from './pages/ProfileSettingsPage';
import { AICapabilitiesPage } from './pages/AICapabilitiesPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Helper component to manage document title and scroll-to-top on route change
const RouteManager: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    // Scroll to top on navigation
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });

    // Set page title
    const titles: Record<string, string> = {
      '/': 'CareerPilot AI — Navigate Your Career. Shape Your Future.',
      '/careers': 'Explore Tech Careers — CareerPilot AI',
      '/skills': 'Skills Assessment & Growth — CareerPilot AI',
      '/roadmap': 'Career Roadmaps & Learning Paths — CareerPilot AI',
      '/resume': 'Resume Intelligence Dashboard — CareerPilot AI',
      '/resume/builder': 'ATS Resume Builder — CareerPilot AI',
      '/resume/analysis': 'ATS Resume Content Scanner — CareerPilot AI',
      '/onboarding': 'Candidate Onboarding Wizard — CareerPilot AI',
      '/dashboard': 'Candidate Cockpit & Progress — CareerPilot AI',
      '/profile': 'Profile & Preferences — CareerPilot AI',
      '/ai-hub': 'AI Intelligence & Voice Studio — CareerPilot AI'
    };

    if (titles[location.pathname]) {
      document.title = titles[location.pathname];
    } else if (location.pathname.startsWith('/careers/')) {
      document.title = 'Career Details & Gap Analysis — CareerPilot AI';
    } else if (location.pathname.startsWith('/skills/')) {
      document.title = 'Skill Curriculum & Practice — CareerPilot AI';
    } else if (location.pathname.startsWith('/roadmap/')) {
      document.title = 'Learning Path Stages & Milestones — CareerPilot AI';
    } else {
      document.title = 'CareerPilot AI';
    }
  }, [location.pathname]);

  return null;
};

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <div className="min-h-screen flex flex-col bg-[#F7F5F8] text-[#240D2F]">
          <RouteManager />
          <Header />
          <main id="main-content" role="main" className="flex-1 px-4 sm:px-6 lg:px-8 py-8 sm:py-10 max-w-7xl w-full mx-auto print:p-0 print:m-0 print:max-w-none print:w-full">
            <Routes>
              {/* PAGE 1: HOME */}
              <Route path="/" element={<HomePage />} />

              {/* PAGE 2: CAREERS DIRECTORY */}
              <Route path="/careers" element={<CareersPage />} />

              {/* PAGE 3: CAREER DETAILS */}
              <Route path="/careers/:id" element={<CareerDetailPage />} />

              {/* PAGE 4: SKILLS ASSESSMENT */}
              <Route path="/skills" element={<SkillsPage />} />

              {/* PAGE 5: SKILL DETAILS */}
              <Route path="/skills/:id" element={<SkillDetailPage />} />

              {/* PAGE 6: CAREER ROADMAPS */}
              <Route path="/roadmap" element={<RoadmapPage />} />

              {/* PAGE 7: ROADMAP STAGES & TASKS */}
              <Route path="/roadmap/:id" element={<LearningPathDetailPage />} />

              {/* PAGE 8: RESUME DASHBOARD */}
              <Route path="/resume" element={<ResumeDashboardPage />} />

              {/* PAGE 9: RESUME BUILDER */}
              <Route path="/resume/builder" element={<ResumeBuilderPage />} />

              {/* PAGE 10: RESUME ANALYSIS */}
              <Route path="/resume/analysis" element={<ResumeAnalysisPage />} />

              {/* PAGE 11: ONBOARDING WIZARD */}
              <Route path="/onboarding" element={<OnboardingPage />} />

              {/* PAGE 12: DASHBOARD */}
              <Route path="/dashboard" element={<DashboardPage />} />

              {/* PAGE 13: PROFILE & SETTINGS */}
              <Route path="/profile" element={<ProfileSettingsPage />} />

              {/* PAGE 14: AI CAPABILITIES HUB */}
              <Route path="/ai-hub" element={<AICapabilitiesPage />} />

              {/* 404 CATCH-ALL */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </ToastProvider>
    </BrowserRouter>
  );
}

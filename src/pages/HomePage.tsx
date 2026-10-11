import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Compass,
  ArrowRight,
  Search,
  Sparkles,
  Award,
  Map,
  FileText,
  CheckCircle2,
  TrendingUp,
  BookOpen,
  Target,
  ExternalLink
} from 'lucide-react';
import { StorageService, STORAGE_EVENT } from '../services/storage';
import { AIService, CareerRecommendation } from '../services/aiService';
import { Career, Skill, UserProfile } from '../types';
import { ProgressBar } from '../components/common/ProgressBar';
import { Badge } from '../components/common/Badge';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [profile, setProfile] = useState<UserProfile>(StorageService.getProfile());
  const [careers, setCareers] = useState<Career[]>(StorageService.getCareers());
  const [savedSkills, setSavedSkills] = useState<Skill[]>(StorageService.getSavedSkills());
  const [recommendations, setRecommendations] = useState<CareerRecommendation[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(true);

  useEffect(() => {
    const handleUpdate = () => {
      setProfile(StorageService.getProfile());
      setCareers(StorageService.getCareers());
      setSavedSkills(StorageService.getSavedSkills());
    };
    window.addEventListener(STORAGE_EVENT, handleUpdate);
    return () => window.removeEventListener(STORAGE_EVENT, handleUpdate);
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function fetchRecs() {
      setLoadingRecommendations(true);
      const res = await AIService.getCareerRecommendations({
        education: profile.currentEducationLevel,
        fieldOfStudy: profile.fieldOfStudy,
        interests: profile.interests,
        goals: profile.careerGoals,
        skills: savedSkills
      });
      if (isMounted) {
        setRecommendations(res.recommendations);
        setLoadingRecommendations(false);
      }
    }
    fetchRecs();
    return () => {
      isMounted = false;
    };
  }, [profile, savedSkills]);

  const searchResults = searchQuery.trim()
    ? careers.filter(
        c =>
          c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.requiredSkills.some(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/careers?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-8 pb-12 sm:pt-14 sm:pb-20">
        {/* Subtle decorative background gradient circles */}
        <div
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-r from-[#D2B9E0]/40 via-[#580F69]/10 to-[#A375A1]/20 rounded-full blur-3xl pointer-events-none -z-10"
          aria-hidden="true"
        />

        <div className="max-w-4xl mx-auto text-center px-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#580F69]/10 border border-[#580F69]/20 text-[#580F69] text-xs sm:text-sm font-semibold mb-6">
            <Sparkles className="w-4 h-4 text-[#580F69]" aria-hidden="true" />
            <span>AI-Powered Career Intelligence for Students & Job Seekers</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#370D48] leading-[1.12]">
            NAVIGATE YOUR CAREER. <br className="hidden sm:inline" />
            <span className="text-[#580F69]">SHAPE YOUR FUTURE.</span>
          </h1>

          <p className="mt-6 text-base sm:text-lg lg:text-xl text-[#240D2F]/80 max-w-2xl mx-auto leading-relaxed">
            Discover in-demand tech roles, assess real-world skill gaps against industry requirements, generate structured learning roadmaps, and engineer ATS-friendly resumes that get noticed.
          </p>

          {/* Primary Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/careers"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#580F69] text-white font-bold text-base hover:bg-[#370D48] transition-all duration-150 shadow-md focus:outline-none focus:ring-2 focus:ring-[#580F69] focus:ring-offset-2 min-h-[44px]"
            >
              <span>Explore 10+ Careers</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
            <Link
              to="/onboarding"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white border-2 border-[#D2B9E0] text-[#370D48] font-bold text-base hover:bg-[#D2B9E0]/20 hover:border-[#580F69] transition-all duration-150 shadow-xs focus:outline-none focus:ring-2 focus:ring-[#580F69] min-h-[44px]"
            >
              <span>Get Started (Onboarding)</span>
            </Link>
          </div>

          {/* Working Career Search Input with Instant Suggestions */}
          <div className="mt-10 max-w-2xl mx-auto relative">
            <form onSubmit={handleSearchSubmit} className="relative">
              <label htmlFor="home-career-search" className="sr-only">
                Search career titles, technical skills or tools
              </label>
              <div className="relative">
                <Search className="w-5 h-5 text-[#580F69] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
                <input
                  id="home-career-search"
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search roles e.g., 'Software Developer', 'Data Scientist', 'React', 'Cloud'..."
                  className="w-full pl-12 pr-28 py-3.5 rounded-2xl bg-white border-2 border-[#D2B9E0] text-[#240D2F] placeholder-[#240D2F]/50 text-sm sm:text-base focus:border-[#580F69] focus:outline-none shadow-sm transition-all"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-[#580F69] hover:bg-[#370D48] text-white text-xs sm:text-sm font-semibold rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-[#580F69]"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Instant Search Suggestions Box */}
            {searchQuery.trim() && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-[#D2B9E0] p-2 z-30 text-left max-h-72 overflow-y-auto">
                <div className="px-3 py-1.5 text-xs font-semibold text-[#580F69] uppercase tracking-wider">
                  Matching Careers ({searchResults.length})
                </div>
                {searchResults.length === 0 ? (
                  <div className="p-3 text-sm text-[#240D2F]/70">
                    No careers matched "{searchQuery}". Try searching for Python, Cloud, or Design.
                  </div>
                ) : (
                  <div className="space-y-1">
                    {searchResults.map(c => (
                      <Link
                        key={c.id}
                        to={`/careers/${c.id}`}
                        className="flex items-center justify-between p-2.5 rounded-lg hover:bg-[#F7F5F8] text-[#370D48] transition-colors"
                      >
                        <div>
                          <div className="font-semibold text-sm">{c.title}</div>
                          <div className="text-xs text-[#240D2F]/70">{c.category} • {c.medianSalaryRange}</div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-[#A375A1]" aria-hidden="true" />
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. FOUR PILLARS FEATURE CARDS */}
      <section aria-labelledby="features-heading" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 id="features-heading" className="text-2xl sm:text-3xl font-extrabold text-[#370D48] tracking-tight">
            Four Core Pillars for Your Professional Journey
          </h2>
          <p className="text-sm sm:text-base text-[#240D2F]/75 mt-2">
            Every step is connected: discover where you fit, analyze gaps, learn step-by-step, and prove your readiness on your resume.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Career Discovery */}
          <div className="bg-white rounded-2xl p-6 border border-[#D2B9E0] shadow-xs hover:border-[#580F69] hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#580F69]/10 border border-[#580F69]/20 flex items-center justify-center text-[#580F69] mb-4">
                <Compass className="w-6 h-6" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-bold text-[#370D48]">1. Career Discovery</h3>
              <p className="text-xs sm:text-sm text-[#240D2F]/80 mt-2 leading-relaxed">
                Explore deep profiles for Software Engineering, AI/ML, Cloud, Data, and Design with transparent salaries and responsibilities.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#F7F5F8]">
              <Link
                to="/careers"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#580F69] hover:text-[#370D48] hover:underline"
              >
                <span>Browse Directory</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>

          {/* Card 2: Skills Assessment */}
          <div className="bg-white rounded-2xl p-6 border border-[#D2B9E0] shadow-xs hover:border-[#580F69] hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#370D48]/10 border border-[#370D48]/20 flex items-center justify-center text-[#370D48] mb-4">
                <Award className="w-6 h-6" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-bold text-[#370D48]">2. Skills Assessment</h3>
              <p className="text-xs sm:text-sm text-[#240D2F]/80 mt-2 leading-relaxed">
                Inventory your current technical toolkit across Beginner, Intermediate, and Advanced tiers, and identify missing prerequisites.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#F7F5F8]">
              <Link
                to="/skills"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#580F69] hover:text-[#370D48] hover:underline"
              >
                <span>Assess Your Skills</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>

          {/* Card 3: Learning Roadmaps */}
          <div className="bg-white rounded-2xl p-6 border border-[#D2B9E0] shadow-xs hover:border-[#580F69] hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#580F69]/10 border border-[#580F69]/20 flex items-center justify-center text-[#580F69] mb-4">
                <Map className="w-6 h-6" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-bold text-[#370D48]">3. Learning Roadmaps</h3>
              <p className="text-xs sm:text-sm text-[#240D2F]/80 mt-2 leading-relaxed">
                Generate phased curricula breaking major roles down into digestible milestones, practical tasks, and realistic portfolio projects.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#F7F5F8]">
              <Link
                to="/roadmap"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#580F69] hover:text-[#370D48] hover:underline"
              >
                <span>View Roadmaps</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>

          {/* Card 4: Resume Intelligence */}
          <div className="bg-white rounded-2xl p-6 border border-[#D2B9E0] shadow-xs hover:border-[#580F69] hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#A375A1]/20 border border-[#A375A1]/40 flex items-center justify-center text-[#580F69] mb-4">
                <FileText className="w-6 h-6" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-bold text-[#370D48]">4. Resume Intelligence</h3>
              <p className="text-xs sm:text-sm text-[#240D2F]/80 mt-2 leading-relaxed">
                Build ATS-compliant resumes with real-time preview, run ATS content scans, and leverage Gemini AI to enhance achievement bullet points.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#F7F5F8]">
              <Link
                to="/resume"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#580F69] hover:text-[#370D48] hover:underline"
              >
                <span>Resume Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. RECOMMENDED CAREERS BASED ON SAVED DATA */}
      <section aria-labelledby="recommendations-heading" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <h2 id="recommendations-heading" className="text-2xl sm:text-3xl font-extrabold text-[#370D48] tracking-tight">
                Recommended For You
              </h2>
              <Badge variant="accent" size="sm">
                Tailored
              </Badge>
            </div>
            <p className="text-sm text-[#240D2F]/75 mt-1">
              Derived from your active profile goals, field of study ({profile.fieldOfStudy || 'CS/IT'}), and {savedSkills.length} saved skills.
            </p>
          </div>
          <Link
            to="/careers"
            className="inline-flex items-center gap-1 text-sm font-bold text-[#580F69] hover:text-[#370D48] hover:underline"
          >
            <span>View All Careers</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>

        {loadingRecommendations ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(n => (
              <div key={n} className="bg-white rounded-2xl p-6 border border-[#D2B9E0] animate-pulse space-y-4">
                <div className="h-6 bg-[#D2B9E0]/40 rounded w-2/3" />
                <div className="h-4 bg-[#D2B9E0]/30 rounded w-full" />
                <div className="h-4 bg-[#D2B9E0]/30 rounded w-4/5" />
                <div className="h-10 bg-[#D2B9E0]/20 rounded mt-6" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.slice(0, 3).map(rec => {
              const careerDetail = careers.find(c => c.id === rec.careerId);
              return (
                <div
                  key={rec.careerId}
                  className="bg-white rounded-2xl p-6 border-2 border-[#D2B9E0] hover:border-[#580F69] shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 bg-[#580F69] text-white text-[11px] font-bold px-3 py-1 rounded-bl-xl">
                    {rec.matchScore}% Match
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-[#370D48] pr-16">
                      {rec.title}
                    </h3>
                    <p className="text-xs text-[#580F69] font-semibold mt-1">
                      {careerDetail?.medianSalaryRange || '$90,000 – $140,000'} • {careerDetail?.projectedGrowth || '+18%'}
                    </p>
                    <p className="text-xs text-[#240D2F]/80 mt-3 leading-relaxed">
                      {rec.matchReason}
                    </p>

                    <div className="mt-4 pt-3 border-t border-[#F7F5F8] space-y-2">
                      <div className="text-[11px] font-semibold text-[#370D48]">Matching Skills:</div>
                      <div className="flex flex-wrap gap-1">
                        {rec.keySkillMatches.slice(0, 3).map((s, i) => (
                          <Badge key={i} variant="primary" size="sm">
                            <CheckCircle2 className="w-3 h-3 text-[#580F69]" aria-hidden="true" />
                            <span>{s}</span>
                          </Badge>
                        ))}
                      </div>

                      {rec.prioritySkillGaps.length > 0 && (
                        <>
                          <div className="text-[11px] font-semibold text-[#370D48] pt-1">Recommended Next Focus:</div>
                          <div className="flex flex-wrap gap-1">
                            {rec.prioritySkillGaps.slice(0, 2).map((s, i) => (
                              <Badge key={i} variant="warning" size="sm">
                                <span>{s}</span>
                              </Badge>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[#F7F5F8] flex items-center justify-between gap-3">
                    <Link
                      to={`/careers/${rec.careerId}`}
                      className="flex-1 text-center py-2 px-3 rounded-xl bg-[#580F69]/10 hover:bg-[#580F69]/20 text-[#580F69] font-bold text-xs transition-colors min-h-[44px] flex items-center justify-center"
                    >
                      View Details & Gap Analysis
                    </Link>
                    <Link
                      to={`/roadmap`}
                      className="py-2 px-3 rounded-xl bg-[#580F69] hover:bg-[#370D48] text-white font-bold text-xs transition-colors min-h-[44px] flex items-center justify-center"
                      title="Build roadmap for this role"
                    >
                      Roadmap
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. HOW IT WORKS WORKFLOW */}
      <section aria-labelledby="how-it-works-heading" className="bg-white rounded-3xl p-8 sm:p-12 border border-[#D2B9E0] max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 id="how-it-works-heading" className="text-2xl sm:text-3xl font-extrabold text-[#370D48] tracking-tight">
            How CareerPilot AI Guides You
          </h2>
          <p className="text-sm sm:text-base text-[#240D2F]/75 mt-2">
            A proven 4-stage pipeline taking you from uncertainty to an interview-ready technical profile.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
          {/* Step 1 */}
          <div className="space-y-3 relative">
            <div className="w-10 h-10 rounded-full bg-[#580F69] text-white font-bold flex items-center justify-center text-sm shadow-sm">
              01
            </div>
            <h3 className="font-bold text-base text-[#370D48]">Complete Onboarding</h3>
            <p className="text-xs sm:text-sm text-[#240D2F]/75 leading-relaxed">
              Tell us your current study, interests, and target roles in under 2 minutes.
            </p>
          </div>

          {/* Step 2 */}
          <div className="space-y-3 relative">
            <div className="w-10 h-10 rounded-full bg-[#580F69] text-white font-bold flex items-center justify-center text-sm shadow-sm">
              02
            </div>
            <h3 className="font-bold text-base text-[#370D48]">Evaluate Skill Gaps</h3>
            <p className="text-xs sm:text-sm text-[#240D2F]/75 leading-relaxed">
              Compare your competencies against industry requirements to discover high-priority missing skills.
            </p>
          </div>

          {/* Step 3 */}
          <div className="space-y-3 relative">
            <div className="w-10 h-10 rounded-full bg-[#580F69] text-white font-bold flex items-center justify-center text-sm shadow-sm">
              03
            </div>
            <h3 className="font-bold text-base text-[#370D48]">Follow Learning Roadmap</h3>
            <p className="text-xs sm:text-sm text-[#240D2F]/75 leading-relaxed">
              Execute structured milestones, build portfolio projects, and track completion progress.
            </p>
          </div>

          {/* Step 4 */}
          <div className="space-y-3 relative">
            <div className="w-10 h-10 rounded-full bg-[#580F69] text-white font-bold flex items-center justify-center text-sm shadow-sm">
              04
            </div>
            <h3 className="font-bold text-base text-[#370D48]">Build & Scan Resume</h3>
            <p className="text-xs sm:text-sm text-[#240D2F]/75 leading-relaxed">
              Generate an ATS single-column resume, run automated content analysis, and polish achievement bullets.
            </p>
          </div>
        </div>

        <div className="mt-10 text-center">
          <Link
            to="/onboarding"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#580F69] hover:bg-[#370D48] text-white font-bold text-sm shadow-sm transition-colors min-h-[44px]"
          >
            <span>Begin Guided Onboarding</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* 5. PREVIEW QUICK CARDS: ROADMAP & RESUME */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Active Roadmap Preview Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#D2B9E0] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#580F69]">Active Roadmap</span>
              <Badge variant="accent">In Progress</Badge>
            </div>
            <h3 className="text-xl font-bold text-[#370D48]">Software Developer Path</h3>
            <p className="text-xs sm:text-sm text-[#240D2F]/75 mt-1">
              Phased learning trajectory covering TypeScript, SQL optimization, and Full-Stack REST architectures.
            </p>

            <div className="mt-6">
              <ProgressBar value={45} label="Overall Roadmap Progress" size="md" />
            </div>

            <div className="mt-6 space-y-2.5">
              <div className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-[#F7F5F8]">
                <span className="font-semibold text-[#370D48]">Stage 1: Core Programming & Git</span>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" /> Completed
                </span>
              </div>
              <div className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-[#580F69]/10 border border-[#580F69]/20">
                <span className="font-semibold text-[#580F69]">Stage 2: Algorithmic Thinking & Databases</span>
                <span className="text-[#580F69] font-bold">In Progress (50%)</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-[#F7F5F8]">
            <Link
              to="/roadmap/roadmap-software-dev-1"
              className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#580F69] text-white font-bold text-sm hover:bg-[#370D48] transition-colors min-h-[44px]"
            >
              <span>Continue Learning Stage 2</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
        </div>

        {/* ATS Resume Intelligence Preview Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#D2B9E0] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#580F69]">Resume Intelligence</span>
              <Badge variant="success">ATS Optimized</Badge>
            </div>
            <h3 className="text-xl font-bold text-[#370D48]">ATS Single-Column Format</h3>
            <p className="text-xs sm:text-sm text-[#240D2F]/75 mt-1">
              Engineered according to modern applicant tracking system parsing standards with clean typography and zero unreadable graphics.
            </p>

            <div className="mt-6 p-4 rounded-xl bg-[#F7F5F8] border border-[#D2B9E0]/60 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#370D48]">Sample Score: Alex Morgan</span>
                <span className="font-bold text-[#580F69]">88 / 100</span>
              </div>
              <ProgressBar value={88} showPercent={false} size="sm" />
              <p className="text-[11px] text-[#240D2F]/70 pt-1">
                Keyword density: 85% • Measurable metrics: 90% • Structural integrity: 95%
              </p>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-[#F7F5F8] flex items-center gap-3">
            <Link
              to="/resume/builder"
              className="flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-[#580F69] text-white font-bold text-sm hover:bg-[#370D48] transition-colors min-h-[44px]"
            >
              <span>Open Resume Builder</span>
            </Link>
            <Link
              to="/resume/analysis"
              className="flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-[#D2B9E0] text-[#370D48] font-bold text-sm hover:bg-[#D2B9E0]/20 transition-colors min-h-[44px]"
            >
              <span>Scan Resume</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Compass,
  Award,
  Map,
  FileText,
  ArrowRight,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  Clock,
  Plus,
  AlertCircle,
  Target
} from 'lucide-react';
import { StorageService, STORAGE_EVENT } from '../services/storage';
import { AIService, CareerRecommendation } from '../services/aiService';
import {
  UserProfile,
  Skill,
  CareerRoadmap,
  ResumeProfile,
  UserActivity,
  Career
} from '../types';
import { ProgressBar } from '../components/common/ProgressBar';
import { Badge } from '../components/common/Badge';
import { Avatar } from '../components/common/Avatar';
import { SkillsProficiencyTrendChart } from '../components/dashboard/SkillsProficiencyTrendChart';

export const DashboardPage: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile>(StorageService.getProfile());
  const [skills, setSkills] = useState<Skill[]>(StorageService.getSkills());
  const [roadmaps, setRoadmaps] = useState<CareerRoadmap[]>(StorageService.getRoadmaps());
  const [resumes, setResumes] = useState<ResumeProfile[]>(StorageService.getResumes());
  const [activities, setActivities] = useState<UserActivity[]>(StorageService.getActivities());
  const [careers] = useState<Career[]>(StorageService.getCareers());

  const [recommendations, setRecommendations] = useState<CareerRecommendation[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(true);
  const [cardsEntered, setCardsEntered] = useState(false);

  useEffect(() => {
    // Subtle CSS transition entrance trigger
    const timer = setTimeout(() => {
      setCardsEntered(true);
    }, 40);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleUpdate = () => {
      setProfile(StorageService.getProfile());
      setSkills(StorageService.getSkills());
      setRoadmaps(StorageService.getRoadmaps());
      setResumes(StorageService.getResumes());
      setActivities(StorageService.getActivities());
    };
    window.addEventListener(STORAGE_EVENT, handleUpdate);
    return () => window.removeEventListener(STORAGE_EVENT, handleUpdate);
  }, []);

  const savedSkills = skills.filter(s => s.isSaved);
  const targetCareer = careers.find(c => c.id === profile.primaryTargetCareerId) || careers[0];
  const activeRoadmap = roadmaps[0];
  const activeResume = resumes[0];

  useEffect(() => {
    let active = true;
    async function loadRecs() {
      setLoadingRecs(true);
      const res = await AIService.getCareerRecommendations({
        education: profile.currentEducationLevel,
        fieldOfStudy: profile.fieldOfStudy,
        interests: profile.interests,
        goals: profile.careerGoals,
        skills: savedSkills
      });
      if (active) {
        setRecommendations(res.recommendations);
        setLoadingRecs(false);
      }
    }
    loadRecs();
    return () => {
      active = false;
    };
  }, [profile, skills]);

  // Overall Roadmap metrics
  let totalMilestones = 0;
  let completedMilestones = 0;
  if (activeRoadmap) {
    activeRoadmap.stages.forEach(stg => {
      stg.milestones.forEach(m => {
        totalMilestones++;
        if (m.completed) completedMilestones++;
      });
    });
  }
  const roadmapPercent = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Sample Data Disclaimer Notification if Demo Profile */}
      {profile.isDemoUser && (
        <div className="p-4 rounded-2xl bg-[#D2B9E0]/30 border border-[#D2B9E0] flex items-center justify-between flex-wrap gap-3 text-xs text-[#370D48]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#580F69] animate-pulse" />
            <span>
              <strong>Sample Demo Student Profile (Alex Morgan) Active:</strong> Displaying realistic data for immediate exploration. You can clear this anytime in Profile & Settings.
            </span>
          </div>
          <Link
            to="/profile"
            className="font-bold text-[#580F69] hover:underline shrink-0"
          >
            Manage Data in Settings →
          </Link>
        </div>
      )}

      {/* Welcome Banner & Career Goal Card */}
      <div
        className={`bg-white rounded-3xl p-6 sm:p-10 border border-[#D2B9E0] shadow-xs cockpit-card-entrance hover:shadow-md hover:border-[#580F69]/40 ${
          cardsEntered ? 'cockpit-card-visible' : 'cockpit-card-hidden'
        }`}
        style={{ transitionDelay: '50ms' }}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <Link
              to="/profile"
              className="shrink-0 rounded-full focus:outline-none focus:ring-2 focus:ring-[#580F69]"
              title="Update photo in settings"
              aria-label="Candidate avatar - click to edit in profile"
            >
              <Avatar
                src={profile.avatarUrl}
                name={profile.fullName}
                size="lg"
                alt={`${profile.fullName || 'Candidate'} avatar`}
              />
            </Link>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#580F69]/10 text-[#580F69] text-xs font-bold mb-1">
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Candidate Cockpit</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#370D48] tracking-tight">
                Welcome back, {profile.fullName || 'Future Tech Leader'}
              </h1>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-50 border border-purple-200 text-xs font-bold text-[#370D48]">
                  <Target className="w-3.5 h-3.5 text-[#580F69]" />
                  <span>Career Goal:</span>
                  <span className="text-[#580F69]">{targetCareer?.title || 'Software Engineering'}</span>
                </div>
                <span className="text-xs text-[#240D2F]/80">
                  ({profile.preferredExperienceLevel}) • {profile.careerGoals[0] || 'Advancing technical mastery'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Link
              to="/roadmap"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#580F69] hover:bg-[#370D48] text-white text-xs sm:text-sm font-bold shadow-md transition-all min-h-[44px]"
            >
              <Map className="w-4 h-4 text-[#D2B9E0]" />
              <span>Resume Learning</span>
            </Link>
            <Link
              to="/resume/builder"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#D2B9E0] text-[#370D48] text-xs sm:text-sm font-bold hover:bg-[#D2B9E0]/20 transition-all min-h-[44px]"
            >
              <FileText className="w-4 h-4 text-[#580F69]" />
              <span>Update Resume</span>
            </Link>
          </div>
        </div>

        {/* High-level status cards */}
        <div className="mt-8 pt-6 border-t border-[#F7F5F8] grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            className={`p-4 rounded-2xl bg-[#F7F5F8] border border-[#D2B9E0]/60 cockpit-card-entrance hover:border-[#580F69]/40 hover:bg-[#F7F5F8]/90 ${
              cardsEntered ? 'cockpit-card-visible' : 'cockpit-card-hidden'
            }`}
            style={{ transitionDelay: '100ms' }}
          >
            <div className="text-xs text-[#240D2F]/70">Validated Skills</div>
            <div className="text-2xl font-extrabold text-[#370D48] mt-1">{savedSkills.length}</div>
            <Link to="/skills" className="text-[11px] font-bold text-[#580F69] hover:underline mt-1 block">
              Manage Skills →
            </Link>
          </div>

          <div
            className={`p-4 rounded-2xl bg-[#F7F5F8] border border-[#D2B9E0]/60 cockpit-card-entrance hover:border-[#580F69]/40 hover:bg-[#F7F5F8]/90 ${
              cardsEntered ? 'cockpit-card-visible' : 'cockpit-card-hidden'
            }`}
            style={{ transitionDelay: '140ms' }}
          >
            <div className="text-xs text-[#240D2F]/70">Active Roadmap</div>
            <div className="text-2xl font-extrabold text-[#370D48] mt-1">{roadmapPercent}%</div>
            <div className="text-[11px] text-[#240D2F]/70 mt-1">
              {completedMilestones}/{totalMilestones} Milestones
            </div>
          </div>

          <div
            className={`p-4 rounded-2xl bg-[#F7F5F8] border border-[#D2B9E0]/60 cockpit-card-entrance hover:border-[#580F69]/40 hover:bg-[#F7F5F8]/90 ${
              cardsEntered ? 'cockpit-card-visible' : 'cockpit-card-hidden'
            }`}
            style={{ transitionDelay: '180ms' }}
          >
            <div className="text-xs text-[#240D2F]/70">Resumes Saved</div>
            <div className="text-2xl font-extrabold text-[#370D48] mt-1">{resumes.length}</div>
            <Link to="/resume" className="text-[11px] font-bold text-[#580F69] hover:underline mt-1 block">
              Resume Hub →
            </Link>
          </div>

          <div
            className={`p-4 rounded-2xl bg-[#F7F5F8] border border-[#D2B9E0]/60 cockpit-card-entrance hover:border-[#580F69]/40 hover:bg-[#F7F5F8]/90 ${
              cardsEntered ? 'cockpit-card-visible' : 'cockpit-card-hidden'
            }`}
            style={{ transitionDelay: '220ms' }}
          >
            <div className="text-xs text-[#240D2F]/70">Career Goal Match</div>
            <div className="text-2xl font-extrabold text-emerald-800 mt-1">
              {recommendations[0]?.matchScore || 85}%
            </div>
            <span className="text-[11px] text-emerald-800 font-semibold mt-1 block">
              Strong Alignment
            </span>
          </div>
        </div>
      </div>

      {/* Skills Proficiency Trend Section (Recharts) */}
      <div
        className={`cockpit-card-entrance ${
          cardsEntered ? 'cockpit-card-visible' : 'cockpit-card-hidden'
        }`}
        style={{ transitionDelay: '120ms' }}
      >
        <SkillsProficiencyTrendChart
          skills={skills}
          onSkillPracticed={() => setSkills(StorageService.getSkills())}
        />
      </div>

      {/* Main Grid: Learning Path & ATS Resume Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Active Roadmap Progress Card */}
        <div
          className={`bg-white rounded-3xl p-6 sm:p-8 border border-[#D2B9E0] flex flex-col justify-between space-y-6 cockpit-card-entrance hover:shadow-md hover:border-[#580F69]/40 ${
            cardsEntered ? 'cockpit-card-visible' : 'cockpit-card-hidden'
          }`}
          style={{ transitionDelay: '180ms' }}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#580F69] uppercase tracking-wider flex items-center gap-1.5">
                <Map className="w-4 h-4" />
                <span>Active Learning Roadmap</span>
              </span>
              <Badge variant="accent">In Progress</Badge>
            </div>

            {activeRoadmap ? (
              <>
                <div>
                  <h3 className="text-xl font-bold text-[#370D48]">
                    {activeRoadmap.targetCareerTitle} Pathway
                  </h3>
                  <p className="text-xs text-[#240D2F]/75 mt-1">
                    Structured 3-phase curriculum starting from {activeRoadmap.startingLevel} level.
                  </p>
                </div>

                <ProgressBar
                  value={roadmapPercent}
                  label={`Milestone Mastery: ${completedMilestones} of ${totalMilestones}`}
                  size="md"
                />

                <div className="space-y-2 pt-2">
                  <div className="text-xs font-bold text-[#370D48]">Current Stages:</div>
                  {activeRoadmap.stages.map((stg, i) => {
                    const doneCount = stg.milestones.filter(m => m.completed).length;
                    return (
                      <div
                        key={stg.id}
                        className="p-3 rounded-xl bg-[#F7F5F8] border border-[#D2B9E0]/50 flex items-center justify-between text-xs"
                      >
                        <span className="font-semibold text-[#370D48] truncate max-w-[220px]">
                          {stg.title}
                        </span>
                        <span className="font-bold text-[#580F69] shrink-0">
                          {doneCount}/{stg.milestones.length} Done
                        </span>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <p className="text-xs text-[#240D2F]/70">No active roadmap currently configured.</p>
            )}
          </div>

          <div className="pt-4 border-t border-[#F7F5F8]">
            {activeRoadmap ? (
              <Link
                to={`/roadmap/${activeRoadmap.id}`}
                className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-[#580F69] hover:bg-[#370D48] text-white font-bold text-xs sm:text-sm transition-all min-h-[44px]"
              >
                <span>Continue Learning</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <Link
                to="/roadmap"
                className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-[#580F69] text-white font-bold text-xs min-h-[44px]"
              >
                <span>Generate Roadmap</span>
              </Link>
            )}
          </div>
        </div>

        {/* ATS Resume Status Card */}
        <div
          className={`bg-white rounded-3xl p-6 sm:p-8 border border-[#D2B9E0] flex flex-col justify-between space-y-6 cockpit-card-entrance hover:shadow-md hover:border-[#580F69]/40 ${
            cardsEntered ? 'cockpit-card-visible' : 'cockpit-card-hidden'
          }`}
          style={{ transitionDelay: '260ms' }}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#580F69] uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4" />
                <span>Primary ATS Resume</span>
              </span>
              <Badge variant="success">Single Column Format</Badge>
            </div>

            {activeResume ? (
              <>
                <div>
                  <h3 className="text-xl font-bold text-[#370D48]">{activeResume.title}</h3>
                  <p className="text-xs text-[#240D2F]/75 mt-1">
                    Target Role: {activeResume.targetRole} • Updated {activeResume.updatedAt}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#F7F5F8] border border-[#D2B9E0] space-y-2">
                  <div className="text-xs font-bold text-[#370D48]">Resume Snapshot</div>
                  <div className="text-xs text-[#240D2F]/80">
                    • {activeResume.experience.length} Experience Entries • {activeResume.projects.length} Technical Projects
                  </div>
                  <div className="text-xs text-[#240D2F]/80">
                    • {activeResume.education.length} Degrees • {activeResume.skills.flatMap(s => s.items).length} Tracked Keywords
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 text-xs text-[#580F69] font-medium leading-relaxed">
                  Tip: Keep your accomplishment bullets formatted with action verbs and quantifiable metrics (% or numbers).
                </div>
              </>
            ) : (
              <p className="text-xs text-[#240D2F]/70">No saved resumes found.</p>
            )}
          </div>

          <div className="pt-4 border-t border-[#F7F5F8] flex items-center gap-3">
            <Link
              to={activeResume ? `/resume/builder?id=${activeResume.id}` : '/resume/builder'}
              className="flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-[#580F69] hover:bg-[#370D48] text-white font-bold text-xs sm:text-sm transition-all min-h-[44px]"
            >
              <span>Edit Resume</span>
            </Link>
            <Link
              to="/resume/analysis"
              className="flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-xl border border-[#580F69] text-[#580F69] hover:bg-[#580F69]/10 font-bold text-xs sm:text-sm transition-all min-h-[44px]"
            >
              <span>Scan ATS Score</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Recommended Careers & Recent Activity Row */}
      <div
        className={`grid grid-cols-1 lg:grid-cols-12 gap-8 cockpit-card-entrance ${
          cardsEntered ? 'cockpit-card-visible' : 'cockpit-card-hidden'
        }`}
        style={{ transitionDelay: '340ms' }}
      >
        {/* Recommended Careers (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-[#D2B9E0] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-[#370D48]">Career Recommendations</h3>
            <Link to="/careers" className="text-xs font-bold text-[#580F69] hover:underline">
              View All Directory →
            </Link>
          </div>

          <div className="space-y-3">
            {loadingRecs ? (
              <div className="p-4 bg-[#F7F5F8] rounded-xl animate-pulse h-24" />
            ) : (
              recommendations.slice(0, 3).map(rec => (
                <div
                  key={rec.careerId}
                  className="p-4 rounded-2xl bg-[#F7F5F8] border border-[#D2B9E0] hover:border-[#580F69] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-[#370D48]">{rec.title}</h4>
                      <Badge variant="primary" size="sm">
                        {rec.matchScore}% Match
                      </Badge>
                    </div>
                    <p className="text-xs text-[#240D2F]/75 mt-1">{rec.matchReason}</p>
                  </div>
                  <Link
                    to={`/careers/${rec.careerId}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#580F69] hover:underline shrink-0"
                  >
                    <span>Details & Gaps</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Real User Activities (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-[#D2B9E0] space-y-4">
          <h3 className="text-xl font-bold text-[#370D48] flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#580F69]" />
            <span>Recent Activity Log</span>
          </h3>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {activities.length === 0 ? (
              <p className="text-xs text-[#240D2F]/70 italic">No recent activity recorded yet.</p>
            ) : (
              activities.slice(0, 6).map(act => (
                <div
                  key={act.id}
                  className="p-3.5 rounded-2xl bg-[#F7F5F8] border border-[#D2B9E0]/50 space-y-1"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-[#370D48]">
                    <span>{act.title}</span>
                    <span className="text-[10px] text-[#240D2F]/60 font-normal">
                      {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#240D2F]/75">{act.description}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

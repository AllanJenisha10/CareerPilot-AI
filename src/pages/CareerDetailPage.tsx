import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Compass,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  DollarSign,
  GraduationCap,
  Wrench,
  Sparkles,
  Map,
  Layers,
  ChevronLeft
} from 'lucide-react';
import { StorageService, STORAGE_EVENT } from '../services/storage';
import { AIService, SkillGapAnalysis } from '../services/aiService';
import { Career, Skill } from '../types';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { Badge } from '../components/common/Badge';
import { ProgressBar } from '../components/common/ProgressBar';
import { useToast } from '../context/ToastContext';

export const CareerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success } = useToast();

  const [career, setCareer] = useState<Career | undefined>(id ? StorageService.getCareerById(id) : undefined);
  const [savedSkills, setSavedSkills] = useState<Skill[]>(StorageService.getSavedSkills());
  const [gapAnalysis, setGapAnalysis] = useState<SkillGapAnalysis | null>(null);
  const [loadingGap, setLoadingGap] = useState(true);
  const [generatingRoadmap, setGeneratingRoadmap] = useState(false);

  useEffect(() => {
    if (id) {
      setCareer(StorageService.getCareerById(id));
    }
  }, [id]);

  useEffect(() => {
    const handleUpdate = () => {
      if (id) {
        setCareer(StorageService.getCareerById(id));
      }
      setSavedSkills(StorageService.getSavedSkills());
    };
    window.addEventListener(STORAGE_EVENT, handleUpdate);
    return () => window.removeEventListener(STORAGE_EVENT, handleUpdate);
  }, [id]);

  // Run Gap Analysis
  useEffect(() => {
    let active = true;
    if (career) {
      setLoadingGap(true);
      AIService.analyzeSkillGaps(career, savedSkills).then(res => {
        if (active) {
          setGapAnalysis(res);
          setLoadingGap(false);
        }
      });
    }
    return () => {
      active = false;
    };
  }, [career, savedSkills]);

  // Unknown career ID not-found state
  if (!career) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-100 text-red-700 mx-auto flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-bold text-[#370D48]">Career Not Found</h1>
        <p className="text-sm text-[#240D2F]/75 mt-2">
          The career identifier "{id}" does not exist in our catalog.
        </p>
        <div className="mt-6">
          <Link
            to="/careers"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#580F69] text-white font-semibold text-sm hover:bg-[#370D48]"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Return to Careers Directory</span>
          </Link>
        </div>
      </div>
    );
  }

  // Handle "Build My Roadmap" action
  const handleBuildRoadmap = async () => {
    setGeneratingRoadmap(true);
    const { roadmap, isAiGenerated } = await AIService.generateRoadmap(career, 'Beginner');
    StorageService.saveRoadmap(roadmap);
    success(
      'Roadmap Created',
      `Personalized curriculum generated for ${career.title} (${isAiGenerated ? 'Gemini AI' : 'Deterministic Curriculum'}).`
    );
    setGeneratingRoadmap(false);
    navigate(`/roadmap/${roadmap.id}`);
  };

  const relatedCareers = StorageService.getCareers().filter(c =>
    career.relatedCareerIds.includes(c.id)
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Breadcrumb Trail */}
      <Breadcrumbs
        items={[
          { label: 'Careers Directory', href: '/careers' },
          { label: career.title }
        ]}
      />

      {/* Main Career Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border-2 border-[#D2B9E0] shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-8 border-b border-[#F7F5F8]">
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="primary">{career.category}</Badge>
              <Badge variant="neutral">{career.experienceLevel}</Badge>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#370D48] tracking-tight">
              {career.title}
            </h1>
            <p className="text-sm sm:text-base text-[#240D2F]/80 max-w-2xl leading-relaxed">
              {career.fullDescription}
            </p>
          </div>

          {/* Quick Metrics & Call to Action */}
          <div className="bg-[#F7F5F8] p-5 rounded-2xl border border-[#D2B9E0] shrink-0 w-full lg:w-80 space-y-4">
            <div>
              <div className="text-xs text-[#240D2F]/70">Median Compensation Range</div>
              <div className="text-xl font-extrabold text-[#370D48] flex items-center gap-1.5 mt-0.5">
                <DollarSign className="w-5 h-5 text-[#580F69]" aria-hidden="true" />
                <span>{career.medianSalaryRange}</span>
              </div>
            </div>
            <div>
              <div className="text-xs text-[#240D2F]/70">Projected Job Growth</div>
              <div className="text-base font-bold text-emerald-800 flex items-center gap-1.5 mt-0.5">
                <TrendingUp className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                <span>{career.projectedGrowth}</span>
              </div>
            </div>

            <button
              onClick={handleBuildRoadmap}
              disabled={generatingRoadmap}
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#580F69] hover:bg-[#370D48] text-white font-bold text-sm shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-[#580F69] min-h-[44px] disabled:opacity-50"
            >
              <Map className="w-4 h-4 text-[#D2B9E0]" aria-hidden="true" />
              <span>{generatingRoadmap ? 'Generating Roadmap...' : 'Build My Roadmap'}</span>
            </button>
          </div>
        </div>

        {/* Skill Gap Analysis Box */}
        <div className="mt-8 pt-2">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div>
              <h2 className="text-xl font-bold text-[#370D48] flex items-center gap-2">
                <span>Personal Skill Gap Analysis</span>
                {gapAnalysis?.isAiGenerated ? (
                  <Badge variant="accent" size="sm">Gemini AI</Badge>
                ) : (
                  <Badge variant="neutral" size="sm">Rule-Based Heuristic</Badge>
                )}
              </h2>
              <p className="text-xs text-[#240D2F]/75 mt-0.5">
                Comparing required skills against your {savedSkills.length} saved competencies.
              </p>
            </div>

            {gapAnalysis && (
              <div className="text-right">
                <span className="text-xs text-[#240D2F]/70">Estimated Readiness: </span>
                <span className="text-sm font-bold text-[#580F69]">{gapAnalysis.estimatedTimeToReady}</span>
              </div>
            )}
          </div>

          {loadingGap ? (
            <div className="p-6 rounded-2xl bg-[#F7F5F8] border border-[#D2B9E0] animate-pulse space-y-3">
              <div className="h-4 bg-[#D2B9E0]/40 rounded w-1/3" />
              <div className="h-2 bg-[#D2B9E0]/30 rounded w-full" />
            </div>
          ) : gapAnalysis ? (
            <div className="p-6 rounded-2xl bg-[#F7F5F8] border border-[#D2B9E0] space-y-6">
              <div>
                <ProgressBar
                  value={gapAnalysis.readinessScore}
                  label={`Role Readiness Index (${gapAnalysis.readinessScore}/100)`}
                  size="md"
                />
                <p className="text-xs sm:text-sm text-[#240D2F]/80 mt-2 leading-relaxed">
                  {gapAnalysis.summary}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {/* Strengths */}
                <div className="bg-white p-4 rounded-xl border border-emerald-200">
                  <h3 className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" aria-hidden="true" />
                    <span>Your Current Strengths ({gapAnalysis.strengths.length})</span>
                  </h3>
                  {gapAnalysis.strengths.length === 0 ? (
                    <p className="text-xs text-[#240D2F]/70">No direct skills matched yet.</p>
                  ) : (
                    <ul className="space-y-1 text-xs text-[#240D2F]/85">
                      {gapAnalysis.strengths.map((str, idx) => (
                        <li key={idx} className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                          <span>{str}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Critical Gaps */}
                <div className="bg-white p-4 rounded-xl border border-amber-200">
                  <h3 className="text-xs font-bold text-amber-950 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                    <AlertCircle className="w-4 h-4 text-amber-600" aria-hidden="true" />
                    <span>Critical Skill Gaps ({gapAnalysis.criticalGaps.length})</span>
                  </h3>
                  {gapAnalysis.criticalGaps.length === 0 ? (
                    <p className="text-xs text-emerald-700 font-semibold">
                      You meet all priority skill requirements for this role!
                    </p>
                  ) : (
                    <ul className="space-y-2 text-xs text-[#240D2F]/85">
                      {gapAnalysis.criticalGaps.slice(0, 3).map((gap, idx) => (
                        <li key={idx} className="border-b border-[#F7F5F8] pb-1.5 last:border-0 last:pb-0">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[#370D48]">{gap.skillName}</span>
                            <span className="text-[10px] text-amber-800 font-semibold bg-amber-50 px-1.5 py-0.5 rounded">
                              ~{gap.estimatedHours} hrs
                            </span>
                          </div>
                          <p className="text-[11px] text-[#240D2F]/70 mt-0.5">{gap.recommendation}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Grid of Responsibilities, Skills, Tools, Education */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Typical Responsibilities */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#D2B9E0]">
          <h2 className="text-xl font-bold text-[#370D48] mb-4 flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#580F69]" aria-hidden="true" />
            <span>Typical Responsibilities</span>
          </h2>
          <ul className="space-y-3">
            {career.typicalResponsibilities.map((resp, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#240D2F]/85 leading-relaxed">
                <CheckCircle2 className="w-4 h-4 text-[#580F69] shrink-0 mt-0.5" aria-hidden="true" />
                <span>{resp}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Required Skills & Importance */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#D2B9E0]">
          <h2 className="text-xl font-bold text-[#370D48] mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#580F69]" aria-hidden="true" />
            <span>Required Skills & Importance</span>
          </h2>
          <div className="space-y-3">
            {career.requiredSkills.map((req, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-xl bg-[#F7F5F8] border border-[#D2B9E0]/50"
              >
                <div>
                  <div className="font-bold text-sm text-[#370D48]">{req.name}</div>
                  <div className="text-[11px] text-[#240D2F]/70">Target Level: {req.level}</div>
                </div>
                <Badge
                  variant={
                    req.importance === 'Must-Have'
                      ? 'secondary'
                      : req.importance === 'Important'
                      ? 'primary'
                      : 'neutral'
                  }
                  size="sm"
                >
                  {req.importance}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Tools and Technologies */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#D2B9E0]">
          <h2 className="text-xl font-bold text-[#370D48] mb-4 flex items-center gap-2">
            <Wrench className="w-5 h-5 text-[#580F69]" aria-hidden="true" />
            <span>Modern Tools & Technologies</span>
          </h2>
          <div className="flex flex-wrap gap-2">
            {career.toolsAndTechnologies.map((tool, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 rounded-xl bg-[#580F69]/10 text-[#580F69] border border-[#580F69]/20 font-semibold text-xs"
              >
                {tool}
              </span>
            ))}
          </div>
        </div>

        {/* Education & Entry Routes */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#D2B9E0]">
          <h2 className="text-xl font-bold text-[#370D48] mb-4 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-[#580F69]" aria-hidden="true" />
            <span>Education & Entry Routes</span>
          </h2>
          <div className="space-y-4">
            <div>
              <div className="text-xs font-bold text-[#370D48] uppercase tracking-wider mb-1.5">
                Typical Education
              </div>
              <ul className="space-y-1.5 text-xs text-[#240D2F]/80">
                {career.educationRequirements.map((edu, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#580F69] mt-1.5 shrink-0" />
                    <span>{edu}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="text-xs font-bold text-[#370D48] uppercase tracking-wider mb-1.5">
                Possible Entry Routes
              </div>
              <ul className="space-y-1.5 text-xs text-[#240D2F]/80">
                {career.possibleEntryRoutes.map((route, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#A375A1] mt-1.5 shrink-0" />
                    <span>{route}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Related Careers */}
      {relatedCareers.length > 0 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#D2B9E0]">
          <h2 className="text-xl font-bold text-[#370D48] mb-4">
            Related Career Pathways
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {relatedCareers.map(rel => (
              <Link
                key={rel.id}
                to={`/careers/${rel.id}`}
                className="p-4 rounded-2xl bg-[#F7F5F8] border border-[#D2B9E0] hover:border-[#580F69] hover:bg-white transition-all block group"
              >
                <div className="font-bold text-sm text-[#370D48] group-hover:text-[#580F69] flex items-center justify-between">
                  <span>{rel.title}</span>
                  <ArrowRight className="w-4 h-4 text-[#A375A1] group-hover:text-[#580F69] transition-transform group-hover:translate-x-1" />
                </div>
                <div className="text-xs text-[#240D2F]/70 mt-1">{rel.medianSalaryRange}</div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

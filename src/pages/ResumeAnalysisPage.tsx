import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Sparkles,
  Search,
  Upload,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  FileText,
  RotateCcw,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  Award
} from 'lucide-react';
import { StorageService, STORAGE_EVENT } from '../services/storage';
import { AIService } from '../services/aiService';
import { ResumeAnalysisResult, Career } from '../types';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { ProgressBar } from '../components/common/ProgressBar';
import { Badge } from '../components/common/Badge';
import { useToast } from '../context/ToastContext';

export const ResumeAnalysisPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const urlId = searchParams.get('id');
  const urlResumeId = searchParams.get('resumeId');
  const { success, error } = useToast();

  const [careers] = useState<Career[]>(StorageService.getCareers());
  const [targetRole, setTargetRole] = useState('Software Developer');

  // Input text
  const [resumeText, setResumeText] = useState(() => {
    if (urlResumeId) {
      const res = StorageService.getResumeById(urlResumeId);
      if (res) {
        return [
          res.personalInfo.fullName,
          res.targetRole,
          res.professionalSummary,
          res.skills.map(s => `${s.category}: ${s.items.join(', ')}`).join('\n'),
          res.experience.map(e => `${e.position} at ${e.company}\n${e.bullets.join('\n')}`).join('\n'),
          res.education.map(ed => `${ed.degree} - ${ed.institution}`).join('\n'),
          res.projects.map(p => `${p.title}: ${p.bullets.join('\n')}`).join('\n')
        ].filter(Boolean).join('\n\n');
      }
    }
    return '';
  });

  const [analysisResult, setAnalysisResult] = useState<ResumeAnalysisResult | null>(() => {
    if (urlId) {
      const found = StorageService.getAnalysisById(urlId);
      if (found) return found;
    }
    const recents = StorageService.getAnalyses();
    return recents.length > 0 ? recents[0] : null;
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState('');

  // Sample resume prefill for quick exploration
  const handleLoadSample = () => {
    const sample = `ALEX MORGAN
alex.morgan@university.edu | San Francisco, CA | linkedin.com/in/alexmorgan | github.com/alexmorgandev

PROFESSIONAL SUMMARY
Proactive Computer Science undergraduate with hands-on experience building full-stack web applications and scalable REST APIs. Skilled in TypeScript, React, Python, and SQL, with a passion for writing clean, tested code and delivering accessible user interfaces.

TECHNICAL SKILLS
- Programming Languages: TypeScript, JavaScript (ES6+), Python, SQL (PostgreSQL), HTML5, CSS3
- Frameworks & Libraries: React, Node.js, Express, Tailwind CSS, Vite, FastAPI
- Tools & DevOps: Git, GitHub Actions, Docker, Postman, VS Code, Linux CLI

WORK EXPERIENCE
Software Engineering Intern | Campus Tech Innovations Lab | Berkeley, CA
May 2023 – August 2023
- Engineered 8 reusable React and TypeScript components, reducing page load latency by 32% and achieving WCAG 2.1 AA accessibility compliance.
- Built RESTful API endpoints in Node.js/Express to query PostgreSQL database, decreasing average query response time from 420ms to 95ms.
- Configured automated GitHub Actions CI pipeline running unit tests and linting on every pull request, cutting merge regressions by 40%.

TECHNICAL PROJECTS
CareerPilot AI Guidance Platform | Lead Developer
React, TypeScript, Tailwind CSS, Express, Node.js
- Architected an end-to-end career navigation application supporting 10 career paths and 70+ technology skills.
- Developed responsive ATS resume scoring engine analyzing keyword density and formatting with sub-second response times.
- Implemented accessible UI conforming strictly to WCAG 2.2 AA standards with keyboard navigation.

EDUCATION
University of California, Berkeley | Bachelor of Science in Computer Science
August 2021 – May 2025 (Expected) | GPA: 3.82 / 4.00
Relevant Coursework: Data Structures & Algorithms, Database Systems, Computer Networks, Software Engineering Principles`;

    setResumeText(sample);
    setTargetRole('Software Developer');
  };

  const handleRunAnalysis = async () => {
    if (!resumeText.trim() || resumeText.length < 50) {
      error('Input Too Short', 'Please enter or paste at least 50 characters of resume content to analyze.');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisStep('Evaluating structural sections & keyword density...');

    setTimeout(() => {
      setAnalysisStep('Checking quantifiable impact metrics & action verbs...');
    }, 400);

    const result = await AIService.analyzeResume(resumeText, targetRole);
    StorageService.saveAnalysis(result);
    setAnalysisResult(result);
    setIsAnalyzing(false);
    setAnalysisStep('');
    success(
      'Analysis Complete',
      `Calculated score: ${result.overallScore}/100 (${result.mode === 'gemini' ? 'Gemini AI' : 'Rule-Based Engine'}).`
    );
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Resume Dashboard', href: '/resume' },
          { label: 'ATS Content & Keyword Scanner' }
        ]}
      />

      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#D2B9E0] shadow-xs">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#580F69]/10 text-[#580F69] text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Automated ATS Content Evaluator</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#370D48] tracking-tight">
            Resume Analysis & Keyword Match
          </h1>
          <p className="text-sm sm:text-base text-[#240D2F]/80 mt-2 leading-relaxed">
            Scan your resume against your target technology role. We evaluate standard section completeness, keyword alignment, measurable impact metrics, and action verbs.
          </p>
        </div>
      </div>

      {/* Input Form Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#D2B9E0] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1 sm:max-w-xs">
            <label htmlFor="analysis-target-role" className="block text-xs font-bold text-[#370D48] mb-1.5">
              Target Career Role *
            </label>
            <select
              id="analysis-target-role"
              value={targetRole}
              onChange={e => setTargetRole(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F5F8] border border-[#D2B9E0] text-sm text-[#370D48] font-semibold focus:outline-none focus:border-[#580F69] min-h-[44px]"
            >
              {careers.map(c => (
                <option key={c.id} value={c.title}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleLoadSample}
              className="text-xs font-bold text-[#580F69] hover:text-[#370D48] hover:underline px-3 py-2 rounded-lg bg-[#580F69]/10"
            >
              Load Sample Resume
            </button>
            {resumeText && (
              <button
                type="button"
                onClick={() => setResumeText('')}
                className="text-xs font-bold text-red-600 hover:underline px-3 py-2"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="resume-text-input" className="block text-xs font-bold text-[#370D48] mb-1.5">
            Paste Resume Plain Text *
          </label>
          <textarea
            id="resume-text-input"
            rows={8}
            value={resumeText}
            onChange={e => setResumeText(e.target.value)}
            placeholder="Paste your resume content here (summary, skills, experience, education, projects)..."
            className="w-full p-4 rounded-2xl bg-[#F7F5F8] border border-[#D2B9E0] text-xs sm:text-sm text-[#370D48] focus:bg-white focus:border-[#580F69] focus:outline-none font-mono"
          />
          <div className="flex justify-between items-center text-[11px] text-[#240D2F]/70 mt-1">
            <span>Character count: {resumeText.length}</span>
            <span>Personal identifiers are minimized; no private keys in bundle</span>
          </div>
        </div>

        <div className="flex items-center justify-between flex-wrap gap-4 pt-2">
          <div className="text-xs text-[#240D2F]/75">
            {isAnalyzing && <span className="font-semibold text-[#580F69]">{analysisStep}</span>}
          </div>

          <button
            type="button"
            onClick={handleRunAnalysis}
            disabled={isAnalyzing || !resumeText.trim()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#580F69] hover:bg-[#370D48] text-white font-bold text-sm shadow-md transition-all disabled:opacity-50 min-h-[44px]"
          >
            {isAnalyzing ? (
              <span>Analyzing Resume...</span>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Analyze Against {targetRole}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Analysis Results Display */}
      {analysisResult && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Score Header Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-10 border-2 border-[#580F69] shadow-md space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#F7F5F8]">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <Badge variant={analysisResult.overallScore >= 80 ? 'success' : 'warning'}>
                    Score: {analysisResult.overallScore} / 100
                  </Badge>
                  {analysisResult.mode === 'gemini' ? (
                    <Badge variant="accent">Gemini AI Engine</Badge>
                  ) : (
                    <Badge variant="neutral">Rule-Based Heuristic Engine</Badge>
                  )}
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#370D48]">
                  ATS Evaluation for {analysisResult.targetRole}
                </h2>
                <p className="text-xs text-[#240D2F]/70 mt-1">
                  Analyzed at {new Date(analysisResult.timestamp).toLocaleString()}
                </p>
              </div>

              <div className="shrink-0 text-center sm:text-right">
                <div className="text-4xl sm:text-5xl font-black text-[#580F69]">
                  {analysisResult.overallScore}
                  <span className="text-lg text-[#240D2F]/50">/100</span>
                </div>
                <div className="text-xs font-semibold text-[#370D48] mt-1">
                  Overall ATS Compatibility
                </div>
              </div>
            </div>

            {analysisResult.aiNotice && analysisResult.mode === 'rule-based' && (
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-purple-50 border border-[#D2B9E0] text-[#370D48] text-xs">
                <AlertCircle className="w-4 h-4 text-[#580F69] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">{analysisResult.aiNotice}</p>
                  <p className="text-[#240D2F]/80 mt-0.5">
                    Your analysis was evaluated using our standard ATS heuristic rules engine. All scoring criteria, keyword scans, and structural insights remain fully usable.
                  </p>
                </div>
              </div>
            )}

            {/* Criteria Breakdown */}
            <div>
              <h3 className="text-sm font-bold text-[#370D48] uppercase tracking-wider mb-4">
                Scoring Criteria Breakdown
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {analysisResult.scoringCriteria.map((crit, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-[#F7F5F8] border border-[#D2B9E0] space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-[#370D48]">{crit.category}</span>
                      <span className="font-extrabold text-[#580F69]">{crit.score}%</span>
                    </div>
                    <ProgressBar value={crit.score} showPercent={false} size="sm" />
                    <p className="text-[11px] text-[#240D2F]/75 leading-tight">{crit.feedback}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Strengths & Missing Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Strengths */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-300 space-y-3">
              <h3 className="text-base font-bold text-emerald-950 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Detected Strengths ({analysisResult.strengths.length})</span>
              </h3>
              <ul className="space-y-2 text-xs sm:text-sm text-[#240D2F]/85">
                {analysisResult.strengths.map((str, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2 shrink-0" />
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Missing Sections / Gaps */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-300 space-y-3">
              <h3 className="text-base font-bold text-amber-950 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <span>Missing Sections & Flaws ({analysisResult.missingSections.length})</span>
              </h3>
              {analysisResult.missingSections.length === 0 ? (
                <p className="text-xs sm:text-sm text-emerald-800 font-semibold">
                  All standard ATS core sections are present and identifiable!
                </p>
              ) : (
                <ul className="space-y-2 text-xs sm:text-sm text-[#240D2F]/85">
                  {analysisResult.missingSections.map((sec, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-amber-950">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-2 shrink-0" />
                      <span>Missing Section Header: <strong>{sec}</strong></span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Skill Matches and Missing Keywords */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#D2B9E0] space-y-4">
            <h3 className="text-base font-bold text-[#370D48] flex items-center justify-between">
              <span>Target Role Keyword Alignment</span>
              <span className="text-xs font-bold text-[#580F69]">
                Match Rate: {analysisResult.skillMatches.matchRatePercentage}%
              </span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200">
                <div className="text-xs font-bold text-emerald-950 mb-2">
                  Matched Role Keywords ({analysisResult.skillMatches.matched.length})
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {analysisResult.skillMatches.matched.map((m, i) => (
                    <Badge key={i} variant="success" size="sm">
                      {m}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200">
                <div className="text-xs font-bold text-amber-950 mb-2">
                  Recommended Missing Keywords ({analysisResult.skillMatches.missing.length})
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {analysisResult.skillMatches.missing.map((m, i) => (
                    <Badge key={i} variant="warning" size="sm">
                      {m}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Actionable Recommendations */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#D2B9E0] space-y-4">
            <h3 className="text-base font-bold text-[#370D48]">
              Actionable Recommendations ({analysisResult.recommendations.length})
            </h3>
            <div className="space-y-3">
              {analysisResult.recommendations.map((rec, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-[#F7F5F8] border border-[#D2B9E0]/60 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-[#370D48]">{rec.title}</span>
                    <Badge
                      variant={rec.priority === 'High' ? 'secondary' : 'primary'}
                      size="sm"
                    >
                      {rec.priority} Priority
                    </Badge>
                  </div>
                  <p className="text-xs text-[#240D2F]/80 leading-relaxed">{rec.action}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Example Bullet Rewrites */}
          {analysisResult.bulletRewrites && analysisResult.bulletRewrites.length > 0 && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#D2B9E0] space-y-4">
              <h3 className="text-base font-bold text-[#370D48]">
                Example Bullet Point Rewrites
              </h3>
              <div className="space-y-4">
                {analysisResult.bulletRewrites.map((rw, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-[#F7F5F8] border border-[#D2B9E0] space-y-2">
                    <div className="text-xs text-neutral-600 line-through">
                      <strong>Before: </strong> {rw.original}
                    </div>
                    <div className="text-xs font-semibold text-emerald-900 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                      <strong>After: </strong> {rw.improved}
                    </div>
                    <div className="text-[11px] text-[#580F69] font-medium">
                      Rationale: {rw.reason}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Honest Disclaimer */}
          <div className="p-4 rounded-2xl bg-[#F7F5F8] border border-[#D2B9E0] flex items-start gap-3 text-xs text-[#240D2F]/75">
            <ShieldAlert className="w-5 h-5 text-[#580F69] shrink-0 mt-0.5" />
            <div>
              <strong>Integrity Notice: </strong> {analysisResult.disclaimer}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

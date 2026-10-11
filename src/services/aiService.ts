import {
  ResumeAnalysisResult,
  Career,
  Skill,
  CareerRoadmap,
  RoadmapStage
} from '../types';
import { INITIAL_CAREERS } from '../data/initialData';

export interface CareerRecommendation {
  careerId: string;
  title: string;
  matchScore: number;
  matchReason: string;
  keySkillMatches: string[];
  prioritySkillGaps: string[];
  nextStepRecommendation: string;
}

export interface SkillGapAnalysis {
  careerId: string;
  careerTitle: string;
  readinessScore: number;
  summary: string;
  strengths: string[];
  criticalGaps: {
    skillName: string;
    importance: 'High' | 'Medium' | 'Low';
    estimatedHours: number;
    recommendation: string;
  }[];
  estimatedTimeToReady: string;
  isAiGenerated: boolean;
  mode: 'gemini' | 'rule-based';
}

// In-memory client caches & in-flight promises to eliminate duplicate submissions & repeated calls on refresh
const clientRecCache = new Map<string, { data: CareerRecommendation[]; isAiGenerated: boolean; mode: 'gemini' | 'rule-based'; timestamp: number }>();
const inFlightRecPromises = new Map<string, Promise<any>>();
const inFlightResumePromises = new Map<string, Promise<any>>();

// Client-side AI service orchestrator
export const AIService = {
  // Check backend Gemini availability
  async checkStatus(): Promise<{ hasKey: boolean; status: string; primaryModel?: string; fallbackModel?: string; quotaStatus?: string }> {
    try {
      const res = await fetch('/api/ai/status');
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Backend not reached or offline
    }
    return { hasKey: false, status: 'offline_fallback' };
  },

  // 1. RECOMMEND CAREERS
  async getCareerRecommendations(
    profile: {
      education?: string;
      fieldOfStudy?: string;
      interests: string[];
      goals: string[];
      skills: Skill[];
    }
  ): Promise<{ recommendations: CareerRecommendation[]; isAiGenerated: boolean; mode: 'gemini' | 'rule-based' }> {
    const cacheKey = `${profile.education || ''}_${profile.fieldOfStudy || ''}_${(profile.interests || []).join(',')}_${(profile.goals || []).join(',')}_${profile.skills.map(s => `${s.name}:${s.proficiency}`).sort().join(',')}`;

    // 1. Check in-memory cache to prevent repeated calls on refresh
    const cached = clientRecCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < 1800000)) {
      return { recommendations: cached.data, isAiGenerated: cached.isAiGenerated, mode: cached.mode };
    }

    // 2. Prevent duplicate concurrent submissions
    if (inFlightRecPromises.has(cacheKey)) {
      return inFlightRecPromises.get(cacheKey)!;
    }

    const runPromise = (async () => {
      try {
        const res = await fetch('/api/ai/recommend-careers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            education: profile.education,
            fieldOfStudy: profile.fieldOfStudy,
            interests: profile.interests,
            goals: profile.goals,
            skills: profile.skills.map(s => s.name)
          })
        });

        if (res.ok) {
          const payload = await res.json();
          if (payload.isAiGenerated && Array.isArray(payload.data) && payload.data.length > 0) {
            const result = { recommendations: payload.data, isAiGenerated: true, mode: 'gemini' as const };
            clientRecCache.set(cacheKey, { data: result.recommendations, isAiGenerated: true, mode: 'gemini', timestamp: Date.now() });
            return result;
          }
        }
      } catch (err) {
        console.warn('[AIService] Backend recommendations call failed, using deterministic rule engine:', err);
      }

      // High quality deterministic rule-based fallback
      const fallbackRecs = this.calculateRuleBasedRecommendations(profile);
      clientRecCache.set(cacheKey, { data: fallbackRecs, isAiGenerated: false, mode: 'rule-based', timestamp: Date.now() });
      return {
        recommendations: fallbackRecs,
        isAiGenerated: false,
        mode: 'rule-based' as const
      };
    })();

    inFlightRecPromises.set(cacheKey, runPromise);
    try {
      return await runPromise;
    } finally {
      inFlightRecPromises.delete(cacheKey);
    }
  },

  calculateRuleBasedRecommendations(profile: {
    interests: string[];
    goals: string[];
    skills: Skill[];
  }): CareerRecommendation[] {
    const savedSkillNames = new Set(profile.skills.filter(s => s.isSaved).map(s => s.name.toLowerCase()));
    const interestSet = new Set(profile.interests.map(i => i.toLowerCase()));

    return INITIAL_CAREERS.map(career => {
      let score = 50;
      const matchedSkills: string[] = [];
      const missingSkills: string[] = [];

      career.requiredSkills.forEach(req => {
        const reqLower = req.name.toLowerCase();
        let found = false;
        for (const userSkill of savedSkillNames) {
          if (reqLower.includes(userSkill) || userSkill.includes(reqLower)) {
            found = true;
            break;
          }
        }
        if (found) {
          matchedSkills.push(req.name);
          score += req.importance === 'Must-Have' ? 12 : 8;
        } else {
          missingSkills.push(req.name);
        }
      });

      // Interest alignment
      if (career.category.toLowerCase().includes('software') && interestSet.has('web applications')) score += 10;
      if (career.category.toLowerCase().includes('data') && (interestSet.has('data analytics') || interestSet.has('machine learning'))) score += 12;
      if (career.category.toLowerCase().includes('cloud') && interestSet.has('cloud services')) score += 12;
      if (career.category.toLowerCase().includes('design') && interestSet.has('ui/ux craft')) score += 14;

      const finalScore = Math.min(Math.max(score, 55), 96);
      return {
        careerId: career.id,
        title: career.title,
        matchScore: finalScore,
        matchReason: `Aligns with your experience in ${matchedSkills.slice(0, 2).join(' & ') || 'foundational computing'} and stated career interests.`,
        keySkillMatches: matchedSkills,
        prioritySkillGaps: missingSkills.slice(0, 3),
        nextStepRecommendation: missingSkills.length > 0
          ? `Focus on mastering ${missingSkills[0]} to elevate your role readiness.`
          : `Build a capstone project demonstrating end-to-end fluency.`
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 4);
  },

  // 2. SKILL GAP ANALYSIS
  async analyzeSkillGaps(
    career: Career,
    userSkills: Skill[]
  ): Promise<SkillGapAnalysis> {
    try {
      const res = await fetch('/api/ai/gap-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          careerId: career.id,
          careerTitle: career.title,
          userSkills: userSkills.filter(s => s.isSaved).map(s => ({ name: s.name, level: s.proficiency })),
          requiredSkills: career.requiredSkills
        })
      });

      if (res.ok) {
        const payload = await res.json();
        if (payload.isAiGenerated && payload.data) {
          return {
            careerId: career.id,
            careerTitle: career.title,
            ...payload.data,
            isAiGenerated: true,
            mode: 'gemini'
          };
        }
      }
    } catch (err) {
      console.warn('[AIService] Gap analysis backend error, using rule-based engine:', err);
    }

    // Rule-based fallback
    const savedSkillsMap = new Map(userSkills.filter(s => s.isSaved).map(s => [s.name.toLowerCase(), s.proficiency || 'Beginner']));
    const strengths: string[] = [];
    const criticalGaps: SkillGapAnalysis['criticalGaps'] = [];
    let weightedTotal = 0;
    let earnedPoints = 0;

    career.requiredSkills.forEach(req => {
      const weight = req.importance === 'Must-Have' ? 3 : req.importance === 'Important' ? 2 : 1;
      weightedTotal += weight * 10;
      
      const reqLower = req.name.toLowerCase();
      let matchedProficiency: string | null = null;
      for (const [sName, sProf] of savedSkillsMap.entries()) {
        if (reqLower.includes(sName) || sName.includes(reqLower)) {
          matchedProficiency = sProf;
          break;
        }
      }

      if (matchedProficiency) {
        let pts = 5;
        if (matchedProficiency === 'Intermediate') pts = 8;
        if (matchedProficiency === 'Advanced') pts = 10;
        earnedPoints += weight * pts;
        strengths.push(`${req.name} (${matchedProficiency})`);
      } else {
        criticalGaps.push({
          skillName: req.name,
          importance: req.importance === 'Must-Have' ? 'High' : 'Medium',
          estimatedHours: req.importance === 'Must-Have' ? 25 : 15,
          recommendation: `Complete targeted tutorials and build a hands-on project module covering ${req.name}.`
        });
      }
    });

    const readinessScore = weightedTotal > 0 ? Math.round((earnedPoints / weightedTotal) * 100) : 50;

    return {
      careerId: career.id,
      careerTitle: career.title,
      readinessScore: Math.min(Math.max(readinessScore, 20), 95),
      summary: `You meet ${strengths.length} of ${career.requiredSkills.length} required skill competencies for ${career.title}. Addressing ${criticalGaps.length} target gaps will maximize interview competitiveness.`,
      strengths,
      criticalGaps,
      estimatedTimeToReady: criticalGaps.length <= 2 ? '4–6 weeks' : criticalGaps.length <= 4 ? '8–12 weeks' : '14–18 weeks',
      isAiGenerated: false,
      mode: 'rule-based'
    };
  },

  // 3. GENERATE STAGED ROADMAP
  async generateRoadmap(
    targetCareer: Career,
    startingLevel: 'Beginner' | 'Intermediate' | 'Advanced'
  ): Promise<{ roadmap: CareerRoadmap; isAiGenerated: boolean; mode: 'gemini' | 'rule-based' }> {
    try {
      const res = await fetch('/api/ai/generate-roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          careerTitle: targetCareer.title,
          startingLevel,
          targetSkills: targetCareer.requiredSkills.map(r => r.name)
        })
      });

      if (res.ok) {
        const payload = await res.json();
        if (payload.isAiGenerated && payload.data && Array.isArray(payload.data.stages)) {
          const generatedRoadmap: CareerRoadmap = {
            id: `roadmap-${targetCareer.id}-${Date.now()}`,
            targetCareerId: targetCareer.id,
            targetCareerTitle: targetCareer.title,
            startingLevel,
            createdAt: new Date().toISOString().split('T')[0],
            updatedAt: new Date().toISOString().split('T')[0],
            isAiGenerated: true,
            stages: payload.data.stages
          };
          return { roadmap: generatedRoadmap, isAiGenerated: true, mode: 'gemini' };
        }
      }
    } catch (err) {
      console.warn('[AIService] Roadmap generator backend error, falling back:', err);
    }

    // Deterministic staged curriculum tailored to target career
    const defaultStages: RoadmapStage[] = [
      {
        id: `stg-${Date.now()}-1`,
        order: 1,
        title: `Phase 1: Foundations for ${targetCareer.title}`,
        description: `Establish core literacy in standard tooling and fundamental competencies.`,
        durationWeeks: 4,
        milestones: [
          {
            id: `m-1-1`,
            title: `Core Principles: ${targetCareer.requiredSkills[0]?.name || 'Core Fundamentals'}`,
            completed: false,
            skillsCovered: [targetCareer.requiredSkills[0]?.name || 'Fundamentals'],
            tasks: [
              { id: `t-1-1-1`, title: 'Study official documentation and core syntax principles', completed: false, estimatedHours: 8 },
              { id: `t-1-1-2`, title: 'Complete 3 guided beginner labs and practice exercises', completed: false, estimatedHours: 6 }
            ]
          },
          {
            id: `m-1-2`,
            title: `Tooling & Workflow: ${targetCareer.toolsAndTechnologies.slice(0, 2).join(' & ') || 'Git & Workspace'}`,
            completed: false,
            skillsCovered: targetCareer.toolsAndTechnologies.slice(0, 2),
            tasks: [
              { id: `t-1-2-1`, title: 'Configure professional local development environment', completed: false, estimatedHours: 4 },
              { id: `t-1-2-2`, title: 'Create repository with clean README and automated checks', completed: false, estimatedHours: 4 }
            ]
          }
        ]
      },
      {
        id: `stg-${Date.now()}-2`,
        order: 2,
        title: `Phase 2: Intermediate Deep Dive & Data Architectures`,
        description: `Implement practical features and master essential business logic.`,
        durationWeeks: 6,
        milestones: [
          {
            id: `m-2-1`,
            title: `Advanced Competency: ${targetCareer.requiredSkills[1]?.name || 'Systems Architecture'}`,
            completed: false,
            skillsCovered: [targetCareer.requiredSkills[1]?.name || 'Architecture'],
            tasks: [
              { id: `t-2-1-1`, title: 'Design modular components and optimized queries', completed: false, estimatedHours: 10 },
              { id: `t-2-1-2`, title: 'Implement automated error boundaries and logging', completed: false, estimatedHours: 6 }
            ],
            suggestedProject: {
              title: `${targetCareer.title} Portfolio Project Alpha`,
              description: `Construct a functional end-to-end application reflecting real duties.`,
              deliverables: ['Source code repository', 'Live preview demonstration', 'Architecture design document']
            }
          }
        ]
      },
      {
        id: `stg-${Date.now()}-3`,
        order: 3,
        title: `Phase 3: Production Readiness & Portfolio Capstone`,
        description: `Ship production-ready deliverables, optimize performance, and prepare for interviews.`,
        durationWeeks: 6,
        milestones: [
          {
            id: `m-3-1`,
            title: `Capstone Deliverable: End-to-End ${targetCareer.title} System`,
            completed: false,
            skillsCovered: targetCareer.requiredSkills.map(r => r.name).slice(2, 5),
            tasks: [
              { id: `t-3-1-1`, title: 'Deploy capstone application with CI/CD and monitoring', completed: false, estimatedHours: 12 },
              { id: `t-3-1-2`, title: 'Conduct peer code review and accessibility audit', completed: false, estimatedHours: 6 }
            ],
            suggestedProject: {
              title: `Production Capstone for ${targetCareer.title}`,
              description: `Industry-grade project demonstrating production best practices.`,
              deliverables: ['Live cloud deployment', 'Technical walkthrough video', 'Performance benchmark report']
            }
          }
        ]
      }
    ];

    const fallbackRoadmap: CareerRoadmap = {
      id: `roadmap-${targetCareer.id}-${Date.now()}`,
      targetCareerId: targetCareer.id,
      targetCareerTitle: targetCareer.title,
      startingLevel,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      isAiGenerated: false,
      stages: defaultStages
    };

    return { roadmap: fallbackRoadmap, isAiGenerated: false, mode: 'rule-based' };
  },

  // 4. ANALYZE RESUME (ATS & CONTENT HEURISTICS)
  async analyzeResume(
    resumeText: string,
    targetRole: string
  ): Promise<ResumeAnalysisResult> {
    const resumeKey = `${targetRole}:${resumeText.slice(0, 2000)}`;
    if (inFlightResumePromises.has(resumeKey)) {
      return inFlightResumePromises.get(resumeKey)!;
    }

    const runPromise = (async () => {
      const analysisId = `analysis-${Date.now()}`;
      const timestamp = new Date().toISOString();

      try {
        const res = await fetch('/api/ai/analyze-resume', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resumeText, targetRole })
        });

        if (res.ok) {
          const payload = await res.json();
          if (payload.isAiGenerated && payload.data) {
            return {
              id: analysisId,
              timestamp,
              targetRole,
              ...payload.data,
              isAiGenerated: true,
              mode: 'gemini' as const
            };
          }
        }
      } catch (err) {
        console.warn('[AIService] Resume analysis API error, running heuristic engine:', err);
      }

      // Heuristic Rule-Based Engine
      const lower = resumeText.toLowerCase();

    // Section detection
    const missingSections: string[] = [];
    if (!lower.includes('experience') && !lower.includes('work') && !lower.includes('internship')) {
      missingSections.push('Work Experience / Internships');
    }
    if (!lower.includes('education') && !lower.includes('university') && !lower.includes('degree')) {
      missingSections.push('Education');
    }
    if (!lower.includes('project') && !lower.includes('portfolio')) {
      missingSections.push('Projects / Technical Work');
    }
    if (!lower.includes('summary') && !lower.includes('objective') && !lower.includes('profile')) {
      missingSections.push('Professional Summary');
    }
    if (!lower.includes('skill')) {
      missingSections.push('Skills');
    }

    // Metric / numbers check
    const numberMatches = resumeText.match(/\d+[\%|\$|k|m|ms|s]?|\b\d+\b/gi) || [];
    const hasMetrics = numberMatches.length >= 4;

    // Action verbs check
    const actionVerbs = ['developed', 'engineered', 'built', 'created', 'designed', 'optimized', 'reduced', 'increased', 'implemented', 'orchestrated', 'led', 'architected', 'spearheaded'];
    const foundVerbs = actionVerbs.filter(v => lower.includes(v));

    // Target role skill scanning
    const targetCareer = INITIAL_CAREERS.find(c => c.title.toLowerCase().includes(targetRole.toLowerCase()) || targetRole.toLowerCase().includes(c.title.toLowerCase())) || INITIAL_CAREERS[0];
    const matchedSkills: string[] = [];
    const missingSkills: string[] = [];

    targetCareer.requiredSkills.forEach(req => {
      const reqName = req.name.toLowerCase();
      if (lower.includes(reqName) || reqName.split(/[\s/]+/).some(token => token.length > 2 && lower.includes(token))) {
        matchedSkills.push(req.name);
      } else {
        missingSkills.push(req.name);
      }
    });

    const matchRate = targetCareer.requiredSkills.length > 0 
      ? Math.round((matchedSkills.length / targetCareer.requiredSkills.length) * 100) 
      : 70;

    // Scoring Breakdown
    const keywordScore = Math.min(Math.max(matchRate, 40), 95);
    const impactScore = hasMetrics ? 85 : 45;
    const structureScore = Math.max(95 - missingSections.length * 15, 40);
    const verbScore = Math.min(Math.max(foundVerbs.length * 12, 40), 92);
    const completenessScore = Math.max(100 - missingSections.length * 18, 45);

    const overallScore = Math.round(
      keywordScore * 0.25 +
      impactScore * 0.25 +
      structureScore * 0.20 +
      verbScore * 0.15 +
      completenessScore * 0.15
    );

    const strengths: string[] = [];
    if (matchedSkills.length >= 3) strengths.push(`Found ${matchedSkills.length} key technical keywords matching ${targetRole}.`);
    if (foundVerbs.length >= 4) strengths.push(`Strong active phrasing with power verbs (${foundVerbs.slice(0, 3).join(', ')}).`);
    if (hasMetrics) strengths.push('Good use of quantifiable metrics and percentage outcomes.');
    if (missingSections.length === 0) strengths.push('Complete standard single-column ATS section structure.');

    const recommendations = [
      {
        priority: (missingSections.length > 0 ? 'High' : 'Medium') as 'High' | 'Medium' | 'Low',
        title: missingSections.length > 0 ? 'Add Missing Core Resume Sections' : 'Enhance Measurable Business Impact',
        action: missingSections.length > 0
          ? `Incorporate standard headers for: ${missingSections.join(', ')}.`
          : 'Apply the Google X-Y-Z formula: "Accomplished [X] as measured by [Y], by doing [Z]".'
      },
      {
        priority: 'Medium' as 'High' | 'Medium' | 'Low',
        title: `Incorporate Priority Keywords: ${missingSkills.slice(0, 2).join(', ') || 'Domain Technologies'}`,
        action: `Integrate target skills directly into bullet points describing projects or coursework.`
      },
      {
        priority: 'Low' as 'High' | 'Medium' | 'Low',
        title: 'Maintain Clean ATS-Compliant Layout',
        action: 'Avoid multi-column tables, text boxes, or embedded images that disrupt legacy scanner OCR.'
      }
    ];

    const bulletRewrites = [
      {
        original: 'Worked on the frontend website using React and fixed bugs.',
        improved: 'Architected 6 responsive React components, eliminating 14 priority layout bugs and improving mobile lighthouse score by 28%.',
        reason: 'Replaces passive phrasing with action verb "Architected" and quantifies impact.'
      },
      {
        original: 'Responsible for writing SQL queries for the team reports.',
        improved: 'Engineered optimized PostgreSQL queries and window aggregations, reducing dashboard load times from 3.2s to 480ms.',
        reason: 'Adds specific technology stack and measurable speed outcome.'
      }
    ];

    return {
      id: analysisId,
      timestamp,
      targetRole,
      overallScore,
      isAiGenerated: false,
      mode: 'rule-based',
      aiNotice: 'CareerPilot AI is temporarily unable to generate an AI response. Please try again later.',
      scoringCriteria: [
        { category: 'Keyword & Role Alignment', score: keywordScore, weight: 25, feedback: `${matchedSkills.length} of ${targetCareer.requiredSkills.length} target skills detected.` },
        { category: 'Measurable Impact & Metrics', score: impactScore, weight: 25, feedback: hasMetrics ? 'Quantifiable metrics and statistics detected.' : 'Lacks measurable numeric outcomes (% or numbers).' },
        { category: 'Structure & ATS Formatting', score: structureScore, weight: 20, feedback: 'Single-column structure evaluated against standard parsing models.' },
        { category: 'Action Verbs & Brevity', score: verbScore, weight: 15, feedback: `Identified ${foundVerbs.length} high-impact action verbs.` },
        { category: 'Section Completeness', score: completenessScore, weight: 15, feedback: missingSections.length === 0 ? 'All essential sections present.' : `Missing: ${missingSections.join(', ')}` }
      ],
      strengths,
      missingSections,
      skillMatches: {
        matched: matchedSkills,
        missing: missingSkills,
        matchRatePercentage: matchRate
      },
      recommendations,
      bulletRewrites,
      disclaimer: 'This evaluation provides objective heuristic feedback based on standard ATS parsing models and tech hiring best practices. It does not guarantee employment or interview invitations.'
    };
    })();

    inFlightResumePromises.set(resumeKey, runPromise);
    try {
      return await runPromise;
    } finally {
      inFlightResumePromises.delete(resumeKey);
    }
  },

  // 5. BULLET IMPROVER
  async improveBullet(originalBullet: string, role = 'Software Developer'): Promise<{ improved: string; reason: string; isAiGenerated: boolean }> {
    try {
      const res = await fetch('/api/ai/improve-bullet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ originalBullet, role })
      });
      if (res.ok) {
        const payload = await res.json();
        if (payload.isAiGenerated && payload.data) {
          return { ...payload.data, isAiGenerated: true };
        }
      }
    } catch {
      // rule fallback
    }

    // High quality rule based rewrite
    const trimmed = originalBullet.trim().replace(/^\s*[-•*]\s*/, '');
    const enhanced = `Engineered robust solution for ${trimmed.charAt(0).toLowerCase() + trimmed.slice(1)}, delivering measurable performance improvements and ensuring high reliability.`;
    return {
      improved: enhanced,
      reason: 'Applied strong action verb ("Engineered") and framed with context and outcome.',
      isAiGenerated: false
    };
  },

  // 6. DRAFT SUMMARY
  async draftSummary(targetRole: string, experienceLevel: string, topSkills: string[]): Promise<{ summary: string; isAiGenerated: boolean }> {
    try {
      const res = await fetch('/api/ai/draft-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetRole, experienceLevel, topSkills })
      });
      if (res.ok) {
        const payload = await res.json();
        if (payload.isAiGenerated && payload.data?.summary) {
          return { summary: payload.data.summary, isAiGenerated: true };
        }
      }
    } catch {
      // rule fallback
    }

    const skillsStr = topSkills.length > 0 ? topSkills.slice(0, 4).join(', ') : 'modern software technologies';
    const summary = `Goal-driven ${experienceLevel || 'entry-level'} professional aspiring to excel as a ${targetRole || 'Software Developer'}. Skilled in ${skillsStr}, with hands-on experience designing scalable solutions, solving algorithmic challenges, and adhering to modern engineering practices. Passionate about delivering accessible, high-performance digital products that drive business value.`;
    return { summary, isAiGenerated: false };
  }
};

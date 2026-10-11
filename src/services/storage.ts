import {
  UserProfile,
  Skill,
  Career,
  CareerRoadmap,
  ResumeProfile,
  ResumeAnalysisResult,
  UserActivity,
  SkillProficiency
} from '../types';
import {
  INITIAL_CAREERS,
  INITIAL_SKILLS,
  INITIAL_USER_PROFILE,
  INITIAL_ROADMAPS,
  INITIAL_RESUMES
} from '../data/initialData';

const STORAGE_KEYS = {
  PROFILE: 'careerpilot_user_profile_v1',
  SKILLS: 'careerpilot_skills_v1',
  ROADMAPS: 'careerpilot_roadmaps_v1',
  RESUMES: 'careerpilot_resumes_v1',
  ANALYSES: 'careerpilot_analyses_v1',
  ACTIVITIES: 'careerpilot_activities_v1',
  CUSTOM_CAREERS: 'careerpilot_custom_careers_v1',
  INITIALIZED: 'careerpilot_initialized_v1'
} as const;

// Storage change event for cross-component reactive synchronization
export const STORAGE_EVENT = 'careerpilot_storage_update';

function notifyStorageChange(key: string) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STORAGE_EVENT, { detail: { key } }));
  }
}

function safeGet<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.warn(`[CareerPilot Storage] Failed to parse item for key "${key}":`, err);
    return fallback;
  }
}

function safeSet<T>(key: string, value: T): boolean {
  if (typeof window === 'undefined') return false;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    notifyStorageChange(key);
    return true;
  } catch (err) {
    console.error(`[CareerPilot Storage] Failed to set item for key "${key}":`, err);
    return false;
  }
}

export const StorageService = {
  // Ensure default demo data is primed safely on first run
  initializeDefaults(forceReset = false): void {
    if (typeof window === 'undefined') return;
    const isInitialized = localStorage.getItem(STORAGE_KEYS.INITIALIZED);
    if (!isInitialized || forceReset) {
      safeSet(STORAGE_KEYS.PROFILE, INITIAL_USER_PROFILE);
      safeSet(STORAGE_KEYS.SKILLS, INITIAL_SKILLS);
      safeSet(STORAGE_KEYS.ROADMAPS, INITIAL_ROADMAPS);
      safeSet(STORAGE_KEYS.RESUMES, INITIAL_RESUMES);
      safeSet(STORAGE_KEYS.ANALYSES, []);
      safeSet(STORAGE_KEYS.CUSTOM_CAREERS, []);
      safeSet(STORAGE_KEYS.ACTIVITIES, [
        {
          id: 'act-init-1',
          type: 'onboarding',
          title: 'Welcome to CareerPilot AI',
          description: 'Loaded default sample student profile (Alex Morgan) for exploration.',
          timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
          link: '/profile'
        },
        {
          id: 'act-init-2',
          type: 'roadmap_created',
          title: 'Software Developer Roadmap Active',
          description: 'Stage 1 and Stage 2 learning milestones in progress.',
          timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
          link: '/roadmap'
        }
      ] as UserActivity[]);
      localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
      notifyStorageChange('all');
    }
  },

  // Completely resets all data to clean uninitialized state
  resetToCleanSlate(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEYS.INITIALIZED);
    const cleanProfile: UserProfile = {
      fullName: '',
      email: '',
      currentEducationLevel: '',
      fieldOfStudy: '',
      graduationYear: '',
      careerGoals: [],
      primaryTargetCareerId: 'software-developer',
      preferredExperienceLevel: 'Entry-Level',
      interests: [],
      isOnboardingCompleted: false,
      onboardingStep: 1,
      isDemoUser: false,
      preferences: {
        emailNotifications: false,
        roadmapReminders: true,
        highContrastMode: false,
        compactView: false
      }
    };
    safeSet(STORAGE_KEYS.PROFILE, cleanProfile);
    safeSet(STORAGE_KEYS.SKILLS, INITIAL_SKILLS.map(s => ({ ...s, isSaved: false, proficiency: undefined })));
    safeSet(STORAGE_KEYS.ROADMAPS, []);
    safeSet(STORAGE_KEYS.RESUMES, []);
    safeSet(STORAGE_KEYS.ANALYSES, []);
    safeSet(STORAGE_KEYS.ACTIVITIES, [
      {
        id: `act-${Date.now()}`,
        type: 'onboarding',
        title: 'Fresh Slate Initialized',
        description: 'Demo data cleared. You can start fresh from Onboarding.',
        timestamp: new Date().toISOString(),
        link: '/onboarding'
      }
    ] as UserActivity[]);
    notifyStorageChange('all');
  },

  // USER PROFILE
  getProfile(): UserProfile {
    return safeGet<UserProfile>(STORAGE_KEYS.PROFILE, INITIAL_USER_PROFILE);
  },

  saveProfile(profile: Partial<UserProfile>): UserProfile {
    const current = this.getProfile();
    const updated: UserProfile = { ...current, ...profile };
    safeSet(STORAGE_KEYS.PROFILE, updated);
    this.addActivity({
      type: 'onboarding',
      title: 'Profile Updated',
      description: `Updated profile details and career goals.`,
      link: '/profile'
    });
    return updated;
  },

  // CAREERS (Read default canonical + user custom)
  getCareers(): Career[] {
    const custom = safeGet<Career[]>(STORAGE_KEYS.CUSTOM_CAREERS, []);
    return [...INITIAL_CAREERS, ...custom];
  },

  getCareerById(id: string): Career | undefined {
    const careers = this.getCareers();
    return careers.find(c => c.id === id);
  },

  // SKILLS CRUD
  getSkills(): Skill[] {
    const rawSkills = safeGet<Skill[]>(STORAGE_KEYS.SKILLS, INITIAL_SKILLS);
    let needsSync = false;
    const enriched = rawSkills.map(s => {
      const initMatch = INITIAL_SKILLS.find(item => item.id === s.id);
      let updated = s;
      if (
        s.practiceHours === undefined ||
        s.practiceCount === undefined ||
        !s.proficiencyHistory ||
        s.proficiencyHistory.length === 0
      ) {
        needsSync = true;
        const defaultHistory = initMatch?.proficiencyHistory || [
          { date: 'Month 1', score: s.proficiency === 'Advanced' ? 50 : s.proficiency === 'Intermediate' ? 30 : 18, hours: 4 },
          { date: 'Month 2', score: s.proficiency === 'Advanced' ? 62 : s.proficiency === 'Intermediate' ? 42 : 28, hours: 8 },
          { date: 'Month 3', score: s.proficiency === 'Advanced' ? 72 : s.proficiency === 'Intermediate' ? 52 : 38, hours: 12 },
          { date: 'Month 4', score: s.proficiency === 'Advanced' ? 80 : s.proficiency === 'Intermediate' ? 62 : 48, hours: 16 },
          { date: 'Month 5', score: s.proficiency === 'Advanced' ? 86 : s.proficiency === 'Intermediate' ? 70 : 58, hours: 20 },
          { date: 'Month 6', score: s.proficiency === 'Advanced' ? 92 : s.proficiency === 'Intermediate' ? 78 : 66, hours: 24 }
        ];
        updated = {
          ...s,
          practiceHours: s.practiceHours ?? initMatch?.practiceHours ?? (s.proficiency === 'Advanced' ? 42 : s.proficiency === 'Intermediate' ? 24 : 12),
          practiceCount: s.practiceCount ?? initMatch?.practiceCount ?? (s.proficiency === 'Advanced' ? 20 : s.proficiency === 'Intermediate' ? 12 : 6),
          proficiencyHistory: s.proficiencyHistory && s.proficiencyHistory.length > 0 ? s.proficiencyHistory : defaultHistory
        };
      }
      return updated;
    });

    if (needsSync && typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEYS.SKILLS, JSON.stringify(enriched));
      } catch (e) {
        // ignore
      }
    }
    return enriched;
  },

  logSkillPractice(id: string, hours: number = 1): Skill | undefined {
    const skills = this.getSkills();
    const index = skills.findIndex(s => s.id === id);
    if (index < 0) return undefined;

    const skill = { ...skills[index] };
    skill.practiceHours = (skill.practiceHours || 0) + hours;
    skill.practiceCount = (skill.practiceCount || 0) + 1;
    skill.isSaved = true;

    if (skill.proficiencyHistory && skill.proficiencyHistory.length > 0) {
      const history = [...skill.proficiencyHistory];
      const lastIndex = history.length - 1;
      const currentScore = history[lastIndex].score;
      // Incremental proficiency gain up to 98%
      const newScore = Math.min(98, currentScore + Math.max(1, Math.round(hours * 1.5)));
      history[lastIndex] = {
        ...history[lastIndex],
        score: newScore,
        hours: (history[lastIndex].hours || skill.practiceHours) + hours
      };
      skill.proficiencyHistory = history;

      // Update skill level if threshold crossed
      if (newScore >= 80 && skill.proficiency !== 'Advanced') {
        skill.proficiency = 'Advanced';
      } else if (newScore >= 50 && skill.proficiency === 'Beginner') {
        skill.proficiency = 'Intermediate';
      }
    }

    skills[index] = skill;
    safeSet(STORAGE_KEYS.SKILLS, skills);

    this.addActivity({
      type: 'skill_updated',
      title: `Practiced ${skill.name}`,
      description: `Logged +${hours} hr practice session (Total: ${skill.practiceHours} hrs).`,
      link: `/skills/${skill.id}`
    });

    return skill;
  },

  getSavedSkills(): Skill[] {
    return this.getSkills().filter(s => s.isSaved);
  },

  getSkillById(id: string): Skill | undefined {
    return this.getSkills().find(s => s.id === id);
  },

  saveSkill(skillData: Partial<Skill> & { id: string; name: string }): Skill {
    const skills = this.getSkills();
    const index = skills.findIndex(s => s.id === skillData.id);
    let result: Skill;
    if (index >= 0) {
      result = {
        ...skills[index],
        ...skillData,
        isSaved: skillData.isSaved !== undefined ? skillData.isSaved : true,
        acquiredDate: skillData.acquiredDate || skills[index].acquiredDate || new Date().toISOString().split('T')[0]
      };
      skills[index] = result;
      this.addActivity({
        type: 'skill_updated',
        title: `Updated Skill: ${result.name}`,
        description: `Proficiency marked as ${result.proficiency || 'Beginner'}.`,
        link: `/skills/${result.id}`
      });
    } else {
      result = {
        id: skillData.id,
        name: skillData.name,
        category: skillData.category || 'Tools & Frameworks',
        proficiency: skillData.proficiency || 'Beginner',
        description: skillData.description || `Skill in ${skillData.name}`,
        relevance: skillData.relevance || 'Relevant to tech and modern digital workflows.',
        prerequisites: skillData.prerequisites || [],
        learningResources: skillData.learningResources || [],
        practiceTasks: skillData.practiceTasks || [],
        suggestedProjects: skillData.suggestedProjects || [],
        isSaved: true,
        acquiredDate: new Date().toISOString().split('T')[0]
      };
      skills.push(result);
      this.addActivity({
        type: 'skill_added',
        title: `Added Skill: ${result.name}`,
        description: `Marked with ${result.proficiency || 'Beginner'} proficiency.`,
        link: `/skills/${result.id}`
      });
    }
    safeSet(STORAGE_KEYS.SKILLS, skills);
    return result;
  },

  updateSkillProficiency(id: string, proficiency: SkillProficiency): boolean {
    const skills = this.getSkills();
    const index = skills.findIndex(s => s.id === id);
    if (index >= 0) {
      skills[index].proficiency = proficiency;
      skills[index].isSaved = true;
      safeSet(STORAGE_KEYS.SKILLS, skills);
      this.addActivity({
        type: 'skill_updated',
        title: `Updated ${skills[index].name}`,
        description: `Proficiency changed to ${proficiency}.`,
        link: `/skills/${id}`
      });
      return true;
    }
    return false;
  },

  deleteSkill(id: string): boolean {
    const skills = this.getSkills();
    const target = skills.find(s => s.id === id);
    if (!target) return false;
    // Mark as unsaved instead of destroying catalog item, or remove if custom
    const updated = skills.map(s => {
      if (s.id === id) {
        return { ...s, isSaved: false, proficiency: undefined };
      }
      return s;
    });
    safeSet(STORAGE_KEYS.SKILLS, updated);
    this.addActivity({
      type: 'skill_updated',
      title: `Removed Skill: ${target.name}`,
      description: 'Removed from personal active skill list.',
      link: '/skills'
    });
    return true;
  },

  // ROADMAPS CRUD
  getRoadmaps(): CareerRoadmap[] {
    return safeGet<CareerRoadmap[]>(STORAGE_KEYS.ROADMAPS, INITIAL_ROADMAPS);
  },

  getRoadmapById(id: string): CareerRoadmap | undefined {
    return this.getRoadmaps().find(r => r.id === id);
  },

  saveRoadmap(roadmap: CareerRoadmap): CareerRoadmap {
    const roadmaps = this.getRoadmaps();
    const index = roadmaps.findIndex(r => r.id === roadmap.id);
    if (index >= 0) {
      roadmaps[index] = { ...roadmap, updatedAt: new Date().toISOString().split('T')[0] };
    } else {
      roadmaps.unshift(roadmap);
      this.addActivity({
        type: 'roadmap_created',
        title: `New Roadmap Created`,
        description: `Targeting ${roadmap.targetCareerTitle} (${roadmap.startingLevel} level).`,
        link: `/roadmap/${roadmap.id}`
      });
    }
    safeSet(STORAGE_KEYS.ROADMAPS, roadmaps);
    return roadmap;
  },

  toggleMilestone(roadmapId: string, stageId: string, milestoneId: string): boolean {
    const roadmaps = this.getRoadmaps();
    const roadmap = roadmaps.find(r => r.id === roadmapId);
    if (!roadmap) return false;
    const stage = roadmap.stages.find(s => s.id === stageId);
    if (!stage) return false;
    const milestone = stage.milestones.find(m => m.id === milestoneId);
    if (!milestone) return false;

    milestone.completed = !milestone.completed;
    // Also toggle nested tasks if any
    milestone.tasks.forEach(t => {
      t.completed = milestone.completed;
    });

    roadmap.updatedAt = new Date().toISOString().split('T')[0];
    safeSet(STORAGE_KEYS.ROADMAPS, roadmaps);

    if (milestone.completed) {
      this.addActivity({
        type: 'milestone_completed',
        title: `Milestone Completed`,
        description: `Achieved "${milestone.title}" in ${roadmap.targetCareerTitle}.`,
        link: `/roadmap/${roadmap.id}`
      });
    }
    return true;
  },

  toggleTask(roadmapId: string, stageId: string, milestoneId: string, taskId: string): boolean {
    const roadmaps = this.getRoadmaps();
    const roadmap = roadmaps.find(r => r.id === roadmapId);
    if (!roadmap) return false;
    const stage = roadmap.stages.find(s => s.id === stageId);
    if (!stage) return false;
    const milestone = stage.milestones.find(m => m.id === milestoneId);
    if (!milestone) return false;
    const task = milestone.tasks.find(t => t.id === taskId);
    if (!task) return false;

    task.completed = !task.completed;
    // If all tasks complete, complete milestone
    milestone.completed = milestone.tasks.length > 0 && milestone.tasks.every(t => t.completed);

    roadmap.updatedAt = new Date().toISOString().split('T')[0];
    safeSet(STORAGE_KEYS.ROADMAPS, roadmaps);
    return true;
  },

  deleteRoadmap(id: string): boolean {
    const roadmaps = this.getRoadmaps();
    const filtered = roadmaps.filter(r => r.id !== id);
    safeSet(STORAGE_KEYS.ROADMAPS, filtered);
    return true;
  },

  // RESUMES CRUD
  getResumes(): ResumeProfile[] {
    return safeGet<ResumeProfile[]>(STORAGE_KEYS.RESUMES, INITIAL_RESUMES);
  },

  getResumeById(id: string): ResumeProfile | undefined {
    return this.getResumes().find(r => r.id === id);
  },

  saveResume(resume: ResumeProfile): ResumeProfile {
    const resumes = this.getResumes();
    const index = resumes.findIndex(r => r.id === resume.id);
    const updated = {
      ...resume,
      updatedAt: new Date().toISOString().split('T')[0]
    };
    if (index >= 0) {
      resumes[index] = updated;
    } else {
      resumes.unshift(updated);
      this.addActivity({
        type: 'resume_created',
        title: `Created Resume: ${updated.title}`,
        description: `Targeting ${updated.targetRole || 'Software Roles'}.`,
        link: `/resume/builder?id=${updated.id}`
      });
    }
    safeSet(STORAGE_KEYS.RESUMES, resumes);
    return updated;
  },

  deleteResume(id: string): boolean {
    const resumes = this.getResumes();
    const filtered = resumes.filter(r => r.id !== id);
    safeSet(STORAGE_KEYS.RESUMES, filtered);
    return true;
  },

  // RESUME ANALYSIS HISTORY
  getAnalyses(): ResumeAnalysisResult[] {
    return safeGet<ResumeAnalysisResult[]>(STORAGE_KEYS.ANALYSES, []);
  },

  saveAnalysis(analysis: ResumeAnalysisResult): ResumeAnalysisResult {
    const list = this.getAnalyses();
    list.unshift(analysis);
    if (list.length > 20) list.pop(); // keep last 20
    safeSet(STORAGE_KEYS.ANALYSES, list);
    this.addActivity({
      type: 'resume_analyzed',
      title: `Resume Analyzed (Score: ${analysis.overallScore}/100)`,
      description: `Evaluated against ${analysis.targetRole} (${analysis.mode === 'gemini' ? 'Gemini AI' : 'Rule-Based Engine'}).`,
      link: `/resume/analysis?id=${analysis.id}`
    });
    return analysis;
  },

  getAnalysisById(id: string): ResumeAnalysisResult | undefined {
    return this.getAnalyses().find(a => a.id === id);
  },

  // RECENT ACTIVITIES
  getActivities(): UserActivity[] {
    return safeGet<UserActivity[]>(STORAGE_KEYS.ACTIVITIES, []);
  },

  addActivity(item: Omit<UserActivity, 'id' | 'timestamp'>): void {
    const activities = this.getActivities();
    const newAct: UserActivity = {
      id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
      ...item
    };
    activities.unshift(newAct);
    if (activities.length > 30) activities.pop();
    safeSet(STORAGE_KEYS.ACTIVITIES, activities);
  }
};

// Auto prime on load
if (typeof window !== 'undefined') {
  StorageService.initializeDefaults();
}

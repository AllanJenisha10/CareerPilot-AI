export type SkillProficiency = 'Beginner' | 'Intermediate' | 'Advanced';

export type SkillCategory = 
  | 'Programming Languages'
  | 'Frontend'
  | 'Backend'
  | 'Data & AI'
  | 'Cloud & DevOps'
  | 'Design'
  | 'Cybersecurity'
  | 'Soft Skills'
  | 'Tools & Frameworks';

export interface SkillProgressPoint {
  date: string;
  score: number;
  hours?: number;
}

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  proficiency?: SkillProficiency;
  description: string;
  relevance: string;
  prerequisites: string[];
  learningResources: {
    title: string;
    type: 'Course' | 'Documentation' | 'Book' | 'Interactive' | 'Video';
    provider: string;
    url: string;
    free: boolean;
  }[];
  practiceTasks: string[];
  suggestedProjects: {
    title: string;
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
    description: string;
  }[];
  isSaved?: boolean;
  acquiredDate?: string;
  practiceHours?: number;
  practiceCount?: number;
  proficiencyHistory?: SkillProgressPoint[];
}

export interface Career {
  id: string;
  title: string;
  category: string;
  experienceLevel: 'Entry-Level' | 'Mid-Level' | 'Senior' | 'All Levels';
  shortDescription: string;
  fullDescription: string;
  medianSalaryRange: string;
  projectedGrowth: string;
  typicalResponsibilities: string[];
  requiredSkills: {
    skillId: string;
    name: string;
    level: SkillProficiency;
    importance: 'Must-Have' | 'Important' | 'Nice-to-Have';
  }[];
  toolsAndTechnologies: string[];
  educationRequirements: string[];
  possibleEntryRoutes: string[];
  relatedCareerIds: string[];
}

export interface RoadmapTask {
  id: string;
  title: string;
  completed: boolean;
  estimatedHours: number;
  resourceTitle?: string;
  resourceLink?: string;
}

export interface RoadmapMilestone {
  id: string;
  title: string;
  completed: boolean;
  skillsCovered: string[];
  tasks: RoadmapTask[];
  suggestedProject?: {
    title: string;
    description: string;
    deliverables: string[];
  };
}

export interface RoadmapStage {
  id: string;
  order: number;
  title: string;
  description: string;
  durationWeeks: number;
  milestones: RoadmapMilestone[];
}

export interface CareerRoadmap {
  id: string;
  targetCareerId: string;
  targetCareerTitle: string;
  startingLevel: SkillProficiency;
  createdAt: string;
  updatedAt: string;
  isAiGenerated: boolean;
  stages: RoadmapStage[];
  notes?: string;
}

export interface ResumeEducation {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  gpa?: string;
  achievements?: string[];
}

export interface ResumeExperience {
  id: string;
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  description: string;
  bullets: string[];
}

export interface ResumeProject {
  id: string;
  title: string;
  role: string;
  technologies: string[];
  link?: string;
  bullets: string[];
}

export interface ResumeCertification {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  credentialId?: string;
  credentialUrl?: string;
}

export interface ResumeProfile {
  id: string;
  title: string;
  updatedAt: string;
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedinUrl: string;
    portfolioUrl: string;
    githubUrl: string;
  };
  targetRole: string;
  professionalSummary: string;
  skills: {
    category: string;
    items: string[];
  }[];
  experience: ResumeExperience[];
  education: ResumeEducation[];
  projects: ResumeProject[];
  certifications: ResumeCertification[];
  languages: {
    language: string;
    proficiency: 'Basic' | 'Conversational' | 'Fluent' | 'Native';
  }[];
  photoUrl?: string;
  includePhoto?: boolean;
}

export interface ResumeAnalysisResult {
  id: string;
  resumeId?: string;
  timestamp: string;
  targetRole: string;
  overallScore: number; // 0 - 100
  isAiGenerated: boolean;
  mode: 'gemini' | 'rule-based';
  aiNotice?: string;
  scoringCriteria: {
    category: string;
    score: number;
    weight: number;
    feedback: string;
  }[];
  strengths: string[];
  missingSections: string[];
  skillMatches: {
    matched: string[];
    missing: string[];
    matchRatePercentage: number;
  };
  recommendations: {
    priority: 'High' | 'Medium' | 'Low';
    title: string;
    action: string;
  }[];
  bulletRewrites: {
    original: string;
    improved: string;
    reason: string;
  }[];
  disclaimer: string;
}

export interface UserActivity {
  id: string;
  type: 'onboarding' | 'skill_added' | 'skill_updated' | 'roadmap_created' | 'milestone_completed' | 'resume_created' | 'resume_analyzed';
  title: string;
  description: string;
  timestamp: string;
  link?: string;
}

export interface UserProfile {
  fullName: string;
  email: string;
  currentEducationLevel: string;
  fieldOfStudy: string;
  graduationYear: string;
  careerGoals: string[];
  primaryTargetCareerId: string;
  preferredExperienceLevel: string;
  interests: string[];
  isOnboardingCompleted: boolean;
  onboardingStep: number;
  isDemoUser: boolean;
  avatarUrl?: string;
  preferences: {
    emailNotifications: boolean;
    roadmapReminders: boolean;
    highContrastMode: boolean;
    compactView: boolean;
    includePhotoOnResume?: boolean;
  };
}

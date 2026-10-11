import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Compass,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  GraduationCap,
  Award,
  Sparkles,
  Target,
  BookOpen,
  Briefcase
} from 'lucide-react';
import { StorageService } from '../services/storage';
import { AIService } from '../services/aiService';
import { UserProfile, Career } from '../types';
import { ProgressBar } from '../components/common/ProgressBar';
import { Badge } from '../components/common/Badge';
import { useToast } from '../context/ToastContext';

export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [careers] = useState<Career[]>(StorageService.getCareers());
  const initialProfile = StorageService.getProfile();

  // Wizard Step: 1 = Education, 2 = Career Goals, 3 = Interests, 4 = Skills, 5 = Target Career & Review
  const [step, setStep] = useState(initialProfile.onboardingStep || 1);

  // Form states
  const [educationLevel, setEducationLevel] = useState(initialProfile.currentEducationLevel || "Bachelor's Degree (Undergraduate)");
  const [fieldOfStudy, setFieldOfStudy] = useState(initialProfile.fieldOfStudy || 'Computer Science');
  const [gradYear, setGradYear] = useState(initialProfile.graduationYear || '2025');

  const [careerGoals, setCareerGoals] = useState<string[]>(
    initialProfile.careerGoals.length > 0
      ? initialProfile.careerGoals
      : ['Secure an entry-level software developer position', 'Master production API design']
  );
  const [goalInput, setGoalInput] = useState('');

  const [interests, setInterests] = useState<string[]>(
    initialProfile.interests.length > 0
      ? initialProfile.interests
      : ['Web Applications', 'API Architecture', 'Cloud Services']
  );

  const interestOptions = [
    'Web Applications',
    'Mobile Apps',
    'Data Analytics',
    'Machine Learning',
    'Cloud Services',
    'Cybersecurity',
    'UI/UX Craft',
    'DevOps Automation',
    'Embedded Systems'
  ];

  const [selectedSkills, setSelectedSkills] = useState<string[]>(['JavaScript / TypeScript', 'Python', 'SQL & Relational Databases']);

  const commonSkillsList = [
    'JavaScript / TypeScript',
    'Python',
    'SQL & Relational Databases',
    'Git & Version Control',
    'React & Component Architecture',
    'Docker & Containerization',
    'Data Structures & Algorithms',
    'Machine Learning Algorithms',
    'Figma & Design Systems',
    'Computer Networking & Protocols'
  ];

  const [targetCareerId, setTargetCareerId] = useState(initialProfile.primaryTargetCareerId || 'software-developer');
  const [expLevel, setExpLevel] = useState(initialProfile.preferredExperienceLevel || 'Entry-Level');

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-save progress
  const saveStepProgress = (newStep: number) => {
    StorageService.saveProfile({
      currentEducationLevel: educationLevel,
      fieldOfStudy,
      graduationYear: gradYear,
      careerGoals,
      interests,
      primaryTargetCareerId: targetCareerId,
      preferredExperienceLevel: expLevel,
      onboardingStep: newStep
    });
  };

  const handleNext = () => {
    if (step === 1) {
      if (!fieldOfStudy.trim()) {
        error('Required', 'Please enter your field of study or major.');
        return;
      }
    }
    if (step === 2) {
      if (careerGoals.length === 0) {
        error('Required', 'Please select or add at least one career goal.');
        return;
      }
    }
    if (step === 3) {
      if (interests.length === 0) {
        error('Required', 'Please select at least one technology interest.');
        return;
      }
    }

    const nextStep = step + 1;
    setStep(nextStep);
    saveStepProgress(nextStep);
  };

  const handleBack = () => {
    const prev = Math.max(1, step - 1);
    setStep(prev);
    saveStepProgress(prev);
  };

  const addCustomGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (goalInput.trim()) {
      setCareerGoals(prev => [...prev, goalInput.trim()]);
      setGoalInput('');
    }
  };

  const removeGoal = (idx: number) => {
    setCareerGoals(prev => prev.filter((_, i) => i !== idx));
  };

  const toggleInterest = (item: string) => {
    setInterests(prev =>
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  const toggleSkill = (item: string) => {
    setSelectedSkills(prev =>
      prev.includes(item) ? prev.filter(s => s !== item) : [...prev, item]
    );
  };

  const handleCompleteOnboarding = () => {
    setIsSubmitting(true);
    StorageService.saveProfile({
      currentEducationLevel: educationLevel,
      fieldOfStudy,
      graduationYear: gradYear,
      careerGoals,
      interests,
      primaryTargetCareerId: targetCareerId,
      preferredExperienceLevel: expLevel,
      isOnboardingCompleted: true,
      onboardingStep: 5,
      isDemoUser: false
    });

    // Save the selected skills
    selectedSkills.forEach(name => {
      const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      StorageService.saveSkill({
        id,
        name,
        proficiency: 'Intermediate',
        isSaved: true
      });
    });

    success('Onboarding Completed!', 'Your customized CareerPilot AI dashboard is ready.');
    setTimeout(() => {
      navigate('/dashboard');
    }, 400);
  };

  const percent = Math.round((step / 5) * 100);

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-6">
      {/* Wizard Progress */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#D2B9E0] shadow-xs">
        <div className="flex items-center justify-between text-xs font-bold text-[#370D48] mb-2">
          <span>Step {step} of 5: {
            step === 1 ? 'Education & Academic Focus' :
            step === 2 ? 'Career Goals' :
            step === 3 ? 'Technology Interests' :
            step === 4 ? 'Current Skills' :
            'Target Role & Confirmation'
          }</span>
          <span className="text-[#580F69]">{percent}% Complete</span>
        </div>
        <ProgressBar value={percent} showPercent={false} size="sm" />
      </div>

      {/* Wizard Card Body */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border-2 border-[#D2B9E0] shadow-sm space-y-8">
        {/* STEP 1: EDUCATION */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#580F69] uppercase tracking-wider mb-1">
                <GraduationCap className="w-4 h-4" />
                <span>Academic Background</span>
              </div>
              <h2 className="text-2xl font-extrabold text-[#370D48]">
                Tell us about your educational journey
              </h2>
              <p className="text-xs sm:text-sm text-[#240D2F]/75 mt-1">
                We use this to calibrate career requirements and entry route recommendations.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#370D48] mb-1.5">
                  Current Education Level *
                </label>
                <select
                  value={educationLevel}
                  onChange={e => setEducationLevel(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F5F8] border border-[#D2B9E0] text-sm text-[#370D48] font-semibold min-h-[44px]"
                >
                  <option value="High School / Diploma">High School / Diploma</option>
                  <option value="Associate Degree">Associate Degree</option>
                  <option value="Bachelor's Degree (Undergraduate)">Bachelor's Degree (Undergraduate)</option>
                  <option value="Master's Degree / Graduate">Master's Degree / Graduate</option>
                  <option value="Doctorate / PhD">Doctorate / PhD</option>
                  <option value="Bootcamp / Self-Taught">Bootcamp / Self-Taught Professional</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#370D48] mb-1.5">
                  Field of Study / Major *
                </label>
                <input
                  type="text"
                  value={fieldOfStudy}
                  onChange={e => setFieldOfStudy(e.target.value)}
                  placeholder="e.g. Computer Science, Information Technology, Data Science, Design"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F5F8] border border-[#D2B9E0] text-sm text-[#370D48] min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#370D48] mb-1.5">
                  Graduation or Target Completion Year
                </label>
                <input
                  type="text"
                  value={gradYear}
                  onChange={e => setGradYear(e.target.value)}
                  placeholder="e.g. 2025 or 2026"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F5F8] border border-[#D2B9E0] text-sm text-[#370D48] min-h-[44px]"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: GOALS */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#580F69] uppercase tracking-wider mb-1">
                <Target className="w-4 h-4" />
                <span>Aspirations</span>
              </div>
              <h2 className="text-2xl font-extrabold text-[#370D48]">
                What are your primary career objectives?
              </h2>
              <p className="text-xs sm:text-sm text-[#240D2F]/75 mt-1">
                Select from common objectives or write your own.
              </p>
            </div>

            <form onSubmit={addCustomGoal} className="flex gap-2">
              <input
                type="text"
                value={goalInput}
                onChange={e => setGoalInput(e.target.value)}
                placeholder="Add specific career goal..."
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#F7F5F8] border border-[#D2B9E0] text-sm text-[#370D48] min-h-[44px]"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-[#580F69] text-white font-bold text-xs hover:bg-[#370D48] min-h-[44px]"
              >
                Add Goal
              </button>
            </form>

            <div className="space-y-2">
              {careerGoals.map((g, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-[#F7F5F8] border border-[#D2B9E0] flex items-center justify-between text-xs sm:text-sm text-[#370D48]"
                >
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#580F69]" />
                    <span>{g}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => removeGoal(i)}
                    className="text-red-600 hover:underline text-xs font-semibold p-1"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: INTERESTS */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#580F69] uppercase tracking-wider mb-1">
                <Sparkles className="w-4 h-4" />
                <span>Domains</span>
              </div>
              <h2 className="text-2xl font-extrabold text-[#370D48]">
                What areas of technology excite you most?
              </h2>
              <p className="text-xs sm:text-sm text-[#240D2F]/75 mt-1">
                Choose the domains you enjoy working on.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {interestOptions.map(item => {
                const isSelected = interests.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleInterest(item)}
                    className={`p-3.5 rounded-2xl text-xs font-bold border-2 transition-all text-left min-h-[44px] flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#580F69] border-[#580F69] text-white shadow-xs'
                        : 'bg-[#F7F5F8] border-[#D2B9E0] text-[#370D48] hover:border-[#580F69]'
                    }`}
                  >
                    <span>{item}</span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-white shrink-0 ml-1" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 4: CURRENT SKILLS */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#580F69] uppercase tracking-wider mb-1">
                <Award className="w-4 h-4" />
                <span>Foundational Toolkit</span>
              </div>
              <h2 className="text-2xl font-extrabold text-[#370D48]">
                Which of these skills do you currently possess?
              </h2>
              <p className="text-xs sm:text-sm text-[#240D2F]/75 mt-1">
                Select your existing tools to calculate your initial skill gap readiness.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {commonSkillsList.map(item => {
                const isSelected = selectedSkills.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleSkill(item)}
                    className={`p-3.5 rounded-2xl text-xs font-bold border-2 transition-all text-left min-h-[44px] flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#580F69] border-[#580F69] text-white shadow-xs'
                        : 'bg-[#F7F5F8] border-[#D2B9E0] text-[#370D48] hover:border-[#580F69]'
                    }`}
                  >
                    <span>{item}</span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-white shrink-0 ml-1" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 5: TARGET CAREER & REVIEW */}
        {step === 5 && (
          <div className="space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#580F69] uppercase tracking-wider mb-1">
                <Briefcase className="w-4 h-4" />
                <span>Final Target Role</span>
              </div>
              <h2 className="text-2xl font-extrabold text-[#370D48]">
                Select your primary target career & review
              </h2>
              <p className="text-xs sm:text-sm text-[#240D2F]/75 mt-1">
                You can change this anytime or track multiple roles on your dashboard.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#370D48] mb-1.5">
                  Primary Target Career *
                </label>
                <select
                  value={targetCareerId}
                  onChange={e => setTargetCareerId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F5F8] border border-[#D2B9E0] text-sm text-[#370D48] font-semibold min-h-[44px]"
                >
                  {careers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.title} ({c.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#370D48] mb-1.5">
                  Target Experience Level *
                </label>
                <select
                  value={expLevel}
                  onChange={e => setExpLevel(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F5F8] border border-[#D2B9E0] text-sm text-[#370D48] font-semibold min-h-[44px]"
                >
                  <option value="Entry-Level">Entry-Level / Junior (0-2 years)</option>
                  <option value="Mid-Level">Mid-Level (2-5 years)</option>
                  <option value="Senior">Senior (5+ years)</option>
                </select>
              </div>

              {/* Review Box */}
              <div className="p-4 rounded-2xl bg-[#F7F5F8] border border-[#D2B9E0] space-y-2 text-xs text-[#240D2F]/80">
                <div className="font-bold text-[#370D48]">Profile Summary Snapshot:</div>
                <div>• Education: {educationLevel} in {fieldOfStudy} ({gradYear})</div>
                <div>• Goals: {careerGoals.join('; ')}</div>
                <div>• Interests: {interests.join(', ')}</div>
                <div>• Initial Skills: {selectedSkills.join(', ')}</div>
              </div>
            </div>
          </div>
        )}

        {/* Wizard Controls */}
        <div className="pt-6 border-t border-[#F7F5F8] flex items-center justify-between">
          <button
            type="button"
            onClick={handleBack}
            disabled={step === 1}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#D2B9E0] text-xs font-bold text-[#370D48] hover:bg-[#D2B9E0]/20 disabled:opacity-30 disabled:cursor-not-allowed min-h-[44px]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          {step < 5 ? (
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-[#580F69] hover:bg-[#370D48] text-white text-xs sm:text-sm font-bold shadow-md transition-all min-h-[44px]"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleCompleteOnboarding}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#580F69] hover:bg-[#370D48] text-white text-xs sm:text-sm font-bold shadow-md transition-all min-h-[44px] disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving Profile...' : 'Complete & Launch Dashboard'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

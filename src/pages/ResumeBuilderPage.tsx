import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  FileText,
  Save,
  Printer,
  Download,
  Plus,
  Trash2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Eye,
  Edit3
} from 'lucide-react';
import { StorageService, STORAGE_EVENT } from '../services/storage';
import { AIService } from '../services/aiService';
import {
  ResumeProfile,
  ResumeExperience,
  ResumeEducation,
  ResumeProject,
  ResumeCertification
} from '../types';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { Badge } from '../components/common/Badge';
import { useToast } from '../context/ToastContext';

export const ResumeBuilderPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const resumeId = searchParams.get('id');
  const { success, error } = useToast();

  const [resume, setResume] = useState<ResumeProfile>(() => {
    if (resumeId) {
      const found = StorageService.getResumeById(resumeId);
      if (found) return found;
    }
    const all = StorageService.getResumes();
    if (all.length > 0) return all[0];
    return {
      id: `resume-${Date.now()}`,
      title: 'My Technical Resume',
      updatedAt: new Date().toISOString().split('T')[0],
      personalInfo: {
        fullName: 'Alex Morgan',
        email: 'alex.morgan@university.edu',
        phone: '+1 (555) 234-5678',
        location: 'San Francisco, CA',
        linkedinUrl: 'https://linkedin.com/in/alexmorgan',
        portfolioUrl: 'https://alexmorgan.dev',
        githubUrl: 'https://github.com/alexmorgandev'
      },
      targetRole: 'Junior Software Developer',
      professionalSummary: 'Proactive Computer Science undergraduate with hands-on experience building full-stack web applications and scalable REST APIs. Skilled in TypeScript, React, Python, and SQL.',
      skills: [
        { category: 'Languages', items: ['TypeScript', 'JavaScript', 'Python', 'SQL'] },
        { category: 'Frameworks & Tools', items: ['React', 'Node.js', 'Express', 'Git', 'Docker'] }
      ],
      experience: [],
      education: [],
      projects: [],
      certifications: [],
      languages: [{ language: 'English', proficiency: 'Native' }]
    };
  });

  const [activeTab, setActiveTab] = useState<'editor' | 'preview' | 'split'>('split');
  const [isImprovingSummary, setIsImprovingSummary] = useState(false);
  const [improvingBulletIndex, setImprovingBulletIndex] = useState<{ expIdx?: number; bulletIdx?: number } | null>(null);

  // Sync with URL ID or storage
  useEffect(() => {
    if (resumeId) {
      const found = StorageService.getResumeById(resumeId);
      if (found) setResume(found);
    }
  }, [resumeId]);

  const saveToStorage = (updated: ResumeProfile) => {
    setResume(updated);
    StorageService.saveResume(updated);
  };

  const handleManualSave = () => {
    StorageService.saveResume(resume);
    success('Resume Saved', 'Your changes have been saved to client storage.');
  };

  // --- Handlers for Personal Info ---
  const updatePersonalInfo = (field: keyof ResumeProfile['personalInfo'], val: string) => {
    const updated = {
      ...resume,
      personalInfo: { ...resume.personalInfo, [field]: val }
    };
    saveToStorage(updated);
  };

  // --- Handlers for AI Summary ---
  const handleGenerateSummary = async () => {
    setIsImprovingSummary(true);
    const topSkills = resume.skills.flatMap(s => s.items);
    const { summary, isAiGenerated } = await AIService.draftSummary(
      resume.targetRole || 'Software Developer',
      'Entry-Level / Student',
      topSkills
    );
    const updated = { ...resume, professionalSummary: summary };
    saveToStorage(updated);
    setIsImprovingSummary(false);
    success(
      'Summary Generated',
      `Applied tailored summary (${isAiGenerated ? 'Gemini AI' : 'Rule-Based Draft'}).`
    );
  };

  // --- Handlers for Experience ---
  const addExperience = () => {
    const newExp: ResumeExperience = {
      id: `exp-${Date.now()}`,
      company: 'Tech Company / Campus Lab',
      position: 'Software Engineering Intern',
      location: 'Remote / City, State',
      startDate: 'June 2023',
      endDate: 'August 2023',
      isCurrent: false,
      description: '',
      bullets: [
        'Engineered 4 reusable components, decreasing page load time by 25%.',
        'Collaborated with a cross-functional team of 6 engineers using Git and agile sprints.'
      ]
    };
    const updated = { ...resume, experience: [...resume.experience, newExp] };
    saveToStorage(updated);
  };

  const removeExperience = (index: number) => {
    const updated = {
      ...resume,
      experience: resume.experience.filter((_, i) => i !== index)
    };
    saveToStorage(updated);
  };

  const updateExperience = (index: number, field: keyof ResumeExperience, val: any) => {
    const copy = [...resume.experience];
    copy[index] = { ...copy[index], [field]: val };
    saveToStorage({ ...resume, experience: copy });
  };

  const addExperienceBullet = (expIndex: number) => {
    const copy = [...resume.experience];
    copy[expIndex].bullets.push('Accomplished [goal] as measured by [metric], by engineering [solution].');
    saveToStorage({ ...resume, experience: copy });
  };

  const updateExperienceBullet = (expIndex: number, bulletIndex: number, text: string) => {
    const copy = [...resume.experience];
    copy[expIndex].bullets[bulletIndex] = text;
    saveToStorage({ ...resume, experience: copy });
  };

  const removeExperienceBullet = (expIndex: number, bulletIndex: number) => {
    const copy = [...resume.experience];
    copy[expIndex].bullets = copy[expIndex].bullets.filter((_, i) => i !== bulletIndex);
    saveToStorage({ ...resume, experience: copy });
  };

  const improveBulletWithAi = async (expIndex: number, bulletIndex: number) => {
    const currentText = resume.experience[expIndex]?.bullets[bulletIndex] || '';
    if (!currentText.trim()) return;

    setImprovingBulletIndex({ expIdx: expIndex, bulletIdx: bulletIndex });
    const { improved, reason, isAiGenerated } = await AIService.improveBullet(
      currentText,
      resume.targetRole || 'Software Developer'
    );
    updateExperienceBullet(expIndex, bulletIndex, improved);
    setImprovingBulletIndex(null);
    success('Bullet Enhanced', `Reason: ${reason} (${isAiGenerated ? 'Gemini AI' : 'Rule-Based Pattern'}).`);
  };

  // --- Handlers for Education ---
  const addEducation = () => {
    const newEdu: ResumeEducation = {
      id: `edu-${Date.now()}`,
      institution: 'University / College',
      degree: 'Bachelor of Science in Computer Science',
      fieldOfStudy: 'Computer Science',
      startDate: '2021',
      endDate: '2025',
      isCurrent: true,
      gpa: '3.80 / 4.00',
      achievements: ['Relevant Coursework: Data Structures, Databases, Networks']
    };
    saveToStorage({ ...resume, education: [...resume.education, newEdu] });
  };

  const removeEducation = (index: number) => {
    saveToStorage({
      ...resume,
      education: resume.education.filter((_, i) => i !== index)
    });
  };

  const updateEducation = (index: number, field: keyof ResumeEducation, val: any) => {
    const copy = [...resume.education];
    copy[index] = { ...copy[index], [field]: val };
    saveToStorage({ ...resume, education: copy });
  };

  // --- Handlers for Projects ---
  const addProject = () => {
    const newProj: ResumeProject = {
      id: `proj-${Date.now()}`,
      title: 'Full Stack Web Platform',
      role: 'Lead Developer',
      technologies: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
      link: 'https://github.com/myname/project',
      bullets: [
        'Architected end-to-end web application with authentication and relational data models.',
        'Deployed containerized workload ensuring 99.9% uptime and responsive UI.'
      ]
    };
    saveToStorage({ ...resume, projects: [...resume.projects, newProj] });
  };

  const removeProject = (index: number) => {
    saveToStorage({
      ...resume,
      projects: resume.projects.filter((_, i) => i !== index)
    });
  };

  const updateProject = (index: number, field: keyof ResumeProject, val: any) => {
    const copy = [...resume.projects];
    copy[index] = { ...copy[index], [field]: val };
    saveToStorage({ ...resume, projects: copy });
  };

  // --- Handlers for Skills text ---
  const handleSkillsChange = (catIndex: number, text: string) => {
    const copy = [...resume.skills];
    copy[catIndex].items = text.split(',').map(s => s.trim()).filter(Boolean);
    saveToStorage({ ...resume, skills: copy });
  };

  // --- Print & Export Handlers ---
  const handlePrint = () => {
    // 1. Ensure latest resume state is committed to storage
    saveToStorage(resume);

    // 2. Trigger browser print directly from the user click event
    try {
      window.focus();
      window.print();
    } catch (err) {
      console.warn('[CareerPilot] Print invocation error:', err);
    }
  };

  const handleDownloadHtml = () => {
    const printContent = document.getElementById('ats-resume-print-area')?.innerHTML;
    if (!printContent) return;

    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${resume.personalInfo.fullName || 'Resume'} - ATS Resume</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; line-height: 1.45; color: #111; max-width: 800px; margin: 40px auto; padding: 0 20px; font-size: 13.5px; }
    h1 { font-size: 24px; text-transform: uppercase; margin-bottom: 4px; text-align: center; }
    .contact-info { text-align: center; font-size: 12px; margin-bottom: 20px; color: #444; }
    .contact-info a { color: #111; text-decoration: none; }
    h2 { font-size: 14px; text-transform: uppercase; border-bottom: 1.5px solid #222; padding-bottom: 2px; margin-top: 18px; margin-bottom: 8px; letter-spacing: 0.5px; }
    .entry-header { display: flex; justify-content: space-between; font-weight: bold; }
    .entry-sub { display: flex; justify-content: space-between; font-style: italic; font-size: 12.5px; margin-bottom: 4px; }
    ul { margin: 4px 0 12px 18px; padding: 0; }
    li { margin-bottom: 3px; }
  </style>
</head>
<body>
  ${printContent}
</body>
</html>`;

    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(resume.personalInfo.fullName || 'resume').toLowerCase().replace(/\s+/g, '-')}-ats.html`;
    a.click();
    URL.revokeObjectURL(url);
    success('Exported Clean HTML', 'Print-ready single-column ATS HTML generated.');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header & Actions */}
      <div className="no-print">
        <Breadcrumbs
          items={[
            { label: 'Resume Dashboard', href: '/resume' },
            { label: 'Resume Builder & Preview' }
          ]}
        />

        <div className="mt-4 bg-white rounded-3xl p-6 border border-[#D2B9E0] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={resume.title}
                onChange={e => saveToStorage({ ...resume, title: e.target.value })}
                className="text-xl sm:text-2xl font-extrabold text-[#370D48] bg-transparent border-b border-transparent hover:border-[#D2B9E0] focus:border-[#580F69] focus:outline-none"
              />
              <Badge variant="success" size="sm">ATS Verified</Badge>
            </div>
            <p className="text-xs text-[#240D2F]/70 mt-1">
              Target Role: <span className="font-semibold text-[#580F69]">{resume.targetRole}</span> • Single-column format standard
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-[#F7F5F8] p-1 rounded-xl border border-[#D2B9E0]">
              <button
                onClick={() => setActiveTab('editor')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all min-h-[36px] ${
                  activeTab === 'editor' ? 'bg-[#580F69] text-white' : 'text-[#370D48]'
                }`}
              >
                Editor
              </button>
              <button
                onClick={() => setActiveTab('split')}
                className={`hidden lg:block px-3 py-1.5 rounded-lg text-xs font-bold transition-all min-h-[36px] ${
                  activeTab === 'split' ? 'bg-[#580F69] text-white' : 'text-[#370D48]'
                }`}
              >
                Side-by-Side
              </button>
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all min-h-[36px] ${
                  activeTab === 'preview' ? 'bg-[#580F69] text-white' : 'text-[#370D48]'
                }`}
              >
                Live Preview
              </button>
            </div>

            <button
              onClick={handleManualSave}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#D2B9E0] text-[#370D48] text-xs font-bold hover:bg-[#D2B9E0]/20 min-h-[40px]"
            >
              <Save className="w-4 h-4 text-[#580F69]" />
              <span>Save</span>
            </button>

            <button
              onClick={handlePrint}
              type="button"
              aria-label="Print resume or save as PDF"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#580F69] text-white text-xs font-bold hover:bg-[#370D48] shadow-xs min-h-[40px] cursor-pointer transition-colors"
            >
              <Printer className="w-4 h-4" aria-hidden="true" />
              <span>Print / PDF</span>
            </button>

            <button
              onClick={handleDownloadHtml}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#580F69] text-[#580F69] text-xs font-bold hover:bg-[#580F69]/10 min-h-[40px]"
            >
              <Download className="w-4 h-4" />
              <span>HTML File</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start print:block print:w-full print:p-0 print:m-0">
        {/* LEFT COLUMN: EDITABLE FORMS */}
        <div
          className={`space-y-6 ${
            activeTab === 'preview' ? 'hidden' : activeTab === 'split' ? 'lg:col-span-6' : 'lg:col-span-12'
          } no-print print:hidden`}
        >
          {/* 1. Target Role & Personal Info Card */}
          <div className="bg-white rounded-3xl p-6 border border-[#D2B9E0] space-y-4 shadow-xs">
            <h2 className="text-base font-bold text-[#370D48] flex items-center justify-between border-b border-[#F7F5F8] pb-3">
              <span>1. Contact & Target Role</span>
              <span className="text-xs text-[#580F69] font-semibold">ATS Core Header</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#370D48] mb-1">Full Name *</label>
                <input
                  type="text"
                  value={resume.personalInfo.fullName}
                  onChange={e => updatePersonalInfo('fullName', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#F7F5F8] border border-[#D2B9E0] text-sm text-[#370D48] focus:bg-white focus:border-[#580F69] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#370D48] mb-1">Target Role Title *</label>
                <input
                  type="text"
                  value={resume.targetRole}
                  onChange={e => saveToStorage({ ...resume, targetRole: e.target.value })}
                  placeholder="e.g. Junior Full-Stack Developer"
                  className="w-full px-3 py-2 rounded-xl bg-[#F7F5F8] border border-[#D2B9E0] text-sm text-[#370D48] focus:bg-white focus:border-[#580F69] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#370D48] mb-1">Email Address *</label>
                <input
                  type="email"
                  value={resume.personalInfo.email}
                  onChange={e => updatePersonalInfo('email', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#F7F5F8] border border-[#D2B9E0] text-sm text-[#370D48] focus:bg-white focus:border-[#580F69] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#370D48] mb-1">Phone Number</label>
                <input
                  type="text"
                  value={resume.personalInfo.phone}
                  onChange={e => updatePersonalInfo('phone', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#F7F5F8] border border-[#D2B9E0] text-sm text-[#370D48] focus:bg-white focus:border-[#580F69] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#370D48] mb-1">Location (City, State / Remote)</label>
                <input
                  type="text"
                  value={resume.personalInfo.location}
                  onChange={e => updatePersonalInfo('location', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#F7F5F8] border border-[#D2B9E0] text-sm text-[#370D48] focus:bg-white focus:border-[#580F69] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#370D48] mb-1">LinkedIn URL</label>
                <input
                  type="text"
                  value={resume.personalInfo.linkedinUrl}
                  onChange={e => updatePersonalInfo('linkedinUrl', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#F7F5F8] border border-[#D2B9E0] text-sm text-[#370D48] focus:bg-white focus:border-[#580F69] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#370D48] mb-1">GitHub / Code Repository URL</label>
                <input
                  type="text"
                  value={resume.personalInfo.githubUrl}
                  onChange={e => updatePersonalInfo('githubUrl', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#F7F5F8] border border-[#D2B9E0] text-sm text-[#370D48] focus:bg-white focus:border-[#580F69] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#370D48] mb-1">Portfolio Website</label>
                <input
                  type="text"
                  value={resume.personalInfo.portfolioUrl}
                  onChange={e => updatePersonalInfo('portfolioUrl', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#F7F5F8] border border-[#D2B9E0] text-sm text-[#370D48] focus:bg-white focus:border-[#580F69] focus:outline-none"
                />
              </div>

              <div className="pt-2 sm:col-span-2 border-t border-[#F7F5F8]">
                <label className="flex items-center gap-2.5 cursor-pointer text-xs text-[#370D48] font-semibold">
                  <input
                    type="checkbox"
                    checked={Boolean(resume.includePhoto ?? false)}
                    onChange={e => saveToStorage({ ...resume, includePhoto: e.target.checked })}
                    className="w-4 h-4 rounded text-[#580F69] focus:ring-[#580F69]"
                  />
                  <span>Include Candidate Profile Photo on this resume (Note: standard US ATS resumes recommend excluding photos to prevent bias)</span>
                </label>
              </div>
            </div>
          </div>

          {/* 2. Professional Summary with AI drafter */}
          <div className="bg-white rounded-3xl p-6 border border-[#D2B9E0] space-y-3 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#F7F5F8] pb-3">
              <h2 className="text-base font-bold text-[#370D48]">2. Professional Summary</h2>
              <button
                type="button"
                onClick={handleGenerateSummary}
                disabled={isImprovingSummary}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#580F69]/10 hover:bg-[#580F69]/20 text-[#580F69] text-xs font-bold transition-all disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isImprovingSummary ? 'Drafting...' : 'AI Summary Drafter'}</span>
              </button>
            </div>
            <textarea
              rows={4}
              value={resume.professionalSummary}
              onChange={e => saveToStorage({ ...resume, professionalSummary: e.target.value })}
              placeholder="Concise 3-4 sentence summary highlighting your technical strengths and achievements..."
              className="w-full p-3.5 rounded-xl bg-[#F7F5F8] border border-[#D2B9E0] text-sm text-[#370D48] focus:bg-white focus:border-[#580F69] focus:outline-none"
            />
          </div>

          {/* 3. Skills Categories */}
          <div className="bg-white rounded-3xl p-6 border border-[#D2B9E0] space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#F7F5F8] pb-3">
              <h2 className="text-base font-bold text-[#370D48]">3. Technical Skills</h2>
              <span className="text-xs text-[#240D2F]/70">Comma-separated</span>
            </div>

            {resume.skills.map((cat, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-[#F7F5F8] border border-[#D2B9E0]/60 space-y-2">
                <input
                  type="text"
                  value={cat.category}
                  onChange={e => {
                    const copy = [...resume.skills];
                    copy[idx].category = e.target.value;
                    saveToStorage({ ...resume, skills: copy });
                  }}
                  className="font-bold text-xs text-[#370D48] bg-transparent border-b border-transparent focus:border-[#580F69] focus:outline-none"
                />
                <input
                  type="text"
                  value={cat.items.join(', ')}
                  onChange={e => handleSkillsChange(idx, e.target.value)}
                  placeholder="e.g. React, TypeScript, Python, Docker"
                  className="w-full px-3 py-2 rounded-lg bg-white border border-[#D2B9E0] text-xs text-[#370D48] focus:border-[#580F69] focus:outline-none"
                />
              </div>
            ))}
          </div>

          {/* 4. Work Experience & Internships */}
          <div className="bg-white rounded-3xl p-6 border border-[#D2B9E0] space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#F7F5F8] pb-3">
              <h2 className="text-base font-bold text-[#370D48]">4. Experience & Internships</h2>
              <button
                type="button"
                onClick={addExperience}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#580F69] hover:underline"
              >
                <Plus className="w-4 h-4" />
                <span>Add Position</span>
              </button>
            </div>

            {resume.experience.length === 0 ? (
              <p className="text-xs text-[#240D2F]/70 italic">No experience entries added yet.</p>
            ) : (
              resume.experience.map((exp, eIdx) => (
                <div key={exp.id} className="p-4 rounded-2xl bg-[#F7F5F8] border border-[#D2B9E0] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#580F69]">Role #{eIdx + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeExperience(eIdx)}
                      className="text-red-600 hover:text-red-800 p-1"
                      aria-label="Remove role"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Job Title / Position"
                      value={exp.position}
                      onChange={e => updateExperience(eIdx, 'position', e.target.value)}
                      className="px-3 py-2 rounded-xl bg-white border border-[#D2B9E0] text-xs text-[#370D48] font-semibold"
                    />
                    <input
                      type="text"
                      placeholder="Company Name"
                      value={exp.company}
                      onChange={e => updateExperience(eIdx, 'company', e.target.value)}
                      className="px-3 py-2 rounded-xl bg-white border border-[#D2B9E0] text-xs text-[#370D48]"
                    />
                    <input
                      type="text"
                      placeholder="Start Date (e.g. May 2023)"
                      value={exp.startDate}
                      onChange={e => updateExperience(eIdx, 'startDate', e.target.value)}
                      className="px-3 py-2 rounded-xl bg-white border border-[#D2B9E0] text-xs text-[#370D48]"
                    />
                    <input
                      type="text"
                      placeholder="End Date (e.g. Aug 2023 or Present)"
                      value={exp.endDate}
                      onChange={e => updateExperience(eIdx, 'endDate', e.target.value)}
                      className="px-3 py-2 rounded-xl bg-white border border-[#D2B9E0] text-xs text-[#370D48]"
                    />
                  </div>

                  {/* Bullet points */}
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between text-xs font-bold text-[#370D48]">
                      <span>Accomplishment Bullets:</span>
                      <button
                        type="button"
                        onClick={() => addExperienceBullet(eIdx)}
                        className="text-[#580F69] hover:underline flex items-center gap-1 font-semibold text-[11px]"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Bullet
                      </button>
                    </div>

                    {exp.bullets.map((b, bIdx) => {
                      const isImproving =
                        improvingBulletIndex?.expIdx === eIdx && improvingBulletIndex?.bulletIdx === bIdx;

                      return (
                        <div key={bIdx} className="flex items-start gap-2">
                          <textarea
                            rows={2}
                            value={b}
                            onChange={e => updateExperienceBullet(eIdx, bIdx, e.target.value)}
                            className="flex-1 p-2 rounded-lg bg-white border border-[#D2B9E0] text-xs text-[#370D48]"
                          />
                          <button
                            type="button"
                            onClick={() => improveBulletWithAi(eIdx, bIdx)}
                            disabled={isImproving}
                            title="Enhance with Action Verb + Measurable Metric"
                            className="p-2 rounded-lg bg-[#580F69]/10 text-[#580F69] hover:bg-[#580F69]/20 transition-colors disabled:opacity-50"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeExperienceBullet(eIdx, bIdx)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            aria-label="Delete bullet"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 5. Projects Section */}
          <div className="bg-white rounded-3xl p-6 border border-[#D2B9E0] space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#F7F5F8] pb-3">
              <h2 className="text-base font-bold text-[#370D48]">5. Technical Projects</h2>
              <button
                type="button"
                onClick={addProject}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#580F69] hover:underline"
              >
                <Plus className="w-4 h-4" />
                <span>Add Project</span>
              </button>
            </div>

            {resume.projects.map((proj, pIdx) => (
              <div key={proj.id} className="p-4 rounded-2xl bg-[#F7F5F8] border border-[#D2B9E0] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#580F69]">Project #{pIdx + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeProject(pIdx)}
                    className="text-red-600 hover:text-red-800 p-1"
                    aria-label="Remove project"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Project Title"
                    value={proj.title}
                    onChange={e => updateProject(pIdx, 'title', e.target.value)}
                    className="px-3 py-2 rounded-xl bg-white border border-[#D2B9E0] text-xs text-[#370D48] font-semibold"
                  />
                  <input
                    type="text"
                    placeholder="Technologies (comma-separated)"
                    value={proj.technologies.join(', ')}
                    onChange={e =>
                      updateProject(
                        pIdx,
                        'technologies',
                        e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                      )
                    }
                    className="px-3 py-2 rounded-xl bg-white border border-[#D2B9E0] text-xs text-[#370D48]"
                  />
                  <input
                    type="text"
                    placeholder="Project Link / GitHub Repo"
                    value={proj.link || ''}
                    onChange={e => updateProject(pIdx, 'link', e.target.value)}
                    className="px-3 py-2 rounded-xl bg-white border border-[#D2B9E0] text-xs text-[#370D48] sm:col-span-2"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-[#370D48]">Description / Bullets:</label>
                  {proj.bullets.map((b, bIdx) => (
                    <textarea
                      key={bIdx}
                      rows={2}
                      value={b}
                      onChange={e => {
                        const copy = [...resume.projects];
                        copy[pIdx].bullets[bIdx] = e.target.value;
                        saveToStorage({ ...resume, projects: copy });
                      }}
                      className="w-full p-2 rounded-lg bg-white border border-[#D2B9E0] text-xs text-[#370D48]"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* 6. Education Section */}
          <div className="bg-white rounded-3xl p-6 border border-[#D2B9E0] space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#F7F5F8] pb-3">
              <h2 className="text-base font-bold text-[#370D48]">6. Education</h2>
              <button
                type="button"
                onClick={addEducation}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#580F69] hover:underline"
              >
                <Plus className="w-4 h-4" />
                <span>Add Degree</span>
              </button>
            </div>

            {resume.education.map((edu, edIdx) => (
              <div key={edu.id} className="p-4 rounded-2xl bg-[#F7F5F8] border border-[#D2B9E0] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#580F69]">Education #{edIdx + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeEducation(edIdx)}
                    className="text-red-600 hover:text-red-800 p-1"
                    aria-label="Remove education"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Institution / University"
                    value={edu.institution}
                    onChange={e => updateEducation(edIdx, 'institution', e.target.value)}
                    className="px-3 py-2 rounded-xl bg-white border border-[#D2B9E0] text-xs text-[#370D48] font-semibold"
                  />
                  <input
                    type="text"
                    placeholder="Degree & Major"
                    value={edu.degree}
                    onChange={e => updateEducation(edIdx, 'degree', e.target.value)}
                    className="px-3 py-2 rounded-xl bg-white border border-[#D2B9E0] text-xs text-[#370D48]"
                  />
                  <input
                    type="text"
                    placeholder="Graduation Date / Expected"
                    value={edu.endDate}
                    onChange={e => updateEducation(edIdx, 'endDate', e.target.value)}
                    className="px-3 py-2 rounded-xl bg-white border border-[#D2B9E0] text-xs text-[#370D48]"
                  />
                  <input
                    type="text"
                    placeholder="GPA (optional)"
                    value={edu.gpa || ''}
                    onChange={e => updateEducation(edIdx, 'gpa', e.target.value)}
                    className="px-3 py-2 rounded-xl bg-white border border-[#D2B9E0] text-xs text-[#370D48]"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: LIVE ATS PREVIEW */}
        <div
          className={`resume-print-column ${
            activeTab === 'editor' ? 'hidden print:block' : activeTab === 'split' ? 'lg:col-span-6' : 'lg:col-span-12'
          } sticky top-24 print:static print:w-full print:block print:p-0 print:m-0`}
        >
          <div className="resume-print-card bg-white rounded-3xl border-2 border-[#580F69] p-2 sm:p-4 shadow-xl print:border-none print:shadow-none print:p-0 print:m-0 print:rounded-none">
            <div className="px-4 py-2 border-b border-[#F7F5F8] flex items-center justify-between no-print print:hidden">
              <span className="text-xs font-bold text-[#580F69] uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Live ATS Single-Column Preview</span>
              </span>
              <span className="text-[11px] text-[#240D2F]/60">Standard A4 / US Letter Proportion</span>
            </div>

            {/* ATS Paper Sheet View */}
            <div
              id="ats-resume-print-area"
              className="resume-sheet bg-white p-6 sm:p-10 font-sans text-neutral-900 leading-relaxed max-w-full overflow-hidden text-[12px] sm:text-[13px] print:p-0 print:overflow-visible print:max-w-none print:w-full"
            >
              {/* Header */}
              <div className="text-center pb-4 border-b border-neutral-300">
                {resume.includePhoto && (resume.photoUrl || StorageService.getProfile().avatarUrl) && (
                  <div className="flex justify-center mb-3">
                    <img
                      src={resume.photoUrl || StorageService.getProfile().avatarUrl}
                      alt={`${resume.personalInfo.fullName || 'Candidate'} photo`}
                      className="w-20 h-20 rounded-full object-cover border-2 border-neutral-300"
                    />
                  </div>
                )}
                <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-wide text-neutral-950 m-0">
                  {resume.personalInfo.fullName || 'Candidate Name'}
                </h1>
                <div className="text-xs text-neutral-700 mt-1.5 flex items-center justify-center flex-wrap gap-2">
                  {resume.personalInfo.location && <span>{resume.personalInfo.location}</span>}
                  {resume.personalInfo.phone && <span>• {resume.personalInfo.phone}</span>}
                  {resume.personalInfo.email && (
                    <span>• <a href={`mailto:${resume.personalInfo.email}`} className="text-neutral-900 hover:underline">{resume.personalInfo.email}</a></span>
                  )}
                  {resume.personalInfo.linkedinUrl && (
                    <span>• <a href={resume.personalInfo.linkedinUrl} className="text-neutral-900 hover:underline">LinkedIn</a></span>
                  )}
                  {resume.personalInfo.githubUrl && (
                    <span>• <a href={resume.personalInfo.githubUrl} className="text-neutral-900 hover:underline">GitHub</a></span>
                  )}
                </div>
              </div>

              {/* Summary */}
              {resume.professionalSummary && (
                <div className="mt-4">
                  <h2 className="text-xs font-extrabold uppercase tracking-wider text-neutral-950 border-b border-neutral-900 pb-0.5 mb-1.5">
                    Professional Summary
                  </h2>
                  <p className="text-neutral-800 text-justify leading-normal">
                    {resume.professionalSummary}
                  </p>
                </div>
              )}

              {/* Technical Skills */}
              {resume.skills && resume.skills.length > 0 && (
                <div className="mt-4">
                  <h2 className="text-xs font-extrabold uppercase tracking-wider text-neutral-950 border-b border-neutral-900 pb-0.5 mb-1.5">
                    Technical Skills
                  </h2>
                  <div className="space-y-1">
                    {resume.skills.map((cat, i) => (
                      <div key={i} className="leading-snug">
                        <strong className="text-neutral-900">{cat.category}: </strong>
                        <span className="text-neutral-800">{cat.items.join(', ')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Experience */}
              {resume.experience && resume.experience.length > 0 && (
                <div className="mt-4">
                  <h2 className="text-xs font-extrabold uppercase tracking-wider text-neutral-950 border-b border-neutral-900 pb-0.5 mb-1.5">
                    Work Experience & Internships
                  </h2>
                  <div className="space-y-3">
                    {resume.experience.map((exp, i) => (
                      <div key={i} className="resume-entry-block">
                        <div className="flex justify-between items-baseline font-bold text-neutral-950">
                          <span>{exp.position}</span>
                          <span className="text-xs font-normal text-neutral-700">{exp.startDate} – {exp.endDate}</span>
                        </div>
                        <div className="flex justify-between items-baseline italic text-xs text-neutral-800 mb-1">
                          <span>{exp.company}</span>
                          <span>{exp.location}</span>
                        </div>
                        <ul className="list-disc ml-5 space-y-1 text-neutral-800">
                          {exp.bullets.map((b, bIdx) => (
                            <li key={bIdx}>{b}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects */}
              {resume.projects && resume.projects.length > 0 && (
                <div className="mt-4">
                  <h2 className="text-xs font-extrabold uppercase tracking-wider text-neutral-950 border-b border-neutral-900 pb-0.5 mb-1.5">
                    Technical Projects
                  </h2>
                  <div className="space-y-3">
                    {resume.projects.map((proj, i) => (
                      <div key={i} className="resume-entry-block">
                        <div className="flex justify-between items-baseline font-bold text-neutral-950">
                          <span>{proj.title} {proj.role && <span className="font-normal text-xs text-neutral-700">| {proj.role}</span>}</span>
                          {proj.link && (
                            <span className="text-xs font-normal text-neutral-700">{proj.link.replace(/^https?:\/\//, '')}</span>
                          )}
                        </div>
                        {proj.technologies && proj.technologies.length > 0 && (
                          <div className="text-[11.5px] italic text-neutral-700 mb-1">
                            Technologies: {proj.technologies.join(', ')}
                          </div>
                        )}
                        <ul className="list-disc ml-5 space-y-1 text-neutral-800">
                          {proj.bullets.map((b, bIdx) => (
                            <li key={bIdx}>{b}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {resume.education && resume.education.length > 0 && (
                <div className="mt-4">
                  <h2 className="text-xs font-extrabold uppercase tracking-wider text-neutral-950 border-b border-neutral-900 pb-0.5 mb-1.5">
                    Education
                  </h2>
                  <div className="space-y-2">
                    {resume.education.map((edu, i) => (
                      <div key={i} className="resume-entry-block">
                        <div className="flex justify-between items-baseline font-bold text-neutral-950">
                          <span>{edu.institution}</span>
                          <span className="text-xs font-normal text-neutral-700">{edu.endDate}</span>
                        </div>
                        <div className="flex justify-between items-baseline text-neutral-800">
                          <span>{edu.degree}</span>
                          {edu.gpa && <span className="text-xs font-medium">GPA: {edu.gpa}</span>}
                        </div>
                        {edu.achievements && edu.achievements.length > 0 && (
                          <ul className="list-disc ml-5 text-[11.5px] text-neutral-700 mt-1">
                            {edu.achievements.map((ach, aIdx) => (
                              <li key={aIdx}>{ach}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

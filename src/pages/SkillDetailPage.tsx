import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Award,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  BookOpen,
  Code2,
  FolderGit2,
  Plus,
  Trash2,
  Map,
  ChevronLeft
} from 'lucide-react';
import { StorageService, STORAGE_EVENT } from '../services/storage';
import { Skill, SkillProficiency } from '../types';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { Badge } from '../components/common/Badge';
import { useToast } from '../context/ToastContext';

export const SkillDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success } = useToast();

  const [skill, setSkill] = useState<Skill | undefined>(id ? StorageService.getSkillById(id) : undefined);
  const [completedTasks, setCompletedTasks] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (id) {
      setSkill(StorageService.getSkillById(id));
    }
  }, [id]);

  useEffect(() => {
    const handleUpdate = () => {
      if (id) {
        setSkill(StorageService.getSkillById(id));
      }
    };
    window.addEventListener(STORAGE_EVENT, handleUpdate);
    return () => window.removeEventListener(STORAGE_EVENT, handleUpdate);
  }, [id]);

  if (!skill) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-100 text-red-700 mx-auto flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-bold text-[#370D48]">Skill Not Found</h1>
        <p className="text-sm text-[#240D2F]/75 mt-2">
          The skill identifier "{id}" does not exist in our catalog.
        </p>
        <div className="mt-6">
          <Link
            to="/skills"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#580F69] text-white font-semibold text-sm hover:bg-[#370D48]"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Return to Skills Dashboard</span>
          </Link>
        </div>
      </div>
    );
  }

  const handleProficiencyUpdate = (level: SkillProficiency) => {
    StorageService.updateSkillProficiency(skill.id, level);
    success('Proficiency Updated', `"${skill.name}" is now set to ${level}.`);
  };

  const handleToggleSave = () => {
    if (skill.isSaved) {
      StorageService.deleteSkill(skill.id);
      success('Removed from Toolkit', `"${skill.name}" removed from your active skills.`);
    } else {
      StorageService.saveSkill({
        ...skill,
        proficiency: skill.proficiency || 'Beginner',
        isSaved: true
      });
      success('Added to Toolkit', `"${skill.name}" added to your saved skills.`);
    }
  };

  const handleAddToRoadmap = () => {
    // Navigate to roadmap planner with this skill
    navigate(`/roadmap?skill=${encodeURIComponent(skill.name)}`);
  };

  const toggleTask = (idx: number) => {
    setCompletedTasks(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Skills Assessment', href: '/skills' },
          { label: skill.name }
        ]}
      />

      {/* Main Skill Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border-2 border-[#D2B9E0] shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[#F7F5F8]">
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="primary">{skill.category}</Badge>
              {skill.isSaved && (
                <Badge variant="success">Saved in Toolkit</Badge>
              )}
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#370D48] tracking-tight">
              {skill.name}
            </h1>
            <p className="text-sm sm:text-base text-[#240D2F]/80 max-w-2xl leading-relaxed">
              {skill.description}
            </p>
            <p className="text-xs text-[#580F69] font-semibold">
              Industry Relevance: {skill.relevance}
            </p>
          </div>

          {/* Action Panel */}
          <div className="bg-[#F7F5F8] p-5 rounded-2xl border border-[#D2B9E0] shrink-0 w-full lg:w-72 space-y-3">
            <div>
              <label htmlFor="skill-prof-status" className="block text-xs font-bold text-[#370D48] mb-1.5">
                Current Proficiency:
              </label>
              <select
                id="skill-prof-status"
                value={skill.proficiency || 'Beginner'}
                onChange={e => handleProficiencyUpdate(e.target.value as SkillProficiency)}
                disabled={!skill.isSaved}
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#D2B9E0] text-sm text-[#370D48] font-semibold focus:outline-none focus:border-[#580F69] disabled:opacity-60 min-h-[44px]"
              >
                <option value="Beginner">Beginner Level</option>
                <option value="Intermediate">Intermediate Level</option>
                <option value="Advanced">Advanced Level</option>
              </select>
            </div>

            <button
              onClick={handleToggleSave}
              className={`w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all min-h-[44px] ${
                skill.isSaved
                  ? 'bg-white border border-red-300 text-red-700 hover:bg-red-50'
                  : 'bg-[#580F69] text-white hover:bg-[#370D48] shadow-sm'
              }`}
            >
              {skill.isSaved ? (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Remove from Toolkit</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Add to My Skills</span>
                </>
              )}
            </button>

            <button
              onClick={handleAddToRoadmap}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white border border-[#D2B9E0] text-[#370D48] hover:bg-[#D2B9E0]/20 text-xs font-bold transition-all min-h-[44px]"
            >
              <Map className="w-4 h-4 text-[#580F69]" />
              <span>Add to Roadmap Plan</span>
            </button>

            {skill.isSaved && (
              <div className="pt-2 border-t border-[#D2B9E0]/60 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#240D2F]/70 font-semibold">Practiced:</span>
                  <span className="font-extrabold text-[#580F69]">
                    {skill.practiceHours || 0} hrs • {skill.practiceCount || 0} sessions
                  </span>
                </div>
                <button
                  onClick={() => {
                    StorageService.logSkillPractice(skill.id, 1);
                    setSkill(StorageService.getSkillById(skill.id));
                    success('Practice Recorded!', `Added +1 hr practice session for ${skill.name}.`);
                  }}
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-purple-50 hover:bg-purple-100 border border-[#D2B9E0] text-[#580F69] text-xs font-bold transition-all min-h-[40px]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log 1-Hour Practice</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Prerequisites */}
        {skill.prerequisites && skill.prerequisites.length > 0 && (
          <div className="mt-6 pt-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#370D48] mb-2">
              Recommended Prerequisites
            </h2>
            <div className="flex flex-wrap gap-2">
              {skill.prerequisites.map((req, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-lg bg-[#D2B9E0]/30 border border-[#D2B9E0] text-[#370D48] text-xs font-medium"
                >
                  {req}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Learning Resources & Practice Tasks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Curated Resources */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#D2B9E0]">
          <h2 className="text-xl font-bold text-[#370D48] mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#580F69]" aria-hidden="true" />
            <span>Curated Learning Resources</span>
          </h2>
          <div className="space-y-3">
            {skill.learningResources.map((res, idx) => (
              <a
                key={idx}
                href={res.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 rounded-xl bg-[#F7F5F8] border border-[#D2B9E0]/60 hover:border-[#580F69] hover:bg-white transition-all flex items-start justify-between gap-3 block group"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-[#580F69] uppercase tracking-wide">
                      {res.type}
                    </span>
                    {res.free && (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-semibold">
                        Free
                      </span>
                    )}
                  </div>
                  <div className="font-bold text-sm text-[#370D48] group-hover:text-[#580F69] mt-0.5">
                    {res.title}
                  </div>
                  <div className="text-xs text-[#240D2F]/70 mt-0.5">Provider: {res.provider}</div>
                </div>
                <ExternalLink className="w-4 h-4 text-[#A375A1] group-hover:text-[#580F69] shrink-0 mt-1" aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>

        {/* Practice Tasks */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#D2B9E0]">
          <h2 className="text-xl font-bold text-[#370D48] mb-4 flex items-center gap-2">
            <Code2 className="w-5 h-5 text-[#580F69]" aria-hidden="true" />
            <span>Hands-on Practice Tasks</span>
          </h2>
          <div className="space-y-3">
            {skill.practiceTasks.map((task, idx) => {
              const isChecked = Boolean(completedTasks[idx]);
              return (
                <div
                  key={idx}
                  onClick={() => toggleTask(idx)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                    isChecked
                      ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                      : 'bg-[#F7F5F8] border-[#D2B9E0]/60 hover:border-[#580F69] text-[#240D2F]'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleTask(idx)}
                    className="w-4 h-4 rounded text-[#580F69] focus:ring-[#580F69] mt-0.5 shrink-0"
                    aria-label={`Mark task completed: ${task}`}
                  />
                  <span className={`text-xs sm:text-sm leading-relaxed ${isChecked ? 'line-through text-emerald-900/70' : ''}`}>
                    {task}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Suggested Projects */}
      {skill.suggestedProjects && skill.suggestedProjects.length > 0 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#D2B9E0]">
          <h2 className="text-xl font-bold text-[#370D48] mb-4 flex items-center gap-2">
            <FolderGit2 className="w-5 h-5 text-[#580F69]" aria-hidden="true" />
            <span>Recommended Portfolio Projects</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {skill.suggestedProjects.map((proj, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-[#F7F5F8] border border-[#D2B9E0] space-y-2"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base text-[#370D48]">{proj.title}</h3>
                  <Badge variant="primary" size="sm">
                    {proj.difficulty}
                  </Badge>
                </div>
                <p className="text-xs sm:text-sm text-[#240D2F]/80 leading-relaxed">
                  {proj.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

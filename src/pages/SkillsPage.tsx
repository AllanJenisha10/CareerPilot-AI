import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Award,
  Search,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  BookOpen,
  Filter,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { StorageService, STORAGE_EVENT } from '../services/storage';
import { Skill, SkillCategory, SkillProficiency } from '../types';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { ProgressBar } from '../components/common/ProgressBar';
import { EmptyState } from '../components/common/EmptyState';
import { useToast } from '../context/ToastContext';

export const SkillsPage: React.FC = () => {
  const { success, error } = useToast();
  const [skills, setSkills] = useState<Skill[]>(StorageService.getSkills());
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeTab, setActiveTab] = useState<'saved' | 'all' | 'recommended'>('saved');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [skillToDelete, setSkillToDelete] = useState<Skill | null>(null);

  // Form State for Adding / Editing Skill
  const [formSkillId, setFormSkillId] = useState('');
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<SkillCategory>('Programming Languages');
  const [formProficiency, setFormProficiency] = useState<SkillProficiency>('Beginner');
  const [formDescription, setFormDescription] = useState('');

  useEffect(() => {
    const handleUpdate = () => {
      setSkills(StorageService.getSkills());
    };
    window.addEventListener(STORAGE_EVENT, handleUpdate);
    return () => window.removeEventListener(STORAGE_EVENT, handleUpdate);
  }, []);

  const savedSkills = useMemo(() => skills.filter(s => s.isSaved), [skills]);
  const unsavedSkills = useMemo(() => skills.filter(s => !s.isSaved), [skills]);

  const categories: string[] = [
    'All',
    'Programming Languages',
    'Frontend',
    'Backend',
    'Data & AI',
    'Cloud & DevOps',
    'Design',
    'Cybersecurity',
    'Tools & Frameworks'
  ];

  // Filter skills based on active tab, category, and search
  const displayedSkills = useMemo(() => {
    let source = activeTab === 'saved' ? savedSkills : activeTab === 'recommended' ? unsavedSkills : skills;

    return source.filter(s => {
      if (search.trim()) {
        const q = search.toLowerCase();
        if (!s.name.toLowerCase().includes(q) && !s.description.toLowerCase().includes(q)) {
          return false;
        }
      }
      if (selectedCategory !== 'All' && s.category !== selectedCategory) {
        return false;
      }
      return true;
    });
  }, [activeTab, savedSkills, unsavedSkills, skills, search, selectedCategory]);

  const openAddModal = (existing?: Skill) => {
    if (existing) {
      setFormSkillId(existing.id);
      setFormName(existing.name);
      setFormCategory(existing.category);
      setFormProficiency(existing.proficiency || 'Beginner');
      setFormDescription(existing.description);
    } else {
      setFormSkillId('');
      setFormName('');
      setFormCategory('Programming Languages');
      setFormProficiency('Beginner');
      setFormDescription('');
    }
    setIsAddModalOpen(true);
  };

  const handleSaveSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      error('Skill Name Required', 'Please provide a valid name for your technical skill.');
      return;
    }

    const id = formSkillId || formName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
    StorageService.saveSkill({
      id,
      name: formName.trim(),
      category: formCategory,
      proficiency: formProficiency,
      description: formDescription.trim() || `Technical proficiency in ${formName.trim()}`,
      isSaved: true
    });

    success(
      formSkillId ? 'Skill Updated' : 'Skill Added',
      `"${formName.trim()}" is now saved with ${formProficiency} proficiency.`
    );
    setIsAddModalOpen(false);
  };

  const confirmDelete = (skill: Skill) => {
    setSkillToDelete(skill);
    setIsDeleteModalOpen(true);
  };

  const executeDelete = () => {
    if (skillToDelete) {
      StorageService.deleteSkill(skillToDelete.id);
      success('Skill Removed', `"${skillToDelete.name}" was removed from your active skills.`);
      setIsDeleteModalOpen(false);
      setSkillToDelete(null);
    }
  };

  const handleQuickProficiencyChange = (skillId: string, level: SkillProficiency) => {
    StorageService.updateSkillProficiency(skillId, level);
    success('Proficiency Updated', `Set to ${level}.`);
  };

  // Metrics
  const beginnerCount = savedSkills.filter(s => s.proficiency === 'Beginner').length;
  const intermediateCount = savedSkills.filter(s => s.proficiency === 'Intermediate').length;
  const advancedCount = savedSkills.filter(s => s.proficiency === 'Advanced').length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#D2B9E0] shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#580F69]/10 text-[#580F69] text-xs font-bold mb-3">
              <Award className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Competency Inventory</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#370D48] tracking-tight">
              Skills Assessment & Growth
            </h1>
            <p className="text-sm sm:text-base text-[#240D2F]/80 mt-2 leading-relaxed">
              Track your validated technical capabilities, adjust proficiency levels, uncover missing prerequisites, and link skills directly to career pathways.
            </p>
          </div>

          <button
            onClick={() => openAddModal()}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#580F69] hover:bg-[#370D48] text-white font-bold text-sm shadow-md transition-all shrink-0 min-h-[44px]"
          >
            <Plus className="w-5 h-5" aria-hidden="true" />
            <span>Add New Skill</span>
          </button>
        </div>

        {/* Skill Statistics Bar */}
        <div className="mt-8 pt-6 border-t border-[#F7F5F8] grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-[#F7F5F8] p-4 rounded-2xl border border-[#D2B9E0]/60">
            <div className="text-xs text-[#240D2F]/70">Total Saved Skills</div>
            <div className="text-2xl font-extrabold text-[#370D48] mt-1">{savedSkills.length}</div>
          </div>
          <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200">
            <div className="text-xs text-emerald-900 font-medium">Advanced</div>
            <div className="text-2xl font-extrabold text-emerald-800 mt-1">{advancedCount}</div>
          </div>
          <div className="bg-purple-50/70 p-4 rounded-2xl border border-[#D2B9E0]">
            <div className="text-xs text-[#580F69] font-medium">Intermediate</div>
            <div className="text-2xl font-extrabold text-[#580F69] mt-1">{intermediateCount}</div>
          </div>
          <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200">
            <div className="text-xs text-amber-950 font-medium">Beginner</div>
            <div className="text-2xl font-extrabold text-amber-900 mt-1">{beginnerCount}</div>
          </div>
        </div>
      </div>

      {/* Tabs and Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Navigation Tabs */}
        <div className="flex items-center bg-white p-1 rounded-2xl border border-[#D2B9E0] shadow-xs">
          <button
            onClick={() => setActiveTab('saved')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all min-h-[44px] flex items-center gap-1.5 ${
              activeTab === 'saved'
                ? 'bg-[#580F69] text-white shadow-xs'
                : 'text-[#370D48] hover:bg-[#F7F5F8]'
            }`}
          >
            <span>My Saved Skills</span>
            <span className="text-[11px] px-1.5 py-0.2 bg-white/20 rounded-full font-semibold">
              {savedSkills.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('recommended')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all min-h-[44px] flex items-center gap-1.5 ${
              activeTab === 'recommended'
                ? 'bg-[#580F69] text-white shadow-xs'
                : 'text-[#370D48] hover:bg-[#F7F5F8]'
            }`}
          >
            <span>Recommended to Learn</span>
            <span className="text-[11px] px-1.5 py-0.2 bg-white/20 rounded-full font-semibold">
              {unsavedSkills.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all min-h-[44px] flex items-center gap-1.5 ${
              activeTab === 'all'
                ? 'bg-[#580F69] text-white shadow-xs'
                : 'text-[#370D48] hover:bg-[#F7F5F8]'
            }`}
          >
            <span>Entire Catalog</span>
            <span className="text-[11px] px-1.5 py-0.2 bg-white/20 rounded-full font-semibold">
              {skills.length}
            </span>
          </button>
        </div>

        {/* Search and Category Filter */}
        <div className="flex items-center gap-3 flex-1 sm:max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#580F69] absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Filter skills..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-[#D2B9E0] text-sm text-[#370D48] focus:border-[#580F69] focus:outline-none min-h-[44px]"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white border border-[#D2B9E0] text-xs font-semibold text-[#370D48] focus:border-[#580F69] focus:outline-none min-h-[44px]"
            aria-label="Filter by skill category"
          >
            {categories.map(c => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Skills Card Grid */}
      {displayedSkills.length === 0 ? (
        <EmptyState
          icon={Award}
          title={activeTab === 'saved' ? 'No saved skills found' : 'No matching skills'}
          description={
            activeTab === 'saved'
              ? 'You have not added any skills matching this filter yet. Explore recommended skills or add your first skill.'
              : `No skills found in category "${selectedCategory}" matching "${search}".`
          }
          actionText={activeTab === 'saved' ? 'Add New Skill' : 'Clear Filters'}
          onAction={activeTab === 'saved' ? () => openAddModal() : () => { setSearch(''); setSelectedCategory('All'); }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedSkills.map(skill => {
            const isSaved = Boolean(skill.isSaved);

            return (
              <div
                key={skill.id}
                className="bg-white rounded-2xl p-6 border-2 border-[#D2B9E0] hover:border-[#580F69] shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <Badge variant="primary" size="sm">
                      {skill.category}
                    </Badge>
                    {isSaved ? (
                      <Badge
                        variant={
                          skill.proficiency === 'Advanced'
                            ? 'success'
                            : skill.proficiency === 'Intermediate'
                            ? 'accent'
                            : 'warning'
                        }
                        size="sm"
                      >
                        {skill.proficiency || 'Beginner'}
                      </Badge>
                    ) : (
                      <Badge variant="neutral" size="sm">
                        Not In Toolkit
                      </Badge>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-[#370D48] tracking-tight">
                    <Link
                      to={`/skills/${skill.id}`}
                      className="hover:text-[#580F69] hover:underline focus:outline-none focus:ring-2 focus:ring-[#580F69] rounded"
                    >
                      {skill.name}
                    </Link>
                  </h3>

                  <p className="text-xs sm:text-sm text-[#240D2F]/80 mt-2 line-clamp-2 leading-relaxed">
                    {skill.description}
                  </p>

                  {/* Prerequisites or Resources tags */}
                  {skill.prerequisites && skill.prerequisites.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-[#F7F5F8] text-[11px] text-[#240D2F]/70">
                      <span className="font-semibold text-[#370D48]">Prerequisites: </span>
                      {skill.prerequisites.join(', ')}
                    </div>
                  )}

                  {/* Interactive Proficiency Selector if Saved */}
                  {isSaved && (
                    <div className="mt-4 pt-3 border-t border-[#F7F5F8]">
                      <label htmlFor={`prof-select-${skill.id}`} className="block text-xs font-semibold text-[#370D48] mb-1.5">
                        Update Proficiency:
                      </label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {(['Beginner', 'Intermediate', 'Advanced'] as SkillProficiency[]).map(lvl => (
                          <button
                            key={lvl}
                            id={`prof-select-${skill.id}`}
                            type="button"
                            onClick={() => handleQuickProficiencyChange(skill.id, lvl)}
                            className={`py-1 px-1.5 rounded-lg text-xs font-semibold transition-all min-h-[36px] ${
                              skill.proficiency === lvl
                                ? 'bg-[#580F69] text-white shadow-xs font-bold'
                                : 'bg-[#F7F5F8] text-[#370D48] hover:bg-[#D2B9E0]/40'
                            }`}
                          >
                            {lvl}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="mt-6 pt-4 border-t border-[#F7F5F8] flex items-center justify-between gap-2">
                  <Link
                    to={`/skills/${skill.id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#580F69] hover:text-[#370D48] hover:underline p-1"
                  >
                    <span>Curriculum & Tasks</span>
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </Link>

                  <div className="flex items-center gap-1">
                    {isSaved ? (
                      <>
                        <button
                          onClick={() => openAddModal(skill)}
                          className="p-2 text-[#370D48]/70 hover:text-[#370D48] hover:bg-[#F7F5F8] rounded-lg transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                          aria-label={`Edit ${skill.name}`}
                        >
                          <Edit2 className="w-4 h-4" aria-hidden="true" />
                        </button>
                        <button
                          onClick={() => confirmDelete(skill)}
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                          aria-label={`Remove ${skill.name}`}
                        >
                          <Trash2 className="w-4 h-4" aria-hidden="true" />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => {
                          StorageService.saveSkill({
                            ...skill,
                            proficiency: 'Beginner',
                            isSaved: true
                          });
                          success('Added to Toolkit', `"${skill.name}" added to your saved skills.`);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-[#580F69] text-white text-xs font-bold hover:bg-[#370D48] transition-colors min-h-[36px] flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Add</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Skill Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={formSkillId ? 'Edit Skill' : 'Add Technical Skill'}
        description="Save technical capabilities to power accurate gap analysis and career recommendations."
      >
        <form onSubmit={handleSaveSkill} className="space-y-4">
          <div>
            <label htmlFor="form-skill-name" className="block text-xs font-bold text-[#370D48] mb-1">
              Skill Name *
            </label>
            <input
              id="form-skill-name"
              type="text"
              required
              value={formName}
              onChange={e => setFormName(e.target.value)}
              placeholder="e.g. React, PostgreSQL, Docker, PyTorch"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F5F8] border border-[#D2B9E0] text-sm text-[#370D48] focus:bg-white focus:border-[#580F69] focus:outline-none min-h-[44px]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="form-skill-category" className="block text-xs font-bold text-[#370D48] mb-1">
                Category
              </label>
              <select
                id="form-skill-category"
                value={formCategory}
                onChange={e => setFormCategory(e.target.value as SkillCategory)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F5F8] border border-[#D2B9E0] text-sm text-[#370D48] focus:bg-white focus:border-[#580F69] focus:outline-none min-h-[44px]"
              >
                {categories.filter(c => c !== 'All').map(c => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="form-skill-proficiency" className="block text-xs font-bold text-[#370D48] mb-1">
                Current Proficiency
              </label>
              <select
                id="form-skill-proficiency"
                value={formProficiency}
                onChange={e => setFormProficiency(e.target.value as SkillProficiency)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F5F8] border border-[#D2B9E0] text-sm text-[#370D48] focus:bg-white focus:border-[#580F69] focus:outline-none min-h-[44px]"
              >
                <option value="Beginner">Beginner (Foundations & Syntax)</option>
                <option value="Intermediate">Intermediate (Practical Apps)</option>
                <option value="Advanced">Advanced (Production & Architecture)</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="form-skill-desc" className="block text-xs font-bold text-[#370D48] mb-1">
              Description / Notes
            </label>
            <textarea
              id="form-skill-desc"
              rows={3}
              value={formDescription}
              onChange={e => setFormDescription(e.target.value)}
              placeholder="What have you built with this skill or what are your goals?"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F5F8] border border-[#D2B9E0] text-sm text-[#370D48] focus:bg-white focus:border-[#580F69] focus:outline-none"
            />
          </div>

          <div className="pt-4 border-t border-[#F7F5F8] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-[#D2B9E0] text-[#370D48] font-semibold text-xs min-h-[44px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#580F69] hover:bg-[#370D48] text-white font-bold text-xs shadow-sm transition-colors min-h-[44px]"
            >
              Save Skill
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirmed Delete Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Remove Skill Confirmation"
        description="Are you sure you want to remove this skill from your personal toolkit?"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden="true" />
            <div className="text-xs text-amber-950">
              Removing <strong>{skillToDelete?.name}</strong> will update your career readiness percentages and skill gap calculations. You can re-add it at any time.
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-[#D2B9E0] text-[#370D48] font-semibold text-xs min-h-[44px]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={executeDelete}
              className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-sm min-h-[44px]"
            >
              Yes, Remove Skill
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

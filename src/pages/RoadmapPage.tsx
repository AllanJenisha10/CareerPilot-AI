import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Map,
  Plus,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { StorageService, STORAGE_EVENT } from '../services/storage';
import { AIService } from '../services/aiService';
import { CareerRoadmap, Career, SkillProficiency } from '../types';
import { ProgressBar } from '../components/common/ProgressBar';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { EmptyState } from '../components/common/EmptyState';
import { useToast } from '../context/ToastContext';

export const RoadmapPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const skillParam = searchParams.get('skill');
  const { success, error } = useToast();

  const [roadmaps, setRoadmaps] = useState<CareerRoadmap[]>(StorageService.getRoadmaps());
  const [careers, setCareers] = useState<Career[]>(StorageService.getCareers());

  // Create Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedCareerId, setSelectedCareerId] = useState(careers[0]?.id || 'software-developer');
  const [startingLevel, setStartingLevel] = useState<SkillProficiency>('Beginner');
  const [isGenerating, setIsGenerating] = useState(false);

  // Delete Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [roadmapToDelete, setRoadmapToDelete] = useState<CareerRoadmap | null>(null);

  useEffect(() => {
    const handleUpdate = () => {
      setRoadmaps(StorageService.getRoadmaps());
      setCareers(StorageService.getCareers());
    };
    window.addEventListener(STORAGE_EVENT, handleUpdate);
    return () => window.removeEventListener(STORAGE_EVENT, handleUpdate);
  }, []);

  const handleCreateRoadmap = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetCareer = careers.find(c => c.id === selectedCareerId);
    if (!targetCareer) return;

    setIsGenerating(true);
    const { roadmap, isAiGenerated } = await AIService.generateRoadmap(targetCareer, startingLevel);
    StorageService.saveRoadmap(roadmap);
    setIsGenerating(false);
    setIsCreateModalOpen(false);
    success(
      'Roadmap Created',
      `Curriculum generated for ${targetCareer.title} (${isAiGenerated ? 'Gemini AI' : 'Deterministic Curriculum'}).`
    );
    navigate(`/roadmap/${roadmap.id}`);
  };

  const handleToggleMilestone = (roadmapId: string, stageId: string, milestoneId: string) => {
    StorageService.toggleMilestone(roadmapId, stageId, milestoneId);
    success('Progress Updated', 'Milestone completion state toggled.');
  };

  const confirmDelete = (roadmap: CareerRoadmap) => {
    setRoadmapToDelete(roadmap);
    setDeleteModalOpen(true);
  };

  const executeDelete = () => {
    if (roadmapToDelete) {
      StorageService.deleteRoadmap(roadmapToDelete.id);
      success('Roadmap Removed', 'Learning roadmap has been deleted.');
      setDeleteModalOpen(false);
      setRoadmapToDelete(null);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#D2B9E0] shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#580F69]/10 text-[#580F69] text-xs font-bold mb-3">
              <Map className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Personalized Learning Curricula</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#370D48] tracking-tight">
              Career Roadmaps
            </h1>
            <p className="text-sm sm:text-base text-[#240D2F]/80 mt-2 leading-relaxed">
              Step-by-step technical roadmaps structured into progressive stages, practice milestones, and portfolio project deliverables.
            </p>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#580F69] hover:bg-[#370D48] text-white font-bold text-sm shadow-md transition-all shrink-0 min-h-[44px]"
          >
            <Plus className="w-5 h-5" aria-hidden="true" />
            <span>Generate New Roadmap</span>
          </button>
        </div>
      </div>

      {/* Roadmaps List */}
      {roadmaps.length === 0 ? (
        <EmptyState
          icon={Map}
          title="No Active Roadmaps"
          description="You haven't generated any learning roadmaps yet. Choose a target career path to generate a structured 3-stage curriculum."
          actionText="Generate First Roadmap"
          onAction={() => setIsCreateModalOpen(true)}
        />
      ) : (
        <div className="space-y-6">
          {roadmaps.map(roadmap => {
            // Calculate real progress
            let totalMilestones = 0;
            let completedMilestones = 0;
            let activeStage = roadmap.stages[0];

            roadmap.stages.forEach(stg => {
              stg.milestones.forEach(m => {
                totalMilestones++;
                if (m.completed) completedMilestones++;
              });
              // Find first incomplete stage
              if (stg.milestones.some(m => !m.completed) && activeStage.order <= stg.order) {
                activeStage = stg;
              }
            });

            const percent = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

            return (
              <div
                key={roadmap.id}
                className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#D2B9E0] shadow-xs hover:border-[#580F69] transition-all space-y-6"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[#F7F5F8]">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <Badge variant="primary">{roadmap.targetCareerTitle}</Badge>
                      <Badge variant="neutral">Starting: {roadmap.startingLevel}</Badge>
                      {roadmap.isAiGenerated ? (
                        <Badge variant="accent">Gemini AI Path</Badge>
                      ) : (
                        <Badge variant="neutral">Standard Curriculum</Badge>
                      )}
                    </div>
                    <h2 className="text-2xl font-extrabold text-[#370D48]">
                      {roadmap.targetCareerTitle} Learning Path
                    </h2>
                    <p className="text-xs text-[#240D2F]/70 mt-1 flex items-center gap-2">
                      <span>Created: {roadmap.createdAt}</span>
                      <span>•</span>
                      <span>Last active: {roadmap.updatedAt}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <Link
                      to={`/roadmap/${roadmap.id}`}
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#580F69] hover:bg-[#370D48] text-white font-bold text-xs sm:text-sm shadow-sm transition-all min-h-[44px]"
                    >
                      <span>Continue Learning ({activeStage?.title.split(':')[0] || 'Stage 1'})</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => confirmDelete(roadmap)}
                      className="p-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                      aria-label={`Delete roadmap for ${roadmap.targetCareerTitle}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Overall Progress Indicator */}
                <div>
                  <ProgressBar
                    value={percent}
                    label={`Roadmap Completion: ${completedMilestones} of ${totalMilestones} Milestones`}
                    size="md"
                  />
                </div>

                {/* Stages Preview Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  {roadmap.stages.map(stage => {
                    const stageMilestones = stage.milestones.length;
                    const stageCompleted = stage.milestones.filter(m => m.completed).length;
                    const isFullyCompleted = stageMilestones > 0 && stageCompleted === stageMilestones;

                    return (
                      <div
                        key={stage.id}
                        className={`p-5 rounded-2xl border transition-all ${
                          isFullyCompleted
                            ? 'bg-emerald-50/50 border-emerald-200'
                            : 'bg-[#F7F5F8] border-[#D2B9E0]/60'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-[#580F69] uppercase tracking-wide">
                            {stage.title.split(':')[0]}
                          </span>
                          <span className="text-[11px] font-semibold text-[#240D2F]/70">
                            ~{stage.durationWeeks} weeks
                          </span>
                        </div>
                        <h3 className="font-bold text-sm text-[#370D48] leading-tight">
                          {stage.title.split(':')[1]?.trim() || stage.title}
                        </h3>
                        <p className="text-xs text-[#240D2F]/75 mt-1.5 line-clamp-2">
                          {stage.description}
                        </p>

                        <div className="mt-4 pt-3 border-t border-black/5 flex items-center justify-between text-xs">
                          <span className="font-medium text-[#240D2F]/70">
                            {stageCompleted}/{stageMilestones} Done
                          </span>
                          {isFullyCompleted ? (
                            <span className="text-emerald-700 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Done
                            </span>
                          ) : (
                            <span className="text-[#580F69] font-bold">
                              {Math.round((stageCompleted / (stageMilestones || 1)) * 100)}%
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Generate Roadmap Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Generate Career Roadmap"
        description="Select your target technology role and starting proficiency level to construct an actionable multi-phase curriculum."
      >
        <form onSubmit={handleCreateRoadmap} className="space-y-4">
          <div>
            <label htmlFor="create-roadmap-career" className="block text-xs font-bold text-[#370D48] mb-1.5">
              Target Career Role *
            </label>
            <select
              id="create-roadmap-career"
              value={selectedCareerId}
              onChange={e => setSelectedCareerId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F5F8] border border-[#D2B9E0] text-sm text-[#370D48] font-semibold focus:outline-none focus:border-[#580F69] min-h-[44px]"
            >
              {careers.map(c => (
                <option key={c.id} value={c.id}>
                  {c.title} ({c.category})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="create-roadmap-level" className="block text-xs font-bold text-[#370D48] mb-1.5">
              Current Skill Level *
            </label>
            <select
              id="create-roadmap-level"
              value={startingLevel}
              onChange={e => setStartingLevel(e.target.value as SkillProficiency)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F5F8] border border-[#D2B9E0] text-sm text-[#370D48] font-semibold focus:outline-none focus:border-[#580F69] min-h-[44px]"
            >
              <option value="Beginner">Beginner (Starting from scratch / fundamentals)</option>
              <option value="Intermediate">Intermediate (Have foundational coding basics)</option>
              <option value="Advanced">Advanced (Refining for senior or staff expectations)</option>
            </select>
          </div>

          <div className="p-3.5 rounded-xl bg-[#580F69]/10 border border-[#580F69]/20 text-xs text-[#370D48] leading-relaxed flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-[#580F69] shrink-0 mt-0.5" />
            <span>
              When Gemini is securely connected, you receive personalized project scenarios; otherwise our verified deterministic industry curriculum generates instantly.
            </span>
          </div>

          <div className="pt-4 border-t border-[#F7F5F8] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-[#D2B9E0] text-[#370D48] font-semibold text-xs min-h-[44px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isGenerating}
              className="px-5 py-2.5 rounded-xl bg-[#580F69] hover:bg-[#370D48] text-white font-bold text-xs shadow-sm transition-colors min-h-[44px] disabled:opacity-50 flex items-center gap-1.5"
            >
              {isGenerating ? (
                <span>Generating Roadmap...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#D2B9E0]" />
                  <span>Build Curriculum</span>
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Roadmap Confirmation */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Roadmap"
        description="Are you sure you want to delete this learning path?"
      >
        <div className="space-y-4">
          <p className="text-xs text-[#240D2F]/80">
            Deleting this roadmap will remove all tracked milestones and task completion progress for{' '}
            <strong>{roadmapToDelete?.targetCareerTitle}</strong>.
          </p>

          <div className="pt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setDeleteModalOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-[#D2B9E0] text-[#370D48] font-semibold text-xs min-h-[44px]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={executeDelete}
              className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-sm min-h-[44px]"
            >
              Delete Roadmap
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

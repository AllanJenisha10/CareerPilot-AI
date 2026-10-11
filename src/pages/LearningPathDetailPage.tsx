import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Map,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  FolderGit2,
  BookOpen,
  Award,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { StorageService, STORAGE_EVENT } from '../services/storage';
import { CareerRoadmap, RoadmapStage, RoadmapMilestone, RoadmapTask } from '../types';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { ProgressBar } from '../components/common/ProgressBar';
import { Badge } from '../components/common/Badge';
import { useToast } from '../context/ToastContext';

export const LearningPathDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success } = useToast();

  const [roadmap, setRoadmap] = useState<CareerRoadmap | undefined>(id ? StorageService.getRoadmapById(id) : undefined);
  const [activeStageIndex, setActiveStageIndex] = useState(0);

  useEffect(() => {
    if (id) {
      setRoadmap(StorageService.getRoadmapById(id));
    }
  }, [id]);

  useEffect(() => {
    const handleUpdate = () => {
      if (id) {
        setRoadmap(StorageService.getRoadmapById(id));
      }
    };
    window.addEventListener(STORAGE_EVENT, handleUpdate);
    return () => window.removeEventListener(STORAGE_EVENT, handleUpdate);
  }, [id]);

  if (!roadmap || !roadmap.stages || roadmap.stages.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-100 text-red-700 mx-auto flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-bold text-[#370D48]">Roadmap Not Found</h1>
        <p className="text-sm text-[#240D2F]/75 mt-2">
          The requested roadmap ID "{id}" does not exist or has been removed.
        </p>
        <div className="mt-6">
          <Link
            to="/roadmap"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#580F69] text-white font-semibold text-sm hover:bg-[#370D48]"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Return to Roadmaps</span>
          </Link>
        </div>
      </div>
    );
  }

  const currentStage: RoadmapStage = roadmap.stages[activeStageIndex] || roadmap.stages[0];

  // Overall roadmap progress
  let totalMilestones = 0;
  let completedMilestones = 0;
  roadmap.stages.forEach(stg => {
    stg.milestones.forEach(m => {
      totalMilestones++;
      if (m.completed) completedMilestones++;
    });
  });
  const overallPercent = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

  // Stage progress
  const stageTotal = currentStage.milestones.length;
  const stageDone = currentStage.milestones.filter(m => m.completed).length;
  const stagePercent = stageTotal > 0 ? Math.round((stageDone / stageTotal) * 100) : 0;

  const handleToggleMilestone = (milestoneId: string) => {
    StorageService.toggleMilestone(roadmap.id, currentStage.id, milestoneId);
    success('Progress Saved', 'Milestone completion updated.');
  };

  const handleToggleTask = (milestoneId: string, taskId: string) => {
    StorageService.toggleTask(roadmap.id, currentStage.id, milestoneId, taskId);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Breadcrumb Trail */}
      <Breadcrumbs
        items={[
          { label: 'Roadmaps', href: '/roadmap' },
          { label: `${roadmap.targetCareerTitle} Path` }
        ]}
      />

      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border-2 border-[#D2B9E0] shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[#F7F5F8]">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="primary">{roadmap.targetCareerTitle}</Badge>
              <Badge variant="neutral">Level: {roadmap.startingLevel}</Badge>
              {roadmap.isAiGenerated ? (
                <Badge variant="accent">Gemini AI Plan</Badge>
              ) : (
                <Badge variant="neutral">Curated Heuristic Plan</Badge>
              )}
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#370D48] tracking-tight">
              {roadmap.targetCareerTitle} Learning Journey
            </h1>
            <p className="text-sm text-[#240D2F]/80 max-w-2xl">
              Track multi-stage technical objectives, practical task checklists, and portfolio capstone deliverables.
            </p>
          </div>

          <div className="bg-[#F7F5F8] p-4 rounded-2xl border border-[#D2B9E0] shrink-0 w-full lg:w-72 space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold text-[#370D48]">
              <span>Overall Path Progress</span>
              <span className="text-[#580F69] font-bold">{overallPercent}%</span>
            </div>
            <ProgressBar value={overallPercent} showPercent={false} size="sm" />
            <div className="text-[11px] text-[#240D2F]/70 pt-1 text-center">
              {completedMilestones} of {totalMilestones} Milestones Mastered
            </div>
          </div>
        </div>

        {/* Stage Selector Tabs */}
        <div className="mt-6 pt-2">
          <div className="text-xs font-bold text-[#370D48] uppercase tracking-wider mb-3">
            Select Curriculum Stage
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {roadmap.stages.map((stage, idx) => {
              const isSelected = idx === activeStageIndex;
              const sDone = stage.milestones.filter(m => m.completed).length;
              const sAll = stage.milestones.length;

              return (
                <button
                  key={stage.id}
                  onClick={() => setActiveStageIndex(idx)}
                  className={`p-4 rounded-2xl text-left border-2 transition-all min-h-[44px] ${
                    isSelected
                      ? 'bg-[#580F69]/10 border-[#580F69] text-[#370D48] shadow-xs'
                      : 'bg-white border-[#D2B9E0] hover:border-[#580F69]/50 text-[#240D2F]'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-[#580F69]">Phase {stage.order}</span>
                    <span className="text-[11px] text-[#240D2F]/60">~{stage.durationWeeks} wks</span>
                  </div>
                  <div className="font-bold text-sm text-[#370D48] leading-tight truncate">
                    {stage.title.split(':')[1]?.trim() || stage.title}
                  </div>
                  <div className="text-[11px] text-[#240D2F]/70 mt-2 flex items-center justify-between">
                    <span>Progress</span>
                    <span className="font-bold text-[#580F69]">{sDone}/{sAll}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Active Stage Details */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#D2B9E0] space-y-8">
        {/* Stage Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#F7F5F8]">
          <div>
            <span className="text-xs font-bold text-[#580F69] uppercase tracking-wide">
              Phase {currentStage.order} Overview
            </span>
            <h2 className="text-2xl font-extrabold text-[#370D48] tracking-tight mt-0.5">
              {currentStage.title}
            </h2>
            <p className="text-xs sm:text-sm text-[#240D2F]/80 mt-1 max-w-2xl leading-relaxed">
              {currentStage.description}
            </p>
          </div>

          <div className="shrink-0 w-full sm:w-48">
            <ProgressBar value={stagePercent} label={`Phase ${currentStage.order} Progress`} size="sm" />
          </div>
        </div>

        {/* Milestones List */}
        <div className="space-y-6">
          <h3 className="text-base font-bold text-[#370D48] flex items-center gap-2">
            <Award className="w-5 h-5 text-[#580F69]" aria-hidden="true" />
            <span>Phase Milestones & Verification Checklist ({currentStage.milestones.length})</span>
          </h3>

          {currentStage.milestones.map((milestone, mIdx) => (
            <div
              key={milestone.id}
              className={`p-6 rounded-2xl border-2 transition-all ${
                milestone.completed
                  ? 'bg-emerald-50/40 border-emerald-300'
                  : 'bg-[#F7F5F8] border-[#D2B9E0]'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <button
                    type="button"
                    onClick={() => handleToggleMilestone(milestone.id)}
                    className="mt-0.5 shrink-0 focus:outline-none focus:ring-2 focus:ring-[#580F69] rounded-lg p-0.5 min-w-[28px] min-h-[28px] flex items-center justify-center"
                    aria-label={`Mark milestone ${milestone.title} as ${milestone.completed ? 'incomplete' : 'complete'}`}
                  >
                    {milestone.completed ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-600" aria-hidden="true" />
                    ) : (
                      <div className="w-5 h-5 rounded-md border-2 border-[#580F69] bg-white hover:bg-[#D2B9E0]/30 transition-colors" />
                    )}
                  </button>

                  <div>
                    <h4
                      className={`text-base font-bold transition-all ${
                        milestone.completed ? 'line-through text-emerald-950/70' : 'text-[#370D48]'
                      }`}
                    >
                      {milestone.title}
                    </h4>

                    {/* Skills Covered Tags */}
                    {milestone.skillsCovered && milestone.skillsCovered.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap mt-2">
                        <span className="text-[11px] font-semibold text-[#240D2F]/70">Skills:</span>
                        {milestone.skillsCovered.map((sk, sIdx) => (
                          <span
                            key={sIdx}
                            className="text-[10px] px-2 py-0.5 rounded-md bg-white border border-[#D2B9E0] text-[#580F69] font-medium"
                          >
                            {sk}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleToggleMilestone(milestone.id)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-colors min-h-[36px] ${
                    milestone.completed
                      ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                      : 'bg-white border border-[#D2B9E0] text-[#370D48] hover:bg-[#D2B9E0]/30'
                  }`}
                >
                  {milestone.completed ? 'Completed' : 'Mark Done'}
                </button>
              </div>

              {/* Tasks Sublist */}
              {milestone.tasks && milestone.tasks.length > 0 && (
                <div className="mt-4 pt-4 border-t border-black/5 pl-8 space-y-2">
                  <div className="text-xs font-bold text-[#370D48] mb-1">Practical Learning Tasks:</div>
                  {milestone.tasks.map((task, tIdx) => (
                    <div
                      key={task.id}
                      onClick={() => handleToggleTask(milestone.id, task.id)}
                      className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 text-xs cursor-pointer select-none transition-colors ${
                        task.completed
                          ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900 line-through'
                          : 'bg-white border-[#D2B9E0]/60 hover:border-[#580F69] text-[#240D2F]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => handleToggleTask(milestone.id, task.id)}
                          className="w-3.5 h-3.5 rounded text-[#580F69] focus:ring-[#580F69]"
                          aria-label={`Task: ${task.title}`}
                        />
                        <span>{task.title}</span>
                      </div>
                      <span className="text-[10px] text-[#240D2F]/60 font-semibold shrink-0">
                        ~{task.estimatedHours} hrs
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Suggested Project Deliverable if present */}
              {milestone.suggestedProject && (
                <div className="mt-4 p-4 rounded-xl bg-white border border-[#D2B9E0] space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#580F69]">
                    <FolderGit2 className="w-4 h-4 text-[#580F69]" />
                    <span>Deliverable Project: {milestone.suggestedProject.title}</span>
                  </div>
                  <p className="text-xs text-[#240D2F]/80 leading-relaxed">
                    {milestone.suggestedProject.description}
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {milestone.suggestedProject.deliverables.map((del, dIdx) => (
                      <span
                        key={dIdx}
                        className="text-[11px] px-2 py-0.5 rounded-md bg-[#F7F5F8] text-[#370D48] border border-[#D2B9E0]/50"
                      >
                        ✓ {del}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Stage Navigation Footer */}
        <div className="pt-6 border-t border-[#F7F5F8] flex items-center justify-between">
          <button
            onClick={() => setActiveStageIndex(Math.max(0, activeStageIndex - 1))}
            disabled={activeStageIndex === 0}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#D2B9E0] text-xs font-bold text-[#370D48] hover:bg-[#D2B9E0]/20 disabled:opacity-40 disabled:cursor-not-allowed min-h-[44px]"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous Phase</span>
          </button>

          <span className="text-xs text-[#240D2F]/70 font-semibold">
            Phase {activeStageIndex + 1} of {roadmap.stages.length}
          </span>

          <button
            onClick={() => setActiveStageIndex(Math.min(roadmap.stages.length - 1, activeStageIndex + 1))}
            disabled={activeStageIndex === roadmap.stages.length - 1}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#580F69] hover:bg-[#370D48] text-white text-xs font-bold shadow-xs disabled:opacity-40 disabled:cursor-not-allowed min-h-[44px]"
          >
            <span>Next Phase</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

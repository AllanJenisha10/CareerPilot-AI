import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileText,
  Plus,
  Upload,
  Printer,
  Download,
  Trash2,
  Edit2,
  Sparkles,
  Search,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  ArrowRight
} from 'lucide-react';
import { StorageService, STORAGE_EVENT } from '../services/storage';
import { ResumeProfile, ResumeAnalysisResult } from '../types';
import { Badge } from '../components/common/Badge';
import { ProgressBar } from '../components/common/ProgressBar';
import { Modal } from '../components/common/Modal';
import { EmptyState } from '../components/common/EmptyState';
import { useToast } from '../context/ToastContext';
import { parseResumePlainText } from '../utils/resumeParser';

export const ResumeDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [resumes, setResumes] = useState<ResumeProfile[]>(StorageService.getResumes());
  const [analyses, setAnalyses] = useState<ResumeAnalysisResult[]>(StorageService.getAnalyses());

  // Upload Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadTargetRole, setUploadTargetRole] = useState('Software Developer');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadErrorMsg, setUploadErrorMsg] = useState('');

  // Delete State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [resumeToDelete, setResumeToDelete] = useState<ResumeProfile | null>(null);

  useEffect(() => {
    const handleUpdate = () => {
      setResumes(StorageService.getResumes());
      setAnalyses(StorageService.getAnalyses());
    };
    window.addEventListener(STORAGE_EVENT, handleUpdate);
    return () => window.removeEventListener(STORAGE_EVENT, handleUpdate);
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadErrorMsg('');
    const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2MB limit

    if (file.size > MAX_SIZE_BYTES) {
      setUploadErrorMsg('File exceeds 2MB limit. Please upload a plain text, markdown, or JSON resume under 2MB.');
      return;
    }

    const validExtensions = ['.txt', '.md', '.json', '.text'];
    const fileName = file.name.toLowerCase();
    const hasValidExt = validExtensions.some(ext => fileName.endsWith(ext));

    if (!hasValidExt) {
      setUploadErrorMsg('Unsupported file format. Please upload .txt, .md, or .json files containing text resume content.');
      return;
    }

    setIsUploading(true);
    try {
      const text = await file.text();
      if (!text.trim() || text.length < 50) {
        setUploadErrorMsg('File content is empty or too short to parse as a technical resume.');
        setIsUploading(false);
        return;
      }

      // If json, attempt direct parse
      let parsedResume: ResumeProfile;
      if (fileName.endsWith('.json')) {
        try {
          const json = JSON.parse(text);
          parsedResume = {
            id: `resume-${Date.now()}`,
            title: json.title || file.name.replace(/\.[^/.]+$/, ''),
            updatedAt: new Date().toISOString().split('T')[0],
            personalInfo: json.personalInfo || {
              fullName: 'Parsed Candidate',
              email: 'candidate@example.com',
              phone: '',
              location: '',
              linkedinUrl: '',
              portfolioUrl: '',
              githubUrl: ''
            },
            targetRole: uploadTargetRole,
            professionalSummary: json.professionalSummary || '',
            skills: json.skills || [{ category: 'Technical Skills', items: [] }],
            experience: json.experience || [],
            education: json.education || [],
            projects: json.projects || [],
            certifications: json.certifications || [],
            languages: json.languages || []
          };
        } catch {
          throw new Error('Malformed JSON structure');
        }
      } else {
        // Plain text / markdown extract into structured draft
        parsedResume = parseResumePlainText(text, file.name.replace(/\.[^/.]+$/, ''), uploadTargetRole);
      }

      StorageService.saveResume(parsedResume);
      success('File Uploaded Successfully', `Parsed "${file.name}" into your resumes.`);
      setIsUploadModalOpen(false);
      setIsUploading(false);
      navigate(`/resume/builder?id=${parsedResume.id}`);
    } catch (err: any) {
      setIsUploading(false);
      setUploadErrorMsg(err?.message || 'Failed to parse file text.');
    }
  };

  const handleDownloadJson = (resume: ResumeProfile) => {
    const blob = new Blob([JSON.stringify(resume, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${resume.title.toLowerCase().replace(/\s+/g, '-')}-resume.json`;
    a.click();
    URL.revokeObjectURL(url);
    success('Downloaded', 'Resume JSON downloaded.');
  };

  const confirmDelete = (resume: ResumeProfile) => {
    setResumeToDelete(resume);
    setDeleteModalOpen(true);
  };

  const executeDelete = () => {
    if (resumeToDelete) {
      StorageService.deleteResume(resumeToDelete.id);
      success('Resume Deleted', `"${resumeToDelete.title}" removed.`);
      setDeleteModalOpen(false);
      setResumeToDelete(null);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#D2B9E0] shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#580F69]/10 text-[#580F69] text-xs font-bold mb-3">
              <FileText className="w-3.5 h-3.5" aria-hidden="true" />
              <span>ATS Resume Command Center</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#370D48] tracking-tight">
              Resume Intelligence & Hub
            </h1>
            <p className="text-sm sm:text-base text-[#240D2F]/80 mt-2 leading-relaxed">
              Build clean single-column ATS-friendly resumes, import existing documents, review automated content scoring, and polish impact statements.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 border-[#D2B9E0] text-[#370D48] font-bold text-xs sm:text-sm hover:bg-[#D2B9E0]/20 transition-all min-h-[44px]"
            >
              <Upload className="w-4 h-4 text-[#580F69]" aria-hidden="true" />
              <span>Import (.txt / .json)</span>
            </button>
            <Link
              to="/resume/analysis"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 border-[#580F69] text-[#580F69] font-bold text-xs sm:text-sm hover:bg-[#580F69]/10 transition-all min-h-[44px]"
            >
              <Search className="w-4 h-4" aria-hidden="true" />
              <span>Scan Any Resume</span>
            </Link>
            <Link
              to="/resume/builder"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#580F69] hover:bg-[#370D48] text-white font-bold text-xs sm:text-sm shadow-md transition-all min-h-[44px]"
            >
              <Plus className="w-4 h-4 text-[#D2B9E0]" aria-hidden="true" />
              <span>Create New Resume</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Resumes Grid */}
      <section aria-labelledby="saved-resumes-heading">
        <h2 id="saved-resumes-heading" className="text-xl font-bold text-[#370D48] mb-4">
          Saved Resumes ({resumes.length})
        </h2>

        {resumes.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No Saved Resumes Found"
            description="Create your first ATS-friendly technical resume using our structured builder or import existing resume text."
            actionText="Build New Resume"
            actionHref="/resume/builder"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resumes.map(resume => (
              <div
                key={resume.id}
                className="bg-white rounded-2xl p-6 border-2 border-[#D2B9E0] hover:border-[#580F69] shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <Badge variant="primary" size="sm">
                      {resume.targetRole || 'Software Engineering'}
                    </Badge>
                    <span className="text-[11px] text-[#240D2F]/70">
                      Updated {resume.updatedAt}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-[#370D48] tracking-tight">
                    {resume.title}
                  </h3>

                  <div className="text-xs text-[#240D2F]/80 mt-1 font-semibold">
                    {resume.personalInfo.fullName} • {resume.personalInfo.email}
                  </div>

                  <p className="text-xs text-[#240D2F]/75 mt-3 line-clamp-2 leading-relaxed">
                    {resume.professionalSummary || 'No professional summary set yet.'}
                  </p>

                  <div className="mt-4 pt-3 border-t border-[#F7F5F8] grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 rounded-lg bg-[#F7F5F8]">
                      <div className="font-bold text-[#370D48]">{resume.experience.length}</div>
                      <div className="text-[10px] text-[#240D2F]/70">Roles</div>
                    </div>
                    <div className="p-2 rounded-lg bg-[#F7F5F8]">
                      <div className="font-bold text-[#370D48]">{resume.projects.length}</div>
                      <div className="text-[10px] text-[#240D2F]/70">Projects</div>
                    </div>
                    <div className="p-2 rounded-lg bg-[#F7F5F8]">
                      <div className="font-bold text-[#370D48]">{resume.education.length}</div>
                      <div className="text-[10px] text-[#240D2F]/70">Degrees</div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 pt-4 border-t border-[#F7F5F8] flex items-center justify-between gap-2">
                  <Link
                    to={`/resume/builder?id=${resume.id}`}
                    className="inline-flex items-center justify-center gap-1.5 flex-1 py-2 px-3 rounded-xl bg-[#580F69] hover:bg-[#370D48] text-white text-xs font-bold transition-colors min-h-[40px]"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit & Preview</span>
                  </Link>

                  <Link
                    to={`/resume/analysis?resumeId=${resume.id}`}
                    className="p-2 text-[#580F69] hover:bg-[#580F69]/10 rounded-xl transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center border border-[#D2B9E0]"
                    title="Analyze ATS Score"
                  >
                    <Sparkles className="w-4 h-4" />
                  </Link>

                  <button
                    onClick={() => handleDownloadJson(resume)}
                    className="p-2 text-[#370D48] hover:bg-[#F7F5F8] rounded-xl transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center border border-[#D2B9E0]"
                    title="Download JSON format"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => confirmDelete(resume)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center border border-red-200"
                    title="Delete resume"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recent Resume Analyses Section */}
      {analyses.length > 0 && (
        <section aria-labelledby="recent-analyses-heading" className="bg-white rounded-3xl p-6 sm:p-8 border border-[#D2B9E0]">
          <div className="flex items-center justify-between mb-6">
            <h2 id="recent-analyses-heading" className="text-xl font-bold text-[#370D48]">
              Recent ATS Content Scan Reports
            </h2>
            <Link
              to="/resume/analysis"
              className="text-xs font-bold text-[#580F69] hover:text-[#370D48] hover:underline"
            >
              Run New Scan
            </Link>
          </div>

          <div className="space-y-3">
            {analyses.slice(0, 3).map(analysis => (
              <div
                key={analysis.id}
                className="p-4 rounded-2xl bg-[#F7F5F8] border border-[#D2B9E0] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#370D48]">
                      Role: {analysis.targetRole}
                    </span>
                    <Badge variant={analysis.overallScore >= 80 ? 'success' : 'warning'} size="sm">
                      Score: {analysis.overallScore}/100
                    </Badge>
                    <span className="text-[11px] text-[#240D2F]/60">
                      {new Date(analysis.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-[#240D2F]/75 mt-1">
                    {analysis.strengths[0] || 'Heuristic ATS structural evaluation completed.'}
                  </p>
                </div>

                <Link
                  to={`/resume/analysis?id=${analysis.id}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#580F69] hover:text-[#370D48] hover:underline shrink-0"
                >
                  <span>View Full Report</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Upload Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Import Existing Resume File"
        description="Upload your plain text, markdown, or JSON resume. Maximum file size is 2MB."
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="upload-target-role" className="block text-xs font-bold text-[#370D48] mb-1">
              Target Role For Import *
            </label>
            <input
              id="upload-target-role"
              type="text"
              value={uploadTargetRole}
              onChange={e => setUploadTargetRole(e.target.value)}
              placeholder="e.g. Software Developer, Data Scientist"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F5F8] border border-[#D2B9E0] text-sm text-[#370D48] focus:bg-white focus:border-[#580F69] focus:outline-none min-h-[44px]"
            />
          </div>

          <div className="p-6 rounded-2xl border-2 border-dashed border-[#A375A1] bg-[#F7F5F8] text-center space-y-2">
            <Upload className="w-8 h-8 text-[#580F69] mx-auto" />
            <div className="text-xs font-semibold text-[#370D48]">
              Select a .txt, .md, or .json file
            </div>
            <p className="text-[11px] text-[#240D2F]/70">
              Only authentic file extraction is executed. Text is parsed into editable builder fields.
            </p>
            <input
              type="file"
              accept=".txt,.md,.json,.text"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="block w-full text-xs text-[#240D2F] file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#580F69] file:text-white hover:file:bg-[#370D48] cursor-pointer mt-3"
            />
          </div>

          {uploadErrorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <span>{uploadErrorMsg}</span>
            </div>
          )}

          <div className="pt-4 border-t border-[#F7F5F8] flex justify-end">
            <button
              type="button"
              onClick={() => setIsUploadModalOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-[#D2B9E0] text-[#370D48] font-semibold text-xs min-h-[44px]"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Resume"
        description="Are you sure you want to delete this resume?"
      >
        <div className="space-y-4">
          <p className="text-xs text-[#240D2F]/80">
            This will permanently remove <strong>"{resumeToDelete?.title}"</strong> from your saved resumes.
          </p>
          <div className="pt-4 flex justify-end gap-3">
            <button
              onClick={() => setDeleteModalOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-[#D2B9E0] text-[#370D48] font-semibold text-xs min-h-[44px]"
            >
              Cancel
            </button>
            <button
              onClick={executeDelete}
              className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs min-h-[44px]"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

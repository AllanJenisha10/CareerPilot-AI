import React, { useState, useEffect, useRef } from 'react';
import {
  UserCheck,
  Save,
  RotateCcw,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  Settings,
  GraduationCap,
  Bell,
  Eye,
  Sliders,
  Camera,
  Upload,
  Trash2,
  X,
  FileImage,
  Sparkles
} from 'lucide-react';
import { StorageService, STORAGE_EVENT } from '../services/storage';
import { UserProfile } from '../types';
import { Modal } from '../components/common/Modal';
import { Badge } from '../components/common/Badge';
import { Avatar } from '../components/common/Avatar';
import { validateImageFile, processImageFile } from '../utils/imageUtils';
import { useToast } from '../context/ToastContext';

export const ProfileSettingsPage: React.FC = () => {
  const { success, error, info } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<UserProfile>(StorageService.getProfile());

  // Form states
  const [fullName, setFullName] = useState(profile.fullName);
  const [email, setEmail] = useState(profile.email);
  const [educationLevel, setEducationLevel] = useState(profile.currentEducationLevel);
  const [fieldOfStudy, setFieldOfStudy] = useState(profile.fieldOfStudy);
  const [gradYear, setGradYear] = useState(profile.graduationYear);
  const [expLevel, setExpLevel] = useState(profile.preferredExperienceLevel);

  // Avatar upload states
  const [currentAvatar, setCurrentAvatar] = useState<string | undefined>(profile.avatarUrl);
  const [pendingAvatarPreview, setPendingAvatarPreview] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string>('');
  const [isProcessingImage, setIsProcessingImage] = useState(false);

  // Preferences
  const [emailNotifs, setEmailNotifs] = useState(profile.preferences?.emailNotifications || false);
  const [roadmapReminders, setRoadmapReminders] = useState(profile.preferences?.roadmapReminders !== false);
  const [highContrast, setHighContrast] = useState(profile.preferences?.highContrastMode || false);
  const [includePhotoOnResume, setIncludePhotoOnResume] = useState(profile.preferences?.includePhotoOnResume || false);

  // Reset Modal
  const [resetModalOpen, setResetModalOpen] = useState(false);

  useEffect(() => {
    const handleUpdate = () => {
      const p = StorageService.getProfile();
      setProfile(p);
      setFullName(p.fullName);
      setEmail(p.email);
      setEducationLevel(p.currentEducationLevel);
      setFieldOfStudy(p.fieldOfStudy);
      setGradYear(p.graduationYear);
      setExpLevel(p.preferredExperienceLevel);
      setCurrentAvatar(p.avatarUrl);
      setEmailNotifs(p.preferences?.emailNotifications || false);
      setRoadmapReminders(p.preferences?.roadmapReminders !== false);
      setHighContrast(p.preferences?.highContrastMode || false);
      setIncludePhotoOnResume(p.preferences?.includePhotoOnResume || false);
    };
    window.addEventListener(STORAGE_EVENT, handleUpdate);
    return () => window.removeEventListener(STORAGE_EVENT, handleUpdate);
  }, []);

  // Handle Photo File Selection
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarError('');
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setAvatarError(validation.error || 'Invalid image file.');
      error('Upload Failed', validation.error);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setIsProcessingImage(true);
    try {
      const optimizedDataUrl = await processImageFile(file, 320, 0.88);
      setPendingAvatarPreview(optimizedDataUrl);
      info('Preview Ready', 'Review the photo preview below and click "Save Photo" to apply.');
    } catch (err: any) {
      setAvatarError(err?.message || 'Failed to process image file.');
      error('Image Error', err?.message || 'Failed to process image.');
    } finally {
      setIsProcessingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSavePhoto = () => {
    if (!pendingAvatarPreview) return;
    try {
      StorageService.saveProfile({
        avatarUrl: pendingAvatarPreview
      });
      setCurrentAvatar(pendingAvatarPreview);
      setPendingAvatarPreview(null);
      setAvatarError('');
      success('Photo Saved', 'Your profile picture has been updated and saved.');
    } catch (err: any) {
      error('Save Error', 'Failed to store photo in browser storage.');
    }
  };

  const handleCancelPhotoPreview = () => {
    setPendingAvatarPreview(null);
    setAvatarError('');
  };

  const handleRemovePhoto = () => {
    StorageService.saveProfile({
      avatarUrl: undefined
    });
    setCurrentAvatar(undefined);
    setPendingAvatarPreview(null);
    setAvatarError('');
    success('Photo Removed', 'Restored initials-based avatar.');
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      error('Full Name Required', 'Please enter your candidate name.');
      return;
    }

    StorageService.saveProfile({
      fullName: fullName.trim(),
      email: email.trim(),
      currentEducationLevel: educationLevel,
      fieldOfStudy: fieldOfStudy.trim(),
      graduationYear: gradYear.trim(),
      preferredExperienceLevel: expLevel,
      avatarUrl: currentAvatar,
      preferences: {
        emailNotifications: emailNotifs,
        roadmapReminders: roadmapReminders,
        highContrastMode: highContrast,
        compactView: profile.preferences?.compactView || false,
        includePhotoOnResume: includePhotoOnResume
      }
    });

    success('Profile Saved', 'Your profile details and preferences are safely updated.');
  };

  const handleConfirmReset = () => {
    StorageService.resetToCleanSlate();
    setResetModalOpen(false);
    success('Data Reset Complete', 'All demo data has been cleared. You are now on a fresh slate.');
  };

  const handleReloadDemo = () => {
    StorageService.initializeDefaults(true);
    success('Demo Restored', 'Re-initialized canonical sample data.');
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#D2B9E0] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#580F69]/10 text-[#580F69] text-xs font-bold mb-2">
              <Settings className="w-3.5 h-3.5" />
              <span>Settings & Local State</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#370D48] tracking-tight">
              Candidate Profile & Preferences
            </h1>
            <p className="text-xs sm:text-sm text-[#240D2F]/75 mt-1">
              Data is safely managed in browser local storage. No unencrypted cloud transmission.
            </p>
          </div>

          {profile.isDemoUser ? (
            <Badge variant="accent">Sample Demo Profile</Badge>
          ) : (
            <Badge variant="success">Personalized Profile</Badge>
          )}
        </div>
      </div>

      {/* FEATURE 1: PROFILE PICTURE SECTION */}
      <section aria-labelledby="profile-picture-heading" className="bg-white rounded-3xl p-6 sm:p-8 border border-[#D2B9E0] shadow-xs space-y-6">
        <div className="border-b border-[#F7F5F8] pb-3 flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 id="profile-picture-heading" className="text-lg font-bold text-[#370D48] flex items-center gap-2">
              <Camera className="w-5 h-5 text-[#580F69]" aria-hidden="true" />
              <span>Profile Picture</span>
            </h2>
            <p className="text-xs text-[#240D2F]/75 mt-0.5">
              Personalize your presence across CareerPilot AI.
            </p>
          </div>
          {currentAvatar && (
            <Badge variant="success" size="sm">
              Custom Photo Active
            </Badge>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar Preview */}
          <div className="relative shrink-0 flex flex-col items-center">
            <Avatar
              src={pendingAvatarPreview || currentAvatar}
              name={fullName || 'Candidate'}
              size="xl"
              alt={`${fullName || 'Candidate'}'s profile avatar preview`}
            />
            {pendingAvatarPreview && (
              <span className="mt-2 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                Unsaved Preview
              </span>
            )}
          </div>

          {/* Controls & Actions */}
          <div className="space-y-4 flex-1 text-center sm:text-left">
            <div>
              <h3 className="text-sm font-bold text-[#370D48]">
                {pendingAvatarPreview
                  ? 'Confirm New Profile Picture'
                  : currentAvatar
                  ? 'Manage Profile Picture'
                  : 'Upload Candidate Photo'}
              </h3>
              <p className="text-xs text-[#240D2F]/80 mt-1 leading-relaxed">
                Accepted formats: <strong>JPG, JPEG, PNG, WebP</strong>. Maximum file size: <strong>5 MB</strong>.
                Images are center-cropped and optimized locally.
              </p>
            </div>

            {/* Error Message if any */}
            {avatarError && (
              <div role="alert" className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-900 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
                <span>{avatarError}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-3 flex-wrap justify-center sm:justify-start">
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/jpg"
                onChange={handleFileSelect}
                disabled={isProcessingImage}
                className="hidden"
                id="profile-photo-file-input"
                aria-label="Upload profile photo file"
              />

              {pendingAvatarPreview ? (
                <>
                  <button
                    type="button"
                    onClick={handleSavePhoto}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#580F69] hover:bg-[#370D48] text-white font-bold text-xs shadow-sm transition-all min-h-[44px]"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#D2B9E0]" aria-hidden="true" />
                    <span>Save Photo</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelPhotoPreview}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#D2B9E0] text-[#370D48] font-semibold text-xs hover:bg-[#D2B9E0]/20 min-h-[44px]"
                  >
                    <X className="w-4 h-4" aria-hidden="true" />
                    <span>Cancel Preview</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isProcessingImage}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#580F69] hover:bg-[#370D48] text-white font-bold text-xs shadow-sm transition-all min-h-[44px]"
                  >
                    <Upload className="w-4 h-4 text-[#D2B9E0]" aria-hidden="true" />
                    <span>{isProcessingImage ? 'Processing...' : currentAvatar ? 'Change Photo' : 'Upload Photo'}</span>
                  </button>

                  {currentAvatar && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-red-200 text-red-700 hover:bg-red-50 font-bold text-xs transition-colors min-h-[44px]"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" aria-hidden="true" />
                      <span>Remove Photo</span>
                    </button>
                  )}
                </>
              )}
            </div>

            <div className="text-[11px] text-[#240D2F]/65 pt-1">
              ✓ Fallback to high-contrast initials avatar is automatically guaranteed if no photo is saved.
            </div>
          </div>
        </div>
      </section>

      {/* Main Settings Form */}
      <form onSubmit={handleSaveProfile} className="space-y-8">
        {/* Personal Details */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#D2B9E0] space-y-6 shadow-xs">
          <h2 className="text-lg font-bold text-[#370D48] flex items-center gap-2 border-b border-[#F7F5F8] pb-3">
            <UserCheck className="w-5 h-5 text-[#580F69]" aria-hidden="true" />
            <span>Personal Information</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="pref-fullname" className="block text-xs font-bold text-[#370D48] mb-1.5">
                Full Name *
              </label>
              <input
                id="pref-fullname"
                type="text"
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F5F8] border border-[#D2B9E0] text-sm text-[#370D48] focus:bg-white focus:border-[#580F69] focus:outline-none min-h-[44px]"
              />
            </div>

            <div>
              <label htmlFor="pref-email" className="block text-xs font-bold text-[#370D48] mb-1.5">
                Email Address
              </label>
              <input
                id="pref-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F5F8] border border-[#D2B9E0] text-sm text-[#370D48] focus:bg-white focus:border-[#580F69] focus:outline-none min-h-[44px]"
              />
            </div>
          </div>
        </div>

        {/* Education & Academic Credentials */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#D2B9E0] space-y-6 shadow-xs">
          <h2 className="text-lg font-bold text-[#370D48] flex items-center gap-2 border-b border-[#F7F5F8] pb-3">
            <GraduationCap className="w-5 h-5 text-[#580F69]" aria-hidden="true" />
            <span>Academic Background</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="pref-edulevel" className="block text-xs font-bold text-[#370D48] mb-1.5">
                Education Level
              </label>
              <select
                id="pref-edulevel"
                value={educationLevel}
                onChange={e => setEducationLevel(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F5F8] border border-[#D2B9E0] text-sm text-[#370D48] font-semibold min-h-[44px]"
              >
                <option value="High School / Diploma">High School / Diploma</option>
                <option value="Associate Degree">Associate Degree</option>
                <option value="Bachelor's Degree (Undergraduate)">Bachelor's Degree (Undergraduate)</option>
                <option value="Master's Degree / Graduate">Master's Degree / Graduate</option>
                <option value="Doctorate / PhD">Doctorate / PhD</option>
                <option value="Bootcamp / Self-Taught">Bootcamp / Self-Taught</option>
              </select>
            </div>

            <div>
              <label htmlFor="pref-study" className="block text-xs font-bold text-[#370D48] mb-1.5">
                Field of Study
              </label>
              <input
                id="pref-study"
                type="text"
                value={fieldOfStudy}
                onChange={e => setFieldOfStudy(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F5F8] border border-[#D2B9E0] text-sm text-[#370D48] min-h-[44px]"
              />
            </div>

            <div>
              <label htmlFor="pref-gradyear" className="block text-xs font-bold text-[#370D48] mb-1.5">
                Graduation Year
              </label>
              <input
                id="pref-gradyear"
                type="text"
                value={gradYear}
                onChange={e => setGradYear(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F5F8] border border-[#D2B9E0] text-sm text-[#370D48] min-h-[44px]"
              />
            </div>
          </div>
        </div>

        {/* Application Preferences */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#D2B9E0] space-y-4 shadow-xs">
          <h2 className="text-lg font-bold text-[#370D48] flex items-center gap-2 border-b border-[#F7F5F8] pb-3">
            <Sliders className="w-5 h-5 text-[#580F69]" aria-hidden="true" />
            <span>Preferences & Display Controls</span>
          </h2>

          <div className="space-y-3">
            <label className="flex items-center gap-3 p-3 rounded-xl bg-[#F7F5F8] border border-[#D2B9E0]/60 cursor-pointer">
              <input
                type="checkbox"
                checked={roadmapReminders}
                onChange={e => setRoadmapReminders(e.target.checked)}
                className="w-4 h-4 rounded text-[#580F69] focus:ring-[#580F69]"
              />
              <div className="text-xs">
                <span className="font-bold text-[#370D48]">Roadmap Learning Prompts</span>
                <p className="text-[11px] text-[#240D2F]/70">Show relevant next milestones when exploring careers and dashboard.</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-xl bg-[#F7F5F8] border border-[#D2B9E0]/60 cursor-pointer">
              <input
                type="checkbox"
                checked={highContrast}
                onChange={e => setHighContrast(e.target.checked)}
                className="w-4 h-4 rounded text-[#580F69] focus:ring-[#580F69]"
              />
              <div className="text-xs">
                <span className="font-bold text-[#370D48]">Maximum Text Contrast Enforcement</span>
                <p className="text-[11px] text-[#240D2F]/70">Strictly emphasize borders and pure dark-purple tones for accessibility.</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-xl bg-[#F7F5F8] border border-[#D2B9E0]/60 cursor-pointer">
              <input
                type="checkbox"
                checked={includePhotoOnResume}
                onChange={e => setIncludePhotoOnResume(e.target.checked)}
                className="w-4 h-4 rounded text-[#580F69] focus:ring-[#580F69]"
              />
              <div className="text-xs">
                <span className="font-bold text-[#370D48]">Include Profile Photo on Resume Exports</span>
                <p className="text-[11px] text-[#240D2F]/70">
                  Default is off for ATS compliance. Only enable if applying to jurisdictions or roles that explicitly request a photo.
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Save Form Actions */}
        <div className="flex justify-end gap-3">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#580F69] hover:bg-[#370D48] text-white font-bold text-sm shadow-md transition-all min-h-[44px]"
          >
            <Save className="w-4 h-4" aria-hidden="true" />
            <span>Save Profile & Preferences</span>
          </button>
        </div>
      </form>

      {/* Dangerous Zone / Reset State */}
      <div className="bg-red-50/70 rounded-3xl p-6 sm:p-8 border border-red-200 space-y-4">
        <h2 className="text-lg font-bold text-red-950 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-700" aria-hidden="true" />
          <span>Data Storage & Demo State Controls</span>
        </h2>
        <p className="text-xs text-red-900/80 leading-relaxed">
          CareerPilot AI stores your profile, roadmaps, and resume drafts in your browser's persistent storage. You can wipe all demo records to start fresh, or reload the sample exploration state.
        </p>

        <div className="flex items-center gap-3 flex-wrap pt-2">
          <button
            type="button"
            onClick={() => setResetModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs min-h-[44px]"
          >
            Clear All Data to Clean Slate
          </button>
          <button
            type="button"
            onClick={handleReloadDemo}
            className="px-4 py-2.5 rounded-xl border border-red-300 text-red-900 hover:bg-red-100/50 font-bold text-xs min-h-[44px]"
          >
            Reload Sample Demo Data
          </button>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      <Modal
        isOpen={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        title="Confirm Data Reset"
        description="Are you sure you want to clear your local data?"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950">
            <strong>What will be deleted:</strong>
            <ul className="list-disc ml-5 mt-1 space-y-1">
              <li>Candidate profile details, uploaded avatar, & academic records</li>
              <li>All active and customized roadmaps</li>
              <li>Saved resume drafts and analysis history</li>
              <li>Your personal skill inventory</li>
            </ul>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              onClick={() => setResetModalOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-[#D2B9E0] text-[#370D48] font-semibold text-xs min-h-[44px]"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmReset}
              className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs min-h-[44px]"
            >
              Yes, Clear Everything
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

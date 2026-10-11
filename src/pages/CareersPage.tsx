import React, { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  X,
  ArrowRight,
  TrendingUp,
  DollarSign,
  Compass,
  CheckCircle2,
  SlidersHorizontal,
  Briefcase
} from 'lucide-react';
import { StorageService, STORAGE_EVENT } from '../services/storage';
import { Career, Skill } from '../types';
import { Badge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';

export const CareersPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [careers, setCareers] = useState<Career[]>(StorageService.getCareers());
  const [savedSkills, setSavedSkills] = useState<Skill[]>(StorageService.getSavedSkills());

  // Filter and Search states
  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedExperience, setSelectedExperience] = useState<string>('All');
  const [selectedSkillFilter, setSelectedSkillFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'relevance' | 'title' | 'growth'>('relevance');

  useEffect(() => {
    const handleUpdate = () => {
      setCareers(StorageService.getCareers());
      setSavedSkills(StorageService.getSavedSkills());
    };
    window.addEventListener(STORAGE_EVENT, handleUpdate);
    return () => window.removeEventListener(STORAGE_EVENT, handleUpdate);
  }, []);

  // Update URL search query if user types in search
  useEffect(() => {
    if (search) {
      setSearchParams({ search });
    } else {
      setSearchParams({});
    }
  }, [search, setSearchParams]);

  // Derived filter categories
  const categories = useMemo(() => {
    const set = new Set(careers.map(c => c.category));
    return ['All', ...Array.from(set)];
  }, [careers]);

  const experienceLevels = ['All', 'Entry-Level', 'Mid-Level', 'Senior'];

  const allAvailableSkills = useMemo(() => {
    const set = new Set<string>();
    careers.forEach(c => {
      c.requiredSkills.forEach(s => set.add(s.name));
    });
    return ['All', ...Array.from(set).sort()];
  }, [careers]);

  // Filtered and Sorted list
  const filteredCareers = useMemo(() => {
    return careers
      .filter(c => {
        // Search filter
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchTitle = c.title.toLowerCase().includes(q);
          const matchDesc = c.shortDescription.toLowerCase().includes(q) || c.fullDescription.toLowerCase().includes(q);
          const matchSkills = c.requiredSkills.some(s => s.name.toLowerCase().includes(q));
          const matchTools = c.toolsAndTechnologies.some(t => t.toLowerCase().includes(q));
          if (!matchTitle && !matchDesc && !matchSkills && !matchTools) return false;
        }

        // Category filter
        if (selectedCategory !== 'All' && c.category !== selectedCategory) {
          return false;
        }

        // Experience filter
        if (selectedExperience !== 'All' && c.experienceLevel !== selectedExperience && c.experienceLevel !== 'All Levels') {
          return false;
        }

        // Skill filter
        if (selectedSkillFilter !== 'All') {
          const hasSkill = c.requiredSkills.some(s => s.name.toLowerCase() === selectedSkillFilter.toLowerCase());
          if (!hasSkill) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'title') {
          return a.title.localeCompare(b.title);
        }
        if (sortBy === 'growth') {
          return b.projectedGrowth.localeCompare(a.projectedGrowth);
        }
        // Relevance default (checks how many skills candidate already possesses)
        const savedNames = new Set(savedSkills.map(s => s.name.toLowerCase()));
        const aMatches = a.requiredSkills.filter(s => savedNames.has(s.name.toLowerCase())).length;
        const bMatches = b.requiredSkills.filter(s => savedNames.has(s.name.toLowerCase())).length;
        return bMatches - aMatches;
      });
  }, [careers, search, selectedCategory, selectedExperience, selectedSkillFilter, sortBy, savedSkills]);

  const resetFilters = () => {
    setSearch('');
    setSelectedCategory('All');
    setSelectedExperience('All');
    setSelectedSkillFilter('All');
    setSortBy('relevance');
  };

  const hasActiveFilters = search || selectedCategory !== 'All' || selectedExperience !== 'All' || selectedSkillFilter !== 'All';

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#D2B9E0] shadow-xs">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#580F69]/10 text-[#580F69] text-xs font-bold mb-3">
            <Briefcase className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Interactive Career Catalog</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#370D48] tracking-tight">
            Discover Tech Career Paths
          </h1>
          <p className="text-sm sm:text-base text-[#240D2F]/80 mt-2 leading-relaxed">
            Examine in-depth role profiles, essential technical skill requirements, modern tools, expected salary ranges, and recommended learning routes.
          </p>
        </div>

        {/* Search Bar */}
        <div className="mt-8 max-w-2xl">
          <label htmlFor="career-search-input" className="sr-only">
            Search careers by title, tools, or keywords
          </label>
          <div className="relative">
            <Search className="w-5 h-5 text-[#580F69] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
            <input
              id="career-search-input"
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search careers, e.g. 'Software Developer', 'Cybersecurity', 'AWS', 'Python'..."
              className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-[#F7F5F8] border border-[#D2B9E0] text-[#240D2F] placeholder-[#240D2F]/50 text-sm sm:text-base focus:bg-white focus:border-[#580F69] focus:outline-none transition-all shadow-inner"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#370D48]/60 hover:text-[#370D48] p-1.5 rounded-lg"
                aria-label="Clear search query"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="mt-6 pt-6 border-t border-[#F7F5F8] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Category Filter */}
          <div>
            <label htmlFor="category-select" className="block text-xs font-bold text-[#370D48] mb-1.5">
              Category
            </label>
            <select
              id="category-select"
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-white border border-[#D2B9E0] text-sm text-[#370D48] focus:border-[#580F69] focus:outline-none min-h-[44px]"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Experience Filter */}
          <div>
            <label htmlFor="experience-select" className="block text-xs font-bold text-[#370D48] mb-1.5">
              Experience Level
            </label>
            <select
              id="experience-select"
              value={selectedExperience}
              onChange={e => setSelectedExperience(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-white border border-[#D2B9E0] text-sm text-[#370D48] focus:border-[#580F69] focus:outline-none min-h-[44px]"
            >
              {experienceLevels.map(lvl => (
                <option key={lvl} value={lvl}>
                  {lvl}
                </option>
              ))}
            </select>
          </div>

          {/* Required Skill Filter */}
          <div>
            <label htmlFor="skill-filter-select" className="block text-xs font-bold text-[#370D48] mb-1.5">
              Required Skill
            </label>
            <select
              id="skill-filter-select"
              value={selectedSkillFilter}
              onChange={e => setSelectedSkillFilter(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-white border border-[#D2B9E0] text-sm text-[#370D48] focus:border-[#580F69] focus:outline-none min-h-[44px]"
            >
              {allAvailableSkills.map(sk => (
                <option key={sk} value={sk}>
                  {sk}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label htmlFor="sort-select" className="block text-xs font-bold text-[#370D48] mb-1.5">
              Sort By
            </label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2.5 rounded-xl bg-white border border-[#D2B9E0] text-sm text-[#370D48] focus:border-[#580F69] focus:outline-none min-h-[44px]"
            >
              <option value="relevance">Relevance & Match</option>
              <option value="title">Alphabetical (A - Z)</option>
              <option value="growth">Projected Industry Growth</option>
            </select>
          </div>
        </div>

        {/* Active Filters Bar */}
        {hasActiveFilters && (
          <div className="mt-4 flex items-center justify-between flex-wrap gap-2 pt-3 border-t border-[#F7F5F8]">
            <div className="text-xs text-[#240D2F]/75">
              Showing <span className="font-bold text-[#370D48]">{filteredCareers.length}</span> of {careers.length} careers
            </div>
            <button
              onClick={resetFilters}
              className="text-xs font-bold text-[#580F69] hover:text-[#370D48] hover:underline flex items-center gap-1 p-1 rounded"
            >
              <X className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Reset all filters</span>
            </button>
          </div>
        )}
      </div>

      {/* Career Cards Grid */}
      {filteredCareers.length === 0 ? (
        <EmptyState
          icon={Compass}
          title="No careers found"
          description={`No career paths match your criteria ("${search || selectedCategory}"). Try broadening your search or resetting filters.`}
          actionText="Reset Filters"
          onAction={resetFilters}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCareers.map(career => {
            // Count candidate skill overlaps
            const savedSkillNames = new Set(savedSkills.map(s => s.name.toLowerCase()));
            const matchedSkillsCount = career.requiredSkills.filter(req => {
              const reqLower = req.name.toLowerCase();
              return Array.from(savedSkillNames).some(userSkill => reqLower.includes(userSkill) || userSkill.includes(reqLower));
            }).length;

            return (
              <div
                key={career.id}
                className="bg-white rounded-2xl p-6 border-2 border-[#D2B9E0] hover:border-[#580F69] shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Category and Experience Badge */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <Badge variant="primary" size="sm">
                      {career.category}
                    </Badge>
                    <span className="text-xs text-[#240D2F]/70 font-medium">
                      {career.experienceLevel}
                    </span>
                  </div>

                  {/* Career Title */}
                  <h2 className="text-xl font-bold text-[#370D48] tracking-tight">
                    <Link to={`/careers/${career.id}`} className="hover:text-[#580F69] hover:underline focus:outline-none focus:ring-2 focus:ring-[#580F69] rounded">
                      {career.title}
                    </Link>
                  </h2>

                  {/* Short Description */}
                  <p className="text-xs sm:text-sm text-[#240D2F]/80 mt-2.5 line-clamp-3 leading-relaxed">
                    {career.shortDescription}
                  </p>

                  {/* Compensation & Growth Metrics */}
                  <div className="mt-4 p-3 rounded-xl bg-[#F7F5F8] border border-[#D2B9E0]/50 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[#240D2F]/70 flex items-center gap-1">
                        <DollarSign className="w-3.5 h-3.5 text-[#580F69]" aria-hidden="true" />
                        <span>Salary Range:</span>
                      </span>
                      <span className="font-bold text-[#370D48]">{career.medianSalaryRange}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#240D2F]/70 flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                        <span>Growth:</span>
                      </span>
                      <span className="font-semibold text-emerald-800">{career.projectedGrowth}</span>
                    </div>
                  </div>

                  {/* Required Skills Snapshot */}
                  <div className="mt-4">
                    <div className="text-xs font-bold text-[#370D48] mb-1.5 flex items-center justify-between">
                      <span>Key Skills ({career.requiredSkills.length})</span>
                      <span className="text-[11px] text-[#580F69] font-semibold">
                        {matchedSkillsCount}/{career.requiredSkills.length} you have
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {career.requiredSkills.slice(0, 4).map((s, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] px-2 py-0.5 rounded-md bg-[#D2B9E0]/30 text-[#370D48] font-medium border border-[#D2B9E0]/70"
                        >
                          {s.name}
                        </span>
                      ))}
                      {career.requiredSkills.length > 4 && (
                        <span className="text-[11px] px-2 py-0.5 rounded-md bg-[#F7F5F8] text-[#240D2F]/70">
                          +{career.requiredSkills.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer action */}
                <div className="mt-6 pt-4 border-t border-[#F7F5F8] flex items-center justify-between">
                  <Link
                    to={`/careers/${career.id}`}
                    className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 px-4 rounded-xl bg-[#580F69] hover:bg-[#370D48] text-white font-bold text-xs transition-colors shadow-xs min-h-[44px]"
                  >
                    <span>View Role Details & Gap Analysis</span>
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

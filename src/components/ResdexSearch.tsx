import React, { useState, useMemo, useRef } from 'react';
import { Candidate, CandidateStatus, JobCategory, PostingScope, WorkforceSegment } from '../types';
import {
  PAN_INDIA_CITIES,
  INTERNATIONAL_DESTINATIONS,
  FUNCTIONAL_CATEGORIES_AZ,
  POSITION_CATALOG_AZ,
  inferWorkforceSegment,
  matchesKeywordQuery,
  matchesNoticeFilter,
  matchesExperienceFilter,
  matchesSalaryFilter,
  enrichCandidate,
} from '../lib/naukriFilters';
import {
  exportCandidatesToExcel,
  parseCandidatesFromExcelFile,
} from '../lib/excelExport';
import { SearchableCategoryPicker, SearchableTitlePicker } from './SearchableCatalogPicker';
import {
  Search,
  MapPin,
  Briefcase,
  Clock,
  IndianRupee,
  Sparkles,
  PhoneCall,
  Calendar,
  FileText,
  Download,
  AlertCircle,
  Copy,
  Zap,
  Globe,
  Building2,
  UserCheck,
  RotateCcw,
  SlidersHorizontal,
  UserPlus,
  Upload,
  FileSpreadsheet,
  Database,
  X,
  ArrowDownAZ,
  Trash2,
} from 'lucide-react';

interface ResdexSearchProps {
  candidates: Candidate[];
  onSelectCandidateForCall: (candidate: Candidate) => void;
  onScheduleInterview: (candidate: Candidate) => void;
  onOpenCandidateModal: (candidate: Candidate) => void;
  onUpdateCandidateStatus: (candidateId: string, newStatus: CandidateStatus) => void;
  onExportToCsv: (candidates: Candidate[]) => void;
  onAddCandidate?: (candidate: Candidate) => Promise<void> | void;
  onImportCandidates?: (candidates: Candidate[]) => Promise<void> | void;
  onDeleteCandidate?: (candidateId: string) => Promise<void> | void;
  onDeleteCandidatesBatch?: (candidateIds: string[]) => Promise<void> | void;
}

const NOTICE_OPTIONS = [
  { id: 'all', label: 'All Notice' },
  { id: 'immediate', label: 'Immediate Joiner' },
  { id: '0_days', label: '0 Days' },
  { id: '15_days', label: '15 Days' },
  { id: '1_month', label: '1 Month' },
  { id: 'negotiable', label: '2 Months / Negotiable' },
];

const ALPHABET_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export const ResdexSearch: React.FC<ResdexSearchProps> = ({
  candidates,
  onSelectCandidateForCall,
  onScheduleInterview,
  onOpenCandidateModal,
  onExportToCsv,
  onAddCandidate,
  onImportCandidates,
  onDeleteCandidate,
  onDeleteCandidatesBatch,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [selectedCompany, setSelectedCompany] = useState<string>('all');
  const [selectedGender, setSelectedGender] = useState<string>('all');
  const [noticeFilter, setNoticeFilter] = useState<string>('all');
  const [minExp, setMinExp] = useState<string>('all');
  const [salaryFilter, setSalaryFilter] = useState<string>('all');
  const [letterFilter, setLetterFilter] = useState<string>('ALL');
  const [positionFilter, setPositionFilter] = useState<string>('all');
  const [segmentFilter, setSegmentFilter] = useState<'all' | WorkforceSegment>('all');
  const [sortBy, setSortBy] = useState<'role-az' | 'name-az' | 'score'>('role-az');
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>([]);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [dbFeedback, setDbFeedback] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmBatchDelete, setConfirmBatchDelete] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Add Candidate to Database form state
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newDesignation, setNewDesignation] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newCategory, setNewCategory] = useState<JobCategory>('Accounting & Finance');
  const [newScope, setNewScope] = useState<PostingScope>('domestic');
  const [newCountry, setNewCountry] = useState('India');
  const [newLocation, setNewLocation] = useState('Durg, Chhattisgarh');
  const [newGender, setNewGender] = useState<'Male' | 'Female' | 'Any'>('Any');
  const [newExp, setNewExp] = useState('3 years');
  const [newCurrentSalary, setNewCurrentSalary] = useState('30,000 / month');
  const [newExpectedSalary, setNewExpectedSalary] = useState('38,000 / month');
  const [newNotice, setNewNotice] = useState('Immediate Joiner');
  const [newSkills, setNewSkills] = useState('Tally Prime, GST, Excel');

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const imported = await parseCandidatesFromExcelFile(file);
      if (imported.length === 0) {
        setDbFeedback('No valid candidate rows found in the uploaded Excel/CSV file.');
      } else {
        await onImportCandidates?.(imported);
        setDbFeedback(`Imported ${imported.length} candidate profile(s) into your encrypted Firestore database.`);
      }
    } catch {
      setDbFeedback('Unable to read the Excel/CSV file. Please ensure columns include Name and Contact/Phone.');
    } finally {
      e.target.value = '';
      setTimeout(() => setDbFeedback(null), 5000);
    }
  };

  const handleCreateCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim() || !newDesignation.trim()) return;
    const today = new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    const created = enrichCandidate({
      id: `cand-db-${Date.now()}`,
      name: newName.trim(),
      contact: newPhone.trim(),
      email: newEmail.trim() || `${newName.trim().toLowerCase().replace(/[^a-z0-9]/g, '')}@gmail.com`,
      location: newLocation.trim() || 'Durg, Chhattisgarh',
      country: newScope === 'international' ? newCountry : 'India',
      scope: newScope,
      company: newCompany.trim() || 'Verified Corporate Employer',
      gender: newGender,
      designation: newDesignation.trim(),
      category: newCategory,
      experience: newExp.trim() || '2 years',
      currentSalary: newCurrentSalary.trim() || 'Negotiable',
      expectedSalary: newExpectedSalary.trim() || 'Negotiable',
      noticePeriod: newNotice,
      sourceDate: today,
      skills: newSkills.split(',').map((s) => s.trim()).filter(Boolean),
      status: 'sourced',
      aiScore: 82,
    });
    await onAddCandidate?.(created);
    setShowAddModal(false);
    setNewName('');
    setNewPhone('');
    setNewEmail('');
    setNewDesignation('');
    setDbFeedback(`Saved ${created.name} into encrypted Resdex Firestore Database.`);
    setTimeout(() => setDbFeedback(null), 4500);
  };

  const uniqueCompanies = useMemo(() => {
    const companies = Array.from(
      new Set(candidates.map((c) => c.company).filter((v): v is string => Boolean(v)))
    );
    return companies.sort((a, b) => a.localeCompare(b));
  }, [candidates]);

  const extraCandidateLocations = useMemo(() => {
    const base = new Set([...PAN_INDIA_CITIES, ...INTERNATIONAL_DESTINATIONS].map((s) => s.toLowerCase()));
    return Array.from(new Set(candidates.map((c) => c.location)))
      .filter((loc) => !base.has(loc.toLowerCase()))
      .sort();
  }, [candidates]);

  const availableCandidateLetters = useMemo(() => {
    const set = new Set<string>();
    candidates.forEach((c) => {
      const first = c.designation.trim().charAt(0).toUpperCase();
      if (first >= 'A' && first <= 'Z') set.add(first);
    });
    return set;
  }, [candidates]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchTerm.trim()) count++;
    if (selectedIndustry !== 'all') count++;
    if (selectedLocation !== 'all') count++;
    if (selectedCompany !== 'all') count++;
    if (selectedGender !== 'all') count++;
    if (noticeFilter !== 'all') count++;
    if (minExp !== 'all') count++;
    if (salaryFilter !== 'all') count++;
    if (letterFilter !== 'ALL') count++;
    if (positionFilter !== 'all') count++;
    if (segmentFilter !== 'all') count++;
    return count;
  }, [
    searchTerm,
    selectedIndustry,
    selectedLocation,
    selectedCompany,
    selectedGender,
    noticeFilter,
    minExp,
    salaryFilter,
    letterFilter,
    positionFilter,
    segmentFilter,
  ]);

  const resetAllFilters = () => {
    setSearchTerm('');
    setSelectedIndustry('all');
    setSelectedLocation('all');
    setSelectedCompany('all');
    setSelectedGender('all');
    setNoticeFilter('all');
    setMinExp('all');
    setSalaryFilter('all');
    setLetterFilter('ALL');
    setPositionFilter('all');
    setSegmentFilter('all');
  };

  const filteredCandidates = useMemo(() => {
    const filtered = candidates.filter((c) => {
      // 1. Keywords across name, designation, skills, company, industry/category, location, country, contact
      const matchesKeywords = matchesKeywordQuery(searchTerm, [
        c.name,
        c.designation,
        c.company,
        c.category,
        c.location,
        c.country,
        c.contact,
        c.email,
        c.screeningNotes,
        ...c.skills,
      ]);

      // 2. Industry / Category
      const matchesIndustry = selectedIndustry === 'all' || c.category === selectedIndustry;

      // 3. Location (Pan-India, CG Local, International, or specific city/country)
      let matchesLocation = true;
      const locLower = c.location.toLowerCase();
      const countryLower = (c.country || 'India').toLowerCase();
      const isIntl = c.scope === 'international' || countryLower !== 'india';

      if (selectedLocation === 'cg') {
        matchesLocation =
          locLower.includes('durg') ||
          locLower.includes('bhilai') ||
          locLower.includes('raipur') ||
          locLower.includes('bilaspur') ||
          locLower.includes('ambikapur') ||
          locLower.includes('chhattisgarh');
      } else if (selectedLocation === 'pan-india') {
        matchesLocation = !isIntl;
      } else if (selectedLocation === 'international') {
        matchesLocation = isIntl;
      } else if (selectedLocation !== 'all') {
        const target = selectedLocation.toLowerCase();
        matchesLocation =
          locLower.includes(target) ||
          countryLower.includes(target) ||
          (target === 'delhi ncr' &&
            (locLower.includes('delhi') ||
              locLower.includes('noida') ||
              locLower.includes('ghaziabad')));
      }

      // 4. Company filter
      const matchesCompany =
        selectedCompany === 'all' ||
        (c.company || '').toLowerCase() === selectedCompany.toLowerCase();

      // 5. Gender filter
      const matchesGender =
        selectedGender === 'all' ||
        (c.gender || 'Any').toLowerCase() === selectedGender.toLowerCase();

      // 6. Notice Period filter (Immediate Joiner, 0 Days, 15 Days, 1 Month, Negotiable)
      const matchesNotice = matchesNoticeFilter(c.noticePeriod, noticeFilter);

      // 7. Experience filter
      const matchesExp = matchesExperienceFilter(c.experience, minExp);

      // 8. Salary filter
      const matchesSalary = matchesSalaryFilter(c.currentSalary || c.expectedSalary, salaryFilter);

      // 9. A-Z Alphabet & Position Catalog filter
      const matchesLetter =
        letterFilter === 'ALL' ||
        c.designation.trim().toUpperCase().startsWith(letterFilter);

      const matchesPosition =
        positionFilter === 'all' ||
        c.designation.toLowerCase().includes(positionFilter.toLowerCase()) ||
        c.designation.toLowerCase().includes(positionFilter.split('(')[0].trim().toLowerCase());

      // 10. Workforce Segment (IT / Non-IT / Blue Collar)
      const candSegment = inferWorkforceSegment(c.category, c.designation, c.skills);
      const matchesSegment = segmentFilter === 'all' || candSegment === segmentFilter;

      return (
        matchesKeywords &&
        matchesIndustry &&
        matchesLocation &&
        matchesCompany &&
        matchesGender &&
        matchesNotice &&
        matchesExp &&
        matchesSalary &&
        matchesLetter &&
        matchesPosition &&
        matchesSegment
      );
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === 'name-az') return a.name.localeCompare(b.name);
      if (sortBy === 'score') return (b.aiScore || 0) - (a.aiScore || 0);
      return a.designation.localeCompare(b.designation);
    });
  }, [
    candidates,
    searchTerm,
    selectedIndustry,
    selectedLocation,
    selectedCompany,
    selectedGender,
    noticeFilter,
    minExp,
    salaryFilter,
    letterFilter,
    positionFilter,
    segmentFilter,
    sortBy,
  ]);

  const handleSelectAll = () => {
    if (selectedCandidateIds.length === filteredCandidates.length) {
      setSelectedCandidateIds([]);
    } else {
      setSelectedCandidateIds(filteredCandidates.map((c) => c.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedCandidateIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleCopyContact = (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopySuccess(text);
    setTimeout(() => setCopySuccess(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Naukri Resdex Advanced Filter Panel */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
          {/* Keywords Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              id="resdex-search-input"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Keywords: skills, designation, company, location, or mobile (e.g. Tally Durg, PySpark Bengaluru, Dubai)..."
              className="w-full pl-10 pr-16 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-700/30 focus:border-emerald-700 transition-all"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-700 font-bold cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick Region Scope Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => setSelectedLocation('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                selectedLocation === 'all'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              All Regions
            </button>
            <button
              type="button"
              onClick={() => setSelectedLocation('pan-india')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                selectedLocation === 'pan-india'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              All Pan India
            </button>
            <button
              type="button"
              onClick={() => setSelectedLocation('cg')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1 ${
                selectedLocation === 'cg'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
              }`}
            >
              <MapPin className="w-3 h-3 text-amber-500" />
              <span>Durg / CG Local</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedLocation('international')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1 ${
                selectedLocation === 'international'
                  ? 'bg-sky-700 text-white shadow-xs'
                  : 'bg-sky-50 text-sky-900 border border-sky-200 hover:bg-sky-100'
              }`}
            >
              <Globe className="w-3 h-3 text-sky-600" />
              <span>International</span>
            </button>
          </div>
        </div>

        {/* Naukri Portal Structured Filters Grid */}
        <div className="pt-4 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          {/* Location (Pan India & International) */}
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-stone-400" />
              <span>Locations (India &amp; Global)</span>
            </label>
            <select
              id="filter-location"
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg text-stone-800 focus:outline-none focus:ring-1 focus:ring-emerald-700 cursor-pointer"
            >
              <optgroup label="Region Scopes">
                <option value="all">All Locations (India &amp; Global)</option>
                <option value="pan-india">All Pan India</option>
                <option value="cg">Chhattisgarh (Durg, Bhilai, Raipur)</option>
                <option value="international">All International Destinations</option>
              </optgroup>
              <optgroup label="Pan-India Cities">
                {PAN_INDIA_CITIES.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </optgroup>
              <optgroup label="International Countries">
                {INTERNATIONAL_DESTINATIONS.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </optgroup>
              {extraCandidateLocations.length > 0 && (
                <optgroup label="Other Candidate Locations">
                  {extraCandidateLocations.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>

          {/* Functional Category (A-Z) */}
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1 flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5 text-stone-400" />
              <span>Functional Category (A–Z)</span>
            </label>
            <select
              id="filter-category"
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg text-stone-800 focus:outline-none focus:ring-1 focus:ring-emerald-700 cursor-pointer"
            >
              <option value="all">All Categories (A–Z)</option>
              {FUNCTIONAL_CATEGORIES_AZ.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Company */}
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-stone-400" />
              <span>Company</span>
            </label>
            <select
              id="filter-company"
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg text-stone-800 focus:outline-none focus:ring-1 focus:ring-emerald-700 cursor-pointer"
            >
              <option value="all">All Companies ({uniqueCompanies.length})</option>
              {uniqueCompanies.map((comp) => (
                <option key={comp} value={comp}>
                  {comp}
                </option>
              ))}
            </select>
          </div>

          {/* Gender */}
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1 flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5 text-stone-400" />
              <span>Gender</span>
            </label>
            <select
              id="filter-gender"
              value={selectedGender}
              onChange={(e) => setSelectedGender(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg text-stone-800 focus:outline-none focus:ring-1 focus:ring-emerald-700 cursor-pointer"
            >
              <option value="all">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          {/* Experience */}
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-stone-400" />
              <span>Experience</span>
            </label>
            <select
              id="filter-experience"
              value={minExp}
              onChange={(e) => setMinExp(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg text-stone-800 focus:outline-none focus:ring-1 focus:ring-emerald-700 cursor-pointer"
            >
              <option value="all">Any Experience</option>
              <option value="fresher">Fresher (0 - 1 Yr)</option>
              <option value="1-3">1 - 3 Years</option>
              <option value="3-5">3 - 5 Years</option>
              <option value="5-8">5 - 8 Years</option>
              <option value="8+">8+ Years (Senior)</option>
            </select>
          </div>

          {/* Salary */}
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1 flex items-center gap-1">
              <IndianRupee className="w-3.5 h-3.5 text-stone-400" />
              <span>Salary Bracket</span>
            </label>
            <select
              id="filter-salary"
              value={salaryFilter}
              onChange={(e) => setSalaryFilter(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg text-stone-800 focus:outline-none focus:ring-1 focus:ring-emerald-700 cursor-pointer"
            >
              <option value="all">Any Salary / CTC</option>
              <option value="0-25k">Up to ₹25k/mo (≤ 3 LPA)</option>
              <option value="25k-50k">₹25k - ₹50k/mo (3 - 6 LPA)</option>
              <option value="50k-1l">₹50k - ₹1L/mo (6 - 12 LPA)</option>
              <option value="1l+">₹1L+/mo (12+ LPA)</option>
              <option value="intl">International (AED/SAR/SGD/£/€)</option>
            </select>
          </div>
        </div>

        {/* Notice Period Quick Pills & Active Filter Reset */}
        <div className="pt-3 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-semibold text-stone-600 flex items-center gap-1 mr-1">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              Notice Period:
            </span>
            {NOTICE_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setNoticeFilter(opt.id)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer transition-all ${
                  noticeFilter === opt.id
                    ? 'bg-emerald-800 text-white shadow-2xs'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={resetAllFilters}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 cursor-pointer self-start sm:self-auto"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset All ({activeFilterCount})</span>
            </button>
          )}
        </div>

        {/* Alphabetical A-Z Position Filter, Workforce Segment (IT / Non-IT / Blue Collar) & Sort Controls */}
        <div className="pt-3 border-t border-stone-100 space-y-2.5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2 flex-wrap flex-1">
              <span className="text-xs font-semibold text-stone-700 flex items-center gap-1">
                <ArrowDownAZ className="w-3.5 h-3.5 text-emerald-700" />
                <span>Position (A–Z):</span>
              </span>
              <select
                id="resdex-filter-position-az"
                value={positionFilter}
                onChange={(e) => setPositionFilter(e.target.value)}
                className="px-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg text-stone-800 focus:outline-none focus:ring-1 focus:ring-emerald-700 cursor-pointer max-w-xs"
              >
                <option value="all">All Standard Positions (A–Z)</option>
                {POSITION_CATALOG_AZ.map((pos) => (
                  <option key={pos.title} value={pos.title}>
                    {pos.title} [{pos.segment}]
                  </option>
                ))}
              </select>

              <div className="inline-flex items-center gap-1 bg-stone-100 p-1 rounded-lg text-[11px] font-bold">
                {(['all', 'IT', 'Non-IT', 'Blue Collar'] as const).map((seg) => (
                  <button
                    key={seg}
                    type="button"
                    onClick={() => setSegmentFilter(seg)}
                    className={`px-2.5 py-1 rounded-md cursor-pointer transition-all ${
                      segmentFilter === seg
                        ? seg === 'Blue Collar'
                          ? 'bg-amber-600 text-white shadow-2xs'
                          : seg === 'IT'
                          ? 'bg-sky-700 text-white shadow-2xs'
                          : 'bg-emerald-800 text-white shadow-2xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    {seg === 'all' ? 'All (IT + Non-IT + Blue Collar)' : seg}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="resdex-sort-by" className="text-xs font-semibold text-stone-600">
                Sort:
              </label>
              <select
                id="resdex-sort-by"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'role-az' | 'name-az' | 'score')}
                className="px-2.5 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg text-stone-800 font-semibold cursor-pointer"
              >
                <option value="role-az">Position (A → Z)</option>
                <option value="name-az">Candidate Name (A → Z)</option>
                <option value="score">AI Match Score</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1 flex-wrap">
            <button
              type="button"
              onClick={() => setLetterFilter('ALL')}
              className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                letterFilter === 'ALL'
                  ? 'bg-emerald-800 text-white'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              All
            </button>
            {ALPHABET_LETTERS.map((letter) => {
              const hasProfiles = availableCandidateLetters.has(letter);
              const isSelected = letterFilter === letter;
              return (
                <button
                  key={letter}
                  type="button"
                  onClick={() => setLetterFilter(letter)}
                  className={`w-6 h-6 rounded text-[11px] font-bold cursor-pointer transition-colors flex items-center justify-center ${
                    isSelected
                      ? 'bg-emerald-800 text-white shadow-2xs'
                      : hasProfiles
                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100'
                      : 'bg-stone-50 text-stone-400 border border-stone-200 hover:bg-stone-100'
                  }`}
                  title={hasProfiles ? `Filter roles starting with ${letter}` : `No candidates starting with ${letter}`}
                >
                  {letter}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Batch Operations Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-stone-100/80 p-3 rounded-lg border border-stone-200">
        <div className="flex items-center gap-3 text-xs text-stone-700 flex-wrap">
          <label className="flex items-center gap-2 cursor-pointer font-medium">
            <input
              type="checkbox"
              checked={
                filteredCandidates.length > 0 &&
                selectedCandidateIds.length === filteredCandidates.length
              }
              onChange={handleSelectAll}
              className="w-4 h-4 text-emerald-700 rounded border-stone-300 cursor-pointer"
            />
            <span>
              Select All ({filteredCandidates.length} profiles matching)
            </span>
          </label>
          {activeFilterCount > 0 && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-900 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
              <SlidersHorizontal className="w-3 h-3" />
              {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} active
            </span>
          )}
          {selectedCandidateIds.length > 0 && (
            <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
              {selectedCandidateIds.length} selected
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleImportExcel}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-emerald-800 text-white rounded-lg hover:bg-emerald-900 cursor-pointer shadow-xs"
          >
            <UserPlus className="w-3.5 h-3.5 text-amber-300" />
            <span>Add to Database</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-amber-50 border border-amber-300 text-amber-900 rounded-lg hover:bg-amber-100 cursor-pointer shadow-2xs"
          >
            <Upload className="w-3.5 h-3.5 text-amber-700" />
            <span>Import Excel / CSV</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const toExport =
                selectedCandidateIds.length > 0
                  ? candidates.filter((c) => selectedCandidateIds.includes(c.id))
                  : filteredCandidates;
              exportCandidatesToExcel(toExport);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-emerald-300 text-emerald-900 rounded-lg hover:bg-emerald-50 cursor-pointer shadow-2xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
            <span>Excel (.xlsx)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const toExport =
                selectedCandidateIds.length > 0
                  ? candidates.filter((c) => selectedCandidateIds.includes(c.id))
                  : filteredCandidates;
              onExportToCsv(toExport);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-stone-300 text-stone-700 rounded-lg hover:bg-stone-50 cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-stone-600" />
            <span>CSV</span>
          </button>

          {selectedCandidateIds.length > 0 && (
            <>
              <button
                type="button"
                onClick={() => {
                  const first = candidates.find((c) => selectedCandidateIds.includes(c.id));
                  if (first) onSelectCandidateForCall(first);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-stone-900 text-white rounded-lg hover:bg-stone-800 cursor-pointer shadow-xs"
              >
                <PhoneCall className="w-3.5 h-3.5 text-amber-300" />
                <span>Launch AI Calling Batch</span>
              </button>

              {onDeleteCandidatesBatch && (
                confirmBatchDelete ? (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-rose-50 border border-rose-200 rounded-lg text-xs">
                    <span className="font-bold text-rose-900">
                      Delete {selectedCandidateIds.length}?
                    </span>
                    <button
                      type="button"
                      onClick={async () => {
                        const toDelete = [...selectedCandidateIds];
                        setConfirmBatchDelete(false);
                        setSelectedCandidateIds([]);
                        await onDeleteCandidatesBatch(toDelete);
                        setDbFeedback(`Deleted ${toDelete.length} candidate profile(s) from Firestore database.`);
                        setTimeout(() => setDbFeedback(null), 4000);
                      }}
                      className="px-2 py-0.5 bg-rose-700 hover:bg-rose-800 text-white rounded font-bold cursor-pointer"
                    >
                      Confirm
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmBatchDelete(false)}
                      className="px-2 py-0.5 bg-white border border-stone-300 text-stone-700 rounded font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmBatchDelete(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-rose-50 border border-rose-200 text-rose-800 rounded-lg hover:bg-rose-100 cursor-pointer shadow-2xs"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Selected ({selectedCandidateIds.length})</span>
                  </button>
                )
              )}
            </>
          )}
        </div>
      </div>

      {dbFeedback && (
        <div className="px-4 py-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2">
          <Database className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{dbFeedback}</span>
        </div>
      )}

      {/* Candidates List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCandidates.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-white rounded-xl border border-dashed border-stone-300 p-8">
            <AlertCircle className="w-10 h-10 text-stone-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-stone-800">No candidates match your filters</h3>
            <p className="text-xs text-stone-500 mt-1 max-w-md mx-auto">
              Try broadening your keywords, switching notice period to "All Notice", or expanding to Pan-India / International locations.
            </p>
            <button
              type="button"
              onClick={resetAllFilters}
              className="mt-4 px-4 py-2 text-xs font-semibold bg-stone-800 text-white rounded-lg hover:bg-stone-900 cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          filteredCandidates.map((c) => {
            const isSelected = selectedCandidateIds.includes(c.id);
            const isLocalCG =
              c.location.toLowerCase().includes('durg') ||
              c.location.toLowerCase().includes('bhilai') ||
              c.location.toLowerCase().includes('raipur') ||
              c.location.toLowerCase().includes('chhattisgarh');

            return (
              <div
                key={c.id}
                className={`bg-white rounded-xl border transition-all p-4 flex flex-col justify-between hover:shadow-md ${
                  isSelected
                    ? 'border-emerald-600 ring-2 ring-emerald-600/10'
                    : isLocalCG
                    ? 'border-amber-300 bg-amber-50/10'
                    : 'border-stone-200'
                }`}
              >
                <div>
                  {/* Top Bar: Checkbox, Name, Local/Intl Tag & AI Score */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectOne(c.id)}
                        className="mt-1 w-4 h-4 text-emerald-700 rounded border-stone-300 cursor-pointer"
                      />
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3
                            onClick={() => onOpenCandidateModal(c)}
                            className="font-bold text-stone-900 text-sm hover:text-emerald-800 cursor-pointer transition-colors"
                          >
                            {c.name}
                          </h3>
                          {c.gender && c.gender !== 'Any' && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-stone-100 text-stone-700 border border-stone-200">
                              {c.gender}
                            </span>
                          )}
                          {isLocalCG && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-0.5">
                              <MapPin className="w-2.5 h-2.5 text-amber-600" />
                              Durg/CG Local
                            </span>
                          )}
                          {(c.scope === 'international' || (c.country && c.country !== 'India')) && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-sky-100 text-sky-900 border border-sky-300 flex items-center gap-0.5">
                              <Globe className="w-2.5 h-2.5 text-sky-600" />
                              {c.country || 'International'}
                            </span>
                          )}
                          <span className="px-2 py-0.2 rounded text-[10px] font-medium bg-stone-100 text-stone-700">
                            {c.category}
                          </span>
                          {(() => {
                            const seg = inferWorkforceSegment(c.category, c.designation, c.skills);
                            return (
                              <span
                                className={`px-1.5 py-0.2 rounded text-[10px] font-bold border ${
                                  seg === 'Blue Collar'
                                    ? 'bg-amber-100 text-amber-950 border-amber-300'
                                    : seg === 'IT'
                                    ? 'bg-indigo-100 text-indigo-950 border-indigo-200'
                                    : 'bg-emerald-50 text-emerald-900 border-emerald-200'
                                }`}
                              >
                                {seg}
                              </span>
                            );
                          })()}
                        </div>
                        <p className="text-xs font-semibold text-emerald-900 mt-0.5">
                          {c.designation}
                        </p>
                        {c.company && (
                          <p className="text-[11px] text-stone-500 flex items-center gap-1 mt-0.5">
                            <Building2 className="w-3 h-3 text-stone-400 shrink-0" />
                            <span>{c.company}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* AI Screening Badge */}
                    {c.aiScore ? (
                      <div className="flex flex-col items-end shrink-0">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                          <Sparkles className="w-3 h-3 text-emerald-700" />
                          <span>{c.aiScore}% Match</span>
                        </span>
                        <span className="text-[10px] text-stone-400 mt-0.5">AI Screened</span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-stone-400 bg-stone-100 px-2 py-0.5 rounded shrink-0">
                        Raw Resdex
                      </span>
                    )}
                  </div>

                  {/* Details Grid */}
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-stone-600 bg-stone-50/80 p-2.5 rounded-lg border border-stone-100">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span className="truncate">
                        Exp: <strong className="text-stone-800">{c.experience}</strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span className="truncate font-medium text-stone-800">{c.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <IndianRupee className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span className="truncate">
                        CTC: <strong className="text-stone-800">{c.currentSalary || 'Negotiable'}</strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span className="truncate">
                        Notice: <strong className="text-stone-800">{c.noticePeriod || 'Immediate'}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Skills Pills */}
                  <div className="mt-2.5 flex flex-wrap gap-1">
                    {c.skills.slice(0, 4).map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-stone-100 text-stone-700 text-[11px] rounded font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                    {c.skills.length > 4 && (
                      <span className="px-1.5 py-0.5 text-stone-400 text-[10px]">
                        +{c.skills.length - 4} more
                      </span>
                    )}
                  </div>

                  {/* Contact row with direct call / copy */}
                  <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <a
                        href={`tel:${c.contact}`}
                        className="font-mono font-bold text-stone-800 hover:text-emerald-800 flex items-center gap-1"
                        title="Click to dial"
                      >
                        <PhoneCall className="w-3 h-3 text-emerald-600" />
                        <span>{c.contact}</span>
                      </a>
                      <button
                        type="button"
                        onClick={(e) => handleCopyContact(c.contact, e)}
                        className="text-stone-400 hover:text-stone-700 p-0.5 cursor-pointer"
                        title="Copy contact number"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                      {copySuccess === c.contact && (
                        <span className="text-[10px] text-emerald-700 font-bold">Copied!</span>
                      )}
                    </div>

                    <span className="text-[11px] text-stone-400">Added: {c.sourceDate}</span>
                  </div>
                </div>

                {/* Candidate Action Buttons */}
                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center gap-2">
                  <div className="grid grid-cols-3 gap-2 flex-1">
                    <button
                      type="button"
                      id={`btn-call-${c.id}`}
                      onClick={() => onSelectCandidateForCall(c)}
                      className="flex items-center justify-center gap-1 py-1.5 px-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-2xs transition-colors"
                    >
                      <PhoneCall className="w-3.5 h-3.5 text-amber-300" />
                      <span>AI Voice Call</span>
                    </button>

                    <button
                      type="button"
                      id={`btn-interview-${c.id}`}
                      onClick={() => onScheduleInterview(c)}
                      className="flex items-center justify-center gap-1 py-1.5 px-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                    >
                      <Calendar className="w-3.5 h-3.5 text-amber-600" />
                      <span>Schedule</span>
                    </button>

                    <button
                      type="button"
                      id={`btn-view-${c.id}`}
                      onClick={() => onOpenCandidateModal(c)}
                      className="flex items-center justify-center gap-1 py-1.5 px-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5 text-stone-500" />
                      <span>Dossier</span>
                    </button>
                  </div>

                  {onDeleteCandidate && (
                    confirmDeleteId === c.id ? (
                      <div className="inline-flex items-center gap-1 bg-rose-50 border border-rose-200 px-2 py-1 rounded-lg shrink-0">
                        <button
                          type="button"
                          onClick={async () => {
                            setConfirmDeleteId(null);
                            setSelectedCandidateIds((prev) => prev.filter((id) => id !== c.id));
                            await onDeleteCandidate(c.id);
                            setDbFeedback(`Deleted candidate "${c.name}" from Firestore database.`);
                            setTimeout(() => setDbFeedback(null), 4000);
                          }}
                          className="px-1.5 py-0.5 bg-rose-700 hover:bg-rose-800 text-white rounded text-[10px] font-bold cursor-pointer"
                        >
                          Confirm
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-1.5 py-0.5 text-stone-600 text-[10px] font-semibold cursor-pointer"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        id={`btn-delete-${c.id}`}
                        onClick={() => setConfirmDeleteId(c.id)}
                        className="p-2 rounded-lg border border-rose-200 bg-rose-50/70 hover:bg-rose-100 text-rose-700 cursor-pointer shrink-0 transition-colors"
                        title={`Delete ${c.name}`}
                        aria-label={`Delete ${c.name}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Candidate to Encrypted Firestore Database Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-stone-200 shadow-xl max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-bold text-base text-stone-900 flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-800" />
                <span>Add Candidate to Encrypted Firestore Database</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCandidate} className="space-y-3 text-xs">
              <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200 space-y-1.5">
                <label className="block font-bold text-emerald-950 flex items-center gap-1.5">
                  <ArrowDownAZ className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Select Standard Position (Searchable A–Z • IT, Non-IT &amp; Blue Collar)</span>
                </label>
                <SearchableTitlePicker
                  value={newDesignation}
                  onSelectCatalogItem={(picked) => {
                    setNewDesignation(picked.title);
                    setNewCategory(picked.category);
                    setNewSkills(picked.skills);
                  }}
                  onSelectCustomTitle={(custom) => setNewDesignation(custom)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Candidate Full Name"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Mobile / Phone *</label>
                  <input
                    type="tel"
                    required
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="candidate@gmail.com"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Role / Designation *</label>
                  <input
                    type="text"
                    required
                    value={newDesignation}
                    onChange={(e) => setNewDesignation(e.target.value)}
                    placeholder="e.g. Senior Accountant / Sales Manager"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Current Company</label>
                  <input
                    type="text"
                    value={newCompany}
                    onChange={(e) => setNewCompany(e.target.value)}
                    placeholder="Company Name"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-medium text-stone-700 mb-1">
                    Functional Category (Searchable A–Z)
                  </label>
                  <SearchableCategoryPicker
                    value={newCategory}
                    onChange={(val) => setNewCategory(val)}
                  />
                </div>
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Region Scope</label>
                  <select
                    value={newScope}
                    onChange={(e) => {
                      const s = e.target.value as PostingScope;
                      setNewScope(s);
                      if (s === 'international') {
                        setNewCountry('United Arab Emirates');
                        setNewLocation('Dubai, UAE');
                      } else {
                        setNewCountry('India');
                        setNewLocation('Durg, Chhattisgarh');
                      }
                    }}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg"
                  >
                    <option value="domestic">Pan India / Durg CG</option>
                    <option value="international">International</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-stone-700 mb-1">City / Location</label>
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    placeholder="Durg, Ayodhya, Delhi NCR, Dubai..."
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Gender</label>
                  <select
                    value={newGender}
                    onChange={(e) => setNewGender(e.target.value as 'Male' | 'Female' | 'Any')}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg"
                  >
                    <option value="Any">Any / Not Specified</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Notice Period</label>
                  <select
                    value={newNotice}
                    onChange={(e) => setNewNotice(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg"
                  >
                    <option value="Immediate Joiner">Immediate Joiner</option>
                    <option value="0 Days">0 Days</option>
                    <option value="15 Days">15 Days</option>
                    <option value="1 Month">1 Month</option>
                    <option value="Negotiable">2 Months / Negotiable</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Experience</label>
                  <input
                    type="text"
                    value={newExp}
                    onChange={(e) => setNewExp(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Current Salary</label>
                  <input
                    type="text"
                    value={newCurrentSalary}
                    onChange={(e) => setNewCurrentSalary(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Skills (comma separated)</label>
                <input
                  type="text"
                  value={newSkills}
                  onChange={(e) => setNewSkills(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-stone-300 rounded-lg text-stone-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg font-bold cursor-pointer"
                >
                  Save to Firestore Database
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

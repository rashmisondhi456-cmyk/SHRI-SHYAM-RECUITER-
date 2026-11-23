import React, { useState, useMemo, useEffect } from 'react';
import { JobPosting, Candidate, JobCategory, PostingScope, JobApplication, WorkforceSegment } from '../types';
import {
  PAN_INDIA_CITIES,
  INTERNATIONAL_DESTINATIONS,
  FUNCTIONAL_CATEGORIES_AZ,
  POSITION_CATALOG_AZ,
  QUICK_JOB_TITLE_CHIPS,
  inferWorkforceSegment,
  matchesKeywordQuery,
  matchesNoticeFilter,
  matchesExperienceFilter,
  matchesSalaryFilter,
} from '../lib/naukriFilters';
import { exportApplicationsToExcel } from '../lib/excelExport';
import { SearchableCategoryPicker, SearchableTitlePicker } from './SearchableCatalogPicker';
import {
  Briefcase,
  Plus,
  Sparkles,
  MapPin,
  Clock,
  IndianRupee,
  Globe,
  Plane,
  Search,
  Building2,
  UserCheck,
  Zap,
  RotateCcw,
  AlertCircle,
  Share2,
  FileSpreadsheet,
  Copy,
  Check,
  ExternalLink,
  PhoneCall,
  Calendar,
  Send,
  Mail,
  MessageCircle,
  X,
  ArrowDownAZ,
  Trash2,
} from 'lucide-react';

interface JobPostingManagerProps {
  recruiterUid: string;
  jobPostings: JobPosting[];
  candidates: Candidate[];
  applications: JobApplication[];
  openCreateModalSignal?: number;
  openExcelSheetSignal?: number;
  onAddJobPosting: (job: JobPosting) => void;
  onAddJobsBatch?: (jobs: JobPosting[]) => Promise<void> | void;
  onDeleteJobPosting?: (jobId: string) => Promise<void> | void;
  onDeleteApplication?: (applicationId: string) => Promise<void> | void;
  onSelectCandidateForCall: (candidate: Candidate) => void;
  onScheduleInterview: (candidate: Candidate) => void;
  onUpdateApplicationStatus: (appId: string, status: JobApplication['status']) => void;
  onConvertApplicationToCandidate: (app: JobApplication, nextAction?: 'call' | 'schedule') => void;
}

const ALPHABET_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const INTERNATIONAL_COUNTRIES = [
  ...INTERNATIONAL_DESTINATIONS,
  'Global Remote',
];

const NOTICE_OPTIONS = [
  { id: 'all', label: 'All Notice' },
  { id: 'immediate', label: 'Immediate Joiner' },
  { id: '0_days', label: '0 Days' },
  { id: '15_days', label: '15 Days' },
  { id: '1_month', label: '1 Month' },
  { id: 'negotiable', label: '2 Months / Negotiable' },
];

export const JobPostingManager: React.FC<JobPostingManagerProps> = ({
  recruiterUid,
  jobPostings,
  candidates,
  applications,
  openCreateModalSignal,
  openExcelSheetSignal,
  onAddJobPosting,
  onAddJobsBatch,
  onDeleteJobPosting,
  onDeleteApplication,
  onSelectCandidateForCall,
  onScheduleInterview,
  onUpdateApplicationStatus,
  onConvertApplicationToCandidate,
}) => {
  const [subView, setSubView] = useState<'jobs' | 'excel-sheet'>('jobs');
  const [shareJob, setShareJob] = useState<JobPosting | null>(null);
  const [copiedShareKey, setCopiedShareKey] = useState<string | null>(null);
  const [confirmDeleteJobId, setConfirmDeleteJobId] = useState<string | null>(null);
  const [confirmDeleteAppId, setConfirmDeleteAppId] = useState<string | null>(null);

  // Excel Sheet view filters
  const [sheetJobFilter, setSheetJobFilter] = useState<string>('all');
  const [sheetPlatformFilter, setSheetPlatformFilter] = useState<string>('all');
  const [sheetStatusFilter, setSheetStatusFilter] = useState<string>('all');

  // Naukri-portal job filter states
  const [keywordFilter, setKeywordFilter] = useState('');
  const [scopeFilter, setScopeFilter] = useState<'all' | 'domestic' | 'cg' | 'international'>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [industryFilter, setIndustryFilter] = useState<string>('all');
  const [companyFilter, setCompanyFilter] = useState<string>('all');
  const [genderFilter, setGenderFilter] = useState<string>('all');
  const [noticeFilter, setNoticeFilter] = useState<string>('all');
  const [experienceFilter, setExperienceFilter] = useState<string>('all');
  const [salaryFilter, setSalaryFilter] = useState<string>('all');
  const [letterFilter, setLetterFilter] = useState<string>('ALL');
  const [positionFilter, setPositionFilter] = useState<string>('all');
  const [segmentFilter, setSegmentFilter] = useState<'all' | WorkforceSegment>('all');
  const [sortOrder, setSortOrder] = useState<'az' | 'za' | 'newest'>('az');
  const [isBulkAddingAz, setIsBulkAddingAz] = useState(false);
  const [bulkAzFeedback, setBulkAzFeedback] = useState<string | null>(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedJobToMatch, setSelectedJobToMatch] = useState<JobPosting | null>(null);
  const [matchedCandidateIds, setMatchedCandidateIds] = useState<string[]>([]);
  const [isMatching, setIsMatching] = useState(false);

  useEffect(() => {
    if (openCreateModalSignal && openCreateModalSignal > 0) {
      setSubView('jobs');
      setShowCreateModal(true);
    }
  }, [openCreateModalSignal]);

  useEffect(() => {
    if (openExcelSheetSignal && openExcelSheetSignal > 0) {
      setSubView('excel-sheet');
    }
  }, [openExcelSheetSignal]);

  // New job form state
  const [title, setTitle] = useState('');
  const [companyName, setCompanyName] = useState('Shri Shyam Consulting Client');
  const [category, setCategory] = useState<JobCategory>('Accounting & Finance');
  const [industry, setIndustry] = useState('Accounting, Taxation & Finance');
  const [department, setDepartment] = useState('Recruitment / Operations');
  const [scope, setScope] = useState<PostingScope>('domestic');
  const [country, setCountry] = useState('India');
  const [location, setLocation] = useState('Durg, Chhattisgarh (Paras Complex)');
  const [visaSponsorship, setVisaSponsorship] = useState(false);
  const [genderPreference, setGenderPreference] = useState<'Any' | 'Male' | 'Female'>('Any');
  const [noticePeriod, setNoticePeriod] = useState('Immediate (0 Days)');
  const [experience, setExperience] = useState('2 - 5 Years');
  const [salaryRange, setSalaryRange] = useState('₹3.0 - 5.0 LPA');
  const [openings, setOpenings] = useState(2);
  const [description, setDescription] = useState('');
  const [skillsRequired, setSkillsRequired] = useState('Tally, GST, Auditing');
  const [isGeneratingAiJd, setIsGeneratingAiJd] = useState(false);
  const [formHint, setFormHint] = useState<string | null>(null);

  const handleScopeChange = (newScope: PostingScope) => {
    setScope(newScope);
    if (newScope === 'international') {
      setCountry('United Arab Emirates');
      setLocation('Dubai, UAE (Visa Sponsored)');
      setSalaryRange('AED 10,000 - 14,000 / mo');
      setDepartment('International Placements');
      setVisaSponsorship(true);
    } else {
      setCountry('India');
      setLocation('Durg, Chhattisgarh (Paras Complex)');
      setSalaryRange('₹3.0 - 5.0 LPA');
      setDepartment('Recruitment / Operations');
      setVisaSponsorship(false);
    }
  };

  const domesticCount = useMemo(
    () => jobPostings.filter((j) => j.scope !== 'international').length,
    [jobPostings]
  );
  const internationalCount = useMemo(
    () => jobPostings.filter((j) => j.scope === 'international').length,
    [jobPostings]
  );

  const uniqueCompanies = useMemo(() => {
    const companies = Array.from(
      new Set(jobPostings.map((j) => j.companyName).filter((v): v is string => Boolean(v)))
    );
    return companies.sort((a, b) => a.localeCompare(b));
  }, [jobPostings]);

  const uniqueIndustries = useMemo(() => {
    const inds = new Set<string>(FUNCTIONAL_CATEGORIES_AZ);
    jobPostings.forEach((j) => {
      inds.add(j.category);
      if (j.industry) inds.add(j.industry);
    });
    return Array.from(inds).sort((a, b) => a.localeCompare(b));
  }, [jobPostings]);

  const missingAzPositions = useMemo(() => {
    const existingTitles = new Set(jobPostings.map((j) => j.title.trim().toLowerCase()));
    return POSITION_CATALOG_AZ.filter((pos) => !existingTitles.has(pos.title.toLowerCase()));
  }, [jobPostings]);

  const availableJobLetters = useMemo(() => {
    const set = new Set<string>();
    jobPostings.forEach((j) => {
      const first = j.title.trim().charAt(0).toUpperCase();
      if (first >= 'A' && first <= 'Z') set.add(first);
    });
    return set;
  }, [jobPostings]);

  const handlePublishAllAzPositions = async () => {
    if (missingAzPositions.length === 0 || isBulkAddingAz) return;
    setIsBulkAddingAz(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const baseTs = Date.now();
      const createdJobs: JobPosting[] = missingAzPositions.map((pos, idx) => {
        const slug = pos.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
          .slice(0, 32);
        return {
          id: `job-az-${slug}-${baseTs + idx}`,
          title: pos.title,
          companyName: 'Shri Shyam Consulting (Pan-India & Global)',
          category: pos.category,
          industry: pos.industry,
          department: pos.category,
          scope: 'domestic',
          country: 'India',
          location: 'Pan-India (Durg, Raipur, Ayodhya, Delhi NCR, Mumbai, Bengaluru)',
          visaSponsorship: false,
          genderPreference: 'Any',
          noticePeriod: 'Immediate (0 Days)',
          experience: '1 - 5 Years',
          salaryRange: '₹3.0 - 7.5 LPA',
          openings: 3,
          description: `Hiring ${pos.title} across Pan-India & Global client mandates via Shri Shyam Consulting (www.shrishyamconsulting.in). Key skills: ${pos.skills}. Immediate & 15-days joiners preferred.`,
          skillsRequired: pos.skills.split(',').map((s) => s.trim()).filter(Boolean),
          status: 'active',
          createdAt: today,
        };
      });

      if (onAddJobsBatch) {
        await onAddJobsBatch(createdJobs);
      } else {
        createdJobs.forEach((j) => onAddJobPosting(j));
      }
      setBulkAzFeedback(
        `Added ${createdJobs.length} A–Z positions alphabetically to your live Job Mandates & Public Application Links.`
      );
      setTimeout(() => setBulkAzFeedback(null), 6000);
    } finally {
      setIsBulkAddingAz(false);
    }
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (keywordFilter.trim()) count++;
    if (scopeFilter !== 'all') count++;
    if (locationFilter !== 'all') count++;
    if (industryFilter !== 'all') count++;
    if (companyFilter !== 'all') count++;
    if (genderFilter !== 'all') count++;
    if (noticeFilter !== 'all') count++;
    if (experienceFilter !== 'all') count++;
    if (salaryFilter !== 'all') count++;
    if (letterFilter !== 'ALL') count++;
    if (positionFilter !== 'all') count++;
    if (segmentFilter !== 'all') count++;
    return count;
  }, [
    keywordFilter,
    scopeFilter,
    locationFilter,
    industryFilter,
    companyFilter,
    genderFilter,
    noticeFilter,
    experienceFilter,
    salaryFilter,
    letterFilter,
    positionFilter,
    segmentFilter,
  ]);

  const resetJobFilters = () => {
    setKeywordFilter('');
    setScopeFilter('all');
    setLocationFilter('all');
    setIndustryFilter('all');
    setCompanyFilter('all');
    setGenderFilter('all');
    setNoticeFilter('all');
    setExperienceFilter('all');
    setSalaryFilter('all');
    setLetterFilter('ALL');
    setPositionFilter('all');
    setSegmentFilter('all');
  };

  const visibleJobs = useMemo(() => {
    const filtered = jobPostings.filter((job) => {
      // 1. Keywords
      const matchesKeywords = matchesKeywordQuery(keywordFilter, [
        job.title,
        job.companyName,
        job.category,
        job.industry,
        job.department,
        job.location,
        job.country,
        job.description,
        ...job.skillsRequired,
      ]);

      // 2. Scope tabs (All, Pan-India, Durg/CG, International)
      const locLower = job.location.toLowerCase();
      const isIntl = job.scope === 'international' || Boolean(job.country && job.country.toLowerCase() !== 'india');
      let matchesScope = true;
      if (scopeFilter === 'domestic') {
        matchesScope = !isIntl;
      } else if (scopeFilter === 'international') {
        matchesScope = isIntl;
      } else if (scopeFilter === 'cg') {
        matchesScope =
          locLower.includes('durg') ||
          locLower.includes('bhilai') ||
          locLower.includes('raipur') ||
          locLower.includes('bilaspur') ||
          locLower.includes('chhattisgarh');
      }

      // 3. Specific City / Country / Pan-India Location Filter
      let matchesLocation = true;
      if (locationFilter === 'pan-india') {
        matchesLocation = !isIntl;
      } else if (locationFilter === 'international') {
        matchesLocation = isIntl;
      } else if (locationFilter !== 'all') {
        const target = locationFilter.toLowerCase();
        const countryLower = (job.country || 'India').toLowerCase();
        matchesLocation =
          locLower.includes(target) ||
          countryLower.includes(target) ||
          locLower.includes('pan-india') ||
          (target === 'delhi ncr' &&
            (locLower.includes('delhi') || locLower.includes('noida') || locLower.includes('ghaziabad')));
      }

      // 4. Industry / Category
      const matchesIndustry =
        industryFilter === 'all' ||
        job.category === industryFilter ||
        job.industry === industryFilter;

      // 5. Company
      const matchesCompany =
        companyFilter === 'all' ||
        (job.companyName || '').toLowerCase() === companyFilter.toLowerCase();

      // 6. Gender Preference
      const matchesGender =
        genderFilter === 'all' ||
        (job.genderPreference || 'Any').toLowerCase() === genderFilter.toLowerCase() ||
        (genderFilter !== 'Any' && (job.genderPreference || 'Any') === 'Any');

      // 7. Notice Period
      const matchesNotice = matchesNoticeFilter(job.noticePeriod, noticeFilter);

      // 8. Experience
      const matchesExp = matchesExperienceFilter(job.experience, experienceFilter);

      // 9. Salary
      const matchesSalary = matchesSalaryFilter(job.salaryRange, salaryFilter);

      // 10. A-Z Alphabet & Position Catalog filter
      const matchesLetter =
        letterFilter === 'ALL' ||
        job.title.trim().toUpperCase().startsWith(letterFilter);

      const matchesPosition =
        positionFilter === 'all' ||
        job.title.toLowerCase().includes(positionFilter.toLowerCase());

      // 11. Workforce Segment (IT / Non-IT / Blue Collar)
      const jobSegment = inferWorkforceSegment(job.category, job.title, job.skillsRequired);
      const matchesSegment = segmentFilter === 'all' || jobSegment === segmentFilter;

      return (
        matchesKeywords &&
        matchesScope &&
        matchesLocation &&
        matchesIndustry &&
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
      if (sortOrder === 'za') return b.title.localeCompare(a.title);
      if (sortOrder === 'newest') return (b.createdAt || '').localeCompare(a.createdAt || '');
      return a.title.localeCompare(b.title);
    });
  }, [
    jobPostings,
    keywordFilter,
    scopeFilter,
    locationFilter,
    industryFilter,
    companyFilter,
    genderFilter,
    noticeFilter,
    experienceFilter,
    salaryFilter,
    letterFilter,
    positionFilter,
    segmentFilter,
    sortOrder,
  ]);

  // AI JD Generator helper
  const handleGenerateAiJd = async () => {
    if (!title.trim()) {
      setFormHint('Please enter a Job Title first to draft the JD.');
      return;
    }
    setFormHint(null);

    setIsGeneratingAiJd(true);
    try {
      const response = await fetch('/api/ai/screen-candidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidate: {
            name: 'Role Profile Generator',
            designation: title,
            location: `${location}, ${country}`,
            experience: experience,
          },
          jobDescription: `Draft a professional ${scope} job description for ${title} at ${companyName} (${industry}) in ${country} (${location}) via Shri Shyam Consulting (www.shrishyamconsulting.in, info@shrishyamconsulting.in) requiring ${skillsRequired}. Gender preference: ${genderPreference}. Notice Period: ${noticePeriod}.`,
        }),
      });

      const data = await response.json();
      const visaNote =
        scope === 'international'
          ? visaSponsorship
            ? '\nRelocation & Visa: Work Visa / Employment Pass sponsorship provided.'
            : '\nRelocation: Open to local residents or global remote professionals.'
          : '';

      if (data?.summary) {
        setDescription(
          `${companyName} (${industry}) is hiring a skilled ${title} for ${scope === 'international' ? 'international' : 'Pan-India'} operations in ${location} (${country}). Responsibilities include managing end-to-end deliverables, quality compliance, and stakeholder reporting.\n\nKey Requirements: ${skillsRequired} • Preferred Joining: ${noticePeriod} • Gender: ${genderPreference}.${visaNote}\n\nShri Shyam Consulting • www.shrishyamconsulting.in • Contact: 8269715615 | info@shrishyamconsulting.in`
        );
      } else {
        setDescription(
          `${companyName} via Shri Shyam Consulting invites applications for ${title} in ${location}, ${country}. Experience: ${experience} • Package: ${salaryRange} • Notice: ${noticePeriod}.${visaNote}`
        );
      }
    } catch {
      setDescription(
        `Immediate opening for ${title} at ${companyName} in ${location} (${country}). Candidates with ${experience} experience in ${skillsRequired} (${noticePeriod}) may apply via www.shrishyamconsulting.in or info@shrishyamconsulting.in.`
      );
    } finally {
      setIsGeneratingAiJd(false);
    }
  };

  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newJob: JobPosting = {
      id: `job-${Date.now()}`,
      title: title.trim(),
      companyName: companyName.trim() || 'Shri Shyam Consulting Client',
      category,
      industry: industry.trim() || category,
      department,
      scope,
      country: scope === 'international' ? country : 'India',
      location,
      visaSponsorship: scope === 'international' ? visaSponsorship : false,
      genderPreference,
      noticePeriod,
      experience,
      salaryRange,
      openings,
      description: description || `Position for ${title} at ${companyName} in ${location}, ${country}.`,
      skillsRequired: skillsRequired.split(',').map((s) => s.trim()).filter(Boolean),
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
    };

    onAddJobPosting(newJob);
    setShowCreateModal(false);
    setTitle('');
    setDescription('');
    setFormHint(null);
    setShareJob(newJob);
  };

  const buildApplyUrl = (jobId: string, sourcePlatform?: string) => {
    const base = `${window.location.origin}${import.meta.env.BASE_URL}`;
    const url = new URL(base);
    url.searchParams.set('apply', jobId);
    url.searchParams.set('recruiter', recruiterUid);
    if (sourcePlatform) {
      url.searchParams.set('src', sourcePlatform);
    }
    return url.toString();
  };

  const buildSocialPostCopy = (job: JobPosting, platformUrl: string) => {
    return [
      `🚀 HIRING NOW: ${job.title}`,
      `🏢 Company: ${job.companyName || 'Shri Shyam Consulting Client'}`,
      `📍 Location: ${job.location} (${job.country || 'India'})`,
      `💼 Experience: ${job.experience} | ⏳ Notice: ${job.noticePeriod || 'Immediate'}`,
      `💰 Package: ${job.salaryRange}`,
      `🎯 Skills: ${job.skillsRequired.slice(0, 5).join(', ')}`,
      ``,
      `👉 Apply Directly (No Login Required): ${platformUrl}`,
      `📞 Helpline: 8269715615 | 🌐 www.shrishyamconsulting.in`,
    ].join('\n');
  };

  const handleCopyText = (key: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedShareKey(key);
    setTimeout(() => setCopiedShareKey(null), 2200);
  };

  const newApplicationsCount = useMemo(
    () => applications.filter((a) => a.status === 'new').length,
    [applications]
  );

  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      if (sheetJobFilter !== 'all' && app.jobId !== sheetJobFilter) return false;
      if (
        sheetPlatformFilter !== 'all' &&
        (app.sourcePlatform || 'Direct Link').toLowerCase() !== sheetPlatformFilter.toLowerCase()
      ) {
        return false;
      }
      if (sheetStatusFilter !== 'all' && app.status !== sheetStatusFilter) return false;
      return true;
    });
  }, [applications, sheetJobFilter, sheetPlatformFilter, sheetStatusFilter]);

  // Run AI matching between job and candidate pool
  const handleMatchCandidates = async (job: JobPosting) => {
    setSelectedJobToMatch(job);
    setIsMatching(true);

    try {
      const response = await fetch('/api/ai/match-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobTitle: job.title,
          keyRequirements: `${job.skillsRequired.join(', ')} - Company: ${job.companyName || ''} - Industry: ${job.industry || job.category} - Scope: ${job.scope || 'domestic'} - Location: ${job.location} (${job.country || 'India'}) - Notice: ${job.noticePeriod || 'Any'}`,
          candidateList: candidates,
        }),
      });

      const data = await response.json();
      if (data?.matches && Array.isArray(data.matches)) {
        setMatchedCandidateIds(data.matches.map((m: { id: string }) => m.id));
      } else if (data?.topCandidateIds) {
        setMatchedCandidateIds(data.topCandidateIds);
      } else {
        const matched = candidates
          .filter(
            (c) =>
              c.category === job.category ||
              c.designation.toLowerCase().includes(job.title.toLowerCase().split(' ')[0]) ||
              job.skillsRequired.some((s) => c.skills.some((cs) => cs.toLowerCase().includes(s.toLowerCase())))
          )
          .map((c) => c.id);
        setMatchedCandidateIds(matched);
      }
    } catch {
      const matched = candidates
        .filter(
          (c) =>
            c.category === job.category ||
            job.skillsRequired.some((s) => c.skills.some((cs) => cs.toLowerCase().includes(s.toLowerCase())))
        )
        .slice(0, 6)
        .map((c) => c.id);
      setMatchedCandidateIds(matched);
    } finally {
      setIsMatching(false);
    }
  };

  const matchedCandidatesList = candidates.filter((c) => matchedCandidateIds.includes(c.id));

  return (
    <div className="space-y-6">
      {/* Sub-Navigation Switcher: Job Mandates vs Live Applications Excel Sheet */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white rounded-xl border border-stone-200 p-3 shadow-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setSubView('jobs')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold cursor-pointer transition-all ${
              subView === 'jobs'
                ? 'bg-emerald-900 text-white shadow-xs'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Job Mandates &amp; Social Share ({jobPostings.length})</span>
          </button>

          <button
            type="button"
            id="btn-applications-excel-sheet"
            onClick={() => setSubView('excel-sheet')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold cursor-pointer transition-all ${
              subView === 'excel-sheet'
                ? 'bg-emerald-900 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-950 border border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-amber-500" />
            <span>Applications Excel Sheet ({applications.length})</span>
            {newApplicationsCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-amber-400 text-stone-950 text-[10px] font-extrabold">
                {newApplicationsCount} New
              </span>
            )}
          </button>
        </div>

        <button
          type="button"
          onClick={() => exportApplicationsToExcel(filteredApplications)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-900 hover:bg-emerald-100 text-xs font-bold cursor-pointer"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
          <span>Download Excel (.xlsx)</span>
        </button>
      </div>

      {subView === 'excel-sheet' ? (
        <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-stone-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-800" />
                <span>Live Applicant Submissions — Direct Excel Sheet</span>
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Every candidate who applies via your WhatsApp, LinkedIn, Facebook, Instagram, Telegram, or X posting link appears here automatically in real time.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={sheetJobFilter}
                onChange={(e) => setSheetJobFilter(e.target.value)}
                className="px-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg text-stone-800"
              >
                <option value="all">All Jobs ({applications.length})</option>
                {[...jobPostings]
                  .sort((a, b) => a.title.localeCompare(b.title))
                  .map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.title}
                    </option>
                  ))}
              </select>

              <select
                value={sheetPlatformFilter}
                onChange={(e) => setSheetPlatformFilter(e.target.value)}
                className="px-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg text-stone-800"
              >
                <option value="all">All Social Platforms</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="Facebook">Facebook</option>
                <option value="Instagram">Instagram</option>
                <option value="Telegram">Telegram</option>
                <option value="X">X (Twitter)</option>
                <option value="Email">Email</option>
                <option value="Direct Link">Direct Link</option>
              </select>

              <select
                value={sheetStatusFilter}
                onChange={(e) => setSheetStatusFilter(e.target.value)}
                className="px-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg text-stone-800"
              >
                <option value="all">All Statuses</option>
                <option value="new">New</option>
                <option value="reviewed">Reviewed</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="rejected">Rejected</option>
              </select>

              <button
                type="button"
                onClick={() => exportApplicationsToExcel(filteredApplications)}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold cursor-pointer shadow-xs"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-amber-300" />
                <span>Download Excel Sheet (.xlsx)</span>
              </button>
            </div>
          </div>

          {filteredApplications.length === 0 ? (
            <div className="py-14 text-center border border-dashed border-stone-300 rounded-xl bg-stone-50/50 space-y-3">
              <FileSpreadsheet className="w-10 h-10 text-stone-400 mx-auto" />
              <h3 className="text-sm font-bold text-stone-800">No applications recorded yet</h3>
              <p className="text-xs text-stone-500 max-w-md mx-auto">
                Click &quot;Share on Social Media&quot; on any job posting to publish your application link to WhatsApp, LinkedIn, Facebook, Instagram, Telegram, or X. Submissions appear here automatically!
              </p>
              <button
                type="button"
                onClick={() => setSubView('jobs')}
                className="px-4 py-2 bg-emerald-800 text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                Go to Job Mandates &amp; Share Links
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto border border-stone-200 rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-stone-100 text-stone-700 border-b border-stone-200 font-bold">
                    <th className="py-2.5 px-3 whitespace-nowrap">Date</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Platform</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Applicant</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Contact</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Job Applied For</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Location &amp; Company</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Exp / Notice</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Current / Expected CTC</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Status</th>
                    <th className="py-2.5 px-3 whitespace-nowrap text-right">ATS Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredApplications.map((app) => (
                    <tr key={app.id} className="hover:bg-emerald-50/30 transition-colors">
                      <td className="py-2.5 px-3 whitespace-nowrap font-mono text-[11px] text-stone-600">
                        {app.appliedDate}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-sky-50 border border-sky-200 text-sky-900 font-semibold text-[11px]">
                          {app.sourcePlatform}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-stone-900">{app.applicantName}</div>
                        <div className="text-[10px] text-stone-500">{app.gender}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-mono font-semibold text-stone-800">{app.phone}</div>
                        <div className="text-[11px] text-stone-500">{app.email}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-emerald-900">{app.jobTitle}</div>
                        <div className="text-[10px] text-stone-500">{app.companyName}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-medium text-stone-800">{app.currentLocation}</div>
                        <div className="text-[10px] text-stone-500">{app.currentCompany || '-'}</div>
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="font-medium text-stone-800">{app.experience}</div>
                        <div className="text-[10px] text-amber-800 font-semibold">{app.noticePeriod}</div>
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="text-stone-700">Curr: {app.currentSalary || '-'}</div>
                        <div className="text-emerald-800 font-semibold">Exp: {app.expectedSalary || '-'}</div>
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <select
                          value={app.status}
                          onChange={(e) =>
                            onUpdateApplicationStatus(app.id, e.target.value as JobApplication['status'])
                          }
                          className="px-2 py-1 rounded border border-stone-300 bg-white text-[11px] font-semibold text-stone-800"
                        >
                          <option value="new">New</option>
                          <option value="reviewed">Reviewed</option>
                          <option value="shortlisted">Shortlisted</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => onConvertApplicationToCandidate(app, 'call')}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-800 hover:bg-emerald-900 text-white rounded text-[10px] font-bold cursor-pointer"
                            title="Save to Resdex DB & Launch AI Voice Call"
                          >
                            <PhoneCall className="w-3 h-3 text-amber-300" />
                            <span>AI Call</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onConvertApplicationToCandidate(app, 'schedule')}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded text-[10px] font-bold cursor-pointer"
                            title="Save to Resdex DB & Schedule Interview"
                          >
                            <Calendar className="w-3 h-3" />
                            <span>Schedule</span>
                          </button>
                          {onDeleteApplication && (
                            confirmDeleteAppId === app.id ? (
                              <span className="inline-flex items-center gap-1 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded">
                                <button
                                  type="button"
                                  onClick={async () => {
                                    setConfirmDeleteAppId(null);
                                    await onDeleteApplication(app.id);
                                  }}
                                  className="px-1.5 py-0.5 bg-rose-700 text-white rounded text-[10px] font-bold cursor-pointer"
                                >
                                  Confirm
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteAppId(null)}
                                  className="px-1 py-0.5 text-stone-600 text-[10px] font-semibold cursor-pointer"
                                >
                                  No
                                </button>
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteAppId(app.id)}
                                className="p-1.5 text-rose-700 hover:bg-rose-50 rounded cursor-pointer"
                                title="Delete application"
                                aria-label={`Delete application from ${app.applicantName}`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Header & Naukri-Style Search/Filter Bar */}
          <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-emerald-800" />
                  <span>Naukri-Style Pan-India &amp; International Job Portal</span>
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Publish &amp; filter Pan-India, Durg/CG &amp; International mandates by Industry, Company, Gender, Notice Period, Experience &amp; Salary.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {/* Domestic / CG / International Scope Switcher */}
                <div className="inline-flex bg-stone-100 p-1 rounded-lg text-xs flex-wrap">
                  <button
                type="button"
                onClick={() => setScopeFilter('all')}
                className={`px-3 py-1.5 rounded-md font-semibold cursor-pointer transition-all ${
                  scopeFilter === 'all' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                All ({jobPostings.length})
              </button>
              <button
                type="button"
                onClick={() => setScopeFilter('domestic')}
                className={`px-3 py-1.5 rounded-md font-semibold cursor-pointer transition-all ${
                  scopeFilter === 'domestic' ? 'bg-white text-emerald-900 shadow-2xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Pan India ({domesticCount})
              </button>
              <button
                type="button"
                onClick={() => setScopeFilter('cg')}
                className={`px-3 py-1.5 rounded-md font-semibold cursor-pointer transition-all ${
                  scopeFilter === 'cg' ? 'bg-amber-600 text-white shadow-2xs' : 'text-amber-900 hover:bg-amber-50'
                }`}
              >
                Durg / CG
              </button>
              <button
                type="button"
                id="filter-jobs-international"
                onClick={() => setScopeFilter('international')}
                className={`px-3 py-1.5 rounded-md font-semibold flex items-center gap-1 cursor-pointer transition-all ${
                  scopeFilter === 'international' ? 'bg-sky-700 text-white shadow-2xs' : 'text-sky-900 hover:bg-sky-50'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>International ({internationalCount})</span>
              </button>
            </div>

            {missingAzPositions.length > 0 && (
              <button
                type="button"
                id="btn-add-all-az-positions"
                onClick={handlePublishAllAzPositions}
                disabled={isBulkAddingAz}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300 rounded-lg text-xs font-bold shadow-2xs cursor-pointer transition-colors disabled:opacity-60"
                title="Publish all standard A-Z positions alphabetically into your job database"
              >
                <ArrowDownAZ className="w-4 h-4 text-amber-700" />
                <span>
                  {isBulkAddingAz
                    ? 'Adding A–Z Positions...'
                    : `Add All A–Z Positions (+${missingAzPositions.length})`}
                </span>
              </button>
            )}

            <button
              type="button"
              id="btn-new-job-post"
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Post New Vacancy</span>
            </button>
          </div>
        </div>

        {bulkAzFeedback && (
          <div className="px-3.5 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{bulkAzFeedback}</span>
          </div>
        )}

        {/* Keywords Search Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            id="jobs-keyword-input"
            type="text"
            value={keywordFilter}
            onChange={(e) => setKeywordFilter(e.target.value)}
            placeholder="Keywords: job title, skill (Tally, CNC, PySpark, IELTS), company, industry, or city/country..."
            className="w-full pl-10 pr-16 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-700/30 focus:border-emerald-700"
          />
          {keywordFilter && (
            <button
              type="button"
              onClick={() => setKeywordFilter('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-700 font-bold cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* Structured Naukri Portal Job Filters */}
        <div className="pt-3 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          {/* Locations (Pan-India & International) */}
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-stone-400" />
              <span>Location (Pan-India &amp; Intl)</span>
            </label>
            <select
              id="job-filter-location"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg text-stone-800 focus:outline-none focus:ring-1 focus:ring-emerald-700 cursor-pointer"
            >
              <optgroup label="Region Scopes">
                <option value="all">All Locations</option>
                <option value="pan-india">All Pan India</option>
                <option value="international">All International</option>
              </optgroup>
              <optgroup label="Pan-India Cities">
                {PAN_INDIA_CITIES.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </optgroup>
              <optgroup label="International Destinations">
                {INTERNATIONAL_DESTINATIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Industry / Functional Category (A-Z) */}
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1 flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5 text-stone-400" />
              <span>Functional Category (A–Z)</span>
            </label>
            <select
              id="job-filter-industry"
              value={industryFilter}
              onChange={(e) => setIndustryFilter(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg text-stone-800 focus:outline-none focus:ring-1 focus:ring-emerald-700 cursor-pointer"
            >
              <option value="all">All Categories (A–Z)</option>
              {uniqueIndustries.map((ind) => (
                <option key={ind} value={ind}>
                  {ind}
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
              id="job-filter-company"
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
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
              <span>Gender Preference</span>
            </label>
            <select
              id="job-filter-gender"
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg text-stone-800 focus:outline-none focus:ring-1 focus:ring-emerald-700 cursor-pointer"
            >
              <option value="all">All Genders</option>
              <option value="Any">Any Gender</option>
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
              id="job-filter-experience"
              value={experienceFilter}
              onChange={(e) => setExperienceFilter(e.target.value)}
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
              id="job-filter-salary"
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

        {/* Notice Period Pills + Results Count + Reset */}
        <div className="pt-3 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-semibold text-stone-600 flex items-center gap-1 mr-1">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              Joining / Notice Period:
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

          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-xs text-stone-500 font-medium">
              Showing <strong className="text-stone-900">{visibleJobs.length}</strong> of {jobPostings.length} mandates
            </span>
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={resetJobFilters}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset ({activeFilterCount})</span>
              </button>
            )}
          </div>
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
                id="job-filter-position-az"
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
              <label htmlFor="job-sort-order" className="text-xs font-semibold text-stone-600">
                Sort:
              </label>
              <select
                id="job-sort-order"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'az' | 'za' | 'newest')}
                className="px-2.5 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg text-stone-800 font-semibold cursor-pointer"
              >
                <option value="az">Alphabetical (A → Z)</option>
                <option value="za">Alphabetical (Z → A)</option>
                <option value="newest">Newest Posted</option>
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
              const hasJobs = availableJobLetters.has(letter);
              const isSelected = letterFilter === letter;
              return (
                <button
                  key={letter}
                  type="button"
                  onClick={() => setLetterFilter(letter)}
                  className={`w-6 h-6 rounded text-[11px] font-bold cursor-pointer transition-colors flex items-center justify-center ${
                    isSelected
                      ? 'bg-emerald-800 text-white shadow-2xs'
                      : hasJobs
                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100'
                      : 'bg-stone-50 text-stone-400 border border-stone-200 hover:bg-stone-100'
                  }`}
                  title={hasJobs ? `Filter positions starting with ${letter}` : `No posted jobs starting with ${letter} yet`}
                >
                  {letter}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Grid of Active Job Openings */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {visibleJobs.length === 0 ? (
          <div className="col-span-full py-14 text-center bg-white rounded-xl border border-dashed border-stone-300 p-8">
            <AlertCircle className="w-9 h-9 text-stone-400 mx-auto mb-2.5" />
            <h3 className="text-sm font-bold text-stone-800">No job postings match these filters</h3>
            <p className="text-xs text-stone-500 mt-1">
              Try resetting your notice period, salary, or location filters, or publish a new vacancy above.
            </p>
            <button
              type="button"
              onClick={resetJobFilters}
              className="mt-4 px-4 py-2 text-xs font-semibold bg-stone-800 text-white rounded-lg hover:bg-stone-900 cursor-pointer"
            >
              Reset Job Filters
            </button>
          </div>
        ) : (
          visibleJobs.map((job) => {
            const isSelected = selectedJobToMatch?.id === job.id;
            const isIntl = job.scope === 'international';
            const jobSegment = inferWorkforceSegment(job.category, job.title, job.skillsRequired);

            return (
              <div
                key={job.id}
                className={`bg-white rounded-xl border p-4 shadow-2xs flex flex-col justify-between transition-all ${
                  isSelected
                    ? 'border-emerald-700 ring-2 ring-emerald-700/20 shadow-md'
                    : isIntl
                    ? 'border-sky-200 bg-sky-50/10'
                    : 'border-stone-200'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-900">
                        {job.category}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          jobSegment === 'Blue Collar'
                            ? 'bg-amber-100 text-amber-950 border-amber-300'
                            : jobSegment === 'IT'
                            ? 'bg-indigo-100 text-indigo-950 border-indigo-200'
                            : 'bg-stone-100 text-stone-800 border-stone-200'
                        }`}
                      >
                        {jobSegment}
                      </span>
                      {isIntl ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-900 border border-sky-300 flex items-center gap-1">
                          <Globe className="w-3 h-3 text-sky-600" />
                          {job.country || 'International'}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-stone-100 text-stone-700">
                          Pan India
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-semibold text-stone-500">
                      {job.openings} {job.openings === 1 ? 'Opening' : 'Openings'}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-stone-900 mt-2 hover:text-emerald-800 transition-colors">
                    {job.title}
                  </h3>
                  <p className="text-xs text-emerald-900 font-semibold flex items-center gap-1 mt-0.5">
                    <Building2 className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span>{job.companyName || 'Shri Shyam Consulting Client'}</span>
                  </p>

                  <div className="mt-3 text-xs text-stone-600 space-y-1.5 bg-stone-50 p-2.5 rounded-lg border border-stone-100">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span className="truncate">{job.location}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        <span>{job.experience}</span>
                      </span>
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-stone-700">
                        <UserCheck className="w-3 h-3 text-stone-400" />
                        <span>{job.genderPreference || 'Any'}</span>
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5">
                        {isIntl ? (
                          <Globe className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                        ) : (
                          <IndianRupee className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        )}
                        <span className="font-semibold text-stone-800">{job.salaryRange}</span>
                      </span>
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-900 text-[10px] font-bold">
                        <Zap className="w-2.5 h-2.5 text-amber-600" />
                        {job.noticePeriod || 'Immediate'}
                      </span>
                    </div>
                    {isIntl && job.visaSponsorship && (
                      <div className="flex items-center gap-1.5 text-emerald-800 font-semibold pt-0.5">
                        <Plane className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                        <span>Visa &amp; Work Permit Sponsored</span>
                      </div>
                    )}
                  </div>

                  <p className="mt-2 text-xs text-stone-600 line-clamp-2 leading-relaxed">
                    {job.description}
                  </p>

                  <div className="mt-2.5 flex flex-wrap gap-1">
                    {job.skillsRequired.map((skill, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded bg-stone-100 text-stone-700 text-[10px] font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-[10px] text-stone-400">Posted: {job.createdAt}</span>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setShareJob(job)}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-lg text-xs font-bold cursor-pointer transition-colors"
                    >
                      <Share2 className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Share Link</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleMatchCandidates(job)}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-2xs transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>Match</span>
                    </button>

                    {onDeleteJobPosting && (
                      confirmDeleteJobId === job.id ? (
                        <div className="inline-flex items-center gap-1 bg-rose-50 border border-rose-200 px-2 py-1 rounded-lg">
                          <button
                            type="button"
                            onClick={async () => {
                              setConfirmDeleteJobId(null);
                              if (selectedJobToMatch?.id === job.id) setSelectedJobToMatch(null);
                              if (shareJob?.id === job.id) setShareJob(null);
                              await onDeleteJobPosting(job.id);
                              setBulkAzFeedback(`Deleted job mandate "${job.title}".`);
                              setTimeout(() => setBulkAzFeedback(null), 4000);
                            }}
                            className="px-1.5 py-0.5 bg-rose-700 hover:bg-rose-800 text-white rounded text-[10px] font-bold cursor-pointer"
                          >
                            Confirm
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteJobId(null)}
                            className="px-1 py-0.5 text-stone-600 text-[10px] font-semibold cursor-pointer"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          id={`btn-delete-job-${job.id}`}
                          onClick={() => setConfirmDeleteJobId(job.id)}
                          className="p-1.5 rounded-lg border border-rose-200 bg-rose-50/70 hover:bg-rose-100 text-rose-700 cursor-pointer transition-colors"
                          title={`Delete ${job.title}`}
                          aria-label={`Delete ${job.title}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Matched Candidates from Resdex Section */}
      {selectedJobToMatch && (
        <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div>
              <h3 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-700" />
                <span>AI Matched Resdex Profiles for: &quot;{selectedJobToMatch.title}&quot;</span>
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                {selectedJobToMatch.companyName} • {selectedJobToMatch.location} • Experience: {selectedJobToMatch.experience} • Notice: {selectedJobToMatch.noticePeriod || 'Immediate'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setSelectedJobToMatch(null)}
              className="text-xs font-bold text-stone-400 hover:text-stone-700 cursor-pointer"
            >
              Close Match View
            </button>
          </div>

          {isMatching ? (
            <div className="py-10 text-center text-stone-500 text-xs">
              <Sparkles className="w-6 h-6 text-emerald-600 animate-spin mx-auto mb-2" />
              <span>Analyzing candidate competencies and scoring against job requirements...</span>
            </div>
          ) : matchedCandidatesList.length === 0 ? (
            <div className="py-8 text-center text-stone-400 text-xs italic">
              No matching profiles found in database.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {matchedCandidatesList.map((c) => (
                <div
                  key={c.id}
                  className="border border-stone-200 rounded-lg p-3 bg-stone-50/60 hover:bg-white hover:shadow-xs transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <h4 className="font-bold text-xs text-stone-900">{c.name}</h4>
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-100 text-emerald-900">
                        {c.aiScore || 88}% Match
                      </span>
                    </div>

                    <p className="text-[11px] text-emerald-900 font-medium mt-0.5">{c.designation}</p>
                    {c.company && <p className="text-[10px] text-stone-500">{c.company}</p>}

                    <div className="mt-2 text-[11px] text-stone-600 space-y-0.5">
                      <p>
                        Location: <strong className="text-stone-800">{c.location}</strong>
                      </p>
                      <p>
                        Exp: <strong className="text-stone-800">{c.experience}</strong> • Notice:{' '}
                        <strong className="text-emerald-800">{c.noticePeriod}</strong>
                      </p>
                      <p>
                        CTC: <strong className="text-stone-800">{c.currentSalary || 'Negotiable'}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-stone-200/70 flex items-center justify-between">
                    <span className="font-mono text-[11px] text-stone-700">{c.contact}</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onSelectCandidateForCall(c)}
                        className="px-2 py-1 bg-emerald-800 hover:bg-emerald-900 text-white rounded text-[10px] font-bold cursor-pointer"
                      >
                        AI Call
                      </button>
                      <button
                        type="button"
                        onClick={() => onScheduleInterview(c)}
                        className="px-2 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded text-[10px] font-bold cursor-pointer"
                      >
                        Schedule
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create Job Posting Modal (Naukri Portal Fields) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-stone-200 shadow-xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-bold text-base text-stone-900 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-emerald-800" />
                <span>Create Naukri-Style Job Posting (Pan-India / International)</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-stone-400 hover:text-stone-700 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateJob} className="space-y-3 text-xs">
              {/* Posting Scope Toggle: Pan-India vs International */}
              <div>
                <label className="block font-medium text-stone-700 mb-1">Posting Scope</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleScopeChange('domestic')}
                    className={`py-2 px-3 rounded-lg border font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                      scope === 'domestic'
                        ? 'border-emerald-800 bg-emerald-50 text-emerald-950'
                        : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5 text-amber-600" />
                    <span>All Pan India / Durg CG</span>
                  </button>
                  <button
                    type="button"
                    id="modal-scope-international"
                    onClick={() => handleScopeChange('international')}
                    className={`py-2 px-3 rounded-lg border font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                      scope === 'international'
                        ? 'border-sky-700 bg-sky-50 text-sky-950'
                        : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5 text-sky-600" />
                    <span>International / Overseas</span>
                  </button>
                </div>
              </div>

              {/* Searchable A-Z Job Title Catalog + Quick Chips */}
              <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-200 space-y-2">
                <label className="block font-bold text-emerald-950 flex items-center gap-1.5">
                  <ArrowDownAZ className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Select Job Title (Searchable A–Z Catalog • IT, Non-IT &amp; Blue Collar)</span>
                </label>
                <SearchableTitlePicker
                  value={title}
                  onSelectCatalogItem={(selected) => {
                    setTitle(selected.title);
                    setCategory(selected.category);
                    setIndustry(selected.industry);
                    setSkillsRequired(selected.skills);
                  }}
                  onSelectCustomTitle={(custom) => setTitle(custom)}
                />
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  <span className="text-[10px] font-bold text-stone-500 mr-0.5">Popular:</span>
                  {QUICK_JOB_TITLE_CHIPS.map((chip) => {
                    const match = POSITION_CATALOG_AZ.find((p) => p.title === chip);
                    const active = title.toLowerCase() === chip.toLowerCase();
                    return (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => {
                          if (match) {
                            setTitle(match.title);
                            setCategory(match.category);
                            setIndustry(match.industry);
                            setSkillsRequired(match.skills);
                          } else {
                            setTitle(chip);
                          }
                        }}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border cursor-pointer transition-colors ${
                          active
                            ? 'bg-emerald-800 text-white border-emerald-800'
                            : 'bg-white text-stone-700 border-stone-300 hover:border-emerald-700'
                        }`}
                      >
                        {chip}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Job Title / Designation *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={
                      scope === 'international'
                        ? 'e.g. Senior VAT Accountant (Dubai), CNC Supervisor'
                        : 'e.g. Data Entry Executive, Staff Nurse, Telecaller'
                    }
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:ring-1 focus:ring-emerald-700"
                  />
                </div>
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Hiring Company Name</label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Bhilai Steel & Alloys / Al-Noor LLC"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:ring-1 focus:ring-emerald-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">
                    Job Category (Searchable A–Z)
                  </label>
                  <SearchableCategoryPicker
                    value={category}
                    onChange={(val) => {
                      setCategory(val);
                      setIndustry(val);
                    }}
                  />
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">Industry Sector</label>
                  <input
                    type="text"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    placeholder="e.g. FMCG, Manufacturing, FinTech, BPO"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:ring-1 focus:ring-emerald-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {scope === 'international' ? (
                  <div>
                    <label className="block font-medium text-stone-700 mb-1">Target Country</label>
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:ring-1 focus:ring-sky-700"
                    >
                      {INTERNATIONAL_COUNTRIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block font-medium text-stone-700 mb-1">Quick Pan-India City Preset</label>
                    <select
                      value=""
                      onChange={(e) => {
                        if (e.target.value) setLocation(e.target.value);
                      }}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900"
                    >
                      <option value="">Select Pan-India Hub (or type below)...</option>
                      <option value="Pan-India / Remote">All Pan-India / Remote</option>
                      {PAN_INDIA_CITIES.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block font-medium text-stone-700 mb-1">Exact City / Office Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder={scope === 'international' ? 'Dubai, UAE / Remote' : 'Paras Complex, Durg, CG'}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:ring-1 focus:ring-emerald-700"
                  />
                </div>
              </div>

              {/* Vacancy / Openings Stepper + Quick Tap Pills (01, 02, 05, 10, 25, 50) */}
              <div className="p-3 rounded-lg bg-stone-50 border border-stone-200 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <label className="font-semibold text-stone-800">Vacancy / Openings</label>
                  <div className="inline-flex items-center border border-stone-300 rounded-lg bg-white overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setOpenings((o) => Math.max(1, o - 1))}
                      className="px-3 py-1 text-sm font-bold text-stone-700 hover:bg-stone-100 cursor-pointer"
                      aria-label="Decrease vacancy"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min={1}
                      max={1000}
                      value={openings}
                      onChange={(e) => setOpenings(Math.max(1, parseInt(e.target.value, 10) || 1))}
                      className="w-14 text-center py-1 text-xs font-bold text-stone-900 border-x border-stone-200 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setOpenings((o) => Math.min(1000, o + 1))}
                      className="px-3 py-1 text-sm font-bold text-stone-700 hover:bg-stone-100 cursor-pointer"
                      aria-label="Increase vacancy"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[1, 2, 5, 10, 25, 50].map((qty) => (
                    <button
                      key={qty}
                      type="button"
                      onClick={() => setOpenings(qty)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold border cursor-pointer transition-colors ${
                        openings === qty
                          ? 'bg-emerald-800 text-white border-emerald-800'
                          : 'bg-white text-stone-700 border-stone-300 hover:border-emerald-700'
                      }`}
                    >
                      {qty < 10 ? `0${qty}` : qty}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Notice Period</label>
                  <select
                    value={noticePeriod}
                    onChange={(e) => setNoticePeriod(e.target.value)}
                    className="w-full px-2.5 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900"
                  >
                    <option value="Immediate (0 Days)">Immediate Joiner</option>
                    <option value="0 Days">0 Days</option>
                    <option value="15 Days">15 Days</option>
                    <option value="1 Month">1 Month</option>
                    <option value="2 Months / Negotiable">2 Months / Negotiable</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">Gender Preference</label>
                  <select
                    value={genderPreference}
                    onChange={(e) => setGenderPreference(e.target.value as 'Any' | 'Male' | 'Female')}
                    className="w-full px-2.5 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900"
                  >
                    <option value="Any">Any Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">Experience</label>
                  <input
                    type="text"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    placeholder="2 - 5 Years"
                    className="w-full px-2.5 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Salary / Package</label>
                  <input
                    type="text"
                    value={salaryRange}
                    onChange={(e) => setSalaryRange(e.target.value)}
                    placeholder={scope === 'international' ? 'AED 12,000 / mo' : '₹3.5 - 5.5 LPA'}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900"
                  />
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="Accounts / Sales / Production"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900"
                  />
                </div>
              </div>

              {scope === 'international' && (
                <label className="flex items-center gap-2 w-full px-3 py-2 rounded-lg bg-sky-50 border border-sky-200 cursor-pointer font-semibold text-sky-950">
                  <input
                    type="checkbox"
                    checked={visaSponsorship}
                    onChange={(e) => setVisaSponsorship(e.target.checked)}
                    className="w-4 h-4 text-sky-700 rounded border-sky-300"
                  />
                  <Plane className="w-3.5 h-3.5 text-sky-700" />
                  <span>Work Visa / Employment Pass Sponsorship Provided</span>
                </label>
              )}

              <div>
                <label className="block font-medium text-stone-700 mb-1">Required Skills (Comma separated)</label>
                <input
                  type="text"
                  value={skillsRequired}
                  onChange={(e) => setSkillsRequired(e.target.value)}
                  placeholder="Tally, GST, Balance Sheet, Auditing"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-medium text-stone-700">Job Description</label>
                  <button
                    type="button"
                    onClick={handleGenerateAiJd}
                    disabled={isGeneratingAiJd}
                    className="text-[11px] font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>{isGeneratingAiJd ? 'Drafting JD...' : 'Generate with Gemini AI'}</span>
                  </button>
                </div>
                {formHint && <p className="text-[11px] text-amber-700 mb-1">{formHint}</p>}
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed role responsibilities, visa/relocation conditions, and hiring guidelines..."
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-stone-300 text-stone-700 rounded-lg hover:bg-stone-50 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg font-bold cursor-pointer shadow-xs"
                >
                  Publish {scope === 'international' ? 'International' : 'Pan-India'} Posting
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
        </>
      )}

      {/* Share Job Link Across All Social Media Platforms Modal */}
      {shareJob && (() => {
        const directUrl = buildApplyUrl(shareJob.id, 'Direct Link');
        const whatsappUrl = buildApplyUrl(shareJob.id, 'WhatsApp');
        const linkedinUrl = buildApplyUrl(shareJob.id, 'LinkedIn');
        const facebookUrl = buildApplyUrl(shareJob.id, 'Facebook');
        const instagramUrl = buildApplyUrl(shareJob.id, 'Instagram');
        const telegramUrl = buildApplyUrl(shareJob.id, 'Telegram');
        const xUrl = buildApplyUrl(shareJob.id, 'X');
        const emailUrl = buildApplyUrl(shareJob.id, 'Email');

        const whatsappText = encodeURIComponent(buildSocialPostCopy(shareJob, whatsappUrl));
        const xText = encodeURIComponent(`Hiring ${shareJob.title} (${shareJob.location}) at ${shareJob.companyName || 'Shri Shyam Consulting'}. Apply directly:`);
        const telegramText = encodeURIComponent(buildSocialPostCopy(shareJob, telegramUrl));
        const igCaption = buildSocialPostCopy(shareJob, instagramUrl);
        const emailSubject = encodeURIComponent(`Job Opening: ${shareJob.title} - ${shareJob.location}`);
        const emailBody = encodeURIComponent(buildSocialPostCopy(shareJob, emailUrl));

        return (
          <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-stone-200 shadow-2xl max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between border-b border-stone-100 pb-3">
                <div>
                  <h3 className="font-bold text-base text-stone-900 flex items-center gap-2">
                    <Share2 className="w-5 h-5 text-emerald-800" />
                    <span>Share Job Posting on All Social Media</span>
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    {shareJob.title} • Applicants applying via any link sync directly into your Excel Sheet.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShareJob(null)}
                  className="text-stone-400 hover:text-stone-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Direct Copy Link */}
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                <span className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block">
                  Direct Public Application Link
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={directUrl}
                    className="flex-1 px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs font-mono text-stone-800"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopyText('direct-link', directUrl)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold cursor-pointer shrink-0"
                  >
                    {copiedShareKey === 'direct-link' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedShareKey === 'direct-link' ? 'Copied' : 'Copy Link'}</span>
                  </button>
                </div>
              </div>

              {/* All Social Media Platforms Grid */}
              <div>
                <span className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block mb-2">
                  1-Click Share to Social Media Platforms
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                  <a
                    href={`https://wa.me/?text=${whatsappText}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-2xs"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp</span>
                  </a>

                  <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(linkedinUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-sky-700 hover:bg-sky-800 text-white font-bold shadow-2xs"
                  >
                    <Globe className="w-4 h-4" />
                    <span>LinkedIn</span>
                  </a>

                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(facebookUrl)}&quote=${whatsappText}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-2xs"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Facebook</span>
                  </a>

                  <a
                    href={`https://t.me/share/url?url=${encodeURIComponent(telegramUrl)}&text=${telegramText}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold shadow-2xs"
                  >
                    <Send className="w-4 h-4" />
                    <span>Telegram</span>
                  </a>

                  <a
                    href={`https://twitter.com/intent/tweet?text=${xText}&url=${encodeURIComponent(xUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold shadow-2xs"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>X / Twitter</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => handleCopyText('ig-caption', igCaption)}
                    className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-2xs cursor-pointer"
                  >
                    {copiedShareKey === 'ig-caption' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedShareKey === 'ig-caption' ? 'IG Caption Copied!' : 'Instagram Bio/Post'}</span>
                  </button>

                  <a
                    href={`mailto:?subject=${emailSubject}&body=${emailBody}`}
                    className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-2xs"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Email Blast</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => handleCopyText('full-post', igCaption)}
                    className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold border border-stone-300 cursor-pointer"
                  >
                    {copiedShareKey === 'full-post' ? <Check className="w-4 h-4 text-emerald-700" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedShareKey === 'full-post' ? 'Post Copied!' : 'Copy Full Post'}</span>
                  </button>

                  <a
                    href={directUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold border border-emerald-300"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Open Apply Form</span>
                  </a>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-2 text-xs">
                <span className="text-emerald-900 font-medium">
                  Submissions arrive automatically in your <strong>Applications Excel Sheet</strong>.
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setShareJob(null);
                    setSubView('excel-sheet');
                  }}
                  className="px-3 py-1.5 bg-emerald-800 text-white rounded-lg font-bold cursor-pointer shrink-0"
                >
                  View Excel Sheet
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

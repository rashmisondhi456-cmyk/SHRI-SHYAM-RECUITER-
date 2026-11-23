import React, { useEffect, useRef, useState } from 'react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { Candidate, CandidateStatus, InterviewSchedule, JobApplication, JobPosting, CallLogItem } from './types';
import { INITIAL_CANDIDATES, INITIAL_JOB_POSTINGS } from './data/resdexDatabase';
import { Header, TabType } from './components/Header';
import { ResdexSearch } from './components/ResdexSearch';
import { AiCallingAgent } from './components/AiCallingAgent';
import { AtsPipeline } from './components/AtsPipeline';
import { InterviewScheduler } from './components/InterviewScheduler';
import { JobPostingManager } from './components/JobPostingManager';
import { CandidateModal } from './components/CandidateModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { AuthGate } from './components/AuthGate';
import { PublicJobApply } from './components/PublicJobApply';
import { RecruiterHome } from './components/RecruiterHome';
import { auth } from './lib/firebase';
import { enrichCandidate, enrichJobPosting } from './lib/naukriFilters';
import {
  createCandidateInFirestore,
  createInterviewInFirestore,
  createJobInFirestore,
  createJobsBatchInFirestore,
  deleteApplicationInFirestore,
  deleteCandidateInFirestore,
  deleteCandidatesBatchInFirestore,
  deleteInterviewInFirestore,
  deleteJobInFirestore,
  ensureUserWorkspace,
  importCandidatesBatchToFirestore,
  seedInitialWorkspaceIfEmpty,
  subscribeApplications,
  subscribeCandidates,
  subscribeInterviews,
  subscribeJobs,
  syncPublicJobsForUser,
  updateApplicationStatusInFirestore,
  updateCandidateScreeningInFirestore,
  updateCandidateStageInFirestore,
  updateInterviewStatusInFirestore,
} from './lib/firestoreStore';
import {
  Users,
  Calendar,
  Bot,
  Globe,
  Lock,
  Database,
  AlertCircle,
} from 'lucide-react';

const INITIAL_DEMO_INTERVIEWS: InterviewSchedule[] = [
  {
    id: 'int-demo-1',
    candidateId: 'cand-cg-01',
    candidateName: 'Pankaj Pandey',
    candidateContact: '7470736326',
    candidateEmail: 'pankaj.pandey.durg@gmail.com',
    role: 'Recruitment & Operations Executive',
    interviewType: 'in_person_durg',
    locationAddress: 'Shri Shyam Consulting, Paras Complex, Durg, CG (Chhattisgarh, Pin: 491001)',
    dateTime: '2026-09-18 at 11:00 AM',
    status: 'scheduled',
    interviewer: 'HR Director, Shri Shyam Consulting',
    notes: 'Local Durg candidate. Sourced via Resdex. Focus on regional recruitment network and team operations.',
  },
  {
    id: 'int-demo-2',
    candidateId: 'cand-fmcg-01',
    candidateName: 'Ruqayya Imran',
    candidateContact: '8745085362',
    candidateEmail: 'ruqayya.imran@gmail.com',
    role: 'Senior Business Development Manager',
    interviewType: 'google_meet',
    locationAddress: 'Google Meet Online Video Conference',
    dateTime: '2026-09-19 at 03:00 PM',
    status: 'scheduled',
    meetLink: 'https://meet.google.com/ssc-durg-ruqayy',
    interviewer: 'Corporate Client Panel',
    notes: '7 years FMCG experience, 90k current salary, immediate joiner.',
  },
];

export default function App() {
  const [publicApplyParams, setPublicApplyParams] = useState<{
    jobId: string;
    recruiterUid: string;
    sourcePlatform: string;
  } | null>(() => {
    const params = new URLSearchParams(window.location.search);
    const applyJobId = params.get('apply');
    const recruiterUid = params.get('recruiter');
    if (applyJobId && recruiterUid) {
      return {
        jobId: applyJobId,
        recruiterUid,
        sourcePlatform: params.get('src') || 'Direct Link',
      };
    }
    return null;
  });

  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [syncingWorkspace, setSyncingWorkspace] = useState(false);
  const [workspaceError, setWorkspaceError] = useState<string | null>(null);
  const [workspaceRetryTick, setWorkspaceRetryTick] = useState(0);

  const [activeTab, setActiveTab] = useState<TabType>('resdex');
  const [openCreateJobSignal, setOpenCreateJobSignal] = useState(0);
  const [openExcelSheetSignal, setOpenExcelSheetSignal] = useState(0);
  const [candidates, setCandidates] = useState<Candidate[]>(() =>
    INITIAL_CANDIDATES.map(enrichCandidate)
  );
  const [jobPostings, setJobPostings] = useState<JobPosting[]>(() =>
    INITIAL_JOB_POSTINGS.map(enrichJobPosting)
  );
  const [interviews, setInterviews] = useState<InterviewSchedule[]>(INITIAL_DEMO_INTERVIEWS);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const syncedPublicJobsRef = useRef(false);

  // Selected candidate state for calling & modal
  const [selectedCandidateForCall, setSelectedCandidateForCall] = useState<Candidate | null>(null);
  const [prefilledInterviewCandidate, setPrefilledInterviewCandidate] = useState<Candidate | null>(null);
  const [prefilledInterviewNotes, setPrefilledInterviewNotes] = useState<string>('');
  const [activeModalCandidate, setActiveModalCandidate] = useState<Candidate | null>(null);

  // Auth listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  // Firestore encrypted workspace sync when user is authenticated & verified
  useEffect(() => {
    if (!authReady || !user || !user.emailVerified) return;

    let unsubCands: (() => void) | undefined;
    let unsubJobs: (() => void) | undefined;
    let unsubInts: (() => void) | undefined;
    let unsubApps: (() => void) | undefined;
    let active = true;
    syncedPublicJobsRef.current = false;

    async function initEncryptedWorkspace(currentUser: User) {
      setSyncingWorkspace(true);
      setWorkspaceError(null);
      try {
        await ensureUserWorkspace(currentUser);
        await seedInitialWorkspaceIfEmpty(
          currentUser.uid,
          INITIAL_CANDIDATES,
          INITIAL_JOB_POSTINGS,
          INITIAL_DEMO_INTERVIEWS
        );
        if (!active) return;

        unsubCands = subscribeCandidates(currentUser.uid, (list) => {
          setCandidates(list);
        });
        unsubJobs = subscribeJobs(currentUser.uid, (list) => {
          setJobPostings(list);
          if (list.length > 0 && !syncedPublicJobsRef.current) {
            syncedPublicJobsRef.current = true;
            syncPublicJobsForUser(currentUser.uid, list).catch(console.error);
          }
        });
        unsubInts = subscribeInterviews(currentUser.uid, (list) => {
          setInterviews(list);
        });
        unsubApps = subscribeApplications(currentUser.uid, (list) => {
          setApplications(list);
        });
      } catch (err) {
        console.error('Workspace initialization failed:', err);
        if (active) {
          setWorkspaceError(
            err instanceof Error
              ? 'Could not sync your Google workspace with Firestore. Check your connection and retry.'
              : 'Could not sync your Google workspace with Firestore.'
          );
        }
      } finally {
        if (active) setSyncingWorkspace(false);
      }
    }

    initEncryptedWorkspace(user);

    return () => {
      active = false;
      unsubCands?.();
      unsubJobs?.();
      unsubInts?.();
      unsubApps?.();
    };
  }, [authReady, user, user?.emailVerified, workspaceRetryTick]);

  if (publicApplyParams) {
    return (
      <PublicJobApply
        jobId={publicApplyParams.jobId}
        recruiterUid={publicApplyParams.recruiterUid}
        sourcePlatform={publicApplyParams.sourcePlatform}
        onExitPublicApply={() => {
          const url = new URL(window.location.href);
          url.searchParams.delete('apply');
          url.searchParams.delete('recruiter');
          url.searchParams.delete('src');
          window.history.replaceState({}, '', url.toString());
          setPublicApplyParams(null);
        }}
      />
    );
  }

  const handleSignOut = async () => {
    await signOut(auth);
    syncedPublicJobsRef.current = false;
    setWorkspaceError(null);
    setSelectedCandidateForCall(null);
    setPrefilledInterviewCandidate(null);
    setActiveModalCandidate(null);
    setCandidates(INITIAL_CANDIDATES.map(enrichCandidate));
    setJobPostings(INITIAL_JOB_POSTINGS.map(enrichJobPosting));
    setInterviews(INITIAL_DEMO_INTERVIEWS);
    setApplications([]);
  };

  const handleRefreshVerification = async () => {
    if (auth.currentUser) {
      await auth.currentUser.reload();
      await auth.currentUser.getIdToken(true);
      setUser(auth.currentUser);
      setWorkspaceRetryTick((t) => t + 1);
    }
  };

  // Loading state before auth resolves
  if (!authReady) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-900 text-amber-300 flex items-center justify-center mx-auto animate-pulse">
            <Lock className="w-5 h-5" />
          </div>
          <p className="text-xs font-semibold text-stone-600">
            Initializing Encrypted Workspace...
          </p>
        </div>
      </div>
    );
  }

  // Unauthenticated gate
  if (!user) {
    return <AuthGate />;
  }

  // Email verification gate
  if (!user.emailVerified) {
    return (
      <AuthGate
        unverifiedUser={user}
        onRefreshVerification={handleRefreshVerification}
        onSignOut={handleSignOut}
      />
    );
  }

  // Status updates
  const handleUpdateCandidateStatus = (candidateId: string, newStatus: CandidateStatus) => {
    setCandidates((prev) =>
      prev.map((c) => (c.id === candidateId ? { ...c, status: newStatus } : c))
    );
    updateCandidateStageInFirestore(user.uid, candidateId, newStatus).catch(console.error);
  };

  // Call completion handler
  const handleCallCompleted = (candidateId: string, log: CallLogItem, updated?: Partial<Candidate>) => {
    let updatedCandidate: Candidate | undefined;
    setCandidates((prev) =>
      prev.map((c) => {
        if (c.id === candidateId) {
          updatedCandidate = {
            ...c,
            ...updated,
            callLogs: [...(c.callLogs || []), log],
          };
          return updatedCandidate;
        }
        return c;
      })
    );
    if (updatedCandidate) {
      updateCandidateScreeningInFirestore(user.uid, updatedCandidate).catch(console.error);
    }
  };

  // Switch to Calling Agent
  const handleSelectCandidateForCall = (candidate: Candidate) => {
    setSelectedCandidateForCall(candidate);
    setActiveTab('ai-calling');
  };

  // Switch to Interview Scheduler
  const handleScheduleInterview = (candidate: Candidate, notes?: string) => {
    setPrefilledInterviewCandidate(candidate);
    if (notes) setPrefilledInterviewNotes(notes);
    setActiveTab('interviews');
  };

  // Add interview
  const handleAddInterview = (interview: InterviewSchedule) => {
    setInterviews((prev) => [interview, ...prev]);
    handleUpdateCandidateStatus(interview.candidateId, 'interview_scheduled');
    createInterviewInFirestore(user.uid, interview).catch(console.error);
  };

  // Update interview status
  const handleUpdateInterviewStatus = (id: string, status: 'scheduled' | 'completed' | 'cancelled') => {
    setInterviews((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status } : item))
    );
    updateInterviewStatusInFirestore(user.uid, id, status).catch(console.error);
  };

  // Add job posting
  const handleAddJobPosting = (newJob: JobPosting) => {
    setJobPostings((prev) => [newJob, ...prev]);
    createJobInFirestore(user.uid, newJob).catch(console.error);
  };

  // Batch add A-Z job postings
  const handleAddJobsBatch = async (newJobs: JobPosting[]) => {
    if (newJobs.length === 0) return;
    setJobPostings((prev) => [...newJobs, ...prev]);
    await createJobsBatchInFirestore(user.uid, newJobs);
  };

  // Add single candidate to Firestore database
  const handleAddCandidateToDb = async (candidate: Candidate) => {
    setCandidates((prev) => [candidate, ...prev]);
    await createCandidateInFirestore(user.uid, candidate);
  };

  // Bulk import Excel/CSV candidates to Firestore database
  const handleImportCandidatesToDb = async (imported: Candidate[]) => {
    setCandidates((prev) => [...imported, ...prev]);
    await importCandidatesBatchToFirestore(user.uid, imported);
  };

  // Update incoming social application status
  const handleUpdateApplicationStatus = (
    applicationId: string,
    status: JobApplication['status']
  ) => {
    setApplications((prev) =>
      prev.map((a) => (a.id === applicationId ? { ...a, status } : a))
    );
    updateApplicationStatusInFirestore(user.uid, applicationId, status).catch(console.error);
  };

  // Delete handlers (Firestore + local optimistic state)
  const handleDeleteCandidate = async (candidateId: string) => {
    setCandidates((prev) => prev.filter((c) => c.id !== candidateId));
    if (selectedCandidateForCall?.id === candidateId) setSelectedCandidateForCall(null);
    if (prefilledInterviewCandidate?.id === candidateId) setPrefilledInterviewCandidate(null);
    if (activeModalCandidate?.id === candidateId) setActiveModalCandidate(null);
    await deleteCandidateInFirestore(user.uid, candidateId);
  };

  const handleDeleteCandidatesBatch = async (candidateIds: string[]) => {
    if (candidateIds.length === 0) return;
    const idSet = new Set(candidateIds);
    setCandidates((prev) => prev.filter((c) => !idSet.has(c.id)));
    if (selectedCandidateForCall && idSet.has(selectedCandidateForCall.id)) {
      setSelectedCandidateForCall(null);
    }
    if (prefilledInterviewCandidate && idSet.has(prefilledInterviewCandidate.id)) {
      setPrefilledInterviewCandidate(null);
    }
    if (activeModalCandidate && idSet.has(activeModalCandidate.id)) {
      setActiveModalCandidate(null);
    }
    await deleteCandidatesBatchInFirestore(user.uid, candidateIds);
  };

  const handleDeleteJobPosting = async (jobId: string) => {
    setJobPostings((prev) => prev.filter((j) => j.id !== jobId));
    await deleteJobInFirestore(user.uid, jobId);
  };

  const handleDeleteApplication = async (applicationId: string) => {
    setApplications((prev) => prev.filter((a) => a.id !== applicationId));
    await deleteApplicationInFirestore(user.uid, applicationId);
  };

  const handleDeleteInterview = async (interviewId: string) => {
    setInterviews((prev) => prev.filter((i) => i.id !== interviewId));
    await deleteInterviewInFirestore(user.uid, interviewId);
  };

  // Convert applicant from Excel Sheet into Resdex Candidate DB + optional Call / Schedule
  const handleConvertApplicationToCandidate = (
    app: JobApplication,
    nextAction?: 'call' | 'schedule'
  ) => {
    const existing = candidates.find(
      (c) =>
        (c.contact && app.phone && c.contact.replace(/\D/g, '') === app.phone.replace(/\D/g, '')) ||
        (c.email && app.email && c.email.toLowerCase() === app.email.toLowerCase())
    );
    const matchedJob = jobPostings.find((j) => j.id === app.jobId);

    const candidate: Candidate =
      existing ||
      enrichCandidate({
        id: `cand-app-${app.id}`,
        name: app.applicantName,
        contact: app.phone,
        email: app.email,
        location: app.currentLocation,
        country: matchedJob?.country || 'India',
        scope: matchedJob?.scope || 'domestic',
        company: app.currentCompany || app.companyName || 'Direct Applicant',
        gender: app.gender || 'Any',
        designation: app.jobTitle,
        category: matchedJob?.category || 'Executive & Management',
        experience: app.experience,
        currentSalary: app.currentSalary || 'Negotiable',
        expectedSalary: app.expectedSalary || 'Negotiable',
        noticePeriod: app.noticePeriod,
        resumeLink: app.resumeLink || undefined,
        sourceDate: app.appliedDate,
        skills: app.skills.length > 0 ? app.skills : matchedJob?.skillsRequired || ['Applicant'],
        status: 'shortlisted',
        aiScore: 85,
        screeningNotes: `Applied via ${app.sourcePlatform} for ${app.jobTitle}. ${app.coverNote || ''}`.trim(),
      });

    if (!existing) {
      setCandidates((prev) => [candidate, ...prev]);
      createCandidateInFirestore(user.uid, candidate).catch(console.error);
    }

    if (app.status === 'new') {
      handleUpdateApplicationStatus(app.id, 'shortlisted');
    }

    if (nextAction === 'call') {
      handleSelectCandidateForCall(candidate);
    } else if (nextAction === 'schedule') {
      handleScheduleInterview(candidate, `Applied via ${app.sourcePlatform} for ${app.jobTitle}`);
    }
  };

  // Export to CSV helper
  const handleExportCandidatesCsv = (listToExport: Candidate[]) => {
    const headers = ['Name', 'Contact', 'Email', 'Location', 'Country', 'Scope', 'Designation', 'Category', 'Experience', 'Current Salary', 'Notice Period', 'Status', 'AI Score'];
    const rows = listToExport.map((c) => [
      `"${c.name}"`,
      `"${c.contact}"`,
      `"${c.email}"`,
      `"${c.location}"`,
      `"${c.country || 'India'}"`,
      `"${c.scope || 'domestic'}"`,
      `"${c.designation}"`,
      `"${c.category}"`,
      `"${c.experience}"`,
      `"${c.currentSalary || 'Negotiable'}"`,
      `"${c.noticePeriod || 'Immediate'}"`,
      `"${c.status}"`,
      `"${c.aiScore || 0}%"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Shri_Shyam_Consulting_Resdex_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportInterviewsCsv = () => {
    const headers = ['Candidate Name', 'Contact', 'Role', 'Date & Time', 'Interview Mode', 'Interviewer', 'Status', 'Address / Link'];
    const rows = interviews.map((item) => [
      `"${item.candidateName}"`,
      `"${item.candidateContact}"`,
      `"${item.role}"`,
      `"${item.dateTime}"`,
      `"${item.interviewType}"`,
      `"${item.interviewer}"`,
      `"${item.status}"`,
      `"${item.meetLink || item.locationAddress}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Shri_Shyam_Consulting_Interviews_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const screenedCount = candidates.filter((c) => c.status === 'screened' || c.status === 'interview_scheduled').length;
  const localCgCount = candidates.filter((c) =>
    c.location.toLowerCase().includes('durg') ||
    c.location.toLowerCase().includes('bhilai') ||
    c.location.toLowerCase().includes('raipur') ||
    c.location.toLowerCase().includes('chhattisgarh')
  ).length;
  const internationalJobsCount = jobPostings.filter((j) => j.scope === 'international').length;

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans flex flex-col antialiased selection:bg-emerald-100 selection:text-emerald-950">
      {/* Corporate Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        candidateCount={candidates.length}
        scheduledCount={interviews.filter((i) => i.status === 'scheduled').length}
        callingQueueCount={candidates.filter((c) => c.status === 'sourced').length}
        userEmail={user.email}
        userName={user.displayName}
        userPhotoUrl={user.photoURL}
        onSignOut={handleSignOut}
      />

      {/* Main Workspace Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {syncingWorkspace && (
          <div className="px-3.5 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-emerald-700 animate-pulse" />
            <span>Decrypting &amp; syncing your Shri Shyam Consulting cloud vault...</span>
          </div>
        )}

        {workspaceError && (
          <div className="px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{workspaceError}</span>
            </div>
            <button
              type="button"
              onClick={() => setWorkspaceRetryTick((t) => t + 1)}
              className="px-3 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-800 text-white font-bold cursor-pointer"
            >
              Retry Sync
            </button>
          </div>
        )}

        {/* KPI Dashboard Overview Ribbon */}
        <section aria-label="Operations Overview" className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-stone-500 font-medium block">Resdex Profiles</span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-lg font-bold text-stone-900">{candidates.length}</span>
                <span className="text-[10px] text-amber-700 font-semibold">({localCgCount} Durg/CG)</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-800 flex items-center justify-center shrink-0">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-stone-500 font-medium block">AI Screened</span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-lg font-bold text-stone-900">{screenedCount}</span>
                <span className="text-[10px] text-emerald-700 font-semibold">AES-256 Protected</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-stone-500 font-medium block">Interviews Booked</span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-lg font-bold text-stone-900">
                  {interviews.filter((i) => i.status === 'scheduled').length}
                </span>
                <span className="text-[10px] text-stone-400">Durg &amp; Global Meet</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-800 flex items-center justify-center shrink-0">
              <Database className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <span className="text-xs text-stone-500 font-medium block">Mandates &amp; DB Apps</span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-lg font-bold text-stone-900">{jobPostings.length}</span>
                <span className="text-[10px] text-sky-700 font-semibold">
                  ({internationalJobsCount} Intl • {applications.length} Apps)
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Tab Views */}
        {activeTab === 'home' && (
          <RecruiterHome
            candidates={candidates}
            jobPostings={jobPostings}
            applications={applications}
            interviews={interviews}
            onGoToResdex={() => setActiveTab('resdex')}
            onGoToJobs={() => setActiveTab('job-postings')}
            onPostNewJob={() => {
              setActiveTab('job-postings');
              setOpenCreateJobSignal((n) => n + 1);
            }}
            onOpenApplicationsSheet={() => {
              setActiveTab('job-postings');
              setOpenExcelSheetSignal((n) => n + 1);
            }}
            onGoToInterviews={() => setActiveTab('interviews')}
            onGoToAts={() => setActiveTab('ats')}
          />
        )}

        {activeTab === 'resdex' && (
          <ResdexSearch
            candidates={candidates}
            onSelectCandidateForCall={handleSelectCandidateForCall}
            onScheduleInterview={handleScheduleInterview}
            onOpenCandidateModal={(c) => setActiveModalCandidate(c)}
            onUpdateCandidateStatus={handleUpdateCandidateStatus}
            onExportToCsv={handleExportCandidatesCsv}
            onAddCandidate={handleAddCandidateToDb}
            onImportCandidates={handleImportCandidatesToDb}
            onDeleteCandidate={handleDeleteCandidate}
            onDeleteCandidatesBatch={handleDeleteCandidatesBatch}
          />
        )}

        {activeTab === 'ai-calling' && (
          <AiCallingAgent
            candidates={candidates}
            selectedCandidate={selectedCandidateForCall}
            onSelectCandidate={setSelectedCandidateForCall}
            onCallCompleted={handleCallCompleted}
            onScheduleInterview={handleScheduleInterview}
          />
        )}

        {activeTab === 'ats' && (
          <AtsPipeline
            candidates={candidates}
            onUpdateCandidateStatus={handleUpdateCandidateStatus}
            onSelectCandidateForCall={handleSelectCandidateForCall}
            onScheduleInterview={handleScheduleInterview}
            onOpenCandidateModal={(c) => setActiveModalCandidate(c)}
          />
        )}

        {activeTab === 'interviews' && (
          <InterviewScheduler
            candidates={candidates}
            interviews={interviews}
            prefilledCandidate={prefilledInterviewCandidate}
            prefilledNotes={prefilledInterviewNotes}
            onAddInterview={handleAddInterview}
            onUpdateInterviewStatus={handleUpdateInterviewStatus}
            onDeleteInterview={handleDeleteInterview}
            onExportInterviewsCsv={handleExportInterviewsCsv}
          />
        )}

        {activeTab === 'job-postings' && (
          <JobPostingManager
            recruiterUid={user.uid}
            jobPostings={jobPostings}
            candidates={candidates}
            applications={applications}
            openCreateModalSignal={openCreateJobSignal}
            openExcelSheetSignal={openExcelSheetSignal}
            onAddJobPosting={handleAddJobPosting}
            onAddJobsBatch={handleAddJobsBatch}
            onDeleteJobPosting={handleDeleteJobPosting}
            onDeleteApplication={handleDeleteApplication}
            onSelectCandidateForCall={handleSelectCandidateForCall}
            onScheduleInterview={handleScheduleInterview}
            onUpdateApplicationStatus={handleUpdateApplicationStatus}
            onConvertApplicationToCandidate={handleConvertApplicationToCandidate}
          />
        )}
      </main>

      {/* Candidate Dossier Detail Modal */}
      <CandidateModal
        candidate={activeModalCandidate}
        onClose={() => setActiveModalCandidate(null)}
        onSelectForCall={handleSelectCandidateForCall}
        onScheduleInterview={handleScheduleInterview}
        onUpdateStatus={handleUpdateCandidateStatus}
        onDeleteCandidate={handleDeleteCandidate}
      />

      {/* Offline Connectivity Banner */}
      <OfflineIndicator />

      {/* Corporate Footer */}
      <footer className="bg-white border-t border-stone-200 py-6 text-xs text-stone-500 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-bold text-stone-900 font-serif">SHRI SHYAM CONSULTING</span>
            <span>•</span>
            <span>Paras Complex, Durg, CG</span>
            <span>•</span>
            <span className="font-mono text-stone-800 font-semibold">Helpline: 8269715615</span>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <a
              href="https://www.shrishyamconsulting.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-800 hover:underline font-semibold"
            >
              www.shrishyamconsulting.in
            </a>
            <span>•</span>
            <a
              href="mailto:info@shrishyamconsulting.in"
              className="text-stone-700 hover:text-emerald-800 transition-colors"
            >
              info@shrishyamconsulting.in
            </a>
            <span>•</span>
            <span>AES-256 Encrypted Portal</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

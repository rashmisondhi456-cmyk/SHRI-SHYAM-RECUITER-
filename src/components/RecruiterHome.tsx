import React, { useMemo } from 'react';
import { Candidate, InterviewSchedule, JobApplication, JobPosting } from '../types';
import { inferWorkforceSegment } from '../lib/naukriFilters';
import {
  AlertTriangle,
  Briefcase,
  CheckCircle2,
  Clock,
  FileSpreadsheet,
  Globe,
  Headphones,
  MapPin,
  Plus,
  Users,
  ArrowRight,
  PhoneCall,
} from 'lucide-react';

interface RecruiterHomeProps {
  candidates: Candidate[];
  jobPostings: JobPosting[];
  applications: JobApplication[];
  interviews: InterviewSchedule[];
  onGoToResdex: () => void;
  onGoToJobs: () => void;
  onPostNewJob: () => void;
  onOpenApplicationsSheet: () => void;
  onGoToInterviews: () => void;
  onGoToAts: () => void;
}

export const RecruiterHome: React.FC<RecruiterHomeProps> = ({
  candidates,
  jobPostings,
  applications,
  interviews,
  onGoToResdex,
  onGoToJobs,
  onPostNewJob,
  onOpenApplicationsSheet,
  onGoToInterviews,
  onGoToAts,
}) => {
  const activeJobs = useMemo(
    () => jobPostings.filter((j) => j.status === 'active'),
    [jobPostings]
  );
  const underReviewJobs = useMemo(
    () => jobPostings.filter((j) => j.status === 'draft'),
    [jobPostings]
  );

  const newApplications = useMemo(
    () => applications.filter((a) => a.status === 'new'),
    [applications]
  );

  const toReviewCount = useMemo(
    () => candidates.filter((c) => c.status === 'sourced').length + newApplications.length,
    [candidates, newApplications]
  );

  const contactedCount = useMemo(
    () =>
      candidates.filter((c) => c.status === 'screened' || c.status === 'shortlisted').length +
      applications.filter((a) => a.status === 'reviewed' || a.status === 'shortlisted').length,
    [candidates, applications]
  );

  const invitedToInterviewCount = useMemo(
    () =>
      Math.max(
        candidates.filter((c) => c.status === 'interview_scheduled').length,
        interviews.filter((i) => i.status === 'scheduled').length
      ),
    [candidates, interviews]
  );

  const hiredCount = useMemo(
    () => candidates.filter((c) => c.status === 'hired').length,
    [candidates]
  );

  const totalOpenings = useMemo(
    () =>
      activeJobs.reduce((sum, j) => sum + (Number(j.openings) || 1), 0) || activeJobs.length,
    [activeJobs]
  );

  const maxFunnelVal = Math.max(toReviewCount, contactedCount, invitedToInterviewCount, 1);

  const attentionJobs = useMemo(() => {
    return activeJobs
      .map((job) => {
        const directApps = applications.filter((a) => a.jobId === job.id && a.status === 'new').length;
        const matchingResdex = candidates.filter(
          (c) => c.status === 'sourced' && c.category === job.category
        ).length;
        return {
          job,
          directApps,
          matchingResdex,
          totalToReview: directApps + matchingResdex,
        };
      })
      .filter((item) => item.totalToReview > 0)
      .sort((a, b) => b.totalToReview - a.totalToReview)
      .slice(0, 3);
  }, [activeJobs, applications, candidates]);

  const hiredPct = totalOpenings > 0 ? Math.min(100, Math.round((hiredCount / totalOpenings) * 100)) : 0;

  return (
    <div className="space-y-5">
      {/* Top Recruiter Workspace Banner + Summary Grid */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-stone-900">
              Shri Shyam Consulting — Recruiter Home
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Live hiring overview across Pan-India, Durg/CG &amp; International mandates (IT, Non-IT &amp; Blue Collar).
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onOpenApplicationsSheet}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-950 text-xs font-bold cursor-pointer transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
              <span>Applications Sheet ({applications.length})</span>
            </button>
            <button
              type="button"
              onClick={onPostNewJob}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow-xs cursor-pointer transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Post a Job</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Tiles (matching Recruiter Home layout) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            type="button"
            onClick={onGoToJobs}
            className="text-left p-4 rounded-xl border border-stone-200 bg-stone-50/70 hover:bg-emerald-50/50 hover:border-emerald-300 transition-colors cursor-pointer flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-white border border-stone-200 flex items-center justify-center shrink-0">
              <Briefcase className="w-5 h-5 text-emerald-800" />
            </div>
            <div>
              <span className="text-xs text-stone-500 font-medium block">Live Jobs</span>
              <span className="text-xl font-bold text-stone-900">{activeJobs.length}</span>
            </div>
          </button>

          <button
            type="button"
            onClick={onGoToJobs}
            className="text-left p-4 rounded-xl border border-stone-200 bg-stone-50/70 hover:bg-stone-100 transition-colors cursor-pointer flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-white border border-stone-200 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <span className="text-xs text-stone-500 font-medium block">Under Review / Draft</span>
              <span className="text-xl font-bold text-stone-900">{underReviewJobs.length}</span>
            </div>
          </button>

          <button
            type="button"
            onClick={onGoToResdex}
            className="text-left p-4 rounded-xl border border-stone-200 bg-stone-50/70 hover:bg-emerald-50/50 hover:border-emerald-300 transition-colors cursor-pointer flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-white border border-stone-200 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 text-sky-700" />
            </div>
            <div>
              <span className="text-xs text-stone-500 font-medium block">Pending Candidates</span>
              <span className="text-xl font-bold text-stone-900">{toReviewCount}</span>
            </div>
          </button>

          <button
            type="button"
            onClick={onGoToInterviews}
            className="text-left p-4 rounded-xl border border-stone-200 bg-stone-50/70 hover:bg-amber-50/50 hover:border-amber-300 transition-colors cursor-pointer flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-white border border-stone-200 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <span className="text-xs text-stone-500 font-medium block">Invited to Interview</span>
              <span className="text-xl font-bold text-stone-900">{invitedToInterviewCount}</span>
            </div>
          </button>
        </div>
      </div>

      {/* Funnel + Hiring Progress Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Candidate Funnel */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-stone-200 p-5 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-stone-900">
                Total candidates across {activeJobs.length} live jobs
              </h3>
              <p className="text-xs text-stone-500">
                Applies from shared job links &amp; matched Resdex database profiles
              </p>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-semibold text-stone-600">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-emerald-800 inline-block" />
                Direct Applies ({applications.length})
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-sky-500 inline-block" />
                Resdex Profiles ({candidates.length})
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 items-end pt-3 border-t border-stone-100 h-44">
            {[
              {
                label: 'To Review',
                count: toReviewCount,
                direct: newApplications.length,
                onClick: onGoToResdex,
              },
              {
                label: 'Called / Messaged',
                count: contactedCount,
                direct: applications.filter((a) => a.status === 'reviewed' || a.status === 'shortlisted').length,
                onClick: onGoToAts,
              },
              {
                label: 'Invited to Interview',
                count: invitedToInterviewCount,
                direct: 0,
                onClick: onGoToInterviews,
              },
            ].map((stage) => {
              const heightPct = stage.count === 0 ? 4 : Math.max(16, Math.round((stage.count / maxFunnelVal) * 100));
              const directShare =
                stage.count > 0 ? Math.min(100, Math.round((stage.direct / stage.count) * 100)) : 0;
              return (
                <button
                  key={stage.label}
                  type="button"
                  onClick={stage.onClick}
                  className="flex flex-col items-center justify-end h-full gap-2 group cursor-pointer"
                >
                  <span className="text-sm font-bold text-stone-900 group-hover:text-emerald-800">
                    {stage.count}
                  </span>
                  <div className="w-20 sm:w-24 flex-1 flex items-end justify-center">
                    <div
                      style={{ height: `${heightPct}%` }}
                      className="w-full rounded-t-lg overflow-hidden bg-sky-400/80 flex flex-col justify-end transition-all group-hover:brightness-95"
                    >
                      {directShare > 0 && (
                        <div
                          style={{ height: `${directShare}%` }}
                          className="w-full bg-emerald-800"
                        />
                      )}
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-stone-600 text-center">
                    {stage.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Hiring Status & Dedicated Support */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                Hiring Status
              </span>
              <button
                type="button"
                onClick={onGoToAts}
                className="text-xs font-semibold text-emerald-800 hover:underline cursor-pointer"
              >
                ATS Board →
              </button>
            </div>
            <div className="text-xl font-bold text-stone-900">
              {hiredCount} / {totalOpenings} candidates hired
            </div>
            <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden">
              <div
                style={{ width: `${hiredPct}%` }}
                className="h-full bg-emerald-700 rounded-full transition-all"
              />
            </div>
            <p className="text-xs text-stone-500">
              Mark candidates as <strong>Hired</strong> in your ATS Pipeline to update fulfillment progress.
            </p>
          </div>

          <div className="bg-emerald-950 text-white rounded-xl p-5 shadow-xs space-y-2.5">
            <div className="flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <Headphones className="w-4 h-4" />
              <span>Dedicated Support</span>
            </div>
            <p className="text-xs text-emerald-100 leading-relaxed">
              Shri Shyam Consulting Recruitment Desk — Paras Complex, Durg, CG.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <a
                href="tel:8269715615"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>8269715615</span>
              </a>
              <a
                href="mailto:info@shrishyamconsulting.in"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-900 hover:bg-emerald-800 text-emerald-100 text-xs font-semibold border border-emerald-700"
              >
                <span>info@shrishyamconsulting.in</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Attention: Jobs Needing Review */}
      {attentionJobs.length > 0 && (
        <div className="bg-white rounded-xl border border-amber-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                Attention
              </span>
              <h3 className="text-sm font-bold text-stone-900 mt-0.5">
                Jobs with candidates awaiting review
              </h3>
            </div>
            <button
              type="button"
              onClick={onOpenApplicationsSheet}
              className="text-xs font-bold text-emerald-800 hover:underline cursor-pointer"
            >
              Open Excel Applications Sheet →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {attentionJobs.map(({ job, directApps, matchingResdex, totalToReview }) => (
              <div
                key={job.id}
                className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/70 flex flex-col justify-between gap-3"
              >
                <div>
                  <div className="font-bold text-sm text-stone-900 truncate">{job.title}</div>
                  <div className="text-xs text-stone-500 flex items-center gap-1 mt-0.5 truncate">
                    <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                    <span className="truncate">{job.location}</span>
                  </div>
                  <div className="text-[11px] text-stone-600 mt-1">
                    {job.openings} opening{job.openings > 1 ? 's' : ''} • {job.salaryRange}
                  </div>
                </div>
                <div className="pt-2 border-t border-stone-200 flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-amber-900">
                    {totalToReview} to review ({directApps} new apply • {matchingResdex} DB)
                  </span>
                  <button
                    type="button"
                    onClick={directApps > 0 ? onOpenApplicationsSheet : onGoToResdex}
                    className="px-2.5 py-1 rounded-md bg-white border border-stone-300 hover:border-emerald-700 text-xs font-bold text-stone-800 cursor-pointer shrink-0"
                  >
                    Review
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Live Jobs Carousel / Grid */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-amber-600" />
            <h3 className="text-base font-bold text-stone-900">Live Jobs ({activeJobs.length})</h3>
          </div>
          <button
            type="button"
            onClick={onGoToJobs}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-stone-300 hover:bg-stone-50 text-xs font-bold text-stone-800 cursor-pointer"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {activeJobs.slice(0, 6).map((job) => {
            const seg = inferWorkforceSegment(job.category, job.title, job.skillsRequired);
            return (
              <div
                key={job.id}
                className="p-4 rounded-xl border border-stone-200 hover:border-emerald-400 transition-colors bg-white flex flex-col justify-between gap-2.5"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                      Live
                    </span>
                    <div className="flex items-center gap-1">
                      <span
                        className={`px-2 py-0.5 rounded border text-[10px] font-bold ${
                          seg === 'IT'
                            ? 'bg-sky-50 text-sky-800 border-sky-200'
                            : seg === 'Blue Collar'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-stone-100 text-stone-700 border-stone-200'
                        }`}
                      >
                        {seg}
                      </span>
                      {job.scope === 'international' && (
                        <span className="px-1.5 py-0.5 rounded bg-sky-700 text-white text-[10px] font-bold inline-flex items-center gap-0.5">
                          <Globe className="w-2.5 h-2.5" />
                          Intl
                        </span>
                      )}
                    </div>
                  </div>

                  <h4 className="font-bold text-sm text-stone-900 line-clamp-1">{job.title}</h4>
                  <div className="text-[11px] font-medium text-emerald-800 truncate">{job.category}</div>
                  <div className="text-xs text-stone-500 flex items-center gap-1 truncate">
                    <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span className="truncate">{job.location}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                  <span>{job.openings} Openings • {job.salaryRange}</span>
                  <button
                    type="button"
                    onClick={onGoToJobs}
                    className="font-bold text-emerald-800 hover:underline cursor-pointer"
                  >
                    Manage →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

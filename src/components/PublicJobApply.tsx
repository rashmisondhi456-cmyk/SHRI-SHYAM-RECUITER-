import React, { useEffect, useState } from 'react';
import { JobApplication, JobPosting } from '../types';
import { INITIAL_JOB_POSTINGS } from '../data/resdexDatabase';
import { enrichJobPosting } from '../lib/naukriFilters';
import {
  fetchPublicJobByShareIds,
  submitPublicJobApplication,
} from '../lib/firestoreStore';
import { exportApplicationsToExcel } from '../lib/excelExport';
import {
  Briefcase,
  MapPin,
  Clock,
  IndianRupee,
  Globe,
  Plane,
  Building2,
  UserCheck,
  Zap,
  CheckCircle2,
  Send,
  FileSpreadsheet,
  AlertCircle,
  Phone,
  Mail,
  ArrowLeft,
} from 'lucide-react';

interface PublicJobApplyProps {
  jobId: string;
  recruiterUid: string;
  sourcePlatform: string;
  onExitPublicApply: () => void;
}

export const PublicJobApply: React.FC<PublicJobApplyProps> = ({
  jobId,
  recruiterUid,
  sourcePlatform,
  onExitPublicApply,
}) => {
  const [job, setJob] = useState<JobPosting | null>(null);
  const [loadingJob, setLoadingJob] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Applicant Form Fields
  const [applicantName, setApplicantName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [currentLocation, setCurrentLocation] = useState('');
  const [gender, setGender] = useState<'Any' | 'Male' | 'Female'>('Any');
  const [currentCompany, setCurrentCompany] = useState('');
  const [experience, setExperience] = useState('2 - 4 Years');
  const [noticePeriod, setNoticePeriod] = useState('Immediate (0 Days)');
  const [currentSalary, setCurrentSalary] = useState('');
  const [expectedSalary, setExpectedSalary] = useState('');
  const [skillsText, setSkillsText] = useState('');
  const [resumeLink, setResumeLink] = useState('');
  const [coverNote, setCoverNote] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedApp, setSubmittedApp] = useState<JobApplication | null>(null);

  useEffect(() => {
    let active = true;
    async function loadJob() {
      setLoadingJob(true);
      setLoadError(null);
      try {
        const fetched = await fetchPublicJobByShareIds(recruiterUid, jobId);
        if (!active) return;
        if (fetched) {
          setJob(fetched);
          setSkillsText(fetched.skillsRequired.slice(0, 4).join(', '));
        } else {
          const fallback = INITIAL_JOB_POSTINGS.find((j) => j.id === jobId);
          if (fallback) {
            const enriched = enrichJobPosting(fallback);
            setJob(enriched);
            setSkillsText(enriched.skillsRequired.slice(0, 4).join(', '));
          } else {
            setLoadError('This job posting link is expired or unavailable.');
          }
        }
      } catch {
        const fallback = INITIAL_JOB_POSTINGS.find((j) => j.id === jobId);
        if (fallback && active) {
          const enriched = enrichJobPosting(fallback);
          setJob(enriched);
          setSkillsText(enriched.skillsRequired.slice(0, 4).join(', '));
        } else if (active) {
          setLoadError('Unable to load job posting details. Please verify the link.');
        }
      } finally {
        if (active) setLoadingJob(false);
      }
    }
    loadJob();
    return () => {
      active = false;
    };
  }, [jobId, recruiterUid]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job) return;
    if (!applicantName.trim() || !phone.trim() || !email.trim() || !currentLocation.trim()) {
      setSubmitError('Please fill in your full name, phone number, email, and current city.');
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const created = await submitPublicJobApplication(recruiterUid, {
        jobId: job.id,
        jobTitle: job.title,
        companyName: job.companyName || 'Shri Shyam Consulting Client',
        applicantName: applicantName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        currentLocation: currentLocation.trim(),
        gender,
        currentCompany: currentCompany.trim(),
        experience: experience.trim(),
        noticePeriod,
        currentSalary: currentSalary.trim() || 'Negotiable',
        expectedSalary: expectedSalary.trim() || 'Negotiable',
        skills: skillsText
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
          .slice(0, 15),
        resumeLink: resumeLink.trim(),
        coverNote: coverNote.trim(),
        sourcePlatform: sourcePlatform || 'Social Media Link',
      });
      setSubmittedApp(created);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Submission failed.';
      setSubmitError(
        msg.includes('Missing or insufficient permissions')
          ? 'This vacancy is not currently accepting public submissions or the recruiter workspace has not activated the public link yet.'
          : 'Could not submit application right now. Please try again or contact 8269715615.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col">
      {/* Brand Header */}
      <header className="bg-emerald-950 text-white border-b border-emerald-900 px-4 sm:px-6 py-4">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-widest text-amber-300 font-bold">
              Shri Shyam Consulting • Official Job Portal
            </p>
            <h1 className="text-lg font-bold tracking-tight">
              Direct Job Application Portal
            </h1>
            <p className="text-xs text-emerald-200">
              Paras Complex, Durg, CG • www.shrishyamconsulting.in • Helpline: 8269715615
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md bg-emerald-900 border border-emerald-700 text-[11px] font-semibold text-emerald-100">
              Source: {sourcePlatform || 'Direct Link'}
            </span>
            <button
              type="button"
              onClick={onExitPublicApply}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Recruiter Portal</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {loadingJob ? (
          <div className="bg-white rounded-xl border border-stone-200 p-10 text-center text-xs text-stone-500">
            Loading job mandate details...
          </div>
        ) : loadError || !job ? (
          <div className="bg-white rounded-xl border border-rose-200 p-8 text-center space-y-3">
            <AlertCircle className="w-9 h-9 text-rose-500 mx-auto" />
            <h2 className="text-base font-bold text-stone-900">Job Posting Unavailable</h2>
            <p className="text-xs text-stone-600">{loadError}</p>
            <button
              type="button"
              onClick={onExitPublicApply}
              className="px-4 py-2 bg-emerald-800 text-white rounded-lg text-xs font-bold cursor-pointer"
            >
              Go to Shri Shyam Consulting Portal
            </button>
          </div>
        ) : submittedApp ? (
          <div className="bg-white rounded-2xl border border-emerald-200 p-8 text-center space-y-4 shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-bold text-stone-900">
              Application Submitted Successfully!
            </h2>
            <p className="text-xs text-stone-600 max-w-lg mx-auto leading-relaxed">
              Thank you, <strong>{submittedApp.applicantName}</strong>. Your application for{' '}
              <strong>{submittedApp.jobTitle}</strong> ({submittedApp.companyName}) has been
              recorded directly into Shri Shyam Consulting&apos;s recruitment Excel database.
              Our AI outreach &amp; HR team will reach out to{' '}
              <span className="font-mono font-semibold">{submittedApp.phone}</span> shortly.
            </p>
            <div className="inline-flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => exportApplicationsToExcel([submittedApp], `Application_${submittedApp.applicantName}`)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-amber-300" />
                <span>Download Your Application Excel (.xlsx)</span>
              </button>
              <a
                href="tel:8269715615"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-semibold"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-700" />
                <span>HR Helpline: 8269715615</span>
              </a>
            </div>
          </div>
        ) : (
          <>
            {/* Job Overview Banner */}
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-900">
                      {job.industry || job.category}
                    </span>
                    {job.scope === 'international' ? (
                      <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-sky-100 text-sky-900 border border-sky-300 flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        {job.country || 'International'}
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-900 border border-amber-200">
                        Pan India Opportunity
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-bold text-stone-900">{job.title}</h2>
                  <p className="text-sm font-semibold text-emerald-900 flex items-center gap-1.5 mt-1">
                    <Building2 className="w-4 h-4 text-stone-400" />
                    <span>{job.companyName || 'Shri Shyam Consulting Client'}</span>
                  </p>
                </div>

                <span className="px-3 py-1 rounded-lg bg-stone-100 text-stone-800 text-xs font-bold">
                  {job.openings} {job.openings === 1 ? 'Opening' : 'Openings'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-stone-50 p-3.5 rounded-xl border border-stone-100">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-stone-400 shrink-0" />
                  <span>
                    <strong className="text-stone-800">{job.location}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-stone-400 shrink-0" />
                  <span>
                    Exp: <strong className="text-stone-800">{job.experience}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <IndianRupee className="w-4 h-4 text-stone-400 shrink-0" />
                  <span>
                    CTC: <strong className="text-stone-800">{job.salaryRange}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>
                    Notice: <strong className="text-stone-800">{job.noticePeriod || 'Immediate'}</strong>
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-stone-600">
                <span className="inline-flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-stone-400" />
                  Gender: <strong>{job.genderPreference || 'Any'}</strong>
                </span>
                {job.scope === 'international' && job.visaSponsorship && (
                  <span className="inline-flex items-center gap-1 text-emerald-800 font-semibold">
                    <Plane className="w-3.5 h-3.5" />
                    Work Visa / Sponsorship Provided
                  </span>
                )}
              </div>

              <p className="text-xs text-stone-700 leading-relaxed whitespace-pre-line">
                {job.description}
              </p>

              <div className="flex flex-wrap gap-1.5">
                {job.skillsRequired.map((s, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-0.5 rounded bg-stone-100 text-stone-700 text-[11px] font-medium"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Direct Applicant Submission Form */}
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4 text-xs"
            >
              <div className="border-b border-stone-100 pb-3 flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-emerald-800" />
                    <span>Apply Now — Direct Submission to Employer Excel Sheet</span>
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    No account needed. Submit your profile below and our team receives it immediately.
                  </p>
                </div>
              </div>

              {submitError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Mobile / WhatsApp Number *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Current City / Location *</label>
                  <input
                    type="text"
                    required
                    value={currentLocation}
                    onChange={(e) => setCurrentLocation(e.target.value)}
                    placeholder="e.g. Durg, Ayodhya, Delhi NCR, Dubai"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as 'Any' | 'Male' | 'Female')}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Any">Prefer not to say</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Current / Last Company</label>
                  <input
                    type="text"
                    value={currentCompany}
                    onChange={(e) => setCurrentCompany(e.target.value)}
                    placeholder="Company name (or Fresher)"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Total Experience *</label>
                  <input
                    type="text"
                    required
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    placeholder="e.g. 3 years / Fresher"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Notice Period *</label>
                  <select
                    value={noticePeriod}
                    onChange={(e) => setNoticePeriod(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900"
                  >
                    <option value="Immediate (0 Days)">Immediate Joiner (0 Days)</option>
                    <option value="15 Days">15 Days</option>
                    <option value="1 Month">1 Month</option>
                    <option value="2 Months / Negotiable">2 Months / Negotiable</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Current Salary / CTC</label>
                  <input
                    type="text"
                    value={currentSalary}
                    onChange={(e) => setCurrentSalary(e.target.value)}
                    placeholder="e.g. ₹30,000 / mo or 4.5 LPA"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Expected Salary / CTC</label>
                  <input
                    type="text"
                    value={expectedSalary}
                    onChange={(e) => setExpectedSalary(e.target.value)}
                    placeholder="e.g. ₹38,000 / mo or 6 LPA"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Key Skills (comma separated)</label>
                  <input
                    type="text"
                    value={skillsText}
                    onChange={(e) => setSkillsText(e.target.value)}
                    placeholder="Tally, GST, Excel, Sales"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Resume Google Drive / LinkedIn Link</label>
                  <input
                    type="url"
                    value={resumeLink}
                    onChange={(e) => setResumeLink(e.target.value)}
                    placeholder="https://drive.google.com/..."
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Brief Profile Summary / Note</label>
                <textarea
                  rows={3}
                  value={coverNote}
                  onChange={(e) => setCoverNote(e.target.value)}
                  placeholder="Highlight your relevant projects, availability, or relocation readiness..."
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900"
                />
              </div>

              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-[11px] text-stone-500 flex items-center gap-3">
                  <span className="inline-flex items-center gap-1">
                    <Phone className="w-3 h-3 text-emerald-700" /> 8269715615
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Mail className="w-3 h-3 text-emerald-700" /> info@shrishyamconsulting.in
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold shadow-sm cursor-pointer disabled:opacity-60"
                >
                  <Send className="w-4 h-4 text-amber-300" />
                  <span>{submitting ? 'Submitting Application...' : 'Submit Application'}</span>
                </button>
              </div>
            </form>
          </>
        )}
      </main>
    </div>
  );
};

import { User } from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  Unsubscribe,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { decryptPII, encryptPII } from './crypto';
import { enrichCandidate, enrichJobPosting } from './naukriFilters';
import { Candidate, CandidateStatus, InterviewSchedule, JobApplication, JobPosting } from '../types';

function sanitizeId(raw: string): string {
  const cleaned = raw.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 128);
  return cleaned || `id_${Date.now()}`;
}

function clampStr(val: string | undefined | null, maxLen: number, fallback = ''): string {
  const str = (val ?? fallback).toString();
  return str.slice(0, maxLen);
}

function clampSkills(skills: string[] | undefined): string[] {
  if (!Array.isArray(skills)) return [];
  return skills
    .map((s) => clampStr(s, 60).trim())
    .filter(Boolean)
    .slice(0, 15);
}

interface EncryptedCandidatePII {
  contact: string;
  email: string;
  currentSalary: string;
  expectedSalary: string;
  company?: string;
  gender?: 'Male' | 'Female' | 'Any';
  resumeLink?: string;
  screeningNotes?: string;
  callLogs?: Candidate['callLogs'];
  keyStrengths?: string[];
  interviewQuestions?: string[];
}

interface EncryptedInterviewDetails {
  candidateContact: string;
  candidateEmail: string;
  meetLink?: string;
  notes?: string;
}

export async function ensureUserWorkspace(user: User): Promise<void> {
  const userRef = doc(db, 'users', user.uid);
  const privateRef = doc(db, 'users', user.uid, 'private', 'info');

  try {
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        displayName: clampStr(user.displayName || user.email?.split('@')[0] || 'Recruiter', 120, 'Recruiter'),
        organization: 'Shri Shyam Consulting',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    const privSnap = await getDoc(privateRef);
    if (!privSnap.exists()) {
      await setDoc(privateRef, {
        uid: user.uid,
        email: clampStr(user.email || 'recruiter@shrishyamconsulting.in', 254),
        provider: clampStr(user.providerData?.[0]?.providerId || 'google.com', 64),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
  }
}

async function buildCandidateFirestoreDoc(uid: string, c: Candidate, isCreate: boolean) {
  const enriched = enrichCandidate(c);
  const safeId = sanitizeId(enriched.id);
  const piiPayload: EncryptedCandidatePII = {
    contact: enriched.contact || '',
    email: enriched.email || '',
    currentSalary: enriched.currentSalary || '',
    expectedSalary: enriched.expectedSalary || '',
    company: enriched.company,
    gender: enriched.gender,
    resumeLink: enriched.resumeLink,
    screeningNotes: enriched.screeningNotes,
    callLogs: enriched.callLogs,
    keyStrengths: enriched.keyStrengths,
    interviewQuestions: enriched.interviewQuestions,
  };
  const encryptedPii = clampStr(await encryptPII(uid, piiPayload), 20000, 'v1');
  const inferredScope =
    c.scope ||
    (c.country && c.country.toLowerCase() !== 'india' ? 'international' : 'domestic');

  const docData: Record<string, unknown> = {
    id: safeId,
    ownerId: uid,
    name: clampStr(c.name, 120, 'Candidate'),
    designation: clampStr(c.designation, 160, 'Applicant'),
    category: c.category,
    location: clampStr(c.location, 120, 'Durg, CG'),
    country: clampStr(c.country || 'India', 80, 'India'),
    scope: inferredScope,
    experience: clampStr(c.experience, 60, '0 years'),
    noticePeriod: clampStr(c.noticePeriod || 'Immediate', 60, 'Immediate'),
    sourceDate: clampStr(c.sourceDate || new Date().toLocaleDateString(), 40),
    skills: clampSkills(c.skills),
    status: c.status,
    aiScore: Math.max(0, Math.min(100, Math.round(c.aiScore ?? 75))),
    encryptedPii,
    updatedAt: serverTimestamp(),
  };

  if (isCreate) {
    docData.createdAt = serverTimestamp();
  }
  return { safeId, docData };
}

function buildJobFirestoreDoc(uid: string, rawJob: JobPosting, isCreate: boolean) {
  const job = enrichJobPosting(rawJob);
  const safeId = sanitizeId(job.id);
  const inferredScope =
    job.scope ||
    (job.country && job.country.toLowerCase() !== 'india' ? 'international' : 'domestic');

  const docData: Record<string, unknown> = {
    id: safeId,
    ownerId: uid,
    title: clampStr(job.title, 160, 'Open Role'),
    companyName: clampStr(job.companyName || 'Shri Shyam Consulting Client', 120),
    category: job.category,
    industry: clampStr(job.industry || job.category, 100),
    department: clampStr(job.department || 'Operations', 120),
    scope: inferredScope,
    country: clampStr(job.country || 'India', 80, 'India'),
    location: clampStr(job.location || 'Paras Complex, Durg, CG', 140),
    visaSponsorship: Boolean(job.visaSponsorship),
    genderPreference: job.genderPreference || 'Any',
    noticePeriod: clampStr(job.noticePeriod || 'Immediate (0 Days)', 60),
    experience: clampStr(job.experience || '2 - 5 Years', 60),
    salaryRange: clampStr(job.salaryRange || 'Negotiable', 80),
    openings: Math.max(1, Math.min(1000, Math.round(job.openings || 1))),
    description: clampStr(job.description || '', 4000),
    skillsRequired: clampSkills(job.skillsRequired),
    status: job.status || 'active',
    postedDate: clampStr(job.createdAt || new Date().toISOString().split('T')[0], 40),
    updatedAt: serverTimestamp(),
  };

  if (isCreate) {
    docData.createdAt = serverTimestamp();
  }
  return { safeId, docData };
}

function buildPublicJobFirestoreDoc(uid: string, rawJob: JobPosting, isCreate: boolean) {
  const job = enrichJobPosting(rawJob);
  const safeJobId = sanitizeId(job.id);
  const publicJobId = sanitizeId(`${uid}__${safeJobId}`);
  const inferredScope =
    job.scope ||
    (job.country && job.country.toLowerCase() !== 'india' ? 'international' : 'domestic');

  const docData: Record<string, unknown> = {
    id: publicJobId,
    jobId: safeJobId,
    ownerId: uid,
    title: clampStr(job.title, 160, 'Open Role'),
    companyName: clampStr(job.companyName || 'Shri Shyam Consulting Client', 120),
    category: job.category,
    industry: clampStr(job.industry || job.category, 100),
    department: clampStr(job.department || 'Operations', 120),
    scope: inferredScope,
    country: clampStr(job.country || 'India', 80, 'India'),
    location: clampStr(job.location || 'Paras Complex, Durg, CG', 140),
    visaSponsorship: Boolean(job.visaSponsorship),
    genderPreference: job.genderPreference || 'Any',
    noticePeriod: clampStr(job.noticePeriod || 'Immediate (0 Days)', 60),
    experience: clampStr(job.experience || '2 - 5 Years', 60),
    salaryRange: clampStr(job.salaryRange || 'Negotiable', 80),
    openings: Math.max(1, Math.min(1000, Math.round(job.openings || 1))),
    description: clampStr(job.description || '', 4000),
    skillsRequired: clampSkills(job.skillsRequired),
    status: job.status || 'active',
    postedDate: clampStr(job.createdAt || new Date().toISOString().split('T')[0], 40),
    updatedAt: serverTimestamp(),
  };

  if (isCreate) {
    docData.createdAt = serverTimestamp();
  }
  return { publicJobId, docData };
}

async function buildInterviewFirestoreDoc(uid: string, item: InterviewSchedule, isCreate: boolean) {
  const safeId = sanitizeId(item.id);
  const detailsPayload: EncryptedInterviewDetails = {
    candidateContact: item.candidateContact || '',
    candidateEmail: item.candidateEmail || '',
    meetLink: item.meetLink,
    notes: item.notes,
  };
  const encryptedDetails = clampStr(await encryptPII(uid, detailsPayload), 10000, 'v1');

  const docData: Record<string, unknown> = {
    id: safeId,
    ownerId: uid,
    candidateId: sanitizeId(item.candidateId),
    candidateName: clampStr(item.candidateName, 120, 'Candidate'),
    role: clampStr(item.role, 160, 'Role'),
    interviewType: item.interviewType,
    locationAddress: clampStr(item.locationAddress, 250),
    dateTime: clampStr(item.dateTime, 80),
    status: item.status,
    interviewer: clampStr(item.interviewer, 140),
    encryptedDetails,
    updatedAt: serverTimestamp(),
  };

  if (isCreate) {
    docData.createdAt = serverTimestamp();
  }
  return { safeId, docData };
}

export async function seedInitialWorkspaceIfEmpty(
  uid: string,
  initialCandidates: Candidate[],
  initialJobs: JobPosting[],
  initialInterviews: InterviewSchedule[]
): Promise<void> {
  const candPath = `users/${uid}/candidates`;
  const jobsPath = `users/${uid}/jobs`;
  const intPath = `users/${uid}/interviews`;

  try {
    const existingCands = await getDocs(
      query(collection(db, candPath), where('ownerId', '==', uid), limit(1))
    );
    const existingJobs = await getDocs(
      query(collection(db, jobsPath), where('ownerId', '==', uid), limit(1))
    );

    if (existingCands.empty) {
      const candBatch = writeBatch(db);
      for (const c of initialCandidates) {
        const { safeId, docData } = await buildCandidateFirestoreDoc(uid, c, true);
        candBatch.set(doc(db, candPath, safeId), docData);
      }
      await candBatch.commit();

      // Seed interviews only after candidates exist so exists() security check passes
      const existingInts = await getDocs(
        query(collection(db, intPath), where('ownerId', '==', uid), limit(1))
      );
      if (existingInts.empty && initialInterviews.length > 0) {
        const intBatch = writeBatch(db);
        for (const item of initialInterviews) {
          const { safeId, docData } = await buildInterviewFirestoreDoc(uid, item, true);
          intBatch.set(doc(db, intPath, safeId), docData);
        }
        await intBatch.commit();
      }
    } else {
      const upCandidates = initialCandidates.filter((c) => c.id.startsWith('cand-up-'));
      for (const c of upCandidates) {
        const safeId = sanitizeId(c.id);
        const snap = await getDoc(doc(db, candPath, safeId));
        if (!snap.exists()) {
          const { docData } = await buildCandidateFirestoreDoc(uid, c, true);
          await setDoc(doc(db, candPath, safeId), docData);
        }
      }
    }

    if (existingJobs.empty) {
      const jobBatch = writeBatch(db);
      for (const job of initialJobs) {
        const { safeId, docData } = buildJobFirestoreDoc(uid, job, true);
        jobBatch.set(doc(db, jobsPath, safeId), docData);
      }
      await jobBatch.commit();
    } else {
      const upJobs = initialJobs.filter((j) => j.id.startsWith('job-up-'));
      for (const job of upJobs) {
        const safeId = sanitizeId(job.id);
        const snap = await getDoc(doc(db, jobsPath, safeId));
        if (!snap.exists()) {
          const { docData } = buildJobFirestoreDoc(uid, job, true);
          await setDoc(doc(db, jobsPath, safeId), docData);
        }
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, candPath);
  }
}

export function subscribeCandidates(
  uid: string,
  onData: (candidates: Candidate[]) => void
): Unsubscribe {
  const path = `users/${uid}/candidates`;
  const q = query(collection(db, path), where('ownerId', '==', uid));

  return onSnapshot(
    q,
    async (snapshot) => {
      const results: Candidate[] = await Promise.all(
        snapshot.docs.map(async (d) => {
          const raw = d.data();
          const decrypted = await decryptPII<EncryptedCandidatePII>(uid, raw.encryptedPii || '');
          return enrichCandidate({
            id: raw.id,
            name: raw.name,
            designation: raw.designation,
            category: raw.category,
            location: raw.location,
            country: raw.country,
            scope: raw.scope,
            experience: raw.experience,
            noticePeriod: raw.noticePeriod,
            sourceDate: raw.sourceDate,
            skills: raw.skills || [],
            status: raw.status,
            aiScore: raw.aiScore,
            contact: decrypted?.contact || '',
            email: decrypted?.email || '',
            currentSalary: decrypted?.currentSalary || '',
            expectedSalary: decrypted?.expectedSalary || '',
            company: decrypted?.company,
            gender: decrypted?.gender,
            resumeLink: decrypted?.resumeLink,
            screeningNotes: decrypted?.screeningNotes,
            callLogs: decrypted?.callLogs,
            keyStrengths: decrypted?.keyStrengths,
            interviewQuestions: decrypted?.interviewQuestions,
          } as Candidate);
        })
      );
      onData(results);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export function subscribeJobs(
  uid: string,
  onData: (jobs: JobPosting[]) => void
): Unsubscribe {
  const path = `users/${uid}/jobs`;
  const q = query(collection(db, path), where('ownerId', '==', uid));

  return onSnapshot(
    q,
    (snapshot) => {
      const jobs: JobPosting[] = snapshot.docs.map((d) => {
        const raw = d.data();
        return enrichJobPosting({
          id: raw.id,
          title: raw.title,
          companyName: raw.companyName,
          category: raw.category,
          industry: raw.industry,
          department: raw.department,
          scope: raw.scope,
          country: raw.country,
          location: raw.location,
          visaSponsorship: raw.visaSponsorship,
          genderPreference: raw.genderPreference,
          noticePeriod: raw.noticePeriod,
          experience: raw.experience,
          salaryRange: raw.salaryRange,
          openings: raw.openings,
          description: raw.description,
          skillsRequired: raw.skillsRequired || [],
          status: raw.status,
          createdAt: raw.postedDate,
        } as JobPosting);
      });
      onData(jobs);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export function subscribeInterviews(
  uid: string,
  onData: (interviews: InterviewSchedule[]) => void
): Unsubscribe {
  const path = `users/${uid}/interviews`;
  const q = query(collection(db, path), where('ownerId', '==', uid));

  return onSnapshot(
    q,
    async (snapshot) => {
      const list: InterviewSchedule[] = await Promise.all(
        snapshot.docs.map(async (d) => {
          const raw = d.data();
          const decrypted = await decryptPII<EncryptedInterviewDetails>(
            uid,
            raw.encryptedDetails || ''
          );
          return {
            id: raw.id,
            candidateId: raw.candidateId,
            candidateName: raw.candidateName,
            role: raw.role,
            interviewType: raw.interviewType,
            locationAddress: raw.locationAddress,
            dateTime: raw.dateTime,
            status: raw.status,
            interviewer: raw.interviewer,
            candidateContact: decrypted?.candidateContact || '',
            candidateEmail: decrypted?.candidateEmail || '',
            meetLink: decrypted?.meetLink,
            notes: decrypted?.notes,
          } as InterviewSchedule;
        })
      );
      onData(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function updateCandidateStageInFirestore(
  uid: string,
  candidateId: string,
  status: CandidateStatus
): Promise<void> {
  const safeId = sanitizeId(candidateId);
  const path = `users/${uid}/candidates/${safeId}`;
  try {
    await updateDoc(doc(db, path), {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function updateCandidateScreeningInFirestore(
  uid: string,
  candidate: Candidate
): Promise<void> {
  const safeId = sanitizeId(candidate.id);
  const path = `users/${uid}/candidates/${safeId}`;
  try {
    const piiPayload: EncryptedCandidatePII = {
      contact: candidate.contact || '',
      email: candidate.email || '',
      currentSalary: candidate.currentSalary || '',
      expectedSalary: candidate.expectedSalary || '',
      company: candidate.company,
      gender: candidate.gender,
      resumeLink: candidate.resumeLink,
      screeningNotes: candidate.screeningNotes,
      callLogs: candidate.callLogs,
      keyStrengths: candidate.keyStrengths,
      interviewQuestions: candidate.interviewQuestions,
    };
    const encryptedPii = clampStr(await encryptPII(uid, piiPayload), 20000, 'v1');
    await updateDoc(doc(db, path), {
      status: candidate.status,
      aiScore: Math.max(0, Math.min(100, Math.round(candidate.aiScore ?? 75))),
      encryptedPii,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function createCandidateInFirestore(
  uid: string,
  candidate: Candidate
): Promise<void> {
  const { safeId, docData } = await buildCandidateFirestoreDoc(uid, candidate, true);
  const path = `users/${uid}/candidates/${safeId}`;
  try {
    await setDoc(doc(db, path), docData);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function importCandidatesBatchToFirestore(
  uid: string,
  candidates: Candidate[]
): Promise<void> {
  const candPath = `users/${uid}/candidates`;
  try {
    const chunkSize = 150;
    for (let i = 0; i < candidates.length; i += chunkSize) {
      const slice = candidates.slice(i, i + chunkSize);
      const batch = writeBatch(db);
      for (const c of slice) {
        const { safeId, docData } = await buildCandidateFirestoreDoc(uid, c, true);
        batch.set(doc(db, candPath, safeId), docData);
      }
      await batch.commit();
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, candPath);
  }
}

export async function publishPublicJobInFirestore(
  uid: string,
  job: JobPosting
): Promise<void> {
  const { publicJobId, docData } = buildPublicJobFirestoreDoc(uid, job, true);
  const path = `publicJobs/${publicJobId}`;
  try {
    const existingSnap = await getDoc(doc(db, path));
    if (existingSnap.exists()) {
      const updatePayload = buildPublicJobFirestoreDoc(uid, job, false).docData;
      updatePayload.createdAt = existingSnap.data().createdAt;
      await setDoc(doc(db, path), updatePayload);
    } else {
      await setDoc(doc(db, path), docData);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function syncPublicJobsForUser(
  uid: string,
  jobs: JobPosting[]
): Promise<void> {
  for (const job of jobs) {
    const safeJobId = sanitizeId(job.id);
    const publicJobId = sanitizeId(`${uid}__${safeJobId}`);
    const path = `publicJobs/${publicJobId}`;
    try {
      const snap = await getDoc(doc(db, path));
      if (!snap.exists()) {
        const { docData } = buildPublicJobFirestoreDoc(uid, job, true);
        await setDoc(doc(db, path), docData);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }
}

export async function fetchPublicJobByShareIds(
  recruiterUid: string,
  jobId: string
): Promise<JobPosting | null> {
  const safeUid = sanitizeId(recruiterUid);
  const safeJobId = sanitizeId(jobId);
  const publicJobId = sanitizeId(`${safeUid}__${safeJobId}`);
  const path = `publicJobs/${publicJobId}`;
  try {
    const snap = await getDoc(doc(db, path));
    if (!snap.exists()) return null;
    const raw = snap.data();
    return enrichJobPosting({
      id: raw.jobId || safeJobId,
      title: raw.title,
      companyName: raw.companyName,
      category: raw.category,
      industry: raw.industry,
      department: raw.department,
      scope: raw.scope,
      country: raw.country,
      location: raw.location,
      visaSponsorship: raw.visaSponsorship,
      genderPreference: raw.genderPreference,
      noticePeriod: raw.noticePeriod,
      experience: raw.experience,
      salaryRange: raw.salaryRange,
      openings: raw.openings,
      description: raw.description,
      skillsRequired: raw.skillsRequired || [],
      status: raw.status,
      createdAt: raw.postedDate,
    } as JobPosting);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function submitPublicJobApplication(
  recruiterUid: string,
  input: Omit<JobApplication, 'id' | 'ownerId' | 'appliedDate' | 'status'>
): Promise<JobApplication> {
  const safeUid = sanitizeId(recruiterUid);
  const appId = sanitizeId(`app-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`);
  const appliedDate = new Date().toISOString().split('T')[0];
  const safeJobId = sanitizeId(input.jobId);
  const path = `users/${safeUid}/applications/${appId}`;

  const docData: Record<string, unknown> = {
    id: appId,
    ownerId: safeUid,
    jobId: safeJobId,
    jobTitle: clampStr(input.jobTitle, 160, 'Job Opening'),
    companyName: clampStr(input.companyName, 120, 'Shri Shyam Consulting Client'),
    applicantName: clampStr(input.applicantName, 120, 'Applicant'),
    phone: clampStr(input.phone, 30, '0000000000'),
    email: clampStr(input.email, 254, 'applicant@example.com'),
    currentLocation: clampStr(input.currentLocation, 120, 'India'),
    gender: input.gender || 'Any',
    currentCompany: clampStr(input.currentCompany || '', 120),
    experience: clampStr(input.experience, 60, '0-1 Years'),
    noticePeriod: clampStr(input.noticePeriod, 60, 'Immediate'),
    currentSalary: clampStr(input.currentSalary || '', 60),
    expectedSalary: clampStr(input.expectedSalary || '', 60),
    skills: clampSkills(input.skills),
    resumeLink: clampStr(input.resumeLink || '', 500),
    coverNote: clampStr(input.coverNote || '', 2000),
    sourcePlatform: clampStr(input.sourcePlatform || 'Direct Link', 40, 'Direct Link'),
    appliedDate: clampStr(appliedDate, 40),
    status: 'new',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    await setDoc(doc(db, path), docData);
    return {
      id: appId,
      ownerId: safeUid,
      jobId: safeJobId,
      jobTitle: String(docData.jobTitle),
      companyName: String(docData.companyName),
      applicantName: String(docData.applicantName),
      phone: String(docData.phone),
      email: String(docData.email),
      currentLocation: String(docData.currentLocation),
      gender: input.gender || 'Any',
      currentCompany: String(docData.currentCompany),
      experience: String(docData.experience),
      noticePeriod: String(docData.noticePeriod),
      currentSalary: String(docData.currentSalary),
      expectedSalary: String(docData.expectedSalary),
      skills: docData.skills as string[],
      resumeLink: String(docData.resumeLink),
      coverNote: String(docData.coverNote),
      sourcePlatform: String(docData.sourcePlatform),
      appliedDate,
      status: 'new',
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export function subscribeApplications(
  uid: string,
  onData: (apps: JobApplication[]) => void
): Unsubscribe {
  const path = `users/${uid}/applications`;
  const q = query(collection(db, path), where('ownerId', '==', uid));

  return onSnapshot(
    q,
    (snapshot) => {
      const list: JobApplication[] = snapshot.docs.map((d) => {
        const raw = d.data();
        return {
          id: raw.id,
          ownerId: raw.ownerId,
          jobId: raw.jobId,
          jobTitle: raw.jobTitle,
          companyName: raw.companyName || '',
          applicantName: raw.applicantName,
          phone: raw.phone,
          email: raw.email,
          currentLocation: raw.currentLocation,
          gender: raw.gender || 'Any',
          currentCompany: raw.currentCompany || '',
          experience: raw.experience,
          noticePeriod: raw.noticePeriod,
          currentSalary: raw.currentSalary || '',
          expectedSalary: raw.expectedSalary || '',
          skills: raw.skills || [],
          resumeLink: raw.resumeLink || '',
          coverNote: raw.coverNote || '',
          sourcePlatform: raw.sourcePlatform || 'Direct Link',
          appliedDate: raw.appliedDate || '',
          status: raw.status || 'new',
        } as JobApplication;
      });
      list.sort((a, b) => (b.appliedDate || '').localeCompare(a.appliedDate || ''));
      onData(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function updateApplicationStatusInFirestore(
  uid: string,
  applicationId: string,
  status: JobApplication['status']
): Promise<void> {
  const safeId = sanitizeId(applicationId);
  const path = `users/${uid}/applications/${safeId}`;
  try {
    await updateDoc(doc(db, path), {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function createJobInFirestore(uid: string, job: JobPosting): Promise<void> {
  const { safeId, docData } = buildJobFirestoreDoc(uid, job, true);
  const path = `users/${uid}/jobs/${safeId}`;
  try {
    await setDoc(doc(db, path), docData);
    await publishPublicJobInFirestore(uid, job);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function createJobsBatchInFirestore(uid: string, jobs: JobPosting[]): Promise<void> {
  if (jobs.length === 0) return;
  const jobsPath = `users/${uid}/jobs`;
  try {
    const chunkSize = 100;
    for (let i = 0; i < jobs.length; i += chunkSize) {
      const slice = jobs.slice(i, i + chunkSize);
      const batch = writeBatch(db);
      for (const job of slice) {
        const { safeId, docData } = buildJobFirestoreDoc(uid, job, true);
        batch.set(doc(db, jobsPath, safeId), docData);
        const { publicJobId, docData: publicDoc } = buildPublicJobFirestoreDoc(uid, job, true);
        batch.set(doc(db, 'publicJobs', publicJobId), publicDoc);
      }
      await batch.commit();
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, jobsPath);
  }
}

export async function createInterviewInFirestore(
  uid: string,
  interview: InterviewSchedule
): Promise<void> {
  const { safeId, docData } = await buildInterviewFirestoreDoc(uid, interview, true);
  const path = `users/${uid}/interviews/${safeId}`;
  try {
    await setDoc(doc(db, path), docData);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateInterviewStatusInFirestore(
  uid: string,
  interviewId: string,
  status: 'scheduled' | 'completed' | 'cancelled'
): Promise<void> {
  const safeId = sanitizeId(interviewId);
  const path = `users/${uid}/interviews/${safeId}`;
  try {
    await updateDoc(doc(db, path), {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteCandidateInFirestore(uid: string, candidateId: string): Promise<void> {
  const safeId = sanitizeId(candidateId);
  const path = `users/${uid}/candidates/${safeId}`;
  try {
    await deleteDoc(doc(db, path));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function deleteCandidatesBatchInFirestore(
  uid: string,
  candidateIds: string[]
): Promise<void> {
  if (candidateIds.length === 0) return;
  const candPath = `users/${uid}/candidates`;
  try {
    const chunkSize = 200;
    for (let i = 0; i < candidateIds.length; i += chunkSize) {
      const slice = candidateIds.slice(i, i + chunkSize);
      const batch = writeBatch(db);
      for (const id of slice) {
        batch.delete(doc(db, candPath, sanitizeId(id)));
      }
      await batch.commit();
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, candPath);
  }
}

export async function deleteJobInFirestore(uid: string, jobId: string): Promise<void> {
  const safeJobId = sanitizeId(jobId);
  const path = `users/${uid}/jobs/${safeJobId}`;
  const publicJobId = sanitizeId(`${uid}__${safeJobId}`);
  const publicPath = `publicJobs/${publicJobId}`;
  try {
    await deleteDoc(doc(db, path));
    const pubSnap = await getDoc(doc(db, publicPath));
    if (pubSnap.exists()) {
      await deleteDoc(doc(db, publicPath));
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function deleteApplicationInFirestore(
  uid: string,
  applicationId: string
): Promise<void> {
  const safeId = sanitizeId(applicationId);
  const path = `users/${uid}/applications/${safeId}`;
  try {
    await deleteDoc(doc(db, path));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function deleteInterviewInFirestore(
  uid: string,
  interviewId: string
): Promise<void> {
  const safeId = sanitizeId(interviewId);
  const path = `users/${uid}/interviews/${safeId}`;
  try {
    await deleteDoc(doc(db, path));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}


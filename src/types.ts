export type CandidateStatus =
  | 'sourced'
  | 'screened'
  | 'shortlisted'
  | 'interview_scheduled'
  | 'hired'
  | 'rejected';

export type WorkforceSegment = 'IT' | 'Non-IT' | 'Blue Collar';

export type JobCategory =
  | 'Accountant'
  | 'Accounting & Finance'
  | 'Administration & Facilities'
  | 'Architect / Interior Designer'
  | 'Back Office / Data Entry'
  | 'Banking, Financial Services & BFSI'
  | 'Beautician'
  | 'Blue Collar & Skilled Trades'
  | 'Business Development & B2B Sales'
  | 'Carpenter'
  | 'Cashier'
  | 'Construction, Civil & Architecture'
  | 'Content Writer'
  | 'Cook / Chef'
  | 'Customer Support & Service'
  | 'Customer Support / TeleCaller'
  | 'Delivery'
  | 'Digital Marketing'
  | 'Digital Marketing & Creative Media'
  | 'Driver'
  | 'Driver, Delivery & Fleet'
  | 'Education & Training'
  | 'Electrician'
  | 'Electrician, Fitter & Welder'
  | 'Event Management'
  | 'Executive & Management'
  | 'Fashion Designer'
  | 'Field Sales'
  | 'FMCG & Business Development'
  | 'General Management & Strategy'
  | 'Graphic / Web Designer'
  | 'Hardware / Network Engineer'
  | 'Healthcare & Clinical'
  | 'Hospitality & Travel'
  | 'Housekeeping'
  | 'Housekeeping, Security & Helper'
  | 'Human Resources & Talent'
  | 'Import, Export & International Trade'
  | 'IT & Data Engineering'
  | 'IT / Software / Data Analyst'
  | 'Journalism, Content & PR'
  | 'Key Account & Client Management'
  | 'Lab Technician / Pharmacist'
  | 'Labour/Helper'
  | 'Legal'
  | 'Legal, Audit & Compliance'
  | 'Logistics & Supply Chain'
  | 'Manufacturing'
  | 'Manufacturing & Operations'
  | 'Marketing'
  | 'Mechanic'
  | 'Mechanical & Electrical Engineering'
  | 'Nurse / Compounder'
  | 'Nursing, Pharma & Diagnostics'
  | 'Operations & Plant Management'
  | 'Painter'
  | 'Peon'
  | 'Plumber'
  | 'Procurement & Purchase'
  | 'Quality Assurance & HSE Safety'
  | 'Receptionist'
  | 'Recruiter / HR / Admin'
  | 'Refrigerator & AC Technician'
  | 'Research & Analytics'
  | 'Retail & Store Operations'
  | 'Retail / Counter Sales'
  | 'Sales & Distribution'
  | 'Sales / Business Development'
  | 'Security Guard'
  | 'Software & Cloud Engineering'
  | 'Spa'
  | 'Teacher / Tutor'
  | 'Technician'
  | 'Telesales & BPO'
  | 'Telesales / Telemarketing'
  | 'Trainer'
  | 'UI/UX & Product Design'
  | 'Vendor & Contract Management'
  | 'Video Editor'
  | 'Waiter / Steward'
  | 'Ward Boy'
  | 'Warehouse / Logistics'
  | 'Warehousing & Inventory'
  | 'X-Ray, Radiology & Lab Tech'
  | 'Yield, Process & Industrial Ops'
  | 'Zonal & Regional Business';

export type PostingScope = 'domestic' | 'international';

export interface CallTranscriptTurn {
  speaker: 'agent' | 'candidate';
  text: string;
  time: string;
}

export interface CallLogItem {
  id: string;
  timestamp: string;
  durationSeconds: number;
  disposition: string;
  score: number;
  transcripts: CallTranscriptTurn[];
  extractedNotes: string;
}

export interface Candidate {
  id: string;
  name: string;
  contact: string;
  email: string;
  location: string;
  country?: string;
  scope?: PostingScope;
  company?: string;
  gender?: 'Male' | 'Female' | 'Any';
  designation: string;
  category: JobCategory;
  experience: string;
  currentSalary: string;
  expectedSalary: string;
  noticePeriod: string;
  resumeLink?: string;
  sourceDate: string;
  skills: string[];
  status: CandidateStatus;
  aiScore?: number;
  screeningNotes?: string;
  callLogs?: CallLogItem[];
  keyStrengths?: string[];
  interviewQuestions?: string[];
}

export interface InterviewSchedule {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateContact: string;
  candidateEmail: string;
  role: string;
  interviewType: 'in_person_durg' | 'google_meet' | 'telephonic';
  locationAddress: string;
  dateTime: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  meetLink?: string;
  notes?: string;
  interviewer: string;
}

export interface JobPosting {
  id: string;
  title: string;
  companyName?: string;
  category: JobCategory;
  industry?: string;
  department: string;
  scope?: PostingScope;
  country?: string;
  location: string;
  visaSponsorship?: boolean;
  genderPreference?: 'Any' | 'Male' | 'Female';
  noticePeriod?: string;
  experience: string;
  salaryRange: string;
  openings: number;
  description: string;
  skillsRequired: string[];
  status: 'active' | 'draft' | 'closed';
  createdAt: string;
}

export interface JobApplication {
  id: string;
  ownerId: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  applicantName: string;
  phone: string;
  email: string;
  currentLocation: string;
  gender: 'Any' | 'Male' | 'Female';
  currentCompany: string;
  experience: string;
  noticePeriod: string;
  currentSalary: string;
  expectedSalary: string;
  skills: string[];
  resumeLink: string;
  coverNote: string;
  sourcePlatform: string;
  appliedDate: string;
  status: 'new' | 'reviewed' | 'shortlisted' | 'rejected';
}


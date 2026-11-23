import { Candidate, JobCategory, JobPosting, WorkforceSegment } from '../types';

export const CANDIDATE_METADATA_DEFAULTS: Record<
  string,
  { company: string; gender: 'Male' | 'Female' }
> = {
  'cand-cg-01': { company: 'Shree Infra & Staffing Durg', gender: 'Male' },
  'cand-cg-02': { company: 'Bhilai Ferro Alloys Pvt Ltd', gender: 'Male' },
  'cand-cg-03': { company: 'CG Polymer & Moulding Works', gender: 'Male' },
  'cand-cg-04': { company: 'Rungta Precision Engineering', gender: 'Male' },
  'cand-cg-05': { company: 'Mahamaya FMCG Distributors', gender: 'Male' },
  'cand-cg-06': { company: 'Sarguja TeleConnect BPO', gender: 'Male' },
  'cand-acc-01': { company: 'Noida FinServe Advisors', gender: 'Female' },
  'cand-acc-02': { company: 'Apex Buildcon NCR', gender: 'Male' },
  'cand-acc-03': { company: 'Kaveri Manufacturing Ltd', gender: 'Male' },
  'cand-acc-04': { company: 'Vanguard Tax & Audit Associates', gender: 'Male' },
  'cand-acc-05': { company: 'Sterling Industrial Corp', gender: 'Male' },
  'cand-acc-06': { company: 'Tricity Retail Ventures', gender: 'Female' },
  'cand-acc-07': { company: 'Haryana Agro Industries', gender: 'Male' },
  'cand-fmcg-01': { company: 'Dabur / Regional FMCG Trade', gender: 'Female' },
  'cand-fmcg-02': { company: 'Bikano Consumer Products', gender: 'Female' },
  'cand-fmcg-03': { company: 'Mother Dairy Trade Channel', gender: 'Female' },
  'cand-fmcg-04': { company: 'Haldiram Distribution Network', gender: 'Male' },
  'cand-fmcg-05': { company: 'ITC Retail Partners NCR', gender: 'Female' },
  'cand-mfg-01': { company: 'Supreme Plastics India Ltd', gender: 'Male' },
  'cand-mfg-02': { company: 'Hindware Polymer Division', gender: 'Male' },
  'cand-mfg-03': { company: 'NCR Auto Components', gender: 'Male' },
  'cand-mfg-04': { company: 'Tata Teleservices / Statcon Power', gender: 'Male' },
  'cand-tele-01': { company: 'PolicyBazaar Outreach Desk', gender: 'Female' },
  'cand-tele-02': { company: 'Teleperformance India', gender: 'Male' },
  'cand-tele-03': { company: 'Paytm Merchant Support', gender: 'Female' },
  'cand-tele-04': { company: 'Noida E-Commerce Care', gender: 'Female' },
  'cand-tech-01': { company: 'Infosys Data Cloud Practice', gender: 'Female' },
  'cand-tech-02': { company: 'TCS Enterprise Analytics', gender: 'Male' },
  'cand-tech-03': { company: 'Razorpay Data Platform', gender: 'Male' },
  'cand-tech-04': { company: 'Wipro Cloud Solutions', gender: 'Male' },
  'cand-edu-01': { company: 'IDP / British Council Partner', gender: 'Male' },
  'cand-edu-02': { company: 'Edwise Overseas Prep', gender: 'Female' },
  'cand-med-01': { company: 'Apollo Rehab Clinics', gender: 'Female' },
  'cand-med-02': { company: 'NIMHANS Neuro Care', gender: 'Male' },
  'cand-intl-01': { company: 'Al-Futtaim Logistics Dubai', gender: 'Male' },
  'cand-intl-02': { company: 'SABIC Polymer Contracting KSA', gender: 'Male' },
  'cand-intl-03': { company: 'DBS FinTech APAC Singapore', gender: 'Female' },
  'cand-intl-04': { company: 'Manchester Royal NHS Trust', gender: 'Female' },
  'cand-intl-05': { company: 'MapleLeaf Global Education', gender: 'Male' },
  'cand-intl-06': { company: 'Siemens Industrial Automation DE', gender: 'Male' },
  'cand-up-01': { company: 'Awadh Infra & Hospitality Ayodhya', gender: 'Male' },
  'cand-up-02': { company: 'Saryu Retail & Finance Corp', gender: 'Female' },
};

export const JOB_METADATA_DEFAULTS: Record<
  string,
  {
    companyName: string;
    industry: string;
    genderPreference: 'Any' | 'Male' | 'Female';
    noticePeriod: string;
  }
> = {
  'job-01': {
    companyName: 'Bhilai Steel & Alloys Pvt. Ltd.',
    industry: 'Manufacturing & Industrial Accounts',
    genderPreference: 'Any',
    noticePeriod: 'Immediate (0 Days)',
  },
  'job-02': {
    companyName: 'Chhattisgarh Agro FMCG Ltd.',
    industry: 'FMCG & Consumer Goods',
    genderPreference: 'Any',
    noticePeriod: '15 Days',
  },
  'job-03': {
    companyName: 'Durg Polymer & Injection Tech',
    industry: 'Plastics & Manufacturing',
    genderPreference: 'Male',
    noticePeriod: '0 Days / Immediate',
  },
  'job-04': {
    companyName: 'Shri Shyam Consulting (In-House)',
    industry: 'Recruitment & BPO',
    genderPreference: 'Female',
    noticePeriod: 'Immediate (0 Days)',
  },
  'job-05': {
    companyName: 'Pan-India Cloud Analytics Client',
    industry: 'IT Services & Data Engineering',
    genderPreference: 'Any',
    noticePeriod: '1 Month',
  },
  'job-intl-01': {
    companyName: 'Al-Noor Trading & Logistics LLC',
    industry: 'International Accounting & Audit',
    genderPreference: 'Any',
    noticePeriod: 'Immediate (0 Days)',
  },
  'job-intl-02': {
    companyName: 'Arabian Gulf Polymers Co.',
    industry: 'GCC Manufacturing & Production',
    genderPreference: 'Male',
    noticePeriod: '15 Days',
  },
  'job-intl-03': {
    companyName: 'PacificPay FinTech Pte Ltd',
    industry: 'APAC FinTech & Cloud',
    genderPreference: 'Any',
    noticePeriod: '1 Month',
  },
  'job-intl-04': {
    companyName: 'UnitedCare NHS Partner Hospitals',
    industry: 'Healthcare & Clinical Services',
    genderPreference: 'Any',
    noticePeriod: '1 Month',
  },
  'job-intl-05': {
    companyName: 'NorthStar Overseas Academy',
    industry: 'EdTech & Overseas Admissions',
    genderPreference: 'Any',
    noticePeriod: '15 Days',
  },
  'job-intl-06': {
    companyName: 'Emirates Global FMCG Exports',
    industry: 'International FMCG & Trade',
    genderPreference: 'Any',
    noticePeriod: 'Immediate (0 Days)',
  },
  'job-up-01': {
    companyName: 'Ayodhya Hospitality & Infra Ventures',
    industry: 'Hospitality, Retail & Operations',
    genderPreference: 'Any',
    noticePeriod: 'Immediate (0 Days)',
  },
};

export function enrichCandidate(c: Candidate): Candidate {
  const meta = CANDIDATE_METADATA_DEFAULTS[c.id];
  const inferredScope =
    c.scope || (c.country && c.country.toLowerCase() !== 'india' ? 'international' : 'domestic');
  return {
    ...c,
    scope: inferredScope,
    country: c.country || 'India',
    company: c.company || meta?.company || 'Verified Corporate Employer',
    gender: c.gender || meta?.gender || 'Any',
  };
}

export function enrichJobPosting(job: JobPosting): JobPosting {
  const meta = JOB_METADATA_DEFAULTS[job.id];
  const inferredScope =
    job.scope || (job.country && job.country.toLowerCase() !== 'india' ? 'international' : 'domestic');
  return {
    ...job,
    scope: inferredScope,
    country: job.country || 'India',
    companyName: job.companyName || meta?.companyName || 'Shri Shyam Consulting Client',
    industry: job.industry || meta?.industry || job.category,
    genderPreference: job.genderPreference || meta?.genderPreference || 'Any',
    noticePeriod: job.noticePeriod || meta?.noticePeriod || 'Immediate (0 Days)',
  };
}

export const PAN_INDIA_CITIES = [
  'Ambikapur',
  'Ayodhya',
  'Bengaluru',
  'Bhilai',
  'Bilaspur',
  'Chennai',
  'Delhi NCR',
  'Durg',
  'Ghaziabad',
  'Greater Noida',
  'Hyderabad',
  'Kolkata',
  'Mumbai',
  'Noida',
  'Panchkula',
  'Pune',
  'Raipur',
];

export const INTERNATIONAL_DESTINATIONS = [
  'Australia',
  'Canada',
  'Germany',
  'Oman',
  'Qatar',
  'Saudi Arabia',
  'Singapore',
  'United Arab Emirates',
  'United Kingdom',
  'United States',
];

const RAW_FUNCTIONAL_CATEGORIES_AZ: JobCategory[] = [
  'Accountant',
  'Accounting & Finance',
  'Administration & Facilities',
  'Architect / Interior Designer',
  'Back Office / Data Entry',
  'Banking, Financial Services & BFSI',
  'Beautician',
  'Blue Collar & Skilled Trades',
  'Business Development & B2B Sales',
  'Carpenter',
  'Cashier',
  'Construction, Civil & Architecture',
  'Content Writer',
  'Cook / Chef',
  'Customer Support & Service',
  'Customer Support / TeleCaller',
  'Delivery',
  'Digital Marketing',
  'Digital Marketing & Creative Media',
  'Driver',
  'Driver, Delivery & Fleet',
  'Education & Training',
  'Electrician',
  'Electrician, Fitter & Welder',
  'Event Management',
  'Executive & Management',
  'Fashion Designer',
  'Field Sales',
  'FMCG & Business Development',
  'General Management & Strategy',
  'Graphic / Web Designer',
  'Hardware / Network Engineer',
  'Healthcare & Clinical',
  'Hospitality & Travel',
  'Housekeeping',
  'Housekeeping, Security & Helper',
  'Human Resources & Talent',
  'Import, Export & International Trade',
  'IT & Data Engineering',
  'IT / Software / Data Analyst',
  'Journalism, Content & PR',
  'Key Account & Client Management',
  'Lab Technician / Pharmacist',
  'Labour/Helper',
  'Legal',
  'Legal, Audit & Compliance',
  'Logistics & Supply Chain',
  'Manufacturing',
  'Manufacturing & Operations',
  'Marketing',
  'Mechanic',
  'Mechanical & Electrical Engineering',
  'Nurse / Compounder',
  'Nursing, Pharma & Diagnostics',
  'Operations & Plant Management',
  'Painter',
  'Peon',
  'Plumber',
  'Procurement & Purchase',
  'Quality Assurance & HSE Safety',
  'Receptionist',
  'Recruiter / HR / Admin',
  'Refrigerator & AC Technician',
  'Research & Analytics',
  'Retail & Store Operations',
  'Retail / Counter Sales',
  'Sales & Distribution',
  'Sales / Business Development',
  'Security Guard',
  'Software & Cloud Engineering',
  'Spa',
  'Teacher / Tutor',
  'Technician',
  'Telesales & BPO',
  'Telesales / Telemarketing',
  'Trainer',
  'UI/UX & Product Design',
  'Vendor & Contract Management',
  'Video Editor',
  'Waiter / Steward',
  'Ward Boy',
  'Warehouse / Logistics',
  'Warehousing & Inventory',
  'X-Ray, Radiology & Lab Tech',
  'Yield, Process & Industrial Ops',
  'Zonal & Regional Business',
];

export const FUNCTIONAL_CATEGORIES_AZ: JobCategory[] = [...RAW_FUNCTIONAL_CATEGORIES_AZ].sort(
  (a, b) => a.localeCompare(b)
);

const BLUE_COLLAR_CATEGORIES = new Set<JobCategory>([
  'Blue Collar & Skilled Trades',
  'Carpenter',
  'Cook / Chef',
  'Delivery',
  'Driver',
  'Driver, Delivery & Fleet',
  'Electrician',
  'Electrician, Fitter & Welder',
  'Housekeeping',
  'Housekeeping, Security & Helper',
  'Labour/Helper',
  'Manufacturing',
  'Manufacturing & Operations',
  'Mechanic',
  'Painter',
  'Peon',
  'Plumber',
  'Refrigerator & AC Technician',
  'Security Guard',
  'Technician',
  'Waiter / Steward',
  'Ward Boy',
  'Warehouse / Logistics',
  'Warehousing & Inventory',
]);

const IT_CATEGORIES = new Set<JobCategory>([
  'Hardware / Network Engineer',
  'IT & Data Engineering',
  'IT / Software / Data Analyst',
  'Software & Cloud Engineering',
  'UI/UX & Product Design',
]);

export function inferWorkforceSegment(
  category: JobCategory | string,
  titleOrDesignation = '',
  skills: string[] = []
): WorkforceSegment {
  const text = `${category} ${titleOrDesignation} ${skills.join(' ')}`.toLowerCase();

  if (
    BLUE_COLLAR_CATEGORIES.has(category as JobCategory) ||
    /\b(operator|cnc|moulding|welder|fitter|electrician|plumber|driver|rider|delivery|helper|labour|peon|office boy|housekeeping|security guard|guard|loader|packer|technician|mechanic|painter|waiter|steward|ward boy|chef|cook|forklift|crane|mason|carpenter|tailor|store keeper|warehouse)\b/.test(
      text
    )
  ) {
    // Keep electrical/mechanical/production/automation engineers in Non-IT or IT unless explicitly Blue Collar
    if (
      /\b(engineer|manager|lead|supervisor)\b/.test(titleOrDesignation.toLowerCase()) &&
      !BLUE_COLLAR_CATEGORIES.has(category as JobCategory)
    ) {
      if (IT_CATEGORIES.has(category as JobCategory) || /\b(automation test|hardware|network)\b/.test(titleOrDesignation.toLowerCase())) {
        return 'IT';
      }
      return 'Non-IT';
    }
    return 'Blue Collar';
  }

  if (
    IT_CATEGORIES.has(category as JobCategory) ||
    /\b(software|developer|data engineer|data analyst|pyspark|devops|cybersecurity|cloud|react|java|python|ui\/ux|figma|qa automation|automation test|hardware|network engineer|it helpdesk|network support|full stack|sql)\b/.test(
      text
    )
  ) {
    return 'IT';
  }

  return 'Non-IT';
}

export interface PositionCatalogItem {
  title: string;
  category: JobCategory;
  industry: string;
  skills: string;
  segment: WorkforceSegment;
}

export const QUICK_JOB_TITLE_CHIPS: string[] = [
  '2D/3D Interior Designer',
  'Chef',
  'Data Entry Executive',
  'Staff Nurse',
  'Telecaller',
];

const RAW_POSITION_CATALOG_AZ: PositionCatalogItem[] = [
  { title: '2D/3D Interior Designer', category: 'Architect / Interior Designer', industry: 'Architecture & Interior Design', skills: 'AutoCAD, 3ds Max, SketchUp, V-Ray, Space Planning', segment: 'Non-IT' },
  { title: 'Accountant (Tally & GST)', category: 'Accountant', industry: 'Accounting & Taxation', skills: 'Tally Prime, GST, TDS, Balance Sheet', segment: 'Non-IT' },
  { title: 'Admin & Office Executive', category: 'Administration & Facilities', industry: 'Corporate Administration', skills: 'MS Office, Vendor Billing, Coordination', segment: 'Non-IT' },
  { title: 'Area Sales Manager (FMCG)', category: 'FMCG & Business Development', industry: 'FMCG & Consumer Goods', skills: 'Distributor Network, Secondary Sales, Team Handling', segment: 'Non-IT' },
  { title: 'Assembly Line & Factory Helper', category: 'Labour/Helper', industry: 'Factory & Plant Operations', skills: 'Assembly Line, Packing, Material Handling, Shift Duty', segment: 'Blue Collar' },
  { title: 'Associate Relationship Manager', category: 'Sales / Business Development', industry: 'BFSI & Client Advisory', skills: 'Client Acquisition, Portfolio Support, Cross-Selling', segment: 'Non-IT' },
  { title: 'ATM Cash Loader', category: 'Security Guard', industry: 'Cash Logistics & Security', skills: 'Cash Vault Handling, Route Security, Discipline', segment: 'Blue Collar' },
  { title: 'Audit & Compliance Officer', category: 'Legal, Audit & Compliance', industry: 'Audit & Taxation', skills: 'Statutory Audit, Internal Controls, GST, MIS', segment: 'Non-IT' },
  { title: 'Audit / Account Assistant', category: 'Accountant', industry: 'Accounting & Audit', skills: 'Vouching, Ledger Reconciliation, Tally, Excel', segment: 'Non-IT' },
  { title: 'Audit And Taxation Manager', category: 'Accountant', industry: 'Taxation & Audit', skills: 'Direct Tax, GST Audit, Statutory Compliance, Team Lead', segment: 'Non-IT' },
  { title: 'Audit Assistant', category: 'Accountant', industry: 'CA Firm & Audit', skills: 'Bank Reconciliation, TDS Return, Voucher Verification', segment: 'Non-IT' },
  { title: 'Audit Executive', category: 'Accountant', industry: 'Internal Audit & Risk', skills: 'Stock Audit, Compliance Check, MIS Reporting', segment: 'Non-IT' },
  { title: 'Audit Manager', category: 'Accountant', industry: 'Finance & Audit', skills: 'Risk Assessment, Financial Statements, Team Management', segment: 'Non-IT' },
  { title: 'Auditor', category: 'Legal, Audit & Compliance', industry: 'Statutory & Internal Audit', skills: 'SOX, Internal Audit, Regulatory Filing, Excel', segment: 'Non-IT' },
  { title: 'Auto Driver', category: 'Driver', industry: 'Passenger & Local Transport', skills: 'Valid Auto Permit, City Routes, Safe Driving', segment: 'Blue Collar' },
  { title: 'AutoCAD Designer', category: 'Architect / Interior Designer', industry: 'CAD & Civil Drafting', skills: 'AutoCAD 2D/3D, Blueprint Drafting, Civil & Mech Drawings', segment: 'Non-IT' },
  { title: 'Automation Test Engineer', category: 'IT / Software / Data Analyst', industry: 'Software QA & Automation', skills: 'Selenium, Playwright, Java/TS, CI/CD, API Testing', segment: 'IT' },
  { title: 'Automobile Electric Mechanic', category: 'Mechanic', industry: 'Automotive Workshop', skills: 'Auto Wiring, ECU Diagnostics, Battery & Alternator', segment: 'Blue Collar' },
  { title: 'Automobile Fitter', category: 'Mechanic', industry: 'Automotive & Service Center', skills: 'Engine Assembly, Brake & Clutch Overhaul, Garage Tools', segment: 'Blue Collar' },
  { title: 'Back Office Operations Executive', category: 'Back Office / Data Entry', industry: 'BPO & Support Operations', skills: 'Data Entry, Excel, CRM, Order Processing', segment: 'Non-IT' },
  { title: 'Beautician & Hair Stylist', category: 'Beautician', industry: 'Salon & Beauty Wellness', skills: 'Hair Styling, Bridal Makeup, Skin Care, Hygiene', segment: 'Non-IT' },
  { title: 'Branch Operations Manager', category: 'Banking, Financial Services & BFSI', industry: 'BFSI & Consulting', skills: 'Branch P&L, Team Leadership, Client Servicing', segment: 'Non-IT' },
  { title: 'Business Development Manager', category: 'Business Development & B2B Sales', industry: 'B2B & Corporate Sales', skills: 'Lead Generation, Client Pitching, Revenue Growth', segment: 'Non-IT' },
  { title: 'Carpenter & Mason', category: 'Carpenter', industry: 'Construction & Civil Works', skills: 'Woodwork, Masonry, Finishing, Site Tools', segment: 'Blue Collar' },
  { title: 'Cashier & Billing Executive', category: 'Cashier', industry: 'Retail, POS & Counter Ops', skills: 'POS Billing, Cash Handling, UPI/Card Settlement, Tally', segment: 'Non-IT' },
  { title: 'Chartered Accountant (CA)', category: 'Accounting & Finance', industry: 'Corporate Finance', skills: 'IFRS, Statutory Audit, Direct Tax, Budgeting', segment: 'Non-IT' },
  { title: 'Chef', category: 'Cook / Chef', industry: 'Hotels, Restaurants & Catering', skills: 'Indian/Continental Cooking, Kitchen Hygiene, Menu Prep', segment: 'Blue Collar' },
  { title: 'Civil Site Engineer', category: 'Construction, Civil & Architecture', industry: 'Construction & Infrastructure', skills: 'AutoCAD, BOQ, Site Supervision, Quality Control', segment: 'Non-IT' },
  { title: 'Clinical Physiotherapist', category: 'Healthcare & Clinical', industry: 'Healthcare & Rehabilitation', skills: 'Orthopedic Rehab, Neuro Therapy, Patient Care', segment: 'Non-IT' },
  { title: 'Cloud Data Engineer', category: 'IT & Data Engineering', industry: 'IT Services & Data Engineering', skills: 'Python, PySpark, Snowflake, AWS, SQL', segment: 'IT' },
  { title: 'CNC Machine Operator', category: 'Blue Collar & Skilled Trades', industry: 'Precision Manufacturing', skills: 'CNC Turning, Tooling Setup, Micrometer, Blueprint Reading', segment: 'Blue Collar' },
  { title: 'Content Writer & Copywriter', category: 'Content Writer', industry: 'Media, SEO & Content', skills: 'SEO Articles, Ad Copy, Blogs, Proofreading', segment: 'Non-IT' },
  { title: 'Customer Support Executive', category: 'Customer Support / TeleCaller', industry: 'Customer Service & BPO', skills: 'Inbound Support, CRM Ticketing, Communication', segment: 'Non-IT' },
  { title: 'Cybersecurity & SOC Analyst', category: 'Software & Cloud Engineering', industry: 'IT Security & Cloud', skills: 'SIEM, Network Security, VAPT, Firewalls', segment: 'IT' },
  { title: 'Data Analyst (BI & SQL)', category: 'IT / Software / Data Analyst', industry: 'Analytics & Technology', skills: 'SQL, Power BI, Excel, Python, Dashboards', segment: 'IT' },
  { title: 'Data Entry Executive', category: 'Back Office / Data Entry', industry: 'Back Office & Data Processing', skills: 'Fast Typing, MS Excel, MIS Reports, Accuracy', segment: 'Non-IT' },
  { title: 'Data Entry Manager', category: 'Back Office / Data Entry', industry: 'Operations & Back Office', skills: 'MIS Automation, Team QA, Excel Macros, Turnaround', segment: 'Non-IT' },
  { title: 'Delivery Executive & Rider', category: 'Delivery', industry: 'E-Commerce & Last-Mile Delivery', skills: '2-Wheeler License, Route Knowledge, Cash Handling, Android App', segment: 'Blue Collar' },
  { title: 'DevOps & Cloud Engineer', category: 'Software & Cloud Engineering', industry: 'Cloud & SaaS Infrastructure', skills: 'Docker, Kubernetes, AWS, Terraform, CI/CD', segment: 'IT' },
  { title: 'Digital Marketing Executive', category: 'Digital Marketing', industry: 'Marketing & Advertising', skills: 'SEO, Meta Ads, Google Ads, Social Media', segment: 'Non-IT' },
  { title: 'Driver (LMV / HMV / Commercial)', category: 'Driver', industry: 'Transport & Fleet Logistics', skills: 'Valid LMV/HMV License, Highway Driving, Vehicle Upkeep', segment: 'Blue Collar' },
  { title: 'Electrical Maintenance Engineer', category: 'Mechanical & Electrical Engineering', industry: 'Industrial Engineering', skills: 'PLC, HT/LT Panels, Preventive Maintenance', segment: 'Non-IT' },
  { title: 'Electrician & Wireman', category: 'Electrician', industry: 'Plant & Building Maintenance', skills: 'Industrial Wiring, Motor Winding, Panel Troubleshooting, ITI', segment: 'Blue Collar' },
  { title: 'Event Management Coordinator', category: 'Event Management', industry: 'Events & Exhibitions', skills: 'Stage Setup, Vendor Logistics, Client Coordination', segment: 'Non-IT' },
  { title: 'Export Sales & Trade Manager', category: 'Import, Export & International Trade', industry: 'International Trade & Exports', skills: 'Export Documentation, GCC Markets, Distributor Handling', segment: 'Non-IT' },
  { title: 'Facility & Hospitality Manager', category: 'Hospitality & Travel', industry: 'Hospitality, Retail & Operations', skills: 'Facility Ops, Vendor Management, Housekeeping, Admin', segment: 'Non-IT' },
  { title: 'Fashion & Apparel Designer', category: 'Fashion Designer', industry: 'Apparel & Textile Design', skills: 'Garment Pattern, Draping, Boutique Merchandising', segment: 'Non-IT' },
  { title: 'Field Sales Executive', category: 'Field Sales', industry: 'Field Sales & Distribution', skills: 'B2B/Retail Visits, Target Achievement, Route Coverage', segment: 'Non-IT' },
  { title: 'Finance Controller (VAT / IFRS)', category: 'Accounting & Finance', industry: 'International Accounting & Audit', skills: 'IFRS, UAE VAT, SAP, Financial Reporting', segment: 'Non-IT' },
  { title: 'Fitter, Turner & Machinist', category: 'Electrician, Fitter & Welder', industry: 'Heavy Engineering & Fabrication', skills: 'Lathe Machine, Pipe Fitting, Vernier Caliper, ITI Fitter', segment: 'Blue Collar' },
  { title: 'Forklift & Crane Operator', category: 'Driver, Delivery & Fleet', industry: 'Warehousing & Heavy Industry', skills: 'Forklift Operation, Crane Safety, Pallet Loading', segment: 'Blue Collar' },
  { title: 'Front Desk & Receptionist', category: 'Receptionist', industry: 'Corporate Front Office', skills: 'Visitor Management, Phone Etiquette, MS Office', segment: 'Non-IT' },
  { title: 'Full Stack Software Developer', category: 'Software & Cloud Engineering', industry: 'Software & Product Engineering', skills: 'React, TypeScript, Node.js, REST APIs, SQL', segment: 'IT' },
  { title: 'Graphic / Web Designer', category: 'Graphic / Web Designer', industry: 'Creative & Web Media', skills: 'Photoshop, Illustrator, Figma, HTML/CSS, Canva', segment: 'Non-IT' },
  { title: 'Hardware & Network Engineer', category: 'Hardware / Network Engineer', industry: 'IT Infrastructure & Support', skills: 'Desktop/Laptop Repair, LAN/WAN, Routers, Windows Server', segment: 'IT' },
  { title: 'Healthcare & Nursing Officer', category: 'Nursing, Pharma & Diagnostics', industry: 'Hospitals & Clinical Care', skills: 'ICU Care, Patient Vitals, Clinical Documentation', segment: 'Non-IT' },
  { title: 'Housekeeping & Pantry Boy', category: 'Housekeeping', industry: 'Facility & Office Support', skills: 'Office Cleaning, Pantry Service, Hygiene Discipline', segment: 'Blue Collar' },
  { title: 'HR Recruiter & Talent Acquisition', category: 'Recruiter / HR / Admin', industry: 'HR & Recruitment Consulting', skills: 'Naukri Resdex, Candidate Screening, Interview Scheduling', segment: 'Non-IT' },
  { title: 'IELTS & Overseas Admissions Trainer', category: 'Trainer', industry: 'EdTech & Overseas Education', skills: 'IELTS Band 8+, Spoken English, Student Counseling', segment: 'Non-IT' },
  { title: 'Injection Moulding Operator', category: 'Manufacturing', industry: 'Plastics & Manufacturing', skills: 'Injection Moulding, Machine Setting, Quality Check', segment: 'Blue Collar' },
  { title: 'Inventory & Store Keeper', category: 'Warehouse / Logistics', industry: 'Warehousing & Supply Chain', skills: 'Stock Reconciliation, GRN, Tally Inventory, Dispatch', segment: 'Blue Collar' },
  { title: 'IT Helpdesk & Network Support', category: 'Hardware / Network Engineer', industry: 'IT Infrastructure & Support', skills: 'Windows/Mac Support, LAN/WAN, Ticketing, Hardware', segment: 'IT' },
  { title: 'Java Backend Developer', category: 'Software & Cloud Engineering', industry: 'Enterprise IT', skills: 'Java, Spring Boot, Microservices, PostgreSQL', segment: 'IT' },
  { title: 'Key Account Manager', category: 'Key Account & Client Management', industry: 'Enterprise Sales', skills: 'Enterprise Retention, Upselling, Contract Negotiation', segment: 'Non-IT' },
  { title: 'Loader, Packer & Warehouse Helper', category: 'Labour/Helper', industry: 'Warehousing & Logistics', skills: 'Loading/Unloading, Barcode Packing, Dispatch Support', segment: 'Blue Collar' },
  { title: 'Logistics & Supply Chain Coordinator', category: 'Logistics & Supply Chain', industry: 'Logistics & Freight', skills: 'Fleet Dispatch, E-Way Bill, Vendor Coordination', segment: 'Non-IT' },
  { title: 'Marketing Executive & Brand Coordinator', category: 'Marketing', industry: 'Brand & Field Marketing', skills: 'Campaigns, BTL Activations, Lead Funnel, Canva', segment: 'Non-IT' },
  { title: 'Mechanical Production Engineer', category: 'Mechanical & Electrical Engineering', industry: 'Heavy Engineering & Steel', skills: 'Production Planning, Lean Manufacturing, ISO 9001', segment: 'Non-IT' },
  { title: 'Medical Lab & X-Ray Technician', category: 'Lab Technician / Pharmacist', industry: 'Diagnostics & Healthcare', skills: 'Sample Analysis, Radiology, Lab Safety, Reporting', segment: 'Non-IT' },
  { title: 'Office Boy / Peon', category: 'Peon', industry: 'Corporate & Branch Support', skills: 'Document Delivery, Bank Errands, Office Maintenance', segment: 'Blue Collar' },
  { title: 'Operations & Plant Supervisor', category: 'Operations & Plant Management', industry: 'Manufacturing & Industrial Ops', skills: 'Shift Management, Manpower Handling, Safety', segment: 'Non-IT' },
  { title: 'Outbound Telesales Executive', category: 'Telesales / Telemarketing', industry: 'Telesales & Lead Generation', skills: 'Cold Calling, Follow-ups, CRM Logging, Hindi & English', segment: 'Non-IT' },
  { title: 'Painter & Polish Worker', category: 'Painter', industry: 'Construction, Interior & Industrial Coating', skills: 'Wall Putty, Spray Painting, Texture Finishing', segment: 'Blue Collar' },
  { title: 'Payroll & Statutory Compliance Officer', category: 'Human Resources & Talent', industry: 'HR Finance & Payroll', skills: 'PF, ESIC, PT, Payroll Processing, Excel', segment: 'Non-IT' },
  { title: 'Pharmacist (Retail & Clinical)', category: 'Lab Technician / Pharmacist', industry: 'Pharma & Healthcare', skills: 'Dispensing, Inventory Control, Drug Compliance', segment: 'Non-IT' },
  { title: 'Plumber & Pipe Fitter', category: 'Plumber', industry: 'Construction & Facility Maintenance', skills: 'PVC/GI Piping, Sanitary Fitting, Leak Repair', segment: 'Blue Collar' },
  { title: 'Production & Quality Manager', category: 'Operations & Plant Management', industry: 'Manufacturing Operations', skills: 'TQM, Six Sigma, Plant Output, Audit', segment: 'Non-IT' },
  { title: 'Purchase & Procurement Executive', category: 'Procurement & Purchase', industry: 'Procurement & Supply Chain', skills: 'Vendor Sourcing, PO Negotiation, Cost Reduction', segment: 'Non-IT' },
  { title: 'QA Automation & Manual Tester', category: 'Software & Cloud Engineering', industry: 'Software Quality Engineering', skills: 'Selenium, Playwright, API Testing, Jira', segment: 'IT' },
  { title: 'Quality Control (QC) Inspector', category: 'Quality Assurance & HSE Safety', industry: 'Quality Assurance', skills: 'Vernier Caliper, Defect Analysis, ISO Inspection', segment: 'Non-IT' },
  { title: 'Recruitment Operations Lead', category: 'Executive & Management', industry: 'Staffing & Consulting', skills: 'Client Mandates, AI Calling ATS, Team Handling', segment: 'Non-IT' },
  { title: 'Refrigerator & AC Technician', category: 'Refrigerator & AC Technician', industry: 'HVAC & Appliance Service', skills: 'Split/Window AC Repair, Gas Charging, Compressor Check', segment: 'Blue Collar' },
  { title: 'Retail / Counter Sales Executive', category: 'Retail / Counter Sales', industry: 'Retail & Showroom Operations', skills: 'Customer Greeting, Billing, Stock Display, Upselling', segment: 'Non-IT' },
  { title: 'Retail Store Manager', category: 'Retail & Store Operations', industry: 'Retail & Consumer Trade', skills: 'Visual Merchandising, POS Billing, Store Targets', segment: 'Non-IT' },
  { title: 'Safety Officer (HSE / EHS)', category: 'Quality Assurance & HSE Safety', industry: 'Industrial Safety & Compliance', skills: 'NEBOSH, Fire Safety, Hazard Audit, PPE Compliance', segment: 'Non-IT' },
  { title: 'Sales & Marketing Executive', category: 'Sales & Distribution', industry: 'Sales & Distribution', skills: 'Field Sales, Dealer Onboarding, Target Achievement', segment: 'Non-IT' },
  { title: 'Security Guard & Supervisor', category: 'Security Guard', industry: 'Security & Surveillance', skills: 'Gate Entry Register, CCTV Monitoring, Patrolling', segment: 'Blue Collar' },
  { title: 'Senior Plant Accountant', category: 'Accounting & Finance', industry: 'Manufacturing Accounts', skills: 'Tally Prime, Costing, GST, Vendor Reconciliation', segment: 'Non-IT' },
  { title: 'Spa Therapist', category: 'Spa', industry: 'Wellness, Spa & Hospitality', skills: 'Body Therapy, Guest Hygiene, Relaxation Care', segment: 'Non-IT' },
  { title: 'Staff Nurse', category: 'Nurse / Compounder', industry: 'Hospitals & Nursing Homes', skills: 'Patient Care, IV/Injection, Ward Duty, GNM/B.Sc Nursing', segment: 'Non-IT' },
  { title: 'Teacher & Academic Coordinator', category: 'Teacher / Tutor', industry: 'Education & Coaching', skills: 'Lesson Planning, Classroom Delivery, Assessment', segment: 'Non-IT' },
  { title: 'Team Leader (Telecalling / BPO)', category: 'Telesales & BPO', industry: 'BPO & Contact Center', skills: 'KPI Coaching, Conversion Tracking, Roster Management', segment: 'Non-IT' },
  { title: 'Technician (Plant & Maintenance)', category: 'Technician', industry: 'Industrial & Facility Maintenance', skills: 'Preventive Maintenance, Troubleshooting, Tools Handling', segment: 'Blue Collar' },
  { title: 'Telecaller', category: 'Telesales / Telemarketing', industry: 'Telecalling, BPO & Sales', skills: 'Outbound Calling, Lead Qualification, CRM Update, Hindi/English', segment: 'Non-IT' },
  { title: 'UI/UX Product Designer', category: 'UI/UX & Product Design', industry: 'Digital Product & Tech', skills: 'Figma, Wireframing, Design Systems, Prototyping', segment: 'IT' },
  { title: 'VAT & Tax Consultant', category: 'Legal', industry: 'Taxation & Advisory', skills: 'GST, VAT Filing, Tax Audits, Financial Modeling', segment: 'Non-IT' },
  { title: 'Vendor & Contract Coordinator', category: 'Vendor & Contract Management', industry: 'Vendor & Procurement Ops', skills: 'SLA Tracking, Vendor Onboarding, Rate Contracts', segment: 'Non-IT' },
  { title: 'Video Editor', category: 'Video Editor', industry: 'Media, Reels & Production', skills: 'Premiere Pro, After Effects, Color Grading, Reels', segment: 'Non-IT' },
  { title: 'Waiter / Steward', category: 'Waiter / Steward', industry: 'Hotels, Restaurants & Banquet', skills: 'Table Service, Guest Courtesy, Order Taking', segment: 'Blue Collar' },
  { title: 'Ward Boy', category: 'Ward Boy', industry: 'Hospitals & Clinics', skills: 'Patient Shifting, Ward Assistance, Hospital Hygiene', segment: 'Blue Collar' },
  { title: 'Warehouse & Dispatch Supervisor', category: 'Warehouse / Logistics', industry: 'Logistics & Warehousing', skills: 'WMS, FIFO, Dispatch Scheduling, Inventory Audits', segment: 'Non-IT' },
  { title: 'Welder (MIG / TIG / Arc)', category: 'Electrician, Fitter & Welder', industry: 'Steel & Fabrication', skills: 'MIG/TIG Welding, Arc Welding, Blueprint Reading, Safety', segment: 'Blue Collar' },
  { title: 'X-Ray & Radiology Technologist', category: 'X-Ray, Radiology & Lab Tech', industry: 'Medical Imaging', skills: 'X-Ray, CT Operations, Patient Positioning', segment: 'Non-IT' },
  { title: 'Yield & Process Analyst', category: 'Yield, Process & Industrial Ops', industry: 'Process Improvement', skills: 'OEE Tracking, Root Cause Analysis, Excel', segment: 'Non-IT' },
  { title: 'Zonal Business Manager', category: 'Zonal & Regional Business', industry: 'Regional & National Sales', skills: 'Multi-State Distribution, P&L Ownership, Strategy', segment: 'Non-IT' },
];

export const POSITION_CATALOG_AZ: PositionCatalogItem[] = [...RAW_POSITION_CATALOG_AZ].sort((a, b) =>
  a.title.localeCompare(b.title)
);

export const ALL_POSITIONS_AZ: string[] = POSITION_CATALOG_AZ.map((p) => p.title);

export function matchesKeywordQuery(query: string, fields: (string | undefined)[]): boolean {
  const clean = query.toLowerCase().trim();
  if (!clean) return true;
  const terms = clean
    .split(/[,\s]+/)
    .map((t) => t.trim())
    .filter(Boolean);
  const haystack = fields.filter(Boolean).join(' ').toLowerCase();
  return terms.every((term) => haystack.includes(term));
}

export function matchesNoticeFilter(noticeValue: string | undefined, filter: string): boolean {
  if (filter === 'all') return true;
  const val = (noticeValue || 'Immediate').toLowerCase();
  if (filter === 'immediate') {
    return val.includes('immediate') || val.includes('0 day');
  }
  if (filter === '0_days') {
    return val.includes('0 day') || val.includes('immediate');
  }
  if (filter === '15_days') {
    return val.includes('15 day') || val.includes('0 day') || val.includes('immediate');
  }
  if (filter === '1_month') {
    return val.includes('1 month') || val.includes('30 day');
  }
  if (filter === 'negotiable') {
    return val.includes('2 month') || val.includes('negotiable') || val.includes('60 day');
  }
  return true;
}

export function matchesExperienceFilter(expValue: string | undefined, filter: string): boolean {
  if (filter === 'all') return true;
  const raw = (expValue || '').toLowerCase();
  if (raw.includes('fresher')) {
    return filter === 'fresher' || filter === '0-1';
  }
  const nums = raw.match(/\d+(\.\d+)?/g)?.map(Number) || [0];
  const minYrs = nums[0] ?? 0;
  const maxYrs = nums.length > 1 ? nums[1] : minYrs;

  if (filter === 'fresher' || filter === '0-1') return minYrs <= 1;
  if (filter === '1-3') return maxYrs >= 1 && minYrs <= 3;
  if (filter === '3-5') return maxYrs >= 3 && minYrs <= 5;
  if (filter === '5-8') return maxYrs >= 5 && minYrs <= 8;
  if (filter === '8+') return maxYrs >= 8;
  return true;
}

export function estimateMonthlyInr(salaryStr: string | undefined): {
  isInternational: boolean;
  monthlyInr: number;
} {
  const s = (salaryStr || '').toLowerCase().trim();
  const isIntl =
    s.includes('aed') ||
    s.includes('sar') ||
    s.includes('sgd') ||
    s.includes('cad') ||
    s.includes('usd') ||
    s.includes('$') ||
    s.includes('£') ||
    s.includes('€');
  if (isIntl) {
    return { isInternational: true, monthlyInr: 250000 };
  }

  const cleaned = s.replace(/,/g, '');
  const matches = cleaned.match(/\d+(\.\d+)?/g)?.map(Number) || [];
  if (matches.length === 0) return { isInternational: false, monthlyInr: 30000 };
  const avg = matches.length > 1 ? (matches[0] + matches[1]) / 2 : matches[0];

  if (s.includes('lpa') || s.includes('lac') || s.includes('lakh')) {
    return { isInternational: false, monthlyInr: Math.round((avg * 100000) / 12) };
  }
  return { isInternational: false, monthlyInr: Math.round(avg) };
}

export function matchesSalaryFilter(salaryStr: string | undefined, filter: string): boolean {
  if (filter === 'all') return true;
  const { isInternational, monthlyInr } = estimateMonthlyInr(salaryStr);
  if (filter === 'intl') return isInternational;
  if (isInternational) return false;
  if (filter === '0-25k') return monthlyInr <= 25000;
  if (filter === '25k-50k') return monthlyInr > 25000 && monthlyInr <= 50000;
  if (filter === '50k-1l') return monthlyInr > 50000 && monthlyInr <= 100000;
  if (filter === '1l+') return monthlyInr > 100000;
  return true;
}

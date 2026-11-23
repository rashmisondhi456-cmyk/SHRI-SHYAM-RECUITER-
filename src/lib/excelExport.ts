import * as XLSX from 'xlsx';
import { Candidate, JobApplication, JobCategory } from '../types';
import { enrichCandidate, FUNCTIONAL_CATEGORIES_AZ } from './naukriFilters';

export function exportApplicationsToExcel(
  applications: JobApplication[],
  filenamePrefix = 'Shri_Shyam_Job_Applications'
): void {
  const rows = applications.map((app, index) => ({
    'S.No': index + 1,
    'Application ID': app.id,
    'Applied Date': app.appliedDate,
    'Source Platform': app.sourcePlatform || 'Direct Link',
    'Job Title': app.jobTitle,
    'Hiring Company': app.companyName || 'Shri Shyam Consulting Client',
    'Applicant Name': app.applicantName,
    'Mobile / WhatsApp': app.phone,
    Email: app.email,
    Gender: app.gender || 'Any',
    'Current Location': app.currentLocation,
    'Current Company': app.currentCompany || '-',
    Experience: app.experience,
    'Notice Period': app.noticePeriod,
    'Current Salary': app.currentSalary || 'Negotiable',
    'Expected Salary': app.expectedSalary || 'Negotiable',
    Skills: (app.skills || []).join(', '),
    'Resume Link': app.resumeLink || '-',
    'Cover Note': app.coverNote || '-',
    Status: app.status.toUpperCase(),
  }));

  const worksheet = XLSX.utils.json_to_sheet(
    rows.length > 0
      ? rows
      : [
          {
            'S.No': '',
            'Application ID': '',
            'Applied Date': '',
            'Source Platform': '',
            'Job Title': '',
            'Hiring Company': '',
            'Applicant Name': 'No applications submitted yet',
            'Mobile / WhatsApp': '',
            Email: '',
            Gender: '',
            'Current Location': '',
            'Current Company': '',
            Experience: '',
            'Notice Period': '',
            'Current Salary': '',
            'Expected Salary': '',
            Skills: '',
            'Resume Link': '',
            'Cover Note': '',
            Status: '',
          },
        ]
  );

  worksheet['!cols'] = [
    { wch: 6 },
    { wch: 22 },
    { wch: 14 },
    { wch: 16 },
    { wch: 30 },
    { wch: 26 },
    { wch: 22 },
    { wch: 16 },
    { wch: 26 },
    { wch: 10 },
    { wch: 22 },
    { wch: 22 },
    { wch: 14 },
    { wch: 16 },
    { wch: 16 },
    { wch: 16 },
    { wch: 32 },
    { wch: 28 },
    { wch: 34 },
    { wch: 14 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Job Applications');
  const stamp = new Date().toISOString().split('T')[0];
  XLSX.writeFile(workbook, `${filenamePrefix}_${stamp}.xlsx`);
}

export function exportCandidatesToExcel(
  candidates: Candidate[],
  filenamePrefix = 'Shri_Shyam_Resdex_Database'
): void {
  const rows = candidates.map((c, index) => ({
    'S.No': index + 1,
    Name: c.name,
    Contact: c.contact,
    Email: c.email,
    Gender: c.gender || 'Any',
    Designation: c.designation,
    Company: c.company || '-',
    Industry: c.category,
    Location: c.location,
    Country: c.country || 'India',
    Scope: c.scope || 'domestic',
    Experience: c.experience,
    'Current CTC': c.currentSalary || 'Negotiable',
    'Expected CTC': c.expectedSalary || 'Negotiable',
    'Notice Period': c.noticePeriod || 'Immediate',
    Skills: c.skills.join(', '),
    Status: c.status,
    'AI Score': `${c.aiScore ?? 0}%`,
    'Added Date': c.sourceDate,
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  worksheet['!cols'] = [
    { wch: 6 },
    { wch: 22 },
    { wch: 16 },
    { wch: 26 },
    { wch: 10 },
    { wch: 28 },
    { wch: 24 },
    { wch: 24 },
    { wch: 22 },
    { wch: 16 },
    { wch: 14 },
    { wch: 14 },
    { wch: 16 },
    { wch: 16 },
    { wch: 16 },
    { wch: 36 },
    { wch: 16 },
    { wch: 10 },
    { wch: 14 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Resdex Candidates');
  const stamp = new Date().toISOString().split('T')[0];
  XLSX.writeFile(workbook, `${filenamePrefix}_${stamp}.xlsx`);
}

function inferCategory(raw: string): JobCategory {
  const lower = raw.toLowerCase();
  const exact = FUNCTIONAL_CATEGORIES_AZ.find((c) => c.toLowerCase() === lower);
  if (exact) return exact;
  if (lower.includes('cashier') || lower.includes('pos billing')) {
    return 'Cashier';
  }
  if (lower.includes('cook') || lower.includes('chef') || lower.includes('kitchen')) {
    return 'Cook / Chef';
  }
  if (lower.includes('beautician') || lower.includes('salon') || lower.includes('makeup')) {
    return 'Beautician';
  }
  if (lower.includes('spa') || lower.includes('therapist')) {
    return 'Spa';
  }
  if (lower.includes('waiter') || lower.includes('steward')) {
    return 'Waiter / Steward';
  }
  if (lower.includes('ward boy')) {
    return 'Ward Boy';
  }
  if (lower.includes('nurse') || lower.includes('compounder')) {
    return 'Nurse / Compounder';
  }
  if (lower.includes('ac technician') || lower.includes('refrigerator') || lower.includes('hvac')) {
    return 'Refrigerator & AC Technician';
  }
  if (lower.includes('data entry') || lower.includes('back office')) {
    return 'Back Office / Data Entry';
  }
  if (lower.includes('account') || lower.includes('fin') || lower.includes('tally') || lower.includes('gst')) {
    return 'Accounting & Finance';
  }
  if (lower.includes('admin') || lower.includes('office') || lower.includes('facility')) {
    return 'Administration & Facilities';
  }
  if (lower.includes('bank') || lower.includes('bfsi') || lower.includes('insur')) {
    return 'Banking, Financial Services & BFSI';
  }
  if (lower.includes('civil') || lower.includes('const') || lower.includes('arch')) {
    return 'Construction, Civil & Architecture';
  }
  if (lower.includes('digital') || lower.includes('seo') || lower.includes('graphic')) {
    return 'Digital Marketing & Creative Media';
  }
  if (lower.includes('hr') || lower.includes('recruit') || lower.includes('talent')) {
    return 'Human Resources & Talent';
  }
  if (lower.includes('export') || lower.includes('import') || lower.includes('trade')) {
    return 'Import, Export & International Trade';
  }
  if (lower.includes('audit') || lower.includes('legal') || lower.includes('tax')) {
    return 'Legal, Audit & Compliance';
  }
  if (lower.includes('logist') || lower.includes('supply') || lower.includes('freight')) {
    return 'Logistics & Supply Chain';
  }
  if (lower.includes('fmcg') || lower.includes('sales') || lower.includes('bd') || lower.includes('business')) {
    return 'FMCG & Business Development';
  }
  if (lower.includes('tele') || lower.includes('bpo') || lower.includes('call') || lower.includes('support')) {
    return 'Telesales & BPO';
  }
  if (lower.includes('driver') || lower.includes('delivery') || lower.includes('rider') || lower.includes('fleet')) {
    return 'Driver, Delivery & Fleet';
  }
  if (lower.includes('electr') || lower.includes('fitter') || lower.includes('welder') || lower.includes('plumber')) {
    return 'Electrician, Fitter & Welder';
  }
  if (lower.includes('housekeep') || lower.includes('security') || lower.includes('guard') || lower.includes('helper') || lower.includes('peon') || lower.includes('loader')) {
    return 'Housekeeping, Security & Helper';
  }
  if (lower.includes('blue') || lower.includes('mason') || lower.includes('carpenter') || lower.includes('cnc') || lower.includes('moulding')) {
    return 'Blue Collar & Skilled Trades';
  }
  if (lower.includes('mfg') || lower.includes('manuf') || lower.includes('prod') || lower.includes('plant')) {
    return 'Manufacturing & Operations';
  }
  if (lower.includes('it') || lower.includes('data') || lower.includes('soft') || lower.includes('dev') || lower.includes('tech')) {
    return 'IT & Data Engineering';
  }
  if (lower.includes('edu') || lower.includes('teach') || lower.includes('ielts') || lower.includes('train')) {
    return 'Education & Training';
  }
  if (lower.includes('health') || lower.includes('med') || lower.includes('physio') || lower.includes('clinic')) {
    return 'Healthcare & Clinical';
  }
  if (lower.includes('warehous') || lower.includes('store') || lower.includes('inventory')) {
    return 'Warehousing & Inventory';
  }
  return 'Executive & Management';
}

export async function parseCandidatesFromExcelFile(file: File): Promise<Candidate[]> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  if (!firstSheet) return [];

  const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(firstSheet, { defval: '' });
  const today = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const parsed: Candidate[] = [];
  rawRows.forEach((row, idx) => {
    const normalized: Record<string, string> = {};
    Object.entries(row).forEach(([k, v]) => {
      normalized[k.trim().toLowerCase()] = String(v ?? '').trim();
    });

    const name =
      normalized['name'] ||
      normalized['applicant name'] ||
      normalized['candidate name'] ||
      normalized['full name'] ||
      '';
    const contact =
      normalized['contact'] ||
      normalized['phone'] ||
      normalized['mobile'] ||
      normalized['mobile / whatsapp'] ||
      normalized['phone number'] ||
      '';

    if (!name && !contact) return;

    const location =
      normalized['location'] ||
      normalized['current location'] ||
      normalized['city'] ||
      'Durg, Chhattisgarh';
    const country = normalized['country'] || 'India';
    const rawGender = normalized['gender'] || 'Any';
    const gender: 'Male' | 'Female' | 'Any' =
      rawGender.toLowerCase() === 'male'
        ? 'Male'
        : rawGender.toLowerCase() === 'female'
        ? 'Female'
        : 'Any';

    const skillsRaw = normalized['skills'] || normalized['key skills'] || '';
    const skills = skillsRaw
      ? skillsRaw
          .split(/[,;|]+/)
          .map((s) => s.trim())
          .filter(Boolean)
          .slice(0, 15)
      : ['General Operations'];

    const designation =
      normalized['designation'] ||
      normalized['job title'] ||
      normalized['role'] ||
      'Candidate Profile';

    const candidate = enrichCandidate({
      id: `cand-imp-${Date.now()}-${idx}`,
      name: name || `Candidate ${idx + 1}`,
      contact: contact || '8269715615',
      email: normalized['email'] || `${(name || 'candidate').toLowerCase().replace(/[^a-z0-9]/g, '')}@gmail.com`,
      location,
      country,
      scope: country.toLowerCase() !== 'india' ? 'international' : 'domestic',
      company: normalized['company'] || normalized['current company'] || 'Imported DB Record',
      gender,
      designation,
      category: inferCategory(normalized['industry'] || normalized['category'] || designation),
      experience: normalized['experience'] || '2 years',
      currentSalary: normalized['current ctc'] || normalized['current salary'] || normalized['salary'] || 'Negotiable',
      expectedSalary: normalized['expected ctc'] || normalized['expected salary'] || 'Negotiable',
      noticePeriod: normalized['notice period'] || normalized['notice'] || 'Immediate Joiner',
      resumeLink: normalized['resume link'] || normalized['resume'] || undefined,
      sourceDate: normalized['added date'] || normalized['applied date'] || today,
      skills,
      status: 'sourced',
      aiScore: 78,
    });

    parsed.push(candidate);
  });

  return parsed;
}

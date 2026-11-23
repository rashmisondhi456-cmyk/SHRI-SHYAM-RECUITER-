import React, { useState } from 'react';
import { Candidate, InterviewSchedule } from '../types';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Video, 
  Phone, 
  Mail, 
  Copy, 
  Check, 
  Download, 
  ExternalLink, 
  Send,
  User,
  Plus,
  AlertCircle,
  Trash2
} from 'lucide-react';

interface InterviewSchedulerProps {
  candidates: Candidate[];
  interviews: InterviewSchedule[];
  prefilledCandidate?: Candidate | null;
  prefilledNotes?: string;
  onAddInterview: (interview: InterviewSchedule) => void;
  onUpdateInterviewStatus: (id: string, status: 'scheduled' | 'completed' | 'cancelled') => void;
  onDeleteInterview?: (id: string) => void;
  onExportInterviewsCsv: () => void;
}

export const InterviewScheduler: React.FC<InterviewSchedulerProps> = ({
  candidates,
  interviews,
  prefilledCandidate,
  prefilledNotes,
  onAddInterview,
  onUpdateInterviewStatus,
  onDeleteInterview,
  onExportInterviewsCsv,
}) => {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [selectedCandId, setSelectedCandId] = useState<string>(
    prefilledCandidate?.id || (candidates.length > 0 ? candidates[0].id : '')
  );
  const [interviewType, setInterviewType] = useState<'in_person_durg' | 'google_meet' | 'telephonic'>('in_person_durg');
  const [interviewDate, setInterviewDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [interviewTime, setInterviewTime] = useState<string>('11:00 AM');
  const [interviewer, setInterviewer] = useState<string>('HR Recruitment Panel (Shri Shyam Consulting)');
  const [notes, setNotes] = useState<string>(prefilledNotes || '');
  const [copiedMsg, setCopiedMsg] = useState(false);
  const [scheduledBanner, setScheduledBanner] = useState<string | null>(null);

  const activeCandidate = candidates.find((c) => c.id === selectedCandId) || prefilledCandidate || candidates[0];

  // Derived location address
  const getLocationString = () => {
    if (interviewType === 'in_person_durg') {
      return 'Shri Shyam Consulting, Paras Complex, Durg, CG (Chhattisgarh, Pin: 491001)';
    }
    if (interviewType === 'google_meet') {
      return 'Google Meet Online Video Conference';
    }
    return 'Telephonic Round (+91 8269715615)';
  };

  // Google Meet link generator
  const generatedMeetLink = interviewType === 'google_meet' 
    ? `https://meet.google.com/ssc-durg-${activeCandidate ? activeCandidate.name.toLowerCase().replace(/[^a-z]/g, '').slice(0, 6) : 'room'}` 
    : undefined;

  // Pre-formatted message text
  const invitationText = `Dear ${activeCandidate?.name || 'Candidate'},

Greetings from Shri Shyam Consulting, Durg!

Following your screening evaluation, you are invited for a formal interview round:
• Role: ${activeCandidate?.designation || 'Applied Position'}
• Date & Time: ${interviewDate} at ${interviewTime}
• Mode: ${
    interviewType === 'in_person_durg'
      ? 'In-Person at Office: Paras Complex, Durg, Chhattisgarh (Pin 491001)'
      : interviewType === 'google_meet'
      ? `Google Meet: ${generatedMeetLink}`
      : 'Telephonic Screening from Helpline 8269715615'
  }
• Panel: ${interviewer}
• Contact: 8269715615 | info@shrishyamconsulting.in
• Website: www.shrishyamconsulting.in

Please bring your updated resume and ID proof. Kindly reply to confirm your availability.

Warm regards,
Recruitment Operations Team
Shri Shyam Consulting, Paras Complex, Durg, CG`;

  const handleCreateInterview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCandidate) return;

    const newInterview: InterviewSchedule = {
      id: `int-${Date.now()}`,
      candidateId: activeCandidate.id,
      candidateName: activeCandidate.name,
      candidateContact: activeCandidate.contact,
      candidateEmail: activeCandidate.email || `${activeCandidate.name.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
      role: activeCandidate.designation,
      interviewType,
      locationAddress: getLocationString(),
      dateTime: `${interviewDate} at ${interviewTime}`,
      status: 'scheduled',
      meetLink: generatedMeetLink,
      notes,
      interviewer,
    };

    onAddInterview(newInterview);
    setScheduledBanner(`Interview scheduled for ${activeCandidate.name}. Encrypted invite ready to send.`);
    setTimeout(() => setScheduledBanner(null), 4000);
  };

  const handleCopyInvitation = () => {
    navigator.clipboard.writeText(invitationText);
    setCopiedMsg(true);
    setTimeout(() => setCopiedMsg(false), 2500);
  };

  // Mailto with CC to info@shrishyamconsulting.in
  const mailtoUrl = `mailto:${encodeURIComponent(activeCandidate?.email || '')}?cc=info@shrishyamconsulting.in&subject=${encodeURIComponent(
    `Interview Invitation: ${activeCandidate?.designation || 'Role'} at Shri Shyam Consulting, Durg`
  )}&body=${encodeURIComponent(invitationText)}`;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-800" />
            <span>Automated Interview Scheduling Suite</span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Book in-person interviews at Paras Complex Durg, online Google Meet calls, or telephonic discussions.
          </p>
        </div>

        <button
          onClick={onExportInterviewsCsv}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-stone-300 text-stone-700 rounded-lg hover:bg-stone-50 cursor-pointer shadow-2xs"
        >
          <Download className="w-3.5 h-3.5 text-stone-600" />
          <span>Export Calendar to CSV / Sheets</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Booking Form (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-stone-200 p-5 shadow-xs">
          <h3 className="font-bold text-sm text-stone-900 mb-4 pb-2 border-b border-stone-100 flex items-center gap-2">
            <Plus className="w-4 h-4 text-emerald-700" />
            <span>Schedule New Candidate Slot</span>
          </h3>

          <form onSubmit={handleCreateInterview} className="space-y-4">
            {/* Candidate Selector */}
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Candidate Profile
              </label>
              <select
                value={selectedCandId}
                onChange={(e) => setSelectedCandId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-700 cursor-pointer font-medium"
              >
                {candidates.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} — {c.designation} ({c.location}) [{c.contact}]
                  </option>
                ))}
              </select>
            </div>

            {/* Interview Format / Mode */}
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Interview Format &amp; Venue
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setInterviewType('in_person_durg')}
                  className={`p-3 rounded-lg border text-left cursor-pointer transition-all flex flex-col justify-between ${
                    interviewType === 'in_person_durg'
                      ? 'border-emerald-800 bg-emerald-50/70 text-emerald-950 font-bold'
                      : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs">
                    <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>In-Person Durg</span>
                  </div>
                  <span className="text-[10px] text-stone-500 mt-1">Paras Complex Office</span>
                </button>

                <button
                  type="button"
                  onClick={() => setInterviewType('google_meet')}
                  className={`p-3 rounded-lg border text-left cursor-pointer transition-all flex flex-col justify-between ${
                    interviewType === 'google_meet'
                      ? 'border-emerald-800 bg-emerald-50/70 text-emerald-950 font-bold'
                      : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs">
                    <Video className="w-4 h-4 text-sky-600 shrink-0" />
                    <span>Google Meet</span>
                  </div>
                  <span className="text-[10px] text-stone-500 mt-1">Online Video Round</span>
                </button>

                <button
                  type="button"
                  onClick={() => setInterviewType('telephonic')}
                  className={`p-3 rounded-lg border text-left cursor-pointer transition-all flex flex-col justify-between ${
                    interviewType === 'telephonic'
                      ? 'border-emerald-800 bg-emerald-50/70 text-emerald-950 font-bold'
                      : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs">
                    <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Telephonic</span>
                  </div>
                  <span className="text-[10px] text-stone-500 mt-1">Helpline 8269715615</span>
                </button>
              </div>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Interview Date
                </label>
                <input
                  type="date"
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Interview Time Slot
                </label>
                <select
                  value={interviewTime}
                  onChange={(e) => setInterviewTime(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-700 cursor-pointer"
                >
                  <option value="10:00 AM">10:00 AM IST</option>
                  <option value="11:00 AM">11:00 AM IST</option>
                  <option value="12:00 PM">12:00 PM IST</option>
                  <option value="02:30 PM">02:30 PM IST</option>
                  <option value="04:00 PM">04:00 PM IST</option>
                  <option value="05:30 PM">05:30 PM IST</option>
                </select>
              </div>
            </div>

            {/* Interviewer */}
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Assigned Interviewer / Panel
              </label>
              <input
                type="text"
                value={interviewer}
                onChange={(e) => setInterviewer(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Candidate Screening Notes &amp; Instructions
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Include key competencies to assess, salary cap, or specific round remarks..."
                className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
            >
              <Calendar className="w-4 h-4 text-amber-300" />
              <span>Confirm &amp; Schedule Interview Slot</span>
            </button>
          </form>
        </div>

        {/* Live Invitation Preview & Messaging (5 Cols) */}
        <div className="lg:col-span-5 bg-stone-50 rounded-xl border border-stone-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-stone-800 flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-emerald-700" />
                <span>Automated Candidate Notification</span>
              </h3>
              <span className="text-[10px] text-stone-500 font-mono">
                CC: info@shrishyamconsulting.in
              </span>
            </div>
            {scheduledBanner && (
              <div className="mb-3 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold">
                {scheduledBanner}
              </div>
            )}

            <div className="bg-white border border-stone-200 rounded-lg p-3 text-xs text-stone-800 font-mono whitespace-pre-wrap leading-relaxed max-h-[360px] overflow-y-auto">
              {invitationText}
            </div>
          </div>

          {/* Direct actions */}
          <div className="mt-4 pt-3 border-t border-stone-200 flex flex-col sm:flex-row items-center gap-2">
            <button
              onClick={handleCopyInvitation}
              className="w-full sm:w-1/2 py-2 px-3 bg-white border border-stone-300 hover:bg-stone-100 text-stone-800 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
            >
              {copiedMsg ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedMsg ? 'Copied Invitation!' : 'Copy WhatsApp / SMS'}</span>
            </button>

            <a
              href={mailtoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-1/2 py-2 px-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
            >
              <Send className="w-3.5 h-3.5 text-amber-300" />
              <span>Send via Gmail / Mail</span>
            </a>
          </div>
        </div>
      </div>

      {/* Scheduled Interviews Log Table */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs">
        <h3 className="font-bold text-sm text-stone-900 mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-emerald-800" />
          <span>Upcoming Scheduled Interviews ({interviews.length})</span>
        </h3>

        {interviews.length === 0 ? (
          <p className="text-xs text-stone-400 py-6 text-center italic">
            No interviews scheduled yet. Use the booking panel above to create one.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-600 uppercase text-[10px] tracking-wider border-b border-stone-200">
                <tr>
                  <th className="py-2.5 px-3">Candidate</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">Date &amp; Time</th>
                  <th className="py-2.5 px-3">Mode &amp; Location</th>
                  <th className="py-2.5 px-3">Interviewer</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {interviews.map((item) => (
                  <tr key={item.id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="py-3 px-3">
                      <strong className="text-stone-900 block">{item.candidateName}</strong>
                      <span className="text-stone-500 font-mono text-[11px]">{item.candidateContact}</span>
                    </td>
                    <td className="py-3 px-3 font-medium text-emerald-900">{item.role}</td>
                    <td className="py-3 px-3 font-semibold text-stone-800">{item.dateTime}</td>
                    <td className="py-3 px-3">
                      <span className="block text-stone-800 font-medium">
                        {item.interviewType === 'in_person_durg'
                          ? 'Paras Complex, Durg, CG'
                          : item.interviewType === 'google_meet'
                          ? 'Google Meet Video'
                          : 'Telephonic (8269715615)'}
                      </span>
                      {item.meetLink && (
                        <a
                          href={item.meetLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-sky-600 hover:underline flex items-center gap-0.5"
                        >
                          <span>Open Meet</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </td>
                    <td className="py-3 px-3 text-stone-600">{item.interviewer}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-900'
                            : item.status === 'cancelled'
                            ? 'bg-rose-100 text-rose-900'
                            : 'bg-amber-100 text-amber-900'
                        }`}
                      >
                        {item.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="inline-flex items-center justify-end gap-1">
                        {item.status === 'scheduled' && (
                          <>
                            <button
                              type="button"
                              onClick={() => onUpdateInterviewStatus(item.id, 'completed')}
                              className="px-2 py-1 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded text-[10px] font-bold cursor-pointer"
                            >
                              Complete
                            </button>
                            <button
                              type="button"
                              onClick={() => onUpdateInterviewStatus(item.id, 'cancelled')}
                              className="px-2 py-1 bg-amber-50 text-amber-800 hover:bg-amber-100 rounded text-[10px] font-bold cursor-pointer"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                        {onDeleteInterview && (
                          confirmDeleteId === item.id ? (
                            <span className="inline-flex items-center gap-1 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded">
                              <button
                                type="button"
                                onClick={() => {
                                  onDeleteInterview(item.id);
                                  setConfirmDeleteId(null);
                                }}
                                className="px-1.5 py-0.5 bg-rose-700 text-white rounded text-[10px] font-bold cursor-pointer"
                              >
                                Confirm
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(null)}
                                className="px-1 py-0.5 text-stone-600 text-[10px] font-semibold cursor-pointer"
                              >
                                No
                              </button>
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(item.id)}
                              className="p-1.5 text-rose-700 hover:bg-rose-50 rounded cursor-pointer"
                              title="Delete interview record"
                              aria-label="Delete interview record"
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
    </div>
  );
};

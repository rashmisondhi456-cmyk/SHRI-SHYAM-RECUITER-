import React, { useState } from 'react';
import { Candidate, CandidateStatus } from '../types';
import { 
  Kanban, 
  Sparkles, 
  MapPin, 
  Clock, 
  PhoneCall, 
  Calendar, 
  ChevronRight, 
  UserCheck, 
  UserX,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface AtsPipelineProps {
  candidates: Candidate[];
  onUpdateCandidateStatus: (candidateId: string, newStatus: CandidateStatus) => void;
  onSelectCandidateForCall: (candidate: Candidate) => void;
  onScheduleInterview: (candidate: Candidate) => void;
  onOpenCandidateModal: (candidate: Candidate) => void;
}

const STAGES: { key: CandidateStatus; label: string; bg: string; border: string; text: string }[] = [
  {
    key: 'sourced',
    label: 'Resdex Sourced',
    bg: 'bg-stone-50',
    border: 'border-stone-300',
    text: 'text-stone-800',
  },
  {
    key: 'screened',
    label: 'AI Screened',
    bg: 'bg-sky-50',
    border: 'border-sky-300',
    text: 'text-sky-900',
  },
  {
    key: 'shortlisted',
    label: 'Shortlisted',
    bg: 'bg-emerald-50',
    border: 'border-emerald-300',
    text: 'text-emerald-900',
  },
  {
    key: 'interview_scheduled',
    label: 'Interview Scheduled',
    bg: 'bg-amber-50',
    border: 'border-amber-300',
    text: 'text-amber-900',
  },
  {
    key: 'hired',
    label: 'Offer / Hired',
    bg: 'bg-teal-50',
    border: 'border-teal-300',
    text: 'text-teal-900',
  },
  {
    key: 'rejected',
    label: 'Archived / Rejected',
    bg: 'bg-rose-50',
    border: 'border-rose-300',
    text: 'text-rose-900',
  },
];

export const AtsPipeline: React.FC<AtsPipelineProps> = ({
  candidates,
  onUpdateCandidateStatus,
  onSelectCandidateForCall,
  onScheduleInterview,
  onOpenCandidateModal,
}) => {
  const [pipelineSearch, setPipelineSearch] = useState('');

  const filteredCandidates = candidates.filter((c) => {
    const q = pipelineSearch.toLowerCase().trim();
    return (
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.designation.toLowerCase().includes(q) ||
      c.location.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* ATS Header & Controls */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
            <Kanban className="w-5 h-5 text-emerald-800" />
            <span>Applicant Tracking System (ATS Pipeline)</span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Track candidates seamlessly across sourcing, AI tele-screening, interview rounds, and final onboarding.
          </p>
        </div>

        {/* Quick Search inside ATS */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={pipelineSearch}
            onChange={(e) => setPipelineSearch(e.target.value)}
            placeholder="Filter pipeline candidates..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
          />
        </div>
      </div>

      {/* Horizontal Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-4 items-start overflow-x-auto pb-4">
        {STAGES.map((stage) => {
          const columnCandidates = filteredCandidates.filter((c) => c.status === stage.key);

          return (
            <div
              key={stage.key}
              className={`rounded-xl border ${stage.border} ${stage.bg} flex flex-col min-h-[480px] p-3 shadow-2xs`}
            >
              {/* Stage Header */}
              <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-stone-200/70">
                <span className={`text-xs font-bold ${stage.text}`}>
                  {stage.label}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-white text-stone-700 shadow-2xs">
                  {columnCandidates.length}
                </span>
              </div>

              {/* Cards list */}
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[620px] pr-0.5">
                {columnCandidates.length === 0 ? (
                  <div className="py-8 text-center text-stone-400 text-xs italic">
                    No candidates
                  </div>
                ) : (
                  columnCandidates.map((c) => {
                    const isLocalCG =
                      c.location.toLowerCase().includes('durg') ||
                      c.location.toLowerCase().includes('bhilai') ||
                      c.location.toLowerCase().includes('raipur');

                    return (
                      <div
                        key={c.id}
                        className="bg-white rounded-lg border border-stone-200 p-3 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-1.5">
                            <h4
                              onClick={() => onOpenCandidateModal(c)}
                              className="font-bold text-xs text-stone-900 hover:text-emerald-800 cursor-pointer transition-colors"
                            >
                              {c.name}
                            </h4>
                            {c.aiScore && (
                              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded shrink-0">
                                {c.aiScore}%
                              </span>
                            )}
                          </div>

                          <p className="text-[11px] font-medium text-emerald-900 mt-0.5">
                            {c.designation}
                          </p>

                          <div className="mt-2 text-[11px] text-stone-600 space-y-1">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                              <span className="truncate">{c.location}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-stone-400 shrink-0" />
                              <span>{c.experience}</span>
                            </div>
                          </div>

                          {isLocalCG && (
                            <span className="mt-2 inline-block px-1.5 py-0.2 text-[9px] font-bold bg-amber-100 text-amber-900 rounded border border-amber-300">
                              Durg/CG Local
                            </span>
                          )}
                        </div>

                        {/* Card Footer & Stage Mover */}
                        <div className="mt-3 pt-2 border-t border-stone-100 flex items-center justify-between gap-1">
                          {/* Quick Call */}
                          <button
                            onClick={() => onSelectCandidateForCall(c)}
                            className="p-1 text-emerald-700 hover:bg-emerald-50 rounded cursor-pointer transition-colors"
                            title="Start AI Call"
                          >
                            <PhoneCall className="w-3.5 h-3.5" />
                          </button>

                          {/* Quick Interview */}
                          <button
                            onClick={() => onScheduleInterview(c)}
                            className="p-1 text-amber-700 hover:bg-amber-50 rounded cursor-pointer transition-colors"
                            title="Schedule Interview"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                          </button>

                          {/* Move Stage Selector */}
                          <select
                            value={c.status}
                            onChange={(e) =>
                              onUpdateCandidateStatus(c.id, e.target.value as CandidateStatus)
                            }
                            className="text-[10px] bg-stone-100 border border-stone-200 rounded px-1 py-0.5 text-stone-800 cursor-pointer font-medium focus:outline-none"
                          >
                            <option value="sourced">Sourced</option>
                            <option value="screened">Screened</option>
                            <option value="shortlisted">Shortlisted</option>
                            <option value="interview_scheduled">Interview</option>
                            <option value="hired">Hired</option>
                            <option value="rejected">Archive</option>
                          </select>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

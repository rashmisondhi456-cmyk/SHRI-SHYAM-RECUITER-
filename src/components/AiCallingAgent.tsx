import React, { useState, useEffect, useRef } from 'react';
import { Candidate, CallTranscriptTurn, CallLogItem } from '../types';
import { 
  PhoneCall, 
  PhoneOff, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Bot, 
  User, 
  CheckCircle2, 
  Calendar, 
  Sparkles, 
  Clock, 
  Send, 
  RotateCcw,
  Building2,
  FileCheck2,
  MessageSquare,
  AlertTriangle
} from 'lucide-react';

interface AiCallingAgentProps {
  candidates: Candidate[];
  selectedCandidate: Candidate | null;
  onSelectCandidate: (candidate: Candidate) => void;
  onCallCompleted: (candidateId: string, log: CallLogItem, updatedCandidate?: Partial<Candidate>) => void;
  onScheduleInterview: (candidate: Candidate, prefilledNotes?: string) => void;
}

export const AiCallingAgent: React.FC<AiCallingAgentProps> = ({
  candidates,
  selectedCandidate,
  onSelectCandidate,
  onCallCompleted,
  onScheduleInterview,
}) => {
  const currentCandidate = selectedCandidate || candidates[0];

  // Call status state
  const [callActive, setCallActive] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [transcripts, setTranscripts] = useState<CallTranscriptTurn[]>([]);
  const [candidateInput, setCandidateInput] = useState('');
  const [isAgentThinking, setIsAgentThinking] = useState(false);
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);
  const [callDisposition, setCallDisposition] = useState<string>('Not Dialed');
  const [screeningScore, setScreeningScore] = useState<number>(75);
  const [extractedNotes, setExtractedNotes] = useState<string>('');

  // Screening Checklist checklist items
  const [checklist, setChecklist] = useState({
    identityVerified: false,
    activelyLooking: false,
    experienceConfirmed: false,
    locationConfirmed: false,
    salaryAligned: false,
    noticePeriodChecked: false,
    interviewAccepted: false,
  });

  const timerRef = useRef<any>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcripts, isAgentSpeaking]);

  // Duration timer
  useEffect(() => {
    if (callActive) {
      timerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [callActive]);

  // Speech synthesis helper
  const speakAgentText = (text: string) => {
    if (!audioEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.05;
      utterance.lang = 'en-IN'; // Indian English voice preferred if available

      // Find an Indian English voice if available
      const voices = window.speechSynthesis.getVoices();
      const indianVoice = voices.find(
        (v) => v.lang.includes('en-IN') || v.name.includes('India') || v.name.includes('Ravi') || v.name.includes('Heera')
      );
      if (indianVoice) {
        utterance.voice = indianVoice;
      }

      utterance.onstart = () => setIsAgentSpeaking(true);
      utterance.onend = () => setIsAgentSpeaking(false);
      utterance.onerror = () => setIsAgentSpeaking(false);

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Speech synthesis error:', err);
      setIsAgentSpeaking(false);
    }
  };

  // Start Call
  const handleStartCall = async () => {
    if (!currentCandidate) return;
    setIsCalling(true);
    setCallDuration(0);
    setTranscripts([]);
    setCallDisposition('Call Connected - Screening');
    setExtractedNotes('');
    setChecklist({
      identityVerified: true,
      activelyLooking: false,
      experienceConfirmed: false,
      locationConfirmed: false,
      salaryAligned: false,
      noticePeriodChecked: false,
      interviewAccepted: false,
    });

    // Simulate ringtone delay (1.2s)
    setTimeout(async () => {
      setIsCalling(false);
      setCallActive(true);

      const introTurn: CallTranscriptTurn = {
        speaker: 'agent',
        text: `Namaste ${currentCandidate.name}, I am calling from Shri Shyam Consulting, Durg. We reviewed your profile for the ${currentCandidate.designation} role. Do you have 2 minutes to confirm a few quick details?`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      };

      setTranscripts([introTurn]);
      speakAgentText(introTurn.text);
    }, 1200);
  };

  // End Call
  const handleEndCall = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setCallActive(false);
    setIsCalling(false);
    setIsAgentSpeaking(false);
    setIsAgentThinking(false);

    if (transcripts.length > 0 && currentCandidate) {
      const finalDisposition = checklist.interviewAccepted
        ? 'Interested - Interview Ready'
        : checklist.salaryAligned === false
        ? 'Salary Mismatch'
        : 'Screening Completed';

      setCallDisposition(finalDisposition);

      const callLog: CallLogItem = {
        id: `call-${Date.now()}`,
        timestamp: new Date().toLocaleString(),
        durationSeconds: callDuration,
        disposition: finalDisposition,
        score: screeningScore,
        transcripts: [...transcripts],
        extractedNotes: extractedNotes || `Completed AI phone screening for ${currentCandidate.name} (${currentCandidate.designation}).`,
      };

      onCallCompleted(currentCandidate.id, callLog, {
        aiScore: screeningScore,
        screeningNotes: callLog.extractedNotes,
        status: checklist.interviewAccepted ? 'interview_scheduled' : 'screened',
      });
    }
  };

  // Send candidate speech/response to Agent
  const handleSendTurn = async (customText?: string) => {
    const textToSend = (customText || candidateInput).trim();
    if (!textToSend || !callActive || !currentCandidate) return;

    setCandidateInput('');

    // Append candidate turn
    const candTurn: CallTranscriptTurn = {
      speaker: 'candidate',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };

    const newHistory = [...transcripts, candTurn];
    setTranscripts(newHistory);

    // Update checklist based on content
    const lower = textToSend.toLowerCase();
    setChecklist((prev) => ({
      ...prev,
      activelyLooking: prev.activelyLooking || lower.includes('yes') || lower.includes('looking') || lower.includes('available'),
      experienceConfirmed: prev.experienceConfirmed || lower.includes('year') || lower.includes('experience') || lower.includes('handled'),
      locationConfirmed: prev.locationConfirmed || lower.includes('durg') || lower.includes('bhilai') || lower.includes('relocate') || lower.includes('near') || lower.includes('location'),
      salaryAligned: prev.salaryAligned || lower.includes('salary') || lower.includes('ctc') || lower.includes('lpa') || lower.includes('month') || lower.includes('expect'),
      noticePeriodChecked: prev.noticePeriodChecked || lower.includes('immediate') || lower.includes('days') || lower.includes('notice') || lower.includes('join'),
      interviewAccepted: prev.interviewAccepted || lower.includes('meet') || lower.includes('saturday') || lower.includes('tomorrow') || lower.includes('paras complex') || lower.includes('sure') || lower.includes('ready'),
    }));

    // Call server AI endpoint
    setIsAgentThinking(true);
    try {
      const response = await fetch('/api/ai/conduct-call-turn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidate: currentCandidate,
          conversationHistory: newHistory,
          candidateInput: textToSend,
          callGoal: `Screen ${currentCandidate.name} for ${currentCandidate.designation}. Office at Paras Complex Durg.`,
        }),
      });

      const data = await response.json();
      setIsAgentThinking(false);

      if (data?.agentMessage) {
        const agentTurn: CallTranscriptTurn = {
          speaker: 'agent',
          text: data.agentMessage,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        };
        setTranscripts((prev) => [...prev, agentTurn]);
        speakAgentText(data.agentMessage);

        if (data.candidateDisposition) {
          setCallDisposition(data.candidateDisposition);
        }
        if (data.screeningScore) {
          setScreeningScore(data.screeningScore);
        }
        if (data.extractedNotes) {
          setExtractedNotes((prev) => (prev ? `${prev} | ${data.extractedNotes}` : data.extractedNotes));
        }

        if (data.isConcluded) {
          setChecklist((prev) => ({ ...prev, interviewAccepted: true }));
        }
      }
    } catch (err) {
      console.error('AI calling turn failed:', err);
      setIsAgentThinking(false);
      // Fallback agent reply
      const fallbackReply = `Thank you for sharing that, ${currentCandidate.name}. We are registering your answers for the ${currentCandidate.designation} role at Shri Shyam Consulting. Let's arrange your official interview slot!`;
      const fallbackTurn: CallTranscriptTurn = {
        speaker: 'agent',
        text: fallbackReply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      };
      setTranscripts((prev) => [...prev, fallbackTurn]);
      speakAgentText(fallbackReply);
    }
  };

  // Quick candidate simulated utterances
  const quickResponses = [
    `Yes, I am speaking. I am looking for new opportunities and have ${currentCandidate?.experience} in ${currentCandidate?.designation}.`,
    `I am comfortable with the location, and my notice period is ${currentCandidate?.noticePeriod || 'immediate'}.`,
    `My current salary is ${currentCandidate?.currentSalary || '30k'}, and I am looking for a reasonable hike.`,
    `Yes, I would be happy to attend an interview at Paras Complex, Durg or over Google Meet.`,
  ];

  const formatSeconds = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Candidate Selector */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-emerald-100 text-emerald-800">
                <Bot className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-base font-bold text-stone-900">
                  AI Calling Agent Studio (ShyamAI)
                </h2>
                <p className="text-xs text-stone-500">
                  Autonomous conversational voice agent for outbound candidate reachout, screening, &amp; interview confirmation.
                </p>
              </div>
            </div>
          </div>

          {/* Candidate Switcher Dropdown */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-xs text-stone-600 font-semibold whitespace-nowrap">
              Active Candidate:
            </span>
            <select
              id="calling-candidate-select"
              value={currentCandidate?.id}
              disabled={callActive}
              onChange={(e) => {
                const found = candidates.find((c) => c.id === e.target.value);
                if (found) onSelectCandidate(found);
              }}
              className="px-3 py-2 text-xs font-semibold bg-stone-50 border border-stone-300 rounded-lg text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-700/30 cursor-pointer w-full md:w-64"
            >
              {candidates.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.designation}) - {c.location}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Calling Stage Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Live Call Console (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          {/* Call Header Card */}
          <div className="bg-stone-900 text-white rounded-xl p-5 border border-stone-800 shadow-md">
            <div className="flex items-center justify-between border-b border-stone-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-emerald-950 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 font-bold text-lg">
                    {currentCandidate?.name.charAt(0)}
                  </div>
                  {callActive && (
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-stone-900 animate-ping"></span>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-base text-white flex items-center gap-2">
                    <span>{currentCandidate?.name}</span>
                    <span className="text-xs font-normal text-stone-400 font-mono">
                      ({currentCandidate?.contact})
                    </span>
                  </h3>
                  <p className="text-xs text-amber-400">
                    {currentCandidate?.designation} • {currentCandidate?.location}
                  </p>
                </div>
              </div>

              {/* Call Timer & Status */}
              <div className="text-right">
                <div className="flex items-center justify-end gap-1.5 font-mono text-sm font-bold text-emerald-400">
                  <Clock className="w-4 h-4" />
                  <span>{formatSeconds(callDuration)}</span>
                </div>
                <span className="text-[11px] text-stone-400 uppercase tracking-wider font-semibold">
                  {isCalling ? 'Dialing...' : callActive ? 'Call Live' : 'Call Idle'}
                </span>
              </div>
            </div>

            {/* Speaking Waveform Visualizer */}
            <div className="py-4 flex items-center justify-center gap-1.5 h-14">
              {callActive ? (
                <>
                  <span className={`w-1 bg-emerald-400 rounded-full transition-all duration-150 ${isAgentSpeaking ? 'h-10 animate-bounce' : 'h-2'}`}></span>
                  <span className={`w-1 bg-emerald-400 rounded-full transition-all duration-150 ${isAgentSpeaking ? 'h-8 animate-pulse' : 'h-3'}`}></span>
                  <span className={`w-1 bg-emerald-400 rounded-full transition-all duration-150 ${isAgentSpeaking ? 'h-12 animate-bounce' : 'h-4'}`}></span>
                  <span className={`w-1 bg-emerald-400 rounded-full transition-all duration-150 ${isAgentSpeaking ? 'h-6 animate-pulse' : 'h-2'}`}></span>
                  <span className={`w-1 bg-emerald-400 rounded-full transition-all duration-150 ${isAgentSpeaking ? 'h-10 animate-bounce' : 'h-3'}`}></span>
                  <span className="text-xs text-emerald-300 font-medium ml-3">
                    {isAgentSpeaking ? 'ShyamAI is speaking...' : isAgentThinking ? 'ShyamAI is analyzing...' : 'Listening to candidate...'}
                  </span>
                </>
              ) : (
                <span className="text-xs text-stone-500">
                  Click "Start AI Outbound Call" to connect to {currentCandidate?.name}
                </span>
              )}
            </div>

            {/* Call Action Controls */}
            <div className="flex items-center justify-between pt-3 border-t border-stone-800">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setAudioEnabled(!audioEnabled)}
                  className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
                    audioEnabled ? 'bg-stone-800 text-stone-200 hover:bg-stone-700' : 'bg-red-900/50 text-red-300'
                  }`}
                  title={audioEnabled ? 'Voice output enabled' : 'Voice output muted'}
                >
                  {audioEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-red-400" />}
                  <span className="hidden sm:inline">{audioEnabled ? 'Voice On' : 'Muted'}</span>
                </button>
              </div>

              <div className="flex items-center gap-3">
                {!callActive ? (
                  <button
                    id="btn-start-call"
                    disabled={isCalling}
                    onClick={handleStartCall}
                    className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold shadow-md cursor-pointer transition-all disabled:opacity-50"
                  >
                    <PhoneCall className="w-4 h-4 text-white animate-bounce" />
                    <span>{isCalling ? 'Connecting to candidate...' : 'Start AI Outbound Call'}</span>
                  </button>
                ) : (
                  <button
                    id="btn-end-call"
                    onClick={handleEndCall}
                    className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm font-bold shadow-md cursor-pointer transition-all"
                  >
                    <PhoneOff className="w-4 h-4 text-white" />
                    <span>Conclude &amp; Log Call</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Real-Time Live Transcript Log */}
          <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-xs flex-1 flex flex-col min-h-[350px]">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2 mb-3">
              <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-emerald-700" />
                <span>Live Outreach &amp; Screening Transcript</span>
              </span>
              <span className="text-[11px] text-stone-500">
                {transcripts.length} turns recorded
              </span>
            </div>

            {/* Conversation Bubbles */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[320px]">
              {transcripts.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-stone-400">
                  <Bot className="w-8 h-8 mb-2 opacity-50 text-emerald-800" />
                  <p className="text-xs">No active conversation yet.</p>
                  <p className="text-[11px] text-stone-400 mt-1">
                    Press "Start AI Outbound Call" to initiate intelligent screening with Shri Shyam Consulting's voice agent.
                  </p>
                </div>
              ) : (
                transcripts.map((t, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start gap-2.5 ${
                      t.speaker === 'agent' ? 'justify-start' : 'justify-end'
                    }`}
                  >
                    {t.speaker === 'agent' && (
                      <div className="w-7 h-7 rounded-full bg-emerald-900 text-amber-400 flex items-center justify-center shrink-0 text-xs font-bold shadow-xs">
                        AI
                      </div>
                    )}
                    <div
                      className={`max-w-[82%] p-3 rounded-xl text-xs leading-relaxed ${
                        t.speaker === 'agent'
                          ? 'bg-emerald-50 text-emerald-950 border border-emerald-200/70 rounded-tl-xs'
                          : 'bg-stone-900 text-white rounded-tr-xs shadow-xs'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3 text-[10px] opacity-70 mb-1">
                        <span className="font-bold">
                          {t.speaker === 'agent' ? 'ShyamAI (Recruiter Agent)' : currentCandidate.name}
                        </span>
                        <span>{t.time}</span>
                      </div>
                      <p className="whitespace-pre-wrap">{t.text}</p>
                    </div>
                    {t.speaker === 'candidate' && (
                      <div className="w-7 h-7 rounded-full bg-stone-200 text-stone-800 flex items-center justify-center shrink-0 text-xs font-bold">
                        {currentCandidate.name.charAt(0)}
                      </div>
                    )}
                  </div>
                ))
              )}
              {isAgentThinking && (
                <div className="flex items-center gap-2 text-xs text-stone-500 italic p-2">
                  <Bot className="w-4 h-4 text-emerald-600 animate-spin" />
                  <span>Agent analyzing candidate response &amp; structuring questions...</span>
                </div>
              )}
              <div ref={transcriptEndRef} />
            </div>

            {/* Candidate Response Simulation Input */}
            {callActive && (
              <div className="mt-3 pt-3 border-t border-stone-100 space-y-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-bold text-stone-600">
                    Quick candidate replies:
                  </span>
                  {quickResponses.map((qr, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendTurn(qr)}
                      className="px-2 py-1 text-[11px] bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-md font-medium text-left truncate max-w-xs cursor-pointer transition-colors"
                      title={qr}
                    >
                      {qr}
                    </button>
                  ))}
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendTurn();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={candidateInput}
                    onChange={(e) => setCandidateInput(e.target.value)}
                    placeholder={`Type candidate response or click a quick reply...`}
                    className="flex-1 px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                  <button
                    type="submit"
                    disabled={!candidateInput.trim() || isAgentThinking}
                    className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Reply</span>
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Intelligent Screening & Checklist Scorecard (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Automated Candidate Qualification Checklist */}
          <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs">
            <h3 className="font-bold text-sm text-stone-900 mb-3 flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-emerald-800" />
              <span>Automated Screening Checklist</span>
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-stone-50 border border-stone-100">
                <span className="text-stone-700">1. Candidate Identity &amp; Contact</span>
                <span className={`font-bold flex items-center gap-1 ${checklist.identityVerified ? 'text-emerald-700' : 'text-stone-400'}`}>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {checklist.identityVerified ? 'Verified' : 'Pending'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-stone-50 border border-stone-100">
                <span className="text-stone-700">2. Active Job Search Status</span>
                <span className={`font-bold flex items-center gap-1 ${checklist.activelyLooking ? 'text-emerald-700' : 'text-stone-400'}`}>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {checklist.activelyLooking ? 'Confirmed' : 'Unchecked'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-stone-50 border border-stone-100">
                <span className="text-stone-700">3. Relevant Experience Match</span>
                <span className={`font-bold flex items-center gap-1 ${checklist.experienceConfirmed ? 'text-emerald-700' : 'text-stone-400'}`}>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {checklist.experienceConfirmed ? 'Validated' : 'Unchecked'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-stone-50 border border-stone-100">
                <span className="text-stone-700">4. Location / Commute Fit</span>
                <span className={`font-bold flex items-center gap-1 ${checklist.locationConfirmed ? 'text-emerald-700' : 'text-stone-400'}`}>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {checklist.locationConfirmed ? 'Agreed' : 'Unchecked'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-stone-50 border border-stone-100">
                <span className="text-stone-700">5. Salary &amp; Notice Period</span>
                <span className={`font-bold flex items-center gap-1 ${checklist.noticePeriodChecked ? 'text-emerald-700' : 'text-stone-400'}`}>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {checklist.noticePeriodChecked ? 'Aligned' : 'Pending'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-stone-50 border border-stone-100">
                <span className="text-stone-700">6. Interview Readiness</span>
                <span className={`font-bold flex items-center gap-1 ${checklist.interviewAccepted ? 'text-emerald-700' : 'text-stone-400'}`}>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {checklist.interviewAccepted ? 'Ready' : 'Pending'}
                </span>
              </div>
            </div>

            {/* Score Meter */}
            <div className="mt-4 pt-4 border-t border-stone-100">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-stone-700">Screening Match Score</span>
                <span className="font-bold text-emerald-800">{screeningScore}%</span>
              </div>
              <div className="w-full bg-stone-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-emerald-600 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${screeningScore}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Call Outcome & Next Action */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-5 shadow-xs">
            <h4 className="font-bold text-xs uppercase tracking-wider text-amber-900 mb-2">
              Call Disposition &amp; Next Step
            </h4>
            <div className="text-xs text-stone-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-stone-600">Current Status:</span>
                <span className="font-bold text-emerald-900 bg-emerald-100/80 px-2 py-0.5 rounded">
                  {callDisposition}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-600">Branch Office:</span>
                <span className="font-semibold text-stone-900">Paras Complex, Durg, CG</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-600">Official Helpline:</span>
                <span className="font-mono font-bold text-stone-900">8269715615</span>
              </div>
            </div>

            {/* Direct Booking Button */}
            <div className="mt-4 pt-3 border-t border-amber-200/60">
              <button
                id="btn-schedule-from-call"
                onClick={() => {
                  if (currentCandidate) {
                    onScheduleInterview(
                      currentCandidate,
                      `AI Screener Notes: Verified candidate ${currentCandidate.name} for ${currentCandidate.designation}. Score: ${screeningScore}%. Ready for formal round.`
                    );
                  }
                }}
                className="w-full py-2.5 px-4 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
              >
                <Calendar className="w-4 h-4 text-amber-300" />
                <span>Book Formal Interview Slot Now</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

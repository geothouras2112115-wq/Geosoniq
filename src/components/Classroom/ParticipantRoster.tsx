import React, { useState } from 'react';
import { Users, MicOff, Hand, VolumeX, CheckCircle, Download, CheckCircle2, CalendarCheck, Clock, X } from 'lucide-react';
import { Participant, User } from '../../types';

interface ParticipantRosterProps {
  participants: Participant[];
  currentUser: User;
  onMuteAll: () => void;
  onLowerAllHands: () => void;
  onClose: () => void;
}

export const ParticipantRoster: React.FC<ParticipantRosterProps> = ({
  participants,
  currentUser,
  onMuteAll,
  onLowerAllHands,
  onClose,
}) => {
  const isTeacher = currentUser.role === 'teacher';
  const [activeTab, setActiveTab] = useState<'roster' | 'attendance'>('roster');

  const handleDownloadAttendanceCSV = () => {
    const csvRows = [
      ['Student / Participant Name', 'Role', 'Status', 'Join Time', 'Duration (Mins)', 'Attendance Score'],
      [currentUser.name, currentUser.role, 'Present (Host)', '10:00 AM', '45 mins', '100%'],
      ...participants.map((p, idx) => [
        p.name,
        p.role,
        'Present',
        `10:0${(idx + 1) * 2} AM`,
        `${40 - idx * 2} mins`,
        '100%'
      ])
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Attendance_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full h-full bg-white/5 backdrop-blur-lg border border-white/10 flex flex-col text-white rounded-3xl overflow-hidden shadow-2xl animate-fade-in">
      
      {/* Header Tabs */}
      <div className="p-3 border-b border-white/10 bg-white/5 flex items-center justify-between">
        <div className="flex items-center space-x-1 bg-black/40 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('roster')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'roster'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-white/70 hover:text-white'
            }`}
          >
            Roster ({participants.length + 1})
          </button>
          <button
            onClick={() => setActiveTab('attendance')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 ${
              activeTab === 'attendance'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-white/70 hover:text-white'
            }`}
          >
            <CalendarCheck className="w-3.5 h-3.5 inline" />
            <span>Attendance</span>
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleDownloadAttendanceCSV}
            className="p-1.5 bg-white/10 hover:bg-white/20 text-amber-300 rounded-xl transition-all"
            title="Export Attendance Sheet (CSV)"
          >
            <Download className="w-4 h-4" />
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white rounded-xl transition-all"
              title="Hide Roster Panel"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Moderation Toolbar for Instructor */}
      {isTeacher && activeTab === 'roster' && (
        <div className="p-3 bg-black/40 border-b border-white/10 flex items-center space-x-2">
          <button
            onClick={onMuteAll}
            className="flex-1 flex items-center justify-center space-x-1.5 py-1.5 px-3 bg-red-500/20 border border-red-400/40 text-red-200 hover:bg-red-500/30 rounded-xl text-xs font-semibold transition-all"
          >
            <VolumeX className="w-3.5 h-3.5" />
            <span>Mute All</span>
          </button>

          <button
            onClick={onLowerAllHands}
            className="flex-1 flex items-center justify-center space-x-1.5 py-1.5 px-3 bg-amber-500/20 border border-amber-400/40 text-amber-200 hover:bg-amber-500/30 rounded-xl text-xs font-semibold transition-all"
          >
            <Hand className="w-3.5 h-3.5" />
            <span>Lower Hands</span>
          </button>
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {activeTab === 'roster' ? (
          <>
            {/* You (Local User) */}
            <div className="p-3 bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img src={currentUser.avatar} alt={currentUser.name} className="w-9 h-9 rounded-full object-cover ring-2 ring-white/40" />
                <div>
                  <div className="font-semibold text-xs text-white flex items-center space-x-1.5">
                    <span>{currentUser.name}</span>
                    <span className="text-[10px] text-indigo-300 font-bold">(You)</span>
                  </div>
                  <span className="text-[10px] text-white/60 capitalize">{currentUser.role}</span>
                </div>
              </div>

              <span className="text-[10px] px-2 py-0.5 bg-emerald-500/20 text-emerald-300 font-bold rounded-md border border-emerald-400/30">
                Active
              </span>
            </div>

            {/* Remote Participants */}
            {participants.map((p) => (
              <div
                key={p.id}
                className="p-3 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl flex items-center justify-between hover:bg-white/15 transition-all"
              >
                <div className="flex items-center space-x-3">
                  <img src={p.avatar} alt={p.name} className="w-9 h-9 rounded-full object-cover ring-1 ring-white/20" />
                  <div>
                    <div className="font-semibold text-xs text-white flex items-center space-x-1.5">
                      <span>{p.name}</span>
                      {p.isHandRaised && (
                        <span className="text-amber-300" title="Hand Raised">
                          <Hand className="w-3.5 h-3.5 inline" />
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-white/60 capitalize">{p.role}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {p.isMuted ? (
                    <span className="p-1 bg-red-500/20 text-red-300 rounded-lg border border-red-500/30" title="Microphone Muted">
                      <MicOff className="w-3.5 h-3.5" />
                    </span>
                  ) : (
                    <span className="p-1 bg-emerald-500/20 text-emerald-300 rounded-lg border border-emerald-500/30" title="Microphone Unmuted">
                      <CheckCircle className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>
              </div>
            ))}
          </>
        ) : (
          /* Attendance Tracking View */
          <div className="space-y-3">
            <div className="p-3 bg-indigo-950/60 border border-indigo-400/30 rounded-2xl flex items-center justify-between text-xs">
              <div>
                <span className="text-amber-300 font-bold block">Live Class Attendance</span>
                <span className="text-white/70 text-[11px]">{participants.length + 1} / 28 Students Present (96.4%)</span>
              </div>
              <button
                onClick={handleDownloadAttendanceCSV}
                className="px-2.5 py-1 bg-amber-500 text-slate-950 font-bold rounded-lg text-[11px] shadow"
              >
                Export CSV
              </button>
            </div>

            <div className="space-y-2">
              <div className="p-3 bg-white/10 rounded-xl flex items-center justify-between text-xs border border-white/10">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <div className="font-bold text-white">{currentUser.name} (Host)</div>
                    <div className="text-[10px] text-white/60">Joined 10:00 AM • 45m active</div>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 bg-emerald-500/20 text-emerald-300 font-bold rounded">100%</span>
              </div>

              {participants.map((p, idx) => (
                <div key={p.id} className="p-3 bg-white/5 rounded-xl flex items-center justify-between text-xs border border-white/10">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <div className="font-bold text-white">{p.name}</div>
                      <div className="text-[10px] text-white/60">Joined 10:0{idx + 1} AM • {42 - idx * 2}m active</div>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 bg-emerald-500/20 text-emerald-300 font-bold rounded">100%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
};


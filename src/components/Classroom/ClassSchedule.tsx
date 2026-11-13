import React, { useState } from 'react';
import { Calendar, Clock, Video, Users, BookOpen, ChevronRight, CheckCircle2, AlertCircle, Sparkles, Filter, Plus } from 'lucide-react';
import { User } from '../../types';

interface ClassScheduleProps {
  currentUser: User;
  onJoinClass: (classId: string) => void;
  onOpenAITutor: (topic: string) => void;
}

export interface ScheduledClass {
  id: string;
  code: string;
  title: string;
  instructor: string;
  instructorAvatar: string;
  day: string;
  time: string;
  duration: string;
  room: string;
  status: 'live' | 'upcoming' | 'completed';
  enrolledStudents: number;
  description: string;
  topics: string[];
}

export const INITIAL_SCHEDULE: ScheduledClass[] = [
  {
    id: 'cls_01',
    code: 'CS-4820',
    title: 'Seismic Wave Spectral Analysis & Geophysics Simulation',
    instructor: 'Dr. Rajesh Bhardwaj',
    instructorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    day: 'Today (Mon, July 3)',
    time: '10:00 AM - 11:30 AM',
    duration: '90 Mins',
    room: 'Live Room #A1',
    status: 'live',
    enrolledStudents: 28,
    description: 'Interactive live session covering fast Fourier transforms in seismic data processing and mantle tomography.',
    topics: ['Spectral Analysis', 'Fast Fourier Transform', 'Mantle Wave Propagation'],
  },
  {
    id: 'cls_02',
    code: 'GEO-501',
    title: 'Subsurface Reservoir Modelling & Fluid Dynamics',
    instructor: 'Dr. Vikramaditya Singh',
    instructorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    day: 'Tomorrow (Tue, July 4)',
    time: '02:00 PM - 03:30 PM',
    duration: '90 Mins',
    room: 'Live Room #B3',
    status: 'upcoming',
    enrolledStudents: 34,
    description: 'Hands-on 3D simulation of subterranean aquifer flow and hydrodynamic pressure gradient mapping.',
    topics: ['3D Reservoir Grid', 'Darcy Law', 'Hydraulic Conductivity'],
  },
  {
    id: 'cls_03',
    code: 'HYD-302',
    title: 'Hydrology & Groundwater Table Mapping',
    instructor: 'Prof. Ananya Roy',
    instructorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
    day: 'Wed, July 5',
    time: '11:00 AM - 12:30 PM',
    duration: '90 Mins',
    room: 'Live Room #C2',
    status: 'upcoming',
    enrolledStudents: 22,
    description: 'Groundwater depletion analysis using satellite altimetry and gravimetric field sensors.',
    topics: ['Aquifer Recharge', 'Gravimetric Sensors', 'Contaminant Plume Model'],
  },
  {
    id: 'cls_04',
    code: 'ENV-404',
    title: 'Geothermal Energy Exploration & Heat Flow Dynamics',
    instructor: 'Dr. Rajesh Bhardwaj',
    instructorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    day: 'Thu, July 6',
    time: '04:00 PM - 05:30 PM',
    duration: '90 Mins',
    room: 'Live Room #A1',
    status: 'upcoming',
    enrolledStudents: 31,
    description: 'Volcanic heat gradient extraction and thermal conductivity in basaltic rock formations.',
    topics: ['Geothermal Gradient', 'Basalt Conductivity', 'Steam Extraction'],
  }
];

export const ClassSchedule: React.FC<ClassScheduleProps> = ({
  currentUser,
  onJoinClass,
  onOpenAITutor,
}) => {
  const [scheduleList, setScheduleList] = useState<ScheduledClass[]>(INITIAL_SCHEDULE);
  const [filterStatus, setFilterStatus] = useState<'all' | 'live' | 'upcoming'>('all');
  const [selectedDay, setSelectedDay] = useState<string>('all');

  const filteredSchedule = scheduleList.filter((c) => {
    if (filterStatus !== 'all' && c.status !== filterStatus) return false;
    if (selectedDay !== 'all' && !c.day.toLowerCase().includes(selectedDay.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 animate-fade-in text-white">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-white/20 rounded-3xl shadow-2xl backdrop-blur-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-400/30 rounded-full text-xs font-bold">
            <Calendar className="w-3.5 h-3.5" />
            <span>Academic Timetable & Live Stream Schedule</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Class Schedule & Live Timetable
          </h1>
          <p className="text-xs text-white/70 max-w-xl">
            Never miss a live interactive lecture. Review upcoming sessions, join active classes with one click, or ask AI Tutor to generate study prep guides.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => onOpenAITutor('Prepare a weekly study timetable and review guide for CS-4820 & GEO-501')}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold rounded-2xl text-xs shadow-lg transition-all flex items-center space-x-2 active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>AI Schedule Planner</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
        <div className="flex items-center space-x-2 overflow-x-auto w-full sm:w-auto">
          <Filter className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="text-xs font-bold text-white/70 mr-2">Status:</span>
          {(['all', 'live', 'upcoming'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                filterStatus === st
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              {st === 'all' ? 'All Classes' : st}
            </button>
          ))}
        </div>

        <div className="text-xs text-white/60 font-medium">
          Showing <strong>{filteredSchedule.length}</strong> scheduled sessions
        </div>
      </div>

      {/* Schedule Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSchedule.map((cls) => (
          <div
            key={cls.id}
            className={`p-5 rounded-3xl border transition-all duration-300 flex flex-col justify-between shadow-xl relative overflow-hidden backdrop-blur-xl ${
              cls.status === 'live'
                ? 'bg-gradient-to-br from-indigo-950 via-slate-900 to-blue-950 border-amber-400/50 ring-2 ring-amber-400/20'
                : 'bg-white/10 border-white/15 hover:border-white/30'
            }`}
          >
            {/* Live Indicator Badge */}
            {cls.status === 'live' && (
              <div className="absolute top-4 right-4 px-3 py-1 bg-red-600 text-white font-extrabold text-[10px] rounded-full uppercase tracking-wider animate-pulse flex items-center space-x-1.5 shadow-lg">
                <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                <span>Live Stream Active</span>
              </div>
            )}

            <div>
              {/* Header Info */}
              <div className="flex items-center space-x-2 text-xs text-amber-300 font-extrabold mb-2">
                <span className="px-2.5 py-0.5 bg-amber-400/20 rounded-md border border-amber-400/30 font-mono">
                  {cls.code}
                </span>
                <span>•</span>
                <span className="text-white/80">{cls.room}</span>
              </div>

              <h2 className="text-lg font-bold text-white mb-2 leading-snug">
                {cls.title}
              </h2>

              <p className="text-xs text-white/70 mb-4 line-clamp-2">
                {cls.description}
              </p>

              {/* Topics Tags */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {cls.topics.map((tp, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 bg-white/10 text-white/80 rounded-lg text-[10px] font-semibold border border-white/10"
                  >
                    #{tp}
                  </span>
                ))}
              </div>
            </div>

            {/* Bottom Meta & Action */}
            <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
              
              {/* Instructor & Time */}
              <div className="flex items-center space-x-3">
                <img
                  src={cls.instructorAvatar}
                  alt={cls.instructor}
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-amber-400/40"
                />
                <div>
                  <div className="font-bold text-white text-xs">{cls.instructor}</div>
                  <div className="text-[11px] text-white/60 flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-amber-300 inline" />
                    <span>{cls.day} ({cls.time})</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div>
                {cls.status === 'live' ? (
                  <button
                    onClick={() => onJoinClass(cls.id)}
                    className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-extrabold rounded-2xl text-xs shadow-lg transition-all hover:scale-105 flex items-center space-x-1.5 active:scale-95"
                  >
                    <Video className="w-4 h-4 text-slate-950" />
                    <span>Join Class Live Now</span>
                  </button>
                ) : (
                  <button
                    onClick={() => onOpenAITutor(`Give me key preparation notes for ${cls.code}: ${cls.title}`)}
                    className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-2xl text-xs border border-white/20 transition-all flex items-center space-x-1"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-amber-300" />
                    <span>Pre-Class Prep</span>
                  </button>
                )}
              </div>

            </div>

          </div>
        ))}
      </div>

    </div>
  );
};

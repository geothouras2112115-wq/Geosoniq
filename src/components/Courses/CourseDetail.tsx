import React, { useState, useRef } from 'react';
import { Course, SyllabusItem, VaultFile, User } from '../../types';
import { ArrowLeft, Play, Pause, Volume2, VolumeX, Maximize, CheckCircle2, Circle, Sparkles, FileText, Upload, Clock, Download, Layers } from 'lucide-react';

interface CourseDetailProps {
  course: Course;
  currentUser: User;
  onBack: () => void;
  onOpenAITutor: (topic: string) => void;
  onAddFileToVault: (file: VaultFile) => void;
}

export const CourseDetail: React.FC<CourseDetailProps> = ({
  course,
  currentUser,
  onBack,
  onOpenAITutor,
  onAddFileToVault,
}) => {
  const [activeSyllabus, setActiveSyllabus] = useState<SyllabusItem>(course.syllabus[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [assignmentSubmitted, setAssignmentSubmitted] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement>(null);

  const currentVideoUrl = activeSyllabus.videoUrl || course.featuredVideoUrl;

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleSimulatedFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const newAssignmentFile: VaultFile = {
      id: `assign_${Date.now()}`,
      name: `Submission_${course.code}_${file.name}`,
      sizeBytes: file.size,
      type: file.name.split('.').pop() || 'pdf',
      category: 'assignments',
      uploadDate: new Date().toISOString().slice(0, 10),
      uploaderName: currentUser.name,
      uploaderRole: currentUser.role,
      allowedRoles: ['teacher', 'student'],
      url: URL.createObjectURL(file),
      starred: false,
      downloadCount: 0,
      tags: ['Homework', 'Assignment Submission'],
    };

    onAddFileToVault(newAssignmentFile);
    setAssignmentSubmitted(true);
    setTimeout(() => setAssignmentSubmitted(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fade-in">
      
      {/* Top Back Action Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-semibold transition-all backdrop-blur-md"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Courses</span>
        </button>

        <button
          onClick={() => onOpenAITutor(`${course.title} - ${activeSyllabus.title}`)}
          className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl font-semibold text-xs transition-all shadow-md backdrop-blur-md"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Explain Lesson with AI Tutor</span>
        </button>
      </div>

      {/* Video Player + Lesson Information Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Main Video Player */}
        <div className="lg:col-span-2 space-y-4">
          
          <div className="relative bg-black/50 backdrop-blur-md rounded-3xl overflow-hidden border border-white/20 shadow-2xl group">
            <video
              ref={videoRef}
              src={currentVideoUrl}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              className="w-full aspect-video object-cover"
            />

            {/* Custom Floating Video Controls Overlay */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 opacity-100 sm:opacity-90 hover:opacity-100 transition-opacity flex items-center justify-between gap-4">
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={togglePlay}
                  className="p-2.5 bg-blue-500 text-white rounded-xl shadow-md hover:bg-blue-600 border border-blue-400 transition-all"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                </button>

                <button
                  onClick={toggleMute}
                  className="p-2 text-white/80 hover:text-white"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </div>

              {/* Title indicator */}
              <div className="truncate text-xs text-white/90 font-medium hidden sm:block">
                {activeSyllabus.title}
              </div>

              {/* Playback Speed Switcher */}
              <div className="flex items-center space-x-1 bg-black/60 backdrop-blur-md p-1 rounded-xl border border-white/15 text-[11px]">
                {[0.5, 1, 1.25, 1.5, 2].map((speed) => (
                  <button
                    key={speed}
                    onClick={() => handleSpeedChange(speed)}
                    className={`px-2 py-0.5 rounded-lg font-bold transition-all ${
                      playbackSpeed === speed
                        ? 'bg-white/20 text-white border border-white/20'
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>

            </div>
          </div>

          {/* Active Lesson Description */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-3xl space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-300 bg-amber-500/20 border border-amber-400/30 px-3 py-1 rounded-full">
                {course.code} • Module {course.syllabus.findIndex((s) => s.id === activeSyllabus.id) + 1}
              </span>
              <span className="text-xs text-white/60 flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{activeSyllabus.duration}</span>
              </span>
            </div>

            <h2 className="text-xl font-bold text-white">{activeSyllabus.title}</h2>
            <p className="text-xs text-white/80 leading-relaxed">{course.description}</p>

            <div className="flex items-center space-x-3 pt-3 border-t border-white/10">
              <img
                src={course.instructorAvatar}
                alt={course.instructor}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-white/30"
              />
              <div>
                <div className="text-xs font-bold text-white">{course.instructor}</div>
                <div className="text-[11px] text-white/60">Lead Course Instructor</div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Col: Syllabus Accordion & Assignment Submission */}
        <div className="space-y-6">
          
          {/* Syllabus Modules List */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-sm text-white flex items-center space-x-2">
                <Layers className="w-4 h-4 text-indigo-300" />
                <span>Course Syllabus Modules</span>
              </h3>
              <span className="text-xs text-indigo-300 font-bold">
                {course.syllabus.length} Modules
              </span>
            </div>

            <div className="space-y-2.5">
              {course.syllabus.map((syl, index) => (
                <button
                  key={syl.id}
                  onClick={() => setActiveSyllabus(syl)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                    activeSyllabus.id === syl.id
                      ? 'bg-white/20 border-white/30 text-white backdrop-blur-md shadow-md'
                      : 'bg-black/30 border-white/10 text-white/80 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-start space-x-3 truncate">
                    {syl.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <Circle className="w-4 h-4 text-white/40 shrink-0 mt-0.5" />
                    )}
                    <div className="truncate">
                      <div className="text-xs font-semibold truncate">{syl.title}</div>
                      <div className="text-[10px] text-white/50 mt-0.5">{syl.duration}</div>
                    </div>
                  </div>

                  {activeSyllabus.id === syl.id && (
                    <span className="text-[10px] bg-white/20 text-white border border-white/30 px-2 py-0.5 rounded-md font-bold shrink-0">
                      Playing
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Student Assignment Submission Box */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-5 space-y-3 shadow-xl">
            <div className="flex items-center space-x-2 text-white font-bold text-sm">
              <Upload className="w-4 h-4 text-emerald-400" />
              <span>Submit Course Assignment</span>
            </div>
            <p className="text-xs text-white/70">
              Upload your solution PDF, code ZIP, or notes to the course instructor. Saved automatically in the Class Vault.
            </p>

            <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-white/20 hover:border-white/40 rounded-2xl cursor-pointer bg-black/30 transition-all text-center">
              <FileText className="w-6 h-6 text-indigo-300 mb-1" />
              <span className="text-xs font-semibold text-white">
                {assignmentSubmitted ? '✓ Assignment Uploaded!' : 'Click or Drag File to Submit'}
              </span>
              <span className="text-[10px] text-white/50 mt-0.5">Supports PDF, ZIP, PY, DOCX (Max 50MB)</span>

              <input
                type="file"
                className="hidden"
                onChange={handleSimulatedFileUpload}
              />
            </label>
          </div>

        </div>

      </div>

    </div>
  );
};

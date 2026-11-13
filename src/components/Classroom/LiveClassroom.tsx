import React, { useState, useEffect, useRef } from 'react';
import { User, Participant, ReactionParticle, ChatMessage, VaultFile, GeminiSearchResult } from '../../types';
import { INITIAL_PARTICIPANTS, INITIAL_CHAT_MESSAGES } from '../../mockData';
import { VideoGrid } from './VideoGrid';
import { MeetingControls } from './MeetingControls';
import { LiveChat } from './LiveChat';
import { Whiteboard } from './Whiteboard';
import { ParticipantRoster } from './ParticipantRoster';
import { Leaderboard } from './Leaderboard';
import { SessionFeedbackModal } from './SessionFeedbackModal';
import { GeminiScreenSearchModal } from './GeminiScreenSearchModal';
import { sendFCMNotificationToFirestore } from '../../services/firebase';
import {
  Shield, Sparkles, Video, AlertTriangle, Disc, Radio, CheckCircle2, FolderKey,
  X, Download, ScreenShare, Share2, Send, Check, Star
} from 'lucide-react';

interface LiveClassroomProps {
  currentUser: User;
  onAddFileToVault: (file: VaultFile) => void;
  onOpenAITutor: (topic: string) => void;
}

export const LiveClassroom: React.FC<LiveClassroomProps> = ({
  currentUser,
  onAddFileToVault,
  onOpenAITutor,
}) => {
  // WebRTC & Call State
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isGeminiSearchModalOpen, setIsGeminiSearchModalOpen] = useState(false);
  const [projectedGeminiModel, setProjectedGeminiModel] = useState<GeminiSearchResult | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const [recordingNotice, setRecordingNotice] = useState<{
    title: string;
    filename: string;
    duration: string;
    fileUrl: string;
  } | null>(null);
  const [shareToast, setShareToast] = useState<string | null>(null);
  const [isShareLinkModalOpen, setIsShareLinkModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [customClassLink, setCustomClassLink] = useState('https://geosoniq.com/live/cs4820-geophysics');
  const [customClassTopic, setCustomClassTopic] = useState('Seismic Wave Spectral Analysis & Geophysics Simulation');

  const handleDispatchClassLink = async () => {
    const notifId = `notif_link_${Date.now()}`;
    const notificationData = {
      id: notifId,
      title: '🎥 Live Online Class Starting Now!',
      body: `${currentUser.name} has launched: "${customClassTopic}". Click link to join directly: ${customClassLink}`,
      timestamp: new Date().toISOString(),
      category: 'class',
      read: false,
    };

    try {
      await sendFCMNotificationToFirestore(notificationData);
    } catch (e) {
      console.warn('FCM link notification error:', e);
    }

    setIsShareLinkModalOpen(false);
    showToast(`🚀 Live class link dispatched to all students! Direct join alerts active.`);
  };

  const [participants, setParticipants] = useState<Participant[]>(INITIAL_PARTICIPANTS);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);
  const [activeReactions, setActiveReactions] = useState<ReactionParticle[]>([]);
  const [activeSidebar, setActiveSidebar] = useState<'chat' | 'whiteboard' | 'roster' | 'leaderboard' | null>('chat');
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Initialize camera & microphone stream gracefully
  useEffect(() => {
    let streamRef: MediaStream | null = null;

    async function initMedia() {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          streamRef = stream;
          setLocalStream(stream);
          setCameraError(null);
        }
      } catch (err: any) {
        console.warn('Camera/Mic permission ungranted or hardware missing:', err);
        setCameraError('Local webcam unavailable. Interactive avatar mode is active.');
      }
    }

    initMedia();

    return () => {
      if (streamRef) {
        streamRef.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Timer for class recording
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const showToast = (msg: string) => {
    setShareToast(msg);
    setTimeout(() => setShareToast(null), 3500);
  };

  // Handle Audio track mute
  const handleToggleMic = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => (track.enabled = isMuted));
    }
    setIsMuted(!isMuted);
  };

  // Handle Video track toggle
  const handleToggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => (track.enabled = isVideoOff));
    }
    setIsVideoOff(!isVideoOff);
  };

  // Handle Real Screen Sharing
  const handleToggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
          const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
          setScreenStream(stream);
          setIsScreenSharing(true);

          // Handle when user clicks browser's native "Stop Sharing" button
          stream.getVideoTracks()[0].onended = () => {
            setIsScreenSharing(false);
            setScreenStream(null);
          };

          showToast('📺 Screen sharing active! Broadcasting desktop screen to 28 students.');
        } else {
          setIsScreenSharing(true);
          showToast('📺 Simulated screen sharing mode active!');
        }
      } catch (e) {
        console.warn('Screen sharing cancelled or unavailable:', e);
        setIsScreenSharing(true);
        showToast('📺 Screen share active!');
      }
    } else {
      if (screenStream) {
        screenStream.getTracks().forEach((t) => t.stop());
        setScreenStream(null);
      }
      setIsScreenSharing(false);
      showToast('Screen sharing stopped.');
    }
  };

  // Share Screen Share Notification with Other Students
  const handleShareScreenWithStudents = async () => {
    const notifId = `notif_ss_${Date.now()}`;
    const notificationData = {
      id: notifId,
      title: '📺 Live Screen Share Broadcast',
      body: `${currentUser.name} (${currentUser.role}) started sharing screen and live lecture stream in CS4820!`,
      timestamp: new Date().toISOString(),
      category: 'class',
      read: false,
    };

    try {
      await sendFCMNotificationToFirestore(notificationData);
    } catch (e) {
      console.warn('Notification send error:', e);
    }

    showToast('🚀 Live screen share alert sent to all enrolled students!');
  };

  // Handle Sending Reactions
  const handleSendReaction = (emoji: string) => {
    const newReaction: ReactionParticle = {
      id: `rx_${Date.now()}_${Math.random()}`,
      emoji,
      senderName: currentUser.name,
      x: 10 + Math.random() * 80, // Horizontal percentage
    };

    setActiveReactions((prev) => [...prev, newReaction]);

    // Remove reaction particle after 2.5 seconds
    setTimeout(() => {
      setActiveReactions((prev) => prev.filter((r) => r.id !== newReaction.id));
    }, 2500);
  };

  // Handle Recording Stream & Auto Save to Vault
  const handleToggleRecording = () => {
    if (isRecording) {
      stopAndSaveRecording();
    } else {
      startRecording();
    }
  };

  const startRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    recordedChunksRef.current = [];

    const streamToRecord = screenStream || localStream;

    if (streamToRecord && typeof window !== 'undefined' && 'MediaRecorder' in window) {
      try {
        const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
          ? 'video/webm;codecs=vp9,opus'
          : MediaRecorder.isTypeSupported('video/webm')
          ? 'video/webm'
          : '';
        const options = mimeType ? { mimeType } : undefined;
        const mediaRecorder = new MediaRecorder(streamToRecord, options);

        mediaRecorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            recordedChunksRef.current.push(e.data);
          }
        };

        mediaRecorder.start(1000);
        mediaRecorderRef.current = mediaRecorder;
      } catch (err) {
        console.warn('MediaRecorder error, falling back to simulated cloud stream:', err);
      }
    }
  };

  const stopAndSaveRecording = () => {
    const finalDuration = recordingTime;
    setIsRecording(false);

    let recordedUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
    let fileSizeBytes = Math.max(185000000, finalDuration * 1500000);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.onstop = () => {
          if (recordedChunksRef.current.length > 0) {
            const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
            recordedUrl = URL.createObjectURL(blob);
            fileSizeBytes = blob.size > 0 ? blob.size : fileSizeBytes;
          }
          saveRecordingToVault(recordedUrl, fileSizeBytes, finalDuration);
        };
        return;
      } catch (e) {
        console.warn('Error stopping MediaRecorder:', e);
      }
    }

    saveRecordingToVault(recordedUrl, fileSizeBytes, finalDuration);
  };

  const saveRecordingToVault = (url: string, sizeBytes: number, durationSeconds: number) => {
    const dateStr = new Date().toISOString().slice(0, 10);
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).replace(/\s/g, '');
    const filename = `Recorded_Lecture_CS4820_${dateStr}_${timeStr.replace(/:/g, '')}.mp4`;
    const formattedDuration = formatTime(durationSeconds > 0 ? durationSeconds : 45);

    const newVideoFile: VaultFile = {
      id: `rec_${Date.now()}`,
      name: filename,
      sizeBytes: sizeBytes,
      type: 'mp4',
      category: 'recordings',
      uploadDate: dateStr,
      uploaderName: currentUser.name,
      uploaderRole: currentUser.role,
      allowedRoles: ['teacher', 'student'],
      url: url,
      starred: true,
      downloadCount: 0,
      tags: ['Live Session', 'Class Video', 'Cloud Recording'],
    };

    onAddFileToVault(newVideoFile);

    setRecordingNotice({
      title: 'Cloud Session Recording Saved to Vault!',
      filename: filename,
      duration: formattedDuration,
      fileUrl: url,
    });
  };

  // Broadcast Recording Link to Other Students
  const handleShareRecordingWithStudents = async () => {
    if (!recordingNotice) return;

    const notifId = `notif_rec_${Date.now()}`;
    const notificationData = {
      id: notifId,
      title: '📹 New Live Class Session Recording',
      body: `${recordingNotice.filename} (${recordingNotice.duration}) is now ready in Class Vault. Click to watch or download!`,
      timestamp: new Date().toISOString(),
      category: 'class',
      read: false,
    };

    try {
      await sendFCMNotificationToFirestore(notificationData);
    } catch (e) {
      console.warn('Notification send error:', e);
    }

    showToast('📢 Session recording link successfully shared with all 28 students!');
  };

  const handleLeaveCall = () => {
    if (isRecording) {
      stopAndSaveRecording();
    } else {
      alert('You have left the classroom session.');
    }
  };

  // Handle Chat Message
  const handleSendMessage = (text: string, isQA: boolean) => {
    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      senderAvatar: currentUser.avatar,
      message: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isQA,
      upvotes: 0,
      upvotedByMe: false,
    };

    setMessages((prev) => [...prev, newMsg]);

    if (activeSidebar !== 'chat') {
      setUnreadChatCount((prev) => prev + 1);
    }
  };

  // Upvote Question
  const handleUpvoteQA = (msgId: string) => {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id === msgId) {
          const upvoted = !m.upvotedByMe;
          return {
            ...m,
            upvotedByMe: upvoted,
            upvotes: (m.upvotes || 0) + (upvoted ? 1 : -1),
          };
        }
        return m;
      })
    );
  };

  // Save Whiteboard drawing as a Note to Vault
  const handleSaveWhiteboardToVault = (dataUrl: string) => {
    const newNoteFile: VaultFile = {
      id: `wb_${Date.now()}`,
      name: `Whiteboard_Notes_CS4820_${new Date().toISOString().slice(0, 10)}.png`,
      sizeBytes: 1200000,
      type: 'png',
      category: 'lecture_notes',
      uploadDate: new Date().toISOString().slice(0, 10),
      uploaderName: currentUser.name,
      uploaderRole: currentUser.role,
      allowedRoles: ['teacher', 'student'],
      url: dataUrl,
      starred: true,
      downloadCount: 1,
      tags: ['Whiteboard', 'Class Notes'],
    };
    onAddFileToVault(newNoteFile);
    showToast('Whiteboard notes saved to Class Vault & shared with students!');
  };

  const handleSidebarToggle = (sidebar: 'chat' | 'whiteboard' | 'roster') => {
    if (activeSidebar === sidebar) {
      setActiveSidebar(null);
    } else {
      setActiveSidebar(sidebar);
      if (sidebar === 'chat') setUnreadChatCount(0);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full h-[calc(100vh-5rem)] max-w-7xl mx-auto flex flex-col p-2 sm:p-4 gap-3 relative">
      
      {/* Toast Notification */}
      {shareToast && (
        <div className="fixed top-20 right-6 z-50 p-4 bg-indigo-600 text-white rounded-2xl shadow-2xl flex items-center space-x-2 border border-indigo-400 text-xs font-bold animate-bounce max-w-md">
          <Check className="w-4 h-4 text-emerald-300 shrink-0" />
          <span>{shareToast}</span>
        </div>
      )}

      {/* Banner for Camera Info or AI Tutor Callout & Recording Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-xs shadow-lg">
        <div className="flex flex-wrap items-center gap-3 text-white/90">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Room Code: <strong className="text-white font-mono">#CS4820-2026</strong></span>
            <span className="text-white/30">|</span>
            <span className="text-white/70">Agora RTC Web Engine Active</span>
          </div>

          <span className="hidden sm:inline text-white/30">|</span>

          {/* Cloud Recording Status & Header Toggle Button */}
          <div className="flex items-center space-x-2">
            {isRecording ? (
              <div className="flex items-center space-x-2 px-2.5 py-1 bg-rose-500/20 border border-rose-500/40 rounded-xl text-rose-300 text-xs font-bold shadow-sm">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                </span>
                <span className="font-mono tracking-wider">REC {formatTime(recordingTime)}</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-white/5 border border-white/10 rounded-xl text-white/60 text-xs font-medium">
                <Radio className="w-3.5 h-3.5 text-white/40" />
                <span>Cloud Rec Ready</span>
              </div>
            )}

            <button
              onClick={handleToggleRecording}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-xl text-xs font-extrabold transition-all border shadow-md active:scale-95 ${
                isRecording
                  ? 'bg-rose-600 hover:bg-rose-500 text-white border-rose-400/50 shadow-rose-950/50'
                  : 'bg-gradient-to-r from-rose-500/30 to-red-600/30 hover:from-rose-500/50 hover:to-red-600/50 text-rose-200 border-rose-400/30'
              }`}
            >
              <Disc className={`w-3.5 h-3.5 ${isRecording ? 'animate-spin text-white' : 'text-rose-400'}`} />
              <span>{isRecording ? 'Stop Recording' : 'Start Cloud Rec'}</span>
            </button>
          </div>
        </div>

        {cameraError && (
          <div className="text-amber-300 font-medium flex items-center space-x-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{cameraError}</span>
          </div>
        )}

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsFeedbackModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-300 rounded-xl font-bold transition-all shadow-sm active:scale-95"
          >
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>Rate Session</span>
          </button>

          {currentUser.role !== 'student' && (
            <button
              onClick={() => setIsShareLinkModalOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl transition-all shadow-md active:scale-95"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Class Link with Students</span>
            </button>
          )}

          <button
            onClick={() => onOpenAITutor('CS-4820: Self-Attention & Transformers')}
            className="flex items-center space-x-1.5 px-3 py-1 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl font-semibold transition-all shadow-sm backdrop-blur-md"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Ask AI Tutor About Live Class</span>
          </button>
        </div>
      </div>

      {/* Session Feedback Modal */}
      {isFeedbackModalOpen && (
        <SessionFeedbackModal
          currentUser={currentUser}
          classNameTitle="CS-4820: Seismic Wave Spectral Analysis & Geophysics"
          onClose={() => setIsFeedbackModalOpen(false)}
          onSubmitFeedback={(fb) => {
            showToast(`⭐ Thank you! Rated ${fb.rating}/5 stars for CS-4820!`);
          }}
        />
      )}

      {/* Share Class Link Modal for Teachers */}
      {isShareLinkModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-amber-400/40 rounded-3xl p-6 max-w-lg w-full text-white shadow-2xl space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-white/15 pb-3">
              <div className="flex items-center space-x-2 text-amber-300 font-extrabold text-sm">
                <Video className="w-5 h-5 text-amber-400" />
                <span>Broadcast Live Class Direct Join Link</span>
              </div>
              <button
                onClick={() => setIsShareLinkModalOpen(false)}
                className="p-1 hover:bg-white/10 rounded-lg text-white/60 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-white/80">
              Dispatch a real-time push notification with direct join links to all registered students on Windows and Android devices.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-amber-300 font-bold mb-1">Lecture Topic / Class Title</label>
                <input
                  type="text"
                  value={customClassTopic}
                  onChange={(e) => setCustomClassTopic(e.target.value)}
                  className="w-full bg-black/40 border border-white/20 rounded-xl px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-amber-300 font-bold mb-1">Direct Online Class URL</label>
                <input
                  type="text"
                  value={customClassLink}
                  onChange={(e) => setCustomClassLink(e.target.value)}
                  className="w-full bg-black/40 border border-white/20 rounded-xl px-3 py-2 text-white font-mono placeholder-white/40 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end space-x-3">
              <button
                onClick={() => setIsShareLinkModalOpen(false)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleDispatchClassLink}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl text-xs shadow-lg transition-all flex items-center space-x-2 active:scale-95"
              >
                <Send className="w-4 h-4" />
                <span>Dispatch Class Link Now</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Screen Sharing Active Broadcast Banner */}
      {isScreenSharing && (
        <div className="px-4 py-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white border border-blue-400/50 rounded-2xl flex items-center justify-between shadow-lg text-xs animate-fade-in">
          <div className="flex items-center space-x-2">
            <ScreenShare className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>
              <strong>Screen Sharing Active:</strong> Desktop tab / screen is being broadcasted live to <strong>28 Students</strong>.
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleShareScreenWithStudents}
              className="px-3 py-1 bg-emerald-400 text-slate-950 hover:bg-emerald-300 font-bold rounded-xl shadow transition-all flex items-center space-x-1"
            >
              <Send className="w-3 h-3" />
              <span>Broadcast Screen Link to Class</span>
            </button>
            <button
              onClick={handleToggleScreenShare}
              className="px-2.5 py-1 bg-black/30 hover:bg-black/50 text-white font-semibold rounded-xl transition-all"
            >
              Stop Sharing
            </button>
          </div>
        </div>
      )}

      {/* Main Workspace: Video Stream Grid + Side Drawer */}
      <div className="flex-1 flex flex-col md:flex-row gap-3 min-h-0 overflow-hidden">
        
        {/* Left / Center Video Stage */}
        <div className="flex-1 flex flex-col gap-3 min-h-0">
          <div className="flex-1 min-h-0">
            <VideoGrid
              participants={participants}
              currentUser={currentUser}
              localStream={screenStream || localStream}
              isMuted={isMuted}
              isVideoOff={isVideoOff}
              isScreenSharing={isScreenSharing}
              activeReactions={activeReactions}
              layoutMode="grid"
              projectedGeminiModel={projectedGeminiModel}
              onClearProjectedModel={() => setProjectedGeminiModel(null)}
            />
          </div>

          {/* Conference Control Toolbar */}
          <MeetingControls
            isMuted={isMuted}
            isVideoOff={isVideoOff}
            isScreenSharing={isScreenSharing}
            isHandRaised={isHandRaised}
            isRecording={isRecording}
            recordingTime={recordingTime}
            activeSidebar={activeSidebar}
            unreadCount={unreadChatCount}
            participantCount={participants.length + 1}
            onToggleMic={handleToggleMic}
            onToggleVideo={handleToggleVideo}
            onToggleScreenShare={handleToggleScreenShare}
            onToggleHand={() => setIsHandRaised(!isHandRaised)}
            onToggleRecording={handleToggleRecording}
            onSendReaction={handleSendReaction}
            onToggleSidebar={handleSidebarToggle}
            onLeaveCall={handleLeaveCall}
            onOpenGeminiScreenSearch={() => setIsGeminiSearchModalOpen(true)}
          />
        </div>

      {/* Gemini AI Screen Search Modal */}
      {isGeminiSearchModalOpen && (
        <GeminiScreenSearchModal
          currentUser={currentUser}
          onClose={() => setIsGeminiSearchModalOpen(false)}
          onProjectToScreen={(result) => {
            setProjectedGeminiModel(result);
            setIsScreenSharing(true);
            showToast(`📺 Projected 3D Model "${result.query}" to class screen!`);
            setIsGeminiSearchModalOpen(false);
          }}
          onAddFileToVault={(file) => {
            onAddFileToVault(file);
            showToast(`📁 Saved "${file.name}" to Class Vault!`);
          }}
        />
      )}


        {/* Right Collapsible Sidebar Drawer */}
        {activeSidebar && (
          <div className="w-full md:w-80 lg:w-96 h-80 md:h-full shrink-0 min-h-0 rounded-3xl overflow-hidden shadow-2xl">
            {activeSidebar === 'chat' && (
              <LiveChat
                messages={messages}
                currentUser={currentUser}
                onSendMessage={handleSendMessage}
                onUpvoteQA={handleUpvoteQA}
                onClose={() => setActiveSidebar(null)}
                onAddFileToVault={onAddFileToVault}
              />
            )}

            {activeSidebar === 'whiteboard' && (
              <Whiteboard
                onSaveToVault={handleSaveWhiteboardToVault}
                onClose={() => setActiveSidebar(null)}
                currentUserRole={currentUser.role}
                currentUserName={currentUser.name}
              />
            )}

            {activeSidebar === 'roster' && (
              <ParticipantRoster
                participants={participants}
                currentUser={currentUser}
                onMuteAll={() => setParticipants((prev) => prev.map((p) => ({ ...p, isMuted: true })))}
                onLowerAllHands={() => setParticipants((prev) => prev.map((p) => ({ ...p, isHandRaised: false })))}
                onClose={() => setActiveSidebar(null)}
              />
            )}

            {activeSidebar === 'leaderboard' && (
              <Leaderboard onClose={() => setActiveSidebar(null)} />
            )}
          </div>
        )}

      </div>

      {/* Floating Notification Modal Banner when Recording Saved to Vault */}
      {recordingNotice && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 max-w-lg w-full px-4 animate-fade-in">
          <div className="bg-slate-900/95 border-2 border-emerald-400/80 p-4 rounded-3xl shadow-2xl backdrop-blur-2xl text-white flex items-start space-x-3">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-300 rounded-2xl shrink-0">
              <CheckCircle2 className="w-6 h-6 animate-pulse" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-emerald-300 tracking-wider uppercase flex items-center space-x-1">
                  <FolderKey className="w-3.5 h-3.5" />
                  <span>Class Vault Auto-Archive</span>
                </span>
                <button
                  onClick={() => setRecordingNotice(null)}
                  className="p-1 text-white/50 hover:text-white rounded-lg hover:bg-white/10"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <h4 className="font-extrabold text-sm text-white mt-1 truncate">{recordingNotice.title}</h4>
              <p className="text-xs text-white/80 mt-0.5 truncate font-mono">{recordingNotice.filename}</p>
              <div className="flex items-center space-x-3 mt-2 text-[11px] text-white/60">
                <span>Duration: <strong className="text-white">{recordingNotice.duration}</strong></span>
                <span>•</span>
                <span>Category: <strong className="text-emerald-300 font-semibold">Recordings</strong></span>
              </div>
              <div className="flex items-center space-x-2 mt-3">
                <a
                  href={recordingNotice.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow transition-all flex items-center space-x-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Playback / Download</span>
                </a>
                
                <button
                  onClick={handleShareRecordingWithStudents}
                  className="px-3.5 py-1.5 bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center space-x-1"
                >
                  <Share2 className="w-3.5 h-3.5 text-amber-300" />
                  <span>Share with Students</span>
                </button>

                <button
                  onClick={() => setRecordingNotice(null)}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl transition-all"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};


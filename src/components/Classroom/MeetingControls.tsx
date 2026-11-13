import React, { useState } from 'react';
import {
  Mic, MicOff, Video, VideoOff, ScreenShare, Hand, Smile, CircleDot,
  PenTool, MessageSquare, Users, PhoneOff, Layers, Sparkles, Box, Trophy
} from 'lucide-react';

interface MeetingControlsProps {
  isMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
  isHandRaised: boolean;
  isRecording: boolean;
  recordingTime: number;
  activeSidebar: 'chat' | 'whiteboard' | 'roster' | 'leaderboard' | null;
  unreadCount: number;
  participantCount: number;
  onToggleMic: () => void;
  onToggleVideo: () => void;
  onToggleScreenShare: () => void;
  onToggleHand: () => void;
  onToggleRecording: () => void;
  onSendReaction: (emoji: string) => void;
  onToggleSidebar: (sidebar: 'chat' | 'whiteboard' | 'roster' | 'leaderboard') => void;
  onLeaveCall: () => void;
  onOpenGeminiScreenSearch?: () => void;
}

export const MeetingControls: React.FC<MeetingControlsProps> = ({
  isMuted,
  isVideoOff,
  isScreenSharing,
  isHandRaised,
  isRecording,
  recordingTime,
  activeSidebar,
  unreadCount,
  participantCount,
  onToggleMic,
  onToggleVideo,
  onToggleScreenShare,
  onToggleHand,
  onToggleRecording,
  onSendReaction,
  onToggleSidebar,
  onLeaveCall,
  onOpenGeminiScreenSearch,
}) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const emojis = ['👏', '❤️', '🙋‍♂️', '💡', '🔥', '🎉', '💯', '👍'];

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative z-30 flex items-center justify-between bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/20 shadow-2xl">
      
      {/* Left Info: Recording indicator */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onToggleRecording}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
            isRecording
              ? 'bg-red-500/30 border-red-400 text-rose-200'
              : 'bg-white/10 border-white/20 text-white/80 hover:text-white'
          }`}
        >
          <CircleDot className={`w-3.5 h-3.5 ${isRecording ? 'text-red-400 animate-pulse' : ''}`} />
          <span>{isRecording ? `REC ${formatTime(recordingTime)}` : 'Record Class'}</span>
        </button>
      </div>

      {/* Main Center Call Actions */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        
        {/* Mic Toggle */}
        <button
          onClick={onToggleMic}
          title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
          className={`p-3 rounded-2xl transition-all ${
            isMuted
              ? 'bg-red-500/80 border border-red-400 text-white shadow-lg'
              : 'bg-white/10 hover:bg-white/20 border border-white/10 text-white'
          }`}
        >
          {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5 text-emerald-300" />}
        </button>

        {/* Video Toggle */}
        <button
          onClick={onToggleVideo}
          title={isVideoOff ? 'Turn Camera On' : 'Turn Camera Off'}
          className={`p-3 rounded-2xl transition-all ${
            isVideoOff
              ? 'bg-red-500/80 border border-red-400 text-white shadow-lg'
              : 'bg-white/10 hover:bg-white/20 border border-white/10 text-white'
          }`}
        >
          {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5 text-indigo-300" />}
        </button>

        {/* Screen Share */}
        <button
          onClick={onToggleScreenShare}
          title={isScreenSharing ? 'Stop Sharing' : 'Share Screen'}
          className={`p-3 rounded-2xl transition-all ${
            isScreenSharing
              ? 'bg-blue-500 hover:bg-blue-600 border border-blue-400 text-white shadow-lg'
              : 'bg-white/10 hover:bg-white/20 border border-white/10 text-white'
          }`}
        >
          <ScreenShare className="w-5 h-5" />
        </button>

        {/* Gemini AI Screen Search & 3D Model Explorer */}
        {onOpenGeminiScreenSearch && (
          <button
            onClick={onOpenGeminiScreenSearch}
            title="Gemini AI Screen Search & 3D Model Explorer"
            className="px-3.5 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-extrabold border border-cyan-300 shadow-lg shadow-cyan-950/50 flex items-center space-x-1.5 transition-all active:scale-95 shrink-0"
          >
            <Sparkles className="w-4 h-4 text-cyan-200 animate-pulse" />
            <span className="hidden sm:inline text-xs">Gemini Search & 3D</span>
          </button>
        )}


        {/* Raise Hand */}
        <button
          onClick={onToggleHand}
          title={isHandRaised ? 'Lower Hand' : 'Raise Hand'}
          className={`p-3 rounded-2xl transition-all ${
            isHandRaised
              ? 'bg-amber-500 text-slate-950 font-bold shadow-lg'
              : 'bg-white/10 hover:bg-white/20 border border-white/10 text-white'
          }`}
        >
          <Hand className="w-5 h-5" />
        </button>

        {/* Reactions Emoji Picker */}
        <div className="relative">
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            title="Send Class Reaction"
            className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl border border-white/10 transition-all"
          >
            <Smile className="w-5 h-5 text-amber-300" />
          </button>

          {showEmojiPicker && (
            <div className="absolute bottom-14 left-1/2 -translate-x-1/2 p-2 bg-slate-900/90 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-2xl flex space-x-1 z-50 animate-fade-in">
              {emojis.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => {
                    onSendReaction(emoji);
                    setShowEmojiPicker(false);
                  }}
                  className="p-2 hover:bg-white/10 rounded-xl text-lg hover:scale-125 transition-all"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* End Call / Leave */}
        <button
          onClick={onLeaveCall}
          title="Leave Meeting"
          className="p-3 bg-red-500/80 hover:bg-red-500 border border-red-400 text-white rounded-2xl font-bold shadow-lg transition-all"
        >
          <PhoneOff className="w-5 h-5" />
        </button>
      </div>

      {/* Right Sidebar Toggles */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onToggleSidebar('leaderboard')}
          title="Classroom Leaderboard"
          className={`p-2.5 rounded-xl border transition-all ${
            activeSidebar === 'leaderboard'
              ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg'
              : 'bg-white/10 text-white/80 border-white/10 hover:text-white hover:bg-white/20'
          }`}
        >
          <Trophy className="w-4 h-4" />
        </button>

        <button
          onClick={() => onToggleSidebar('whiteboard')}
          title="Interactive Whiteboard"
          className={`p-2.5 rounded-xl border transition-all ${
            activeSidebar === 'whiteboard'
              ? 'bg-blue-500 text-white border-blue-400 shadow-lg'
              : 'bg-white/10 text-white/80 border-white/10 hover:text-white hover:bg-white/20'
          }`}
        >
          <PenTool className="w-4 h-4" />
        </button>

        <button
          onClick={() => onToggleSidebar('roster')}
          title="Class Roster"
          className={`relative p-2.5 rounded-xl border transition-all ${
            activeSidebar === 'roster'
              ? 'bg-blue-500 text-white border-blue-400 shadow-lg'
              : 'bg-white/10 text-white/80 border-white/10 hover:text-white hover:bg-white/20'
          }`}
        >
          <Users className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 px-1.5 py-0.2 bg-blue-500 text-white text-[10px] font-bold rounded-full">
            {participantCount}
          </span>
        </button>

        <button
          onClick={() => onToggleSidebar('chat')}
          title="Class Chat & Q&A"
          className={`relative p-2.5 rounded-xl border transition-all ${
            activeSidebar === 'chat'
              ? 'bg-blue-500 text-white border-blue-400 shadow-lg'
              : 'bg-white/10 text-white/80 border-white/10 hover:text-white hover:bg-white/20'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 px-1.5 py-0.2 bg-rose-500 text-white text-[10px] font-bold rounded-full animate-bounce">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

    </div>
  );
};

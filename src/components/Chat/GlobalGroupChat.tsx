import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare, Users, Send, Hash, UserCheck, Search, Image as ImageIcon,
  Paperclip, Sparkles, Shield, Lock, Radio, Circle, Smile, MoreVertical, PhoneCall, Video
} from 'lucide-react';
import { User } from '../../types';

interface GroupChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  senderRole: string;
  channelId: string;
  text: string;
  timestamp: string;
  isAnnouncement?: boolean;
  attachmentUrl?: string;
}

interface GroupChannel {
  id: string;
  name: string;
  description: string;
  isPrivate?: boolean;
  memberCount: number;
  unreadCount?: number;
}

interface GlobalGroupChatProps {
  currentUser: User;
  users: User[];
  onOpenAITutor: (topic: string) => void;
}

const INITIAL_CHANNELS: GroupChannel[] = [
  { id: 'chn_general', name: 'general-discussion', description: 'Open campus group discussion for all students & faculty', memberCount: 32 },
  { id: 'chn_cs4820', name: 'geophysics-cs4820', description: 'Seismic wave spectral analysis & MATLAB simulation discussion', memberCount: 28, unreadCount: 2 },
  { id: 'chn_geo501', name: 'reservoir-modelling', description: 'Fluid dynamics & 3D grid reservoir discussion', memberCount: 24 },
  { id: 'chn_hyd302', name: 'hydrology-lab', description: 'Groundwater table mapping & satellite gravimetric data', memberCount: 19 },
  { id: 'chn_announcements', name: 'official-announcements', description: 'Faculty updates & exam timetables (Read-only)', isPrivate: true, memberCount: 35 },
];

const INITIAL_MESSAGES: GroupChatMessage[] = [
  {
    id: 'msg_01',
    senderId: 'usr_teacher_01',
    senderName: 'Dr. Rajesh Bhardwaj',
    senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    senderRole: 'teacher',
    channelId: 'chn_cs4820',
    text: 'Welcome everyone! Today’s seismic spectral analysis notes and FFT python code have been uploaded to Class Vault.',
    timestamp: '10:15 AM',
    isAnnouncement: true,
  },
  {
    id: 'msg_02',
    senderId: 'usr_student_01',
    senderName: 'Vikramaditya Singh',
    senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    senderRole: 'student',
    channelId: 'chn_cs4820',
    text: 'Thank you Sir! Quick question: is the sampling rate in the wave script set to 1000 Hz or 500 Hz for mantle tomography?',
    timestamp: '10:18 AM',
  },
  {
    id: 'msg_03',
    senderId: 'usr_student_02',
    senderName: 'Priya Sharma',
    senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
    senderRole: 'student',
    channelId: 'chn_cs4820',
    text: 'I tested the 1000 Hz rate in the live whiteboard earlier and the spectral peaks aligned cleanly with the synthetic seismogram!',
    timestamp: '10:22 AM',
  },
  {
    id: 'msg_04',
    senderId: 'usr_student_03',
    senderName: 'Rohan Mehta',
    senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    senderRole: 'student',
    channelId: 'chn_general',
    text: 'Hey everyone! Is anyone forming a study group for tomorrow’s Subsurface Reservoir Fluid Dynamics lab?',
    timestamp: '11:05 AM',
  },
];

export const GlobalGroupChat: React.FC<GlobalGroupChatProps> = ({
  currentUser,
  users,
  onOpenAITutor,
}) => {
  const [channels, setChannels] = useState<GroupChannel[]>(INITIAL_CHANNELS);
  const [activeChannelId, setActiveChannelId] = useState<string>('chn_cs4820');
  const [messages, setMessages] = useState<GroupChatMessage[]>(() => {
    const saved = localStorage.getItem('geosoniq_group_messages');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return INITIAL_MESSAGES;
  });

  const [inputMessage, setInputMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserDM, setSelectedUserDM] = useState<User | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('geosoniq_group_messages', JSON.stringify(messages));
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeChannelId]);

  const activeChannel = channels.find((c) => c.id === activeChannelId) || channels[0];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const newMsg: GroupChatMessage = {
      id: `msg_${Date.now()}`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      senderRole: currentUser.role,
      channelId: selectedUserDM ? `dm_${selectedUserDM.id}` : activeChannelId,
      text: inputMessage.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputMessage('');
  };

  const channelMessages = messages.filter((m) =>
    selectedUserDM
      ? m.channelId === `dm_${selectedUserDM.id}` || (m.senderId === selectedUserDM.id && m.channelId === `dm_${currentUser.id}`)
      : m.channelId === activeChannelId
  );

  return (
    <div className="max-w-7xl mx-auto p-2 sm:p-4 h-[calc(100vh-6rem)] flex flex-col md:flex-row gap-4 text-white animate-fade-in">
      
      {/* Left Navigation Sidebar: Group Channels & Direct Messages */}
      <div className="w-full md:w-80 bg-slate-900/90 border border-white/15 rounded-3xl p-4 flex flex-col justify-between shadow-2xl backdrop-blur-xl shrink-0">
        
        <div className="space-y-4 overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-5 h-5 text-amber-400" />
              <h2 className="font-extrabold text-sm text-white">Group Chat Hub</h2>
            </div>
            <span className="text-[10px] px-2 py-0.5 bg-emerald-500/20 text-emerald-300 font-bold rounded-full border border-emerald-400/30">
              ● Live Sync
            </span>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-white/50 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search channels & users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Group Channels List */}
          <div>
            <span className="text-[11px] font-extrabold text-amber-300 uppercase tracking-wider block mb-2 px-1">
              Class Channels
            </span>
            <div className="space-y-1">
              {channels
                .filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((ch) => (
                  <button
                    key={ch.id}
                    onClick={() => {
                      setActiveChannelId(ch.id);
                      setSelectedUserDM(null);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-2xl text-xs font-semibold transition-all ${
                      activeChannelId === ch.id && !selectedUserDM
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40 shadow-md font-bold'
                        : 'hover:bg-white/10 text-white/80'
                    }`}
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <Hash className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="truncate">{ch.name}</span>
                    </div>
                    {ch.unreadCount && (
                      <span className="px-1.5 py-0.2 bg-amber-500 text-slate-950 text-[10px] font-extrabold rounded-full">
                        {ch.unreadCount}
                      </span>
                    )}
                  </button>
                ))}
            </div>
          </div>

          {/* Direct Messages with Registered Users */}
          <div>
            <span className="text-[11px] font-extrabold text-indigo-300 uppercase tracking-wider block mb-2 px-1">
              Direct Messages (Students & Faculty)
            </span>
            <div className="space-y-1">
              {users
                .filter((u) => u.id !== currentUser.id)
                .filter((u) => u.name.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      setSelectedUserDM(u);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-2xl text-xs font-semibold transition-all ${
                      selectedUserDM?.id === u.id
                        ? 'bg-indigo-500/30 text-indigo-200 border border-indigo-400/50 shadow-md font-bold'
                        : 'hover:bg-white/10 text-white/80'
                    }`}
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <img
                        src={u.avatar}
                        alt={u.name}
                        className="w-6 h-6 rounded-full object-cover ring-1 ring-white/30 shrink-0"
                      />
                      <span className="truncate">{u.name}</span>
                    </div>
                    <span className={`w-2 h-2 rounded-full ${u.isLoggedIn ? 'bg-emerald-400' : 'bg-white/30'}`}></span>
                  </button>
                ))}
            </div>
          </div>

        </div>

        {/* AI Tutor Quick Access Banner */}
        <div className="pt-3 border-t border-white/10">
          <button
            onClick={() => onOpenAITutor('Help me summarize current group discussion topic in CS4820')}
            className="w-full py-2 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center space-x-1.5 active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Summarize Group Chat</span>
          </button>
        </div>

      </div>

      {/* Main Chat Conversation Canvas */}
      <div className="flex-1 bg-slate-900/90 border border-white/15 rounded-3xl flex flex-col justify-between overflow-hidden shadow-2xl backdrop-blur-xl">
        
        {/* Chat Top Bar */}
        <div className="p-4 bg-white/5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {selectedUserDM ? (
              <>
                <img
                  src={selectedUserDM.avatar}
                  alt={selectedUserDM.name}
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-indigo-400"
                />
                <div>
                  <h3 className="font-extrabold text-sm text-white flex items-center space-x-2">
                    <span>{selectedUserDM.name}</span>
                    <span className="text-[10px] px-1.5 py-0.2 bg-indigo-500/20 text-indigo-300 font-bold uppercase rounded border border-indigo-400/30">
                      {selectedUserDM.role}
                    </span>
                  </h3>
                  <span className="text-[11px] text-white/60">{selectedUserDM.department || 'Direct Message'}</span>
                </div>
              </>
            ) : (
              <div>
                <h3 className="font-extrabold text-sm text-white flex items-center space-x-2">
                  <Hash className="w-4 h-4 text-amber-400" />
                  <span>{activeChannel.name}</span>
                </h3>
                <span className="text-[11px] text-white/60">{activeChannel.description}</span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-white/60 font-medium hidden sm:inline">
              {selectedUserDM ? 'Direct Message Mode' : `${activeChannel.memberCount} Members`}
            </span>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {channelMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-2 text-white/60">
              <MessageSquare className="w-10 h-10 text-amber-400/50" />
              <p className="text-xs font-bold">No messages in this chat yet.</p>
              <p className="text-[11px]">Type a message below to start the group discussion with fellow students!</p>
            </div>
          ) : (
            channelMessages.map((msg) => {
              const isSelf = msg.senderId === currentUser.id;
              return (
                <div
                  key={msg.id}
                  className={`flex items-start space-x-3 ${isSelf ? 'flex-row-reverse space-x-reverse' : ''}`}
                >
                  <img
                    src={msg.senderAvatar}
                    alt={msg.senderName}
                    className="w-8 h-8 rounded-full object-cover ring-1 ring-white/20 shrink-0"
                  />
                  <div className={`max-w-md ${isSelf ? 'items-end text-right' : ''}`}>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-xs font-bold text-white/90">{msg.senderName}</span>
                      <span className={`text-[9px] px-1.5 py-0.2 rounded font-extrabold uppercase ${
                        msg.senderRole === 'teacher' ? 'bg-purple-500/30 text-purple-300' : 'bg-cyan-500/30 text-cyan-300'
                      }`}>
                        {msg.senderRole}
                      </span>
                      <span className="text-[10px] text-white/50">{msg.timestamp}</span>
                    </div>

                    <div
                      className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-lg ${
                        isSelf
                          ? 'bg-amber-500 text-slate-950 font-medium rounded-tr-none'
                          : msg.isAnnouncement
                          ? 'bg-gradient-to-r from-indigo-900/80 to-purple-900/80 text-white border border-indigo-400/40 rounded-tl-none font-medium'
                          : 'bg-white/10 text-white border border-white/10 rounded-tl-none'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Composer */}
        <form onSubmit={handleSendMessage} className="p-3 bg-white/5 border-t border-white/10 flex items-center space-x-2">
          <input
            type="text"
            placeholder={
              selectedUserDM
                ? `Message ${selectedUserDM.name}...`
                : `Send message to #${activeChannel.name}...`
            }
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            className="flex-1 bg-black/40 border border-white/20 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-amber-400"
          />

          <button
            type="submit"
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-2xl text-xs shadow-lg transition-all flex items-center space-x-1 active:scale-95 shrink-0"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>

      </div>

    </div>
  );
};
